"use client";

import {
  useMemo,
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
import {
  CalendarClock,
  CheckCircle2,
  History,
  Info,
  LoaderCircle,
  Play,
  Save,
  Search,
  UserX,
  X,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { AppointmentHistoryTimeline } from "./appointment-history-timeline";

import type {
  AdminAppointmentListItem,
  AdminAppointmentMutation,
  AdminAppointmentStatus,
} from "../types/admin-appointment.types";

type Props = {
  appointments: AdminAppointmentListItem[];
};

type ModalTab =
  | "details"
  | "history";

type AppointmentMutationResponse = {
  success?: boolean;
  error?: string;
};

const LABELS: Record<
  AdminAppointmentStatus,
  string
> = {
  PENDING: "En attente",
  CONFIRMED: "Confirmé",
  IN_PROGRESS: "En cours",
  COMPLETED: "Terminé",
  REFUSED: "Refusé",
  CANCELLED_BY_CLIENT:
    "Annulé par la cliente",
  CANCELLED_BY_ADMIN:
    "Annulé par le salon",
  NO_SHOW: "Absente",
  EXPIRED: "Expiré",
};

const STATUS_STYLES: Record<
  AdminAppointmentStatus,
  string
> = {
  PENDING:
    "bg-amber-100 text-amber-800",
  CONFIRMED:
    "bg-emerald-100 text-emerald-800",
  IN_PROGRESS:
    "bg-blue-100 text-blue-800",
  COMPLETED:
    "bg-violet-100 text-violet-800",
  REFUSED:
    "bg-orange-100 text-orange-800",
  CANCELLED_BY_CLIENT:
    "bg-red-100 text-red-800",
  CANCELLED_BY_ADMIN:
    "bg-red-100 text-red-800",
  NO_SHOW:
    "bg-zinc-200 text-zinc-800",
  EXPIRED:
    "bg-zinc-200 text-zinc-700",
};

function price(
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

function date(
  value: string,
): string {
  const parsedDate =
    new Date(value);

  if (
    Number.isNaN(
      parsedDate.getTime(),
    )
  ) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "fr-FR",
    {
      timeZone:
        "Europe/Paris",
      dateStyle:
        "medium",
      timeStyle:
        "short",
    },
  ).format(
    parsedDate,
  );
}

function localInput(
  value: string,
): string {
  const parsedDate =
    new Date(value);

  if (
    Number.isNaN(
      parsedDate.getTime(),
    )
  ) {
    return "";
  }

  return new Intl.DateTimeFormat(
    "sv-SE",
    {
      timeZone:
        "Europe/Paris",
      year:
        "numeric",
      month:
        "2-digit",
      day:
        "2-digit",
      hour:
        "2-digit",
      minute:
        "2-digit",
    },
  )
    .format(
      parsedDate,
    )
    .replace(
      " ",
      "T",
    );
}

function getMutationSuccessMessage(
  mutation: AdminAppointmentMutation,
): string {
  switch (
    mutation.action
  ) {
    case "confirm":
      return "Le rendez-vous a été confirmé.";

    case "refuse":
      return "Le rendez-vous a été refusé.";

    case "cancel":
      return "Le rendez-vous a été annulé.";

    case "reschedule":
      return "Le rendez-vous a été reprogrammé.";

    case "update_note":
      return "La note interne a été enregistrée.";

    case "start":
      return "Le rendez-vous a été démarré.";

    case "complete":
      return "Le rendez-vous a été terminé.";

    case "no_show":
      return "La cliente a été marquée absente.";
  }
}

function applyMutationLocally(
  appointment: AdminAppointmentListItem,
  mutation: AdminAppointmentMutation,
): AdminAppointmentListItem {
  switch (
    mutation.action
  ) {
    case "confirm":
      return {
        ...appointment,
        status:
          "CONFIRMED",
        adminComment:
          mutation.adminComment ??
          appointment.adminComment,
      };

    case "refuse":
      return {
        ...appointment,
        status:
          "REFUSED",
        cancellationReason:
          mutation.reason,
        adminComment:
          mutation.adminComment ??
          appointment.adminComment,
      };

    case "cancel":
      return {
        ...appointment,
        status:
          "CANCELLED_BY_ADMIN",
        cancellationReason:
          mutation.reason,
        adminComment:
          mutation.adminComment ??
          appointment.adminComment,
      };

    case "reschedule":
      return {
        ...appointment,
        startsAt:
          mutation.startsAt,
        adminComment:
          mutation.adminComment ??
          appointment.adminComment,
      };

    case "update_note":
      return {
        ...appointment,
        adminComment:
          mutation.adminComment,
      };

    case "start":
      return {
        ...appointment,
        status:
          "IN_PROGRESS",
      };

    case "complete":
      return {
        ...appointment,
        status:
          "COMPLETED",
      };

    case "no_show":
      return {
        ...appointment,
        status:
          "NO_SHOW",
        cancellationReason:
          mutation.reason ??
          "Cliente absente au rendez-vous.",
      };
  }
}

export function AdminAppointmentsClient({
  appointments,
}: Props) {
  const router =
    useRouter();

  const [
    pending,
    startTransition,
  ] = useTransition();

  const [
    search,
    setSearch,
  ] = useState(
    "",
  );

  const [
    status,
    setStatus,
  ] = useState<
    | "ALL"
    | AdminAppointmentStatus
  >(
    "ALL",
  );

  const [
    selected,
    setSelected,
  ] = useState<
    AdminAppointmentListItem | null
  >(
    null,
  );

  const [
    reason,
    setReason,
  ] = useState(
    "",
  );

  const [
    note,
    setNote,
  ] = useState(
    "",
  );

  const [
    startsAt,
    setStartsAt,
  ] = useState(
    "",
  );

  const [
    activeTab,
    setActiveTab,
  ] = useState<ModalTab>(
    "details",
  );

  const [
    historyRefreshKey,
    setHistoryRefreshKey,
  ] = useState(
    0,
  );

  const statistics =
    useMemo(
      () => [
        {
          label:
            "Total",
          value:
            appointments.length,
        },
        {
          label:
            "En attente",
          value:
            appointments.filter(
              (appointment) =>
                appointment.status ===
                "PENDING",
            ).length,
        },
        {
          label:
            "Confirmés",
          value:
            appointments.filter(
              (appointment) =>
                appointment.status ===
                "CONFIRMED",
            ).length,
        },
        {
          label:
            "En cours",
          value:
            appointments.filter(
              (appointment) =>
                appointment.status ===
                "IN_PROGRESS",
            ).length,
        },
      ],
      [
        appointments,
      ],
    );

  const filtered =
    useMemo(
      () =>
        appointments.filter(
          (
            appointment,
          ) => {
            const query =
              search
                .trim()
                .toLowerCase();

            const matchesStatus =
              status ===
                "ALL" ||
              appointment.status ===
                status;

            const searchableContent =
              [
                appointment.reference,
                appointment.client.firstName,
                appointment.client.lastName,
                appointment.client.email,
                appointment.client.phone ??
                  "",
                appointment.staff?.displayName ??
                  "",
                appointment.workstation?.name ??
                  "",
                appointment.services
                  .map(
                    (
                      service,
                    ) =>
                      service.serviceName,
                  )
                  .join(
                    " ",
                  ),
              ]
                .join(
                  " ",
                )
                .toLowerCase();

            const matchesSearch =
              !query ||
              searchableContent.includes(
                query,
              );

            return (
              matchesStatus &&
              matchesSearch
            );
          },
        ),
      [
        appointments,
        search,
        status,
      ],
    );

  function openAppointment(
    appointment: AdminAppointmentListItem,
  ): void {
    setSelected(
      appointment,
    );

    setReason(
      appointment.cancellationReason ??
        "",
    );

    setNote(
      appointment.adminComment ??
        "",
    );

    setStartsAt(
      localInput(
        appointment.startsAt,
      ),
    );

    setActiveTab(
      "details",
    );

    setHistoryRefreshKey(
      0,
    );
  }

  function closeAppointment(): void {
    if (pending) {
      return;
    }

    setSelected(
      null,
    );

    setReason(
      "",
    );

    setNote(
      "",
    );

    setStartsAt(
      "",
    );

    setActiveTab(
      "details",
    );
  }

  function run(
    mutation: AdminAppointmentMutation,
  ): void {
    if (
      !selected ||
      pending
    ) {
      return;
    }

    const reference =
      selected.reference;

    startTransition(
      async () => {
        try {
          const response =
            await fetch(
              `/api/admin/appointments/${encodeURIComponent(
                reference,
              )}`,
              {
                method:
                  "PATCH",

                headers: {
                  "Content-Type":
                    "application/json",
                  Accept:
                    "application/json",
                },

                body:
                  JSON.stringify(
                    mutation,
                  ),
              },
            );

          const payload =
            (await response.json()) as AppointmentMutationResponse;

          if (
            !response.ok ||
            payload.success !==
              true
          ) {
            throw new Error(
              payload.error ??
                "Modification impossible.",
            );
          }

          setSelected(
            (
              currentAppointment,
            ) => {
              if (
                !currentAppointment ||
                currentAppointment.reference !==
                  reference
              ) {
                return currentAppointment;
              }

              return applyMutationLocally(
                currentAppointment,
                mutation,
              );
            },
          );

          if (
            mutation.action ===
            "update_note"
          ) {
            setNote(
              mutation.adminComment,
            );
          }

          if (
            mutation.action ===
              "refuse" ||
            mutation.action ===
              "cancel" ||
            mutation.action ===
              "no_show"
          ) {
            setReason(
              mutation.reason ??
                "",
            );
          }

          if (
            mutation.action ===
            "reschedule"
          ) {
            setStartsAt(
              mutation.startsAt,
            );
          }

          setHistoryRefreshKey(
            (
              current,
            ) =>
              current + 1,
          );

          toast.success(
            getMutationSuccessMessage(
              mutation,
            ),
          );

          router.refresh();
        } catch (
          error
        ) {
          toast.error(
            error instanceof
              Error
              ? error.message
              : "Une erreur est survenue.",
          );
        }
      },
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        {statistics.map(
          (
            statistic,
          ) => (
            <div
              key={
                statistic.label
              }
              className="rounded-3xl border border-pink-100 bg-white p-5 shadow-sm"
            >
              <p className="text-sm text-zinc-500">
                {
                  statistic.label
                }
              </p>

              <p className="mt-2 text-3xl font-semibold">
                {
                  statistic.value
                }
              </p>
            </div>
          ),
        )}
      </div>

      <div className="flex flex-col gap-3 rounded-3xl border border-pink-100 bg-white p-5 shadow-sm md:flex-row">
        <label className="relative flex-1">
          <span className="sr-only">
            Rechercher un rendez-vous
          </span>

          <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-zinc-400" />

          <input
            value={
              search
            }
            onChange={(
              event,
            ) => {
              setSearch(
                event.target.value,
              );
            }}
            placeholder="Référence, cliente, e-mail ou prestation…"
            className="w-full rounded-2xl border border-zinc-200 py-3 pl-12 pr-4 outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
          />
        </label>

        <label>
          <span className="sr-only">
            Filtrer par statut
          </span>

          <select
            value={
              status
            }
            onChange={(
              event,
            ) => {
              setStatus(
                event.target.value as
                  | "ALL"
                  | AdminAppointmentStatus,
              );
            }}
            className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100 md:w-auto"
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
                  {
                    label
                  }
                </option>
              ),
            )}
          </select>
        </label>
      </div>

      <div className="overflow-hidden rounded-3xl border border-pink-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-zinc-50 text-xs uppercase text-zinc-500">
              <tr>
                <th className="px-5 py-4">
                  Rendez-vous
                </th>

                <th className="px-5 py-4">
                  Cliente
                </th>

                <th className="px-5 py-4">
                  Prestations
                </th>

                <th className="px-5 py-4">
                  Statut
                </th>

                <th className="px-5 py-4">
                  Montant
                </th>

                <th className="px-5 py-4">
                  <span className="sr-only">
                    Actions
                  </span>
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-zinc-100">
              {filtered.map(
                (
                  appointment,
                ) => (
                  <tr
                    key={
                      appointment.id
                    }
                    className="transition hover:bg-pink-50/40"
                  >
                    <td className="px-5 py-4">
                      <b>
                        {
                          appointment.reference
                        }
                      </b>

                      <p className="text-zinc-500">
                        {date(
                          appointment.startsAt,
                        )}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <b>
                        {
                          appointment.client.firstName
                        }{" "}
                        {
                          appointment.client.lastName
                        }
                      </b>

                      <p className="text-xs text-zinc-500">
                        {
                          appointment.client.email
                        }
                      </p>
                    </td>

                    <td className="max-w-xs px-5 py-4">
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
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          STATUS_STYLES[
                            appointment.status
                          ]
                        }`}
                      >
                        {
                          LABELS[
                            appointment.status
                          ]
                        }
                      </span>
                    </td>

                    <td className="px-5 py-4 font-semibold">
                      {price(
                        appointment.totalPriceCents,
                      )}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          openAppointment(
                            appointment,
                          );
                        }}
                        className="rounded-xl bg-zinc-950 px-4 py-2 font-semibold text-white transition hover:bg-rose-600"
                      >
                        Gérer
                      </button>
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>

        {filtered.length ===
        0 ? (
          <p className="p-10 text-center text-zinc-500">
            Aucun rendez-vous.
          </p>
        ) : null}
      </div>

      {selected ? (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-black/55 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={`Gestion du rendez-vous ${selected.reference}`}
          onMouseDown={(
            event,
          ) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeAppointment();
            }
          }}
        >
          <div className="mx-auto my-6 max-w-4xl overflow-hidden rounded-[2rem] bg-white shadow-2xl">
            <header className="flex items-start justify-between gap-4 border-b p-6">
              <div className="min-w-0">
                <p className="text-sm font-semibold uppercase tracking-wide text-rose-600">
                  {
                    selected.reference
                  }
                </p>

                <h2 className="mt-2 text-2xl font-semibold">
                  {
                    selected.client.firstName
                  }{" "}
                  {
                    selected.client.lastName
                  }
                </h2>

                <p className="mt-1 text-zinc-500">
                  {date(
                    selected.startsAt,
                  )}
                </p>

                <span
                  className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                    STATUS_STYLES[
                      selected.status
                    ]
                  }`}
                >
                  {
                    LABELS[
                      selected.status
                    ]
                  }
                </span>
              </div>

              <button
                type="button"
                onClick={
                  closeAppointment
                }
                disabled={
                  pending
                }
                aria-label="Fermer"
                className="grid size-10 shrink-0 place-items-center rounded-full bg-zinc-100 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X className="size-5" />
              </button>
            </header>

            <div className="border-b px-6 pt-5">
              <div className="grid grid-cols-2 rounded-2xl bg-zinc-100 p-1">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab(
                      "details",
                    );
                  }}
                  className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                    activeTab ===
                    "details"
                      ? "bg-white text-zinc-950 shadow-sm"
                      : "text-zinc-500 hover:text-zinc-950"
                  }`}
                >
                  <Info className="size-4" />
                  Informations
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab(
                      "history",
                    );
                  }}
                  className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                    activeTab ===
                    "history"
                      ? "bg-white text-zinc-950 shadow-sm"
                      : "text-zinc-500 hover:text-zinc-950"
                  }`}
                >
                  <History className="size-4" />
                  Historique
                </button>
              </div>
            </div>

            <div className="p-6">
              {activeTab ===
              "details" ? (
                <div className="space-y-5">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-zinc-50 p-4">
                      <small className="text-zinc-500">
                        Professionnelle
                      </small>

                      <p className="font-semibold">
                        {selected.staff
                          ?.displayName ??
                          "Non attribuée"}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-zinc-50 p-4">
                      <small className="text-zinc-500">
                        Poste
                      </small>

                      <p className="font-semibold">
                        {selected.workstation
                          ?.name ??
                          "Non attribué"}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-zinc-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <b>
                        Prestations
                      </b>

                      <span className="font-semibold text-rose-600">
                        {price(
                          selected.totalPriceCents,
                        )}
                      </span>
                    </div>

                    <ul className="mt-3 space-y-2">
                      {selected.services.map(
                        (
                          service,
                        ) => (
                          <li
                            key={
                              service.id
                            }
                            className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2 text-sm"
                          >
                            <span>
                              {
                                service.serviceName
                              }
                              {service.quantity >
                              1
                                ? ` × ${service.quantity}`
                                : ""}
                            </span>

                            <span className="text-zinc-500">
                              {
                                service.durationMinutes
                              }{" "}
                              min
                            </span>
                          </li>
                        ),
                      )}
                    </ul>
                  </div>

                  {selected.clientComment ? (
                    <div className="rounded-2xl bg-blue-50 p-4 text-blue-950">
                      <b>
                        Commentaire cliente
                      </b>

                      <p className="mt-1 whitespace-pre-wrap">
                        {
                          selected.clientComment
                        }
                      </p>
                    </div>
                  ) : null}

                  <label className="block">
                    <b>
                      Note interne
                    </b>

                    <textarea
                      value={
                        note
                      }
                      onChange={(
                        event,
                      ) => {
                        setNote(
                          event.target.value,
                        );
                      }}
                      rows={
                        4
                      }
                      maxLength={
                        2000
                      }
                      className="mt-2 w-full rounded-2xl border border-zinc-200 p-3 outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
                    />

                    <button
                      type="button"
                      disabled={
                        pending
                      }
                      onClick={() => {
                        run({
                          action:
                            "update_note",
                          adminComment:
                            note,
                        });
                      }}
                      className="mt-2 inline-flex items-center gap-2 rounded-xl border border-zinc-200 px-4 py-2 font-semibold transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {pending ? (
                        <LoaderCircle className="size-4 animate-spin" />
                      ) : (
                        <Save className="size-4" />
                      )}

                      Enregistrer
                    </button>
                  </label>

                  {[
                    "PENDING",
                    "CONFIRMED",
                  ].includes(
                    selected.status,
                  ) ? (
                    <div className="rounded-2xl border border-zinc-200 p-4">
                      <b className="flex items-center gap-2">
                        <CalendarClock className="size-5" />
                        Reprogrammer
                      </b>

                      <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                        <input
                          type="datetime-local"
                          value={
                            startsAt
                          }
                          onChange={(
                            event,
                          ) => {
                            setStartsAt(
                              event.target.value,
                            );
                          }}
                          className="flex-1 rounded-xl border border-zinc-200 p-3 outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
                        />

                        <button
                          type="button"
                          disabled={
                            pending ||
                            !startsAt
                          }
                          onClick={() => {
                            run({
                              action:
                                "reschedule",
                              startsAt,
                              adminComment:
                                note,
                            });
                          }}
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 py-3 font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {pending ? (
                            <LoaderCircle className="size-4 animate-spin" />
                          ) : (
                            <CalendarClock className="size-4" />
                          )}

                          Déplacer
                        </button>
                      </div>
                    </div>
                  ) : null}

                  {[
                    "PENDING",
                    "CONFIRMED",
                    "IN_PROGRESS",
                  ].includes(
                    selected.status,
                  ) ? (
                    <label className="block">
                      <b>
                        Motif du refus ou de l’annulation
                      </b>

                      <textarea
                        value={
                          reason
                        }
                        onChange={(
                          event,
                        ) => {
                          setReason(
                            event.target.value,
                          );
                        }}
                        rows={
                          3
                        }
                        maxLength={
                          500
                        }
                        placeholder="Indiquez le motif de l’action…"
                        className="mt-2 w-full rounded-2xl border border-zinc-200 p-3 outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
                      />
                    </label>
                  ) : null}

                  <div className="flex flex-wrap gap-3 border-t border-zinc-100 pt-5">
                    {selected.status ===
                    "PENDING" ? (
                      <>
                        <button
                          type="button"
                          disabled={
                            pending
                          }
                          onClick={() => {
                            run({
                              action:
                                "confirm",
                              adminComment:
                                note,
                            });
                          }}
                          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <CheckCircle2 className="size-4" />
                          Confirmer
                        </button>

                        <button
                          type="button"
                          disabled={
                            pending
                          }
                          onClick={() => {
                            run({
                              action:
                                "refuse",
                              reason,
                              adminComment:
                                note,
                            });
                          }}
                          className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2 font-semibold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <XCircle className="size-4" />
                          Refuser
                        </button>
                      </>
                    ) : null}

                    {selected.status ===
                    "CONFIRMED" ? (
                      <>
                        <button
                          type="button"
                          disabled={
                            pending
                          }
                          onClick={() => {
                            run({
                              action:
                                "start",
                            });
                          }}
                          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Play className="size-4" />
                          Démarrer
                        </button>

                        <button
                          type="button"
                          disabled={
                            pending
                          }
                          onClick={() => {
                            run({
                              action:
                                "no_show",
                              reason:
                                reason ||
                                undefined,
                            });
                          }}
                          className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 px-4 py-2 font-semibold transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <UserX className="size-4" />
                          Absente
                        </button>
                      </>
                    ) : null}

                    {selected.status ===
                    "IN_PROGRESS" ? (
                      <button
                        type="button"
                        disabled={
                          pending
                        }
                        onClick={() => {
                          run({
                            action:
                              "complete",
                          });
                        }}
                        className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <CheckCircle2 className="size-4" />
                        Terminer
                      </button>
                    ) : null}

                    {[
                      "PENDING",
                      "CONFIRMED",
                      "IN_PROGRESS",
                    ].includes(
                      selected.status,
                    ) ? (
                      <button
                        type="button"
                        disabled={
                          pending
                        }
                        onClick={() => {
                          run({
                            action:
                              "cancel",
                            reason,
                            adminComment:
                              note,
                          });
                        }}
                        className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <XCircle className="size-4" />
                        Annuler
                      </button>
                    ) : null}

                    {pending ? (
                      <div className="inline-flex items-center gap-2 text-sm text-zinc-500">
                        <LoaderCircle className="size-4 animate-spin" />
                        Mise à jour…
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : (
                <AppointmentHistoryTimeline
                  reference={
                    selected.reference
                  }
                  refreshKey={
                    historyRefreshKey
                  }
                />
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}