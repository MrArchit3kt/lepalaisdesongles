import "server-only";

import {
  randomUUID,
} from "node:crypto";

import type {
  Prisma,
} from "@/generated/prisma/client";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

type CompletedAppointmentLoyaltyInput = {
  prisma: Prisma.TransactionClient;

  appointment: {
    id: string;
    reference: string;
    clientId: string;

    totalPriceCents: number;
    paymentStatus: string;

    services: Array<{
      serviceId: string;
    }>;
  };

  actorId: string;
  completedAt: Date;
};

export type CompletedAppointmentLoyaltyResult = {
  alreadyProcessed: boolean;

  accountId: string | null;

  pointsAwarded: number;
  experienceAwarded: number;

  levelUpName: string | null;

  appliedRuleIds: string[];
};

type JsonRecord =
  Record<
    string,
    unknown
  >;

/* -------------------------------------------------------------------------- */
/*                                CONSTANTES                                  */
/* -------------------------------------------------------------------------- */

const COMPLETION_KEY_PREFIX =
  "vip:appointment-completed";

const RULE_KEY_PREFIX =
  "vip:appointment-completed-rule";

const LEVEL_KEY_PREFIX =
  "vip:appointment-level-up";

/* -------------------------------------------------------------------------- */
/*                                  JSON                                      */
/* -------------------------------------------------------------------------- */

function toJsonValue(
  value: unknown,
): Prisma.InputJsonValue {
  return JSON.parse(
    JSON.stringify(
      value,
    ),
  ) as Prisma.InputJsonValue;
}

function asRecord(
  value: unknown,
): JsonRecord {
  if (
    typeof value !==
      "object" ||
    value ===
      null ||
    Array.isArray(
      value,
    )
  ) {
    return {};
  }

  return value as JsonRecord;
}

function readNumber(
  record: JsonRecord,
  keys: string[],
): number | null {
  for (
    const key of keys
  ) {
    const value =
      record[key];

    if (
      typeof value ===
        "number" &&
      Number.isFinite(
        value,
      )
    ) {
      return value;
    }

    if (
      typeof value ===
        "string" &&
      value.trim()
    ) {
      const parsed =
        Number(
          value,
        );

      if (
        Number.isFinite(
          parsed,
        )
      ) {
        return parsed;
      }
    }
  }

  return null;
}

function readString(
  record: JsonRecord,
  keys: string[],
): string | null {
  for (
    const key of keys
  ) {
    const value =
      record[key];

    if (
      typeof value ===
        "string" &&
      value.trim()
    ) {
      return value.trim();
    }
  }

  return null;
}

function readStringArray(
  record: JsonRecord,
  keys: string[],
): string[] {
  for (
    const key of keys
  ) {
    const value =
      record[key];

    if (
      Array.isArray(
        value,
      )
    ) {
      return value
        .filter(
          (
            item,
          ): item is string =>
            typeof item ===
              "string" &&
            item.trim().length >
              0,
        )
        .map(
          (
            item,
          ) =>
            item.trim(),
        );
    }
  }

  return [];
}

/* -------------------------------------------------------------------------- */
/*                                 OUTILS                                     */
/* -------------------------------------------------------------------------- */

function decimalToNumber(
  value: unknown,
): number {
  if (
    typeof value ===
      "number"
  ) {
    return Number.isFinite(
      value,
    )
      ? value
      : 1;
  }

  if (
    typeof value ===
      "object" &&
    value !==
      null &&
    "toString" in value &&
    typeof value.toString ===
      "function"
  ) {
    const parsed =
      Number(
        value.toString(),
      );

    return Number.isFinite(
      parsed,
    )
      ? parsed
      : 1;
  }

  return 1;
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
        10,
      )
      .toUpperCase();

  return `VIP-${datePart}-${randomPart}`;
}

function createReferralCode(
  firstName: string,
  lastName: string,
): string {
  const identity =
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

  return `${identity}-${randomPart}`;
}

function getActorName(
  actor: {
    firstName: string;
    lastName: string;
    email: string;
  } | null,
): string {
  if (!actor) {
    return "Administration";
  }

  return [
    actor.firstName,
    actor.lastName,
  ]
    .filter(Boolean)
    .join(" ")
    .trim() ||
    actor.email;
}

/* -------------------------------------------------------------------------- */
/*                         CONDITIONS DES RÈGLES                              */
/* -------------------------------------------------------------------------- */

function ruleMatchesAppointment(
  conditionsValue: unknown,
  appointment: CompletedAppointmentLoyaltyInput["appointment"],
): boolean {
  const conditions =
    asRecord(
      conditionsValue,
    );

  const minimumSpendCents =
    readNumber(
      conditions,
      [
        "minimumSpendCents",
        "minimumAmountCents",
        "minSpendCents",
      ],
    );

  if (
    minimumSpendCents !==
      null &&
    appointment.totalPriceCents <
      minimumSpendCents
  ) {
    return false;
  }

  const maximumSpendCents =
    readNumber(
      conditions,
      [
        "maximumSpendCents",
        "maximumAmountCents",
        "maxSpendCents",
      ],
    );

  if (
    maximumSpendCents !==
      null &&
    appointment.totalPriceCents >
      maximumSpendCents
  ) {
    return false;
  }

  const requiredServiceIds =
    readStringArray(
      conditions,
      [
        "serviceIds",
        "requiredServiceIds",
      ],
    );

  if (
    requiredServiceIds.length >
      0 &&
    !appointment.services.some(
      (
        service,
      ) =>
        requiredServiceIds.includes(
          service.serviceId,
        ),
    )
  ) {
    return false;
  }

  const paymentStatuses =
    readStringArray(
      conditions,
      [
        "paymentStatuses",
        "allowedPaymentStatuses",
      ],
    );

  if (
    paymentStatuses.length >
      0 &&
    !paymentStatuses.includes(
      appointment.paymentStatus,
    )
  ) {
    return false;
  }

  return true;
}

/* -------------------------------------------------------------------------- */
/*                        CALCUL DU MONTANT D’UNE RÈGLE                        */
/* -------------------------------------------------------------------------- */

function calculateRuleBaseAmount(
  rule: {
    action: string;
    xpAmount: number | null;
    pointsAmount: number | null;
    actionConfiguration: unknown;
  },
  appointment: CompletedAppointmentLoyaltyInput["appointment"],
): {
  points: number;
  experience: number;
} {
  const configuration =
    asRecord(
      rule.actionConfiguration,
    );

  const mode =
    (
      readString(
        configuration,
        [
          "mode",
          "calculationMode",
        ],
      ) ??
      "FIXED"
    ).toUpperCase();

  const configuredAmount =
    rule.action ===
    "ADD_XP"
      ? rule.xpAmount ??
        readNumber(
          configuration,
          [
            "xpAmount",
            "amount",
          ],
        ) ??
        0
      : rule.action ===
          "ADD_POINTS"
        ? rule.pointsAmount ??
          readNumber(
            configuration,
            [
              "pointsAmount",
              "amount",
            ],
          ) ??
          0
        : 0;

  let calculatedAmount =
    configuredAmount;

  if (
    mode ===
      "PER_EURO" ||
    mode ===
      "PER_EUROS_SPENT"
  ) {
    const amountPerEuro =
      readNumber(
        configuration,
        [
          "amountPerEuro",
          "valuePerEuro",
        ],
      ) ??
      configuredAmount;

    const completeEuros =
      Math.floor(
        appointment.totalPriceCents /
          100,
      );

    calculatedAmount =
      completeEuros *
      amountPerEuro;
  }

  calculatedAmount =
    Math.max(
      0,
      Math.round(
        calculatedAmount,
      ),
    );

  return {
    points:
      rule.action ===
      "ADD_POINTS"
        ? calculatedAmount
        : 0,

    experience:
      rule.action ===
      "ADD_XP"
        ? calculatedAmount
        : 0,
  };
}

/* -------------------------------------------------------------------------- */
/*                        INITIALISATION DU COMPTE                            */
/* -------------------------------------------------------------------------- */

async function ensureAccountInTransaction(
  transaction: Prisma.TransactionClient,
  userId: string,
  completedAt: Date,
) {
  const existingAccount =
    await transaction.loyaltyAccount.findUnique({
      where: {
        userId,
      },

      select: {
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

        completedAppointments:
          true,

        totalSpentCents:
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

            xpMultiplier:
              true,

            pointsMultiplier:
              true,
          },
        },
      },
    });

  if (
    existingAccount
  ) {
    return existingAccount;
  }

  const user =
    await transaction.user.findUnique({
      where: {
        id:
          userId,
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

  if (!user) {
    throw new Error(
      "La cliente du rendez-vous est introuvable.",
    );
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

        xpMultiplier:
          true,

        pointsMultiplier:
          true,
      },
    });

  const account =
    await transaction.loyaltyAccount.create({
      data: {
        userId,

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
            ? completedAt
            : null,

        joinedAt:
          completedAt,
      },

      select: {
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

        completedAppointments:
          true,

        totalSpentCents:
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

            xpMultiplier:
              true,

            pointsMultiplier:
              true,
          },
        },
      },
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
          "Attribution automatique du niveau initial.",

        metadata:
          toJsonValue({
            source:
              "APPOINTMENT_COMPLETED",
          }),
      },
    });
  }

  return account;
}

/* -------------------------------------------------------------------------- */
/*                     TRAITEMENT DU RENDEZ-VOUS TERMINÉ                      */
/* -------------------------------------------------------------------------- */

export async function processCompletedAppointmentLoyalty(
  input: CompletedAppointmentLoyaltyInput,
): Promise<CompletedAppointmentLoyaltyResult> {
  const transaction =
    input.prisma;

  const completionKey =
    `${COMPLETION_KEY_PREFIX}:${input.appointment.id}`;

  const existingCompletion =
    await transaction.loyaltyTransaction.findUnique({
      where: {
        idempotencyKey:
          completionKey,
      },

      select: {
        accountId:
          true,
      },
    });

  if (
    existingCompletion
  ) {
    return {
      alreadyProcessed:
        true,

      accountId:
        existingCompletion.accountId,

      pointsAwarded:
        0,

      experienceAwarded:
        0,

      levelUpName:
        null,

      appliedRuleIds:
        [],
    };
  }

  const [
    account,
    configuration,
    actor,
  ] =
    await Promise.all([
      ensureAccountInTransaction(
        transaction,
        input.appointment
          .clientId,
        input.completedAt,
      ),

      transaction.vipConfiguration.findUnique({
        where: {
          key:
            "default",
        },

        select: {
          programStatus:
            true,

          clubEnabled:
            true,

          xpEnabled:
            true,

          levelsEnabled:
            true,

          automaticRulesEnabled:
            true,

          notificationsEnabled:
            true,

          notifyOnXpEarned:
            true,

          notifyOnLevelUp:
            true,

          baseXpMultiplier:
            true,

          basePointsMultiplier:
            true,
        },
      }),

      transaction.user.findUnique({
        where: {
          id:
            input.actorId,
        },

        select: {
          firstName:
            true,

          lastName:
            true,

          email:
            true,
        },
      }),
    ]);

  const actorName =
    getActorName(
      actor,
    );

  /*
   * Cette transaction sert également de verrou d’idempotence.
   * Même sans gain configuré, les statistiques ne seront incrémentées
   * qu’une seule fois.
   */
  await transaction.loyaltyTransaction.create({
    data: {
      userId:
        account.userId,

      accountId:
        account.id,

      type:
        "EARN",

      source:
        "APPOINTMENT_COMPLETED",

      xpAmount:
        0,

      pointsAmount:
        0,

      xpBalanceAfter:
        account.experience,

      pointsBalanceAfter:
        account.points,

      title:
        "Rendez-vous terminé",

      description:
        `Le rendez-vous ${input.appointment.reference} a été terminé.`,

      sourceEntityType:
        "Appointment",

      sourceEntityId:
        input.appointment.id,

      appointmentReference:
        input.appointment.reference,

      idempotencyKey:
        completionKey,

      actorId:
        input.actorId,

      actorName,

      metadata:
        toJsonValue({
          appointmentId:
            input.appointment.id,

          totalPriceCents:
            input.appointment
              .totalPriceCents,

          paymentStatus:
            input.appointment
              .paymentStatus,

          marker:
            true,
        }),
    },
  });

  await transaction.loyaltyAccount.update({
    where: {
      id:
        account.id,
    },

    data: {
      completedAppointments: {
        increment:
          1,
      },

      totalSpentCents: {
        increment:
          Math.max(
            input.appointment
              .totalPriceCents,
            0,
          ),
      },

      lastAppointmentAt:
        input.completedAt,
    },
  });

  const programCanAward =
    configuration?.programStatus ===
      "ACTIVE" &&
    configuration.clubEnabled &&
    configuration.automaticRulesEnabled &&
    account.isActive &&
    !account.isSuspended;

  let totalPointsAwarded =
    0;

  let totalExperienceAwarded =
    0;

  const appliedRuleIds:
    string[] =
    [];

  let currentPoints =
    account.points;

  let currentExperience =
    account.experience;

  if (
    programCanAward
  ) {
    const rules =
      await transaction.vipAutomationRule.findMany({
        where: {
          status:
            "ACTIVE",

          trigger:
            "APPOINTMENT_COMPLETED",

          action: {
            in: [
              "ADD_POINTS",
              "ADD_XP",
            ],
          },

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
                      input.completedAt,
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
                      input.completedAt,
                  },
                },
              ],
            },
          ],
        },

        orderBy: [
          {
            priority:
              "desc",
          },
          {
            createdAt:
              "asc",
          },
        ],

        select: {
          id:
            true,

          name:
            true,

          action:
            true,

          conditions:
            true,

          actionConfiguration:
            true,

          xpAmount:
            true,

          pointsAmount:
            true,

          maximumExecutions:
            true,

          maximumExecutionsPerUser:
            true,

          executionCount:
            true,
        },
      });

    const configurationXpMultiplier =
      decimalToNumber(
        configuration.baseXpMultiplier,
      );

    const configurationPointsMultiplier =
      decimalToNumber(
        configuration.basePointsMultiplier,
      );

    const levelXpMultiplier =
      decimalToNumber(
        account.currentLevel
          ?.xpMultiplier ??
          1,
      );

    const levelPointsMultiplier =
      decimalToNumber(
        account.currentLevel
          ?.pointsMultiplier ??
          1,
      );

    const finalXpMultiplier =
      Math.max(
        0,
        configurationXpMultiplier *
          levelXpMultiplier,
      );

    const finalPointsMultiplier =
      Math.max(
        0,
        configurationPointsMultiplier *
          levelPointsMultiplier,
      );

    for (
      const rule of rules
    ) {
      if (
        rule.maximumExecutions !==
          null &&
        rule.executionCount >=
          rule.maximumExecutions
      ) {
        continue;
      }

      if (
        !ruleMatchesAppointment(
          rule.conditions,
          input.appointment,
        )
      ) {
        continue;
      }

      if (
        rule.maximumExecutionsPerUser !==
        null
      ) {
        const userExecutionCount =
          await transaction.loyaltyTransaction.count({
            where: {
              userId:
                account.userId,

              source:
                "APPOINTMENT_COMPLETED",

              sourceEntityType:
                "VipAutomationRule",

              sourceEntityId:
                rule.id,

              isReversed:
                false,
            },
          });

        if (
          userExecutionCount >=
          rule.maximumExecutionsPerUser
        ) {
          continue;
        }
      }

      const baseAmount =
        calculateRuleBaseAmount(
          rule,
          input.appointment,
        );

      const awardedPoints =
        Math.max(
          0,
          Math.round(
            baseAmount.points *
              finalPointsMultiplier,
          ),
        );

      const awardedExperience =
        configuration.xpEnabled
          ? Math.max(
              0,
              Math.round(
                baseAmount.experience *
                  finalXpMultiplier,
              ),
            )
          : 0;

      if (
        awardedPoints ===
          0 &&
        awardedExperience ===
          0
      ) {
        continue;
      }

      const updatedAccount =
        await transaction.loyaltyAccount.update({
          where: {
            id:
              account.id,
          },

          data: {
            ...(awardedPoints >
            0
              ? {
                  points: {
                    increment:
                      awardedPoints,
                  },

                  totalPointsEarned: {
                    increment:
                      awardedPoints,
                  },
                }
              : {}),

            ...(awardedExperience >
            0
              ? {
                  experience: {
                    increment:
                      awardedExperience,
                  },

                  totalExperienceEarned: {
                    increment:
                      awardedExperience,
                  },

                  lastExperienceEarnedAt:
                    input.completedAt,
                }
              : {}),
          },

          select: {
            points:
              true,

            experience:
              true,
          },
        });

      currentPoints =
        updatedAccount.points;

      currentExperience =
        updatedAccount.experience;

      await transaction.loyaltyTransaction.create({
        data: {
          userId:
            account.userId,

          accountId:
            account.id,

          type:
            "EARN",

          source:
            "APPOINTMENT_COMPLETED",

          xpAmount:
            awardedExperience,

          pointsAmount:
            awardedPoints,

          xpBalanceAfter:
            currentExperience,

          pointsBalanceAfter:
            currentPoints,

          baseXpAmount:
            baseAmount.experience,

          basePointsAmount:
            baseAmount.points,

          xpMultiplier:
            finalXpMultiplier,

          pointsMultiplier:
            finalPointsMultiplier,

          title:
            rule.name,

          description:
            `Gain obtenu après le rendez-vous ${input.appointment.reference}.`,

          sourceEntityType:
            "VipAutomationRule",

          sourceEntityId:
            rule.id,

          appointmentReference:
            input.appointment
              .reference,

          idempotencyKey:
            `${RULE_KEY_PREFIX}:${input.appointment.id}:${rule.id}`,

          actorId:
            input.actorId,

          actorName,

          metadata:
            toJsonValue({
              appointmentId:
                input.appointment.id,

              totalPriceCents:
                input.appointment
                  .totalPriceCents,

              basePoints:
                baseAmount.points,

              baseExperience:
                baseAmount.experience,

              finalPoints:
                awardedPoints,

              finalExperience:
                awardedExperience,
            }),
        },
      });

      await transaction.vipAutomationRule.update({
        where: {
          id:
            rule.id,
        },

        data: {
          executionCount: {
            increment:
              1,
          },

          successCount: {
            increment:
              1,
          },

          lastExecutedAt:
            input.completedAt,
        },
      });

      totalPointsAwarded +=
        awardedPoints;

      totalExperienceAwarded +=
        awardedExperience;

      appliedRuleIds.push(
        rule.id,
      );
    }
  }

  /*
   * Synchronisation de l’ancien champ du profil client pour conserver
   * la compatibilité avec les pages qui l’utilisent encore.
   */
  if (
    totalPointsAwarded >
    0
  ) {
    await transaction.clientProfile.updateMany({
      where: {
        userId:
          account.userId,
      },

      data: {
        loyaltyPoints: {
          increment:
            totalPointsAwarded,
        },
      },
    });
  }

  let levelUpName:
    string | null =
    null;

  if (
    configuration?.levelsEnabled &&
    programCanAward
  ) {
    const qualifyingLevel =
      await transaction.loyaltyLevel.findFirst({
        where: {
          status:
            "ACTIVE",

          visible:
            true,

          requiredXp: {
            lte:
              currentExperience,
          },

          requiredPoints: {
            lte:
              currentPoints,
          },
        },

        orderBy: [
          {
            level:
              "desc",
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

    const currentLevelNumber =
      account.currentLevel
        ?.level ??
      -1;

    if (
      qualifyingLevel &&
      qualifyingLevel.level >
        currentLevelNumber
    ) {
      await transaction.loyaltyAccount.update({
        where: {
          id:
            account.id,
        },

        data: {
          currentLevelId:
            qualifyingLevel.id,

          levelReachedAt:
            input.completedAt,
        },
      });

      await transaction.clientLevelHistory.create({
        data: {
          accountId:
            account.id,

          previousLevelId:
            account.currentLevelId,

          newLevelId:
            qualifyingLevel.id,

          experienceAtUpgrade:
            currentExperience,

          pointsAtUpgrade:
            currentPoints,

          upgradedAutomatically:
            true,

          reason:
            `Niveau atteint après le rendez-vous ${input.appointment.reference}.`,

          metadata:
            toJsonValue({
              appointmentId:
                input.appointment.id,

              appointmentReference:
                input.appointment
                  .reference,
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
            "EARN",

          source:
            "LEVEL_UP",

          xpAmount:
            0,

          pointsAmount:
            0,

          xpBalanceAfter:
            currentExperience,

          pointsBalanceAfter:
            currentPoints,

          title:
            `Niveau ${qualifyingLevel.name} atteint`,

          description:
            "Votre progression VIP vous permet d’accéder à un nouveau niveau.",

          sourceEntityType:
            "LoyaltyLevel",

          sourceEntityId:
            qualifyingLevel.id,

          appointmentReference:
            input.appointment
              .reference,

          idempotencyKey:
            `${LEVEL_KEY_PREFIX}:${input.appointment.id}:${qualifyingLevel.id}`,

          actorId:
            input.actorId,

          actorName,

          metadata:
            toJsonValue({
              previousLevelId:
                account.currentLevelId,

              newLevelId:
                qualifyingLevel.id,

              automatic:
                true,
            }),
        },
      });

      levelUpName =
        qualifyingLevel.name;

      if (
        configuration.notificationsEnabled &&
        configuration.notifyOnLevelUp
      ) {
        await transaction.notification.create({
          data: {
            userId:
              account.userId,

            type:
              "SYSTEM",

            title:
              "Nouveau niveau VIP",

            message:
              `Félicitations, vous avez atteint le niveau « ${qualifyingLevel.name} ».`,

            actionUrl:
              "/espace-client/fidelite",

            metadata:
              toJsonValue({
                accountId:
                  account.id,

                levelId:
                  qualifyingLevel.id,

                appointmentId:
                  input.appointment.id,
              }),
          },
        });
      }
    }
  }

  if (
    configuration?.notificationsEnabled &&
    configuration.notifyOnXpEarned &&
    (
      totalPointsAwarded >
        0 ||
      totalExperienceAwarded >
        0
    )
  ) {
    await transaction.notification.create({
      data: {
        userId:
          account.userId,

        type:
          "SYSTEM",

        title:
          "Vos avantages fidélité ont été crédités",

        message:
          `Votre rendez-vous vous rapporte ${totalPointsAwarded} point(s) et ${totalExperienceAwarded} XP.`,

        actionUrl:
          "/espace-client/fidelite",

        metadata:
          toJsonValue({
            appointmentId:
              input.appointment.id,

            appointmentReference:
              input.appointment
                .reference,

            pointsAwarded:
              totalPointsAwarded,

            experienceAwarded:
              totalExperienceAwarded,

            appliedRuleIds,
          }),
      },
    });
  }

  await transaction.vipAuditLog.create({
    data: {
      actorId:
        input.actorId,

      action:
        "VIP_APPOINTMENT_COMPLETION_PROCESSED",

      category:
        "VIP_MEMBER",

      entityType:
        "LoyaltyAccount",

      entityId:
        account.id,

      entityReference:
        account.memberNumber,

      previousData:
        toJsonValue({
          points:
            account.points,

          experience:
            account.experience,

          completedAppointments:
            account.completedAppointments,

          totalSpentCents:
            account.totalSpentCents,

          levelId:
            account.currentLevelId,
        }),

      nextData:
        toJsonValue({
          points:
            currentPoints,

          experience:
            currentExperience,

          completedAppointments:
            account.completedAppointments +
            1,

          totalSpentCents:
            account.totalSpentCents +
            Math.max(
              input.appointment
                .totalPriceCents,
              0,
            ),

          levelName:
            levelUpName,
        }),

      changes:
        toJsonValue({
          pointsAwarded:
            totalPointsAwarded,

          experienceAwarded:
            totalExperienceAwarded,

          appointmentIncrement:
            1,

          spentIncrementCents:
            Math.max(
              input.appointment
                .totalPriceCents,
              0,
            ),
        }),

      metadata:
        toJsonValue({
          appointmentId:
            input.appointment.id,

          appointmentReference:
            input.appointment
              .reference,

          programCanAward,

          appliedRuleIds,

          actorName,
        }),

      route:
        "/admin/rendez-vous",

      method:
        "SERVER_ACTION",

      success:
        true,
    },
  });

  return {
    alreadyProcessed:
      false,

    accountId:
      account.id,

    pointsAwarded:
      totalPointsAwarded,

    experienceAwarded:
      totalExperienceAwarded,

    levelUpName,

    appliedRuleIds,
  };
}
