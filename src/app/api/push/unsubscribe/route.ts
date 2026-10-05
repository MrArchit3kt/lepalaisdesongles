import { NextResponse } from "next/server";
import { z } from "zod";

import { requireApiUser } from "@/lib/api-session";
import { prisma } from "@/lib/prisma";
import { isTrustedRequestOrigin } from "@/lib/security/request-origin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_REQUEST_BODY_BYTES = 2 * 1024;

const unsubscribeSchema = z.object({
  endpoint: z.string().trim().url().max(1024),
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

  if (!user) {
    return jsonResponse({ error: "Non authentifié." }, 401);
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

  const parsed = unsubscribeSchema.safeParse(rawBody);

  if (!parsed.success) {
    return jsonResponse({ error: "Abonnement invalide." }, 400);
  }

  // Un utilisateur ne peut supprimer qu'un abonnement qui lui
  // appartient : la clause userId est volontaire, pas seulement
  // l'endpoint.
  await prisma.pushSubscription.deleteMany({
    where: {
      endpoint: parsed.data.endpoint,
      userId: user.id,
    },
  });

  return jsonResponse({ success: true }, 200);
}
