import {
  NextRequest,
  NextResponse,
} from "next/server";
import {
  ZodError,
} from "zod";

import {
  giftCardPublicFormSchema,
} from "@/features/gift-cards/schemas/gift-card.schemas";
import {
  createGiftCardPurchase,
} from "@/features/gift-cards/services/gift-card.service";
import {
  eurosToCents,
} from "@/features/gift-cards/utils/gift-card.utils";
import {
  isTrustedRequestOrigin,
} from "@/lib/security/request-origin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PRIVATE_NO_STORE_HEADERS = {
  "Cache-Control":
    "private, no-store, no-cache, max-age=0, must-revalidate",
};

function jsonResponse(
  body: Record<string, unknown>,
  status = 200,
): NextResponse {
  return NextResponse.json(
    body,
    {
      status,
      headers:
        PRIVATE_NO_STORE_HEADERS,
    },
  );
}

export async function POST(
  request: NextRequest,
) {
  try {
    if (
      !isTrustedRequestOrigin(
        request,
      )
    ) {
      return jsonResponse(
        {
          success:
            false,

          error:
            "L’origine de la requête n’est pas autorisée.",
        },
        403,
      );
    }

    let body: unknown;

    try {
      body =
        await request.json();
    } catch {
      return jsonResponse(
        {
          success:
            false,

          error:
            "Le formulaire envoyé est invalide.",
        },
        400,
      );
    }

    const parsed =
      giftCardPublicFormSchema.parse(
        body,
      );

    const result =
      await createGiftCardPurchase({
        amountCents:
          eurosToCents(
            parsed.amountEuros,
          ),

        purchaserFirstName:
          parsed.purchaserFirstName,

        purchaserLastName:
          parsed.purchaserLastName,

        purchaserEmail:
          parsed.purchaserEmail,

        recipientFirstName:
          parsed.recipientFirstName,

        recipientLastName:
          parsed.recipientLastName,

        recipientEmail:
          parsed.recipientEmail,

        personalMessage:
          parsed.personalMessage,
      });

    return jsonResponse(
      {
        success:
          true,

        giftCardId:
          result.giftCardId,

        reference:
          result.reference,

        checkoutToken:
          result.checkoutToken,
      },
      201,
    );
  } catch (error) {
    if (
      error instanceof
      ZodError
    ) {
      return jsonResponse(
        {
          success:
            false,

          error:
            error.issues[0]?.message ??
            "Les informations saisies sont invalides.",

          issues:
            error.flatten(),
        },
        400,
      );
    }

    console.error(
      "Création de la carte cadeau impossible :",
      error,
    );

    return jsonResponse(
      {
        success:
          false,

        error:
          "Impossible de préparer la carte cadeau pour le moment.",
      },
      500,
    );
  }
}
