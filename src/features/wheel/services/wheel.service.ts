import "server-only";

import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

import { getWheelSettings } from "@/features/wheel/services/wheel-settings.service";
import {
  drawWeightedSegment,
  generateWheelPromotionCode,
  generateWheelPromotionSlug,
  startOfDayParis,
} from "@/features/wheel/utils/wheel.utils";
import type {
  WheelEligibility,
  WheelSegmentPublic,
  WheelSpinResult,
  WheelSpinTrigger,
} from "@/features/wheel/types/wheel.types";

const MAX_UNIQUE_CODE_ATTEMPTS = 10;

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

type WheelServiceErrorCode =
  | "DISABLED"
  | "TRIGGER_DISABLED"
  | "ALREADY_SPUN"
  | "NO_SEGMENTS"
  | "APPOINTMENT_NOT_FOUND"
  | "APPOINTMENT_NOT_CONFIRMED"
  | "CONFLICT";

export class WheelServiceError extends Error {
  public readonly code: WheelServiceErrorCode;

  public constructor(code: WheelServiceErrorCode, message: string) {
    super(message);

    this.name = "WheelServiceError";
    this.code = code;
  }
}

export type WheelSpinInput =
  | { trigger: "DAILY" }
  | { trigger: "BOOKING"; appointmentId: string };

/* -------------------------------------------------------------------------- */
/*                                  HELPERS                                   */
/* -------------------------------------------------------------------------- */

function isPrismaUniqueConstraintError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

async function loadActiveSegmentsForDisplay(): Promise<WheelSegmentPublic[]> {
  const segments = await prisma.wheelSegment.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },

    select: {
      id: true,
      label: true,
      kind: true,
      colorHex: true,
      sortOrder: true,
      weight: true,
    },
  });

  return segments;
}

async function findExistingSpin(
  userId: string,
  input: WheelSpinInput,
) {
  if (input.trigger === "BOOKING") {
    return prisma.wheelSpin.findUnique({
      where: { appointmentId: input.appointmentId },
    });
  }

  return prisma.wheelSpin.findFirst({
    where: {
      userId,
      trigger: "DAILY",
      spunAt: { gte: startOfDayParis() },
    },
  });
}

async function assertBookingAppointmentReady(
  userId: string,
  appointmentId: string,
): Promise<void> {
  const appointment = await prisma.appointment.findFirst({
    where: { id: appointmentId, clientId: userId },
    select: { status: true },
  });

  if (!appointment) {
    throw new WheelServiceError(
      "APPOINTMENT_NOT_FOUND",
      "Ce rendez-vous est introuvable.",
    );
  }

  if (appointment.status !== "CONFIRMED") {
    throw new WheelServiceError(
      "APPOINTMENT_NOT_CONFIRMED",
      "Ce rendez-vous n'est pas encore confirmé.",
    );
  }
}

/* -------------------------------------------------------------------------- */
/*                                ÉLIGIBILITÉ                                 */
/* -------------------------------------------------------------------------- */

export async function getWheelEligibility(
  userId: string,
  input: WheelSpinInput,
): Promise<WheelEligibility> {
  const settings = await getWheelSettings();

  if (!settings.enabled) {
    return { eligible: false, reason: "DISABLED", segments: [] };
  }

  const triggerEnabled =
    input.trigger === "BOOKING"
      ? settings.bookingSpinEnabled
      : settings.dailySpinEnabled;

  if (!triggerEnabled) {
    return { eligible: false, reason: "TRIGGER_DISABLED", segments: [] };
  }

  if (input.trigger === "BOOKING") {
    await assertBookingAppointmentReady(userId, input.appointmentId);
  }

  const segments = await loadActiveSegmentsForDisplay();

  if (segments.length === 0) {
    return { eligible: false, reason: "NO_SEGMENTS", segments: [] };
  }

  const existingSpin = await findExistingSpin(userId, input);

  if (existingSpin) {
    return { eligible: false, reason: "ALREADY_SPUN", segments: [] };
  }

  return { eligible: true, reason: "OK", segments };
}

/* -------------------------------------------------------------------------- */
/*                                   TIRAGE                                   */
/* -------------------------------------------------------------------------- */

/*
 * Revalide tout côté serveur (jamais confiance en un état côté
 * client) puis effectue le tirage pondéré et persiste le résultat.
 * En cas de gain, génère un code de réduction unique sous forme
 * d'une Promotion classique (usageLimit: 1, sans PromotionService
 * associée donc valable sur toute prestation) — réutilise ainsi tel
 * quel le circuit de validation déjà en place sur la page de paiement
 * de l'acompte (`promotion-redemption.service.ts`).
 */
export async function spinWheel(
  userId: string,
  input: WheelSpinInput,
): Promise<WheelSpinResult> {
  const settings = await getWheelSettings();

  if (!settings.enabled) {
    throw new WheelServiceError("DISABLED", "La roue de la chance est désactivée.");
  }

  const triggerEnabled =
    input.trigger === "BOOKING"
      ? settings.bookingSpinEnabled
      : settings.dailySpinEnabled;

  if (!triggerEnabled) {
    throw new WheelServiceError(
      "TRIGGER_DISABLED",
      "Ce mode de tirage n'est pas activé.",
    );
  }

  if (input.trigger === "BOOKING") {
    await assertBookingAppointmentReady(userId, input.appointmentId);
  }

  const existingSpin = await findExistingSpin(userId, input);

  if (existingSpin) {
    throw new WheelServiceError(
      "ALREADY_SPUN",
      input.trigger === "BOOKING"
        ? "Vous avez déjà tourné la roue pour cette réservation."
        : "Vous avez déjà tourné la roue aujourd'hui, revenez demain !",
    );
  }

  const segments = await prisma.wheelSegment.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  if (segments.length === 0) {
    throw new WheelServiceError("NO_SEGMENTS", "Aucun lot n'est configuré.");
  }

  const chosen = drawWeightedSegment(segments);

  for (
    let attempt = 0;
    attempt < MAX_UNIQUE_CODE_ATTEMPTS;
    attempt += 1
  ) {
    try {
      return await prisma.$transaction(async (tx) => {
        if (chosen.kind === "LOSE") {
          await tx.wheelSpin.create({
            data: {
              userId,
              segmentId: chosen.id,
              trigger: input.trigger,

              appointmentId:
                input.trigger === "BOOKING" ? input.appointmentId : null,
            },
          });

          return {
            segmentId: chosen.id,
            label: chosen.label,
            kind: chosen.kind,
            won: false,
            code: null,
            expiresAt: null,
            percentageValue: null,
            amountCents: null,
          } satisfies WheelSpinResult;
        }

        const code = generateWheelPromotionCode();
        const now = new Date();

        const expiresAt = new Date(now);
        expiresAt.setUTCDate(
          expiresAt.getUTCDate() + settings.defaultValidityDays,
        );

        const promotion = await tx.promotion.create({
          data: {
            name: `Gain roue de la chance — ${chosen.label}`,
            slug: generateWheelPromotionSlug(code),
            type: chosen.kind,

            percentageValue:
              chosen.kind === "PERCENTAGE" ? chosen.percentageValue : null,

            amountCents:
              chosen.kind === "FIXED_AMOUNT" ? chosen.amountCents : null,

            code,
            startsAt: now,
            endsAt: expiresAt,
            usageLimit: 1,
            isActive: true,
            showOnHomepage: false,
          },

          select: { id: true },
        });

        await tx.wheelSpin.create({
          data: {
            userId,
            segmentId: chosen.id,
            trigger: input.trigger,
            promotionId: promotion.id,

            appointmentId:
              input.trigger === "BOOKING" ? input.appointmentId : null,
          },
        });

        await tx.notification.create({
          data: {
            userId,
            type: "PROMOTION",
            title: "Vous avez gagné à la roue de la chance !",

            message: `Vous avez gagné : ${chosen.label}. Code : ${code} (valable jusqu'au ${expiresAt.toLocaleDateString(
              "fr-FR",
            )}).`,

            actionUrl: "/reservation",
          },
        });

        return {
          segmentId: chosen.id,
          label: chosen.label,
          kind: chosen.kind,
          won: true,
          code,
          expiresAt: expiresAt.toISOString(),
          percentageValue: chosen.percentageValue,
          amountCents: chosen.amountCents,
        } satisfies WheelSpinResult;
      });
    } catch (error: unknown) {
      if (isPrismaUniqueConstraintError(error)) {
        if (input.trigger === "BOOKING") {
          const raceSpin = await prisma.wheelSpin.findUnique({
            where: { appointmentId: input.appointmentId },
          });

          if (raceSpin) {
            throw new WheelServiceError(
              "ALREADY_SPUN",
              "Vous avez déjà tourné la roue pour cette réservation.",
            );
          }
        }

        // Collision sur le code promo généré aléatoirement : on
        // retente avec un nouveau code.
        continue;
      }

      throw error;
    }
  }

  throw new WheelServiceError(
    "CONFLICT",
    "Impossible de générer un code unique, réessayez.",
  );
}

export type { WheelSpinTrigger };
