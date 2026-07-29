import "server-only";

import {
  Prisma,
  type GiftCardStatus,
} from "@/generated/prisma/client";
import {
  prisma,
} from "@/lib/prisma";

import {
  giftCardAdminRedemptionSchema,
  giftCardAdminReversalSchema,
  giftCardAdminStatusActionSchema,
  giftCardPublicPurchaseSchema,
} from "@/features/gift-cards/schemas/gift-card.schemas";
import type {
  GiftCardAdminRedemptionInput,
  GiftCardAdminReversalInput,
  GiftCardAdminStatusActionInput,
  GiftCardPaymentActivationResult,
  GiftCardPublicPurchaseInput,
  GiftCardPurchaseCreationResult,
} from "@/features/gift-cards/types/gift-card.types";
import {
  calculateGiftCardExpirationDate,
  canRedeemGiftCardStatus,
  generateGiftCardCheckoutToken,
  generateGiftCardCode,
  generateGiftCardReference,
  getGiftCardStatusFromBalance,
  hashGiftCardCheckoutToken,
  isGiftCardExpired,
  normalizeGiftCardEmail,
  normalizeGiftCardName,
} from "@/features/gift-cards/utils/gift-card.utils";

const MAX_UNIQUE_IDENTIFIER_ATTEMPTS =
  10;

const DEFAULT_VALIDITY_MONTHS =
  12;

const GIFT_CARD_SELECT = {
  id:
    true,
  reference:
    true,
  code:
    true,
  status:
    true,
  initialAmountCents:
    true,
  balanceCents:
    true,
  currency:
    true,
  purchaserFirstName:
    true,
  purchaserLastName:
    true,
  purchaserEmail:
    true,
  recipientFirstName:
    true,
  recipientLastName:
    true,
  recipientEmail:
    true,
  personalMessage:
    true,
  paypalOrderId:
    true,
  paypalCaptureId:
    true,
  paypalPayerId:
    true,
  checkoutTokenHash:
    true,
  version:
    true,
  paidAt:
    true,
  activatedAt:
    true,
  fullyUsedAt:
    true,
  cancelledAt:
    true,
  revokedAt:
    true,
  expiresAt:
    true,
  cancellationReason:
    true,
  revocationReason:
    true,
  createdAt:
    true,
  updatedAt:
    true,
} satisfies Prisma.GiftCardSelect;

export class GiftCardServiceError
  extends Error {
  public readonly code:
    | "NOT_FOUND"
    | "INVALID_STATUS"
    | "INVALID_AMOUNT"
    | "EXPIRED"
    | "CONFLICT"
    | "ALREADY_REVERSED"
    | "PAYMENT_MISMATCH"
    | "INVALID_PAYMENT"
    | "FORBIDDEN_OPERATION";

  public constructor(
    code:
      | "NOT_FOUND"
      | "INVALID_STATUS"
      | "INVALID_AMOUNT"
      | "EXPIRED"
      | "CONFLICT"
      | "ALREADY_REVERSED"
      | "PAYMENT_MISMATCH"
      | "INVALID_PAYMENT"
      | "FORBIDDEN_OPERATION",
    message: string,
  ) {
    super(message);

    this.name =
      "GiftCardServiceError";

    this.code =
      code;
  }
}

function isPrismaUniqueConstraintError(
  error: unknown,
): boolean {
  return (
    error instanceof
      Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

async function createGiftCardWithUniqueIdentifiers(
  data: {
    amountCents: number;

    purchaserFirstName: string;
    purchaserLastName: string;
    purchaserEmail: string;

    recipientFirstName: string;
    recipientLastName: string;
    recipientEmail?: string;

    personalMessage?: string;

    checkoutTokenHash: string;
    expiresAt: Date;
  },
) {
  for (
    let attempt = 0;
    attempt <
    MAX_UNIQUE_IDENTIFIER_ATTEMPTS;
    attempt += 1
  ) {
    try {
      return await prisma.$transaction(
        async (transaction) => {
          const reference =
            generateGiftCardReference();

          /*
           * Le code est déjà généré ici, mais il reste
           * totalement inutilisable tant que le statut
           * n’est pas ACTIVE.
           */
          const code =
            generateGiftCardCode();

          const giftCard =
            await transaction.giftCard.create({
              data: {
                reference,
                code,

                status:
                  "PENDING_PAYMENT",

                initialAmountCents:
                  data.amountCents,

                balanceCents:
                  data.amountCents,

                currency:
                  "EUR",

                purchaserFirstName:
                  data.purchaserFirstName,

                purchaserLastName:
                  data.purchaserLastName,

                purchaserEmail:
                  data.purchaserEmail,

                recipientFirstName:
                  data.recipientFirstName,

                recipientLastName:
                  data.recipientLastName,

                recipientEmail:
                  data.recipientEmail,

                personalMessage:
                  data.personalMessage,

                checkoutTokenHash:
                  data.checkoutTokenHash,

                expiresAt:
                  data.expiresAt,
              },

              select:
                GIFT_CARD_SELECT,
            });

          await transaction.giftCardTransaction.create({
            data: {
              giftCardId:
                giftCard.id,

              type:
                "CREATED",

              amountCents:
                data.amountCents,

              balanceBeforeCents:
                0,

              balanceAfterCents:
                data.amountCents,

              metadata: {
                source:
                  "PUBLIC_CHECKOUT",

                reference:
                  giftCard.reference,

                status:
                  giftCard.status,
              },
            },
          });

          return giftCard;
        },
        {
          isolationLevel:
            Prisma.TransactionIsolationLevel.Serializable,
        },
      );
    } catch (error) {
      if (
        isPrismaUniqueConstraintError(
          error,
        )
      ) {
        continue;
      }

      throw error;
    }
  }

  throw new GiftCardServiceError(
    "CONFLICT",
    "Impossible de générer une référence unique pour la carte cadeau.",
  );
}

export async function createGiftCardPurchase(
  input:
    GiftCardPublicPurchaseInput,
): Promise<GiftCardPurchaseCreationResult> {
  const parsed =
    giftCardPublicPurchaseSchema.parse(
      input,
    );

  const checkoutToken =
    generateGiftCardCheckoutToken();

  const checkoutTokenHash =
    hashGiftCardCheckoutToken(
      checkoutToken,
    );

  const now =
    new Date();

  /*
   * La date définitive sera recalculée lors
   * de la capture PayPal. Cette première date
   * garantit néanmoins que le champ obligatoire
   * expiresAt n’est jamais vide.
   */
  const provisionalExpirationDate =
    calculateGiftCardExpirationDate(
      now,
      DEFAULT_VALIDITY_MONTHS,
    );

  const giftCard =
    await createGiftCardWithUniqueIdentifiers({
      amountCents:
        parsed.amountCents,

      purchaserFirstName:
        normalizeGiftCardName(
          parsed.purchaserFirstName,
        ),

      purchaserLastName:
        normalizeGiftCardName(
          parsed.purchaserLastName,
        ),

      purchaserEmail:
        normalizeGiftCardEmail(
          parsed.purchaserEmail,
        ),

      recipientFirstName:
        normalizeGiftCardName(
          parsed.recipientFirstName,
        ),

      recipientLastName:
        normalizeGiftCardName(
          parsed.recipientLastName,
        ),

      recipientEmail:
        parsed.recipientEmail
          ? normalizeGiftCardEmail(
              parsed.recipientEmail,
            )
          : undefined,

      personalMessage:
        parsed.personalMessage,

      checkoutTokenHash,

      expiresAt:
        provisionalExpirationDate,
    });

  return {
    giftCardId:
      giftCard.id,

    reference:
      giftCard.reference,

    checkoutToken,
  };
}

export async function attachPayPalOrderToGiftCard(
  input: {
    giftCardId: string;
    paypalOrderId: string;
  },
): Promise<void> {
  const giftCardId =
    input.giftCardId.trim();

  const paypalOrderId =
    input.paypalOrderId.trim();

  if (
    !giftCardId ||
    !paypalOrderId
  ) {
    throw new GiftCardServiceError(
      "INVALID_PAYMENT",
      "Les informations de la commande PayPal sont invalides.",
    );
  }

  const result =
    await prisma.giftCard.updateMany({
      where: {
        id:
          giftCardId,

        status:
          "PENDING_PAYMENT",

        paypalOrderId:
          null,
      },

      data: {
        paypalOrderId,
        version: {
          increment:
            1,
        },
      },
    });

  if (
    result.count !== 1
  ) {
    const existing =
      await prisma.giftCard.findUnique({
        where: {
          id:
            giftCardId,
        },

        select: {
          paypalOrderId:
            true,
          status:
            true,
        },
      });

    if (!existing) {
      throw new GiftCardServiceError(
        "NOT_FOUND",
        "Carte cadeau introuvable.",
      );
    }

    if (
      existing.paypalOrderId ===
      paypalOrderId
    ) {
      return;
    }

    throw new GiftCardServiceError(
      "CONFLICT",
      "Cette carte cadeau possède déjà une autre commande PayPal.",
    );
  }
}

export async function activateGiftCardAfterPayPalCapture(
  input: {
    paypalOrderId: string;
    paypalCaptureId: string;
    paypalPayerId?: string;
    capturedAmountCents: number;
    currency: string;
    capturedAt?: Date;
  },
): Promise<GiftCardPaymentActivationResult> {
  const paypalOrderId =
    input.paypalOrderId.trim();

  const paypalCaptureId =
    input.paypalCaptureId.trim();

  const currency =
    input.currency
      .trim()
      .toUpperCase();

  if (
    !paypalOrderId ||
    !paypalCaptureId
  ) {
    throw new GiftCardServiceError(
      "INVALID_PAYMENT",
      "Les informations de capture PayPal sont incomplètes.",
    );
  }

  if (
    !Number.isInteger(
      input.capturedAmountCents,
    ) ||
    input.capturedAmountCents <= 0
  ) {
    throw new GiftCardServiceError(
      "INVALID_PAYMENT",
      "Le montant capturé par PayPal est invalide.",
    );
  }

  return prisma.$transaction(
    async (transaction) => {
      const giftCard =
        await transaction.giftCard.findUnique({
          where: {
            paypalOrderId,
          },

          select:
            GIFT_CARD_SELECT,
        });

      if (!giftCard) {
        throw new GiftCardServiceError(
          "NOT_FOUND",
          "Aucune carte cadeau n’est associée à cette commande PayPal.",
        );
      }

      /*
       * Capture déjà traitée : réponse idempotente.
       */
      if (
        (
          giftCard.status ===
            "ACTIVE" ||
          giftCard.status ===
            "PARTIALLY_USED" ||
          giftCard.status ===
            "USED"
        ) &&
        giftCard.paypalCaptureId ===
          paypalCaptureId
      ) {
        return {
          giftCardId:
            giftCard.id,

          reference:
            giftCard.reference,

          code:
            giftCard.code,

          status:
            giftCard.status,
        };
      }

      if (
        giftCard.status !==
        "PENDING_PAYMENT"
      ) {
        throw new GiftCardServiceError(
          "INVALID_STATUS",
          "Cette carte cadeau n’est plus en attente de paiement.",
        );
      }

      if (
        giftCard.initialAmountCents !==
        input.capturedAmountCents
      ) {
        throw new GiftCardServiceError(
          "PAYMENT_MISMATCH",
          "Le montant capturé par PayPal ne correspond pas au montant de la carte cadeau.",
        );
      }

      if (
        giftCard.currency !==
        currency
      ) {
        throw new GiftCardServiceError(
          "PAYMENT_MISMATCH",
          "La devise capturée par PayPal ne correspond pas à celle de la carte cadeau.",
        );
      }

      const capturedAt =
        input.capturedAt ??
        new Date();

      const expiresAt =
        calculateGiftCardExpirationDate(
          capturedAt,
          DEFAULT_VALIDITY_MONTHS,
        );

      const updateResult =
        await transaction.giftCard.updateMany({
          where: {
            id:
              giftCard.id,

            version:
              giftCard.version,

            status:
              "PENDING_PAYMENT",

            paypalCaptureId:
              null,
          },

          data: {
            status:
              "ACTIVE",

            paypalCaptureId,
            paypalPayerId:
              input.paypalPayerId?.trim() ||
              null,

            paidAt:
              capturedAt,

            activatedAt:
              capturedAt,

            expiresAt,

            checkoutTokenHash:
              null,

            version: {
              increment:
                1,
            },
          },
        });

      if (
        updateResult.count !== 1
      ) {
        throw new GiftCardServiceError(
          "CONFLICT",
          "La carte cadeau a été modifiée pendant la validation du paiement.",
        );
      }

      await transaction.giftCardTransaction.create({
        data: {
          giftCardId:
            giftCard.id,

          type:
            "PAYMENT_CONFIRMED",

          amountCents:
            giftCard.initialAmountCents,

          balanceBeforeCents:
            giftCard.balanceCents,

          balanceAfterCents:
            giftCard.balanceCents,

          paypalOrderId,
          paypalCaptureId,

          metadata: {
            source:
              "PAYPAL_CAPTURE",

            currency,

            capturedAt:
              capturedAt.toISOString(),

            expiresAt:
              expiresAt.toISOString(),
          },
        },
      });

      return {
        giftCardId:
          giftCard.id,

        reference:
          giftCard.reference,

        code:
          giftCard.code,

        status:
          "ACTIVE",
      };
    },
    {
      isolationLevel:
        Prisma.TransactionIsolationLevel.Serializable,
    },
  );
}

export async function markGiftCardPaymentFailed(
  input: {
    giftCardId: string;
    reason?: string;
    paypalOrderId?: string;
  },
): Promise<void> {
  await prisma.$transaction(
    async (transaction) => {
      const giftCard =
        await transaction.giftCard.findUnique({
          where: {
            id:
              input.giftCardId,
          },

          select: {
            id:
              true,
            status:
              true,
            balanceCents:
              true,
            version:
              true,
          },
        });

      if (!giftCard) {
        throw new GiftCardServiceError(
          "NOT_FOUND",
          "Carte cadeau introuvable.",
        );
      }

      if (
        giftCard.status !==
        "PENDING_PAYMENT"
      ) {
        return;
      }

      const updateResult =
        await transaction.giftCard.updateMany({
          where: {
            id:
              giftCard.id,

            version:
              giftCard.version,

            status:
              "PENDING_PAYMENT",
          },

          data: {
            status:
              "PAYMENT_FAILED",

            checkoutTokenHash:
              null,

            version: {
              increment:
                1,
            },
          },
        });

      if (
        updateResult.count !== 1
      ) {
        throw new GiftCardServiceError(
          "CONFLICT",
          "La carte cadeau a été modifiée pendant l’enregistrement de l’échec de paiement.",
        );
      }

      await transaction.giftCardTransaction.create({
        data: {
          giftCardId:
            giftCard.id,

          type:
            "PAYMENT_FAILED",

          amountCents:
            0,

          balanceBeforeCents:
            giftCard.balanceCents,

          balanceAfterCents:
            giftCard.balanceCents,

          reason:
            input.reason?.trim() ||
            "Paiement PayPal non finalisé.",

          paypalOrderId:
            input.paypalOrderId?.trim() ||
            null,
        },
      });
    },
    {
      isolationLevel:
        Prisma.TransactionIsolationLevel.Serializable,
    },
  );
}

export async function redeemGiftCardInStore(
  input:
    GiftCardAdminRedemptionInput,
  actorId:
    string,
) {
  const parsed =
    giftCardAdminRedemptionSchema.parse(
      input,
    );

  return prisma.$transaction(
    async (transaction) => {
      const giftCard =
        await transaction.giftCard.findUnique({
          where: {
            id:
              parsed.giftCardId,
          },

          select:
            GIFT_CARD_SELECT,
        });

      if (!giftCard) {
        throw new GiftCardServiceError(
          "NOT_FOUND",
          "Carte cadeau introuvable.",
        );
      }

      if (
        !canRedeemGiftCardStatus(
          giftCard.status,
        )
      ) {
        throw new GiftCardServiceError(
          "INVALID_STATUS",
          "Cette carte cadeau ne peut pas être utilisée.",
        );
      }

      const now =
        new Date();

      if (
        isGiftCardExpired(
          giftCard.expiresAt,
          now,
        )
      ) {
        throw new GiftCardServiceError(
          "EXPIRED",
          "Cette carte cadeau est expirée.",
        );
      }

      if (
        parsed.amountCents >
        giftCard.balanceCents
      ) {
        throw new GiftCardServiceError(
          "INVALID_AMOUNT",
          "Le montant saisi dépasse le solde restant de la carte cadeau.",
        );
      }

      const balanceBeforeCents =
        giftCard.balanceCents;

      const balanceAfterCents =
        balanceBeforeCents -
        parsed.amountCents;

      const nextStatus =
        getGiftCardStatusFromBalance(
          giftCard.initialAmountCents,
          balanceAfterCents,
        );

      const updateResult =
        await transaction.giftCard.updateMany({
          where: {
            id:
              giftCard.id,

            version:
              giftCard.version,

            status: {
              in: [
                "ACTIVE",
                "PARTIALLY_USED",
              ],
            },

            balanceCents: {
              gte:
                parsed.amountCents,
            },

            expiresAt: {
              gt:
                now,
            },
          },

          data: {
            balanceCents:
              balanceAfterCents,

            status:
              nextStatus,

            fullyUsedAt:
              nextStatus === "USED"
                ? now
                : null,

            version: {
              increment:
                1,
            },
          },
        });

      if (
        updateResult.count !== 1
      ) {
        throw new GiftCardServiceError(
          "CONFLICT",
          "Le solde de cette carte cadeau a été modifié par une autre opération.",
        );
      }

      const transactionRecord =
        await transaction.giftCardTransaction.create({
          data: {
            giftCardId:
              giftCard.id,

            type:
              "REDEMPTION",

            amountCents:
              parsed.amountCents,

            balanceBeforeCents,
            balanceAfterCents,

            note:
              parsed.note,

            actorId,

            metadata: {
              source:
                "ADMIN_IN_STORE",

              previousStatus:
                giftCard.status,

              nextStatus,
            },
          },
        });

      return {
        giftCardId:
          giftCard.id,

        transactionId:
          transactionRecord.id,

        balanceBeforeCents,
        amountCents:
          parsed.amountCents,

        balanceAfterCents,
        status:
          nextStatus,
      };
    },
    {
      isolationLevel:
        Prisma.TransactionIsolationLevel.Serializable,
    },
  );
}

export async function reverseGiftCardRedemption(
  input:
    GiftCardAdminReversalInput,
  actorId:
    string,
) {
  const parsed =
    giftCardAdminReversalSchema.parse(
      input,
    );

  return prisma.$transaction(
    async (transaction) => {
      const redemption =
        await transaction.giftCardTransaction.findFirst({
          where: {
            id:
              parsed.transactionId,

            giftCardId:
              parsed.giftCardId,

            type:
              "REDEMPTION",
          },

          select: {
            id:
              true,
            amountCents:
              true,
            reversedAt:
              true,
            giftCard: {
              select:
                GIFT_CARD_SELECT,
            },
          },
        });

      if (!redemption) {
        throw new GiftCardServiceError(
          "NOT_FOUND",
          "Le débit à annuler est introuvable.",
        );
      }

      if (
        redemption.reversedAt
      ) {
        throw new GiftCardServiceError(
          "ALREADY_REVERSED",
          "Ce débit a déjà été annulé.",
        );
      }

      const giftCard =
        redemption.giftCard;

      if (
        giftCard.status ===
          "CANCELLED" ||
        giftCard.status ===
          "REVOKED" ||
        giftCard.status ===
          "PAYMENT_FAILED" ||
        giftCard.status ===
          "PENDING_PAYMENT"
      ) {
        throw new GiftCardServiceError(
          "FORBIDDEN_OPERATION",
          "Le solde de cette carte ne peut pas être restauré dans son état actuel.",
        );
      }

      const balanceBeforeCents =
        giftCard.balanceCents;

      const balanceAfterCents =
        Math.min(
          giftCard.initialAmountCents,
          giftCard.balanceCents +
            redemption.amountCents,
        );

      const restoredAmountCents =
        balanceAfterCents -
        balanceBeforeCents;

      if (
        restoredAmountCents <= 0
      ) {
        throw new GiftCardServiceError(
          "INVALID_AMOUNT",
          "Le solde de la carte ne permet pas cette restauration.",
        );
      }

      const nextStatus:
        GiftCardStatus =
        getGiftCardStatusFromBalance(
          giftCard.initialAmountCents,
          balanceAfterCents,
        );

      const now =
        new Date();

      const updateCardResult =
        await transaction.giftCard.updateMany({
          where: {
            id:
              giftCard.id,

            version:
              giftCard.version,

            balanceCents:
              giftCard.balanceCents,
          },

          data: {
            balanceCents:
              balanceAfterCents,

            status:
              nextStatus,

            fullyUsedAt:
              null,

            version: {
              increment:
                1,
            },
          },
        });

      if (
        updateCardResult.count !== 1
      ) {
        throw new GiftCardServiceError(
          "CONFLICT",
          "Le solde de la carte cadeau a été modifié pendant l’annulation.",
        );
      }

      const updateRedemptionResult =
        await transaction.giftCardTransaction.updateMany({
          where: {
            id:
              redemption.id,

            reversedAt:
              null,
          },

          data: {
            reversedAt:
              now,

            reversedById:
              actorId,

            reversalReason:
              parsed.reason,
          },
        });

      if (
        updateRedemptionResult.count !== 1
      ) {
        throw new GiftCardServiceError(
          "ALREADY_REVERSED",
          "Ce débit vient déjà d’être annulé.",
        );
      }

      const reversal =
        await transaction.giftCardTransaction.create({
          data: {
            giftCardId:
              giftCard.id,

            type:
              "REDEMPTION_REVERSAL",

            amountCents:
              restoredAmountCents,

            balanceBeforeCents,
            balanceAfterCents,

            reason:
              parsed.reason,

            actorId,

            metadata: {
              source:
                "ADMIN_REVERSAL",

              reversedTransactionId:
                redemption.id,

              previousStatus:
                giftCard.status,

              nextStatus,
            },
          },
        });

      return {
        giftCardId:
          giftCard.id,

        transactionId:
          reversal.id,

        reversedTransactionId:
          redemption.id,

        restoredAmountCents,

        balanceBeforeCents,
        balanceAfterCents,

        status:
          nextStatus,
      };
    },
    {
      isolationLevel:
        Prisma.TransactionIsolationLevel.Serializable,
    },
  );
}

async function changeGiftCardAdministrativeStatus(
  input:
    GiftCardAdminStatusActionInput,
  actorId:
    string,
  nextStatus:
    "CANCELLED" | "REVOKED",
) {
  const parsed =
    giftCardAdminStatusActionSchema.parse(
      input,
    );

  return prisma.$transaction(
    async (transaction) => {
      const giftCard =
        await transaction.giftCard.findUnique({
          where: {
            id:
              parsed.giftCardId,
          },

          select:
            GIFT_CARD_SELECT,
        });

      if (!giftCard) {
        throw new GiftCardServiceError(
          "NOT_FOUND",
          "Carte cadeau introuvable.",
        );
      }

      if (
        giftCard.status ===
          "USED"
      ) {
        throw new GiftCardServiceError(
          "FORBIDDEN_OPERATION",
          "Une carte entièrement utilisée ne peut pas être annulée ou révoquée.",
        );
      }

      if (
        giftCard.status ===
          "CANCELLED" ||
        giftCard.status ===
          "REVOKED"
      ) {
        throw new GiftCardServiceError(
          "INVALID_STATUS",
          "Cette carte cadeau est déjà bloquée.",
        );
      }

      const now =
        new Date();

      const updateResult =
        await transaction.giftCard.updateMany({
          where: {
            id:
              giftCard.id,

            version:
              giftCard.version,

            status:
              giftCard.status,
          },

          data: {
            status:
              nextStatus,

            cancellationReason:
              nextStatus ===
              "CANCELLED"
                ? parsed.reason
                : giftCard.cancellationReason,

            cancelledAt:
              nextStatus ===
              "CANCELLED"
                ? now
                : giftCard.cancelledAt,

            revocationReason:
              nextStatus ===
              "REVOKED"
                ? parsed.reason
                : giftCard.revocationReason,

            revokedAt:
              nextStatus ===
              "REVOKED"
                ? now
                : giftCard.revokedAt,

            version: {
              increment:
                1,
            },
          },
        });

      if (
        updateResult.count !== 1
      ) {
        throw new GiftCardServiceError(
          "CONFLICT",
          "La carte cadeau a été modifiée pendant l’opération.",
        );
      }

      await transaction.giftCardTransaction.create({
        data: {
          giftCardId:
            giftCard.id,

          type:
            nextStatus ===
            "CANCELLED"
              ? "CANCELLED"
              : "REVOKED",

          amountCents:
            0,

          balanceBeforeCents:
            giftCard.balanceCents,

          balanceAfterCents:
            giftCard.balanceCents,

          reason:
            parsed.reason,

          actorId,

          metadata: {
            source:
              "ADMIN",

            previousStatus:
              giftCard.status,

            nextStatus,
          },
        },
      });

      return {
        giftCardId:
          giftCard.id,

        previousStatus:
          giftCard.status,

        status:
          nextStatus,
      };
    },
    {
      isolationLevel:
        Prisma.TransactionIsolationLevel.Serializable,
    },
  );
}

export async function cancelGiftCard(
  input:
    GiftCardAdminStatusActionInput,
  actorId:
    string,
) {
  return changeGiftCardAdministrativeStatus(
    input,
    actorId,
    "CANCELLED",
  );
}

export async function revokeGiftCard(
  input:
    GiftCardAdminStatusActionInput,
  actorId:
    string,
) {
  return changeGiftCardAdministrativeStatus(
    input,
    actorId,
    "REVOKED",
  );
}

export async function getGiftCardById(
  giftCardId: string,
) {
  return prisma.giftCard.findUnique({
    where: {
      id:
        giftCardId,
    },

    include: {
      transactions: {
        orderBy: {
          createdAt:
            "desc",
        },

        include: {
          actor: {
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
          },

          reversedBy: {
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
          },
        },
      },
    },
  });
}

export async function getGiftCardByCode(
  code: string,
) {
  return prisma.giftCard.findUnique({
    where: {
      code:
        code
          .trim()
          .toUpperCase(),
    },

    select:
      GIFT_CARD_SELECT,
  });
}
