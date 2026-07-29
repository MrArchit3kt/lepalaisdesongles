"use client";

import {
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import {
  ChevronRight,
  CircleOff,
  Crown,
  Gift,
  Search,
  ShieldAlert,
  Sparkles,
  Star,
  Trophy,
  UserRound,
  UsersRound,
} from "lucide-react";

import type {
  AdminVipMember,
} from "@/features/admin/vip/types/admin-vip.types";

import type {
  AdminVipMemberStatusFilter,
  AdminVipMembersPageData,
} from "@/features/admin/vip/types/admin-vip-member.types";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

type AdminVipMembersManagerProps = {
  data: AdminVipMembersPageData;
};

/* -------------------------------------------------------------------------- */
/*                                CONSTANTES                                  */
/* -------------------------------------------------------------------------- */

const STATUS_OPTIONS: Array<{
  value: AdminVipMemberStatusFilter;
  label: string;
}> = [
  {
    value:
      "ALL",

    label:
      "Tous les statuts",
  },
  {
    value:
      "ACTIVE",

    label:
      "Actifs",
  },
  {
    value:
      "SUSPENDED",

    label:
      "Suspendus",
  },
  {
    value:
      "INACTIVE",

    label:
      "Inactifs",
  },
];

/* -------------------------------------------------------------------------- */
/*                                  OUTILS                                    */
/* -------------------------------------------------------------------------- */

function formatCurrency(
  cents: number,
): string {
  return new Intl.NumberFormat(
    "fr-FR",
    {
      style:
        "currency",

      currency:
        "EUR",
    },
  ).format(
    cents /
      100,
  );
}

function formatDate(
  value: string | null,
): string {
  if (!value) {
    return "Jamais";
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
    new Date(
      value,
    ),
  );
}

function getMemberName(
  member: AdminVipMember,
): string {
  return [
    member.user.firstName,
    member.user.lastName,
  ]
    .filter(Boolean)
    .join(" ")
    .trim() ||
    member.user.email;
}

function getMemberInitials(
  member: AdminVipMember,
): string {
  const firstName =
    member.user.firstName
      .trim()
      .charAt(
        0,
      );

  const lastName =
    member.user.lastName
      .trim()
      .charAt(
        0,
      );

  const initials =
    `${firstName}${lastName}`
      .trim()
      .toUpperCase();

  return initials ||
    member.user.email
      .charAt(
        0,
      )
      .toUpperCase();
}

function getMemberStatus(
  member: AdminVipMember,
): Exclude<
  AdminVipMemberStatusFilter,
  "ALL"
> {
  if (
    member.isSuspended
  ) {
    return "SUSPENDED";
  }

  if (
    !member.isActive
  ) {
    return "INACTIVE";
  }

  return "ACTIVE";
}

function getStatusLabel(
  member: AdminVipMember,
): string {
  const status =
    getMemberStatus(
      member,
    );

  switch (
    status
  ) {
    case "ACTIVE":
      return "Actif";

    case "SUSPENDED":
      return "Suspendu";

    case "INACTIVE":
      return "Inactif";
  }
}

function getStatusClass(
  member: AdminVipMember,
): string {
  const status =
    getMemberStatus(
      member,
    );

  switch (
    status
  ) {
    case "ACTIVE":
      return "bg-emerald-50 text-emerald-700";

    case "SUSPENDED":
      return "bg-amber-50 text-amber-700";

    case "INACTIVE":
      return "bg-zinc-100 text-zinc-600";
  }
}

function getProgressPercent(
  member: AdminVipMember,
  levels: AdminVipMembersPageData["levels"],
): number {
  if (
    levels.length ===
    0
  ) {
    return 0;
  }

  const currentLevel =
    member.currentLevel;

  const nextLevel =
    levels.find(
      (
        level,
      ) =>
        level.level >
        (
          currentLevel?.level ??
          0
        ),
    );

  if (
    !nextLevel
  ) {
    return 100;
  }

  const currentRequiredXp =
    currentLevel?.requiredXp ??
    0;

  const requiredDifference =
    Math.max(
      nextLevel.requiredXp -
        currentRequiredXp,
      1,
    );

  const memberDifference =
    Math.max(
      member.experience -
        currentRequiredXp,
      0,
    );

  return Math.min(
    Math.round(
      (
        memberDifference /
        requiredDifference
      ) *
        100,
    ),
    100,
  );
}

/* -------------------------------------------------------------------------- */
/*                                COMPOSANT                                   */
/* -------------------------------------------------------------------------- */

export function AdminVipMembersManager({
  data,
}: AdminVipMembersManagerProps) {
  const [
    search,
    setSearch,
  ] =
    useState("");

  const [
    status,
    setStatus,
  ] =
    useState<AdminVipMemberStatusFilter>(
      "ALL",
    );

  const [
    levelId,
    setLevelId,
  ] =
    useState("");

  const filteredMembers =
    useMemo(
      () => {
        const normalizedSearch =
          search
            .trim()
            .toLowerCase();

        return data.members.filter(
          (
            member,
          ) => {
            if (
              status !==
                "ALL" &&
              getMemberStatus(
                member,
              ) !==
                status
            ) {
              return false;
            }

            if (
              levelId &&
              member.currentLevel
                ?.id !==
                levelId
            ) {
              return false;
            }

            if (
              !normalizedSearch
            ) {
              return true;
            }

            return [
              getMemberName(
                member,
              ),
              member.user.email,
              member.user.phone ??
                "",
              member.memberNumber,
              member.referralCode,
              member.currentLevel
                ?.name ??
                "",
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
        data.members,
        levelId,
        search,
        status,
      ],
    );

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <article className="rounded-[1.5rem] border border-zinc-200 bg-white p-5 shadow-sm">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
            <UsersRound className="size-5" />
          </span>

          <p className="mt-4 text-sm font-bold text-zinc-500">
            Membres VIP
          </p>

          <p className="mt-1 text-3xl font-black text-zinc-950">
            {
              data.metrics
                .totalMembers
            }
          </p>

          <p className="mt-2 text-xs text-zinc-500">
            {
              data.metrics
                .newMembersThisMonth
            }{" "}
            nouvelle(s) ce mois
          </p>
        </article>

        <article className="rounded-[1.5rem] border border-zinc-200 bg-white p-5 shadow-sm">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <Sparkles className="size-5" />
          </span>

          <p className="mt-4 text-sm font-bold text-zinc-500">
            Membres actifs
          </p>

          <p className="mt-1 text-3xl font-black text-zinc-950">
            {
              data.metrics
                .activeMembers
            }
          </p>
        </article>

        <article className="rounded-[1.5rem] border border-zinc-200 bg-white p-5 shadow-sm">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
            <ShieldAlert className="size-5" />
          </span>

          <p className="mt-4 text-sm font-bold text-zinc-500">
            Suspendus
          </p>

          <p className="mt-1 text-3xl font-black text-zinc-950">
            {
              data.metrics
                .suspendedMembers
            }
          </p>
        </article>

        <article className="rounded-[1.5rem] border border-zinc-200 bg-white p-5 shadow-sm">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <Star className="size-5" />
          </span>

          <p className="mt-4 text-sm font-bold text-zinc-500">
            Points disponibles
          </p>

          <p className="mt-1 text-3xl font-black text-zinc-950">
            {data.metrics.totalPoints.toLocaleString(
              "fr-FR",
            )}
          </p>
        </article>

        <article className="rounded-[1.5rem] border border-zinc-200 bg-white p-5 shadow-sm">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
            <Gift className="size-5" />
          </span>

          <p className="mt-4 text-sm font-bold text-zinc-500">
            Récompenses disponibles
          </p>

          <p className="mt-1 text-3xl font-black text-zinc-950">
            {
              data.metrics
                .totalRewardsAvailable
            }
          </p>

          <p className="mt-2 text-xs text-zinc-500">
            {
              data.metrics
                .totalRewardsUsed
            }{" "}
            utilisée(s)
          </p>
        </article>
      </section>

      <section className="rounded-[1.75rem] border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
        <header>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-violet-600">
            Membres du Club
          </p>

          <h2 className="mt-1 text-2xl font-black text-zinc-950">
            Comptes fidélité
          </h2>

          <p className="mt-2 text-sm leading-6 text-zinc-500">
            Consultez les niveaux, soldes, dépenses et activités des clientes.
          </p>
        </header>

        <div className="mt-6 grid gap-3 lg:grid-cols-[minmax(260px,1fr)_220px_260px]">
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
              placeholder="Nom, email, téléphone, numéro membre..."
              className="h-11 w-full rounded-xl border border-zinc-200 pl-10 pr-3 text-sm outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
            />
          </label>

          <select
            value={status}
            onChange={(event) =>
              setStatus(
                event.target
                  .value as AdminVipMemberStatusFilter,
              )
            }
            className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
          >
            {STATUS_OPTIONS.map(
              (
                option,
              ) => (
                <option
                  key={
                    option.value
                  }
                  value={
                    option.value
                  }
                >
                  {option.label}
                </option>
              ),
            )}
          </select>

          <select
            value={levelId}
            onChange={(event) =>
              setLevelId(
                event.target.value,
              )
            }
            className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
          >
            <option value="">
              Tous les niveaux
            </option>

            {data.levels.map(
              (
                level,
              ) => (
                <option
                  key={level.id}
                  value={level.id}
                >
                  Niveau{" "}
                  {level.level} —{" "}
                  {level.name}
                </option>
              ),
            )}
          </select>
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-2">
          {filteredMembers.map(
            (
              member,
            ) => {
              const progress =
                getProgressPercent(
                  member,
                  data.levels,
                );

              return (
                <article
                  key={member.id}
                  className="rounded-[1.5rem] border border-zinc-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex min-w-0 items-center gap-3">
                      {member.user.image ? (
                        <img
                          src={
                            member.user
                              .image
                          }
                          alt={getMemberName(
                            member,
                          )}
                          className="size-12 shrink-0 rounded-2xl object-cover"
                        />
                      ) : (
                        <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-violet-100 text-sm font-black text-violet-700">
                          {getMemberInitials(
                            member,
                          )}
                        </span>
                      )}

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="truncate text-lg font-black text-zinc-950">
                            {getMemberName(
                              member,
                            )}
                          </h3>

                          <span
                            className={`rounded-full px-2.5 py-1 text-[11px] font-black ${getStatusClass(
                              member,
                            )}`}
                          >
                            {getStatusLabel(
                              member,
                            )}
                          </span>
                        </div>

                        <p className="mt-1 truncate text-sm text-zinc-500">
                          {
                            member.user
                              .email
                          }
                        </p>

                        <p className="mt-1 text-xs font-bold text-zinc-400">
                          N°{" "}
                          {
                            member.memberNumber
                          }
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <span
                        className="flex size-11 items-center justify-center rounded-2xl text-white"
                        style={{
                          backgroundColor:
                            member.currentLevel
                              ?.color ??
                            "#71717a",
                        }}
                      >
                        {member.currentLevel ? (
                          <Crown className="size-5" />
                        ) : (
                          <UserRound className="size-5" />
                        )}
                      </span>

                      <div>
                        <p className="text-xs font-bold text-zinc-400">
                          Niveau
                        </p>

                        <p className="font-black text-zinc-900">
                          {member.currentLevel
                            ?.name ??
                            "Non attribué"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    <div className="rounded-xl bg-violet-50 p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-violet-500">
                        Points
                      </p>

                      <p className="mt-1 font-black text-violet-950">
                        {member.points.toLocaleString(
                          "fr-FR",
                        )}
                      </p>
                    </div>

                    <div className="rounded-xl bg-blue-50 p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-blue-500">
                        XP
                      </p>

                      <p className="mt-1 font-black text-blue-950">
                        {member.experience.toLocaleString(
                          "fr-FR",
                        )}
                      </p>
                    </div>

                    <div className="rounded-xl bg-emerald-50 p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-500">
                        Dépensé
                      </p>

                      <p className="mt-1 font-black text-emerald-950">
                        {formatCurrency(
                          member.totalSpentCents,
                        )}
                      </p>
                    </div>

                    <div className="rounded-xl bg-amber-50 p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-amber-500">
                        Récompenses
                      </p>

                      <p className="mt-1 font-black text-amber-950">
                        {
                          member.totalRewardsUnlocked
                        }
                      </p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center justify-between gap-3 text-xs">
                      <span className="font-bold text-zinc-500">
                        Progression du niveau
                      </span>

                      <span className="font-black text-violet-700">
                        {progress} %
                      </span>
                    </div>

                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-100">
                      <div
                        className="h-full rounded-full bg-violet-600 transition-all"
                        style={{
                          width:
                            `${progress}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="mt-5 grid gap-2 text-xs sm:grid-cols-3">
                    <div className="rounded-xl border border-zinc-100 p-3">
                      <p className="text-zinc-400">
                        Rendez-vous terminés
                      </p>

                      <p className="mt-1 font-black text-zinc-900">
                        {
                          member.completedAppointments
                        }
                      </p>
                    </div>

                    <div className="rounded-xl border border-zinc-100 p-3">
                      <p className="text-zinc-400">
                        Parrainages
                      </p>

                      <p className="mt-1 font-black text-zinc-900">
                        {
                          member.totalReferrals
                        }
                      </p>
                    </div>

                    <div className="rounded-xl border border-zinc-100 p-3">
                      <p className="text-zinc-400">
                        Dernière activité
                      </p>

                      <p className="mt-1 truncate font-black text-zinc-900">
                        {formatDate(
                          member.lastLoginAt ??
                            member.lastAppointmentAt,
                        )}
                      </p>
                    </div>
                  </div>

                  <Link
                    href={`/admin/fidelite/membres/${member.id}`}
                    className="mt-5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-zinc-950 px-4 text-sm font-black text-white transition hover:bg-violet-700"
                  >
                    Gérer le membre

                    <ChevronRight className="size-4" />
                  </Link>
                </article>
              );
            },
          )}
        </div>

        {filteredMembers.length ===
        0 ? (
          <div className="mt-6 flex min-h-64 flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-zinc-300 bg-zinc-50 p-8 text-center">
            <CircleOff className="size-10 text-zinc-300" />

            <h3 className="mt-4 text-lg font-black text-zinc-800">
              Aucun membre trouvé
            </h3>

            <p className="mt-2 max-w-md text-sm leading-6 text-zinc-500">
              Modifiez les filtres ou attendez la création d’un nouveau compte fidélité.
            </p>
          </div>
        ) : null}
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-[1.5rem] border border-zinc-200 bg-white p-5 shadow-sm">
          <Trophy className="size-6 text-violet-600" />

          <p className="mt-4 text-sm font-bold text-zinc-500">
            Expérience cumulée
          </p>

          <p className="mt-1 text-2xl font-black text-zinc-950">
            {data.metrics.totalExperience.toLocaleString(
              "fr-FR",
            )}{" "}
            XP
          </p>
        </article>

        <article className="rounded-[1.5rem] border border-zinc-200 bg-white p-5 shadow-sm">
          <UserRound className="size-6 text-amber-600" />

          <p className="mt-4 text-sm font-bold text-zinc-500">
            Sans niveau
          </p>

          <p className="mt-1 text-2xl font-black text-zinc-950">
            {
              data.metrics
                .membersWithoutLevel
            }
          </p>
        </article>

        <article className="rounded-[1.5rem] border border-zinc-200 bg-white p-5 shadow-sm">
          <CircleOff className="size-6 text-zinc-500" />

          <p className="mt-4 text-sm font-bold text-zinc-500">
            Comptes inactifs
          </p>

          <p className="mt-1 text-2xl font-black text-zinc-950">
            {
              data.metrics
                .inactiveMembers
            }
          </p>
        </article>
      </section>
    </div>
  );
}
