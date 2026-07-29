"use client";

import type {
  ReactNode,
} from "react";

import {
  useState,
  useTransition,
} from "react";

import Link from "next/link";
import {
  useRouter,
} from "next/navigation";

import {
  Activity,
  AlertTriangle,
  ArrowRight,
  ChevronRight,
  Coins,
  Crown,
  Gift,
  History,
  LoaderCircle,
  Medal,
  Pause,
  Play,
  RefreshCcw,
  Save,
  Settings2,
  ShieldAlert,
  Sparkles,
  Trophy,
  UserPlus,
  UsersRound,
  X,
  Zap,
} from "lucide-react";

import {
  toast,
} from "sonner";

import {
  adjustVipMemberBalanceAction,
  updateVipConfigurationAction,
} from "@/features/admin/vip/actions/admin-vip.actions";

import type {
  AdminVipAdjustmentInput,
  AdminVipAlert,
  AdminVipConfiguration,
  AdminVipDashboardData,
  AdminVipLeaderboardEntry,
  AdminVipLevel,
  AdminVipMember,
  AdminVipReward,
  AdminVipTransaction,
} from "@/features/admin/vip/types/admin-vip.types";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

type AdminVipClientProps = {
  initialData: AdminVipDashboardData;
};

type VipTab =
  | "OVERVIEW"
  | "CONFIGURATION"
  | "MEMBERS"
  | "LEVELS"
  | "REWARDS"
  | "TRANSACTIONS";

type FieldErrors =
  Record<
    string,
    string[]
  >;

/* -------------------------------------------------------------------------- */
/*                                CONSTANTES                                  */
/* -------------------------------------------------------------------------- */

const TABS: Array<{
  id: VipTab;
  label: string;
  icon: typeof Sparkles;
}> = [
  {
    id: "OVERVIEW",
    label: "Vue d’ensemble",
    icon: Activity,
  },
  {
    id: "CONFIGURATION",
    label: "Configuration",
    icon: Settings2,
  },
  {
    id: "MEMBERS",
    label: "Membres",
    icon: UsersRound,
  },
  {
    id: "LEVELS",
    label: "Niveaux",
    icon: Medal,
  },
  {
    id: "REWARDS",
    label: "Récompenses",
    icon: Gift,
  },
  {
    id: "TRANSACTIONS",
    label: "Transactions",
    icon: History,
  },
];

const STATUS_LABELS = {
  DISABLED:
    "Désactivé",

  PRE_LAUNCH:
    "Pré-lancement",

  ACTIVE:
    "Actif",

  PAUSED:
    "En pause",
} as const;

const STATUS_CLASSES = {
  DISABLED:
    "border-zinc-200 bg-zinc-100 text-zinc-600",

  PRE_LAUNCH:
    "border-violet-200 bg-violet-50 text-violet-700",

  ACTIVE:
    "border-emerald-200 bg-emerald-50 text-emerald-700",

  PAUSED:
    "border-amber-200 bg-amber-50 text-amber-700",
} as const;

const LEVEL_STATUS_LABELS = {
  DRAFT:
    "Brouillon",

  ACTIVE:
    "Actif",

  ARCHIVED:
    "Archivé",
} as const;

const REWARD_STATUS_LABELS = {
  DRAFT:
    "Brouillon",

  ACTIVE:
    "Active",

  INACTIVE:
    "Inactive",

  ARCHIVED:
    "Archivée",
} as const;

const REWARD_TYPE_LABELS = {
  FIXED_DISCOUNT:
    "Réduction fixe",

  PERCENTAGE_DISCOUNT:
    "Réduction en pourcentage",

  FREE_SERVICE:
    "Prestation offerte",

  FREE_NAIL_ART:
    "Nail art offert",

  FREE_PRODUCT:
    "Produit offert",

  GIFT_CARD:
    "Carte cadeau",

  LOYALTY_POINTS:
    "Points fidélité",

  EXPERIENCE_POINTS:
    "Points XP",

  CONTEST_ENTRY:
    "Participation concours",

  SEASON_PASS_XP:
    "XP saisonnier",

  PHYSICAL_GIFT:
    "Cadeau physique",

  VIP_ACCESS:
    "Accès VIP",

  CUSTOM:
    "Personnalisée",
} as const;

/* -------------------------------------------------------------------------- */
/*                                 FORMATAGE                                  */
/* -------------------------------------------------------------------------- */

function formatNumber(
  value: number,
): string {
  return new Intl.NumberFormat(
    "fr-FR",
  ).format(value);
}

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
  ).format(cents / 100);
}

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
    new Date(value),
  );
}

function getInitials(
  firstName: string,
  lastName: string,
): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`
    .trim()
    .toUpperCase() || "VIP";
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

function getTransactionAmountClass(
  amount: number,
): string {
  if (amount > 0) {
    return "text-emerald-600";
  }

  if (amount < 0) {
    return "text-red-600";
  }

  return "text-zinc-500";
}

/* -------------------------------------------------------------------------- */
/*                                COMPOSANTS UI                               */
/* -------------------------------------------------------------------------- */

function SectionHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? (
          <p className="text-xs font-black uppercase tracking-[0.18em] text-violet-600">
            {eyebrow}
          </p>
        ) : null}

        <h2 className="mt-1 text-xl font-black tracking-tight text-zinc-950 sm:text-2xl">
          {title}
        </h2>

        {description ? (
          <p className="mt-1 max-w-3xl text-sm leading-6 text-zinc-500">
            {description}
          </p>
        ) : null}
      </div>

      {action}
    </header>
  );
}

function Panel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-[1.75rem] border border-zinc-200 bg-white p-5 shadow-sm sm:p-6 ${className}`}
    >
      {children}
    </section>
  );
}

function MetricCard({
  label,
  value,
  description,
  icon,
  tone,
}: {
  label: string;
  value: string;
  description: string;
  icon: ReactNode;
  tone:
    | "ROSE"
    | "VIOLET"
    | "BLUE"
    | "EMERALD"
    | "AMBER";
}) {
  const tones = {
    ROSE:
      "bg-rose-100 text-rose-600",

    VIOLET:
      "bg-violet-100 text-violet-600",

    BLUE:
      "bg-blue-100 text-blue-600",

    EMERALD:
      "bg-emerald-100 text-emerald-600",

    AMBER:
      "bg-amber-100 text-amber-700",
  };

  return (
    <article className="rounded-[1.5rem] border border-zinc-200 bg-white p-5 shadow-sm">
      <div
        className={`flex size-11 items-center justify-center rounded-2xl ${tones[tone]}`}
      >
        {icon}
      </div>

      <p className="mt-4 text-sm font-bold text-zinc-500">
        {label}
      </p>

      <p className="mt-1 text-3xl font-black tracking-tight text-zinc-950">
        {value}
      </p>

      <p className="mt-2 text-xs leading-5 text-zinc-500">
        {description}
      </p>
    </article>
  );
}

function ToggleField({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() =>
        onChange(
          !checked,
        )
      }
      className="flex w-full items-start justify-between gap-4 rounded-2xl border border-zinc-200 bg-white p-4 text-left transition hover:border-violet-200 hover:bg-violet-50/30"
    >
      <span>
        <span className="block text-sm font-black text-zinc-900">
          {label}
        </span>

        <span className="mt-1 block text-xs leading-5 text-zinc-500">
          {description}
        </span>
      </span>

      <span
        className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition ${
          checked
            ? "bg-violet-600"
            : "bg-zinc-300"
        }`}
      >
        <span
          className={`absolute top-1 size-4 rounded-full bg-white shadow-sm transition ${
            checked
              ? "left-6"
              : "left-1"
          }`}
        />
      </span>
    </button>
  );
}

function TextField({
  label,
  value,
  onChange,
  name,
  errors,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  name: string;
  errors: FieldErrors;
  type?: "text" | "url";
}) {
  return (
    <label className="block">
      <span className="text-sm font-black text-zinc-800">
        {label}
      </span>

      <input
        type={type}
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value,
          )
        }
        className="mt-2 h-11 w-full rounded-xl border border-zinc-200 px-3.5 text-sm outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
      />

      {errors[name]?.[0] ? (
        <span className="mt-1.5 block text-xs font-semibold text-red-600">
          {errors[name][0]}
        </span>
      ) : null}
    </label>
  );
}

function NumberField({
  label,
  value,
  onChange,
  name,
  errors,
  minimum = 0,
  step = 1,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  name: string;
  errors: FieldErrors;
  minimum?: number;
  step?: number;
}) {
  return (
    <label className="block">
      <span className="text-sm font-black text-zinc-800">
        {label}
      </span>

      <input
        type="number"
        min={minimum}
        step={step}
        value={value}
        onChange={(event) =>
          onChange(
            Number(
              event.target.value,
            ),
          )
        }
        className="mt-2 h-11 w-full rounded-xl border border-zinc-200 px-3.5 text-sm outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
      />

      {errors[name]?.[0] ? (
        <span className="mt-1.5 block text-xs font-semibold text-red-600">
          {errors[name][0]}
        </span>
      ) : null}
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{
    value: string;
    label: string;
  }>;
}) {
  return (
    <label className="block">
      <span className="text-sm font-black text-zinc-800">
        {label}
      </span>

      <select
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value,
          )
        }
        className="mt-2 h-11 w-full rounded-xl border border-zinc-200 bg-white px-3.5 text-sm outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
      >
        {options.map(
          (option) => (
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
    </label>
  );
}

function EmptyState({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 p-8 text-center">
      <div className="flex size-12 items-center justify-center rounded-2xl bg-white text-zinc-400 shadow-sm">
        {icon}
      </div>

      <h3 className="mt-4 font-black text-zinc-800">
        {title}
      </h3>

      <p className="mt-1 max-w-md text-sm leading-6 text-zinc-500">
        {description}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  ALERTES                                   */
/* -------------------------------------------------------------------------- */

function VipAlertCard({
  alert,
}: {
  alert: AdminVipAlert;
}) {
  const tones = {
    ROSE:
      "border-rose-200 bg-rose-50 text-rose-700",

    AMBER:
      "border-amber-200 bg-amber-50 text-amber-700",

    BLUE:
      "border-blue-200 bg-blue-50 text-blue-700",

    VIOLET:
      "border-violet-200 bg-violet-50 text-violet-700",

    EMERALD:
      "border-emerald-200 bg-emerald-50 text-emerald-700",
  };

  return (
    <Link
      href={alert.href}
      className={`group flex items-start gap-3 rounded-2xl border p-4 transition hover:-translate-y-0.5 hover:shadow-sm ${tones[alert.tone]}`}
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/70">
        <AlertTriangle className="size-5" />
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex items-start justify-between gap-3">
          <strong className="text-sm">
            {alert.title}
          </strong>

          {alert.count !==
          null ? (
            <span className="rounded-full bg-white px-2 py-0.5 text-xs font-black">
              {alert.count}
            </span>
          ) : null}
        </span>

        <span className="mt-1 block text-xs leading-5 opacity-80">
          {alert.description}
        </span>
      </span>

      <ChevronRight className="mt-2 size-4 shrink-0 transition group-hover:translate-x-0.5" />
    </Link>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  MEMBRES                                   */
/* -------------------------------------------------------------------------- */

function MemberCard({
  member,
  onAdjust,
}: {
  member: AdminVipMember;
  onAdjust: (member: AdminVipMember) => void;
}) {
  return (
    <article className="rounded-2xl border border-zinc-200 bg-white p-4">
      <div className="flex items-start gap-3">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-100 to-rose-100 text-sm font-black text-violet-700">
          {getInitials(
            member.user.firstName,
            member.user.lastName,
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate font-black text-zinc-950">
                {getMemberName(
                  member,
                )}
              </h3>

              <p className="truncate text-xs text-zinc-500">
                {member.user.email}
              </p>
            </div>

            <span
              className={`rounded-full px-2.5 py-1 text-[11px] font-black ${
                member.isSuspended
                  ? "bg-red-50 text-red-600"
                  : member.isActive
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-zinc-100 text-zinc-600"
              }`}
            >
              {member.isSuspended
                ? "Suspendue"
                : member.isActive
                  ? "Active"
                  : "Inactive"}
            </span>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <div className="rounded-xl bg-amber-50 p-2.5">
              <p className="text-[10px] font-bold uppercase text-amber-600">
                Points
              </p>

              <p className="mt-0.5 font-black text-amber-800">
                {formatNumber(
                  member.points,
                )}
              </p>
            </div>

            <div className="rounded-xl bg-violet-50 p-2.5">
              <p className="text-[10px] font-bold uppercase text-violet-600">
                XP
              </p>

              <p className="mt-0.5 font-black text-violet-800">
                {formatNumber(
                  member.experience,
                )}
              </p>
            </div>

            <div className="rounded-xl bg-rose-50 p-2.5">
              <p className="text-[10px] font-bold uppercase text-rose-600">
                Rendez-vous
              </p>

              <p className="mt-0.5 font-black text-rose-800">
                {
                  member.completedAppointments
                }
              </p>
            </div>

            <div className="rounded-xl bg-emerald-50 p-2.5">
              <p className="text-[10px] font-bold uppercase text-emerald-600">
                Dépensé
              </p>

              <p className="mt-0.5 font-black text-emerald-800">
                {formatCurrency(
                  member.totalSpentCents,
                )}
              </p>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-100 pt-3">
            <div>
              <p className="text-xs font-semibold text-zinc-500">
                Niveau
              </p>

              <p className="text-sm font-black text-zinc-900">
                {member.currentLevel
                  ?.name ??
                  "Aucun niveau"}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                onAdjust(
                  member,
                )
              }
              className="inline-flex h-9 items-center gap-2 rounded-xl bg-zinc-950 px-3 text-xs font-black text-white transition hover:bg-violet-700"
            >
              <RefreshCcw className="size-3.5" />

              Ajuster
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

/* -------------------------------------------------------------------------- */
/*                                CLASSEMENT                                  */
/* -------------------------------------------------------------------------- */

function LeaderboardRow({
  entry,
}: {
  entry: AdminVipLeaderboardEntry;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-zinc-100 bg-white p-3">
      <div
        className={`flex size-9 shrink-0 items-center justify-center rounded-xl text-sm font-black ${
          entry.rank === 1
            ? "bg-amber-100 text-amber-700"
            : entry.rank === 2
              ? "bg-zinc-200 text-zinc-700"
              : entry.rank === 3
                ? "bg-orange-100 text-orange-700"
                : "bg-zinc-100 text-zinc-500"
        }`}
      >
        {entry.rank}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-black text-zinc-950">
          {entry.displayName}
        </p>

        <p className="text-xs text-zinc-500">
          {entry.currentLevel
            ?.name ??
            "Sans niveau"}
        </p>
      </div>

      <div className="text-right">
        <p className="text-sm font-black text-violet-700">
          {formatNumber(
            entry.points,
          )}{" "}
          pts
        </p>

        <p className="text-xs text-zinc-500">
          {formatNumber(
            entry.experience,
          )}{" "}
          XP
        </p>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  NIVEAUX                                   */
/* -------------------------------------------------------------------------- */

function LevelCard({
  level,
}: {
  level: AdminVipLevel;
}) {
  return (
    <article className="rounded-2xl border border-zinc-200 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className="flex size-11 items-center justify-center rounded-2xl text-white"
            style={{
              backgroundColor:
                level.color ??
                "#7c3aed",
            }}
          >
            <Medal className="size-5" />
          </span>

          <div>
            <h3 className="font-black text-zinc-950">
              {level.name}
            </h3>

            <p className="text-xs text-zinc-500">
              Niveau {level.level}
            </p>
          </div>
        </div>

        <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-black text-zinc-600">
          {
            LEVEL_STATUS_LABELS[
              level.status
            ]
          }
        </span>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className="rounded-xl bg-violet-50 p-3 text-center">
          <p className="text-xs text-violet-600">
            XP requis
          </p>

          <p className="mt-1 font-black text-violet-800">
            {formatNumber(
              level.requiredXp,
            )}
          </p>
        </div>

        <div className="rounded-xl bg-amber-50 p-3 text-center">
          <p className="text-xs text-amber-600">
            Points requis
          </p>

          <p className="mt-1 font-black text-amber-800">
            {formatNumber(
              level.requiredPoints,
            )}
          </p>
        </div>

        <div className="rounded-xl bg-emerald-50 p-3 text-center">
          <p className="text-xs text-emerald-600">
            Membres
          </p>

          <p className="mt-1 font-black text-emerald-800">
            {level.memberCount}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        <span className="rounded-full bg-zinc-100 px-2.5 py-1 font-semibold text-zinc-600">
          XP ×
          {level.xpMultiplier}
        </span>

        <span className="rounded-full bg-zinc-100 px-2.5 py-1 font-semibold text-zinc-600">
          Points ×
          {level.pointsMultiplier}
        </span>

        {level.priorityBooking ? (
          <span className="rounded-full bg-blue-50 px-2.5 py-1 font-semibold text-blue-700">
            Réservation prioritaire
          </span>
        ) : null}

        {level.birthdayGift ? (
          <span className="rounded-full bg-rose-50 px-2.5 py-1 font-semibold text-rose-700">
            Cadeau anniversaire
          </span>
        ) : null}
      </div>
    </article>
  );
}

/* -------------------------------------------------------------------------- */
/*                               RÉCOMPENSES                                  */
/* -------------------------------------------------------------------------- */

function RewardCard({
  reward,
}: {
  reward: AdminVipReward;
}) {
  return (
    <article className="rounded-2xl border border-zinc-200 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <span className="flex size-11 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
          <Gift className="size-5" />
        </span>

        <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-black text-zinc-600">
          {
            REWARD_STATUS_LABELS[
              reward.status
            ]
          }
        </span>
      </div>

      <h3 className="mt-4 font-black text-zinc-950">
        {reward.name}
      </h3>

      <p className="mt-1 text-xs font-bold text-violet-600">
        {
          REWARD_TYPE_LABELS[
            reward.type
          ]
        }
      </p>

      {reward.shortDescription ? (
        <p className="mt-3 line-clamp-2 text-sm leading-6 text-zinc-500">
          {
            reward.shortDescription
          }
        </p>
      ) : null}

      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-amber-50 p-3">
          <p className="text-xs text-amber-600">
            Points minimum
          </p>

          <p className="mt-1 font-black text-amber-800">
            {reward.minimumPoints ??
              0}
          </p>
        </div>

        <div className="rounded-xl bg-violet-50 p-3">
          <p className="text-xs text-violet-600">
            Débloquée
          </p>

          <p className="mt-1 font-black text-violet-800">
            {reward.unlockedCount} fois
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {reward.featured ? (
          <span className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-600">
            Mise en avant
          </span>
        ) : null}

        {reward.unlimitedStock ? (
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
            Stock illimité
          </span>
        ) : (
          <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-bold text-zinc-600">
            Stock :{" "}
            {reward.remainingStock ??
              0}
          </span>
        )}
      </div>
    </article>
  );
}

/* -------------------------------------------------------------------------- */
/*                               TRANSACTIONS                                 */
/* -------------------------------------------------------------------------- */

function TransactionRow({
  transaction,
}: {
  transaction: AdminVipTransaction;
}) {
  const fullName =
    [
      transaction.user
        .firstName,

      transaction.user
        .lastName,
    ]
      .filter(Boolean)
      .join(" ")
      .trim() ||
    transaction.user.email;

  return (
    <article className="grid gap-3 rounded-2xl border border-zinc-100 bg-white p-4 lg:grid-cols-[minmax(180px,1fr)_minmax(200px,1.4fr)_120px_120px] lg:items-center">
      <div>
        <p className="font-black text-zinc-950">
          {fullName}
        </p>

        <p className="text-xs text-zinc-500">
          {formatDate(
            transaction.createdAt,
          )}
        </p>
      </div>

      <div>
        <p className="text-sm font-bold text-zinc-800">
          {transaction.title}
        </p>

        <p className="mt-0.5 text-xs text-zinc-500">
          {transaction.source}
          {transaction.actorName
            ? ` · ${transaction.actorName}`
            : ""}
        </p>
      </div>

      <p
        className={`font-black ${getTransactionAmountClass(
          transaction.pointsAmount,
        )}`}
      >
        {transaction.pointsAmount >
        0
          ? "+"
          : ""}
        {formatNumber(
          transaction.pointsAmount,
        )}{" "}
        pts
      </p>

      <p
        className={`font-black ${getTransactionAmountClass(
          transaction.xpAmount,
        )}`}
      >
        {transaction.xpAmount >
        0
          ? "+"
          : ""}
        {formatNumber(
          transaction.xpAmount,
        )}{" "}
        XP
      </p>
    </article>
  );
}

/* -------------------------------------------------------------------------- */
/*                           MODALE AJUSTEMENT                                */
/* -------------------------------------------------------------------------- */

function BalanceAdjustmentModal({
  member,
  value,
  onChange,
  errors,
  pending,
  onClose,
  onSubmit,
}: {
  member: AdminVipMember;
  value: AdminVipAdjustmentInput;
  onChange: (
    value: AdminVipAdjustmentInput,
  ) => void;
  errors: FieldErrors;
  pending: boolean;
  onClose: () => void;
  onSubmit: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/60 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-[2rem] bg-white p-5 shadow-2xl sm:p-6">
        <header className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-violet-600">
              Ajustement manuel
            </p>

            <h2 className="mt-1 text-2xl font-black text-zinc-950">
              {getMemberName(
                member,
              )}
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              Solde actuel :{" "}
              {formatNumber(
                member.points,
              )}{" "}
              points et{" "}
              {formatNumber(
                member.experience,
              )}{" "}
              XP.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex size-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
          >
            <X className="size-5" />
          </button>
        </header>

        <div className="mt-6 space-y-5">
          <SelectField
            label="Type de modification"
            value={
              value.adjustmentType
            }
            onChange={(next) =>
              onChange({
                ...value,

                adjustmentType:
                  next as AdminVipAdjustmentInput["adjustmentType"],
              })
            }
            options={[
              {
                value: "ADD",
                label: "Ajouter",
              },
              {
                value: "REMOVE",
                label: "Retirer",
              },
              {
                value: "SET",
                label: "Définir le solde",
              },
            ]}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <NumberField
              label="Points"
              value={value.points}
              onChange={(next) =>
                onChange({
                  ...value,
                  points:
                    next,
                })
              }
              name="points"
              errors={errors}
            />

            <NumberField
              label="XP"
              value={
                value.experience
              }
              onChange={(next) =>
                onChange({
                  ...value,
                  experience:
                    next,
                })
              }
              name="experience"
              errors={errors}
            />
          </div>

          <TextField
            label="Titre de l’opération"
            value={value.title}
            onChange={(next) =>
              onChange({
                ...value,
                title:
                  next,
              })
            }
            name="title"
            errors={errors}
          />

          <label className="block">
            <span className="text-sm font-black text-zinc-800">
              Motif
            </span>

            <textarea
              value={value.reason}
              onChange={(event) =>
                onChange({
                  ...value,

                  reason:
                    event.target.value,
                })
              }
              rows={4}
              className="mt-2 w-full rounded-xl border border-zinc-200 px-3.5 py-3 text-sm outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
            />

            {errors.reason?.[0] ? (
              <span className="mt-1.5 block text-xs font-semibold text-red-600">
                {errors.reason[0]}
              </span>
            ) : null}
          </label>
        </div>

        <footer className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            className="h-11 rounded-xl border border-zinc-200 px-5 text-sm font-black text-zinc-700"
          >
            Annuler
          </button>

          <button
            type="button"
            onClick={onSubmit}
            disabled={pending}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 text-sm font-black text-white disabled:opacity-50"
          >
            {pending ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}

            Enregistrer
          </button>
        </footer>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                             CONFIGURATION                                  */
/* -------------------------------------------------------------------------- */

function ConfigurationView({
  value,
  onChange,
  errors,
  pending,
  onSave,
}: {
  value: AdminVipConfiguration;
  onChange: (
    value: AdminVipConfiguration,
  ) => void;
  errors: FieldErrors;
  pending: boolean;
  onSave: () => void;
}) {
  function update<
    Key extends keyof AdminVipConfiguration,
  >(
    key: Key,
    nextValue: AdminVipConfiguration[Key],
  ): void {
    onChange({
      ...value,
      [key]:
        nextValue,
    });
  }

  function updateModule(
    key: keyof AdminVipConfiguration["modules"],
    checked: boolean,
  ): void {
    update(
      "modules",
      {
        ...value.modules,
        [key]:
          checked,
      },
    );
  }

  return (
    <div
      id="configuration"
      className="space-y-6"
    >
      <Panel>
        <SectionHeader
          eyebrow="État du programme"
          title="Activation du Club VIP"
          description="Contrôlez le lancement et la visibilité du programme de fidélité."
        />

        <div className="mt-6 grid gap-5 md:grid-cols-3">
          <SelectField
            label="État du programme"
            value={
              value.programStatus
            }
            onChange={(next) =>
              update(
                "programStatus",
                next as AdminVipConfiguration["programStatus"],
              )
            }
            options={[
              {
                value:
                  "DISABLED",

                label:
                  "Désactivé",
              },
              {
                value:
                  "PRE_LAUNCH",

                label:
                  "Pré-lancement",
              },
              {
                value:
                  "ACTIVE",

                label:
                  "Actif",
              },
              {
                value:
                  "PAUSED",

                label:
                  "En pause",
              },
            ]}
          />

          <TextField
            label="Nom du Club"
            value={
              value.clubName
            }
            onChange={(next) =>
              update(
                "clubName",
                next,
              )
            }
            name="clubName"
            errors={errors}
          />

          <TextField
            label="Nom des points"
            value={
              value.pointsLabel
            }
            onChange={(next) =>
              update(
                "pointsLabel",
                next,
              )
            }
            name="pointsLabel"
            errors={errors}
          />

          <TextField
            label="Nom des XP"
            value={
              value.xpLabel
            }
            onChange={(next) =>
              update(
                "xpLabel",
                next,
              )
            }
            name="xpLabel"
            errors={errors}
          />

          <NumberField
            label="Multiplicateur de points"
            value={
              value.basePointsMultiplier
            }
            onChange={(next) =>
              update(
                "basePointsMultiplier",
                next,
              )
            }
            name="basePointsMultiplier"
            errors={errors}
            step={0.1}
          />

          <NumberField
            label="Multiplicateur XP"
            value={
              value.baseXpMultiplier
            }
            onChange={(next) =>
              update(
                "baseXpMultiplier",
                next,
              )
            }
            name="baseXpMultiplier"
            errors={errors}
            step={0.1}
          />
        </div>

        <div className="mt-6 grid gap-3 lg:grid-cols-2">
          <ToggleField
            label="Activer le Club VIP"
            description="Active le moteur fidélité dans l’application."
            checked={
              value.clubEnabled
            }
            onChange={(next) =>
              update(
                "clubEnabled",
                next,
              )
            }
          />

          <ToggleField
            label="Ouvrir les inscriptions"
            description="Autoriser la création de nouveaux comptes fidélité."
            checked={
              value.allowNewRegistrations
            }
            onChange={(next) =>
              update(
                "allowNewRegistrations",
                next,
              )
            }
          />

          <ToggleField
            label="Afficher dans le menu public"
            description="Ajouter le Club VIP à la navigation publique."
            checked={
              value.showInPublicMenu
            }
            onChange={(next) =>
              update(
                "showInPublicMenu",
                next,
              )
            }
          />

          <ToggleField
            label="Afficher dans l’espace client"
            description="Ajouter le programme au tableau de bord des clientes."
            checked={
              value.showInClientMenu
            }
            onChange={(next) =>
              update(
                "showInClientMenu",
                next,
              )
            }
          />

          <ToggleField
            label="Afficher la page de pré-lancement"
            description="Présenter une page d’annonce avant l’ouverture."
            checked={
              value.showPreLaunchPage
            }
            onChange={(next) =>
              update(
                "showPreLaunchPage",
                next,
              )
            }
          />

          <ToggleField
            label="Classement public"
            description="Afficher le classement des meilleures membres."
            checked={
              value.publicLeaderboardEnabled
            }
            onChange={(next) =>
              update(
                "publicLeaderboardEnabled",
                next,
              )
            }
          />
        </div>
      </Panel>

      <Panel>
        <SectionHeader
          eyebrow="Fonctionnalités"
          title="Modules du Club VIP"
          description="Activez progressivement les fonctionnalités souhaitées."
        />

        <div className="mt-6 grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
          {[
            {
              key:
                "xpEnabled" as const,
              label:
                "Points XP",
              description:
                "Progression basée sur l’expérience.",
            },
            {
              key:
                "levelsEnabled" as const,
              label:
                "Niveaux",
              description:
                "Paliers et avantages progressifs.",
            },
            {
              key:
                "rewardsEnabled" as const,
              label:
                "Récompenses",
              description:
                "Cadeaux et avantages à débloquer.",
            },
            {
              key:
                "badgesEnabled" as const,
              label:
                "Badges",
              description:
                "Badges à collectionner.",
            },
            {
              key:
                "achievementsEnabled" as const,
              label:
                "Succès",
              description:
                "Objectifs permanents.",
            },
            {
              key:
                "challengesEnabled" as const,
              label:
                "Challenges",
              description:
                "Défis temporaires.",
            },
            {
              key:
                "contestsEnabled" as const,
              label:
                "Concours VIP",
              description:
                "Concours réservés aux membres.",
            },
            {
              key:
                "referralsEnabled" as const,
              label:
                "Parrainage",
              description:
                "Récompenses de recommandation.",
            },
            {
              key:
                "teamsEnabled" as const,
              label:
                "Équipes",
              description:
                "Classements et objectifs collectifs.",
            },
            {
              key:
                "seasonPassEnabled" as const,
              label:
                "Pass saisonnier",
              description:
                "Progression limitée dans le temps.",
            },
            {
              key:
                "vipShopEnabled" as const,
              label:
                "Boutique VIP",
              description:
                "Échange des points contre des cadeaux.",
            },
            {
              key:
                "dailyWheelEnabled" as const,
              label:
                "Roue quotidienne",
              description:
                "Récompense de connexion journalière.",
            },
          ].map(
            (module) => (
              <ToggleField
                key={module.key}
                label={
                  module.label
                }
                description={
                  module.description
                }
                checked={
                  value.modules[
                    module.key
                  ]
                }
                onChange={(next) =>
                  updateModule(
                    module.key,
                    next,
                  )
                }
              />
            ),
          )}
        </div>
      </Panel>

      <Panel>
        <SectionHeader
          eyebrow="Automatisation"
          title="Assistant marketing"
          description="L’assistant peut analyser l’activité du programme et proposer des actions."
        />

        <div className="mt-6 grid gap-3 lg:grid-cols-2">
          <ToggleField
            label="Activer l’assistant"
            description="Autoriser les analyses et recommandations automatiques."
            checked={
              value.assistant
                .assistantEnabled
            }
            onChange={(next) =>
              update(
                "assistant",
                {
                  ...value.assistant,

                  assistantEnabled:
                    next,
                },
              )
            }
          />

          <SelectField
            label="Mode de l’assistant"
            value={
              value.assistant
                .assistantMode
            }
            onChange={(next) =>
              update(
                "assistant",
                {
                  ...value.assistant,

                  assistantMode:
                    next as AdminVipConfiguration["assistant"]["assistantMode"],
                },
              )
            }
            options={[
              {
                value:
                  "DISABLED",

                label:
                  "Désactivé",
              },
              {
                value:
                  "ADVICE_ONLY",

                label:
                  "Conseils uniquement",
              },
              {
                value:
                  "SEMI_AUTOMATIC",

                label:
                  "Semi-automatique",
              },
            ]}
          />
        </div>
      </Panel>

      <div className="sticky bottom-4 z-20 flex justify-end rounded-2xl border border-zinc-200 bg-white/95 p-4 shadow-xl backdrop-blur">
        <button
          type="button"
          onClick={onSave}
          disabled={pending}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-violet-600 px-6 text-sm font-black text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700 disabled:opacity-50"
        >
          {pending ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}

          Enregistrer la configuration
        </button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              COMPOSANT PRINCIPAL                           */
/* -------------------------------------------------------------------------- */

export function AdminVipClient({
  initialData,
}: AdminVipClientProps) {
  const router =
    useRouter();

  const [
    activeTab,
    setActiveTab,
  ] =
    useState<VipTab>(
      "OVERVIEW",
    );

  const [
    configuration,
    setConfiguration,
  ] =
    useState<AdminVipConfiguration>(
      initialData.configuration,
    );

  const [
    selectedMember,
    setSelectedMember,
  ] =
    useState<AdminVipMember | null>(
      null,
    );

  const [
    adjustment,
    setAdjustment,
  ] =
    useState<AdminVipAdjustmentInput>({
      accountId:
        "",

      adjustmentType:
        "ADD",

      points:
        0,

      experience:
        0,

      title:
        "Ajustement manuel",

      reason:
        "",
    });

  const [
    fieldErrors,
    setFieldErrors,
  ] =
    useState<FieldErrors>({});

  const [
    isPending,
    startTransition,
  ] =
    useTransition();

  function openAdjustment(
    member: AdminVipMember,
  ): void {
    setSelectedMember(
      member,
    );

    setFieldErrors({});

    setAdjustment({
      accountId:
        member.id,

      adjustmentType:
        "ADD",

      points:
        0,

      experience:
        0,

      title:
        "Ajustement manuel",

      reason:
        "",
    });
  }

  function saveConfiguration():
    void {
    setFieldErrors({});

    startTransition(() => {
      void (async () => {
        const result =
          await updateVipConfigurationAction(
            configuration,
          );

        if (
          !result.success
        ) {
          setFieldErrors(
            result.fieldErrors ??
              {},
          );

          toast.error(
            result.message,
          );

          return;
        }

        toast.success(
          result.message,
        );

        router.refresh();
      })();
    });
  }

  function saveAdjustment():
    void {
    setFieldErrors({});

    startTransition(() => {
      void (async () => {
        const result =
          await adjustVipMemberBalanceAction(
            adjustment,
          );

        if (
          !result.success
        ) {
          setFieldErrors(
            result.fieldErrors ??
              {},
          );

          toast.error(
            result.message,
          );

          return;
        }

        toast.success(
          result.message,
        );

        setSelectedMember(
          null,
        );

        router.refresh();
      })();
    });
  }

  function renderOverview():
    ReactNode {
    return (
      <div className="space-y-6">
        {initialData.alerts.length >
        0 ? (
          <Panel>
            <SectionHeader
              eyebrow="À configurer"
              title="Alertes du programme"
              description="Éléments nécessaires avant le lancement complet."
            />

            <div className="mt-5 grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
              {initialData.alerts.map(
                (alert) => (
                  <VipAlertCard
                    key={
                      alert.id
                    }
                    alert={
                      alert
                    }
                  />
                ),
              )}
            </div>
          </Panel>
        ) : null}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Membres VIP"
            value={formatNumber(
              initialData.metrics
                .totalMembers,
            )}
            description={`${initialData.metrics.activeMembers} membres actives`}
            icon={
              <UsersRound className="size-5" />
            }
            tone="VIOLET"
          />

          <MetricCard
            label="Points en circulation"
            value={formatNumber(
              initialData.metrics
                .totalPointsInCirculation,
            )}
            description={`${formatNumber(
              initialData.metrics
                .pointsEarnedThisMonth,
            )} gagnés ce mois`}
            icon={
              <Coins className="size-5" />
            }
            tone="AMBER"
          />

          <MetricCard
            label="XP en circulation"
            value={formatNumber(
              initialData.metrics
                .totalExperienceInCirculation,
            )}
            description={`${formatNumber(
              initialData.metrics
                .xpEarnedThisMonth,
            )} XP gagnés ce mois`}
            icon={
              <Zap className="size-5" />
            }
            tone="BLUE"
          />

          <MetricCard
            label="Récompenses actives"
            value={formatNumber(
              initialData.metrics
                .activeRewards,
            )}
            description={`${initialData.metrics.availableClientRewards} récompenses disponibles`}
            icon={
              <Gift className="size-5" />
            }
            tone="ROSE"
          />
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)]">
          <Panel>
            <SectionHeader
              eyebrow="Dernières inscriptions"
              title="Membres récentes"
              action={
                <button
                  type="button"
                  onClick={() =>
                    setActiveTab(
                      "MEMBERS",
                    )
                  }
                  className="inline-flex items-center gap-2 text-sm font-black text-violet-600"
                >
                  Voir toutes

                  <ArrowRight className="size-4" />
                </button>
              }
            />

            <div className="mt-5 grid gap-3 lg:grid-cols-2">
              {initialData
                .recentMembers
                .length > 0 ? (
                initialData.recentMembers.map(
                  (member) => (
                    <MemberCard
                      key={
                        member.id
                      }
                      member={
                        member
                      }
                      onAdjust={
                        openAdjustment
                      }
                    />
                  ),
                )
              ) : (
                <div className="lg:col-span-2">
                  <EmptyState
                    icon={
                      <UserPlus className="size-5" />
                    }
                    title="Aucune membre VIP"
                    description="Les futures inscriptions apparaîtront ici."
                  />
                </div>
              )}
            </div>
          </Panel>

          <Panel>
            <SectionHeader
              eyebrow="Classement"
              title="Top membres"
            />

            <div className="mt-5 space-y-3">
              {initialData.topMembers
                .length > 0 ? (
                initialData.topMembers.map(
                  (entry) => (
                    <LeaderboardRow
                      key={
                        entry.accountId
                      }
                      entry={
                        entry
                      }
                    />
                  ),
                )
              ) : (
                <EmptyState
                  icon={
                    <Trophy className="size-5" />
                  }
                  title="Classement vide"
                  description="Le classement apparaîtra dès les premières inscriptions."
                />
              )}
            </div>
          </Panel>
        </section>

        <Panel>
          <SectionHeader
            eyebrow="Activité"
            title="Dernières transactions"
            action={
              <button
                type="button"
                onClick={() =>
                  setActiveTab(
                    "TRANSACTIONS",
                  )
                }
                className="text-sm font-black text-violet-600"
              >
                Historique complet
              </button>
            }
          />

          <div className="mt-5 space-y-3">
            {initialData
              .recentTransactions
              .length > 0 ? (
              initialData.recentTransactions.map(
                (transaction) => (
                  <TransactionRow
                    key={
                      transaction.id
                    }
                    transaction={
                      transaction
                    }
                  />
                ),
              )
            ) : (
              <EmptyState
                icon={
                  <History className="size-5" />
                }
                title="Aucune transaction"
                description="Les gains et dépenses de points seront visibles ici."
              />
            )}
          </div>
        </Panel>
      </div>
    );
  }

  function renderContent():
    ReactNode {
    switch (
      activeTab
    ) {
      case "OVERVIEW":
        return renderOverview();

      case "CONFIGURATION":
        return (
          <ConfigurationView
            value={
              configuration
            }
            onChange={
              setConfiguration
            }
            errors={
              fieldErrors
            }
            pending={
              isPending
            }
            onSave={
              saveConfiguration
            }
          />
        );

      case "MEMBERS":
        return (
          <Panel
            className=""
          >
            <SectionHeader
              eyebrow="Communauté"
              title="Membres du Club VIP"
              description={`${initialData.metrics.totalMembers} comptes fidélité enregistrés.`}
            />

            <div
              id="membres"
              className="mt-6 grid gap-3 lg:grid-cols-2"
            >
              {initialData.recentMembers
                .length > 0 ? (
                initialData.recentMembers.map(
                  (member) => (
                    <MemberCard
                      key={
                        member.id
                      }
                      member={
                        member
                      }
                      onAdjust={
                        openAdjustment
                      }
                    />
                  ),
                )
              ) : (
                <div className="lg:col-span-2">
                  <EmptyState
                    icon={
                      <UsersRound className="size-5" />
                    }
                    title="Aucune membre"
                    description="Activez le Club VIP et ouvrez les inscriptions."
                  />
                </div>
              )}
            </div>
          </Panel>
        );

      case "LEVELS":
        return (
          <Panel>
            <SectionHeader
              eyebrow="Progression"
              title="Niveaux de fidélité"
              description={`${initialData.metrics.activeLevels} niveaux actifs.`}
            />

            <div
              id="niveaux"
              className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3"
            >
              {initialData.levels
                .length > 0 ? (
                initialData.levels.map(
                  (level) => (
                    <LevelCard
                      key={
                        level.id
                      }
                      level={
                        level
                      }
                    />
                  ),
                )
              ) : (
                <div className="md:col-span-2 xl:col-span-3">
                  <EmptyState
                    icon={
                      <Medal className="size-5" />
                    }
                    title="Aucun niveau créé"
                    description="La gestion détaillée des niveaux sera ajoutée dans la prochaine étape."
                  />
                </div>
              )}
            </div>
          </Panel>
        );

      case "REWARDS":
        return (
          <Panel>
            <SectionHeader
              eyebrow="Avantages"
              title="Récompenses VIP"
              description={`${initialData.metrics.activeRewards} récompenses actives.`}
            />

            <div
              id="recompenses"
              className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3"
            >
              {initialData.rewards
                .length > 0 ? (
                initialData.rewards.map(
                  (reward) => (
                    <RewardCard
                      key={
                        reward.id
                      }
                      reward={
                        reward
                      }
                    />
                  ),
                )
              ) : (
                <div className="md:col-span-2 xl:col-span-3">
                  <EmptyState
                    icon={
                      <Gift className="size-5" />
                    }
                    title="Aucune récompense"
                    description="Les récompenses pourront être créées dans la prochaine étape."
                  />
                </div>
              )}
            </div>
          </Panel>
        );

      case "TRANSACTIONS":
        return (
          <Panel>
            <SectionHeader
              eyebrow="Journal"
              title="Transactions fidélité"
              description="Historique récent des points et XP."
            />

            <div className="mt-6 space-y-3">
              {initialData
                .recentTransactions
                .length > 0 ? (
                initialData.recentTransactions.map(
                  (transaction) => (
                    <TransactionRow
                      key={
                        transaction.id
                      }
                      transaction={
                        transaction
                      }
                    />
                  ),
                )
              ) : (
                <EmptyState
                  icon={
                    <History className="size-5" />
                  }
                  title="Aucune transaction"
                  description="Les opérations du Club VIP seront enregistrées ici."
                />
              )}
            </div>
          </Panel>
        );
    }
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,#faf5ff_0%,#ffffff_45%,#fff1f2_100%)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1600px] space-y-6">
        <section className="relative overflow-hidden rounded-[2rem] bg-zinc-950 px-6 py-8 text-white shadow-2xl sm:px-8 lg:px-10">
          <div className="absolute -right-20 -top-24 size-72 rounded-full bg-violet-500/25 blur-3xl" />
          <div className="absolute -bottom-28 left-1/3 size-64 rounded-full bg-rose-500/20 blur-3xl" />

          <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-violet-100">
                <Crown className="size-4" />

                Programme fidélité
              </span>

              <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                {
                  configuration.clubName
                }
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-300 sm:text-base">
                Gérez les membres, les points, l’expérience, les niveaux et les récompenses du salon.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-black ${STATUS_CLASSES[configuration.programStatus]}`}
              >
                {configuration.programStatus ===
                "ACTIVE" ? (
                  <Play className="size-4" />
                ) : configuration.programStatus ===
                  "PAUSED" ? (
                  <Pause className="size-4" />
                ) : (
                  <ShieldAlert className="size-4" />
                )}

                {
                  STATUS_LABELS[
                    configuration
                      .programStatus
                  ]
                }
              </span>

              <button
                type="button"
                onClick={() =>
                  setActiveTab(
                    "CONFIGURATION",
                  )
                }
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-white px-5 text-sm font-black text-zinc-950"
              >
                <Settings2 className="size-4" />

                Configurer
              </button>
            </div>
          </div>
        </section>

        <nav className="flex gap-2 overflow-x-auto rounded-2xl border border-zinc-200 bg-white p-2 shadow-sm">
          {TABS.map(
            (tab) => {
              const Icon =
                tab.icon;

              const active =
                tab.id ===
                activeTab;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(
                      tab.id,
                    );

                    setFieldErrors(
                      {},
                    );
                  }}
                  className={`inline-flex h-11 shrink-0 items-center gap-2 rounded-xl px-4 text-sm font-black transition ${
                    active
                      ? "bg-violet-600 text-white shadow-md shadow-violet-200"
                      : "text-zinc-600 hover:bg-zinc-100"
                  }`}
                >
                  <Icon className="size-4" />

                  {tab.label}
                </button>
              );
            },
          )}
        </nav>

        {renderContent()}
      </div>

      {selectedMember ? (
        <BalanceAdjustmentModal
          member={
            selectedMember
          }
          value={
            adjustment
          }
          onChange={
            setAdjustment
          }
          errors={
            fieldErrors
          }
          pending={
            isPending
          }
          onClose={() => {
            setSelectedMember(
              null,
            );

            setFieldErrors(
              {},
            );
          }}
          onSubmit={
            saveAdjustment
          }
        />
      ) : null}
    </main>
  );
}
