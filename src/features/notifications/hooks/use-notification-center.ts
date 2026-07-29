"use client";

import { useMemo } from "react";

import {
  useNotificationActions,
} from "./use-notification-actions";

import {
  useNotificationLoader,
} from "./use-notification-loader";

import {
  useNotificationPagination,
} from "./use-notification-pagination";

import {
  useNotificationRealtime,
} from "./use-notification-realtime";

export type UseNotificationCenterOptions = {
  page?: number;
  pageSize?: number;
  unreadOnly?: boolean;
  realtime?: boolean;
};

export function useNotificationCenter(
  options: UseNotificationCenterOptions = {},
) {
  const loader =
    useNotificationLoader({
      page:
        options.page,
      pageSize:
        options.pageSize,
      unreadOnly:
        options.unreadOnly,
    });

  const pagination =
    useNotificationPagination({
      initialPage:
        loader.page,
      initialPageSize:
        loader.pageSize,
      totalPages:
        loader.totalPages,
    });

  const realtime =
    useNotificationRealtime({
      enabled:
        options.realtime ??
        true,

      setNotifications:
        loader.setNotifications,

      setUnreadCount:
        loader.setUnreadCount,
    });

  const actions =
    useNotificationActions({
      notifications:
        loader.notifications,

      setNotifications:
        loader.setNotifications,

      setUnreadCount:
        loader.setUnreadCount,
    });

  return useMemo(
    () => ({
      notifications:
        loader.notifications,

      unreadCount:
        loader.unreadCount,

      total:
        loader.total,

      totalPages:
        loader.totalPages,

      loading:
        loader.loading,

      refreshing:
        loader.refreshing,

      error:
        loader.error,      page:
        pagination.page,

      pageSize:
        pagination.pageSize,

      hasNextPage:
        pagination.hasNextPage,

      hasPreviousPage:
        pagination.hasPreviousPage,

      connected:
        realtime.connected,

      reconnecting:
        realtime.reconnecting,

      processing:
        actions.processing,

      reload:
        loader.reload,

      refresh:
        loader.refresh,

      reconnect:
        realtime.reconnect,

      setPage:
        pagination.setPage,

      setPageSize:
        pagination.setPageSize,

      nextPage:
        pagination.nextPage,

      previousPage:
        pagination.previousPage,

      firstPage:
        pagination.firstPage,

      lastPage:
        pagination.lastPage,

      markRead:
        actions.markRead,

      markUnread:
        actions.markUnread,

      remove:
        actions.remove,

      markAllRead:
        actions.markAllRead,

      removeRead:
        actions.removeRead,
    }),
    [
      loader.notifications,
      loader.unreadCount,
      loader.total,
      loader.totalPages,
      loader.loading,
      loader.refreshing,
      loader.error,
      loader.reload,
      loader.refresh,

      pagination.page,
      pagination.pageSize,
      pagination.hasNextPage,
      pagination.hasPreviousPage,
      pagination.setPage,
      pagination.setPageSize,
      pagination.nextPage,
      pagination.previousPage,
      pagination.firstPage,
      pagination.lastPage,

      realtime.connected,
      realtime.reconnecting,
      realtime.reconnect,

      actions.processing,
      actions.markRead,
      actions.markUnread,
      actions.remove,
      actions.markAllRead,
      actions.removeRead,
    ],
  );
}
