"use client";

import {
  useEffect,
  useRef,
} from "react";

import {
  useAdminNotifications,
  type AdminRealtimeNotification,
} from "./use-admin-notifications";

import {
  prependNotification,
  replaceNotification,
} from "../services/notifications-api";

import type {
  NotificationListItem,
} from "../types/notification.types";

export type UseNotificationRealtimeOptions = {
  enabled?: boolean;

  setNotifications: React.Dispatch<
    React.SetStateAction<
      NotificationListItem[]
    >
  >;

  setUnreadCount: React.Dispatch<
    React.SetStateAction<number>
  >;
};

export type UseNotificationRealtimeResult = {
  connected: boolean;
  reconnecting: boolean;
  reconnect: () => void;
};

function mapRealtimeNotification(
  notification: AdminRealtimeNotification,
): NotificationListItem {
  return {
    ...notification,

    createdAt:
      new Date(
        notification.createdAt,
      ),

    readAt:
      notification.readAt
        ? new Date(
            notification.readAt,
          )
        : null,
  };
}

export function useNotificationRealtime({
  enabled = true,
  setNotifications,
  setUnreadCount,
}: UseNotificationRealtimeOptions): UseNotificationRealtimeResult {
  const mountedRef =
    useRef(true);

  useEffect(() => {
    mountedRef.current =
      true;

    return () => {
      mountedRef.current =
        false;
    };
  }, []);

  const realtime =
    useAdminNotifications({
      enabled,

      onUnreadCountChange(
        unreadCount,
      ) {
        if (
          !mountedRef.current
        ) {
          return;
        }

        setUnreadCount(
          unreadCount,
        );
      },

      onNotification(
        notification,
      ) {
        if (
          !mountedRef.current
        ) {
          return;
        }

        const mapped =
          mapRealtimeNotification(
            notification,
          );

        setNotifications(
          (
            current,
          ) => {
            const existing =
              current.find(
                (item) =>
                  item.id ===
                  mapped.id,
              );

            if (
              existing
            ) {
              return replaceNotification(
                current,
                mapped,
              );
            }

            return prependNotification(
              current,
              mapped,
            );
          },
        );
      },
    });

  return {
    connected:
      realtime.connected,

    reconnecting:
      realtime.reconnecting,

    reconnect:
      realtime.reconnect,
  };
}
