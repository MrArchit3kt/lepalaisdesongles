"use client";

import {
  useCallback,
  useMemo,
  useState,
} from "react";

export type UseNotificationPaginationOptions = {
  initialPage?: number;
  initialPageSize?: number;
  totalPages?: number;
};

export type UseNotificationPaginationResult = {
  page: number;
  pageSize: number;
  totalPages: number;

  hasNextPage: boolean;
  hasPreviousPage: boolean;

  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;

  nextPage: () => void;
  previousPage: () => void;
  firstPage: () => void;
  lastPage: () => void;
};

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;

export function useNotificationPagination({
  initialPage = DEFAULT_PAGE,
  initialPageSize = DEFAULT_PAGE_SIZE,
  totalPages: totalPagesProp = 1,
}: UseNotificationPaginationOptions = {}): UseNotificationPaginationResult {
  const [
    page,
    setPageState,
  ] = useState(
    Math.max(
      1,
      initialPage,
    ),
  );

  const [
    pageSize,
    setPageSizeState,
  ] = useState(
    Math.max(
      1,
      initialPageSize,
    ),
  );

  const totalPages =
    useMemo(
      () =>
        Math.max(
          1,
          totalPagesProp,
        ),
      [totalPagesProp],
    );

  const hasNextPage =
    page < totalPages;

  const hasPreviousPage =
    page > 1;

  const setPage =
    useCallback(
      (
        value: number,
      ) => {
        setPageState(
          Math.min(
            totalPages,
            Math.max(
              1,
              Math.trunc(
                value,
              ),
            ),
          ),
        );
      },
      [
        totalPages,
      ],
    );

  const setPageSize =
    useCallback(
      (
        value: number,
      ) => {
        setPageSizeState(
          Math.max(
            1,
            Math.trunc(
              value,
            ),
          ),
        );

        setPageState(
          1,
        );
      },
      [],
    );

  const nextPage =
    useCallback(
      () => {
        setPageState(
          (
            current,
          ) =>
            Math.min(
              totalPages,
              current + 1,
            ),
        );
      },
      [
        totalPages,
      ],
    );

  const previousPage =
    useCallback(
      () => {
        setPageState(
          (
            current,
          ) =>
            Math.max(
              1,
              current - 1,
            ),
        );
      },
      [],
    );

  const firstPage =
    useCallback(
      () => {
        setPageState(
          1,
        );
      },
      [],
    );

  const lastPage =
    useCallback(
      () => {
        setPageState(
          totalPages,
        );
      },
      [
        totalPages,
      ],
    );

  return {
    page,
    pageSize,
    totalPages,

    hasNextPage,
    hasPreviousPage,

    setPage,
    setPageSize,

    nextPage,
    previousPage,
    firstPage,
    lastPage,
  };
}
