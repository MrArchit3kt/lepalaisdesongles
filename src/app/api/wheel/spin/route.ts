import { NextResponse } from "next/server";

import {
  getWheelEligibility,
  spinWheel,
  WheelServiceError,
  type WheelSpinInput,
} from "@/features/wheel/services/wheel.service";
import { requireApiUser } from "@/lib/api-session";
import { prisma } from "@/lib/prisma";
import {
  consumeSecurityRateLimit,
  getClientIpAddress,
} from "@/lib/security/rate-limit";
import { isTrustedRequestOrigin } from "@/lib/security/request-origin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_REQUEST_BODY_BYTES = 2 * 1024;
const MAX_REFERENCE_LENGTH = 80;

// Un tirage n'a pas de valeur à deviner comme un code promo, mais on
// limite quand même le débit pour éviter tout abus/spam de tirages.
const ACCOUNT_MAX_ATTEMPTS = 20;
const ACCOUNT_WINDOW_MS = 15 * 60 * 1000;
const ACCOUNT_BLOCK_MS = 15 * 60 * 1000;

const IP_MAX_ATTEMPTS = 60;
const IP_WINDOW_MS = 15 * 60 * 1000;
const IP_BLOCK_MS = 15 * 60 * 1000;

function jsonResponse(body: Record<string, unknown>, status: number) {
  return NextResponse.json(body, {
    status,

    headers: {
      "Cache-Control":
        "private, no-store, no-cache, max-age=0, must-revalidate",
    },
  });
}

function errorStatus(error: WheelServiceError): number {
  if (error.code === "APPOINTMENT_NOT_FOUND") {
    return 404;
  }

  if (error.code === "DISABLED" || error.code === "TRIGGER_DISABLED") {
    return 403;
  }

  return 400;
}

async function resolveWheelSpinInput(
  request: Request,
  userId: string,
): Promise<
  | { ok: true; input: WheelSpinInput }
  | { ok: false; response: NextResponse }
> {
  const url = new URL(request.url);
  const trigger = url.searchParams.get("trigger");

  if (trigger === "DAILY") {
    return { ok: true, input: { trigger: "DAILY" } };
  }

  if (trigger === "BOOKING") {
    const reference = url.searchParams
      .get("appointmentReference")
      ?.trim();

    if (!reference || reference.length > MAX_REFERENCE_LENGTH) {
      return {
        ok: false,
        response: jsonResponse(
          { error: "Rendez-vous invalide." },
          400,
        ),
      };
    }

    const appointment = await prisma.appointment.findFirst({
      where: { reference, clientId: userId },
      select: { id: true },
    });

    if (!appointment) {
      return {
        ok: false,
        response: jsonResponse(
          { error: "Ce rendez-vous est introuvable." },
          404,
        ),
      };
    }

    return {
      ok: true,
      input: { trigger: "BOOKING", appointmentId: appointment.id },
    };
  }

  return {
    ok: false,
    response: jsonResponse({ error: "Déclencheur invalide." }, 400),
  };
}

/* -------------------------------------------------------------------------- */
/*                                  ÉLIGIBILITÉ                               */
/* -------------------------------------------------------------------------- */

export async function GET(request: Request) {
  const { user, response } = await requireApiUser();

  if (response) {
    return response;
  }

  if (!user || user.role !== "CLIENT") {
    return jsonResponse({ eligible: false, reason: "DISABLED", segments: [] }, 200);
  }

  const resolved = await resolveWheelSpinInput(request, user.id);

  if (!resolved.ok) {
    return resolved.response;
  }

  const eligibility = await getWheelEligibility(user.id, resolved.input);

  return jsonResponse({ ...eligibility }, 200);
}

/* -------------------------------------------------------------------------- */
/*                                    TIRAGE                                  */
/* -------------------------------------------------------------------------- */

export async function POST(request: Request) {
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
      { error: "Votre compte ne peut pas utiliser la roue de la chance." },
      403,
    );
  }

  const ipAddress = getClientIpAddress(request.headers);

  const [accountRateLimit, ipRateLimit] = await Promise.all([
    consumeSecurityRateLimit({
      action: "WHEEL_SPIN_ACCOUNT",
      subject: user.id,
      maxAttempts: ACCOUNT_MAX_ATTEMPTS,
      windowMs: ACCOUNT_WINDOW_MS,
      blockMs: ACCOUNT_BLOCK_MS,
    }),

    consumeSecurityRateLimit({
      action: "WHEEL_SPIN_IP",
      subject: ipAddress,
      maxAttempts: IP_MAX_ATTEMPTS,
      windowMs: IP_WINDOW_MS,
      blockMs: IP_BLOCK_MS,
    }),
  ]);

  if (!accountRateLimit.allowed || !ipRateLimit.allowed) {
    return jsonResponse(
      { error: "Trop de tentatives. Réessayez plus tard.", code: "RATE_LIMITED" },
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

  const trigger =
    typeof body === "object" && body !== null && "trigger" in body
      ? (body as { trigger: unknown }).trigger
      : null;

  const appointmentReference =
    typeof body === "object" && body !== null && "appointmentReference" in body
      ? (body as { appointmentReference: unknown }).appointmentReference
      : null;

  let input: WheelSpinInput;

  if (trigger === "DAILY") {
    input = { trigger: "DAILY" };
  } else if (
    trigger === "BOOKING" &&
    typeof appointmentReference === "string" &&
    appointmentReference.trim() &&
    appointmentReference.length <= MAX_REFERENCE_LENGTH
  ) {
    const appointment = await prisma.appointment.findFirst({
      where: {
        reference: appointmentReference.trim(),
        clientId: user.id,
      },

      select: { id: true },
    });

    if (!appointment) {
      return jsonResponse({ error: "Ce rendez-vous est introuvable." }, 404);
    }

    input = { trigger: "BOOKING", appointmentId: appointment.id };
  } else {
    return jsonResponse({ error: "Déclencheur invalide." }, 400);
  }

  try {
    const result = await spinWheel(user.id, input);

    return jsonResponse({ success: true, ...result }, 200);
  } catch (error: unknown) {
    if (error instanceof WheelServiceError) {
      return jsonResponse(
        { error: error.message, code: error.code },
        errorStatus(error),
      );
    }

    console.error("[WHEEL_SPIN]", error);

    return jsonResponse(
      { error: "Impossible de faire tourner la roue." },
      500,
    );
  }
}
