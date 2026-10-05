import { NextResponse } from "next/server";

import {
  PasswordResetError,
  resetPassword,
} from "@/features/auth/services/password-reset.service";
import { resetPasswordSchema } from "@/features/auth/schemas/password-reset.schema";
import {
  consumeSecurityRateLimit,
  getClientIpAddress,
} from "@/lib/security/rate-limit";
import { isTrustedRequestOrigin } from "@/lib/security/request-origin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_REQUEST_BODY_BYTES = 4 * 1024;

const IP_MAX_ATTEMPTS = 20;
const IP_WINDOW_MS = 60 * 60 * 1000;
const IP_BLOCK_MS = 60 * 60 * 1000;

function jsonResponse(body: Record<string, unknown>, status: number) {
  return NextResponse.json(body, {
    status,

    headers: {
      "Cache-Control":
        "private, no-store, no-cache, max-age=0, must-revalidate",
    },
  });
}

export async function POST(request: Request) {
  if (!isTrustedRequestOrigin(request)) {
    return jsonResponse(
      { error: "L’origine de la requête n’est pas autorisée." },
      403,
    );
  }

  const ipAddress = getClientIpAddress(request.headers);

  const rateLimit = await consumeSecurityRateLimit({
    action: "PASSWORD_RESET_CONFIRM_IP",
    subject: ipAddress,
    maxAttempts: IP_MAX_ATTEMPTS,
    windowMs: IP_WINDOW_MS,
    blockMs: IP_BLOCK_MS,
  });

  if (!rateLimit.allowed) {
    return jsonResponse(
      { error: "Trop de tentatives. Réessayez plus tard.", code: "RATE_LIMITED" },
      429,
    );
  }

  const bodyText = await request.text();

  if (Buffer.byteLength(bodyText, "utf8") > MAX_REQUEST_BODY_BYTES) {
    return jsonResponse({ error: "La requête envoyée est invalide." }, 413);
  }

  let rawBody: unknown;

  try {
    rawBody = bodyText ? JSON.parse(bodyText) : null;
  } catch {
    return jsonResponse({ error: "Le formulaire envoyé est invalide." }, 400);
  }

  const parsed = resetPasswordSchema.safeParse(rawBody);

  if (!parsed.success) {
    return jsonResponse(
      {
        error: "Certaines informations sont incorrectes.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
      422,
    );
  }

  try {
    await resetPassword(parsed.data.token, parsed.data.password);

    return jsonResponse(
      { success: true, message: "Votre mot de passe a été mis à jour." },
      200,
    );
  } catch (error: unknown) {
    if (error instanceof PasswordResetError) {
      return jsonResponse({ error: error.message, code: error.code }, 400);
    }

    console.error("[PASSWORD_RESET_CONFIRM]", error);

    return jsonResponse(
      { error: "Impossible de réinitialiser le mot de passe." },
      500,
    );
  }
}
