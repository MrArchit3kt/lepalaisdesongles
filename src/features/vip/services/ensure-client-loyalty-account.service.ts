import "server-only";

import {
  randomUUID,
} from "node:crypto";

import {
  prisma,
} from "@/lib/prisma";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

export type EnsuredClientLoyaltyAccount = {
  id: string;
  userId: string;

  memberNumber: string;
  referralCode: string;

  isActive: boolean;
  isSuspended: boolean;

  points: number;
  experience: number;

  currentLevel: {
    id: string;
    name: string;
    level: number;
    color: string | null;
    icon: string | null;
  } | null;

  joinedAt: Date;
};

/* -------------------------------------------------------------------------- */
/*                                 SÉLECTION                                  */
/* -------------------------------------------------------------------------- */

const ensuredAccountSelect = {
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

  points:
    true,

  experience:
    true,

  joinedAt:
    true,

  currentLevel: {
    select: {
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
    },
  },
} as const;

/* -------------------------------------------------------------------------- */
/*                                  OUTILS                                    */
/* -------------------------------------------------------------------------- */

function normalizeUserId(
  userId: string,
): string {
  const normalized =
    userId.trim();

  if (
    !normalized
  ) {
    throw new Error(
      "L’identifiant de la cliente est obligatoire.",
    );
  }

  return normalized;
}

function createMemberNumber():
  string {
  const datePart =
    new Date()
      .toISOString()
      .slice(
        2,
        10,
      )
      .replaceAll(
        "-",
        "",
      );

  const randomPart =
    randomUUID()
      .replaceAll(
        "-",
        "",
      )
      .slice(
        0,
        8,
      )
      .toUpperCase();

  return `VIP-${datePart}-${randomPart}`;
}

function createReferralCode(
  firstName: string,
  lastName: string,
): string {
  const identityPart =
    `${firstName}${lastName}`
      .normalize(
        "NFD",
      )
      .replace(
        /[\u0300-\u036f]/g,
        "",
      )
      .replace(
        /[^a-zA-Z0-9]/g,
        "",
      )
      .toUpperCase()
      .slice(
        0,
        6,
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
        8,
      )
      .toUpperCase();

  return `${identityPart}-${randomPart}`;
}

function isUniqueConstraintError(
  error: unknown,
): boolean {
  if (
    typeof error !==
      "object" ||
    error ===
      null ||
    !(
      "code" in
      error
    )
  ) {
    return false;
  }

  return (
    error as {
      code?: unknown;
    }
  ).code ===
    "P2002";
}

/* -------------------------------------------------------------------------- */
/*                        CRÉATION AUTOMATIQUE DU COMPTE                       */
/* -------------------------------------------------------------------------- */

export async function ensureClientLoyaltyAccount(
  userId: string,
): Promise<EnsuredClientLoyaltyAccount> {
  const normalizedUserId =
    normalizeUserId(
      userId,
    );

  const existingAccount =
    await prisma.loyaltyAccount.findUnique({
      where: {
        userId:
          normalizedUserId,
      },

      select:
        ensuredAccountSelect,
    });

  if (
    existingAccount
  ) {
    return existingAccount;
  }

  const user =
    await prisma.user.findUnique({
      where: {
        id:
          normalizedUserId,
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

        role:
          true,

        status:
          true,
      },
    });

  if (!user) {
    throw new Error(
      "La cliente associée au compte VIP est introuvable.",
    );
  }

  if (
    user.role !==
    "CLIENT"
  ) {
    throw new Error(
      "Seules les clientes peuvent posséder un compte fidélité.",
    );
  }

  if (
    user.status ===
      "DISABLED" ||
    user.status ===
      "SUSPENDED"
  ) {
    throw new Error(
      "Le compte utilisateur ne permet pas l’activation du Club VIP.",
    );
  }

  const maximumAttempts =
    5;

  for (
    let attempt =
      1;
    attempt <=
    maximumAttempts;
    attempt +=
      1
  ) {
    try {
      return await prisma.$transaction(
        async (
          transaction,
        ) => {
          /*
           * Une deuxième vérification évite de créer deux comptes
           * lorsque plusieurs pages sont chargées simultanément.
           */
          const accountCreatedByAnotherRequest =
            await transaction.loyaltyAccount.findUnique({
              where: {
                userId:
                  normalizedUserId,
              },

              select:
                ensuredAccountSelect,
            });

          if (
            accountCreatedByAnotherRequest
          ) {
            return accountCreatedByAnotherRequest;
          }

          const defaultLevel =
            await transaction.loyaltyLevel.findFirst({
              where: {
                status:
                  "ACTIVE",

                visible:
                  true,
              },

              orderBy: [
                {
                  isDefault:
                    "desc",
                },
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
              },
            });

          const now =
            new Date();

          const account =
            await transaction.loyaltyAccount.create({
              data: {
                userId:
                  normalizedUserId,

                memberNumber:
                  createMemberNumber(),

                referralCode:
                  createReferralCode(
                    user.firstName,
                    user.lastName,
                  ),

                currentLevelId:
                  defaultLevel?.id ??
                  null,

                levelReachedAt:
                  defaultLevel
                    ? now
                    : null,

                joinedAt:
                  now,

                lastLoginAt:
                  now,
              },

              select:
                ensuredAccountSelect,
            });

          if (
            defaultLevel
          ) {
            await transaction.clientLevelHistory.create({
              data: {
                accountId:
                  account.id,

                previousLevelId:
                  null,

                newLevelId:
                  defaultLevel.id,

                experienceAtUpgrade:
                  0,

                pointsAtUpgrade:
                  0,

                upgradedAutomatically:
                  true,

                reason:
                  "Attribution automatique du niveau initial lors de la création du compte fidélité.",

                metadata: {
                  source:
                    "CLIENT_SPACE_INITIALIZATION",

                  initialLevel:
                    true,
                },
              },
            });
          }

          await transaction.vipAuditLog.create({
            data: {
              actorId:
                null,

              action:
                "VIP_MEMBER_ACCOUNT_CREATED",

              category:
                "VIP_MEMBER",

              entityType:
                "LoyaltyAccount",

              entityId:
                account.id,

              entityReference:
                account.memberNumber,

              nextData: {
                userId:
                  account.userId,

                memberNumber:
                  account.memberNumber,

                referralCode:
                  account.referralCode,

                currentLevelId:
                  defaultLevel?.id ??
                  null,
              },

              metadata: {
                source:
                  "CLIENT_SPACE_INITIALIZATION",

                userEmail:
                  user.email,

                defaultLevelName:
                  defaultLevel?.name ??
                  null,
              },

              route:
                "/espace-client",

              method:
                "SERVER",

              success:
                true,
            },
          });

          await transaction.notification.create({
            data: {
              userId:
                normalizedUserId,

              type:
                "SYSTEM",

              title:
                "Bienvenue dans le Club VIP",

              message:
                defaultLevel
                  ? `Votre compte fidélité est actif. Vous commencez au niveau « ${defaultLevel.name} ».`
                  : "Votre compte fidélité est maintenant actif.",

              actionUrl:
                "/espace-client",
            },
          });

          return account;
        },
      );
    } catch (
      error: unknown
    ) {
      if (
        !isUniqueConstraintError(
          error,
        )
      ) {
        throw error;
      }

      /*
       * Le conflit peut provenir d’une requête concurrente ayant déjà
       * créé le compte pour la même cliente.
       */
      const accountCreatedConcurrently =
        await prisma.loyaltyAccount.findUnique({
          where: {
            userId:
              normalizedUserId,
          },

          select:
            ensuredAccountSelect,
        });

      if (
        accountCreatedConcurrently
      ) {
        return accountCreatedConcurrently;
      }

      /*
       * Sinon, le conflit concernait probablement le numéro membre
       * ou le code de parrainage : la boucle génère de nouvelles valeurs.
       */
      if (
        attempt ===
        maximumAttempts
      ) {
        throw new Error(
          "Impossible de générer les identifiants uniques du compte fidélité.",
        );
      }
    }
  }

  throw new Error(
    "Impossible d’initialiser le compte fidélité.",
  );
}
