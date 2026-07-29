import type {
  Prisma,
} from "@/generated/prisma/client";

import type {
  AdminVipAlert,
  AdminVipConfiguration,
  AdminVipDashboardData,
  AdminVipLeaderboardEntry,
  AdminVipLevel,
  AdminVipMember,
  AdminVipReward,
  AdminVipTransaction,
} from "@/features/admin/vip/types/admin-vip.types";

import {
  prisma,
} from "@/lib/prisma";

/* -------------------------------------------------------------------------- */
/*                                CONSTANTES                                  */
/* -------------------------------------------------------------------------- */

const DEFAULT_CONFIGURATION_KEY =
  "default";

const RECENT_MEMBERS_LIMIT =
  8;

const LEADERBOARD_LIMIT =
  10;

const RECENT_TRANSACTIONS_LIMIT =
  12;

const REWARDS_LIMIT =
  12;

/* -------------------------------------------------------------------------- */
/*                            SÉLECTIONS PRISMA                               */
/* -------------------------------------------------------------------------- */

const vipMemberSelect = {
  id: true,
  userId: true,

  memberNumber: true,
  referralCode: true,

  isActive: true,
  isSuspended: true,

  experience: true,
  totalExperienceEarned: true,
  experienceSpent: true,

  points: true,
  totalPointsEarned: true,
  totalPointsSpent: true,

  completedAppointments: true,
  cancelledAppointments: true,
  noShowAppointments: true,

  totalSpentCents: true,
  totalReviews: true,
  totalReferrals: true,
  totalContestEntries: true,
  totalContestWins: true,
  totalBadges: true,
  totalAchievements: true,
  totalRewardsUnlocked: true,

  loginStreak: true,
  longestLoginStreak: true,

  lastExperienceEarnedAt: true,
  lastAppointmentAt: true,
  lastRewardClaimedAt: true,
  lastLoginAt: true,

  joinedAt: true,
  createdAt: true,
  updatedAt: true,

  currentLevel: {
    select: {
      id: true,
      name: true,
      level: true,
      color: true,
      icon: true,
      imageUrl: true,
      requiredXp: true,
      requiredPoints: true,
    },
  },

  user: {
    select: {
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      image: true,
      status: true,
    },
  },
} satisfies Prisma.LoyaltyAccountSelect;

const vipLevelSelect = {
  id: true,

  name: true,
  slug: true,

  description: true,
  shortDescription: true,

  color: true,
  icon: true,
  imageUrl: true,
  bannerUrl: true,

  level: true,
  requiredXp: true,
  requiredPoints: true,

  xpMultiplier: true,
  pointsMultiplier: true,
  referralMultiplier: true,

  priorityBooking: true,
  vipSupport: true,
  exclusiveContests: true,
  exclusiveRewards: true,
  exclusiveEvents: true,
  freeGift: true,
  birthdayGift: true,

  permanentDiscountPercent: true,

  status: true,
  visible: true,
  isDefault: true,

  sortOrder: true,

  createdAt: true,
  updatedAt: true,

  _count: {
    select: {
      accounts: true,
    },
  },
} satisfies Prisma.LoyaltyLevelSelect;

const vipRewardSelect = {
  id: true,

  name: true,
  slug: true,

  description: true,
  shortDescription: true,

  type: true,

  icon: true,
  imageUrl: true,
  bannerUrl: true,
  color: true,

  fixedAmountCents: true,
  percentage: true,
  loyaltyPoints: true,
  experiencePoints: true,
  freeServiceId: true,
  quantity: true,

  minimumLevelId: true,
  minimumPoints: true,
  minimumXp: true,

  validForDays: true,
  startsAt: true,
  endsAt: true,

  unlimitedStock: true,
  stock: true,
  remainingStock: true,

  status: true,
  visible: true,
  featured: true,
  repeatable: true,

  sortOrder: true,

  createdAt: true,
  updatedAt: true,

  _count: {
    select: {
      clientRewards: true,
    },
  },
} satisfies Prisma.VipRewardSelect;

const vipTransactionSelect = {
  id: true,

  type: true,
  source: true,

  xpAmount: true,
  pointsAmount: true,

  xpBalanceAfter: true,
  pointsBalanceAfter: true,

  title: true,
  description: true,

  actorId: true,
  actorName: true,

  appointmentReference: true,
  contestReference: true,
  rewardReference: true,
  challengeReference: true,

  isReversed: true,

  createdAt: true,

  user: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      image: true,
    },
  },
} satisfies Prisma.LoyaltyTransactionSelect;

/* -------------------------------------------------------------------------- */
/*                              TYPES PRISMA                                  */
/* -------------------------------------------------------------------------- */

type VipConfigurationRow =
  Prisma.VipConfigurationGetPayload<
    Prisma.VipConfigurationDefaultArgs
  >;

type VipMemberRow =
  Prisma.LoyaltyAccountGetPayload<{
    select: typeof vipMemberSelect;
  }>;

type VipLevelRow =
  Prisma.LoyaltyLevelGetPayload<{
    select: typeof vipLevelSelect;
  }>;

type VipRewardRow =
  Prisma.VipRewardGetPayload<{
    select: typeof vipRewardSelect;
  }>;

type VipTransactionRow =
  Prisma.LoyaltyTransactionGetPayload<{
    select: typeof vipTransactionSelect;
  }>;

/* -------------------------------------------------------------------------- */
/*                              OUTILS DE DATES                               */
/* -------------------------------------------------------------------------- */

function toIsoString(
  value: Date | null,
): string | null {
  return value
    ? value.toISOString()
    : null;
}

function getMonthStart(
  now: Date,
): Date {
  return new Date(
    now.getFullYear(),
    now.getMonth(),
    1,
    0,
    0,
    0,
    0,
  );
}

function getMonthEnd(
  now: Date,
): Date {
  return new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    1,
    0,
    0,
    0,
    0,
  );
}

/* -------------------------------------------------------------------------- */
/*                         CONFIGURATION PAR DÉFAUT                           */
/* -------------------------------------------------------------------------- */

function getDefaultVipConfiguration():
  AdminVipConfiguration {
  return {
    id: null,
    key:
      DEFAULT_CONFIGURATION_KEY,

    programStatus:
      "DISABLED",

    clubEnabled:
      false,

    showPreLaunchPage:
      false,

    showInPublicMenu:
      false,

    showInClientMenu:
      false,

    allowNewRegistrations:
      false,

    clubName:
      "Club VIP Le Palais des Ongles",

    pointsLabel:
      "Points",

    xpLabel:
      "XP",

    logoUrl:
      null,

    iconUrl:
      null,

    bannerUrl:
      null,

    backgroundUrl:
      null,

    primaryColor:
      null,

    secondaryColor:
      null,

    accentColor:
      null,

    preLaunchTitle:
      null,

    preLaunchDescription:
      null,

    preLaunchImageUrl:
      null,

    preLaunchButtonLabel:
      null,

    preLaunchButtonUrl:
      null,

    publicTitle:
      null,

    publicDescription:
      null,

    publicImageUrl:
      null,

    termsUrl:
      null,

    privacyMessage:
      null,

    legalNotice:
      null,

    minimumAge:
      null,

    publicLeaderboardEnabled:
      false,

    leaderboardVisibility:
      "MEMBERS_ONLY",

    anonymizeLeaderboard:
      true,

    leaderboardSize:
      20,

    baseXpMultiplier:
      1,

    basePointsMultiplier:
      1,

    pointsExpirationEnabled:
      false,

    pointsExpirationMonths:
      null,

    xpExpirationEnabled:
      false,

    xpExpirationMonths:
      null,

    rewardsExpirationEnabled:
      false,

    defaultRewardValidityDays:
      null,

    modules: {
      xpEnabled:
        false,

      levelsEnabled:
        false,

      badgesEnabled:
        false,

      achievementsEnabled:
        false,

      rewardsEnabled:
        false,

      contestsEnabled:
        false,

      challengesEnabled:
        false,

      referralsEnabled:
        false,

      teamsEnabled:
        false,

      collectionsEnabled:
        false,

      seasonPassEnabled:
        false,

      vipShopEnabled:
        false,

      dailyWheelEnabled:
        false,

      giftChestsEnabled:
        false,

      giftingEnabled:
        false,
    },

    notifications: {
      notificationsEnabled:
        false,

      notifyOnXpEarned:
        false,

      notifyOnLevelUp:
        false,

      notifyOnBadgeUnlocked:
        false,

      notifyOnAchievement:
        false,

      notifyOnRewardUnlocked:
        false,

      notifyOnContestUpdate:
        false,

      notifyOnRankingChange:
        false,

      notifyOnSeasonProgress:
        false,

      notifyOnReferralQualified:
        false,

      notifyOnRewardExpiration:
        false,
    },

    automations: {
      automaticRulesEnabled:
        false,

      automaticBirthdayRewardsEnabled:
        false,

      automaticAnniversaryRewardsEnabled:
        false,

      automaticInactiveClientRules:
        false,

      automaticSeasonActivationEnabled:
        false,

      automaticContestActivationEnabled:
        false,
    },

    assistant: {
      assistantEnabled:
        false,

      assistantMode:
        "DISABLED",

      assistantPlanningAnalysisEnabled:
        false,

      assistantRetentionAnalysisEnabled:
        false,

      assistantContestAnalysisEnabled:
        false,

      assistantRevenueAnalysisEnabled:
        false,

      assistantCancellationAnalysisEnabled:
        false,

      assistantReferralAnalysisEnabled:
        false,
    },

    launchedAt:
      null,

    pausedAt:
      null,

    disabledAt:
      null,

    createdAt:
      null,

    updatedAt:
      null,
  };
}

/* -------------------------------------------------------------------------- */
/*                         SÉRIALISATION CONFIGURATION                        */
/* -------------------------------------------------------------------------- */

function serializeConfiguration(
  configuration:
    | VipConfigurationRow
    | null,
): AdminVipConfiguration {
  if (!configuration) {
    return getDefaultVipConfiguration();
  }

  return {
    id:
      configuration.id,

    key:
      configuration.key,

    programStatus:
      configuration.programStatus,

    clubEnabled:
      configuration.clubEnabled,

    showPreLaunchPage:
      configuration.showPreLaunchPage,

    showInPublicMenu:
      configuration.showInPublicMenu,

    showInClientMenu:
      configuration.showInClientMenu,

    allowNewRegistrations:
      configuration.allowNewRegistrations,

    clubName:
      configuration.clubName,

    pointsLabel:
      configuration.pointsLabel,

    xpLabel:
      configuration.xpLabel,

    logoUrl:
      configuration.logoUrl,

    iconUrl:
      configuration.iconUrl,

    bannerUrl:
      configuration.bannerUrl,

    backgroundUrl:
      configuration.backgroundUrl,

    primaryColor:
      configuration.primaryColor,

    secondaryColor:
      configuration.secondaryColor,

    accentColor:
      configuration.accentColor,

    preLaunchTitle:
      configuration.preLaunchTitle,

    preLaunchDescription:
      configuration.preLaunchDescription,

    preLaunchImageUrl:
      configuration.preLaunchImageUrl,

    preLaunchButtonLabel:
      configuration.preLaunchButtonLabel,

    preLaunchButtonUrl:
      configuration.preLaunchButtonUrl,

    publicTitle:
      configuration.publicTitle,

    publicDescription:
      configuration.publicDescription,

    publicImageUrl:
      configuration.publicImageUrl,

    termsUrl:
      configuration.termsUrl,

    privacyMessage:
      configuration.privacyMessage,

    legalNotice:
      configuration.legalNotice,

    minimumAge:
      configuration.minimumAge,

    publicLeaderboardEnabled:
      configuration.publicLeaderboardEnabled,

    leaderboardVisibility:
      configuration.leaderboardVisibility,

    anonymizeLeaderboard:
      configuration.anonymizeLeaderboard,

    leaderboardSize:
      configuration.leaderboardSize,

    baseXpMultiplier:
      Number(
        configuration.baseXpMultiplier,
      ),

    basePointsMultiplier:
      Number(
        configuration.basePointsMultiplier,
      ),

    pointsExpirationEnabled:
      configuration.pointsExpirationEnabled,

    pointsExpirationMonths:
      configuration.pointsExpirationMonths,

    xpExpirationEnabled:
      configuration.xpExpirationEnabled,

    xpExpirationMonths:
      configuration.xpExpirationMonths,

    rewardsExpirationEnabled:
      configuration.rewardsExpirationEnabled,

    defaultRewardValidityDays:
      configuration.defaultRewardValidityDays,

    modules: {
      xpEnabled:
        configuration.xpEnabled,

      levelsEnabled:
        configuration.levelsEnabled,

      badgesEnabled:
        configuration.badgesEnabled,

      achievementsEnabled:
        configuration.achievementsEnabled,

      rewardsEnabled:
        configuration.rewardsEnabled,

      contestsEnabled:
        configuration.contestsEnabled,

      challengesEnabled:
        configuration.challengesEnabled,

      referralsEnabled:
        configuration.referralsEnabled,

      teamsEnabled:
        configuration.teamsEnabled,

      collectionsEnabled:
        configuration.collectionsEnabled,

      seasonPassEnabled:
        configuration.seasonPassEnabled,

      vipShopEnabled:
        configuration.vipShopEnabled,

      dailyWheelEnabled:
        configuration.dailyWheelEnabled,

      giftChestsEnabled:
        configuration.giftChestsEnabled,

      giftingEnabled:
        configuration.giftingEnabled,
    },

    notifications: {
      notificationsEnabled:
        configuration.notificationsEnabled,

      notifyOnXpEarned:
        configuration.notifyOnXpEarned,

      notifyOnLevelUp:
        configuration.notifyOnLevelUp,

      notifyOnBadgeUnlocked:
        configuration.notifyOnBadgeUnlocked,

      notifyOnAchievement:
        configuration.notifyOnAchievement,

      notifyOnRewardUnlocked:
        configuration.notifyOnRewardUnlocked,

      notifyOnContestUpdate:
        configuration.notifyOnContestUpdate,

      notifyOnRankingChange:
        configuration.notifyOnRankingChange,

      notifyOnSeasonProgress:
        configuration.notifyOnSeasonProgress,

      notifyOnReferralQualified:
        configuration.notifyOnReferralQualified,

      notifyOnRewardExpiration:
        configuration.notifyOnRewardExpiration,
    },

    automations: {
      automaticRulesEnabled:
        configuration.automaticRulesEnabled,

      automaticBirthdayRewardsEnabled:
        configuration.automaticBirthdayRewardsEnabled,

      automaticAnniversaryRewardsEnabled:
        configuration.automaticAnniversaryRewardsEnabled,

      automaticInactiveClientRules:
        configuration.automaticInactiveClientRules,

      automaticSeasonActivationEnabled:
        configuration.automaticSeasonActivationEnabled,

      automaticContestActivationEnabled:
        configuration.automaticContestActivationEnabled,
    },

    assistant: {
      assistantEnabled:
        configuration.assistantEnabled,

      assistantMode:
        configuration.assistantMode,

      assistantPlanningAnalysisEnabled:
        configuration.assistantPlanningAnalysisEnabled,

      assistantRetentionAnalysisEnabled:
        configuration.assistantRetentionAnalysisEnabled,

      assistantContestAnalysisEnabled:
        configuration.assistantContestAnalysisEnabled,

      assistantRevenueAnalysisEnabled:
        configuration.assistantRevenueAnalysisEnabled,

      assistantCancellationAnalysisEnabled:
        configuration.assistantCancellationAnalysisEnabled,

      assistantReferralAnalysisEnabled:
        configuration.assistantReferralAnalysisEnabled,
    },

    launchedAt:
      toIsoString(
        configuration.launchedAt,
      ),

    pausedAt:
      toIsoString(
        configuration.pausedAt,
      ),

    disabledAt:
      toIsoString(
        configuration.disabledAt,
      ),

    createdAt:
      configuration.createdAt.toISOString(),

    updatedAt:
      configuration.updatedAt.toISOString(),
  };
}

/* -------------------------------------------------------------------------- */
/*                           SÉRIALISATION MEMBRES                            */
/* -------------------------------------------------------------------------- */

function serializeMember(
  member: VipMemberRow,
): AdminVipMember {
  return {
    id:
      member.id,

    userId:
      member.userId,

    memberNumber:
      member.memberNumber,

    referralCode:
      member.referralCode,

    isActive:
      member.isActive,

    isSuspended:
      member.isSuspended,

    experience:
      member.experience,

    totalExperienceEarned:
      member.totalExperienceEarned,

    experienceSpent:
      member.experienceSpent,

    points:
      member.points,

    totalPointsEarned:
      member.totalPointsEarned,

    totalPointsSpent:
      member.totalPointsSpent,

    completedAppointments:
      member.completedAppointments,

    cancelledAppointments:
      member.cancelledAppointments,

    noShowAppointments:
      member.noShowAppointments,

    totalSpentCents:
      member.totalSpentCents,

    totalReviews:
      member.totalReviews,

    totalReferrals:
      member.totalReferrals,

    totalContestEntries:
      member.totalContestEntries,

    totalContestWins:
      member.totalContestWins,

    totalBadges:
      member.totalBadges,

    totalAchievements:
      member.totalAchievements,

    totalRewardsUnlocked:
      member.totalRewardsUnlocked,

    loginStreak:
      member.loginStreak,

    longestLoginStreak:
      member.longestLoginStreak,

    currentLevel:
      member.currentLevel
        ? {
            id:
              member.currentLevel.id,

            name:
              member.currentLevel.name,

            level:
              member.currentLevel.level,

            color:
              member.currentLevel.color,

            icon:
              member.currentLevel.icon,

            imageUrl:
              member.currentLevel.imageUrl,

            requiredXp:
              member.currentLevel.requiredXp,

            requiredPoints:
              member.currentLevel.requiredPoints,
          }
        : null,

    user: {
      firstName:
        member.user.firstName,

      lastName:
        member.user.lastName,

      email:
        member.user.email,

      phone:
        member.user.phone,

      image:
        member.user.image,

      status:
        member.user.status,
    },

    lastExperienceEarnedAt:
      toIsoString(
        member.lastExperienceEarnedAt,
      ),

    lastAppointmentAt:
      toIsoString(
        member.lastAppointmentAt,
      ),

    lastRewardClaimedAt:
      toIsoString(
        member.lastRewardClaimedAt,
      ),

    lastLoginAt:
      toIsoString(
        member.lastLoginAt,
      ),

    joinedAt:
      member.joinedAt.toISOString(),

    createdAt:
      member.createdAt.toISOString(),

    updatedAt:
      member.updatedAt.toISOString(),
  };
}

/* -------------------------------------------------------------------------- */
/*                           SÉRIALISATION NIVEAUX                            */
/* -------------------------------------------------------------------------- */

function serializeLevel(
  level: VipLevelRow,
): AdminVipLevel {
  return {
    id:
      level.id,

    name:
      level.name,

    slug:
      level.slug,

    description:
      level.description,

    shortDescription:
      level.shortDescription,

    color:
      level.color,

    icon:
      level.icon,

    imageUrl:
      level.imageUrl,

    bannerUrl:
      level.bannerUrl,

    level:
      level.level,

    requiredXp:
      level.requiredXp,

    requiredPoints:
      level.requiredPoints,

    xpMultiplier:
      Number(
        level.xpMultiplier,
      ),

    pointsMultiplier:
      Number(
        level.pointsMultiplier,
      ),

    referralMultiplier:
      Number(
        level.referralMultiplier,
      ),

    priorityBooking:
      level.priorityBooking,

    vipSupport:
      level.vipSupport,

    exclusiveContests:
      level.exclusiveContests,

    exclusiveRewards:
      level.exclusiveRewards,

    exclusiveEvents:
      level.exclusiveEvents,

    freeGift:
      level.freeGift,

    birthdayGift:
      level.birthdayGift,

    permanentDiscountPercent:
      level.permanentDiscountPercent,

    status:
      level.status,

    visible:
      level.visible,

    isDefault:
      level.isDefault,

    sortOrder:
      level.sortOrder,

    memberCount:
      level._count.accounts,

    createdAt:
      level.createdAt.toISOString(),

    updatedAt:
      level.updatedAt.toISOString(),
  };
}

/* -------------------------------------------------------------------------- */
/*                         SÉRIALISATION RÉCOMPENSES                          */
/* -------------------------------------------------------------------------- */

function serializeReward(
  reward: VipRewardRow,
): AdminVipReward {
  return {
    id:
      reward.id,

    name:
      reward.name,

    slug:
      reward.slug,

    description:
      reward.description,

    shortDescription:
      reward.shortDescription,

    type:
      reward.type,

    icon:
      reward.icon,

    imageUrl:
      reward.imageUrl,

    bannerUrl:
      reward.bannerUrl,

    color:
      reward.color,

    fixedAmountCents:
      reward.fixedAmountCents,

    percentage:
      reward.percentage,

    loyaltyPoints:
      reward.loyaltyPoints,

    experiencePoints:
      reward.experiencePoints,

    freeServiceId:
      reward.freeServiceId,

    quantity:
      reward.quantity,

    minimumLevelId:
      reward.minimumLevelId,

    minimumPoints:
      reward.minimumPoints,

    minimumXp:
      reward.minimumXp,

    validForDays:
      reward.validForDays,

    startsAt:
      toIsoString(
        reward.startsAt,
      ),

    endsAt:
      toIsoString(
        reward.endsAt,
      ),

    unlimitedStock:
      reward.unlimitedStock,

    stock:
      reward.stock,

    remainingStock:
      reward.remainingStock,

    status:
      reward.status,

    visible:
      reward.visible,

    featured:
      reward.featured,

    repeatable:
      reward.repeatable,

    sortOrder:
      reward.sortOrder,

    unlockedCount:
      reward._count.clientRewards,

    createdAt:
      reward.createdAt.toISOString(),

    updatedAt:
      reward.updatedAt.toISOString(),
  };
}

/* -------------------------------------------------------------------------- */
/*                         SÉRIALISATION TRANSACTIONS                         */
/* -------------------------------------------------------------------------- */

function serializeTransaction(
  transaction: VipTransactionRow,
): AdminVipTransaction {
  return {
    id:
      transaction.id,

    type:
      transaction.type,

    source:
      transaction.source,

    xpAmount:
      transaction.xpAmount,

    pointsAmount:
      transaction.pointsAmount,

    xpBalanceAfter:
      transaction.xpBalanceAfter,

    pointsBalanceAfter:
      transaction.pointsBalanceAfter,

    title:
      transaction.title,

    description:
      transaction.description,

    actorId:
      transaction.actorId,

    actorName:
      transaction.actorName,

    appointmentReference:
      transaction.appointmentReference,

    contestReference:
      transaction.contestReference,

    rewardReference:
      transaction.rewardReference,

    challengeReference:
      transaction.challengeReference,

    isReversed:
      transaction.isReversed,

    user: {
      id:
        transaction.user.id,

      firstName:
        transaction.user.firstName,

      lastName:
        transaction.user.lastName,

      email:
        transaction.user.email,

      image:
        transaction.user.image,
    },

    createdAt:
      transaction.createdAt.toISOString(),
  };
}

/* -------------------------------------------------------------------------- */
/*                             CLASSEMENT VIP                                 */
/* -------------------------------------------------------------------------- */

function serializeLeaderboard(
  members: VipMemberRow[],
): AdminVipLeaderboardEntry[] {
  return members.map(
    (
      member,
      index,
    ) => ({
      rank:
        index + 1,

      accountId:
        member.id,

      userId:
        member.userId,

      displayName:
        [
          member.user.firstName,
          member.user.lastName,
        ]
          .filter(Boolean)
          .join(" ")
          .trim() ||
        member.user.email,

      image:
        member.user.image,

      points:
        member.points,

      experience:
        member.experience,

      completedAppointments:
        member.completedAppointments,

      totalSpentCents:
        member.totalSpentCents,

      currentLevel:
        member.currentLevel
          ? {
              name:
                member.currentLevel.name,

              level:
                member.currentLevel.level,

              color:
                member.currentLevel.color,
            }
          : null,
    }),
  );
}

/* -------------------------------------------------------------------------- */
/*                                  ALERTES                                   */
/* -------------------------------------------------------------------------- */

function buildVipAlerts(
  input: {
    configuration: AdminVipConfiguration;
    totalMembers: number;
    activeLevels: number;
    activeRewards: number;
  },
): AdminVipAlert[] {
  const alerts: AdminVipAlert[] =
    [];

  if (
    input.configuration
      .programStatus ===
      "DISABLED"
  ) {
    alerts.push({
      id:
        "VIP_PROGRAM_DISABLED",

      title:
        "Programme fidélité désactivé",

      description:
        "Le Club VIP n’est pas encore accessible aux clientes.",

      count:
        null,

      href:
        "/admin/fidelite#configuration",

      tone:
        "AMBER",
    });
  }

  if (
    input.configuration
      .programStatus ===
      "ACTIVE" &&
    !input.configuration
      .allowNewRegistrations
  ) {
    alerts.push({
      id:
        "VIP_REGISTRATIONS_DISABLED",

      title:
        "Inscriptions VIP fermées",

      description:
        "Le programme est actif mais les nouvelles inscriptions sont bloquées.",

      count:
        null,

      href:
        "/admin/fidelite#configuration",

      tone:
        "ROSE",
    });
  }

  if (
    input.activeLevels === 0
  ) {
    alerts.push({
      id:
        "VIP_LEVELS_EMPTY",

      title:
        "Aucun niveau actif",

      description:
        "Créez au moins un niveau de fidélité avant le lancement du programme.",

      count:
        0,

      href:
        "/admin/fidelite#niveaux",

      tone:
        "VIOLET",
    });
  }

  if (
    input.activeRewards === 0
  ) {
    alerts.push({
      id:
        "VIP_REWARDS_EMPTY",

      title:
        "Aucune récompense active",

      description:
        "Ajoutez des récompenses pour rendre le programme fidélité attractif.",

      count:
        0,

      href:
        "/admin/fidelite#recompenses",

      tone:
        "BLUE",
    });
  }

  if (
    input.configuration
      .programStatus ===
      "ACTIVE" &&
    input.totalMembers === 0
  ) {
    alerts.push({
      id:
        "VIP_NO_MEMBERS",

      title:
        "Aucun membre inscrit",

      description:
        "Le programme est actif mais aucun compte fidélité n’a encore été créé.",

      count:
        0,

      href:
        "/admin/fidelite#membres",

      tone:
        "EMERALD",
    });
  }

  return alerts;
}

/* -------------------------------------------------------------------------- */
/*                                  SERVICE                                   */
/* -------------------------------------------------------------------------- */

export async function getAdminVipDashboardData():
  Promise<AdminVipDashboardData> {
  const now =
    new Date();

  const monthStart =
    getMonthStart(
      now,
    );

  const monthEnd =
    getMonthEnd(
      now,
    );

  const [
    configurationRow,

    totalMembers,
    activeMembers,
    suspendedMembers,
    newMembersThisMonth,

    accountBalances,

    positivePointsThisMonth,
    negativePointsThisMonth,
    positiveXpThisMonth,
    negativeXpThisMonth,

    activeLevels,
    activeRewards,
    availableClientRewards,

    completedChallenges,
    unlockedBadges,

    recentMembersRows,
    topMembersRows,

    levelRows,
    rewardRows,

    recentTransactionRows,
  ] = await prisma.$transaction([
    prisma.vipConfiguration.findUnique({
      where: {
        key:
          DEFAULT_CONFIGURATION_KEY,
      },
    }),

    prisma.loyaltyAccount.count(),

    prisma.loyaltyAccount.count({
      where: {
        isActive:
          true,

        isSuspended:
          false,

        user: {
          status:
            "ACTIVE",
        },
      },
    }),

    prisma.loyaltyAccount.count({
      where: {
        isSuspended:
          true,
      },
    }),

    prisma.loyaltyAccount.count({
      where: {
        joinedAt: {
          gte:
            monthStart,

          lt:
            monthEnd,
        },
      },
    }),

    prisma.loyaltyAccount.aggregate({
      _sum: {
        points:
          true,

        experience:
          true,

        totalReferrals:
          true,

        totalContestEntries:
          true,

        totalContestWins:
          true,
      },
    }),

    prisma.loyaltyTransaction.aggregate({
      where: {
        createdAt: {
          gte:
            monthStart,

          lt:
            monthEnd,
        },

        isReversed:
          false,

        pointsAmount: {
          gt:
            0,
        },
      },

      _sum: {
        pointsAmount:
          true,
      },
    }),

    prisma.loyaltyTransaction.aggregate({
      where: {
        createdAt: {
          gte:
            monthStart,

          lt:
            monthEnd,
        },

        isReversed:
          false,

        pointsAmount: {
          lt:
            0,
        },
      },

      _sum: {
        pointsAmount:
          true,
      },
    }),

    prisma.loyaltyTransaction.aggregate({
      where: {
        createdAt: {
          gte:
            monthStart,

          lt:
            monthEnd,
        },

        isReversed:
          false,

        xpAmount: {
          gt:
            0,
        },
      },

      _sum: {
        xpAmount:
          true,
      },
    }),

    prisma.loyaltyTransaction.aggregate({
      where: {
        createdAt: {
          gte:
            monthStart,

          lt:
            monthEnd,
        },

        isReversed:
          false,

        xpAmount: {
          lt:
            0,
        },
      },

      _sum: {
        xpAmount:
          true,
      },
    }),

    prisma.loyaltyLevel.count({
      where: {
        status:
          "ACTIVE",
      },
    }),

    prisma.vipReward.count({
      where: {
        status:
          "ACTIVE",
      },
    }),

    prisma.clientReward.count({
      where: {
        status:
          "AVAILABLE",

        OR: [
          {
            expiresAt:
              null,
          },
          {
            expiresAt: {
              gt:
                now,
            },
          },
        ],
      },
    }),

    prisma.clientChallenge.count({
      where: {
        completedAt: {
          not:
            null,
        },
      },
    }),

    prisma.clientBadge.count({
      where: {
        unlockedAt: {
          not:
            null,
        },
      },
    }),

    prisma.loyaltyAccount.findMany({
      orderBy: {
        joinedAt:
          "desc",
      },

      take:
        RECENT_MEMBERS_LIMIT,

      select:
        vipMemberSelect,
    }),

    prisma.loyaltyAccount.findMany({
      where: {
        isActive:
          true,

        isSuspended:
          false,
      },

      orderBy: [
        {
          points:
            "desc",
        },
        {
          experience:
            "desc",
        },
        {
          joinedAt:
            "asc",
        },
      ],

      take:
        LEADERBOARD_LIMIT,

      select:
        vipMemberSelect,
    }),

    prisma.loyaltyLevel.findMany({
      orderBy: [
        {
          sortOrder:
            "asc",
        },
        {
          level:
            "asc",
        },
      ],

      select:
        vipLevelSelect,
    }),

    prisma.vipReward.findMany({
      orderBy: [
        {
          featured:
            "desc",
        },
        {
          sortOrder:
            "asc",
        },
        {
          createdAt:
            "desc",
        },
      ],

      take:
        REWARDS_LIMIT,

      select:
        vipRewardSelect,
    }),

    prisma.loyaltyTransaction.findMany({
      orderBy: {
        createdAt:
          "desc",
      },

      take:
        RECENT_TRANSACTIONS_LIMIT,

      select:
        vipTransactionSelect,
    }),
  ]);

  const configuration =
    serializeConfiguration(
      configurationRow,
    );

  const totalPointsInCirculation =
    accountBalances._sum
      .points ??
    0;

  const totalExperienceInCirculation =
    accountBalances._sum
      .experience ??
    0;

  const totalReferrals =
    accountBalances._sum
      .totalReferrals ??
    0;

  const totalContestEntries =
    accountBalances._sum
      .totalContestEntries ??
    0;

  const totalContestWins =
    accountBalances._sum
      .totalContestWins ??
    0;

  const pointsEarnedThisMonth =
    positivePointsThisMonth._sum
      .pointsAmount ??
    0;

  const pointsSpentThisMonth =
    Math.abs(
      negativePointsThisMonth._sum
        .pointsAmount ??
        0,
    );

  const xpEarnedThisMonth =
    positiveXpThisMonth._sum
      .xpAmount ??
    0;

  const xpSpentThisMonth =
    Math.abs(
      negativeXpThisMonth._sum
        .xpAmount ??
        0,
    );

  return {
    generatedAt:
      now.toISOString(),

    configuration,

    metrics: {
      totalMembers,
      activeMembers,
      suspendedMembers,
      newMembersThisMonth,

      totalPointsInCirculation,
      totalExperienceInCirculation,

      pointsEarnedThisMonth,
      pointsSpentThisMonth,

      xpEarnedThisMonth,
      xpSpentThisMonth,

      activeLevels,
      activeRewards,
      availableClientRewards,

      completedChallenges,
      unlockedBadges,

      totalReferrals,
      totalContestEntries,
      totalContestWins,
    },

    alerts:
      buildVipAlerts({
        configuration,
        totalMembers,
        activeLevels,
        activeRewards,
      }),

    recentMembers:
      recentMembersRows.map(
        serializeMember,
      ),

    topMembers:
      serializeLeaderboard(
        topMembersRows,
      ),

    levels:
      levelRows.map(
        serializeLevel,
      ),

    rewards:
      rewardRows.map(
        serializeReward,
      ),

    recentTransactions:
      recentTransactionRows.map(
        serializeTransaction,
      ),
  };
}
