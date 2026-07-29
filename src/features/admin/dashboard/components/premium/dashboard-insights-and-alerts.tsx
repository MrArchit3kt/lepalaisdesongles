"use client";

import Link from "next/link";

import {
  AlertTriangle,
  ArrowRight,
  BadgeEuro,
  BellRing,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  Crown,
  Info,
  Lightbulb,
  Mail,
  MessageSquareText,
  Phone,
  RefreshCcw,
  ShieldAlert,
  Sparkles,
  Star,
  UserRound,
  UsersRound,
} from "lucide-react";

import type {
  DashboardInactiveClient,
  DashboardInsight,
  DashboardInsightPriority,
  DashboardInsightType,
  DashboardPendingReview,
  DashboardStatusBreakdown,
} from "@/features/admin/dashboard/types/admin-dashboard.types";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

type DashboardInsightsAndAlertsProps = {
  insights: DashboardInsight[];
  inactiveClients: DashboardInactiveClient[];
  pendingReviewItems: DashboardPendingReview[];
  appointmentStatusBreakdown: DashboardStatusBreakdown[];
};

type Tone =
  | "ROSE"
  | "AMBER"
  | "BLUE"
  | "VIOLET"
  | "EMERALD"
  | "ZINC"
  | "RED";

type InsightAppearance = {
  icon: React.ReactNode;
  tone: Tone;
  label: string;
};

type StatusAppearance = {
  label: string;
  tone: Tone;
};

type EmptyStateProps = {
  title: string;
  description: string;
  icon: React.ReactNode;
};

/* -------------------------------------------------------------------------- */
/*                                 CONSTANTES                                 */
/* -------------------------------------------------------------------------- */

const TONE_STYLES: Record<
  Tone,
  {
    card: string;
    icon: string;
    badge: string;
    progress: string;
  }
> = {
  ROSE: {
    card:
      "border-[#EDCAD5] bg-gradient-to-br from-[#FFF7FA] to-white",

    icon:
      "border-[#E8C3CF] bg-[#F9E6EC] text-[#A5526D]",

    badge:
      "border-[#E8C3CF] bg-[#FFF0F5] text-[#9B4A65]",

    progress:
      "from-[#B45F7A] to-[#D995AA]",
  },

  AMBER: {
    card:
      "border-amber-200 bg-gradient-to-br from-amber-50 to-white",

    icon:
      "border-amber-200 bg-amber-100 text-amber-700",

    badge:
      "border-amber-200 bg-amber-50 text-amber-700",

    progress:
      "from-amber-500 to-amber-300",
  },

  BLUE: {
    card:
      "border-sky-200 bg-gradient-to-br from-sky-50 to-white",

    icon:
      "border-sky-200 bg-sky-100 text-sky-700",

    badge:
      "border-sky-200 bg-sky-50 text-sky-700",

    progress:
      "from-sky-500 to-sky-300",
  },

  VIOLET: {
    card:
      "border-violet-200 bg-gradient-to-br from-violet-50 to-white",

    icon:
      "border-violet-200 bg-violet-100 text-violet-700",

    badge:
      "border-violet-200 bg-violet-50 text-violet-700",

    progress:
      "from-violet-500 to-violet-300",
  },

  EMERALD: {
    card:
      "border-emerald-200 bg-gradient-to-br from-emerald-50 to-white",

    icon:
      "border-emerald-200 bg-emerald-100 text-emerald-700",

    badge:
      "border-emerald-200 bg-emerald-50 text-emerald-700",

    progress:
      "from-emerald-500 to-emerald-300",
  },

  ZINC: {
    card:
      "border-zinc-200 bg-gradient-to-br from-zinc-50 to-white",

    icon:
      "border-zinc-200 bg-zinc-100 text-zinc-700",

    badge:
      "border-zinc-200 bg-zinc-50 text-zinc-700",

    progress:
      "from-zinc-500 to-zinc-300",
  },

  RED: {
    card:
      "border-red-200 bg-gradient-to-br from-red-50 to-white",

    icon:
      "border-red-200 bg-red-100 text-red-700",

    badge:
      "border-red-200 bg-red-50 text-red-700",

    progress:
      "from-red-500 to-red-300",
  },
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

function formatDate(
  value: string | null,
): string {
  if (
    !value
  ) {
    return "Aucun rendez-vous";
  }

  return new Intl.DateTimeFormat(
    "fr-FR",
    {
      day:
        "2-digit",

      month:
        "short",

      year:
        "numeric",
    },
  ).format(
    new Date(
      value,
    ),
  );
}

function formatRelativeDays(
  days: number,
): string {
  if (
    days <= 0
  ) {
    return "Aujourd’hui";
  }

  if (
    days === 1
  ) {
    return "Inactive depuis 1 jour";
  }

  return `Inactive depuis ${formatNumber(days)} jours`;
}

function getInitials(
  value: string,
): string {
  return value
    .split(" ")
    .filter(Boolean)
    .map(
      (part) =>
        part.charAt(0),
    )
    .join("")
    .slice(
      0,
      2,
    )
    .toUpperCase();
}

function getInsightAppearance(
  type: DashboardInsightType,
): InsightAppearance {
  const appearances: Record<
    DashboardInsightType,
    InsightAppearance
  > = {
    INFORMATION: {
      icon:
        <Info className="size-5" />,

      tone:
        "BLUE",

      label:
        "Information",
    },

    SUCCESS: {
      icon:
        <CheckCircle2 className="size-5" />,

      tone:
        "EMERALD",

      label:
        "Succès",
    },

    WARNING: {
      icon:
        <AlertTriangle className="size-5" />,

      tone:
        "AMBER",

      label:
        "Attention",
    },

    OPPORTUNITY: {
      icon:
        <Lightbulb className="size-5" />,

      tone:
        "VIOLET",

      label:
        "Opportunité",
    },

    VIP: {
      icon:
        <Crown className="size-5" />,

      tone:
        "AMBER",

      label:
        "Cliente VIP",
    },

    REVENUE: {
      icon:
        <BadgeEuro className="size-5" />,

      tone:
        "EMERALD",

      label:
        "Chiffre d’affaires",
    },

    PLANNING: {
      icon:
        <CalendarClock className="size-5" />,

      tone:
        "ROSE",

      label:
        "Planning",
    },

    CLIENT: {
      icon:
        <UserRound className="size-5" />,

      tone:
        "VIOLET",

      label:
        "Clientèle",
    },
  };

  return appearances[type];
}

function getPriorityLabel(
  priority: DashboardInsightPriority,
): string {
  const labels: Record<
    DashboardInsightPriority,
    string
  > = {
    LOW:
      "Faible",

    MEDIUM:
      "Moyenne",

    HIGH:
      "Haute",

    CRITICAL:
      "Critique",
  };

  return labels[priority];
}

function getPriorityTone(
  priority: DashboardInsightPriority,
): Tone {
  if (
    priority ===
    "CRITICAL"
  ) {
    return "RED";
  }

  if (
    priority ===
    "HIGH"
  ) {
    return "AMBER";
  }

  if (
    priority ===
    "MEDIUM"
  ) {
    return "VIOLET";
  }

  return "ZINC";
}

function getStatusAppearance(
  status: string,
): StatusAppearance {
  const appearances: Record<
    string,
    StatusAppearance
  > = {
    PENDING: {
      label:
        "En attente",

      tone:
        "AMBER",
    },

    CONFIRMED: {
      label:
        "Confirmés",

      tone:
        "BLUE",
    },

    COMPLETED: {
      label:
        "Terminés",

      tone:
        "EMERALD",
    },

    CANCELLED: {
      label:
        "Annulés",

      tone:
        "RED",
    },

    REFUSED: {
      label:
        "Refusés",

      tone:
        "ZINC",
    },

    NO_SHOW: {
      label:
        "Absences",

      tone:
        "VIOLET",
    },
  };

  return appearances[status] ?? {
    label:
      status,

    tone:
      "ZINC",
  };
}

function clampPercentage(
  value: number,
): number {
  return Math.min(
    100,
    Math.max(
      0,
      value,
    ),
  );
}

/* -------------------------------------------------------------------------- */
/*                               SOUS-COMPOSANTS                              */
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

function Panel({
  eyebrow,
  title,
  description,
  icon,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <article className="overflow-hidden rounded-[2rem] border border-[#EFDEE4] bg-white/95 shadow-[0_20px_55px_rgba(85,38,55,0.08)] backdrop-blur">
      <header className="flex flex-col gap-4 border-b border-[#F0E1E6] p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#A5526D]">
            {eyebrow}
          </p>

          <h3 className="mt-2 font-serif text-xl font-semibold text-[#2F2027]">
            {title}
          </h3>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#816D75]">
            {description}
          </p>
        </div>

        <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-[#E8C3CF] bg-gradient-to-br from-[#FFF0F5] to-[#F4D4DE] text-[#A5526D] shadow-sm">
          {icon}
        </div>
      </header>

      <div className="p-4 sm:p-5">
        {children}
      </div>
    </article>
  );
}

function EmptyState({
  title,
  description,
  icon,
}: EmptyStateProps) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-[#DFC7CF] bg-gradient-to-br from-[#FFF9FA] to-[#FFF3F6] p-8 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl border border-[#EAD9DF] bg-white text-[#B06A80] shadow-sm">
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

function Avatar({
  image,
  name,
}: {
  image: string | null;
  name: string;
}) {
  if (
    image
  ) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={image}
        alt={name}
        className="size-12 shrink-0 rounded-2xl object-cover ring-1 ring-[#EAD9DF]"
      />
    );
  }

  return (
    <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-[#E8C3CF] bg-gradient-to-br from-[#FFF0F5] to-[#F2D1DC] text-sm font-black text-[#A5526D]">
      {getInitials(
        name,
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  INSIGHTS                                  */
/* -------------------------------------------------------------------------- */

function InsightsList({
  insights,
}: {
  insights: DashboardInsight[];
}) {
  if (
    insights.length === 0
  ) {
    return (
      <EmptyState
        title="Aucun conseil pour le moment"
        description="Les recommandations apparaîtront automatiquement selon l’activité et les performances du salon."
        icon={
          <Sparkles className="size-5" />
        }
      />
    );
  }

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {insights.map(
        (
          insight,
        ) => {
          const appearance =
            getInsightAppearance(
              insight.type,
            );

          const priorityTone =
            getPriorityTone(
              insight.priority,
            );

          const toneStyle =
            TONE_STYLES[
              appearance.tone
            ];

          const priorityStyle =
            TONE_STYLES[
              priorityTone
            ];

          const content = (
            <article
              className={`h-full rounded-[1.5rem] border p-4 transition hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(85,38,55,0.08)] ${toneStyle.card}`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`flex size-11 shrink-0 items-center justify-center rounded-2xl border ${toneStyle.icon}`}
                >
                  {appearance.icon}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em] ${toneStyle.badge}`}
                    >
                      {appearance.label}
                    </span>

                    <span
                      className={`rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em] ${priorityStyle.badge}`}
                    >
                      Priorité{" "}
                      {getPriorityLabel(
                        insight.priority,
                      )}
                    </span>
                  </div>

                  <h4 className="mt-3 font-serif text-lg font-semibold text-[#2F2027]">
                    {insight.title}
                  </h4>

                  <p className="mt-2 text-sm leading-6 text-[#816D75]">
                    {insight.description}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    {insight.value ? (
                      <p className="font-serif text-xl font-semibold text-[#7E3E55]">
                        {insight.value}
                      </p>
                    ) : (
                      <span />
                    )}

                    {insight.href ? (
                      <span className="inline-flex items-center gap-2 text-xs font-black text-[#A5526D]">
                        Voir le détail

                        <ArrowRight className="size-4" />
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            </article>
          );

          if (
            insight.href
          ) {
            return (
              <Link
                key={insight.id}
                href={insight.href}
                className="block"
              >
                {content}
              </Link>
            );
          }

          return (
            <div
              key={insight.id}
            >
              {content}
            </div>
          );
        },
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                            CLIENTES INACTIVES                              */
/* -------------------------------------------------------------------------- */

function InactiveClientsList({
  inactiveClients,
}: {
  inactiveClients: DashboardInactiveClient[];
}) {
  if (
    inactiveClients.length === 0
  ) {
    return (
      <EmptyState
        title="Aucune cliente inactive"
        description="Toutes les clientes suivies ont eu une activité récente."
        icon={
          <UsersRound className="size-5" />
        }
      />
    );
  }

  return (
    <div className="space-y-3">
      {inactiveClients.map(
        (
          client,
        ) => {
          const fullName =
            `${client.firstName} ${client.lastName}`;

          return (
            <article
              key={client.id}
              className="rounded-[1.5rem] border border-[#EAD9DF] bg-gradient-to-br from-white to-[#FFF8FA] p-4"
            >
              <div className="flex items-start gap-3">
                <Avatar
                  image={client.image}
                  name={fullName}
                />

                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h4 className="font-serif text-lg font-semibold text-[#2F2027]">
                        {fullName}
                      </h4>

                      <p className="mt-1 text-xs font-bold text-amber-700">
                        {formatRelativeDays(
                          client.inactiveDays,
                        )}
                      </p>
                    </div>

                    <div className="text-left sm:text-right">
                      <p className="font-serif text-xl font-semibold text-[#7E3E55]">
                        {formatCurrency(
                          client.totalSpentCents,
                        )}
                      </p>

                      <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#AD7A8C]">
                        Dépensés
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#9A7D88]">
                        Rendez-vous
                      </p>

                      <p className="mt-1 text-sm font-black text-[#35262D]">
                        {formatNumber(
                          client.appointmentCount,
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#9A7D88]">
                        Fidélité
                      </p>

                      <p className="mt-1 text-sm font-black text-[#35262D]">
                        {formatNumber(
                          client.loyaltyPoints,
                        )}{" "}
                        points
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#9A7D88]">
                        Dernière visite
                      </p>

                      <p className="mt-1 text-sm font-black text-[#35262D]">
                        {formatDate(
                          client.lastAppointmentAt,
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <a
                      href={`mailto:${client.email}`}
                      className="inline-flex items-center gap-2 rounded-xl border border-[#E8C3CF] bg-white px-3 py-2 text-xs font-black text-[#A5526D] transition hover:bg-[#FFF0F5]"
                    >
                      <Mail className="size-4" />

                      Envoyer un e-mail
                    </a>

                    {client.phone ? (
                      <a
                        href={`tel:${client.phone}`}
                        className="inline-flex items-center gap-2 rounded-xl border border-[#EAD9DF] bg-white px-3 py-2 text-xs font-black text-[#67525B] transition hover:bg-[#FFF8FA]"
                      >
                        <Phone className="size-4" />

                        Appeler
                      </a>
                    ) : null}
                  </div>
                </div>
              </div>
            </article>
          );
        },
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   AVIS                                     */
/* -------------------------------------------------------------------------- */

function ReviewsList({
  pendingReviewItems,
}: {
  pendingReviewItems: DashboardPendingReview[];
}) {
  if (
    pendingReviewItems.length === 0
  ) {
    return (
      <EmptyState
        title="Aucun avis en attente"
        description="Tous les avis reçus ont été traités."
        icon={
          <MessageSquareText className="size-5" />
        }
      />
    );
  }

  return (
    <div className="space-y-3">
      {pendingReviewItems.map(
        (
          review,
        ) => (
          <article
            key={review.id}
            className="rounded-[1.5rem] border border-[#EAD9DF] bg-gradient-to-br from-white to-[#FFF8FA] p-4"
          >
            <div className="flex items-start gap-3">
              <Avatar
                image={review.authorAvatar}
                name={review.authorName}
              />

              <div className="min-w-0 flex-1">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-serif text-lg font-semibold text-[#2F2027]">
                        {review.authorName}
                      </h4>

                      {review.isVerified ? (
                        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-emerald-700">
                          Vérifié
                        </span>
                      ) : null}
                    </div>

                    <div className="mt-2 flex items-center gap-1">
                      {Array.from(
                        {
                          length:
                            5,
                        },
                        (
                          _,
                          index,
                        ) => (
                          <Star
                            key={index}
                            className={`size-4 ${
                              index <
                              review.rating
                                ? "fill-amber-400 text-amber-400"
                                : "text-zinc-300"
                            }`}
                          />
                        ),
                      )}
                    </div>
                  </div>

                  <p className="text-xs font-bold text-[#947C85]">
                    {formatDate(
                      review.createdAt,
                    )}
                  </p>
                </div>

                {review.title ? (
                  <p className="mt-3 text-sm font-black text-[#49363E]">
                    {review.title}
                  </p>
                ) : null}

                <p className="mt-2 line-clamp-4 text-sm leading-6 text-[#816D75]">
                  {review.content}
                </p>

                <div className="mt-4">
                  <Link
                    href="/admin/dashboard"
                    className="inline-flex items-center gap-2 rounded-xl border border-[#E8C3CF] bg-white px-3 py-2 text-xs font-black text-[#A5526D] transition hover:bg-[#FFF0F5]"
                  >
                    <MessageSquareText className="size-4" />

                    Examiner l’avis
                  </Link>
                </div>
              </div>
            </div>
          </article>
        ),
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                           RÉPARTITION STATUTS                              */
/* -------------------------------------------------------------------------- */

function StatusBreakdown({
  appointmentStatusBreakdown,
}: {
  appointmentStatusBreakdown: DashboardStatusBreakdown[];
}) {
  const totalAppointments =
    appointmentStatusBreakdown.reduce(
      (
        total,
        item,
      ) =>
        total +
        item.count,
      0,
    );

  if (
    appointmentStatusBreakdown.length ===
    0
  ) {
    return (
      <EmptyState
        title="Aucune répartition disponible"
        description="Les statuts apparaîtront dès que des rendez-vous seront enregistrés."
        icon={
          <CalendarDays className="size-5" />
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-[1.5rem] border border-[#EAD9DF] bg-gradient-to-br from-[#FFF8FA] to-white p-5">
        <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#A5526D]">
          Total analysé
        </p>

        <p className="mt-2 font-serif text-3xl font-semibold text-[#2F2027]">
          {formatNumber(
            totalAppointments,
          )}
        </p>

        <p className="mt-1 text-xs text-[#816D75]">
          rendez-vous
        </p>
      </div>

      <div className="space-y-3">
        {appointmentStatusBreakdown.map(
          (
            item,
          ) => {
            const appearance =
              getStatusAppearance(
                item.status,
              );

            const toneStyle =
              TONE_STYLES[
                appearance.tone
              ];

            return (
              <div
                key={item.status}
                className={`rounded-[1.25rem] border p-4 ${toneStyle.card}`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-black text-[#35262D]">
                      {appearance.label}
                    </p>

                    <p className="mt-1 text-xs text-[#816D75]">
                      {formatNumber(
                        item.count,
                      )}{" "}
                      rendez-vous
                    </p>
                  </div>

                  <p className="font-serif text-xl font-semibold text-[#2F2027]">
                    {formatNumber(
                      item.percentage,
                    )}
                    {" %"}
                  </p>
                </div>

                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/80">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${toneStyle.progress}`}
                    style={{
                      width:
                        `${clampPercentage(
                          item.percentage,
                        )}%`,
                    }}
                  />
                </div>
              </div>
            );
          },
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                COMPOSANT                                   */
/* -------------------------------------------------------------------------- */

export function DashboardInsightsAndAlerts({
  insights,
  inactiveClients,
  pendingReviewItems,
  appointmentStatusBreakdown,
}: DashboardInsightsAndAlertsProps) {
  const criticalInsightCount =
    insights.filter(
      (
        insight,
      ) =>
        insight.priority ===
          "CRITICAL" ||
        insight.priority ===
          "HIGH",
    ).length;

  const inactiveRevenue =
    inactiveClients.reduce(
      (
        total,
        client,
      ) =>
        total +
        client.totalSpentCents,
      0,
    );

  const pendingReviewCount =
    pendingReviewItems.length;

  const appointmentCount =
    appointmentStatusBreakdown.reduce(
      (
        total,
        item,
      ) =>
        total +
        item.count,
      0,
    );

  return (
    <section className="space-y-6">
      <div className="rounded-[2rem] border border-[#EFDEE4] bg-white/95 p-5 shadow-[0_20px_55px_rgba(85,38,55,0.08)] backdrop-blur sm:p-6">
        <SectionTitle
          eyebrow="Assistant intelligent"
          title="Insights, alertes et opportunités"
          description="Centralisez les recommandations prioritaires, les clientes à relancer, les avis en attente et la santé globale des rendez-vous."
        />

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[1.25rem] border border-violet-200 bg-gradient-to-br from-violet-50 to-white p-4">
            <div className="flex items-center gap-2 text-violet-700">
              <Sparkles className="size-4" />

              <p className="text-[10px] font-black uppercase tracking-[0.14em]">
                Recommandations
              </p>
            </div>

            <p className="mt-2 font-serif text-2xl font-semibold text-[#2F2027]">
              {formatNumber(
                insights.length,
              )}
            </p>

            <p className="mt-1 text-xs text-violet-700">
              {formatNumber(
                criticalInsightCount,
              )}{" "}
              prioritaires
            </p>
          </div>

          <div className="rounded-[1.25rem] border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-4">
            <div className="flex items-center gap-2 text-amber-700">
              <RefreshCcw className="size-4" />

              <p className="text-[10px] font-black uppercase tracking-[0.14em]">
                Clientes à relancer
              </p>
            </div>

            <p className="mt-2 font-serif text-2xl font-semibold text-[#2F2027]">
              {formatNumber(
                inactiveClients.length,
              )}
            </p>

            <p className="mt-1 text-xs text-amber-700">
              {formatCurrency(
                inactiveRevenue,
              )}{" "}
              de valeur historique
            </p>
          </div>

          <div className="rounded-[1.25rem] border border-sky-200 bg-gradient-to-br from-sky-50 to-white p-4">
            <div className="flex items-center gap-2 text-sky-700">
              <BellRing className="size-4" />

              <p className="text-[10px] font-black uppercase tracking-[0.14em]">
                Avis à traiter
              </p>
            </div>

            <p className="mt-2 font-serif text-2xl font-semibold text-[#2F2027]">
              {formatNumber(
                pendingReviewCount,
              )}
            </p>

            <p className="mt-1 text-xs text-sky-700">
              modération en attente
            </p>
          </div>

          <div className="rounded-[1.25rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-4">
            <div className="flex items-center gap-2 text-emerald-700">
              <CalendarDays className="size-4" />

              <p className="text-[10px] font-black uppercase tracking-[0.14em]">
                Rendez-vous analysés
              </p>
            </div>

            <p className="mt-2 font-serif text-2xl font-semibold text-[#2F2027]">
              {formatNumber(
                appointmentCount,
              )}
            </p>

            <p className="mt-1 text-xs text-emerald-700">
              tous statuts confondus
            </p>
          </div>
        </div>
      </div>

      <Panel
        eyebrow="Recommandations"
        title="Conseils prioritaires"
        description="Des signaux automatiques pour mieux piloter le chiffre d’affaires, le planning et la relation cliente."
        icon={
          <Lightbulb className="size-5" />
        }
      >
        <InsightsList
          insights={
            insights
          }
        />
      </Panel>

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel
          eyebrow="Réactivation"
          title="Clientes à relancer"
          description="Clientes sans activité récente présentant un potentiel de retour ou de fidélisation."
          icon={
            <RefreshCcw className="size-5" />
          }
        >
          <InactiveClientsList
            inactiveClients={
              inactiveClients
            }
          />
        </Panel>

        <Panel
          eyebrow="Réputation"
          title="Avis en attente"
          description="Avis clients à vérifier, modérer ou publier depuis l’administration."
          icon={
            <Star className="size-5" />
          }
        >
          <ReviewsList
            pendingReviewItems={
              pendingReviewItems
            }
          />
        </Panel>
      </div>

      <Panel
        eyebrow="Santé des rendez-vous"
        title="Répartition par statut"
        description="Visualisez immédiatement la proportion de rendez-vous en attente, confirmés, terminés, annulés ou non honorés."
        icon={
          <ShieldAlert className="size-5" />
        }
      >
        <StatusBreakdown
          appointmentStatusBreakdown={
            appointmentStatusBreakdown
          }
        />
      </Panel>
    </section>
  );
}
