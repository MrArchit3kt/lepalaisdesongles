import "server-only";

import type { GiftCardStatus, Prisma } from "@/generated/prisma/client";

import type {
  AdminGiftCardDetails,
  AdminGiftCardQuery,
  AdminGiftCardsDashboardData,
  AdminGiftCardSortMode,
  AdminGiftCardStatusFilter,
} from "@/features/admin/gift-cards/types/admin-gift-card.types";

import { prisma } from "@/lib/prisma";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 25;
const MAX_PAGE_SIZE = 100;
const MAX_SEARCH_LENGTH = 160;

const GIFT_CARD_STATUSES = new Set<GiftCardStatus>([
  "PENDING_PAYMENT",
  "ACTIVE",
  "PARTIALLY_USED",
  "USED",
  "CANCELLED",
  "REVOKED",
  "EXPIRED",
  "PAYMENT_FAILED",
]);

const SORT_MODES = new Set<AdminGiftCardSortMode>([
  "NEWEST",
  "OLDEST",
  "BALANCE_DESC",
  "BALANCE_ASC",
  "EXPIRATION_ASC",
]);

type SearchParamsRecord = Record<string, string | string[] | undefined>;

function readSearchParam(
  searchParams: SearchParamsRecord,
  key: string,
): string {
  const value = searchParams[key];

  if (Array.isArray(value)) {
    return value[0]?.trim() ?? "";
  }

  return value?.trim() ?? "";
}

function parsePositiveInteger(
  value: string,
  fallback: number,
  maximum?: number,
): number {
  const parsed = Number.parseInt(value, 10);

  if (!Number.isSafeInteger(parsed) || parsed < 1) {
    return fallback;
  }

  return maximum ? Math.min(parsed, maximum) : parsed;
}

function parseDateInput(value: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return "";
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  return Number.isNaN(date.getTime()) ? "" : value;
}

export function parseAdminGiftCardQuery(
  searchParams: SearchParamsRecord,
): AdminGiftCardQuery {
  const rawStatus = readSearchParam(searchParams, "status");
  const rawSort = readSearchParam(searchParams, "sort");

  const status: AdminGiftCardStatusFilter =
    rawStatus === "ALL" || GIFT_CARD_STATUSES.has(rawStatus as GiftCardStatus)
      ? (rawStatus as AdminGiftCardStatusFilter)
      : "ALL";

  const sort: AdminGiftCardSortMode = SORT_MODES.has(
    rawSort as AdminGiftCardSortMode,
  )
    ? (rawSort as AdminGiftCardSortMode)
    : "NEWEST";

  return {
    page: parsePositiveInteger(
      readSearchParam(searchParams, "page"),
      DEFAULT_PAGE,
    ),
    pageSize: parsePositiveInteger(
      readSearchParam(searchParams, "pageSize"),
      DEFAULT_PAGE_SIZE,
      MAX_PAGE_SIZE,
    ),
    search: readSearchParam(searchParams, "search").slice(0, MAX_SEARCH_LENGTH),
    status,
    sort,
    dateFrom: parseDateInput(readSearchParam(searchParams, "dateFrom")),
    dateTo: parseDateInput(readSearchParam(searchParams, "dateTo")),
    expiredOnly: readSearchParam(searchParams, "expiredOnly") === "true",
  };
}

function createGiftCardWhere(
  query: AdminGiftCardQuery,
  now: Date,
): Prisma.GiftCardWhereInput {
  const conditions: Prisma.GiftCardWhereInput[] = [];

  if (query.status !== "ALL") {
    conditions.push({
      status: query.status,
    });
  }

  if (query.search) {
    conditions.push({
      OR: [
        {
          reference: {
            contains: query.search,
            mode: "insensitive",
          },
        },
        {
          code: {
            contains: query.search,
            mode: "insensitive",
          },
        },
        {
          purchaserFirstName: {
            contains: query.search,
            mode: "insensitive",
          },
        },
        {
          purchaserLastName: {
            contains: query.search,
            mode: "insensitive",
          },
        },
        {
          purchaserEmail: {
            contains: query.search,
            mode: "insensitive",
          },
        },
        {
          recipientFirstName: {
            contains: query.search,
            mode: "insensitive",
          },
        },
        {
          recipientLastName: {
            contains: query.search,
            mode: "insensitive",
          },
        },
        {
          recipientEmail: {
            contains: query.search,
            mode: "insensitive",
          },
        },
      ],
    });
  }

  if (query.dateFrom || query.dateTo) {
    const createdAt: Prisma.DateTimeFilter = {};

    if (query.dateFrom) {
      createdAt.gte = new Date(`${query.dateFrom}T00:00:00.000Z`);
    }

    if (query.dateTo) {
      const endDate = new Date(`${query.dateTo}T00:00:00.000Z`);
      endDate.setUTCDate(endDate.getUTCDate() + 1);
      createdAt.lt = endDate;
    }

    conditions.push({
      createdAt,
    });
  }

  if (query.expiredOnly) {
    conditions.push({
      expiresAt: {
        lt: now,
      },
    });
  }

  if (conditions.length === 0) {
    return {};
  }

  return {
    AND: conditions,
  };
}

function createGiftCardOrderBy(
  sort: AdminGiftCardSortMode,
): Prisma.GiftCardOrderByWithRelationInput[] {
  switch (sort) {
    case "OLDEST":
      return [{ createdAt: "asc" }, { id: "asc" }];

    case "BALANCE_DESC":
      return [{ balanceCents: "desc" }, { createdAt: "desc" }];

    case "BALANCE_ASC":
      return [{ balanceCents: "asc" }, { createdAt: "desc" }];

    case "EXPIRATION_ASC":
      return [{ expiresAt: "asc" }, { createdAt: "desc" }];

    case "NEWEST":
    default:
      return [{ createdAt: "desc" }, { id: "desc" }];
  }
}

export async function getAdminGiftCardsDashboardData(
  query: AdminGiftCardQuery = parseAdminGiftCardQuery({}),
): Promise<AdminGiftCardsDashboardData> {
  const now = new Date();
  const where = createGiftCardWhere(query, now);

  const [
    totalItems,
    giftCards,
    pendingPaymentCards,
    activeCards,
    partiallyUsedCards,
    fullyUsedCards,
    cancelledCards,
    revokedCards,
    expiredCards,
    paymentFailedCards,
    paidAmounts,
  ] = await prisma.$transaction([
    prisma.giftCard.count({
      where,
    }),

    prisma.giftCard.findMany({
      where,
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
      orderBy: createGiftCardOrderBy(query.sort),
      select: {
        id: true,
        reference: true,
        code: true,
        status: true,
        initialAmountCents: true,
        balanceCents: true,
        currency: true,
        purchaserFirstName: true,
        purchaserLastName: true,
        purchaserEmail: true,
        recipientFirstName: true,
        recipientLastName: true,
        recipientEmail: true,
        paidAt: true,
        expiresAt: true,
        createdAt: true,
        updatedAt: true,
      },
    }),

    prisma.giftCard.count({
      where: {
        status: "PENDING_PAYMENT",
      },
    }),

    prisma.giftCard.count({
      where: {
        status: "ACTIVE",
      },
    }),

    prisma.giftCard.count({
      where: {
        status: "PARTIALLY_USED",
      },
    }),

    prisma.giftCard.count({
      where: {
        status: "USED",
      },
    }),

    prisma.giftCard.count({
      where: {
        status: "CANCELLED",
      },
    }),

    prisma.giftCard.count({
      where: {
        status: "REVOKED",
      },
    }),

    prisma.giftCard.count({
      where: {
        status: "EXPIRED",
      },
    }),

    prisma.giftCard.count({
      where: {
        status: "PAYMENT_FAILED",
      },
    }),

    prisma.giftCard.aggregate({
      where: {
        paidAt: {
          not: null,
        },
      },
      _sum: {
        initialAmountCents: true,
        balanceCents: true,
      },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalItems / query.pageSize));
  const normalizedPage = Math.min(query.page, totalPages);

  if (normalizedPage !== query.page && totalItems > 0) {
    return getAdminGiftCardsDashboardData({
      ...query,
      page: normalizedPage,
    });
  }

  const soldAmountCents = paidAmounts._sum.initialAmountCents ?? 0;
  const remainingBalanceCents = paidAmounts._sum.balanceCents ?? 0;

  return {
    generatedAt: now.toISOString(),

    metrics: {
      totalCards:
        pendingPaymentCards +
        activeCards +
        partiallyUsedCards +
        fullyUsedCards +
        cancelledCards +
        revokedCards +
        expiredCards +
        paymentFailedCards,
      pendingPaymentCards,
      activeCards,
      partiallyUsedCards,
      fullyUsedCards,
      cancelledCards,
      revokedCards,
      expiredCards,
      paymentFailedCards,
      soldAmountCents,
      redeemedAmountCents: Math.max(0, soldAmountCents - remainingBalanceCents),
      remainingBalanceCents,
    },

    giftCards: giftCards.map((giftCard) => ({
      id: giftCard.id,
      reference: giftCard.reference,
      code: giftCard.code,
      status: giftCard.status,
      initialAmountCents: giftCard.initialAmountCents,
      balanceCents: giftCard.balanceCents,
      usedAmountCents: Math.max(
        0,
        giftCard.initialAmountCents - giftCard.balanceCents,
      ),
      currency: giftCard.currency,
      purchaserFullName:
        `${giftCard.purchaserFirstName} ${giftCard.purchaserLastName}`.trim(),
      purchaserEmail: giftCard.purchaserEmail,
      recipientFullName:
        `${giftCard.recipientFirstName} ${giftCard.recipientLastName}`.trim(),
      recipientEmail: giftCard.recipientEmail,
      paidAt: giftCard.paidAt?.toISOString() ?? null,
      expiresAt: giftCard.expiresAt.toISOString(),
      createdAt: giftCard.createdAt.toISOString(),
      updatedAt: giftCard.updatedAt.toISOString(),
    })),

    query: {
      ...query,
      page: normalizedPage,
    },

    pagination: {
      page: normalizedPage,
      pageSize: query.pageSize,
      totalItems,
      totalPages,
      hasPreviousPage: normalizedPage > 1,
      hasNextPage: normalizedPage < totalPages,
    },
  };
}

export const ADMIN_GIFT_CARD_CSV_EXPORT_LIMIT = 10_000;

export type AdminGiftCardCsvExport = {
  rows: {
    reference: string;
    code: string;
    status: string;
    initialAmountCents: number;
    balanceCents: number;
    usedAmountCents: number;
    currency: string;
    purchaserFullName: string;
    purchaserEmail: string;
    recipientFullName: string;
    recipientEmail: string | null;
    paidAt: Date | null;
    expiresAt: Date;
    createdAt: Date;
  }[];
  totalItems: number;
  truncated: boolean;
};

export async function getAdminGiftCardsCsvExport(
  query: AdminGiftCardQuery,
): Promise<AdminGiftCardCsvExport> {
  const now = new Date();
  const where = createGiftCardWhere(query, now);

  const [totalItems, giftCards] = await prisma.$transaction([
    prisma.giftCard.count({
      where,
    }),

    prisma.giftCard.findMany({
      where,
      take: ADMIN_GIFT_CARD_CSV_EXPORT_LIMIT,
      orderBy: createGiftCardOrderBy(query.sort),
      select: {
        reference: true,
        code: true,
        status: true,
        initialAmountCents: true,
        balanceCents: true,
        currency: true,
        purchaserFirstName: true,
        purchaserLastName: true,
        purchaserEmail: true,
        recipientFirstName: true,
        recipientLastName: true,
        recipientEmail: true,
        paidAt: true,
        expiresAt: true,
        createdAt: true,
      },
    }),
  ]);

  return {
    rows: giftCards.map((giftCard) => ({
      reference: giftCard.reference,
      code: giftCard.code,
      status: giftCard.status,
      initialAmountCents: giftCard.initialAmountCents,
      balanceCents: giftCard.balanceCents,
      usedAmountCents: Math.max(
        0,
        giftCard.initialAmountCents - giftCard.balanceCents,
      ),
      currency: giftCard.currency,
      purchaserFullName:
        `${giftCard.purchaserFirstName} ${giftCard.purchaserLastName}`.trim(),
      purchaserEmail: giftCard.purchaserEmail,
      recipientFullName:
        `${giftCard.recipientFirstName} ${giftCard.recipientLastName}`.trim(),
      recipientEmail: giftCard.recipientEmail,
      paidAt: giftCard.paidAt,
      expiresAt: giftCard.expiresAt,
      createdAt: giftCard.createdAt,
    })),
    totalItems,
    truncated: totalItems > ADMIN_GIFT_CARD_CSV_EXPORT_LIMIT,
  };
}

export async function getAdminGiftCardDetailsByReference(
  reference: string,
): Promise<AdminGiftCardDetails | null> {
  const cleanReference = reference.trim().toUpperCase();

  if (!cleanReference || cleanReference.length > 80) {
    return null;
  }

  const giftCard = await prisma.giftCard.findUnique({
    where: {
      reference: cleanReference,
    },

    select: {
      id: true,
      reference: true,
      code: true,
      status: true,
      initialAmountCents: true,
      balanceCents: true,
      currency: true,
      purchaserFirstName: true,
      purchaserLastName: true,
      purchaserEmail: true,
      recipientFirstName: true,
      recipientLastName: true,
      recipientEmail: true,
      personalMessage: true,
      paypalOrderId: true,
      paypalCaptureId: true,
      paypalPayerId: true,
      paidAt: true,
      activatedAt: true,
      fullyUsedAt: true,
      cancelledAt: true,
      revokedAt: true,
      expiresAt: true,
      cancellationReason: true,
      revocationReason: true,
      createdAt: true,
      updatedAt: true,

      transactions: {
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        select: {
          id: true,
          type: true,
          amountCents: true,
          balanceBeforeCents: true,
          balanceAfterCents: true,
          note: true,
          reason: true,
          actorId: true,
          actor: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          paypalOrderId: true,
          paypalCaptureId: true,
          reversedAt: true,
          reversedById: true,
          reversalReason: true,
          reversedBy: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          createdAt: true,
        },
      },
    },
  });

  if (!giftCard) {
    return null;
  }

  function getActorName(
    actor: {
      firstName: string;
      lastName: string;
      email: string;
    } | null,
  ): string | null {
    if (!actor) {
      return null;
    }

    return `${actor.firstName} ${actor.lastName}`.trim() || actor.email;
  }

  return {
    id: giftCard.id,
    reference: giftCard.reference,
    code: giftCard.code,
    status: giftCard.status,
    initialAmountCents: giftCard.initialAmountCents,
    balanceCents: giftCard.balanceCents,
    usedAmountCents: Math.max(
      0,
      giftCard.initialAmountCents - giftCard.balanceCents,
    ),
    currency: giftCard.currency,
    purchaserFirstName: giftCard.purchaserFirstName,
    purchaserLastName: giftCard.purchaserLastName,
    purchaserEmail: giftCard.purchaserEmail,
    recipientFirstName: giftCard.recipientFirstName,
    recipientLastName: giftCard.recipientLastName,
    recipientEmail: giftCard.recipientEmail,
    personalMessage: giftCard.personalMessage,
    paypalOrderId: giftCard.paypalOrderId,
    paypalCaptureId: giftCard.paypalCaptureId,
    paypalPayerId: giftCard.paypalPayerId,
    paidAt: giftCard.paidAt?.toISOString() ?? null,
    activatedAt: giftCard.activatedAt?.toISOString() ?? null,
    fullyUsedAt: giftCard.fullyUsedAt?.toISOString() ?? null,
    cancelledAt: giftCard.cancelledAt?.toISOString() ?? null,
    revokedAt: giftCard.revokedAt?.toISOString() ?? null,
    expiresAt: giftCard.expiresAt.toISOString(),
    cancellationReason: giftCard.cancellationReason,
    revocationReason: giftCard.revocationReason,
    createdAt: giftCard.createdAt.toISOString(),
    updatedAt: giftCard.updatedAt.toISOString(),

    transactions: giftCard.transactions.map((transaction) => ({
      id: transaction.id,
      type: transaction.type,
      amountCents: transaction.amountCents,
      balanceBeforeCents: transaction.balanceBeforeCents,
      balanceAfterCents: transaction.balanceAfterCents,
      note: transaction.note,
      reason: transaction.reason,
      actorId: transaction.actorId,
      actorName: getActorName(transaction.actor),
      paypalOrderId: transaction.paypalOrderId,
      paypalCaptureId: transaction.paypalCaptureId,
      reversedAt: transaction.reversedAt?.toISOString() ?? null,
      reversedById: transaction.reversedById,
      reversedByName: getActorName(transaction.reversedBy),
      reversalReason: transaction.reversalReason,
      createdAt: transaction.createdAt.toISOString(),
    })),
  };
}
