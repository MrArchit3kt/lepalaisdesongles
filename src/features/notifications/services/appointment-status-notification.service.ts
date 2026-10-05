import { prisma } from "@/lib/prisma";
import type { NotificationKind } from "@/features/notifications/types/notification.types";
import {
  appointmentCancelledNotification,
  appointmentConfirmedNotification,
  appointmentRefusedNotification,
} from "@/features/notifications/utils/notification-helper";
import { sendPushToUser } from "@/features/push/services/push.service";

type SupportedStatus =
  | "CONFIRMED"
  | "REFUSED"
  | "CANCELLED_BY_ADMIN";

function typeForStatus(status: SupportedStatus): NotificationKind {
  if (status === "CONFIRMED") return "APPOINTMENT_CONFIRMED";
  if (status === "REFUSED") return "APPOINTMENT_REFUSED";
  return "APPOINTMENT_CANCELLED";
}

export async function notifyAppointmentStatusChange(
  appointmentId: string,
  status: SupportedStatus,
): Promise<boolean> {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    select: {
      clientId: true,
      reference: true,
      startsAt: true,
    },
  });

  if (!appointment) return false;

  const type = typeForStatus(status);

  const existing = await prisma.notification.findFirst({
    where: {
      userId: appointment.clientId,
      type,
      metadata: {
        path: ["appointmentReference"],
        equals: appointment.reference,
      },
    },
    select: { id: true },
  });

  if (existing) return false;

  const base = {
    userId: appointment.clientId,
    reference: appointment.reference,
    startsAt: appointment.startsAt,
  };

  const notification =
    status === "CONFIRMED"
      ? appointmentConfirmedNotification(base)
      : status === "REFUSED"
        ? appointmentRefusedNotification(base)
        : appointmentCancelledNotification(base);

  await prisma.notification.create({
    data: {
      userId: notification.userId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      actionUrl: notification.actionUrl ?? null,
      metadata: notification.metadata ?? undefined,
    },
  });

  if (status === "CONFIRMED") {
    void sendPushToUser(notification.userId, {
      title: notification.title,
      body: `${notification.message} Ajoute-le à ton agenda en un clic.`,
      url: notification.actionUrl ?? `/espace-client/rendez-vous/${appointment.reference}`,
    });
  }

  return true;
}
