"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  type DragEvent,
} from "react";

import {
  CalendarOff,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Images,
  Loader2,
  Palmtree,
  Printer,
  RefreshCcw,
  Search,
  UserRoundX,
} from "lucide-react";

import {
  toast,
} from "sonner";

import type {
  AdminCalendarEngineEvent,
  CalendarAppointment,
  CalendarPayload,
  CalendarStatus,
} from "../types/admin-calendar.types";

import {
  AdminCalendarLegend,
} from "./admin-calendar-legend";

import {
  CalendarAppointmentDetails,
} from "./calendar-appointment-details";

/* -------------------------------------------------------------------------- */
/*                                CONFIGURATION                               */
/* -------------------------------------------------------------------------- */

type View =
  | "day"
  | "week"
  | "month";

const TZ =
  "Europe/Paris";

const FALLBACK_START_HOUR =
  7;

const FALLBACK_END_HOUR =
  21;

const HOUR_HEIGHT =
  70;

/* -------------------------------------------------------------------------- */
/*                              STATUS CONFIG                                 */
/* -------------------------------------------------------------------------- */

const LABELS: Record<
  CalendarStatus,
  string
> = {
  PENDING:
    "En attente",

  CONFIRMED:
    "Confirmé",

  IN_PROGRESS:
    "En cours",

  COMPLETED:
    "Terminé",

  REFUSED:
    "Refusé",

  CANCELLED_BY_CLIENT:
    "Annulé cliente",

  CANCELLED_BY_ADMIN:
    "Annulé salon",

  NO_SHOW:
    "Absente",

  EXPIRED:
    "Expiré",
};

const CLASSES: Record<
  CalendarStatus,
  string
> = {
  PENDING:
    "border-amber-300 bg-amber-100 text-amber-950",

  CONFIRMED:
    "border-emerald-300 bg-emerald-100 text-emerald-950",

  IN_PROGRESS:
    "border-blue-300 bg-blue-100 text-blue-950",

  COMPLETED:
    "border-violet-300 bg-violet-100 text-violet-950",

  REFUSED:
    "border-orange-300 bg-orange-100 text-orange-950",

  CANCELLED_BY_CLIENT:
    "border-red-300 bg-red-100 text-red-950",

  CANCELLED_BY_ADMIN:
    "border-red-300 bg-red-100 text-red-950",

  NO_SHOW:
    "border-slate-400 bg-slate-200 text-slate-950",

  EXPIRED:
    "border-zinc-300 bg-zinc-100 text-zinc-600",
};

/* -------------------------------------------------------------------------- */
/*                                  HELPERS                                   */
/* -------------------------------------------------------------------------- */

function key(
  date: Date,
): string {
  return new Intl.DateTimeFormat(
    "en-CA",
    {
      timeZone: TZ,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    },
  ).format(date);
}

function addDays(
  date: Date,
  amount: number,
): Date {
  const result =
    new Date(date);

  result.setDate(
    result.getDate() +
      amount,
  );

  return result;
}

function startWeek(
  date: Date,
): Date {
  const result =
    new Date(date);

  const day =
    result.getDay() ||
    7;

  result.setDate(
    result.getDate() -
      day +
      1,
  );

  result.setHours(
    12,
    0,
    0,
    0,
  );

  return result;
}

function monthStart(
  date: Date,
): Date {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    1,
    12,
  );
}

function parts(
  date: Date,
): {
  hour: number;
  minute: number;
} {
  const values =
    Object.fromEntries(
      new Intl.DateTimeFormat(
        "en-GB",
        {
          timeZone: TZ,
          hour: "2-digit",
          minute: "2-digit",
          hourCycle: "h23",
        },
      )
        .formatToParts(
          date,
        )
        .filter(
          (part) =>
            part.type !==
            "literal",
        )
        .map(
          (part) => [
            part.type,
            Number(
              part.value,
            ),
          ],
        ),
    );

  return {
    hour:
      values.hour,

    minute:
      values.minute,
  };
}

function parisDate(
  dateKey: string,
  hour: number,
  minute: number,
): Date {
  const [
    year,
    month,
    day,
  ] = dateKey
    .split("-")
    .map(Number);

  const guess =
    new Date(
      Date.UTC(
        year,
        month - 1,
        day,
        hour,
        minute,
      ),
    );

  const shown =
    new Intl.DateTimeFormat(
      "en-GB",
      {
        timeZone: TZ,
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
      },
    ).formatToParts(
      guess,
    );

  const map =
    Object.fromEntries(
      shown
        .filter(
          (part) =>
            part.type !==
            "literal",
        )
        .map(
          (part) => [
            part.type,
            Number(
              part.value,
            ),
          ],
        ),
    );

  return new Date(
    guess.getTime() -
      ((map.hour -
        hour) *
        60 +
        (map.minute -
          minute)) *
        60_000,
  );
}

function time(
  value: string,
): string {
  return new Intl.DateTimeFormat(
    "fr-FR",
    {
      timeZone: TZ,
      hour: "2-digit",
      minute: "2-digit",
    },
  ).format(
    new Date(value),
  );
}

function money(
  cents: number,
): string {
  return new Intl.NumberFormat(
    "fr-FR",
    {
      style: "currency",
      currency: "EUR",
    },
  ).format(
    cents / 100,
  );
}

function parseHour(
  value:
    | string
    | undefined,
  fallback: number,
): number {
  if (
    !value ||
    !/^\d{2}:\d{2}$/.test(
      value,
    )
  ) {
    return fallback;
  }

  const hour =
    Number(
      value.split(
        ":",
      )[0],
    );

  return Number.isFinite(
    hour,
  )
    ? hour
    : fallback;
}

function eventTouchesDay(
  event: AdminCalendarEngineEvent,
  day: Date,
): boolean {
  const dayStart =
    parisDate(
      key(day),
      0,
      0,
    );

  const dayEnd =
    parisDate(
      key(
        addDays(
          day,
          1,
        ),
      ),
      0,
      0,
    );

  const eventStart =
    new Date(
      event.startsAt,
    );

  const eventEnd =
    new Date(
      event.endsAt,
    );

  return (
    eventStart <
      dayEnd &&
    eventEnd >
      dayStart
  );
}

function getBlockingLabel(
  event: AdminCalendarEngineEvent,
): string {
  switch (
    event.kind
  ) {
    case "STAFF_BREAK":
      return "Pause";

    case "STAFF_TIME_OFF":
      return (
        event.title ||
        "Congé"
      );

    case "STAFF_CLOSED":
      return "Non travaillée";

    case "BUSINESS_BREAK":
      return "Pause du salon";

    case "BUSINESS_TIME_OFF":
      return (
        event.title ||
        "Fermeture"
      );

    case "BUSINESS_CLOSED":
      return "Salon fermé";

    default:
      return event.title;
  }
}

function BlockingEventIcon({
  kind,
  className,
}: {
  kind:
    AdminCalendarEngineEvent["kind"];
  className?: string;
}) {
  switch (kind) {
    case "STAFF_BREAK":
    case "BUSINESS_BREAK":
      return (
        <Clock3
          className={
            className
          }
        />
      );

    case "STAFF_TIME_OFF":
    case "BUSINESS_TIME_OFF":
      return (
        <Palmtree
          className={
            className
          }
        />
      );

    case "STAFF_CLOSED":
      return (
        <UserRoundX
          className={
            className
          }
        />
      );

    case "BUSINESS_CLOSED":
    default:
      return (
        <CalendarOff
          className={
            className
          }
        />
      );
  }
}

function getStaffColor(
  appointment: CalendarAppointment,
): string {
  return (
    appointment.staff
      ?.color ||
    "#ec4899"
  );
}

/* -------------------------------------------------------------------------- */
/*                              MAIN COMPONENT                                */
/* -------------------------------------------------------------------------- */

export function AdminCalendarClient() {
  const [
    data,
    setData,
  ] =
    useState<CalendarPayload | null>(
      null,
    );

  const [
    view,
    setView,
  ] =
    useState<View>(
      "week",
    );

  const [
    cursor,
    setCursor,
  ] =
    useState(
      new Date(),
    );

  const [
    search,
    setSearch,
  ] =
    useState("");

  const [
    status,
    setStatus,
  ] =
    useState("ALL");

  const [
    staff,
    setStaff,
  ] =
    useState("ALL");

  const [
    workstation,
    setWorkstation,
  ] =
    useState("ALL");

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    pending,
    startTransition,
  ] =
    useTransition();

  const [
    selectedAppointment,
    setSelectedAppointment,
  ] =
    useState<CalendarAppointment | null>(
      null,
    );

  const [
    now,
    setNow,
  ] =
    useState(
      () => new Date(),
    );

  const days =
    useMemo(() => {
      if (
        view ===
        "day"
      ) {
        return [
          cursor,
        ];
      }

      if (
        view ===
        "week"
      ) {
        const start =
          startWeek(
            cursor,
          );

        return Array.from(
          {
            length: 7,
          },
          (
            _,
            index,
          ) =>
            addDays(
              start,
              index,
            ),
        );
      }

      const start =
        startWeek(
          monthStart(
            cursor,
          ),
        );

      return Array.from(
        {
          length: 42,
        },
        (
          _,
          index,
        ) =>
          addDays(
            start,
            index,
          ),
      );
    }, [
      cursor,
      view,
    ]);

  const range =
    useMemo(
      () => ({
        start:
          parisDate(
            key(
              days[0],
            ),
            0,
            0,
          ),

        end:
          parisDate(
            key(
              addDays(
                days[
                  days.length -
                    1
                ],
                1,
              ),
            ),
            0,
            0,
          ),
      }),
      [
        days,
      ],
    );

  const load =
    useCallback(
      async () => {
        setLoading(
          true,
        );

        try {
          const params =
            new URLSearchParams(
              {
                start:
                  range.start.toISOString(),

                end:
                  range.end.toISOString(),
              },
            );

          const response =
            await fetch(
              `/api/admin/calendar?${params.toString()}`,
              {
                cache:
                  "no-store",
              },
            );

          const payload =
            (await response.json()) as CalendarPayload & {
              error?: string;
            };

          if (
            !response.ok
          ) {
            throw new Error(
              payload.error ??
                "Chargement impossible.",
            );
          }

          setData(
            payload,
          );
        } catch (
          error: unknown
        ) {
          toast.error(
            error instanceof Error
              ? error.message
              : "Chargement impossible.",
          );
        } finally {
          setLoading(
            false,
          );
        }
      },
      [
        range.end,
        range.start,
      ],
    );

  useEffect(() => {
    const timeoutId =
      window.setTimeout(
        () => {
          void load();
        },
        0,
      );

    return () => {
      window.clearTimeout(
        timeoutId,
      );
    };
  }, [
    load,
  ]);

  useEffect(() => {
    const interval =
      window.setInterval(
        () => {
          setNow(
            new Date(),
          );
        },
        60_000,
      );

    return () => {
      window.clearInterval(
        interval,
      );
    };
  }, []);

  const appointments =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return (
        data?.appointments ??
        []
      ).filter(
        (
          appointment,
        ) => {
          const haystack =
            `${appointment.reference} ${appointment.client.firstName} ${appointment.client.lastName} ${appointment.client.email} ${appointment.client.phone ?? ""} ${appointment.services
              .map(
                (
                  service,
                ) =>
                  service.serviceName,
              )
              .join(" ")}`.toLowerCase();

          return (
            (!query ||
              haystack.includes(
                query,
              )) &&
            (status ===
              "ALL" ||
              appointment.status ===
                status) &&
            (staff ===
              "ALL" ||
              appointment.staff
                ?.id ===
                staff) &&
            (workstation ===
              "ALL" ||
              appointment
                .workstation
                ?.id ===
                workstation)
          );
        },
      );
    }, [
      data,
      search,
      staff,
      status,
      workstation,
    ]);

  const blockingEvents =
    useMemo(() => {
      return (
        data?.events ??
        []
      ).filter(
        (event) => {
          if (
            event.kind ===
            "APPOINTMENT"
          ) {
            return false;
          }

          if (
            staff !==
              "ALL" &&
            event.staffId &&
            event.staffId !==
              staff
          ) {
            return false;
          }

          if (
            workstation !==
              "ALL" &&
            event.workstationId &&
            event.workstationId !==
              workstation
          ) {
            return false;
          }

          return true;
        },
      );
    }, [
      data,
      staff,
      workstation,
    ]);

  const stats =
    useMemo(
      () => ({
        total:
          appointments.length,

        confirmed:
          appointments.filter(
            (
              appointment,
            ) =>
              appointment.status ===
              "CONFIRMED",
          ).length,

        cancelled:
          appointments.filter(
            (
              appointment,
            ) =>
              [
                "REFUSED",
                "CANCELLED_BY_CLIENT",
                "CANCELLED_BY_ADMIN",
              ].includes(
                appointment.status,
              ),
          ).length,

        revenue:
          appointments
            .filter(
              (
                appointment,
              ) =>
                ![
                  "REFUSED",
                  "CANCELLED_BY_CLIENT",
                  "CANCELLED_BY_ADMIN",
                  "EXPIRED",
                ].includes(
                  appointment.status,
                ),
            )
            .reduce(
              (
                sum,
                appointment,
              ) =>
                sum +
                appointment.totalPriceCents,
              0,
            ),
      }),
      [
        appointments,
      ],
    );

  const startHour =
    parseHour(
      data?.businessHours
        ?.dayStart,
      FALLBACK_START_HOUR,
    );

  const endHour =
    Math.max(
      startHour + 1,
      parseHour(
        data?.businessHours
          ?.dayEnd,
        FALLBACK_END_HOUR,
      ),
    );

  function navigate(
    direction: number,
  ): void {
    setCursor(
      (
        current,
      ) => {
        if (
          view ===
          "day"
        ) {
          return addDays(
            current,
            direction,
          );
        }

        if (
          view ===
          "week"
        ) {
          return addDays(
            current,
            direction *
              7,
          );
        }

        return new Date(
          current.getFullYear(),
          current.getMonth() +
            direction,
          1,
          12,
        );
      },
    );
  }

  function move(
    event: DragEvent<HTMLDivElement>,
    dayKey: string,
  ): void {
    event.preventDefault();

    const raw =
      event.dataTransfer.getData(
        "application/x-appointment",
      );

    if (!raw) {
      return;
    }

    const appointment =
      JSON.parse(
        raw,
      ) as CalendarAppointment;

    if (
      appointment.isMovable ===
      false
    ) {
      toast.error(
        "Ce rendez-vous ne peut pas être déplacé.",
      );

      return;
    }

    const rect =
      event.currentTarget.getBoundingClientRect();

    const rawMinutes =
      startHour *
        60 +
      ((event.clientY -
        rect.top) /
        HOUR_HEIGHT) *
        60;

    const rounded =
      Math.max(
        startHour *
          60,
        Math.round(
          rawMinutes /
            15,
        ) * 15,
      );

    const startsAt =
      parisDate(
        dayKey,
        Math.floor(
          rounded /
            60,
        ),
        rounded %
          60,
      );

    const duration =
      new Date(
        appointment.endsAt,
      ).getTime() -
      new Date(
        appointment.startsAt,
      ).getTime();

    const endsAt =
      new Date(
        startsAt.getTime() +
          duration,
      );

    startTransition(
      async () => {
        try {
          const response =
            await fetch(
              `/api/admin/calendar/${encodeURIComponent(
                appointment.reference,
              )}`,
              {
                method:
                  "PATCH",

                headers: {
                  "Content-Type":
                    "application/json",
                },

                body:
                  JSON.stringify(
                    {
                      action:
                        "move",

                      startsAt:
                        startsAt.toISOString(),

                      endsAt:
                        endsAt.toISOString(),

                      staffId:
                        appointment
                          .staff
                          ?.id ??
                        null,

                      workstationId:
                        appointment
                          .workstation
                          ?.id ??
                        null,
                    },
                  ),
              },
            );

          const payload =
            (await response.json()) as {
              success?: boolean;
              error?: string;
            };

          if (
            !response.ok ||
            !payload.success
          ) {
            throw new Error(
              payload.error ??
                "Déplacement impossible.",
            );
          }

          toast.success(
            "Rendez-vous déplacé.",
          );

          await load();
        } catch (
          error: unknown
        ) {
          toast.error(
            error instanceof Error
              ? error.message
              : "Déplacement impossible.",
          );
        }
      },
    );
  }

  return (
    <div className="space-y-5">
      {/* ------------------------------------------------------------------ */}
      {/*                              STATS                                 */}
      {/* ------------------------------------------------------------------ */}

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          [
            "Rendez-vous",
            stats.total,
          ],

          [
            "Confirmés",
            stats.confirmed,
          ],

          [
            "Annulés / refusés",
            stats.cancelled,
          ],

          [
            "CA prévu",
            money(
              stats.revenue,
            ),
          ],
        ].map(
          ([
            label,
            value,
          ]) => (
            <div
              key={String(
                label,
              )}
              className="rounded-3xl border border-pink-100 bg-white p-5 shadow-sm"
            >
              <p className="text-sm text-zinc-500">
                {label}
              </p>

              <p className="mt-2 text-3xl font-semibold">
                {value}
              </p>
            </div>
          ),
        )}
      </section>

      {/* ------------------------------------------------------------------ */}
      {/*                              TOOLBAR                               */}
      {/* ------------------------------------------------------------------ */}

      <section className="rounded-3xl border border-pink-100 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() =>
                navigate(
                  -1,
                )
              }
              className="grid size-10 place-items-center rounded-full border border-zinc-200 transition hover:bg-zinc-50"
            >
              <ChevronLeft className="size-5" />
            </button>

            <button
              type="button"
              onClick={() =>
                setCursor(
                  new Date(),
                )
              }
              className="rounded-full border border-zinc-200 px-4 py-2 text-sm font-semibold transition hover:bg-zinc-50"
            >
              Aujourd’hui
            </button>

            <button
              type="button"
              onClick={() =>
                navigate(
                  1,
                )
              }
              className="grid size-10 place-items-center rounded-full border border-zinc-200 transition hover:bg-zinc-50"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {(
              [
                "day",
                "week",
                "month",
              ] as View[]
            ).map(
              (item) => (
                <button
                  type="button"
                  key={
                    item
                  }
                  onClick={() =>
                    setView(
                      item,
                    )
                  }
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    view ===
                    item
                      ? "bg-zinc-950 text-white"
                      : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                  }`}
                >
                  {item ===
                  "day"
                    ? "Jour"
                    : item ===
                        "week"
                      ? "Semaine"
                      : "Mois"}
                </button>
              ),
            )}

            <button
              type="button"
              onClick={() =>
                window.print()
              }
              className="inline-flex items-center gap-2 rounded-full border border-zinc-200 px-4 py-2 text-sm font-semibold transition hover:bg-zinc-50"
            >
              <Printer className="size-4" />
              Imprimer
            </button>

            <button
              type="button"
              onClick={() =>
                void load()
              }
              className="grid size-10 place-items-center rounded-full border border-zinc-200 transition hover:bg-zinc-50"
            >
              <RefreshCcw
                className={`size-4 ${
                  loading
                    ? "animate-spin"
                    : ""
                }`}
              />
            </button>
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <label className="relative xl:col-span-2">
            <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />

            <input
              value={
                search
              }
              onChange={(
                event,
              ) =>
                setSearch(
                  event
                    .target
                    .value,
                )
              }
              placeholder="Cliente, téléphone, référence…"
              className="w-full rounded-2xl border border-zinc-200 py-3 pl-11 pr-4 outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
            />
          </label>

          <select
            value={
              status
            }
            onChange={(
              event,
            ) =>
              setStatus(
                event
                  .target
                  .value,
              )
            }
            className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
          >
            <option value="ALL">
              Tous les statuts
            </option>

            {Object.entries(
              LABELS,
            ).map(
              ([
                value,
                label,
              ]) => (
                <option
                  key={
                    value
                  }
                  value={
                    value
                  }
                >
                  {label}
                </option>
              ),
            )}
          </select>

          <select
            value={
              staff
            }
            onChange={(
              event,
            ) =>
              setStaff(
                event
                  .target
                  .value,
              )
            }
            className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
          >
            <option value="ALL">
              Toutes les professionnelles
            </option>

            {data?.staff.map(
              (
                member,
              ) => (
                <option
                  key={
                    member.id
                  }
                  value={
                    member.id
                  }
                >
                  {
                    member.displayName
                  }
                </option>
              ),
            )}
          </select>

          <select
            value={
              workstation
            }
            onChange={(
              event,
            ) =>
              setWorkstation(
                event
                  .target
                  .value,
              )
            }
            className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
          >
            <option value="ALL">
              Tous les postes
            </option>

            {data?.workstations.map(
              (
                item,
              ) => (
                <option
                  key={
                    item.id
                  }
                  value={
                    item.id
                  }
                >
                  {
                    item.name
                  }
                </option>
              ),
            )}
          </select>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/*                               LEGEND                               */}
      {/* ------------------------------------------------------------------ */}

      <AdminCalendarLegend />

      {/* ------------------------------------------------------------------ */}
      {/*                              CALENDAR                              */}
      {/* ------------------------------------------------------------------ */}

      {loading &&
      !data ? (
        <div className="grid min-h-96 place-items-center rounded-3xl border border-pink-100 bg-white">
          <Loader2 className="size-8 animate-spin text-rose-500" />
        </div>
      ) : view ===
        "month" ? (
        <Month
          days={
            days
          }
          cursor={
            cursor
          }
          appointments={
            appointments
          }
          blockingEvents={
            blockingEvents
          }
          onOpen={(
            day,
          ) => {
            setCursor(
              day,
            );

            setView(
              "day",
            );
          }}
          onSelectAppointment={
            setSelectedAppointment
          }
        />
      ) : (
        <Grid
          days={
            days
          }
          appointments={
            appointments
          }
          blockingEvents={
            blockingEvents
          }
          pending={
            pending
          }
          startHour={
            startHour
          }
          endHour={
            endHour
          }
          now={
            now
          }
          onDrop={
            move
          }
          onSelectAppointment={
            setSelectedAppointment
          }
        />
      )}

      <CalendarAppointmentDetails
        appointment={
          selectedAppointment
        }
        onClose={() =>
          setSelectedAppointment(
            null,
          )
        }
        onUpdated={async () => {
          await load();

          setSelectedAppointment(
            null,
          );
        }}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                    GRID                                    */
/* -------------------------------------------------------------------------- */

function Grid({
  days,
  appointments,
  blockingEvents,
  pending,
  startHour,
  endHour,
  now,
  onDrop,
  onSelectAppointment,
}: {
  days: Date[];
  appointments: CalendarAppointment[];
  blockingEvents: AdminCalendarEngineEvent[];
  pending: boolean;
  startHour: number;
  endHour: number;
  now: Date;

  onDrop: (
    event: DragEvent<HTMLDivElement>,
    dayKey: string,
  ) => void;

  onSelectAppointment: (
    appointment: CalendarAppointment,
  ) => void;
}) {
  const scrollContainerRef =
    useRef<HTMLDivElement | null>(
      null,
    );

  const hasAutoScrolledRef =
    useRef(false);

  const hours =
    Array.from(
      {
        length:
          endHour -
          startHour,
      },
      (
        _,
        index,
      ) =>
        startHour +
        index,
    );

  const totalHeight =
    hours.length *
    HOUR_HEIGHT;

  useEffect(() => {
    if (
      hasAutoScrolledRef.current ||
      !scrollContainerRef.current
    ) {
      return;
    }

    const nowParts =
      parts(
        now,
      );

    const nowMinutes =
      nowParts.hour *
        60 +
      nowParts.minute;

    const startMinutes =
      startHour *
      60;

    const endMinutes =
      endHour *
      60;

    if (
      nowMinutes <
        startMinutes ||
      nowMinutes >
        endMinutes
    ) {
      scrollContainerRef.current.scrollTop =
        0;

      hasAutoScrolledRef.current =
        true;

      return;
    }

    const currentPosition =
      ((nowMinutes -
        startMinutes) /
        60) *
      HOUR_HEIGHT;

    const targetPosition =
      Math.max(
        0,
        currentPosition -
          180,
      );

    scrollContainerRef.current.scrollTo({
      top:
        targetPosition,
      behavior:
        "smooth",
    });

    hasAutoScrolledRef.current =
      true;
  }, [
    endHour,
    now,
    startHour,
  ]);

  useEffect(() => {
    hasAutoScrolledRef.current =
      false;
  }, [
    days,
    startHour,
    endHour,
  ]);

  return (
    <section
      ref={
        scrollContainerRef
      }
      className="max-h-[75vh] overflow-auto rounded-3xl border border-pink-100 bg-white shadow-sm"
    >
      <div
        className="grid min-w-[900px]"
        style={{
          gridTemplateColumns: `80px repeat(${days.length}, minmax(150px, 1fr))`,
        }}
      >
        <div className="sticky top-0 z-50 border-b border-zinc-200 bg-zinc-50" />

        {days.map(
          (day) => (
            <div
              key={
                key(
                  day,
                )
              }
              className="sticky top-0 z-50 border-b border-l border-zinc-200 bg-zinc-50 p-3 text-center"
            >
              <b>
                {new Intl.DateTimeFormat(
                  "fr-FR",
                  {
                    weekday:
                      "short",

                    day:
                      "2-digit",

                    month:
                      "2-digit",
                  },
                ).format(
                  day,
                )}
              </b>
            </div>
          ),
        )}

        <div
          className="relative"
          style={{
            height:
              totalHeight,
          }}
        >
          {hours.map(
            (
              hour,
              index,
            ) => (
              <div
                key={
                  hour
                }
                className="absolute inset-x-0 border-t border-zinc-200 px-2 text-right text-xs text-zinc-400"
                style={{
                  top:
                    index *
                    HOUR_HEIGHT,
                }}
              >
                {String(
                  hour,
                ).padStart(
                  2,
                  "0",
                )}
                :00
              </div>
            ),
          )}
        </div>

        {days.map(
          (day) => {
            const dayKey =
              key(
                day,
              );

            const dayBlockingEvents =
              blockingEvents.filter(
                (
                  event,
                ) =>
                  eventTouchesDay(
                    event,
                    day,
                  ),
              );

            const isToday =
              dayKey ===
              key(
                now,
              );

            const nowParts =
              parts(
                now,
              );

            const nowMinutes =
              nowParts.hour *
                60 +
              nowParts.minute;

            const nowTop =
              ((nowMinutes -
                startHour *
                  60) /
                60) *
              HOUR_HEIGHT;

            const showNowIndicator =
              isToday &&
              nowMinutes >=
                startHour *
                  60 &&
              nowMinutes <=
                endHour *
                  60;

            const fullDayEvents =
              dayBlockingEvents.filter(
                (
                  event,
                ) =>
                  event.allDay ||
                  event.kind ===
                    "BUSINESS_CLOSED" ||
                  event.kind ===
                    "BUSINESS_TIME_OFF" ||
                  event.kind ===
                    "STAFF_CLOSED",
              );

            const timedBlockingEvents =
              dayBlockingEvents.filter(
                (
                  event,
                ) =>
                  !fullDayEvents.includes(
                    event,
                  ),
              );

            return (
              <div
                key={
                  dayKey
                }
                className="relative border-l border-zinc-200"
                style={{
                  height:
                    totalHeight,
                }}
                onDragOver={(
                  event,
                ) =>
                  event.preventDefault()
                }
                onDrop={(
                  event,
                ) =>
                  onDrop(
                    event,
                    dayKey,
                  )
                }
              >
                {hours.map(
                  (
                    hour,
                    index,
                  ) => (
                    <div
                      key={
                        hour
                      }
                      className="absolute inset-x-0 border-t border-zinc-100"
                      style={{
                        top:
                          index *
                          HOUR_HEIGHT,
                      }}
                    />
                  ),
                )}

                {showNowIndicator ? (
                  <div
                    className="pointer-events-none absolute inset-x-0 z-40 flex items-center"
                    style={{
                      top:
                        nowTop,
                    }}
                    aria-label="Heure actuelle"
                  >
                    <span className="-ml-1 block size-2.5 shrink-0 rounded-full bg-red-500 shadow-sm" />

                    <span className="block h-0.5 flex-1 bg-red-500 shadow-sm" />

                    <span className="absolute left-2 -translate-y-5 rounded-md bg-red-500 px-1.5 py-0.5 text-[10px] font-semibold text-white shadow-sm">
                      {time(
                        now.toISOString(),
                      )}
                    </span>
                  </div>
                ) : null}

                {fullDayEvents.map(
                  (
                    event,
                    index,
                  ) => (
                    <FullDayBlockingEvent
                      key={
                        event.key
                      }
                      event={
                        event
                      }
                      index={
                        index
                      }
                    />
                  ),
                )}

                {timedBlockingEvents.map(
                  (
                    event,
                  ) => (
                    <TimedBlockingEvent
                      key={
                        event.key
                      }
                      event={
                        event
                      }
                      startHour={
                        startHour
                      }
                    />
                  ),
                )}

                {appointments
                  .filter(
                    (
                      appointment,
                    ) =>
                      key(
                        new Date(
                          appointment.startsAt,
                        ),
                      ) ===
                      dayKey,
                  )
                  .map(
                    (
                      appointment,
                    ) => {
                      const start =
                        parts(
                          new Date(
                            appointment.startsAt,
                          ),
                        );

                      const end =
                        parts(
                          new Date(
                            appointment.endsAt,
                          ),
                        );

                      const startMinutes =
                        start.hour *
                          60 +
                        start.minute;

                      let endMinutes =
                        end.hour *
                          60 +
                        end.minute;

                      if (
                        endMinutes <=
                        startMinutes
                      ) {
                        endMinutes =
                          startMinutes +
                          30;
                      }

                      const top =
                        ((startMinutes -
                          startHour *
                            60) /
                          60) *
                        HOUR_HEIGHT;

                      const height =
                        Math.max(
                          32,
                          ((endMinutes -
                            startMinutes) /
                            60) *
                            HOUR_HEIGHT,
                        );

                      const staffColor =
                        getStaffColor(
                          appointment,
                        );

                      return (
                        <article
                          key={
                            appointment.id
                          }
                          draggable={
                            !pending &&
                            appointment.isMovable !==
                              false
                          }
                          onDragStart={(
                            event,
                          ) => {
                            event.dataTransfer.setData(
                              "application/x-appointment",
                              JSON.stringify(
                                appointment,
                              ),
                            );

                            event.dataTransfer.effectAllowed =
                              "move";
                          }}
                          onClick={() =>
                            onSelectAppointment(
                              appointment,
                            )
                          }
                          onKeyDown={(
                            event,
                          ) => {
                            if (
                              event.key ===
                                "Enter" ||
                              event.key ===
                                " "
                            ) {
                              event.preventDefault();

                              onSelectAppointment(
                                appointment,
                              );
                            }
                          }}
                          role="button"
                          tabIndex={
                            0
                          }
                          className={`absolute left-1 right-1 z-20 overflow-hidden rounded-xl border p-2 text-xs shadow-sm transition hover:z-30 hover:shadow-lg ${
                            appointment.isMovable ===
                            false
                              ? "cursor-default"
                              : "cursor-grab active:cursor-grabbing"
                          } ${CLASSES[appointment.status]}`}
                          style={{
                            top:
                              Math.max(
                                0,
                                top,
                              ),

                            height,

                            borderLeftWidth:
                              5,

                            borderLeftColor:
                              staffColor,
                          }}
                          title={`${appointment.client.firstName} ${appointment.client.lastName}
${appointment.services
  .map(
    (
      service,
    ) =>
      service.serviceName,
  )
  .join(", ")}
${appointment.staff?.displayName ?? "Non attribué"}
${money(appointment.totalPriceCents)}
${
  (appointment.images?.length ?? 0) > 0
    ? `${(appointment.images?.length ?? 0)} photo${
        (appointment.images?.length ?? 0) > 1
          ? "s"
          : ""
      } d’inspiration`
    : "Aucune photo d’inspiration"
}`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <b className="min-w-0 truncate">
                              {time(
                                appointment.startsAt,
                              )}{" "}
                              ·{" "}
                              {
                                appointment
                                  .client
                                  .firstName
                              }{" "}
                              {
                                appointment
                                  .client
                                  .lastName
                              }
                            </b>

                            {(appointment.images?.length ?? 0) > 0 ? (
                              <span
                                className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white/70 px-1.5 py-0.5 text-[10px] font-semibold shadow-sm"
                                title={`${(appointment.images?.length ?? 0)} photo${
                                  (appointment.images?.length ?? 0) > 1
                                    ? "s"
                                    : ""
                                } d’inspiration`}
                              >
                                <Images className="size-3" />

                                {(appointment.images?.length ?? 0)}
                              </span>
                            ) : null}
                          </div>

                          <span className="block truncate">
                            {appointment.services
                              .map(
                                (
                                  service,
                                ) =>
                                  service.serviceName,
                              )
                              .join(
                                ", ",
                              )}
                          </span>

                          <span className="mt-0.5 block truncate opacity-70">
                            {appointment
                              .staff
                              ?.displayName ??
                              "Non attribué"}
                          </span>

                          <span className="mt-0.5 block truncate font-semibold opacity-80">
                            {money(
                              appointment.totalPriceCents,
                            )}
                          </span>
                        </article>
                      );
                    },
                  )}
              </div>
            );
          },
        )}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*                         FULL DAY BLOCKING EVENT                            */
/* -------------------------------------------------------------------------- */

function FullDayBlockingEvent({
  event,
  index,
}: {
  event: AdminCalendarEngineEvent;
  index: number;
}) {
  const isBusinessClosure =
    event.kind ===
      "BUSINESS_CLOSED" ||
    event.kind ===
      "BUSINESS_TIME_OFF";

  return (
    <div
      className={`absolute inset-x-1 z-10 flex items-start gap-2 rounded-xl border px-2 py-2 text-xs shadow-sm ${
        isBusinessClosure
          ? "border-red-300 bg-red-100/95 text-red-900"
          : "border-slate-300 bg-slate-100/95 text-slate-700"
      }`}
      style={{
        top:
          4 +
          index *
            54,

        minHeight:
          48,
      }}
      title={
        event.description ??
        event.title
      }
    >
      <BlockingEventIcon
        kind={
          event.kind
        }
        className="mt-0.5 size-4 shrink-0"
      />

      <div className="min-w-0">
        <b className="block truncate">
          {getBlockingLabel(
            event,
          )}
        </b>

        {event.subtitle ? (
          <span className="block truncate opacity-75">
            {
              event.subtitle
            }
          </span>
        ) : null}

        {event.description ? (
          <span className="block truncate opacity-70">
            {
              event.description
            }
          </span>
        ) : null}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                          TIMED BLOCKING EVENT                              */
/* -------------------------------------------------------------------------- */

function TimedBlockingEvent({
  event,
  startHour,
}: {
  event: AdminCalendarEngineEvent;
  startHour: number;
}) {
  const start =
    parts(
      new Date(
        event.startsAt,
      ),
    );

  const end =
    parts(
      new Date(
        event.endsAt,
      ),
    );

  const startMinutes =
    start.hour *
      60 +
    start.minute;

  let endMinutes =
    end.hour *
      60 +
    end.minute;

  if (
    endMinutes <=
    startMinutes
  ) {
    endMinutes =
      startMinutes +
      30;
  }

  const top =
    ((startMinutes -
      startHour *
        60) /
      60) *
    HOUR_HEIGHT;

  const height =
    Math.max(
      30,
      ((endMinutes -
        startMinutes) /
        60) *
        HOUR_HEIGHT,
    );

  return (
    <div
      className="absolute left-1 right-1 z-10 overflow-hidden rounded-xl border border-dashed border-slate-400 bg-slate-100/90 p-2 text-xs text-slate-700 shadow-sm"
      style={{
        top:
          Math.max(
            0,
            top,
          ),

        height,

        borderLeftWidth:
          4,

        borderLeftColor:
          event.borderColor,
      }}
      title={
        event.description ??
        event.title
      }
    >
      <div className="flex items-center gap-1.5">
        <BlockingEventIcon
          kind={
            event.kind
          }
          className="size-3.5 shrink-0"
        />

        <b className="truncate">
          {getBlockingLabel(
            event,
          )}
        </b>
      </div>

      <span className="mt-1 block truncate opacity-70">
        {time(
          event.startsAt,
        )}{" "}
        –{" "}
        {time(
          event.endsAt,
        )}
      </span>

      {event.subtitle ? (
        <span className="block truncate opacity-70">
          {
            event.subtitle
          }
        </span>
      ) : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   MONTH                                    */
/* -------------------------------------------------------------------------- */

function Month({
  days,
  cursor,
  appointments,
  blockingEvents,
  onOpen,
  onSelectAppointment,
}: {
  days: Date[];
  cursor: Date;
  appointments: CalendarAppointment[];
  blockingEvents: AdminCalendarEngineEvent[];

  onOpen: (
    day: Date,
  ) => void;

  onSelectAppointment: (
    appointment: CalendarAppointment,
  ) => void;
}) {
  return (
    <section className="overflow-hidden rounded-3xl border border-pink-100 bg-white shadow-sm">
      <div className="grid grid-cols-7 bg-zinc-50 text-center text-xs font-semibold uppercase">
        {[
          "Lun",
          "Mar",
          "Mer",
          "Jeu",
          "Ven",
          "Sam",
          "Dim",
        ].map(
          (day) => (
            <div
              key={
                day
              }
              className="border-b border-zinc-200 p-3"
            >
              {day}
            </div>
          ),
        )}
      </div>

      <div className="grid grid-cols-7">
        {days.map(
          (day) => {
            const dayKey =
              key(
                day,
              );

            const items =
              appointments.filter(
                (
                  appointment,
                ) =>
                  key(
                    new Date(
                      appointment.startsAt,
                    ),
                  ) ===
                  dayKey,
              );

            const blocks =
              blockingEvents.filter(
                (
                  event,
                ) =>
                  eventTouchesDay(
                    event,
                    day,
                  ),
              );

            const hasBusinessClosure =
              blocks.some(
                (
                  event,
                ) =>
                  event.kind ===
                    "BUSINESS_CLOSED" ||
                  event.kind ===
                    "BUSINESS_TIME_OFF",
              );

            const staffAbsences =
              blocks.filter(
                (
                  event,
                ) =>
                  event.kind ===
                    "STAFF_TIME_OFF" ||
                  event.kind ===
                    "STAFF_CLOSED",
              ).length;

            return (
              <button
                type="button"
                key={
                  dayKey
                }
                onClick={() =>
                  onOpen(
                    day,
                  )
                }
                className={`min-h-36 border-b border-r border-zinc-200 p-2 text-left transition hover:bg-pink-50 ${
                  day.getMonth() !==
                  cursor.getMonth()
                    ? "bg-zinc-50 text-zinc-400"
                    : ""
                } ${
                  hasBusinessClosure
                    ? "bg-red-50"
                    : ""
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <b>
                    {day.getDate()}
                  </b>

                  {items.length >
                  0 ? (
                    <span className="rounded-full bg-zinc-900 px-2 py-0.5 text-[10px] font-semibold text-white">
                      {
                        items.length
                      }{" "}
                      RDV
                    </span>
                  ) : null}
                </div>

                <div className="mt-2 space-y-1">
                  {hasBusinessClosure ? (
                    <div className="flex items-center gap-1 rounded-lg border border-red-200 bg-red-100 px-2 py-1 text-[11px] font-semibold text-red-800">
                      <CalendarOff className="size-3" />
                      Salon fermé
                    </div>
                  ) : null}

                  {staffAbsences >
                  0 ? (
                    <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-100 px-2 py-1 text-[11px] text-slate-700">
                      <UserRoundX className="size-3" />
                      {
                        staffAbsences
                      }{" "}
                      absence
                      {staffAbsences >
                      1
                        ? "s"
                        : ""}
                    </div>
                  ) : null}

                  {items
                    .slice(
                      0,
                      3,
                    )
                    .map(
                      (
                        appointment,
                      ) => (
                        <div
                          key={
                            appointment.id
                          }
                          role="button"
                          tabIndex={
                            0
                          }
                          onClick={(
                            event,
                          ) => {
                            event.stopPropagation();

                            onSelectAppointment(
                              appointment,
                            );
                          }}
                          onKeyDown={(
                            event,
                          ) => {
                            if (
                              event.key ===
                                "Enter" ||
                              event.key ===
                                " "
                            ) {
                              event.preventDefault();
                              event.stopPropagation();

                              onSelectAppointment(
                                appointment,
                              );
                            }
                          }}
                          className={`truncate rounded-lg border border-l-4 px-2 py-1 text-[11px] transition hover:brightness-95 ${CLASSES[appointment.status]}`}
                          style={{
                            borderLeftColor:
                              getStaffColor(
                                appointment,
                              ),
                          }}
                        >
                          <div className="flex items-center justify-between gap-1">
  <span className="min-w-0 truncate">
    {time(
      appointment.startsAt,
    )}{" "}
    ·{" "}
    {
      appointment
        .client
        .firstName
    }
  </span>

  {(appointment.images?.length ?? 0) > 0 ? (
    <span
      className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-white/70 px-1 py-0.5 text-[9px] font-semibold"
      title={`${(appointment.images?.length ?? 0)} photo${
        (appointment.images?.length ?? 0) > 1
          ? "s"
          : ""
      } d’inspiration`}
    >
      <Images className="size-2.5" />

      {(appointment.images?.length ?? 0)}
    </span>
  ) : null}
</div>
                        </div>
                      ),
                    )}

                  {items.length >
                  3 ? (
                    <small className="block px-1 text-zinc-500">
                      +{" "}
                      {items.length -
                        3}{" "}
                      rendez-vous
                    </small>
                  ) : null}
                </div>
              </button>
            );
          },
        )}
      </div>
    </section>
  );
}
