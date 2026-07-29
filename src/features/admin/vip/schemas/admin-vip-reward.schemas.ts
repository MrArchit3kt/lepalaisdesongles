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

const optionalText = (
  maximumLength: number,
) =>
  z
    .string()
    .trim()
    .max(
      maximumLength,
      `Ce champ ne peut pas dépasser ${maximumLength} caractères.`,
    );

const optionalUrl =
  z
    .string()
    .trim()
    .max(
      2048,
      "L’adresse URL est trop longue.",
    )
    .refine(
      (value) => {
        if (value === "") {
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
    );

const optionalColor =
  z
    .string()
    .trim()
    .refine(
      (value) =>
        value === "" ||
        /^#[0-9a-fA-F]{6}$/.test(
          value,
        ),
      {
        message:
          "La couleur doit respecter le format #ec1763.",
      },
    );

const nullablePositiveInteger = (
  label: string,
  maximum: number,
) =>
  z
    .number()
    .int(
      `${label} doit être un nombre entier.`,
    )
    .min(
      0,
      `${label} ne peut pas être négatif.`,
    )
    .max(
      maximum,
      `${label} est trop élevé.`,
    )
    .nullable();

const optionalDateTime =
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
          "La date renseignée n’est pas valide.",
      },
    );

/* -------------------------------------------------------------------------- */
/*                               RÉCOMPENSE                                   */
/* -------------------------------------------------------------------------- */

export const adminVipRewardFormSchema =
  z
    .object({
      id:
        z
          .string()
          .trim()
          .optional(),

      name:
        requiredText(
          "Le nom de la récompense",
          160,
        ),

      slug:
        z
          .string()
          .trim()
          .min(
            1,
            "Le slug est obligatoire.",
          )
          .max(
            180,
            "Le slug ne peut pas dépasser 180 caractères.",
          )
          .regex(
            /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
            "Le slug doit contenir uniquement des lettres minuscules, chiffres et tirets.",
          ),

      description:
        optionalText(
          5000,
        ),

      shortDescription:
        optionalText(
          300,
        ),

      type:
        z.enum([
          "FIXED_DISCOUNT",
          "PERCENTAGE_DISCOUNT",
          "FREE_SERVICE",
          "FREE_NAIL_ART",
          "FREE_PRODUCT",
          "GIFT_CARD",
          "LOYALTY_POINTS",
          "EXPERIENCE_POINTS",
          "CONTEST_ENTRY",
          "SEASON_PASS_XP",
          "PHYSICAL_GIFT",
          "VIP_ACCESS",
          "CUSTOM",
        ]),

      icon:
        optionalText(
          100,
        ),

      imageUrl:
        optionalUrl,

      bannerUrl:
        optionalUrl,

      color:
        optionalColor,

      fixedAmountCents:
        nullablePositiveInteger(
          "Le montant fixe",
          100000000,
        ),

      percentage:
        z
          .number()
          .int(
            "Le pourcentage doit être entier.",
          )
          .min(
            1,
            "Le pourcentage doit être au minimum de 1 %.",
          )
          .max(
            100,
            "Le pourcentage ne peut pas dépasser 100 %.",
          )
          .nullable(),

      loyaltyPoints:
        nullablePositiveInteger(
          "Le nombre de points",
          100000000,
        ),

      experiencePoints:
        nullablePositiveInteger(
          "Le nombre de XP",
          100000000,
        ),

      freeServiceId:
        z
          .string()
          .trim()
          .nullable(),

      quantity:
        z
          .number()
          .int(
            "La quantité doit être entière.",
          )
          .min(
            1,
            "La quantité doit être d’au moins 1.",
          )
          .max(
            100000,
            "La quantité est trop élevée.",
          )
          .nullable(),

      minimumLevelId:
        z
          .string()
          .trim()
          .nullable(),

      minimumPoints:
        nullablePositiveInteger(
          "Le minimum de points",
          100000000,
        ),

      minimumXp:
        nullablePositiveInteger(
          "Le minimum de XP",
          100000000,
        ),

      rewardCode:
        optionalText(
          120,
        ),

      couponCodePrefix:
        optionalText(
          40,
        ),

      validForDays:
        z
          .number()
          .int(
            "La durée de validité doit être entière.",
          )
          .min(
            1,
            "La récompense doit être valable au moins un jour.",
          )
          .max(
            3650,
            "La durée de validité ne peut pas dépasser 3650 jours.",
          )
          .nullable(),

      startsAt:
        optionalDateTime,

      endsAt:
        optionalDateTime,

      unlimitedStock:
        z.boolean(),

      stock:
        nullablePositiveInteger(
          "Le stock",
          100000000,
        ),

      remainingStock:
        nullablePositiveInteger(
          "Le stock restant",
          100000000,
        ),

      status:
        z.enum([
          "DRAFT",
          "ACTIVE",
          "INACTIVE",
          "ARCHIVED",
        ]),

      visible:
        z.boolean(),

      featured:
        z.boolean(),

      repeatable:
        z.boolean(),

      sortOrder:
        z
          .number()
          .int(
            "L’ordre d’affichage doit être entier.",
          )
          .min(
            0,
            "L’ordre d’affichage ne peut pas être négatif.",
          )
          .max(
            100000,
            "L’ordre d’affichage est trop élevé.",
          ),
    })
    .superRefine(
      (
        value,
        context,
      ) => {
        if (
          (
            value.type ===
              "FIXED_DISCOUNT" ||
            value.type ===
              "GIFT_CARD"
          ) &&
          (
            value.fixedAmountCents ===
              null ||
            value.fixedAmountCents <=
              0
          )
        ) {
          context.addIssue({
            code:
              "custom",

            path: [
              "fixedAmountCents",
            ],

            message:
              "Renseignez un montant supérieur à zéro.",
          });
        }

        if (
          value.type ===
            "PERCENTAGE_DISCOUNT" &&
          value.percentage ===
            null
        ) {
          context.addIssue({
            code:
              "custom",

            path: [
              "percentage",
            ],

            message:
              "Renseignez le pourcentage de réduction.",
          });
        }

        if (
          value.type ===
            "LOYALTY_POINTS" &&
          (
            value.loyaltyPoints ===
              null ||
            value.loyaltyPoints <=
              0
          )
        ) {
          context.addIssue({
            code:
              "custom",

            path: [
              "loyaltyPoints",
            ],

            message:
              "Renseignez le nombre de points à offrir.",
          });
        }

        if (
          (
            value.type ===
              "EXPERIENCE_POINTS" ||
            value.type ===
              "SEASON_PASS_XP"
          ) &&
          (
            value.experiencePoints ===
              null ||
            value.experiencePoints <=
              0
          )
        ) {
          context.addIssue({
            code:
              "custom",

            path: [
              "experiencePoints",
            ],

            message:
              "Renseignez le nombre de XP à offrir.",
          });
        }

        if (
          value.type ===
            "FREE_SERVICE" &&
          !value.freeServiceId
        ) {
          context.addIssue({
            code:
              "custom",

            path: [
              "freeServiceId",
            ],

            message:
              "Sélectionnez la prestation offerte.",
          });
        }

        if (
          !value.unlimitedStock &&
          (
            value.stock ===
              null ||
            value.stock <=
              0
          )
        ) {
          context.addIssue({
            code:
              "custom",

            path: [
              "stock",
            ],

            message:
              "Renseignez un stock supérieur à zéro.",
          });
        }

        if (
          !value.unlimitedStock &&
          value.stock !==
            null &&
          value.remainingStock !==
            null &&
          value.remainingStock >
            value.stock
        ) {
          context.addIssue({
            code:
              "custom",

            path: [
              "remainingStock",
            ],

            message:
              "Le stock restant ne peut pas dépasser le stock initial.",
          });
        }

        if (
          value.startsAt &&
          value.endsAt &&
          new Date(
            value.endsAt,
          ) <=
            new Date(
              value.startsAt,
            )
        ) {
          context.addIssue({
            code:
              "custom",

            path: [
              "endsAt",
            ],

            message:
              "La date de fin doit être postérieure à la date de début.",
          });
        }
      },
    );

export type AdminVipRewardFormInput =
  z.infer<
    typeof adminVipRewardFormSchema
  >;

/* -------------------------------------------------------------------------- */
/*                              SUPPRESSION                                   */
/* -------------------------------------------------------------------------- */

export const adminVipRewardDeleteSchema =
  z.object({
    rewardId:
      z
        .string()
        .trim()
        .min(
          1,
          "La récompense est obligatoire.",
        ),

    reason:
      requiredText(
        "Le motif",
        1000,
      ),
  });

export type AdminVipRewardDeleteInput =
  z.infer<
    typeof adminVipRewardDeleteSchema
  >;
