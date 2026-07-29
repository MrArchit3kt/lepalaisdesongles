import {
  ApiError,
  CheckoutPaymentIntent,
  PaypalExperienceLandingPage,
  PaypalExperienceUserAction,
  PaypalWalletContextShippingPreference,
} from "@paypal/paypal-server-sdk";
import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  attachPayPalOrderToGiftCard,
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

type CreateOrderBody = {
  giftCardId?: unknown;
  checkoutToken?: unknown;
};

type PayPalOrderResponse = {
  id?: string;
  status?: string;
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

function getApplicationUrl(): string {
  const configuredUrl =
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.NEXTAUTH_URL?.trim();

  if (!configuredUrl) {
    throw new Error(
      "NEXT_PUBLIC_APP_URL ou NEXTAUTH_URL doit être configurée.",
    );
  }

  const parsedUrl =
    new URL(configuredUrl);

  if (
    parsedUrl.protocol !== "https:" &&
    !(
      process.env.NODE_ENV !==
        "production" &&
      parsedUrl.protocol === "http:"
    )
  ) {
    throw new Error(
      "L’URL de l’application doit utiliser HTTPS en production.",
    );
  }

  return parsedUrl
    .toString()
    .replace(/\/+$/, "");
}

function parsePayPalOrderResponse(
  body: unknown,
): PayPalOrderResponse {
  if (
    typeof body === "object" &&
    body !== null
  ) {
    return body as PayPalOrderResponse;
  }

  if (
    typeof body === "string"
  ) {
    try {
      return JSON.parse(
        body,
      ) as PayPalOrderResponse;
    } catch {
      return {};
    }
  }

  return {};
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

    let body: CreateOrderBody;

    try {
      body =
        (await request.json()) as CreateOrderBody;
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

    const giftCardId =
      typeof body.giftCardId ===
      "string"
        ? body.giftCardId.trim()
        : "";

    const checkoutToken =
      typeof body.checkoutToken ===
      "string"
        ? body.checkoutToken.trim()
        : "";

    if (
      !giftCardId ||
      giftCardId.length > 128 ||
      !checkoutToken ||
      checkoutToken.length > 256
    ) {
      return jsonResponse(
        {
          success:
            false,

          error:
            "Les informations de paiement sont invalides.",
        },
        400,
      );
    }

    const giftCard =
      await prisma.giftCard.findUnique({
        where: {
          id:
            giftCardId,
        },

        select: {
          id:
            true,

          reference:
            true,

          status:
            true,

          initialAmountCents:
            true,

          currency:
            true,

          checkoutTokenHash:
            true,

          paypalOrderId:
            true,
        },
      });

    if (!giftCard) {
      return jsonResponse(
        {
          success:
            false,

          error:
            "Carte cadeau introuvable.",
        },
        404,
      );
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
            "Le lien de paiement de cette carte cadeau est invalide.",
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
            "Cette carte cadeau n’est plus en attente de paiement.",
        },
        409,
      );
    }

    if (
      giftCard.paypalOrderId
    ) {
      return jsonResponse({
        success:
          true,

        orderId:
          giftCard.paypalOrderId,

        alreadyCreated:
          true,
      });
    }

    if (
      !Number.isSafeInteger(
        giftCard.initialAmountCents,
      ) ||
      giftCard.initialAmountCents <=
        0
    ) {
      return jsonResponse(
        {
          success:
            false,

          error:
            "Le montant de la carte cadeau est invalide.",
        },
        500,
      );
    }

    const applicationUrl =
      getApplicationUrl();

    const amount =
      (
        giftCard.initialAmountCents /
        100
      ).toFixed(
        2,
      );

    const response =
      await paypalOrdersController.createOrder({
        body: {
          intent:
            CheckoutPaymentIntent.Capture,

          purchaseUnits: [
            {
              referenceId:
                giftCard.reference,

              description:
                "Carte cadeau Le Palais des Ongles",

              customId:
                `GIFT_CARD:${giftCard.id}`,

              invoiceId:
                giftCard.reference,

              amount: {
                currencyCode:
                  giftCard.currency,

                value:
                  amount,
              },
            },
          ],

          paymentSource: {
            paypal: {
              experienceContext: {
                brandName:
                  "Le Palais des Ongles",

                landingPage:
                  PaypalExperienceLandingPage
                    .Login,

                userAction:
                  PaypalExperienceUserAction
                    .PayNow,

                shippingPreference:
                  PaypalWalletContextShippingPreference
                    .NoShipping,

                returnUrl:
                  `${applicationUrl}/carte-cadeau/confirmation/${encodeURIComponent(
                    giftCard.reference,
                  )}`,

                cancelUrl:
                  `${applicationUrl}/carte-cadeau?paiement=annule`,
              },
            },
          },
        },

        prefer:
          "return=representation",
      });

    const paypalOrder =
      parsePayPalOrderResponse(
        response.body,
      );

    const paypalOrderId =
      paypalOrder.id?.trim();

    if (!paypalOrderId) {
      console.error(
        "Réponse PayPal sans identifiant pour une carte cadeau :",
        {
          giftCardId:
            giftCard.id,

          response:
            response.body,
        },
      );

      return jsonResponse(
        {
          success:
            false,

          error:
            "Impossible de créer la commande PayPal.",
        },
        502,
      );
    }

    await attachPayPalOrderToGiftCard({
      giftCardId:
        giftCard.id,

      paypalOrderId,
    });

    return jsonResponse(
      {
        success:
          true,

        orderId:
          paypalOrderId,
      },
      201,
    );
  } catch (error) {
    if (
      error instanceof
      ApiError
    ) {
      console.error(
        "Erreur PayPal pendant la création d’une carte cadeau :",
        error,
      );

      return jsonResponse(
        {
          success:
            false,

          error:
            "PayPal n’a pas pu préparer le paiement.",
        },
        502,
      );
    }

    console.error(
      "Erreur lors de la création de la commande PayPal de la carte cadeau :",
      error,
    );

    return jsonResponse(
      {
        success:
          false,

        error:
          "Impossible de préparer le paiement de la carte cadeau.",
      },
      500,
    );
  }
}
