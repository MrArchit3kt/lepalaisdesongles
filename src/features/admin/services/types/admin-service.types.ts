/* -------------------------------------------------------------------------- */
/*                                CATÉGORIES                                  */
/* -------------------------------------------------------------------------- */

export type AdminServiceCategoryOption = {
  id: string;
  name: string;
  slug: string;
  color: string | null;
  isActive: boolean;
  sortOrder: number;
};

/* -------------------------------------------------------------------------- */
/*                                   IMAGES                                   */
/* -------------------------------------------------------------------------- */

export type AdminServiceImage = {
  id: string;
  url: string;
  alt: string | null;
  sortOrder: number;
  isCover: boolean;
};

/* -------------------------------------------------------------------------- */
/*                                PRESTATIONS                                 */
/* -------------------------------------------------------------------------- */

export type AdminServiceListItem = {
  id: string;
  categoryId: string;

  name: string;
  slug: string;

  shortDescription: string | null;
  description: string | null;

  priceCents: number | null;
  promotionalPriceCents: number | null;

  durationMinutes: number;
  cleanupMinutes: number;

  depositRequired: boolean;
  depositCents: number | null;

  imageUrl: string | null;
  color: string | null;

  isActive: boolean;
  isFeatured: boolean;
  allowOnlineBooking: boolean;

  sortOrder: number;

  createdAt: Date;
  updatedAt: Date;

  category: {
    id: string;
    name: string;
    slug: string;
    color: string | null;
  };

  images: AdminServiceImage[];

  appointmentCount: number;
  staffCount: number;
};

export type AdminServiceDetails =
  AdminServiceListItem;

/* -------------------------------------------------------------------------- */
/*                              STATISTIQUES                                  */
/* -------------------------------------------------------------------------- */

export type AdminServiceStatistics = {
  totalServices: number;
  activeServices: number;
  hiddenServices: number;
  featuredServices: number;
  onlineBookingServices: number;
  quoteOnlyServices: number;
  totalCategories: number;
};

/* -------------------------------------------------------------------------- */
/*                                  PAGE                                      */
/* -------------------------------------------------------------------------- */

export type AdminServicesPageData = {
  services: AdminServiceListItem[];

  categories:
    AdminServiceCategoryOption[];

  statistics:
    AdminServiceStatistics;
};

/* -------------------------------------------------------------------------- */
/*                                  FILTRES                                   */
/* -------------------------------------------------------------------------- */

export type AdminServiceStatusFilter =
  | "ALL"
  | "ACTIVE"
  | "HIDDEN";

export type AdminServiceBookingFilter =
  | "ALL"
  | "ONLINE"
  | "QUOTE_ONLY";

export type AdminServiceFilters = {
  search: string;
  categoryId?: string;
  status: AdminServiceStatusFilter;
  booking: AdminServiceBookingFilter;
};

/* -------------------------------------------------------------------------- */
/*                                  ACTIONS                                   */
/* -------------------------------------------------------------------------- */

export type AdminServiceActionState = {
  success: boolean;
  message: string;

  fieldErrors?: Record<
    string,
    string[]
  >;

  serviceId?: string;
  redirectUrl?: string;
};
