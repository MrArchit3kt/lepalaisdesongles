/* -------------------------------------------------------------------------- */
/*                                  CLÉS DB                                   */
/* -------------------------------------------------------------------------- */

export const ADMIN_SETTING_KEYS = {
  salon: "admin.salon",
  booking: "admin.booking",
  payments: "admin.payments",
  notifications: "admin.notifications",
  website: "admin.website",
  social: "admin.social",
  legal: "admin.legal",
} as const;

export type AdminSettingKey =
  (typeof ADMIN_SETTING_KEYS)[keyof typeof ADMIN_SETTING_KEYS];

/* -------------------------------------------------------------------------- */
/*                                  ONGLETS                                   */
/* -------------------------------------------------------------------------- */

export type AdminSettingsSection =
  | "SALON"
  | "BOOKING"
  | "PAYMENTS"
  | "NOTIFICATIONS"
  | "WEBSITE"
  | "SOCIAL"
  | "LEGAL";

/* -------------------------------------------------------------------------- */
/*                                   SALON                                    */
/* -------------------------------------------------------------------------- */

export type SalonSettings = {
  name: string;
  legalName: string;

  description: string;
  tagline: string;

  email: string;
  phone: string;

  addressLine1: string;
  addressLine2: string;
  postalCode: string;
  city: string;
  country: string;

  timezone: string;
  locale: string;
  currency: string;
};

/* -------------------------------------------------------------------------- */
/*                               RÉSERVATIONS                                 */
/* -------------------------------------------------------------------------- */

export type BookingSettings = {
  onlineBookingEnabled: boolean;
  requireClientAccount: boolean;

  minimumAdvanceHours: number;
  maximumAdvanceDays: number;

  slotIntervalMinutes: number;
  defaultCleanupMinutes: number;

  allowClientCancellation: boolean;
  cancellationDeadlineHours: number;

  requireClientPhone: boolean;
  allowAppointmentImages: boolean;
  maximumAppointmentImages: number;

  autoConfirmAppointments: boolean;

  defaultDepositRequired: boolean;
  defaultDepositCents: number;
};

/* -------------------------------------------------------------------------- */
/*                                PAIEMENTS                                   */
/* -------------------------------------------------------------------------- */

export type PaymentSettings = {
  paypalEnabled: boolean;

  allowCashPayment: boolean;
  allowCardPaymentAtSalon: boolean;

  depositEnabled: boolean;
  depositRequiredByDefault: boolean;
  defaultDepositCents: number;

  allowFullOnlinePayment: boolean;

  refundPolicy: string;
  paymentInstructions: string;
};

export type PaypalEnvironment =
  | "SANDBOX"
  | "LIVE"
  | "UNKNOWN";

export type PaypalConfigurationStatus = {
  environment: PaypalEnvironment;

  clientIdConfigured: boolean;
  clientSecretConfigured: boolean;
  webhookIdConfigured: boolean;

  fullyConfigured: boolean;
};

/* -------------------------------------------------------------------------- */
/*                              NOTIFICATIONS                                 */
/* -------------------------------------------------------------------------- */

export type NotificationSettings = {
  emailsEnabled: boolean;

  notifyAdminOnAppointmentCreated: boolean;
  notifyClientOnAppointmentCreated: boolean;
  notifyClientOnAppointmentConfirmed: boolean;
  notifyClientOnAppointmentRefused: boolean;
  notifyClientOnAppointmentCancelled: boolean;

  appointmentReminderEnabled: boolean;
  appointmentReminderHoursBefore: number;

  reviewRequestEnabled: boolean;
  reviewRequestHoursAfter: number;

  notifyAdminOnNewReview: boolean;
  notifyAdminOnNewMessage: boolean;

  adminNotificationEmail: string;
  replyToEmail: string;
};

/* -------------------------------------------------------------------------- */
/*                                   SITE                                     */
/* -------------------------------------------------------------------------- */

export type WebsiteSettings = {
  siteTitle: string;
  siteDescription: string;

  logoUrl: string;
  faviconUrl: string;

  homeHeroImageUrl: string;
  homeHeroMobileImageUrl: string;
  bookingCtaImageUrl: string;
  defaultServiceImageUrl: string;
  socialShareImageUrl: string;

  maintenanceMode: boolean;

  showServices: boolean;
  showGallery: boolean;
  showReviews: boolean;
  showPromotions: boolean;
  showContests: boolean;
  showVipProgram: boolean;

  primaryColor: string;
  secondaryColor: string;
  accentColor: string;

  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
};

/*
 * Liste fermée des champs d’images pouvant être
 * modifiés depuis les paramètres administratifs.
 */
export const WEBSITE_IMAGE_FIELDS = [
  "logoUrl",
  "faviconUrl",
  "homeHeroImageUrl",
  "homeHeroMobileImageUrl",
  "bookingCtaImageUrl",
  "defaultServiceImageUrl",
  "socialShareImageUrl",
] as const;

export type WebsiteImageField =
  (typeof WEBSITE_IMAGE_FIELDS)[number];

export type WebsiteImageUploadKeys =
  Partial<
    Record<
      WebsiteImageField,
      string
    >
  >;



/* -------------------------------------------------------------------------- */
/*                              RÉSEAUX SOCIAUX                               */
/* -------------------------------------------------------------------------- */

export type SocialSettings = {
  instagramUrl: string;
  facebookUrl: string;
  tiktokUrl: string;
  pinterestUrl: string;

  googleBusinessUrl: string;
  googleReviewUrl: string;

  whatsappNumber: string;

  showInstagram: boolean;
  showFacebook: boolean;
  showTiktok: boolean;
  showPinterest: boolean;
  showGoogleBusiness: boolean;
  showWhatsapp: boolean;
};

/* -------------------------------------------------------------------------- */
/*                                  LÉGAL                                     */
/* -------------------------------------------------------------------------- */

export type LegalSettings = {
  businessOwnerName: string;
  businessLegalName: string;
  legalStatus: string;

  siret: string;
  siren: string;
  vatNumber: string;

  registeredAddress: string;

  publicationDirector: string;
  privacyContactEmail: string;

  hostingProviderName: string;
  hostingProviderAddress: string;
  hostingProviderPhone: string;

  termsUpdatedAt: string;
  privacyPolicyUpdatedAt: string;
};

/* -------------------------------------------------------------------------- */
/*                              DONNÉES GLOBALES                              */
/* -------------------------------------------------------------------------- */

export type AdminSettingsData = {
  salon: SalonSettings;
  booking: BookingSettings;
  payments: PaymentSettings;
  notifications: NotificationSettings;
  website: WebsiteSettings;
  social: SocialSettings;
  legal: LegalSettings;

  paypalStatus: PaypalConfigurationStatus;

  updatedAt: string | null;
};

/* -------------------------------------------------------------------------- */
/*                                ÉTAT ACTION                                 */
/* -------------------------------------------------------------------------- */

export type AdminSettingsActionState = {
  success: boolean;
  message: string;

  section: AdminSettingsSection | null;

  fieldErrors?: Record<
    string,
    string[]
  >;
};
