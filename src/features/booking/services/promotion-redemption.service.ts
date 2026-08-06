import "server-only";

import { AppointmentStatus, PaymentStatus } from "@/generated/prisma/client";
import { loadAppointmentEmailContext } from "@/features/notifications/services/appointment-email-context.service";
import { sendAppointmentEmail } from "@/features/notifications/services/appointment-email.service";
import { prisma } from "@/lib/prisma";

import { calculateRequiredPaymentCents } from "../utils/booking-rules";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

type PromotionRedemptionErrorCode =
  | "APPOINTMENT_NOT_FOUND"
  | "APPOINTMENT_NOT_EDITABLE"
  | "CODE_REQUIRED"
  | "CODE_NOT_FOUND"
  | "CODE_NOT_APPLICABLE"
  | "NO_CODE_APPLIED";

export class PromotionRedemptionError extends Error {
  public readonly code: PromotionRedemptionErrorCode;

  public constructor(code: PromotionRedemptionErrorCode, message: string) {
    super(message);

    this.name = "PromotionRedemptionError";
    this.code = code;
  }
}

export type PromotionRedemptionResult = {
  totalPriceCents: number;
  depositCents: number;
  discountCents: number;
  promotionName: string | null;

  /*
   * true si la réduction couvre entièrement l'acompte : le rendez-vous
   * a été confirmé immédiatement, sans passer par PayPal.
   */
  fullyCovered: boolean;
};

/* -------------------------------------------------------------------------- */
/*                                  HELPERS                                   */
/* -------------------------------------------------------------------------- */

const EDITABLE_APPOINTMENT_ERROR =
  "Ce rendez-vous ne peut plus être modifié (déjà payé, annulé ou expiré).";

function getSiteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.NEXTAUTH_URL?.trim() ||
    "https://lepalaisdesongles.fr"
  ).replace(/\/+$/, "");
}

async function loadEditableAppointment(
  appointmentId: string,
  clientId: string,
) {
  const appointment = await prisma.appointment.findFirst({
    where: {
      id: appointmentId,
      clientId,
    },

    select: {
      id: true,
      reference: true,
      status: true,
      paymentStatus: true,
      startsAt: true,
      totalPriceCents: true,
      depositCents: true,
      discountCents: true,
      promotionId: true,

      services: {
        select: { serviceId: true },
      },
    },
  });

  if (!appointment) {
    throw new PromotionRedemptionError(
      "APPOINTMENT_NOT_FOUND",
      "Ce rendez-vous est introuvable.",
    );
  }

  if (
    appointment.status !== AppointmentStatus.PENDING ||
    appointment.paymentStatus === PaymentStatus.PAID
  ) {
    throw new PromotionRedemptionError(
      "APPOINTMENT_NOT_EDITABLE",
      EDITABLE_APPOINTMENT_ERROR,
    );
  }

  return appointment;
}

async function sendFullyCoveredConfirmationEmail(
  appointmentId: string,
  startsAt: Date,
  reference: string,
): Promise<void> {
  try {
    const context = await loadAppointmentEmailContext(appointmentId);

    const siteUrl = getSiteUrl();

    await sendAppointmentEmail({
      kind: "BOOKING_CONFIRMED",

      recipientEmail: context.recipientEmail,
      recipientName: context.recipientName,

      appointmentReference: reference,
      startsAt: startsAt.toISOString(),

      serviceNames: context.serviceNames,
      staffName: context.staffName,

      manageUrl: `${siteUrl}/espace-client/rendez-vous/${encodeURIComponent(
        reference,
      )}`,
    });
  } catch (reason: unknown) {
    console.error("[PROMOTION_REDEMPTION_CONFIRMATION_EMAIL]", reason);
  }
}

/* -------------------------------------------------------------------------- */
/*                          APPLICATION D'UN CODE PROMO                       */
/* -------------------------------------------------------------------------- */

/*
 * Applique un code promo sur la page de paiement de l'acompte d'un
 * rendez-vous encore PENDING : recalcule le prix total et l'acompte
 * dû en conséquence. Si la réduction couvre entièrement l'acompte, le
 * rendez-vous est confirmé immédiatement (aucun paiement en ligne à
 * effectuer).
 *
 * Remplace tout code déjà appliqué sur ce rendez-vous.
 */
export async function applyPromotionCode(
  appointmentId: string,
  clientId: string,
  rawCode: string,
): Promise<PromotionRedemptionResult> {
  const code = rawCode.trim().toUpperCase();

  if (!code) {
    throw new PromotionRedemptionError(
      "CODE_REQUIRED",
      "Veuillez saisir un code promo.",
    );
  }

  const appointment = await loadEditableAppointment(appointmentId, clientId);

  // Prix d'origine, avant toute réduction déjà appliquée : on la
  // remplace entièrement plutôt que de cumuler les codes.
  const originalTotalPriceCents =
    appointment.totalPriceCents + appointment.discountCents;

  const promotion = await prisma.promotion.findUnique({
    where: { code },

    select: {
      id: true,
      name: true,
      type: true,
      percentageValue: true,
      amountCents: true,
      startsAt: true,
      endsAt: true,
      usageLimit: true,
      usageCount: true,
      perClientLimit: true,
      minimumSpendCents: true,
      isActive: true,

      services: {
        select: { serviceId: true },
      },
    },
  });

  if (!promotion) {
    throw new PromotionRedemptionError(
      "CODE_NOT_FOUND",
      "Ce code promo n'existe pas.",
    );
  }

  const now = new Date();

  if (!promotion.isActive) {
    throw new PromotionRedemptionError(
      "CODE_NOT_APPLICABLE",
      "Ce code promo n'est plus actif.",
    );
  }

  if (now < promotion.startsAt || now > promotion.endsAt) {
    throw new PromotionRedemptionError(
      "CODE_NOT_APPLICABLE",
      "Ce code promo n'est pas (ou plus) valide.",
    );
  }

  if (promotion.type !== "PERCENTAGE" && promotion.type !== "FIXED_AMOUNT") {
    throw new PromotionRedemptionError(
      "CODE_NOT_APPLICABLE",
      "Ce code promo ne peut pas être appliqué en ligne. Contactez le salon.",
    );
  }

  if (
    promotion.usageLimit !== null &&
    promotion.usageCount >= promotion.usageLimit
  ) {
    throw new PromotionRedemptionError(
      "CODE_NOT_APPLICABLE",
      "Ce code promo a atteint sa limite d'utilisation.",
    );
  }

  if (promotion.services.length > 0) {
    const eligibleServiceIds = new Set(
      promotion.services.map((service) => service.serviceId),
    );

    const isFullyCovered = appointment.services.every((service) =>
      eligibleServiceIds.has(service.serviceId),
    );

    if (!isFullyCovered) {
      throw new PromotionRedemptionError(
        "CODE_NOT_APPLICABLE",
        "Ce code promo ne s'applique pas aux prestations de ce rendez-vous.",
      );
    }
  }

  if (
    promotion.minimumSpendCents !== null &&
    originalTotalPriceCents < promotion.minimumSpendCents
  ) {
    throw new PromotionRedemptionError(
      "CODE_NOT_APPLICABLE",
      `Ce code promo nécessite un montant minimum de ${(
        promotion.minimumSpendCents / 100
      )
        .toFixed(2)
        .replace(".", ",")} €.`,
    );
  }

  if (promotion.perClientLimit !== null) {
    const clientUsageCount = await prisma.appointment.count({
      where: {
        clientId,
        promotionId: promotion.id,
        id: { not: appointment.id },

        status: {
          notIn: [
            AppointmentStatus.CANCELLED_BY_CLIENT,
            AppointmentStatus.CANCELLED_BY_ADMIN,
            AppointmentStatus.REFUSED,
            AppointmentStatus.EXPIRED,
          ],
        },
      },
    });

    if (clientUsageCount >= promotion.perClientLimit) {
      throw new PromotionRedemptionError(
        "CODE_NOT_APPLICABLE",
        "Vous avez déjà utilisé ce code promo le nombre maximal de fois autorisé.",
      );
    }
  }

  const rawDiscountCents =
    promotion.type === "PERCENTAGE"
      ? Math.round(
          (originalTotalPriceCents * (promotion.percentageValue ?? 0)) / 100,
        )
      : (promotion.amountCents ?? 0);

  const discountCents = Math.max(
    0,
    Math.min(rawDiscountCents, originalTotalPriceCents),
  );

  const newTotalPriceCents = originalTotalPriceCents - discountCents;

  const newDepositCents = calculateRequiredPaymentCents(newTotalPriceCents);

  const fullyCovered = newDepositCents <= 0;

  await prisma.$transaction(async (tx) => {
    if (appointment.promotionId && appointment.promotionId !== promotion.id) {
      await tx.promotion.update({
        where: { id: appointment.promotionId },
        data: { usageCount: { decrement: 1 } },
      });
    }

    if (appointment.promotionId !== promotion.id) {
      await tx.promotion.update({
        where: { id: promotion.id },
        data: { usageCount: { increment: 1 } },
      });
    }

    await tx.appointment.update({
      where: { id: appointment.id },

      data: {
        totalPriceCents: newTotalPriceCents,
        depositCents: newDepositCents,
        promotionId: promotion.id,
        discountCents,

        ...(fullyCovered
          ? {
              status: AppointmentStatus.CONFIRMED,
              paymentStatus: PaymentStatus.NOT_REQUIRED,
              confirmedAt: now,
              expiresAt: null,
            }
          : {}),
      },
    });
  });

  if (fullyCovered) {
    await sendFullyCoveredConfirmationEmail(
      appointment.id,
      appointment.startsAt,
      appointment.reference,
    );
  }

  return {
    totalPriceCents: newTotalPriceCents,
    depositCents: newDepositCents,
    discountCents,
    promotionName: promotion.name,
    fullyCovered,
  };
}

/* -------------------------------------------------------------------------- */
/*                            RETRAIT D'UN CODE PROMO                         */
/* -------------------------------------------------------------------------- */

export async function removePromotionCode(
  appointmentId: string,
  clientId: string,
): Promise<PromotionRedemptionResult> {
  const appointment = await loadEditableAppointment(appointmentId, clientId);

  if (!appointment.promotionId) {
    throw new PromotionRedemptionError(
      "NO_CODE_APPLIED",
      "Aucun code promo n'est appliqué à ce rendez-vous.",
    );
  }

  const originalTotalPriceCents =
    appointment.totalPriceCents + appointment.discountCents;

  const newDepositCents = calculateRequiredPaymentCents(
    originalTotalPriceCents,
  );

  await prisma.$transaction([
    prisma.promotion.update({
      where: { id: appointment.promotionId },
      data: { usageCount: { decrement: 1 } },
    }),

    prisma.appointment.update({
      where: { id: appointment.id },

      data: {
        totalPriceCents: originalTotalPriceCents,
        depositCents: newDepositCents,
        promotionId: null,
        discountCents: 0,
      },
    }),
  ]);

  return {
    totalPriceCents: originalTotalPriceCents,
    depositCents: newDepositCents,
    discountCents: 0,
    promotionName: null,
    fullyCovered: false,
  };
}
