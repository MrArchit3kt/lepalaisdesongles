"use client";

import type {
  ReactNode,
} from "react";

import {
  useState,
} from "react";

import {
  BadgeCheck,
  CalendarDays,
  Check,
  CircleOff,
  Clock3,
  Copy,
  Crown,
  Gift,
  History,
  Link2,
  Share2,
  Sparkles,
  Star,
  Trophy,
  WalletCards,
} from "lucide-react";

import {
  toast,
} from "sonner";

import type {
  ClientVipDashboardData,
  ClientVipReward,
  ClientVipRewardStatus,
  ClientVipTransaction,
} from "@/features/vip/types/client-vip.types";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

type ClientVipDashboardProps = {
  data: ClientVipDashboardData;
};

type DashboardTab =
  | "REWARDS"
  | "HISTORY";

/* -------------------------------------------------------------------------- */
/*                                CONSTANTES                                  */
/* -------------------------------------------------------------------------- */

const REWARD_STATUS_LABELS: Record<
  ClientVipRewardStatus,
  string
> = {
  AVAILABLE:
    "Disponible",

  RESERVED:
    "Réservée",

  USED:
    "Utilisée",

  EXPIRED:
    "Expirée",

  CANCELLED:
    "Annulée",

  GIFTED:
    "Offerte",
};

const REWARD_STATUS_CLASSES: Record<
  ClientVipRewardStatus,
  string
> = {
  AVAILABLE:
    "border border-emerald-200 bg-emerald-50 text-emerald-700 shadow-sm",

  RESERVED:
    "border border-sky-200 bg-sky-50 text-sky-700 shadow-sm",

  USED:
    "border border-[#DABCCA] bg-[#FFF1F6] text-[#843F59] shadow-sm",

  EXPIRED:
    "border border-[#E6D8DD] bg-[#F8F4F5] text-[#806C74]",

  CANCELLED:
    "border border-red-200 bg-red-50 text-red-700 shadow-sm",

  GIFTED:
    "border border-[#E8D39F] bg-[#FFF9E9] text-[#9A6A18] shadow-sm",
};

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
    return "Sans limite";
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

function formatShortDate(
  value: string,
): string {
  return new Intl.DateTimeFormat(
    "fr-FR",
    {
      dateStyle:
        "medium",
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
    .split(
      "_",
    )
    .map(
      (
        word,
      ) =>
        word.charAt(
          0,
        ).toUpperCase() +
        word.slice(
          1,
        ),
    )
    .join(
      " ",
    );
}

function getRewardValue(
  clientReward: ClientVipReward,
): string {
  const reward =
    clientReward.reward;

  switch (
    reward.type
  ) {
    case "FIXED_DISCOUNT":
    case "GIFT_CARD":
      return reward.fixedAmountCents
        ? formatCurrency(
            reward.fixedAmountCents,
          )
        : "Avantage VIP";

    case "PERCENTAGE_DISCOUNT":
      return reward.percentage
        ? `${reward.percentage} % de réduction`
        : "Réduction VIP";

    case "LOYALTY_POINTS":
      return `${reward.loyaltyPoints ?? 0} points`;

    case "EXPERIENCE_POINTS":
    case "SEASON_PASS_XP":
      return `${reward.experiencePoints ?? 0} XP`;

    case "FREE_SERVICE":
      return "Prestation offerte";

    case "FREE_NAIL_ART":
      return "Nail art offert";

    case "FREE_PRODUCT":
      return "Produit offert";

    case "CONTEST_ENTRY":
      return "Participation concours";

    case "VIP_ACCESS":
      return "Accès VIP";

    default:
      return formatEnum(
        reward.type,
      );
  }
}

function getTransactionAmountClass(
  value: number,
): string {
  if (
    value >
    0
  ) {
    return "text-emerald-600";
  }

  if (
    value <
    0
  ) {
    return "text-red-600";
  }

  return "text-[#8E747E]";
}

function getTransactionPrefix(
  value: number,
): string {
  return value >
    0
    ? "+"
    : "";
}

/* -------------------------------------------------------------------------- */
/*                             SOUS-COMPOSANTS                                */
/* -------------------------------------------------------------------------- */

function MetricCard({
  label,
  value,
  description,
  icon,
  iconClassName,
}: {
  label: string;
  value: string;
  description?: string;
  icon: ReactNode;
  iconClassName: string;
}) {
  return (
    <article className="group relative overflow-hidden rounded-[1.5rem] border border-[#EFDEE4] bg-white/95 p-5 shadow-[0_14px_36px_rgba(85,38,55,0.07)] transition duration-300 hover:-translate-y-1 hover:border-[#DDBAC5] hover:shadow-[0_20px_46px_rgba(132,63,89,0.12)]">
      <span
        className={`flex size-12 items-center justify-center rounded-2xl border border-white/50 shadow-sm transition duration-300 group-hover:scale-105 ${iconClassName}`}
      >
        {icon}
      </span>

      <p className="mt-5 text-[10px] font-black uppercase tracking-[0.16em] text-[#A68C96]">
        {label}
      </p>

      <p className="mt-2 font-serif text-2xl font-semibold text-[#2F2027]">
        {value}
      </p>

      {description ? (
        <p className="mt-2 text-xs leading-5 text-[#816D75]">
          {description}
        </p>
      ) : null}
    </article>
  );
}

function ProgressBar({
  label,
  currentValue,
  targetValue,
  percent,
  suffix,
}: {
  label: string;
  currentValue: number;
  targetValue: number;
  percent: number;
  suffix: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-4 text-sm">
        <span className="font-black text-[#49363E]">
          {label}
        </span>

        <span className="font-bold text-[#8E747E]">
          {currentValue.toLocaleString(
            "fr-FR",
          )}
          {" / "}
          {targetValue.toLocaleString(
            "fr-FR",
          )}{" "}
          {suffix}
        </span>
      </div>

      <div className="mt-3 h-3 overflow-hidden rounded-full border border-[#E8DDE1] bg-[#F4E9ED]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#B45F7A] via-[#C97992] to-[#D6B679] shadow-[0_0_14px_rgba(180,95,122,0.35)] transition-all duration-500"
          style={{
            width:
              `${percent}%`,
          }}
        />
      </div>

      <p className="mt-2 text-right text-xs font-black text-[#A5526D]">
        {percent} %
      </p>
    </div>
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
    <div className="flex min-h-56 flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-[#D9B4C0] bg-gradient-to-br from-white to-[#FFF4F7] p-8 text-center shadow-[0_16px_40px_rgba(85,38,55,0.05)]">
      <span className="flex size-14 items-center justify-center rounded-2xl border border-[#E8C3CF] bg-gradient-to-br from-[#FFF0F5] to-[#F4D4DE] text-[#A5526D] shadow-sm">
        {icon}
      </span>

      <h3 className="mt-4 font-serif text-xl font-semibold text-[#2F2027]">
        {title}
      </h3>

      <p className="mt-2 max-w-md text-sm leading-6 text-[#816D75]">
        {description}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                COMPOSANT                                   */
/* -------------------------------------------------------------------------- */

export function ClientVipDashboard({
  data,
}: ClientVipDashboardProps) {
  const [
    activeTab,
    setActiveTab,
  ] =
    useState<DashboardTab>(
      "REWARDS",
    );

  const [
    copiedValue,
    setCopiedValue,
  ] =
    useState<string | null>(
      null,
    );

  const currentLevelColor =
    data.account.currentLevel
      ?.color ??
    "#843F59";

  function getReferralLink():
    string {
    const path =
      `/inscription?ref=${encodeURIComponent(
        data.account.referralCode,
      )}`;

    if (
      typeof window ===
      "undefined"
    ) {
      return path;
    }

    return new URL(
      path,
      window.location.origin,
    ).toString();
  }

  async function shareReferralLink():
    Promise<void> {
    const referralLink =
      getReferralLink();

    try {
      if (
        typeof navigator.share ===
        "function"
      ) {
        await navigator.share({
          title:
            "Invitation Le Palais des Ongles",

          text:
            "Créez votre compte grâce à mon lien de parrainage Le Palais des Ongles.",

          url:
            referralLink,
        });

        return;
      }

      await copyValue(
        referralLink,
        "Lien de parrainage",
      );

      toast.info(
        "Le partage direct n’est pas disponible sur cet appareil. Le lien a été copié.",
      );
    } catch (
      error: unknown
    ) {
      if (
        error instanceof
          DOMException &&
        error.name ===
          "AbortError"
      ) {
        return;
      }

      toast.error(
        "Impossible de partager le lien de parrainage.",
      );
    }
  }

  async function copyValue(
    value: string,
    label: string,
  ): Promise<void> {
    try {
      await navigator.clipboard.writeText(
        value,
      );

      setCopiedValue(
        value,
      );

      toast.success(
        `${label} copié.`,
      );

      window.setTimeout(
        () => {
          setCopiedValue(
            (
              current,
            ) =>
              current ===
              value
                ? null
                : current,
          );
        },
        2000,
      );
    } catch {
      toast.error(
        "La copie automatique a échoué.",
      );
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {!data.account.isActive ||
      data.account.isSuspended ? (
        <section className="rounded-[1.5rem] border border-[#E8D39F] bg-gradient-to-br from-[#FFFBEF] to-[#FFF6DC] p-5 shadow-[0_14px_35px_rgba(154,106,24,0.08)]">
          <div className="flex items-start gap-3">
            <CircleOff className="mt-0.5 size-5 shrink-0 text-[#9A6A18]" />

            <div>
              <h2 className="font-serif text-lg font-semibold text-[#72501A]">
                Accès fidélité limité
              </h2>

              <p className="mt-1 text-sm leading-6 text-[#886221]">
                {data.account.isSuspended
                  ? "Votre compte fidélité est actuellement suspendu. Vos avantages restent visibles, mais certaines actions sont temporairement indisponibles."
                  : "Votre compte fidélité est actuellement inactif."}
              </p>
            </div>
          </div>
        </section>
      ) : null}

      <section
        className="relative overflow-hidden rounded-[2.25rem] border border-white/10 p-6 text-white shadow-[0_30px_75px_rgba(79,38,54,0.28)] sm:p-8 lg:p-10"
        style={{
          background:
            `linear-gradient(135deg, ${currentLevelColor} 0%, #843F59 48%, #2F2027 100%)`,
        }}
      >
        <div className="absolute -right-24 -top-24 size-80 rounded-full bg-[#F4D4DE]/25 blur-3xl" />

        <div className="absolute -bottom-32 left-1/3 size-72 rounded-full bg-[#D6B679]/20 blur-3xl" />

        <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-sm backdrop-blur">
              <Sparkles className="size-4" />

              Club VIP
            </span>

            <div className="mt-5 flex items-center gap-4">
              <span className="flex size-16 shrink-0 items-center justify-center rounded-[1.4rem] border border-white/20 bg-white/10 text-[#F6D9E1] shadow-inner backdrop-blur">
                <Crown className="size-8" />
              </span>

              <div>
                <p className="text-sm font-bold text-[#EADDE2]">
                  Votre niveau actuel
                </p>

                <h1 className="mt-1 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
                  {data.account.currentLevel
                    ?.name ??
                    "Membre VIP"}
                </h1>
              </div>
            </div>

            <p className="mt-5 max-w-2xl text-sm leading-7 text-[#EADDE2]">
              Cumulez des points et de l’expérience grâce à vos rendez-vous,
              avis, parrainages et participations aux concours.
            </p>
          </div>

          <div className="grid min-w-[260px] gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-[1.25rem] border border-white/20 bg-white/10 p-4 shadow-inner backdrop-blur-xl">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/55">
                Points disponibles
              </p>

              <p className="mt-2 font-serif text-3xl font-semibold">
                {data.account.points.toLocaleString(
                  "fr-FR",
                )}
              </p>
            </div>

            <div className="rounded-[1.25rem] border border-white/20 bg-white/10 p-4 shadow-inner backdrop-blur-xl">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/55">
                Expérience
              </p>

              <p className="mt-2 font-serif text-3xl font-semibold">
                {data.account.experience.toLocaleString(
                  "fr-FR",
                )}{" "}
                XP
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-[1.75rem] border border-[#EFDEE4] bg-white/95 p-5 shadow-[0_18px_48px_rgba(85,38,55,0.08)] backdrop-blur sm:p-6">
          <header className="flex items-center gap-3">
            <span className="flex size-12 items-center justify-center rounded-2xl border border-[#E8C3CF] bg-gradient-to-br from-[#FFF0F5] to-[#F4D4DE] text-[#A5526D] shadow-sm">
              <Crown className="size-5" />
            </span>

            <div>
              <h2 className="font-serif text-xl font-semibold text-[#2F2027]">
                Progression VIP
              </h2>

              <p className="mt-1 text-sm text-[#816D75]">
                {data.nextLevel
                  ? `Prochain niveau : ${data.nextLevel.name}`
                  : "Vous avez atteint le niveau VIP maximum."}
              </p>
            </div>
          </header>

          {data.nextLevel ? (
            <div className="mt-6 space-y-6">
              <ProgressBar
                label="Expérience"
                currentValue={
                  data.account.experience
                }
                targetValue={
                  data.nextLevel.requiredXp
                }
                percent={
                  data.progress.xpPercent
                }
                suffix="XP"
              />

              <ProgressBar
                label="Points"
                currentValue={
                  data.account.points
                }
                targetValue={
                  data.nextLevel.requiredPoints
                }
                percent={
                  data.progress.pointsPercent
                }
                suffix="points"
              />

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1.25rem] border border-[#E8C3CF] bg-gradient-to-br from-white to-[#FFF1F5] p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#A5526D]">
                    XP restants
                  </p>

                  <p className="mt-2 font-serif text-xl font-semibold text-[#2F2027]">
                    {data.progress.remainingXp.toLocaleString(
                      "fr-FR",
                    )}
                  </p>
                </div>

                <div className="rounded-[1.25rem] border border-[#E8D39F] bg-gradient-to-br from-white to-[#FFF8E6] p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#9A6A18]">
                    Points restants
                  </p>

                  <p className="mt-2 font-serif text-xl font-semibold text-[#2F2027]">
                    {data.progress.remainingPoints.toLocaleString(
                      "fr-FR",
                    )}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-6 rounded-[1.5rem] border border-[#E8C3CF] bg-gradient-to-br from-[#FFF4F7] to-[#FFF9E9] p-5">
              <BadgeCheck className="size-8 text-[#A5526D]" />

              <p className="mt-3 font-serif text-xl font-semibold text-[#2F2027]">
                Niveau maximum atteint
              </p>

              <p className="mt-2 text-sm leading-6 text-[#816D75]">
                Continuez à cumuler des points pour profiter des récompenses du
                Club VIP.
              </p>
            </div>
          )}
        </article>

        <article className="rounded-[1.75rem] border border-[#EFDEE4] bg-white/95 p-5 shadow-[0_18px_48px_rgba(85,38,55,0.08)] backdrop-blur sm:p-6">
          <header className="flex items-center gap-3">
            <span className="flex size-12 items-center justify-center rounded-2xl border border-[#E8D39F] bg-gradient-to-br from-[#FFF9E9] to-[#F8EAC8] text-[#9A6A18] shadow-sm">
              <Star className="size-5" />
            </span>

            <div>
              <h2 className="font-serif text-xl font-semibold text-[#2F2027]">
                Votre carte membre
              </h2>

              <p className="mt-1 text-sm text-[#816D75]">
                Conservez vos identifiants fidélité.
              </p>
            </div>
          </header>

          <div className="mt-6 space-y-4">
            <div className="relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-[linear-gradient(135deg,#2F2027_0%,#5B3342_52%,#843F59_100%)] p-5 text-white shadow-[0_16px_38px_rgba(79,38,54,0.20)]">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#D8C3CB]">
                Numéro de membre
              </p>

              <div className="mt-3 flex items-center justify-between gap-3">
                <p className="break-all font-mono text-lg font-black tracking-wider text-white">
                  {data.account.memberNumber}
                </p>

                <button
                  type="button"
                  onClick={() =>
                    void copyValue(
                      data.account.memberNumber,
                      "Numéro de membre",
                    )
                  }
                  className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white transition hover:bg-white/20"
                  title="Copier le numéro de membre"
                >
                  {copiedValue ===
                  data.account.memberNumber ? (
                    <Check className="size-4" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-[#E8C3CF] bg-gradient-to-br from-[#FFF8FA] to-[#FFF0F5] p-5 shadow-[0_12px_30px_rgba(132,63,89,0.06)]">
              <div className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#B45F7A] to-[#843F59] text-white shadow-[0_8px_18px_rgba(132,63,89,0.22)]">
                  <Link2 className="size-5" />
                </span>

                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#A5526D]">
                    Mon lien de parrainage
                  </p>

                  <p className="mt-2 font-serif text-lg font-semibold text-[#2F2027]">
                    Invitez facilement une proche
                  </p>

                  <p className="mt-1 text-xs leading-5 text-[#816D75]">
                    La personne ouvrira directement la page d’inscription et
                    votre parrainage sera enregistré automatiquement.
                  </p>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => {
                    const referralLink =
                      getReferralLink();

                    void copyValue(
                      referralLink,
                      "Lien de parrainage",
                    );
                  }}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#B45F7A] to-[#843F59] px-4 text-sm font-black text-white shadow-[0_10px_24px_rgba(132,63,89,0.22)] transition hover:-translate-y-0.5"
                >
                  {copiedValue ===
                  getReferralLink() ? (
                    <>
                      <Check className="size-4" />

                      Lien copié
                    </>
                  ) : (
                    <>
                      <Copy className="size-4" />

                      Copier mon lien
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    void shareReferralLink()
                  }
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#E8C3CF] bg-white px-4 text-sm font-black text-[#843F59] shadow-sm transition hover:-translate-y-0.5 hover:border-[#D8AAB9] hover:bg-[#FFF0F4]"
                >
                  <Share2 className="size-4" />

                  Partager mon lien
                </button>
              </div>

              <p className="mt-3 text-center text-[11px] font-semibold leading-5 text-[#A5526D]">
                Aucun code ne devra être saisi pendant l’inscription.
              </p>
            </div>

            <p className="text-xs text-[#8E747E]">
              Membre depuis le{" "}
              <strong className="text-[#2F2027]">
                {formatShortDate(
                  data.account.joinedAt,
                )}
              </strong>
            </p>
          </div>
        </article>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Récompenses disponibles"
          value={data.metrics.availableRewards.toLocaleString(
            "fr-FR",
          )}
          description={`${data.metrics.usedRewards.toLocaleString(
            "fr-FR",
          )} récompense(s) déjà utilisée(s)`}
          icon={
            <Gift className="size-5" />
          }
          iconClassName="bg-[#FFF0F5] text-[#A5526D]"
        />

        <MetricCard
          label="Rendez-vous terminés"
          value={data.metrics.completedAppointments.toLocaleString(
            "fr-FR",
          )}
          icon={
            <CalendarDays className="size-5" />
          }
          iconClassName="bg-emerald-50 text-emerald-600"
        />

        <MetricCard
          label="Points gagnés"
          value={data.metrics.totalPointsEarned.toLocaleString(
            "fr-FR",
          )}
          description={`${data.metrics.totalPointsSpent.toLocaleString(
            "fr-FR",
          )} point(s) dépensé(s)`}
          icon={
            <Trophy className="size-5" />
          }
          iconClassName="bg-[#FFF8E6] text-[#9A6A18]"
        />

        <MetricCard
          label="Total dépensé"
          value={formatCurrency(
            data.metrics.totalSpentCents,
          )}
          description={`${data.metrics.totalExperienceEarned.toLocaleString(
            "fr-FR",
          )} XP gagné(s) au total`}
          icon={
            <WalletCards className="size-5" />
          }
          iconClassName="bg-[#F5EFF2] text-[#843F59]"
        />
      </section>

      <section className="rounded-[1.75rem] border border-[#EFDEE4] bg-white/95 p-5 shadow-[0_18px_48px_rgba(85,38,55,0.08)] backdrop-blur sm:p-6">
        <div className="flex flex-col gap-4 border-b border-[#F0E1E6] pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#A5526D]">
              Votre activité
            </p>

            <h2 className="mt-2 font-serif text-2xl font-semibold text-[#2F2027]">
              Club VIP
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#816D75]">
              Retrouvez vos récompenses et vos derniers mouvements fidélité.
            </p>
          </div>

          <div className="inline-flex rounded-2xl border border-[#EFDEE4] bg-[#FFF7F9] p-1.5 shadow-inner">
            <button
              type="button"
              onClick={() =>
                setActiveTab(
                  "REWARDS",
                )
              }
              className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-black transition ${
                activeTab ===
                "REWARDS"
                  ? "bg-gradient-to-r from-[#B45F7A] to-[#843F59] text-white shadow-[0_8px_20px_rgba(132,63,89,0.22)]"
                  : "text-[#816D75] hover:bg-white hover:text-[#843F59]"
              }`}
            >
              <Gift className="size-4" />

              Mes récompenses
            </button>

            <button
              type="button"
              onClick={() =>
                setActiveTab(
                  "HISTORY",
                )
              }
              className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-black transition ${
                activeTab ===
                "HISTORY"
                  ? "bg-gradient-to-r from-[#B45F7A] to-[#843F59] text-white shadow-[0_8px_20px_rgba(132,63,89,0.22)]"
                  : "text-[#816D75] hover:bg-white hover:text-[#843F59]"
              }`}
            >
              <History className="size-4" />

              Historique
            </button>
          </div>
        </div>

        {activeTab ===
        "REWARDS" ? (
          <div className="mt-6">
            {data.rewards.length >
            0 ? (
              <div className="grid gap-4 lg:grid-cols-2">
                {data.rewards.map(
                  (
                    clientReward,
                  ) => (
                    <RewardCard
                      key={
                        clientReward.id
                      }
                      clientReward={
                        clientReward
                      }
                      onCopy={
                        copyValue
                      }
                      copiedValue={
                        copiedValue
                      }
                    />
                  ),
                )}
              </div>
            ) : (
              <EmptyState
                icon={
                  <Gift className="size-7" />
                }
                title="Aucune récompense pour le moment"
                description="Vos futures récompenses apparaîtront ici dès qu’elles seront débloquées ou attribuées."
              />
            )}
          </div>
        ) : (
          <div className="mt-6">
            {data.transactions.length >
            0 ? (
              <div className="space-y-3">
                {data.transactions.map(
                  (
                    transaction,
                  ) => (
                    <TransactionCard
                      key={
                        transaction.id
                      }
                      transaction={
                        transaction
                      }
                    />
                  ),
                )}
              </div>
            ) : (
              <EmptyState
                icon={
                  <Clock3 className="size-7" />
                }
                title="Aucune activité fidélité"
                description="Vos gains de points, d’XP et vos utilisations de récompenses apparaîtront ici."
              />
            )}
          </div>
        )}
      </section>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              CARTE RÉCOMPENSE                              */
/* -------------------------------------------------------------------------- */

function RewardCard({
  clientReward,
  onCopy,
  copiedValue,
}: {
  clientReward: ClientVipReward;

  onCopy: (
    value: string,
    label: string,
  ) => Promise<void>;

  copiedValue: string | null;
}) {
  const rewardColor =
    clientReward.reward
      .color ??
    "#843F59";

  return (
    <article className="group relative overflow-hidden rounded-[1.5rem] border border-[#EFDEE4] bg-white/95 p-5 shadow-[0_14px_36px_rgba(85,38,55,0.07)] transition duration-300 hover:-translate-y-1 hover:border-[#DDBAC5] hover:shadow-[0_22px_50px_rgba(132,63,89,0.12)]">
      <div
        className="absolute inset-x-0 top-0 h-1.5 shadow-[0_2px_12px_rgba(132,63,89,0.20)]"
        style={{
          backgroundColor:
            rewardColor,
        }}
      />

      <div className="flex items-start justify-between gap-3">
        <span
          className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-white/40 text-white shadow-[0_10px_24px_rgba(85,38,55,0.18)] transition duration-300 group-hover:scale-105"
          style={{
            backgroundColor:
              rewardColor,
          }}
        >
          <Gift className="size-6" />
        </span>

        <span
          className={`rounded-full px-3 py-1.5 text-[11px] font-black ${REWARD_STATUS_CLASSES[clientReward.status]}`}
        >
          {
            REWARD_STATUS_LABELS[
              clientReward.status
            ]
          }
        </span>
      </div>

      <p className="mt-4 text-[10px] font-black uppercase tracking-[0.18em] text-[#A5526D]">
        {formatEnum(
          clientReward.reward
            .type,
        )}
      </p>

      <h3 className="mt-2 font-serif text-xl font-semibold text-[#2F2027]">
        {
          clientReward.reward
            .name
        }
      </h3>

      <p className="mt-2 min-h-10 text-sm leading-6 text-[#816D75]">
        {clientReward.reward
          .shortDescription ??
          "Une récompense exclusive du Club VIP."}
      </p>

      <div
        className="mt-4 rounded-[1.25rem] border border-[#EFDEE4] p-4"
        style={{
          backgroundColor:
            `${rewardColor}14`,
        }}
      >
        <p
          className="text-[10px] font-black uppercase tracking-[0.16em]"
          style={{
            color:
              rewardColor,
          }}
        >
          Votre avantage
        </p>

        <p className="mt-2 font-serif text-lg font-semibold text-[#2F2027]">
          {getRewardValue(
            clientReward,
          )}
        </p>
      </div>

      <div className="mt-4 rounded-[1.25rem] border border-white/10 bg-[linear-gradient(135deg,#2F2027_0%,#5B3342_55%,#843F59_100%)] p-4 text-white shadow-[0_14px_32px_rgba(79,38,54,0.18)]">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#D8C3CB]">
          Code personnel
        </p>

        <div className="mt-2 flex items-center justify-between gap-3">
          <p className="break-all font-mono text-sm font-black">
            {
              clientReward.uniqueCode
            }
          </p>

          <button
            type="button"
            onClick={() =>
              void onCopy(
                clientReward.uniqueCode,
                "Code de récompense",
              )
            }
            className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 transition hover:bg-white/20"
          >
            {copiedValue ===
            clientReward.uniqueCode ? (
              <Check className="size-4" />
            ) : (
              <Copy className="size-4" />
            )}
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-xl border border-[#EFDEE4] bg-gradient-to-br from-white to-[#FFF6F8] p-3">
          <p className="text-[#A68C96]">
            Obtenue le
          </p>

          <p className="mt-1 font-black text-[#49363E]">
            {formatShortDate(
              clientReward.createdAt,
            )}
          </p>
        </div>

        <div className="rounded-xl border border-[#EFDEE4] bg-gradient-to-br from-white to-[#FFF6F8] p-3">
          <p className="text-[#A68C96]">
            Expiration
          </p>

          <p className="mt-1 font-black text-[#49363E]">
            {formatDate(
              clientReward.expiresAt,
            )}
          </p>
        </div>
      </div>
    </article>
  );
}

/* -------------------------------------------------------------------------- */
/*                             CARTE TRANSACTION                              */
/* -------------------------------------------------------------------------- */

function TransactionCard({
  transaction,
}: {
  transaction: ClientVipTransaction;
}) {
  return (
    <article className="group rounded-[1.5rem] border border-[#EFDEE4] bg-white p-4 shadow-[0_10px_28px_rgba(85,38,55,0.05)] transition duration-300 hover:-translate-y-0.5 hover:border-[#DDBAC5] hover:bg-[#FFF9FA] hover:shadow-[0_16px_38px_rgba(132,63,89,0.09)]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-[#E8C3CF] bg-gradient-to-br from-[#FFF0F5] to-[#F4D4DE] text-[#A5526D] shadow-sm">
            <Sparkles className="size-4" />
          </span>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-serif text-xl font-semibold text-[#2F2027]">
                {transaction.title}
              </h3>

              <span className="rounded-full border border-[#E6D8DD] bg-[#F8F4F5] px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-[#806C74]">
                {formatEnum(
                  transaction.source,
                )}
              </span>

              {transaction.isReversed ? (
                <span className="rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-red-600">
                  Annulée
                </span>
              ) : null}
            </div>

            {transaction.description ? (
              <p className="mt-2 text-sm leading-6 text-[#816D75]">
                {
                  transaction.description
                }
              </p>
            ) : null}

            <p className="mt-2 text-xs text-[#A68C96]">
              {formatDate(
                transaction.createdAt,
              )}
            </p>
          </div>
        </div>

        <div className="shrink-0 rounded-[1.25rem] border border-[#EFDEE4] bg-gradient-to-br from-white to-[#FFF5F8] px-4 py-3 text-sm shadow-sm sm:text-right">
          <p
            className={`font-black ${getTransactionAmountClass(
              transaction.pointsAmount,
            )}`}
          >
            {getTransactionPrefix(
              transaction.pointsAmount,
            )}
            {
              transaction.pointsAmount
            }{" "}
            point(s)
          </p>

          <p
            className={`mt-1 font-black ${getTransactionAmountClass(
              transaction.xpAmount,
            )}`}
          >
            {getTransactionPrefix(
              transaction.xpAmount,
            )}
            {
              transaction.xpAmount
            }{" "}
            XP
          </p>

          <p className="mt-2 border-t border-[#EAD9DF] pt-2 text-[11px] text-[#A68C96]">
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
  );
}
