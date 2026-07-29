import type {
  GiftCardStatus,
  GiftCardTransactionType,
} from "@/generated/prisma/client";

export type AdminGiftCardStatusFilter = "ALL" | GiftCardStatus;

export type AdminGiftCardSortMode =
  "NEWEST" | "OLDEST" | "BALANCE_DESC" | "BALANCE_ASC" | "EXPIRATION_ASC";

export type AdminGiftCardQuery = {
  page: number;
  pageSize: number;
  search: string;
  status: AdminGiftCardStatusFilter;
  sort: AdminGiftCardSortMode;
  dateFrom: string;
  dateTo: string;
  expiredOnly: boolean;
};

export type AdminGiftCardPagination = {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};

export type AdminGiftCardListItem = {
  id: string;
  reference: string;
  code: string;
  status: GiftCardStatus;

  initialAmountCents: number;
  balanceCents: number;
  usedAmountCents: number;
  currency: string;

  purchaserFullName: string;
  purchaserEmail: string;

  recipientFullName: string;
  recipientEmail: string | null;

  paidAt: string | null;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
};

export type AdminGiftCardMetrics = {
  totalCards: number;
  pendingPaymentCards: number;
  activeCards: number;
  partiallyUsedCards: number;
  fullyUsedCards: number;
  cancelledCards: number;
  revokedCards: number;
  expiredCards: number;
  paymentFailedCards: number;

  soldAmountCents: number;
  redeemedAmountCents: number;
  remainingBalanceCents: number;
};

export type AdminGiftCardsDashboardData = {
  generatedAt: string;
  metrics: AdminGiftCardMetrics;
  giftCards: AdminGiftCardListItem[];
  query: AdminGiftCardQuery;
  pagination: AdminGiftCardPagination;
};

export type AdminGiftCardTransaction = {
  id: string;
  type: GiftCardTransactionType;

  amountCents: number;
  balanceBeforeCents: number;
  balanceAfterCents: number;

  note: string | null;
  reason: string | null;

  actorId: string | null;
  actorName: string | null;

  paypalOrderId: string | null;
  paypalCaptureId: string | null;

  reversedAt: string | null;
  reversedById: string | null;
  reversedByName: string | null;
  reversalReason: string | null;

  createdAt: string;
};

export type AdminGiftCardDetails = {
  id: string;
  reference: string;
  code: string;
  status: GiftCardStatus;

  initialAmountCents: number;
  balanceCents: number;
  usedAmountCents: number;
  currency: string;

  purchaserFirstName: string;
  purchaserLastName: string;
  purchaserEmail: string;

  recipientFirstName: string;
  recipientLastName: string;
  recipientEmail: string | null;

  personalMessage: string | null;

  paypalOrderId: string | null;
  paypalCaptureId: string | null;
  paypalPayerId: string | null;

  paidAt: string | null;
  activatedAt: string | null;
  fullyUsedAt: string | null;
  cancelledAt: string | null;
  revokedAt: string | null;
  expiresAt: string;

  cancellationReason: string | null;
  revocationReason: string | null;

  createdAt: string;
  updatedAt: string;

  transactions: AdminGiftCardTransaction[];
};
