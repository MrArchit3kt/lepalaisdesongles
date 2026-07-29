import {
  renderAppointmentEmail,
} from "../templates/appointment-email.template";
import type {
  AppointmentEmailData,
  EmailDeliveryResult,
} from "../types/appointment-email.types";

type ResendResponse = {
  id?: string;
  message?: string;
};

export async function sendAppointmentEmail(
  data: AppointmentEmailData,
): Promise<EmailDeliveryResult> {
  if (process.env.EMAIL_ENABLED === "false") {
    return {
      status: "skipped",
      reason: "EMAIL_DISABLED",
    };
  }

  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.EMAIL_FROM?.trim();

  if (!apiKey || !from) {
    return {
      status: "skipped",
      reason: "MISSING_CONFIGURATION",
    };
  }

  const rendered = renderAppointmentEmail(data);

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [data.recipientEmail],
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text,
    }),
  });

  const payload = (await response.json()) as ResendResponse;

  if (!response.ok || !payload.id) {
    throw new Error(
      payload.message || "Le fournisseur d'e-mails a refusé l'envoi.",
    );
  }

  return {
    status: "sent",
    provider: "resend",
    id: payload.id,
  };
}
