import {
  Prisma,
} from "@/generated/prisma/client";

import {
  adminPromotionFiltersSchema,
  adminPromotionFormSchema,
  adminPromotionStatusSchema,
} from "@/features/admin/promotions/schemas/admin-promotions.schemas";

import type {
  AdminPromotion,
  AdminPromotionAction,
  AdminPromotionBanner,
  AdminPromotionComputedStatus,
  AdminPromotionDetails,
  AdminPromotionFilters,
  AdminPromotionFormInput,
  AdminPromotionService,
  AdminPromotionServiceOption,
  AdminPromotionStatusInput,
} from "@/features/admin/promotions/types/admin-promotions.types";

import {
  prisma,
} from "@/lib/prisma";

/* -------------------------------------------------------------------------- */
/*                                  ERREURS                                   */
/* -------------------------------------------------------------------------- */

export class AdminPromotionValidationError extends Error {
  readonly fieldErrors: Record<
    string,
    string[]
  >;

  constructor(
    message: string,
    fieldErrors: Record<
      string,
      string[]
    > = {},
  ) {
    super(
      message,
    );

    this.name =
      "AdminPromotionValidationError";

    this.fieldErrors =
      fieldErrors;
  }
}

export class AdminPromotionNotFoundError extends Error {
  constructor() {
    super(
      "Cette promotion est introuvable.",
    );

    this.name =
      "AdminPromotionNotFoundError";
  }
}

export class AdminPromotionDeleteError extends Error {
  constructor(
    message: string,
  ) {
    super(
      message,
    );

    this.name =
      "AdminPromotionDeleteError";
  }
}

/* -------------------------------------------------------------------------- */
/*                            SÉLECTIONS PRISMA                               */
/* -------------------------------------------------------------------------- */

const promotionServiceSelect = {
  promotionId:
    true,

  serviceId:
    true,

  service: {
    select: {
      id:
        true,

      categoryId:
        true,

      name:
        true,

      slug:
        true,

      shortDescription:
        true,

      priceCents:
        true,

      promotionalPriceCents:
        true,

      durationMinutes:
        true,

      imageUrl:
        true,

      color:
        true,

      isActive:
        true,

      allowOnlineBooking:
        true,

      sortOrder:
        true,

      category: {
        select: {
          id:
            true,

          name:
            true,

          slug:
            true,

          color:
            true,

          isActive:
            true,

          sortOrder:
            true,
        },
      },
    },
  },
} satisfies Prisma.PromotionServiceSelect;

const promotionBannerSelect = {
  id:
    true,

  promotionId:
    true,

  title:
    true,

  subtitle:
    true,

  imageUrl:
    true,

  mobileImageUrl:
    true,

  buttonLabel:
    true,

  buttonUrl:
    true,

  position:
    true,

  backgroundColor:
    true,

  textColor:
    true,

  startsAt:
    true,

  endsAt:
    true,

  isActive:
    true,

  sortOrder:
    true,

  createdAt:
    true,

  updatedAt:
    true,
} satisfies Prisma.BannerSelect;

const promotionCreatorSelect = {
  id:
    true,

  firstName:
    true,

  lastName:
    true,

  email:
    true,
} satisfies Prisma.UserSelect;

const promotionDetailsSelect = {
  id:
    true,

  createdById:
    true,

  name:
    true,

  slug:
    true,

  description:
    true,

  type:
    true,

  percentageValue:
    true,

  amountCents:
    true,

  code:
    true,

  imageUrl:
    true,

  startsAt:
    true,

  endsAt:
    true,

  usageLimit:
    true,

  usageCount:
    true,

  perClientLimit:
    true,

  minimumSpendCents:
    true,

  isActive:
    true,

  showOnHomepage:
    true,

  createdAt:
    true,

  updatedAt:
    true,

  createdBy: {
    select:
      promotionCreatorSelect,
  },

  services: {
    orderBy: [
      {
        service: {
          sortOrder:
            "asc",
        },
      },

      {
        service: {
          name:
            "asc",
        },
      },
    ],

    select:
      promotionServiceSelect,
  },

  banners: {
    orderBy: [
      {
        sortOrder:
          "asc",
      },

      {
        createdAt:
          "asc",
      },
    ],

    select:
      promotionBannerSelect,
  },
} satisfies Prisma.PromotionSelect;

/* -------------------------------------------------------------------------- */
/*                              TYPES PRISMA                                  */
/* -------------------------------------------------------------------------- */

type PromotionDetailsRow =
  Prisma.PromotionGetPayload<{
    select:
      typeof promotionDetailsSelect;
  }>;

type PromotionServiceRow =
  Prisma.PromotionServiceGetPayload<{
    select:
      typeof promotionServiceSelect;
  }>;

type PromotionBannerRow =
  Prisma.BannerGetPayload<{
    select:
      typeof promotionBannerSelect;
  }>;

type PromotionSnapshotSource = {
  id:
    string;

  name:
    string;

  slug:
    string;

  description:
    string | null;

  type:
    "PERCENTAGE"
    | "FIXED_AMOUNT"
    | "FREE_SERVICE"
    | "CUSTOM";

  percentageValue:
    number | null;

  amountCents:
    number | null;

  code:
    string | null;

  imageUrl:
    string | null;

  startsAt:
    Date;

  endsAt:
    Date;

  usageLimit:
    number | null;

  usageCount:
    number;

  perClientLimit:
    number | null;

  minimumSpendCents:
    number | null;

  isActive:
    boolean;

  showOnHomepage:
    boolean;
};

/* -------------------------------------------------------------------------- */
/*                              OUTILS ZOD                                    */
/* -------------------------------------------------------------------------- */

function normalizeFieldErrors(
  errors: Record<
    string,
    string[] | undefined
  >,
): Record<
  string,
  string[]
> {
  return Object.fromEntries(
    Object.entries(
      errors,
    ).filter(
      (
        entry,
      ): entry is [
        string,
        string[],
      ] =>
        Array.isArray(
          entry[1],
        ) &&
        entry[1].length >
          0,
    ),
  );
}

function parsePromotionForm(
  value: unknown,
): AdminPromotionFormInput {
  const result =
    adminPromotionFormSchema.safeParse(
      value,
    );

  if (
    result.success
  ) {
    return result.data;
  }

  throw new AdminPromotionValidationError(
    "Le formulaire de la promotion contient des erreurs.",
    normalizeFieldErrors(
      result.error.flatten()
        .fieldErrors,
    ),
  );
}

function parsePromotionStatus(
  value: unknown,
): AdminPromotionStatusInput {
  const result =
    adminPromotionStatusSchema.safeParse(
      value,
    );

  if (
    result.success
  ) {
    return result.data;
  }

  throw new AdminPromotionValidationError(
    "L’action demandée contient des erreurs.",
    normalizeFieldErrors(
      result.error.flatten()
        .fieldErrors,
    ),
  );
}

function parsePromotionFilters(
  value: unknown,
): AdminPromotionFilters {
  const result =
    adminPromotionFiltersSchema.safeParse(
      value,
    );

  if (
    result.success
  ) {
    return result.data;
  }

  throw new AdminPromotionValidationError(
    "Les filtres de promotions sont invalides.",
    normalizeFieldErrors(
      result.error.flatten()
        .fieldErrors,
    ),
  );
}

/* -------------------------------------------------------------------------- */
/*                              OUTILS GÉNÉRAUX                               */
/* -------------------------------------------------------------------------- */

function toInputJsonValue(
  value: unknown,
): Prisma.InputJsonValue {
  return JSON.parse(
    JSON.stringify(
      value,
    ),
  ) as Prisma.InputJsonValue;
}

function emptyToNull(
  value:
    string | null | undefined,
): string | null {
  if (
    typeof value !==
    "string"
  ) {
    return null;
  }

  const normalized =
    value.trim();

  return normalized ===
    ""
    ? null
    : normalized;
}

function normalizeCode(
  value:
    string | null | undefined,
): string | null {
  const code =
    emptyToNull(
      value,
    );

  return code
    ? code
        .toLocaleUpperCase(
          "fr-FR",
        )
        .replace(
          /\s+/g,
          "",
        )
    : null;
}

function parseDate(
  value: string,
): Date {
  return new Date(
    value,
  );
}

function uniqueStrings(
  values: string[],
): string[] {
  return [
    ...new Set(
      values
        .map(
          (
            value,
          ) =>
            value.trim(),
        )
        .filter(Boolean),
    ),
  ];
}

function slugify(
  value: string,
): string {
  return value
    .normalize(
      "NFD",
    )
    .replace(
      /[\u0300-\u036f]/g,
      "",
    )
    .toLocaleLowerCase(
      "fr-FR",
    )
    .trim()
    .replace(
      /['’"]/g,
      "",
    )
    .replace(
      /[^a-z0-9]+/g,
      "-",
    )
    .replace(
      /^-+|-+$/g,
      "",
    )
    .replace(
      /-{2,}/g,
      "-",
    );
}

function getRemainingUses({
  usageLimit,
  usageCount,
}: {
  usageLimit:
    number | null;

  usageCount:
    number;
}): number | null {
  if (
    usageLimit ===
    null
  ) {
    return null;
  }

  return Math.max(
    usageLimit -
      usageCount,
    0,
  );
}

function hasReachedUsageLimit({
  usageLimit,
  usageCount,
}: {
  usageLimit:
    number | null;

  usageCount:
    number;
}): boolean {
  return (
    usageLimit !==
      null &&
    usageCount >=
      usageLimit
  );
}

/* -------------------------------------------------------------------------- */
/*                        STATUT CALCULÉ DE LA PROMOTION                       */
/* -------------------------------------------------------------------------- */

function getPromotionComputedStatus(
  promotion: {
    isActive:
      boolean;

    startsAt:
      Date;

    endsAt:
      Date;

    usageLimit:
      number | null;

    usageCount:
      number;
  },

  now:
    Date = new Date(),
): AdminPromotionComputedStatus {
  if (
    !promotion.isActive &&
    promotion.startsAt >
      now
  ) {
    return "DRAFT";
  }

  if (
    !promotion.isActive
  ) {
    return "DISABLED";
  }

  if (
    hasReachedUsageLimit(
      promotion,
    )
  ) {
    return "EXHAUSTED";
  }

  if (
    promotion.startsAt >
    now
  ) {
    return "SCHEDULED";
  }

  if (
    promotion.endsAt <
    now
  ) {
    return "EXPIRED";
  }

  return "ACTIVE";
}

/* -------------------------------------------------------------------------- */
/*                           NORMALISATION FORMULAIRE                          */
/* -------------------------------------------------------------------------- */

function normalizePromotionFormInput(
  input:
    AdminPromotionFormInput,
): AdminPromotionFormInput {
  const type =
    input.type;

  const normalizedServiceIds =
    uniqueStrings(
      input.serviceIds,
    );

  return {
    ...input,

    id:
      input.id?.trim() ||
      undefined,

    name:
      input.name.trim(),

    slug:
      slugify(
        input.slug,
      ),

    description:
      input.description.trim(),

    code:
      normalizeCode(
        input.code,
      ) ??
      "",

    imageUrl:
      input.imageUrl.trim(),

    percentageValue:
      type ===
        "PERCENTAGE"
        ? input.percentageValue
        : null,

    amountCents:
      type ===
        "FIXED_AMOUNT"
        ? input.amountCents
        : null,

    minimumSpendCents:
      input.minimumSpendCents,

    usageLimit:
      input.usageLimit,

    perClientLimit:
      input.perClientLimit,

    serviceIds:
      normalizedServiceIds,

    bannerTitle:
      input.bannerTitle.trim(),

    bannerSubtitle:
      input.bannerSubtitle.trim(),

    bannerImageUrl:
      input.bannerImageUrl.trim(),

    bannerMobileImageUrl:
      input.bannerMobileImageUrl.trim(),

    bannerButtonLabel:
      input.bannerButtonLabel.trim(),

    bannerButtonUrl:
      input.bannerButtonUrl.trim(),

    bannerBackgroundColor:
      input.bannerBackgroundColor.trim(),

    bannerTextColor:
      input.bannerTextColor.trim(),
  };
}

/* -------------------------------------------------------------------------- */
/*                           VALIDATIONS MÉTIER                                */
/* -------------------------------------------------------------------------- */

function validatePromotionOperationalState(
  input:
    AdminPromotionFormInput,
): void {
  const startsAt =
    parseDate(
      input.startsAt,
    );

  const endsAt =
    parseDate(
      input.endsAt,
    );

  if (
    Number.isNaN(
      startsAt.getTime(),
    )
  ) {
    throw new AdminPromotionValidationError(
      "La date de début est invalide.",
      {
        startsAt: [
          "Choisissez une date de début valide.",
        ],
      },
    );
  }

  if (
    Number.isNaN(
      endsAt.getTime(),
    )
  ) {
    throw new AdminPromotionValidationError(
      "La date de fin est invalide.",
      {
        endsAt: [
          "Choisissez une date de fin valide.",
        ],
      },
    );
  }

  if (
    endsAt <=
    startsAt
  ) {
    throw new AdminPromotionValidationError(
      "La période de la promotion est invalide.",
      {
        endsAt: [
          "La date de fin doit être postérieure à la date de début.",
        ],
      },
    );
  }

  if (
    input.type ===
      "PERCENTAGE" &&
    (
      input.percentageValue ===
        null ||
      input.percentageValue <
        1 ||
      input.percentageValue >
        100
    )
  ) {
    throw new AdminPromotionValidationError(
      "Le pourcentage de réduction est invalide.",
      {
        percentageValue: [
          "Indiquez un pourcentage compris entre 1 et 100.",
        ],
      },
    );
  }

  if (
    input.type ===
      "FIXED_AMOUNT" &&
    (
      input.amountCents ===
        null ||
      input.amountCents <=
        0
    )
  ) {
    throw new AdminPromotionValidationError(
      "Le montant de réduction est invalide.",
      {
        amountCents: [
          "Indiquez un montant strictement supérieur à 0.",
        ],
      },
    );
  }

  if (
    input.usageLimit !==
      null &&
    input.perClientLimit !==
      null &&
    input.perClientLimit >
      input.usageLimit
  ) {
    throw new AdminPromotionValidationError(
      "La limite par cliente dépasse la limite globale.",
      {
        perClientLimit: [
          "La limite par cliente doit être inférieure ou égale à la limite globale.",
        ],
      },
    );
  }

  if (
    input.bannerEnabled &&
    input.bannerTitle.trim() ===
      ""
  ) {
    throw new AdminPromotionValidationError(
      "Le titre de la bannière est obligatoire.",
      {
        bannerTitle: [
          "Saisissez un titre pour la bannière.",
        ],
      },
    );
  }

  const hasBannerButtonLabel =
    input.bannerButtonLabel
      .trim() !==
    "";

  const hasBannerButtonUrl =
    input.bannerButtonUrl
      .trim() !==
    "";

  if (
    input.bannerEnabled &&
    hasBannerButtonLabel !==
      hasBannerButtonUrl
  ) {
    throw new AdminPromotionValidationError(
      "Le bouton de la bannière est incomplet.",
      {
        bannerButtonLabel:
          hasBannerButtonLabel
            ? []
            : [
                "Saisissez le texte du bouton.",
              ],

        bannerButtonUrl:
          hasBannerButtonUrl
            ? []
            : [
                "Saisissez l’adresse du bouton.",
              ],
      },
    );
  }
}

/* -------------------------------------------------------------------------- */
/*                          AUTHENTIFICATION ACTEUR                            */
/* -------------------------------------------------------------------------- */

async function assertPromotionActor(
  actorId: string,
): Promise<{
  id:
    string;

  displayName:
    string;
}> {
  const actor =
    await prisma.user.findFirst({
      where: {
        id:
          actorId,

        status:
          "ACTIVE",

        role: {
          in: [
            "SUPER_ADMIN",
            "ADMIN",
          ],
        },
      },

      select: {
        id:
          true,

        firstName:
          true,

        lastName:
          true,

        email:
          true,
      },
    });

  if (
    !actor
  ) {
    throw new Error(
      "Accès à la gestion des promotions refusé.",
    );
  }

  return {
    id:
      actor.id,

    displayName:
      [
        actor.firstName,
        actor.lastName,
      ]
        .filter(Boolean)
        .join(" ")
        .trim() ||
      actor.email,
  };
}

/* -------------------------------------------------------------------------- */
/*                      CONTRAINTES SLUG ET CODE PROMO                         */
/* -------------------------------------------------------------------------- */

async function assertPromotionSlugAvailable(
  slug: string,
  excludedPromotionId?: string,
): Promise<void> {
  const existingPromotion =
    await prisma.promotion.findUnique({
      where: {
        slug,
      },

      select: {
        id:
          true,
      },
    });

  if (
    existingPromotion &&
    existingPromotion.id !==
      excludedPromotionId
  ) {
    throw new AdminPromotionValidationError(
      "Ce slug est déjà utilisé par une autre promotion.",
      {
        slug: [
          "Choisissez un autre slug.",
        ],
      },
    );
  }
}

async function assertPromotionCodeAvailable(
  code: string | null,
  excludedPromotionId?: string,
): Promise<void> {
  if (
    !code
  ) {
    return;
  }

  const existingPromotion =
    await prisma.promotion.findUnique({
      where: {
        code,
      },

      select: {
        id:
          true,
      },
    });

  if (
    existingPromotion &&
    existingPromotion.id !==
      excludedPromotionId
  ) {
    throw new AdminPromotionValidationError(
      "Ce code promotionnel est déjà utilisé.",
      {
        code: [
          "Choisissez un autre code promotionnel.",
        ],
      },
    );
  }
}

/* -------------------------------------------------------------------------- */
/*                     VALIDATION DES PRESTATIONS CIBLÉES                     */
/* -------------------------------------------------------------------------- */

async function assertPromotionServicesExist(
  serviceIds: string[],
): Promise<void> {
  if (
    serviceIds.length ===
    0
  ) {
    return;
  }

  const services =
    await prisma.service.findMany({
      where: {
        id: {
          in:
            serviceIds,
        },
      },

      select: {
        id:
          true,

        name:
          true,

        isActive:
          true,
      },
    });

  const existingServiceIds =
    new Set(
      services.map(
        (service) =>
          service.id,
      ),
    );

  const missingServiceIds =
    serviceIds.filter(
      (serviceId) =>
        !existingServiceIds.has(
          serviceId,
        ),
    );

  if (
    missingServiceIds.length >
    0
  ) {
    throw new AdminPromotionValidationError(
      "Une ou plusieurs prestations sélectionnées sont introuvables.",
      {
        serviceIds: [
          "Actualisez la page puis sélectionnez uniquement des prestations existantes.",
        ],
      },
    );
  }
}

/* -------------------------------------------------------------------------- */
/*                      GÉNÉRATION D’UN SLUG UNIQUE                            */
/* -------------------------------------------------------------------------- */

async function generateUniquePromotionSlug(
  name: string,
): Promise<string> {
  const normalizedName =
    slugify(
      name,
    );

  const baseSlug =
    normalizedName ||
    crypto.randomUUID();

  let candidate =
    baseSlug;

  let suffix =
    1;

  while (
    true
  ) {
    const existingPromotion =
      await prisma.promotion.findUnique({
        where: {
          slug:
            candidate,
        },

        select: {
          id:
            true,
        },
      });

    if (
      !existingPromotion
    ) {
      return candidate;
    }

    candidate =
      `${baseSlug}-${suffix}`;

    suffix +=
      1;
  }
}

/* -------------------------------------------------------------------------- */
/*                         TRANSFORMATION CRÉATEUR                             */
/* -------------------------------------------------------------------------- */

function serializePromotionCreator(
  creator:
    PromotionDetailsRow["createdBy"],
) {
  if (
    !creator
  ) {
    return null;
  }

  return {
    id:
      creator.id,

    firstName:
      creator.firstName,

    lastName:
      creator.lastName,

    email:
      creator.email,
  };
}

/* -------------------------------------------------------------------------- */
/*                       TRANSFORMATION PRESTATION                             */
/* -------------------------------------------------------------------------- */

function serializePromotionService(
  relation:
    PromotionServiceRow,
): AdminPromotionService {
  return {
    id:
      relation.service.id,

    name:
      relation.service.name,

    slug:
      relation.service.slug,

    categoryName:
      relation.service.category.name,

    priceCents:
      relation.service.priceCents,

    promotionalPriceCents:
      relation.service.promotionalPriceCents,

    durationMinutes:
      relation.service.durationMinutes,

    imageUrl:
      relation.service.imageUrl,
  };
}

/* -------------------------------------------------------------------------- */
/*                        TRANSFORMATION BANNIÈRE                              */
/* -------------------------------------------------------------------------- */

function serializePromotionBanner(
  banner:
    PromotionBannerRow,
): AdminPromotionBanner {
  return {
    id:
      banner.id,

    title:
      banner.title,

    subtitle:
      banner.subtitle,

    imageUrl:
      banner.imageUrl,

    mobileImageUrl:
      banner.mobileImageUrl,

    buttonLabel:
      banner.buttonLabel,

    buttonUrl:
      banner.buttonUrl,

    backgroundColor:
      banner.backgroundColor,

    textColor:
      banner.textColor,

    startsAt:
      banner.startsAt?.toISOString() ??
      null,

    endsAt:
      banner.endsAt?.toISOString() ??
      null,

    isActive:
      banner.isActive,

    sortOrder:
      banner.sortOrder,
  };
}

/* -------------------------------------------------------------------------- */
/*                     TRANSFORMATION D’UNE PROMOTION                          */
/* -------------------------------------------------------------------------- */

function serializePromotion(
  promotion:
    PromotionDetailsRow,
  now:
    Date = new Date(),
): AdminPromotionDetails {
  const services =
    promotion.services.map(
      serializePromotionService,
    );

  const banners =
    promotion.banners.map(
      serializePromotionBanner,
    );

  const primaryBanner =
    banners[0] ??
    null;

  const computedStatus =
    getPromotionComputedStatus(
      promotion,
      now,
    );

  const remainingUses =
    getRemainingUses(
      promotion,
    );

  return {
    id:
      promotion.id,

    createdById:
      promotion.createdById,

    name:
      promotion.name,

    slug:
      promotion.slug,

    description:
      promotion.description,

    type:
      promotion.type,

    percentageValue:
      promotion.percentageValue,

    amountCents:
      promotion.amountCents,

    code:
      promotion.code,

    imageUrl:
      promotion.imageUrl,

    startsAt:
      promotion.startsAt.toISOString(),

    endsAt:
      promotion.endsAt.toISOString(),

    usageLimit:
      promotion.usageLimit,

    usageCount:
      promotion.usageCount,

    remainingUses,

    perClientLimit:
      promotion.perClientLimit,

    minimumSpendCents:
      promotion.minimumSpendCents,

    isActive:
      promotion.isActive,

    showOnHomepage:
      promotion.showOnHomepage,

    computedStatus,

    serviceCount:
      services.length,

    createdBy:
      serializePromotionCreator(
        promotion.createdBy,
      ),

    services,


    banners,

    banner:
      primaryBanner,

    createdAt:
      promotion.createdAt.toISOString(),

    updatedAt:
      promotion.updatedAt.toISOString(),
  };
}

/* -------------------------------------------------------------------------- */
/*                     TRANSFORMATION POUR LA LISTE                            */
/* -------------------------------------------------------------------------- */

function serializePromotionListItem(
  promotion:
    PromotionDetailsRow,
  now:
    Date = new Date(),
): AdminPromotion {
  const details =
    serializePromotion(
      promotion,
      now,
    );

  return {
    id:
      details.id,

    createdById:
      details.createdById,

    name:
      details.name,

    slug:
      details.slug,

    description:
      details.description,

    type:
      details.type,

    percentageValue:
      details.percentageValue,

    amountCents:
      details.amountCents,

    code:
      details.code,

    imageUrl:
      details.imageUrl,

    startsAt:
      details.startsAt,

    endsAt:
      details.endsAt,

    usageLimit:
      details.usageLimit,

    usageCount:
      details.usageCount,

    remainingUses:
      details.remainingUses,

    perClientLimit:
      details.perClientLimit,

    minimumSpendCents:
      details.minimumSpendCents,

    isActive:
      details.isActive,

    showOnHomepage:
      details.showOnHomepage,

    computedStatus:
      details.computedStatus,

    serviceCount:
      details.serviceCount,

    createdBy:
      details.createdBy,

    services:
      details.services,

    banner:
      details.banner,

    createdAt:
      details.createdAt,

    updatedAt:
      details.updatedAt,
  };
}

/* -------------------------------------------------------------------------- */
/*                      OPTIONS DE PRESTATIONS ADMIN                           */
/* -------------------------------------------------------------------------- */

function serializePromotionServiceOption(
  service: {
    id:
      string;

    name:
      string;

    slug:
      string;

    priceCents:
      number | null;

    promotionalPriceCents:
      number | null;

    durationMinutes:
      number;

    imageUrl:
      string | null;

    isActive:
      boolean;

    allowOnlineBooking:
      boolean;

    category: {
      name:
        string;
    };
  },
): AdminPromotionServiceOption {
  return {
    id:
      service.id,

    name:
      service.name,

    slug:
      service.slug,

    categoryName:
      service.category.name,

    priceCents:
      service.priceCents,

    promotionalPriceCents:
      service.promotionalPriceCents,

    durationMinutes:
      service.durationMinutes,

    imageUrl:
      service.imageUrl,

    isActive:
      service.isActive,

    allowOnlineBooking:
      service.allowOnlineBooking,
  };
}

/* -------------------------------------------------------------------------- */
/*                      SNAPSHOT POUR LE JOURNAL D’AUDIT                       */
/* -------------------------------------------------------------------------- */

function getPromotionSnapshot(
  promotion:
    PromotionSnapshotSource,
) {
  return {
    id:
      promotion.id,

    name:
      promotion.name,

    slug:
      promotion.slug,

    description:
      promotion.description,

    type:
      promotion.type,

    percentageValue:
      promotion.percentageValue,

    amountCents:
      promotion.amountCents,

    code:
      promotion.code,

    imageUrl:
      promotion.imageUrl,

    startsAt:
      promotion.startsAt.toISOString(),

    endsAt:
      promotion.endsAt.toISOString(),

    usageLimit:
      promotion.usageLimit,

    usageCount:
      promotion.usageCount,

    perClientLimit:
      promotion.perClientLimit,

    minimumSpendCents:
      promotion.minimumSpendCents,

    isActive:
      promotion.isActive,

    showOnHomepage:
      promotion.showOnHomepage,

    computedStatus:
      getPromotionComputedStatus(
        promotion,
      ),
  };
}

/* -------------------------------------------------------------------------- */
/*                       DONNÉES PRISMA DE LA BANNIÈRE                         */
/* -------------------------------------------------------------------------- */

function getPromotionBannerData(
  input:
    AdminPromotionFormInput,
): {
  title:
    string;

  subtitle:
    string | null;

  imageUrl:
    string | null;

  mobileImageUrl:
    string | null;

  buttonLabel:
    string | null;

  buttonUrl:
    string | null;

  position:
    "TOP";

  backgroundColor:
    string | null;

  textColor:
    string | null;

  startsAt:
    Date;

  endsAt:
    Date;

  isActive:
    boolean;

  sortOrder:
    number;
} {
  return {
    title:
      input.bannerTitle.trim(),

    subtitle:
      emptyToNull(
        input.bannerSubtitle,
      ),

    imageUrl:
      emptyToNull(
        input.bannerImageUrl,
      ),

    mobileImageUrl:
      emptyToNull(
        input.bannerMobileImageUrl,
      ),

    buttonLabel:
      emptyToNull(
        input.bannerButtonLabel,
      ),

    buttonUrl:
      emptyToNull(
        input.bannerButtonUrl,
      ),

    position:
      "TOP",

    backgroundColor:
      emptyToNull(
        input.bannerBackgroundColor,
      ),

    textColor:
      emptyToNull(
        input.bannerTextColor,
      ),

    startsAt:
      parseDate(
        input.startsAt,
      ),

    endsAt:
      parseDate(
        input.endsAt,
      ),

    isActive:
      input.isActive,

    sortOrder:
      0,
  };
}

/* -------------------------------------------------------------------------- */
/*                   SYNCHRONISATION DES PRESTATIONS                           */
/* -------------------------------------------------------------------------- */

async function synchronizePromotionServices({
  transaction,
  promotionId,
  serviceIds,
}: {
  transaction:
    Prisma.TransactionClient;

  promotionId:
    string;

  serviceIds:
    string[];
}): Promise<void> {
  await transaction.promotionService.deleteMany({
    where: {
      promotionId,
    },
  });

  if (
    serviceIds.length ===
    0
  ) {
    return;
  }

  await transaction.promotionService.createMany({
    data:
      serviceIds.map(
        (serviceId) => ({
          promotionId,

          serviceId,
        }),
      ),

    skipDuplicates:
      true,
  });
}

/* -------------------------------------------------------------------------- */
/*                     SYNCHRONISATION DE LA BANNIÈRE                          */
/* -------------------------------------------------------------------------- */

async function synchronizePromotionBanner({
  transaction,
  promotionId,
  input,
}: {
  transaction:
    Prisma.TransactionClient;

  promotionId:
    string;

  input:
    AdminPromotionFormInput;
}): Promise<void> {
  const existingBanners =
    await transaction.banner.findMany({
      where: {
        promotionId,
      },

      orderBy: [
        {
          sortOrder:
            "asc",
        },

        {
          createdAt:
            "asc",
        },
      ],

      select: {
        id:
          true,
      },
    });

  if (
    !input.bannerEnabled
  ) {
    if (
      existingBanners.length >
      0
    ) {
      await transaction.banner.deleteMany({
        where: {
          promotionId,
        },
      });
    }

    return;
  }

  const bannerData =
    getPromotionBannerData(
      input,
    );

  const primaryBanner =
    existingBanners[0];

  if (
    primaryBanner
  ) {
    await transaction.banner.update({
      where: {
        id:
          primaryBanner.id,
      },

      data:
        bannerData,
    });

    const obsoleteBannerIds =
      existingBanners
        .slice(
          1,
        )
        .map(
          (banner) =>
            banner.id,
        );

    if (
      obsoleteBannerIds.length >
      0
    ) {
      await transaction.banner.deleteMany({
        where: {
          id: {
            in:
              obsoleteBannerIds,
          },
        },
      });
    }

    return;
  }

  await transaction.banner.create({
    data: {
      promotionId,

      ...bannerData,
    },
  });
}

/* -------------------------------------------------------------------------- */
/*                        GESTION DES ERREURS PRISMA                           */
/* -------------------------------------------------------------------------- */

function handlePromotionUniqueConstraintError(
  error: unknown,
): never {
  if (
    error instanceof
      Prisma.PrismaClientKnownRequestError &&
    error.code ===
      "P2002"
  ) {
    const target =
      Array.isArray(
        error.meta?.target,
      )
        ? error.meta.target.join(
            ",",
          )
        : String(
            error.meta?.target ??
            "",
          );

    if (
      target.includes(
        "slug",
      )
    ) {
      throw new AdminPromotionValidationError(
        "Ce slug est déjà utilisé par une autre promotion.",
        {
          slug: [
            "Choisissez un autre slug.",
          ],
        },
      );
    }

    if (
      target.includes(
        "code",
      )
    ) {
      throw new AdminPromotionValidationError(
        "Ce code promotionnel est déjà utilisé.",
        {
          code: [
            "Choisissez un autre code promotionnel.",
          ],
        },
      );
    }

    throw new AdminPromotionValidationError(
      "Une promotion utilisant les mêmes informations existe déjà.",
      {},
    );
  }

  throw error;
}

/* -------------------------------------------------------------------------- */
/*                   RECHERCHE D’UNE PROMOTION OBLIGATOIRE                    */
/* -------------------------------------------------------------------------- */

async function requirePromotionDetails(
  promotionId: string,
): Promise<PromotionDetailsRow> {
  const promotion =
    await prisma.promotion.findUnique({
      where: {
        id:
          promotionId,
      },

      select:
        promotionDetailsSelect,
    });

  if (
    !promotion
  ) {
    throw new AdminPromotionNotFoundError();
  }

  return promotion;
}

/* -------------------------------------------------------------------------- */
/*                   VALIDATION D’UNE LIMITE D’UTILISATION                    */
/* -------------------------------------------------------------------------- */

function assertUsageLimitCanBeUpdated({
  usageCount,
  usageLimit,
}: {
  usageCount:
    number;

  usageLimit:
    number | null;
}): void {
  if (
    usageLimit !==
      null &&
    usageLimit <
      usageCount
  ) {
    throw new AdminPromotionValidationError(
      "La limite globale est inférieure au nombre d’utilisations déjà enregistrées.",
      {
        usageLimit: [
          `La promotion a déjà été utilisée ${usageCount} fois.`,
        ],
      },
    );
  }
}

/* -------------------------------------------------------------------------- */
/*                       VALIDATION DES ACTIONS RAPIDES                        */
/* -------------------------------------------------------------------------- */

function assertPromotionActionAllowed({
  promotion,
  action,
}: {
  promotion:
    PromotionDetailsRow;

  action:
    AdminPromotionAction;
}): void {
  const now =
    new Date();

  const computedStatus =
    getPromotionComputedStatus(
      promotion,
      now,
    );

  switch (
    action
  ) {
    case "ACTIVATE": {
      if (
        promotion.endsAt <=
        now
      ) {
        throw new AdminPromotionValidationError(
          "Cette promotion est déjà terminée.",
          {
            action: [
              "Modifiez sa date de fin avant de l’activer.",
            ],
          },
        );
      }

      if (
        hasReachedUsageLimit(
          promotion,
        )
      ) {
        throw new AdminPromotionValidationError(
          "La limite d’utilisation de cette promotion est atteinte.",
          {
            action: [
              "Augmentez la limite globale avant de l’activer.",
            ],
          },
        );
      }

      break;
    }

    case "DEACTIVATE": {
      if (
        !promotion.isActive
      ) {
        throw new AdminPromotionValidationError(
          "Cette promotion est déjà désactivée.",
          {
            action: [
              "Aucune modification n’est nécessaire.",
            ],
          },
        );
      }

      break;
    }

    case "SHOW_ON_HOMEPAGE": {
      if (
        computedStatus ===
          "EXPIRED"
      ) {
        throw new AdminPromotionValidationError(
          "Une promotion expirée ne peut pas être affichée sur l’accueil.",
          {
            action: [
              "Modifiez sa période avant de l’afficher.",
            ],
          },
        );
      }

      break;
    }

    case "HIDE_FROM_HOMEPAGE":
    case "DUPLICATE":
    case "DELETE":
      break;

    default:
      throw new Error(
        "Action de promotion non prise en charge.",
      );
  }
}

/* -------------------------------------------------------------------------- */
/*                          CONSTRUCTION DES FILTRES                           */
/* -------------------------------------------------------------------------- */

function buildPromotionWhereInput(
  filters:
    AdminPromotionFilters,
  now:
    Date,
): Prisma.PromotionWhereInput {
  const conditions:
    Prisma.PromotionWhereInput[] =
    [];

  const search =
    filters.search.trim();

  if (
    search !==
    ""
  ) {
    conditions.push({
      OR: [
        {
          name: {
            contains:
              search,

            mode:
              "insensitive",
          },
        },

        {
          slug: {
            contains:
              search,

            mode:
              "insensitive",
          },
        },

        {
          description: {
            contains:
              search,

            mode:
              "insensitive",
          },
        },

        {
          code: {
            contains:
              search,

            mode:
              "insensitive",
          },
        },

        {
          services: {
            some: {
              service: {
                OR: [
                  {
                    name: {
                      contains:
                        search,

                      mode:
                        "insensitive",
                    },
                  },

                  {
                    category: {
                      name: {
                        contains:
                          search,

                        mode:
                          "insensitive",
                      },
                    },
                  },
                ],
              },
            },
          },
        },
      ],
    });
  }

  switch (
    filters.status
  ) {
    case "ACTIVE":
      conditions.push({
        isActive:
          true,

        startsAt: {
          lte:
            now,
        },

        endsAt: {
          gte:
            now,
        },

      });

      break;

    case "SCHEDULED":
      conditions.push({
        isActive:
          true,

        startsAt: {
          gt:
            now,
        },
      });

      break;

    case "EXPIRED":
      conditions.push({
        endsAt: {
          lt:
            now,
        },
      });

      break;

    case "DRAFT":
      conditions.push({
        isActive:
          false,

        startsAt: {
          gt:
            now,
        },
      });

      break;

    case "DISABLED":
      conditions.push({
        isActive:
          false,

        startsAt: {
          lte:
            now,
        },
      });

      break;

    case "EXHAUSTED":
      /*
       * Prisma ne permet pas de comparer directement deux colonnes avec
       * tous les fournisseurs SQL de manière portable. Ce statut sera donc
       * affiné après sérialisation.
       */
      conditions.push({
        usageLimit: {
          not:
            null,
        },
      });

      break;

    case "ALL":
    default:
      break;
  }

  if (
    filters.type !==
    "ALL"
  ) {
    conditions.push({
      type:
        filters.type,
    });
  }

  if (
    filters.homepageOnly
  ) {
    conditions.push({
      showOnHomepage:
        true,
    });
  }

  if (
    conditions.length ===
    0
  ) {
    return {};
  }

  return {
    AND:
      conditions,
  };
}

/* -------------------------------------------------------------------------- */
/*                   FILTRAGE FINAL DES STATUTS CALCULÉS                       */
/* -------------------------------------------------------------------------- */

function matchesComputedStatusFilter(
  promotion:
    AdminPromotion,

  status:
    AdminPromotionFilters["status"],
): boolean {
  if (
    status ===
    "ALL"
  ) {
    return true;
  }

  return (
    promotion.computedStatus ===
    status
  );
}

/* -------------------------------------------------------------------------- */
/*                     TRI DES PROMOTIONS POUR L’ADMIN                         */
/* -------------------------------------------------------------------------- */

function sortAdminPromotions(
  promotions:
    AdminPromotion[],
): AdminPromotion[] {
  const statusOrder:
    Record<
      AdminPromotionComputedStatus,
      number
    > = {
      ACTIVE:
        0,

      SCHEDULED:
        1,

      DRAFT:
        2,

      DISABLED:
        3,

      EXHAUSTED:
        4,

      EXPIRED:
        5,
    };

  return [
    ...promotions,
  ].sort(
    (
      first,
      second,
    ) => {
      const statusDifference =
        statusOrder[
          first.computedStatus
        ] -
        statusOrder[
          second.computedStatus
        ];

      if (
        statusDifference !==
        0
      ) {
        return statusDifference;
      }

      if (
        first.computedStatus ===
          "ACTIVE"
      ) {
        return (
          new Date(
            first.endsAt,
          ).getTime() -
          new Date(
            second.endsAt,
          ).getTime()
        );
      }

      if (
        first.computedStatus ===
          "SCHEDULED"
      ) {
        return (
          new Date(
            first.startsAt,
          ).getTime() -
          new Date(
            second.startsAt,
          ).getTime()
        );
      }

      return (
        new Date(
          second.updatedAt,
        ).getTime() -
        new Date(
          first.updatedAt,
        ).getTime()
      );
    },
  );
}

/* -------------------------------------------------------------------------- */
/*                    RÉCUPÉRATION DES PROMOTIONS ADMIN                        */
/* -------------------------------------------------------------------------- */

export async function getAdminPromotions(
  rawFilters:
    unknown = {
      search:
        "",

      status:
        "ALL",

      homepageOnly:
        false,
    },
): Promise<
  AdminPromotion[]
> {
  const filters =
    parsePromotionFilters(
      rawFilters,
    );

  const now =
    new Date();

  const promotions =
    await prisma.promotion.findMany({
      where:
        buildPromotionWhereInput(
          filters,
          now,
        ),

      orderBy: [
        {
          startsAt:
            "desc",
        },

        {
          createdAt:
            "desc",
        },
      ],

      select:
        promotionDetailsSelect,
    });

  const serializedPromotions =
    promotions
      .map(
        (
          promotion,
        ) =>
          serializePromotionListItem(
            promotion,
            now,
          ),
      )
      .filter(
        (
          promotion,
        ) =>
          matchesComputedStatusFilter(
            promotion,
            filters.status,
          ),
      );

  return sortAdminPromotions(
    serializedPromotions,
  );
}

/* -------------------------------------------------------------------------- */
/*                      RÉCUPÉRATION D’UNE PROMOTION                           */
/* -------------------------------------------------------------------------- */

export async function getAdminPromotionById(
  promotionId:
    string,
): Promise<
  AdminPromotionDetails
> {
  const normalizedPromotionId =
    promotionId.trim();

  if (
    normalizedPromotionId ===
    ""
  ) {
    throw new AdminPromotionNotFoundError();
  }

  const promotion =
    await requirePromotionDetails(
      normalizedPromotionId,
    );

  return serializePromotion(
    promotion,
  );
}

/* -------------------------------------------------------------------------- */
/*                   RÉCUPÉRATION PAR SLUG ADMINISTRATEUR                      */
/* -------------------------------------------------------------------------- */

export async function getAdminPromotionBySlug(
  slug:
    string,
): Promise<
  AdminPromotionDetails
> {
  const normalizedSlug =
    slugify(
      slug,
    );

  if (
    normalizedSlug ===
    ""
  ) {
    throw new AdminPromotionNotFoundError();
  }

  const promotion =
    await prisma.promotion.findUnique({
      where: {
        slug:
          normalizedSlug,
      },

      select:
        promotionDetailsSelect,
    });

  if (
    !promotion
  ) {
    throw new AdminPromotionNotFoundError();
  }

  return serializePromotion(
    promotion,
  );
}

/* -------------------------------------------------------------------------- */
/*                        OPTIONS DES PRESTATIONS                              */
/* -------------------------------------------------------------------------- */

export async function getAdminPromotionServiceOptions(): Promise<
  AdminPromotionServiceOption[]
> {
  const services =
    await prisma.service.findMany({
      orderBy: [
        {
          category: {
            sortOrder:
              "asc",
          },
        },

        {
          category: {
            name:
              "asc",
          },
        },

        {
          sortOrder:
            "asc",
        },

        {
          name:
            "asc",
        },
      ],

      select: {
        id:
          true,

        categoryId:
          true,

        name:
          true,

        slug:
          true,

        priceCents:
          true,

        promotionalPriceCents:
          true,

        durationMinutes:
          true,

        imageUrl:
          true,

        color:
          true,

        isActive:
          true,

        allowOnlineBooking:
          true,

        sortOrder:
          true,

        category: {
          select: {
            id:
              true,

            name:
              true,

            slug:
              true,

            color:
              true,

            isActive:
              true,

            sortOrder:
              true,
          },
        },
      },
    });

  return services.map(
    serializePromotionServiceOption,
  );
}

/* -------------------------------------------------------------------------- */
/*                             CALCUL DES MÉTRIQUES                            */
/* -------------------------------------------------------------------------- */

function buildPromotionMetrics(
  promotions:
    AdminPromotion[],
) {
  const activePromotions =
    promotions.filter(
      (
        promotion,
      ) =>
        promotion.computedStatus ===
        "ACTIVE",
    );

  const scheduledPromotions =
    promotions.filter(
      (
        promotion,
      ) =>
        promotion.computedStatus ===
        "SCHEDULED",
    );

  const inactivePromotions =
    promotions.filter(
      (
        promotion,
      ) =>
        promotion.computedStatus ===
        "DISABLED",
    );

  const expiredPromotions =
    promotions.filter(
      (
        promotion,
      ) =>
        promotion.computedStatus ===
        "EXPIRED",
    );

  const exhaustedPromotions =
    promotions.filter(
      (
        promotion,
      ) =>
        promotion.computedStatus ===
        "EXHAUSTED",
    );

  const totalUsageCount =
    promotions.reduce(
      (
        total,
        promotion,
      ) =>
        total +
        promotion.usageCount,
      0,
    );

  const promotionsShownOnHomepage =
    promotions.filter(
      (
        promotion,
      ) =>
        promotion.showOnHomepage,
    ).length;

  const promotionsWithCode =
    promotions.filter(
      (
        promotion,
      ) =>
        promotion.code !==
        null,
    ).length;

  const promotionsWithBanner =
    promotions.filter(
      (
        promotion,
      ) =>
        promotion.banner !==
        null,
    ).length;

  return {
    totalPromotions:
      promotions.length,

    activePromotions:
      activePromotions.length,

    scheduledPromotions:
      scheduledPromotions.length,

    inactivePromotions:
      inactivePromotions.length,

    expiredPromotions:
      expiredPromotions.length,

    exhaustedPromotions:
      exhaustedPromotions.length,

    totalUsageCount,

    promotionsShownOnHomepage,

    promotionsWithCode,

    promotionsWithBanner,
  };
}

/* -------------------------------------------------------------------------- */
/*                           PROMOTIONS À SURVEILLER                           */
/* -------------------------------------------------------------------------- */

function getPromotionsEndingSoon(
  promotions:
    AdminPromotion[],

  now:
    Date,
): AdminPromotion[] {
  const sevenDaysFromNow =
    new Date(
      now,
    );

  sevenDaysFromNow.setDate(
    sevenDaysFromNow.getDate() +
      7,
  );

  return promotions.filter(
    (
      promotion,
    ) => {
      if (
        promotion.computedStatus !==
        "ACTIVE"
      ) {
        return false;
      }

      const endsAt =
        new Date(
          promotion.endsAt,
        );

      return (
        endsAt >=
          now &&
        endsAt <=
          sevenDaysFromNow
      );
    },
  );
}

function getPromotionsStartingSoon(
  promotions:
    AdminPromotion[],

  now:
    Date,
): AdminPromotion[] {
  const sevenDaysFromNow =
    new Date(
      now,
    );

  sevenDaysFromNow.setDate(
    sevenDaysFromNow.getDate() +
      7,
  );

  return promotions.filter(
    (
      promotion,
    ) => {
      if (
        promotion.computedStatus !==
        "SCHEDULED"
      ) {
        return false;
      }

      const startsAt =
        new Date(
          promotion.startsAt,
        );

      return (
        startsAt >
          now &&
        startsAt <=
          sevenDaysFromNow
      );
    },
  );
}

function getPromotionsNearUsageLimit(
  promotions:
    AdminPromotion[],
): AdminPromotion[] {
  return promotions.filter(
    (
      promotion,
    ) => {
      if (
        promotion.usageLimit ===
          null ||
        promotion.remainingUses ===
          null ||
        promotion.computedStatus !==
          "ACTIVE"
      ) {
        return false;
      }

      const warningThreshold =
        Math.max(
          Math.ceil(
            promotion.usageLimit *
              0.1,
          ),
          3,
        );

      return (
        promotion.remainingUses <=
        warningThreshold
      );
    },
  );
}

/* -------------------------------------------------------------------------- */
/*                         CONSTRUCTION DES ALERTES                            */
/* -------------------------------------------------------------------------- */

function buildPromotionAlerts({
  promotions,
  endingSoon,
  startingSoon,
  nearUsageLimit,
}: {
  promotions:
    AdminPromotion[];

  endingSoon:
    AdminPromotion[];

  startingSoon:
    AdminPromotion[];

  nearUsageLimit:
    AdminPromotion[];
}) {
  const alerts: Array<{
    id:
      string;

    title:
      string;

    description:
      string;

    count:
      number | null;

    href:
      string;

    tone:
      | "ROSE"
      | "AMBER"
      | "BLUE"
      | "VIOLET"
      | "EMERALD";
  }> = [];

  const exhaustedCount =
    promotions.filter(
      (
        promotion,
      ) =>
        promotion.computedStatus ===
        "EXHAUSTED",
    ).length;

  const homepageInactiveCount =
    promotions.filter(
      (
        promotion,
      ) =>
        promotion.showOnHomepage &&
        (
          promotion.computedStatus ===
            "DISABLED" ||
          promotion.computedStatus ===
            "EXPIRED" ||
          promotion.computedStatus ===
            "EXHAUSTED"
        ),
    ).length;

  const activeWithoutBannerCount =
    promotions.filter(
      (
        promotion,
      ) =>
        promotion.computedStatus ===
          "ACTIVE" &&
        promotion.banner ===
          null,
    ).length;

  if (
    endingSoon.length >
    0
  ) {
    alerts.push({
      id:
        "ending-soon",

      title:
        "Promotions bientôt terminées",

      description:
        "Certaines promotions actives arrivent à échéance dans moins de sept jours.",

      count:
        endingSoon.length,

      href:
        "/admin/promotions?status=ACTIVE",

      tone:
        "AMBER",
    });
  }

  if (
    startingSoon.length >
    0
  ) {
    alerts.push({
      id:
        "starting-soon",

      title:
        "Promotions bientôt disponibles",

      description:
        "Des promotions planifiées commenceront au cours des sept prochains jours.",

      count:
        startingSoon.length,

      href:
        "/admin/promotions?status=SCHEDULED",

      tone:
        "BLUE",
    });
  }

  if (
    nearUsageLimit.length >
    0
  ) {
    alerts.push({
      id:
        "near-usage-limit",

      title:
        "Limites presque atteintes",

      description:
        "Certaines offres disposent de très peu d’utilisations restantes.",

      count:
        nearUsageLimit.length,

      href:
        "/admin/promotions?status=ACTIVE",

      tone:
        "VIOLET",
    });
  }

  if (
    exhaustedCount >
    0
  ) {
    alerts.push({
      id:
        "exhausted",

      title:
        "Promotions épuisées",

      description:
        "Ces promotions ont atteint leur limite globale d’utilisation.",

      count:
        exhaustedCount,

      href:
        "/admin/promotions?status=EXHAUSTED",

      tone:
        "ROSE",
    });
  }

  if (
    homepageInactiveCount >
    0
  ) {
    alerts.push({
      id:
        "invalid-homepage",

      title:
        "Affichage d’accueil à vérifier",

      description:
        "Des promotions affichées sur l’accueil ne sont plus disponibles.",

      count:
        homepageInactiveCount,

      href:
        "/admin/promotions?homepageOnly=true",

      tone:
        "ROSE",
    });
  }

  if (
    activeWithoutBannerCount >
    0
  ) {
    alerts.push({
      id:
        "active-without-banner",

      title:
        "Promotions sans bannière",

      description:
        "Des promotions actives ne disposent actuellement d’aucune bannière associée.",

      count:
        activeWithoutBannerCount,

      href:
        "/admin/promotions?status=ACTIVE",

      tone:
        "BLUE",
    });
  }

  if (
    alerts.length ===
    0
  ) {
    alerts.push({
      id:
        "all-good",

      title:
        "Promotions à jour",

      description:
        "Aucune anomalie importante n’a été détectée dans les promotions.",

      count:
        null,

      href:
        "/admin/promotions",

      tone:
        "EMERALD",
    });
  }

  return alerts;
}

/* -------------------------------------------------------------------------- */
/*                         DONNÉES DU DASHBOARD ADMIN                          */
/* -------------------------------------------------------------------------- */

export async function getAdminPromotionsDashboardData() {
  const now =
    new Date();

  const promotionRows =
    await prisma.promotion.findMany({
      orderBy: [
        {
          startsAt:
            "desc",
        },

        {
          createdAt:
            "desc",
        },
      ],

      select:
        promotionDetailsSelect,
    });

  const promotions =
    sortAdminPromotions(
      promotionRows.map(
        (
          promotion,
        ) =>
          serializePromotionListItem(
            promotion,
            now,
          ),
      ),
    );

  const activePromotions =
    promotions.filter(
      (
        promotion,
      ) =>
        promotion.computedStatus ===
        "ACTIVE",
    );

  const scheduledPromotions =
    promotions.filter(
      (
        promotion,
      ) =>
        promotion.computedStatus ===
        "SCHEDULED",
    );

  const expiredPromotions =
    promotions.filter(
      (
        promotion,
      ) =>
        promotion.computedStatus ===
        "EXPIRED",
    );

  const exhaustedPromotions =
    promotions.filter(
      (
        promotion,
      ) =>
        promotion.computedStatus ===
        "EXHAUSTED",
    );

  const endingSoon =
    getPromotionsEndingSoon(
      promotions,
      now,
    );

  const startingSoon =
    getPromotionsStartingSoon(
      promotions,
      now,
    );

  const nearUsageLimit =
    getPromotionsNearUsageLimit(
      promotions,
    );

  const metrics =
    buildPromotionMetrics(
      promotions,
    );

  const alerts =
    buildPromotionAlerts({
      promotions,
      endingSoon,
      startingSoon,
      nearUsageLimit,
    });

  return {
    generatedAt:
      now.toISOString(),

    metrics,

    alerts,

    promotions,

    activePromotions,

    scheduledPromotions,

    upcomingPromotions:
      scheduledPromotions,

    expiredPromotions,

    exhaustedPromotions,

    endingSoon,

    startingSoon,

    nearUsageLimit,

    recentPromotions:
      promotions
        .slice()
        .sort(
          (
            first,
            second,
          ) =>
            new Date(
              second.createdAt,
            ).getTime() -
            new Date(
              first.createdAt,
            ).getTime(),
        )
        .slice(
          0,
          8,
        ),
  };
}

/* -------------------------------------------------------------------------- */
/*                         DONNÉES DU FORMULAIRE                               */
/* -------------------------------------------------------------------------- */

export async function getAdminPromotionFormData(
  promotionId?:
    string,
) {
  const [
    serviceOptions,
    promotion,
  ] =
    await Promise.all([
      getAdminPromotionServiceOptions(),

      promotionId
        ? getAdminPromotionById(
            promotionId,
          )
        : Promise.resolve(
            null,
          ),
    ]);

  return {
    promotion,

    serviceOptions,
  };
}

/* -------------------------------------------------------------------------- */
/*                           VÉRIFICATION D’EXISTENCE                          */
/* -------------------------------------------------------------------------- */

export async function adminPromotionExists(
  promotionId:
    string,
): Promise<
  boolean
> {
  const normalizedPromotionId =
    promotionId.trim();

  if (
    normalizedPromotionId ===
    ""
  ) {
    return false;
  }

  const promotion =
    await prisma.promotion.findUnique({
      where: {
        id:
          normalizedPromotionId,
      },

      select: {
        id:
          true,
      },
    });

  return Boolean(
    promotion,
  );
}

/* -------------------------------------------------------------------------- */
/*                   DONNÉES COMMUNES D’ÉCRITURE PRISMA                       */
/* -------------------------------------------------------------------------- */

function buildPromotionWriteData(
  input:
    AdminPromotionFormInput,
) {
  return {
    name:
      input.name,

    slug:
      input.slug,

    description:
      emptyToNull(
        input.description,
      ),

    type:
      input.type,

    percentageValue:
      input.percentageValue,

    amountCents:
      input.amountCents,

    code:
      normalizeCode(
        input.code,
      ),

    imageUrl:
      emptyToNull(
        input.imageUrl,
      ),

    startsAt:
      parseDate(
        input.startsAt,
      ),

    endsAt:
      parseDate(
        input.endsAt,
      ),

    usageLimit:
      input.usageLimit,

    perClientLimit:
      input.perClientLimit,

    minimumSpendCents:
      input.minimumSpendCents,

    isActive:
      input.isActive,

    showOnHomepage:
      input.showOnHomepage,
  };
}

/* -------------------------------------------------------------------------- */
/*                         MÉTADONNÉES DU FORMULAIRE                           */
/* -------------------------------------------------------------------------- */

function buildPromotionFormAuditMetadata(
  input:
    AdminPromotionFormInput,
) {
  return {
    source:
      "ADMIN_PROMOTIONS",

    serviceIds:
      input.serviceIds,

    serviceCount:
      input.serviceIds.length,

    banner: {
      enabled:
        input.bannerEnabled,

      active:
        input.bannerEnabled
          ? input.isActive
          : false,

      position:
        input.bannerEnabled
          ? "TOP"
          : null,

      title:
        input.bannerEnabled
          ? input.bannerTitle
          : null,
    },
  };
}

/* -------------------------------------------------------------------------- */
/*                          DIFFÉRENCES D’AUDIT                                */
/* -------------------------------------------------------------------------- */

type PromotionAuditChange = {
  field:
    string;

  label:
    string;

  before:
    unknown;

  after:
    unknown;
};

function addPromotionAuditChange(
  changes:
    PromotionAuditChange[],

  options: {
    field:
      string;

    label:
      string;

    before:
      unknown;

    after:
      unknown;
  },
): void {
  const before =
    options.before instanceof
      Date
      ? options.before.toISOString()
      : options.before;

  const after =
    options.after instanceof
      Date
      ? options.after.toISOString()
      : options.after;

  if (
    JSON.stringify(
      before,
    ) ===
    JSON.stringify(
      after,
    )
  ) {
    return;
  }

  changes.push({
    field:
      options.field,

    label:
      options.label,

    before,

    after,
  });
}

function detectPromotionChanges({
  previousPromotion,
  input,
  previousServiceIds,
  previousBanner,
}: {
  previousPromotion:
    PromotionDetailsRow;

  input:
    AdminPromotionFormInput;

  previousServiceIds:
    string[];

  previousBanner:
    AdminPromotionBanner | null;
}): PromotionAuditChange[] {
  const changes:
    PromotionAuditChange[] =
    [];

  const nextData =
    buildPromotionWriteData(
      input,
    );

  addPromotionAuditChange(
    changes,
    {
      field:
        "name",

      label:
        "Nom",

      before:
        previousPromotion.name,

      after:
        nextData.name,
    },
  );

  addPromotionAuditChange(
    changes,
    {
      field:
        "slug",

      label:
        "Slug",

      before:
        previousPromotion.slug,

      after:
        nextData.slug,
    },
  );

  addPromotionAuditChange(
    changes,
    {
      field:
        "description",

      label:
        "Description",

      before:
        previousPromotion.description,

      after:
        nextData.description,
    },
  );

  addPromotionAuditChange(
    changes,
    {
      field:
        "type",

      label:
        "Type de promotion",

      before:
        previousPromotion.type,

      after:
        nextData.type,
    },
  );

  addPromotionAuditChange(
    changes,
    {
      field:
        "percentageValue",

      label:
        "Pourcentage",

      before:
        previousPromotion.percentageValue,

      after:
        nextData.percentageValue,
    },
  );

  addPromotionAuditChange(
    changes,
    {
      field:
        "amountCents",

      label:
        "Montant de réduction",

      before:
        previousPromotion.amountCents,

      after:
        nextData.amountCents,
    },
  );

  addPromotionAuditChange(
    changes,
    {
      field:
        "code",

      label:
        "Code promotionnel",

      before:
        previousPromotion.code,

      after:
        nextData.code,
    },
  );

  addPromotionAuditChange(
    changes,
    {
      field:
        "imageUrl",

      label:
        "Image",

      before:
        previousPromotion.imageUrl,

      after:
        nextData.imageUrl,
    },
  );

  addPromotionAuditChange(
    changes,
    {
      field:
        "startsAt",

      label:
        "Date de début",

      before:
        previousPromotion.startsAt,

      after:
        nextData.startsAt,
    },
  );

  addPromotionAuditChange(
    changes,
    {
      field:
        "endsAt",

      label:
        "Date de fin",

      before:
        previousPromotion.endsAt,

      after:
        nextData.endsAt,
    },
  );

  addPromotionAuditChange(
    changes,
    {
      field:
        "usageLimit",

      label:
        "Limite globale",

      before:
        previousPromotion.usageLimit,

      after:
        nextData.usageLimit,
    },
  );

  addPromotionAuditChange(
    changes,
    {
      field:
        "perClientLimit",

      label:
        "Limite par cliente",

      before:
        previousPromotion.perClientLimit,

      after:
        nextData.perClientLimit,
    },
  );

  addPromotionAuditChange(
    changes,
    {
      field:
        "minimumSpendCents",

      label:
        "Montant minimum",

      before:
        previousPromotion.minimumSpendCents,

      after:
        nextData.minimumSpendCents,
    },
  );

  addPromotionAuditChange(
    changes,
    {
      field:
        "isActive",

      label:
        "Activation",

      before:
        previousPromotion.isActive,

      after:
        nextData.isActive,
    },
  );

  addPromotionAuditChange(
    changes,
    {
      field:
        "showOnHomepage",

      label:
        "Affichage sur l’accueil",

      before:
        previousPromotion.showOnHomepage,

      after:
        nextData.showOnHomepage,
    },
  );

  addPromotionAuditChange(
    changes,
    {
      field:
        "serviceIds",

      label:
        "Prestations concernées",

      before:
        [
          ...previousServiceIds,
        ].sort(),

      after:
        [
          ...input.serviceIds,
        ].sort(),
    },
  );

  addPromotionAuditChange(
    changes,
    {
      field:
        "banner",

      label:
        "Bannière promotionnelle",

      before:
        previousBanner,

      after:
        input.bannerEnabled
          ? {
              title:
                input.bannerTitle,

              subtitle:
                emptyToNull(
                  input.bannerSubtitle,
                ),

              imageUrl:
                emptyToNull(
                  input.bannerImageUrl,
                ),

              mobileImageUrl:
                emptyToNull(
                  input.bannerMobileImageUrl,
                ),

              buttonLabel:
                emptyToNull(
                  input.bannerButtonLabel,
                ),

              buttonUrl:
                emptyToNull(
                  input.bannerButtonUrl,
                ),

              position:
                "TOP",

              backgroundColor:
                emptyToNull(
                  input.bannerBackgroundColor,
                ),

              textColor:
                emptyToNull(
                  input.bannerTextColor,
                ),

              startsAt:
                input.startsAt,

              endsAt:
                input.endsAt,

              isActive:
                input.isActive,

              sortOrder:
                0,
            }
          : null,
    },
  );

  return changes;
}

/* -------------------------------------------------------------------------- */
/*                         CRÉATION D’UNE PROMOTION                            */
/* -------------------------------------------------------------------------- */

export async function createAdminPromotion({
  actorId,
  input: rawInput,
}: {
  actorId:
    string;

  input:
    unknown;
}): Promise<
  AdminPromotionDetails
> {
  const actor =
    await assertPromotionActor(
      actorId,
    );

  const parsedInput =
    parsePromotionForm(
      rawInput,
    );

  const normalizedInput =
    normalizePromotionFormInput(
      parsedInput,
    );

  if (
    normalizedInput.slug ===
    ""
  ) {
    normalizedInput.slug =
      await generateUniquePromotionSlug(
        normalizedInput.name,
      );
  }

  validatePromotionOperationalState(
    normalizedInput,
  );

  await Promise.all([
    assertPromotionSlugAvailable(
      normalizedInput.slug,
    ),

    assertPromotionCodeAvailable(
      normalizeCode(
        normalizedInput.code,
      ),
    ),

    assertPromotionServicesExist(
      normalizedInput.serviceIds,
    ),
  ]);

  try {
    const promotionId =
      await prisma.$transaction(
        async (
          transaction,
        ) => {
          const promotion =
            await transaction.promotion.create({
              data: {
                createdById:
                  actor.id,

                ...buildPromotionWriteData(
                  normalizedInput,
                ),
              },

              select: {
                id:
                  true,

                name:
                  true,

                slug:
                  true,

                description:
                  true,

                type:
                  true,

                percentageValue:
                  true,

                amountCents:
                  true,

                code:
                  true,

                imageUrl:
                  true,

                startsAt:
                  true,

                endsAt:
                  true,

                usageLimit:
                  true,

                usageCount:
                  true,

                perClientLimit:
                  true,

                minimumSpendCents:
                  true,

                isActive:
                  true,

                showOnHomepage:
                  true,
              },
            });

          await synchronizePromotionServices({
            transaction,

            promotionId:
              promotion.id,

            serviceIds:
              normalizedInput.serviceIds,
          });

          await synchronizePromotionBanner({
            transaction,

            promotionId:
              promotion.id,

            input:
              normalizedInput,
          });

          await transaction.auditLog.create({
            data: {
              actorId:
                actor.id,

              action:
                "PROMOTION_CREATED",

              entityType:
                "Promotion",

              entityId:
                promotion.id,

              metadata:
                toInputJsonValue({
                  actor: {
                    id:
                      actor.id,

                    displayName:
                      actor.displayName,
                  },

                  promotion:
                    getPromotionSnapshot(
                      promotion,
                    ),

                  ...buildPromotionFormAuditMetadata(
                    normalizedInput,
                  ),
                }),
            },
          });

          return promotion.id;
        },
        {
          isolationLevel:
            Prisma.TransactionIsolationLevel
              .Serializable,
        },
      );

    return getAdminPromotionById(
      promotionId,
    );
  } catch (
    error
  ) {
    handlePromotionUniqueConstraintError(
      error,
    );
  }
}

/* -------------------------------------------------------------------------- */
/*                       MODIFICATION D’UNE PROMOTION                          */
/* -------------------------------------------------------------------------- */

export async function updateAdminPromotion({
  actorId,
  promotionId,
  input: rawInput,
}: {
  actorId:
    string;

  promotionId:
    string;

  input:
    unknown;
}): Promise<
  AdminPromotionDetails
> {
  const normalizedPromotionId =
    promotionId.trim();

  if (
    normalizedPromotionId ===
    ""
  ) {
    throw new AdminPromotionNotFoundError();
  }

  const actor =
    await assertPromotionActor(
      actorId,
    );

  const parsedInput =
    parsePromotionForm(
      rawInput,
    );

  const normalizedInput =
    normalizePromotionFormInput(
      parsedInput,
    );

  if (
    normalizedInput.slug ===
    ""
  ) {
    normalizedInput.slug =
      slugify(
        normalizedInput.name,
      );
  }

  validatePromotionOperationalState(
    normalizedInput,
  );

  const previousPromotion =
    await requirePromotionDetails(
      normalizedPromotionId,
    );

  assertUsageLimitCanBeUpdated({
    usageCount:
      previousPromotion.usageCount,

    usageLimit:
      normalizedInput.usageLimit,
  });

  await Promise.all([
    assertPromotionSlugAvailable(
      normalizedInput.slug,
      normalizedPromotionId,
    ),

    assertPromotionCodeAvailable(
      normalizeCode(
        normalizedInput.code,
      ),
      normalizedPromotionId,
    ),

    assertPromotionServicesExist(
      normalizedInput.serviceIds,
    ),
  ]);

  const previousServiceIds =
    previousPromotion.services.map(
      (
        relation,
      ) =>
        relation.serviceId,
    );

  const previousBanner =
    previousPromotion.banners[0]
      ? serializePromotionBanner(
          previousPromotion.banners[0],
        )
      : null;

  const changes =
    detectPromotionChanges({
      previousPromotion,

      input:
        normalizedInput,

      previousServiceIds,

      previousBanner,
    });

  try {
    await prisma.$transaction(
      async (
        transaction,
      ) => {
        const existingPromotion =
          await transaction.promotion.findUnique({
            where: {
              id:
                normalizedPromotionId,
            },

            select: {
              id:
                true,

              updatedAt:
                true,
            },
          });

        if (
          !existingPromotion
        ) {
          throw new AdminPromotionNotFoundError();
        }

        const updatedPromotion =
          await transaction.promotion.update({
            where: {
              id:
                normalizedPromotionId,
            },

            data:
              buildPromotionWriteData(
                normalizedInput,
              ),

            select: {
              id:
                true,

              name:
                true,

              slug:
                true,

              description:
                true,

              type:
                true,

              percentageValue:
                true,

              amountCents:
                true,

              code:
                true,

              imageUrl:
                true,

              startsAt:
                true,

              endsAt:
                true,

              usageLimit:
                true,

              usageCount:
                true,

              perClientLimit:
                true,

              minimumSpendCents:
                true,

              isActive:
                true,

              showOnHomepage:
                true,
            },
          });

        await synchronizePromotionServices({
          transaction,

          promotionId:
            normalizedPromotionId,

          serviceIds:
            normalizedInput.serviceIds,
        });

        await synchronizePromotionBanner({
          transaction,

          promotionId:
            normalizedPromotionId,

          input:
            normalizedInput,
        });

        await transaction.auditLog.create({
          data: {
            actorId:
              actor.id,

            action:
              "PROMOTION_UPDATED",

            entityType:
              "Promotion",

            entityId:
              normalizedPromotionId,

            metadata:
              toInputJsonValue({
                actor: {
                  id:
                    actor.id,

                  displayName:
                    actor.displayName,
                },

                before:
                  getPromotionSnapshot(
                    previousPromotion,
                  ),

                after:
                  getPromotionSnapshot(
                    updatedPromotion,
                  ),

                changes,

                changedFields:
                  changes.map(
                    (
                      change,
                    ) =>
                      change.field,
                  ),

                changeCount:
                  changes.length,

                ...buildPromotionFormAuditMetadata(
                  normalizedInput,
                ),
              }),
          },
        });
      },
      {
        isolationLevel:
          Prisma.TransactionIsolationLevel
            .Serializable,
      },
    );

    return getAdminPromotionById(
      normalizedPromotionId,
    );
  } catch (
    error
  ) {
    handlePromotionUniqueConstraintError(
      error,
    );
  }
}

/* -------------------------------------------------------------------------- */
/*                  JOURNALISATION D’UNE ACTION RAPIDE                        */
/* -------------------------------------------------------------------------- */

async function createPromotionActionAuditLog({
  transaction,
  actor,
  promotionId,
  action,
  before,
  after,
  metadata,
}: {
  transaction:
    Prisma.TransactionClient;

  actor: {
    id:
      string;

    displayName:
      string;
  };

  promotionId:
    string;

  action:
    string;

  before:
    unknown;

  after:
    unknown;

  metadata?:
    Record<
      string,
      unknown
    >;
}): Promise<void> {
  await transaction.auditLog.create({
    data: {
      actorId:
        actor.id,

      action,

      entityType:
        "Promotion",

      entityId:
        promotionId,

      metadata:
        toInputJsonValue({
          source:
            "ADMIN_PROMOTIONS",

          actor: {
            id:
              actor.id,

            displayName:
              actor.displayName,
          },

          before,

          after,

          ...metadata,
        }),
    },
  });
}

/* -------------------------------------------------------------------------- */
/*                        ACTIVATION D’UNE PROMOTION                           */
/* -------------------------------------------------------------------------- */

export async function activateAdminPromotion({
  actorId,
  promotionId,
}: {
  actorId:
    string;

  promotionId:
    string;
}): Promise<
  AdminPromotionDetails
> {
  const normalizedPromotionId =
    promotionId.trim();

  if (
    normalizedPromotionId ===
    ""
  ) {
    throw new AdminPromotionNotFoundError();
  }

  const actor =
    await assertPromotionActor(
      actorId,
    );

  const previousPromotion =
    await requirePromotionDetails(
      normalizedPromotionId,
    );

  assertPromotionActionAllowed({
    promotion:
      previousPromotion,

    action:
      "ACTIVATE",
  });

  await prisma.$transaction(
    async (
      transaction,
    ) => {
      const updatedPromotion =
        await transaction.promotion.update({
          where: {
            id:
              normalizedPromotionId,
          },

          data: {
            isActive:
              true,
          },

          select: {
            id:
              true,

            name:
              true,

            slug:
              true,

            description:
              true,

            type:
              true,

            percentageValue:
              true,

            amountCents:
              true,

            code:
              true,

            imageUrl:
              true,

            startsAt:
              true,

            endsAt:
              true,

            usageLimit:
              true,

            usageCount:
              true,

            perClientLimit:
              true,

            minimumSpendCents:
              true,

            isActive:
              true,

            showOnHomepage:
              true,
          },
        });

      await createPromotionActionAuditLog({
        transaction,

        actor,

        promotionId:
          normalizedPromotionId,

        action:
          "PROMOTION_ACTIVATED",

        before:
          getPromotionSnapshot(
            previousPromotion,
          ),

        after:
          getPromotionSnapshot(
            updatedPromotion,
          ),
      });
    },
    {
      isolationLevel:
        Prisma.TransactionIsolationLevel
          .Serializable,
    },
  );

  return getAdminPromotionById(
    normalizedPromotionId,
  );
}

/* -------------------------------------------------------------------------- */
/*                      DÉSACTIVATION D’UNE PROMOTION                         */
/* -------------------------------------------------------------------------- */

export async function deactivateAdminPromotion({
  actorId,
  promotionId,
}: {
  actorId:
    string;

  promotionId:
    string;
}): Promise<
  AdminPromotionDetails
> {
  const normalizedPromotionId =
    promotionId.trim();

  if (
    normalizedPromotionId ===
    ""
  ) {
    throw new AdminPromotionNotFoundError();
  }

  const actor =
    await assertPromotionActor(
      actorId,
    );

  const previousPromotion =
    await requirePromotionDetails(
      normalizedPromotionId,
    );

  assertPromotionActionAllowed({
    promotion:
      previousPromotion,

    action:
      "DEACTIVATE",
  });

  await prisma.$transaction(
    async (
      transaction,
    ) => {
      const updatedPromotion =
        await transaction.promotion.update({
          where: {
            id:
              normalizedPromotionId,
          },

          data: {
            isActive:
              false,
          },

          select: {
            id:
              true,

            name:
              true,

            slug:
              true,

            description:
              true,

            type:
              true,

            percentageValue:
              true,

            amountCents:
              true,

            code:
              true,

            imageUrl:
              true,

            startsAt:
              true,

            endsAt:
              true,

            usageLimit:
              true,

            usageCount:
              true,

            perClientLimit:
              true,

            minimumSpendCents:
              true,

            isActive:
              true,

            showOnHomepage:
              true,
          },
        });

      await transaction.banner.updateMany({
        where: {
          promotionId:
            normalizedPromotionId,
        },

        data: {
          isActive:
            false,
        },
      });

      await createPromotionActionAuditLog({
        transaction,

        actor,

        promotionId:
          normalizedPromotionId,

        action:
          "PROMOTION_DEACTIVATED",

        before:
          getPromotionSnapshot(
            previousPromotion,
          ),

        after:
          getPromotionSnapshot(
            updatedPromotion,
          ),

        metadata: {
          associatedBannersDisabled:
            true,
        },
      });
    },
    {
      isolationLevel:
        Prisma.TransactionIsolationLevel
          .Serializable,
    },
  );

  return getAdminPromotionById(
    normalizedPromotionId,
  );
}

/* -------------------------------------------------------------------------- */
/*                   AFFICHAGE SUR LA PAGE D’ACCUEIL                          */
/* -------------------------------------------------------------------------- */

export async function showAdminPromotionOnHomepage({
  actorId,
  promotionId,
}: {
  actorId:
    string;

  promotionId:
    string;
}): Promise<
  AdminPromotionDetails
> {
  const normalizedPromotionId =
    promotionId.trim();

  if (
    normalizedPromotionId ===
    ""
  ) {
    throw new AdminPromotionNotFoundError();
  }

  const actor =
    await assertPromotionActor(
      actorId,
    );

  const previousPromotion =
    await requirePromotionDetails(
      normalizedPromotionId,
    );

  assertPromotionActionAllowed({
    promotion:
      previousPromotion,

    action:
      "SHOW_ON_HOMEPAGE",
  });

  if (
    previousPromotion.showOnHomepage
  ) {
    return serializePromotion(
      previousPromotion,
    );
  }

  await prisma.$transaction(
    async (
      transaction,
    ) => {
      const updatedPromotion =
        await transaction.promotion.update({
          where: {
            id:
              normalizedPromotionId,
          },

          data: {
            showOnHomepage:
              true,
          },

          select: {
            id:
              true,

            name:
              true,

            slug:
              true,

            description:
              true,

            type:
              true,

            percentageValue:
              true,

            amountCents:
              true,

            code:
              true,

            imageUrl:
              true,

            startsAt:
              true,

            endsAt:
              true,

            usageLimit:
              true,

            usageCount:
              true,

            perClientLimit:
              true,

            minimumSpendCents:
              true,

            isActive:
              true,

            showOnHomepage:
              true,
          },
        });

      await createPromotionActionAuditLog({
        transaction,

        actor,

        promotionId:
          normalizedPromotionId,

        action:
          "PROMOTION_SHOWN_ON_HOMEPAGE",

        before:
          getPromotionSnapshot(
            previousPromotion,
          ),

        after:
          getPromotionSnapshot(
            updatedPromotion,
          ),
      });
    },
    {
      isolationLevel:
        Prisma.TransactionIsolationLevel
          .Serializable,
    },
  );

  return getAdminPromotionById(
    normalizedPromotionId,
  );
}

/* -------------------------------------------------------------------------- */
/*                    RETRAIT DE LA PAGE D’ACCUEIL                            */
/* -------------------------------------------------------------------------- */

export async function hideAdminPromotionFromHomepage({
  actorId,
  promotionId,
}: {
  actorId:
    string;

  promotionId:
    string;
}): Promise<
  AdminPromotionDetails
> {
  const normalizedPromotionId =
    promotionId.trim();

  if (
    normalizedPromotionId ===
    ""
  ) {
    throw new AdminPromotionNotFoundError();
  }

  const actor =
    await assertPromotionActor(
      actorId,
    );

  const previousPromotion =
    await requirePromotionDetails(
      normalizedPromotionId,
    );

  assertPromotionActionAllowed({
    promotion:
      previousPromotion,

    action:
      "HIDE_FROM_HOMEPAGE",
  });

  if (
    !previousPromotion.showOnHomepage
  ) {
    return serializePromotion(
      previousPromotion,
    );
  }

  await prisma.$transaction(
    async (
      transaction,
    ) => {
      const updatedPromotion =
        await transaction.promotion.update({
          where: {
            id:
              normalizedPromotionId,
          },

          data: {
            showOnHomepage:
              false,
          },

          select: {
            id:
              true,

            name:
              true,

            slug:
              true,

            description:
              true,

            type:
              true,

            percentageValue:
              true,

            amountCents:
              true,

            code:
              true,

            imageUrl:
              true,

            startsAt:
              true,

            endsAt:
              true,

            usageLimit:
              true,

            usageCount:
              true,

            perClientLimit:
              true,

            minimumSpendCents:
              true,

            isActive:
              true,

            showOnHomepage:
              true,
          },
        });

      await createPromotionActionAuditLog({
        transaction,

        actor,

        promotionId:
          normalizedPromotionId,

        action:
          "PROMOTION_HIDDEN_FROM_HOMEPAGE",

        before:
          getPromotionSnapshot(
            previousPromotion,
          ),

        after:
          getPromotionSnapshot(
            updatedPromotion,
          ),
      });
    },
    {
      isolationLevel:
        Prisma.TransactionIsolationLevel
          .Serializable,
    },
  );

  return getAdminPromotionById(
    normalizedPromotionId,
  );
}

/* -------------------------------------------------------------------------- */
/*                         DUPLICATION D’UNE PROMOTION                         */
/* -------------------------------------------------------------------------- */

export async function duplicateAdminPromotion({
  actorId,
  promotionId,
}: {
  actorId:
    string;

  promotionId:
    string;
}): Promise<
  AdminPromotionDetails
> {
  const normalizedPromotionId =
    promotionId.trim();

  if (
    normalizedPromotionId ===
    ""
  ) {
    throw new AdminPromotionNotFoundError();
  }

  const actor =
    await assertPromotionActor(
      actorId,
    );

  const sourcePromotion =
    await requirePromotionDetails(
      normalizedPromotionId,
    );

  assertPromotionActionAllowed({
    promotion:
      sourcePromotion,

    action:
      "DUPLICATE",
  });

  const duplicateName =
    `${sourcePromotion.name} - Copie`;

  const duplicateSlug =
    await generateUniquePromotionSlug(
      duplicateName,
    );

  const sourceServiceIds =
    sourcePromotion.services.map(
      (
        relation,
      ) =>
        relation.serviceId,
    );

  const duplicatedPromotionId =
    await prisma.$transaction(
      async (
        transaction,
      ) => {
        const duplicatedPromotion =
          await transaction.promotion.create({
            data: {
              createdById:
                actor.id,

              name:
                duplicateName,

              slug:
                duplicateSlug,

              description:
                sourcePromotion.description,

              type:
                sourcePromotion.type,

              percentageValue:
                sourcePromotion.percentageValue,

              amountCents:
                sourcePromotion.amountCents,

              code:
                null,

              imageUrl:
                sourcePromotion.imageUrl,

              startsAt:
                sourcePromotion.startsAt,

              endsAt:
                sourcePromotion.endsAt,

              usageLimit:
                sourcePromotion.usageLimit,

              usageCount:
                0,

              perClientLimit:
                sourcePromotion.perClientLimit,

              minimumSpendCents:
                sourcePromotion.minimumSpendCents,

              isActive:
                false,

              showOnHomepage:
                false,
            },

            select: {
              id:
                true,

              name:
                true,

              slug:
                true,

              description:
                true,

              type:
                true,

              percentageValue:
                true,

              amountCents:
                true,

              code:
                true,

              imageUrl:
                true,

              startsAt:
                true,

              endsAt:
                true,

              usageLimit:
                true,

              usageCount:
                true,

              perClientLimit:
                true,

              minimumSpendCents:
                true,

              isActive:
                true,

              showOnHomepage:
                true,
            },
          });

        if (
          sourceServiceIds.length >
          0
        ) {
          await transaction.promotionService.createMany({
            data:
              sourceServiceIds.map(
                (
                  serviceId,
                ) => ({
                  promotionId:
                    duplicatedPromotion.id,

                  serviceId,
                }),
              ),

            skipDuplicates:
              true,
          });
        }

        if (
          sourcePromotion.banners.length >
          0
        ) {
          await transaction.banner.createMany({
            data:
              sourcePromotion.banners.map(
                (
                  banner,
                ) => ({
                  promotionId:
                    duplicatedPromotion.id,

                  title:
                    banner.title,

                  subtitle:
                    banner.subtitle,

                  imageUrl:
                    banner.imageUrl,

                  mobileImageUrl:
                    banner.mobileImageUrl,

                  buttonLabel:
                    banner.buttonLabel,

                  buttonUrl:
                    banner.buttonUrl,

                  position:
                    banner.position,

                  backgroundColor:
                    banner.backgroundColor,

                  textColor:
                    banner.textColor,

                  startsAt:
                    banner.startsAt,

                  endsAt:
                    banner.endsAt,

                  isActive:
                    false,

                  sortOrder:
                    banner.sortOrder,
                }),
              ),
          });
        }

        await createPromotionActionAuditLog({
          transaction,

          actor,

          promotionId:
            duplicatedPromotion.id,

          action:
            "PROMOTION_DUPLICATED",

          before:
            null,

          after:
            getPromotionSnapshot(
              duplicatedPromotion,
            ),

          metadata: {
            sourcePromotionId:
              sourcePromotion.id,

            sourcePromotionName:
              sourcePromotion.name,

            duplicatedServiceCount:
              sourceServiceIds.length,

            duplicatedBannerCount:
              sourcePromotion.banners.length,
          },
        });

        return duplicatedPromotion.id;
      },
      {
        isolationLevel:
          Prisma.TransactionIsolationLevel
            .Serializable,
      },
    );

  return getAdminPromotionById(
    duplicatedPromotionId,
  );
}

/* -------------------------------------------------------------------------- */
/*                        SUPPRESSION D’UNE PROMOTION                          */
/* -------------------------------------------------------------------------- */

export async function deleteAdminPromotion({
  actorId,
  promotionId,
}: {
  actorId:
    string;

  promotionId:
    string;
}): Promise<{
  id:
    string;

  name:
    string;
}> {
  const normalizedPromotionId =
    promotionId.trim();

  if (
    normalizedPromotionId ===
    ""
  ) {
    throw new AdminPromotionNotFoundError();
  }

  const actor =
    await assertPromotionActor(
      actorId,
    );

  const promotion =
    await requirePromotionDetails(
      normalizedPromotionId,
    );

  assertPromotionActionAllowed({
    promotion,

    action:
      "DELETE",
  });

  if (
    promotion.usageCount >
    0
  ) {
    throw new AdminPromotionDeleteError(
      "Cette promotion a déjà été utilisée et ne peut plus être supprimée. Désactivez-la afin de conserver son historique.",
    );
  }

  const deletedPromotion =
    await prisma.$transaction(
      async (
        transaction,
      ) => {
        await createPromotionActionAuditLog({
          transaction,

          actor,

          promotionId:
            promotion.id,

          action:
            "PROMOTION_DELETED",

          before:
            getPromotionSnapshot(
              promotion,
            ),

          after:
            null,

          metadata: {
            deletedServiceIds:
              promotion.services.map(
                (
                  relation,
                ) =>
                  relation.serviceId,
              ),

            deletedBannerIds:
              promotion.banners.map(
                (
                  banner,
                ) =>
                  banner.id,
              ),
          },
        });

        await transaction.banner.deleteMany({
          where: {
            promotionId:
              promotion.id,
          },
        });

        await transaction.promotionService.deleteMany({
          where: {
            promotionId:
              promotion.id,
          },
        });

        await transaction.promotion.delete({
          where: {
            id:
              promotion.id,
          },
        });

        return {
          id:
            promotion.id,

          name:
            promotion.name,
        };
      },
      {
        isolationLevel:
          Prisma.TransactionIsolationLevel
            .Serializable,
      },
    );

  return deletedPromotion;
}

/* -------------------------------------------------------------------------- */
/*                        ROUTEUR DES ACTIONS RAPIDES                          */
/* -------------------------------------------------------------------------- */

export async function executeAdminPromotionAction({
  actorId,
  promotionId,
  input: rawInput,
}: {
  actorId:
    string;

  promotionId:
    string;

  input:
    unknown;
}): Promise<
  | AdminPromotionDetails
  | {
      id:
        string;

      name:
        string;
    }
> {
  const input =
    parsePromotionStatus(
      rawInput,
    );

  switch (
    input.action
  ) {
    case "ACTIVATE":
      return activateAdminPromotion({
        actorId,

        promotionId,
      });

    case "DEACTIVATE":
      return deactivateAdminPromotion({
        actorId,

        promotionId,
      });

    case "SHOW_ON_HOMEPAGE":
      return showAdminPromotionOnHomepage({
        actorId,

        promotionId,
      });

    case "HIDE_FROM_HOMEPAGE":
      return hideAdminPromotionFromHomepage({
        actorId,

        promotionId,
      });

    case "DUPLICATE":
      return duplicateAdminPromotion({
        actorId,

        promotionId,
      });

    case "DELETE":
      return deleteAdminPromotion({
        actorId,

        promotionId,
      });

    default:
      throw new AdminPromotionValidationError(
        "L’action demandée n’est pas prise en charge.",
        {
          action: [
            "Choisissez une action valide.",
          ],
        },
      );
  }
}

/* -------------------------------------------------------------------------- */
/*                       EXPORTS DES HELPERS PUBLICS                           */
/* -------------------------------------------------------------------------- */

export {
  getPromotionComputedStatus,
  normalizeCode as normalizeAdminPromotionCode,
  slugify as slugifyAdminPromotion,
};
