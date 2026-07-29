import "server-only";

import type {
  Prisma,
} from "@/generated/prisma/client";

import type {
  ClientVipDashboardData,
  ClientVipLevel,
  ClientVipReward,
  ClientVipTransaction,
} from "@/features/vip/types/client-vip.types";

import {
  prisma,
} from "@/lib/prisma";

/* -------------------------------------------------------------------------- */
/*                                CONSTANTES                                  */
/* -------------------------------------------------------------------------- */

const CLIENT_REWARDS_LIMIT =
  50;

const CLIENT_TRANSACTIONS_LIMIT =
  40;

/* -------------------------------------------------------------------------- */
/*                                SÉLECTIONS                                  */
/* -------------------------------------------------------------------------- */

const clientLevelSelect = {
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

const clientRewardSelect = {
  id:
    true,

  status:
    true,

  uniqueCode:
    true,

  qrCode:
    true,

  barcode:
    true,

  expiresAt:
    true,

  usedAt:
    true,

  reservedAt:
    true,

  giftedAt:
    true,

  cancelledAt:
    true,

  createdAt:
    true,

  reward: {
    select: {
      id:
        true,

      name:
        true,

      slug:
        true,

      shortDescription:
        true,

      type:
        true,

      icon:
        true,

      color:
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

const clientTransactionSelect = {
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

  appointmentReference:
    true,

  contestReference:
    true,

  rewardReference:
    true,

  challengeReference:
    true,

  actorName:
    true,

  isReversed:
    true,

  createdAt:
    true,
} satisfies Prisma.LoyaltyTransactionSelect;

/* -------------------------------------------------------------------------- */
/*                              TYPES PRISMA                                  */
/* -------------------------------------------------------------------------- */

type ClientRewardRow =
  Prisma.ClientRewardGetPayload<{
    select:
      typeof clientRewardSelect;
  }>;

type ClientTransactionRow =
  Prisma.LoyaltyTransactionGetPayload<{
    select:
      typeof clientTransactionSelect;
  }>;

/* -------------------------------------------------------------------------- */
/*                                  OUTILS                                    */
/* -------------------------------------------------------------------------- */

function clampPercent(
  value: number,
): number {
  return Math.min(
    Math.max(
      Math.round(
        value,
      ),
      0,
    ),
    100,
  );
}

function serializeLevel(
  level: {
    id: string;
    name: string;
    level: number;

    color: string | null;
    icon: string | null;
    imageUrl: string | null;

    requiredXp: number;
    requiredPoints: number;
  },
): ClientVipLevel {
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

function serializeReward(
  clientReward: ClientRewardRow,
): ClientVipReward {
  return {
    id:
      clientReward.id,

    status:
      clientReward.status,

    uniqueCode:
      clientReward.uniqueCode,

    qrCode:
      clientReward.qrCode,

    barcode:
      clientReward.barcode,

    expiresAt:
      clientReward.expiresAt
        ?.toISOString() ??
      null,

    usedAt:
      clientReward.usedAt
        ?.toISOString() ??
      null,

    reservedAt:
      clientReward.reservedAt
        ?.toISOString() ??
      null,

    giftedAt:
      clientReward.giftedAt
        ?.toISOString() ??
      null,

    cancelledAt:
      clientReward.cancelledAt
        ?.toISOString() ??
      null,

    reward: {
      id:
        clientReward.reward.id,

      name:
        clientReward.reward.name,

      slug:
        clientReward.reward.slug,

      shortDescription:
        clientReward.reward
          .shortDescription,

      type:
        clientReward.reward.type,

      icon:
        clientReward.reward.icon,

      color:
        clientReward.reward.color,

      imageUrl:
        clientReward.reward.imageUrl,

      fixedAmountCents:
        clientReward.reward
          .fixedAmountCents,

      percentage:
        clientReward.reward
          .percentage,

      loyaltyPoints:
        clientReward.reward
          .loyaltyPoints,

      experiencePoints:
        clientReward.reward
          .experiencePoints,
    },

    createdAt:
      clientReward.createdAt
        .toISOString(),
  };
}

function serializeTransaction(
  transaction: ClientTransactionRow,
): ClientVipTransaction {
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

    appointmentReference:
      transaction.appointmentReference,

    contestReference:
      transaction.contestReference,

    rewardReference:
      transaction.rewardReference,

    challengeReference:
      transaction.challengeReference,

    actorName:
      transaction.actorName,

    isReversed:
      transaction.isReversed,

    createdAt:
      transaction.createdAt
        .toISOString(),
  };
}

function calculateProgress(
  input: {
    experience: number;
    points: number;

    currentLevel: ClientVipLevel | null;
    nextLevel: ClientVipLevel | null;
  },
): ClientVipDashboardData["progress"] {
  if (
    !input.nextLevel
  ) {
    return {
      xpPercent:
        100,

      pointsPercent:
        100,

      remainingXp:
        0,

      remainingPoints:
        0,
    };
  }

  const currentXpRequirement =
    input.currentLevel
      ?.requiredXp ??
    0;

  const currentPointsRequirement =
    input.currentLevel
      ?.requiredPoints ??
    0;

  const xpRange =
    Math.max(
      input.nextLevel
        .requiredXp -
        currentXpRequirement,
      1,
    );

  const pointsRange =
    Math.max(
      input.nextLevel
        .requiredPoints -
        currentPointsRequirement,
      1,
    );

  const earnedXpInLevel =
    Math.max(
      input.experience -
        currentXpRequirement,
      0,
    );

  const earnedPointsInLevel =
    Math.max(
      input.points -
        currentPointsRequirement,
      0,
    );

  return {
    xpPercent:
      clampPercent(
        (
          earnedXpInLevel /
          xpRange
        ) *
          100,
      ),

    pointsPercent:
      clampPercent(
        (
          earnedPointsInLevel /
          pointsRange
        ) *
          100,
      ),

    remainingXp:
      Math.max(
        input.nextLevel
          .requiredXp -
          input.experience,
        0,
      ),

    remainingPoints:
      Math.max(
        input.nextLevel
          .requiredPoints -
          input.points,
        0,
      ),
  };
}

/* -------------------------------------------------------------------------- */
/*                         TABLEAU FIDÉLITÉ CLIENT                            */
/* -------------------------------------------------------------------------- */

export async function getClientVipDashboardData(
  userId: string,
): Promise<ClientVipDashboardData> {
  const normalizedUserId =
    userId.trim();

  if (
    !normalizedUserId
  ) {
    throw new Error(
      "L’identifiant de la cliente est obligatoire.",
    );
  }

  const account =
    await prisma.loyaltyAccount.findUnique({
      where: {
        userId:
          normalizedUserId,
      },

      select: {
        id:
          true,

        memberNumber:
          true,

        referralCode:
          true,

        isActive:
          true,

        isSuspended:
          true,

        points:
          true,

        experience:
          true,

        completedAppointments:
          true,

        totalPointsEarned:
          true,

        totalPointsSpent:
          true,

        totalExperienceEarned:
          true,

        totalSpentCents:
          true,

        joinedAt:
          true,

        lastRewardClaimedAt:
          true,

        currentLevel: {
          select:
            clientLevelSelect,
        },
      },
    });

  if (!account) {
    throw new Error(
      "Le compte fidélité de la cliente est introuvable.",
    );
  }

  const currentLevel =
    account.currentLevel
      ? serializeLevel(
          account.currentLevel,
        )
      : null;

  const [
    nextLevelRow,
    rewardRows,
    transactionRows,
    availableRewards,
    usedRewards,
  ] =
    await Promise.all([
      prisma.loyaltyLevel.findFirst({
        where: {
          status:
            "ACTIVE",

          visible:
            true,

          level: {
            gt:
              currentLevel?.level ??
              -1,
          },
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

        select:
          clientLevelSelect,
      }),

      prisma.clientReward.findMany({
        where: {
          accountId:
            account.id,
        },

        orderBy: {
          createdAt:
            "desc",
        },

        take:
          CLIENT_REWARDS_LIMIT,

        select:
          clientRewardSelect,
      }),

      prisma.loyaltyTransaction.findMany({
        where: {
          accountId:
            account.id,
        },

        orderBy: {
          createdAt:
            "desc",
        },

        take:
          CLIENT_TRANSACTIONS_LIMIT,

        select:
          clientTransactionSelect,
      }),

      prisma.clientReward.count({
        where: {
          accountId:
            account.id,

          status:
            "AVAILABLE",
        },
      }),

      prisma.clientReward.count({
        where: {
          accountId:
            account.id,

          status:
            "USED",
        },
      }),
    ]);

  const nextLevel =
    nextLevelRow
      ? serializeLevel(
          nextLevelRow,
        )
      : null;

  return {
    generatedAt:
      new Date()
        .toISOString(),

    account: {
      id:
        account.id,

      memberNumber:
        account.memberNumber,

      referralCode:
        account.referralCode,

      isActive:
        account.isActive,

      isSuspended:
        account.isSuspended,

      points:
        account.points,

      experience:
        account.experience,

      joinedAt:
        account.joinedAt
          .toISOString(),

      lastRewardClaimedAt:
        account.lastRewardClaimedAt
          ?.toISOString() ??
        null,

      currentLevel,
    },

    nextLevel,

    progress:
      calculateProgress({
        experience:
          account.experience,

        points:
          account.points,

        currentLevel,

        nextLevel,
      }),

    metrics: {
      availableRewards,

      usedRewards,

      completedAppointments:
        account.completedAppointments,

      totalPointsEarned:
        account.totalPointsEarned,

      totalPointsSpent:
        account.totalPointsSpent,

      totalExperienceEarned:
        account.totalExperienceEarned,

      totalSpentCents:
        account.totalSpentCents,
    },

    rewards:
      rewardRows.map(
        serializeReward,
      ),

    transactions:
      transactionRows.map(
        serializeTransaction,
      ),
  };
}
