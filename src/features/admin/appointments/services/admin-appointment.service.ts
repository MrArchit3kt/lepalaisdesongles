import { AppointmentStatus, Prisma } from "@/generated/prisma/client";

import { prisma } from "@/lib/prisma";

import {
  detectAppointmentChanges,
  type AppointmentWithRelations,
} from "@/features/admin/appointments/services/appointment-change-detector.service";

import { createNotification } from "@/features/notifications/services/notification.service";

import { notifyAppointmentStatusChange } from "@/features/notifications/services/appointment-status-notification.service";

import { sendAppointmentEmail } from "@/features/notifications/services/appointment-email.service";

import { systemNotification } from "@/features/notifications/utils/notification-helper";

import type { AppointmentEmailKind } from "@/features/notifications/types/appointment-email.types";

import { logAppointmentHistory } from "@/features/admin/calendar/services/appointment-history-logger.service";

import { processCompletedAppointmentLoyalty } from "@/features/vip/services/process-completed-appointment-loyalty.service";

import { getPublicSocialSettings } from "@/features/admin/settings/services/admin-settings.service";

const BLOCKING_STATUSES: AppointmentStatus[] = [
  AppointmentStatus.PENDING,
  AppointmentStatus.CONFIRMED,
  AppointmentStatus.IN_PROGRESS,
];

type AdminAction =
  | "confirm"
  | "refuse"
  | "cancel"
  | "reschedule"
  | "update_note"
  | "start"
  | "complete"
  | "no_show";

type Input = {
  reference: string;
  actorId: string;
  action: AdminAction;
  reason?: string;
  adminComment?: string;
  startsAt?: string;
};

const appointmentRelations = {
  client: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
    },
  },

  staff: {
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
  },

  workstation: true,

  services: {
    orderBy: {
      sortOrder: "asc" as const,
    },
  },
} satisfies Prisma.AppointmentInclude;

function clean(value: string | undefined, max: number): string | null {
  const result = value?.replace(/\s+/g, " ").trim() ?? "";

  if (!result) {
    return null;
  }

  if (result.length > max) {
    throw new Error(`Le texte ne peut pas dépasser ${max} caractères.`);
  }

  return result;
}

function requiredReason(value?: string): string {
  const result = clean(value, 500);

  if (!result || result.length < 5) {
    throw new Error("Le motif doit contenir au moins 5 caractères.");
  }

  return result;
}

function allowed(action: AdminAction): AppointmentStatus[] {
  switch (action) {
    case "confirm":
    case "refuse":
      return [AppointmentStatus.PENDING];

    case "cancel":
      return [
        AppointmentStatus.PENDING,
        AppointmentStatus.CONFIRMED,
        AppointmentStatus.IN_PROGRESS,
      ];

    case "reschedule":
      return [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED];

    case "start":
      return [AppointmentStatus.CONFIRMED];

    case "complete":
      return [AppointmentStatus.IN_PROGRESS];

    case "no_show":
      return [AppointmentStatus.CONFIRMED];

    case "update_note":
      return Object.values(AppointmentStatus);
  }
}

function toJsonValue(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

function buildHistoryAction(action: AdminAction): string {
  switch (action) {
    case "confirm":
      return "APPOINTMENT_CONFIRMED";

    case "refuse":
      return "APPOINTMENT_REFUSED";

    case "cancel":
      return "APPOINTMENT_CANCELLED_BY_ADMIN";

    case "reschedule":
      return "APPOINTMENT_RESCHEDULED";

    case "update_note":
      return "APPOINTMENT_NOTE_UPDATED";

    case "start":
      return "APPOINTMENT_STARTED";

    case "complete":
      return "APPOINTMENT_COMPLETED";

    case "no_show":
      return "APPOINTMENT_NO_SHOW";
  }
}

function emailKindForAdminAction(
  action: AdminAction,
): AppointmentEmailKind | null {
  switch (action) {
    case "confirm":
      return "BOOKING_CONFIRMED";

    case "reschedule":
      return "APPOINTMENT_UPDATED";

    case "cancel":
      return "APPOINTMENT_CANCELLED";

    case "refuse":
      return "APPOINTMENT_REFUSED";

    case "complete":
      return "REVIEW_REQUEST";

    case "update_note":
    case "start":
    case "no_show":
      return null;
  }
}

function formatChangedFields(
  changes: Array<{
    label: string;
  }>,
): string {
  const labels = changes.map((change) => change.label).filter(Boolean);

  if (labels.length === 0) {
    return "Votre rendez-vous a été mis à jour.";
  }

  if (labels.length === 1) {
    return `${labels[0]} a été modifié(e) pour votre rendez-vous.`;
  }

  return [
    "Plusieurs éléments de votre rendez-vous ont été modifiés :",
    labels.join(", "),
  ].join(" ");
}

export async function updateAdminAppointment(input: Input) {
  const actor = await prisma.user.findFirst({
    where: {
      id: input.actorId,

      role: {
        in: ["SUPER_ADMIN", "ADMIN", "STAFF"],
      },

      status: "ACTIVE",
    },

    select: {
      id: true,
    },
  });

  if (!actor) {
    throw new Error("Accès administrateur refusé.");
  }

  const reference = input.reference.trim();

  if (!reference) {
    throw new Error("La référence du rendez-vous est invalide.");
  }

  const before = await prisma.appointment.findUnique({
    where: {
      reference,
    },

    include: appointmentRelations,
  });

  if (!before) {
    throw new Error("Rendez-vous introuvable.");
  }

  if (!allowed(input.action).includes(before.status)) {
    throw new Error(
      `Cette action n’est pas autorisée pour le statut ${before.status}.`,
    );
  }

  const now = new Date();

  const adminComment = clean(input.adminComment, 2000);

  const reason = clean(input.reason, 500);

  let data: Prisma.AppointmentUpdateInput = {};

  let notificationStatus:
    "CONFIRMED" | "REFUSED" | "CANCELLED_BY_ADMIN" | null = null;

  if (input.action === "confirm") {
    data = {
      status: AppointmentStatus.CONFIRMED,

      confirmedAt: before.confirmedAt ?? now,

      processedBy: {
        connect: {
          id: actor.id,
        },
      },

      ...(adminComment !== null
        ? {
            adminComment,
          }
        : {}),
    };

    notificationStatus = "CONFIRMED";
  } else if (input.action === "refuse") {
    data = {
      status: AppointmentStatus.REFUSED,

      refusedAt: now,

      cancellationReason: requiredReason(input.reason),

      processedBy: {
        connect: {
          id: actor.id,
        },
      },

      ...(adminComment !== null
        ? {
            adminComment,
          }
        : {}),
    };

    notificationStatus = "REFUSED";
  } else if (input.action === "cancel") {
    data = {
      status: AppointmentStatus.CANCELLED_BY_ADMIN,

      cancelledAt: now,

      cancellationReason: requiredReason(input.reason),

      processedBy: {
        connect: {
          id: actor.id,
        },
      },

      ...(adminComment !== null
        ? {
            adminComment,
          }
        : {}),
    };

    notificationStatus = "CANCELLED_BY_ADMIN";
  } else if (input.action === "reschedule") {
    const startsAt = new Date(input.startsAt ?? "");

    if (Number.isNaN(startsAt.getTime()) || startsAt <= now) {
      throw new Error(
        "La nouvelle date doit être valide et située dans le futur.",
      );
    }

    const endsAt = new Date(
      startsAt.getTime() + before.totalDurationMinutes * 60_000,
    );

    const resources: Array<
      | {
          staffId: string;
        }
      | {
          workstationId: string;
        }
    > = [];

    if (before.staffId) {
      resources.push({
        staffId: before.staffId,
      });
    }

    if (before.workstationId) {
      resources.push({
        workstationId: before.workstationId,
      });
    }

    if (resources.length > 0) {
      const conflict = await prisma.appointment.findFirst({
        where: {
          id: {
            not: before.id,
          },

          status: {
            in: BLOCKING_STATUSES,
          },

          startsAt: {
            lt: endsAt,
          },

          endsAt: {
            gt: startsAt,
          },

          OR: resources,
        },

        select: {
          id: true,
        },
      });

      if (conflict) {
        throw new Error(
          "Ce créneau entre en conflit avec un autre rendez-vous.",
        );
      }
    }

    data = {
      startsAt,
      endsAt,

      reminderSentAt: null,

      processedBy: {
        connect: {
          id: actor.id,
        },
      },

      ...(adminComment !== null
        ? {
            adminComment,
          }
        : {}),
    };
  } else if (input.action === "update_note") {
    data = {
      adminComment,

      processedBy: {
        connect: {
          id: actor.id,
        },
      },
    };
  } else if (input.action === "start") {
    data = {
      status: AppointmentStatus.IN_PROGRESS,

      processedBy: {
        connect: {
          id: actor.id,
        },
      },
    };
  } else if (input.action === "complete") {
    data = {
      status: AppointmentStatus.COMPLETED,

      completedAt: now,

      processedBy: {
        connect: {
          id: actor.id,
        },
      },
    };
  } else {
    data = {
      status: AppointmentStatus.NO_SHOW,

      cancellationReason: reason ?? "Cliente absente au rendez-vous.",

      processedBy: {
        connect: {
          id: actor.id,
        },
      },
    };
  }

  const historyAction = buildHistoryAction(input.action);

  const result = await prisma.$transaction(async (tx) => {
    const updated = await tx.appointment.update({
      where: {
        id: before.id,
      },

      data,

      include: appointmentRelations,
    });

    const changeSet = detectAppointmentChanges(
      before as AppointmentWithRelations,
      updated as AppointmentWithRelations,
    );

    const metadata = toJsonValue({
      source: "ADMIN_APPOINTMENT_UPDATE",

      action: input.action,

      adminComment,

      changes: changeSet.changes,

      changedFields: changeSet.changes.map((change) => change.field),

      changeCount: changeSet.changes.length,
    });

    await logAppointmentHistory({
      prisma: tx,

      appointmentId: updated.id,

      actorId: actor.id,

      action: historyAction,

      previousStatus: before.status,

      nextStatus: updated.status,

      previousStartsAt: before.startsAt,

      nextStartsAt: updated.startsAt,

      reason,

      metadata,
    });

    await tx.auditLog.create({
      data: {
        actorId: actor.id,

        action: historyAction,

        entityType: "Appointment",

        entityId: updated.id,

        metadata: toJsonValue({
          reference: updated.reference,

          previousStatus: before.status,

          nextStatus: updated.status,

          previousStartsAt: before.startsAt.toISOString(),

          nextStartsAt: updated.startsAt.toISOString(),

          changedFields: changeSet.changes.map((change) => change.field),

          changes: changeSet.changes,
        }),
      },
    });

    if (
      input.action === "complete" &&
      before.status !== AppointmentStatus.COMPLETED &&
      updated.status === AppointmentStatus.COMPLETED
    ) {
      await processCompletedAppointmentLoyalty({
        prisma: tx,

        appointment: {
          id: updated.id,

          reference: updated.reference,

          clientId: updated.client.id,

          totalPriceCents: updated.totalPriceCents,

          paymentStatus: updated.paymentStatus,

          services: updated.services.map((service) => ({
            serviceId: service.serviceId,
          })),
        },

        actorId: actor.id,

        completedAt: updated.completedAt ?? now,
      });
    }

    return {
      appointment: updated,

      changes: changeSet.changes,
    };
  });

  try {
    if (notificationStatus) {
      await notifyAppointmentStatusChange(
        result.appointment.id,
        notificationStatus,
      );
    } else if (result.changes.length > 0) {
      await createNotification(
        systemNotification({
          userId: result.appointment.client.id,

          title:
            input.action === "reschedule"
              ? "Rendez-vous reprogrammé"
              : "Rendez-vous modifié",

          message: formatChangedFields(result.changes),

          actionUrl: `/espace-client/rendez-vous/${encodeURIComponent(
            result.appointment.reference,
          )}`,
        }),
      );
    }
  } catch (error) {
    console.error("[ADMIN_APPOINTMENT_NOTIFICATION]", error);
  }

  const emailKind = emailKindForAdminAction(input.action);

  if (emailKind) {
    try {
      const siteUrl = (
        process.env.NEXT_PUBLIC_APP_URL?.trim() ||
        process.env.NEXTAUTH_URL?.trim() ||
        "https://lepalaisdesongles.fr"
      ).replace(/\/+$/, "");

      const recipientName = [
        result.appointment.client.firstName,
        result.appointment.client.lastName,
      ]
        .filter(Boolean)
        .join(" ")
        .trim();

      const staffName =
        result.appointment.staff?.displayName?.trim() ||
        [
          result.appointment.staff?.user.firstName,
          result.appointment.staff?.user.lastName,
        ]
          .filter(Boolean)
          .join(" ")
          .trim() ||
        null;

      const serviceNames = result.appointment.services.flatMap((service) =>
        Array.from(
          {
            length: Math.max(service.quantity, 1),
          },
          () => service.serviceName,
        ),
      );

      const appointmentUrl = `${siteUrl}/espace-client/rendez-vous/${encodeURIComponent(
        result.appointment.reference,
      )}`;

      /*
       * L'invitation à laisser un avis pointe directement vers la
       * fiche Google du salon quand elle est configurée (admin >
       * paramètres > réseaux sociaux) : la dépose d'avis n'est pas
       * encore possible depuis l'espace client. À défaut, on retombe
       * sur la fiche du rendez-vous.
       */
      const manageUrl =
        emailKind === "REVIEW_REQUEST"
          ? (await getPublicSocialSettings()).googleReviewUrl?.trim() ||
            appointmentUrl
          : appointmentUrl;

      await sendAppointmentEmail({
        kind: emailKind,

        recipientEmail: result.appointment.client.email,

        recipientName,

        appointmentReference: result.appointment.reference,

        startsAt: result.appointment.startsAt.toISOString(),

        serviceNames,

        staffName,

        manageUrl,
      });
    } catch (reason: unknown) {
      /*
       * L'action administrative est déjà enregistrée.
       * Une erreur d'envoi ne doit jamais annuler
       * la modification du rendez-vous.
       */
      console.error("[ADMIN_APPOINTMENT_EMAIL]", {
        action: input.action,
        reference: result.appointment.reference,
        reason,
      });
    }
  }

  return result.appointment;
}
