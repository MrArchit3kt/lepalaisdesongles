import type {
  Prisma,
} from "@/generated/prisma/client";

import {
  adminVipAdjustmentSchema,
  adminVipConfigurationSchema,
} from "@/features/admin/vip/schemas/admin-vip.schemas";

import type {
  AdminVipAdjustmentInput,
} from "@/features/admin/vip/types/admin-vip.types";

import {
  prisma,
} from "@/lib/prisma";

/* -------------------------------------------------------------------------- */
/*                                CONSTANTES                                  */
/* -------------------------------------------------------------------------- */

const DEFAULT_CONFIGURATION_KEY =
  "default";

/* -------------------------------------------------------------------------- */
/*                                  ERREURS                                   */
/* -------------------------------------------------------------------------- */

export class AdminVipValidationError extends Error {
  readonly fieldErrors: Record<
    string,
    string[]
  >;

  constructor(
    message: string,
    fieldErrors: Record<
      string,
      string[]
    >,
  ) {
    super(message);

    this.name =
      "AdminVipValidationError";

    this.fieldErrors =
      fieldErrors;
  }
}

/* -------------------------------------------------------------------------- */
/*                                  OUTILS                                    */
/* -------------------------------------------------------------------------- */

function normalizeFieldErrors(
  errors: Record<
    string,
    string[] | undefined
  >,
): Record<
  string,
  string[]
> {
  return Object.fromEntries(
    Object.entries(
      errors,
    ).filter(
      (
        entry,
      ): entry is [
        string,
        string[],
      ] =>
        Array.isArray(
          entry[1],
        ) &&
        entry[1].length >
          0,
    ),
  );
}

function parseConfiguration(
  value: unknown,
) {
  const result =
    adminVipConfigurationSchema.safeParse(
      value,
    );

  if (
    result.success
  ) {
    return result.data;
  }

  throw new AdminVipValidationError(
    "La configuration du Club VIP contient des erreurs.",
    normalizeFieldErrors(
      result.error.flatten()
        .fieldErrors,
    ),
  );
}

function parseAdjustment(
  value: unknown,
): AdminVipAdjustmentInput {
  const result =
    adminVipAdjustmentSchema.safeParse(
      value,
    );

  if (
    result.success
  ) {
    return result.data;
  }

  throw new AdminVipValidationError(
    "L’ajustement des points ou XP contient des erreurs.",
    normalizeFieldErrors(
      result.error.flatten()
        .fieldErrors,
    ),
  );
}

function toInputJsonValue(
  value: unknown,
): Prisma.InputJsonValue {
  return JSON.parse(
    JSON.stringify(
      value,
    ),
  ) as Prisma.InputJsonValue;
}

async function assertVipActor(
  actorId: string,
): Promise<{
  id: string;
  displayName: string;
}> {
  const actor =
    await prisma.user.findFirst({
      where: {
        id:
          actorId,

        role: {
          in: [
            "SUPER_ADMIN",
            "ADMIN",
          ],
        },

        status:
          "ACTIVE",
      },

      select: {
        id:
          true,

        firstName:
          true,

        lastName:
          true,

        email:
          true,
      },
    });

  if (!actor) {
    throw new Error(
      "Accès à la gestion du Club VIP refusé.",
    );
  }

  return {
    id:
      actor.id,

    displayName:
      [
        actor.firstName,
        actor.lastName,
      ]
        .filter(Boolean)
        .join(" ")
        .trim() ||
      actor.email,
  };
}

/* -------------------------------------------------------------------------- */
/*                        MISE À JOUR CONFIGURATION                           */
/* -------------------------------------------------------------------------- */

export async function updateVipConfiguration(
  rawValue: unknown,
  actorId: string,
): Promise<{
  id: string;
}> {
  const actor =
    await assertVipActor(
      actorId,
    );

  const input =
    parseConfiguration(
      rawValue,
    );

  const previousConfiguration =
    await prisma.vipConfiguration.findUnique({
      where: {
        key:
          DEFAULT_CONFIGURATION_KEY,
      },
    });

  const now =
    new Date();

  const launchedAt =
    input.programStatus ===
      "ACTIVE"
      ? previousConfiguration
          ?.launchedAt ??
        now
      : previousConfiguration
          ?.launchedAt ??
        null;

  const pausedAt =
    input.programStatus ===
      "PAUSED"
      ? now
      : previousConfiguration
          ?.pausedAt ??
        null;

  const disabledAt =
    input.programStatus ===
      "DISABLED"
      ? now
      : previousConfiguration
          ?.disabledAt ??
        null;

  const configurationData = {
    programStatus:
      input.programStatus,

    clubEnabled:
      input.clubEnabled,

    showPreLaunchPage:
      input.showPreLaunchPage,

    showInPublicMenu:
      input.showInPublicMenu,

    showInClientMenu:
      input.showInClientMenu,

    allowNewRegistrations:
      input.allowNewRegistrations,

    xpEnabled:
      input.modules.xpEnabled,

    levelsEnabled:
      input.modules.levelsEnabled,

    badgesEnabled:
      input.modules.badgesEnabled,

    achievementsEnabled:
      input.modules.achievementsEnabled,

    rewardsEnabled:
      input.modules.rewardsEnabled,

    contestsEnabled:
      input.modules.contestsEnabled,

    challengesEnabled:
      input.modules.challengesEnabled,

    referralsEnabled:
      input.modules.referralsEnabled,

    teamsEnabled:
      input.modules.teamsEnabled,

    collectionsEnabled:
      input.modules.collectionsEnabled,

    seasonPassEnabled:
      input.modules.seasonPassEnabled,

    vipShopEnabled:
      input.modules.vipShopEnabled,

    dailyWheelEnabled:
      input.modules.dailyWheelEnabled,

    giftChestsEnabled:
      input.modules.giftChestsEnabled,

    giftingEnabled:
      input.modules.giftingEnabled,

    publicLeaderboardEnabled:
      input.publicLeaderboardEnabled,

    leaderboardVisibility:
      input.leaderboardVisibility,

    anonymizeLeaderboard:
      input.anonymizeLeaderboard,

    leaderboardSize:
      input.leaderboardSize,

    notificationsEnabled:
      input.notifications.notificationsEnabled,

    notifyOnXpEarned:
      input.notifications.notifyOnXpEarned,

    notifyOnLevelUp:
      input.notifications.notifyOnLevelUp,

    notifyOnBadgeUnlocked:
      input.notifications.notifyOnBadgeUnlocked,

    notifyOnAchievement:
      input.notifications.notifyOnAchievement,

    notifyOnRewardUnlocked:
      input.notifications.notifyOnRewardUnlocked,

    notifyOnContestUpdate:
      input.notifications.notifyOnContestUpdate,

    notifyOnRankingChange:
      input.notifications.notifyOnRankingChange,

    notifyOnSeasonProgress:
      input.notifications.notifyOnSeasonProgress,

    notifyOnReferralQualified:
      input.notifications.notifyOnReferralQualified,

    notifyOnRewardExpiration:
      input.notifications.notifyOnRewardExpiration,

    assistantEnabled:
      input.assistant.assistantEnabled,

    assistantMode:
      input.assistant.assistantMode,

    assistantPlanningAnalysisEnabled:
      input.assistant.assistantPlanningAnalysisEnabled,

    assistantRetentionAnalysisEnabled:
      input.assistant.assistantRetentionAnalysisEnabled,

    assistantContestAnalysisEnabled:
      input.assistant.assistantContestAnalysisEnabled,

    assistantRevenueAnalysisEnabled:
      input.assistant.assistantRevenueAnalysisEnabled,

    assistantCancellationAnalysisEnabled:
      input.assistant.assistantCancellationAnalysisEnabled,

    assistantReferralAnalysisEnabled:
      input.assistant.assistantReferralAnalysisEnabled,

    automaticRulesEnabled:
      input.automations.automaticRulesEnabled,

    automaticBirthdayRewardsEnabled:
      input.automations.automaticBirthdayRewardsEnabled,

    automaticAnniversaryRewardsEnabled:
      input.automations.automaticAnniversaryRewardsEnabled,

    automaticInactiveClientRules:
      input.automations.automaticInactiveClientRules,

    automaticSeasonActivationEnabled:
      input.automations.automaticSeasonActivationEnabled,

    automaticContestActivationEnabled:
      input.automations.automaticContestActivationEnabled,

    baseXpMultiplier:
      input.baseXpMultiplier,

    basePointsMultiplier:
      input.basePointsMultiplier,

    pointsExpirationEnabled:
      input.pointsExpirationEnabled,

    pointsExpirationMonths:
      input.pointsExpirationEnabled
        ? input.pointsExpirationMonths
        : null,

    xpExpirationEnabled:
      input.xpExpirationEnabled,

    xpExpirationMonths:
      input.xpExpirationEnabled
        ? input.xpExpirationMonths
        : null,

    rewardsExpirationEnabled:
      input.rewardsExpirationEnabled,

    defaultRewardValidityDays:
      input.rewardsExpirationEnabled
        ? input.defaultRewardValidityDays
        : null,

    clubName:
      input.clubName,

    pointsLabel:
      input.pointsLabel,

    xpLabel:
      input.xpLabel,

    logoUrl:
      input.logoUrl,

    iconUrl:
      input.iconUrl,

    bannerUrl:
      input.bannerUrl,

    backgroundUrl:
      input.backgroundUrl,

    primaryColor:
      input.primaryColor,

    secondaryColor:
      input.secondaryColor,

    accentColor:
      input.accentColor,

    preLaunchTitle:
      input.preLaunchTitle,

    preLaunchDescription:
      input.preLaunchDescription,

    preLaunchImageUrl:
      input.preLaunchImageUrl,

    preLaunchButtonLabel:
      input.preLaunchButtonLabel,

    preLaunchButtonUrl:
      input.preLaunchButtonUrl,

    publicTitle:
      input.publicTitle,

    publicDescription:
      input.publicDescription,

    publicImageUrl:
      input.publicImageUrl,

    termsUrl:
      input.termsUrl,

    privacyMessage:
      input.privacyMessage,

    legalNotice:
      input.legalNotice,

    minimumAge:
      input.minimumAge,

    launchedAt,
    pausedAt,
    disabledAt,

    updatedById:
      actor.id,
  };

  return prisma.$transaction(
    async (
      transaction,
    ) => {
      const savedConfiguration =
        await transaction.vipConfiguration.upsert({
          where: {
            key:
              DEFAULT_CONFIGURATION_KEY,
          },

          create: {
            key:
              DEFAULT_CONFIGURATION_KEY,

            ...configurationData,

            createdById:
              actor.id,
          },

          update:
            configurationData,

          select: {
            id:
              true,
          },
        });

      await transaction.vipAuditLog.create({
        data: {
          actorId:
            actor.id,

          action:
            "VIP_CONFIGURATION_UPDATED",

          category:
            "CONFIGURATION",

          entityType:
            "VipConfiguration",

          entityId:
            savedConfiguration.id,

          entityReference:
            DEFAULT_CONFIGURATION_KEY,

          previousData:
            previousConfiguration
              ? toInputJsonValue(
                  previousConfiguration,
                )
              : undefined,

          nextData:
            toInputJsonValue(
              input,
            ),

          metadata:
            toInputJsonValue({
              programStatus:
                input.programStatus,

              clubEnabled:
                input.clubEnabled,
            }),

          route:
            "/admin/fidelite",

          method:
            "SERVER_ACTION",

          success:
            true,
        },
      });

      return savedConfiguration;
    },
  );
}

/* -------------------------------------------------------------------------- */
/*                         AJUSTEMENT POINTS ET XP                            */
/* -------------------------------------------------------------------------- */

export async function adjustVipMemberBalance(
  rawValue: unknown,
  actorId: string,
): Promise<{
  accountId: string;
  points: number;
  experience: number;
}> {
  const actor =
    await assertVipActor(
      actorId,
    );

  const input =
    parseAdjustment(
      rawValue,
    );

  return prisma.$transaction(
    async (
      transaction,
    ) => {
      const account =
        await transaction.loyaltyAccount.findUnique({
          where: {
            id:
              input.accountId,
          },

          include: {
            user: {
              select: {
                id:
                  true,

                firstName:
                  true,

                lastName:
                  true,

                email:
                  true,
              },
            },

            currentLevel: {
              select: {
                id:
                  true,
              },
            },
          },
        });

      if (!account) {
        throw new Error(
          "Le compte fidélité demandé est introuvable.",
        );
      }

      let nextPoints =
        account.points;

      let nextExperience =
        account.experience;

      switch (
        input.adjustmentType
      ) {
        case "ADD":
          nextPoints +=
            input.points;

          nextExperience +=
            input.experience;
          break;

        case "REMOVE":
          nextPoints -=
            input.points;

          nextExperience -=
            input.experience;
          break;

        case "SET":
          nextPoints =
            input.points;

          nextExperience =
            input.experience;
          break;
      }

      if (
        nextPoints < 0
      ) {
        throw new AdminVipValidationError(
          "Le solde de points ne peut pas devenir négatif.",
          {
            points: [
              `Cette opération ferait passer le solde sous zéro. Solde actuel : ${account.points}.`,
            ],
          },
        );
      }

      if (
        nextExperience < 0
      ) {
        throw new AdminVipValidationError(
          "Le solde XP ne peut pas devenir négatif.",
          {
            experience: [
              `Cette opération ferait passer le solde sous zéro. Solde actuel : ${account.experience}.`,
            ],
          },
        );
      }

      const pointsDelta =
        nextPoints -
        account.points;

      const experienceDelta =
        nextExperience -
        account.experience;

      if (
        pointsDelta === 0 &&
        experienceDelta === 0
      ) {
        throw new AdminVipValidationError(
          "Aucune modification n’a été détectée.",
          {
            points: [
              "Les nouveaux soldes sont identiques aux soldes actuels.",
            ],
          },
        );
      }

      const nextLevel =
        await transaction.loyaltyLevel.findFirst({
          where: {
            status:
              "ACTIVE",

            requiredXp: {
              lte:
                nextExperience,
            },

            requiredPoints: {
              lte:
                nextPoints,
            },
          },

          orderBy: [
            {
              level:
                "desc",
            },
            {
              requiredXp:
                "desc",
            },
          ],

          select: {
            id:
              true,

            name:
              true,
          },
        });

      const levelChanged =
        account.currentLevel
          ?.id !==
        (nextLevel?.id ??
          null);

      const updatedAccount =
        await transaction.loyaltyAccount.update({
          where: {
            id:
              account.id,
          },

          data: {
            points:
              nextPoints,

            experience:
              nextExperience,

            totalPointsEarned: {
              increment:
                Math.max(
                  pointsDelta,
                  0,
                ),
            },

            totalPointsSpent: {
              increment:
                Math.max(
                  -pointsDelta,
                  0,
                ),
            },

            totalExperienceEarned: {
              increment:
                Math.max(
                  experienceDelta,
                  0,
                ),
            },

            experienceSpent: {
              increment:
                Math.max(
                  -experienceDelta,
                  0,
                ),
            },

            currentLevelId:
              nextLevel?.id ??
              null,

            levelReachedAt:
              levelChanged &&
              nextLevel
                ? new Date()
                : account.currentLevel
                  ? undefined
                  : null,

            lastExperienceEarnedAt:
              experienceDelta >
              0
                ? new Date()
                : undefined,
          },

          select: {
            id:
              true,

            points:
              true,

            experience:
              true,
          },
        });

      await transaction.loyaltyTransaction.create({
        data: {
          userId:
            account.user.id,

          accountId:
            account.id,

          type:
            "ADJUSTMENT",

          source:
            "ADMIN",

          xpAmount:
            experienceDelta,

          pointsAmount:
            pointsDelta,

          xpBalanceAfter:
            nextExperience,

          pointsBalanceAfter:
            nextPoints,

          baseXpAmount:
            experienceDelta,

          basePointsAmount:
            pointsDelta,

          title:
            input.title,

          description:
            input.reason,

          sourceEntityType:
            "LoyaltyAccount",

          sourceEntityId:
            account.id,

          actorId:
            actor.id,

          actorName:
            actor.displayName,

          metadata:
            toInputJsonValue({
              adjustmentType:
                input.adjustmentType,

              previousPoints:
                account.points,

              previousExperience:
                account.experience,

              nextPoints,

              nextExperience,
            }),
        },
      });

      if (
        levelChanged &&
        nextLevel
      ) {
        await transaction.clientLevelHistory.create({
          data: {
            accountId:
              account.id,

            previousLevelId:
              account.currentLevel
                ?.id ??
              null,

            newLevelId:
              nextLevel.id,

            experienceAtUpgrade:
              nextExperience,

            pointsAtUpgrade:
              nextPoints,

            upgradedAutomatically:
              false,

            reason:
              `Ajustement manuel : ${input.reason}`,

            metadata:
              toInputJsonValue({
                actorId:
                  actor.id,

                actorName:
                  actor.displayName,

                adjustmentType:
                  input.adjustmentType,
              }),
          },
        });
      }

      await transaction.vipAuditLog.create({
        data: {
          actorId:
            actor.id,

          action:
            "VIP_MEMBER_BALANCE_ADJUSTED",

          category:
            "LOYALTY_ACCOUNT",

          entityType:
            "LoyaltyAccount",

          entityId:
            account.id,

          entityReference:
            account.memberNumber,

          previousData:
            toInputJsonValue({
              points:
                account.points,

              experience:
                account.experience,

              currentLevelId:
                account.currentLevel
                  ?.id ??
                null,
            }),

          nextData:
            toInputJsonValue({
              points:
                nextPoints,

              experience:
                nextExperience,

              currentLevelId:
                nextLevel?.id ??
                null,
            }),

          changes:
            toInputJsonValue({
              pointsDelta,
              experienceDelta,
            }),

          metadata:
            toInputJsonValue({
              title:
                input.title,

              reason:
                input.reason,

              clientEmail:
                account.user.email,

              clientName:
                [
                  account.user.firstName,
                  account.user.lastName,
                ]
                  .filter(Boolean)
                  .join(" "),
            }),

          route:
            "/admin/fidelite",

          method:
            "SERVER_ACTION",

          success:
            true,
        },
      });

      return {
        accountId:
          updatedAccount.id,

        points:
          updatedAccount.points,

        experience:
          updatedAccount.experience,
      };
    },
    {
      isolationLevel:
        "Serializable",
    },
  );
}
