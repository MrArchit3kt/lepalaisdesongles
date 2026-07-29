import { prisma } from "@/lib/prisma";

import type {
  CreateNotificationInput,
  NotificationJsonValue,
  NotificationListInput,
  NotificationListItem,
  NotificationListResult,
} from "../types/notification.types";

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

function normalizePage(value: number | undefined): number {
  if (!value || !Number.isFinite(value)) {
    return 1;
  }

  return Math.max(1, Math.trunc(value));
}

function normalizePageSize(
  value: number | undefined,
): number {
  if (!value || !Number.isFinite(value)) {
    return DEFAULT_PAGE_SIZE;
  }

  return Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, Math.trunc(value)),
  );
}

function normalizeRequiredText(
  value: string,
  fieldName: string,
  maxLength: number,
): string {
  const normalized = value.trim();

  if (!normalized) {
    throw new Error(`${fieldName} est obligatoire.`);
  }

  if (normalized.length > maxLength) {
    throw new Error(
      `${fieldName} ne doit pas dépasser ${maxLength} caractères.`,
    );
  }

  return normalized;
}

function normalizeActionUrl(
  value: string | null | undefined,
): string | null {
  if (value == null) {
    return null;
  }

  const normalized = value.trim();

  if (!normalized) {
    return null;
  }

  if (
    !normalized.startsWith("/") &&
    !normalized.startsWith("https://") &&
    !normalized.startsWith("http://")
  ) {
    throw new Error(
      "L’URL d’action doit être interne ou commencer par http:// ou https://.",
    );
  }

  return normalized;
}

function mapNotification(
  notification: {
    id: string;
    type: string;
    title: string;
    message: string;
    actionUrl: string | null;
    metadata: unknown;
    readAt: Date | null;
    createdAt: Date;
  },
): NotificationListItem {
  return {
    id: notification.id,
    type:
      notification.type as NotificationListItem["type"],
    title: notification.title,
    message: notification.message,
    actionUrl: notification.actionUrl,
    metadata:
      (notification.metadata as NotificationJsonValue | null) ??
      null,
    readAt: notification.readAt,
    createdAt: notification.createdAt,
    isRead: notification.readAt !== null,
  };
}

export async function createNotification(
  input: CreateNotificationInput,
): Promise<NotificationListItem> {
  const userId = normalizeRequiredText(
    input.userId,
    "L’identifiant utilisateur",
    191,
  );

  const title = normalizeRequiredText(
    input.title,
    "Le titre",
    160,
  );

  const message = normalizeRequiredText(
    input.message,
    "Le message",
    1_000,
  );

  const userExists = await prisma.user.count({
    where: {
      id: userId,
    },
  });

  if (userExists === 0) {
    throw new Error(
      "Impossible de créer la notification : utilisateur introuvable.",
    );
  }

  const notification =
    await prisma.notification.create({
      data: {
        userId,
        type: input.type,
        title,
        message,
        actionUrl: normalizeActionUrl(
          input.actionUrl,
        ),
        metadata: input.metadata ?? undefined,
      },
      select: {
        id: true,
        type: true,
        title: true,
        message: true,
        actionUrl: true,
        metadata: true,
        readAt: true,
        createdAt: true,
      },
    });

  return mapNotification(notification);
}

export async function createNotifications(
  inputs: CreateNotificationInput[],
): Promise<number> {
  if (inputs.length === 0) {
    return 0;
  }

  const result =
    await prisma.notification.createMany({
      data: inputs.map((input) => ({
        userId: normalizeRequiredText(
          input.userId,
          "L’identifiant utilisateur",
          191,
        ),
        type: input.type,
        title: normalizeRequiredText(
          input.title,
          "Le titre",
          160,
        ),
        message: normalizeRequiredText(
          input.message,
          "Le message",
          1_000,
        ),
        actionUrl: normalizeActionUrl(
          input.actionUrl,
        ),
        metadata: input.metadata ?? undefined,
      })),
    });

  return result.count;
}

export async function listNotifications(
  input: NotificationListInput,
): Promise<NotificationListResult> {
  const userId = normalizeRequiredText(
    input.userId,
    "L’identifiant utilisateur",
    191,
  );

  const page = normalizePage(input.page);
  const pageSize = normalizePageSize(
    input.pageSize,
  );

  const where = {
    userId,
    ...(input.unreadOnly
      ? {
          readAt: null,
        }
      : {}),
  };

  const [notifications, total, unreadCount] =
    await prisma.$transaction([
      prisma.notification.findMany({
        where,
        orderBy: [
          {
            createdAt: "desc",
          },
          {
            id: "desc",
          },
        ],
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          type: true,
          title: true,
          message: true,
          actionUrl: true,
          metadata: true,
          readAt: true,
          createdAt: true,
        },
      }),
      prisma.notification.count({
        where,
      }),
      prisma.notification.count({
        where: {
          userId,
          readAt: null,
        },
      }),
    ]);

  return {
    items: notifications.map(mapNotification),
    total,
    unreadCount,
    page,
    pageSize,
    totalPages: Math.max(
      1,
      Math.ceil(total / pageSize),
    ),
  };
}

export async function getUnreadNotificationCount(
  userId: string,
): Promise<number> {
  return prisma.notification.count({
    where: {
      userId: normalizeRequiredText(
        userId,
        "L’identifiant utilisateur",
        191,
      ),
      readAt: null,
    },
  });
}

export async function markNotificationAsRead(
  userId: string,
  notificationId: string,
): Promise<boolean> {
  const result =
    await prisma.notification.updateMany({
      where: {
        id: normalizeRequiredText(
          notificationId,
          "L’identifiant de notification",
          191,
        ),
        userId: normalizeRequiredText(
          userId,
          "L’identifiant utilisateur",
          191,
        ),
        readAt: null,
      },
      data: {
        readAt: new Date(),
      },
    });

  return result.count > 0;
}

export async function markNotificationAsUnread(
  userId: string,
  notificationId: string,
): Promise<boolean> {
  const result =
    await prisma.notification.updateMany({
      where: {
        id: normalizeRequiredText(
          notificationId,
          "L’identifiant de notification",
          191,
        ),
        userId: normalizeRequiredText(
          userId,
          "L’identifiant utilisateur",
          191,
        ),
        readAt: {
          not: null,
        },
      },
      data: {
        readAt: null,
      },
    });

  return result.count > 0;
}

export async function markAllNotificationsAsRead(
  userId: string,
): Promise<number> {
  const result =
    await prisma.notification.updateMany({
      where: {
        userId: normalizeRequiredText(
          userId,
          "L’identifiant utilisateur",
          191,
        ),
        readAt: null,
      },
      data: {
        readAt: new Date(),
      },
    });

  return result.count;
}

export async function deleteNotification(
  userId: string,
  notificationId: string,
): Promise<boolean> {
  const result =
    await prisma.notification.deleteMany({
      where: {
        id: normalizeRequiredText(
          notificationId,
          "L’identifiant de notification",
          191,
        ),
        userId: normalizeRequiredText(
          userId,
          "L’identifiant utilisateur",
          191,
        ),
      },
    });

  return result.count > 0;
}

export async function deleteAllReadNotifications(
  userId: string,
): Promise<number> {
  const result =
    await prisma.notification.deleteMany({
      where: {
        userId: normalizeRequiredText(
          userId,
          "L’identifiant utilisateur",
          191,
        ),
        readAt: {
          not: null,
        },
      },
    });

  return result.count;
}
