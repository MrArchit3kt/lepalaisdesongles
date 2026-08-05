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
  consumeSecurityRateLimit: vi.fn(),
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

/*
 * La route importe @/lib/security/rate-limit, qui importe
 * @/lib/prisma au chargement du module. Sans ce mock, le test
 * échoue avant même de s'exécuter faute de DATABASE_URL.
 */
vi.mock("@/lib/security/rate-limit", () => ({
  consumeSecurityRateLimit:
    mocks.consumeSecurityRateLimit,

  getClientIpAddress:
    () => "127.0.0.1",
}));

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

        /*
         * Hors production, isTrustedRequestOrigin() accepte
         * l'origine de la requête elle-même — il faut donc la
         * déclarer explicitement, comme le ferait un navigateur.
         */
        origin: "http://localhost",
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
        role: "CLIENT",
        status: "ACTIVE",
      },
    });

    mocks.consumeSecurityRateLimit.mockResolvedValue({
      allowed: true,
      attempts: 1,
      remaining: 5,
      blockedUntil: null,
      retryAfterSeconds: 0,
    });
  });

  it("refuse une cliente non connectée", async () => {
    mocks.getServerSession.mockResolvedValue(null);

    const response = await POST(
      makeRequest({}),
    );

    expect(response.status).toBe(401);

    /*
     * Ce 401 vient de requireApiUser() (@/lib/api-session), qui
     * répond { success, error } — un format distinct des erreurs
     * de la route elle-même ({ message, code }).
     */
    await expect(
      response.json(),
    ).resolves.toMatchObject({
      error: expect.any(String),
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

    /*
     * Ce message figure dans la liste des erreurs métier
     * publiques de la route : il est renvoyé tel quel avec
     * le code INVALID_APPOINTMENT, pas le code générique.
     */
    await expect(
      response.json(),
    ).resolves.toMatchObject({
      code: "INVALID_APPOINTMENT",
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

    /*
     * Ce message ne figure dans aucune liste d'erreurs
     * publiques : la route retombe sur le code générique
     * et un statut 500, sans jamais exposer le détail interne.
     */
    expect(response.status).toBe(500);

    const data = await response.json();

    expect(data.code).toBe(
      "APPOINTMENT_CREATION_FAILED",
    );

    expect(
      JSON.stringify(data),
    ).not.toContain("P2002");
  });
});
