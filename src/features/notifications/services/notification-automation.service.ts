import { prisma } from "@/lib/prisma";

import { sendAppointmentEmail } from "@/features/notifications/services/appointment-email.service";

import type { AppointmentEmailKind } from "@/features/notifications/types/appointment-email.types";

import {
  appointmentReminderNotification,
  appointmentReviewRequestNotification,
} from "@/features/notifications/utils/notification-helper";

/* -------------------------------------------------------------------------- */
/*                                CONSTANTES                                  */
/* -------------------------------------------------------------------------- */

const HOUR_IN_MILLISECONDS = 60 * 60 * 1000;

const DAY_IN_MILLISECONDS = 24 * HOUR_IN_MILLISECONDS;

const REMINDER_24H_MINIMUM_DELAY = 23 * HOUR_IN_MILLISECONDS;

const REMINDER_24H_MAXIMUM_DELAY = 25 * HOUR_IN_MILLISECONDS;

const REMINDER_2H_MINIMUM_DELAY = 90 * 60 * 1000;

const REMINDER_2H_MAXIMUM_DELAY = 150 * 60 * 1000;

const REVIEW_REQUEST_MINIMUM_DELAY = 2 * HOUR_IN_MILLISECONDS;

const REVIEW_REQUEST_MAXIMUM_AGE = 14 * DAY_IN_MILLISECONDS;

const AUTOMATION_BATCH_SIZE = 250;

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

type ReminderKind = "REMINDER_24H" | "REMINDER_2H";

type ReminderEmailContext = {
  kind: ReminderKind;

  recipientEmail: string;

  recipientName: string;

  appointmentReference: string;

  startsAt: Date;

  serviceNames: string[];

  staffName: string | null;
};

type ReminderProcessingResult = {
  created: number;

  emailContexts: ReminderEmailContext[];
};

type ReminderEmailDeliveryResult = {
  reminder24hEmailsSent: number;

  reminder24hEmailFailures: number;

  reminder2hEmailsSent: number;

  reminder2hEmailFailures: number;
};

export type NotificationAutomationResult = {
  remindersCreated: number;

  reminder2hCreated: number;

  reminderEmailsSent: number;

  reminderEmailFailures: number;

  reminder2hEmailsSent: number;

  reminder2hEmailFailures: number;

  reviewRequestsCreated: number;
};

/* -------------------------------------------------------------------------- */
/*                              OUTILS INTERNES                               */
/* -------------------------------------------------------------------------- */

function normalizeNotificationMetadata(
  value: unknown,
): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return {};
  }

  return value as Record<string, unknown>;
}

function getSiteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.NEXTAUTH_URL?.trim() ||
    "https://lepalaisdesongles.fr"
  ).replace(/\/+$/, "");
}

function buildFullName(
  firstName: string | null | undefined,

  lastName: string | null | undefined,
): string {
  return [firstName, lastName].filter(Boolean).join(" ").trim();
}

function buildServiceNames(
  services: Array<{
    serviceName: string;

    quantity: number;
  }>,
): string[] {
  return services.flatMap((service) =>
    Array.from(
      {
        length: Math.max(service.quantity, 1),
      },

      () => service.serviceName,
    ),
  );
}

function buildStaffName(
  staff: {
    displayName: string | null;

    user: {
      firstName: string;

      lastName: string;
    };
  } | null,
): string | null {
  if (!staff) {
    return null;
  }

  return (
    staff.displayName?.trim() ||
    buildFullName(staff.user.firstName, staff.user.lastName) ||
    null
  );
}

function buildReminderEmailContext(
  kind: ReminderKind,

  appointment: {
    reference: string;

    startsAt: Date;

    client: {
      email: string;

      firstName: string;

      lastName: string;
    };

    staff: {
      displayName: string | null;

      user: {
        firstName: string;

        lastName: string;
      };
    } | null;

    services: Array<{
      serviceName: string;

      quantity: number;
    }>;
  },
): ReminderEmailContext {
  return {
    kind,

    recipientEmail: appointment.client.email,

    recipientName:
      buildFullName(
        appointment.client.firstName,
        appointment.client.lastName,
      ) || "Cliente",

    appointmentReference: appointment.reference,

    startsAt: appointment.startsAt,

    serviceNames: buildServiceNames(appointment.services),

    staffName: buildStaffName(appointment.staff),
  };
}

function getReminderNotificationContent(kind: ReminderKind): {
  title: string;

  message: string;
} {
  if (kind === "REMINDER_2H") {
    return {
      title: "Votre rendez-vous commence bientôt",

      message: "Votre rendez-vous commence dans environ 2 heures.",
    };
  }

  return {
    title: "Rappel de rendez-vous",

    message: "Votre rendez-vous est prévu dans environ 24 heures.",
  };
}

function getReminderEmailLogPrefix(kind: AppointmentEmailKind): string {
  return kind === "REMINDER_2H" ? "REMINDER_2H" : "REMINDER_24H";
}

/* -------------------------------------------------------------------------- */
/*                         TRAITEMENT DU RAPPEL 24 H                          */
/* -------------------------------------------------------------------------- */

async function processReminder24h(
  now: Date,
): Promise<ReminderProcessingResult> {
  const reminderStart = new Date(now.getTime() + REMINDER_24H_MINIMUM_DELAY);

  const reminderEnd = new Date(now.getTime() + REMINDER_24H_MAXIMUM_DELAY);

  return prisma.$transaction(async (transaction) => {
    const appointments = await transaction.appointment.findMany({
      where: {
        status: "CONFIRMED",

        reminderSentAt: null,

        startsAt: {
          gte: reminderStart,

          lte: reminderEnd,
        },
      },

      select: {
        id: true,

        clientId: true,

        reference: true,

        startsAt: true,

        client: {
          select: {
            email: true,

            firstName: true,

            lastName: true,
          },
        },

        staff: {
          select: {
            displayName: true,

            user: {
              select: {
                firstName: true,

                lastName: true,
              },
            },
          },
        },

        services: {
          orderBy: {
            sortOrder: "asc",
          },

          select: {
            serviceName: true,

            quantity: true,
          },
        },
      },

      take: AUTOMATION_BATCH_SIZE,
    });

    let created = 0;

    const emailContexts: ReminderEmailContext[] = [];

    for (const appointment of appointments) {
      /*
       * Revendication atomique du rappel.
       *
       * Si deux exécutions du cron se chevauchent,
       * une seule peut faire passer reminderSentAt
       * de null à une date réelle.
       */
      const claimed = await transaction.appointment.updateMany({
        where: {
          id: appointment.id,

          status: "CONFIRMED",

          reminderSentAt: null,
        },

        data: {
          reminderSentAt: now,
        },
      });

      if (claimed.count === 0) {
        continue;
      }

      const baseNotification = appointmentReminderNotification({
        userId: appointment.clientId,

        reference: appointment.reference,

        startsAt: appointment.startsAt,
      });

      const content = getReminderNotificationContent("REMINDER_24H");

      await transaction.notification.create({
        data: {
          userId: baseNotification.userId,

          type: baseNotification.type,

          title: content.title,

          message: content.message,

          actionUrl: baseNotification.actionUrl ?? null,

          metadata: {
            ...normalizeNotificationMetadata(baseNotification.metadata),

            reminderKind: "REMINDER_24H",
          },
        },
      });

      emailContexts.push(
        buildReminderEmailContext(
          "REMINDER_24H",

          appointment,
        ),
      );

      created += 1;
    }

    return {
      created,

      emailContexts,
    };
  });
}

/* -------------------------------------------------------------------------- */
/*                          TRAITEMENT DU RAPPEL 2 H                          */
/* -------------------------------------------------------------------------- */

async function processReminder2h(now: Date): Promise<ReminderProcessingResult> {
  const reminderStart = new Date(now.getTime() + REMINDER_2H_MINIMUM_DELAY);

  const reminderEnd = new Date(now.getTime() + REMINDER_2H_MAXIMUM_DELAY);

  return prisma.$transaction(async (transaction) => {
    const appointments = await transaction.appointment.findMany({
      where: {
        status: "CONFIRMED",

        reminder2hSentAt: null,

        startsAt: {
          gte: reminderStart,

          lte: reminderEnd,
        },
      },

      select: {
        id: true,

        clientId: true,

        reference: true,

        startsAt: true,

        client: {
          select: {
            email: true,

            firstName: true,

            lastName: true,
          },
        },

        staff: {
          select: {
            displayName: true,

            user: {
              select: {
                firstName: true,

                lastName: true,
              },
            },
          },
        },

        services: {
          orderBy: {
            sortOrder: "asc",
          },

          select: {
            serviceName: true,

            quantity: true,
          },
        },
      },

      take: AUTOMATION_BATCH_SIZE,
    });

    let created = 0;

    const emailContexts: ReminderEmailContext[] = [];

    for (const appointment of appointments) {
      /*
       * Revendication atomique du rappel 2 h.
       *
       * Deux exécutions concurrentes du cron
       * ne peuvent pas produire deux rappels :
       * une seule peut modifier reminder2hSentAt.
       */
      const claimed = await transaction.appointment.updateMany({
        where: {
          id: appointment.id,

          status: "CONFIRMED",

          reminder2hSentAt: null,
        },

        data: {
          reminder2hSentAt: now,
        },
      });

      if (claimed.count === 0) {
        continue;
      }

      const baseNotification = appointmentReminderNotification({
        userId: appointment.clientId,

        reference: appointment.reference,

        startsAt: appointment.startsAt,
      });

      const content = getReminderNotificationContent("REMINDER_2H");

      await transaction.notification.create({
        data: {
          userId: baseNotification.userId,

          type: baseNotification.type,

          title: content.title,

          message: content.message,

          actionUrl: baseNotification.actionUrl ?? null,

          metadata: {
            ...normalizeNotificationMetadata(baseNotification.metadata),

            reminderKind: "REMINDER_2H",
          },
        },
      });

      emailContexts.push(
        buildReminderEmailContext(
          "REMINDER_2H",

          appointment,
        ),
      );

      created += 1;
    }

    return {
      created,

      emailContexts,
    };
  });
}

/* -------------------------------------------------------------------------- */
/*                         TRAITEMENT DES DEMANDES D’AVIS                     */
/* -------------------------------------------------------------------------- */

async function processReviewRequests(now: Date): Promise<number> {
  const reviewBefore = new Date(now.getTime() - REVIEW_REQUEST_MINIMUM_DELAY);

  const reviewAfter = new Date(now.getTime() - REVIEW_REQUEST_MAXIMUM_AGE);

  return prisma.$transaction(async (transaction) => {
    const appointments = await transaction.appointment.findMany({
      where: {
        status: "COMPLETED",

        reviewRequestSentAt: null,

        review: null,

        completedAt: {
          not: null,

          gte: reviewAfter,

          lte: reviewBefore,
        },
      },

      select: {
        id: true,

        clientId: true,

        reference: true,

        startsAt: true,
      },

      take: AUTOMATION_BATCH_SIZE,
    });

    let created = 0;

    for (const appointment of appointments) {
      const claimed = await transaction.appointment.updateMany({
        where: {
          id: appointment.id,

          status: "COMPLETED",

          reviewRequestSentAt: null,

          review: null,
        },

        data: {
          reviewRequestSentAt: now,
        },
      });

      if (claimed.count === 0) {
        continue;
      }

      const notification = appointmentReviewRequestNotification({
        userId: appointment.clientId,

        reference: appointment.reference,

        startsAt: appointment.startsAt,
      });

      await transaction.notification.create({
        data: {
          userId: notification.userId,

          type: notification.type,

          title: notification.title,

          message: notification.message,

          actionUrl: notification.actionUrl ?? null,

          metadata: notification.metadata ?? undefined,
        },
      });

      created += 1;
    }

    return created;
  });
}

/* -------------------------------------------------------------------------- */
/*                           ENVOI DES E-MAILS DE RAPPEL                      */
/* -------------------------------------------------------------------------- */

async function sendReminderEmails(
  contexts: ReminderEmailContext[],
): Promise<ReminderEmailDeliveryResult> {
  const siteUrl = getSiteUrl();

  let reminder24hEmailsSent = 0;

  let reminder24hEmailFailures = 0;

  let reminder2hEmailsSent = 0;

  let reminder2hEmailFailures = 0;

  for (const context of contexts) {
    const logPrefix = getReminderEmailLogPrefix(context.kind);

    try {
      const delivery = await sendAppointmentEmail({
        kind: context.kind,

        recipientEmail: context.recipientEmail,

        recipientName: context.recipientName,

        appointmentReference: context.appointmentReference,

        startsAt: context.startsAt.toISOString(),

        serviceNames: context.serviceNames,

        staffName: context.staffName,

        manageUrl: `${siteUrl}/espace-client/rendez-vous/${encodeURIComponent(
          context.appointmentReference,
        )}`,
      });

      if (delivery.status === "sent") {
        if (context.kind === "REMINDER_2H") {
          reminder2hEmailsSent += 1;
        } else {
          reminder24hEmailsSent += 1;
        }

        continue;
      }

      if (context.kind === "REMINDER_2H") {
        reminder2hEmailFailures += 1;
      } else {
        reminder24hEmailFailures += 1;
      }

      console.error(`[${logPrefix}_EMAIL_SKIPPED]`, {
        reference: context.appointmentReference,

        reason: delivery.reason,
      });
    } catch (reason: unknown) {
      if (context.kind === "REMINDER_2H") {
        reminder2hEmailFailures += 1;
      } else {
        reminder24hEmailFailures += 1;
      }

      /*
       * Le marqueur et la notification interne
       * sont déjà enregistrés en base.
       *
       * Une panne Resend ne doit pas interrompre
       * les autres rappels du traitement.
       */
      console.error(`[${logPrefix}_EMAIL]`, {
        reference: context.appointmentReference,

        reason,
      });
    }
  }

  return {
    reminder24hEmailsSent,

    reminder24hEmailFailures,

    reminder2hEmailsSent,

    reminder2hEmailFailures,
  };
}

/* -------------------------------------------------------------------------- */
/*                         AUTOMATISATION PUBLIQUE                            */
/* -------------------------------------------------------------------------- */

export async function processNotificationAutomations(
  now = new Date(),
): Promise<NotificationAutomationResult> {
  /*
   * Chaque groupe utilise sa propre transaction courte.
   *
   * Aucun appel réseau vers Resend n’est exécuté
   * pendant une transaction Prisma.
   */
  const reminder24hResult = await processReminder24h(now);

  const reminder2hResult = await processReminder2h(now);

  const reviewRequestsCreated = await processReviewRequests(now);

  const deliveryResult = await sendReminderEmails([
    ...reminder24hResult.emailContexts,

    ...reminder2hResult.emailContexts,
  ]);

  return {
    remindersCreated: reminder24hResult.created,

    reminder2hCreated: reminder2hResult.created,

    reminderEmailsSent: deliveryResult.reminder24hEmailsSent,

    reminderEmailFailures: deliveryResult.reminder24hEmailFailures,

    reminder2hEmailsSent: deliveryResult.reminder2hEmailsSent,

    reminder2hEmailFailures: deliveryResult.reminder2hEmailFailures,

    reviewRequestsCreated,
  };
}
