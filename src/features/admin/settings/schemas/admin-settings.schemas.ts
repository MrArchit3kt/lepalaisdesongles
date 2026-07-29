import {
  z,
} from "zod";

import type {
  AdminSettingsSection,
  BookingSettings,
  LegalSettings,
  NotificationSettings,
  PaymentSettings,
  SalonSettings,
  SocialSettings,
  WebsiteSettings,
} from "@/features/admin/settings/types/admin-settings.types";

/* -------------------------------------------------------------------------- */
/*                              OUTILS DE VALIDATION                          */
/* -------------------------------------------------------------------------- */

const requiredText = (
  label: string,
  maximumLength = 160,
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
  maximumLength = 500,
) =>
  z
    .string()
    .trim()
    .max(
      maximumLength,
      `Ce champ ne peut pas dépasser ${maximumLength} caractères.`,
    );

const emailSchema = (
  required: boolean,
) => {
  const schema =
    z
      .string()
      .trim()
      .max(
        254,
        "L’adresse e-mail est trop longue.",
      );

  if (required) {
    return schema
      .min(
        1,
        "L’adresse e-mail est obligatoire.",
      )
      .email(
        "L’adresse e-mail n’est pas valide.",
      );
  }

  return schema.refine(
    (value) =>
      value === "" ||
      z
        .string()
        .email()
        .safeParse(value)
        .success,
    {
      message:
        "L’adresse e-mail n’est pas valide.",
    },
  );
};

const optionalUrlSchema =
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
          "L’adresse URL doit commencer par http:// ou https://.",
      },
    );

const phoneSchema =
  z
    .string()
    .trim()
    .max(
      30,
      "Le numéro de téléphone est trop long.",
    );

const nonNegativeInteger = (
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
      `${label} ne peut pas dépasser ${maximum}.`,
    );

const positiveInteger = (
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
      `${label} doit être au minimum de ${minimum}.`,
    )
    .max(
      maximum,
      `${label} ne peut pas dépasser ${maximum}.`,
    );

const colorSchema =
  z
    .string()
    .trim()
    .regex(
      /^#[0-9a-fA-F]{6}$/,
      "La couleur doit être au format hexadécimal, par exemple #ec1763.",
    );

const optionalDateSchema =
  z
    .string()
    .trim()
    .refine(
      (value) =>
        value === "" ||
        /^\d{4}-\d{2}-\d{2}$/.test(
          value,
        ),
      {
        message:
          "La date doit respecter le format AAAA-MM-JJ.",
      },
    );

/* -------------------------------------------------------------------------- */
/*                                   SALON                                    */
/* -------------------------------------------------------------------------- */

export const salonSettingsSchema:
  z.ZodType<SalonSettings> =
  z.object({
    name:
      requiredText(
        "Le nom du salon",
        120,
      ),

    legalName:
      requiredText(
        "La raison sociale",
        160,
      ),

    description:
      optionalText(
        1500,
      ),

    tagline:
      optionalText(
        200,
      ),

    email:
      emailSchema(
        true,
      ),

    phone:
      phoneSchema,

    addressLine1:
      optionalText(
        200,
      ),

    addressLine2:
      optionalText(
        200,
      ),

    postalCode:
      optionalText(
        20,
      ),

    city:
      optionalText(
        120,
      ),

    country:
      requiredText(
        "Le pays",
        100,
      ),

    timezone:
      requiredText(
        "Le fuseau horaire",
        100,
      ),

    locale:
      requiredText(
        "La langue",
        20,
      ),

    currency:
      z
        .string()
        .trim()
        .length(
          3,
          "La devise doit contenir trois caractères.",
        )
        .transform(
          (value) =>
            value.toUpperCase(),
        ),
  });

/* -------------------------------------------------------------------------- */
/*                               RÉSERVATIONS                                 */
/* -------------------------------------------------------------------------- */

export const bookingSettingsSchema:
  z.ZodType<BookingSettings> =
  z.object({
    onlineBookingEnabled:
      z.boolean(),

    requireClientAccount:
      z.boolean(),

    minimumAdvanceHours:
      nonNegativeInteger(
        "Le délai minimum",
        720,
      ),

    maximumAdvanceDays:
      positiveInteger(
        "La période maximale de réservation",
        1,
        730,
      ),

    slotIntervalMinutes:
      positiveInteger(
        "L’intervalle des créneaux",
        5,
        120,
      ),

    defaultCleanupMinutes:
      nonNegativeInteger(
        "Le temps de nettoyage",
        240,
      ),

    allowClientCancellation:
      z.boolean(),

    cancellationDeadlineHours:
      nonNegativeInteger(
        "Le délai d’annulation",
        720,
      ),

    requireClientPhone:
      z.boolean(),

    allowAppointmentImages:
      z.boolean(),

    maximumAppointmentImages:
      positiveInteger(
        "Le nombre maximal d’images",
        1,
        20,
      ),

    autoConfirmAppointments:
      z.boolean(),

    defaultDepositRequired:
      z.boolean(),

    defaultDepositCents:
      nonNegativeInteger(
        "Le montant de l’acompte",
        100000,
      ),
  })
    .superRefine(
      (
        value,
        context,
      ) => {
        if (
          value
            .minimumAdvanceHours >
          value.maximumAdvanceDays *
            24
        ) {
          context.addIssue({
            code:
              "custom",

            path: [
              "minimumAdvanceHours",
            ],

            message:
              "Le délai minimum ne peut pas dépasser la période maximale de réservation.",
          });
        }

        if (
          value
            .defaultDepositRequired &&
          value
            .defaultDepositCents <=
            0
        ) {
          context.addIssue({
            code:
              "custom",

            path: [
              "defaultDepositCents",
            ],

            message:
              "Un acompte obligatoire doit avoir un montant supérieur à zéro.",
          });
        }
      },
    );

/* -------------------------------------------------------------------------- */
/*                                PAIEMENTS                                   */
/* -------------------------------------------------------------------------- */

export const paymentSettingsSchema:
  z.ZodType<PaymentSettings> =
  z.object({
    paypalEnabled:
      z.boolean(),

    allowCashPayment:
      z.boolean(),

    allowCardPaymentAtSalon:
      z.boolean(),

    depositEnabled:
      z.boolean(),

    depositRequiredByDefault:
      z.boolean(),

    defaultDepositCents:
      nonNegativeInteger(
        "Le montant de l’acompte",
        100000,
      ),

    allowFullOnlinePayment:
      z.boolean(),

    refundPolicy:
      optionalText(
        3000,
      ),

    paymentInstructions:
      optionalText(
        3000,
      ),
  })
    .superRefine(
      (
        value,
        context,
      ) => {
        if (
          value
            .depositRequiredByDefault &&
          !value.depositEnabled
        ) {
          context.addIssue({
            code:
              "custom",

            path: [
              "depositRequiredByDefault",
            ],

            message:
              "Les acomptes doivent être activés avant de pouvoir les rendre obligatoires.",
          });
        }

        if (
          value.depositEnabled &&
          value
            .depositRequiredByDefault &&
          value
            .defaultDepositCents <=
            0
        ) {
          context.addIssue({
            code:
              "custom",

            path: [
              "defaultDepositCents",
            ],

            message:
              "Le montant de l’acompte doit être supérieur à zéro.",
          });
        }

        if (
          value
            .allowFullOnlinePayment &&
          !value.paypalEnabled
        ) {
          context.addIssue({
            code:
              "custom",

            path: [
              "allowFullOnlinePayment",
            ],

            message:
              "PayPal doit être activé pour accepter le paiement intégral en ligne.",
          });
        }
      },
    );

/* -------------------------------------------------------------------------- */
/*                              NOTIFICATIONS                                 */
/* -------------------------------------------------------------------------- */

export const notificationSettingsSchema:
  z.ZodType<NotificationSettings> =
  z.object({
    emailsEnabled:
      z.boolean(),

    notifyAdminOnAppointmentCreated:
      z.boolean(),

    notifyClientOnAppointmentCreated:
      z.boolean(),

    notifyClientOnAppointmentConfirmed:
      z.boolean(),

    notifyClientOnAppointmentRefused:
      z.boolean(),

    notifyClientOnAppointmentCancelled:
      z.boolean(),

    appointmentReminderEnabled:
      z.boolean(),

    appointmentReminderHoursBefore:
      positiveInteger(
        "Le délai du rappel",
        1,
        720,
      ),

    reviewRequestEnabled:
      z.boolean(),

    reviewRequestHoursAfter:
      positiveInteger(
        "Le délai de demande d’avis",
        1,
        2160,
      ),

    notifyAdminOnNewReview:
      z.boolean(),

    notifyAdminOnNewMessage:
      z.boolean(),

    adminNotificationEmail:
      emailSchema(
        true,
      ),

    replyToEmail:
      emailSchema(
        true,
      ),
  });

/* -------------------------------------------------------------------------- */
/*                                   SITE                                     */
/* -------------------------------------------------------------------------- */

export const websiteSettingsSchema:
  z.ZodType<WebsiteSettings> =
  z.object({
    siteTitle:
      requiredText(
        "Le titre du site",
        120,
      ),

    siteDescription:
      optionalText(
        500,
      ),

    logoUrl:
      optionalUrlSchema,

    faviconUrl:
      optionalUrlSchema,

    homeHeroImageUrl:
      optionalUrlSchema,

    homeHeroMobileImageUrl:
      optionalUrlSchema,

    bookingCtaImageUrl:
      optionalUrlSchema,

    defaultServiceImageUrl:
      optionalUrlSchema,

    socialShareImageUrl:
      optionalUrlSchema,

    maintenanceMode:
      z.boolean(),

    showServices:
      z.boolean(),

    showGallery:
      z.boolean(),

    showReviews:
      z.boolean(),

    showPromotions:
      z.boolean(),

    showContests:
      z.boolean(),

    showVipProgram:
      z.boolean(),

    primaryColor:
      colorSchema,

    secondaryColor:
      colorSchema,

    accentColor:
      colorSchema,

    seoTitle:
      optionalText(
        70,
      ),

    seoDescription:
      optionalText(
        170,
      ),

    seoKeywords:
      optionalText(
        500,
      ),
  });

/* -------------------------------------------------------------------------- */
/*                              RÉSEAUX SOCIAUX                               */
/* -------------------------------------------------------------------------- */

export const socialSettingsSchema:
  z.ZodType<SocialSettings> =
  z.object({
    instagramUrl:
      optionalUrlSchema,

    facebookUrl:
      optionalUrlSchema,

    tiktokUrl:
      optionalUrlSchema,

    pinterestUrl:
      optionalUrlSchema,

    googleBusinessUrl:
      optionalUrlSchema,

    googleReviewUrl:
      optionalUrlSchema,

    whatsappNumber:
      phoneSchema,

    showInstagram:
      z.boolean(),

    showFacebook:
      z.boolean(),

    showTiktok:
      z.boolean(),

    showPinterest:
      z.boolean(),

    showGoogleBusiness:
      z.boolean(),

    showWhatsapp:
      z.boolean(),
  })
    .superRefine(
      (
        value,
        context,
      ) => {
        const checks = [
          {
            enabled:
              value.showInstagram,

            value:
              value.instagramUrl,

            path:
              "instagramUrl",

            label:
              "Instagram",
          },
          {
            enabled:
              value.showFacebook,

            value:
              value.facebookUrl,

            path:
              "facebookUrl",

            label:
              "Facebook",
          },
          {
            enabled:
              value.showTiktok,

            value:
              value.tiktokUrl,

            path:
              "tiktokUrl",

            label:
              "TikTok",
          },
          {
            enabled:
              value.showPinterest,

            value:
              value.pinterestUrl,

            path:
              "pinterestUrl",

            label:
              "Pinterest",
          },
          {
            enabled:
              value.showGoogleBusiness,

            value:
              value.googleBusinessUrl,

            path:
              "googleBusinessUrl",

            label:
              "Google Business",
          },
          {
            enabled:
              value.showWhatsapp,

            value:
              value.whatsappNumber,

            path:
              "whatsappNumber",

            label:
              "WhatsApp",
          },
        ] as const;

        for (
          const check
          of checks
        ) {
          if (
            check.enabled &&
            check.value.trim() ===
              ""
          ) {
            context.addIssue({
              code:
                "custom",

              path: [
                check.path,
              ],

              message:
                `Renseignez ${check.label} avant de l’afficher sur le site.`,
            });
          }
        }
      },
    );

/* -------------------------------------------------------------------------- */
/*                                  LÉGAL                                     */
/* -------------------------------------------------------------------------- */

export const legalSettingsSchema:
  z.ZodType<LegalSettings> =
  z.object({
    businessOwnerName:
      optionalText(
        160,
      ),

    businessLegalName:
      requiredText(
        "Le nom légal",
        160,
      ),

    legalStatus:
      optionalText(
        100,
      ),

    siret:
      z
        .string()
        .trim()
        .max(
          20,
          "Le numéro SIRET est trop long.",
        )
        .refine(
          (value) =>
            value === "" ||
            /^\d{14}$/.test(
              value.replace(
                /\s/g,
                "",
              ),
            ),
          {
            message:
              "Le numéro SIRET doit contenir 14 chiffres.",
          },
        ),

    siren:
      z
        .string()
        .trim()
        .max(
          20,
          "Le numéro SIREN est trop long.",
        )
        .refine(
          (value) =>
            value === "" ||
            /^\d{9}$/.test(
              value.replace(
                /\s/g,
                "",
              ),
            ),
          {
            message:
              "Le numéro SIREN doit contenir 9 chiffres.",
          },
        ),

    vatNumber:
      optionalText(
        40,
      ),

    registeredAddress:
      optionalText(
        500,
      ),

    publicationDirector:
      optionalText(
        160,
      ),

    privacyContactEmail:
      emailSchema(
        true,
      ),

    hostingProviderName:
      optionalText(
        160,
      ),

    hostingProviderAddress:
      optionalText(
        500,
      ),

    hostingProviderPhone:
      phoneSchema,

    termsUpdatedAt:
      optionalDateSchema,

    privacyPolicyUpdatedAt:
      optionalDateSchema,
  });

/* -------------------------------------------------------------------------- */
/*                              SCHÉMAS PAR SECTION                           */
/* -------------------------------------------------------------------------- */

export const ADMIN_SETTINGS_SCHEMAS = {
  SALON:
    salonSettingsSchema,

  BOOKING:
    bookingSettingsSchema,

  PAYMENTS:
    paymentSettingsSchema,

  NOTIFICATIONS:
    notificationSettingsSchema,

  WEBSITE:
    websiteSettingsSchema,

  SOCIAL:
    socialSettingsSchema,

  LEGAL:
    legalSettingsSchema,
} satisfies Record<
  AdminSettingsSection,
  z.ZodType
>;

export type SalonSettingsInput =
  z.input<
    typeof salonSettingsSchema
  >;

export type BookingSettingsInput =
  z.input<
    typeof bookingSettingsSchema
  >;

export type PaymentSettingsInput =
  z.input<
    typeof paymentSettingsSchema
  >;

export type NotificationSettingsInput =
  z.input<
    typeof notificationSettingsSchema
  >;

export type WebsiteSettingsInput =
  z.input<
    typeof websiteSettingsSchema
  >;

export type SocialSettingsInput =
  z.input<
    typeof socialSettingsSchema
  >;

export type LegalSettingsInput =
  z.input<
    typeof legalSettingsSchema
  >;
