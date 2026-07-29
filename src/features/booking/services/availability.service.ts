import { AppointmentStatus, DayOfWeek } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

import {
  addMinutes,
  calculateRequiredPaymentCents,
  compareAvailabilitySlots,
  overlaps,
  type StaffPlanningRank,
  type TimeWindow,
} from "../utils/booking-rules";

import type {
  AvailabilityResult,
  AvailabilitySlot,
  GetAvailabilityInput,
} from "../types/availability.types";

const PARIS_TIME_ZONE = "Europe/Paris";
const ANY_STAFF_ID = "any";
const MINIMUM_BOOKING_LEAD_MINUTES = 15;

const MAX_SERVICE_IDS = 10;
const MAX_IDENTIFIER_LENGTH = 191;
const MAX_BOOKING_ADVANCE_DAYS = 365;

export class AvailabilityValidationError extends Error {
  constructor(message: string) {
    super(message);

    this.name = "AvailabilityValidationError";
  }
}

const BLOCKING_STATUSES: AppointmentStatus[] = [
  AppointmentStatus.PENDING,
  AppointmentStatus.CONFIRMED,
  AppointmentStatus.IN_PROGRESS,
];

const DAY_BY_JS_INDEX: DayOfWeek[] = [
  DayOfWeek.SUNDAY,
  DayOfWeek.MONDAY,
  DayOfWeek.TUESDAY,
  DayOfWeek.WEDNESDAY,
  DayOfWeek.THURSDAY,
  DayOfWeek.FRIDAY,
  DayOfWeek.SATURDAY,
];

type EffectiveSchedule = {
  isOpen: boolean;
  startTime: string | null;
  endTime: string | null;
  hasBreak: boolean;
  breakStart: string | null;
  breakEnd: string | null;
};

type StaffAvailabilityResult = Omit<
  AvailabilityResult,
  "requestedStaffId" | "autoAssigned"
> & {
  staffId: string;
  staffSortOrder: number;
  dailyAppointmentCount: number;
  dailyOccupiedMinutes: number;
  occupiedWindows: TimeWindow[];
};

type BlockingAppointment = {
  startsAt: Date;
  endsAt: Date;
  staff: {
    defaultCleanupMinutes: number;
  } | null;
  services: Array<{
    service: {
      cleanupMinutes: number;
    };
  }>;
};

function appointmentToOccupiedWindow(
  appointment: BlockingAppointment,
): TimeWindow {
  const cleanupMinutes = Math.max(
    appointment.staff?.defaultCleanupMinutes ?? 0,
    0,
    ...appointment.services.map(({ service }) => service.cleanupMinutes),
  );

  return {
    startsAt: appointment.startsAt,
    endsAt: addMinutes(appointment.endsAt, cleanupMinutes),
  };
}

function parseStrictCalendarDate(date: string): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new AvailabilityValidationError(
      "La date doit être au format YYYY-MM-DD.",
    );
  }

  const [year, month, day] = date.split("-").map(Number);

  const parsed = new Date(Date.UTC(year, month - 1, day));

  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) {
    throw new AvailabilityValidationError("La date demandée est invalide.");
  }

  return parsed;
}

function getCurrentParisDateString(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: PARIS_TIME_ZONE,

    year: "numeric",

    month: "2-digit",

    day: "2-digit",
  }).format(new Date());
}

function assertDateString(date: string): void {
  const requestedDate = parseStrictCalendarDate(date);

  const today = parseStrictCalendarDate(getCurrentParisDateString());

  if (requestedDate.getTime() < today.getTime()) {
    throw new AvailabilityValidationError("La date demandée est déjà passée.");
  }

  const maximumDate = new Date(
    today.getTime() + MAX_BOOKING_ADVANCE_DAYS * 24 * 60 * 60 * 1000,
  );

  if (requestedDate.getTime() > maximumDate.getTime()) {
    throw new AvailabilityValidationError(
      `Les disponibilités sont consultables jusqu’à ${MAX_BOOKING_ADVANCE_DAYS} jours à l’avance.`,
    );
  }
}

function assertTimeString(
  value: string | null,
  field: string,
): asserts value is string {
  if (!value || !/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) {
    throw new Error(`L'horaire ${field} est invalide ou manquant.`);
  }
}

function getParisOffsetMilliseconds(date: Date): number {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: PARIS_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });

  const parts = Object.fromEntries(
    formatter
      .formatToParts(date)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, Number(part.value)]),
  );

  const asUtc = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
  );

  return asUtc - date.getTime();
}

function parisLocalDateTimeToUtc(date: string, time: string): Date {
  assertTimeString(time, "local");

  const [year, month, day] = date.split("-").map(Number);

  const [hour, minute] = time.split(":").map(Number);

  const utcGuess = new Date(Date.UTC(year, month - 1, day, hour, minute));

  let offset = getParisOffsetMilliseconds(utcGuess);

  let result = new Date(utcGuess.getTime() - offset);

  const correctedOffset = getParisOffsetMilliseconds(result);

  if (correctedOffset !== offset) {
    offset = correctedOffset;

    result = new Date(utcGuess.getTime() - offset);
  }

  return result;
}

function formatSlotLabel(date: Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: PARIS_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function localDayOfWeek(date: string): DayOfWeek {
  const midday = parisLocalDateTimeToUtc(date, "12:00");

  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: PARIS_TIME_ZONE,
    weekday: "short",
  }).format(midday);

  const indexByWeekday: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };

  return DAY_BY_JS_INDEX[indexByWeekday[weekday] ?? 0];
}

async function getEffectiveSchedule(
  staffId: string,
  date: string,
): Promise<EffectiveSchedule> {
  const databaseDate = new Date(`${date}T00:00:00.000Z`);

  const staffOverride = await prisma.staffWorkingHourOverride.findUnique({
    where: {
      staffId_date: {
        staffId,
        date: databaseDate,
      },
    },
  });

  if (staffOverride) {
    return {
      isOpen: staffOverride.isOpen,
      startTime: staffOverride.startTime,
      endTime: staffOverride.endTime,
      hasBreak: staffOverride.hasBreak,
      breakStart: staffOverride.breakStart,
      breakEnd: staffOverride.breakEnd,
    };
  }

  const globalOverride = await prisma.workingHourOverride.findUnique({
    where: {
      date: databaseDate,
    },
  });

  if (globalOverride) {
    return {
      isOpen: globalOverride.isOpen,
      startTime: globalOverride.startTime,
      endTime: globalOverride.endTime,
      hasBreak: Boolean(globalOverride.breakStart && globalOverride.breakEnd),
      breakStart: globalOverride.breakStart,
      breakEnd: globalOverride.breakEnd,
    };
  }

  const dayOfWeek = localDayOfWeek(date);

  const staffHours = await prisma.staffWorkingHour.findUnique({
    where: {
      staffId_dayOfWeek: {
        staffId,
        dayOfWeek,
      },
    },
  });

  if (staffHours) {
    return {
      isOpen: staffHours.isOpen,
      startTime: staffHours.startTime,
      endTime: staffHours.endTime,
      hasBreak: staffHours.hasBreak,
      breakStart: staffHours.breakStart,
      breakEnd: staffHours.breakEnd,
    };
  }

  const globalHours = await prisma.workingHour.findUnique({
    where: {
      dayOfWeek,
    },
  });

  return {
    isOpen: globalHours?.isOpen ?? false,
    startTime: globalHours?.startTime ?? null,
    endTime: globalHours?.endTime ?? null,
    hasBreak: Boolean(globalHours?.breakStart && globalHours?.breakEnd),
    breakStart: globalHours?.breakStart ?? null,
    breakEnd: globalHours?.breakEnd ?? null,
  };
}

async function getStaffAvailability(
  staffId: string,
  serviceIds: string[],
  quantityByServiceId: ReadonlyMap<string, number>,
  date: string,
): Promise<StaffAvailabilityResult | null> {
  const staff = await prisma.staffProfile.findFirst({
    where: {
      id: staffId,
      isActive: true,
      acceptsOnlineBooking: true,

      user: {
        status: "ACTIVE",
      },
    },

    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
        },
      },

      services: {
        where: {
          isActive: true,

          serviceId: {
            in: serviceIds,
          },

          service: {
            isActive: true,
            allowOnlineBooking: true,
          },
        },

        include: {
          service: true,
        },
      },

      workstationAssignments: {
        where: {
          isActive: true,

          workstation: {
            isActive: true,
            availableForBooking: true,

            AND: serviceIds.map((serviceId) => ({
              serviceAssignments: {
                some: {
                  serviceId,
                  isActive: true,
                },
              },
            })),
          },
        },

        include: {
          workstation: true,
        },

        orderBy: [
          {
            isPrimary: "desc",
          },
          {
            createdAt: "asc",
          },
        ],
      },
    },
  });

  if (
    !staff ||
    staff.services.length !== serviceIds.length ||
    staff.workstationAssignments.length === 0
  ) {
    return null;
  }

  const totalDurationMinutes = staff.services.reduce((total, assignment) => {
    const quantity = quantityByServiceId.get(assignment.serviceId) ?? 1;

    return (
      total +
      (assignment.durationMinutes ?? assignment.service.durationMinutes) *
        quantity
    );
  }, 0);

  const cleanupMinutes = Math.max(
    staff.defaultCleanupMinutes,

    ...staff.services.map(
      (assignment) =>
        assignment.cleanupMinutes ?? assignment.service.cleanupMinutes,
    ),
  );

  let totalPriceCents = 0;

  for (const assignment of staff.services) {
    const priceCents =
      assignment.priceCents ??
      assignment.service.promotionalPriceCents ??
      assignment.service.priceCents;

    if (priceCents === null) {
      return null;
    }

    const quantity = quantityByServiceId.get(assignment.serviceId) ?? 1;

    totalPriceCents += priceCents * quantity;
  }

  /*
   * Nouvelle règle :
   *
   * - paiement intégral lorsque le total
   *   est inférieur ou égal à 35 € ;
   *
   * - acompte fixe de 35 € lorsque le
   *   total dépasse 35 €.
   */
  const depositCents = calculateRequiredPaymentCents(totalPriceCents);

  const displayName =
    staff.displayName?.trim() ||
    `${staff.user.firstName} ${staff.user.lastName}`.trim();

  const schedule = await getEffectiveSchedule(staff.id, date);

  if (!schedule.isOpen) {
    return {
      date,
      staffId: staff.id,
      staffSortOrder: staff.sortOrder,
      dailyAppointmentCount: 0,
      dailyOccupiedMinutes: 0,
      occupiedWindows: [],
      totalDurationMinutes,
      cleanupMinutes,
      totalPriceCents,
      depositCents,
      slots: [],
    };
  }

  assertTimeString(schedule.startTime, "d'ouverture");

  assertTimeString(schedule.endTime, "de fermeture");

  const opening = parisLocalDateTimeToUtc(date, schedule.startTime);

  const closing = parisLocalDateTimeToUtc(date, schedule.endTime);

  const breakWindow: TimeWindow | null =
    schedule.hasBreak && schedule.breakStart && schedule.breakEnd
      ? {
          startsAt: parisLocalDateTimeToUtc(date, schedule.breakStart),

          endsAt: parisLocalDateTimeToUtc(date, schedule.breakEnd),
        }
      : null;

  const dayStart = parisLocalDateTimeToUtc(date, "00:00");

  const probe = new Date(dayStart.getTime() + 36 * 60 * 60 * 1000);

  const nextDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: PARIS_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(probe);

  const dayEnd = parisLocalDateTimeToUtc(nextDate, "00:00");

  const workstationIds = staff.workstationAssignments.map(
    ({ workstationId }) => workstationId,
  );

  const [
    staffAppointments,
    workstationAppointments,
    staffTimeOffs,
    globalTimeOffs,
  ] = await Promise.all([
    prisma.appointment.findMany({
      where: {
        staffId: staff.id,

        status: {
          in: BLOCKING_STATUSES,
        },

        startsAt: {
          lt: dayEnd,
        },

        endsAt: {
          gt: dayStart,
        },
      },

      select: {
        startsAt: true,
        endsAt: true,
        staff: {
          select: {
            defaultCleanupMinutes: true,
          },
        },
        services: {
          select: {
            service: {
              select: {
                cleanupMinutes: true,
              },
            },
          },
        },
      },
    }),

    prisma.appointment.findMany({
      where: {
        workstationId: {
          in: workstationIds,
        },

        status: {
          in: BLOCKING_STATUSES,
        },

        startsAt: {
          lt: dayEnd,
        },

        endsAt: {
          gt: dayStart,
        },
      },

      select: {
        workstationId: true,
        startsAt: true,
        endsAt: true,
        staff: {
          select: {
            defaultCleanupMinutes: true,
          },
        },
        services: {
          select: {
            service: {
              select: {
                cleanupMinutes: true,
              },
            },
          },
        },
      },
    }),

    prisma.staffTimeOff.findMany({
      where: {
        staffId: staff.id,

        startsAt: {
          lt: dayEnd,
        },

        endsAt: {
          gt: dayStart,
        },
      },

      select: {
        startsAt: true,
        endsAt: true,
      },
    }),

    prisma.timeOff.findMany({
      where: {
        startsAt: {
          lt: dayEnd,
        },

        endsAt: {
          gt: dayStart,
        },
      },

      select: {
        startsAt: true,
        endsAt: true,
      },
    }),
  ]);

  const staffBlocked: TimeWindow[] = [
    ...staffAppointments.map(appointmentToOccupiedWindow),
    ...staffTimeOffs,
    ...globalTimeOffs,
  ];

  const now = new Date();
  const earliestBookableStart = addMinutes(now, MINIMUM_BOOKING_LEAD_MINUTES);

  const interval = Math.max(5, staff.slotIntervalMinutes);

  const slots: AvailabilitySlot[] = [];

  for (
    let startsAt = opening;
    startsAt < closing;
    startsAt = addMinutes(startsAt, interval)
  ) {
    const serviceEndsAt = addMinutes(startsAt, totalDurationMinutes);

    const occupiedEndsAt = addMinutes(serviceEndsAt, cleanupMinutes);

    const occupiedWindow = {
      startsAt,
      endsAt: occupiedEndsAt,
    };

    if (startsAt < earliestBookableStart || occupiedEndsAt > closing) {
      continue;
    }

    if (breakWindow && overlaps(occupiedWindow, breakWindow)) {
      continue;
    }

    if (staffBlocked.some((blocked) => overlaps(occupiedWindow, blocked))) {
      continue;
    }

    const freeAssignment = staff.workstationAssignments.find(
      ({ workstationId }) =>
        workstationAppointments
          .filter((appointment) => appointment.workstationId === workstationId)
          .every(
            (appointment) =>
              !overlaps(
                occupiedWindow,
                appointmentToOccupiedWindow(appointment),
              ),
          ),
    );

    if (!freeAssignment) {
      continue;
    }

    slots.push({
      startsAt: startsAt.toISOString(),

      endsAt: serviceEndsAt.toISOString(),

      label: formatSlotLabel(startsAt),

      staff: {
        id: staff.id,
        displayName,
      },

      workstation: {
        id: freeAssignment.workstation.id,

        name: freeAssignment.workstation.name,
      },
    });
  }

  const occupiedWindows = staffAppointments
    .map(appointmentToOccupiedWindow)
    .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());

  const dailyOccupiedMinutes = occupiedWindows.reduce(
    (total, window) =>
      total +
      Math.max(
        0,
        Math.round(
          (window.endsAt.getTime() - window.startsAt.getTime()) / 60_000,
        ),
      ),
    0,
  );

  return {
    date,
    staffId: staff.id,
    staffSortOrder: staff.sortOrder,
    dailyAppointmentCount: staffAppointments.length,
    dailyOccupiedMinutes,
    occupiedWindows,
    totalDurationMinutes,
    cleanupMinutes,
    totalPriceCents,
    depositCents,
    slots,
  };
}

export async function getAvailability({
  staffId,
  serviceIds,
  serviceOptions = [],
  date,
}: GetAvailabilityInput): Promise<AvailabilityResult> {
  const normalizedStaffId = staffId.trim();

  const normalizedDate = date.trim();

  assertDateString(normalizedDate);

  if (serviceIds.length > MAX_SERVICE_IDS) {
    throw new AvailabilityValidationError(
      `Vous ne pouvez pas sélectionner plus de ${MAX_SERVICE_IDS} prestations.`,
    );
  }

  const normalizedServiceIds = Array.from(
    new Set(serviceIds.map((id) => id.trim()).filter(Boolean)),
  );

  const quantityByServiceId = new Map<string, number>();

  for (const serviceId of normalizedServiceIds) {
    quantityByServiceId.set(serviceId, 1);
  }

  for (const option of serviceOptions) {
    const optionServiceId = option.serviceId.trim();

    if (!optionServiceId || !normalizedServiceIds.includes(optionServiceId)) {
      throw new AvailabilityValidationError(
        "Une quantité de prestation ne correspond pas aux prestations sélectionnées.",
      );
    }

    if (
      !Number.isInteger(option.quantity) ||
      option.quantity < 1 ||
      option.quantity > 50
    ) {
      throw new AvailabilityValidationError(
        "La quantité d’une prestation doit être comprise entre 1 et 50.",
      );
    }

    quantityByServiceId.set(optionServiceId, option.quantity);
  }

  if (!normalizedStaffId) {
    throw new AvailabilityValidationError(
      "Aucune professionnelle n'a été sélectionnée.",
    );
  }

  if (normalizedStaffId.length > MAX_IDENTIFIER_LENGTH) {
    throw new AvailabilityValidationError(
      "La professionnelle sélectionnée est invalide.",
    );
  }

  if (normalizedServiceIds.length === 0) {
    throw new AvailabilityValidationError(
      "Sélectionnez au moins une prestation.",
    );
  }

  if (normalizedServiceIds.length > MAX_SERVICE_IDS) {
    throw new AvailabilityValidationError(
      `Vous ne pouvez pas sélectionner plus de ${MAX_SERVICE_IDS} prestations.`,
    );
  }

  if (
    normalizedServiceIds.some(
      (serviceId) => serviceId.length > MAX_IDENTIFIER_LENGTH,
    )
  ) {
    throw new AvailabilityValidationError(
      "Une des prestations sélectionnées est invalide.",
    );
  }

  const staffIds =
    normalizedStaffId === ANY_STAFF_ID
      ? (
          await prisma.staffProfile.findMany({
            where: {
              isActive: true,
              acceptsOnlineBooking: true,

              user: {
                status: "ACTIVE",
              },

              AND: normalizedServiceIds.map((serviceId) => ({
                services: {
                  some: {
                    serviceId,
                    isActive: true,
                  },
                },
              })),
            },

            select: {
              id: true,
            },

            orderBy: [
              {
                sortOrder: "asc",
              },
              {
                createdAt: "asc",
              },
            ],
          })
        ).map(({ id }) => id)
      : [normalizedStaffId];

  const results = (
    await Promise.all(
      staffIds.map((id) =>
        getStaffAvailability(
          id,
          normalizedServiceIds,
          quantityByServiceId,
          normalizedDate,
        ),
      ),
    )
  ).filter((result): result is NonNullable<typeof result> => Boolean(result));

  if (results.length === 0) {
    throw new AvailabilityValidationError(
      "Aucune professionnelle compatible n'est disponible pour ces prestations.",
    );
  }

  const staffRank = new Map(
    results.map((result) => [
      result.staffId,
      {
        appointmentCount: result.dailyAppointmentCount,
        occupiedMinutes: result.dailyOccupiedMinutes,
        sortOrder: result.staffSortOrder,
        occupiedWindows: result.occupiedWindows,
      },
    ]),
  );

  const normalizedStaffRank = new Map<string, StaffPlanningRank>(
    Array.from(staffRank.entries()),
  );

  const compareSlots = (a: AvailabilitySlot, b: AvailabilitySlot): number =>
    compareAvailabilitySlots(a, b, normalizedStaffRank);

  const allSlots = results.flatMap((result) => result.slots).sort(compareSlots);

  /*
   * En mode « n'importe quelle professionnelle »,
   * un seul créneau est présenté pour une même
   * heure. La professionnelle retenue est celle
   * qui possède la charge quotidienne la plus
   * faible. À charge équivalente, le moteur
   * privilégie le créneau réduisant le plus les
   * trous entre les rendez-vous.
   *
   * Lorsque la cliente choisit une professionnelle,
   * tous ses créneaux restent retournés normalement.
   */
  const slots =
    normalizedStaffId === ANY_STAFF_ID
      ? Array.from(
          allSlots
            .reduce((unique, slot) => {
              const key = `${slot.startsAt}|${slot.endsAt}`;

              if (!unique.has(key)) {
                unique.set(key, slot);
              }

              return unique;
            }, new Map<string, AvailabilitySlot>())
            .values(),
        )
      : allSlots;

  const first = results[0];

  return {
    date: normalizedDate,

    requestedStaffId: normalizedStaffId,

    autoAssigned: normalizedStaffId === ANY_STAFF_ID,
    totalDurationMinutes: first.totalDurationMinutes,
    cleanupMinutes: first.cleanupMinutes,
    totalPriceCents: first.totalPriceCents,
    depositCents: first.depositCents,
    slots,
  };
}
