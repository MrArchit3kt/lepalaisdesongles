"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  fetchNotifications,
} from "../services/notifications-api";

import type {
  NotificationListItem,
  NotificationListResult,
} from "../types/notification.types";

export type UseNotificationLoaderOptions = {
  page?: number;
  pageSize?: number;
  unreadOnly?: boolean;
  enabled?: boolean;
};

export type UseNotificationLoaderResult = {
  notifications: NotificationListItem[];
  unreadCount: number;
  total: number;
  totalPages: number;
  page: number;
  pageSize: number;
  loading: boolean;
  refreshing: boolean;
  error: Error | null;
  reload: () => Promise<void>;
  refresh: () => Promise<void>;
  setNotifications: React.Dispatch<
    React.SetStateAction<NotificationListItem[]>
  >;
  setUnreadCount: React.Dispatch<
    React.SetStateAction<number>
  >;
};

const DEFAULT_OPTIONS: Required<
  UseNotificationLoaderOptions
> = {
  page: 1,
  pageSize: 20,
  unreadOnly: false,
  enabled: true,
};

export function useNotificationLoader(
  options: UseNotificationLoaderOptions = {},
): UseNotificationLoaderResult {
  const {
    page,
    pageSize,
    unreadOnly,
    enabled,
  } = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  const mountedRef =
    useRef(false);

  const loadingRef =
    useRef(false);

  const [
    notifications,
    setNotifications,
  ] = useState<
    NotificationListItem[]
  >([]);

  const [
    unreadCount,
    setUnreadCount,
  ] = useState(0);

  const [
    total,
    setTotal,
  ] = useState(0);

  const [
    totalPages,
    setTotalPages,
  ] = useState(1);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<Error | null>(
    null,
  );

  const applyResult =
    useCallback(
      (
        result: NotificationListResult,
      ) => {
        if (
          !mountedRef.current
        ) {
          return;
        }

        setNotifications(
          result.items.map(
            (
              notification,
            ) => ({
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
            }),
          ),
        );

        setUnreadCount(
          result.unreadCount,
        );

        setTotal(
          result.total,
        );

        setTotalPages(
          result.totalPages,
        );
      },
      [],
    );

  const load =
    useCallback(
      async (
        refresh = false,
      ) => {
        if (
          loadingRef.current ||
          !enabled
        ) {
          return;
        }

        loadingRef.current =
          true;

        setError(null);

        if (
          refresh
        ) {
          setRefreshing(
            true,
          );
        } else {
          setLoading(
            true,
          );
        }

        try {
          const result =
            await fetchNotifications(
              {
                page,
                pageSize,
                unreadOnly,
              },
            );

          applyResult(
            result,
          );
        } catch (err) {
          if (mountedRef.current) {
            setError(
              err instanceof Error
                ? err
                : new Error(
                    "Impossible de charger les notifications.",
                  ),
            );
          }
        } finally {
          loadingRef.current =
            false;

          if (
            mountedRef.current
          ) {
            setLoading(
              false,
            );

            setRefreshing(
              false,
            );
          }
        }
      },
      [
        applyResult,
        enabled,
        page,
        pageSize,
        unreadOnly,
      ],
    );

  const reload =
    useCallback(
      async () => {
        await load(
          false,
        );
      },
      [load],
    );

  const refresh =
    useCallback(
      async () => {
        await load(
          true,
        );
      },
      [load],
    );

  useEffect(() => {
    mountedRef.current =
      true;

    return () => {
      mountedRef.current =
        false;
    };
  }, []);

  useEffect(() => {
    if (
      !enabled
    ) {
      return;
    }

    const timeoutId =
      window.setTimeout(
        () => {
          void load(
            false,
          );
        },
        0,
      );

    return () => {
      window.clearTimeout(
        timeoutId,
      );
    };
  }, [
    enabled,
    load,
  ]);

  return {
    notifications,
    unreadCount,
    total,
    totalPages,
    page,
    pageSize,
    loading,
    refreshing,
    error,
    reload,
    refresh,
    setNotifications,
    setUnreadCount,
  };
}
