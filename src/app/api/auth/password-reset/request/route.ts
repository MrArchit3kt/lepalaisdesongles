import { NextResponse } from "next/server";

import { requestPasswordReset } from "@/features/auth/services/password-reset.service";
import { requestPasswordResetSchema } from "@/features/auth/schemas/password-reset.schema";
import {
  consumeSecurityRateLimit,
  getClientIpAddress,
} from "@/lib/security/rate-limit";
import { isTrustedRequestOrigin } from "@/lib/security/request-origin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_REQUEST_BODY_BYTES = 2 * 1024;

const IP_MAX_ATTEMPTS = 10;
const IP_WINDOW_MS = 60 * 60 * 1000;
const IP_BLOCK_MS = 60 * 60 * 1000;

// Empêche aussi de bombarder une même adresse de liens de
// réinitialisation, indépendamment de l'IP d'origine.
const EMAIL_MAX_ATTEMPTS = 5;
const EMAIL_WINDOW_MS = 60 * 60 * 1000;
const EMAIL_BLOCK_MS = 60 * 60 * 1000;

function jsonResponse(body: Record<string, unknown>, status: number) {
  return NextResponse.json(body, {
    status,

    headers: {
      "Cache-Control":
        "private, no-store, no-cache, max-age=0, must-revalidate",
    },
  });
}

// Réponse volontairement identique dans tous les cas (compte
// existant ou non) pour ne pas permettre l'énumération des adresses
// e-mail inscrites.
const GENERIC_SUCCESS_MESSAGE =
  "Si un compte existe avec cette adresse e-mail, un lien de réinitialisation vient de lui être envoyé.";

export async function POST(request: Request) {
  if (!isTrustedRequestOrigin(request)) {
    return jsonResponse(
      { error: "L’origine de la requête n’est pas autorisée." },
      403,
    );
  }

  const ipAddress = getClientIpAddress(request.headers);

  const ipRateLimit = await consumeSecurityRateLimit({
    action: "PASSWORD_RESET_REQUEST_IP",
    subject: ipAddress,
    maxAttempts: IP_MAX_ATTEMPTS,
    windowMs: IP_WINDOW_MS,
    blockMs: IP_BLOCK_MS,
  });

  if (!ipRateLimit.allowed) {
    return jsonResponse(
      { success: true, message: GENERIC_SUCCESS_MESSAGE },
      202,
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

  const parsed = requestPasswordResetSchema.safeParse(rawBody);

  if (!parsed.success) {
    // Même réponse générique : un e-mail mal formé ne doit pas non
    // plus laisser deviner la validité du compte.
    return jsonResponse(
      { success: true, message: GENERIC_SUCCESS_MESSAGE },
      202,
    );
  }

  const emailRateLimit = await consumeSecurityRateLimit({
    action: "PASSWORD_RESET_REQUEST_EMAIL",
    subject: parsed.data.email.toLowerCase(),
    maxAttempts: EMAIL_MAX_ATTEMPTS,
    windowMs: EMAIL_WINDOW_MS,
    blockMs: EMAIL_BLOCK_MS,
  });

  if (emailRateLimit.allowed) {
    try {
      await requestPasswordReset(parsed.data.email);
    } catch (error: unknown) {
      console.error("[PASSWORD_RESET_REQUEST]", error);
    }
  }

  return jsonResponse(
    { success: true, message: GENERIC_SUCCESS_MESSAGE },
    202,
  );
}
