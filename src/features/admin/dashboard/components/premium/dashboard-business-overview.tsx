import type {
  ReactNode,
} from "react";

import {
  BadgeEuro,
  CalendarCheck2,
  CalendarClock,
  CalendarRange,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  CreditCard,
  Gauge,
  ShieldAlert,
  TrendingUp,
  UserRoundX,
  WalletCards,
} from "lucide-react";

import type {
  DashboardBusinessHealth,
  DashboardFinanceMetrics,
  DashboardOccupancy,
} from "@/features/admin/dashboard/types/admin-dashboard.types";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

type DashboardBusinessOverviewProps = {
  finance: DashboardFinanceMetrics;
  occupancy: DashboardOccupancy;
  businessHealth: DashboardBusinessHealth;
};

type OverviewTone =
  | "ROSE"
  | "EMERALD"
  | "BLUE"
  | "VIOLET"
  | "AMBER"
  | "ZINC";

type FinanceCardProps = {
  label: string;
  value: string;
  description: string;
  icon: ReactNode;
  tone: OverviewTone;
};

type ProgressCardProps = {
  label: string;
  value: string;
  description: string;
  percentage: number;
  icon: ReactNode;
  tone: OverviewTone;
};

type HealthItemProps = {
  label: string;
  value: string;
  description: string;
  icon: ReactNode;
  tone: OverviewTone;
};

/* -------------------------------------------------------------------------- */
/*                               CONSTANTES                                   */
/* -------------------------------------------------------------------------- */

const ICON_CLASSES: Record<
  OverviewTone,
  string
> = {
  ROSE:
    "border-[#E8C3CF] bg-gradient-to-br from-[#FFF0F5] to-[#F4D4DE] text-[#A5526D]",

  EMERALD:
    "border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-700",

  BLUE:
    "border-sky-200 bg-gradient-to-br from-sky-50 to-sky-100 text-sky-700",

  VIOLET:
    "border-[#DCC6E8] bg-gradient-to-br from-[#FBF4FF] to-[#EADCF2] text-[#765083]",

  AMBER:
    "border-[#E8D39F] bg-gradient-to-br from-[#FFFBEF] to-[#F6E7BF] text-[#9A6A18]",

  ZINC:
    "border-[#E6D8DD] bg-gradient-to-br from-white to-[#F8F2F4] text-[#705D65]",
};

const PROGRESS_CLASSES: Record<
  OverviewTone,
  string
> = {
  ROSE:
    "bg-gradient-to-r from-[#B45F7A] to-[#D48AA1]",

  EMERALD:
    "bg-gradient-to-r from-emerald-500 to-emerald-400",

  BLUE:
    "bg-gradient-to-r from-sky-600 to-sky-400",

  VIOLET:
    "bg-gradient-to-r from-[#765083] to-[#A77AB5]",

  AMBER:
    "bg-gradient-to-r from-[#B6842E] to-[#D6B679]",

  ZINC:
    "bg-gradient-to-r from-[#705D65] to-[#A9959D]",
};

/* -------------------------------------------------------------------------- */
/*                                  HELPERS                                   */
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

      maximumFractionDigits:
        0,
    },
  ).format(
    cents / 100,
  );
}

function formatNumber(
  value: number,
): string {
  return new Intl.NumberFormat(
    "fr-FR",
  ).format(
    value,
  );
}

function formatPercentage(
  value: number,
): string {
  return `${Math.round(value)} %`;
}

function formatMinutes(
  minutes: number,
): string {
  if (
    minutes <= 0
  ) {
    return "0 min";
  }

  if (
    minutes < 60
  ) {
    return `${minutes} min`;
  }

  const hours =
    Math.floor(
      minutes / 60,
    );

  const remainingMinutes =
    minutes % 60;

  if (
    remainingMinutes === 0
  ) {
    return `${hours} h`;
  }

  return `${hours} h ${remainingMinutes}`;
}

function clampPercentage(
  value: number,
): number {
  if (
    !Number.isFinite(
      value,
    )
  ) {
    return 0;
  }

  return Math.min(
    100,
    Math.max(
      0,
      value,
    ),
  );
}

/* -------------------------------------------------------------------------- */
/*                              SOUS-COMPOSANTS                               */
/* -------------------------------------------------------------------------- */

function SectionTitle({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <header className="max-w-3xl">
      <div className="flex items-center gap-2">
        <span className="h-px w-6 bg-[#D6B679]" />

        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#A5526D]">
          {eyebrow}
        </p>
      </div>

      <h2 className="mt-2 font-serif text-2xl font-semibold tracking-tight text-[#2F2027] sm:text-[1.75rem]">
        {title}
      </h2>

      <p className="mt-2 text-sm leading-6 text-[#816D75]">
        {description}
      </p>
    </header>
  );
}

function FinanceCard({
  label,
  value,
  description,
  icon,
  tone,
}: FinanceCardProps) {
  return (
    <article className="group relative overflow-hidden rounded-[1.6rem] border border-[#EFDEE4] bg-white p-5 shadow-[0_14px_38px_rgba(85,38,55,0.06)] transition duration-300 hover:-translate-y-1 hover:border-[#DCB4C1] hover:shadow-[0_20px_45px_rgba(132,63,89,0.12)]">
      <div className="absolute -right-10 -top-10 size-28 rounded-full bg-[#E8B4C0]/10 blur-2xl" />

      <div className="relative">
        <div
          className={`flex size-11 items-center justify-center rounded-2xl border shadow-sm ${ICON_CLASSES[tone]}`}
        >
          {icon}
        </div>

        <p className="mt-5 text-[10px] font-black uppercase tracking-[0.16em] text-[#A68C96]">
          {label}
        </p>

        <p className="mt-2 font-serif text-3xl font-semibold tracking-tight text-[#2F2027]">
          {value}
        </p>

        <p className="mt-2 text-xs leading-5 text-[#816D75]">
          {description}
        </p>
      </div>
    </article>
  );
}

function ProgressCard({
  label,
  value,
  description,
  percentage,
  icon,
  tone,
}: ProgressCardProps) {
  const safePercentage =
    clampPercentage(
      percentage,
    );

  return (
    <article className="rounded-[1.6rem] border border-[#EFDEE4] bg-white p-5 shadow-[0_14px_38px_rgba(85,38,55,0.06)]">
      <div className="flex items-start justify-between gap-4">
        <div
          className={`flex size-11 items-center justify-center rounded-2xl border shadow-sm ${ICON_CLASSES[tone]}`}
        >
          {icon}
        </div>

        <span className="rounded-full border border-[#EAD9DF] bg-[#FBF7F8] px-3 py-1 text-xs font-black text-[#5E4851]">
          {formatPercentage(
            safePercentage,
          )}
        </span>
      </div>

      <p className="mt-5 text-[10px] font-black uppercase tracking-[0.16em] text-[#A68C96]">
        {label}
      </p>

      <p className="mt-2 font-serif text-2xl font-semibold text-[#2F2027]">
        {value}
      </p>

      <p className="mt-2 min-h-10 text-xs leading-5 text-[#816D75]">
        {description}
      </p>

      <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-[#F1E5E9]">
        <div
          className={`h-full rounded-full transition-all duration-700 ${PROGRESS_CLASSES[tone]}`}
          style={{
            width: `${safePercentage}%`,
          }}
        />
      </div>
    </article>
  );
}

function HealthItem({
  label,
  value,
  description,
  icon,
  tone,
}: HealthItemProps) {
  return (
    <article className="flex items-start gap-4 rounded-[1.35rem] border border-[#EFDEE4] bg-white p-4 shadow-[0_10px_28px_rgba(85,38,55,0.05)]">
      <div
        className={`flex size-11 shrink-0 items-center justify-center rounded-2xl border shadow-sm ${ICON_CLASSES[tone]}`}
      >
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm font-bold text-[#49363E]">
            {label}
          </p>

          <p className="shrink-0 font-serif text-xl font-semibold text-[#2F2027]">
            {value}
          </p>
        </div>

        <p className="mt-1 text-xs leading-5 text-[#816D75]">
          {description}
        </p>
      </div>
    </article>
  );
}

/* -------------------------------------------------------------------------- */
/*                                COMPOSANT                                   */
/* -------------------------------------------------------------------------- */

export function DashboardBusinessOverview({
  finance,
  occupancy,
  businessHealth,
}: DashboardBusinessOverviewProps) {
  return (
    <section className="space-y-6">
      <div className="rounded-[2rem] border border-[#EFDEE4] bg-white/95 p-5 shadow-[0_20px_55px_rgba(85,38,55,0.08)] backdrop-blur sm:p-6">
        <SectionTitle
          eyebrow="Pilotage financier"
          title="Vue d’ensemble du salon"
          description="Suivez le chiffre d’affaires, les projections et les performances commerciales sur les principales périodes."
        />

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <FinanceCard
            label="Chiffre d’affaires du jour"
            value={formatCurrency(
              finance.revenueTodayCents,
            )}
            description={`${formatNumber(
              finance.completedAppointmentsToday,
            )} rendez-vous terminés aujourd’hui`}
            icon={
              <CircleDollarSign className="size-5" />
            }
            tone="ROSE"
          />

          <FinanceCard
            label="Chiffre d’affaires semaine"
            value={formatCurrency(
              finance.revenueThisWeekCents,
            )}
            description="Prestations terminées depuis le début de la semaine"
            icon={
              <CalendarRange className="size-5" />
            }
            tone="BLUE"
          />

          <FinanceCard
            label="Chiffre d’affaires mois"
            value={formatCurrency(
              finance.revenueThisMonthCents,
            )}
            description={`${formatNumber(
              finance.completedAppointmentsThisMonth,
            )} rendez-vous terminés ce mois-ci`}
            icon={
              <BadgeEuro className="size-5" />
            }
            tone="EMERALD"
          />

          <FinanceCard
            label="Chiffre d’affaires année"
            value={formatCurrency(
              finance.revenueThisYearCents,
            )}
            description="Revenus cumulés depuis le début de l’année"
            icon={
              <TrendingUp className="size-5" />
            }
            tone="VIOLET"
          />
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <FinanceCard
            label="Projection du jour"
            value={formatCurrency(
              finance.projectedRevenueTodayCents,
            )}
            description="Montant estimé selon les rendez-vous planifiés"
            icon={
              <CalendarClock className="size-5" />
            }
            tone="AMBER"
          />

          <FinanceCard
            label="Projection du mois"
            value={formatCurrency(
              finance.projectedRevenueThisMonthCents,
            )}
            description="Prévision basée sur l’activité actuellement enregistrée"
            icon={
              <Gauge className="size-5" />
            }
            tone="ROSE"
          />

          <FinanceCard
            label="Panier moyen du mois"
            value={formatCurrency(
              finance.averageBasketThisMonthCents,
            )}
            description={`Panier du jour : ${formatCurrency(
              finance.averageBasketTodayCents,
            )}`}
            icon={
              <CreditCard className="size-5" />
            }
            tone="VIOLET"
          />

          <FinanceCard
            label="Encaissements PayPal"
            value={formatCurrency(
              finance.paypalCollectedThisMonthCents,
            )}
            description="Paiements et acomptes encaissés durant le mois"
            icon={
              <WalletCards className="size-5" />
            }
            tone="BLUE"
          />
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)]">
        <section className="rounded-[2rem] border border-[#EFDEE4] bg-white/95 p-5 shadow-[0_20px_55px_rgba(85,38,55,0.08)] backdrop-blur sm:p-6">
          <SectionTitle
            eyebrow="Capacité"
            title="Occupation du planning"
            description="Visualisez le temps réservé et les disponibilités restantes pour organiser efficacement la journée et la semaine."
          />

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <ProgressCard
              label="Occupation aujourd’hui"
              value={`${formatMinutes(
                occupancy.bookedMinutesToday,
              )} réservées`}
              description={`${formatMinutes(
                occupancy.remainingMinutesToday,
              )} encore disponibles sur ${formatMinutes(
                occupancy.availableMinutesToday,
              )}`}
              percentage={
                occupancy.occupancyRateToday
              }
              icon={
                <Clock3 className="size-5" />
              }
              tone="ROSE"
            />

            <ProgressCard
              label="Occupation cette semaine"
              value={`${formatMinutes(
                occupancy.bookedMinutesThisWeek,
              )} réservées`}
              description={`${formatMinutes(
                occupancy.remainingMinutesThisWeek,
              )} encore disponibles sur ${formatMinutes(
                occupancy.availableMinutesThisWeek,
              )}`}
              percentage={
                occupancy.occupancyRateThisWeek
              }
              icon={
                <CalendarCheck2 className="size-5" />
              }
              tone="BLUE"
            />
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-[1.35rem] border border-[#EAD9DF] bg-gradient-to-br from-white to-[#FFF6F8] p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#A68C96]">
                Créneaux estimés aujourd’hui
              </p>

              <p className="mt-2 font-serif text-3xl font-semibold text-[#2F2027]">
                {formatNumber(
                  occupancy.freeSlotEstimateToday,
                )}
              </p>

              <p className="mt-1 text-xs text-[#816D75]">
                créneaux encore potentiellement réservables
              </p>
            </div>

            <div className="rounded-[1.35rem] border border-[#EAD9DF] bg-gradient-to-br from-white to-[#FFF6F8] p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#A68C96]">
                Créneaux estimés semaine
              </p>

              <p className="mt-2 font-serif text-3xl font-semibold text-[#2F2027]">
                {formatNumber(
                  occupancy.freeSlotEstimateThisWeek,
                )}
              </p>

              <p className="mt-1 text-xs text-[#816D75]">
                créneaux encore potentiellement réservables
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-[#EFDEE4] bg-white/95 p-5 shadow-[0_20px_55px_rgba(85,38,55,0.08)] backdrop-blur sm:p-6">
          <SectionTitle
            eyebrow="Qualité opérationnelle"
            title="Santé de l’activité"
            description="Les principaux indicateurs permettant d’identifier rapidement les points à surveiller."
          />

          <div className="mt-6 space-y-3">
            <HealthItem
              label="Rendez-vous terminés"
              value={formatPercentage(
                businessHealth.completionRateThisMonth,
              )}
              description="Taux de complétion des rendez-vous du mois"
              icon={
                <CheckCircle2 className="size-5" />
              }
              tone="EMERALD"
            />

            <HealthItem
              label="Annulations"
              value={formatPercentage(
                businessHealth.cancellationRateThisMonth,
              )}
              description={`${formatNumber(
                businessHealth.cancellationCountThisMonth,
              )} rendez-vous annulés ce mois-ci`}
              icon={
                <ShieldAlert className="size-5" />
              }
              tone="AMBER"
            />

            <HealthItem
              label="Absences clientes"
              value={formatPercentage(
                businessHealth.noShowRateThisMonth,
              )}
              description={`${formatNumber(
                businessHealth.noShowCountThisMonth,
              )} rendez-vous classés absents`}
              icon={
                <UserRoundX className="size-5" />
              }
              tone="ROSE"
            />

            <HealthItem
              label="Demandes en attente"
              value={formatNumber(
                businessHealth.pendingAppointmentCount,
              )}
              description="Rendez-vous nécessitant encore une décision"
              icon={
                <CalendarClock className="size-5" />
              }
              tone="BLUE"
            />

            <HealthItem
              label="Acomptes non réglés"
              value={formatNumber(
                businessHealth.unpaidDepositCount,
              )}
              description="Rendez-vous avec acompte encore en attente"
              icon={
                <WalletCards className="size-5" />
              }
              tone="VIOLET"
            />

            <HealthItem
              label="Rendez-vous non attribués"
              value={formatNumber(
                businessHealth.unassignedAppointmentCount,
              )}
              description="Rendez-vous sans membre de l’équipe affecté"
              icon={
                <CalendarRange className="size-5" />
              }
              tone="ZINC"
            />
          </div>
        </section>
      </div>
    </section>
  );
}
