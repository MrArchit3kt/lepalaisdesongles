import "server-only";

import { Prisma } from "@/generated/prisma/client";

import { giftCardAdminCreateSchema } from "@/features/gift-cards/schemas/gift-card.schemas";
import { GiftCardServiceError } from "@/features/gift-cards/services/gift-card.service";
import {
  calculateGiftCardExpirationDate,
  generateGiftCardCode,
  generateGiftCardReference,
  normalizeGiftCardEmail,
  normalizeGiftCardName,
} from "@/features/gift-cards/utils/gift-card.utils";
import { prisma } from "@/lib/prisma";

const MAX_CREATION_ATTEMPTS = 10;

export type AdminGiftCardCreationResult = {
  id: string;
  reference: string;
  code: string;
  amountCents: number;
  balanceCents: number;
  expiresAt: Date;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function findNestedString(
  value: unknown,
  key: string,
  depth = 0,
): string | null {
  if (depth > 6 || !isRecord(value)) {
    return null;
  }

  const directValue = value[key];

  if (typeof directValue === "string") {
    return directValue;
  }

  for (const nestedValue of Object.values(value)) {
    const result = findNestedString(nestedValue, key, depth + 1);

    if (result) {
      return result;
    }
  }

  return null;
}

function isRetryableCreationError(error: unknown): boolean {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return error.code === "P2002" || error.code === "P2034";
  }

  const originalCode = findNestedString(error, "originalCode");

  const kind = findNestedString(error, "kind");

  return originalCode === "40001" || kind === "TransactionWriteConflict";
}

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

function eurosToCents(amountEuros: number): number {
  const amountCents = Math.round(amountEuros * 100);

  if (!Number.isSafeInteger(amountCents) || amountCents <= 0) {
    throw new GiftCardServiceError(
      "INVALID_AMOUNT",
      "Le montant de la carte cadeau est invalide.",
    );
  }

  return amountCents;
}

export async function createAdminGiftCard(
  input: unknown,
  actorId: string,
): Promise<AdminGiftCardCreationResult> {
  const parsed = giftCardAdminCreateSchema.parse(input);

  const cleanActorId = actorId.trim();

  if (!cleanActorId) {
    throw new GiftCardServiceError(
      "FORBIDDEN_OPERATION",
      "L’administrateur responsable de la création est introuvable.",
    );
  }

  const amountCents = eurosToCents(parsed.amountEuros);

  const purchaserFirstName = normalizeGiftCardName(parsed.purchaserFirstName);

  const purchaserLastName = normalizeGiftCardName(parsed.purchaserLastName);

  const purchaserEmail = normalizeGiftCardEmail(parsed.purchaserEmail);

  const recipientFirstName = normalizeGiftCardName(parsed.recipientFirstName);

  const recipientLastName = normalizeGiftCardName(parsed.recipientLastName);

  const recipientEmail = parsed.recipientEmail
    ? normalizeGiftCardEmail(parsed.recipientEmail)
    : null;

  for (let attempt = 0; attempt < MAX_CREATION_ATTEMPTS; attempt += 1) {
    try {
      const now = new Date();

      const expiresAt = calculateGiftCardExpirationDate(
        now,
        parsed.validityMonths,
      );

      const result = await prisma.$transaction(
        async (transaction) => {
          const actor = await transaction.user.findFirst({
            where: {
              id: cleanActorId,

              status: "ACTIVE",

              role: {
                in: ["SUPER_ADMIN", "ADMIN", "STAFF"],
              },
            },

            select: {
              id: true,
            },
          });

          if (!actor) {
            throw new GiftCardServiceError(
              "FORBIDDEN_OPERATION",
              "Vous n’êtes pas autorisé à créer une carte cadeau.",
            );
          }

          const reference = generateGiftCardReference();

          const code = generateGiftCardCode();

          const giftCard = await transaction.giftCard.create({
            data: {
              reference,
              code,

              status: "ACTIVE",

              initialAmountCents: amountCents,

              balanceCents: amountCents,

              currency: "EUR",

              purchaserFirstName,
              purchaserLastName,
              purchaserEmail,

              recipientFirstName,
              recipientLastName,
              recipientEmail,

              personalMessage: parsed.personalMessage,

              paidAt: now,

              activatedAt: now,

              expiresAt,
            },

            select: {
              id: true,

              reference: true,

              code: true,

              initialAmountCents: true,

              balanceCents: true,

              expiresAt: true,
            },
          });

          await transaction.giftCardTransaction.create({
            data: {
              giftCardId: giftCard.id,

              type: "CREATED",

              amountCents: amountCents,

              balanceBeforeCents: 0,

              balanceAfterCents: amountCents,

              note: parsed.adminNote,

              actorId: actor.id,

              metadata: {
                source: "ADMIN_IN_STORE",

                paymentMethod: parsed.paymentMethod,

                validityMonths: parsed.validityMonths,

                reference: giftCard.reference,

                status: "ACTIVE",
              },
            },
          });

          await transaction.giftCardTransaction.create({
            data: {
              giftCardId: giftCard.id,

              type: "PAYMENT_CONFIRMED",

              amountCents: amountCents,

              balanceBeforeCents: amountCents,

              balanceAfterCents: amountCents,

              note: parsed.adminNote,

              actorId: actor.id,

              metadata: {
                source: "ADMIN_IN_STORE",

                paymentMethod: parsed.paymentMethod,

                activatedImmediately: true,
              },
            },
          });

          return giftCard;
        },
        {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        },
      );

      return {
        id: result.id,

        reference: result.reference,

        code: result.code,

        amountCents: result.initialAmountCents,

        balanceCents: result.balanceCents,

        expiresAt: result.expiresAt,
      };
    } catch (error) {
      if (error instanceof GiftCardServiceError) {
        throw error;
      }

      if (
        isRetryableCreationError(error) &&
        attempt < MAX_CREATION_ATTEMPTS - 1
      ) {
        await wait(40 * 2 ** attempt);

        continue;
      }

      if (isRetryableCreationError(error)) {
        throw new GiftCardServiceError(
          "CONFLICT",
          "Impossible de générer une carte cadeau unique après plusieurs tentatives.",
        );
      }

      throw error;
    }
  }

  throw new GiftCardServiceError(
    "CONFLICT",
    "Impossible de créer la carte cadeau.",
  );
}
