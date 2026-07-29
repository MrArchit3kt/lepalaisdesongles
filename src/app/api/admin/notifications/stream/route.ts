import type {
  NotificationType,
} from "@/generated/prisma/client";

import {
  prisma,
} from "@/lib/prisma";

import {
  requireAdminUser,
} from "@/lib/session";

/* -------------------------------------------------------------------------- */
/*                                CONFIGURATION                               */
/* -------------------------------------------------------------------------- */

export const dynamic =
  "force-dynamic";

export const runtime =
  "nodejs";

const POLLING_INTERVAL_MS =
  4_000;

const HEARTBEAT_INTERVAL_MS =
  20_000;

const MAX_NOTIFICATIONS_PER_POLL =
  50;

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

type NotificationStreamItem = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  actionUrl: string | null;
  metadata: unknown;
  readAt: Date | null;
  createdAt: Date;
};

type StreamCursor = {
  id: string;
  createdAt: Date;
};

/* -------------------------------------------------------------------------- */
/*                                  HELPERS                                   */
/* -------------------------------------------------------------------------- */

function serializeNotification(
  notification: NotificationStreamItem,
) {
  return {
    id:
      notification.id,

    type:
      notification.type,

    title:
      notification.title,

    message:
      notification.message,

    actionUrl:
      notification.actionUrl,

    metadata:
      notification.metadata,

    readAt:
      notification.readAt?.toISOString() ??
      null,

    createdAt:
      notification.createdAt.toISOString(),

    isRead:
      notification.readAt !== null,
  };
}

function createSseMessage(input: {
  event: string;
  data: unknown;
  id?: string;
}): string {
  const lines: string[] = [];

  if (input.id) {
    lines.push(
      `id: ${input.id}`,
    );
  }

  lines.push(
    `event: ${input.event}`,
  );

  const serialized =
    JSON.stringify(
      input.data,
    );

  for (
    const line of serialized.split(
      "\n",
    )
  ) {
    lines.push(
      `data: ${line}`,
    );
  }

  lines.push(
    "",
    "",
  );

  return lines.join(
    "\n",
  );
}

async function getInitialCursor(
  userId: string,
  lastEventId: string | null,
): Promise<StreamCursor | null> {
  if (lastEventId) {
    const previousNotification =
      await prisma.notification.findFirst(
        {
          where: {
            id: lastEventId,
            userId,
          },

          select: {
            id: true,
            createdAt: true,
          },
        },
      );

    if (previousNotification) {
      return previousNotification;
    }
  }

  return prisma.notification.findFirst(
    {
      where: {
        userId,
      },

      orderBy: [
        {
          createdAt:
            "desc",
        },
        {
          id:
            "desc",
        },
      ],

      select: {
        id: true,
        createdAt: true,
      },
    },
  );
}

async function findNotificationsAfterCursor(
  userId: string,
  cursor: StreamCursor | null,
): Promise<NotificationStreamItem[]> {
  return prisma.notification.findMany(
    {
      where: {
        userId,

        ...(cursor
          ? {
              OR: [
                {
                  createdAt: {
                    gt:
                      cursor.createdAt,
                  },
                },
                {
                  createdAt:
                    cursor.createdAt,

                  id: {
                    gt:
                      cursor.id,
                  },
                },
              ],
            }
          : {}),
      },

      orderBy: [
        {
          createdAt:
            "asc",
        },
        {
          id:
            "asc",
        },
      ],

      take:
        MAX_NOTIFICATIONS_PER_POLL,

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
    },
  );
}

/* -------------------------------------------------------------------------- */
/*                                    GET                                     */
/* -------------------------------------------------------------------------- */

export async function GET(
  request: Request,
): Promise<Response> {
  const user =
    await requireAdminUser();

  const encoder =
    new TextEncoder();

  const lastEventId =
    request.headers.get(
      "last-event-id",
    );

  const initialCursor =
    await getInitialCursor(
      user.id,
      lastEventId,
    );

  const stream =
    new ReadableStream<Uint8Array>(
      {
        start(controller) {
          let closed =
            false;

          let polling =
            false;

          let cursor:
            | StreamCursor
            | null =
            initialCursor;

          let pollTimer:
            | ReturnType<typeof setInterval>
            | null =
            null;

          let heartbeatTimer:
            | ReturnType<typeof setInterval>
            | null =
            null;

          function enqueue(
            value: string,
          ): void {
            if (closed) {
              return;
            }

            try {
              controller.enqueue(
                encoder.encode(
                  value,
                ),
              );
            } catch {
              close();
            }
          }

          function close(): void {
            if (closed) {
              return;
            }

            closed =
              true;

            if (pollTimer) {
              clearInterval(
                pollTimer,
              );
            }

            if (
              heartbeatTimer
            ) {
              clearInterval(
                heartbeatTimer,
              );
            }

            try {
              controller.close();
            } catch {
              // Le flux est déjà fermé.
            }
          }

          async function sendUnreadCount(): Promise<void> {
            const unreadCount =
              await prisma.notification.count(
                {
                  where: {
                    userId:
                      user.id,

                    readAt:
                      null,
                  },
                },
              );

            enqueue(
              createSseMessage(
                {
                  event:
                    "unread-count",

                  data: {
                    unreadCount,
                  },
                },
              ),
            );
          }

          async function poll(): Promise<void> {
            if (
              polling ||
              closed
            ) {
              return;
            }

            polling =
              true;

            try {
              const notifications =
                await findNotificationsAfterCursor(
                  user.id,
                  cursor,
                );

              for (
                const notification of notifications
              ) {
                enqueue(
                  createSseMessage(
                    {
                      id:
                        notification.id,

                      event:
                        "notification",

                      data:
                        serializeNotification(
                          notification,
                        ),
                    },
                  ),
                );

                cursor = {
                  id:
                    notification.id,

                  createdAt:
                    notification.createdAt,
                };
              }

              if (
                notifications.length >
                0
              ) {
                await sendUnreadCount();
              }
            } catch (
              error: unknown
            ) {
              console.error(
                "[SSE admin notifications]",
                error,
              );

              enqueue(
                createSseMessage(
                  {
                    event:
                      "stream-error",

                    data: {
                      message:
                        "Une erreur est survenue pendant la synchronisation.",
                    },
                  },
                ),
              );
            } finally {
              polling =
                false;
            }
          }

          enqueue(
            "retry: 3000\n\n",
          );

          enqueue(
            createSseMessage(
              {
                event:
                  "connected",

                data: {
                  connected:
                    true,

                  timestamp:
                    new Date().toISOString(),
                },
              },
            ),
          );

          void sendUnreadCount();

          pollTimer =
            setInterval(
              () => {
                void poll();
              },
              POLLING_INTERVAL_MS,
            );

          heartbeatTimer =
            setInterval(
              () => {
                enqueue(
                  `: heartbeat ${new Date().toISOString()}\n\n`,
                );
              },
              HEARTBEAT_INTERVAL_MS,
            );

          request.signal.addEventListener(
            "abort",
            close,
            {
              once: true,
            },
          );
        },

        cancel() {
          // La fermeture est également traitée
          // par le signal d'abandon de la requête.
        },
      },
    );

  return new Response(
    stream,
    {
      status:
        200,

      headers: {
        "Content-Type":
          "text/event-stream; charset=utf-8",

        "Cache-Control":
          "no-cache, no-transform",

        Connection:
          "keep-alive",

        "X-Accel-Buffering":
          "no",
      },
    },
  );
}
