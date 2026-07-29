/* -------------------------------------------------------------------------- */
/*                              ÉNUMÉRATIONS                                  */
/* -------------------------------------------------------------------------- */

export type AdminPromotionType =
  | "PERCENTAGE"
  | "FIXED_AMOUNT"
  | "FREE_SERVICE"
  | "CUSTOM";

export type AdminPromotionComputedStatus =
  | "DRAFT"
  | "SCHEDULED"
  | "ACTIVE"
  | "EXPIRED"
  | "EXHAUSTED"
  | "DISABLED";

export type AdminPromotionFilterStatus =
  | "ALL"
  | AdminPromotionComputedStatus;

export type AdminPromotionAction =
  | "ACTIVATE"
  | "DEACTIVATE"
  | "SHOW_ON_HOMEPAGE"
  | "HIDE_FROM_HOMEPAGE"
  | "DUPLICATE"
  | "DELETE";

/* -------------------------------------------------------------------------- */
/*                                  SERVICE                                   */
/* -------------------------------------------------------------------------- */

export type AdminPromotionServiceOption = {
  id: string;

  name: string;
  slug: string;

  categoryName: string;

  priceCents: number | null;
  promotionalPriceCents: number | null;

  durationMinutes: number;

  imageUrl: string | null;

  isActive: boolean;
  allowOnlineBooking: boolean;
};

export type AdminPromotionService = {
  id: string;

  name: string;
  slug: string;

  categoryName: string;

  priceCents: number | null;
  promotionalPriceCents: number | null;

  durationMinutes: number;

  imageUrl: string | null;
};

/* -------------------------------------------------------------------------- */
/*                                  CRÉATEUR                                  */
/* -------------------------------------------------------------------------- */

export type AdminPromotionCreator = {
  id: string;

  firstName: string;
  lastName: string;

  email: string;
} | null;

/* -------------------------------------------------------------------------- */
/*                                  BANNIÈRE                                  */
/* -------------------------------------------------------------------------- */

export type AdminPromotionBanner = {
  id: string;

  title: string;
  subtitle: string | null;

  imageUrl: string | null;
  mobileImageUrl: string | null;

  buttonLabel: string | null;
  buttonUrl: string | null;

  backgroundColor: string | null;
  textColor: string | null;

  startsAt: string | null;
  endsAt: string | null;

  isActive: boolean;
  sortOrder: number;
};

/* -------------------------------------------------------------------------- */
/*                                 PROMOTION                                  */
/* -------------------------------------------------------------------------- */

export type AdminPromotion = {
  id: string;
  createdById: string | null;

  name: string;
  slug: string;

  description: string | null;

  type: AdminPromotionType;

  percentageValue: number | null;
  amountCents: number | null;

  code: string | null;

  imageUrl: string | null;

  startsAt: string;
  endsAt: string;

  usageLimit: number | null;
  usageCount: number;

  remainingUses: number | null;

  perClientLimit: number | null;
  minimumSpendCents: number | null;

  isActive: boolean;
  showOnHomepage: boolean;

  computedStatus: AdminPromotionComputedStatus;

  serviceCount: number;
  services: AdminPromotionService[];

  banner: AdminPromotionBanner | null;

  createdBy: AdminPromotionCreator;

  createdAt: string;
  updatedAt: string;
};

/* -------------------------------------------------------------------------- */
/*                            PROMOTION DÉTAILLÉE                              */
/* -------------------------------------------------------------------------- */

export type AdminPromotionDetails =
  AdminPromotion & {
    banners: AdminPromotionBanner[];
  };

/* -------------------------------------------------------------------------- */
/*                                STATISTIQUES                                */
/* -------------------------------------------------------------------------- */

export type AdminPromotionMetrics = {
  totalPromotions: number;

  activePromotions: number;
  scheduledPromotions: number;
  expiredPromotions: number;
  exhaustedPromotions: number;
  disabledPromotions: number;

  homepagePromotions: number;

  totalUsages: number;
  availableLimitedUses: number;

  promotionsEndingSoon: number;
};

/* -------------------------------------------------------------------------- */
/*                                   ALERTES                                  */
/* -------------------------------------------------------------------------- */

export type AdminPromotionAlertTone =
  | "ROSE"
  | "AMBER"
  | "BLUE"
  | "VIOLET"
  | "EMERALD"
  | "RED";

export type AdminPromotionAlert = {
  id: string;

  title: string;
  description: string;

  count: number | null;

  href: string;

  tone: AdminPromotionAlertTone;
};

/* -------------------------------------------------------------------------- */
/*                              DONNÉES DASHBOARD                             */
/* -------------------------------------------------------------------------- */

export type AdminPromotionsDashboardData = {
  generatedAt: string;

  metrics: AdminPromotionMetrics;

  alerts: AdminPromotionAlert[];

  promotions: AdminPromotion[];

  activePromotions: AdminPromotion[];
  upcomingPromotions: AdminPromotion[];
  promotionsEndingSoon: AdminPromotion[];

  serviceOptions: AdminPromotionServiceOption[];
};

/* -------------------------------------------------------------------------- */
/*                                FORMULAIRE                                  */
/* -------------------------------------------------------------------------- */

export type AdminPromotionFormInput = {
  id?: string;

  name: string;
  slug: string;

  description: string;

  type: AdminPromotionType;

  percentageValue: number | null;
  amountCents: number | null;

  code: string;

  imageUrl: string;

  startsAt: string;
  endsAt: string;

  usageLimit: number | null;
  perClientLimit: number | null;
  minimumSpendCents: number | null;

  isActive: boolean;
  showOnHomepage: boolean;

  serviceIds: string[];

  bannerEnabled: boolean;

  bannerTitle: string;
  bannerSubtitle: string;

  bannerImageUrl: string;
  bannerMobileImageUrl: string;

  bannerButtonLabel: string;
  bannerButtonUrl: string;

  bannerBackgroundColor: string;
  bannerTextColor: string;
};

/* -------------------------------------------------------------------------- */
/*                                 FILTRES                                    */
/* -------------------------------------------------------------------------- */

export type AdminPromotionFilters = {
  search: string;

  status: AdminPromotionFilterStatus;

  type: "ALL" | AdminPromotionType;

  homepageOnly: boolean;
};

/* -------------------------------------------------------------------------- */
/*                           MODIFICATION D’ÉTAT                              */
/* -------------------------------------------------------------------------- */

export type AdminPromotionStatusInput = {
  promotionId: string;

  action: AdminPromotionAction;

  reason?: string;
};

/* -------------------------------------------------------------------------- */
/*                              ÉTAT DES ACTIONS                              */
/* -------------------------------------------------------------------------- */

export type AdminPromotionActionState = {
  success: boolean;

  message: string;

  promotionId?: string;
  redirectTo?: string;

  fieldErrors?: Record<
    string,
    string[]
  >;
};
