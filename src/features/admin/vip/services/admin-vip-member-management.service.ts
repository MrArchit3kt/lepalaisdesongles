import {
  randomUUID,
} from "node:crypto";

import type {
  Prisma,
} from "@/generated/prisma/client";

import {
  adminVipBalanceAdjustmentSchema,
  adminVipMemberLevelChangeSchema,
  adminVipMemberRewardGrantSchema,
  adminVipMemberStatusSchema,
} from "@/features/admin/vip/schemas/admin-vip-member.schemas";

import type {
  AdminVipBalanceAdjustmentSchemaInput,
  AdminVipMemberLevelChangeSchemaInput,
  AdminVipMemberRewardGrantSchemaInput,
  AdminVipMemberStatusSchemaInput,
} from "@/features/admin/vip/schemas/admin-vip-member.schemas";

import {
  prisma,
} from "@/lib/prisma";

/* -------------------------------------------------------------------------- */
/*                                  ERREURS                                   */
/* -------------------------------------------------------------------------- */

export class AdminVipMemberValidationError extends Error {
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
      "AdminVipMemberValidationError";

    this.fieldErrors =
      fieldErrors;
  }
}

/* -------------------------------------------------------------------------- */
/*                              TYPES INTERNES                                */
/* -------------------------------------------------------------------------- */

type AdminActor = {
  id: string;
  displayName: string;
};

type VipAuditInput = {
  actor: AdminActor;

  action: string;

  entityId: string;
  entityReference?: string | null;

  previousData?: unknown;
  nextData?: unknown;
  changes?: unknown;
  metadata?: unknown;
};

/* -------------------------------------------------------------------------- */
/*                              OUTILS ZOD                                    */
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

function parseBalanceAdjustment(
  rawValue: unknown,
): AdminVipBalanceAdjustmentSchemaInput {
  const result =
    adminVipBalanceAdjustmentSchema.safeParse(
      rawValue,
    );

  if (
    result.success
  ) {
    return result.data;
  }

  throw new AdminVipMemberValidationError(
    "L’ajustement des points et XP contient des erreurs.",
    normalizeFieldErrors(
      result.error.flatten()
        .fieldErrors,
    ),
  );
}

function parseLevelChange(
  rawValue: unknown,
): AdminVipMemberLevelChangeSchemaInput {
  const result =
    adminVipMemberLevelChangeSchema.safeParse(
      rawValue,
    );

  if (
    result.success
  ) {
    return result.data;
  }

  throw new AdminVipMemberValidationError(
    "Le changement de niveau contient des erreurs.",
    normalizeFieldErrors(
      result.error.flatten()
        .fieldErrors,
    ),
  );
}

function parseMemberStatus(
  rawValue: unknown,
): AdminVipMemberStatusSchemaInput {
  const result =
    adminVipMemberStatusSchema.safeParse(
      rawValue,
    );

  if (
    result.success
  ) {
    return result.data;
  }

  throw new AdminVipMemberValidationError(
    "La modification du statut contient des erreurs.",
    normalizeFieldErrors(
      result.error.flatten()
        .fieldErrors,
    ),
  );
}

function parseRewardGrant(
  rawValue: unknown,
): AdminVipMemberRewardGrantSchemaInput {
  const result =
    adminVipMemberRewardGrantSchema.safeParse(
      rawValue,
    );

  if (
    result.success
  ) {
    return result.data;
  }

  throw new AdminVipMemberValidationError(
    "L’attribution de la récompense contient des erreurs.",
    normalizeFieldErrors(
      result.error.flatten()
        .fieldErrors,
    ),
  );
}

/* -------------------------------------------------------------------------- */
/*                                  OUTILS                                    */
/* -------------------------------------------------------------------------- */

function toInputJsonValue(
  value: unknown,
): Prisma.InputJsonValue {
  return JSON.parse(
    JSON.stringify(
      value,
    ),
  ) as Prisma.InputJsonValue;
}

function getUserDisplayName(
  user: {
    firstName: string;
    lastName: string;
    email: string;
  },
): string {
  return [
    user.firstName,
    user.lastName,
  ]
    .filter(Boolean)
    .join(" ")
    .trim() ||
    user.email;
}

function describeDelta(
  value: number,
  label: string,
): string {
  if (
    value >
    0
  ) {
    return `+${value} ${label}`;
  }

  return `${value} ${label}`;
}

function createClientRewardCode(
  prefix:
    | string
    | null,
): string {
  const normalizedPrefix =
    (
      prefix ??
      "VIP"
    )
      .trim()
      .toUpperCase()
      .replace(
        /[^A-Z0-9]+/g,
        "-",
      )
      .replace(
        /^-+|-+$/g,
        "",
      )
      .slice(
        0,
        20,
      ) ||
    "VIP";

  const randomPart =
    randomUUID()
      .replaceAll(
        "-",
        "",
      )
      .slice(
        0,
        16,
      )
      .toUpperCase();

  return `${normalizedPrefix}-${randomPart}`;
}

function parseOptionalExpiration(
  value: string,
): Date | null {
  if (
    !value
  ) {
    return null;
  }

  const date =
    new Date(
      value,
    );

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    throw new AdminVipMemberValidationError(
      "La date d’expiration est invalide.",
      {
        expiresAt: [
          "Renseignez une date valide.",
        ],
      },
    );
  }

  return date;
}

/* -------------------------------------------------------------------------- */
/*                                  ACTEUR                                    */
/* -------------------------------------------------------------------------- */

async function assertAdminActor(
  actorId: string,
): Promise<AdminActor> {
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
      "Accès à la gestion des membres VIP refusé.",
    );
  }

  return {
    id:
      actor.id,

    displayName:
      getUserDisplayName(
        actor,
      ),
  };
}

/* -------------------------------------------------------------------------- */
/*                             JOURNAL D’AUDIT                                */
/* -------------------------------------------------------------------------- */

async function createVipAuditLog(
  transaction: Prisma.TransactionClient,
  input: VipAuditInput,
): Promise<void> {
  await transaction.vipAuditLog.create({
    data: {
      actorId:
        input.actor.id,

      action:
        input.action,

      category:
        "VIP_MEMBER",

      entityType:
        "LoyaltyAccount",

      entityId:
        input.entityId,

      entityReference:
        input.entityReference ??
        null,

      previousData:
        input.previousData ===
          undefined
          ? undefined
          : toInputJsonValue(
              input.previousData,
            ),

      nextData:
        input.nextData ===
          undefined
          ? undefined
          : toInputJsonValue(
              input.nextData,
            ),

      changes:
        input.changes ===
          undefined
          ? undefined
          : toInputJsonValue(
              input.changes,
            ),

      metadata:
        toInputJsonValue({
          actorName:
            input.actor
              .displayName,

          ...(input.metadata &&
          typeof input.metadata ===
            "object"
            ? input.metadata
            : {}),
        }),

      route:
        "/admin/fidelite/membres",

      method:
        "SERVER_ACTION",

      success:
        true,
    },
  });
}

/* -------------------------------------------------------------------------- */
/*                              NOTIFICATIONS                                 */
/* -------------------------------------------------------------------------- */

async function createMemberNotification(
  transaction: Prisma.TransactionClient,
  input: {
    userId: string;
    title: string;
    message: string;
    metadata?: unknown;
  },
): Promise<void> {
  await transaction.notification.create({
    data: {
      userId:
        input.userId,

      type:
        "SYSTEM",

      title:
        input.title,

      message:
        input.message,

      actionUrl:
        "/espace-client",

      metadata:
        input.metadata ===
          undefined
          ? undefined
          : toInputJsonValue(
              input.metadata,
            ),
    },
  });
}

/* -------------------------------------------------------------------------- */
/*                      AJUSTEMENT MANUEL POINTS / XP                         */
/* -------------------------------------------------------------------------- */

export async function adjustAdminVipMemberBalance(
  rawValue: unknown,
  actorId: string,
): Promise<{
  accountId: string;
  points: number;
  experience: number;
}> {
  const actor =
    await assertAdminActor(
      actorId,
    );

  const input =
    parseBalanceAdjustment(
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

          select: {
            id:
              true,

            userId:
              true,

            memberNumber:
              true,

            points:
              true,

            experience:
              true,

            totalPointsEarned:
              true,

            totalPointsSpent:
              true,

            totalExperienceEarned:
              true,

            experienceSpent:
              true,

            user: {
              select: {
                firstName:
                  true,

                lastName:
                  true,

                email:
                  true,
              },
            },
          },
        });

      if (!account) {
        throw new Error(
          "Le compte VIP demandé est introuvable.",
        );
      }

      const nextPoints =
        account.points +
        input.pointsDelta;

      const nextExperience =
        account.experience +
        input.experienceDelta;

      if (
        nextPoints <
        0
      ) {
        throw new AdminVipMemberValidationError(
          "Le solde de points ne peut pas devenir négatif.",
          {
            pointsDelta: [
              `Le membre dispose actuellement de ${account.points} points.`,
            ],
          },
        );
      }

      if (
        nextExperience <
        0
      ) {
        throw new AdminVipMemberValidationError(
          "Le solde d’XP ne peut pas devenir négatif.",
          {
            experienceDelta: [
              `Le membre dispose actuellement de ${account.experience} XP.`,
            ],
          },
        );
      }

      const updateData:
        Prisma.LoyaltyAccountUpdateInput =
        {
          points:
            nextPoints,

          experience:
            nextExperience,
        };

      if (
        input.pointsDelta >
        0
      ) {
        updateData.totalPointsEarned = {
          increment:
            input.pointsDelta,
        };
      }

      if (
        input.pointsDelta <
        0
      ) {
        updateData.totalPointsSpent = {
          increment:
            Math.abs(
              input.pointsDelta,
            ),
        };
      }

      if (
        input.experienceDelta >
        0
      ) {
        updateData.totalExperienceEarned = {
          increment:
            input.experienceDelta,
        };

        updateData.lastExperienceEarnedAt =
          new Date();
      }

      if (
        input.experienceDelta <
        0
      ) {
        updateData.experienceSpent = {
          increment:
            Math.abs(
              input.experienceDelta,
            ),
        };
      }

      await transaction.loyaltyAccount.update({
        where: {
          id:
            account.id,
        },

        data:
          updateData,
      });

      await transaction.loyaltyTransaction.create({
        data: {
          userId:
            account.userId,

          accountId:
            account.id,

          type:
            "ADJUSTMENT",

          source:
            "ADMIN",

          xpAmount:
            input.experienceDelta,

          pointsAmount:
            input.pointsDelta,

          xpBalanceAfter:
            nextExperience,

          pointsBalanceAfter:
            nextPoints,

          baseXpAmount:
            input.experienceDelta,

          basePointsAmount:
            input.pointsDelta,

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
              previousPoints:
                account.points,

              nextPoints,

              previousExperience:
                account.experience,

              nextExperience,
            }),
        },
      });

      await createVipAuditLog(
        transaction,
        {
          actor,

          action:
            "VIP_MEMBER_BALANCE_ADJUSTED",

          entityId:
            account.id,

          entityReference:
            account.memberNumber,

          previousData: {
            points:
              account.points,

            experience:
              account.experience,
          },

          nextData: {
            points:
              nextPoints,

            experience:
              nextExperience,
          },

          changes: {
            pointsDelta:
              input.pointsDelta,

            experienceDelta:
              input.experienceDelta,
          },

          metadata: {
            title:
              input.title,

            reason:
              input.reason,

            memberName:
              getUserDisplayName(
                account.user,
              ),
          },
        },
      );

      await createMemberNotification(
        transaction,
        {
          userId:
            account.userId,

          title:
            "Votre solde fidélité a été mis à jour",

          message:
            `Une modification administrative a été effectuée : ${describeDelta(
              input.pointsDelta,
              "point(s)",
            )} et ${describeDelta(
              input.experienceDelta,
              "XP",
            )}. Nouveau solde : ${nextPoints} point(s) et ${nextExperience} XP.`,

          metadata: {
            accountId:
              account.id,

            pointsDelta:
              input.pointsDelta,

            experienceDelta:
              input.experienceDelta,

            reason:
              input.reason,
          },
        },
      );

      return {
        accountId:
          account.id,

        points:
          nextPoints,

        experience:
          nextExperience,
      };
    },
    {
      isolationLevel:
        "Serializable",
    },
  );
}

/* -------------------------------------------------------------------------- */
/*                         CHANGEMENT MANUEL DE NIVEAU                        */
/* -------------------------------------------------------------------------- */

export async function changeAdminVipMemberLevel(
  rawValue: unknown,
  actorId: string,
): Promise<{
  accountId: string;
  levelId: string;
  levelName: string;
}> {
  const actor =
    await assertAdminActor(
      actorId,
    );

  const input =
    parseLevelChange(
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

          select: {
            id:
              true,

            userId:
              true,

            memberNumber:
              true,

            points:
              true,

            experience:
              true,

            currentLevelId:
              true,

            currentLevel: {
              select: {
                id:
                  true,

                name:
                  true,

                level:
                  true,
              },
            },

            user: {
              select: {
                firstName:
                  true,

                lastName:
                  true,

                email:
                  true,
              },
            },
          },
        });

      if (!account) {
        throw new Error(
          "Le compte VIP demandé est introuvable.",
        );
      }

      const nextLevel =
        await transaction.loyaltyLevel.findFirst({
          where: {
            id:
              input.levelId,

            status:
              "ACTIVE",
          },

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
          },
        });

      if (!nextLevel) {
        throw new AdminVipMemberValidationError(
          "Le niveau sélectionné est introuvable ou inactif.",
          {
            levelId: [
              "Sélectionnez un niveau VIP actif.",
            ],
          },
        );
      }

      if (
        account.currentLevelId ===
        nextLevel.id
      ) {
        throw new AdminVipMemberValidationError(
          "Le membre possède déjà ce niveau.",
          {
            levelId: [
              "Sélectionnez un niveau différent.",
            ],
          },
        );
      }

      const changedAt =
        new Date();

      await transaction.loyaltyAccount.update({
        where: {
          id:
            account.id,
        },

        data: {
          currentLevelId:
            nextLevel.id,

          levelReachedAt:
            changedAt,
        },
      });

      await transaction.clientLevelHistory.create({
        data: {
          accountId:
            account.id,

          previousLevelId:
            account.currentLevelId,

          newLevelId:
            nextLevel.id,

          experienceAtUpgrade:
            account.experience,

          pointsAtUpgrade:
            account.points,

          upgradedAutomatically:
            false,

          reason:
            input.reason,

          metadata:
            toInputJsonValue({
              actorId:
                actor.id,

              actorName:
                actor.displayName,

              previousLevel:
                account.currentLevel,

              nextLevel,
            }),
        },
      });

      await transaction.loyaltyTransaction.create({
        data: {
          userId:
            account.userId,

          accountId:
            account.id,

          type:
            "ADJUSTMENT",

          source:
            "LEVEL_UP",

          xpAmount:
            0,

          pointsAmount:
            0,

          xpBalanceAfter:
            account.experience,

          pointsBalanceAfter:
            account.points,

          title:
            "Niveau VIP modifié",

          description:
            input.reason,

          sourceEntityType:
            "LoyaltyLevel",

          sourceEntityId:
            nextLevel.id,

          actorId:
            actor.id,

          actorName:
            actor.displayName,

          metadata:
            toInputJsonValue({
              previousLevelId:
                account.currentLevelId,

              nextLevelId:
                nextLevel.id,

              manual:
                true,
            }),
        },
      });

      await createVipAuditLog(
        transaction,
        {
          actor,

          action:
            "VIP_MEMBER_LEVEL_CHANGED",

          entityId:
            account.id,

          entityReference:
            account.memberNumber,

          previousData: {
            level:
              account.currentLevel,
          },

          nextData: {
            level:
              nextLevel,
          },

          metadata: {
            reason:
              input.reason,

            memberName:
              getUserDisplayName(
                account.user,
              ),
          },
        },
      );

      await createMemberNotification(
        transaction,
        {
          userId:
            account.userId,

          title:
            "Votre niveau VIP a changé",

          message:
            `Votre compte fidélité est désormais au niveau « ${nextLevel.name} ».`,

          metadata: {
            accountId:
              account.id,

            previousLevelId:
              account.currentLevelId,

            nextLevelId:
              nextLevel.id,

            reason:
              input.reason,
          },
        },
      );

      return {
        accountId:
          account.id,

        levelId:
          nextLevel.id,

        levelName:
          nextLevel.name,
      };
    },
    {
      isolationLevel:
        "Serializable",
    },
  );
}

/* -------------------------------------------------------------------------- */
/*                          MODIFICATION DU STATUT                            */
/* -------------------------------------------------------------------------- */

export async function changeAdminVipMemberStatus(
  rawValue: unknown,
  actorId: string,
): Promise<{
  accountId: string;
  isActive: boolean;
  isSuspended: boolean;
}> {
  const actor =
    await assertAdminActor(
      actorId,
    );

  const input =
    parseMemberStatus(
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

          select: {
            id:
              true,

            userId:
              true,

            memberNumber:
              true,

            isActive:
              true,

            isSuspended:
              true,

            suspendedAt:
              true,

            points:
              true,

            experience:
              true,

            user: {
              select: {
                firstName:
                  true,

                lastName:
                  true,

                email:
                  true,
              },
            },
          },
        });

      if (!account) {
        throw new Error(
          "Le compte VIP demandé est introuvable.",
        );
      }

      let nextIsActive =
        account.isActive;

      let nextIsSuspended =
        account.isSuspended;

      let nextSuspendedAt =
        account.suspendedAt;

      let notificationTitle:
        string;

      let notificationMessage:
        string;

      switch (
        input.action
      ) {
        case "ACTIVATE": {
          nextIsActive =
            true;

          nextIsSuspended =
            false;

          nextSuspendedAt =
            null;

          notificationTitle =
            "Votre compte VIP est actif";

          notificationMessage =
            "Votre compte fidélité a été activé. Vous pouvez de nouveau profiter du Club VIP.";

          break;
        }

        case "DEACTIVATE": {
          nextIsActive =
            false;

          nextIsSuspended =
            false;

          nextSuspendedAt =
            null;

          notificationTitle =
            "Votre compte VIP a été désactivé";

          notificationMessage =
            "Votre compte fidélité a été désactivé par l’administration.";

          break;
        }

        case "SUSPEND": {
          nextIsActive =
            true;

          nextIsSuspended =
            true;

          nextSuspendedAt =
            new Date();

          notificationTitle =
            "Votre compte VIP a été suspendu";

          notificationMessage =
            "Votre accès au programme fidélité est temporairement suspendu.";

          break;
        }

        case "UNSUSPEND": {
          nextIsActive =
            true;

          nextIsSuspended =
            false;

          nextSuspendedAt =
            null;

          notificationTitle =
            "La suspension de votre compte VIP est levée";

          notificationMessage =
            "Votre accès au Club VIP a été rétabli.";

          break;
        }

        default:
          throw new Error(
            "Action de statut VIP non prise en charge.",
          );
      }

      if (
        nextIsActive ===
          account.isActive &&
        nextIsSuspended ===
          account.isSuspended
      ) {
        throw new AdminVipMemberValidationError(
          "Le compte possède déjà ce statut.",
          {
            action: [
              "Sélectionnez une autre action.",
            ],
          },
        );
      }

      await transaction.loyaltyAccount.update({
        where: {
          id:
            account.id,
        },

        data: {
          isActive:
            nextIsActive,

          isSuspended:
            nextIsSuspended,

          suspendedAt:
            nextSuspendedAt,
        },
      });

      await transaction.loyaltyTransaction.create({
        data: {
          userId:
            account.userId,

          accountId:
            account.id,

          type:
            "ADJUSTMENT",

          source:
            "ADMIN",

          xpAmount:
            0,

          pointsAmount:
            0,

          xpBalanceAfter:
            account.experience,

          pointsBalanceAfter:
            account.points,

          title:
            "Statut du compte VIP modifié",

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
              action:
                input.action,

              previousIsActive:
                account.isActive,

              nextIsActive,

              previousIsSuspended:
                account.isSuspended,

              nextIsSuspended,
            }),
        },
      });

      await createVipAuditLog(
        transaction,
        {
          actor,

          action:
            `VIP_MEMBER_${input.action}`,

          entityId:
            account.id,

          entityReference:
            account.memberNumber,

          previousData: {
            isActive:
              account.isActive,

            isSuspended:
              account.isSuspended,

            suspendedAt:
              account.suspendedAt,
          },

          nextData: {
            isActive:
              nextIsActive,

            isSuspended:
              nextIsSuspended,

            suspendedAt:
              nextSuspendedAt,
          },

          metadata: {
            reason:
              input.reason,

            memberName:
              getUserDisplayName(
                account.user,
              ),
          },
        },
      );

      await createMemberNotification(
        transaction,
        {
          userId:
            account.userId,

          title:
            notificationTitle,

          message:
            notificationMessage,

          metadata: {
            accountId:
              account.id,

            action:
              input.action,

            reason:
              input.reason,
          },
        },
      );

      return {
        accountId:
          account.id,

        isActive:
          nextIsActive,

        isSuspended:
          nextIsSuspended,
      };
    },
    {
      isolationLevel:
        "Serializable",
    },
  );
}

/* -------------------------------------------------------------------------- */
/*                     ATTRIBUTION MANUELLE DE RÉCOMPENSE                     */
/* -------------------------------------------------------------------------- */

export async function grantAdminVipMemberReward(
  rawValue: unknown,
  actorId: string,
): Promise<{
  accountId: string;
  clientRewardId: string;
  rewardName: string;
  uniqueCode: string;
}> {
  const actor =
    await assertAdminActor(
      actorId,
    );

  const input =
    parseRewardGrant(
      rawValue,
    );

  return prisma.$transaction(
    async (
      transaction,
    ) => {
      const now =
        new Date();

      const account =
        await transaction.loyaltyAccount.findUnique({
          where: {
            id:
              input.accountId,
          },

          select: {
            id:
              true,

            userId:
              true,

            memberNumber:
              true,

            isActive:
              true,

            isSuspended:
              true,

            points:
              true,

            experience:
              true,

            currentLevelId:
              true,

            totalRewardsUnlocked:
              true,

            currentLevel: {
              select: {
                id:
                  true,

                name:
                  true,

                level:
                  true,
              },
            },

            user: {
              select: {
                firstName:
                  true,

                lastName:
                  true,

                email:
                  true,
              },
            },
          },
        });

      if (!account) {
        throw new Error(
          "Le compte VIP demandé est introuvable.",
        );
      }

      if (
        !account.isActive ||
        account.isSuspended
      ) {
        throw new AdminVipMemberValidationError(
          "Une récompense ne peut pas être attribuée à ce compte.",
          {
            accountId: [
              account.isSuspended
                ? "Le compte VIP est suspendu."
                : "Le compte VIP est inactif.",
            ],
          },
        );
      }

      const reward =
        await transaction.vipReward.findUnique({
          where: {
            id:
              input.rewardId,
          },

          select: {
            id:
              true,

            name:
              true,

            slug:
              true,

            status:
              true,

            visible:
              true,

            startsAt:
              true,

            endsAt:
              true,

            validForDays:
              true,

            unlimitedStock:
              true,

            stock:
              true,

            remainingStock:
              true,

            repeatable:
              true,

            minimumLevelId:
              true,

            minimumPoints:
              true,

            minimumXp:
              true,

            rewardCode:
              true,

            couponCodePrefix:
              true,
          },
        });

      if (!reward) {
        throw new AdminVipMemberValidationError(
          "La récompense sélectionnée est introuvable.",
          {
            rewardId: [
              "Sélectionnez une récompense existante.",
            ],
          },
        );
      }

      if (
        reward.status !==
        "ACTIVE"
      ) {
        throw new AdminVipMemberValidationError(
          "Cette récompense n’est pas active.",
          {
            rewardId: [
              "Activez la récompense avant de l’attribuer.",
            ],
          },
        );
      }

      if (
        reward.startsAt &&
        reward.startsAt >
          now
      ) {
        throw new AdminVipMemberValidationError(
          "Cette récompense n’est pas encore disponible.",
          {
            rewardId: [
              "La période de disponibilité n’a pas commencé.",
            ],
          },
        );
      }

      if (
        reward.endsAt &&
        reward.endsAt <
          now
      ) {
        throw new AdminVipMemberValidationError(
          "Cette récompense a expiré.",
          {
            rewardId: [
              "La période de disponibilité est terminée.",
            ],
          },
        );
      }

      if (
        reward.minimumPoints !==
          null &&
        account.points <
          reward.minimumPoints
      ) {
        throw new AdminVipMemberValidationError(
          "Le membre ne possède pas assez de points.",
          {
            rewardId: [
              `${reward.minimumPoints} points sont nécessaires. Solde actuel : ${account.points}.`,
            ],
          },
        );
      }

      if (
        reward.minimumXp !==
          null &&
        account.experience <
          reward.minimumXp
      ) {
        throw new AdminVipMemberValidationError(
          "Le membre ne possède pas assez d’XP.",
          {
            rewardId: [
              `${reward.minimumXp} XP sont nécessaires. Solde actuel : ${account.experience}.`,
            ],
          },
        );
      }

      if (
        reward.minimumLevelId
      ) {
        const minimumLevel =
          await transaction.loyaltyLevel.findUnique({
            where: {
              id:
                reward.minimumLevelId,
            },

            select: {
              id:
                true,

              name:
                true,

              level:
                true,
            },
          });

        if (
          minimumLevel &&
          (
            !account.currentLevel ||
            account.currentLevel
              .level <
              minimumLevel.level
          )
        ) {
          throw new AdminVipMemberValidationError(
            "Le niveau VIP du membre est insuffisant.",
            {
              rewardId: [
                `Le niveau « ${minimumLevel.name} » est nécessaire.`,
              ],
            },
          );
        }
      }

      if (
        !reward.repeatable
      ) {
        const existingClientReward =
          await transaction.clientReward.findFirst({
            where: {
              accountId:
                account.id,

              rewardId:
                reward.id,

              status: {
                in: [
                  "AVAILABLE",
                  "RESERVED",
                  "USED",
                  "GIFTED",
                ],
              },
            },

            select: {
              id:
                true,
            },
          });

        if (
          existingClientReward
        ) {
          throw new AdminVipMemberValidationError(
            "Cette récompense a déjà été attribuée à ce membre.",
            {
              rewardId: [
                "La récompense n’est pas répétable.",
              ],
            },
          );
        }
      }

      if (
        !reward.unlimitedStock
      ) {
        const stockUpdate =
          await transaction.vipReward.updateMany({
            where: {
              id:
                reward.id,

              remainingStock: {
                gt:
                  0,
              },
            },

            data: {
              remainingStock: {
                decrement:
                  1,
              },
            },
          });

        if (
          stockUpdate.count !==
          1
        ) {
          throw new AdminVipMemberValidationError(
            "Le stock de cette récompense est épuisé.",
            {
              rewardId: [
                "Augmentez le stock avant de l’attribuer.",
              ],
            },
          );
        }
      }

      let expiresAt =
        parseOptionalExpiration(
          input.expiresAt,
        );

      if (
        !expiresAt &&
        reward.validForDays
      ) {
        expiresAt =
          new Date(
            now.getTime() +
              reward.validForDays *
                24 *
                60 *
                60 *
                1000,
          );
      }

      if (
        reward.endsAt &&
        (
          !expiresAt ||
          expiresAt >
            reward.endsAt
        )
      ) {
        expiresAt =
          reward.endsAt;
      }

      if (
        expiresAt &&
        expiresAt <=
          now
      ) {
        throw new AdminVipMemberValidationError(
          "La date d’expiration doit être future.",
          {
            expiresAt: [
              "Choisissez une date postérieure à maintenant.",
            ],
          },
        );
      }

      const uniqueCode =
        createClientRewardCode(
          reward.couponCodePrefix ??
          reward.rewardCode,
        );

      const clientReward =
        await transaction.clientReward.create({
          data: {
            userId:
              account.userId,

            accountId:
              account.id,

            rewardId:
              reward.id,

            status:
              "AVAILABLE",

            uniqueCode,

            expiresAt,

            sourceEntityType:
              "ADMIN_GRANT",

            sourceEntityId:
              actor.id,

            metadata:
              toInputJsonValue({
                grantedBy:
                  actor.id,

                grantedByName:
                  actor.displayName,

                reason:
                  input.reason,

                rewardSlug:
                  reward.slug,
              }),
          },

          select: {
            id:
              true,
          },
        });

      const loyaltyTransaction =
        await transaction.loyaltyTransaction.create({
          data: {
            userId:
              account.userId,

            accountId:
              account.id,

            type:
              "EARN",

            source:
              "REWARD",

            xpAmount:
              0,

            pointsAmount:
              0,

            xpBalanceAfter:
              account.experience,

            pointsBalanceAfter:
              account.points,

            title:
              "Récompense VIP attribuée",

            description:
              input.reason,

            sourceEntityType:
              "ClientReward",

            sourceEntityId:
              clientReward.id,

            rewardReference:
              reward.slug,

            actorId:
              actor.id,

            actorName:
              actor.displayName,

            metadata:
              toInputJsonValue({
                rewardId:
                  reward.id,

                rewardName:
                  reward.name,

                uniqueCode,

                expiresAt:
                  expiresAt
                    ?.toISOString() ??
                  null,
              }),
          },

          select: {
            id:
              true,
          },
        });

      await transaction.clientReward.update({
        where: {
          id:
            clientReward.id,
        },

        data: {
          transactionId:
            loyaltyTransaction.id,
        },
      });

      await transaction.loyaltyAccount.update({
        where: {
          id:
            account.id,
        },

        data: {
          totalRewardsUnlocked: {
            increment:
              1,
          },

          lastRewardClaimedAt:
            now,
        },
      });

      await createVipAuditLog(
        transaction,
        {
          actor,

          action:
            "VIP_MEMBER_REWARD_GRANTED",

          entityId:
            account.id,

          entityReference:
            account.memberNumber,

          nextData: {
            clientRewardId:
              clientReward.id,

            rewardId:
              reward.id,

            rewardName:
              reward.name,

            uniqueCode,

            expiresAt,
          },

          metadata: {
            reason:
              input.reason,

            memberName:
              getUserDisplayName(
                account.user,
              ),
          },
        },
      );

      await createMemberNotification(
        transaction,
        {
          userId:
            account.userId,

          title:
            "Une récompense VIP vous a été offerte",

          message:
            `La récompense « ${reward.name} » vient d’être ajoutée à votre compte fidélité.`,

          metadata: {
            accountId:
              account.id,

            clientRewardId:
              clientReward.id,

            rewardId:
              reward.id,

            uniqueCode,

            expiresAt:
              expiresAt
                ?.toISOString() ??
              null,
          },
        },
      );

      return {
        accountId:
          account.id,

        clientRewardId:
          clientReward.id,

        rewardName:
          reward.name,

        uniqueCode,
      };
    },
    {
      isolationLevel:
        "Serializable",
    },
  );
}
