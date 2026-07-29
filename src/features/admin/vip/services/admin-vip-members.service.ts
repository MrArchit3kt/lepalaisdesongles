import type {
  Prisma,
} from "@/generated/prisma/client";

import type {
  AdminVipMember,
  AdminVipMemberLevel,
  AdminVipTransaction,
} from "@/features/admin/vip/types/admin-vip.types";

import type {
  AdminVipMemberDetails,
  AdminVipMemberLevelHistory,
  AdminVipMemberLevelOption,
  AdminVipMemberReward,
  AdminVipMemberRewardOption,
  AdminVipMembersPageData,
} from "@/features/admin/vip/types/admin-vip-member.types";

import {
  prisma,
} from "@/lib/prisma";

/* -------------------------------------------------------------------------- */
/*                                CONSTANTES                                  */
/* -------------------------------------------------------------------------- */

const MEMBER_TRANSACTION_LIMIT =
  100;

const MEMBER_REWARD_LIMIT =
  100;

const MEMBER_LEVEL_HISTORY_LIMIT =
  50;

/* -------------------------------------------------------------------------- */
/*                            SÉLECTION DU NIVEAU                             */
/* -------------------------------------------------------------------------- */

const memberLevelSelect = {
  id:
    true,

  name:
    true,

  level:
    true,

  color:
    true,

  icon:
    true,

  imageUrl:
    true,

  requiredXp:
    true,

  requiredPoints:
    true,
} satisfies Prisma.LoyaltyLevelSelect;

/* -------------------------------------------------------------------------- */
/*                           SÉLECTION UTILISATEUR                            */
/* -------------------------------------------------------------------------- */

const memberUserSelect = {
  firstName:
    true,

  lastName:
    true,

  email:
    true,

  phone:
    true,

  image:
    true,

  status:
    true,
} satisfies Prisma.UserSelect;

const transactionUserSelect = {
  id:
    true,

  firstName:
    true,

  lastName:
    true,

  email:
    true,

  image:
    true,
} satisfies Prisma.UserSelect;

/* -------------------------------------------------------------------------- */
/*                            SÉLECTION DU MEMBRE                             */
/* -------------------------------------------------------------------------- */

const vipMemberSelect = {
  id:
    true,

  userId:
    true,

  memberNumber:
    true,

  referralCode:
    true,

  isActive:
    true,

  isSuspended:
    true,

  experience:
    true,

  totalExperienceEarned:
    true,

  experienceSpent:
    true,

  points:
    true,

  totalPointsEarned:
    true,

  totalPointsSpent:
    true,

  completedAppointments:
    true,

  cancelledAppointments:
    true,

  noShowAppointments:
    true,

  totalSpentCents:
    true,

  totalReviews:
    true,

  totalReferrals:
    true,

  totalContestEntries:
    true,

  totalContestWins:
    true,

  totalBadges:
    true,

  totalAchievements:
    true,

  totalRewardsUnlocked:
    true,

  loginStreak:
    true,

  longestLoginStreak:
    true,

  lastExperienceEarnedAt:
    true,

  lastAppointmentAt:
    true,

  lastRewardClaimedAt:
    true,

  lastLoginAt:
    true,

  joinedAt:
    true,

  createdAt:
    true,

  updatedAt:
    true,

  currentLevel: {
    select:
      memberLevelSelect,
  },

  user: {
    select:
      memberUserSelect,
  },
} satisfies Prisma.LoyaltyAccountSelect;

/* -------------------------------------------------------------------------- */
/*                         SÉLECTION DES TRANSACTIONS                         */
/* -------------------------------------------------------------------------- */

const memberTransactionSelect = {
  id:
    true,

  type:
    true,

  source:
    true,

  xpAmount:
    true,

  pointsAmount:
    true,

  xpBalanceAfter:
    true,

  pointsBalanceAfter:
    true,

  title:
    true,

  description:
    true,

  actorId:
    true,

  actorName:
    true,

  appointmentReference:
    true,

  contestReference:
    true,

  rewardReference:
    true,

  challengeReference:
    true,

  isReversed:
    true,

  createdAt:
    true,

  user: {
    select:
      transactionUserSelect,
  },
} satisfies Prisma.LoyaltyTransactionSelect;

/* -------------------------------------------------------------------------- */
/*                         SÉLECTION DES RÉCOMPENSES                          */
/* -------------------------------------------------------------------------- */

const memberRewardSelect = {
  id:
    true,

  userId:
    true,

  accountId:
    true,

  rewardId:
    true,

  status:
    true,

  uniqueCode:
    true,

  qrCode:
    true,

  barcode:
    true,

  usedAt:
    true,

  expiresAt:
    true,

  cancelledAt:
    true,

  giftedAt:
    true,

  reservedAt:
    true,

  appointmentId:
    true,

  transactionId:
    true,

  createdAt:
    true,

  updatedAt:
    true,

  reward: {
    select: {
      id:
        true,

      name:
        true,

      slug:
        true,

      type:
        true,

      status:
        true,

      color:
        true,

      icon:
        true,

      imageUrl:
        true,

      fixedAmountCents:
        true,

      percentage:
        true,

      loyaltyPoints:
        true,

      experiencePoints:
        true,
    },
  },
} satisfies Prisma.ClientRewardSelect;

/* -------------------------------------------------------------------------- */
/*                     SÉLECTION DE L’HISTORIQUE NIVEAU                       */
/* -------------------------------------------------------------------------- */

const memberLevelHistorySelect = {
  id:
    true,

  accountId:
    true,

  previousLevelId:
    true,

  newLevelId:
    true,

  experienceAtUpgrade:
    true,

  pointsAtUpgrade:
    true,

  upgradedAutomatically:
    true,

  reason:
    true,

  createdAt:
    true,

  previousLevel: {
    select:
      memberLevelSelect,
  },

  newLevel: {
    select:
      memberLevelSelect,
  },
} satisfies Prisma.ClientLevelHistorySelect;

/* -------------------------------------------------------------------------- */
/*                       SÉLECTION DU MEMBRE DÉTAILLÉ                         */
/* -------------------------------------------------------------------------- */

const vipMemberDetailsSelect = {
  ...vipMemberSelect,

  suspendedAt:
    true,

  levelReachedAt:
    true,

  transactions: {
    orderBy: {
      createdAt:
        "desc",
    },

    take:
      MEMBER_TRANSACTION_LIMIT,

    select:
      memberTransactionSelect,
  },

  rewards: {
    orderBy: {
      createdAt:
        "desc",
    },

    take:
      MEMBER_REWARD_LIMIT,

    select:
      memberRewardSelect,
  },

  levelHistory: {
    orderBy: {
      createdAt:
        "desc",
    },

    take:
      MEMBER_LEVEL_HISTORY_LIMIT,

    select:
      memberLevelHistorySelect,
  },
} satisfies Prisma.LoyaltyAccountSelect;

/* -------------------------------------------------------------------------- */
/*                              TYPES PRISMA                                  */
/* -------------------------------------------------------------------------- */

type VipMemberRow =
  Prisma.LoyaltyAccountGetPayload<{
    select:
      typeof vipMemberSelect;
  }>;

type VipMemberDetailsRow =
  Prisma.LoyaltyAccountGetPayload<{
    select:
      typeof vipMemberDetailsSelect;
  }>;

type TransactionRow =
  Prisma.LoyaltyTransactionGetPayload<{
    select:
      typeof memberTransactionSelect;
  }>;

type MemberRewardRow =
  Prisma.ClientRewardGetPayload<{
    select:
      typeof memberRewardSelect;
  }>;

type MemberLevelHistoryRow =
  Prisma.ClientLevelHistoryGetPayload<{
    select:
      typeof memberLevelHistorySelect;
  }>;

/* -------------------------------------------------------------------------- */
/*                              SÉRIALISATION                                 */
/* -------------------------------------------------------------------------- */

function serializeMemberLevel(
  level:
    | NonNullable<
        VipMemberRow["currentLevel"]
      >
    | MemberLevelHistoryRow["newLevel"]
    | NonNullable<
        MemberLevelHistoryRow["previousLevel"]
      >,
): AdminVipMemberLevel {
  return {
    id:
      level.id,

    name:
      level.name,

    level:
      level.level,

    color:
      level.color,

    icon:
      level.icon,

    imageUrl:
      level.imageUrl,

    requiredXp:
      level.requiredXp,

    requiredPoints:
      level.requiredPoints,
  };
}

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
        ? serializeMemberLevel(
            member.currentLevel,
          )
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
      member.lastExperienceEarnedAt
        ?.toISOString() ??
      null,

    lastAppointmentAt:
      member.lastAppointmentAt
        ?.toISOString() ??
      null,

    lastRewardClaimedAt:
      member.lastRewardClaimedAt
        ?.toISOString() ??
      null,

    lastLoginAt:
      member.lastLoginAt
        ?.toISOString() ??
      null,

    joinedAt:
      member.joinedAt.toISOString(),

    createdAt:
      member.createdAt.toISOString(),

    updatedAt:
      member.updatedAt.toISOString(),
  };
}

function serializeTransaction(
  transaction: TransactionRow,
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

function serializeMemberReward(
  clientReward: MemberRewardRow,
): AdminVipMemberReward {
  return {
    id:
      clientReward.id,

    userId:
      clientReward.userId,

    accountId:
      clientReward.accountId,

    rewardId:
      clientReward.rewardId,

    status:
      clientReward.status,

    uniqueCode:
      clientReward.uniqueCode,

    qrCode:
      clientReward.qrCode,

    barcode:
      clientReward.barcode,

    usedAt:
      clientReward.usedAt
        ?.toISOString() ??
      null,

    expiresAt:
      clientReward.expiresAt
        ?.toISOString() ??
      null,

    cancelledAt:
      clientReward.cancelledAt
        ?.toISOString() ??
      null,

    giftedAt:
      clientReward.giftedAt
        ?.toISOString() ??
      null,

    reservedAt:
      clientReward.reservedAt
        ?.toISOString() ??
      null,

    appointmentId:
      clientReward.appointmentId,

    transactionId:
      clientReward.transactionId,

    reward: {
      id:
        clientReward.reward.id,

      name:
        clientReward.reward.name,

      slug:
        clientReward.reward.slug,

      type:
        clientReward.reward.type,

      status:
        clientReward.reward.status,

      color:
        clientReward.reward.color,

      icon:
        clientReward.reward.icon,

      imageUrl:
        clientReward.reward.imageUrl,

      fixedAmountCents:
        clientReward.reward.fixedAmountCents,

      percentage:
        clientReward.reward.percentage,

      loyaltyPoints:
        clientReward.reward.loyaltyPoints,

      experiencePoints:
        clientReward.reward.experiencePoints,
    },

    createdAt:
      clientReward.createdAt.toISOString(),

    updatedAt:
      clientReward.updatedAt.toISOString(),
  };
}

function serializeLevelHistory(
  history: MemberLevelHistoryRow,
): AdminVipMemberLevelHistory {
  return {
    id:
      history.id,

    accountId:
      history.accountId,

    previousLevelId:
      history.previousLevelId,

    newLevelId:
      history.newLevelId,

    experienceAtUpgrade:
      history.experienceAtUpgrade,

    pointsAtUpgrade:
      history.pointsAtUpgrade,

    upgradedAutomatically:
      history.upgradedAutomatically,

    reason:
      history.reason,

    previousLevel:
      history.previousLevel
        ? serializeMemberLevel(
            history.previousLevel,
          )
        : null,

    newLevel:
      serializeMemberLevel(
        history.newLevel,
      ),

    createdAt:
      history.createdAt.toISOString(),
  };
}

function serializeMemberDetails(
  member: VipMemberDetailsRow,
): AdminVipMemberDetails {
  return {
    ...serializeMember(
      member,
    ),

    suspendedAt:
      member.suspendedAt
        ?.toISOString() ??
      null,

    levelReachedAt:
      member.levelReachedAt
        ?.toISOString() ??
      null,

    transactions:
      member.transactions.map(
        serializeTransaction,
      ),

    rewards:
      member.rewards.map(
        serializeMemberReward,
      ),

    levelHistory:
      member.levelHistory.map(
        serializeLevelHistory,
      ),
  };
}

/* -------------------------------------------------------------------------- */
/*                         OPTIONS DES NIVEAUX                                */
/* -------------------------------------------------------------------------- */

async function getMemberLevelOptions():
  Promise<AdminVipMemberLevelOption[]> {
  const levels =
    await prisma.loyaltyLevel.findMany({
      where: {
        status:
          "ACTIVE",
      },

      orderBy: [
        {
          level:
            "asc",
        },
        {
          sortOrder:
            "asc",
        },
      ],

      select: {
        id:
          true,

        name:
          true,

        level:
          true,

        requiredXp:
          true,

        requiredPoints:
          true,

        color:
          true,

        icon:
          true,

        isDefault:
          true,
      },
    });

  return levels.map(
    (
      level,
    ) => ({
      id:
        level.id,

      name:
        level.name,

      level:
        level.level,

      requiredXp:
        level.requiredXp,

      requiredPoints:
        level.requiredPoints,

      color:
        level.color,

      icon:
        level.icon,

      isDefault:
        level.isDefault,
    }),
  );
}

/* -------------------------------------------------------------------------- */
/*                       OPTIONS DES RÉCOMPENSES                              */
/* -------------------------------------------------------------------------- */

async function getMemberRewardOptions(
  now: Date,
): Promise<
  AdminVipMemberRewardOption[]
> {
  const rewards =
    await prisma.vipReward.findMany({
      where: {
        status:
          "ACTIVE",

        visible:
          true,

        AND: [
          {
            OR: [
              {
                startsAt:
                  null,
              },
              {
                startsAt: {
                  lte:
                    now,
                },
              },
            ],
          },
          {
            OR: [
              {
                endsAt:
                  null,
              },
              {
                endsAt: {
                  gte:
                    now,
                },
              },
            ],
          },
          {
            OR: [
              {
                unlimitedStock:
                  true,
              },
              {
                remainingStock: {
                  gt:
                    0,
                },
              },
            ],
          },
        ],
      },

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
          name:
            "asc",
        },
      ],

      select: {
        id:
          true,

        name:
          true,

        slug:
          true,

        type:
          true,

        color:
          true,

        icon:
          true,

        validForDays:
          true,

        unlimitedStock:
          true,

        remainingStock:
          true,

        repeatable:
          true,
      },
    });

  return rewards.map(
    (
      reward,
    ) => ({
      id:
        reward.id,

      name:
        reward.name,

      slug:
        reward.slug,

      type:
        reward.type,

      color:
        reward.color,

      icon:
        reward.icon,

      validForDays:
        reward.validForDays,

      unlimitedStock:
        reward.unlimitedStock,

      remainingStock:
        reward.remainingStock,

      repeatable:
        reward.repeatable,
    }),
  );
}

/* -------------------------------------------------------------------------- */
/*                       LISTE ET STATISTIQUES                                */
/* -------------------------------------------------------------------------- */

export async function getAdminVipMembersPageData():
  Promise<AdminVipMembersPageData> {
  const now =
    new Date();

  const monthStart =
    new Date(
      now.getFullYear(),
      now.getMonth(),
      1,
      0,
      0,
      0,
      0,
    );

  const [
    memberRows,
    levels,
    rewards,
    balances,
    activeMembers,
    suspendedMembers,
    inactiveMembers,
    membersWithoutLevel,
    newMembersThisMonth,
    totalRewardsAvailable,
    totalRewardsUsed,
  ] =
    await Promise.all([
      prisma.loyaltyAccount.findMany({
        orderBy: [
          {
            joinedAt:
              "desc",
          },
          {
            createdAt:
              "desc",
          },
        ],

        select:
          vipMemberSelect,
      }),

      getMemberLevelOptions(),

      getMemberRewardOptions(
        now,
      ),

      prisma.loyaltyAccount.aggregate({
        _sum: {
          points:
            true,

          experience:
            true,
        },
      }),

      prisma.loyaltyAccount.count({
        where: {
          isActive:
            true,

          isSuspended:
            false,
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
          isActive:
            false,

          isSuspended:
            false,
        },
      }),

      prisma.loyaltyAccount.count({
        where: {
          currentLevelId:
            null,
        },
      }),

      prisma.loyaltyAccount.count({
        where: {
          joinedAt: {
            gte:
              monthStart,
          },
        },
      }),

      prisma.clientReward.count({
        where: {
          status:
            "AVAILABLE",
        },
      }),

      prisma.clientReward.count({
        where: {
          status:
            "USED",
        },
      }),
    ]);

  return {
    generatedAt:
      now.toISOString(),

    metrics: {
      totalMembers:
        memberRows.length,

      activeMembers,

      suspendedMembers,

      inactiveMembers,

      membersWithoutLevel,

      totalPoints:
        balances._sum.points ??
        0,

      totalExperience:
        balances._sum.experience ??
        0,

      totalRewardsAvailable,

      totalRewardsUsed,

      newMembersThisMonth,
    },

    members:
      memberRows.map(
        serializeMember,
      ),

    levels,

    rewards,
  };
}

/* -------------------------------------------------------------------------- */
/*                         FICHE D’UN MEMBRE                                  */
/* -------------------------------------------------------------------------- */

export async function getAdminVipMemberDetails(
  accountId: string,
): Promise<AdminVipMemberDetails | null> {
  const normalizedAccountId =
    accountId.trim();

  if (
    !normalizedAccountId
  ) {
    return null;
  }

  const member =
    await prisma.loyaltyAccount.findUnique({
      where: {
        id:
          normalizedAccountId,
      },

      select:
        vipMemberDetailsSelect,
    });

  return member
    ? serializeMemberDetails(
        member,
      )
    : null;
}

/* -------------------------------------------------------------------------- */
/*                     OPTIONS DE GESTION D’UN MEMBRE                         */
/* -------------------------------------------------------------------------- */

export async function getAdminVipMemberManagementOptions():
  Promise<
    Pick<
      AdminVipMembersPageData,
      "levels" | "rewards"
    >
  > {
  const now =
    new Date();

  const [
    levels,
    rewards,
  ] =
    await Promise.all([
      getMemberLevelOptions(),

      getMemberRewardOptions(
        now,
      ),
    ]);

  return {
    levels,
    rewards,
  };
}
