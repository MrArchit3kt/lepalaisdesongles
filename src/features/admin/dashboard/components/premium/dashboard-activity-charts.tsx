"use client";

import {
  Activity,
  BadgeEuro,
  CalendarDays,
  CalendarRange,
  CheckCircle2,
  Clock3,
  TrendingUp,
} from "lucide-react";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type {
  DashboardDailyActivity,
  DashboardHourlyActivity,
  DashboardMonthlyActivity,
  DashboardWeekdayActivity,
} from "@/features/admin/dashboard/types/admin-dashboard.types";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

type DashboardActivityChartsProps = {
  dailyActivity: DashboardDailyActivity[];
  monthlyActivity: DashboardMonthlyActivity[];
  hourlyActivity: DashboardHourlyActivity[];
  weekdayActivity: DashboardWeekdayActivity[];
};

type TooltipPayloadItem = {
  name?: string;
  value?: number | string;
  color?: string;
  dataKey?: string;
};

type ActivityTooltipProps = {
  active?: boolean;
  label?: string;
  payload?: TooltipPayloadItem[];
  mode?: "NUMBER" | "CURRENCY" | "MINUTES";
};

/* -------------------------------------------------------------------------- */
/*                                 COULEURS                                   */
/* -------------------------------------------------------------------------- */

const CHART_COLORS = {
  rose:
    "#B45F7A",

  roseLight:
    "#E8B4C0",

  roseDark:
    "#843F59",

  emerald:
    "#10B981",

  blue:
    "#0EA5E9",

  amber:
    "#D6B679",

  red:
    "#EF4444",

  orange:
    "#F97316",

  violet:
    "#8B5FA3",

  grid:
    "#EFE3E7",

  text:
    "#816D75",

  background:
    "#FFF8FA",
} as const;

const WEEKDAY_COLORS = [
  "#B45F7A",
  "#C97992",
  "#D48AA1",
  "#D6B679",
  "#A77AB5",
  "#765083",
  "#843F59",
] as const;

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

function getPayloadLabel(
  item: TooltipPayloadItem,
): string {
  const labels: Record<
    string,
    string
  > = {
    appointmentCount:
      "Rendez-vous",

    completedAppointmentCount:
      "Terminés",

    cancelledAppointmentCount:
      "Annulés",

    noShowCount:
      "Absences",

    bookedMinutes:
      "Temps réservé",

    revenueCents:
      "Chiffre d’affaires",
  };

  const key =
    item.dataKey ??
    item.name ??
    "";

  return (
    labels[key] ??
    item.name ??
    key
  );
}

function formatTooltipValue(
  value: number,
  mode: ActivityTooltipProps["mode"],
  dataKey?: string,
): string {
  if (
    dataKey ===
    "revenueCents"
  ) {
    return formatCurrency(
      value,
    );
  }

  if (
    dataKey ===
    "bookedMinutes"
  ) {
    return formatMinutes(
      value,
    );
  }

  if (
    mode ===
    "CURRENCY"
  ) {
    return formatCurrency(
      value,
    );
  }

  if (
    mode ===
    "MINUTES"
  ) {
    return formatMinutes(
      value,
    );
  }

  return formatNumber(
    value,
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

function ChartCard({
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

      <div className="p-3 sm:p-5">
        {children}
      </div>
    </article>
  );
}

function ActivityTooltip({
  active,
  label,
  payload,
  mode = "NUMBER",
}: ActivityTooltipProps) {
  if (
    !active ||
    !payload ||
    payload.length === 0
  ) {
    return null;
  }

  return (
    <div className="min-w-44 rounded-2xl border border-[#EAD9DF] bg-white/95 p-3 shadow-[0_16px_36px_rgba(85,38,55,0.14)] backdrop-blur">
      {label ? (
        <p className="mb-2 border-b border-[#F0E1E6] pb-2 text-xs font-black text-[#49363E]">
          {label}
        </p>
      ) : null}

      <div className="space-y-2">
        {payload.map(
          (
            item,
            index,
          ) => {
            const numericValue =
              Number(
                item.value ??
                  0,
              );

            return (
              <div
                key={`${item.dataKey ?? item.name ?? "value"}-${index}`}
                className="flex items-center justify-between gap-5 text-xs"
              >
                <span className="flex items-center gap-2 text-[#816D75]">
                  <span
                    className="size-2.5 rounded-full"
                    style={{
                      backgroundColor:
                        item.color ??
                        CHART_COLORS.rose,
                    }}
                  />

                  {getPayloadLabel(
                    item,
                  )}
                </span>

                <span className="font-black text-[#2F2027]">
                  {formatTooltipValue(
                    numericValue,
                    mode,
                    item.dataKey,
                  )}
                </span>
              </div>
            );
          },
        )}
      </div>
    </div>
  );
}

function EmptyChart({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex h-[320px] flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-[#DFC7CF] bg-gradient-to-br from-[#FFF9FA] to-[#FFF3F6] p-8 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl border border-[#EAD9DF] bg-white text-[#B06A80] shadow-sm">
        <Activity className="size-5" />
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

function SummaryValue({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-[1.25rem] border border-[#EAD9DF] bg-gradient-to-br from-white to-[#FFF7F9] p-4">
      <div className="flex items-center gap-2 text-[#A5526D]">
        {icon}

        <p className="text-[10px] font-black uppercase tracking-[0.14em]">
          {label}
        </p>
      </div>

      <p className="mt-2 font-serif text-2xl font-semibold text-[#2F2027]">
        {value}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                COMPOSANT                                   */
/* -------------------------------------------------------------------------- */

export function DashboardActivityCharts({
  dailyActivity,
  monthlyActivity,
  hourlyActivity,
  weekdayActivity,
}: DashboardActivityChartsProps) {
  const dailyAppointmentTotal =
    dailyActivity.reduce(
      (
        total,
        item,
      ) =>
        total +
        item.appointmentCount,
      0,
    );

  const dailyRevenueTotal =
    dailyActivity.reduce(
      (
        total,
        item,
      ) =>
        total +
        item.revenueCents,
      0,
    );

  const monthlyRevenueTotal =
    monthlyActivity.reduce(
      (
        total,
        item,
      ) =>
        total +
        item.revenueCents,
      0,
    );

  const busiestHour =
    hourlyActivity.reduce<
      DashboardHourlyActivity | null
    >(
      (
        current,
        item,
      ) => {
        if (
          !current ||
          item.appointmentCount >
            current.appointmentCount
        ) {
          return item;
        }

        return current;
      },
      null,
    );

  const busiestWeekday =
    weekdayActivity.reduce<
      DashboardWeekdayActivity | null
    >(
      (
        current,
        item,
      ) => {
        if (
          !current ||
          item.appointmentCount >
            current.appointmentCount
        ) {
          return item;
        }

        return current;
      },
      null,
    );

  return (
    <section className="space-y-6">
      <div className="rounded-[2rem] border border-[#EFDEE4] bg-white/95 p-5 shadow-[0_20px_55px_rgba(85,38,55,0.08)] backdrop-blur sm:p-6">
        <SectionTitle
          eyebrow="Analyse de l’activité"
          title="Performances et fréquentation"
          description="Analysez l’évolution des rendez-vous, du chiffre d’affaires et des périodes les plus demandées."
        />

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryValue
            label="Rendez-vous période"
            value={formatNumber(
              dailyAppointmentTotal,
            )}
            icon={
              <CalendarDays className="size-4" />
            }
          />

          <SummaryValue
            label="CA période récente"
            value={formatCurrency(
              dailyRevenueTotal,
            )}
            icon={
              <BadgeEuro className="size-4" />
            }
          />

          <SummaryValue
            label="CA annuel analysé"
            value={formatCurrency(
              monthlyRevenueTotal,
            )}
            icon={
              <TrendingUp className="size-4" />
            }
          />

          <SummaryValue
            label="Heure la plus demandée"
            value={
              busiestHour
                ? busiestHour.label
                : "—"
            }
            icon={
              <Clock3 className="size-4" />
            }
          />
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ChartCard
          eyebrow="Derniers jours"
          title="Évolution des rendez-vous"
          description="Comparaison quotidienne entre les rendez-vous enregistrés, terminés, annulés et les absences."
          icon={
            <Activity className="size-5" />
          }
        >
          {dailyActivity.length >
          0 ? (
            <div className="h-[360px] w-full">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <LineChart
                  data={
                    dailyActivity
                  }
                  margin={{
                    top: 15,
                    right: 15,
                    left: -18,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid
                    stroke={
                      CHART_COLORS.grid
                    }
                    strokeDasharray="4 4"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="shortLabel"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill:
                        CHART_COLORS.text,
                      fontSize: 11,
                    }}
                    minTickGap={12}
                  />

                  <YAxis
                    allowDecimals={false}
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill:
                        CHART_COLORS.text,
                      fontSize: 11,
                    }}
                  />

                  <Tooltip
                    content={
                      <ActivityTooltip />
                    }
                  />

                  <Legend
                    iconType="circle"
                    wrapperStyle={{
                      fontSize:
                        "12px",
                      paddingTop:
                        "16px",
                    }}
                  />

                  <Line
                    type="monotone"
                    dataKey="appointmentCount"
                    name="Rendez-vous"
                    stroke={
                      CHART_COLORS.roseDark
                    }
                    strokeWidth={3}
                    dot={{
                      r: 3,
                      fill:
                        CHART_COLORS.roseDark,
                    }}
                    activeDot={{
                      r: 6,
                    }}
                  />

                  <Line
                    type="monotone"
                    dataKey="completedAppointmentCount"
                    name="Terminés"
                    stroke={
                      CHART_COLORS.emerald
                    }
                    strokeWidth={2.5}
                    dot={false}
                  />

                  <Line
                    type="monotone"
                    dataKey="cancelledAppointmentCount"
                    name="Annulés"
                    stroke={
                      CHART_COLORS.red
                    }
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                  />

                  <Line
                    type="monotone"
                    dataKey="noShowCount"
                    name="Absences"
                    stroke={
                      CHART_COLORS.orange
                    }
                    strokeWidth={2}
                    strokeDasharray="3 5"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyChart
              title="Aucune activité quotidienne"
              description="Le graphique apparaîtra dès que des rendez-vous seront enregistrés."
            />
          )}
        </ChartCard>

        <ChartCard
          eyebrow="Chiffre d’affaires"
          title="Évolution mensuelle"
          description="Suivi du chiffre d’affaires et du nombre de rendez-vous terminés sur les derniers mois."
          icon={
            <TrendingUp className="size-5" />
          }
        >
          {monthlyActivity.length >
          0 ? (
            <div className="h-[360px] w-full">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <AreaChart
                  data={
                    monthlyActivity
                  }
                  margin={{
                    top: 15,
                    right: 15,
                    left: -5,
                    bottom: 5,
                  }}
                >
                  <defs>
                    <linearGradient
                      id="dashboardRevenueGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor={
                          CHART_COLORS.rose
                        }
                        stopOpacity={0.38}
                      />

                      <stop
                        offset="95%"
                        stopColor={
                          CHART_COLORS.rose
                        }
                        stopOpacity={0.02}
                      />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    stroke={
                      CHART_COLORS.grid
                    }
                    strokeDasharray="4 4"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill:
                        CHART_COLORS.text,
                      fontSize: 11,
                    }}
                    minTickGap={10}
                  />

                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill:
                        CHART_COLORS.text,
                      fontSize: 11,
                    }}
                    tickFormatter={(
                      value: number,
                    ) =>
                      `${Math.round(
                        value / 10000,
                      )} €`
                    }
                  />

                  <Tooltip
                    content={
                      <ActivityTooltip mode="CURRENCY" />
                    }
                  />

                  <Area
                    type="monotone"
                    dataKey="revenueCents"
                    name="Chiffre d’affaires"
                    stroke={
                      CHART_COLORS.roseDark
                    }
                    strokeWidth={3}
                    fill="url(#dashboardRevenueGradient)"
                    activeDot={{
                      r: 6,
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyChart
              title="Aucune donnée mensuelle"
              description="L’évolution du chiffre d’affaires apparaîtra dès que des prestations seront terminées."
            />
          )}
        </ChartCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ChartCard
          eyebrow="Fréquentation"
          title="Activité par heure"
          description="Identifiez les horaires les plus demandés afin d’adapter les disponibilités du salon."
          icon={
            <Clock3 className="size-5" />
          }
        >
          {hourlyActivity.length >
          0 ? (
            <>
              <div className="mb-4 rounded-[1.25rem] border border-sky-200 bg-gradient-to-br from-sky-50 to-white p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-sky-700">
                  Pic de fréquentation
                </p>

                <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
                  <p className="font-serif text-2xl font-semibold text-[#2F2027]">
                    {busiestHour
                      ?.label ??
                      "—"}
                  </p>

                  <p className="text-sm font-bold text-sky-700">
                    {formatNumber(
                      busiestHour
                        ?.appointmentCount ??
                        0,
                    )}{" "}
                    rendez-vous
                  </p>
                </div>
              </div>

              <div className="h-[300px] w-full">
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <BarChart
                    data={
                      hourlyActivity
                    }
                    margin={{
                      top: 10,
                      right: 10,
                      left: -18,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid
                      stroke={
                        CHART_COLORS.grid
                      }
                      strokeDasharray="4 4"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="label"
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fill:
                          CHART_COLORS.text,
                        fontSize: 11,
                      }}
                    />

                    <YAxis
                      allowDecimals={false}
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fill:
                          CHART_COLORS.text,
                        fontSize: 11,
                      }}
                    />

                    <Tooltip
                      content={
                        <ActivityTooltip />
                      }
                    />

                    <Bar
                      dataKey="appointmentCount"
                      name="Rendez-vous"
                      fill={
                        CHART_COLORS.blue
                      }
                      radius={[
                        8,
                        8,
                        2,
                        2,
                      ]}
                      maxBarSize={44}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          ) : (
            <EmptyChart
              title="Aucune donnée horaire"
              description="Les heures les plus demandées apparaîtront dès que l’agenda contiendra des rendez-vous."
            />
          )}
        </ChartCard>

        <ChartCard
          eyebrow="Semaine type"
          title="Activité par jour"
          description="Comparez les rendez-vous, le temps réservé et le chiffre d’affaires selon les jours de la semaine."
          icon={
            <CalendarRange className="size-5" />
          }
        >
          {weekdayActivity.length >
          0 ? (
            <>
              <div className="mb-4 rounded-[1.25rem] border border-[#DCC6E8] bg-gradient-to-br from-[#FCF8FF] to-white p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#765083]">
                  Jour le plus demandé
                </p>

                <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
                  <p className="font-serif text-2xl font-semibold text-[#2F2027]">
                    {busiestWeekday
                      ?.label ??
                      "—"}
                  </p>

                  <p className="text-sm font-bold text-[#765083]">
                    {formatNumber(
                      busiestWeekday
                        ?.appointmentCount ??
                        0,
                    )}{" "}
                    rendez-vous
                  </p>
                </div>
              </div>

              <div className="h-[300px] w-full">
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <BarChart
                    data={
                      weekdayActivity
                    }
                    margin={{
                      top: 10,
                      right: 10,
                      left: -18,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid
                      stroke={
                        CHART_COLORS.grid
                      }
                      strokeDasharray="4 4"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="shortLabel"
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fill:
                          CHART_COLORS.text,
                        fontSize: 11,
                      }}
                    />

                    <YAxis
                      allowDecimals={false}
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fill:
                          CHART_COLORS.text,
                        fontSize: 11,
                      }}
                    />

                    <Tooltip
                      content={
                        <ActivityTooltip />
                      }
                    />

                    <Bar
                      dataKey="appointmentCount"
                      name="Rendez-vous"
                      radius={[
                        8,
                        8,
                        2,
                        2,
                      ]}
                      maxBarSize={52}
                    >
                      {weekdayActivity.map(
                        (
                          item,
                          index,
                        ) => (
                          <Cell
                            key={
                              item.dayOfWeek
                            }
                            fill={
                              WEEKDAY_COLORS[
                                index %
                                  WEEKDAY_COLORS.length
                              ]
                            }
                          />
                        ),
                      )}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <SummaryValue
                  label="Temps réservé"
                  value={formatMinutes(
                    busiestWeekday
                      ?.bookedMinutes ??
                      0,
                  )}
                  icon={
                    <Clock3 className="size-4" />
                  }
                />

                <SummaryValue
                  label="Rendez-vous terminés"
                  value={formatNumber(
                    busiestWeekday
                      ?.completedAppointmentCount ??
                      0,
                  )}
                  icon={
                    <CheckCircle2 className="size-4" />
                  }
                />
              </div>
            </>
          ) : (
            <EmptyChart
              title="Aucune donnée hebdomadaire"
              description="Les performances par jour apparaîtront lorsque suffisamment de rendez-vous auront été enregistrés."
            />
          )}
        </ChartCard>
      </div>
    </section>
  );
}
