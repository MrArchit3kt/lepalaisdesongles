/* -------------------------------------------------------------------------- */
/*                              ÉNUMÉRATIONS                                  */
/* -------------------------------------------------------------------------- */

export type AdminVipProgramStatus =
  | "DISABLED"
  | "PRE_LAUNCH"
  | "ACTIVE"
  | "PAUSED";

export type AdminVipAssistantMode =
  | "DISABLED"
  | "ADVICE_ONLY"
  | "SEMI_AUTOMATIC";

export type AdminVipVisibility =
  | "PRIVATE"
  | "MEMBERS_ONLY"
  | "PUBLIC";

export type AdminVipLevelStatus =
  | "DRAFT"
  | "ACTIVE"
  | "ARCHIVED";

export type AdminVipRewardStatus =
  | "DRAFT"
  | "ACTIVE"
  | "INACTIVE"
  | "ARCHIVED";

export type AdminVipRewardType =
  | "FIXED_DISCOUNT"
  | "PERCENTAGE_DISCOUNT"
  | "FREE_SERVICE"
  | "FREE_NAIL_ART"
  | "FREE_PRODUCT"
  | "GIFT_CARD"
  | "LOYALTY_POINTS"
  | "EXPERIENCE_POINTS"
  | "CONTEST_ENTRY"
  | "SEASON_PASS_XP"
  | "PHYSICAL_GIFT"
  | "VIP_ACCESS"
  | "CUSTOM";

export type AdminLoyaltyTransactionType =
  | "EARN"
  | "SPEND"
  | "ADJUSTMENT"
  | "EXPIRATION"
  | "REFUND"
  | "TRANSFER_IN"
  | "TRANSFER_OUT";

export type AdminLoyaltyTransactionSource =
  | "APPOINTMENT_CREATED"
  | "APPOINTMENT_CONFIRMED"
  | "APPOINTMENT_COMPLETED"
  | "APPOINTMENT_PAYMENT"
  | "APPOINTMENT_CANCELLED"
  | "REVIEW_WEBSITE"
  | "REVIEW_GOOGLE"
  | "REFERRAL"
  | "CONTEST"
  | "CONTEST_WIN"
  | "CHALLENGE"
  | "ACHIEVEMENT"
  | "BADGE"
  | "LEVEL_UP"
  | "SEASON_PASS"
  | "DAILY_LOGIN"
  | "BIRTHDAY"
  | "ANNIVERSARY"
  | "SOCIAL_SHARE"
  | "GALLERY_INTERACTION"
  | "ADMIN"
  | "SYSTEM"
  | "REWARD"
  | "GIFT"
  | "SHOP"
  | "OTHER";

/* -------------------------------------------------------------------------- */
/*                              CONFIGURATION                                 */
/* -------------------------------------------------------------------------- */

export type AdminVipModuleConfiguration = {
  xpEnabled: boolean;
  levelsEnabled: boolean;
  badgesEnabled: boolean;
  achievementsEnabled: boolean;
  rewardsEnabled: boolean;
  contestsEnabled: boolean;
  challengesEnabled: boolean;
  referralsEnabled: boolean;
  teamsEnabled: boolean;
  collectionsEnabled: boolean;
  seasonPassEnabled: boolean;
  vipShopEnabled: boolean;
  dailyWheelEnabled: boolean;
  giftChestsEnabled: boolean;
  giftingEnabled: boolean;
};

export type AdminVipNotificationConfiguration = {
  notificationsEnabled: boolean;

  notifyOnXpEarned: boolean;
  notifyOnLevelUp: boolean;
  notifyOnBadgeUnlocked: boolean;
  notifyOnAchievement: boolean;
  notifyOnRewardUnlocked: boolean;
  notifyOnContestUpdate: boolean;
  notifyOnRankingChange: boolean;
  notifyOnSeasonProgress: boolean;
  notifyOnReferralQualified: boolean;
  notifyOnRewardExpiration: boolean;
};

export type AdminVipAutomationConfiguration = {
  automaticRulesEnabled: boolean;

  automaticBirthdayRewardsEnabled: boolean;
  automaticAnniversaryRewardsEnabled: boolean;
  automaticInactiveClientRules: boolean;
  automaticSeasonActivationEnabled: boolean;
  automaticContestActivationEnabled: boolean;
};

export type AdminVipAssistantConfiguration = {
  assistantEnabled: boolean;
  assistantMode: AdminVipAssistantMode;

  assistantPlanningAnalysisEnabled: boolean;
  assistantRetentionAnalysisEnabled: boolean;
  assistantContestAnalysisEnabled: boolean;
  assistantRevenueAnalysisEnabled: boolean;
  assistantCancellationAnalysisEnabled: boolean;
  assistantReferralAnalysisEnabled: boolean;
};

export type AdminVipConfiguration = {
  id: string | null;
  key: string;

  programStatus: AdminVipProgramStatus;

  clubEnabled: boolean;
  showPreLaunchPage: boolean;
  showInPublicMenu: boolean;
  showInClientMenu: boolean;
  allowNewRegistrations: boolean;

  clubName: string;
  pointsLabel: string;
  xpLabel: string;

  logoUrl: string | null;
  iconUrl: string | null;
  bannerUrl: string | null;
  backgroundUrl: string | null;

  primaryColor: string | null;
  secondaryColor: string | null;
  accentColor: string | null;

  preLaunchTitle: string | null;
  preLaunchDescription: string | null;
  preLaunchImageUrl: string | null;
  preLaunchButtonLabel: string | null;
  preLaunchButtonUrl: string | null;

  publicTitle: string | null;
  publicDescription: string | null;
  publicImageUrl: string | null;

  termsUrl: string | null;
  privacyMessage: string | null;
  legalNotice: string | null;
  minimumAge: number | null;

  publicLeaderboardEnabled: boolean;
  leaderboardVisibility: AdminVipVisibility;
  anonymizeLeaderboard: boolean;
  leaderboardSize: number;

  baseXpMultiplier: number;
  basePointsMultiplier: number;

  pointsExpirationEnabled: boolean;
  pointsExpirationMonths: number | null;

  xpExpirationEnabled: boolean;
  xpExpirationMonths: number | null;

  rewardsExpirationEnabled: boolean;
  defaultRewardValidityDays: number | null;

  modules: AdminVipModuleConfiguration;
  notifications: AdminVipNotificationConfiguration;
  automations: AdminVipAutomationConfiguration;
  assistant: AdminVipAssistantConfiguration;

  launchedAt: string | null;
  pausedAt: string | null;
  disabledAt: string | null;

  createdAt: string | null;
  updatedAt: string | null;
};

/* -------------------------------------------------------------------------- */
/*                                 MEMBRES                                    */
/* -------------------------------------------------------------------------- */

export type AdminVipMemberLevel = {
  id: string;
  name: string;
  level: number;

  color: string | null;
  icon: string | null;
  imageUrl: string | null;

  requiredXp: number;
  requiredPoints: number;
};

export type AdminVipMember = {
  id: string;
  userId: string;

  memberNumber: string;
  referralCode: string;

  isActive: boolean;
  isSuspended: boolean;

  experience: number;
  totalExperienceEarned: number;
  experienceSpent: number;

  points: number;
  totalPointsEarned: number;
  totalPointsSpent: number;

  completedAppointments: number;
  cancelledAppointments: number;
  noShowAppointments: number;

  totalSpentCents: number;
  totalReviews: number;
  totalReferrals: number;
  totalContestEntries: number;
  totalContestWins: number;
  totalBadges: number;
  totalAchievements: number;
  totalRewardsUnlocked: number;

  loginStreak: number;
  longestLoginStreak: number;

  currentLevel: AdminVipMemberLevel | null;

  user: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    image: string | null;
    status: string;
  };

  lastExperienceEarnedAt: string | null;
  lastAppointmentAt: string | null;
  lastRewardClaimedAt: string | null;
  lastLoginAt: string | null;

  joinedAt: string;
  createdAt: string;
  updatedAt: string;
};

/* -------------------------------------------------------------------------- */
/*                                  NIVEAUX                                   */
/* -------------------------------------------------------------------------- */

export type AdminVipLevel = {
  id: string;

  name: string;
  slug: string;

  description: string | null;
  shortDescription: string | null;

  color: string | null;
  icon: string | null;
  imageUrl: string | null;
  bannerUrl: string | null;

  level: number;
  requiredXp: number;
  requiredPoints: number;

  xpMultiplier: number;
  pointsMultiplier: number;
  referralMultiplier: number;

  priorityBooking: boolean;
  vipSupport: boolean;
  exclusiveContests: boolean;
  exclusiveRewards: boolean;
  exclusiveEvents: boolean;
  freeGift: boolean;
  birthdayGift: boolean;

  permanentDiscountPercent: number | null;

  status: AdminVipLevelStatus;
  visible: boolean;
  isDefault: boolean;

  sortOrder: number;

  memberCount: number;

  createdAt: string;
  updatedAt: string;
};

/* -------------------------------------------------------------------------- */
/*                               RÉCOMPENSES                                  */
/* -------------------------------------------------------------------------- */

export type AdminVipReward = {
  id: string;

  name: string;
  slug: string;

  description: string | null;
  shortDescription: string | null;

  type: AdminVipRewardType;

  icon: string | null;
  imageUrl: string | null;
  bannerUrl: string | null;
  color: string | null;

  fixedAmountCents: number | null;
  percentage: number | null;
  loyaltyPoints: number | null;
  experiencePoints: number | null;
  freeServiceId: string | null;
  quantity: number | null;

  minimumLevelId: string | null;
  minimumPoints: number | null;
  minimumXp: number | null;

  validForDays: number | null;
  startsAt: string | null;
  endsAt: string | null;

  unlimitedStock: boolean;
  stock: number | null;
  remainingStock: number | null;

  status: AdminVipRewardStatus;
  visible: boolean;
  featured: boolean;
  repeatable: boolean;

  sortOrder: number;

  unlockedCount: number;

  createdAt: string;
  updatedAt: string;
};

/* -------------------------------------------------------------------------- */
/*                               TRANSACTIONS                                 */
/* -------------------------------------------------------------------------- */

export type AdminVipTransaction = {
  id: string;

  type: AdminLoyaltyTransactionType;
  source: AdminLoyaltyTransactionSource;

  xpAmount: number;
  pointsAmount: number;

  xpBalanceAfter: number;
  pointsBalanceAfter: number;

  title: string;
  description: string | null;

  actorId: string | null;
  actorName: string | null;

  appointmentReference: string | null;
  contestReference: string | null;
  rewardReference: string | null;
  challengeReference: string | null;

  isReversed: boolean;

  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    image: string | null;
  };

  createdAt: string;
};

/* -------------------------------------------------------------------------- */
/*                               STATISTIQUES                                 */
/* -------------------------------------------------------------------------- */

export type AdminVipMetrics = {
  totalMembers: number;
  activeMembers: number;
  suspendedMembers: number;
  newMembersThisMonth: number;

  totalPointsInCirculation: number;
  totalExperienceInCirculation: number;

  pointsEarnedThisMonth: number;
  pointsSpentThisMonth: number;

  xpEarnedThisMonth: number;
  xpSpentThisMonth: number;

  activeLevels: number;
  activeRewards: number;
  availableClientRewards: number;

  completedChallenges: number;
  unlockedBadges: number;

  totalReferrals: number;
  totalContestEntries: number;
  totalContestWins: number;
};

/* -------------------------------------------------------------------------- */
/*                               CLASSEMENT                                   */
/* -------------------------------------------------------------------------- */

export type AdminVipLeaderboardEntry = {
  rank: number;

  accountId: string;
  userId: string;

  displayName: string;
  image: string | null;

  points: number;
  experience: number;

  completedAppointments: number;
  totalSpentCents: number;

  currentLevel: {
    name: string;
    level: number;
    color: string | null;
  } | null;
};

/* -------------------------------------------------------------------------- */
/*                               ALERTES VIP                                  */
/* -------------------------------------------------------------------------- */

export type AdminVipAlertTone =
  | "ROSE"
  | "AMBER"
  | "BLUE"
  | "VIOLET"
  | "EMERALD";

export type AdminVipAlert = {
  id: string;

  title: string;
  description: string;

  count: number | null;

  href: string;
  tone: AdminVipAlertTone;
};

/* -------------------------------------------------------------------------- */
/*                          DONNÉES DU DASHBOARD                              */
/* -------------------------------------------------------------------------- */

export type AdminVipDashboardData = {
  generatedAt: string;

  configuration: AdminVipConfiguration;

  metrics: AdminVipMetrics;

  alerts: AdminVipAlert[];

  recentMembers: AdminVipMember[];
  topMembers: AdminVipLeaderboardEntry[];

  levels: AdminVipLevel[];
  rewards: AdminVipReward[];

  recentTransactions: AdminVipTransaction[];
};

/* -------------------------------------------------------------------------- */
/*                           AJUSTEMENT MANUEL                                */
/* -------------------------------------------------------------------------- */

export type AdminVipAdjustmentType =
  | "ADD"
  | "REMOVE"
  | "SET";

export type AdminVipAdjustmentInput = {
  accountId: string;

  adjustmentType: AdminVipAdjustmentType;

  points: number;
  experience: number;

  title: string;
  reason: string;
};

export type AdminVipActionState = {
  success: boolean;
  message: string;

  fieldErrors?: Record<
    string,
    string[]
  >;
};
