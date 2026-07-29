import type {
  Prisma,
} from "@/generated/prisma/client";

import {
  adminVipRewardDeleteSchema,
  adminVipRewardFormSchema,
} from "@/features/admin/vip/schemas/admin-vip-reward.schemas";

import type {
  AdminVipRewardDeleteInput,
  AdminVipRewardFormInput,
} from "@/features/admin/vip/schemas/admin-vip-reward.schemas";

import type {
  AdminVipReward,
  AdminVipRewardLevelOption,
  AdminVipRewardsPageData,
  AdminVipRewardServiceOption,
} from "@/features/admin/vip/types/admin-vip-reward.types";

import {
  prisma,
} from "@/lib/prisma";

/* -------------------------------------------------------------------------- */
/*                                  ERREURS                                   */
/* -------------------------------------------------------------------------- */

export class AdminVipRewardValidationError extends Error {
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
      "AdminVipRewardValidationError";

    this.fieldErrors =
      fieldErrors;
  }
}

/* -------------------------------------------------------------------------- */
/*                            SÉLECTION PRISMA                                */
/* -------------------------------------------------------------------------- */

const adminVipRewardSelect = {
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

  type:
    true,

  icon:
    true,

  imageUrl:
    true,

  bannerUrl:
    true,

  color:
    true,

  fixedAmountCents:
    true,

  percentage:
    true,

  loyaltyPoints:
    true,

  experiencePoints:
    true,

  freeServiceId:
    true,

  quantity:
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

  validForDays:
    true,

  startsAt:
    true,

  endsAt:
    true,

  unlimitedStock:
    true,

  stock:
    true,

  remainingStock:
    true,

  status:
    true,

  visible:
    true,

  featured:
    true,

  repeatable:
    true,

  sortOrder:
    true,

  createdAt:
    true,

  updatedAt:
    true,

  _count: {
    select: {
      clientRewards:
        true,

      badges:
        true,

      achievements:
        true,
    },
  },
} satisfies Prisma.VipRewardSelect;

type AdminVipRewardRow =
  Prisma.VipRewardGetPayload<{
    select:
      typeof adminVipRewardSelect;
  }>;

/* -------------------------------------------------------------------------- */
/*                               CONTEXTE                                     */
/* -------------------------------------------------------------------------- */

type RewardSerializationContext = {
  levelMap: Map<
    string,
    AdminVipRewardLevelOption
  >;

  serviceMap: Map<
    string,
    AdminVipRewardServiceOption
  >;

  shopRewardIds: Set<string>;
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

function parseRewardForm(
  rawValue: unknown,
): AdminVipRewardFormInput {
  const result =
    adminVipRewardFormSchema.safeParse(
      rawValue,
    );

  if (
    result.success
  ) {
    return result.data;
  }

  throw new AdminVipRewardValidationError(
    "Le formulaire de la récompense contient des erreurs.",
    normalizeFieldErrors(
      result.error.flatten()
        .fieldErrors,
    ),
  );
}

function parseRewardDelete(
  rawValue: unknown,
): AdminVipRewardDeleteInput {
  const result =
    adminVipRewardDeleteSchema.safeParse(
      rawValue,
    );

  if (
    result.success
  ) {
    return result.data;
  }

  throw new AdminVipRewardValidationError(
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

function nullableIdentifier(
  value: string | null,
): string | null {
  if (
    value ===
    null
  ) {
    return null;
  }

  return emptyToNull(
    value,
  );
}

function nullableDate(
  value: string,
): Date | null {
  if (
    !value
  ) {
    return null;
  }

  return new Date(
    value,
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

function normalizeCode(
  value: string,
): string | null {
  const normalized =
    value
      .trim()
      .toUpperCase()
      .replace(
        /\s+/g,
        "-",
      );

  return normalized ||
    null;
}

/* -------------------------------------------------------------------------- */
/*                              CONTEXTE                                      */
/* -------------------------------------------------------------------------- */

async function getRewardSerializationContext():
  Promise<RewardSerializationContext> {
  const [
    levels,
    services,
    shopItems,
  ] =
    await Promise.all([
      prisma.loyaltyLevel.findMany({
        orderBy: [
          {
            level:
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

          level:
            true,

          color:
            true,

          status:
            true,
        },
      }),

      prisma.service.findMany({
        where: {
          isActive:
            true,
        },

        orderBy: [
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

          priceCents:
            true,

          durationMinutes:
            true,
        },
      }),

      prisma.vipShopItem.findMany({
        select: {
          rewardId:
            true,
        },
      }),
    ]);

  const levelOptions:
    AdminVipRewardLevelOption[] =
    levels.map(
      (
        level,
      ) => ({
        id:
          level.id,

        name:
          level.name,

        level:
          level.level,

        color:
          level.color,

        status:
          level.status,
      }),
    );

  const serviceOptions:
    AdminVipRewardServiceOption[] =
    services
      .filter(
        (
          service,
        ): service is typeof service & {
          priceCents: number;
        } => service.priceCents !== null,
      )
      .map(
        (
          service,
        ) => ({
          id:
            service.id,

          name:
            service.name,

          priceCents:
            service.priceCents,

          durationMinutes:
            service.durationMinutes,
        }),
      );

  return {
    levelMap:
      new Map(
        levelOptions.map(
          (
            level,
          ) => [
            level.id,
            level,
          ],
        ),
      ),

    serviceMap:
      new Map(
        serviceOptions.map(
          (
            service,
          ) => [
            service.id,
            service,
          ],
        ),
      ),

    shopRewardIds:
      new Set(
        shopItems.map(
          (
            item,
          ) =>
            item.rewardId,
        ),
      ),
  };
}

/* -------------------------------------------------------------------------- */
/*                              SÉRIALISATION                                 */
/* -------------------------------------------------------------------------- */

function serializeReward(
  reward: AdminVipRewardRow,
  context: RewardSerializationContext,
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

    freeService:
      reward.freeServiceId
        ? context.serviceMap.get(
            reward.freeServiceId,
          ) ??
          null
        : null,

    quantity:
      reward.quantity,

    minimumLevelId:
      reward.minimumLevelId,

    minimumLevel:
      reward.minimumLevelId
        ? context.levelMap.get(
            reward.minimumLevelId,
          ) ??
          null
        : null,

    minimumPoints:
      reward.minimumPoints,

    minimumXp:
      reward.minimumXp,

    rewardCode:
      reward.rewardCode,

    couponCodePrefix:
      reward.couponCodePrefix,

    validForDays:
      reward.validForDays,

    startsAt:
      reward.startsAt
        ?.toISOString() ??
      null,

    endsAt:
      reward.endsAt
        ?.toISOString() ??
      null,

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

    clientRewardCount:
      reward._count.clientRewards,

    linkedBadgeCount:
      reward._count.badges,

    linkedAchievementCount:
      reward._count.achievements,

    availableInShop:
      context.shopRewardIds.has(
        reward.id,
      ),

    createdAt:
      reward.createdAt.toISOString(),

    updatedAt:
      reward.updatedAt.toISOString(),
  };
}

function getRewardSnapshot(
  reward: AdminVipRewardRow,
) {
  return {
    id:
      reward.id,

    name:
      reward.name,

    slug:
      reward.slug,

    type:
      reward.type,

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

    minimumLevelId:
      reward.minimumLevelId,

    minimumPoints:
      reward.minimumPoints,

    minimumXp:
      reward.minimumXp,

    startsAt:
      reward.startsAt
        ?.toISOString() ??
      null,

    endsAt:
      reward.endsAt
        ?.toISOString() ??
      null,

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

    clientRewardCount:
      reward._count.clientRewards,
  };
}

/* -------------------------------------------------------------------------- */
/*                                  ACTEUR                                    */
/* -------------------------------------------------------------------------- */

async function assertVipRewardActor(
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
      "Accès à la gestion des récompenses VIP refusé.",
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
/*                              CONTRÔLES                                     */
/* -------------------------------------------------------------------------- */

async function assertRewardSlugAvailable(
  slug: string,
  excludedId?: string,
): Promise<void> {
  const existing =
    await prisma.vipReward.findUnique({
      where: {
        slug,
      },

      select: {
        id:
          true,
      },
    });

  if (
    existing &&
    existing.id !==
      excludedId
  ) {
    throw new AdminVipRewardValidationError(
      "Ce slug est déjà utilisé par une autre récompense.",
      {
        slug: [
          "Choisissez un autre slug.",
        ],
      },
    );
  }
}

async function assertRewardReferences(
  input: AdminVipRewardFormInput,
): Promise<void> {
  const minimumLevelId =
    nullableIdentifier(
      input.minimumLevelId,
    );

  const freeServiceId =
    nullableIdentifier(
      input.freeServiceId,
    );

  const [
    level,
    service,
  ] =
    await Promise.all([
      minimumLevelId
        ? prisma.loyaltyLevel.findUnique({
            where: {
              id:
                minimumLevelId,
            },

            select: {
              id:
                true,
            },
          })
        : Promise.resolve(
            null,
          ),

      freeServiceId
        ? prisma.service.findUnique({
            where: {
              id:
                freeServiceId,
            },

            select: {
              id:
                true,

              isActive:
                true,
            },
          })
        : Promise.resolve(
            null,
          ),
    ]);

  const fieldErrors: Record<
    string,
    string[]
  > = {};

  if (
    minimumLevelId &&
    !level
  ) {
    fieldErrors.minimumLevelId = [
      "Le niveau VIP sélectionné est introuvable.",
    ];
  }

  if (
    freeServiceId &&
    !service
  ) {
    fieldErrors.freeServiceId = [
      "La prestation sélectionnée est introuvable.",
    ];
  }

  if (
    freeServiceId &&
    service &&
    !service.isActive
  ) {
    fieldErrors.freeServiceId = [
      "La prestation sélectionnée n’est plus active.",
    ];
  }

  if (
    Object.keys(
      fieldErrors,
    ).length >
    0
  ) {
    throw new AdminVipRewardValidationError(
      "Certaines références de la récompense ne sont pas valides.",
      fieldErrors,
    );
  }
}

/* -------------------------------------------------------------------------- */
/*                          DONNÉES D’ENREGISTREMENT                          */
/* -------------------------------------------------------------------------- */

function buildRewardData(
  input: AdminVipRewardFormInput,
  existingReward?: AdminVipRewardRow,
) {
  const normalizedStock =
    input.unlimitedStock
      ? null
      : input.stock;

  let normalizedRemainingStock:
    number | null =
    null;

  if (
    !input.unlimitedStock &&
    normalizedStock !==
      null
  ) {
    if (
      input.remainingStock !==
      null
    ) {
      normalizedRemainingStock =
        Math.min(
          input.remainingStock,
          normalizedStock,
        );
    } else if (
      existingReward &&
      existingReward.stock !==
        null &&
      existingReward.remainingStock !==
        null
    ) {
      const alreadyConsumed =
        Math.max(
          existingReward.stock -
            existingReward.remainingStock,
          0,
        );

      normalizedRemainingStock =
        Math.max(
          normalizedStock -
            alreadyConsumed,
          0,
        );
    } else {
      normalizedRemainingStock =
        normalizedStock;
    }
  }

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

    type:
      input.type,

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

    color:
      emptyToNull(
        input.color,
      ),

    fixedAmountCents:
      input.fixedAmountCents,

    percentage:
      input.percentage,

    loyaltyPoints:
      input.loyaltyPoints,

    experiencePoints:
      input.experiencePoints,

    freeServiceId:
      nullableIdentifier(
        input.freeServiceId,
      ),

    quantity:
      input.quantity,

    minimumLevelId:
      nullableIdentifier(
        input.minimumLevelId,
      ),

    minimumPoints:
      input.minimumPoints,

    minimumXp:
      input.minimumXp,

    rewardCode:
      normalizeCode(
        input.rewardCode,
      ),

    couponCodePrefix:
      normalizeCode(
        input.couponCodePrefix,
      ),

    validForDays:
      input.validForDays,

    startsAt:
      nullableDate(
        input.startsAt,
      ),

    endsAt:
      nullableDate(
        input.endsAt,
      ),

    unlimitedStock:
      input.unlimitedStock,

    stock:
      normalizedStock,

    remainingStock:
      normalizedRemainingStock,

    status:
      input.status,

    visible:
      input.visible,

    featured:
      input.featured,

    repeatable:
      input.repeatable,

    sortOrder:
      input.sortOrder,
  };
}

/* -------------------------------------------------------------------------- */
/*                                  LECTURE                                   */
/* -------------------------------------------------------------------------- */

export async function getAdminVipRewardsPageData():
  Promise<AdminVipRewardsPageData> {
  const [
    rewards,
    context,
  ] =
    await Promise.all([
      prisma.vipReward.findMany({
        orderBy: [
          {
            sortOrder:
              "asc",
          },
          {
            createdAt:
              "desc",
          },
        ],

        select:
          adminVipRewardSelect,
      }),

      getRewardSerializationContext(),
    ]);

  const serializedRewards =
    rewards.map(
      (
        reward,
      ) =>
        serializeReward(
          reward,
          context,
        ),
    );

  return {
    generatedAt:
      new Date().toISOString(),

    metrics: {
      totalRewards:
        serializedRewards.length,

      activeRewards:
        serializedRewards.filter(
          (
            reward,
          ) =>
            reward.status ===
            "ACTIVE",
        ).length,

      draftRewards:
        serializedRewards.filter(
          (
            reward,
          ) =>
            reward.status ===
            "DRAFT",
        ).length,

      inactiveRewards:
        serializedRewards.filter(
          (
            reward,
          ) =>
            reward.status ===
            "INACTIVE",
        ).length,

      archivedRewards:
        serializedRewards.filter(
          (
            reward,
          ) =>
            reward.status ===
            "ARCHIVED",
        ).length,

      featuredRewards:
        serializedRewards.filter(
          (
            reward,
          ) =>
            reward.featured,
        ).length,

      limitedStockRewards:
        serializedRewards.filter(
          (
            reward,
          ) =>
            !reward.unlimitedStock,
        ).length,

      outOfStockRewards:
        serializedRewards.filter(
          (
            reward,
          ) =>
            !reward.unlimitedStock &&
            reward.remainingStock ===
              0,
        ).length,

      assignedRewards:
        serializedRewards.reduce(
          (
            total,
            reward,
          ) =>
            total +
            reward.clientRewardCount,
          0,
        ),
    },

    rewards:
      serializedRewards,

    levels:
      Array.from(
        context.levelMap.values(),
      ),

    services:
      Array.from(
        context.serviceMap.values(),
      ),
  };
}

export async function getAdminVipReward(
  rewardId: string,
): Promise<AdminVipReward | null> {
  const id =
    rewardId.trim();

  if (!id) {
    return null;
  }

  const [
    reward,
    context,
  ] =
    await Promise.all([
      prisma.vipReward.findUnique({
        where: {
          id,
        },

        select:
          adminVipRewardSelect,
      }),

      getRewardSerializationContext(),
    ]);

  return reward
    ? serializeReward(
        reward,
        context,
      )
    : null;
}

/* -------------------------------------------------------------------------- */
/*                                  CRÉATION                                  */
/* -------------------------------------------------------------------------- */

export async function createAdminVipReward(
  rawValue: unknown,
  actorId: string,
): Promise<AdminVipReward> {
  const actor =
    await assertVipRewardActor(
      actorId,
    );

  const input =
    parseRewardForm(
      rawValue,
    );

  await Promise.all([
    assertRewardSlugAvailable(
      input.slug,
    ),

    assertRewardReferences(
      input,
    ),
  ]);

  const createdReward =
    await prisma.$transaction(
      async (
        transaction,
      ) => {
        const reward =
          await transaction.vipReward.create({
            data:
              buildRewardData(
                input,
              ),

            select:
              adminVipRewardSelect,
          });

        await transaction.vipAuditLog.create({
          data: {
            actorId:
              actor.id,

            action:
              "VIP_REWARD_CREATED",

            category:
              "VIP_REWARD",

            entityType:
              "VipReward",

            entityId:
              reward.id,

            entityReference:
              reward.slug,

            nextData:
              toInputJsonValue(
                getRewardSnapshot(
                  reward,
                ),
              ),

            metadata:
              toInputJsonValue({
                actorName:
                  actor.displayName,
              }),

            route:
              "/admin/fidelite/recompenses",

            method:
              "SERVER_ACTION",

            success:
              true,
          },
        });

        return reward;
      },
      {
        isolationLevel:
          "Serializable",
      },
    );

  const context =
    await getRewardSerializationContext();

  return serializeReward(
    createdReward,
    context,
  );
}

/* -------------------------------------------------------------------------- */
/*                                MODIFICATION                                */
/* -------------------------------------------------------------------------- */

export async function updateAdminVipReward(
  rawValue: unknown,
  actorId: string,
): Promise<AdminVipReward> {
  const actor =
    await assertVipRewardActor(
      actorId,
    );

  const input =
    parseRewardForm(
      rawValue,
    );

  if (!input.id) {
    throw new AdminVipRewardValidationError(
      "La récompense à modifier est introuvable.",
      {
        id: [
          "L’identifiant de la récompense est absent.",
        ],
      },
    );
  }

  const existingReward =
    await prisma.vipReward.findUnique({
      where: {
        id:
          input.id,
      },

      select:
        adminVipRewardSelect,
    });

  if (!existingReward) {
    throw new Error(
      "La récompense VIP demandée est introuvable.",
    );
  }

  await Promise.all([
    assertRewardSlugAvailable(
      input.slug,
      existingReward.id,
    ),

    assertRewardReferences(
      input,
    ),
  ]);

  const updatedReward =
    await prisma.$transaction(
      async (
        transaction,
      ) => {
        const reward =
          await transaction.vipReward.update({
            where: {
              id:
                existingReward.id,
            },

            data:
              buildRewardData(
                input,
                existingReward,
              ),

            select:
              adminVipRewardSelect,
          });

        await transaction.vipAuditLog.create({
          data: {
            actorId:
              actor.id,

            action:
              "VIP_REWARD_UPDATED",

            category:
              "VIP_REWARD",

            entityType:
              "VipReward",

            entityId:
              reward.id,

            entityReference:
              reward.slug,

            previousData:
              toInputJsonValue(
                getRewardSnapshot(
                  existingReward,
                ),
              ),

            nextData:
              toInputJsonValue(
                getRewardSnapshot(
                  reward,
                ),
              ),

            metadata:
              toInputJsonValue({
                actorName:
                  actor.displayName,
              }),

            route:
              "/admin/fidelite/recompenses",

            method:
              "SERVER_ACTION",

            success:
              true,
          },
        });

        return reward;
      },
      {
        isolationLevel:
          "Serializable",
      },
    );

  const context =
    await getRewardSerializationContext();

  return serializeReward(
    updatedReward,
    context,
  );
}

/* -------------------------------------------------------------------------- */
/*                              SUPPRESSION                                   */
/* -------------------------------------------------------------------------- */

export async function deleteAdminVipReward(
  rawValue: unknown,
  actorId: string,
): Promise<{
  rewardId: string;
}> {
  const actor =
    await assertVipRewardActor(
      actorId,
    );

  const input =
    parseRewardDelete(
      rawValue,
    );

  return prisma.$transaction(
    async (
      transaction,
    ) => {
      const reward =
        await transaction.vipReward.findUnique({
          where: {
            id:
              input.rewardId,
          },

          select:
            adminVipRewardSelect,
        });

      if (!reward) {
        throw new Error(
          "La récompense VIP demandée est introuvable.",
        );
      }

      if (
        ![
          "DRAFT",
          "ARCHIVED",
        ].includes(
          reward.status,
        )
      ) {
        throw new AdminVipRewardValidationError(
          "Cette récompense doit être archivée avant sa suppression.",
          {
            rewardId: [
              "Seules les récompenses en brouillon ou archivées peuvent être supprimées.",
            ],
          },
        );
      }

      const shopItemCount =
        await transaction.vipShopItem.count({
          where: {
            rewardId:
              reward.id,
          },
        });

      const blockingRelations = {
        clientRewards:
          reward._count.clientRewards,

        badges:
          reward._count.badges,

        achievements:
          reward._count.achievements,

        shopItems:
          shopItemCount,
      };

      const isUsed =
        Object.values(
          blockingRelations,
        ).some(
          (
            count,
          ) =>
            count >
            0,
        );

      if (
        isUsed
      ) {
        throw new AdminVipRewardValidationError(
          "Cette récompense est déjà utilisée et ne peut pas être supprimée.",
          {
            rewardId: [
              `Attributions : ${blockingRelations.clientRewards}, badges : ${blockingRelations.badges}, succès : ${blockingRelations.achievements}, boutique : ${blockingRelations.shopItems}. Conservez-la comme récompense archivée.`,
            ],
          },
        );
      }

      const snapshot =
        getRewardSnapshot(
          reward,
        );

      await transaction.vipReward.delete({
        where: {
          id:
            reward.id,
        },
      });

      await transaction.vipAuditLog.create({
        data: {
          actorId:
            actor.id,

          action:
            "VIP_REWARD_DELETED",

          category:
            "VIP_REWARD",

          entityType:
            "VipReward",

          entityId:
            reward.id,

          entityReference:
            reward.slug,

          previousData:
            toInputJsonValue(
              snapshot,
            ),

          metadata:
            toInputJsonValue({
              actorName:
                actor.displayName,

              reason:
                input.reason,
            }),

          route:
            "/admin/fidelite/recompenses",

          method:
            "SERVER_ACTION",

          success:
            true,
        },
      });

      return {
        rewardId:
          reward.id,
      };
    },
    {
      isolationLevel:
        "Serializable",
    },
  );
}
