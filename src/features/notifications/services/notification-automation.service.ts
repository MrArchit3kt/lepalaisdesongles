import { prisma } from "@/lib/prisma";
import {
  appointmentReminderNotification,
  appointmentReviewRequestNotification,
} from "@/features/notifications/utils/notification-helper";

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

export async function processNotificationAutomations(
  now = new Date(),
): Promise<{
  remindersCreated: number;
  reviewRequestsCreated: number;
}> {
  const reminderStart = new Date(now.getTime() + 23 * HOUR);
  const reminderEnd = new Date(now.getTime() + 25 * HOUR);
  const reviewBefore = new Date(now.getTime() - 2 * HOUR);
  const reviewAfter = new Date(now.getTime() - 14 * DAY);

  return prisma.$transaction(async (tx) => {
    const appointmentsToRemind = await tx.appointment.findMany({
      where: {
        status: "CONFIRMED",
        reminderSentAt: null,
        startsAt: { gte: reminderStart, lte: reminderEnd },
      },
      select: {
        id: true,
        clientId: true,
        reference: true,
        startsAt: true,
      },
      take: 250,
    });

    let remindersCreated = 0;

    for (const appointment of appointmentsToRemind) {
      const claimed = await tx.appointment.updateMany({
        where: {
          id: appointment.id,
          status: "CONFIRMED",
          reminderSentAt: null,
        },
        data: { reminderSentAt: now },
      });

      if (claimed.count === 0) continue;

      const notification = appointmentReminderNotification({
        userId: appointment.clientId,
        reference: appointment.reference,
        startsAt: appointment.startsAt,
      });

      await tx.notification.create({
        data: {
          userId: notification.userId,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          actionUrl: notification.actionUrl ?? null,
          metadata: notification.metadata ?? undefined,
        },
      });

      remindersCreated += 1;
    }

    const appointmentsForReview = await tx.appointment.findMany({
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
      take: 250,
    });

    let reviewRequestsCreated = 0;

    for (const appointment of appointmentsForReview) {
      const claimed = await tx.appointment.updateMany({
        where: {
          id: appointment.id,
          status: "COMPLETED",
          reviewRequestSentAt: null,
          review: null,
        },
        data: { reviewRequestSentAt: now },
      });

      if (claimed.count === 0) continue;

      const notification = appointmentReviewRequestNotification({
        userId: appointment.clientId,
        reference: appointment.reference,
        startsAt: appointment.startsAt,
      });

      await tx.notification.create({
        data: {
          userId: notification.userId,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          actionUrl: notification.actionUrl ?? null,
          metadata: notification.metadata ?? undefined,
        },
      });

      reviewRequestsCreated += 1;
    }

    return {
      remindersCreated,
      reviewRequestsCreated,
    };
  });
}
