import "server-only";

import {
  AppointmentStatus,
  PaymentMethod,
  PaymentStatus,
  Prisma,
} from "@/generated/prisma/client";
import {
  createWithRetry,
  makeReference,
} from "@/features/booking/services/create-appointment.service";
import type { CreateAppointmentResult } from "@/features/booking/types/create-appointment.types";
import { calculateRequiredPaymentCents } from "@/features/booking/utils/booking-rules";
import { parisLocalDateTimeToUtc } from "@/features/booking/utils/timezone";
import { loadAppointmentEmailContext } from "@/features/notifications/services/appointment-email-context.service";
import { createNotification } from "@/features/notifications/services/notification.service";
import { appointmentCreatedNotification } from "@/features/notifications/utils/notification-helper";
import { sendAppointmentEmail } from "@/features/notifications/services/appointment-email.service";
import { prisma } from "@/lib/prisma";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

export type AdminOfflinePaymentMethod =
  | "CASH"
  | "CARD"
  | "BANK_TRANSFER"
  | "OTHER";

export type AdminCreateAppointmentInput = {
  clientId: string;
  serviceIds: string[];
  serviceOptions?: Array<{ serviceId: string; quantity: number }>;
  staffId: string;
  date: string;
  time: string;

  /*
   * "ALREADY_PAID" si l'acompte a déjà été encaissé hors-ligne par
   * l'équipe (espèces, carte, virement) avant la création du
   * rendez-vous ; "ONLINE" (par défaut) pour envoyer un lien de
   * paiement à la cliente.
   */
  paymentOption: "ONLINE" | "ALREADY_PAID";
  paymentMethod?: AdminOfflinePaymentMethod;
};

/*
 * Délai laissé à la cliente pour régler l'acompte en ligne lorsqu'un
 * rendez-vous est créé manuellement par l'équipe (contre 15 minutes
 * pour une réservation publique : la cliente n'est pas en train de
 * naviguer sur le site au moment de la création, il lui faut le temps
 * de recevoir et d'ouvrir l'e-mail).
 */
const ADMIN_DEPOSIT_PAYMENT_TIMEOUT_HOURS = 24;

export type AdminCreateAppointmentActor = {
  id: string;
  displayName: string;
};

type AdminCreateAppointmentErrorCode =
  | "CLIENT_NOT_FOUND"
  | "APPOINTMENT_CREATION_FAILED";

export class AdminCreateAppointmentError extends Error {
  public readonly code: AdminCreateAppointmentErrorCode;
  public readonly status: number;

  public constructor(
    code: AdminCreateAppointmentErrorCode,
    message: string,
    status: number,
  ) {
    super(message);

    this.name = "AdminCreateAppointmentError";
    this.code = code;
    this.status = status;
  }
}

const BLOCKING_STATUSES: AppointmentStatus[] = [
  AppointmentStatus.PENDING,
  AppointmentStatus.CONFIRMED,
  AppointmentStatus.IN_PROGRESS,
];

/* -------------------------------------------------------------------------- */
/*                                  HELPERS                                   */
/* -------------------------------------------------------------------------- */

function getSiteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.NEXTAUTH_URL?.trim() ||
    "https://lepalaisdesongles.fr"
  ).replace(/\/+$/, "");
}

/* -------------------------------------------------------------------------- */
/*                    CRÉATION MANUELLE PAR L'ADMINISTRATION                  */
/* -------------------------------------------------------------------------- */

/*
 * Contrairement au tunnel de réservation public (`createAppointment`),
 * cette création ignore volontairement les réglages de réservation
 * en ligne (`acceptsOnlineBooking`, `allowOnlineBooking`) et les
 * horaires configurés : une professionnelle peut toujours être
 * planifiée manuellement par l'équipe, y compris en dehors de ses
 * disponibilités habituelles. Seul un véritable chevauchement de
 * planning (même professionnelle ou même poste de travail déjà pris)
 * reste bloqué, afin d'éviter les doubles réservations.
 */
export async function adminCreateAppointment(
  input: AdminCreateAppointmentInput,
  actor: AdminCreateAppointmentActor,
): Promise<CreateAppointmentResult> {
  const clientId = input.clientId.trim();
  const staffId = input.staffId.trim();

  const serviceIds = Array.from(
    new Set(input.serviceIds.map((id) => id.trim()).filter(Boolean)),
  );

  if (serviceIds.length === 0) {
    throw new AdminCreateAppointmentError(
      "APPOINTMENT_CREATION_FAILED",
      "Sélectionnez au moins une prestation.",
      400,
    );
  }

  const quantityByServiceId = new Map<string, number>();

  for (const serviceId of serviceIds) {
    quantityByServiceId.set(serviceId, 1);
  }

  for (const option of input.serviceOptions ?? []) {
    const serviceId = option.serviceId.trim();

    if (serviceId && serviceIds.includes(serviceId)) {
      quantityByServiceId.set(serviceId, option.quantity);
    }
  }

  const startsAt = parisLocalDateTimeToUtc(input.date, input.time);

  if (startsAt.getTime() <= Date.now()) {
    throw new AdminCreateAppointmentError(
      "APPOINTMENT_CREATION_FAILED",
      "Ce créneau est déjà passé.",
      400,
    );
  }

  const client = await prisma.user.findFirst({
    where: {
      id: clientId,
      role: "CLIENT",
      status: "ACTIVE",
    },

    select: { id: true },
  });

  if (!client) {
    throw new AdminCreateAppointmentError(
      "CLIENT_NOT_FOUND",
      "Cette cliente est introuvable ou son compte n'est pas actif.",
      404,
    );
  }

  const creation = await createWithRetry(() =>
    prisma.$transaction(
      async (tx) => {
        const staff = await tx.staffProfile.findFirst({
          where: {
            id: staffId,
            isActive: true,

            user: {
              status: "ACTIVE",
            },
          },

          include: {
            services: {
              where: {
                serviceId: { in: serviceIds },
                isActive: true,
                service: { isActive: true },
              },

              include: { service: true },
            },
          },
        });

        if (!staff || staff.services.length !== serviceIds.length) {
          throw new Error(
            "Cette professionnelle ne réalise pas (ou plus) toutes les prestations choisies.",
          );
        }

        const totalDurationMinutes = staff.services.reduce(
          (total, assignment) => {
            const quantity = quantityByServiceId.get(assignment.serviceId) ?? 1;

            return (
              total +
              (assignment.durationMinutes ??
                assignment.service.durationMinutes) *
                quantity
            );
          },
          0,
        );

        const cleanupMinutes = Math.max(
          staff.defaultCleanupMinutes,
          ...staff.services.map(
            (assignment) =>
              assignment.cleanupMinutes ?? assignment.service.cleanupMinutes,
          ),
        );

        const endsAt = new Date(
          startsAt.getTime() + totalDurationMinutes * 60_000,
        );

        const occupiedEndsAt = new Date(
          endsAt.getTime() + cleanupMinutes * 60_000,
        );

        // Poste de travail compatible, à titre indicatif : le champ reste
        // facultatif (`Appointment.workstationId` est nullable) afin de ne
        // jamais bloquer une création manuelle faute d'affectation.
        const workstationAssignment = await tx.staffWorkstation.findFirst({
          where: {
            staffId,
            isActive: true,

            workstation: {
              isActive: true,

              AND: serviceIds.map((serviceId) => ({
                serviceAssignments: {
                  some: { serviceId, isActive: true },
                },
              })),
            },
          },

          select: { workstationId: true },

          orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
        });

        const workstationId = workstationAssignment?.workstationId ?? null;

        const conflict = await tx.appointment.findFirst({
          where: {
            status: { in: BLOCKING_STATUSES },

            startsAt: { lt: occupiedEndsAt },
            endsAt: { gt: startsAt },

            OR: [
              { staffId },
              ...(workstationId ? [{ workstationId }] : []),
            ],
          },

          select: { id: true },
        });

        if (conflict) {
          throw new Error(
            "Cette professionnelle a déjà un rendez-vous sur ce créneau. Choisissez un autre horaire.",
          );
        }

        const resolvedServices = staff.services.map((assignment, index) => {
          const unitPriceCents =
            assignment.priceCents ??
            assignment.service.promotionalPriceCents ??
            assignment.service.priceCents;

          if (unitPriceCents === null) {
            throw new Error(
              `La prestation « ${assignment.service.name} » est disponible uniquement sur devis.`,
            );
          }

          return {
            serviceId: assignment.serviceId,

            serviceName: assignment.service.name,

            unitPriceCents,

            durationMinutes:
              assignment.durationMinutes ?? assignment.service.durationMinutes,

            quantity: quantityByServiceId.get(assignment.serviceId) ?? 1,

            sortOrder: index,
          };
        });

        const totalPriceCents = resolvedServices.reduce(
          (total, service) => total + service.unitPriceCents * service.quantity,
          0,
        );

        const depositCents = calculateRequiredPaymentCents(totalPriceCents);

        const requiresPayment = depositCents > 0;

        /*
         * L'acompte peut avoir déjà été encaissé hors-ligne par
         * l'équipe (espèces, carte, virement) avant la création du
         * rendez-vous : le RDV est alors directement confirmé, sans
         * passer par un lien de paiement ni par le délai de 24h.
         */
        const alreadyPaid =
          requiresPayment && input.paymentOption === "ALREADY_PAID";

        const now = new Date();

        const appointmentStatus =
          !requiresPayment || alreadyPaid
            ? AppointmentStatus.CONFIRMED
            : AppointmentStatus.PENDING;

        const paymentStatus = !requiresPayment
          ? PaymentStatus.NOT_REQUIRED
          : alreadyPaid
            ? PaymentStatus.PAID
            : PaymentStatus.PENDING;

        const paymentMethod = !requiresPayment
          ? null
          : alreadyPaid
            ? (input.paymentMethod as PaymentMethod)
            : PaymentMethod.PAYPAL;

        const expiresAt =
          requiresPayment && !alreadyPaid
            ? new Date(
                now.getTime() +
                  ADMIN_DEPOSIT_PAYMENT_TIMEOUT_HOURS * 60 * 60 * 1000,
              )
            : null;

        const reference = makeReference();

        const appointment = await tx.appointment.create({
          data: {
            reference,
            clientId,
            staffId,
            workstationId,

            status: appointmentStatus,

            startsAt,
            endsAt,

            totalDurationMinutes,
            totalPriceCents,
            depositCents,

            paymentStatus,
            paymentMethod,

            confirmedAt: !requiresPayment || alreadyPaid ? now : null,
            paidAt: alreadyPaid ? now : null,

            expiresAt,

            services: {
              create: resolvedServices,
            },
          },

          select: {
            id: true,
            reference: true,
          },
        });

        return {
          reference: appointment.reference,
          appointmentId: appointment.id,

          status:
            !requiresPayment || alreadyPaid
              ? ("CONFIRMED" as const)
              : ("PENDING" as const),

          paymentStatus: !requiresPayment
            ? ("NOT_REQUIRED" as const)
            : alreadyPaid
              ? ("PAID" as const)
              : ("PENDING" as const),

          depositCents,
          requiresPayment: requiresPayment && !alreadyPaid,
          expiresAt,

          confirmationUrl:
            requiresPayment && !alreadyPaid
              ? `/reservation/paiement/${appointment.reference}`
              : `/reservation/confirmation/${appointment.reference}`,
        };
      },

      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      },
    ),
  );

  /*
   * Trace la création dans l'historique du rendez-vous et le
   * journal d'audit : contrairement à une réservation publique,
   * celle-ci a été déclenchée par un·e membre de l'équipe.
   */
  await prisma.$transaction([
    prisma.appointmentHistory.create({
      data: {
        appointmentId: creation.appointmentId,
        actorId: actor.id,
        action: "ADMIN_APPOINTMENT_CREATED",
        nextStatus: creation.status,
        reason: `Rendez-vous créé manuellement par ${actor.displayName}.`,
      },
    }),

    prisma.auditLog.create({
      data: {
        actorId: actor.id,
        action: "ADMIN_APPOINTMENT_CREATED",
        entityType: "Appointment",
        entityId: creation.appointmentId,

        metadata: {
          reference: creation.reference,
          clientId: client.id,
          requiresPayment: creation.requiresPayment,
        },
      },
    }),
  ]);

  try {
    const context = await loadAppointmentEmailContext(creation.appointmentId);

    const siteUrl = getSiteUrl();

    if (creation.requiresPayment) {
      await sendAppointmentEmail({
        kind: "DEPOSIT_PAYMENT_REQUESTED",

        recipientEmail: context.recipientEmail,
        recipientName: context.recipientName,

        appointmentReference: creation.reference,
        startsAt: startsAt.toISOString(),

        serviceNames: context.serviceNames,
        staffName: context.staffName,

        manageUrl: `${siteUrl}${creation.confirmationUrl}`,

        depositAmountCents: creation.depositCents,

        paymentDeadline: creation.expiresAt?.toISOString() ?? null,
      });
    } else {
      await sendAppointmentEmail({
        kind: "BOOKING_CONFIRMED",

        recipientEmail: context.recipientEmail,
        recipientName: context.recipientName,

        appointmentReference: creation.reference,
        startsAt: startsAt.toISOString(),

        serviceNames: context.serviceNames,
        staffName: context.staffName,

        manageUrl: `${siteUrl}/espace-client/rendez-vous/${encodeURIComponent(
          creation.reference,
        )}`,
      });
    }
  } catch (reason: unknown) {
    /*
     * Le rendez-vous est déjà créé : un problème d'envoi ne doit
     * jamais faire échouer la création côté admin.
     */
    console.error("[ADMIN_APPOINTMENT_EMAIL]", reason);
  }

  try {
    await createNotification(
      appointmentCreatedNotification({
        userId: clientId,
        reference: creation.reference,
        startsAt,
      }),
    );
  } catch (reason: unknown) {
    console.error("[ADMIN_APPOINTMENT_CREATED_NOTIFICATION]", reason);
  }

  return {
    reference: creation.reference,
    appointmentId: creation.appointmentId,
    status: creation.status,
    paymentStatus: creation.paymentStatus,
    depositCents: creation.depositCents,
    requiresPayment: creation.requiresPayment,
    confirmationUrl: creation.confirmationUrl,
  };
}
