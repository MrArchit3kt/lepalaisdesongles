import { prisma } from "@/lib/prisma";

export const APPOINTMENT_PAYMENT_TIMEOUT_MINUTES = 15;

const APPOINTMENT_PAYMENT_TIMEOUT_MS =
  APPOINTMENT_PAYMENT_TIMEOUT_MINUTES *
  60 *
  1000;

export function getAppointmentExpirationDate(
  createdAt: Date,
): Date {
  return new Date(
    createdAt.getTime() +
      APPOINTMENT_PAYMENT_TIMEOUT_MS,
  );
}

export function isAppointmentExpired(
  createdAt: Date,
  now = new Date(),
): boolean {
  return (
    getAppointmentExpirationDate(
      createdAt,
    ).getTime() <= now.getTime()
  );
}

export function getExpirationCutoff(
  now = new Date(),
): Date {
  return new Date(
    now.getTime() -
      APPOINTMENT_PAYMENT_TIMEOUT_MS,
  );
}

/**
 * Expire toutes les réservations :
 * - encore en attente ;
 * - nécessitant un paiement ;
 * - non payées ;
 * - créées depuis au moins 15 minutes.
 *
 * La mise à jour groupée est atomique et idempotente.
 */
export async function expirePendingAppointments(
  now = new Date(),
): Promise<number> {
  const cutoff = getExpirationCutoff(now);

  const result =
    await prisma.appointment.updateMany({
      where: {
        status: "PENDING",
        paymentStatus: {
          not: "PAID",
        },
        depositCents: {
          gt: 0,
        },
        createdAt: {
          lte: cutoff,
        },
      },

      data: {
        status: "EXPIRED",
        cancelledAt: now,
        cancellationReason:
          "Réservation expirée automatiquement : paiement non reçu dans le délai de 15 minutes.",
      },
    });

  return result.count;
}

/**
 * Vérifie puis expire une réservation précise.
 *
 * Utile avant :
 * - l’affichage de la page de paiement ;
 * - la création d’une commande PayPal ;
 * - la capture PayPal.
 */
export async function expireAppointmentIfNeeded(
  appointmentId: string,
  now = new Date(),
): Promise<boolean> {
  const cleanAppointmentId =
    appointmentId.trim();

  if (!cleanAppointmentId) {
    return false;
  }

  const cutoff = getExpirationCutoff(now);

  const result =
    await prisma.appointment.updateMany({
      where: {
        id: cleanAppointmentId,
        status: "PENDING",
        paymentStatus: {
          not: "PAID",
        },
        depositCents: {
          gt: 0,
        },
        createdAt: {
          lte: cutoff,
        },
      },

      data: {
        status: "EXPIRED",
        cancelledAt: now,
        cancellationReason:
          "Réservation expirée automatiquement : paiement non reçu dans le délai de 15 minutes.",
      },
    });

  return result.count > 0;
}
