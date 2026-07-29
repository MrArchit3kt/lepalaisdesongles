import type {
  Prisma,
} from "@/generated/prisma/client";

import {
  adminVipAppointmentRulesSchema,
} from "@/features/admin/vip/schemas/admin-vip-appointment-rules.schema";

import type {
  AdminVipAppointmentRulesInput,
} from "@/features/admin/vip/schemas/admin-vip-appointment-rules.schema";

import type {
  AdminVipAppointmentRulesSettings,
  AdminVipAppointmentRulesConfiguration,
} from "@/features/admin/vip/types/admin-vip-appointment-rules.types";

import {
  prisma,
} from "@/lib/prisma";

/* -------------------------------------------------------------------------- */
/*                                CONSTANTES                                  */
/* -------------------------------------------------------------------------- */

const POINTS_RULE_SLUG =
  "system-appointment-completed-points-per-euro";

const XP_RULE_SLUG =
  "system-appointment-completed-fixed-xp";

/* -------------------------------------------------------------------------- */
/*                                  ERREUR                                    */
/* -------------------------------------------------------------------------- */

export class AdminVipAppointmentRulesValidationError
  extends Error {
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
    super(
      message,
    );

    this.name =
      "AdminVipAppointmentRulesValidationError";

    this.fieldErrors =
      fieldErrors;
  }
}

/* -------------------------------------------------------------------------- */
/*                                SÉLECTION                                   */
/* -------------------------------------------------------------------------- */

const systemRuleSelect = {
  id:
    true,

  name:
    true,

  slug:
    true,

  status:
    true,

  trigger:
    true,

  action:
    true,

  pointsAmount:
    true,

  xpAmount:
    true,

  conditions:
    true,

  actionConfiguration:
    true,

  executionCount:
    true,

  successCount:
    true,

  failureCount:
    true,

  lastExecutedAt:
    true,

  updatedAt:
    true,
} satisfies Prisma.VipAutomationRuleSelect;

type SystemRuleRow =
  Prisma.VipAutomationRuleGetPayload<{
    select:
      typeof systemRuleSelect;
  }>;

/* -------------------------------------------------------------------------- */
/*                                  JSON                                      */
/* -------------------------------------------------------------------------- */

type JsonRecord =
  Record<
    string,
    unknown
  >;

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
  value: unknown,
  key: string,
): number | null {
  const record =
    asRecord(
      value,
    );

  const candidate =
    record[key];

  if (
    typeof candidate ===
      "number" &&
    Number.isFinite(
      candidate,
    )
  ) {
    return candidate;
  }

  if (
    typeof candidate ===
      "string" &&
    candidate.trim()
  ) {
    const parsed =
      Number(
        candidate,
      );

    return Number.isFinite(
      parsed,
    )
      ? parsed
      : null;
  }

  return null;
}

/* -------------------------------------------------------------------------- */
/*                              VALIDATION                                    */
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

function parseInput(
  rawValue: unknown,
): AdminVipAppointmentRulesInput {
  const result =
    adminVipAppointmentRulesSchema.safeParse(
      rawValue,
    );

  if (
    result.success
  ) {
    return result.data;
  }

  throw new AdminVipAppointmentRulesValidationError(
    "La configuration des gains automatiques contient des erreurs.",
    normalizeFieldErrors(
      result.error.flatten()
        .fieldErrors,
    ),
  );
}

/* -------------------------------------------------------------------------- */
/*                            ACTEUR ADMIN                                    */
/* -------------------------------------------------------------------------- */

async function requireRuleAdministrator(
  actorId: string,
) {
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
      "Accès à la configuration des automatisations VIP refusé.",
    );
  }

  return actor;
}

function getActorName(
  actor: {
    firstName: string;
    lastName: string;
    email: string;
  },
): string {
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
/*                       CRÉATION DES RÈGLES SYSTÈME                          */
/* -------------------------------------------------------------------------- */

async function ensureSystemRules(
  transaction: Prisma.TransactionClient,
): Promise<{
  pointsRule: SystemRuleRow;
  xpRule: SystemRuleRow;
}> {
  const pointsRule =
    await transaction.vipAutomationRule.upsert({
      where: {
        slug:
          POINTS_RULE_SLUG,
      },

      create: {
        name:
          "Points par euro dépensé",

        slug:
          POINTS_RULE_SLUG,

        description:
          "Attribue automatiquement des points pour chaque euro facturé lors d’un rendez-vous terminé.",

        status:
          "PAUSED",

        trigger:
          "APPOINTMENT_COMPLETED",

        action:
          "ADD_POINTS",

        priority:
          100,

        pointsAmount:
          0,

        conditions:
          toJsonValue({
            minimumSpendCents:
              0,

            paymentStatuses:
              [],
          }),

        actionConfiguration:
          toJsonValue({
            mode:
              "PER_EURO",

            amountPerEuro:
              0,
          }),

        isSystemRule:
          true,

        metadata:
          toJsonValue({
            systemKey:
              "APPOINTMENT_POINTS_PER_EURO",

            editable:
              true,
          }),
      },

      update: {
        trigger:
          "APPOINTMENT_COMPLETED",

        action:
          "ADD_POINTS",

        isSystemRule:
          true,
      },

      select:
        systemRuleSelect,
    });

  const xpRule =
    await transaction.vipAutomationRule.upsert({
      where: {
        slug:
          XP_RULE_SLUG,
      },

      create: {
        name:
          "XP par rendez-vous terminé",

        slug:
          XP_RULE_SLUG,

        description:
          "Attribue automatiquement une quantité fixe d’XP lorsqu’un rendez-vous est terminé.",

        status:
          "PAUSED",

        trigger:
          "APPOINTMENT_COMPLETED",

        action:
          "ADD_XP",

        priority:
          90,

        xpAmount:
          0,

        conditions:
          toJsonValue({
            minimumSpendCents:
              0,

            paymentStatuses:
              [],
          }),

        actionConfiguration:
          toJsonValue({
            mode:
              "FIXED",

            amount:
              0,
          }),

        isSystemRule:
          true,

        metadata:
          toJsonValue({
            systemKey:
              "APPOINTMENT_FIXED_XP",

            editable:
              true,
          }),
      },

      update: {
        trigger:
          "APPOINTMENT_COMPLETED",

        action:
          "ADD_XP",

        isSystemRule:
          true,
      },

      select:
        systemRuleSelect,
    });

  return {
    pointsRule,
    xpRule,
  };
}

/* -------------------------------------------------------------------------- */
/*                            SÉRIALISATION                                   */
/* -------------------------------------------------------------------------- */

function serializeConfiguration(
  configuration: {
    programStatus:
      | "DISABLED"
      | "PRE_LAUNCH"
      | "ACTIVE"
      | "PAUSED";

    clubEnabled: boolean;
    automaticRulesEnabled: boolean;
    xpEnabled: boolean;

    notificationsEnabled: boolean;
    notifyOnXpEarned: boolean;
  } | null,
): AdminVipAppointmentRulesConfiguration {
  return {
    programStatus:
      configuration
        ?.programStatus ??
      "DISABLED",

    clubEnabled:
      configuration
        ?.clubEnabled ??
      false,

    automaticRulesEnabled:
      configuration
        ?.automaticRulesEnabled ??
      false,

    xpEnabled:
      configuration
        ?.xpEnabled ??
      false,

    notificationsEnabled:
      configuration
        ?.notificationsEnabled ??
      false,

    notifyOnXpEarned:
      configuration
        ?.notifyOnXpEarned ??
      false,
  };
}

function serializeSettings(
  input: {
    pointsRule: SystemRuleRow;
    xpRule: SystemRuleRow;

    configuration: AdminVipAppointmentRulesConfiguration;
  },
): AdminVipAppointmentRulesSettings {
  const pointsConditions =
    asRecord(
      input.pointsRule
        .conditions,
    );

  const pointsConfiguration =
    asRecord(
      input.pointsRule
        .actionConfiguration,
    );

  const xpConfiguration =
    asRecord(
      input.xpRule
        .actionConfiguration,
    );

  const paymentStatuses =
    pointsConditions[
      "paymentStatuses"
    ];

  return {
    generatedAt:
      new Date()
        .toISOString(),

    minimumSpendCents:
      readNumber(
        pointsConditions,
        "minimumSpendCents",
      ),

    onlyPaidAppointments:
      Array.isArray(
        paymentStatuses,
      ) &&
      paymentStatuses.includes(
        "PAID",
      ),

    configuration:
      input.configuration,

    pointsRule: {
      id:
        input.pointsRule.id,

      name:
        input.pointsRule.name,

      slug:
        input.pointsRule.slug,

      status:
        input.pointsRule.status,

      enabled:
        input.pointsRule.status ===
        "ACTIVE",

      pointsPerEuro:
        readNumber(
          pointsConfiguration,
          "amountPerEuro",
        ) ??
        input.pointsRule.pointsAmount ??
        0,

      executionCount:
        input.pointsRule
          .executionCount,

      successCount:
        input.pointsRule
          .successCount,

      failureCount:
        input.pointsRule
          .failureCount,

      lastExecutedAt:
        input.pointsRule
          .lastExecutedAt
          ?.toISOString() ??
        null,

      updatedAt:
        input.pointsRule
          .updatedAt
          .toISOString(),
    },

    xpRule: {
      id:
        input.xpRule.id,

      name:
        input.xpRule.name,

      slug:
        input.xpRule.slug,

      status:
        input.xpRule.status,

      enabled:
        input.xpRule.status ===
        "ACTIVE",

      xpPerCompletedAppointment:
        readNumber(
          xpConfiguration,
          "amount",
        ) ??
        input.xpRule.xpAmount ??
        0,

      executionCount:
        input.xpRule
          .executionCount,

      successCount:
        input.xpRule
          .successCount,

      failureCount:
        input.xpRule
          .failureCount,

      lastExecutedAt:
        input.xpRule
          .lastExecutedAt
          ?.toISOString() ??
        null,

      updatedAt:
        input.xpRule
          .updatedAt
          .toISOString(),
    },
  };
}

/* -------------------------------------------------------------------------- */
/*                              LECTURE PAGE                                  */
/* -------------------------------------------------------------------------- */

export async function getAdminVipAppointmentRulesSettings():
  Promise<AdminVipAppointmentRulesSettings> {
  return prisma.$transaction(
    async (
      transaction,
    ) => {
      const {
        pointsRule,
        xpRule,
      } =
        await ensureSystemRules(
          transaction,
        );

      const configuration =
        await transaction.vipConfiguration.findUnique({
          where: {
            key:
              "default",
          },

          select: {
            programStatus:
              true,

            clubEnabled:
              true,

            automaticRulesEnabled:
              true,

            xpEnabled:
              true,

            notificationsEnabled:
              true,

            notifyOnXpEarned:
              true,
          },
        });

      return serializeSettings({
        pointsRule,
        xpRule,

        configuration:
          serializeConfiguration(
            configuration,
          ),
      });
    },
  );
}

/* -------------------------------------------------------------------------- */
/*                            MISE À JOUR                                     */
/* -------------------------------------------------------------------------- */

export async function updateAdminVipAppointmentRulesSettings(
  rawValue: unknown,
  actorId: string,
): Promise<void> {
  const input =
    parseInput(
      rawValue,
    );

  const actor =
    await requireRuleAdministrator(
      actorId,
    );

  await prisma.$transaction(
    async (
      transaction,
    ) => {
      const {
        pointsRule,
        xpRule,
      } =
        await ensureSystemRules(
          transaction,
        );

      const conditions =
        toJsonValue({
          minimumSpendCents:
            input.minimumSpendCents ??
            0,

          paymentStatuses:
            input.onlyPaidAppointments
              ? [
                  "PAID",
                ]
              : [],
        });

      const updatedPointsRule =
        await transaction.vipAutomationRule.update({
          where: {
            id:
              pointsRule.id,
          },

          data: {
            status:
              input.pointsRuleEnabled
                ? "ACTIVE"
                : "PAUSED",

            pointsAmount:
              input.pointsPerEuro,

            conditions,

            actionConfiguration:
              toJsonValue({
                mode:
                  "PER_EURO",

                amountPerEuro:
                  input.pointsPerEuro,
              }),

            metadata:
              toJsonValue({
                systemKey:
                  "APPOINTMENT_POINTS_PER_EURO",

                editable:
                  true,

                lastConfiguredBy:
                  actor.id,

                lastConfiguredAt:
                  new Date()
                    .toISOString(),
              }),
          },

          select:
            systemRuleSelect,
        });

      const updatedXpRule =
        await transaction.vipAutomationRule.update({
          where: {
            id:
              xpRule.id,
          },

          data: {
            status:
              input.xpRuleEnabled
                ? "ACTIVE"
                : "PAUSED",

            xpAmount:
              input.xpPerCompletedAppointment,

            conditions,

            actionConfiguration:
              toJsonValue({
                mode:
                  "FIXED",

                amount:
                  input.xpPerCompletedAppointment,
              }),

            metadata:
              toJsonValue({
                systemKey:
                  "APPOINTMENT_FIXED_XP",

                editable:
                  true,

                lastConfiguredBy:
                  actor.id,

                lastConfiguredAt:
                  new Date()
                    .toISOString(),
              }),
          },

          select:
            systemRuleSelect,
        });

      await transaction.vipAuditLog.create({
        data: {
          actorId:
            actor.id,

          action:
            "VIP_APPOINTMENT_RULES_UPDATED",

          category:
            "VIP_AUTOMATION",

          entityType:
            "VipAutomationRule",

          entityId:
            pointsRule.id,

          entityReference:
            "appointment-completed-system-rules",

          previousData:
            toJsonValue({
              pointsRule: {
                status:
                  pointsRule.status,

                pointsAmount:
                  pointsRule.pointsAmount,

                actionConfiguration:
                  pointsRule.actionConfiguration,

                conditions:
                  pointsRule.conditions,
              },

              xpRule: {
                status:
                  xpRule.status,

                xpAmount:
                  xpRule.xpAmount,

                actionConfiguration:
                  xpRule.actionConfiguration,

                conditions:
                  xpRule.conditions,
              },
            }),

          nextData:
            toJsonValue({
              pointsRule: {
                id:
                  updatedPointsRule.id,

                status:
                  updatedPointsRule.status,

                pointsAmount:
                  updatedPointsRule.pointsAmount,

                actionConfiguration:
                  updatedPointsRule.actionConfiguration,

                conditions:
                  updatedPointsRule.conditions,
              },

              xpRule: {
                id:
                  updatedXpRule.id,

                status:
                  updatedXpRule.status,

                xpAmount:
                  updatedXpRule.xpAmount,

                actionConfiguration:
                  updatedXpRule.actionConfiguration,

                conditions:
                  updatedXpRule.conditions,
              },
            }),

          metadata:
            toJsonValue({
              actorName:
                getActorName(
                  actor,
                ),

              onlyPaidAppointments:
                input.onlyPaidAppointments,

              minimumSpendCents:
                input.minimumSpendCents,
            }),

          route:
            "/admin/fidelite/automatisations",

          method:
            "SERVER_ACTION",

          success:
            true,
        },
      });
    },
  );
}
