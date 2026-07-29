import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

const prismaMock = vi.hoisted(() => ({
  staffProfile: {
    findFirst: vi.fn(),
    findMany: vi.fn(),
  },
  staffWorkingHourOverride: {
    findUnique: vi.fn(),
  },
  workingHourOverride: {
    findUnique: vi.fn(),
  },
  staffWorkingHour: {
    findUnique: vi.fn(),
  },
  workingHour: {
    findUnique: vi.fn(),
  },
  appointment: {
    findMany: vi.fn(),
  },
  staffTimeOff: {
    findMany: vi.fn(),
  },
  timeOff: {
    findMany: vi.fn(),
  },
}));

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}));

import { getAvailability } from "../services/availability.service";

type StaffOptions = {
  id?: string;
  name?: string;
  sortOrder?: number;
  workstationIds?: string[];
  appointmentCount?: number;
};

function makeServiceAssignment() {
  return {
    serviceId: "service-manicure",
    durationMinutes: null,
    cleanupMinutes: null,
    priceCents: null,
    isActive: true,
    service: {
      id: "service-manicure",
      durationMinutes: 60,
      cleanupMinutes: 10,
      priceCents: 5_000,
      promotionalPriceCents: null,
      isActive: true,
      allowOnlineBooking: true,
    },
  };
}

function makeStaff({
  id = "staff-alice",
  name = "Alice",
  sortOrder = 1,
  workstationIds = ["table-1"],
}: StaffOptions = {}) {
  const [firstName, ...lastNameParts] =
    name.split(" ");

  return {
    id,
    displayName: name,
    defaultCleanupMinutes: 5,
    slotIntervalMinutes: 30,
    sortOrder,
    isActive: true,
    acceptsOnlineBooking: true,
    user: {
      firstName,
      lastName: lastNameParts.join(" "),
    },
    services: [makeServiceAssignment()],
    workstationAssignments:
      workstationIds.map(
        (workstationId, index) => ({
          workstationId,
          isPrimary: index === 0,
          createdAt: new Date(
            `2026-01-0${index + 1}T00:00:00.000Z`,
          ),
          workstation: {
            id: workstationId,
            name: `Table ${index + 1}`,
            isActive: true,
            availableForBooking: true,
          },
        }),
      ),
  };
}

function makeAppointment(
  startsAt: string,
  endsAt: string,
  workstationId = "table-1",
) {
  return {
    workstationId,
    startsAt: new Date(startsAt),
    endsAt: new Date(endsAt),
    staff: {
      defaultCleanupMinutes: 5,
    },
    services: [
      {
        service: {
          cleanupMinutes: 10,
        },
      },
    ],
  };
}

function configureOpenMonday(): void {
  prismaMock.staffWorkingHourOverride.findUnique
    .mockResolvedValue(null);

  prismaMock.workingHourOverride.findUnique
    .mockResolvedValue(null);

  prismaMock.staffWorkingHour.findUnique
    .mockResolvedValue(null);

  prismaMock.workingHour.findUnique
    .mockResolvedValue({
      isOpen: true,
      startTime: "09:00",
      endTime: "12:00",
      breakStart: null,
      breakEnd: null,
    });
}

function configureNoBlockingEvents(): void {
  prismaMock.appointment.findMany
    .mockResolvedValue([]);

  prismaMock.staffTimeOff.findMany
    .mockResolvedValue([]);

  prismaMock.timeOff.findMany
    .mockResolvedValue([]);
}

describe("getAvailability — intégration du moteur", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(
      new Date("2030-07-01T08:00:00.000Z"),
    );

    configureOpenMonday();
    configureNoBlockingEvents();

    prismaMock.staffProfile.findFirst
      .mockResolvedValue(makeStaff());

    prismaMock.staffProfile.findMany
      .mockResolvedValue([
        {
          id: "staff-alice",
        },
      ]);
  });

  it("génère les créneaux à partir des horaires du salon", async () => {
    const result = await getAvailability({
      staffId: "staff-alice",
      serviceIds: ["service-manicure"],
      date: "2030-07-15",
    });

    expect(result.date).toBe("2030-07-15");
    expect(result.requestedStaffId).toBe(
      "staff-alice",
    );
    expect(result.autoAssigned).toBe(false);
    expect(result.totalDurationMinutes).toBe(60);
    expect(result.cleanupMinutes).toBe(10);
    expect(result.totalPriceCents).toBe(5_000);
    expect(result.depositCents).toBe(3_500);

    expect(
      result.slots.map((slot) => slot.label),
    ).toEqual([
      "09:00",
      "09:30",
      "10:00",
      "10:30",
    ]);
  });

  it("applique une fermeture exceptionnelle de la professionnelle", async () => {
    prismaMock.staffWorkingHourOverride.findUnique
      .mockResolvedValue({
        isOpen: false,
        startTime: null,
        endTime: null,
        hasBreak: false,
        breakStart: null,
        breakEnd: null,
      });

    const result = await getAvailability({
      staffId: "staff-alice",
      serviceIds: ["service-manicure"],
      date: "2030-07-15",
    });

    expect(result.slots).toEqual([]);
    expect(
      prismaMock.workingHour.findUnique,
    ).not.toHaveBeenCalled();
  });

  it("retire tous les créneaux recouvrant une absence de la professionnelle", async () => {
    const absence = {
      startsAt: new Date(
        "2030-07-15T07:30:00.000Z",
      ),
      endsAt: new Date(
        "2030-07-15T09:00:00.000Z",
      ),
    };

    prismaMock.staffTimeOff.findMany
      .mockResolvedValue([absence]);

    const result = await getAvailability({
      staffId: "staff-alice",
      serviceIds: ["service-manicure"],
      date: "2030-07-15",
    });

    for (const slot of result.slots) {
      const startsAt = new Date(slot.startsAt);
      const endsAt = new Date(slot.endsAt);

      expect(
        startsAt < absence.endsAt &&
          endsAt > absence.startsAt,
      ).toBe(false);
    }
  });

  it("utilise un autre poste lorsqu'un poste compatible est occupé", async () => {
    prismaMock.staffProfile.findFirst
      .mockResolvedValue(
        makeStaff({
          workstationIds: [
            "table-1",
            "table-2",
          ],
        }),
      );

    prismaMock.appointment.findMany
      .mockImplementation(
        async (query: {
          where?: {
            staffId?: string;
            workstationId?: {
              in?: string[];
            };
          };
        }) => {
          if (query.where?.staffId) {
            return [];
          }

          return [
            makeAppointment(
              "2030-07-15T07:00:00.000Z",
              "2030-07-15T08:00:00.000Z",
              "table-1",
            ),
          ];
        },
      );

    const result = await getAvailability({
      staffId: "staff-alice",
      serviceIds: ["service-manicure"],
      date: "2030-07-15",
    });

    expect(result.slots[0]).toMatchObject({
      label: "09:00",
      workstation: {
        id: "table-2",
        name: "Table 2",
      },
    });
  });

  it("exclut tout créneau recouvrant un rendez-vous existant et son nettoyage", async () => {
    const appointmentStartsAt = new Date(
      "2030-07-15T07:00:00.000Z",
    );

    const appointmentEndsAtWithCleanup =
      new Date(
        "2030-07-15T08:10:00.000Z",
      );

    prismaMock.appointment.findMany
      .mockImplementation(
        async (query: {
          where?: {
            staffId?: string;
          };
        }) => {
          if (query.where?.staffId) {
            return [
              makeAppointment(
                "2030-07-15T07:00:00.000Z",
                "2030-07-15T08:00:00.000Z",
              ),
            ];
          }

          return [];
        },
      );

    const result = await getAvailability({
      staffId: "staff-alice",
      serviceIds: ["service-manicure"],
      date: "2030-07-15",
    });

    for (const slot of result.slots) {
      const startsAt = new Date(slot.startsAt);
      const endsAt = new Date(slot.endsAt);

      expect(
        startsAt < appointmentEndsAtWithCleanup &&
          endsAt > appointmentStartsAt,
      ).toBe(false);
    }
  });

  it("vérifie les invariants métier sans imposer le choix exact en mode automatique", async () => {
    prismaMock.staffProfile.findMany
      .mockResolvedValue([
        {
          id: "staff-alice",
        },
        {
          id: "staff-brigitte",
        },
      ]);

    prismaMock.staffProfile.findFirst
      .mockImplementation(
        async (query: {
          where?: {
            id?: string;
          };
        }) => {
          if (
            query.where?.id ===
            "staff-brigitte"
          ) {
            return makeStaff({
              id: "staff-brigitte",
              name: "Brigitte",
              sortOrder: 2,
              workstationIds: ["table-2"],
            });
          }

          return makeStaff({
            id: "staff-alice",
            name: "Alice",
            sortOrder: 1,
            workstationIds: ["table-1"],
          });
        },
      );

    prismaMock.appointment.findMany
      .mockImplementation(
        async (query: {
          where?: {
            staffId?: string;
          };
        }) => {
          if (
            query.where?.staffId ===
            "staff-alice"
          ) {
            return [
              makeAppointment(
                "2030-07-15T05:00:00.000Z",
                "2030-07-15T06:00:00.000Z",
              ),
            ];
          }

          return [];
        },
      );

    const result = await getAvailability({
      staffId: "any",
      serviceIds: ["service-manicure"],
      date: "2030-07-15",
    });

    expect(result.autoAssigned).toBe(true);
    expect(result.requestedStaffId).toBe("any");

    expect(result.slots.length).toBeGreaterThan(0);

    for (const slot of result.slots) {
      expect([
        "staff-alice",
        "staff-brigitte",
      ]).toContain(slot.staff.id);

      expect(slot.staff.displayName).toBeTruthy();
      expect(slot.workstation.id).toBeTruthy();
      expect(slot.workstation.name).toBeTruthy();
    }

    const uniqueStartTimes = new Set(
      result.slots.map(
        (slot) =>
          `${slot.startsAt}|${slot.endsAt}`,
      ),
    );

    expect(uniqueStartTimes.size).toBe(
      result.slots.length,
    );

    const sortedStartsAt = result.slots
      .map((slot) => slot.startsAt)
      .slice()
      .sort();

    expect(
      result.slots.map(
        (slot) => slot.startsAt,
      ),
    ).toEqual(sortedStartsAt);
  });

  it("retourne une liste vide lorsque la journée est entièrement indisponible", async () => {
    prismaMock.timeOff.findMany
      .mockResolvedValue([
        {
          startsAt: new Date(
            "2030-07-15T06:00:00.000Z",
          ),
          endsAt: new Date(
            "2030-07-15T12:00:00.000Z",
          ),
        },
      ]);

    const result = await getAvailability({
      staffId: "staff-alice",
      serviceIds: ["service-manicure"],
      date: "2030-07-15",
    });

    expect(result.slots).toEqual([]);
  });

  it("refuse une professionnelle incompatible avec la prestation", async () => {
    prismaMock.staffProfile.findFirst
      .mockResolvedValue({
        ...makeStaff(),
        services: [],
      });

    await expect(
      getAvailability({
        staffId: "staff-alice",
        serviceIds: ["service-manicure"],
        date: "2030-07-15",
      }),
    ).rejects.toThrow(
      "Aucune professionnelle compatible",
    );
  });
});
