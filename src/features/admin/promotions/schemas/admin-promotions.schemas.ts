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
        if (
          value === ""
        ) {
          return true;
        }

        try {
          const url =
            new URL(
              value,
            );

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

const optionalInternalOrExternalUrl =
  z
    .string()
    .trim()
    .max(
      2048,
      "L’adresse URL est trop longue.",
    )
    .refine(
      (value) => {
        if (
          value === "" ||
          value.startsWith(
            "/",
          )
        ) {
          return true;
        }

        try {
          const url =
            new URL(
              value,
            );

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
          "Utilisez une route interne commençant par / ou une URL http:// ou https://.",
      },
    );

const dateTimeSchema = (
  label: string,
) =>
  z
    .string()
    .trim()
    .min(
      1,
      `${label} est obligatoire.`,
    )
    .refine(
      (value) =>
        !Number.isNaN(
          new Date(
            value,
          ).getTime(),
        ),
      {
        message:
          `${label} n’est pas valide.`,
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
      1,
      `${label} doit être supérieur ou égal à 1.`,
    )
    .max(
      maximum,
      `${label} est trop élevé.`,
    )
    .nullable();

const nullableMoneyCents = (
  label: string,
) =>
  z
    .number()
    .int(
      `${label} doit être exprimé en centimes.`,
    )
    .min(
      1,
      `${label} doit être supérieur à 0 €.`,
    )
    .max(
      100_000_000,
      `${label} est trop élevé.`,
    )
    .nullable();

const promotionTypeSchema =
  z.enum([
    "PERCENTAGE",
    "FIXED_AMOUNT",
    "FREE_SERVICE",
    "CUSTOM",
  ]);

/* -------------------------------------------------------------------------- */
/*                            CRÉATION / ÉDITION                              */
/* -------------------------------------------------------------------------- */

export const adminPromotionFormSchema =
  z
    .object({
      id:
        z
          .string()
          .trim()
          .optional(),

      name:
        requiredText(
          "Le nom",
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
            "Le slug doit uniquement contenir des lettres minuscules, des chiffres et des tirets.",
          ),

      description:
        optionalText(
          5000,
        ),

      type:
        promotionTypeSchema,

      percentageValue:
        z
          .number()
          .int(
            "Le pourcentage doit être un nombre entier.",
          )
          .min(
            1,
            "Le pourcentage doit être supérieur ou égal à 1.",
          )
          .max(
            100,
            "Le pourcentage ne peut pas dépasser 100.",
          )
          .nullable(),

      amountCents:
        nullableMoneyCents(
          "Le montant de réduction",
        ),

      code:
        z
          .string()
          .trim()
          .toUpperCase()
          .max(
            60,
            "Le code promotionnel ne peut pas dépasser 60 caractères.",
          )
          .regex(
            /^[A-Z0-9_-]*$/,
            "Le code peut uniquement contenir des lettres majuscules, des chiffres, des tirets et des underscores.",
          ),

      imageUrl:
        optionalUrl,

      startsAt:
        dateTimeSchema(
          "La date de début",
        ),

      endsAt:
        dateTimeSchema(
          "La date de fin",
        ),

      usageLimit:
        nullablePositiveInteger(
          "La limite globale d’utilisation",
          10_000_000,
        ),

      perClientLimit:
        nullablePositiveInteger(
          "La limite par cliente",
          100_000,
        ),

      minimumSpendCents:
        nullableMoneyCents(
          "Le montant minimum de commande",
        ),

      isActive:
        z.boolean(),

      showOnHomepage:
        z.boolean(),

      serviceIds:
        z
          .array(
            z
              .string()
              .trim()
              .min(
                1,
                "Une prestation sélectionnée est invalide.",
              ),
          )
          .max(
            500,
            "Trop de prestations ont été sélectionnées.",
          ),

      bannerEnabled:
        z.boolean(),

      bannerTitle:
        optionalText(
          180,
        ),

      bannerSubtitle:
        optionalText(
          500,
        ),

      bannerImageUrl:
        optionalUrl,

      bannerMobileImageUrl:
        optionalUrl,

      bannerButtonLabel:
        optionalText(
          80,
        ),

      bannerButtonUrl:
        optionalInternalOrExternalUrl,

      bannerBackgroundColor:
        z
          .string()
          .trim()
          .max(
            40,
            "La couleur de fond est trop longue.",
          ),

      bannerTextColor:
        z
          .string()
          .trim()
          .max(
            40,
            "La couleur du texte est trop longue.",
          ),
    })
    .superRefine(
      (
        value,
        context,
      ) => {
        const startsAt =
          new Date(
            value.startsAt,
          );

        const endsAt =
          new Date(
            value.endsAt,
          );

        if (
          endsAt <=
          startsAt
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

        if (
          value.type ===
            "PERCENTAGE" &&
          value.percentageValue ===
            null
        ) {
          context.addIssue({
            code:
              "custom",

            path: [
              "percentageValue",
            ],

            message:
              "Le pourcentage de réduction est obligatoire.",
          });
        }

        if (
          value.type ===
            "FIXED_AMOUNT" &&
          value.amountCents ===
            null
        ) {
          context.addIssue({
            code:
              "custom",

            path: [
              "amountCents",
            ],

            message:
              "Le montant de la réduction est obligatoire.",
          });
        }

        if (
          value.usageLimit !==
            null &&
          value.perClientLimit !==
            null &&
          value.perClientLimit >
            value.usageLimit
        ) {
          context.addIssue({
            code:
              "custom",

            path: [
              "perClientLimit",
            ],

            message:
              "La limite par cliente ne peut pas dépasser la limite globale.",
          });
        }

        if (
          value.bannerEnabled &&
          !value.bannerTitle
        ) {
          context.addIssue({
            code:
              "custom",

            path: [
              "bannerTitle",
            ],

            message:
              "Le titre de la bannière est obligatoire.",
          });
        }

        if (
          value.bannerButtonLabel &&
          !value.bannerButtonUrl
        ) {
          context.addIssue({
            code:
              "custom",

            path: [
              "bannerButtonUrl",
            ],

            message:
              "L’adresse du bouton est obligatoire lorsqu’un libellé est renseigné.",
          });
        }

        if (
          value.bannerButtonUrl &&
          !value.bannerButtonLabel
        ) {
          context.addIssue({
            code:
              "custom",

            path: [
              "bannerButtonLabel",
            ],

            message:
              "Le libellé du bouton est obligatoire lorsqu’une adresse est renseignée.",
          });
        }
      },
    );

/* -------------------------------------------------------------------------- */
/*                        MODIFICATION DU STATUT                              */
/* -------------------------------------------------------------------------- */

export const adminPromotionStatusSchema =
  z
    .object({
      promotionId:
        z
          .string()
          .trim()
          .min(
            1,
            "La promotion est obligatoire.",
          ),

      action:
        z.enum([
          "ACTIVATE",
          "DEACTIVATE",
          "SHOW_ON_HOMEPAGE",
          "HIDE_FROM_HOMEPAGE",
          "DUPLICATE",
          "DELETE",
        ]),

      reason:
        z
          .string()
          .trim()
          .max(
            1000,
            "Le motif ne peut pas dépasser 1000 caractères.",
          )
          .optional(),
    })
    .superRefine(
      (
        value,
        context,
      ) => {
        if (
          value.action ===
            "DELETE" &&
          !value.reason
        ) {
          context.addIssue({
            code:
              "custom",

            path: [
              "reason",
            ],

            message:
              "Un motif est obligatoire pour supprimer une promotion.",
          });
        }
      },
    );

/* -------------------------------------------------------------------------- */
/*                                 FILTRES                                    */
/* -------------------------------------------------------------------------- */

export const adminPromotionFiltersSchema =
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
        "DRAFT",
        "SCHEDULED",
        "ACTIVE",
        "EXPIRED",
        "EXHAUSTED",
        "DISABLED",
      ]),

    type:
      z.enum([
        "ALL",
        "PERCENTAGE",
        "FIXED_AMOUNT",
        "FREE_SERVICE",
        "CUSTOM",
      ]),

    homepageOnly:
      z.boolean(),
  });

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

export type AdminPromotionFormSchemaInput =
  z.infer<
    typeof adminPromotionFormSchema
  >;

export type AdminPromotionStatusSchemaInput =
  z.infer<
    typeof adminPromotionStatusSchema
  >;

export type AdminPromotionFiltersSchemaInput =
  z.infer<
    typeof adminPromotionFiltersSchema
  >;
