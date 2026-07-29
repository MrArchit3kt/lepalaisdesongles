"use client";

import {
  useCallback,
  useState,
} from "react";

import {
  deleteNotificationById,
  deleteReadNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  markNotificationUnread,
  removeNotification,
} from "../services/notifications-api";

import type {
  NotificationListItem,
} from "../types/notification.types";

export type UseNotificationActionsOptions = {
  notifications: NotificationListItem[];

  setNotifications: React.Dispatch<
    React.SetStateAction<
      NotificationListItem[]
    >
  >;

  setUnreadCount: React.Dispatch<
    React.SetStateAction<number>
  >;
};

export type UseNotificationActionsResult = {
  processing: boolean;

  markRead: (
    id: string,
  ) => Promise<void>;

  markUnread: (
    id: string,
  ) => Promise<void>;

  remove: (
    id: string,
  ) => Promise<void>;

  markAllRead: () => Promise<void>;

  removeRead: () => Promise<void>;
};

export function useNotificationActions({
  notifications,
  setNotifications,
  setUnreadCount,
}: UseNotificationActionsOptions): UseNotificationActionsResult {
  const [
    processing,
    setProcessing,
  ] = useState(false);

  const markRead =
    useCallback(
      async (
        id: string,
      ) => {
        setProcessing(
          true,
        );

        try {
          await markNotificationRead(
            id,
          );

          setNotifications(
            (
              current,
            ) =>
              current.map(
                (
                  notification,
                ) => {
                  if (
                    notification.id !==
                    id
                  ) {
                    return notification;
                  }

                  return {
                    ...notification,
                    isRead: true,
                    readAt:
                      new Date(),
                  };
                },
              ),
          );

          setUnreadCount(
            (
              current,
            ) =>
              Math.max(
                0,
                current - 1,
              ),
          );
        } finally {
          setProcessing(
            false,
          );
        }
      },
      [
        setNotifications,
        setUnreadCount,
      ],
    );

  const markUnread =
    useCallback(
      async (
        id: string,
      ) => {
        setProcessing(
          true,
        );

        try {
          await markNotificationUnread(
            id,
          );

          setNotifications(
            (
              current,
            ) =>
              current.map(
                (
                  notification,
                ) => {
                  if (
                    notification.id !==
                    id
                  ) {
                    return notification;
                  }

                  return {
                    ...notification,
                    isRead: false,
                    readAt:
                      null,
                  };
                },
              ),
          );

          setUnreadCount(
            (
              current,
            ) => current + 1,
          );
        } finally {
          setProcessing(
            false,
          );
        }
      },
      [
        setNotifications,
        setUnreadCount,
      ],
    );

  const remove =
    useCallback(
      async (
        id: string,
      ) => {
        setProcessing(
          true,
        );

        try {
          const notification =
            notifications.find(
              (item) =>
                item.id === id,
            );

          await deleteNotificationById(
            id,
          );

          setNotifications(
            (current) =>
              removeNotification(
                current,
                id,
              ),
          );

          if (
            notification &&
            !notification.isRead
          ) {
            setUnreadCount(
              (current) =>
                Math.max(
                  0,
                  current - 1,
                ),
            );
          }
        } finally {
          setProcessing(
            false,
          );
        }
      },
      [
        notifications,
        setNotifications,
        setUnreadCount,
      ],
    );

  const markAllRead =
    useCallback(
      async () => {
        setProcessing(
          true,
        );

        try {
          await markAllNotificationsRead();

          const now =
            new Date();

          setNotifications(
            (current) =>
              current.map(
                (
                  notification,
                ) => ({
                  ...notification,
                  isRead: true,
                  readAt:
                    now,
                }),
              ),
          );

          setUnreadCount(
            0,
          );
        } finally {
          setProcessing(
            false,
          );
        }
      },
      [
        setNotifications,
        setUnreadCount,
      ],
    );

  const removeRead =
    useCallback(
      async () => {
        setProcessing(
          true,
        );

        try {
          await deleteReadNotifications();

          setNotifications(
            (current) =>
              current.filter(
                (
                  notification,
                ) =>
                  !notification.isRead,
              ),
          );
        } finally {
          setProcessing(
            false,
          );
        }
      },
      [
        setNotifications,
      ],
    );

  return {
    processing,
    markRead,
    markUnread,
    remove,
    markAllRead,
    removeRead,
  };
}
