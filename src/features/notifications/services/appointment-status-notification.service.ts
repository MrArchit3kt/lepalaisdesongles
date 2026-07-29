import { prisma } from "@/lib/prisma";
import type { NotificationKind } from "@/features/notifications/types/notification.types";
import {
  appointmentCancelledNotification,
  appointmentConfirmedNotification,
  appointmentRefusedNotification,
} from "@/features/notifications/utils/notification-helper";

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

  return true;
}
