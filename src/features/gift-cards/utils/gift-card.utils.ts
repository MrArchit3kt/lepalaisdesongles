import "server-only";

import {
  createHash,
  randomBytes,
} from "node:crypto";

import type {
  GiftCardStatus,
} from "@/generated/prisma/client";

const GIFT_CARD_CODE_ALPHABET =
  "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

const GIFT_CARD_REFERENCE_ALPHABET =
  "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function createRandomCharacters(
  length: number,
  alphabet: string,
): string {
  const random = randomBytes(length);
  let result = "";

  for (
    let index = 0;
    index < length;
    index += 1
  ) {
    const value =
      random[index];

    if (value === undefined) {
      throw new Error(
        "Impossible de générer une valeur aléatoire.",
      );
    }

    result +=
      alphabet[
        value % alphabet.length
      ];
  }

  return result;
}

export function generateGiftCardReference():
  string {
  return `GCR-${createRandomCharacters(
    16,
    GIFT_CARD_REFERENCE_ALPHABET,
  )}`;
}

export function generateGiftCardCode(
  date = new Date(),
): string {
  const year =
    date.getUTCFullYear();

  const randomPart =
    createRandomCharacters(
      8,
      GIFT_CARD_CODE_ALPHABET,
    );

  return `LPDO-${year}-${randomPart}`;
}

export function generateGiftCardCheckoutToken():
  string {
  return randomBytes(32).toString(
    "base64url",
  );
}

export function hashGiftCardCheckoutToken(
  token: string,
): string {
  return createHash("sha256")
    .update(token)
    .digest("hex");
}

export function giftCardCheckoutTokenMatches(
  token: string,
  expectedHash: string | null,
): boolean {
  if (!expectedHash) {
    return false;
  }

  return (
    hashGiftCardCheckoutToken(token) ===
    expectedHash
  );
}

export function eurosToCents(
  amountEuros: number,
): number {
  if (
    !Number.isFinite(amountEuros)
  ) {
    throw new Error(
      "Le montant en euros est invalide.",
    );
  }

  return Math.round(
    amountEuros * 100,
  );
}

export function formatGiftCardAmount(
  amountCents: number,
  currency = "EUR",
): string {
  return new Intl.NumberFormat(
    "fr-FR",
    {
      style: "currency",
      currency,
    },
  ).format(
    amountCents / 100,
  );
}

export function getGiftCardUsedAmount(
  initialAmountCents: number,
  balanceCents: number,
): number {
  return Math.max(
    0,
    initialAmountCents -
      balanceCents,
  );
}

export function getGiftCardStatusFromBalance(
  initialAmountCents: number,
  balanceCents: number,
): GiftCardStatus {
  if (balanceCents <= 0) {
    return "USED";
  }

  if (
    balanceCents <
    initialAmountCents
  ) {
    return "PARTIALLY_USED";
  }

  return "ACTIVE";
}

export function canRedeemGiftCardStatus(
  status: GiftCardStatus,
): boolean {
  return (
    status === "ACTIVE" ||
    status === "PARTIALLY_USED"
  );
}

export function isGiftCardExpired(
  expiresAt: Date,
  now = new Date(),
): boolean {
  return (
    expiresAt.getTime() <=
    now.getTime()
  );
}

export function calculateGiftCardExpirationDate(
  paidAt: Date,
  validityMonths = 12,
): Date {
  const expirationDate =
    new Date(paidAt);

  expirationDate.setUTCMonth(
    expirationDate.getUTCMonth() +
      validityMonths,
  );

  return expirationDate;
}

export function normalizeGiftCardEmail(
  email: string,
): string {
  return email
    .trim()
    .toLowerCase();
}

export function normalizeGiftCardName(
  value: string,
): string {
  return value
    .trim()
    .replace(/\s+/g, " ");
}
