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
  AppointmentStatus,
  PaymentMethod,
  PaymentStatus,
} from "@/generated/prisma/client";
import {
  requireApiUser,
} from "@/lib/api-session";
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
  appointmentId?: unknown;
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
      process.env.NODE_ENV !== "production" &&
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

  if (typeof body === "string") {
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
          success: false,
          error:
            "L’origine de la requête n’est pas autorisée.",
        },
        403,
      );
    }

    const authentication =
      await requireApiUser();

    if (!authentication.user) {
      return authentication.response;
    }

    const user =
      authentication.user;

    if (
      user.role !== "CLIENT"
    ) {
      return jsonResponse(
        {
          success: false,
          error:
            "Seul un compte client peut effectuer ce paiement.",
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
          success: false,
          error:
            "Le corps de la requête est invalide.",
        },
        400,
      );
    }

    const appointmentId =
      typeof body.appointmentId === "string"
        ? body.appointmentId.trim()
        : "";

    if (
      !appointmentId ||
      appointmentId.length > 128
    ) {
      return jsonResponse(
        {
          success: false,
          error:
            "L’identifiant du rendez-vous est invalide.",
        },
        400,
      );
    }

    /*
     * Le filtre clientId interdit à une cliente
     * de créer une commande pour le rendez-vous
     * appartenant à une autre cliente.
     */
    const appointment =
      await prisma.appointment.findFirst({
        where: {
          id:
            appointmentId,

          clientId:
            user.id,

          client: {
            status:
              "ACTIVE",
          },
        },

        select: {
          id:
            true,

          reference:
            true,

          status:
            true,

          paymentStatus:
            true,

          totalPriceCents:
            true,

          depositCents:
            true,

          paypalOrderId:
            true,
        },
      });

    if (!appointment) {
      return jsonResponse(
        {
          success: false,
          error:
            "Rendez-vous introuvable.",
        },
        404,
      );
    }

    if (
      appointment.status ===
        AppointmentStatus.CANCELLED_BY_CLIENT ||
      appointment.status ===
        AppointmentStatus.CANCELLED_BY_ADMIN ||
      appointment.status ===
        AppointmentStatus.REFUSED ||
      appointment.status ===
        AppointmentStatus.EXPIRED ||
      appointment.status ===
        AppointmentStatus.NO_SHOW
    ) {
      return jsonResponse(
        {
          success: false,
          error:
            "Ce rendez-vous n’est plus éligible au paiement.",
        },
        409,
      );
    }

    if (
      appointment.status !==
      AppointmentStatus.PENDING
    ) {
      return jsonResponse(
        {
          success: false,
          error:
            "Ce rendez-vous ne peut plus être payé dans son état actuel.",
        },
        409,
      );
    }

    if (
      appointment.paymentStatus ===
      PaymentStatus.PAID
    ) {
      return jsonResponse(
        {
          success: false,
          error:
            "Cette réservation a déjà été payée.",
        },
        409,
      );
    }

    if (
      appointment.paymentStatus ===
      PaymentStatus.REFUNDED
    ) {
      return jsonResponse(
        {
          success: false,
          error:
            "Cette réservation a déjà été remboursée.",
        },
        409,
      );
    }

    if (
      appointment.paymentStatus ===
      PaymentStatus.NOT_REQUIRED
    ) {
      return jsonResponse(
        {
          success: false,
          error:
            "Aucun paiement n’est requis pour cette réservation.",
        },
        409,
      );
    }

    if (
      appointment.paymentStatus !==
      PaymentStatus.PENDING
    ) {
      return jsonResponse(
        {
          success: false,
          error:
            "Cette réservation n’est pas disponible au paiement.",
        },
        409,
      );
    }

    if (
      !Number.isSafeInteger(
        appointment.depositCents,
      ) ||
      appointment.depositCents <= 0
    ) {
      console.error(
        "Montant PayPal invalide :",
        {
          appointmentId:
            appointment.id,

          depositCents:
            appointment.depositCents,
        },
      );

      return jsonResponse(
        {
          success: false,
          error:
            "Le montant à payer est invalide.",
        },
        500,
      );
    }

    if (
      !Number.isSafeInteger(
        appointment.totalPriceCents,
      ) ||
      appointment.totalPriceCents <= 0 ||
      appointment.depositCents >
        appointment.totalPriceCents
    ) {
      console.error(
        "Montant PayPal incohérent :",
        {
          appointmentId:
            appointment.id,

          depositCents:
            appointment.depositCents,

          totalPriceCents:
            appointment.totalPriceCents,
        },
      );

      return jsonResponse(
        {
          success: false,
          error:
            "Le montant du paiement est incohérent.",
        },
        500,
      );
    }

    /*
     * Une commande existe déjà :
     * elle est réutilisée afin d’éviter
     * plusieurs commandes sur un double clic.
     */
    if (
      appointment.paypalOrderId
    ) {
      return jsonResponse({
        success:
          true,

        id:
          appointment.paypalOrderId,

        reused:
          true,
      });
    }

    const isFullPayment =
      appointment.depositCents ===
      appointment.totalPriceCents;

    const amount =
      (
        appointment.depositCents /
        100
      ).toFixed(
        2,
      );

    const description =
      isFullPayment
        ? "Paiement intégral réservation Le Palais des Ongles"
        : "Acompte réservation Le Palais des Ongles";

    const applicationUrl =
      getApplicationUrl();

    const response =
      await paypalOrdersController.createOrder({
        body: {
          intent:
            CheckoutPaymentIntent.Capture,

          purchaseUnits: [
            {
              referenceId:
                appointment.reference,

              description,

              customId:
                appointment.id,

              invoiceId:
                appointment.reference,

              amount: {
                currencyCode:
                  "EUR",

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
                  `${applicationUrl}/reservation/confirmation/${encodeURIComponent(
                    appointment.reference,
                  )}`,

                cancelUrl:
                  `${applicationUrl}/reservation/paiement/${encodeURIComponent(
                    appointment.reference,
                  )}`,
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
        "Réponse PayPal sans identifiant :",
        {
          statusCode:
            response.statusCode,

          body:
            response.body,
        },
      );

      return jsonResponse(
        {
          success: false,
          error:
            "Impossible de créer la commande PayPal.",
        },
        502,
      );
    }

    /*
     * Mise à jour conditionnelle :
     * une requête concurrente ne peut pas
     * écraser la commande déjà enregistrée.
     */
    const updateResult =
      await prisma.appointment.updateMany({
        where: {
          id:
            appointment.id,

          clientId:
            user.id,

          status:
            AppointmentStatus.PENDING,

          paymentStatus:
            PaymentStatus.PENDING,

          paypalOrderId:
            null,

          paypalCaptureId:
            null,
        },

        data: {
          paypalOrderId,

          paymentMethod:
            PaymentMethod.PAYPAL,
        },
      });

    if (
      updateResult.count === 0
    ) {
      const currentAppointment =
        await prisma.appointment.findFirst({
          where: {
            id:
              appointment.id,

            clientId:
              user.id,
          },

          select: {
            status:
              true,

            paymentStatus:
              true,

            paypalOrderId:
              true,

            paypalCaptureId:
              true,
          },
        });

      if (
        currentAppointment
          ?.paymentStatus ===
          PaymentStatus.PAID
      ) {
        return jsonResponse(
          {
            success: false,
            error:
              "Cette réservation vient déjà d’être payée.",
          },
          409,
        );
      }

      if (
        currentAppointment
          ?.paypalOrderId
      ) {
        return jsonResponse({
          success:
            true,

          id:
            currentAppointment
              .paypalOrderId,

          reused:
            true,
        });
      }

      console.error(
        "Échec de l’enregistrement de la commande PayPal :",
        {
          appointmentId:
            appointment.id,

          createdPayPalOrderId:
            paypalOrderId,

          currentAppointment,
        },
      );

      return jsonResponse(
        {
          success: false,
          error:
            "Impossible d’enregistrer la commande PayPal.",
        },
        409,
      );
    }

    return jsonResponse({
      success:
        true,

      id:
        paypalOrderId,

      paymentType:
        isFullPayment
          ? "FULL_PAYMENT"
          : "DEPOSIT",

      amountCents:
        appointment.depositCents,
    });
  } catch (error) {
    if (
      error instanceof ApiError
    ) {
      console.error(
        "Erreur API PayPal :",
        {
          statusCode:
            error.statusCode,

          message:
            error.message,

          body:
            error.body,
        },
      );

      return jsonResponse(
        {
          success: false,

          error:
            "PayPal a refusé la création du paiement.",

          details:
            process.env.NODE_ENV ===
            "development"
              ? error.message
              : undefined,
        },
        error.statusCode || 502,
      );
    }

    console.error(
      "Erreur création commande PayPal :",
      error,
    );

    return jsonResponse(
      {
        success: false,
        error:
          "Une erreur est survenue pendant la création du paiement PayPal.",
      },
      500,
    );
  }
}
