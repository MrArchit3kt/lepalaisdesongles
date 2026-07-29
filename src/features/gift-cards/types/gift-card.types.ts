import type {
  GiftCardStatus,
  GiftCardTransactionType,
} from "@/generated/prisma/client";

export type GiftCardPublicPurchaseInput = {
  amountCents: number;

  purchaserFirstName: string;
  purchaserLastName: string;
  purchaserEmail: string;

  recipientFirstName: string;
  recipientLastName: string;
  recipientEmail?: string;

  personalMessage?: string;
};

export type GiftCardAdminRedemptionInput = {
  giftCardId: string;
  amountCents: number;
  note?: string;
};

export type GiftCardAdminReversalInput = {
  giftCardId: string;
  transactionId: string;
  reason: string;
};

export type GiftCardAdminStatusActionInput = {
  giftCardId: string;
  reason: string;
};

export type GiftCardSummary = {
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

  personalMessage: string | null;

  paidAt: Date | null;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type GiftCardTransactionSummary = {
  id: string;
  type: GiftCardTransactionType;

  amountCents: number;
  balanceBeforeCents: number;
  balanceAfterCents: number;

  note: string | null;
  reason: string | null;

  actorId: string | null;
  actorName: string | null;

  reversedAt: Date | null;
  reversedById: string | null;
  reversalReason: string | null;

  createdAt: Date;
};

export type GiftCardActionResult = {
  success: boolean;
  message: string;
  giftCardId?: string;
  reference?: string;
};

export type GiftCardPurchaseCreationResult = {
  giftCardId: string;
  reference: string;
  checkoutToken: string;
};

export type GiftCardPaymentActivationResult = {
  giftCardId: string;
  reference: string;
  code: string;
  status: GiftCardStatus;
};

export type GiftCardDashboardMetrics = {
  totalCards: number;
  pendingPaymentCards: number;
  activeCards: number;
  partiallyUsedCards: number;
  fullyUsedCards: number;
  cancelledCards: number;
  revokedCards: number;
  expiredCards: number;

  soldAmountCents: number;
  redeemedAmountCents: number;
  remainingBalanceCents: number;
};

export type GiftCardStatusFilter =
  | "ALL"
  | GiftCardStatus;
