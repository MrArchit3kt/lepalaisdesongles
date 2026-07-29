import {
  ApiError,
} from "@paypal/paypal-server-sdk";
import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  activateGiftCardAfterPayPalCapture,
  GiftCardServiceError,
} from "@/features/gift-cards/services/gift-card.service";
import {
  giftCardCheckoutTokenMatches,
} from "@/features/gift-cards/utils/gift-card.utils";
import {
  paypalOrdersController,
} from "@/lib/paypal";
import {
  prisma,
} from "@/lib/prisma";
import {
  isTrustedRequestOrigin,
} from "@/lib/security/request-origin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    orderId: string;
  }>;
};

type CaptureBody = {
  checkoutToken?: unknown;
};

type PayPalCapture = {
  id?: string;
  status?: string;

  amount?: {
    currencyCode?: string;
    value?: string;
  };
};

type PayPalCaptureResponse = {
  id?: string;
  status?: string;

  payer?: {
    payerId?: string;
    emailAddress?: string;
  };

  purchaseUnits?: Array<{
    referenceId?: string;
    customId?: string;
    invoiceId?: string;

    payments?: {
      captures?: PayPalCapture[];
    };
  }>;
};

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

function parseCaptureResponse(
  body: unknown,
): PayPalCaptureResponse {
  if (
    typeof body === "object" &&
    body !== null
  ) {
    return body as PayPalCaptureResponse;
  }

  if (
    typeof body === "string"
  ) {
    try {
      return JSON.parse(
        body,
      ) as PayPalCaptureResponse;
    } catch {
      return {};
    }
  }

  return {};
}

function parsePayPalAmountToCents(
  value: string | undefined,
): number | null {
  if (!value) {
    return null;
  }

  if (
    !/^\d+(?:\.\d{1,2})?$/.test(
      value,
    )
  ) {
    return null;
  }

  const amount =
    Number(value);

  if (
    !Number.isFinite(amount)
  ) {
    return null;
  }

  return Math.round(
    amount * 100,
  );
}

export async function POST(
  request: NextRequest,
  context: RouteContext,
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

    const {
      orderId,
    } = await context.params;

    const cleanOrderId =
      orderId.trim();

    if (
      !cleanOrderId ||
      cleanOrderId.length > 128
    ) {
      return jsonResponse(
        {
          success:
            false,

          error:
            "Identifiant PayPal invalide.",
        },
        400,
      );
    }

    let body: CaptureBody;

    try {
      body =
        (await request.json()) as CaptureBody;
    } catch {
      return jsonResponse(
        {
          success:
            false,

          error:
            "Le corps de la requête est invalide.",
        },
        400,
      );
    }

    const checkoutToken =
      typeof body.checkoutToken ===
      "string"
        ? body.checkoutToken.trim()
        : "";

    const giftCard =
      await prisma.giftCard.findUnique({
        where: {
          paypalOrderId:
            cleanOrderId,
        },

        select: {
          id:
            true,

          reference:
            true,

          status:
            true,

          code:
            true,

          checkoutTokenHash:
            true,

          paypalCaptureId:
            true,
        },
      });

    if (!giftCard) {
      return jsonResponse(
        {
          success:
            false,

          error:
            "Aucune carte cadeau n’est associée à cette commande PayPal.",
        },
        404,
      );
    }

    if (
      giftCard.status ===
        "ACTIVE" &&
      giftCard.paypalCaptureId
    ) {
      return jsonResponse({
        success:
          true,

        alreadyCaptured:
          true,

        reference:
          giftCard.reference,

        code:
          giftCard.code,

        confirmationUrl:
          `/carte-cadeau/confirmation/${encodeURIComponent(
            giftCard.reference,
          )}`,
      });
    }

    if (
      !giftCardCheckoutTokenMatches(
        checkoutToken,
        giftCard.checkoutTokenHash,
      )
    ) {
      return jsonResponse(
        {
          success:
            false,

          error:
            "Le jeton de paiement est invalide.",
        },
        403,
      );
    }

    if (
      giftCard.status !==
      "PENDING_PAYMENT"
    ) {
      return jsonResponse(
        {
          success:
            false,

          error:
            "Cette carte cadeau ne peut plus être payée.",
        },
        409,
      );
    }

    const response =
      await paypalOrdersController.captureOrder({
        id:
          cleanOrderId,

        prefer:
          "return=representation",
      });

    const paypalOrder =
      parseCaptureResponse(
        response.body,
      );

    const purchaseUnit =
      paypalOrder.purchaseUnits?.[0];

    const capture =
      purchaseUnit
        ?.payments
        ?.captures?.[0];

    const captureId =
      capture?.id?.trim();

    const capturedAmountCents =
      parsePayPalAmountToCents(
        capture?.amount?.value,
      );

    const currency =
      capture?.amount?.currencyCode
        ?.trim()
        .toUpperCase();

    if (
      paypalOrder.status !==
        "COMPLETED" ||
      capture?.status !==
        "COMPLETED" ||
      !captureId ||
      capturedAmountCents ===
        null ||
      !currency
    ) {
      console.error(
        "Capture PayPal incomplète pour une carte cadeau :",
        {
          orderId:
            cleanOrderId,

          orderStatus:
            paypalOrder.status,

          captureStatus:
            capture?.status,

          captureId,
          capturedAmountCents,
          currency,
        },
      );

      return jsonResponse(
        {
          success:
            false,

          error:
            "Le paiement PayPal n’a pas été confirmé.",
        },
        502,
      );
    }

    const activation =
      await activateGiftCardAfterPayPalCapture({
        paypalOrderId:
          cleanOrderId,

        paypalCaptureId:
          captureId,

        paypalPayerId:
          paypalOrder.payer
            ?.payerId,

        capturedAmountCents,
        currency,
      });

    return jsonResponse({
      success:
        true,

      reference:
        activation.reference,

      code:
        activation.code,

      confirmationUrl:
        `/carte-cadeau/confirmation/${encodeURIComponent(
          activation.reference,
        )}`,
    });
  } catch (error) {
    if (
      error instanceof
      GiftCardServiceError
    ) {
      const status =
        error.code ===
        "NOT_FOUND"
          ? 404
          : error.code ===
                "PAYMENT_MISMATCH" ||
              error.code ===
                "INVALID_PAYMENT"
            ? 400
            : 409;

      return jsonResponse(
        {
          success:
            false,

          error:
            error.message,
        },
        status,
      );
    }

    if (
      error instanceof
      ApiError
    ) {
      console.error(
        "Erreur PayPal pendant la capture d’une carte cadeau :",
        error,
      );

      return jsonResponse(
        {
          success:
            false,

          error:
            "PayPal n’a pas pu finaliser le paiement.",
        },
        502,
      );
    }

    console.error(
      "Erreur pendant la capture PayPal de la carte cadeau :",
      error,
    );

    return jsonResponse(
      {
        success:
          false,

        error:
          "Impossible de finaliser le paiement de la carte cadeau.",
      },
      500,
    );
  }
}
