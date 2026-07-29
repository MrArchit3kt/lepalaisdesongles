import {
  z,
} from "zod";

/* -------------------------------------------------------------------------- */
/*                                   IMAGE                                    */
/* -------------------------------------------------------------------------- */

export const adminServiceImageSchema =
  z.object({
    id:
      z.string().trim().min(1),

    url:
      z
        .string()
        .trim()
        .url(
          "L’URL de l’image est invalide.",
        ),

    /*
     * Présente uniquement pour une image
     * venant d’être envoyée avec UploadThing.
     *
     * Les images déjà enregistrées utilisent
     * leur identifiant ServiceImage.
     */
    uploadKey:
      z
        .string()
        .trim()
        .min(
          1,
          "La clé de l’image est invalide.",
        )
        .max(
          500,
          "La clé de l’image est trop longue.",
        )
        .nullable()
        .optional(),

    alt:
      z
        .string()
        .trim()
        .max(160)
        .nullable()
        .optional(),

    sortOrder:
      z
        .number()
        .int()
        .min(0),

    isCover:
      z.boolean(),
  });

/* -------------------------------------------------------------------------- */
/*                                PRESTATION                                  */
/* -------------------------------------------------------------------------- */

export const adminServiceFormSchema =
  z
    .object({
      name:
        z
          .string()
          .trim()
          .min(
            2,
            "Le nom de la prestation est obligatoire.",
          )
          .max(
            120,
            "Le nom est trop long.",
          ),

      categoryId:
        z
          .string()
          .trim()
          .min(
            1,
            "Sélectionnez une catégorie.",
          ),

      shortDescription:
        z
          .string()
          .trim()
          .max(
            300,
            "La description courte est trop longue.",
          )
          .nullable()
          .optional(),

      description:
        z
          .string()
          .trim()
          .max(
            5_000,
            "La description est trop longue.",
          )
          .nullable()
          .optional(),

      priceCents:
        z
          .number()
          .int()
          .nonnegative(
            "Le prix ne peut pas être négatif.",
          )
          .nullable()
          .optional(),

      promotionalPriceCents:
        z
          .number()
          .int()
          .nonnegative(
            "Le prix promotionnel ne peut pas être négatif.",
          )
          .nullable()
          .optional(),

      durationMinutes:
        z
          .number()
          .int()
          .min(
            5,
            "La durée minimale est de 5 minutes.",
          )
          .max(
            720,
            "La durée maximale est de 12 heures.",
          ),

      cleanupMinutes:
        z
          .number()
          .int()
          .min(0)
          .max(
            180,
            "Le temps de finition est trop important.",
          ),

      depositRequired:
        z.boolean(),

      depositCents:
        z
          .number()
          .int()
          .nonnegative()
          .nullable()
          .optional(),

      color:
        z
          .string()
          .trim()
          .max(20)
          .nullable()
          .optional(),

      isActive:
        z.boolean(),

      isFeatured:
        z.boolean(),

      allowOnlineBooking:
        z.boolean(),

      sortOrder:
        z
          .number()
          .int()
          .min(0),

      images:
        z
          .array(
            adminServiceImageSchema,
          )
          .max(
            10,
            "Vous pouvez ajouter au maximum 10 images.",
          ),
    })
    .superRefine(
      (
        values,
        context,
      ) => {
        if (
          values.priceCents === null ||
          values.priceCents === undefined
        ) {
          if (
            values.promotionalPriceCents !== null &&
            values.promotionalPriceCents !== undefined
          ) {
            context.addIssue({
              code:
                "custom",

              path: [
                "promotionalPriceCents",
              ],

              message:
                "Ajoutez d’abord un prix normal.",
            });
          }

          if (
            values.allowOnlineBooking
          ) {
            context.addIssue({
              code:
                "custom",

              path: [
                "allowOnlineBooking",
              ],

              message:
                "Une prestation sans prix ne peut pas être réservée en ligne.",
            });
          }
        }

        if (
          values.priceCents !== null &&
          values.priceCents !== undefined &&
          values.promotionalPriceCents !== null &&
          values.promotionalPriceCents !== undefined &&
          values.promotionalPriceCents >=
            values.priceCents
        ) {
          context.addIssue({
            code:
              "custom",

            path: [
              "promotionalPriceCents",
            ],

            message:
              "Le prix promotionnel doit être inférieur au prix normal.",
          });
        }

        if (
          values.depositRequired &&
          (
            values.depositCents === null ||
            values.depositCents === undefined ||
            values.depositCents <= 0
          )
        ) {
          context.addIssue({
            code:
              "custom",

            path: [
              "depositCents",
            ],

            message:
              "Indiquez le montant de l’acompte.",
          });
        }

        if (
          !values.depositRequired &&
          values.depositCents
        ) {
          context.addIssue({
            code:
              "custom",

            path: [
              "depositCents",
            ],

            message:
              "Désactivez ou supprimez l’acompte.",
          });
        }
      },
    );

/* -------------------------------------------------------------------------- */
/*                                  FILTRES                                   */
/* -------------------------------------------------------------------------- */

export const adminServiceFilterSchema =
  z.object({
    search:
      z
        .string()
        .trim()
        .default(""),

    categoryId:
      z
        .string()
        .trim()
        .optional(),

    status:
      z
        .enum([
          "ALL",
          "ACTIVE",
          "HIDDEN",
        ])
        .default("ALL"),

    booking:
      z
        .enum([
          "ALL",
          "ONLINE",
          "QUOTE_ONLY",
        ])
        .default("ALL"),
  });

export type AdminServiceImageInput =
  z.infer<
    typeof adminServiceImageSchema
  >;

export type AdminServiceFormInput =
  z.infer<
    typeof adminServiceFormSchema
  >;

export type AdminServiceFilterInput =
  z.infer<
    typeof adminServiceFilterSchema
  >;
