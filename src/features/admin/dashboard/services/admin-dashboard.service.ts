import type { Prisma } from "@/generated/prisma/client";

import type {
  AdminDashboardData,
  DashboardAlert,
  DashboardAppointment,
  DashboardAppointmentStatus,
  DashboardRecentClient,
  DashboardTrend,
} from "@/features/admin/dashboard/types/admin-dashboard.types";
import { getDashboardAnalytics } from "@/features/admin/dashboard/services/admin-dashboard-analytics.service";
import { prisma } from "@/lib/prisma";

/* -------------------------------------------------------------------------- */
/*                                  CONSTANTES                                */
/* -------------------------------------------------------------------------- */

const REPORTABLE_APPOINTMENT_STATUSES: DashboardAppointmentStatus[] = [
  "PENDING",
  "CONFIRMED",
  "IN_PROGRESS",
  "COMPLETED",
  "NO_SHOW",
];

const UPCOMING_APPOINTMENT_STATUSES: DashboardAppointmentStatus[] = [
  "PENDING",
  "CONFIRMED",
  "IN_PROGRESS",
];

const ALL_APPOINTMENT_STATUSES: DashboardAppointmentStatus[] = [
  "PENDING",
  "CONFIRMED",
  "IN_PROGRESS",
  "COMPLETED",
  "REFUSED",
  "CANCELLED_BY_CLIENT",
  "CANCELLED_BY_ADMIN",
  "NO_SHOW",
  "EXPIRED",
];

/* -------------------------------------------------------------------------- */
/*                              SÉLECTION PRISMA                              */
/* -------------------------------------------------------------------------- */

const dashboardAppointmentSelect = {
  id: true,
  reference: true,
  status: true,
  paymentStatus: true,
  startsAt: true,
  endsAt: true,
  totalDurationMinutes: true,
  totalPriceCents: true,
  depositCents: true,

  client: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      image: true,
    },
  },

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

  workstation: {
    select: {
      id: true,
      name: true,
      color: true,
    },
  },

  services: {
    orderBy: {
      sortOrder: "asc",
    },

    select: {
      id: true,
      serviceName: true,
      quantity: true,
      durationMinutes: true,
      unitPriceCents: true,
    },
  },
} satisfies Prisma.AppointmentSelect;

const recentClientSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
  image: true,
  createdAt: true,

  clientProfile: {
    select: {
      loyaltyPoints: true,
    },
  },

  loyaltyAccount: {
    select: {
      points: true,
    },
  },

  _count: {
    select: {
      appointments: true,
    },
  },

  appointments: {
    where: {
      startsAt: {
        gte: new Date(0),
      },

      status: {
        in: UPCOMING_APPOINTMENT_STATUSES,
      },
    },

    orderBy: {
      startsAt: "asc",
    },

    take: 1,

    select: {
      reference: true,
      startsAt: true,
      status: true,
    },
  },
} satisfies Prisma.UserSelect;

type DashboardAppointmentRow = Prisma.AppointmentGetPayload<{
  select: typeof dashboardAppointmentSelect;
}>;

type RecentClientRow = Prisma.UserGetPayload<{
  select: typeof recentClientSelect;
}>;

/* -------------------------------------------------------------------------- */
/*                               OUTILS DE DATES                              */
/* -------------------------------------------------------------------------- */

type DashboardPeriod = {
  todayStart: Date;
  todayEnd: Date;
  tomorrowStart: Date;

  weekStart: Date;
  weekEnd: Date;

  monthStart: Date;
  monthEnd: Date;

  yearStart: Date;
  yearEnd: Date;

  previousMonthStart: Date;
  previousMonthEnd: Date;
};

function getDashboardPeriod(now: Date): DashboardPeriod {
  const todayStart = new Date(now);

  todayStart.setHours(0, 0, 0, 0);

  const tomorrowStart = new Date(todayStart);

  tomorrowStart.setDate(tomorrowStart.getDate() + 1);

  const todayEnd = new Date(tomorrowStart.getTime() - 1);

  const currentDay = todayStart.getDay();

  const daysSinceMonday = currentDay === 0 ? 6 : currentDay - 1;

  const weekStart = new Date(todayStart);

  weekStart.setDate(weekStart.getDate() - daysSinceMonday);

  const nextWeekStart = new Date(weekStart);

  nextWeekStart.setDate(nextWeekStart.getDate() + 7);

  const weekEnd = new Date(nextWeekStart.getTime() - 1);

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);

  const nextMonthStart = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    1,
    0,
    0,
    0,
    0,
  );

  const monthEnd = new Date(nextMonthStart.getTime() - 1);

  const yearStart = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);

  const nextYearStart = new Date(now.getFullYear() + 1, 0, 1, 0, 0, 0, 0);

  const yearEnd = new Date(nextYearStart.getTime() - 1);

  const previousMonthStart = new Date(
    now.getFullYear(),
    now.getMonth() - 1,
    1,
    0,
    0,
    0,
    0,
  );

  const previousMonthEnd = new Date(monthStart.getTime() - 1);

  return {
    todayStart,
    todayEnd,
    tomorrowStart,

    weekStart,
    weekEnd,

    monthStart,
    monthEnd,

    yearStart,
    yearEnd,

    previousMonthStart,
    previousMonthEnd,
  };
}

/* -------------------------------------------------------------------------- */
/*                                TENDANCES                                   */
/* -------------------------------------------------------------------------- */

function createTrend(
  currentValue: number,
  previousValue: number,
): DashboardTrend {
  if (currentValue === 0 && previousValue === 0) {
    return {
      currentValue,
      previousValue,
      percentageChange: 0,
      direction: "STABLE",
    };
  }

  if (previousValue === 0) {
    return {
      currentValue,
      previousValue,
      percentageChange: currentValue > 0 ? 100 : 0,
      direction: currentValue > 0 ? "UP" : "STABLE",
    };
  }

  const rawPercentage =
    ((currentValue - previousValue) / Math.abs(previousValue)) * 100;

  const percentageChange = Math.round(rawPercentage * 10) / 10;

  return {
    currentValue,
    previousValue,
    percentageChange,
    direction:
      currentValue > previousValue
        ? "UP"
        : currentValue < previousValue
          ? "DOWN"
          : "STABLE",
  };
}

/* -------------------------------------------------------------------------- */
/*                              SÉRIALISATION                                  */
/* -------------------------------------------------------------------------- */

function getStaffDisplayName(
  staff: DashboardAppointmentRow["staff"] | null,
): string {
  if (!staff) {
    return "";
  }

  const customName = staff.displayName?.trim();

  if (customName) {
    return customName;
  }

  return [staff.user.firstName, staff.user.lastName].filter(Boolean).join(" ");
}

function serializeAppointment(
  appointment: DashboardAppointmentRow,
): DashboardAppointment {
  return {
    id: appointment.id,
    reference: appointment.reference,

    status: appointment.status,

    paymentStatus: appointment.paymentStatus,

    startsAt: appointment.startsAt.toISOString(),

    endsAt: appointment.endsAt.toISOString(),

    totalDurationMinutes: appointment.totalDurationMinutes,

    totalPriceCents: appointment.totalPriceCents,

    depositCents: appointment.depositCents,

    client: {
      id: appointment.client.id,

      firstName: appointment.client.firstName,

      lastName: appointment.client.lastName,

      email: appointment.client.email,

      phone: appointment.client.phone,

      image: appointment.client.image,
    },

    staff: appointment.staff
      ? {
          id: appointment.staff.id,

          displayName: getStaffDisplayName(appointment.staff),

          color: appointment.staff.color,
        }
      : null,

    workstation: appointment.workstation
      ? {
          id: appointment.workstation.id,

          name: appointment.workstation.name,

          color: appointment.workstation.color,
        }
      : null,

    services: appointment.services.map((service) => ({
      id: service.id,

      name: service.serviceName,

      quantity: service.quantity,

      durationMinutes: service.durationMinutes,

      unitPriceCents: service.unitPriceCents,
    })),
  };
}

function serializeRecentClient(client: RecentClientRow): DashboardRecentClient {
  const nextAppointment = client.appointments[0] ?? null;

  return {
    id: client.id,

    firstName: client.firstName,

    lastName: client.lastName,

    email: client.email,

    phone: client.phone,

    image: client.image,

    createdAt: client.createdAt.toISOString(),

    loyaltyPoints:
      client.loyaltyAccount?.points ?? client.clientProfile?.loyaltyPoints ?? 0,

    appointmentCount: client._count.appointments,

    nextAppointment: nextAppointment
      ? {
          reference: nextAppointment.reference,

          startsAt: nextAppointment.startsAt.toISOString(),

          status: nextAppointment.status,
        }
      : null,
  };
}

/* -------------------------------------------------------------------------- */
/*                                  ALERTES                                   */
/* -------------------------------------------------------------------------- */

function buildAlerts(input: {
  pendingAppointments: number;
  unassignedAppointments: number;
  unpaidDeposits: number;
  pendingReviews: number;
  unreadMessages: number;
  contestsAwaitingDraw: number;
}): DashboardAlert[] {
  const alerts: DashboardAlert[] = [];

  if (input.pendingAppointments > 0) {
    alerts.push({
      id: "PENDING_APPOINTMENTS",

      title: "Rendez-vous en attente",

      description:
        input.pendingAppointments === 1
          ? "Une demande doit être confirmée ou refusée."
          : `${input.pendingAppointments} demandes doivent être traitées.`,

      count: input.pendingAppointments,

      href: "/admin/rendez-vous?status=PENDING",

      tone: "AMBER",
    });
  }

  if (input.unassignedAppointments > 0) {
    alerts.push({
      id: "UNASSIGNED_APPOINTMENTS",

      title: "Rendez-vous non attribués",

      description:
        input.unassignedAppointments === 1
          ? "Un rendez-vous doit être affecté à une professionnelle ou un poste."
          : `${input.unassignedAppointments} rendez-vous doivent être affectés.`,

      count: input.unassignedAppointments,

      href: "/admin/agenda",

      tone: "ROSE",
    });
  }

  if (input.unpaidDeposits > 0) {
    alerts.push({
      id: "UNPAID_DEPOSITS",

      title: "Acomptes en attente",

      description:
        input.unpaidDeposits === 1
          ? "Un acompte PayPal reste à régler."
          : `${input.unpaidDeposits} acomptes PayPal restent à régler.`,

      count: input.unpaidDeposits,

      href: "/admin/rendez-vous?payment=PENDING",

      tone: "BLUE",
    });
  }

  if (input.pendingReviews > 0) {
    alerts.push({
      id: "PENDING_REVIEWS",

      title: "Avis à modérer",

      description:
        input.pendingReviews === 1
          ? "Un avis client attend votre validation."
          : `${input.pendingReviews} avis clients attendent votre validation.`,

      count: input.pendingReviews,

      href: "/admin/dashboard#avis-en-attente",

      tone: "VIOLET",
    });
  }

  if (input.contestsAwaitingDraw > 0) {
    alerts.push({
      id: "CONTESTS_AWAITING_DRAW",

      title: "Tirages au sort en attente",

      description:
        input.contestsAwaitingDraw === 1
          ? "Un concours terminé attend la désignation d’une gagnante."
          : `${input.contestsAwaitingDraw} concours terminés attendent leur tirage au sort.`,

      count: input.contestsAwaitingDraw,

      href: "/admin/concours?status=CLOSED",

      tone: "VIOLET",
    });
  }

  if (input.unreadMessages > 0) {
    alerts.push({
      id: "UNREAD_MESSAGES",

      title: "Messages non lus",

      description:
        input.unreadMessages === 1
          ? "Une nouvelle notification de message est disponible."
          : `${input.unreadMessages} notifications de messages sont disponibles.`,

      count: input.unreadMessages,

      href: "/admin/dashboard#notifications",

      tone: "EMERALD",
    });
  }

  return alerts;
}

/* -------------------------------------------------------------------------- */
/*                                  SERVICE                                   */
/* -------------------------------------------------------------------------- */

export async function getAdminDashboardData(
  adminUserId: string,
): Promise<AdminDashboardData> {
  const now = new Date();

  const period = getDashboardPeriod(now);

  /*
   * La requête des clientes récentes utilise une date dynamique.
   * Prisma reçoit donc ici une sélection identique à recentClientSelect,
   * mais avec la date actuelle correctement appliquée.
   */
  const dynamicRecentClientSelect = {
    ...recentClientSelect,

    appointments: {
      ...recentClientSelect.appointments,

      where: {
        startsAt: {
          gte: now,
        },

        status: {
          in: UPCOMING_APPOINTMENT_STATUSES,
        },
      },
    },
  } satisfies Prisma.UserSelect;

  const [
    appointmentsToday,
    appointmentsThisMonth,
    appointmentsPreviousMonth,
    pendingAppointments,
    unassignedAppointments,
    unpaidDeposits,

    revenueThisMonth,
    revenuePreviousMonth,
    paypalCollectedThisMonth,

    activeClients,
    newClientsThisMonth,
    newClientsPreviousMonth,

    unreadMessages,
    pendingReviews,
    reviewRatingAggregate,
    publishedGalleryItems,

    vipMembers,
    activeVipMembers,

    activeContests,
    contestParticipants,
    contestsAwaitingDraw,

    todayAppointmentItems,
    upcomingAppointmentItems,
    recentClientItems,
    pendingReviewItems,

    statusGroups,
  ] = await Promise.all([
    prisma.appointment.count({
      where: {
        startsAt: {
          gte: period.todayStart,
          lte: period.todayEnd,
        },

        status: {
          in: REPORTABLE_APPOINTMENT_STATUSES,
        },
      },
    }),

    prisma.appointment.count({
      where: {
        startsAt: {
          gte: period.monthStart,
          lte: period.monthEnd,
        },

        status: {
          in: REPORTABLE_APPOINTMENT_STATUSES,
        },
      },
    }),

    prisma.appointment.count({
      where: {
        startsAt: {
          gte: period.previousMonthStart,

          lte: period.previousMonthEnd,
        },

        status: {
          in: REPORTABLE_APPOINTMENT_STATUSES,
        },
      },
    }),

    prisma.appointment.count({
      where: {
        status: "PENDING",

        startsAt: {
          gte: now,
        },
      },
    }),

    prisma.appointment.count({
      where: {
        startsAt: {
          gte: now,
        },

        status: {
          in: UPCOMING_APPOINTMENT_STATUSES,
        },

        OR: [
          {
            staffId: null,
          },
          {
            workstationId: null,
          },
        ],
      },
    }),

    prisma.appointment.count({
      where: {
        startsAt: {
          gte: now,
        },

        status: {
          in: UPCOMING_APPOINTMENT_STATUSES,
        },

        depositCents: {
          gt: 0,
        },

        paymentStatus: "PENDING",
      },
    }),

    prisma.appointment.aggregate({
      where: {
        status: "COMPLETED",

        startsAt: {
          gte: period.monthStart,
          lte: period.monthEnd,
        },
      },

      _sum: {
        totalPriceCents: true,
      },
    }),

    prisma.appointment.aggregate({
      where: {
        status: "COMPLETED",

        startsAt: {
          gte: period.previousMonthStart,

          lte: period.previousMonthEnd,
        },
      },

      _sum: {
        totalPriceCents: true,
      },
    }),

    prisma.appointment.aggregate({
      where: {
        paymentMethod: "PAYPAL",

        paymentStatus: {
          in: ["PARTIALLY_PAID", "PAID"],
        },

        paidAt: {
          gte: period.monthStart,
          lte: period.monthEnd,
        },
      },

      _sum: {
        depositCents: true,
      },
    }),

    prisma.user.count({
      where: {
        role: "CLIENT",

        status: "ACTIVE",
      },
    }),

    prisma.user.count({
      where: {
        role: "CLIENT",

        createdAt: {
          gte: period.monthStart,
          lte: period.monthEnd,
        },
      },
    }),

    prisma.user.count({
      where: {
        role: "CLIENT",

        createdAt: {
          gte: period.previousMonthStart,

          lte: period.previousMonthEnd,
        },
      },
    }),

    prisma.notification.count({
      where: {
        userId: adminUserId,

        type: "MESSAGE_RECEIVED",

        readAt: null,
      },
    }),

    prisma.review.count({
      where: {
        status: "PENDING",
      },
    }),

    prisma.review.aggregate({
      where: {
        status: "APPROVED",
      },

      _avg: {
        rating: true,
      },
    }),

    prisma.galleryItem.count({
      where: {
        isPublished: true,
      },
    }),

    prisma.loyaltyAccount.count(),

    prisma.loyaltyAccount.count({
      where: {
        isActive: true,

        isSuspended: false,
      },
    }),

    prisma.contest.count({
      where: {
        status: "ACTIVE",
      },
    }),

    prisma.contestParticipant.count(),

    prisma.contest.count({
      where: {
        winnerId: null,

        OR: [
          {
            status: "CLOSED",
          },
          {
            status: "ACTIVE",

            endsAt: {
              lte: now,
            },
          },
        ],
      },
    }),

    prisma.appointment.findMany({
      where: {
        startsAt: {
          gte: period.todayStart,
          lte: period.todayEnd,
        },
      },

      orderBy: [
        {
          startsAt: "asc",
        },
        {
          createdAt: "asc",
        },
      ],

      take: 20,

      select: dashboardAppointmentSelect,
    }),

    prisma.appointment.findMany({
      where: {
        startsAt: {
          gte: period.tomorrowStart,
        },

        status: {
          in: UPCOMING_APPOINTMENT_STATUSES,
        },
      },

      orderBy: [
        {
          startsAt: "asc",
        },
        {
          createdAt: "asc",
        },
      ],

      take: 8,

      select: dashboardAppointmentSelect,
    }),

    prisma.user.findMany({
      where: {
        role: "CLIENT",

        status: "ACTIVE",
      },

      orderBy: {
        createdAt: "desc",
      },

      take: 6,

      select: dynamicRecentClientSelect,
    }),

    prisma.review.findMany({
      where: {
        status: "PENDING",
      },

      orderBy: {
        createdAt: "desc",
      },

      take: 5,

      select: {
        id: true,
        authorName: true,
        authorAvatar: true,
        rating: true,
        title: true,
        content: true,
        isVerified: true,
        createdAt: true,
      },
    }),

    prisma.appointment.groupBy({
      by: ["status"],

      orderBy: {
        status: "asc",
      },

      where: {
        startsAt: {
          gte: period.monthStart,
          lte: period.monthEnd,
        },
      },

      _count: {
        status: true,
      },
    }),
  ]);

  const dashboardAnalytics = await getDashboardAnalytics(
    {
      todayStart: period.todayStart,

      todayEnd: period.todayEnd,

      weekStart: period.weekStart,

      weekEnd: period.weekEnd,

      monthStart: period.monthStart,

      monthEnd: period.monthEnd,

      yearStart: period.yearStart,

      yearEnd: period.yearEnd,
    },
    now,
  );

  const revenueThisMonthCents = revenueThisMonth._sum.totalPriceCents ?? 0;

  const revenuePreviousMonthCents =
    revenuePreviousMonth._sum.totalPriceCents ?? 0;

  const paypalCollectedThisMonthCents =
    paypalCollectedThisMonth._sum.depositCents ?? 0;

  const statusCountMap = new Map<DashboardAppointmentStatus, number>();

  for (const status of ALL_APPOINTMENT_STATUSES) {
    statusCountMap.set(status, 0);
  }

  for (const group of statusGroups) {
    const count =
      typeof group._count === "object" && group._count !== null
        ? (group._count.status ?? 0)
        : 0;

    statusCountMap.set(group.status, count);
  }

  const statusTotal = Array.from(statusCountMap.values()).reduce(
    (total, count) => total + count,
    0,
  );

  const appointmentStatusBreakdown = ALL_APPOINTMENT_STATUSES.map((status) => {
    const count = statusCountMap.get(status) ?? 0;

    return {
      status,
      count,

      percentage:
        statusTotal > 0 ? Math.round((count / statusTotal) * 1000) / 10 : 0,
    };
  });

  const completedAppointmentsThisMonth = statusCountMap.get("COMPLETED") ?? 0;

  const cancelledAppointmentsThisMonth =
    (statusCountMap.get("CANCELLED_BY_CLIENT") ?? 0) +
    (statusCountMap.get("CANCELLED_BY_ADMIN") ?? 0);

  const noShowAppointmentsThisMonth = statusCountMap.get("NO_SHOW") ?? 0;

  const decidedAppointmentsThisMonth =
    completedAppointmentsThisMonth +
    cancelledAppointmentsThisMonth +
    noShowAppointmentsThisMonth;

  const cancellationRateThisMonth =
    decidedAppointmentsThisMonth > 0
      ? Math.round(
          (cancelledAppointmentsThisMonth / decidedAppointmentsThisMonth) *
            1000,
        ) / 10
      : 0;

  const noShowRateThisMonth =
    decidedAppointmentsThisMonth > 0
      ? Math.round(
          (noShowAppointmentsThisMonth / decidedAppointmentsThisMonth) * 1000,
        ) / 10
      : 0;

  const completionRateThisMonth =
    decidedAppointmentsThisMonth > 0
      ? Math.round(
          (completedAppointmentsThisMonth / decidedAppointmentsThisMonth) *
            1000,
        ) / 10
      : 0;

  return {
    generatedAt: now.toISOString(),

    period: {
      todayStart: period.todayStart.toISOString(),

      todayEnd: period.todayEnd.toISOString(),

      weekStart: period.weekStart.toISOString(),

      weekEnd: period.weekEnd.toISOString(),

      monthStart: period.monthStart.toISOString(),

      monthEnd: period.monthEnd.toISOString(),

      yearStart: period.yearStart.toISOString(),

      yearEnd: period.yearEnd.toISOString(),

      previousMonthStart: period.previousMonthStart.toISOString(),

      previousMonthEnd: period.previousMonthEnd.toISOString(),
    },

    metrics: {
      appointmentsToday,
      appointmentsThisMonth,
      pendingAppointments,

      revenueThisMonthCents,
      paypalCollectedThisMonthCents,

      activeClients,
      newClientsThisMonth,

      unreadMessages,

      pendingReviews,

      averageRating: reviewRatingAggregate._avg.rating ?? null,

      publishedGalleryItems,

      vipMembers,
      activeVipMembers,

      activeContests,
      contestParticipants,
      contestsAwaitingDraw,
    },

    finance: dashboardAnalytics.finance,

    occupancy: {
      /*
       * L’occupation réelle sera calculée depuis les horaires
       * des membres actifs, les exceptions et les rendez-vous.
       */
      availableMinutesToday: 0,
      bookedMinutesToday: 0,
      remainingMinutesToday: 0,

      availableMinutesThisWeek: 0,
      bookedMinutesThisWeek: 0,
      remainingMinutesThisWeek: 0,

      occupancyRateToday: 0,
      occupancyRateThisWeek: 0,

      freeSlotEstimateToday: 0,
      freeSlotEstimateThisWeek: 0,
    },

    businessHealth: {
      cancellationCountThisMonth: cancelledAppointmentsThisMonth,

      cancellationRateThisMonth,

      noShowCountThisMonth: noShowAppointmentsThisMonth,

      noShowRateThisMonth,

      completionRateThisMonth,

      pendingAppointmentCount: pendingAppointments,

      unpaidDepositCount: unpaidDeposits,

      unassignedAppointmentCount: unassignedAppointments,
    },

    trends: {
      appointments: createTrend(
        appointmentsThisMonth,
        appointmentsPreviousMonth,
      ),

      revenue: createTrend(revenueThisMonthCents, revenuePreviousMonthCents),

      newClients: createTrend(newClientsThisMonth, newClientsPreviousMonth),
    },

    alerts: buildAlerts({
      pendingAppointments,
      unassignedAppointments,
      unpaidDeposits,
      pendingReviews,
      unreadMessages,
      contestsAwaitingDraw,
    }),

    /*
     * Les recommandations seront construites à partir des métriques
     * réelles dans le lot Assistant intelligent.
     */
    insights: [],

    todayAppointments: todayAppointmentItems.map(serializeAppointment),

    upcomingAppointments: upcomingAppointmentItems.map(serializeAppointment),

    recentClients: recentClientItems.map(serializeRecentClient),

    /*
     * Ces listes seront alimentées par les agrégations clientes V2.
     */
    inactiveClients: [],
    topClients: [],

    pendingReviewItems: pendingReviewItems.map((review) => ({
      id: review.id,

      authorName: review.authorName,

      authorAvatar: review.authorAvatar,

      rating: review.rating,

      title: review.title,

      content: review.content,

      isVerified: review.isVerified,

      createdAt: review.createdAt.toISOString(),
    })),

    appointmentStatusBreakdown,

    /*
     * Séries statistiques Premium.
     * Elles sont volontairement initialisées sans données fictives.
     */
    dailyActivity: dashboardAnalytics.dailyActivity,

    monthlyActivity: dashboardAnalytics.monthlyActivity,

    hourlyActivity: dashboardAnalytics.hourlyActivity,

    weekdayActivity: dashboardAnalytics.weekdayActivity,

    topServices: dashboardAnalytics.topServices,

    staffPerformance: dashboardAnalytics.staffPerformance,
  };
}
