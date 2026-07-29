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
          "La couleur doit respecter le format #7c3aed.",
      },
    );

/* -------------------------------------------------------------------------- */
/*                                  NIVEAU                                    */
/* -------------------------------------------------------------------------- */

export const adminVipLevelFormSchema =
  z
    .object({
      id:
        z
          .string()
          .trim()
          .optional(),

      name:
        requiredText(
          "Le nom du niveau",
          120,
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
            160,
            "Le slug ne peut pas dépasser 160 caractères.",
          )
          .regex(
            /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
            "Le slug doit contenir uniquement des lettres minuscules, chiffres et tirets.",
          ),

      description:
        optionalText(
          3000,
        ),

      shortDescription:
        optionalText(
          300,
        ),

      color:
        optionalColor,

      icon:
        optionalText(
          100,
        ),

      imageUrl:
        optionalUrl,

      bannerUrl:
        optionalUrl,

      level:
        z
          .number()
          .int(
            "Le numéro du niveau doit être entier.",
          )
          .min(
            1,
            "Le numéro du niveau doit commencer à 1.",
          )
          .max(
            999,
            "Le numéro du niveau est trop élevé.",
          ),

      requiredXp:
        z
          .number()
          .int(
            "Le nombre de XP requis doit être entier.",
          )
          .min(
            0,
            "Le nombre de XP requis ne peut pas être négatif.",
          )
          .max(
            100000000,
            "Le nombre de XP requis est trop élevé.",
          ),

      requiredPoints:
        z
          .number()
          .int(
            "Le nombre de points requis doit être entier.",
          )
          .min(
            0,
            "Le nombre de points requis ne peut pas être négatif.",
          )
          .max(
            100000000,
            "Le nombre de points requis est trop élevé.",
          ),

      xpMultiplier:
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

      pointsMultiplier:
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

      referralMultiplier:
        z
          .number()
          .min(
            0,
            "Le multiplicateur de parrainage ne peut pas être négatif.",
          )
          .max(
            100,
            "Le multiplicateur de parrainage ne peut pas dépasser 100.",
          ),

      priorityBooking:
        z.boolean(),

      vipSupport:
        z.boolean(),

      exclusiveContests:
        z.boolean(),

      exclusiveRewards:
        z.boolean(),

      exclusiveEvents:
        z.boolean(),

      freeGift:
        z.boolean(),

      birthdayGift:
        z.boolean(),

      permanentDiscountPercent:
        z
          .number()
          .int(
            "La réduction permanente doit être un nombre entier.",
          )
          .min(
            0,
            "La réduction ne peut pas être négative.",
          )
          .max(
            100,
            "La réduction ne peut pas dépasser 100 %.",
          )
          .nullable(),

      status:
        z.enum([
          "DRAFT",
          "ACTIVE",
          "ARCHIVED",
        ]),

      visible:
        z.boolean(),

      isDefault:
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
          value.isDefault &&
          value.status !==
            "ACTIVE"
        ) {
          context.addIssue({
            code:
              "custom",

            path: [
              "status",
            ],

            message:
              "Le niveau par défaut doit être actif.",
          });
        }

        if (
          value.isDefault &&
          !value.visible
        ) {
          context.addIssue({
            code:
              "custom",

            path: [
              "visible",
            ],

            message:
              "Le niveau par défaut doit être visible.",
          });
        }

        if (
          value.level === 1 &&
          (
            value.requiredXp >
              0 ||
            value.requiredPoints >
              0
          )
        ) {
          context.addIssue({
            code:
              "custom",

            path: [
              "requiredXp",
            ],

            message:
              "Le premier niveau doit normalement être accessible avec 0 XP et 0 point.",
          });
        }
      },
    );

export type AdminVipLevelFormInput =
  z.infer<
    typeof adminVipLevelFormSchema
  >;

/* -------------------------------------------------------------------------- */
/*                              SUPPRESSION                                   */
/* -------------------------------------------------------------------------- */

export const adminVipLevelDeleteSchema =
  z.object({
    levelId:
      z
        .string()
        .trim()
        .min(
          1,
          "Le niveau est obligatoire.",
        ),

    reason:
      requiredText(
        "Le motif",
        1000,
      ),
  });

export type AdminVipLevelDeleteInput =
  z.infer<
    typeof adminVipLevelDeleteSchema
  >;
