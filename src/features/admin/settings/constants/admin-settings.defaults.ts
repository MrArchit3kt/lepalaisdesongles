import type {
  AdminSettingsData,
  BookingSettings,
  LegalSettings,
  NotificationSettings,
  PaymentSettings,
  SalonSettings,
  SocialSettings,
  WebsiteSettings,
} from "@/features/admin/settings/types/admin-settings.types";

/* -------------------------------------------------------------------------- */
/*                                   SALON                                    */
/* -------------------------------------------------------------------------- */

export const DEFAULT_SALON_SETTINGS = {
  name:
    "Le Palais des Ongles",

  legalName:
    "Le Palais des Ongles",

  description:
    "Salon spécialisé dans la beauté des ongles, les poses, les remplissages et le nail art.",

  tagline:
    "Sublimez vos ongles, révélez votre élégance.",

  email:
    "admin@lepalaisdesongles.fr",

  phone:
    "",

  addressLine1:
    "",

  addressLine2:
    "",

  postalCode:
    "",

  city:
    "",

  country:
    "France",

  timezone:
    "Europe/Paris",

  locale:
    "fr-FR",

  currency:
    "EUR",
} satisfies SalonSettings;

/* -------------------------------------------------------------------------- */
/*                               RÉSERVATIONS                                 */
/* -------------------------------------------------------------------------- */

export const DEFAULT_BOOKING_SETTINGS = {
  onlineBookingEnabled:
    true,

  requireClientAccount:
    true,

  minimumAdvanceHours:
    2,

  maximumAdvanceDays:
    90,

  slotIntervalMinutes:
    15,

  defaultCleanupMinutes:
    0,

  allowClientCancellation:
    true,

  cancellationDeadlineHours:
    24,

  requireClientPhone:
    true,

  allowAppointmentImages:
    true,

  maximumAppointmentImages:
    5,

  autoConfirmAppointments:
    false,

  defaultDepositRequired:
    true,

  defaultDepositCents:
    2000,
} satisfies BookingSettings;

/* -------------------------------------------------------------------------- */
/*                                PAIEMENTS                                   */
/* -------------------------------------------------------------------------- */

export const DEFAULT_PAYMENT_SETTINGS = {
  paypalEnabled:
    true,

  allowCashPayment:
    true,

  allowCardPaymentAtSalon:
    true,

  depositEnabled:
    true,

  depositRequiredByDefault:
    true,

  defaultDepositCents:
    2000,

  allowFullOnlinePayment:
    false,

  refundPolicy:
    "L’acompte peut être conservé lorsque l’annulation intervient moins de 24 heures avant le rendez-vous.",

  paymentInstructions:
    "L’acompte en ligne est réglé exclusivement avec PayPal. Le solde est réglé au salon.",
} satisfies PaymentSettings;

/* -------------------------------------------------------------------------- */
/*                              NOTIFICATIONS                                 */
/* -------------------------------------------------------------------------- */

export const DEFAULT_NOTIFICATION_SETTINGS = {
  emailsEnabled:
    true,

  notifyAdminOnAppointmentCreated:
    true,

  notifyClientOnAppointmentCreated:
    true,

  notifyClientOnAppointmentConfirmed:
    true,

  notifyClientOnAppointmentRefused:
    true,

  notifyClientOnAppointmentCancelled:
    true,

  appointmentReminderEnabled:
    true,

  appointmentReminderHoursBefore:
    24,

  reviewRequestEnabled:
    true,

  reviewRequestHoursAfter:
    24,

  notifyAdminOnNewReview:
    true,

  notifyAdminOnNewMessage:
    true,

  adminNotificationEmail:
    "admin@lepalaisdesongles.fr",

  replyToEmail:
    "admin@lepalaisdesongles.fr",
} satisfies NotificationSettings;

/* -------------------------------------------------------------------------- */
/*                                   SITE                                     */
/* -------------------------------------------------------------------------- */

export const DEFAULT_WEBSITE_SETTINGS = {
  siteTitle:
    "Le Palais des Ongles",

  siteDescription:
    "Réservez votre prestation ongulaire en ligne auprès du Palais des Ongles.",

  logoUrl:
    "",

  faviconUrl:
    "",

  homeHeroImageUrl:
    "",

  homeHeroMobileImageUrl:
    "",

  bookingCtaImageUrl:
    "",

  defaultServiceImageUrl:
    "",

  socialShareImageUrl:
    "",

  maintenanceMode:
    false,

  showServices:
    true,

  showGallery:
    true,

  showReviews:
    true,

  showPromotions:
    true,

  showContests:
    true,

  showVipProgram:
    true,

  primaryColor:
    "#ec1763",

  secondaryColor:
    "#f9a8d4",

  accentColor:
    "#7c3aed",

  seoTitle:
    "Le Palais des Ongles | Prothésiste ongulaire",

  seoDescription:
    "Découvrez les prestations, les réalisations, les promotions et réservez votre rendez-vous au Palais des Ongles.",

  seoKeywords:
    "ongles, prothésiste ongulaire, manucure, nail art, gel, semi-permanent",
} satisfies WebsiteSettings;

/* -------------------------------------------------------------------------- */
/*                              RÉSEAUX SOCIAUX                               */
/* -------------------------------------------------------------------------- */

export const DEFAULT_SOCIAL_SETTINGS = {
  instagramUrl:
    "",

  facebookUrl:
    "",

  tiktokUrl:
    "",

  pinterestUrl:
    "",

  googleBusinessUrl:
    "",

  googleReviewUrl:
    "",

  whatsappNumber:
    "",

  showInstagram:
    false,

  showFacebook:
    false,

  showTiktok:
    false,

  showPinterest:
    false,

  showGoogleBusiness:
    false,

  showWhatsapp:
    false,
} satisfies SocialSettings;

/* -------------------------------------------------------------------------- */
/*                                  LÉGAL                                     */
/* -------------------------------------------------------------------------- */

export const DEFAULT_LEGAL_SETTINGS = {
  businessOwnerName:
    "",

  businessLegalName:
    "Le Palais des Ongles",

  legalStatus:
    "",

  siret:
    "",

  siren:
    "",

  vatNumber:
    "",

  registeredAddress:
    "",

  publicationDirector:
    "",

  privacyContactEmail:
    "admin@lepalaisdesongles.fr",

  hostingProviderName:
    "",

  hostingProviderAddress:
    "",

  hostingProviderPhone:
    "",

  termsUpdatedAt:
    "",

  privacyPolicyUpdatedAt:
    "",
} satisfies LegalSettings;

/* -------------------------------------------------------------------------- */
/*                              DONNÉES COMPLÈTES                             */
/* -------------------------------------------------------------------------- */

export const DEFAULT_ADMIN_SETTINGS = {
  salon:
    DEFAULT_SALON_SETTINGS,

  booking:
    DEFAULT_BOOKING_SETTINGS,

  payments:
    DEFAULT_PAYMENT_SETTINGS,

  notifications:
    DEFAULT_NOTIFICATION_SETTINGS,

  website:
    DEFAULT_WEBSITE_SETTINGS,

  social:
    DEFAULT_SOCIAL_SETTINGS,

  legal:
    DEFAULT_LEGAL_SETTINGS,

  paypalStatus: {
    environment:
      "UNKNOWN",

    clientIdConfigured:
      false,

    clientSecretConfigured:
      false,

    webhookIdConfigured:
      false,

    fullyConfigured:
      false,
  },

  updatedAt:
    null,
} satisfies AdminSettingsData;
