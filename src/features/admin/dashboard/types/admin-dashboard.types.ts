/* -------------------------------------------------------------------------- */
/*                               RENDEZ-VOUS                                   */
/* -------------------------------------------------------------------------- */

export type DashboardAppointmentStatus =
  | "PENDING"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "REFUSED"
  | "CANCELLED_BY_CLIENT"
  | "CANCELLED_BY_ADMIN"
  | "NO_SHOW"
  | "EXPIRED";

export type DashboardPaymentStatus =
  | "NOT_REQUIRED"
  | "PENDING"
  | "PARTIALLY_PAID"
  | "PAID"
  | "REFUNDED"
  | "CANCELLED";

export type DashboardAppointment = {
  id: string;
  reference: string;

  status: DashboardAppointmentStatus;
  paymentStatus: DashboardPaymentStatus;

  startsAt: string;
  endsAt: string;

  totalDurationMinutes: number;
  totalPriceCents: number;
  depositCents: number;

  client: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    image: string | null;
  };

  staff: {
    id: string;
    displayName: string;
    color: string | null;
  } | null;

  workstation: {
    id: string;
    name: string;
    color: string | null;
  } | null;

  services: Array<{
    id: string;
    name: string;
    quantity: number;
    durationMinutes: number;
    unitPriceCents: number;
  }>;
};

/* -------------------------------------------------------------------------- */
/*                                  CLIENTES                                  */
/* -------------------------------------------------------------------------- */

export type DashboardRecentClient = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  image: string | null;
  createdAt: string;

  loyaltyPoints: number;
  appointmentCount: number;

  nextAppointment: {
    reference: string;
    startsAt: string;
    status: DashboardAppointmentStatus;
  } | null;
};

export type DashboardInactiveClient = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  image: string | null;

  appointmentCount: number;
  totalSpentCents: number;
  loyaltyPoints: number;

  lastAppointmentAt: string | null;
  inactiveDays: number;
};

export type DashboardTopClient = {
  id: string;
  firstName: string;
  lastName: string;
  image: string | null;

  appointmentCount: number;
  totalSpentCents: number;
  averageBasketCents: number;

  loyaltyPoints: number;
};

/* -------------------------------------------------------------------------- */
/*                                    AVIS                                    */
/* -------------------------------------------------------------------------- */

export type DashboardPendingReview = {
  id: string;

  authorName: string;
  authorAvatar: string | null;

  rating: number;
  title: string | null;
  content: string;

  isVerified: boolean;
  createdAt: string;
};

/* -------------------------------------------------------------------------- */
/*                               RÉPARTITION                                  */
/* -------------------------------------------------------------------------- */

export type DashboardStatusBreakdown = {
  status: DashboardAppointmentStatus;
  count: number;
  percentage: number;
};

/* -------------------------------------------------------------------------- */
/*                                TENDANCES                                   */
/* -------------------------------------------------------------------------- */

export type DashboardTrendDirection =
  | "UP"
  | "DOWN"
  | "STABLE";

export type DashboardTrend = {
  currentValue: number;
  previousValue: number;

  percentageChange: number;
  direction: DashboardTrendDirection;
};

/* -------------------------------------------------------------------------- */
/*                                  ALERTES                                   */
/* -------------------------------------------------------------------------- */

export type DashboardAlertType =
  | "PENDING_APPOINTMENTS"
  | "UNASSIGNED_APPOINTMENTS"
  | "UNPAID_DEPOSITS"
  | "PENDING_REVIEWS"
  | "UNREAD_MESSAGES"
  | "CONTESTS_AWAITING_DRAW";

export type DashboardAlertTone =
  | "ROSE"
  | "AMBER"
  | "BLUE"
  | "VIOLET"
  | "EMERALD";

export type DashboardAlert = {
  id: DashboardAlertType;

  title: string;
  description: string;

  count: number;
  href: string;

  tone: DashboardAlertTone;
};

/* -------------------------------------------------------------------------- */
/*                              GRAPHIQUES                                    */
/* -------------------------------------------------------------------------- */

export type DashboardDailyActivity = {
  date: string;
  label: string;
  shortLabel: string;

  appointmentCount: number;
  completedAppointmentCount: number;
  cancelledAppointmentCount: number;
  noShowCount: number;

  bookedMinutes: number;
  revenueCents: number;
};

export type DashboardMonthlyActivity = {
  month: string;
  label: string;

  appointmentCount: number;
  completedAppointmentCount: number;
  revenueCents: number;
};

export type DashboardHourlyActivity = {
  hour: number;
  label: string;

  appointmentCount: number;
  bookedMinutes: number;
};

export type DashboardWeekdayActivity = {
  dayOfWeek:
    | "MONDAY"
    | "TUESDAY"
    | "WEDNESDAY"
    | "THURSDAY"
    | "FRIDAY"
    | "SATURDAY"
    | "SUNDAY";

  label: string;
  shortLabel: string;

  appointmentCount: number;
  completedAppointmentCount: number;
  revenueCents: number;
  bookedMinutes: number;
};

/* -------------------------------------------------------------------------- */
/*                              PRESTATIONS                                   */
/* -------------------------------------------------------------------------- */

export type DashboardTopService = {
  serviceId: string;
  name: string;

  quantity: number;
  appointmentCount: number;

  totalDurationMinutes: number;
  revenueCents: number;

  averageUnitPriceCents: number;
  revenuePercentage: number;
};

/* -------------------------------------------------------------------------- */
/*                                  ÉQUIPE                                    */
/* -------------------------------------------------------------------------- */

export type DashboardStaffPerformance = {
  staffId: string;
  displayName: string;
  color: string | null;

  appointmentCount: number;
  completedAppointmentCount: number;
  cancelledAppointmentCount: number;
  noShowCount: number;

  bookedMinutes: number;
  completedMinutes: number;

  revenueCents: number;
  averageBasketCents: number;

  occupancyRate: number;
};

/* -------------------------------------------------------------------------- */
/*                              OCCUPATION                                    */
/* -------------------------------------------------------------------------- */

export type DashboardOccupancy = {
  availableMinutesToday: number;
  bookedMinutesToday: number;
  remainingMinutesToday: number;

  availableMinutesThisWeek: number;
  bookedMinutesThisWeek: number;
  remainingMinutesThisWeek: number;

  occupancyRateToday: number;
  occupancyRateThisWeek: number;

  freeSlotEstimateToday: number;
  freeSlotEstimateThisWeek: number;
};

/* -------------------------------------------------------------------------- */
/*                                  FINANCES                                  */
/* -------------------------------------------------------------------------- */

export type DashboardFinanceMetrics = {
  revenueTodayCents: number;
  revenueThisWeekCents: number;
  revenueThisMonthCents: number;
  revenueThisYearCents: number;

  projectedRevenueTodayCents: number;
  projectedRevenueThisMonthCents: number;

  averageBasketTodayCents: number;
  averageBasketThisMonthCents: number;

  paypalCollectedThisMonthCents: number;

  completedAppointmentsToday: number;
  completedAppointmentsThisMonth: number;
};

/* -------------------------------------------------------------------------- */
/*                             QUALITÉ ACTIVITÉ                               */
/* -------------------------------------------------------------------------- */

export type DashboardBusinessHealth = {
  cancellationCountThisMonth: number;
  cancellationRateThisMonth: number;

  noShowCountThisMonth: number;
  noShowRateThisMonth: number;

  completionRateThisMonth: number;

  pendingAppointmentCount: number;
  unpaidDepositCount: number;
  unassignedAppointmentCount: number;
};

/* -------------------------------------------------------------------------- */
/*                         ASSISTANT INTELLIGENT                               */
/* -------------------------------------------------------------------------- */

export type DashboardInsightType =
  | "INFORMATION"
  | "SUCCESS"
  | "WARNING"
  | "OPPORTUNITY"
  | "VIP"
  | "REVENUE"
  | "PLANNING"
  | "CLIENT";

export type DashboardInsightPriority =
  | "LOW"
  | "MEDIUM"
  | "HIGH"
  | "CRITICAL";

export type DashboardInsight = {
  id: string;

  type: DashboardInsightType;
  priority: DashboardInsightPriority;

  title: string;
  description: string;

  value?: string;
  href?: string;

  createdAt: string;
};

/* -------------------------------------------------------------------------- */
/*                              DONNÉES GLOBALES                              */
/* -------------------------------------------------------------------------- */

export type AdminDashboardData = {
  generatedAt: string;

  period: {
    todayStart: string;
    todayEnd: string;

    weekStart: string;
    weekEnd: string;

    monthStart: string;
    monthEnd: string;

    yearStart: string;
    yearEnd: string;

    previousMonthStart: string;
    previousMonthEnd: string;
  };

  metrics: {
    appointmentsToday: number;
    appointmentsThisMonth: number;
    pendingAppointments: number;

    revenueThisMonthCents: number;
    paypalCollectedThisMonthCents: number;

    activeClients: number;
    newClientsThisMonth: number;

    unreadMessages: number;

    pendingReviews: number;
    averageRating: number | null;

    publishedGalleryItems: number;

    vipMembers: number;
    activeVipMembers: number;

    activeContests: number;
    contestParticipants: number;
    contestsAwaitingDraw: number;
  };

  finance: DashboardFinanceMetrics;
  occupancy: DashboardOccupancy;
  businessHealth: DashboardBusinessHealth;

  trends: {
    appointments: DashboardTrend;
    revenue: DashboardTrend;
    newClients: DashboardTrend;
  };

  alerts: DashboardAlert[];
  insights: DashboardInsight[];

  todayAppointments: DashboardAppointment[];
  upcomingAppointments: DashboardAppointment[];

  recentClients: DashboardRecentClient[];
  inactiveClients: DashboardInactiveClient[];
  topClients: DashboardTopClient[];

  pendingReviewItems: DashboardPendingReview[];

  appointmentStatusBreakdown: DashboardStatusBreakdown[];

  dailyActivity: DashboardDailyActivity[];
  monthlyActivity: DashboardMonthlyActivity[];
  hourlyActivity: DashboardHourlyActivity[];
  weekdayActivity: DashboardWeekdayActivity[];

  topServices: DashboardTopService[];
  staffPerformance: DashboardStaffPerformance[];
};

/* -------------------------------------------------------------------------- */
/*                              PROPRIÉTÉS UI                                 */
/* -------------------------------------------------------------------------- */

export type AdminDashboardProps = {
  user: {
    firstName: string;
    lastName: string;
    email: string;
    roleLabel: string;
  };

  data: AdminDashboardData;
};
