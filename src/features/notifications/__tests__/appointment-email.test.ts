import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  renderAppointmentEmail,
} from "../templates/appointment-email.template";
import {
  sendAppointmentEmail,
} from "../services/appointment-email.service";

const baseData = {
  kind: "BOOKING_CONFIRMED" as const,
  recipientEmail: "cliente@example.com",
  recipientName: "Élodie",
  appointmentReference: "RDV-2030-001",
  startsAt: "2030-07-15T08:00:00.000Z",
  serviceNames: ["Manucure", "Semi-permanent"],
  staffName: "Alice",
  manageUrl:
    "https://lepalaisdesongles.fr/espace-client/rendez-vous/RDV-2030-001",
};

describe("notifications e-mail des rendez-vous", () => {
  beforeEach(() => {
    vi.stubEnv("EMAIL_ENABLED", "true");
    vi.stubEnv("RESEND_API_KEY", "test-key");
    vi.stubEnv(
      "EMAIL_FROM",
      "Le Palais des Ongles <contact@example.com>",
    );
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("génère un e-mail de confirmation complet", () => {
    const result = renderAppointmentEmail(baseData);

    expect(result.subject).toContain("confirmé");
    expect(result.text).toContain("RDV-2030-001");
    expect(result.text).toContain("Manucure");
    expect(result.html).toContain("Gérer mon rendez-vous");
  });

  it("échappe les données HTML fournies par la cliente", () => {
    const result = renderAppointmentEmail({
      ...baseData,
      recipientName: '<script>alert("x")</script>',
    });

    expect(result.html).not.toContain("<script>");
    expect(result.html).toContain("&lt;script&gt;");
  });

  it("n'envoie rien lorsque les e-mails sont désactivés", async () => {
    vi.stubEnv("EMAIL_ENABLED", "false");

    const fetchSpy = vi.spyOn(globalThis, "fetch");

    const result = await sendAppointmentEmail(baseData);

    expect(result).toEqual({
      status: "skipped",
      reason: "EMAIL_DISABLED",
    });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("n'envoie rien sans configuration fournisseur", async () => {
    vi.stubEnv("RESEND_API_KEY", "");

    const result = await sendAppointmentEmail(baseData);

    expect(result).toEqual({
      status: "skipped",
      reason: "MISSING_CONFIGURATION",
    });
  });

  it("envoie l'e-mail avec Resend", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ id: "email-test-1" }), {
        status: 200,
        headers: {
          "content-type": "application/json",
        },
      }),
    );

    const result = await sendAppointmentEmail(baseData);

    expect(result).toEqual({
      status: "sent",
      provider: "resend",
      id: "email-test-1",
    });
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("remonte une erreur fournisseur propre", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          message: "Invalid API key",
        }),
        {
          status: 401,
          headers: {
            "content-type": "application/json",
          },
        },
      ),
    );

    await expect(
      sendAppointmentEmail(baseData),
    ).rejects.toThrow("Invalid API key");
  });
});
