import {
  z,
} from "zod";

/* -------------------------------------------------------------------------- */
/*                                  OUTILS                                    */
/* -------------------------------------------------------------------------- */

const requiredText = (
  label: string,
  maximumLength: number,
) =>
  z
    .string()
    .trim()
    .min(
      1,
      `${label} est obligatoire.`,
    )
    .max(
      maximumLength,
      `${label} ne peut pas dépasser ${maximumLength} caractères.`,
    );

const nullableText = (
  maximumLength: number,
) =>
  z
    .string()
    .trim()
    .max(
      maximumLength,
      `Ce champ ne peut pas dépasser ${maximumLength} caractères.`,
    )
    .nullable();

const nullableUrl =
  z
    .string()
    .trim()
    .max(
      2048,
      "L’adresse URL est trop longue.",
    )
    .nullable()
    .refine(
      (value) => {
        if (
          value === null ||
          value === ""
        ) {
          return true;
        }

        try {
          const url =
            new URL(value);

          return (
            url.protocol ===
              "http:" ||
            url.protocol ===
              "https:"
          );
        } catch {
          return false;
        }
      },
      {
        message:
          "L’adresse doit commencer par http:// ou https://.",
      },
    )
    .transform(
      (value) =>
        value === ""
          ? null
          : value,
    );

const nullableColor =
  z
    .string()
    .trim()
    .nullable()
    .refine(
      (value) =>
        value === null ||
        value === "" ||
        /^#[0-9a-fA-F]{6}$/.test(
          value,
        ),
      {
        message:
          "La couleur doit être au format #ec1763.",
      },
    )
    .transform(
      (value) =>
        value === ""
          ? null
          : value,
    );

const nullableInteger = (
  label: string,
  minimum: number,
  maximum: number,
) =>
  z
    .number()
    .int(
      `${label} doit être un nombre entier.`,
    )
    .min(
      minimum,
      `${label} doit être supérieur ou égal à ${minimum}.`,
    )
    .max(
      maximum,
      `${label} ne peut pas dépasser ${maximum}.`,
    )
    .nullable();

/* -------------------------------------------------------------------------- */
/*                              CONFIGURATION                                 */
/* -------------------------------------------------------------------------- */

export const adminVipConfigurationSchema =
  z
    .object({
      programStatus:
        z.enum([
          "DISABLED",
          "PRE_LAUNCH",
          "ACTIVE",
          "PAUSED",
        ]),

      clubEnabled:
        z.boolean(),

      showPreLaunchPage:
        z.boolean(),

      showInPublicMenu:
        z.boolean(),

      showInClientMenu:
        z.boolean(),

      allowNewRegistrations:
        z.boolean(),

      clubName:
        requiredText(
          "Le nom du Club VIP",
          120,
        ),

      pointsLabel:
        requiredText(
          "Le nom des points",
          40,
        ),

      xpLabel:
        requiredText(
          "Le nom de l’expérience",
          40,
        ),

      logoUrl:
        nullableUrl,

      iconUrl:
        nullableUrl,

      bannerUrl:
        nullableUrl,

      backgroundUrl:
        nullableUrl,

      primaryColor:
        nullableColor,

      secondaryColor:
        nullableColor,

      accentColor:
        nullableColor,

      preLaunchTitle:
        nullableText(
          160,
        ),

      preLaunchDescription:
        nullableText(
          2000,
        ),

      preLaunchImageUrl:
        nullableUrl,

      preLaunchButtonLabel:
        nullableText(
          80,
        ),

      preLaunchButtonUrl:
        nullableUrl,

      publicTitle:
        nullableText(
          160,
        ),

      publicDescription:
        nullableText(
          3000,
        ),

      publicImageUrl:
        nullableUrl,

      termsUrl:
        nullableUrl,

      privacyMessage:
        nullableText(
          3000,
        ),

      legalNotice:
        nullableText(
          3000,
        ),

      minimumAge:
        nullableInteger(
          "L’âge minimum",
          0,
          120,
        ),

      publicLeaderboardEnabled:
        z.boolean(),

      leaderboardVisibility:
        z.enum([
          "PRIVATE",
          "MEMBERS_ONLY",
          "PUBLIC",
        ]),

      anonymizeLeaderboard:
        z.boolean(),

      leaderboardSize:
        z
          .number()
          .int(
            "La taille du classement doit être un nombre entier.",
          )
          .min(
            1,
            "Le classement doit contenir au moins une membre.",
          )
          .max(
            100,
            "Le classement ne peut pas dépasser 100 membres.",
          ),

      baseXpMultiplier:
        z
          .number()
          .min(
            0,
            "Le multiplicateur XP ne peut pas être négatif.",
          )
          .max(
            100,
            "Le multiplicateur XP ne peut pas dépasser 100.",
          ),

      basePointsMultiplier:
        z
          .number()
          .min(
            0,
            "Le multiplicateur de points ne peut pas être négatif.",
          )
          .max(
            100,
            "Le multiplicateur de points ne peut pas dépasser 100.",
          ),

      pointsExpirationEnabled:
        z.boolean(),

      pointsExpirationMonths:
        nullableInteger(
          "La durée de validité des points",
          1,
          120,
        ),

      xpExpirationEnabled:
        z.boolean(),

      xpExpirationMonths:
        nullableInteger(
          "La durée de validité des XP",
          1,
          120,
        ),

      rewardsExpirationEnabled:
        z.boolean(),

      defaultRewardValidityDays:
        nullableInteger(
          "La durée de validité des récompenses",
          1,
          3650,
        ),

      modules:
        z.object({
          xpEnabled:
            z.boolean(),

          levelsEnabled:
            z.boolean(),

          badgesEnabled:
            z.boolean(),

          achievementsEnabled:
            z.boolean(),

          rewardsEnabled:
            z.boolean(),

          contestsEnabled:
            z.boolean(),

          challengesEnabled:
            z.boolean(),

          referralsEnabled:
            z.boolean(),

          teamsEnabled:
            z.boolean(),

          collectionsEnabled:
            z.boolean(),

          seasonPassEnabled:
            z.boolean(),

          vipShopEnabled:
            z.boolean(),

          dailyWheelEnabled:
            z.boolean(),

          giftChestsEnabled:
            z.boolean(),

          giftingEnabled:
            z.boolean(),
        }),

      notifications:
        z.object({
          notificationsEnabled:
            z.boolean(),

          notifyOnXpEarned:
            z.boolean(),

          notifyOnLevelUp:
            z.boolean(),

          notifyOnBadgeUnlocked:
            z.boolean(),

          notifyOnAchievement:
            z.boolean(),

          notifyOnRewardUnlocked:
            z.boolean(),

          notifyOnContestUpdate:
            z.boolean(),

          notifyOnRankingChange:
            z.boolean(),

          notifyOnSeasonProgress:
            z.boolean(),

          notifyOnReferralQualified:
            z.boolean(),

          notifyOnRewardExpiration:
            z.boolean(),
        }),

      automations:
        z.object({
          automaticRulesEnabled:
            z.boolean(),

          automaticBirthdayRewardsEnabled:
            z.boolean(),

          automaticAnniversaryRewardsEnabled:
            z.boolean(),

          automaticInactiveClientRules:
            z.boolean(),

          automaticSeasonActivationEnabled:
            z.boolean(),

          automaticContestActivationEnabled:
            z.boolean(),
        }),

      assistant:
        z.object({
          assistantEnabled:
            z.boolean(),

          assistantMode:
            z.enum([
              "DISABLED",
              "ADVICE_ONLY",
              "SEMI_AUTOMATIC",
            ]),

          assistantPlanningAnalysisEnabled:
            z.boolean(),

          assistantRetentionAnalysisEnabled:
            z.boolean(),

          assistantContestAnalysisEnabled:
            z.boolean(),

          assistantRevenueAnalysisEnabled:
            z.boolean(),

          assistantCancellationAnalysisEnabled:
            z.boolean(),

          assistantReferralAnalysisEnabled:
            z.boolean(),
        }),
    })
    .superRefine(
      (
        value,
        context,
      ) => {
        if (
          value.programStatus ===
            "ACTIVE" &&
          !value.clubEnabled
        ) {
          context.addIssue({
            code:
              "custom",

            path: [
              "clubEnabled",
            ],

            message:
              "Le Club VIP doit être activé avant son lancement.",
          });
        }

        if (
          value.allowNewRegistrations &&
          !value.clubEnabled
        ) {
          context.addIssue({
            code:
              "custom",

            path: [
              "allowNewRegistrations",
            ],

            message:
              "Le Club VIP doit être activé pour ouvrir les inscriptions.",
          });
        }

        if (
          value.pointsExpirationEnabled &&
          value.pointsExpirationMonths ===
            null
        ) {
          context.addIssue({
            code:
              "custom",

            path: [
              "pointsExpirationMonths",
            ],

            message:
              "Indiquez la durée de validité des points.",
          });
        }

        if (
          value.xpExpirationEnabled &&
          value.xpExpirationMonths ===
            null
        ) {
          context.addIssue({
            code:
              "custom",

            path: [
              "xpExpirationMonths",
            ],

            message:
              "Indiquez la durée de validité des XP.",
          });
        }

        if (
          value.rewardsExpirationEnabled &&
          value.defaultRewardValidityDays ===
            null
        ) {
          context.addIssue({
            code:
              "custom",

            path: [
              "defaultRewardValidityDays",
            ],

            message:
              "Indiquez la durée de validité des récompenses.",
          });
        }

        if (
          value.assistant.assistantEnabled &&
          value.assistant.assistantMode ===
            "DISABLED"
        ) {
          context.addIssue({
            code:
              "custom",

            path: [
              "assistant",
              "assistantMode",
            ],

            message:
              "Sélectionnez un mode lorsque l’assistant est activé.",
          });
        }
      },
    );

/* -------------------------------------------------------------------------- */
/*                           AJUSTEMENT MANUEL                                */
/* -------------------------------------------------------------------------- */

export const adminVipAdjustmentSchema =
  z
    .object({
      accountId:
        z
          .string()
          .trim()
          .min(
            1,
            "La membre VIP est obligatoire.",
          ),

      adjustmentType:
        z.enum([
          "ADD",
          "REMOVE",
          "SET",
        ]),

      points:
        z
          .number()
          .int(
            "Le nombre de points doit être entier.",
          )
          .min(
            0,
            "Le nombre de points ne peut pas être négatif.",
          )
          .max(
            10000000,
            "Le nombre de points est trop élevé.",
          ),

      experience:
        z
          .number()
          .int(
            "Le nombre de XP doit être entier.",
          )
          .min(
            0,
            "Le nombre de XP ne peut pas être négatif.",
          )
          .max(
            10000000,
            "Le nombre de XP est trop élevé.",
          ),

      title:
        requiredText(
          "Le titre",
          160,
        ),

      reason:
        requiredText(
          "Le motif",
          1000,
        ),
    })
    .superRefine(
      (
        value,
        context,
      ) => {
        if (
          value.points === 0 &&
          value.experience === 0 &&
          value.adjustmentType !==
            "SET"
        ) {
          context.addIssue({
            code:
              "custom",

            path: [
              "points",
            ],

            message:
              "Indiquez au moins un nombre de points ou de XP à modifier.",
          });
        }
      },
    );

export type AdminVipConfigurationInput =
  z.infer<
    typeof adminVipConfigurationSchema
  >;

export type AdminVipAdjustmentSchemaInput =
  z.infer<
    typeof adminVipAdjustmentSchema
  >;
