"use client";

import { Bell } from "lucide-react";

import { NotificationItem } from "./notification-item";

import type {
  NotificationListItem,
} from "../types/notification.types";

export type NotificationListProps = {
  notifications: NotificationListItem[];

  loading?: boolean;

  processing?: boolean;

  onRead?: (
    id: string,
  ) => void;

  onUnread?: (
    id: string,
  ) => void;

  onDelete?: (
    id: string,
  ) => void;
};

export function NotificationList({
  notifications,
  loading = false,
  processing = false,
  onRead,
  onUnread,
  onDelete,
}: NotificationListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-3">

          <div className="size-8 animate-spin rounded-full border-2 border-rose-200 border-t-rose-500" />

          <p className="text-sm text-zinc-500">
            Chargement des notifications…
          </p>

        </div>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-12 text-center">

        <div className="grid size-14 place-items-center rounded-2xl bg-zinc-100 text-zinc-400">

          <Bell className="size-6" />

        </div>

        <h3 className="mt-4 text-base font-semibold text-zinc-900">
          Aucune notification
        </h3>

        <p className="mt-2 max-w-xs text-sm leading-6 text-zinc-500">
          Les nouvelles réservations, messages, avis et événements
          apparaîtront automatiquement ici.
        </p>

      </div>
    );
  }

  return (
    <div className="flex max-h-[500px] flex-col gap-3 overflow-y-auto p-3">

      {notifications.map(
        (
          notification,
        ) => (
          <NotificationItem
            key={
              notification.id
            }
            notification={
              notification
            }
            onRead={
              processing
                ? undefined
                : onRead
            }
            onUnread={
              processing
                ? undefined
                : onUnread
            }
            onDelete={
              processing
                ? undefined
                : onDelete
            }
          />
        ),
      )}

    </div>
  );
}
