"use client";

import {
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import {
  AlertTriangle,
  ChevronRight,
  Clock3,
  Gift,
  Home,
  Plus,
  Search,
  Sparkles,
  Trophy,
  UsersRound,
} from "lucide-react";

import type {
  AdminContest,
  AdminContestFilterStatus,
  AdminContestsDashboardData,
} from "@/features/admin/contests/types/admin-contests.types";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

type AdminContestsDashboardProps = {
  data: AdminContestsDashboardData;
};

/* -------------------------------------------------------------------------- */
/*                                CONSTANTES                                  */
/* -------------------------------------------------------------------------- */

const STATUS_LABELS = {
  DRAFT:
    "Brouillon",

  SCHEDULED:
    "Planifié",

  ACTIVE:
    "Actif",

  CLOSED:
    "Clôturé",

  DRAWN:
    "Tirage effectué",

  CANCELLED:
    "Annulé",
} as const;

const STATUS_CLASSES = {
  DRAFT:
    "bg-zinc-100 text-zinc-600",

  SCHEDULED:
    "bg-blue-50 text-blue-700",

  ACTIVE:
    "bg-emerald-50 text-emerald-700",

  CLOSED:
    "bg-amber-50 text-amber-700",

  DRAWN:
    "bg-violet-50 text-violet-700",

  CANCELLED:
    "bg-red-50 text-red-700",
} as const;

/* -------------------------------------------------------------------------- */
/*                                  OUTILS                                    */
/* -------------------------------------------------------------------------- */

function formatDate(
  value: string,
): string {
  return new Intl.DateTimeFormat(
    "fr-FR",
    {
      dateStyle:
        "medium",

      timeStyle:
        "short",
    },
  ).format(
    new Date(
      value,
    ),
  );
}

function getWinnerName(
  contest: AdminContest,
): string | null {
  if (
    !contest.winner
  ) {
    return null;
  }

  return [
    contest.winner.user
      .firstName,

    contest.winner.user
      .lastName,
  ]
    .filter(Boolean)
    .join(" ")
    .trim() ||
    contest.winner.user.email;
}

/* -------------------------------------------------------------------------- */
/*                                 COMPOSANT                                  */
/* -------------------------------------------------------------------------- */

export function AdminContestsDashboard({
  data,
}: AdminContestsDashboardProps) {
  const [
    search,
    setSearch,
  ] =
    useState("");

  const [
    status,
    setStatus,
  ] =
    useState<AdminContestFilterStatus>(
      "ALL",
    );

  const [
    homepageOnly,
    setHomepageOnly,
  ] =
    useState(false);

  const filteredContests =
    useMemo(
      () => {
        const normalizedSearch =
          search
            .trim()
            .toLowerCase();

        return data.contests.filter(
          (
            contest,
          ) => {
            if (
              status !==
                "ALL" &&
              contest.status !==
                status
            ) {
              return false;
            }

            if (
              homepageOnly &&
              !contest.showOnHomepage
            ) {
              return false;
            }

            if (
              !normalizedSearch
            ) {
              return true;
            }

            return [
              contest.title,
              contest.slug,
              contest.prize,
              contest.description,
            ].some(
              (
                value,
              ) =>
                value
                  .toLowerCase()
                  .includes(
                    normalizedSearch,
                  ),
            );
          },
        );
      },
      [
        data.contests,
        homepageOnly,
        search,
        status,
      ],
    );

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px] space-y-6">
        <section className="relative overflow-hidden rounded-[2rem] bg-zinc-950 px-6 py-8 text-white shadow-xl sm:px-8 lg:px-10">
          <div className="absolute -right-20 -top-24 size-72 rounded-full bg-violet-500/30 blur-3xl" />
          <div className="absolute -bottom-28 left-1/3 size-64 rounded-full bg-rose-500/20 blur-3xl" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-violet-100">
                <Trophy className="size-4" />

                Marketing
              </span>

              <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
                Jeux concours
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-300">
                Créez des concours, suivez les participations et effectuez les tirages au sort.
              </p>
            </div>

            <Link
              href="/admin/concours/nouveau"
              className="inline-flex h-11 w-fit items-center gap-2 rounded-xl bg-white px-5 text-sm font-black text-zinc-950 transition hover:bg-violet-50"
            >
              <Plus className="size-4" />

              Nouveau concours
            </Link>
          </div>
        </section>

        {data.alerts.length >
        0 ? (
          <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {data.alerts.map(
              (
                alert,
              ) => (
                <Link
                  key={alert.id}
                  href={alert.href}
                  className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-800 transition hover:-translate-y-0.5 hover:shadow-sm"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/80">
                    <AlertTriangle className="size-5" />
                  </span>

                  <span className="min-w-0 flex-1">
                    <strong className="block text-sm">
                      {alert.title}
                    </strong>

                    <span className="mt-1 block text-xs leading-5 opacity-80">
                      {
                        alert.description
                      }
                    </span>
                  </span>

                  <ChevronRight className="mt-2 size-4" />
                </Link>
              ),
            )}
          </section>
        ) : null}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label:
                "Total concours",

              value:
                data.metrics
                  .totalContests,

              description:
                `${data.metrics.activeContests} actuellement actifs`,

              icon:
                <Trophy className="size-5" />,
            },
            {
              label:
                "Participations",

              value:
                data.metrics
                  .totalParticipants,

              description:
                `${data.metrics.participantsThisMonth} ce mois-ci`,

              icon:
                <UsersRound className="size-5" />,
            },
            {
              label:
                "Tirages en attente",

              value:
                data.metrics
                  .contestsAwaitingDraw,

              description:
                "Concours terminés sans gagnante",

              icon:
                <Clock3 className="size-5" />,
            },
            {
              label:
                "Sur l’accueil",

              value:
                data.metrics
                  .contestsShownOnHomepage,

              description:
                "Concours mis en avant",

              icon:
                <Home className="size-5" />,
            },
          ].map(
            (
              metric,
            ) => (
              <article
                key={metric.label}
                className="rounded-[1.5rem] border border-zinc-200 bg-white p-5 shadow-sm"
              >
                <span className="flex size-11 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                  {metric.icon}
                </span>

                <p className="mt-4 text-sm font-bold text-zinc-500">
                  {metric.label}
                </p>

                <p className="mt-1 text-3xl font-black text-zinc-950">
                  {metric.value}
                </p>

                <p className="mt-2 text-xs text-zinc-500">
                  {
                    metric.description
                  }
                </p>
              </article>
            ),
          )}
        </section>

        <section className="rounded-[1.75rem] border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="grid gap-3 lg:grid-cols-[minmax(260px,1fr)_220px_auto]">
            <label className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />

              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value,
                  )
                }
                placeholder="Rechercher un concours..."
                className="h-11 w-full rounded-xl border border-zinc-200 pl-10 pr-3 text-sm outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
              />
            </label>

            <select
              value={status}
              onChange={(event) =>
                setStatus(
                  event.target
                    .value as AdminContestFilterStatus,
                )
              }
              className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
            >
              <option value="ALL">
                Tous les statuts
              </option>

              {Object.entries(
                STATUS_LABELS,
              ).map(
                ([
                  value,
                  label,
                ]) => (
                  <option
                    key={value}
                    value={value}
                  >
                    {label}
                  </option>
                ),
              )}
            </select>

            <button
              type="button"
              onClick={() =>
                setHomepageOnly(
                  (
                    current,
                  ) =>
                    !current,
                )
              }
              className={`h-11 rounded-xl border px-4 text-sm font-black transition ${
                homepageOnly
                  ? "border-violet-600 bg-violet-600 text-white"
                  : "border-zinc-200 bg-white text-zinc-700"
              }`}
            >
              Page d’accueil
            </button>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredContests.map(
            (
              contest,
            ) => {
              const winnerName =
                getWinnerName(
                  contest,
                );

              return (
                <article
                  key={contest.id}
                  className="overflow-hidden rounded-[1.75rem] border border-zinc-200 bg-white shadow-sm"
                >
                  <div className="relative h-40 bg-gradient-to-br from-violet-100 via-rose-50 to-amber-50">
                    {contest.imageUrl ? (
                      <img
                        src={
                          contest.imageUrl
                        }
                        alt={
                          contest.title
                        }
                        className="size-full object-cover"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center">
                        <Gift className="size-12 text-violet-300" />
                      </div>
                    )}

                    <span
                      className={`absolute left-4 top-4 rounded-full px-3 py-1.5 text-xs font-black ${STATUS_CLASSES[contest.status]}`}
                    >
                      {
                        STATUS_LABELS[
                          contest.status
                        ]
                      }
                    </span>

                    {contest.showOnHomepage ? (
                      <span className="absolute right-4 top-4 rounded-full bg-zinc-950/80 px-3 py-1.5 text-xs font-black text-white backdrop-blur">
                        Accueil
                      </span>
                    ) : null}
                  </div>

                  <div className="p-5">
                    <h2 className="text-lg font-black text-zinc-950">
                      {contest.title}
                    </h2>

                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-zinc-500">
                      {
                        contest.description
                      }
                    </p>

                    <div className="mt-4 rounded-2xl bg-violet-50 p-3">
                      <p className="text-xs font-bold uppercase tracking-wide text-violet-600">
                        Lot
                      </p>

                      <p className="mt-1 line-clamp-2 text-sm font-black text-violet-900">
                        {contest.prize}
                      </p>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                      <div className="rounded-xl bg-zinc-50 p-3">
                        <p className="text-zinc-500">
                          Participantes
                        </p>

                        <p className="mt-1 font-black text-zinc-950">
                          {
                            contest.participantCount
                          }
                          {contest.maximumEntries
                            ? ` / ${contest.maximumEntries}`
                            : ""}
                        </p>
                      </div>

                      <div className="rounded-xl bg-zinc-50 p-3">
                        <p className="text-zinc-500">
                          Fin
                        </p>

                        <p className="mt-1 font-black text-zinc-950">
                          {formatDate(
                            contest.endsAt,
                          )}
                        </p>
                      </div>
                    </div>

                    {winnerName ? (
                      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3">
                        <p className="text-xs font-bold text-amber-700">
                          Gagnante
                        </p>

                        <p className="mt-1 text-sm font-black text-amber-900">
                          {winnerName}
                        </p>
                      </div>
                    ) : null}

                    <Link
                      href={`/admin/concours/${contest.id}`}
                      className="mt-5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-zinc-950 px-4 text-sm font-black text-white transition hover:bg-violet-700"
                    >
                      Gérer le concours

                      <ChevronRight className="size-4" />
                    </Link>
                  </div>
                </article>
              );
            },
          )}
        </section>

        {filteredContests.length ===
        0 ? (
          <section className="flex min-h-72 flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-zinc-300 bg-white p-8 text-center">
            <Sparkles className="size-10 text-zinc-300" />

            <h2 className="mt-4 text-lg font-black text-zinc-800">
              Aucun concours trouvé
            </h2>

            <p className="mt-2 text-sm text-zinc-500">
              Modifiez les filtres ou créez un nouveau concours.
            </p>
          </section>
        ) : null}
      </div>
    </main>
  );
}
