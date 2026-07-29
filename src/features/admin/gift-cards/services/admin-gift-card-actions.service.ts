import "server-only";

import { Prisma, type GiftCardStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

import {
  giftCardAdminRedemptionSchema,
  giftCardAdminReversalSchema,
  giftCardAdminStatusActionSchema,
} from "@/features/gift-cards/schemas/gift-card.schemas";
import {
  GiftCardServiceError,
  redeemGiftCardInStore,
  reverseGiftCardRedemption,
} from "@/features/gift-cards/services/gift-card.service";

export type AdminGiftCardMutation =
  | {
      action: "REDEEM";
      amountCents: number;
      note?: string;
    }
  | {
      action: "REVERSE_REDEMPTION";
      transactionId: string;
      reason: string;
    }
  | {
      action: "CANCEL" | "REVOKE" | "REACTIVATE";
      reason: string;
    };

function statusFromBalance(
  initialAmountCents: number,
  balanceCents: number,
): GiftCardStatus {
  if (balanceCents <= 0) {
    return "USED";
  }

  if (balanceCents < initialAmountCents) {
    return "PARTIALLY_USED";
  }

  return "ACTIVE";
}

async function resolveGiftCard(reference: string) {
  const normalizedReference = reference.trim().toUpperCase();

  if (!normalizedReference || normalizedReference.length > 80) {
    throw new GiftCardServiceError("NOT_FOUND", "Carte cadeau introuvable.");
  }

  const giftCard = await prisma.giftCard.findUnique({
    where: {
      reference: normalizedReference,
    },
    select: {
      id: true,
      reference: true,
    },
  });

  if (!giftCard) {
    throw new GiftCardServiceError("NOT_FOUND", "Carte cadeau introuvable.");
  }

  return giftCard;
}

async function changeGiftCardStatus({
  giftCardId,
  actorId,
  action,
  reason,
}: {
  giftCardId: string;
  actorId: string;
  action: "CANCEL" | "REVOKE" | "REACTIVATE";
  reason: string;
}): Promise<void> {
  const parsed = giftCardAdminStatusActionSchema.parse({
    giftCardId,
    reason,
  });

  await prisma.$transaction(
    async (tx) => {
      const giftCard = await tx.giftCard.findUnique({
        where: {
          id: parsed.giftCardId,
        },
        select: {
          id: true,
          status: true,
          initialAmountCents: true,
          balanceCents: true,
          paidAt: true,
          expiresAt: true,
          version: true,
        },
      });

      if (!giftCard) {
        throw new GiftCardServiceError(
          "NOT_FOUND",
          "Carte cadeau introuvable.",
        );
      }

      const now = new Date();

      if (action === "CANCEL") {
        if (
          ![
            "PENDING_PAYMENT",
            "PAYMENT_FAILED",
            "ACTIVE",
            "PARTIALLY_USED",
          ].includes(giftCard.status)
        ) {
          throw new GiftCardServiceError(
            "INVALID_STATUS",
            "Cette carte cadeau ne peut pas être annulée dans son état actuel.",
          );
        }

        const update = await tx.giftCard.updateMany({
          where: {
            id: giftCard.id,
            version: giftCard.version,
            status: giftCard.status,
          },
          data: {
            status: "CANCELLED",
            cancelledAt: now,
            cancellationReason: parsed.reason,
            version: {
              increment: 1,
            },
          },
        });

        if (update.count !== 1) {
          throw new GiftCardServiceError(
            "CONFLICT",
            "La carte cadeau a été modifiée par une autre opération.",
          );
        }

        await tx.giftCardTransaction.create({
          data: {
            giftCardId: giftCard.id,
            type: "CANCELLED",
            amountCents: 0,
            balanceBeforeCents: giftCard.balanceCents,
            balanceAfterCents: giftCard.balanceCents,
            reason: parsed.reason,
            actorId,
            metadata: {
              source: "ADMIN",
              previousStatus: giftCard.status,
              nextStatus: "CANCELLED",
            },
          },
        });

        return;
      }

      if (action === "REVOKE") {
        if (!["ACTIVE", "PARTIALLY_USED", "USED"].includes(giftCard.status)) {
          throw new GiftCardServiceError(
            "INVALID_STATUS",
            "Cette carte cadeau ne peut pas être révoquée dans son état actuel.",
          );
        }

        const update = await tx.giftCard.updateMany({
          where: {
            id: giftCard.id,
            version: giftCard.version,
            status: giftCard.status,
          },
          data: {
            status: "REVOKED",
            revokedAt: now,
            revocationReason: parsed.reason,
            version: {
              increment: 1,
            },
          },
        });

        if (update.count !== 1) {
          throw new GiftCardServiceError(
            "CONFLICT",
            "La carte cadeau a été modifiée par une autre opération.",
          );
        }

        await tx.giftCardTransaction.create({
          data: {
            giftCardId: giftCard.id,
            type: "REVOKED",
            amountCents: 0,
            balanceBeforeCents: giftCard.balanceCents,
            balanceAfterCents: giftCard.balanceCents,
            reason: parsed.reason,
            actorId,
            metadata: {
              source: "ADMIN",
              previousStatus: giftCard.status,
              nextStatus: "REVOKED",
            },
          },
        });

        return;
      }

      if (!["CANCELLED", "REVOKED"].includes(giftCard.status)) {
        throw new GiftCardServiceError(
          "INVALID_STATUS",
          "Cette carte cadeau ne peut pas être réactivée dans son état actuel.",
        );
      }

      if (!giftCard.paidAt) {
        throw new GiftCardServiceError(
          "FORBIDDEN_OPERATION",
          "Une carte non payée ne peut pas être réactivée.",
        );
      }

      if (giftCard.expiresAt <= now) {
        throw new GiftCardServiceError(
          "EXPIRED",
          "Une carte expirée ne peut pas être réactivée.",
        );
      }

      const nextStatus = statusFromBalance(
        giftCard.initialAmountCents,
        giftCard.balanceCents,
      );

      const update = await tx.giftCard.updateMany({
        where: {
          id: giftCard.id,
          version: giftCard.version,
          status: giftCard.status,
        },
        data: {
          status: nextStatus,
          cancelledAt: null,
          cancellationReason: null,
          revokedAt: null,
          revocationReason: null,
          fullyUsedAt: nextStatus === "USED" ? now : null,
          version: {
            increment: 1,
          },
        },
      });

      if (update.count !== 1) {
        throw new GiftCardServiceError(
          "CONFLICT",
          "La carte cadeau a été modifiée par une autre opération.",
        );
      }

      await tx.giftCardTransaction.create({
        data: {
          giftCardId: giftCard.id,
          type: "REACTIVATED",
          amountCents: 0,
          balanceBeforeCents: giftCard.balanceCents,
          balanceAfterCents: giftCard.balanceCents,
          reason: parsed.reason,
          actorId,
          metadata: {
            source: "ADMIN",
            previousStatus: giftCard.status,
            nextStatus,
          },
        },
      });
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    },
  );
}

export async function executeAdminGiftCardMutation({
  reference,
  actorId,
  mutation,
}: {
  reference: string;
  actorId: string;
  mutation: AdminGiftCardMutation;
}): Promise<{
  success: true;
  message: string;
}> {
  const giftCard = await resolveGiftCard(reference);

  switch (mutation.action) {
    case "REDEEM": {
      const input = giftCardAdminRedemptionSchema.parse({
        giftCardId: giftCard.id,
        amountCents: mutation.amountCents,
        note: mutation.note,
      });

      await redeemGiftCardInStore(input, actorId);

      return {
        success: true,
        message: "Le débit a été enregistré.",
      };
    }

    case "REVERSE_REDEMPTION": {
      const input = giftCardAdminReversalSchema.parse({
        giftCardId: giftCard.id,
        transactionId: mutation.transactionId,
        reason: mutation.reason,
      });

      await reverseGiftCardRedemption(input, actorId);

      return {
        success: true,
        message: "Le débit a été annulé et le solde restauré.",
      };
    }

    case "CANCEL":
    case "REVOKE":
    case "REACTIVATE": {
      await changeGiftCardStatus({
        giftCardId: giftCard.id,
        actorId,
        action: mutation.action,
        reason: mutation.reason,
      });

      const messages = {
        CANCEL: "La carte cadeau a été annulée.",
        REVOKE: "La carte cadeau a été révoquée.",
        REACTIVATE: "La carte cadeau a été réactivée.",
      } as const;

      return {
        success: true,
        message: messages[mutation.action],
      };
    }
  }
}
