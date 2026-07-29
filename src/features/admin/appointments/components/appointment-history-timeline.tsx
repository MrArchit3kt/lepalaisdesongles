"use client";

import {
  AlertCircle,
  ArrowDown,
  CalendarClock,
  CheckCircle2,
  CircleDot,
  Clock3,
  FileText,
  LoaderCircle,
  RefreshCw,
  UserRound,
  XCircle,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { Button } from "@/components/ui/button";

import type {
  AdminAppointmentStatus,
  AdminAppointmentTimelineItem,
  AdminAppointmentTimelineResponse,
  AppointmentHistoryChange,
} from "@/features/admin/appointments/types/admin-appointment.types";

type AppointmentHistoryTimelineProps = {
  reference: string;
  refreshKey?: number;
};

type TimelineApiError = {
  success?: false;
  error?: string;
};

const STATUS_LABELS: Record<
  AdminAppointmentStatus,
  string
> = {
  PENDING: "En attente",
  CONFIRMED: "Confirmé",
  IN_PROGRESS: "En cours",
  COMPLETED: "Terminé",
  REFUSED: "Refusé",
  CANCELLED_BY_CLIENT: "Annulé par la cliente",
  CANCELLED_BY_ADMIN: "Annulé par l’administration",
  NO_SHOW: "Absente",
  EXPIRED: "Expiré",
};

const ACTION_LABELS: Record<string, string> = {
  APPOINTMENT_CREATED: "Rendez-vous créé",
  APPOINTMENT_CONFIRMED: "Rendez-vous confirmé",
  APPOINTMENT_REFUSED: "Rendez-vous refusé",
  APPOINTMENT_CANCELLED_BY_ADMIN:
    "Rendez-vous annulé par l’administration",
  APPOINTMENT_CANCELLED_BY_CLIENT:
    "Rendez-vous annulé par la cliente",
  APPOINTMENT_RESCHEDULED: "Rendez-vous reprogrammé",
  APPOINTMENT_NOTE_UPDATED: "Note interne modifiée",
  APPOINTMENT_STARTED: "Rendez-vous commencé",
  APPOINTMENT_COMPLETED: "Rendez-vous terminé",
  APPOINTMENT_NO_SHOW: "Cliente marquée absente",
};

const DATE_FIELDS = new Set([
  "date",
  "startsAt",
  "endsAt",
]);

const MONEY_FIELDS = new Set([
  "price",
  "deposit",
]);

const DURATION_FIELDS = new Set([
  "duration",
]);

const STATUS_FIELDS = new Set([
  "status",
  "paymentStatus",
]);

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function formatDateTime(
  value: string,
): string {
  const date = new Date(value);

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
      timeZone: "Europe/Paris",
      dateStyle: "long",
      timeStyle: "short",
    },
  ).format(date);
}

function formatDateOnly(
  value: string,
): string {
  const date = new Date(value);

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
      timeZone: "Europe/Paris",
      dateStyle: "long",
    },
  ).format(date);
}

function formatTimeOnly(
  value: string,
): string {
  const date = new Date(value);

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
      timeZone: "Europe/Paris",
      hour: "2-digit",
      minute: "2-digit",
    },
  ).format(date);
}

function formatMoney(
  value: number,
): string {
  return new Intl.NumberFormat(
    "fr-FR",
    {
      style: "currency",
      currency: "EUR",
    },
  ).format(
    value / 100,
  );
}

function formatDuration(
  value: number,
): string {
  const hours =
    Math.floor(
      value / 60,
    );

  const minutes =
    value % 60;

  if (
    hours > 0 &&
    minutes > 0
  ) {
    return `${hours} h ${minutes
      .toString()
      .padStart(2, "0")}`;
  }

  if (hours > 0) {
    return `${hours} h`;
  }

  return `${minutes} min`;
}

function formatStatus(
  value: string,
): string {
  if (
    value in STATUS_LABELS
  ) {
    return STATUS_LABELS[
      value as AdminAppointmentStatus
    ];
  }

  const fallback: Record<string, string> = {
    NOT_REQUIRED: "Non requis",
    PENDING: "En attente",
    PAID: "Payé",
    FAILED: "Échec",
    REFUNDED: "Remboursé",
    PARTIALLY_REFUNDED:
      "Partiellement remboursé",
    CASH: "Espèces",
    PAYPAL: "PayPal",
    CARD: "Carte bancaire",
  };

  return (
    fallback[value] ??
    value
      .replaceAll("_", " ")
      .toLocaleLowerCase("fr-FR")
  );
}

function formatServiceSnapshot(
  value: unknown,
): string[] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  const services =
    value.flatMap(
      (
        item,
      ): string[] => {
        if (!isRecord(item)) {
          return [];
        }

        const name =
          typeof item.name === "string"
            ? item.name
            : typeof item.serviceName === "string"
              ? item.serviceName
              : "Prestation";

        const quantity =
          typeof item.quantity === "number"
            ? item.quantity
            : 1;

        const duration =
          typeof item.durationMinutes === "number"
            ? item.durationMinutes
            : null;

        const price =
          typeof item.unitPriceCents === "number"
            ? item.unitPriceCents
            : null;

        const details: string[] = [];

        if (quantity > 1) {
          details.push(
            `x${quantity}`,
          );
        }

        if (duration !== null) {
          details.push(
            formatDuration(
              duration,
            ),
          );
        }

        if (price !== null) {
          details.push(
            formatMoney(
              price,
            ),
          );
        }

        return [
          details.length > 0
            ? `${name} — ${details.join(" · ")}`
            : name,
        ];
      },
    );

  return services;
}

function formatPrimitiveValue(
  field: string,
  value: unknown,
): string {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "Non renseigné";
  }

  if (
    field === "date" &&
    typeof value === "string"
  ) {
    return formatDateOnly(
      value,
    );
  }

  if (
    field === "time" &&
    typeof value === "string"
  ) {
    return formatTimeOnly(
      value,
    );
  }

  if (
    DATE_FIELDS.has(field) &&
    typeof value === "string"
  ) {
    return formatDateTime(
      value,
    );
  }

  if (
    MONEY_FIELDS.has(field) &&
    typeof value === "number"
  ) {
    return formatMoney(
      value,
    );
  }

  if (
    DURATION_FIELDS.has(field) &&
    typeof value === "number"
  ) {
    return formatDuration(
      value,
    );
  }

  if (
    STATUS_FIELDS.has(field) &&
    typeof value === "string"
  ) {
    return formatStatus(
      value,
    );
  }

  if (
    typeof value === "boolean"
  ) {
    return value
      ? "Oui"
      : "Non";
  }

  if (
    typeof value === "string" ||
    typeof value === "number"
  ) {
    return String(
      value,
    );
  }

  try {
    return JSON.stringify(
      value,
    );
  } catch {
    return "Valeur non affichable";
  }
}

function ValueDisplay({
  field,
  value,
}: {
  field: string;
  value: unknown;
}) {
  if (field === "services") {
    const services =
      formatServiceSnapshot(
        value,
      );

    if (
      !services ||
      services.length === 0
    ) {
      return (
        <span className="text-sm text-muted-foreground">
          Aucune prestation
        </span>
      );
    }

    return (
      <ul className="space-y-1 text-sm">
        {services.map(
          (
            service,
            index,
          ) => (
            <li
              key={`${service}-${index}`}
              className="rounded-md bg-background/80 px-2 py-1"
            >
              {service}
            </li>
          ),
        )}
      </ul>
    );
  }

  return (
    <span className="whitespace-pre-wrap break-words text-sm">
      {formatPrimitiveValue(
        field,
        value,
      )}
    </span>
  );
}

function HistoryChangeCard({
  change,
}: {
  change: AppointmentHistoryChange;
}) {
  return (
    <div className="overflow-hidden rounded-xl border bg-muted/20">
      <div className="border-b bg-muted/40 px-3 py-2">
        <p className="text-sm font-semibold">
          {change.label}
        </p>
      </div>

      <div className="grid gap-2 p-3 md:grid-cols-[1fr_auto_1fr] md:items-center">
        <div className="min-w-0 rounded-lg border bg-background p-3">
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Avant
          </p>

          <ValueDisplay
            field={
              change.field
            }
            value={
              change.before
            }
          />
        </div>

        <ArrowDown className="mx-auto size-4 text-muted-foreground md:-rotate-90" />

        <div className="min-w-0 rounded-lg border bg-background p-3">
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Après
          </p>

          <ValueDisplay
            field={
              change.field
            }
            value={
              change.after
            }
          />
        </div>
      </div>
    </div>
  );
}

function ActionIcon({
  action,
}: {
  action: string;
}) {
  if (
    action.includes(
      "CONFIRMED",
    )
  ) {
    return (
      <CheckCircle2 className="size-4" />
    );
  }

  if (
    action.includes(
      "REFUSED",
    ) ||
    action.includes(
      "CANCELLED",
    ) ||
    action.includes(
      "NO_SHOW",
    )
  ) {
    return (
      <XCircle className="size-4" />
    );
  }

  if (
    action.includes(
      "RESCHEDULED",
    )
  ) {
    return (
      <CalendarClock className="size-4" />
    );
  }

  if (
    action.includes(
      "NOTE",
    )
  ) {
    return (
      <FileText className="size-4" />
    );
  }

  if (
    action.includes(
      "STARTED",
    )
  ) {
    return (
      <Clock3 className="size-4" />
    );
  }

  if (
    action.includes(
      "COMPLETED",
    )
  ) {
    return (
      <CheckCircle2 className="size-4" />
    );
  }

  return (
    <CircleDot className="size-4" />
  );
}

function getActionLabel(
  action: string,
): string {
  return (
    ACTION_LABELS[action] ??
    action
      .replaceAll("_", " ")
      .toLocaleLowerCase("fr-FR")
  );
}

function StatusTransition({
  previousStatus,
  nextStatus,
}: {
  previousStatus:
    | AdminAppointmentStatus
    | null;
  nextStatus:
    | AdminAppointmentStatus
    | null;
}) {
  if (
    !nextStatus ||
    previousStatus ===
      nextStatus
  ) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      {previousStatus ? (
        <>
          <span className="rounded-full border bg-background px-2.5 py-1 text-muted-foreground">
            {
              STATUS_LABELS[
                previousStatus
              ]
            }
          </span>

          <span className="text-muted-foreground">
            →
          </span>
        </>
      ) : null}

      <span className="rounded-full border bg-primary/10 px-2.5 py-1 font-medium text-primary">
        {
          STATUS_LABELS[
            nextStatus
          ]
        }
      </span>
    </div>
  );
}

function TimelineEntry({
  item,
  isLast,
}: {
  item: AdminAppointmentTimelineItem;
  isLast: boolean;
}) {
  return (
    <article className="relative grid grid-cols-[2rem_1fr] gap-3">
      {!isLast ? (
        <div className="absolute bottom-0 left-[0.9375rem] top-8 w-px bg-border" />
      ) : null}

      <div className="relative z-10 flex size-8 items-center justify-center rounded-full border bg-background shadow-sm">
        <ActionIcon
          action={
            item.action
          }
        />
      </div>

      <div className="min-w-0 pb-6">
        <div className="rounded-2xl border bg-card p-4 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h4 className="font-semibold">
                {getActionLabel(
                  item.action,
                )}
              </h4>

              <p className="mt-1 text-xs text-muted-foreground">
                {formatDateTime(
                  item.createdAt,
                )}
              </p>
            </div>

            {item.actorId ? (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <UserRound className="size-3.5" />
                Administration
              </div>
            ) : null}
          </div>

          <div className="mt-3">
            <StatusTransition
              previousStatus={
                item.previousStatus
              }
              nextStatus={
                item.nextStatus
              }
            />
          </div>

          {item.reason ? (
            <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100">
              <span className="font-medium">
                Motif :
              </span>{" "}
              {item.reason}
            </div>
          ) : null}

          {item.changes.length > 0 ? (
            <div className="mt-4 space-y-3">
              {item.changes.map(
                (
                  change,
                  index,
                ) => (
                  <HistoryChangeCard
                    key={`${item.id}-${change.field}-${index}`}
                    change={
                      change
                    }
                  />
                ),
              )}
            </div>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">
              Aucun détail supplémentaire enregistré.
            </p>
          )}
        </div>
      </div>
    </article>
  );
}

export function AppointmentHistoryTimeline({
  reference,
  refreshKey = 0,
}: AppointmentHistoryTimelineProps) {
  const [
    timeline,
    setTimeline,
  ] = useState<
    AdminAppointmentTimelineItem[]
  >([]);

  const [
    isLoading,
    setIsLoading,
  ] = useState(
    true,
  );

  const [
    error,
    setError,
  ] = useState<
    string | null
  >(null);

  const loadTimeline =
    useCallback(
      async (
        signal?: AbortSignal,
      ) => {
        const cleanReference =
          reference.trim();

        if (!cleanReference) {
          setTimeline([]);
          setError(
            "La référence du rendez-vous est invalide.",
          );
          setIsLoading(false);
          return;
        }

        setIsLoading(true);
        setError(null);

        try {
          const response =
            await fetch(
              `/api/admin/appointments/${encodeURIComponent(
                cleanReference,
              )}/history`,
              {
                method: "GET",
                cache: "no-store",
                signal,
                headers: {
                  Accept:
                    "application/json",
                },
              },
            );

          const payload =
            (await response.json()) as
              | AdminAppointmentTimelineResponse
              | TimelineApiError;

          if (
            !response.ok ||
            payload.success !== true
          ) {
            throw new Error(
              "error" in payload &&
              typeof payload.error ===
                "string"
                ? payload.error
                : "Impossible de charger l’historique.",
            );
          }

          setTimeline(
            payload.timeline,
          );
        } catch (caughtError) {
          if (
            caughtError instanceof
              DOMException &&
            caughtError.name ===
              "AbortError"
          ) {
            return;
          }

          setTimeline([]);

          setError(
            caughtError instanceof Error
              ? caughtError.message
              : "Impossible de charger l’historique.",
          );
        } finally {
          if (
            !signal?.aborted
          ) {
            setIsLoading(false);
          }
        }
      },
      [
        reference,
      ],
    );

  useEffect(
    () => {
      const controller =
        new AbortController();

      const timeoutId =
        window.setTimeout(
          () => {
            void loadTimeline(
              controller.signal,
            );
          },
          0,
        );

      return () => {
        window.clearTimeout(
          timeoutId,
        );

        controller.abort();
      };
    },
    [
      loadTimeline,
      refreshKey,
    ],
  );

  if (isLoading) {
    return (
      <div className="flex min-h-40 items-center justify-center rounded-2xl border border-dashed">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <LoaderCircle className="size-4 animate-spin" />
          Chargement de l’historique…
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4">
        <div className="flex gap-3">
          <AlertCircle className="mt-0.5 size-5 shrink-0 text-destructive" />

          <div className="min-w-0">
            <p className="font-medium text-destructive">
              Historique indisponible
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              {error}
            </p>

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => {
                void loadTimeline();
              }}
            >
              <RefreshCw className="size-4" />
              Réessayer
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (
    timeline.length === 0
  ) {
    return (
      <div className="rounded-2xl border border-dashed p-6 text-center">
        <CalendarClock className="mx-auto size-8 text-muted-foreground" />

        <p className="mt-3 font-medium">
          Aucun historique
        </p>

        <p className="mt-1 text-sm text-muted-foreground">
          Les prochaines modifications de ce rendez-vous apparaîtront ici.
        </p>
      </div>
    );
  }

  return (
    <section
      aria-label="Historique du rendez-vous"
      className="space-y-1"
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold">
            Historique du rendez-vous
          </h3>

          <p className="text-sm text-muted-foreground">
            {timeline.length} événement
            {timeline.length > 1
              ? "s"
              : ""}
          </p>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            void loadTimeline();
          }}
        >
          <RefreshCw className="size-4" />
          Actualiser
        </Button>
      </div>

      <div>
        {timeline.map(
          (
            item,
            index,
          ) => (
            <TimelineEntry
              key={
                item.id
              }
              item={
                item
              }
              isLast={
                index ===
                timeline.length -
                  1
              }
            />
          ),
        )}
      </div>
    </section>
  );
}