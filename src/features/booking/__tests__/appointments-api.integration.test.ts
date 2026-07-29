import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

const mocks = vi.hoisted(() => ({
  getServerSession: vi.fn(),
  createAppointment: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  authOptions: {
    providers: [],
  },
}));

vi.mock("next-auth", () => ({
  getServerSession:
    mocks.getServerSession,
}));

vi.mock(
  "@/features/booking/services/create-appointment.service",
  () => ({
    createAppointment:
      mocks.createAppointment,
  }),
);

import { POST } from "@/app/api/appointments/route";

function makeRequest(
  body: unknown,
): Request {
  return new Request(
    "http://localhost/api/appointments",
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
    },
  );
}

describe("POST /api/appointments — intégration", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.getServerSession.mockResolvedValue({
      user: {
        id: "user-1",
        email: "cliente@example.com",
      },
    });
  });

  it("refuse une cliente non connectée", async () => {
    mocks.getServerSession.mockResolvedValue(null);

    const response = await POST(
      makeRequest({}),
    );

    expect(response.status).toBe(401);

    await expect(
      response.json(),
    ).resolves.toMatchObject({
      message: expect.any(String),
    });

    expect(
      mocks.createAppointment,
    ).not.toHaveBeenCalled();
  });

  it("transmet une demande valide au service", async () => {
    mocks.createAppointment.mockResolvedValue({
      reference: "RDV-TEST-001",
      confirmationUrl:
        "/reservation/confirmation/RDV-TEST-001",
    });

    const payload = {
      staffId: "staff-alice",
      workstationId: "table-1",
      serviceIds: ["service-manicure"],
      startsAt:
        "2030-07-15T07:00:00.000Z",
      clientComment: "French manucure",
    };

    const response = await POST(
      makeRequest(payload),
    );

    expect(response.status).toBe(201);

    await expect(
      response.json(),
    ).resolves.toMatchObject({
      reference: "RDV-TEST-001",
      confirmationUrl:
        "/reservation/confirmation/RDV-TEST-001",
    });

    expect(
      mocks.createAppointment,
    ).toHaveBeenCalledTimes(1);
  });

  it("retourne 409 et SLOT_UNAVAILABLE en cas de conflit", async () => {
    mocks.createAppointment.mockRejectedValue(
      new Error(
        "Ce créneau n'est plus disponible.",
      ),
    );

    const response = await POST(
      makeRequest({
        staffId: "staff-alice",
        workstationId: "table-1",
        serviceIds: ["service-manicure"],
        startsAt:
          "2030-07-15T07:00:00.000Z",
      }),
    );

    expect(response.status).toBe(409);

    await expect(
      response.json(),
    ).resolves.toMatchObject({
      code: "SLOT_UNAVAILABLE",
      message: expect.any(String),
    });
  });

  it("retourne 400 pour une erreur métier non liée au créneau", async () => {
    mocks.createAppointment.mockRejectedValue(
      new Error(
        "Les données du rendez-vous sont invalides.",
      ),
    );

    const response = await POST(
      makeRequest({
        staffId: "staff-alice",
        workstationId: "table-1",
        serviceIds: [],
        startsAt:
          "2030-07-15T07:00:00.000Z",
      }),
    );

    expect(response.status).toBe(400);

    await expect(
      response.json(),
    ).resolves.toMatchObject({
      code: "APPOINTMENT_CREATION_FAILED",
      message: expect.any(String),
    });
  });

  it("ne divulgue pas les détails techniques d'une erreur inconnue", async () => {
    mocks.createAppointment.mockRejectedValue(
      new Error(
        "P2002 duplicate key internal detail",
      ),
    );

    const response = await POST(
      makeRequest({
        staffId: "staff-alice",
        workstationId: "table-1",
        serviceIds: ["service-manicure"],
        startsAt:
          "2030-07-15T07:00:00.000Z",
      }),
    );

    expect(response.status).toBe(400);

    const data = await response.json();

    expect(data.code).toBe(
      "APPOINTMENT_CREATION_FAILED",
    );

    expect(
      JSON.stringify(data),
    ).not.toContain("P2002");
  });
});
