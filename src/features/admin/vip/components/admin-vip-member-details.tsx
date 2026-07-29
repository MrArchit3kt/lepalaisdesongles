"use client";

import type {
  ReactNode,
} from "react";

import {
  useState,
  useTransition,
} from "react";

import {
  Activity,
  BadgePercent,
  CalendarDays,
  CheckCircle2,
  CircleOff,
  Clock3,
  Crown,
  Gift,
  History,
  LoaderCircle,
  Lock,
  Save,
  ShieldAlert,
  Star,
  Trophy,
  UserRound,
  WalletCards,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

import {
  toast,
} from "sonner";

import {
  adjustAdminVipMemberBalanceAction,
  changeAdminVipMemberLevelAction,
  changeAdminVipMemberStatusAction,
  grantAdminVipMemberRewardAction,
} from "@/features/admin/vip/actions/admin-vip-members.actions";

import type {
  AdminVipMemberDetails as AdminVipMemberDetailsType,
  AdminVipMemberLevelOption,
  AdminVipMemberRewardOption,
  AdminVipMemberStatusAction,
} from "@/features/admin/vip/types/admin-vip-member.types";

import type {
  AdminVipActionState,
} from "@/features/admin/vip/types/admin-vip.types";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

type AdminVipMemberDetailsProps = {
  member: AdminVipMemberDetailsType;

  levels: AdminVipMemberLevelOption[];

  rewards: AdminVipMemberRewardOption[];
};

type FieldErrors =
  Record<
    string,
    string[]
  >;

/* -------------------------------------------------------------------------- */
/*                                  OUTILS                                    */
/* -------------------------------------------------------------------------- */

function getMemberName(
  member: AdminVipMemberDetailsType,
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
  member: AdminVipMemberDetailsType,
): string {
  const initials =
    `${member.user.firstName.charAt(0)}${member.user.lastName.charAt(0)}`
      .trim()
      .toUpperCase();

  return initials ||
    member.user.email
      .charAt(0)
      .toUpperCase();
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
  ).format(
    cents /
      100,
  );
}

function formatDate(
  value: string | null,
): string {
  if (!value) {
    return "Non renseigné";
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

function formatEnum(
  value: string,
): string {
  return value
    .toLowerCase()
    .split("_")
    .map(
      (
        word,
      ) =>
        word.charAt(0)
          .toUpperCase() +
        word.slice(1),
    )
    .join(" ");
}

function toIsoDateTime(
  value: string,
): string {
  if (!value) {
    return "";
  }

  const date =
    new Date(
      value,
    );

  return Number.isNaN(
    date.getTime(),
  )
    ? value
    : date.toISOString();
}

function getAccountStatus(
  member: AdminVipMemberDetailsType,
): {
  label: string;
  className: string;
  icon: ReactNode;
} {
  if (
    member.isSuspended
  ) {
    return {
      label:
        "Suspendu",

      className:
        "bg-amber-50 text-amber-700",

      icon:
        <ShieldAlert className="size-4" />,
    };
  }

  if (
    !member.isActive
  ) {
    return {
      label:
        "Inactif",

      className:
        "bg-zinc-100 text-zinc-600",

      icon:
        <CircleOff className="size-4" />,
    };
  }

  return {
    label:
      "Actif",

    className:
      "bg-emerald-50 text-emerald-700",

    icon:
      <CheckCircle2 className="size-4" />,
  };
}

function getRewardStatusClass(
  status: string,
): string {
  switch (
    status
  ) {
    case "AVAILABLE":
      return "bg-emerald-50 text-emerald-700";

    case "RESERVED":
      return "bg-blue-50 text-blue-700";

    case "USED":
      return "bg-violet-50 text-violet-700";

    case "EXPIRED":
      return "bg-zinc-100 text-zinc-600";

    case "CANCELLED":
      return "bg-red-50 text-red-700";

    case "GIFTED":
      return "bg-amber-50 text-amber-700";

    default:
      return "bg-zinc-100 text-zinc-600";
  }
}

function getTransactionClass(
  amount: number,
): string {
  if (
    amount >
    0
  ) {
    return "text-emerald-700";
  }

  if (
    amount <
    0
  ) {
    return "text-red-700";
  }

  return "text-zinc-500";
}

/* -------------------------------------------------------------------------- */
/*                             SOUS-COMPOSANTS                                */
/* -------------------------------------------------------------------------- */

function FieldError({
  name,
  errors,
}: {
  name: string;
  errors: FieldErrors;
}) {
  const message =
    errors[name]?.[0];

  return message ? (
    <p className="mt-1.5 text-xs font-semibold text-red-600">
      {message}
    </p>
  ) : null;
}

function SectionCard({
  title,
  description,
  icon,
  children,
}: {
  title: string;
  description: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[1.75rem] border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
      <header className="flex items-start gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
          {icon}
        </span>

        <div>
          <h2 className="text-lg font-black text-zinc-950">
            {title}
          </h2>

          <p className="mt-1 text-sm leading-6 text-zinc-500">
            {description}
          </p>
        </div>
      </header>

      <div className="mt-6">
        {children}
      </div>
    </section>
  );
}

function ActionButton({
  label,
  icon,
  onClick,
  disabled,
  className,
}: {
  label: string;
  icon: ReactNode;
  onClick: () => void;
  disabled: boolean;
  className: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {icon}

      {label}
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/*                                 COMPOSANT                                  */
/* -------------------------------------------------------------------------- */

export function AdminVipMemberDetails({
  member,
  levels,
  rewards,
}: AdminVipMemberDetailsProps) {
  const router =
    useRouter();

  const [
    isPending,
    startTransition,
  ] =
    useTransition();

  const [
    errors,
    setErrors,
  ] =
    useState<FieldErrors>({});

  const [
    pointsDelta,
    setPointsDelta,
  ] =
    useState("0");

  const [
    experienceDelta,
    setExperienceDelta,
  ] =
    useState("0");

  const [
    adjustmentTitle,
    setAdjustmentTitle,
  ] =
    useState(
      "Ajustement administratif",
    );

  const [
    adjustmentReason,
    setAdjustmentReason,
  ] =
    useState("");

  const [
    selectedLevelId,
    setSelectedLevelId,
  ] =
    useState(
      member.currentLevel?.id ??
      levels[0]?.id ??
      "",
    );

  const [
    levelReason,
    setLevelReason,
  ] =
    useState("");

  const [
    selectedRewardId,
    setSelectedRewardId,
  ] =
    useState(
      rewards[0]?.id ??
      "",
    );

  const [
    rewardExpiresAt,
    setRewardExpiresAt,
  ] =
    useState("");

  const [
    rewardReason,
    setRewardReason,
  ] =
    useState("");

  const [
    statusReason,
    setStatusReason,
  ] =
    useState("");

  const accountStatus =
    getAccountStatus(
      member,
    );

  function executeAction(
    action:
      () =>
        Promise<AdminVipActionState>,

    onSuccess?: () => void,
  ): void {
    setErrors({});

    startTransition(() => {
      void (async () => {
        const result =
          await action();

        if (
          !result.success
        ) {
          setErrors(
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

        onSuccess?.();

        router.refresh();
      })();
    });
  }

  function adjustBalance():
    void {
    executeAction(
      () =>
        adjustAdminVipMemberBalanceAction({
          accountId:
            member.id,

          pointsDelta:
            Number(
              pointsDelta,
            ),

          experienceDelta:
            Number(
              experienceDelta,
            ),

          title:
            adjustmentTitle,

          reason:
            adjustmentReason,
        }),

      () => {
        setPointsDelta(
          "0",
        );

        setExperienceDelta(
          "0",
        );

        setAdjustmentReason(
          "",
        );
      },
    );
  }

  function changeLevel():
    void {
    executeAction(
      () =>
        changeAdminVipMemberLevelAction({
          accountId:
            member.id,

          levelId:
            selectedLevelId,

          reason:
            levelReason,
        }),

      () => {
        setLevelReason(
          "",
        );
      },
    );
  }

  function grantReward():
    void {
    executeAction(
      () =>
        grantAdminVipMemberRewardAction({
          accountId:
            member.id,

          rewardId:
            selectedRewardId,

          expiresAt:
            toIsoDateTime(
              rewardExpiresAt,
            ),

          reason:
            rewardReason,
        }),

      () => {
        setRewardReason(
          "",
        );

        setRewardExpiresAt(
          "",
        );
      },
    );
  }

  function changeStatus(
    action:
      AdminVipMemberStatusAction,
  ): void {
    if (
      !statusReason.trim()
    ) {
      setErrors({
        reason: [
          "Le motif de modification du statut est obligatoire.",
        ],
      });

      toast.error(
        "Renseignez le motif de l’action.",
      );

      return;
    }

    executeAction(
      () =>
        changeAdminVipMemberStatusAction({
          accountId:
            member.id,

          action,

          reason:
            statusReason,
        }),

      () => {
        setStatusReason(
          "",
        );
      },
    );
  }

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[2rem] bg-zinc-950 p-6 text-white shadow-xl sm:p-8">
        <div className="absolute -right-20 -top-24 size-72 rounded-full bg-violet-500/30 blur-3xl" />

        <div className="absolute -bottom-28 left-1/3 size-64 rounded-full bg-rose-500/20 blur-3xl" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <span className="flex size-16 shrink-0 items-center justify-center rounded-[1.4rem] bg-white/10 text-xl font-black text-white">
              {getMemberInitials(
                member,
              )}
            </span>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="truncate text-2xl font-black sm:text-3xl">
                  {getMemberName(
                    member,
                  )}
                </h1>

                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-black ${accountStatus.className}`}
                >
                  {
                    accountStatus.icon
                  }

                  {
                    accountStatus.label
                  }
                </span>
              </div>

              <p className="mt-2 text-sm text-zinc-300">
                {member.user.email}
                {member.user.phone
                  ? ` · ${member.user.phone}`
                  : ""}
              </p>

              <p className="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-zinc-400">
                Membre{" "}
                {member.memberNumber}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
            <span
              className="flex size-12 items-center justify-center rounded-2xl text-white"
              style={{
                backgroundColor:
                  member.currentLevel
                    ?.color ??
                  "#71717a",
              }}
            >
              <Crown className="size-6" />
            </span>

            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-zinc-400">
                Niveau actuel
              </p>

              <p className="mt-1 text-lg font-black">
                {member.currentLevel
                  ?.name ??
                  "Non attribué"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {[
          {
            label:
              "Points disponibles",

            value:
              member.points.toLocaleString(
                "fr-FR",
              ),

            icon:
              <Star className="size-5" />,

            className:
              "bg-violet-50 text-violet-600",
          },
          {
            label:
              "Expérience",

            value:
              `${member.experience.toLocaleString(
                "fr-FR",
              )} XP`,

            icon:
              <Trophy className="size-5" />,

            className:
              "bg-blue-50 text-blue-600",
          },
          {
            label:
              "Total dépensé",

            value:
              formatCurrency(
                member.totalSpentCents,
              ),

            icon:
              <WalletCards className="size-5" />,

            className:
              "bg-emerald-50 text-emerald-600",
          },
          {
            label:
              "Rendez-vous",

            value:
              member.completedAppointments.toLocaleString(
                "fr-FR",
              ),

            icon:
              <CalendarDays className="size-5" />,

            className:
              "bg-rose-50 text-rose-600",
          },
          {
            label:
              "Récompenses",

            value:
              member.totalRewardsUnlocked.toLocaleString(
                "fr-FR",
              ),

            icon:
              <Gift className="size-5" />,

            className:
              "bg-amber-50 text-amber-600",
          },
        ].map(
          (
            metric,
          ) => (
            <article
              key={metric.label}
              className="rounded-[1.5rem] border border-zinc-200 bg-white p-5 shadow-sm"
            >
              <span
                className={`flex size-11 items-center justify-center rounded-2xl ${metric.className}`}
              >
                {metric.icon}
              </span>

              <p className="mt-4 text-sm font-bold text-zinc-500">
                {metric.label}
              </p>

              <p className="mt-1 text-2xl font-black text-zinc-950">
                {metric.value}
              </p>
            </article>
          ),
        )}
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard
          title="Ajuster les points et l’XP"
          description="Ajoutez ou retirez manuellement des points et de l’expérience."
          icon={
            <BadgePercent className="size-5" />
          }
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-black text-zinc-800">
                Variation de points
              </span>

              <input
                type="number"
                value={pointsDelta}
                onChange={(event) =>
                  setPointsDelta(
                    event.target.value,
                  )
                }
                className="mt-2 h-11 w-full rounded-xl border border-zinc-200 px-3.5 text-sm outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
              />

              <FieldError
                name="pointsDelta"
                errors={errors}
              />
            </label>

            <label className="block">
              <span className="text-sm font-black text-zinc-800">
                Variation d’XP
              </span>

              <input
                type="number"
                value={experienceDelta}
                onChange={(event) =>
                  setExperienceDelta(
                    event.target.value,
                  )
                }
                className="mt-2 h-11 w-full rounded-xl border border-zinc-200 px-3.5 text-sm outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
              />

              <FieldError
                name="experienceDelta"
                errors={errors}
              />
            </label>

            <label className="block sm:col-span-2">
              <span className="text-sm font-black text-zinc-800">
                Titre de l’opération
              </span>

              <input
                type="text"
                value={adjustmentTitle}
                onChange={(event) =>
                  setAdjustmentTitle(
                    event.target.value,
                  )
                }
                className="mt-2 h-11 w-full rounded-xl border border-zinc-200 px-3.5 text-sm outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
              />

              <FieldError
                name="title"
                errors={errors}
              />
            </label>

            <label className="block sm:col-span-2">
              <span className="text-sm font-black text-zinc-800">
                Motif
              </span>

              <textarea
                rows={3}
                value={adjustmentReason}
                onChange={(event) =>
                  setAdjustmentReason(
                    event.target.value,
                  )
                }
                className="mt-2 w-full resize-y rounded-xl border border-zinc-200 px-3.5 py-3 text-sm outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
              />

              <FieldError
                name="reason"
                errors={errors}
              />
            </label>
          </div>

          <ActionButton
            label="Enregistrer l’ajustement"
            icon={
              isPending ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )
            }
            onClick={
              adjustBalance
            }
            disabled={isPending}
            className="mt-4 bg-violet-600 text-white hover:bg-violet-700"
          />
        </SectionCard>

        <SectionCard
          title="Changer le niveau VIP"
          description="Attribuez manuellement un autre niveau de fidélité."
          icon={
            <Crown className="size-5" />
          }
        >
          <label className="block">
            <span className="text-sm font-black text-zinc-800">
              Nouveau niveau
            </span>

            <select
              value={selectedLevelId}
              onChange={(event) =>
                setSelectedLevelId(
                  event.target.value,
                )
              }
              className="mt-2 h-11 w-full rounded-xl border border-zinc-200 bg-white px-3.5 text-sm outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
            >
              <option value="">
                Sélectionner un niveau
              </option>

              {levels.map(
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

            <FieldError
              name="levelId"
              errors={errors}
            />
          </label>

          <label className="mt-4 block">
            <span className="text-sm font-black text-zinc-800">
              Motif du changement
            </span>

            <textarea
              rows={4}
              value={levelReason}
              onChange={(event) =>
                setLevelReason(
                  event.target.value,
                )
              }
              className="mt-2 w-full resize-y rounded-xl border border-zinc-200 px-3.5 py-3 text-sm outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
            />

            <FieldError
              name="reason"
              errors={errors}
            />
          </label>

          <ActionButton
            label="Modifier le niveau"
            icon={
              isPending ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <Crown className="size-4" />
              )
            }
            onClick={
              changeLevel
            }
            disabled={
              isPending ||
              !selectedLevelId
            }
            className="mt-4 bg-zinc-950 text-white hover:bg-violet-700"
          />
        </SectionCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard
          title="Attribuer une récompense"
          description="Offrez manuellement une récompense disponible au membre."
          icon={
            <Gift className="size-5" />
          }
        >
          <label className="block">
            <span className="text-sm font-black text-zinc-800">
              Récompense
            </span>

            <select
              value={selectedRewardId}
              onChange={(event) =>
                setSelectedRewardId(
                  event.target.value,
                )
              }
              className="mt-2 h-11 w-full rounded-xl border border-zinc-200 bg-white px-3.5 text-sm outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
            >
              <option value="">
                Sélectionner une récompense
              </option>

              {rewards.map(
                (
                  reward,
                ) => (
                  <option
                    key={reward.id}
                    value={reward.id}
                  >
                    {reward.name}
                    {!reward.unlimitedStock
                      ? ` — ${reward.remainingStock ?? 0} restante(s)`
                      : ""}
                  </option>
                ),
              )}
            </select>

            <FieldError
              name="rewardId"
              errors={errors}
            />
          </label>

          <label className="mt-4 block">
            <span className="text-sm font-black text-zinc-800">
              Expiration personnalisée
            </span>

            <input
              type="datetime-local"
              value={rewardExpiresAt}
              onChange={(event) =>
                setRewardExpiresAt(
                  event.target.value,
                )
              }
              className="mt-2 h-11 w-full rounded-xl border border-zinc-200 px-3.5 text-sm outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
            />

            <FieldError
              name="expiresAt"
              errors={errors}
            />
          </label>

          <label className="mt-4 block">
            <span className="text-sm font-black text-zinc-800">
              Motif de l’attribution
            </span>

            <textarea
              rows={4}
              value={rewardReason}
              onChange={(event) =>
                setRewardReason(
                  event.target.value,
                )
              }
              className="mt-2 w-full resize-y rounded-xl border border-zinc-200 px-3.5 py-3 text-sm outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
            />

            <FieldError
              name="reason"
              errors={errors}
            />
          </label>

          <ActionButton
            label="Attribuer la récompense"
            icon={
              isPending ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <Gift className="size-4" />
              )
            }
            onClick={
              grantReward
            }
            disabled={
              isPending ||
              !selectedRewardId
            }
            className="mt-4 bg-rose-600 text-white hover:bg-rose-700"
          />
        </SectionCard>

        <SectionCard
          title="Statut du compte VIP"
          description="Activez, désactivez ou suspendez temporairement le compte."
          icon={
            <Lock className="size-5" />
          }
        >
          <div
            className={`flex items-center gap-3 rounded-2xl p-4 ${accountStatus.className}`}
          >
            {accountStatus.icon}

            <div>
              <p className="text-xs font-bold uppercase tracking-wide opacity-70">
                Statut actuel
              </p>

              <p className="mt-1 font-black">
                {accountStatus.label}
              </p>

              {member.suspendedAt ? (
                <p className="mt-1 text-xs">
                  Depuis le{" "}
                  {formatDate(
                    member.suspendedAt,
                  )}
                </p>
              ) : null}
            </div>
          </div>

          <label className="mt-4 block">
            <span className="text-sm font-black text-zinc-800">
              Motif obligatoire
            </span>

            <textarea
              rows={4}
              value={statusReason}
              onChange={(event) =>
                setStatusReason(
                  event.target.value,
                )
              }
              className="mt-2 w-full resize-y rounded-xl border border-zinc-200 px-3.5 py-3 text-sm outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
            />

            <FieldError
              name="reason"
              errors={errors}
            />
          </label>

          <div className="mt-4 flex flex-wrap gap-2">
            {member.isSuspended ? (
              <ActionButton
                label="Lever la suspension"
                icon={
                  <CheckCircle2 className="size-4" />
                }
                onClick={() =>
                  changeStatus(
                    "UNSUSPEND",
                  )
                }
                disabled={isPending}
                className="bg-emerald-600 text-white hover:bg-emerald-700"
              />
            ) : (
              <ActionButton
                label="Suspendre"
                icon={
                  <ShieldAlert className="size-4" />
                }
                onClick={() =>
                  changeStatus(
                    "SUSPEND",
                  )
                }
                disabled={isPending}
                className="bg-amber-600 text-white hover:bg-amber-700"
              />
            )}

            {member.isActive ? (
              <ActionButton
                label="Désactiver"
                icon={
                  <CircleOff className="size-4" />
                }
                onClick={() =>
                  changeStatus(
                    "DEACTIVATE",
                  )
                }
                disabled={isPending}
                className="bg-red-600 text-white hover:bg-red-700"
              />
            ) : (
              <ActionButton
                label="Activer"
                icon={
                  <CheckCircle2 className="size-4" />
                }
                onClick={() =>
                  changeStatus(
                    "ACTIVATE",
                  )
                }
                disabled={isPending}
                className="bg-emerald-600 text-white hover:bg-emerald-700"
              />
            )}
          </div>
        </SectionCard>
      </div>

      <SectionCard
        title="Informations du membre"
        description="Statistiques et activité globale du compte fidélité."
        icon={
          <UserRound className="size-5" />
        }
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label:
                "Inscription VIP",

              value:
                formatDate(
                  member.joinedAt,
                ),
            },
            {
              label:
                "Dernière connexion",

              value:
                formatDate(
                  member.lastLoginAt,
                ),
            },
            {
              label:
                "Dernier rendez-vous",

              value:
                formatDate(
                  member.lastAppointmentAt,
                ),
            },
            {
              label:
                "Dernière récompense",

              value:
                formatDate(
                  member.lastRewardClaimedAt,
                ),
            },
            {
              label:
                "Points gagnés",

              value:
                member.totalPointsEarned.toLocaleString(
                  "fr-FR",
                ),
            },
            {
              label:
                "Points dépensés",

              value:
                member.totalPointsSpent.toLocaleString(
                  "fr-FR",
                ),
            },
            {
              label:
                "XP gagné",

              value:
                member.totalExperienceEarned.toLocaleString(
                  "fr-FR",
                ),
            },
            {
              label:
                "XP dépensé",

              value:
                member.experienceSpent.toLocaleString(
                  "fr-FR",
                ),
            },
            {
              label:
                "Avis publiés",

              value:
                member.totalReviews.toLocaleString(
                  "fr-FR",
                ),
            },
            {
              label:
                "Parrainages",

              value:
                member.totalReferrals.toLocaleString(
                  "fr-FR",
                ),
            },
            {
              label:
                "Concours gagnés",

              value:
                member.totalContestWins.toLocaleString(
                  "fr-FR",
                ),
            },
            {
              label:
                "Badges débloqués",

              value:
                member.totalBadges.toLocaleString(
                  "fr-FR",
                ),
            },
          ].map(
            (
              item,
            ) => (
              <article
                key={item.label}
                className="rounded-2xl bg-zinc-50 p-4"
              >
                <p className="text-xs font-bold text-zinc-500">
                  {item.label}
                </p>

                <p className="mt-2 font-black text-zinc-950">
                  {item.value}
                </p>
              </article>
            ),
          )}
        </div>
      </SectionCard>

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard
          title="Historique des transactions"
          description="Mouvements de points, d’XP et opérations administratives."
          icon={
            <Activity className="size-5" />
          }
        >
          <div className="max-h-[640px] space-y-3 overflow-y-auto pr-1">
            {member.transactions.map(
              (
                transaction,
              ) => (
                <article
                  key={transaction.id}
                  className="rounded-2xl border border-zinc-200 p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-black text-zinc-950">
                          {
                            transaction.title
                          }
                        </p>

                        <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-[10px] font-black uppercase text-zinc-600">
                          {formatEnum(
                            transaction.source,
                          )}
                        </span>
                      </div>

                      {transaction.description ? (
                        <p className="mt-2 text-sm leading-5 text-zinc-500">
                          {
                            transaction.description
                          }
                        </p>
                      ) : null}

                      <p className="mt-2 text-xs text-zinc-400">
                        {formatDate(
                          transaction.createdAt,
                        )}
                        {transaction.actorName
                          ? ` · ${transaction.actorName}`
                          : ""}
                      </p>
                    </div>

                    <div className="shrink-0 text-sm sm:text-right">
                      <p
                        className={`font-black ${getTransactionClass(
                          transaction.pointsAmount,
                        )}`}
                      >
                        {transaction.pointsAmount >
                        0
                          ? "+"
                          : ""}
                        {
                          transaction.pointsAmount
                        }{" "}
                        point(s)
                      </p>

                      <p
                        className={`mt-1 font-black ${getTransactionClass(
                          transaction.xpAmount,
                        )}`}
                      >
                        {transaction.xpAmount >
                        0
                          ? "+"
                          : ""}
                        {
                          transaction.xpAmount
                        }{" "}
                        XP
                      </p>

                      <p className="mt-2 text-xs text-zinc-400">
                        Solde :{" "}
                        {
                          transaction.pointsBalanceAfter
                        }{" "}
                        pts ·{" "}
                        {
                          transaction.xpBalanceAfter
                        }{" "}
                        XP
                      </p>
                    </div>
                  </div>
                </article>
              ),
            )}

            {member.transactions.length ===
            0 ? (
              <div className="flex min-h-40 flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 text-center">
                <History className="size-8 text-zinc-300" />

                <p className="mt-3 font-black text-zinc-700">
                  Aucune transaction
                </p>
              </div>
            ) : null}
          </div>
        </SectionCard>

        <SectionCard
          title="Récompenses du membre"
          description="Récompenses disponibles, utilisées, expirées ou annulées."
          icon={
            <Gift className="size-5" />
          }
        >
          <div className="max-h-[640px] space-y-3 overflow-y-auto pr-1">
            {member.rewards.map(
              (
                clientReward,
              ) => (
                <article
                  key={
                    clientReward.id
                  }
                  className="rounded-2xl border border-zinc-200 p-4"
                >
                  <div className="flex items-start gap-3">
                    <span
                      className="flex size-11 shrink-0 items-center justify-center rounded-2xl text-white"
                      style={{
                        backgroundColor:
                          clientReward.reward
                            .color ??
                          "#7c3aed",
                      }}
                    >
                      <Gift className="size-5" />
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-black text-zinc-950">
                          {
                            clientReward.reward
                              .name
                          }
                        </p>

                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase ${getRewardStatusClass(
                            clientReward.status,
                          )}`}
                        >
                          {formatEnum(
                            clientReward.status,
                          )}
                        </span>
                      </div>

                      <p className="mt-2 font-mono text-xs font-bold text-violet-700">
                        {
                          clientReward.uniqueCode
                        }
                      </p>

                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                        <div className="rounded-xl bg-zinc-50 p-3">
                          <p className="text-zinc-400">
                            Attribution
                          </p>

                          <p className="mt-1 font-bold text-zinc-800">
                            {formatDate(
                              clientReward.createdAt,
                            )}
                          </p>
                        </div>

                        <div className="rounded-xl bg-zinc-50 p-3">
                          <p className="text-zinc-400">
                            Expiration
                          </p>

                          <p className="mt-1 font-bold text-zinc-800">
                            {formatDate(
                              clientReward.expiresAt,
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              ),
            )}

            {member.rewards.length ===
            0 ? (
              <div className="flex min-h-40 flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 text-center">
                <Gift className="size-8 text-zinc-300" />

                <p className="mt-3 font-black text-zinc-700">
                  Aucune récompense attribuée
                </p>
              </div>
            ) : null}
          </div>
        </SectionCard>
      </div>

      <SectionCard
        title="Historique des niveaux"
        description="Évolution du membre entre les différents paliers VIP."
        icon={
          <Clock3 className="size-5" />
        }
      >
        <div className="space-y-3">
          {member.levelHistory.map(
            (
              history,
            ) => (
              <article
                key={history.id}
                className="flex flex-col gap-4 rounded-2xl border border-zinc-200 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="flex size-11 shrink-0 items-center justify-center rounded-2xl text-white"
                    style={{
                      backgroundColor:
                        history.newLevel
                          .color ??
                        "#7c3aed",
                    }}
                  >
                    <Crown className="size-5" />
                  </span>

                  <div>
                    <p className="font-black text-zinc-950">
                      {history.previousLevel
                        ?.name ??
                        "Aucun niveau"}
                      {" → "}
                      {
                        history.newLevel
                          .name
                      }
                    </p>

                    <p className="mt-1 text-xs text-zinc-500">
                      {history.upgradedAutomatically
                        ? "Changement automatique"
                        : "Changement administratif"}
                      {" · "}
                      {formatDate(
                        history.createdAt,
                      )}
                    </p>
                  </div>
                </div>

                <div className="text-sm sm:text-right">
                  <p className="font-bold text-zinc-700">
                    {
                      history.experienceAtUpgrade
                    }{" "}
                    XP ·{" "}
                    {
                      history.pointsAtUpgrade
                    }{" "}
                    points
                  </p>

                  {history.reason ? (
                    <p className="mt-1 max-w-lg text-xs text-zinc-500">
                      {history.reason}
                    </p>
                  ) : null}
                </div>
              </article>
            ),
          )}

          {member.levelHistory.length ===
          0 ? (
            <div className="flex min-h-40 flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 text-center">
              <Crown className="size-8 text-zinc-300" />

              <p className="mt-3 font-black text-zinc-700">
                Aucun changement de niveau
              </p>
            </div>
          ) : null}
        </div>
      </SectionCard>

      {isPending ? (
        <div className="fixed bottom-6 right-6 z-[120] flex items-center gap-3 rounded-2xl bg-zinc-950 px-5 py-4 text-sm font-black text-white shadow-2xl">
          <LoaderCircle className="size-5 animate-spin" />

          Opération en cours...
        </div>
      ) : null}
    </div>
  );
}
