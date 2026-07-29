import type {
  ReactNode,
} from "react";

import Link from "next/link";

import {
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BadgeEuro,
  CalendarCheck2,
  CalendarClock,
  CalendarDays,
  Camera,
  CheckCircle2,
  ChevronRight,
  CircleMinus,
  Clock3,
  Crown,
  LayoutDashboard,
  MessageCircle,
  Plus,
  Settings,
  Sparkles,
  Star,
  Tags,
  Trophy,
  UserPlus,
  UsersRound,
  WalletCards,
} from "lucide-react";

import {
  DashboardCommercialPerformance,
} from "@/features/admin/dashboard/components/premium/dashboard-commercial-performance";

import {
  getAdminPromotionsDashboardData,
} from "@/features/admin/promotions/services/admin-promotions.service";

import {
  DashboardInsightsAndAlerts,
} from "@/features/admin/dashboard/components/premium/dashboard-insights-and-alerts";

import {
  DashboardActivityCharts,
} from "@/features/admin/dashboard/components/premium/dashboard-activity-charts";

import {
  DashboardBusinessOverview,
} from "@/features/admin/dashboard/components/premium/dashboard-business-overview";

import type {
  AdminDashboardProps,
  DashboardAlert,
  DashboardAppointment,
  DashboardAppointmentStatus,
  DashboardPaymentStatus,
  DashboardPendingReview,
  DashboardRecentClient,
  DashboardTrend,
} from "@/features/admin/dashboard/types/admin-dashboard.types";

/* -------------------------------------------------------------------------- */
/*                                CONSTANTES                                  */
/* -------------------------------------------------------------------------- */

const STATUS_LABELS: Record<
  DashboardAppointmentStatus,
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
    "Annulé par la cliente",

  CANCELLED_BY_ADMIN:
    "Annulé par le salon",

  NO_SHOW:
    "Absente",

  EXPIRED:
    "Expiré",
};

const STATUS_CLASSES: Record<
  DashboardAppointmentStatus,
  string
> = {
  PENDING:
    "border-[#ECD49A] bg-[#FFF9E9] text-[#9A6A18]",

  CONFIRMED:
    "border-emerald-200 bg-emerald-50 text-emerald-700",

  IN_PROGRESS:
    "border-sky-200 bg-sky-50 text-sky-700",

  COMPLETED:
    "border-[#DABCCA] bg-[#FFF1F6] text-[#843F59]",

  REFUSED:
    "border-red-200 bg-red-50 text-red-700",

  CANCELLED_BY_CLIENT:
    "border-[#E7DDE1] bg-[#F8F4F5] text-[#806C74]",

  CANCELLED_BY_ADMIN:
    "border-[#E9C2CF] bg-[#FFF0F4] text-[#A5526D]",

  NO_SHOW:
    "border-orange-200 bg-orange-50 text-orange-700",

  EXPIRED:
    "border-[#E7DDE1] bg-[#F8F4F5] text-[#9A878F]",
};

const STATUS_PROGRESS_CLASSES: Record<
  DashboardAppointmentStatus,
  string
> = {
  PENDING:
    "bg-[#D6B679]",

  CONFIRMED:
    "bg-emerald-500",

  IN_PROGRESS:
    "bg-sky-500",

  COMPLETED:
    "bg-[#B45F7A]",

  REFUSED:
    "bg-red-500",

  CANCELLED_BY_CLIENT:
    "bg-[#A9959D]",

  CANCELLED_BY_ADMIN:
    "bg-[#C97992]",

  NO_SHOW:
    "bg-orange-500",

  EXPIRED:
    "bg-[#D7CCD0]",
};

const PAYMENT_LABELS: Record<
  DashboardPaymentStatus,
  string
> = {
  NOT_REQUIRED:
    "Aucun paiement requis",

  PENDING:
    "Paiement en attente",

  PARTIALLY_PAID:
    "Acompte payé",

  PAID:
    "Payé",

  REFUNDED:
    "Remboursé",

  CANCELLED:
    "Paiement annulé",
};

const PAYMENT_CLASSES: Record<
  DashboardPaymentStatus,
  string
> = {
  NOT_REQUIRED:
    "border border-[#E7DDE1] bg-[#F8F4F5] text-[#806C74]",

  PENDING:
    "border border-[#ECD49A] bg-[#FFF9E9] text-[#9A6A18]",

  PARTIALLY_PAID:
    "border border-sky-200 bg-sky-50 text-sky-700",

  PAID:
    "border border-emerald-200 bg-emerald-50 text-emerald-700",

  REFUNDED:
    "border border-[#DABCCA] bg-[#FFF1F6] text-[#843F59]",

  CANCELLED:
    "border border-red-200 bg-red-50 text-red-700",
};

/* -------------------------------------------------------------------------- */
/*                                 FORMATAGE                                  */
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

function formatLongDate(
  value: string | Date,
): string {
  return new Intl.DateTimeFormat(
    "fr-FR",
    {
      timeZone:
        "Europe/Paris",

      weekday:
        "long",

      day:
        "numeric",

      month:
        "long",

      year:
        "numeric",
    },
  ).format(
    new Date(
      value,
    ),
  );
}

function formatShortDate(
  value: string | Date,
): string {
  return new Intl.DateTimeFormat(
    "fr-FR",
    {
      timeZone:
        "Europe/Paris",

      weekday:
        "short",

      day:
        "numeric",

      month:
        "short",
    },
  ).format(
    new Date(
      value,
    ),
  );
}

function formatTime(
  value: string | Date,
): string {
  return new Intl.DateTimeFormat(
    "fr-FR",
    {
      timeZone:
        "Europe/Paris",

      hour:
        "2-digit",

      minute:
        "2-digit",
    },
  ).format(
    new Date(
      value,
    ),
  );
}

function formatDuration(
  minutes: number,
): string {
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

function getInitials(
  firstName: string,
  lastName: string,
): string {
  const initials =
    `${firstName.charAt(0)}${lastName.charAt(0)}`
      .toUpperCase()
      .trim();

  return (
    initials ||
    "CL"
  );
}

/* -------------------------------------------------------------------------- */
/*                                  EN-TÊTES                                  */
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
    <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-3xl">
        {eyebrow ? (
          <div className="mb-2 flex items-center gap-2">
            <span className="h-px w-6 bg-[#D6B679]" />

            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#A5526D]">
              {eyebrow}
            </p>
          </div>
        ) : null}

        <h2 className="font-serif text-2xl font-semibold tracking-tight text-[#2F2027] sm:text-[1.75rem]">
          {title}
        </h2>

        {description ? (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#816D75]">
            {description}
          </p>
        ) : null}
      </div>

      {action ? (
        <div className="shrink-0">
          {action}
        </div>
      ) : null}
    </header>
  );
}

/* -------------------------------------------------------------------------- */
/*                                TENDANCES                                   */
/* -------------------------------------------------------------------------- */

function TrendIndicator({
  trend,
}: {
  trend: DashboardTrend;
}) {
  if (
    trend.direction ===
    "UP"
  ) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-black text-emerald-700 shadow-sm">
        <ArrowUpRight className="size-3.5" />

        {Math.abs(
          trend.percentageChange,
        )}
        %
      </span>
    );
  }

  if (
    trend.direction ===
    "DOWN"
  ) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-black text-red-700 shadow-sm">
        <ArrowDownRight className="size-3.5" />

        {Math.abs(
          trend.percentageChange,
        )}
        %
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-[#E6D8DD] bg-[#FAF6F7] px-2.5 py-1 text-xs font-black text-[#816D75]">
      <CircleMinus className="size-3.5" />

      Stable
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*                              CARTES MÉTRIQUES                              */
/* -------------------------------------------------------------------------- */

type MetricTone =
  | "ROSE"
  | "EMERALD"
  | "BLUE"
  | "VIOLET"
  | "AMBER"
  | "ZINC";

const METRIC_ICON_CLASSES: Record<
  MetricTone,
  string
> = {
  ROSE:
    "border border-[#E8C3CF] bg-gradient-to-br from-[#FFF0F5] to-[#F4D4DE] text-[#A5526D]",

  EMERALD:
    "border border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-700",

  BLUE:
    "border border-sky-200 bg-gradient-to-br from-sky-50 to-sky-100 text-sky-700",

  VIOLET:
    "border border-[#DCC6E8] bg-gradient-to-br from-[#FBF4FF] to-[#EADCF2] text-[#765083]",

  AMBER:
    "border border-[#E8D39F] bg-gradient-to-br from-[#FFFBEF] to-[#F6E7BF] text-[#9A6A18]",

  ZINC:
    "border border-[#E6D8DD] bg-gradient-to-br from-white to-[#F8F2F4] text-[#705D65]",
};

function MetricCard({
  label,
  value,
  description,
  icon,
  tone,
  trend,
}: {
  label: string;
  value: string;
  description: string;
  icon: ReactNode;
  tone: MetricTone;
  trend?: DashboardTrend;
}) {
  return (
    <article className="group relative overflow-hidden rounded-[1.75rem] border border-[#EFDEE4] bg-white/95 p-5 shadow-[0_18px_45px_rgba(85,38,55,0.08)] backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-[#E0BBC7] hover:shadow-[0_24px_55px_rgba(132,63,89,0.14)]">
      <div className="flex items-start justify-between gap-4">
        <div
          className={`relative flex size-12 items-center justify-center rounded-[1rem] shadow-sm transition duration-300 group-hover:scale-105 ${METRIC_ICON_CLASSES[tone]}`}
        >
          {icon}
        </div>

        {trend ? (
          <TrendIndicator
            trend={trend}
          />
        ) : null}
      </div>

      <p className="mt-5 text-[11px] font-black uppercase tracking-[0.14em] text-[#9A818B]">
        {label}
      </p>

      <p className="mt-2 font-serif text-3xl font-semibold tracking-tight text-[#2F2027]">
        {value}
      </p>

      <p className="mt-2 text-xs leading-5 text-[#816D75]">
        {description}
      </p>
    </article>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  ALERTES                                   */
/* -------------------------------------------------------------------------- */

const ALERT_CLASSES: Record<
  DashboardAlert["tone"],
  {
    container: string;
    icon: string;
    badge: string;
  }
> = {
  ROSE: {
    container:
      "border-[#E8C3CF] bg-gradient-to-br from-[#FFF7F9] to-[#FFF0F4]",

    icon:
      "bg-[#F5D5DF] text-[#A5526D]",

    badge:
      "bg-[#A5526D] text-white shadow-sm",
  },

  AMBER: {
    container:
      "border-[#E8D39F] bg-gradient-to-br from-[#FFFCF3] to-[#FFF7DF]",

    icon:
      "bg-[#F6E7BF] text-[#9A6A18]",

    badge:
      "bg-[#B6842E] text-white shadow-sm",
  },

  BLUE: {
    container:
      "border-sky-200 bg-gradient-to-br from-sky-50 to-white",

    icon:
      "bg-sky-100 text-sky-700",

    badge:
      "bg-sky-600 text-white shadow-sm",
  },

  VIOLET: {
    container:
      "border-[#DCC6E8] bg-gradient-to-br from-[#FCF8FF] to-[#F5ECFA]",

    icon:
      "bg-[#EADCF2] text-[#765083]",

    badge:
      "bg-[#765083] text-white shadow-sm",
  },

  EMERALD: {
    container:
      "border-emerald-200 bg-gradient-to-br from-emerald-50 to-white",

    icon:
      "bg-emerald-100 text-emerald-600",

    badge:
      "bg-emerald-600 text-white",
  },
};

function AlertCard({
  alert,
}: {
  alert: DashboardAlert;
}) {
  const classes =
    ALERT_CLASSES[
      alert.tone
    ];

  return (
    <Link
      href={alert.href}
      className={`group flex items-start gap-3 rounded-[1.35rem] border p-4 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(85,38,55,0.10)] ${classes.container}`}
    >
      <span
        className={`flex size-11 shrink-0 items-center justify-center rounded-2xl shadow-sm ${classes.icon}`}
      >
        <AlertTriangle className="size-5" />
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex items-start justify-between gap-3">
          <span className="font-bold text-[#2F2027]">
            {alert.title}
          </span>

          <span
            className={`inline-flex min-w-6 items-center justify-center rounded-full px-2 py-0.5 text-xs font-black ${classes.badge}`}
          >
            {alert.count}
          </span>
        </span>

        <span className="mt-1 block text-sm leading-5 text-[#705D65]">
          {alert.description}
        </span>
      </span>

      <ChevronRight className="mt-2 size-4 shrink-0 text-[#B4939F] transition group-hover:translate-x-1 group-hover:text-[#843F59]" />
    </Link>
  );
}

/* -------------------------------------------------------------------------- */
/*                              RENDEZ-VOUS                                   */
/* -------------------------------------------------------------------------- */

function AppointmentStatusBadge({
  status,
}: {
  status: DashboardAppointmentStatus;
}) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-bold ${STATUS_CLASSES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

function PaymentBadge({
  status,
}: {
  status: DashboardPaymentStatus;
}) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${PAYMENT_CLASSES[status]}`}
    >
      {PAYMENT_LABELS[status]}
    </span>
  );
}

function AppointmentCard({
  appointment,
  showDate = false,
}: {
  appointment: DashboardAppointment;
  showDate?: boolean;
}) {
  const clientName =
    `${appointment.client.firstName} ${appointment.client.lastName}`.trim();

  const serviceNames =
    appointment.services
      .map(
        (service) =>
          service.quantity > 1
            ? `${service.name} ×${service.quantity}`
            : service.name,
      )
      .join(", ");

  return (
    <article className="group rounded-[1.5rem] border border-[#EFDEE4] bg-white p-4 shadow-[0_10px_28px_rgba(85,38,55,0.05)] transition duration-300 hover:-translate-y-0.5 hover:border-[#DCB4C1] hover:shadow-[0_16px_36px_rgba(132,63,89,0.10)]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="flex shrink-0 items-center gap-3 sm:w-28 sm:block">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#B45F7A] to-[#843F59] text-sm font-black text-white shadow-[0_8px_18px_rgba(132,63,89,0.25)] sm:size-14">
            {formatTime(
              appointment.startsAt,
            )}
          </div>

          {showDate ? (
            <p className="text-xs font-semibold capitalize text-[#8E747E] sm:mt-2 sm:text-center">
              {formatShortDate(
                appointment.startsAt,
              )}
            </p>
          ) : (
            <p className="text-xs font-semibold text-[#8E747E] sm:mt-2 sm:text-center">
              {formatDuration(
                appointment.totalDurationMinutes,
              )}
            </p>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-2 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <h3 className="truncate font-serif text-lg font-semibold text-[#2F2027]">
                {clientName ||
                  appointment.client.email}
              </h3>

              <p className="mt-1 line-clamp-2 text-sm leading-5 text-[#816D75]">
                {serviceNames ||
                  "Prestation non renseignée"}
              </p>
            </div>

            <AppointmentStatusBadge
              status={
                appointment.status
              }
            />
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#EAD9DF] bg-[#FBF7F8] px-2.5 py-1 font-semibold text-[#705D65]">
              <UsersRound className="size-3.5" />

              {appointment.staff
                ?.displayName ??
                "Non attribué"}
            </span>

            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#EAD9DF] bg-[#FBF7F8] px-2.5 py-1 font-semibold text-[#705D65]">
              <LayoutDashboard className="size-3.5" />

              {appointment.workstation
                ?.name ??
                "Aucun poste"}
            </span>

            <PaymentBadge
              status={
                appointment.paymentStatus
              }
            />
          </div>

          <div className="mt-4 flex items-end justify-between gap-4 border-t border-[#F0E1E6] pt-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#B19AA3]">
                Référence
              </p>

              <p className="mt-0.5 text-xs font-semibold text-[#705D65]">
                {appointment.reference}
              </p>
            </div>

            <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#B19AA3]">
                Montant
              </p>

              <p className="mt-1 font-serif text-lg font-semibold text-[#2F2027]">
                {formatCurrency(
                  appointment.totalPriceCents,
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

/* -------------------------------------------------------------------------- */
/*                                 CLIENTES                                   */
/* -------------------------------------------------------------------------- */

function RecentClientCard({
  client,
}: {
  client: DashboardRecentClient;
}) {
  const fullName =
    `${client.firstName} ${client.lastName}`.trim();

  return (
    <article className="group flex items-start gap-3 rounded-[1.5rem] border border-[#EFDEE4] bg-white p-4 shadow-[0_10px_28px_rgba(85,38,55,0.05)] transition duration-300 hover:-translate-y-0.5 hover:border-[#DCB4C1] hover:shadow-[0_16px_36px_rgba(132,63,89,0.10)]">
      <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-[#E8C3CF] bg-gradient-to-br from-[#FFF0F5] to-[#E8B4C0] text-sm font-black text-[#843F59] shadow-sm">
        {getInitials(
          client.firstName,
          client.lastName,
        ) || "CL"}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate font-serif text-lg font-semibold text-[#2F2027]">
              {fullName ||
                client.email}
            </h3>

            <p className="truncate text-xs text-[#8E747E]">
              {client.email}
            </p>
          </div>

          <span className="shrink-0 rounded-full border border-[#E7C6D0] bg-[#FFF1F5] px-2.5 py-1 text-xs font-black text-[#A5526D]">
            {formatNumber(
              client.loyaltyPoints,
            )}{" "}
            pts
          </span>
        </div>

        <div className="mt-3 flex flex-wrap gap-2 text-xs text-[#816D75]">
          <span className="rounded-full border border-[#EAD9DF] bg-[#FBF7F8] px-2.5 py-1">
            {client.appointmentCount} rendez-vous
          </span>

          <span className="rounded-full border border-[#EAD9DF] bg-[#FBF7F8] px-2.5 py-1">
            Inscrite le{" "}
            {new Intl.DateTimeFormat(
              "fr-FR",
              {
                timeZone:
                  "Europe/Paris",

                day:
                  "2-digit",

                month:
                  "2-digit",

                year:
                  "numeric",
              },
            ).format(
              new Date(
                client.createdAt,
              ),
            )}
          </span>
        </div>

        {client.nextAppointment ? (
          <div className="mt-3 flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-xs font-semibold text-emerald-700">
            <CalendarCheck2 className="size-4 shrink-0" />

            Prochain rendez-vous le{" "}
            {formatShortDate(
              client.nextAppointment
                .startsAt,
            )}{" "}
            à{" "}
            {formatTime(
              client.nextAppointment
                .startsAt,
            )}
          </div>
        ) : null}
      </div>
    </article>
  );
}

/* -------------------------------------------------------------------------- */
/*                                    AVIS                                    */
/* -------------------------------------------------------------------------- */

function ReviewCard({
  review,
}: {
  review: DashboardPendingReview;
}) {
  return (
    <article className="rounded-[1.5rem] border border-[#EFDEE4] bg-white p-4 shadow-[0_10px_28px_rgba(85,38,55,0.05)] transition duration-300 hover:border-[#DCB4C1] hover:shadow-[0_16px_36px_rgba(132,63,89,0.09)]">
      <div className="flex items-start gap-3">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-[#DCC6E8] bg-gradient-to-br from-[#FBF4FF] to-[#EADCF2] text-sm font-black text-[#765083]">
          {review.authorName
            .charAt(0)
            .toUpperCase() ||
            "C"}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h3 className="font-serif text-lg font-semibold text-[#2F2027]">
                {review.authorName}
              </h3>

              <p className="text-xs text-[#8E747E]">
                {formatShortDate(
                  review.createdAt,
                )}
              </p>
            </div>

            {review.isVerified ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-black text-emerald-700">
                <CheckCircle2 className="size-3.5" />

                Vérifié
              </span>
            ) : null}
          </div>

          <div className="mt-2 flex items-center gap-0.5">
            {Array.from(
              {
                length: 5,
              },
              (_, index) => (
                <Star
                  key={index}
                  className={`size-4 ${
                    index <
                    review.rating
                      ? "fill-[#D6B679] text-[#D6B679]"
                      : "fill-[#F4ECEF] text-[#E6D8DD]"
                  }`}
                />
              ),
            )}
          </div>

          {review.title ? (
            <p className="mt-3 font-semibold text-[#49363E]">
              {review.title}
            </p>
          ) : null}

          <p className="mt-2 line-clamp-3 text-sm leading-6 text-[#705D65]">
            {review.content}
          </p>
        </div>
      </div>
    </article>
  );
}

/* -------------------------------------------------------------------------- */
/*                             ACTIONS RAPIDES                                */
/* -------------------------------------------------------------------------- */

function QuickAction({
  href,
  label,
  description,
  icon,
  tone,
}: {
  href: string;
  label: string;
  description: string;
  icon: ReactNode;
  tone: MetricTone;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-[1.4rem] border border-[#EFDEE4] bg-white p-4 shadow-[0_8px_24px_rgba(85,38,55,0.04)] transition duration-300 hover:-translate-y-0.5 hover:border-[#DCB4C1] hover:bg-[#FFF9FA] hover:shadow-[0_14px_30px_rgba(132,63,89,0.10)]"
    >
      <span
        className={`flex size-12 shrink-0 items-center justify-center rounded-2xl shadow-sm transition duration-300 group-hover:scale-105 ${METRIC_ICON_CLASSES[tone]}`}
      >
        {icon}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block font-semibold text-[#2F2027]">
          {label}
        </span>

        <span className="mt-1 block text-xs leading-5 text-[#816D75]">
          {description}
        </span>
      </span>

      <ChevronRight className="size-4 shrink-0 text-[#B4939F] transition group-hover:translate-x-1 group-hover:text-[#843F59]" />
    </Link>
  );
}

/* -------------------------------------------------------------------------- */
/*                                ÉTAT VIDE                                   */
/* -------------------------------------------------------------------------- */

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
    <div className="flex min-h-52 flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-[#DFC7CF] bg-gradient-to-br from-[#FFF9FA] to-[#FFF3F6] p-8 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl border border-[#EAD9DF] bg-white text-[#B06A80] shadow-[0_10px_25px_rgba(85,38,55,0.08)]">
        {icon}
      </div>

      <h3 className="mt-4 font-serif text-lg font-semibold text-[#2F2027]">
        {title}
      </h3>

      <p className="mt-2 max-w-sm text-sm leading-6 text-[#816D75]">
        {description}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                DASHBOARD                                   */
/* -------------------------------------------------------------------------- */

export async function AdminDashboard({
  user,
  data,
}: AdminDashboardProps) {
  const promotionDashboard =
    await getAdminPromotionsDashboardData();

  const {
    metrics: promotionMetrics,
    endingSoon: promotionsEndingSoon,
    startingSoon: promotionsStartingSoon,
    nearUsageLimit: promotionsNearUsageLimit,
  } = promotionDashboard;

  const promotionAlertsCount =
    promotionsEndingSoon.length +
    promotionsStartingSoon.length +
    promotionsNearUsageLimit.length;

  const visibleBreakdown =
    data.appointmentStatusBreakdown.filter(
      (item) =>
        item.count > 0,
    );

  const todayLabel =
    formatLongDate(
      data.generatedAt,
    );

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_right,rgba(232,180,192,0.20),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(214,182,121,0.10),transparent_32%),linear-gradient(135deg,#FFF8FA_0%,#FFFDFC_46%,#FFF5F7_100%)] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="relative z-10 mx-auto max-w-[1600px] space-y-6">
        {/* ------------------------------------------------------------------ */}
        {/* HERO                                                               */}
        {/* ------------------------------------------------------------------ */}

        <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,#2F2027_0%,#5B3342_45%,#843F59_100%)] px-5 py-7 text-white shadow-[0_28px_70px_rgba(79,38,54,0.24)] sm:px-8 sm:py-9 lg:px-10">
          <div className="absolute -right-20 -top-24 size-72 rounded-full bg-[#E8B4C0]/25 blur-3xl" />
          <div className="absolute -bottom-32 left-1/3 size-72 rounded-full bg-[#D6B679]/18 blur-3xl" />

          <div className="relative flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-[#F8DDE5] backdrop-blur">
                  <Sparkles className="size-3.5" />

                  Le Palais des Ongles
                </span>

                <span className="rounded-full border border-[#D6B679]/30 bg-[#D6B679]/10 px-3 py-1.5 text-xs font-semibold text-[#F4DDAF]">
                  {user.roleLabel}
                </span>
              </div>

              <h1 className="mt-5 font-serif text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
                Bonjour{" "}
                {user.firstName}
                <span className="text-[#E8B4C0]">
                  .
                </span>
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-[#EADDE2] sm:text-base">
                Voici l’activité du salon pour{" "}
                <span className="font-semibold capitalize text-[#F6DDE5]">
                  {todayLabel}
                </span>
                . Retrouvez les demandes à traiter, les prochains rendez-vous et les performances du mois.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/admin/agenda"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-[#843F59] shadow-[0_10px_25px_rgba(20,8,13,0.14)] transition hover:-translate-y-0.5 hover:bg-[#FFF2F6]"
              >
                <CalendarDays className="size-4" />

                Ouvrir l’agenda
              </Link>

              <Link
                href="/admin/rendez-vous"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-black text-white backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/15"
              >
                <CalendarClock className="size-4" />

                Gérer les rendez-vous
              </Link>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------------ */}
        {/* MÉTRIQUES PRINCIPALES                                              */}
        {/* ------------------------------------------------------------------ */}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Rendez-vous aujourd’hui"
            value={formatNumber(
              data.metrics
                .appointmentsToday,
            )}
            description={`${formatNumber(
              data.metrics
                .appointmentsThisMonth,
            )} rendez-vous sur le mois en cours`}
            icon={
              <CalendarCheck2 className="size-5" />
            }
            tone="ROSE"
            trend={
              data.trends
                .appointments
            }
          />

          <MetricCard
            label="Chiffre d’affaires"
            value={formatCurrency(
              data.metrics
                .revenueThisMonthCents,
            )}
            description="Prestations terminées durant le mois"
            icon={
              <BadgeEuro className="size-5" />
            }
            tone="EMERALD"
            trend={
              data.trends.revenue
            }
          />

          <MetricCard
            label="Encaissements PayPal"
            value={formatCurrency(
              data.metrics
                .paypalCollectedThisMonthCents,
            )}
            description="Acomptes et paiements enregistrés ce mois"
            icon={
              <WalletCards className="size-5" />
            }
            tone="BLUE"
          />

          <MetricCard
            label="Clientes actives"
            value={formatNumber(
              data.metrics
                .activeClients,
            )}
            description={`${formatNumber(
              data.metrics
                .newClientsThisMonth,
            )} nouvelles clientes ce mois`}
            icon={
              <UsersRound className="size-5" />
            }
            tone="VIOLET"
            trend={
              data.trends
                .newClients
            }
          />
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Demandes en attente"
            value={formatNumber(
              data.metrics
                .pendingAppointments,
            )}
            description="Rendez-vous à confirmer ou à refuser"
            icon={
              <Clock3 className="size-5" />
            }
            tone="AMBER"
          />

          <MetricCard
            label="Avis à valider"
            value={formatNumber(
              data.metrics
                .pendingReviews,
            )}
            description={
              data.metrics
                .averageRating !==
              null
                ? `Note moyenne : ${data.metrics.averageRating.toFixed(1)} / 5`
                : "Aucune note publiée pour le moment"
            }
            icon={
              <Star className="size-5" />
            }
            tone="VIOLET"
          />

          <MetricCard
            label="Messages non lus"
            value={formatNumber(
              data.metrics
                .unreadMessages,
            )}
            description="Notifications de conversation à consulter"
            icon={
              <MessageCircle className="size-5" />
            }
            tone="BLUE"
          />

          <MetricCard
            label="Créations publiées"
            value={formatNumber(
              data.metrics
                .publishedGalleryItems,
            )}
            description="Publications visibles dans la galerie"
            icon={
              <Camera className="size-5" />
            }
            tone="ROSE"
          />
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <MetricCard
            label="Membres du Club VIP"
            value={formatNumber(
              data.metrics
                .vipMembers,
            )}
            description={`${formatNumber(
              data.metrics
                .activeVipMembers,
            )} membres actives dans le programme`}
            icon={
              <Crown className="size-5" />
            }
            tone="VIOLET"
          />

          <MetricCard
            label="Concours actifs"
            value={formatNumber(
              data.metrics
                .activeContests,
            )}
            description={`${formatNumber(
              data.metrics
                .contestParticipants,
            )} participations enregistrées`}
            icon={
              <Trophy className="size-5" />
            }
            tone="AMBER"
          />

          <MetricCard
            label="Tirages à effectuer"
            value={formatNumber(
              data.metrics
                .contestsAwaitingDraw,
            )}
            description="Concours terminés sans gagnante désignée"
            icon={
              <Sparkles className="size-5" />
            }
            tone="ROSE"
          />
        </section>

        {/* ------------------------------------------------------------------ */}
        {/* PILOTAGE DES PROMOTIONS                                            */}
        {/* ------------------------------------------------------------------ */}

        <section className="relative overflow-hidden rounded-[2rem] border border-[#E7CCD5] bg-[linear-gradient(135deg,#FFF7FA_0%,#FFFFFF_48%,#FFF3F6_100%)] p-5 shadow-[0_20px_55px_rgba(85,38,55,0.09)] sm:p-7">
          <div className="pointer-events-none absolute -right-16 -top-20 size-64 rounded-full bg-[#E8B4C0]/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 left-1/3 size-56 rounded-full bg-[#D6B679]/10 blur-3xl" />

          <div className="relative">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
              <div className="max-w-3xl">
                <div className="flex items-center gap-2">
                  <span className="flex size-11 items-center justify-center rounded-2xl border border-[#E8C3CF] bg-gradient-to-br from-[#FFF0F5] to-[#F4D4DE] text-[#A5526D] shadow-sm">
                    <Tags className="size-5" />
                  </span>

                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#A5526D]">
                      Marketing
                    </p>

                    <h2 className="font-serif text-2xl font-semibold tracking-tight text-[#2F2027] sm:text-[1.75rem]">
                      Pilotage des promotions
                    </h2>
                  </div>
                </div>

                <p className="mt-4 max-w-2xl text-sm leading-6 text-[#816D75]">
                  Créez vos offres commerciales, programmez leur publication
                  et contrôlez leur visibilité sur le site et la page
                  d’accueil.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/admin/promotions/nouvelle"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#B45F7A] to-[#843F59] px-5 py-3 text-sm font-black text-white shadow-[0_12px_28px_rgba(132,63,89,0.22)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(132,63,89,0.28)]"
                >
                  <Plus className="size-4" />

                  Nouvelle promotion
                </Link>

                <Link
                  href="/admin/promotions"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#E2C2CC] bg-white px-5 py-3 text-sm font-black text-[#843F59] shadow-sm transition hover:-translate-y-0.5 hover:border-[#C991A3] hover:bg-[#FFF5F8]"
                >
                  Gérer les promotions

                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>

            <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              <Link
                href="/admin/promotions"
                className="group rounded-[1.4rem] border border-[#E8C3CF] bg-white/90 p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-[#D9A9B8] hover:shadow-md"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[10px] font-black uppercase tracking-[0.15em] text-[#9A818B]">
                    Total
                  </span>

                  <Tags className="size-4 text-[#B45F7A]" />
                </div>

                <p className="mt-3 font-serif text-3xl font-semibold text-[#2F2027]">
                  {formatNumber(
                    promotionMetrics.totalPromotions,
                  )}
                </p>

                <p className="mt-1 text-xs text-[#816D75]">
                  promotions enregistrées
                </p>
              </Link>

              <Link
                href="/admin/promotions?status=ACTIVE"
                className="group rounded-[1.4rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[10px] font-black uppercase tracking-[0.15em] text-emerald-700">
                    Actives
                  </span>

                  <CheckCircle2 className="size-4 text-emerald-600" />
                </div>

                <p className="mt-3 font-serif text-3xl font-semibold text-emerald-800">
                  {formatNumber(
                    promotionMetrics.activePromotions,
                  )}
                </p>

                <p className="mt-1 text-xs text-emerald-700/80">
                  offres actuellement disponibles
                </p>
              </Link>

              <Link
                href="/admin/promotions?status=SCHEDULED"
                className="group rounded-[1.4rem] border border-sky-200 bg-gradient-to-br from-sky-50 to-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[10px] font-black uppercase tracking-[0.15em] text-sky-700">
                    Programmées
                  </span>

                  <CalendarClock className="size-4 text-sky-600" />
                </div>

                <p className="mt-3 font-serif text-3xl font-semibold text-sky-800">
                  {formatNumber(
                    promotionMetrics.scheduledPromotions,
                  )}
                </p>

                <p className="mt-1 text-xs text-sky-700/80">
                  publications à venir
                </p>
              </Link>

              <Link
                href="/admin/promotions?homepage=true"
                className="group rounded-[1.4rem] border border-[#DCC6E8] bg-gradient-to-br from-[#FBF4FF] to-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[10px] font-black uppercase tracking-[0.15em] text-[#765083]">
                    Accueil
                  </span>

                  <LayoutDashboard className="size-4 text-[#765083]" />
                </div>

                <p className="mt-3 font-serif text-3xl font-semibold text-[#5F3D6B]">
                  {formatNumber(
                    promotionMetrics.promotionsShownOnHomepage,
                  )}
                </p>

                <p className="mt-1 text-xs text-[#765083]/80">
                  visibles sur la page d’accueil
                </p>
              </Link>

              <Link
                href="/admin/promotions"
                className="group rounded-[1.4rem] border border-[#E8D39F] bg-gradient-to-br from-[#FFFBEF] to-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[10px] font-black uppercase tracking-[0.15em] text-[#9A6A18]">
                    À surveiller
                  </span>

                  <AlertTriangle className="size-4 text-[#B6842E]" />
                </div>

                <p className="mt-3 font-serif text-3xl font-semibold text-[#8A601E]">
                  {formatNumber(
                    promotionAlertsCount,
                  )}
                </p>

                <p className="mt-1 text-xs text-[#9A6A18]/80">
                  démarrages, fins ou limites proches
                </p>
              </Link>
            </div>

            {promotionAlertsCount > 0 ? (
              <div className="mt-5 flex flex-wrap gap-2">
                {promotionsStartingSoon.length > 0 ? (
                  <Link
                    href="/admin/promotions?status=SCHEDULED"
                    className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3.5 py-2 text-xs font-black text-sky-700 transition hover:bg-sky-100"
                  >
                    <CalendarClock className="size-3.5" />

                    {promotionsStartingSoon.length} promotion
                    {promotionsStartingSoon.length > 1
                      ? "s"
                      : ""}{" "}
                    bientôt disponible
                    {promotionsStartingSoon.length > 1
                      ? "s"
                      : ""}
                  </Link>
                ) : null}

                {promotionsEndingSoon.length > 0 ? (
                  <Link
                    href="/admin/promotions?status=ACTIVE"
                    className="inline-flex items-center gap-2 rounded-full border border-[#E8D39F] bg-[#FFF9E9] px-3.5 py-2 text-xs font-black text-[#9A6A18] transition hover:bg-[#FFF3D2]"
                  >
                    <Clock3 className="size-3.5" />

                    {promotionsEndingSoon.length} promotion
                    {promotionsEndingSoon.length > 1
                      ? "s"
                      : ""}{" "}
                    bientôt terminée
                    {promotionsEndingSoon.length > 1
                      ? "s"
                      : ""}
                  </Link>
                ) : null}

                {promotionsNearUsageLimit.length > 0 ? (
                  <Link
                    href="/admin/promotions"
                    className="inline-flex items-center gap-2 rounded-full border border-[#E8C3CF] bg-[#FFF1F6] px-3.5 py-2 text-xs font-black text-[#A5526D] transition hover:bg-[#FFE5ED]"
                  >
                    <AlertTriangle className="size-3.5" />

                    {promotionsNearUsageLimit.length} limite
                    {promotionsNearUsageLimit.length > 1
                      ? "s"
                      : ""}{" "}
                    d’utilisation bientôt atteinte
                    {promotionsNearUsageLimit.length > 1
                      ? "s"
                      : ""}
                  </Link>
                ) : null}
              </div>
            ) : (
              <div className="mt-5 flex items-center gap-3 rounded-[1.25rem] border border-emerald-200 bg-emerald-50/80 px-4 py-3 text-sm text-emerald-700">
                <CheckCircle2 className="size-5 shrink-0" />

                <p>
                  Aucune promotion ne nécessite votre attention actuellement.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* ------------------------------------------------------------------ */}
        {/* PILOTAGE BUSINESS PREMIUM                                          */}
        {/* ------------------------------------------------------------------ */}

        <DashboardBusinessOverview
          finance={data.finance}
          occupancy={data.occupancy}
          businessHealth={
            data.businessHealth
          }
        />

        {/* ------------------------------------------------------------------ */}
        {/* GRAPHIQUES PREMIUM                                                  */}
        {/* ------------------------------------------------------------------ */}

        <DashboardActivityCharts
          dailyActivity={
            data.dailyActivity
          }
          monthlyActivity={
            data.monthlyActivity
          }
          hourlyActivity={
            data.hourlyActivity
          }
          weekdayActivity={
            data.weekdayActivity
          }
        />

        {/* ------------------------------------------------------------------ */}
        {/* PERFORMANCES COMMERCIALES PREMIUM                                  */}
        {/* ------------------------------------------------------------------ */}

        <DashboardCommercialPerformance
          topServices={
            data.topServices
          }
          topClients={
            data.topClients
          }
          staffPerformance={
            data.staffPerformance
          }
        />

        {/* ------------------------------------------------------------------ */}
        {/* ASSISTANT INTELLIGENT ET ALERTES PREMIUM                           */}
        {/* ------------------------------------------------------------------ */}

        <DashboardInsightsAndAlerts
          insights={
            data.insights
          }
          inactiveClients={
            data.inactiveClients
          }
          pendingReviewItems={
            data.pendingReviewItems
          }
          appointmentStatusBreakdown={
            data.appointmentStatusBreakdown
          }
        />

        {/* ------------------------------------------------------------------ */}
        {/* ALERTES                                                            */}
        {/* ------------------------------------------------------------------ */}

        {data.alerts.length >
        0 ? (
          <section className="rounded-[2rem] border border-[#EFDEE4] bg-white/95 p-5 shadow-[0_20px_55px_rgba(85,38,55,0.08)] backdrop-blur sm:p-6">
            <SectionHeader
              eyebrow="À traiter"
              title="Alertes et priorités"
              description="Les éléments qui nécessitent votre attention."
            />

            <div className="mt-5 grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
              {data.alerts.map(
                (alert) => (
                  <AlertCard
                    key={alert.id}
                    alert={alert}
                  />
                ),
              )}
            </div>
          </section>
        ) : (
          <section className="flex items-center gap-4 rounded-[1.75rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-5 shadow-[0_14px_35px_rgba(16,185,129,0.08)]">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-100 text-emerald-700 shadow-sm">
              <CheckCircle2 className="size-5" />
            </div>

            <div>
              <h2 className="font-serif text-lg font-semibold text-emerald-950">
                Tout est à jour
              </h2>

              <p className="mt-0.5 text-sm text-emerald-700">
                Aucune alerte importante ne nécessite votre attention.
              </p>
            </div>
          </section>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* JOURNÉE + ACTIONS                                                  */}
        {/* ------------------------------------------------------------------ */}

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.8fr)]">
          <div className="rounded-[2rem] border border-[#EFDEE4] bg-white/95 p-5 shadow-[0_20px_55px_rgba(85,38,55,0.08)] backdrop-blur sm:p-6">
            <SectionHeader
              eyebrow="Planning"
              title="Rendez-vous du jour"
              description={`${formatNumber(
                data.todayAppointments
                  .length,
              )} rendez-vous affichés pour aujourd’hui.`}
              action={
                <Link
                  href="/admin/agenda"
                  className="inline-flex items-center gap-2 rounded-full border border-[#E8C3CF] bg-[#FFF4F7] px-4 py-2 text-sm font-black text-[#A5526D] transition hover:border-[#D8AAB9] hover:bg-[#FFEAF0] hover:text-[#843F59]"
                >
                  Voir l’agenda

                  <ArrowRight className="size-4" />
                </Link>
              }
            />

            <div className="mt-5 space-y-3">
              {data.todayAppointments
                .length > 0 ? (
                data.todayAppointments.map(
                  (
                    appointment,
                  ) => (
                    <AppointmentCard
                      key={
                        appointment.id
                      }
                      appointment={
                        appointment
                      }
                    />
                  ),
                )
              ) : (
                <EmptyState
                  icon={
                    <CalendarCheck2 className="size-5" />
                  }
                  title="Aucun rendez-vous aujourd’hui"
                  description="La journée est libre pour le moment. Les futures réservations apparaîtront automatiquement ici."
                />
              )}
            </div>
          </div>

          <aside className="space-y-6">
            <section className="rounded-[2rem] border border-[#EFDEE4] bg-white/95 p-5 shadow-[0_20px_55px_rgba(85,38,55,0.08)] backdrop-blur sm:p-6">
              <SectionHeader
                eyebrow="Gestion"
                title="Actions rapides"
                description="Accédez aux fonctions principales."
              />

              <div className="mt-5 space-y-3">
                <QuickAction
                  href="/admin/agenda"
                  label="Consulter l’agenda"
                  description="Vue jour, semaine et mois"
                  icon={
                    <CalendarDays className="size-5" />
                  }
                  tone="ROSE"
                />

                <QuickAction
                  href="/admin/rendez-vous"
                  label="Traiter les demandes"
                  description="Confirmer, refuser ou modifier"
                  icon={
                    <CalendarClock className="size-5" />
                  }
                  tone="AMBER"
                />

                <QuickAction
                  href="/admin/galerie/nouvelle"
                  label="Publier une création"
                  description="Ajouter des photos à la galerie"
                  icon={
                    <Plus className="size-5" />
                  }
                  tone="VIOLET"
                />

                <QuickAction
                  href="/admin/equipe"
                  label="Gérer l’équipe"
                  description="Membres, services et postes"
                  icon={
                    <UserPlus className="size-5" />
                  }
                  tone="BLUE"
                />

                <QuickAction
                  href="/admin/fidelite"
                  label="Gérer le Club VIP"
                  description="Membres, points, niveaux et récompenses"
                  icon={
                    <Crown className="size-5" />
                  }
                  tone="VIOLET"
                />

                <QuickAction
                  href="/admin/concours"
                  label="Gérer les concours"
                  description="Création, participantes et tirages"
                  icon={
                    <Trophy className="size-5" />
                  }
                  tone="AMBER"
                />

                <QuickAction
                  href="/admin/parametres"
                  label="Paramètres du salon"
                  description="Site, réservations, PayPal et notifications"
                  icon={
                    <Settings className="size-5" />
                  }
                  tone="ZINC"
                />

                <QuickAction
                  href="/admin/horaires/exceptions"
                  label="Ajouter une absence"
                  description="Congés ou fermeture du salon"
                  icon={
                    <Clock3 className="size-5" />
                  }
                  tone="ZINC"
                />
              </div>
            </section>

            <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,#843F59_0%,#B45F7A_52%,#C97992_100%)] p-6 text-white shadow-[0_24px_55px_rgba(132,63,89,0.25)]">
              <div className="flex size-12 items-center justify-center rounded-2xl border border-white/15 bg-white/10 shadow-inner backdrop-blur">
                <Sparkles className="size-5" />
              </div>

              <h2 className="mt-5 font-serif text-2xl font-semibold">
                Activité du mois
              </h2>

              <p className="mt-2 text-sm leading-7 text-[#FBEAF0]">
                {formatNumber(
                  data.metrics
                    .appointmentsThisMonth,
                )}{" "}
                rendez-vous enregistrés et{" "}
                {formatCurrency(
                  data.metrics
                    .revenueThisMonthCents,
                )}{" "}
                de chiffre d’affaires réalisé.
              </p>

              <Link
                href="/admin/rendez-vous"
                className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-sm font-black text-[#843F59] shadow-[0_10px_24px_rgba(65,25,40,0.16)] transition hover:-translate-y-0.5 hover:bg-[#FFF2F6]"
              >
                Consulter l’activité

                <ArrowRight className="size-4" />
              </Link>
            </section>
          </aside>
        </section>

        {/* ------------------------------------------------------------------ */}
        {/* PROCHAINS RDV + RÉPARTITION                                        */}
        {/* ------------------------------------------------------------------ */}

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(340px,0.75fr)]">
          <div className="rounded-[2rem] border border-[#EFDEE4] bg-white/95 p-5 shadow-[0_20px_55px_rgba(85,38,55,0.08)] backdrop-blur sm:p-6">
            <SectionHeader
              eyebrow="À venir"
              title="Prochains rendez-vous"
              description="Les prochaines clientes attendues après aujourd’hui."
              action={
                <Link
                  href="/admin/rendez-vous"
                  className="inline-flex items-center gap-2 rounded-full border border-[#E8C3CF] bg-[#FFF4F7] px-4 py-2 text-sm font-black text-[#A5526D] transition hover:border-[#D8AAB9] hover:bg-[#FFEAF0] hover:text-[#843F59]"
                >
                  Voir tout

                  <ArrowRight className="size-4" />
                </Link>
              }
            />

            <div className="mt-5 space-y-3">
              {data.upcomingAppointments
                .length > 0 ? (
                data.upcomingAppointments.map(
                  (
                    appointment,
                  ) => (
                    <AppointmentCard
                      key={
                        appointment.id
                      }
                      appointment={
                        appointment
                      }
                      showDate
                    />
                  ),
                )
              ) : (
                <EmptyState
                  icon={
                    <CalendarDays className="size-5" />
                  }
                  title="Aucun rendez-vous à venir"
                  description="Les nouvelles réservations apparaîtront dans cette section."
                />
              )}
            </div>
          </div>

          <div className="rounded-[2rem] border border-[#EFDEE4] bg-white/95 p-5 shadow-[0_20px_55px_rgba(85,38,55,0.08)] backdrop-blur sm:p-6">
            <SectionHeader
              eyebrow="Statistiques"
              title="Répartition du mois"
              description="Répartition des rendez-vous selon leur état."
            />

            <div className="mt-6 space-y-5">
              {visibleBreakdown.length >
              0 ? (
                visibleBreakdown.map(
                  (item) => (
                    <div
                      key={
                        item.status
                      }
                    >
                      <div className="mb-2 flex items-center justify-between gap-4 text-sm">
                        <span className="font-semibold text-[#5E4851]">
                          {
                            STATUS_LABELS[
                              item.status
                            ]
                          }
                        </span>

                        <span className="font-black text-[#2F2027]">
                          {item.count}
                          <span className="ml-1 font-medium text-[#AA949D]">
                            (
                            {
                              item.percentage
                            }
                            %)
                          </span>
                        </span>
                      </div>

                      <div className="h-2.5 overflow-hidden rounded-full bg-[#F1E5E9]">
                        <div
                          className={`h-full rounded-full ${STATUS_PROGRESS_CLASSES[item.status]}`}
                          style={{
                            width: `${Math.max(
                              item.percentage,
                              3,
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  ),
                )
              ) : (
                <EmptyState
                  icon={
                    <LayoutDashboard className="size-5" />
                  }
                  title="Aucune donnée ce mois-ci"
                  description="La répartition sera calculée dès le premier rendez-vous."
                />
              )}
            </div>

            <div className="mt-7 grid grid-cols-2 gap-3 border-t border-[#F0E1E6] pt-5">
              <div className="rounded-2xl border border-[#EAD9DF] bg-gradient-to-br from-white to-[#FFF6F8] p-4 shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#A68C96]">
                  Total
                </p>

                <p className="mt-2 font-serif text-2xl font-semibold text-[#2F2027]">
                  {formatNumber(
                    data.metrics
                      .appointmentsThisMonth,
                  )}
                </p>
              </div>

              <div className="rounded-2xl border border-[#EAD9DF] bg-gradient-to-br from-white to-[#FFF6F8] p-4 shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#A68C96]">
                  En attente
                </p>

                <p className="mt-2 font-serif text-2xl font-semibold text-[#B6842E]">
                  {formatNumber(
                    data.metrics
                      .pendingAppointments,
                  )}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------------ */}
        {/* CLIENTES + AVIS                                                    */}
        {/* ------------------------------------------------------------------ */}

        <section className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-[2rem] border border-[#EFDEE4] bg-white/95 p-5 shadow-[0_20px_55px_rgba(85,38,55,0.08)] backdrop-blur sm:p-6">
            <SectionHeader
              eyebrow="Clientèle"
              title="Clientes récentes"
              description={`${formatNumber(
                data.metrics
                  .newClientsThisMonth,
              )} nouvelles inscriptions ce mois-ci.`}
            />

            <div className="mt-5 space-y-3">
              {data.recentClients
                .length > 0 ? (
                data.recentClients.map(
                  (client) => (
                    <RecentClientCard
                      key={
                        client.id
                      }
                      client={
                        client
                      }
                    />
                  ),
                )
              ) : (
                <EmptyState
                  icon={
                    <UsersRound className="size-5" />
                  }
                  title="Aucune cliente inscrite"
                  description="Les nouveaux comptes clients apparaîtront automatiquement ici."
                />
              )}
            </div>
          </div>

          <div
            id="avis-en-attente"
            className="rounded-[2rem] border border-[#EFDEE4] bg-white/95 p-5 shadow-[0_20px_55px_rgba(85,38,55,0.08)] backdrop-blur sm:p-6"
          >
            <SectionHeader
              eyebrow="Réputation"
              title="Avis en attente"
              description="Les derniers avis à contrôler avant publication."
              action={
                data.metrics
                  .averageRating !==
                null ? (
                  <div className="flex items-center gap-2 rounded-full border border-[#E8D39F] bg-[#FFF9E9] px-3 py-1.5 shadow-sm">
                    <Star className="size-4 fill-[#D6B679] text-[#D6B679]" />

                    <span className="text-sm font-black text-[#9A6A18]">
                      {data.metrics.averageRating.toFixed(
                        1,
                      )}
                      /5
                    </span>
                  </div>
                ) : null
              }
            />

            <div className="mt-5 space-y-3">
              {data.pendingReviewItems
                .length > 0 ? (
                data.pendingReviewItems.map(
                  (review) => (
                    <ReviewCard
                      key={
                        review.id
                      }
                      review={
                        review
                      }
                    />
                  ),
                )
              ) : (
                <EmptyState
                  icon={
                    <Star className="size-5" />
                  }
                  title="Aucun avis à valider"
                  description="Tous les avis reçus ont été traités."
                />
              )}
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------------ */}
        {/* FOOTER                                                             */}
        {/* ------------------------------------------------------------------ */}

        <footer className="flex flex-col gap-3 rounded-[1.5rem] border border-[#EFDEE4] bg-white/80 px-5 py-4 text-xs text-[#8E747E] shadow-[0_10px_30px_rgba(85,38,55,0.05)] backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <p>
            Données mises à jour le{" "}
            {formatLongDate(
              data.generatedAt,
            )}{" "}
            à{" "}
            {formatTime(
              data.generatedAt,
            )}
            .
          </p>

          <p className="truncate">
            Session :{" "}
            <span className="font-semibold text-[#5E4851]">
              {user.email}
            </span>
          </p>
        </footer>
      </div>
    </main>
  );
}
