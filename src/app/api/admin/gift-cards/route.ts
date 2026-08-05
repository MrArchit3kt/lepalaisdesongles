import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

import { createAdminGiftCard } from "@/features/admin/gift-cards/services/admin-gift-card-create.service";
import { GiftCardServiceError } from "@/features/gift-cards/services/gift-card.service";
import { authOptions } from "@/lib/auth";
import { isTrustedRequestOrigin } from "@/lib/security/request-origin";

export const runtime = "nodejs";

export const dynamic = "force-dynamic";

type SessionUser = {
  id?: string;
  role?: string;
};

const PRIVATE_NO_STORE_HEADERS = {
  "Cache-Control": "private, no-store, no-cache, max-age=0, must-revalidate",
};

function jsonResponse(
  body: Record<string, unknown>,
  status = 200,
): NextResponse {
  return NextResponse.json(body, {
    status,
    headers: PRIVATE_NO_STORE_HEADERS,
  });
}

function getGiftCardErrorStatus(error: GiftCardServiceError): number {
  switch (error.code) {
    case "FORBIDDEN_OPERATION":
      return 403;

    case "CONFLICT":
      return 409;

    case "INVALID_AMOUNT":
    case "INVALID_STATUS":
    case "EXPIRED":
      return 422;

    case "NOT_FOUND":
      return 404;

    default:
      return 400;
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    if (!isTrustedRequestOrigin(request)) {
      return jsonResponse(
        {
          success: false,

          error: "L’origine de la requête n’est pas autorisée.",
        },
        403,
      );
    }

    const session = await getServerSession(authOptions);

    const user = session?.user as SessionUser | undefined;

    if (
      !user?.id ||
      !["SUPER_ADMIN", "ADMIN", "STAFF"].includes(user.role ?? "")
    ) {
      return jsonResponse(
        {
          success: false,

          error: "Accès administrateur refusé.",
        },
        403,
      );
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return jsonResponse(
        {
          success: false,

          error: "Le formulaire envoyé est invalide.",
        },
        400,
      );
    }

    const giftCard = await createAdminGiftCard(body, user.id);

    return jsonResponse(
      {
        success: true,

        message: "La carte cadeau a été créée et activée.",

        giftCard: {
          id: giftCard.id,

          reference: giftCard.reference,

          code: giftCard.code,

          amountCents: giftCard.amountCents,

          balanceCents: giftCard.balanceCents,

          expiresAt: giftCard.expiresAt.toISOString(),
        },
      },
      201,
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return jsonResponse(
        {
          success: false,

          error:
            error.issues[0]?.message ??
            "Les informations saisies sont invalides.",

          issues: error.flatten(),
        },
        400,
      );
    }

    if (error instanceof GiftCardServiceError) {
      return jsonResponse(
        {
          success: false,

          error: error.message,

          code: error.code,
        },
        getGiftCardErrorStatus(error),
      );
    }

    console.error("[ADMIN_GIFT_CARD_CREATE]", error);

    return jsonResponse(
      {
        success: false,

        error: "Une erreur interne empêche la création de la carte cadeau.",
      },
      500,
    );
  }
}
