"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { requireClientUser } from "@/lib/session";
import { createNotification } from "@/features/notifications/services/notification.service";
import { appointmentCancelledNotification } from "@/features/notifications/utils/notification-helper";

const CANCELLATION_LIMIT_HOURS = 48;

function buildAppointmentUrl(
  reference: string,
  parameters?: Record<string, string>,
): string {
  const encodedReference =
    encodeURIComponent(reference);

  const searchParameters =
    new URLSearchParams(parameters);

  const query = searchParameters.toString();

  return query
    ? `/espace-client/rendez-vous/${encodedReference}?${query}`
    : `/espace-client/rendez-vous/${encodedReference}`;
}

function normalizeReason(value: FormDataEntryValue | null) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

export async function cancelAppointmentAction(
  formData: FormData,
): Promise<never> {
  const user = await requireClientUser();

  const reference = String(
    formData.get("reference") ?? "",
  ).trim();

  const reason = normalizeReason(
    formData.get("reason"),
  );

  if (!reference) {
    redirect("/espace-client/rendez-vous");
  }

  const appointmentUrl =
    buildAppointmentUrl(reference);

  if (reason.length < 5) {
    redirect(
      buildAppointmentUrl(reference, {
        error:
          "Le motif d’annulation doit contenir au moins 5 caractères.",
      }),
    );
  }

  if (reason.length > 500) {
    redirect(
      buildAppointmentUrl(reference, {
        error:
          "Le motif d’annulation ne peut pas dépasser 500 caractères.",
      }),
    );
  }

  const appointment =
    await prisma.appointment.findFirst({
      where: {
        reference,
        clientId: user.id,
      },

      select: {
        id: true,
        status: true,
        startsAt: true,
        depositCents: true,
        paymentStatus: true,
      },
    });

  if (!appointment) {
    redirect(
      buildAppointmentUrl(reference, {
        error:
          "Ce rendez-vous est introuvable ou ne vous appartient pas.",
      }),
    );
  }

  const cancellableStatuses = [
    "PENDING",
    "CONFIRMED",
  ];

  if (
    !cancellableStatuses.includes(
      appointment.status,
    )
  ) {
    redirect(
      buildAppointmentUrl(reference, {
        error:
          "Ce rendez-vous ne peut plus être annulé.",
      }),
    );
  }

  const now = new Date();

  if (appointment.startsAt <= now) {
    redirect(
      buildAppointmentUrl(reference, {
        error:
          "Un rendez-vous déjà commencé ou passé ne peut pas être annulé.",
      }),
    );
  }

  const millisecondsBeforeAppointment =
    appointment.startsAt.getTime() -
    now.getTime();

  const hoursBeforeAppointment =
    millisecondsBeforeAppointment /
    (1000 * 60 * 60);

  const isLateCancellation =
    hoursBeforeAppointment <
    CANCELLATION_LIMIT_HOURS;

  /*
   * Le statut du paiement n’est pas modifié automatiquement.
   *
   * Cela évite de considérer à tort qu’un remboursement
   * PayPal a été effectué alors qu’aucun remboursement réel
   * n’a encore été envoyé au prestataire de paiement.
   */
  await prisma.appointment.update({
    where: {
      id: appointment.id,
    },

    data: {
      status: "CANCELLED_BY_CLIENT",
      cancelledAt: now,

      cancellationReason:
        isLateCancellation
          ? `${reason} — Annulation effectuée moins de 48 heures avant le rendez-vous.`
          : reason,
    },
  });

  try {
    await createNotification(
      appointmentCancelledNotification({
        userId: user.id,
        reference,
        startsAt: appointment.startsAt,
      }),
    );
  } catch (reason: unknown) {
    console.error(
      "[APPOINTMENT_CANCELLED_NOTIFICATION]",
      reason,
    );
  }

  revalidatePath(
    "/espace-client/rendez-vous",
  );

  revalidatePath(appointmentUrl);

  revalidatePath("/espace-client");
  revalidatePath("/espace-client/notifications");

  redirect(
    buildAppointmentUrl(reference, {
      cancelled: "1",
      late: isLateCancellation
        ? "1"
        : "0",
    }),
  );
}
