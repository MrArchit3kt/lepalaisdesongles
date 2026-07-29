"use client";

import {
  BadgeEuro,
  CalendarCheck2,
  Crown,
  Gem,
  Medal,
  Sparkles,
  Star,
  TrendingUp,
  UserRound,
  UsersRound,
} from "lucide-react";

import type {
  DashboardStaffPerformance,
  DashboardTopClient,
  DashboardTopService,
} from "@/features/admin/dashboard/types/admin-dashboard.types";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

type DashboardCommercialPerformanceProps = {
  topServices: DashboardTopService[];
  topClients: DashboardTopClient[];
  staffPerformance: DashboardStaffPerformance[];
};

type Tone =
  | "ROSE"
  | "GOLD"
  | "VIOLET"
  | "EMERALD"
  | "SKY";

type RankBadgeProps = {
  index: number;
};

type ProgressBarProps = {
  value: number;
  tone?: Tone;
};

type MetricProps = {
  label: string;
  value: string;
  description?: string;
};

type EmptyStateProps = {
  title: string;
  description: string;
  icon: React.ReactNode;
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
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
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
  return new Intl.NumberFormat(
    "fr-FR",
    {
      maximumFractionDigits: 1,
    },
  ).format(
    value,
  ) + " %";
}

function formatMinutes(
  minutes: number,
): string {
  if (
    minutes <= 0
  ) {
    return "0 min";
  }

  const hours =
    Math.floor(
      minutes / 60,
    );

  const remainingMinutes =
    minutes % 60;

  if (
    hours === 0
  ) {
    return `${remainingMinutes} min`;
  }

  if (
    remainingMinutes === 0
  ) {
    return `${hours} h`;
  }

  return `${hours} h ${remainingMinutes}`;
}

function getCompletionRate(
  item: DashboardStaffPerformance,
): number {
  if (
    item.appointmentCount <= 0
  ) {
    return 0;
  }

  return Math.round(
    (
      item.completedAppointmentCount /
      item.appointmentCount
    ) *
      1000,
  ) / 10;
}

function getCancellationRate(
  item: DashboardStaffPerformance,
): number {
  if (
    item.appointmentCount <= 0
  ) {
    return 0;
  }

  return Math.round(
    (
      item.cancelledAppointmentCount /
      item.appointmentCount
    ) *
      1000,
  ) / 10;
}

function getNoShowRate(
  item: DashboardStaffPerformance,
): number {
  if (
    item.appointmentCount <= 0
  ) {
    return 0;
  }

  return Math.round(
    (
      item.noShowCount /
      item.appointmentCount
    ) *
      1000,
  ) / 10;
}

function getInitials(
  firstName: string,
  lastName: string,
): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`
    .trim()
    .toUpperCase();
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

function RankBadge({
  index,
}: RankBadgeProps) {
  if (
    index === 0
  ) {
    return (
      <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100 text-amber-700 shadow-sm">
        <Crown className="size-5" />
      </div>
    );
  }

  if (
    index === 1
  ) {
    return (
      <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl border border-zinc-200 bg-gradient-to-br from-zinc-50 to-zinc-100 text-zinc-600 shadow-sm">
        <Medal className="size-5" />
      </div>
    );
  }

  if (
    index === 2
  ) {
    return (
      <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100 text-orange-700 shadow-sm">
        <Medal className="size-5" />
      </div>
    );
  }

  return (
    <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl border border-[#EAD9DF] bg-[#FFF8FA] text-sm font-black text-[#A5526D]">
      {index + 1}
    </div>
  );
}

function ProgressBar({
  value,
  tone = "ROSE",
}: ProgressBarProps) {
  const toneClassNames: Record<
    Tone,
    string
  > = {
    ROSE:
      "from-[#B45F7A] to-[#D995AA]",

    GOLD:
      "from-[#C3994E] to-[#E6C77B]",

    VIOLET:
      "from-[#765083] to-[#A77AB5]",

    EMERALD:
      "from-emerald-500 to-emerald-300",

    SKY:
      "from-sky-500 to-sky-300",
  };

  return (
    <div className="h-2 overflow-hidden rounded-full bg-[#F2E7EB]">
      <div
        className={`h-full rounded-full bg-gradient-to-r transition-all ${toneClassNames[tone]}`}
        style={{
          width: `${clampPercentage(value)}%`,
        }}
      />
    </div>
  );
}

function Metric({
  label,
  value,
  description,
}: MetricProps) {
  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#9A7D88]">
        {label}
      </p>

      <p className="mt-1 text-sm font-black text-[#35262D]">
        {value}
      </p>

      {description ? (
        <p className="mt-1 text-xs leading-5 text-[#947C85]">
          {description}
        </p>
      ) : null}
    </div>
  );
}

function EmptyState({
  title,
  description,
  icon,
}: EmptyStateProps) {
  return (
    <div className="flex min-h-72 flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-[#DFC7CF] bg-gradient-to-br from-[#FFF9FA] to-[#FFF3F6] p-8 text-center">
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

function ClientAvatar({
  client,
}: {
  client: DashboardTopClient;
}) {
  if (
    client.image
  ) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={client.image}
        alt={`${client.firstName} ${client.lastName}`}
        className="size-12 rounded-2xl object-cover ring-1 ring-[#EAD9DF]"
      />
    );
  }

  return (
    <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-[#E8C3CF] bg-gradient-to-br from-[#FFF0F5] to-[#F2D1DC] text-sm font-black text-[#A5526D]">
      {getInitials(
        client.firstName,
        client.lastName,
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                               PRESTATIONS                                  */
/* -------------------------------------------------------------------------- */

function ServicesRanking({
  topServices,
}: {
  topServices: DashboardTopService[];
}) {
  const maximumRevenue =
    Math.max(
      ...topServices.map(
        (service) =>
          service.revenueCents,
      ),
      1,
    );

  if (
    topServices.length === 0
  ) {
    return (
      <EmptyState
        title="Aucune prestation classée"
        description="Les prestations les plus performantes apparaîtront après les premiers rendez-vous terminés."
        icon={
          <Sparkles className="size-5" />
        }
      />
    );
  }

  return (
    <div className="space-y-3">
      {topServices.map(
        (
          service,
          index,
        ) => {
          const relativeRevenue =
            (
              service.revenueCents /
              maximumRevenue
            ) *
            100;

          return (
            <div
              key={service.serviceId}
              className="rounded-[1.5rem] border border-[#EAD9DF] bg-gradient-to-br from-white to-[#FFF8FA] p-4 transition hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(85,38,55,0.08)]"
            >
              <div className="flex items-start gap-3">
                <RankBadge
                  index={index}
                />

                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <h4 className="truncate font-serif text-lg font-semibold text-[#2F2027]">
                        {service.name}
                      </h4>

                      <p className="mt-1 text-xs text-[#8D747E]">
                        {formatNumber(
                          service.quantity,
                        )}{" "}
                        prestation
                        {service.quantity >
                        1
                          ? "s"
                          : ""}{" "}
                        vendue
                        {service.quantity >
                        1
                          ? "s"
                          : ""}
                      </p>
                    </div>

                    <div className="shrink-0 text-left sm:text-right">
                      <p className="font-serif text-xl font-semibold text-[#7E3E55]">
                        {formatCurrency(
                          service.revenueCents,
                        )}
                      </p>

                      <p className="mt-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#AD7A8C]">
                        {formatPercentage(
                          service.revenuePercentage,
                        )}{" "}
                        du CA
                      </p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <ProgressBar
                      value={
                        relativeRevenue
                      }
                      tone={
                        index === 0
                          ? "GOLD"
                          : "ROSE"
                      }
                    />
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <Metric
                      label="Rendez-vous"
                      value={formatNumber(
                        service.appointmentCount,
                      )}
                    />

                    <Metric
                      label="Prix moyen"
                      value={formatCurrency(
                        service.averageUnitPriceCents,
                      )}
                    />

                    <Metric
                      label="Temps réservé"
                      value={formatMinutes(
                        service.totalDurationMinutes,
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        },
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  CLIENTES                                  */
/* -------------------------------------------------------------------------- */

function ClientsRanking({
  topClients,
}: {
  topClients: DashboardTopClient[];
}) {
  const maximumSpent =
    Math.max(
      ...topClients.map(
        (client) =>
          client.totalSpentCents,
      ),
      1,
    );

  if (
    topClients.length === 0
  ) {
    return (
      <EmptyState
        title="Aucune cliente classée"
        description="Les meilleures clientes apparaîtront lorsque plusieurs rendez-vous auront été terminés et payés."
        icon={
          <UserRound className="size-5" />
        }
      />
    );
  }

  return (
    <div className="space-y-3">
      {topClients.map(
        (
          client,
          index,
        ) => {
          const relativeSpent =
            (
              client.totalSpentCents /
              maximumSpent
            ) *
            100;

          return (
            <div
              key={client.id}
              className="rounded-[1.5rem] border border-[#EAD9DF] bg-gradient-to-br from-white to-[#FFF8FA] p-4 transition hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(85,38,55,0.08)]"
            >
              <div className="flex items-start gap-3">
                <RankBadge
                  index={index}
                />

                <ClientAvatar
                  client={client}
                />

                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <h4 className="truncate font-serif text-lg font-semibold text-[#2F2027]">
                        {client.firstName}{" "}
                        {client.lastName}
                      </h4>

                      <p className="mt-1 text-xs text-[#8D747E]">
                        {formatNumber(
                          client.appointmentCount,
                        )}{" "}
                        rendez-vous
                      </p>
                    </div>

                    <div className="shrink-0 text-left sm:text-right">
                      <p className="font-serif text-xl font-semibold text-[#7E3E55]">
                        {formatCurrency(
                          client.totalSpentCents,
                        )}
                      </p>

                      <p className="mt-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#AD7A8C]">
                        Dépensés au total
                      </p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <ProgressBar
                      value={
                        relativeSpent
                      }
                      tone={
                        index === 0
                          ? "GOLD"
                          : "VIOLET"
                      }
                    />
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <Metric
                      label="Panier moyen"
                      value={formatCurrency(
                        client.averageBasketCents,
                      )}
                    />

                    <Metric
                      label="Points fidélité"
                      value={formatNumber(
                        client.loyaltyPoints,
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        },
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  ÉQUIPE                                    */
/* -------------------------------------------------------------------------- */

function StaffPerformanceList({
  staffPerformance,
}: {
  staffPerformance: DashboardStaffPerformance[];
}) {
  if (
    staffPerformance.length === 0
  ) {
    return (
      <EmptyState
        title="Aucune performance d’équipe"
        description="Les statistiques de l’équipe apparaîtront dès que des rendez-vous seront attribués aux collaborateurs."
        icon={
          <UsersRound className="size-5" />
        }
      />
    );
  }

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {staffPerformance.map(
        (
          staff,
          index,
        ) => {
          const completionRate =
            getCompletionRate(
              staff,
            );

          const cancellationRate =
            getCancellationRate(
              staff,
            );

          const noShowRate =
            getNoShowRate(
              staff,
            );

          return (
            <article
              key={staff.staffId}
              className="overflow-hidden rounded-[1.75rem] border border-[#EAD9DF] bg-gradient-to-br from-white to-[#FFF7F9] shadow-[0_12px_30px_rgba(85,38,55,0.06)]"
            >
              <div className="p-5">
                <div className="flex items-start gap-4">
                  <div
                    className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-white/70 text-sm font-black text-white shadow-sm"
                    style={{
                      backgroundColor:
                        staff.color ??
                        "#B45F7A",
                    }}
                  >
                    {staff.displayName
                      .split(" ")
                      .map(
                        (part) =>
                          part.charAt(0),
                      )
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#A5526D]">
                          Collaborateur{" "}
                          {index + 1}
                        </p>

                        <h4 className="mt-1 truncate font-serif text-xl font-semibold text-[#2F2027]">
                          {staff.displayName}
                        </h4>
                      </div>

                      <div className="shrink-0 text-left sm:text-right">
                        <p className="font-serif text-2xl font-semibold text-[#7E3E55]">
                          {formatCurrency(
                            staff.revenueCents,
                          )}
                        </p>

                        <p className="mt-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#AD7A8C]">
                          Chiffre d’affaires
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-5 rounded-[1.25rem] border border-[#EAD9DF] bg-white/80 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#9A7D88]">
                        Taux d’occupation
                      </p>

                      <p className="mt-1 font-serif text-2xl font-semibold text-[#2F2027]">
                        {formatPercentage(
                          staff.occupancyRate,
                        )}
                      </p>
                    </div>

                    <CalendarCheck2 className="size-6 text-[#A5526D]" />
                  </div>

                  <div className="mt-3">
                    <ProgressBar
                      value={
                        staff.occupancyRate
                      }
                      tone="ROSE"
                    />
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[1.25rem] border border-emerald-200 bg-emerald-50/70 p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.12em] text-emerald-700">
                      Taux de réalisation
                    </p>

                    <p className="mt-2 font-serif text-xl font-semibold text-emerald-900">
                      {formatPercentage(
                        completionRate,
                      )}
                    </p>

                    <div className="mt-3">
                      <ProgressBar
                        value={
                          completionRate
                        }
                        tone="EMERALD"
                      />
                    </div>
                  </div>

                  <div className="rounded-[1.25rem] border border-sky-200 bg-sky-50/70 p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.12em] text-sky-700">
                      Panier moyen
                    </p>

                    <p className="mt-2 font-serif text-xl font-semibold text-sky-900">
                      {formatCurrency(
                        staff.averageBasketCents,
                      )}
                    </p>

                    <p className="mt-2 text-xs text-sky-700">
                      Par rendez-vous
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <Metric
                    label="Rendez-vous"
                    value={formatNumber(
                      staff.appointmentCount,
                    )}
                    description={`${formatNumber(
                      staff.completedAppointmentCount,
                    )} terminés`}
                  />

                  <Metric
                    label="Temps réservé"
                    value={formatMinutes(
                      staff.bookedMinutes,
                    )}
                    description={`${formatMinutes(
                      staff.completedMinutes,
                    )} réalisés`}
                  />

                  <Metric
                    label="Incidents"
                    value={formatNumber(
                      staff.cancelledAppointmentCount +
                        staff.noShowCount,
                    )}
                    description={`${formatPercentage(
                      cancellationRate,
                    )} annulés · ${formatPercentage(
                      noShowRate,
                    )} absences`}
                  />
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
/*                                COMPOSANT                                   */
/* -------------------------------------------------------------------------- */

export function DashboardCommercialPerformance({
  topServices,
  topClients,
  staffPerformance,
}: DashboardCommercialPerformanceProps) {
  const totalServiceRevenue =
    topServices.reduce(
      (
        total,
        service,
      ) =>
        total +
        service.revenueCents,
      0,
    );

  const totalClientRevenue =
    topClients.reduce(
      (
        total,
        client,
      ) =>
        total +
        client.totalSpentCents,
      0,
    );

  const totalStaffRevenue =
    staffPerformance.reduce(
      (
        total,
        staff,
      ) =>
        total +
        staff.revenueCents,
      0,
    );

  const averageStaffOccupancy =
    staffPerformance.length > 0
      ? staffPerformance.reduce(
          (
            total,
            staff,
          ) =>
            total +
            staff.occupancyRate,
          0,
        ) /
        staffPerformance.length
      : 0;

  return (
    <section className="space-y-6">
      <div className="rounded-[2rem] border border-[#EFDEE4] bg-white/95 p-5 shadow-[0_20px_55px_rgba(85,38,55,0.08)] backdrop-blur sm:p-6">
        <SectionTitle
          eyebrow="Performances commerciales"
          title="Prestations, clientes et équipe"
          description="Identifiez les prestations les plus rentables, les clientes les plus engagées et les performances de chaque collaborateur."
        />

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[1.25rem] border border-[#EAD9DF] bg-gradient-to-br from-white to-[#FFF7F9] p-4">
            <div className="flex items-center gap-2 text-[#A5526D]">
              <Sparkles className="size-4" />

              <p className="text-[10px] font-black uppercase tracking-[0.14em]">
                CA prestations
              </p>
            </div>

            <p className="mt-2 font-serif text-2xl font-semibold text-[#2F2027]">
              {formatCurrency(
                totalServiceRevenue,
              )}
            </p>
          </div>

          <div className="rounded-[1.25rem] border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-4">
            <div className="flex items-center gap-2 text-amber-700">
              <Gem className="size-4" />

              <p className="text-[10px] font-black uppercase tracking-[0.14em]">
                Meilleures clientes
              </p>
            </div>

            <p className="mt-2 font-serif text-2xl font-semibold text-[#2F2027]">
              {formatCurrency(
                totalClientRevenue,
              )}
            </p>
          </div>

          <div className="rounded-[1.25rem] border border-violet-200 bg-gradient-to-br from-violet-50 to-white p-4">
            <div className="flex items-center gap-2 text-violet-700">
              <UsersRound className="size-4" />

              <p className="text-[10px] font-black uppercase tracking-[0.14em]">
                CA équipe
              </p>
            </div>

            <p className="mt-2 font-serif text-2xl font-semibold text-[#2F2027]">
              {formatCurrency(
                totalStaffRevenue,
              )}
            </p>
          </div>

          <div className="rounded-[1.25rem] border border-sky-200 bg-gradient-to-br from-sky-50 to-white p-4">
            <div className="flex items-center gap-2 text-sky-700">
              <TrendingUp className="size-4" />

              <p className="text-[10px] font-black uppercase tracking-[0.14em]">
                Occupation moyenne
              </p>
            </div>

            <p className="mt-2 font-serif text-2xl font-semibold text-[#2F2027]">
              {formatPercentage(
                averageStaffOccupancy,
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel
          eyebrow="Prestations"
          title="Prestations les plus performantes"
          description="Classement selon le chiffre d’affaires généré, le volume vendu et le temps réservé."
          icon={
            <Star className="size-5" />
          }
        >
          <ServicesRanking
            topServices={
              topServices
            }
          />
        </Panel>

        <Panel
          eyebrow="Clientèle"
          title="Meilleures clientes"
          description="Classement des clientes les plus fidèles selon leurs dépenses, leur panier moyen et leurs rendez-vous."
          icon={
            <Crown className="size-5" />
          }
        >
          <ClientsRanking
            topClients={
              topClients
            }
          />
        </Panel>
      </div>

      <Panel
        eyebrow="Équipe"
        title="Performance des collaborateurs"
        description="Analyse détaillée du chiffre d’affaires, du taux d’occupation et de la réalisation des rendez-vous."
        icon={
          <BadgeEuro className="size-5" />
        }
      >
        <StaffPerformanceList
          staffPerformance={
            staffPerformance
          }
        />
      </Panel>
    </section>
  );
}
