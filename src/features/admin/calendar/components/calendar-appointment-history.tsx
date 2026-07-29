"use client";

import {
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  Clock3,
  LoaderCircle,
  MessageSquareText,
  RefreshCw,
  UserRound,
  XCircle,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useState,
} from "react";

type HistoryColor =
  | "green"
  | "red"
  | "blue"
  | "amber"
  | "gray";

type HistoryItem = {
  id: string;
  title: string;
  description: string | null;
  createdAt: string;
  author: string | null;
  color: HistoryColor;
};

type CalendarAppointmentHistoryProps = {
  reference: string;
  refreshKey?: number;
};

type UnknownRecord = Record<
  string,
  unknown
>;

const iconMap = {
  green: CheckCircle2,
  red: XCircle,
  blue: CalendarDays,
  amber: CircleAlert,
  gray: Clock3,
} as const;

const iconClassMap = {
  green:
    "bg-emerald-100 text-emerald-700 ring-emerald-200",
  red:
    "bg-red-100 text-red-700 ring-red-200",
  blue:
    "bg-blue-100 text-blue-700 ring-blue-200",
  amber:
    "bg-amber-100 text-amber-700 ring-amber-200",
  gray:
    "bg-zinc-100 text-zinc-600 ring-zinc-200",
} as const;

function isRecord(
  value: unknown,
): value is UnknownRecord {
  return (
    typeof value ===
      "object" &&
    value !== null &&
    !Array.isArray(
      value,
    )
  );
}

function getString(
  record: UnknownRecord,
  keys: string[],
): string | null {
  for (const key of keys) {
    const value =
      record[key];

    if (
      typeof value ===
        "string" &&
      value.trim()
    ) {
      return value.trim();
    }
  }

  return null;
}

function getNestedAuthor(
  record: UnknownRecord,
): string | null {
  const directAuthor =
    getString(
      record,
      [
        "author",
        "authorName",
        "createdByName",
        "userName",
        "staffName",
      ],
    );

  if (directAuthor) {
    return directAuthor;
  }

  const possibleObjects = [
    record.user,
    record.authorUser,
    record.createdBy,
    record.staff,
    record.employee,
  ];

  for (
    const candidate of
    possibleObjects
  ) {
    if (
      !isRecord(
        candidate,
      )
    ) {
      continue;
    }

    const name =
      getString(
        candidate,
        [
          "displayName",
          "fullName",
          "name",
          "email",
        ],
      );

    if (name) {
      return name;
    }

    const firstName =
      getString(
        candidate,
        [
          "firstName",
          "firstname",
        ],
      );

    const lastName =
      getString(
        candidate,
        [
          "lastName",
          "lastname",
        ],
      );

    const fullName = [
      firstName,
      lastName,
    ]
      .filter(Boolean)
      .join(" ")
      .trim();

    if (fullName) {
      return fullName;
    }
  }

  return null;
}

function resolveColor(
  record: UnknownRecord,
): HistoryColor {
  const source = [
    getString(
      record,
      [
        "color",
        "type",
        "action",
        "status",
        "eventType",
      ],
    ),
    getString(
      record,
      [
        "title",
        "label",
      ],
    ),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (
    source.includes(
      "cancel",
    ) ||
    source.includes(
      "refus",
    ) ||
    source.includes(
      "no_show",
    ) ||
    source.includes(
      "absent",
    )
  ) {
    return "red";
  }

  if (
    source.includes(
      "confirm",
    ) ||
    source.includes(
      "termin",
    ) ||
    source.includes(
      "complete",
    ) ||
    source.includes(
      "pay",
    )
  ) {
    return "green";
  }

  if (
    source.includes(
      "move",
    ) ||
    source.includes(
      "déplac",
    ) ||
    source.includes(
      "date",
    ) ||
    source.includes(
      "calendar",
    ) ||
    source.includes(
      "cré",
    )
  ) {
    return "blue";
  }

  if (
    source.includes(
      "warning",
    ) ||
    source.includes(
      "attente",
    ) ||
    source.includes(
      "pending",
    ) ||
    source.includes(
      "démarr",
    )
  ) {
    return "amber";
  }

  return "gray";
}

function normalizeHistoryItem(
  value: unknown,
  index: number,
): HistoryItem | null {
  if (
    !isRecord(
      value,
    )
  ) {
    return null;
  }

  const createdAt =
    getString(
      value,
      [
        "createdAt",
        "date",
        "occurredAt",
        "timestamp",
        "updatedAt",
      ],
    );

  if (!createdAt) {
    return null;
  }

  const title =
    getString(
      value,
      [
        "title",
        "label",
        "actionLabel",
        "message",
        "action",
        "type",
      ],
    ) ??
    "Modification du rendez-vous";

  const description =
    getString(
      value,
      [
        "description",
        "details",
        "comment",
        "reason",
        "adminComment",
        "metadata",
      ],
    );

  const id =
    getString(
      value,
      [
        "id",
        "historyId",
      ],
    ) ??
    `${createdAt}-${index}`;

  return {
    id,
    title,
    description,
    createdAt,
    author:
      getNestedAuthor(
        value,
      ),
    color:
      resolveColor(
        value,
      ),
  };
}

function extractHistory(
  payload: unknown,
): HistoryItem[] {
  let values: unknown[] =
    [];

  if (
    Array.isArray(
      payload,
    )
  ) {
    values = payload;
  } else if (
    isRecord(
      payload,
    )
  ) {
    const candidates = [
      payload.timeline,
      payload.history,
      payload.items,
      payload.events,
      payload.data,
    ];

    const arrayCandidate =
      candidates.find(
        Array.isArray,
      );

    if (
      Array.isArray(
        arrayCandidate,
      )
    ) {
      values =
        arrayCandidate;
    }
  }

  return values
    .map(
      normalizeHistoryItem,
    )
    .filter(
      (
        item,
      ): item is HistoryItem =>
        item !== null,
    )
    .sort(
      (
        first,
        second,
      ) =>
        new Date(
          second.createdAt,
        ).getTime() -
        new Date(
          first.createdAt,
        ).getTime(),
    );
}

function formatDate(
  value: string,
) {
  const date =
    new Date(
      value,
    );

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "fr-FR",
    {
      dateStyle:
        "medium",
      timeStyle:
        "short",
    },
  ).format(
    date,
  );
}

export function CalendarAppointmentHistory({
  reference,
  refreshKey = 0,
}: CalendarAppointmentHistoryProps) {
  const [
    history,
    setHistory,
  ] =
    useState<HistoryItem[]>(
      [],
    );

  const [
    loading,
    setLoading,
  ] =
    useState(
      true,
    );

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null,
    );

  const loadHistory =
    useCallback(
      async () => {
        setLoading(
          true,
        );

        setError(
          null,
        );

        try {
          const response =
            await fetch(
              `/api/admin/appointments/${encodeURIComponent(
                reference,
              )}/history`,
              {
                method:
                  "GET",
                cache:
                  "no-store",
              },
            );

          const payload:
            unknown =
            await response.json();

          if (
            !response.ok
          ) {
            const message =
              isRecord(
                payload,
              )
                ? getString(
                    payload,
                    [
                      "message",
                      "error",
                    ],
                  )
                : null;

            throw new Error(
              message ??
                "Impossible de charger l’historique.",
            );
          }

          setHistory(
            extractHistory(
              payload,
            ),
          );
        } catch (
          caughtError
        ) {
          setHistory(
            [],
          );

          setError(
            caughtError instanceof
              Error
              ? caughtError.message
              : "Une erreur est survenue pendant le chargement.",
          );
        } finally {
          setLoading(
            false,
          );
        }
      },
      [
        reference,
      ],
    );

  useEffect(() => {
    const timeoutId =
      window.setTimeout(
        () => {
          void loadHistory();
        },
        0,
      );

    return () => {
      window.clearTimeout(
        timeoutId,
      );
    };
  }, [
    loadHistory,
    refreshKey,
  ]);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-8 text-sm text-zinc-600">
        <LoaderCircle className="h-5 w-5 animate-spin" />

        Chargement de l’historique…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
        <div className="flex items-start gap-3">
          <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-red-800">
              Historique indisponible
            </p>

            <p className="mt-1 text-sm text-red-700">
              {error}
            </p>

            <button
              type="button"
              onClick={() => {
                void loadHistory();
              }}
              className="mt-3 inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100"
            >
              <RefreshCw className="h-3.5 w-3.5" />

              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (
    history.length ===
    0
  ) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-6 text-center">
        <MessageSquareText className="mx-auto h-7 w-7 text-zinc-400" />

        <p className="mt-3 text-sm font-semibold text-zinc-700">
          Aucun historique disponible
        </p>

        <p className="mt-1 text-xs text-zinc-500">
          Les prochaines actions réalisées sur ce rendez-vous apparaîtront ici.
        </p>
      </div>
    );
  }

  return (
    <ol className="space-y-0">
      {history.map(
        (
          item,
          index,
        ) => {
          const Icon =
            iconMap[
              item.color
            ];

          const isLast =
            index ===
            history.length -
              1;

          return (
            <li
              key={
                item.id
              }
              className="relative flex gap-4"
            >
              {!isLast ? (
                <span
                  aria-hidden="true"
                  className="absolute bottom-0 left-5 top-10 w-px bg-zinc-200"
                />
              ) : null}

              <div
                className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ring-1 ${iconClassMap[item.color]}`}
              >
                <Icon className="h-4.5 w-4.5" />
              </div>

              <div className="min-w-0 flex-1 pb-6">
                <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
                  <h4 className="text-sm font-semibold text-zinc-900">
                    {
                      item.title
                    }
                  </h4>

                  <time
                    dateTime={
                      item.createdAt
                    }
                    className="shrink-0 text-xs text-zinc-500"
                  >
                    {formatDate(
                      item.createdAt,
                    )}
                  </time>
                </div>

                {item.description ? (
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-600">
                    {
                      item.description
                    }
                  </p>
                ) : null}

                {item.author ? (
                  <div className="mt-3 flex items-center gap-2 text-xs text-zinc-500">
                    <UserRound className="h-3.5 w-3.5" />

                    <span>
                      Action réalisée par{" "}
                      <strong className="font-semibold text-zinc-700">
                        {
                          item.author
                        }
                      </strong>
                    </span>
                  </div>
                ) : null}
              </div>
            </li>
          );
        },
      )}
    </ol>
  );
}