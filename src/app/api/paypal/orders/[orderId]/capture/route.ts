import {
  ApiError,
} from "@paypal/paypal-server-sdk";
import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  notifyAppointmentStatusChange,
} from "@/features/notifications/services/appointment-status-notification.service";
import {
  expireAppointmentIfNeeded,
} from "@/features/booking/services/appointment-expiration.service";
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

type RouteContext = {
  params: Promise<{
    orderId: string;
  }>;
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

  if (typeof body === "string") {
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
            "Seul un compte client peut finaliser ce paiement.",
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
          success: false,
          error:
            "Identifiant PayPal invalide.",
        },
        400,
      );
    }

    /*
     * clientId interdit à une cliente
     * de capturer la commande associée
     * au rendez-vous d’une autre cliente.
     */
    const appointment =
      await prisma.appointment.findFirst({
        where: {
          paypalOrderId:
            cleanOrderId,

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

          depositCents:
            true,

          confirmedAt:
            true,

          paypalOrderId:
            true,

          paypalCaptureId:
            true,
        },
      });

    if (!appointment) {
      return jsonResponse(
        {
          success: false,
          error:
            "Aucun rendez-vous associé à cette commande PayPal.",
        },
        404,
      );
    }

    /*
     * Capture déjà enregistrée :
     * aucun nouvel appel n’est envoyé à PayPal.
     */
    if (
      appointment.paymentStatus ===
        PaymentStatus.PAID &&
      appointment.paypalCaptureId
    ) {
      return jsonResponse({
        success:
          true,

        alreadyCaptured:
          true,

        reference:
          appointment.reference,

        confirmationUrl:
          `/reservation/confirmation/${encodeURIComponent(
            appointment.reference,
          )}`,
      });
    }

    const wasExpired =
      await expireAppointmentIfNeeded(
        appointment.id,
      );

    if (wasExpired) {
      return jsonResponse(
        {
          success: false,
          error:
            "Le délai de paiement de cette réservation a expiré.",
        },
        410,
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
        410,
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
      appointment.paymentStatus !==
      PaymentStatus.PENDING
    ) {
      const error =
        appointment.paymentStatus ===
        PaymentStatus.REFUNDED
          ? "Ce paiement a déjà été remboursé."
          : appointment.paymentStatus ===
              PaymentStatus.NOT_REQUIRED
            ? "Aucun paiement n’est requis pour ce rendez-vous."
            : "Ce paiement ne peut plus être finalisé.";

      return jsonResponse(
        {
          success: false,
          error,
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
        "Montant d’acompte PayPal invalide :",
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
            "Le montant du paiement est invalide.",
        },
        500,
      );
    }

    /*
     * À partir de cet appel, l’argent peut
     * réellement être capturé chez PayPal.
     *
     * Toute la logique suivante doit donc
     * rester idempotente et concurrent-safe.
     */
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

    if (
      paypalOrder.status !==
        "COMPLETED" ||
      capture?.status !==
        "COMPLETED" ||
      !captureId
    ) {
      console.error(
        "Capture PayPal incomplète :",
        {
          orderId:
            cleanOrderId,

          orderStatus:
            paypalOrder.status,

          captureStatus:
            capture?.status,

          captureId,
        },
      );

      return jsonResponse(
        {
          success: false,
          error:
            "Le paiement PayPal n’a pas été finalisé.",

          paypalStatus:
            paypalOrder.status ??
            null,

          captureStatus:
            capture?.status ??
            null,
        },
        422,
      );
    }

    /*
     * Vérification supplémentaire des identifiants
     * métier envoyés lors de la création.
     */
    if (
      purchaseUnit?.customId &&
      purchaseUnit.customId !==
        appointment.id
    ) {
      console.error(
        "customId PayPal incohérent :",
        {
          appointmentId:
            appointment.id,

          customId:
            purchaseUnit.customId,

          orderId:
            cleanOrderId,
        },
      );

      return jsonResponse(
        {
          success: false,
          error:
            "La commande PayPal ne correspond pas au rendez-vous.",
        },
        422,
      );
    }

    if (
      purchaseUnit?.invoiceId &&
      purchaseUnit.invoiceId !==
        appointment.reference
    ) {
      console.error(
        "invoiceId PayPal incohérent :",
        {
          appointmentId:
            appointment.id,

          appointmentReference:
            appointment.reference,

          invoiceId:
            purchaseUnit.invoiceId,

          orderId:
            cleanOrderId,
        },
      );

      return jsonResponse(
        {
          success: false,
          error:
            "La référence PayPal ne correspond pas au rendez-vous.",
        },
        422,
      );
    }

    const expectedAmount =
      (
        appointment.depositCents /
        100
      ).toFixed(
        2,
      );

    const capturedAmount =
      capture.amount?.value ??
      null;

    const capturedCurrency =
      capture.amount?.currencyCode ??
      null;

    if (
      capturedAmount !==
        expectedAmount ||
      capturedCurrency !==
        "EUR"
    ) {
      console.error(
        "Montant PayPal incorrect :",
        {
          appointmentId:
            appointment.id,

          captureId,

          expectedAmount,

          capturedAmount,

          capturedCurrency,
        },
      );

      return jsonResponse(
        {
          success: false,
          error:
            "Le montant capturé ne correspond pas à l’acompte.",
        },
        422,
      );
    }

    const paidAt =
      new Date();

    /*
     * Première tentative :
     * le rendez-vous est encore PENDING,
     * il peut donc être payé et confirmé.
     */
    const confirmationResult =
      await prisma.appointment.updateMany({
        where: {
          id:
            appointment.id,

          clientId:
            user.id,

          paypalOrderId:
            cleanOrderId,

          status:
            AppointmentStatus.PENDING,

          paymentStatus:
            PaymentStatus.PENDING,

          paypalCaptureId:
            null,
        },

        data: {
          status:
            AppointmentStatus.CONFIRMED,

          paymentStatus:
            PaymentStatus.PAID,

          paymentMethod:
            PaymentMethod.PAYPAL,

          paypalCaptureId:
            captureId,

          paypalPayerId:
            paypalOrder.payer
              ?.payerId ??
            null,

          paidAt,

          confirmedAt:
            appointment.confirmedAt ??
            paidAt,
        },
      });

    let transitionedToConfirmed =
      confirmationResult.count ===
      1;

    /*
     * Le rendez-vous peut avoir été annulé
     * exactement après la capture PayPal.
     *
     * L’argent réellement encaissé doit malgré
     * tout être enregistré sans remettre le
     * rendez-vous annulé à CONFIRMED.
     */
    if (!transitionedToConfirmed) {
      const paymentOnlyResult =
        await prisma.appointment.updateMany({
          where: {
            id:
              appointment.id,

            clientId:
              user.id,

            paypalOrderId:
              cleanOrderId,

            paymentStatus:
              PaymentStatus.PENDING,

            paypalCaptureId:
              null,
          },

          data: {
            paymentStatus:
              PaymentStatus.PAID,

            paymentMethod:
              PaymentMethod.PAYPAL,

            paypalCaptureId:
              captureId,

            paypalPayerId:
              paypalOrder.payer
                ?.payerId ??
              null,

            paidAt,
          },
        });

      if (
        paymentOnlyResult.count ===
        1
      ) {
        transitionedToConfirmed =
          false;
      }
    }

    const currentAppointment =
      await prisma.appointment.findFirst({
        where: {
          id:
            appointment.id,

          clientId:
            user.id,
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

          depositCents:
            true,

          paypalOrderId:
            true,

          paypalCaptureId:
            true,

          paidAt:
            true,
        },
      });

    if (!currentAppointment) {
      console.error(
        "Rendez-vous introuvable après capture PayPal :",
        {
          appointmentId:
            appointment.id,

          captureId,
        },
      );

      return jsonResponse(
        {
          success: false,
          error:
            "Le paiement a été capturé, mais la réservation n’a pas pu être relue.",
        },
        500,
      );
    }

    /*
     * Le webhook peut avoir enregistré exactement
     * la même capture avant cette route.
     */
    if (
      currentAppointment.paymentStatus !==
        PaymentStatus.PAID ||
      currentAppointment.paypalCaptureId !==
        captureId
    ) {
      console.error(
        "Conflit après capture PayPal :",
        {
          appointmentId:
            appointment.id,

          receivedCaptureId:
            captureId,

          currentPaymentStatus:
            currentAppointment
              .paymentStatus,

          currentCaptureId:
            currentAppointment
              .paypalCaptureId,

          currentStatus:
            currentAppointment
              .status,
        },
      );

      return jsonResponse(
        {
          success: false,
          error:
            "Le paiement a été capturé, mais son enregistrement doit être vérifié.",
        },
        409,
      );
    }

    if (
      transitionedToConfirmed
    ) {
      try {
        await notifyAppointmentStatusChange(
          currentAppointment.id,
          AppointmentStatus.CONFIRMED,
        );
      } catch (reason: unknown) {
        console.error(
          "[PAYPAL_CONFIRMATION_NOTIFICATION]",
          reason,
        );
      }
    }

    return jsonResponse({
      success:
        true,

      alreadyCaptured:
        !transitionedToConfirmed,

      appointment:
        currentAppointment,

      confirmationUrl:
        `/reservation/confirmation/${encodeURIComponent(
          currentAppointment.reference,
        )}`,
    });
  } catch (error) {
    if (
      error instanceof ApiError
    ) {
      console.error(
        "Erreur API capture PayPal :",
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
            "PayPal n’a pas pu finaliser le paiement.",

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
      "Erreur capture PayPal :",
      error,
    );

    return jsonResponse(
      {
        success: false,
        error:
          "Une erreur est survenue pendant la validation du paiement PayPal.",
      },
      500,
    );
  }
}
