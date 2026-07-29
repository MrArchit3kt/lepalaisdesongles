import {
  z,
} from "zod";

/* -------------------------------------------------------------------------- */
/*                                  OUTILS                                    */
/* -------------------------------------------------------------------------- */

const accountIdSchema =
  z
    .string()
    .trim()
    .min(
      1,
      "Le compte VIP est obligatoire.",
    );

const requiredReasonSchema =
  z
    .string()
    .trim()
    .min(
      3,
      "Le motif doit contenir au moins 3 caractères.",
    )
    .max(
      1000,
      "Le motif ne peut pas dépasser 1000 caractères.",
    );

const optionalDateTimeSchema =
  z
    .string()
    .trim()
    .refine(
      (value) =>
        value === "" ||
        !Number.isNaN(
          new Date(
            value,
          ).getTime(),
        ),
      {
        message:
          "La date d’expiration n’est pas valide.",
      },
    );

/* -------------------------------------------------------------------------- */
/*                         AJUSTEMENT POINTS / XP                             */
/* -------------------------------------------------------------------------- */

export const adminVipBalanceAdjustmentSchema =
  z
    .object({
      accountId:
        accountIdSchema,

      pointsDelta:
        z
          .number()
          .int(
            "Le nombre de points doit être entier.",
          )
          .min(
            -1000000,
            "La diminution de points est trop élevée.",
          )
          .max(
            1000000,
            "L’ajout de points est trop élevé.",
          ),

      experienceDelta:
        z
          .number()
          .int(
            "Le nombre de XP doit être entier.",
          )
          .min(
            -1000000,
            "La diminution d’XP est trop élevée.",
          )
          .max(
            1000000,
            "L’ajout d’XP est trop élevé.",
          ),

      title:
        z
          .string()
          .trim()
          .min(
            3,
            "Le titre doit contenir au moins 3 caractères.",
          )
          .max(
            160,
            "Le titre ne peut pas dépasser 160 caractères.",
          ),

      reason:
        requiredReasonSchema,
    })
    .superRefine(
      (
        value,
        context,
      ) => {
        if (
          value.pointsDelta ===
            0 &&
          value.experienceDelta ===
            0
        ) {
          context.addIssue({
            code:
              "custom",

            path: [
              "pointsDelta",
            ],

            message:
              "Ajoutez ou retirez au moins un point ou un XP.",
          });

          context.addIssue({
            code:
              "custom",

            path: [
              "experienceDelta",
            ],

            message:
              "Ajoutez ou retirez au moins un point ou un XP.",
          });
        }
      },
    );

/* -------------------------------------------------------------------------- */
/*                          CHANGEMENT DE NIVEAU                              */
/* -------------------------------------------------------------------------- */

export const adminVipMemberLevelChangeSchema =
  z.object({
    accountId:
      accountIdSchema,

    levelId:
      z
        .string()
        .trim()
        .min(
          1,
          "Le niveau VIP est obligatoire.",
        ),

    reason:
      requiredReasonSchema,
  });

/* -------------------------------------------------------------------------- */
/*                           STATUT DU MEMBRE                                 */
/* -------------------------------------------------------------------------- */

export const adminVipMemberStatusSchema =
  z.object({
    accountId:
      accountIdSchema,

    action:
      z.enum([
        "ACTIVATE",
        "DEACTIVATE",
        "SUSPEND",
        "UNSUSPEND",
      ]),

    reason:
      requiredReasonSchema,
  });

/* -------------------------------------------------------------------------- */
/*                       ATTRIBUTION D’UNE RÉCOMPENSE                         */
/* -------------------------------------------------------------------------- */

export const adminVipMemberRewardGrantSchema =
  z.object({
    accountId:
      accountIdSchema,

    rewardId:
      z
        .string()
        .trim()
        .min(
          1,
          "La récompense est obligatoire.",
        ),

    expiresAt:
      optionalDateTimeSchema,

    reason:
      requiredReasonSchema,
  });

/* -------------------------------------------------------------------------- */
/*                                 FILTRES                                    */
/* -------------------------------------------------------------------------- */

export const adminVipMemberFiltersSchema =
  z.object({
    search:
      z
        .string()
        .trim()
        .max(
          200,
          "La recherche est trop longue.",
        ),

    status:
      z.enum([
        "ALL",
        "ACTIVE",
        "SUSPENDED",
        "INACTIVE",
      ]),

    levelId:
      z
        .string()
        .trim()
        .max(
          100,
          "Le filtre de niveau est invalide.",
        ),
  });

/* -------------------------------------------------------------------------- */
/*                                  TYPES                                    */
/* -------------------------------------------------------------------------- */

export type AdminVipBalanceAdjustmentSchemaInput =
  z.infer<
    typeof adminVipBalanceAdjustmentSchema
  >;

export type AdminVipMemberLevelChangeSchemaInput =
  z.infer<
    typeof adminVipMemberLevelChangeSchema
  >;

export type AdminVipMemberStatusSchemaInput =
  z.infer<
    typeof adminVipMemberStatusSchema
  >;

export type AdminVipMemberRewardGrantSchemaInput =
  z.infer<
    typeof adminVipMemberRewardGrantSchema
  >;

export type AdminVipMemberFiltersSchemaInput =
  z.infer<
    typeof adminVipMemberFiltersSchema
  >;
