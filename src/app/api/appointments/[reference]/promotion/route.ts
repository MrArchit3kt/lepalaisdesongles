import { NextResponse } from "next/server";

import {
  applyPromotionCode,
  removePromotionCode,
  PromotionRedemptionError,
} from "@/features/booking/services/promotion-redemption.service";
import { requireApiUser } from "@/lib/api-session";
import { prisma } from "@/lib/prisma";
import {
  consumeSecurityRateLimit,
  getClientIpAddress,
} from "@/lib/security/rate-limit";
import { isTrustedRequestOrigin } from "@/lib/security/request-origin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ reference: string }>;
};

const MAX_REQUEST_BODY_BYTES = 4 * 1024;
const MAX_CODE_LENGTH = 64;

// Un code promo se devine par tâtonnement : on limite sévèrement le
// nombre de tentatives, par compte et par IP.
const ACCOUNT_MAX_ATTEMPTS = 10;
const ACCOUNT_WINDOW_MS = 15 * 60 * 1000;
const ACCOUNT_BLOCK_MS = 30 * 60 * 1000;

const IP_MAX_ATTEMPTS = 30;
const IP_WINDOW_MS = 15 * 60 * 1000;
const IP_BLOCK_MS = 30 * 60 * 1000;

function jsonResponse(body: Record<string, unknown>, status: number) {
  return NextResponse.json(body, {
    status,

    headers: {
      "Cache-Control": "private, no-store, no-cache, max-age=0, must-revalidate",
    },
  });
}

async function resolveAppointmentId(
  reference: string,
  clientId: string,
): Promise<string | null> {
  const cleanReference = reference.trim();

  if (!cleanReference || cleanReference.length > 80) {
    return null;
  }

  const appointment = await prisma.appointment.findFirst({
    where: {
      reference: cleanReference,
      clientId,
    },

    select: { id: true },
  });

  return appointment?.id ?? null;
}

function errorStatus(error: PromotionRedemptionError): number {
  if (error.code === "APPOINTMENT_NOT_FOUND") {
    return 404;
  }

  return 400;
}

/* -------------------------------------------------------------------------- */
/*                          APPLIQUER UN CODE PROMO                           */
/* -------------------------------------------------------------------------- */

export async function POST(request: Request, context: RouteContext) {
  if (!isTrustedRequestOrigin(request)) {
    return jsonResponse(
      { error: "L’origine de la requête n’est pas autorisée." },
      403,
    );
  }

  const { user, response } = await requireApiUser();

  if (response) {
    return response;
  }

  if (!user || user.role !== "CLIENT") {
    return jsonResponse(
      { error: "Votre compte ne peut pas utiliser de code promo." },
      403,
    );
  }

  const ipAddress = getClientIpAddress(request.headers);

  const [accountRateLimit, ipRateLimit] = await Promise.all([
    consumeSecurityRateLimit({
      action: "PROMOTION_CODE_APPLY_ACCOUNT",
      subject: user.id,
      maxAttempts: ACCOUNT_MAX_ATTEMPTS,
      windowMs: ACCOUNT_WINDOW_MS,
      blockMs: ACCOUNT_BLOCK_MS,
    }),

    consumeSecurityRateLimit({
      action: "PROMOTION_CODE_APPLY_IP",
      subject: ipAddress,
      maxAttempts: IP_MAX_ATTEMPTS,
      windowMs: IP_WINDOW_MS,
      blockMs: IP_BLOCK_MS,
    }),
  ]);

  if (!accountRateLimit.allowed || !ipRateLimit.allowed) {
    return jsonResponse(
      {
        error: "Trop de tentatives. Réessayez plus tard.",
        code: "RATE_LIMITED",
      },
      429,
    );
  }

  const bodyText = await request.text();

  if (Buffer.byteLength(bodyText, "utf8") > MAX_REQUEST_BODY_BYTES) {
    return jsonResponse({ error: "La requête envoyée est invalide." }, 413);
  }

  let body: unknown;

  try {
    body = bodyText ? JSON.parse(bodyText) : {};
  } catch {
    return jsonResponse({ error: "Le formulaire envoyé est invalide." }, 400);
  }

  const rawCode =
    typeof body === "object" && body !== null && "code" in body
      ? (body as { code: unknown }).code
      : null;

  if (typeof rawCode !== "string" || rawCode.trim().length === 0) {
    return jsonResponse({ error: "Veuillez saisir un code promo." }, 400);
  }

  if (rawCode.length > MAX_CODE_LENGTH) {
    return jsonResponse({ error: "Ce code promo est invalide." }, 400);
  }

  const { reference } = await context.params;

  const appointmentId = await resolveAppointmentId(reference, user.id);

  if (!appointmentId) {
    return jsonResponse({ error: "Ce rendez-vous est introuvable." }, 404);
  }

  try {
    const result = await applyPromotionCode(appointmentId, user.id, rawCode);

    return jsonResponse({ success: true, ...result }, 200);
  } catch (error: unknown) {
    if (error instanceof PromotionRedemptionError) {
      return jsonResponse(
        { error: error.message, code: error.code },
        errorStatus(error),
      );
    }

    console.error("[PROMOTION_CODE_APPLY]", error);

    return jsonResponse(
      { error: "Impossible d’appliquer ce code promo." },
      400,
    );
  }
}

/* -------------------------------------------------------------------------- */
/*                            RETIRER UN CODE PROMO                           */
/* -------------------------------------------------------------------------- */

export async function DELETE(request: Request, context: RouteContext) {
  if (!isTrustedRequestOrigin(request)) {
    return jsonResponse(
      { error: "L’origine de la requête n’est pas autorisée." },
      403,
    );
  }

  const { user, response } = await requireApiUser();

  if (response) {
    return response;
  }

  if (!user || user.role !== "CLIENT") {
    return jsonResponse(
      { error: "Votre compte ne peut pas utiliser de code promo." },
      403,
    );
  }

  const { reference } = await context.params;

  const appointmentId = await resolveAppointmentId(reference, user.id);

  if (!appointmentId) {
    return jsonResponse({ error: "Ce rendez-vous est introuvable." }, 404);
  }

  try {
    const result = await removePromotionCode(appointmentId, user.id);

    return jsonResponse({ success: true, ...result }, 200);
  } catch (error: unknown) {
    if (error instanceof PromotionRedemptionError) {
      return jsonResponse(
        { error: error.message, code: error.code },
        errorStatus(error),
      );
    }

    console.error("[PROMOTION_CODE_REMOVE]", error);

    return jsonResponse(
      { error: "Impossible de retirer ce code promo." },
      400,
    );
  }
}
