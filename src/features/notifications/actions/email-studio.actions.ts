"use server";

import {
  sendAppointmentEmail,
} from "../services/appointment-email.service";

import type {
  AppointmentEmailKind,
} from "../types/appointment-email.types";

import {
  requireAdminUser,
} from "@/lib/session";

export type EmailStudioActionState =
  | {
      success: true;
      message: string;
      deliveryId?: string;
    }
  | {
      success: false;
      message: string;
    };

const ALLOWED_EMAIL_KINDS = new Set<AppointmentEmailKind>([
  "BOOKING_CONFIRMED",
  "APPOINTMENT_UPDATED",
  "APPOINTMENT_CANCELLED",
  "REMINDER_24H",
  "REMINDER_2H",
]);

function isAppointmentEmailKind(
  value: string,
): value is AppointmentEmailKind {
  return ALLOWED_EMAIL_KINDS.has(
    value as AppointmentEmailKind,
  );
}

function isValidEmail(
  value: string,
): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function sendEmailStudioTestAction(
  formData: FormData,
): Promise<EmailStudioActionState> {
  await requireAdminUser();

  const recipientEmail =
    String(
      formData.get("recipientEmail") ?? "",
    )
      .trim()
      .toLowerCase();

  const kindValue =
    String(
      formData.get("kind") ?? "",
    ).trim();

  if (!isValidEmail(recipientEmail)) {
    return {
      success: false,
      message:
        "L'adresse e-mail de test est invalide.",
    };
  }

  if (!isAppointmentEmailKind(kindValue)) {
    return {
      success: false,
      message:
        "Le modèle d'e-mail sélectionné est invalide.",
    };
  }

  const startsAt =
    new Date(
      Date.now() +
        24 * 60 * 60 * 1000,
    ).toISOString();

  try {
    const result =
      await sendAppointmentEmail({
        kind: kindValue,

        recipientEmail,

        recipientName:
          "Élodie",

        appointmentReference:
          "TEST-EMAIL-001",

        startsAt,

        serviceNames: [
          "Pose complète gel",
          "Nail art",
        ],

        staffName:
          "Le Palais des Ongles",

        manageUrl:
          `${
            process.env.NEXT_PUBLIC_APP_URL?.replace(
              /\/+$/,
              "",
            ) ||
            process.env.NEXTAUTH_URL?.replace(
              /\/+$/,
              "",
            ) ||
            "https://lepalaisdesongles.fr"
          }/tableau-de-bord`,
      });

    if (result.status === "skipped") {
      const reasonMessage =
        result.reason === "EMAIL_DISABLED"
          ? "L'envoi des e-mails est désactivé avec EMAIL_ENABLED=false."
          : "La configuration Resend est incomplète. Vérifie RESEND_API_KEY et EMAIL_FROM.";

      return {
        success: false,
        message: reasonMessage,
      };
    }

    return {
      success: true,
      message:
        "L'e-mail de test a été envoyé avec succès.",
      deliveryId:
        result.id,
    };
  } catch (error) {
    console.error(
      "[EMAIL_STUDIO_TEST_ERROR]",
      error,
    );

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Impossible d'envoyer l'e-mail de test.",
    };
  }
}
