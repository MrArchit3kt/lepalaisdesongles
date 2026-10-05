import { NextResponse } from "next/server";
import { z } from "zod";

import { requireApiUser } from "@/lib/api-session";
import { prisma } from "@/lib/prisma";
import { consumeSecurityRateLimit } from "@/lib/security/rate-limit";
import { isTrustedRequestOrigin } from "@/lib/security/request-origin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_REQUEST_BODY_BYTES = 4 * 1024;

const ACCOUNT_MAX_ATTEMPTS = 20;
const ACCOUNT_WINDOW_MS = 15 * 60 * 1000;
const ACCOUNT_BLOCK_MS = 15 * 60 * 1000;

const subscriptionSchema = z.object({
  endpoint: z.string().trim().url().max(1024),

  keys: z.object({
    p256dh: z.string().trim().min(1).max(512),
    auth: z.string().trim().min(1).max(512),
  }),
});

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

  const { user, response } = await requireApiUser();

  if (response) {
    return response;
  }

  if (!user || user.role !== "CLIENT") {
    return jsonResponse(
      { error: "Votre compte ne peut pas activer les notifications push." },
      403,
    );
  }

  const rateLimit = await consumeSecurityRateLimit({
    action: "PUSH_SUBSCRIBE_ACCOUNT",
    subject: user.id,
    maxAttempts: ACCOUNT_MAX_ATTEMPTS,
    windowMs: ACCOUNT_WINDOW_MS,
    blockMs: ACCOUNT_BLOCK_MS,
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

  const parsed = subscriptionSchema.safeParse(rawBody);

  if (!parsed.success) {
    return jsonResponse({ error: "Abonnement push invalide." }, 400);
  }

  const userAgent = request.headers.get("user-agent")?.slice(0, 255) ?? null;

  await prisma.pushSubscription.upsert({
    where: { endpoint: parsed.data.endpoint },

    create: {
      userId: user.id,
      endpoint: parsed.data.endpoint,
      p256dh: parsed.data.keys.p256dh,
      auth: parsed.data.keys.auth,
      userAgent,
    },

    update: {
      userId: user.id,
      p256dh: parsed.data.keys.p256dh,
      auth: parsed.data.keys.auth,
      userAgent,
      lastUsedAt: new Date(),
    },
  });

  return jsonResponse({ success: true }, 200);
}
