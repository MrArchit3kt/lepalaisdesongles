import type {
    NotificationListItem,
    NotificationListResult,
  } from "../types/notification.types";
  
  /* -------------------------------------------------------------------------- */
  /*                                   TYPES                                    */
  /* -------------------------------------------------------------------------- */
  
  export type NotificationQuery = {
    page?: number;
    pageSize?: number;
    unreadOnly?: boolean;
  };
  
  type NotificationUpdatePayload = {
    isRead: boolean;
  };
  
  type SuccessResponse = {
    success: true;
  };
  
  type ReadAllResponse = SuccessResponse & {
    updatedCount: number;
    unreadCount: number;
  };
  
  type DeleteReadResponse = SuccessResponse & {
    deletedCount: number;
  };
  
  /* -------------------------------------------------------------------------- */
  /*                                  HELPERS                                   */
  /* -------------------------------------------------------------------------- */
  
  async function parseResponse<T>(
    response: Response,
  ): Promise<T> {
    if (!response.ok) {
      let message =
        "Une erreur est survenue.";
  
      try {
        const body =
          (await response.json()) as {
            message?: string;
          };
  
        if (body.message) {
          message =
            body.message;
        }
      } catch {
        // Ignore
      }
  
      throw new Error(
        message,
      );
    }
  
    return response.json() as Promise<T>;
  }
  
  function buildQuery(
    query: NotificationQuery,
  ): string {
    const params =
      new URLSearchParams();
  
    if (query.page) {
      params.set(
        "page",
        String(query.page),
      );
    }
  
    if (query.pageSize) {
      params.set(
        "pageSize",
        String(
          query.pageSize,
        ),
      );
    }
  
    if (
      query.unreadOnly
    ) {
      params.set(
        "unreadOnly",
        "true",
      );
    }
  
    const value =
      params.toString();
  
    return value
      ? `?${value}`
      : "";
  }
  
  /* -------------------------------------------------------------------------- */
  /*                                   API                                      */
  /* -------------------------------------------------------------------------- */
  
  export async function fetchNotifications(
    query: NotificationQuery = {},
  ): Promise<NotificationListResult> {
    const response =
      await fetch(
        `/api/admin/notifications${buildQuery(
          query,
        )}`,
        {
          credentials:
            "include",
          cache:
            "no-store",
        },
      );
  
    return parseResponse<
      NotificationListResult
    >(response);
  }
  
  export async function markNotificationRead(
    id: string,
  ): Promise<void> {
    const response =
      await fetch(
        `/api/admin/notifications/${id}`,
        {
          method:
            "PATCH",
  
          credentials:
            "include",
  
          headers: {
            "Content-Type":
              "application/json",
          },
  
          body: JSON.stringify(
            {
              isRead: true,
            } satisfies NotificationUpdatePayload,
          ),
        },
      );
  
    await parseResponse<SuccessResponse>(
      response,
    );
  }
  
  export async function markNotificationUnread(
    id: string,
  ): Promise<void> {
    const response =
      await fetch(
        `/api/admin/notifications/${id}`,
        {
          method:
            "PATCH",
  
          credentials:
            "include",
  
          headers: {
            "Content-Type":
              "application/json",
          },
  
          body: JSON.stringify(
            {
              isRead: false,
            } satisfies NotificationUpdatePayload,
          ),
        },
      );
  
    await parseResponse<SuccessResponse>(
      response,
    );
  }
  
  export async function deleteNotificationById(
    id: string,
  ): Promise<void> {
    const response =
      await fetch(
        `/api/admin/notifications/${id}`,
        {
          method:
            "DELETE",
  
          credentials:
            "include",
        },
      );
  
    await parseResponse<SuccessResponse>(
      response,
    );
  }
  
  export async function markAllNotificationsRead(): Promise<number> {
    const response =
      await fetch(
        "/api/admin/notifications/read-all",
        {
          method:
            "POST",
  
          credentials:
            "include",
        },
      );
  
    const result =
      await parseResponse<ReadAllResponse>(
        response,
      );
  
    return result.updatedCount;
  }
  
  export async function deleteReadNotifications(): Promise<number> {
    const response =
      await fetch(
        "/api/admin/notifications/delete-read",
        {
          method:
            "DELETE",
  
          credentials:
            "include",
        },
      );
  
    const result =
      await parseResponse<DeleteReadResponse>(
        response,
      );
  
    return result.deletedCount;
  }
  
  /* -------------------------------------------------------------------------- */
  /*                          HELPERS POUR LE STATE                             */
  /* -------------------------------------------------------------------------- */
  
  export function sortNotifications(
    notifications: NotificationListItem[],
  ): NotificationListItem[] {
    return [...notifications].sort(
      (a, b) => {
        const dateDiff =
          new Date(
            b.createdAt,
          ).getTime() -
          new Date(
            a.createdAt,
          ).getTime();
  
        if (
          dateDiff !== 0
        ) {
          return dateDiff;
        }
  
        return b.id.localeCompare(
          a.id,
        );
      },
    );
  }
  
  export function replaceNotification(
    notifications: NotificationListItem[],
    notification: NotificationListItem,
  ): NotificationListItem[] {
    return notifications.map(
      (current) =>
        current.id ===
        notification.id
          ? notification
          : current,
    );
  }
  
  export function removeNotification(
    notifications: NotificationListItem[],
    id: string,
  ): NotificationListItem[] {
    return notifications.filter(
      (notification) =>
        notification.id !==
        id,
    );
  }
  
  export function prependNotification(
    notifications: NotificationListItem[],
    notification: NotificationListItem,
  ): NotificationListItem[] {
    return sortNotifications(
      [
        notification,
        ...notifications.filter(
          (current) =>
            current.id !==
            notification.id,
        ),
      ],
    );
  }