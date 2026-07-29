import type {
  DashboardDailyActivity,
  DashboardFinanceMetrics,
  DashboardHourlyActivity,
  DashboardMonthlyActivity,
  DashboardStaffPerformance,
  DashboardTopService,
  DashboardWeekdayActivity,
} from "@/features/admin/dashboard/types/admin-dashboard.types";
import { prisma } from "@/lib/prisma";

/* -------------------------------------------------------------------------- */
/*                                  TYPES                                     */
/* -------------------------------------------------------------------------- */

export type DashboardAnalyticsPeriod = {
  todayStart: Date;
  todayEnd: Date;

  weekStart: Date;
  weekEnd: Date;

  monthStart: Date;
  monthEnd: Date;

  yearStart: Date;
  yearEnd: Date;
};

export type DashboardAnalyticsResult = {
  finance: DashboardFinanceMetrics;

  dailyActivity: DashboardDailyActivity[];
  monthlyActivity: DashboardMonthlyActivity[];
  hourlyActivity: DashboardHourlyActivity[];
  weekdayActivity: DashboardWeekdayActivity[];

  topServices: DashboardTopService[];
  staffPerformance: DashboardStaffPerformance[];
};

/* -------------------------------------------------------------------------- */
/*                                CONSTANTES                                  */
/* -------------------------------------------------------------------------- */

const PARIS_TIME_ZONE =
  "Europe/Paris";

const ACTIVITY_STATUSES = new Set([
  "PENDING",
  "CONFIRMED",
  "IN_PROGRESS",
  "COMPLETED",
  "NO_SHOW",
]);

const CANCELLED_STATUSES = new Set([
  "CANCELLED_BY_CLIENT",
  "CANCELLED_BY_ADMIN",
  "REFUSED",
  "EXPIRED",
]);

const WEEKDAY_ORDER = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
] as const;

const WEEKDAY_LABELS = {
  MONDAY: {
    label: "Lundi",
    shortLabel: "Lun.",
  },

  TUESDAY: {
    label: "Mardi",
    shortLabel: "Mar.",
  },

  WEDNESDAY: {
    label: "Mercredi",
    shortLabel: "Mer.",
  },

  THURSDAY: {
    label: "Jeudi",
    shortLabel: "Jeu.",
  },

  FRIDAY: {
    label: "Vendredi",
    shortLabel: "Ven.",
  },

  SATURDAY: {
    label: "Samedi",
    shortLabel: "Sam.",
  },

  SUNDAY: {
    label: "Dimanche",
    shortLabel: "Dim.",
  },
} satisfies Record<
  (typeof WEEKDAY_ORDER)[number],
  {
    label: string;
    shortLabel: string;
  }
>;

/* -------------------------------------------------------------------------- */
/*                                  OUTILS                                    */
/* -------------------------------------------------------------------------- */

function isBetween(
  value: Date,
  start: Date,
  end: Date,
): boolean {
  const timestamp =
    value.getTime();

  return (
    timestamp >=
      start.getTime() &&
    timestamp <=
      end.getTime()
  );
}

function getDateKey(
  date: Date,
): string {
  return new Intl.DateTimeFormat(
    "en-CA",
    {
      timeZone:
        PARIS_TIME_ZONE,

      year:
        "numeric",

      month:
        "2-digit",

      day:
        "2-digit",
    },
  ).format(date);
}

function getMonthKey(
  date: Date,
): string {
  const parts =
    new Intl.DateTimeFormat(
      "fr-FR",
      {
        timeZone:
          PARIS_TIME_ZONE,

        year:
          "numeric",

        month:
          "2-digit",
      },
    ).formatToParts(date);

  const year =
    parts.find(
      (part) =>
        part.type ===
        "year",
    )?.value;

  const month =
    parts.find(
      (part) =>
        part.type ===
        "month",
    )?.value;

  return `${year}-${month}`;
}

function getParisHour(
  date: Date,
): number {
  const value =
    new Intl.DateTimeFormat(
      "fr-FR",
      {
        timeZone:
          PARIS_TIME_ZONE,

        hour:
          "2-digit",

        hour12:
          false,
      },
    ).format(date);

  const hour =
    Number.parseInt(
      value,
      10,
    );

  return Number.isFinite(hour)
    ? hour
    : 0;
}

function getWeekday(
  date: Date,
): (typeof WEEKDAY_ORDER)[number] {
  const weekday =
    new Intl.DateTimeFormat(
      "en-US",
      {
        timeZone:
          PARIS_TIME_ZONE,

        weekday:
          "long",
      },
    )
      .format(date)
      .toUpperCase();

  switch (weekday) {
    case "MONDAY":
    case "TUESDAY":
    case "WEDNESDAY":
    case "THURSDAY":
    case "FRIDAY":
    case "SATURDAY":
    case "SUNDAY":
      return weekday;

    default:
      return "MONDAY";
  }
}

function startOfParisDay(
  date: Date,
): Date {
  const copy =
    new Date(date);

  copy.setHours(
    0,
    0,
    0,
    0,
  );

  return copy;
}

function addDays(
  date: Date,
  days: number,
): Date {
  const copy =
    new Date(date);

  copy.setDate(
    copy.getDate() +
      days,
  );

  return copy;
}

function getStaffName(
  staff: {
    displayName: string | null;

    user: {
      firstName: string;
      lastName: string;
    };
  },
): string {
  const displayName =
    staff.displayName?.trim();

  if (displayName) {
    return displayName;
  }

  return [
    staff.user.firstName,
    staff.user.lastName,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();
}

/* -------------------------------------------------------------------------- */
/*                              SERVICE PRINCIPAL                             */
/* -------------------------------------------------------------------------- */

export async function getDashboardAnalytics(
  period: DashboardAnalyticsPeriod,
  now: Date,
): Promise<DashboardAnalyticsResult> {
  const twelveMonthsStart =
    new Date(
      now.getFullYear(),
      now.getMonth() - 11,
      1,
      0,
      0,
      0,
      0,
    );

  const activityStart =
    twelveMonthsStart <
    period.yearStart
      ? twelveMonthsStart
      : period.yearStart;

  const appointments =
    await prisma.appointment.findMany({
      where: {
        startsAt: {
          gte:
            activityStart,

          lte:
            period.yearEnd,
        },
      },

      select: {
        id: true,
        status: true,
        startsAt: true,
        totalDurationMinutes: true,
        totalPriceCents: true,
        staffId: true,

        staff: {
          select: {
            id: true,
            displayName: true,
            color: true,

            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },

        services: {
          select: {
            serviceId: true,
            serviceName: true,
            quantity: true,
            durationMinutes: true,
            unitPriceCents: true,
          },
        },
      },
    });

  /* ------------------------------------------------------------------------ */
  /*                                FINANCES                                  */
  /* ------------------------------------------------------------------------ */

  const completedAppointments =
    appointments.filter(
      (appointment) =>
        appointment.status ===
        "COMPLETED",
    );

  const completedToday =
    completedAppointments.filter(
      (appointment) =>
        isBetween(
          appointment.startsAt,
          period.todayStart,
          period.todayEnd,
        ),
    );

  const completedThisWeek =
    completedAppointments.filter(
      (appointment) =>
        isBetween(
          appointment.startsAt,
          period.weekStart,
          period.weekEnd,
        ),
    );

  const completedThisMonth =
    completedAppointments.filter(
      (appointment) =>
        isBetween(
          appointment.startsAt,
          period.monthStart,
          period.monthEnd,
        ),
    );

  const completedThisYear =
    completedAppointments.filter(
      (appointment) =>
        isBetween(
          appointment.startsAt,
          period.yearStart,
          period.yearEnd,
        ),
    );

  const sumRevenue =
    (
      rows: typeof appointments,
    ): number =>
      rows.reduce(
        (
          total,
          appointment,
        ) =>
          total +
          appointment.totalPriceCents,

        0,
      );

  const revenueTodayCents =
    sumRevenue(
      completedToday,
    );

  const revenueThisWeekCents =
    sumRevenue(
      completedThisWeek,
    );

  const revenueThisMonthCents =
    sumRevenue(
      completedThisMonth,
    );

  const revenueThisYearCents =
    sumRevenue(
      completedThisYear,
    );

  const reportableToday =
    appointments.filter(
      (appointment) =>
        ACTIVITY_STATUSES.has(
          appointment.status,
        ) &&
        isBetween(
          appointment.startsAt,
          period.todayStart,
          period.todayEnd,
        ),
    );

  const projectedRevenueTodayCents =
    reportableToday.reduce(
      (
        total,
        appointment,
      ) =>
        total +
        appointment.totalPriceCents,

      0,
    );

  const elapsedMonthDays =
    Math.max(
      now.getDate(),
      1,
    );

  const totalMonthDays =
    new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
    ).getDate();

  const projectedRevenueThisMonthCents =
    revenueThisMonthCents > 0
      ? Math.round(
          (
            revenueThisMonthCents /
            elapsedMonthDays
          ) *
            totalMonthDays,
        )
      : 0;

  const averageBasketTodayCents =
    completedToday.length > 0
      ? Math.round(
          revenueTodayCents /
            completedToday.length,
        )
      : 0;

  const averageBasketThisMonthCents =
    completedThisMonth.length > 0
      ? Math.round(
          revenueThisMonthCents /
            completedThisMonth.length,
        )
      : 0;

  const paypalCollectedThisMonth =
    await prisma.appointment.aggregate({
      where: {
        paymentMethod:
          "PAYPAL",

        paymentStatus: {
          in: [
            "PARTIALLY_PAID",
            "PAID",
          ],
        },

        paidAt: {
          gte:
            period.monthStart,

          lte:
            period.monthEnd,
        },
      },

      _sum: {
        depositCents: true,
      },
    });

  const finance: DashboardFinanceMetrics =
    {
      revenueTodayCents,
      revenueThisWeekCents,
      revenueThisMonthCents,
      revenueThisYearCents,

      projectedRevenueTodayCents,
      projectedRevenueThisMonthCents,

      averageBasketTodayCents,
      averageBasketThisMonthCents,

      paypalCollectedThisMonthCents:
        paypalCollectedThisMonth
          ._sum.depositCents ??
        0,

      completedAppointmentsToday:
        completedToday.length,

      completedAppointmentsThisMonth:
        completedThisMonth.length,
    };

  /* ------------------------------------------------------------------------ */
  /*                         ACTIVITÉ DES 14 JOURS                            */
  /* ------------------------------------------------------------------------ */

  const dailyActivity: DashboardDailyActivity[] =
    [];

  const todayStart =
    startOfParisDay(now);

  for (
    let offset = 13;
    offset >= 0;
    offset -= 1
  ) {
    const day =
      addDays(
        todayStart,
        -offset,
      );

    const dayKey =
      getDateKey(day);

    const dayAppointments =
      appointments.filter(
        (appointment) =>
          getDateKey(
            appointment.startsAt,
          ) === dayKey,
      );

    dailyActivity.push({
      date:
        day.toISOString(),

      label:
        new Intl.DateTimeFormat(
          "fr-FR",
          {
            timeZone:
              PARIS_TIME_ZONE,

            weekday:
              "long",

            day:
              "numeric",

            month:
              "long",
          },
        ).format(day),

      shortLabel:
        new Intl.DateTimeFormat(
          "fr-FR",
          {
            timeZone:
              PARIS_TIME_ZONE,

            day:
              "2-digit",

            month:
              "2-digit",
          },
        ).format(day),

      appointmentCount:
        dayAppointments.filter(
          (appointment) =>
            ACTIVITY_STATUSES.has(
              appointment.status,
            ),
        ).length,

      completedAppointmentCount:
        dayAppointments.filter(
          (appointment) =>
            appointment.status ===
            "COMPLETED",
        ).length,

      cancelledAppointmentCount:
        dayAppointments.filter(
          (appointment) =>
            CANCELLED_STATUSES.has(
              appointment.status,
            ),
        ).length,

      noShowCount:
        dayAppointments.filter(
          (appointment) =>
            appointment.status ===
            "NO_SHOW",
        ).length,

      bookedMinutes:
        dayAppointments
          .filter(
            (appointment) =>
              ACTIVITY_STATUSES.has(
                appointment.status,
              ),
          )
          .reduce(
            (
              total,
              appointment,
            ) =>
              total +
              appointment.totalDurationMinutes,

            0,
          ),

      revenueCents:
        dayAppointments
          .filter(
            (appointment) =>
              appointment.status ===
              "COMPLETED",
          )
          .reduce(
            (
              total,
              appointment,
            ) =>
              total +
              appointment.totalPriceCents,

            0,
          ),
    });
  }

  /* ------------------------------------------------------------------------ */
  /*                         ACTIVITÉ DES 12 MOIS                             */
  /* ------------------------------------------------------------------------ */

  const monthlyActivity: DashboardMonthlyActivity[] =
    [];

  for (
    let offset = 11;
    offset >= 0;
    offset -= 1
  ) {
    const monthDate =
      new Date(
        now.getFullYear(),
        now.getMonth() -
          offset,
        1,
        0,
        0,
        0,
        0,
      );

    const monthKey =
      getMonthKey(
        monthDate,
      );

    const monthAppointments =
      appointments.filter(
        (appointment) =>
          getMonthKey(
            appointment.startsAt,
          ) === monthKey,
      );

    monthlyActivity.push({
      month:
        monthKey,

      label:
        new Intl.DateTimeFormat(
          "fr-FR",
          {
            timeZone:
              PARIS_TIME_ZONE,

            month:
              "short",

            year:
              "numeric",
          },
        ).format(monthDate),

      appointmentCount:
        monthAppointments.filter(
          (appointment) =>
            ACTIVITY_STATUSES.has(
              appointment.status,
            ),
        ).length,

      completedAppointmentCount:
        monthAppointments.filter(
          (appointment) =>
            appointment.status ===
            "COMPLETED",
        ).length,

      revenueCents:
        monthAppointments
          .filter(
            (appointment) =>
              appointment.status ===
              "COMPLETED",
          )
          .reduce(
            (
              total,
              appointment,
            ) =>
              total +
              appointment.totalPriceCents,

            0,
          ),
    });
  }

  /* ------------------------------------------------------------------------ */
  /*                         ACTIVITÉ PAR HEURE                               */
  /* ------------------------------------------------------------------------ */

  const hourlyActivity: DashboardHourlyActivity[] =
    Array.from(
      {
        length: 14,
      },
      (
        _,
        index,
      ) => {
        const hour =
          index + 7;

        const hourAppointments =
          appointments.filter(
            (appointment) =>
              ACTIVITY_STATUSES.has(
                appointment.status,
              ) &&
              isBetween(
                appointment.startsAt,
                period.monthStart,
                period.monthEnd,
              ) &&
              getParisHour(
                appointment.startsAt,
              ) === hour,
          );

        return {
          hour,
          label:
            `${hour
              .toString()
              .padStart(
                2,
                "0",
              )}h`,

          appointmentCount:
            hourAppointments.length,

          bookedMinutes:
            hourAppointments.reduce(
              (
                total,
                appointment,
              ) =>
                total +
                appointment.totalDurationMinutes,

              0,
            ),
        };
      },
    );

  /* ------------------------------------------------------------------------ */
  /*                      ACTIVITÉ PAR JOUR DE SEMAINE                        */
  /* ------------------------------------------------------------------------ */

  const weekdayActivity: DashboardWeekdayActivity[] =
    WEEKDAY_ORDER.map(
      (dayOfWeek) => {
        const rows =
          appointments.filter(
            (appointment) =>
              isBetween(
                appointment.startsAt,
                period.monthStart,
                period.monthEnd,
              ) &&
              getWeekday(
                appointment.startsAt,
              ) === dayOfWeek,
          );

        return {
          dayOfWeek,
          ...WEEKDAY_LABELS[
            dayOfWeek
          ],

          appointmentCount:
            rows.filter(
              (appointment) =>
                ACTIVITY_STATUSES.has(
                  appointment.status,
                ),
            ).length,

          completedAppointmentCount:
            rows.filter(
              (appointment) =>
                appointment.status ===
                "COMPLETED",
            ).length,

          revenueCents:
            rows
              .filter(
                (appointment) =>
                  appointment.status ===
                  "COMPLETED",
              )
              .reduce(
                (
                  total,
                  appointment,
                ) =>
                  total +
                  appointment.totalPriceCents,

                0,
              ),

          bookedMinutes:
            rows
              .filter(
                (appointment) =>
                  ACTIVITY_STATUSES.has(
                    appointment.status,
                  ),
              )
              .reduce(
                (
                  total,
                  appointment,
                ) =>
                  total +
                  appointment.totalDurationMinutes,

                0,
              ),
        };
      },
    );

  /* ------------------------------------------------------------------------ */
  /*                            TOP PRESTATIONS                               */
  /* ------------------------------------------------------------------------ */

  const serviceMap =
    new Map<
      string,
      {
        serviceId: string;
        name: string;
        quantity: number;
        appointmentIds: Set<string>;
        totalDurationMinutes: number;
        revenueCents: number;
      }
    >();

  for (
    const appointment
    of completedThisMonth
  ) {
    for (
      const service
      of appointment.services
    ) {
      const existing =
        serviceMap.get(
          service.serviceId,
        ) ?? {
          serviceId:
            service.serviceId,

          name:
            service.serviceName,

          quantity:
            0,

          appointmentIds:
            new Set<string>(),

          totalDurationMinutes:
            0,

          revenueCents:
            0,
        };

      existing.quantity +=
        service.quantity;

      existing.appointmentIds.add(
        appointment.id,
      );

      existing.totalDurationMinutes +=
        service.durationMinutes *
        service.quantity;

      existing.revenueCents +=
        service.unitPriceCents *
        service.quantity;

      serviceMap.set(
        service.serviceId,
        existing,
      );
    }
  }

  const totalServiceRevenueCents =
    Array.from(
      serviceMap.values(),
    ).reduce(
      (
        total,
        service,
      ) =>
        total +
        service.revenueCents,

      0,
    );

  const topServices: DashboardTopService[] =
    Array.from(
      serviceMap.values(),
    )
      .map(
        (service) => ({
          serviceId:
            service.serviceId,

          name:
            service.name,

          quantity:
            service.quantity,

          appointmentCount:
            service.appointmentIds.size,

          totalDurationMinutes:
            service.totalDurationMinutes,

          revenueCents:
            service.revenueCents,

          averageUnitPriceCents:
            service.quantity > 0
              ? Math.round(
                  service.revenueCents /
                    service.quantity,
                )
              : 0,

          revenuePercentage:
            totalServiceRevenueCents >
            0
              ? Math.round(
                  (
                    service.revenueCents /
                    totalServiceRevenueCents
                  ) *
                    1000,
                ) / 10
              : 0,
        }),
      )
      .sort(
        (
          first,
          second,
        ) =>
          second.revenueCents -
          first.revenueCents,
      )
      .slice(
        0,
        8,
      );

  /* ------------------------------------------------------------------------ */
  /*                          PERFORMANCE ÉQUIPE                              */
  /* ------------------------------------------------------------------------ */

  const staffMap =
    new Map<
      string,
      DashboardStaffPerformance
    >();

  const monthAppointments =
    appointments.filter(
      (appointment) =>
        appointment.staff &&
        isBetween(
          appointment.startsAt,
          period.monthStart,
          period.monthEnd,
        ),
    );

  for (
    const appointment
    of monthAppointments
  ) {
    const staff =
      appointment.staff;

    if (!staff) {
      continue;
    }

    const current =
      staffMap.get(
        staff.id,
      ) ?? {
        staffId:
          staff.id,

        displayName:
          getStaffName(
            staff,
          ),

        color:
          staff.color,

        appointmentCount:
          0,

        completedAppointmentCount:
          0,

        cancelledAppointmentCount:
          0,

        noShowCount:
          0,

        bookedMinutes:
          0,

        completedMinutes:
          0,

        revenueCents:
          0,

        averageBasketCents:
          0,

        occupancyRate:
          0,
      };

    if (
      ACTIVITY_STATUSES.has(
        appointment.status,
      )
    ) {
      current.appointmentCount +=
        1;

      current.bookedMinutes +=
        appointment.totalDurationMinutes;
    }

    if (
      appointment.status ===
      "COMPLETED"
    ) {
      current.completedAppointmentCount +=
        1;

      current.completedMinutes +=
        appointment.totalDurationMinutes;

      current.revenueCents +=
        appointment.totalPriceCents;
    }

    if (
      CANCELLED_STATUSES.has(
        appointment.status,
      )
    ) {
      current.cancelledAppointmentCount +=
        1;
    }

    if (
      appointment.status ===
      "NO_SHOW"
    ) {
      current.noShowCount +=
        1;
    }

    staffMap.set(
      staff.id,
      current,
    );
  }

  const staffPerformance =
    Array.from(
      staffMap.values(),
    )
      .map(
        (staff) => ({
          ...staff,

          averageBasketCents:
            staff.completedAppointmentCount >
            0
              ? Math.round(
                  staff.revenueCents /
                    staff.completedAppointmentCount,
                )
              : 0,
        }),
      )
      .sort(
        (
          first,
          second,
        ) =>
          second.revenueCents -
          first.revenueCents,
      );

  return {
    finance,

    dailyActivity,
    monthlyActivity,
    hourlyActivity,
    weekdayActivity,

    topServices,
    staffPerformance,
  };
}
