import {
  z,
} from "zod";

export const GIFT_CARD_MIN_AMOUNT_CENTS =
  2_000;

export const GIFT_CARD_MAX_AMOUNT_CENTS =
  50_000;

export const GIFT_CARD_PERSONAL_MESSAGE_MAX_LENGTH =
  300;

export const GIFT_CARD_ADMIN_NOTE_MAX_LENGTH =
  500;

export const GIFT_CARD_REASON_MAX_LENGTH =
  500;

const requiredNameSchema = z
  .string()
  .trim()
  .min(
    2,
    "Ce champ doit contenir au moins 2 caractères.",
  )
  .max(
    80,
    "Ce champ ne peut pas dépasser 80 caractères.",
  );

const emailSchema = z
  .email(
    "L’adresse email est invalide.",
  )
  .trim()
  .toLowerCase()
  .max(
    254,
    "L’adresse email est trop longue.",
  );

const optionalEmailSchema = z
  .union([
    emailSchema,
    z.literal(""),
    z.undefined(),
  ])
  .transform((value) => {
    if (!value) {
      return undefined;
    }

    return value;
  });

const optionalTrimmedString = (
  maximumLength: number,
) =>
  z
    .union([
      z
        .string()
        .trim()
        .max(
          maximumLength,
          `Ce champ ne peut pas dépasser ${maximumLength} caractères.`,
        ),
      z.undefined(),
      z.null(),
    ])
    .transform((value) => {
      if (!value) {
        return undefined;
      }

      return value;
    });

export const giftCardPublicPurchaseSchema =
  z.object({
    amountCents: z
      .number()
      .int(
        "Le montant doit être exprimé en centimes.",
      )
      .min(
        GIFT_CARD_MIN_AMOUNT_CENTS,
        "Le montant minimum est de 20 €.",
      )
      .max(
        GIFT_CARD_MAX_AMOUNT_CENTS,
        "Le montant maximum est de 500 €.",
      ),

    purchaserFirstName:
      requiredNameSchema,

    purchaserLastName:
      requiredNameSchema,

    purchaserEmail:
      emailSchema,

    recipientFirstName:
      requiredNameSchema,

    recipientLastName:
      requiredNameSchema,

    recipientEmail:
      optionalEmailSchema,

    personalMessage:
      optionalTrimmedString(
        GIFT_CARD_PERSONAL_MESSAGE_MAX_LENGTH,
      ),
  });

export const giftCardPublicFormSchema =
  z.object({
    amountEuros: z
      .coerce
      .number()
      .finite(
        "Le montant est invalide.",
      )
      .min(
        GIFT_CARD_MIN_AMOUNT_CENTS / 100,
        "Le montant minimum est de 20 €.",
      )
      .max(
        GIFT_CARD_MAX_AMOUNT_CENTS / 100,
        "Le montant maximum est de 500 €.",
      )
      .refine(
        (value) =>
          Number.isInteger(
            Math.round(value * 100),
          ),
        {
          message:
            "Le montant ne peut contenir que deux décimales.",
        },
      ),

    purchaserFirstName:
      requiredNameSchema,

    purchaserLastName:
      requiredNameSchema,

    purchaserEmail:
      emailSchema,

    recipientFirstName:
      requiredNameSchema,

    recipientLastName:
      requiredNameSchema,

    recipientEmail:
      optionalEmailSchema,

    personalMessage:
      optionalTrimmedString(
        GIFT_CARD_PERSONAL_MESSAGE_MAX_LENGTH,
      ),
  });

export const giftCardReferenceSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(
    /^GCR-[A-Z0-9]{10,32}$/,
    "La référence de carte cadeau est invalide.",
  );

export const giftCardCodeSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(
    /^LPDO-\d{4}-[A-Z0-9]{8}$/,
    "Le code de carte cadeau est invalide.",
  );

export const giftCardCheckoutTokenSchema = z
  .string()
  .trim()
  .min(
    32,
    "Le jeton de paiement est invalide.",
  )
  .max(
    256,
    "Le jeton de paiement est invalide.",
  );

export const giftCardAdminRedemptionSchema =
  z.object({
    giftCardId: z
      .string()
      .trim()
      .min(
        1,
        "La carte cadeau est obligatoire.",
      ),

    amountCents: z
      .number()
      .int(
        "Le montant doit être exprimé en centimes.",
      )
      .positive(
        "Le montant utilisé doit être supérieur à 0 €.",
      ),

    note:
      optionalTrimmedString(
        GIFT_CARD_ADMIN_NOTE_MAX_LENGTH,
      ),
  });

export const giftCardAdminReversalSchema =
  z.object({
    giftCardId: z
      .string()
      .trim()
      .min(
        1,
        "La carte cadeau est obligatoire.",
      ),

    transactionId: z
      .string()
      .trim()
      .min(
        1,
        "Le mouvement à annuler est obligatoire.",
      ),

    reason: z
      .string()
      .trim()
      .min(
        5,
        "Le motif doit contenir au moins 5 caractères.",
      )
      .max(
        GIFT_CARD_REASON_MAX_LENGTH,
        `Le motif ne peut pas dépasser ${GIFT_CARD_REASON_MAX_LENGTH} caractères.`,
      ),
  });

export const giftCardAdminStatusActionSchema =
  z.object({
    giftCardId: z
      .string()
      .trim()
      .min(
        1,
        "La carte cadeau est obligatoire.",
      ),

    reason: z
      .string()
      .trim()
      .min(
        5,
        "Le motif doit contenir au moins 5 caractères.",
      )
      .max(
        GIFT_CARD_REASON_MAX_LENGTH,
        `Le motif ne peut pas dépasser ${GIFT_CARD_REASON_MAX_LENGTH} caractères.`,
      ),
  });

export type GiftCardPublicPurchaseValues =
  z.infer<
    typeof giftCardPublicPurchaseSchema
  >;

export type GiftCardPublicFormValues =
  z.infer<
    typeof giftCardPublicFormSchema
  >;

export type GiftCardAdminRedemptionValues =
  z.infer<
    typeof giftCardAdminRedemptionSchema
  >;

export type GiftCardAdminReversalValues =
  z.infer<
    typeof giftCardAdminReversalSchema
  >;

export type GiftCardAdminStatusActionValues =
  z.infer<
    typeof giftCardAdminStatusActionSchema
  >;
