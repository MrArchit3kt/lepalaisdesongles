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

/*
 * Un rendez-vous PENDING expire à sa date `expiresAt` explicite quand
 * elle est renseignée (réservation publique : 15 minutes ; création
 * manuelle admin : 24 heures — voir respectivement
 * `create-appointment.service.ts` et `admin-create-appointment.service.ts`).
 *
 * Les rendez-vous créés avant l'introduction de ce champ n'ont pas de
 * `expiresAt` : on retombe alors sur l'ancien comportement (15 minutes
 * après `createdAt`), pour ne rien changer à leur traitement.
 */
function expirationWhereClause(now: Date) {
  const legacyCutoff = getExpirationCutoff(now);

  return {
    status: "PENDING" as const,

    paymentStatus: {
      not: "PAID" as const,
    },

    depositCents: {
      gt: 0,
    },

    OR: [
      {
        expiresAt: {
          lte: now,
        },
      },
      {
        expiresAt: null,

        createdAt: {
          lte: legacyCutoff,
        },
      },
    ],
  };
}

const EXPIRATION_REASON =
  "Réservation expirée automatiquement : l’acompte n’a pas été réglé dans le délai imparti.";

/**
 * Expire toutes les réservations :
 * - encore en attente ;
 * - nécessitant un paiement ;
 * - non payées ;
 * - dont la date limite de paiement est dépassée.
 *
 * La mise à jour groupée est atomique et idempotente.
 */
export async function expirePendingAppointments(
  now = new Date(),
): Promise<number> {
  const result =
    await prisma.appointment.updateMany({
      where: expirationWhereClause(now),

      data: {
        status: "EXPIRED",
        cancelledAt: now,
        cancellationReason: EXPIRATION_REASON,
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

  const result =
    await prisma.appointment.updateMany({
      where: {
        id: cleanAppointmentId,
        ...expirationWhereClause(now),
      },

      data: {
        status: "EXPIRED",
        cancelledAt: now,
        cancellationReason: EXPIRATION_REASON,
      },
    });

  return result.count > 0;
}
