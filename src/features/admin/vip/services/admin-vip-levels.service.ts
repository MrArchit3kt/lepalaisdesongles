import type {
  Prisma,
} from "@/generated/prisma/client";

import {
  adminVipLevelDeleteSchema,
  adminVipLevelFormSchema,
} from "@/features/admin/vip/schemas/admin-vip-level.schemas";

import type {
  AdminVipLevelDeleteInput,
  AdminVipLevelFormInput,
} from "@/features/admin/vip/schemas/admin-vip-level.schemas";

import type {
  AdminVipLevel,
} from "@/features/admin/vip/types/admin-vip.types";

import {
  prisma,
} from "@/lib/prisma";

/* -------------------------------------------------------------------------- */
/*                                  ERREURS                                   */
/* -------------------------------------------------------------------------- */

export class AdminVipLevelValidationError extends Error {
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
      "AdminVipLevelValidationError";

    this.fieldErrors =
      fieldErrors;
  }
}

/* -------------------------------------------------------------------------- */
/*                            SÉLECTION PRISMA                                */
/* -------------------------------------------------------------------------- */

const adminVipLevelSelect = {
  id:
    true,

  name:
    true,

  slug:
    true,

  description:
    true,

  shortDescription:
    true,

  color:
    true,

  icon:
    true,

  imageUrl:
    true,

  bannerUrl:
    true,

  level:
    true,

  requiredXp:
    true,

  requiredPoints:
    true,

  xpMultiplier:
    true,

  pointsMultiplier:
    true,

  referralMultiplier:
    true,

  priorityBooking:
    true,

  vipSupport:
    true,

  exclusiveContests:
    true,

  exclusiveRewards:
    true,

  exclusiveEvents:
    true,

  freeGift:
    true,

  birthdayGift:
    true,

  permanentDiscountPercent:
    true,

  status:
    true,

  visible:
    true,

  isDefault:
    true,

  sortOrder:
    true,

  createdAt:
    true,

  updatedAt:
    true,

  _count: {
    select: {
      accounts:
        true,

      previousHistory:
        true,

      newHistory:
        true,
    },
  },
} satisfies Prisma.LoyaltyLevelSelect;

type AdminVipLevelRow =
  Prisma.LoyaltyLevelGetPayload<{
    select:
      typeof adminVipLevelSelect;
  }>;

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

function parseLevelForm(
  rawValue: unknown,
): AdminVipLevelFormInput {
  const result =
    adminVipLevelFormSchema.safeParse(
      rawValue,
    );

  if (
    result.success
  ) {
    return result.data;
  }

  throw new AdminVipLevelValidationError(
    "Le formulaire du niveau contient des erreurs.",
    normalizeFieldErrors(
      result.error.flatten()
        .fieldErrors,
    ),
  );
}

function parseLevelDelete(
  rawValue: unknown,
): AdminVipLevelDeleteInput {
  const result =
    adminVipLevelDeleteSchema.safeParse(
      rawValue,
    );

  if (
    result.success
  ) {
    return result.data;
  }

  throw new AdminVipLevelValidationError(
    "La demande de suppression contient des erreurs.",
    normalizeFieldErrors(
      result.error.flatten()
        .fieldErrors,
    ),
  );
}

/* -------------------------------------------------------------------------- */
/*                                  OUTILS                                    */
/* -------------------------------------------------------------------------- */

function emptyToNull(
  value: string,
): string | null {
  const normalized =
    value.trim();

  return normalized ===
    ""
    ? null
    : normalized;
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

function serializeLevel(
  level: AdminVipLevelRow,
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

function getLevelSnapshot(
  level: AdminVipLevelRow,
) {
  return {
    id:
      level.id,

    name:
      level.name,

    slug:
      level.slug,

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
  };
}

async function assertVipLevelActor(
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
      "Accès à la gestion des niveaux VIP refusé.",
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

async function assertLevelIdentifiersAvailable(
  input: {
    slug: string;
    level: number;
    excludedId?: string;
  },
): Promise<void> {
  const existing =
    await prisma.loyaltyLevel.findFirst({
      where: {
        OR: [
          {
            slug:
              input.slug,
          },
          {
            level:
              input.level,
          },
        ],

        ...(input.excludedId
          ? {
              id: {
                not:
                  input.excludedId,
              },
            }
          : {}),
      },

      select: {
        id:
          true,

        slug:
          true,

        level:
          true,
      },
    });

  if (!existing) {
    return;
  }

  const fieldErrors: Record<
    string,
    string[]
  > = {};

  if (
    existing.slug ===
    input.slug
  ) {
    fieldErrors.slug = [
      "Ce slug est déjà utilisé par un autre niveau.",
    ];
  }

  if (
    existing.level ===
    input.level
  ) {
    fieldErrors.level = [
      `Le niveau numéro ${input.level} existe déjà.`,
    ];
  }

  throw new AdminVipLevelValidationError(
    "Le niveau ne peut pas être enregistré car certains identifiants sont déjà utilisés.",
    fieldErrors,
  );
}

function buildLevelData(
  input: AdminVipLevelFormInput,
) {
  return {
    name:
      input.name,

    slug:
      input.slug,

    description:
      emptyToNull(
        input.description,
      ),

    shortDescription:
      emptyToNull(
        input.shortDescription,
      ),

    color:
      emptyToNull(
        input.color,
      ),

    icon:
      emptyToNull(
        input.icon,
      ),

    imageUrl:
      emptyToNull(
        input.imageUrl,
      ),

    bannerUrl:
      emptyToNull(
        input.bannerUrl,
      ),

    level:
      input.level,

    requiredXp:
      input.requiredXp,

    requiredPoints:
      input.requiredPoints,

    xpMultiplier:
      input.xpMultiplier,

    pointsMultiplier:
      input.pointsMultiplier,

    referralMultiplier:
      input.referralMultiplier,

    priorityBooking:
      input.priorityBooking,

    vipSupport:
      input.vipSupport,

    exclusiveContests:
      input.exclusiveContests,

    exclusiveRewards:
      input.exclusiveRewards,

    exclusiveEvents:
      input.exclusiveEvents,

    freeGift:
      input.freeGift,

    birthdayGift:
      input.birthdayGift,

    permanentDiscountPercent:
      input.permanentDiscountPercent,

    status:
      input.status,

    visible:
      input.visible,

    isDefault:
      input.isDefault,

    sortOrder:
      input.sortOrder,
  };
}

/* -------------------------------------------------------------------------- */
/*                                  LECTURE                                   */
/* -------------------------------------------------------------------------- */

export async function getAdminVipLevels():
  Promise<AdminVipLevel[]> {
  const levels =
    await prisma.loyaltyLevel.findMany({
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
        adminVipLevelSelect,
    });

  return levels.map(
    serializeLevel,
  );
}

export async function getAdminVipLevel(
  levelId: string,
): Promise<AdminVipLevel | null> {
  const id =
    levelId.trim();

  if (!id) {
    return null;
  }

  const level =
    await prisma.loyaltyLevel.findUnique({
      where: {
        id,
      },

      select:
        adminVipLevelSelect,
    });

  return level
    ? serializeLevel(
        level,
      )
    : null;
}

/* -------------------------------------------------------------------------- */
/*                                  CRÉATION                                  */
/* -------------------------------------------------------------------------- */

export async function createAdminVipLevel(
  rawValue: unknown,
  actorId: string,
): Promise<AdminVipLevel> {
  const actor =
    await assertVipLevelActor(
      actorId,
    );

  const input =
    parseLevelForm(
      rawValue,
    );

  await assertLevelIdentifiersAvailable({
    slug:
      input.slug,

    level:
      input.level,
  });

  const createdLevel =
    await prisma.$transaction(
      async (
        transaction,
      ) => {
        if (
          input.isDefault
        ) {
          await transaction.loyaltyLevel.updateMany({
            where: {
              isDefault:
                true,
            },

            data: {
              isDefault:
                false,
            },
          });
        }

        const level =
          await transaction.loyaltyLevel.create({
            data:
              buildLevelData(
                input,
              ),

            select:
              adminVipLevelSelect,
          });

        await transaction.vipAuditLog.create({
          data: {
            actorId:
              actor.id,

            action:
              "VIP_LEVEL_CREATED",

            category:
              "LOYALTY_LEVEL",

            entityType:
              "LoyaltyLevel",

            entityId:
              level.id,

            entityReference:
              level.slug,

            nextData:
              toInputJsonValue(
                getLevelSnapshot(
                  level,
                ),
              ),

            metadata:
              toInputJsonValue({
                actorName:
                  actor.displayName,
              }),

            route:
              "/admin/fidelite",

            method:
              "SERVER_ACTION",

            success:
              true,
          },
        });

        return level;
      },
      {
        isolationLevel:
          "Serializable",
      },
    );

  return serializeLevel(
    createdLevel,
  );
}

/* -------------------------------------------------------------------------- */
/*                                MODIFICATION                                */
/* -------------------------------------------------------------------------- */

export async function updateAdminVipLevel(
  rawValue: unknown,
  actorId: string,
): Promise<AdminVipLevel> {
  const actor =
    await assertVipLevelActor(
      actorId,
    );

  const input =
    parseLevelForm(
      rawValue,
    );

  if (!input.id) {
    throw new AdminVipLevelValidationError(
      "Le niveau à modifier est introuvable.",
      {
        id: [
          "L’identifiant du niveau est absent.",
        ],
      },
    );
  }

  const existingLevel =
    await prisma.loyaltyLevel.findUnique({
      where: {
        id:
          input.id,
      },

      select:
        adminVipLevelSelect,
    });

  if (!existingLevel) {
    throw new Error(
      "Le niveau VIP demandé est introuvable.",
    );
  }

  await assertLevelIdentifiersAvailable({
    slug:
      input.slug,

    level:
      input.level,

    excludedId:
      existingLevel.id,
  });

  const updatedLevel =
    await prisma.$transaction(
      async (
        transaction,
      ) => {
        if (
          input.isDefault
        ) {
          await transaction.loyaltyLevel.updateMany({
            where: {
              id: {
                not:
                  existingLevel.id,
              },

              isDefault:
                true,
            },

            data: {
              isDefault:
                false,
            },
          });
        }

        const level =
          await transaction.loyaltyLevel.update({
            where: {
              id:
                existingLevel.id,
            },

            data:
              buildLevelData(
                input,
              ),

            select:
              adminVipLevelSelect,
          });

        await transaction.vipAuditLog.create({
          data: {
            actorId:
              actor.id,

            action:
              "VIP_LEVEL_UPDATED",

            category:
              "LOYALTY_LEVEL",

            entityType:
              "LoyaltyLevel",

            entityId:
              level.id,

            entityReference:
              level.slug,

            previousData:
              toInputJsonValue(
                getLevelSnapshot(
                  existingLevel,
                ),
              ),

            nextData:
              toInputJsonValue(
                getLevelSnapshot(
                  level,
                ),
              ),

            metadata:
              toInputJsonValue({
                actorName:
                  actor.displayName,
              }),

            route:
              "/admin/fidelite",

            method:
              "SERVER_ACTION",

            success:
              true,
          },
        });

        return level;
      },
      {
        isolationLevel:
          "Serializable",
      },
    );

  return serializeLevel(
    updatedLevel,
  );
}

/* -------------------------------------------------------------------------- */
/*                              SUPPRESSION                                   */
/* -------------------------------------------------------------------------- */

export async function deleteAdminVipLevel(
  rawValue: unknown,
  actorId: string,
): Promise<{
  levelId: string;
}> {
  const actor =
    await assertVipLevelActor(
      actorId,
    );

  const input =
    parseLevelDelete(
      rawValue,
    );

  return prisma.$transaction(
    async (
      transaction,
    ) => {
      const level =
        await transaction.loyaltyLevel.findUnique({
          where: {
            id:
              input.levelId,
          },

          select:
            adminVipLevelSelect,
        });

      if (!level) {
        throw new Error(
          "Le niveau VIP demandé est introuvable.",
        );
      }

      const rewardCount =
        await transaction.vipReward.count({
          where: {
            minimumLevelId:
              level.id,
          },
        });

      const blockingRelations = {
        members:
          level._count.accounts,

        previousHistory:
          level._count
            .previousHistory,

        newHistory:
          level._count
            .newHistory,

        rewards:
          rewardCount,
      };

      const isUsed =
        Object.values(
          blockingRelations,
        ).some(
          (
            count,
          ) =>
            count > 0,
        );

      if (isUsed) {
        throw new AdminVipLevelValidationError(
          "Ce niveau ne peut pas être supprimé car il est déjà utilisé.",
          {
            levelId: [
              `Membres : ${blockingRelations.members}, historiques : ${
                blockingRelations.previousHistory +
                blockingRelations.newHistory
              }, récompenses : ${blockingRelations.rewards}. Archivez le niveau plutôt que de le supprimer.`,
            ],
          },
        );
      }

      const levelSnapshot =
        getLevelSnapshot(
          level,
        );

      await transaction.loyaltyLevel.delete({
        where: {
          id:
            level.id,
        },
      });

      await transaction.vipAuditLog.create({
        data: {
          actorId:
            actor.id,

          action:
            "VIP_LEVEL_DELETED",

          category:
            "LOYALTY_LEVEL",

          entityType:
            "LoyaltyLevel",

          entityId:
            level.id,

          entityReference:
            level.slug,

          previousData:
            toInputJsonValue(
              levelSnapshot,
            ),

          metadata:
            toInputJsonValue({
              actorName:
                actor.displayName,

              reason:
                input.reason,
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
        levelId:
          level.id,
      };
    },
    {
      isolationLevel:
        "Serializable",
    },
  );
}
