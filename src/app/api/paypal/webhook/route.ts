import { NextRequest, NextResponse } from "next/server";

import { recordPayPalRefundFromWebhook } from "@/features/admin/appointments/services/admin-appointment-refund.service";
import { notifyAppointmentStatusChange } from "@/features/notifications/services/appointment-status-notification.service";
import { sendAppointmentEmail } from "@/features/notifications/services/appointment-email.service";
import { getPayPalBaseUrl, getPayPalWebhookId } from "@/lib/paypal";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_PAYPAL_WEBHOOK_BODY_BYTES = 256 * 1024;

type PayPalWebhookEvent = {
  id?: string;
  event_type?: string;
  resource_type?: string;

  resource?: {
    id?: string;
    status?: string;

    amount?: {
      currency_code?: string;
      value?: string;
    };

    custom_id?: string;
    invoice_id?: string;

    payer?: {
      payer_id?: string;
      email_address?: string;
    };

    supplementary_data?: {
      related_ids?: {
        order_id?: string;
        capture_id?: string;
      };
    };
  };
};

type VerifyWebhookResponse = {
  verification_status?: string;
};

type PayPalAccessTokenResponse = {
  access_token?: string;
  token_type?: string;
  expires_in?: number;
};

function getRequiredEnvironmentVariable(
  name: "PAYPAL_CLIENT_ID" | "PAYPAL_CLIENT_SECRET",
): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} manquant`);
  }

  return value;
}

async function getPayPalAccessToken(): Promise<string> {
  const clientId = getRequiredEnvironmentVariable("PAYPAL_CLIENT_ID");

  const clientSecret = getRequiredEnvironmentVariable("PAYPAL_CLIENT_SECRET");

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString(
    "base64",
  );

  const response = await fetch(`${getPayPalBaseUrl()}/v1/oauth2/token`, {
    method: "POST",

    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },

    body: "grant_type=client_credentials",

    cache: "no-store",
  });

  const payload = (await response.json()) as PayPalAccessTokenResponse & {
    error?: string;
    error_description?: string;
  };

  if (!response.ok || !payload.access_token) {
    console.error("Impossible d'obtenir le token PayPal :", payload);

    throw new Error(
      payload.error_description ??
        "Impossible de s'authentifier auprès de PayPal",
    );
  }

  return payload.access_token;
}

function getHeader(request: NextRequest, name: string): string {
  return request.headers.get(name)?.trim() ?? "";
}

async function verifyWebhookSignature(
  request: NextRequest,
  webhookEvent: PayPalWebhookEvent,
): Promise<boolean> {
  const transmissionId = getHeader(request, "paypal-transmission-id");

  const transmissionTime = getHeader(request, "paypal-transmission-time");

  const transmissionSignature = getHeader(request, "paypal-transmission-sig");

  const certificateUrl = getHeader(request, "paypal-cert-url");

  const authenticationAlgorithm = getHeader(request, "paypal-auth-algo");

  if (
    !transmissionId ||
    !transmissionTime ||
    !transmissionSignature ||
    !certificateUrl ||
    !authenticationAlgorithm
  ) {
    console.error("Webhook PayPal reçu sans les en-têtes de sécurité requis");

    return false;
  }

  const webhookId = getPayPalWebhookId();

  const accessToken = await getPayPalAccessToken();

  const response = await fetch(
    `${getPayPalBaseUrl()}/v1/notifications/verify-webhook-signature`,
    {
      method: "POST",

      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },

      body: JSON.stringify({
        auth_algo: authenticationAlgorithm,
        cert_url: certificateUrl,
        transmission_id: transmissionId,
        transmission_sig: transmissionSignature,
        transmission_time: transmissionTime,
        webhook_id: webhookId,
        webhook_event: webhookEvent,
      }),

      cache: "no-store",
    },
  );

  const payload = (await response.json()) as VerifyWebhookResponse & {
    name?: string;
    message?: string;
  };

  if (!response.ok) {
    console.error("Erreur de vérification du webhook PayPal :", payload);

    return false;
  }

  return payload.verification_status === "SUCCESS";
}

async function handleCompletedCapture(
  event: PayPalWebhookEvent,
): Promise<void> {
  const capture = event.resource;

  if (!capture) {
    console.error("Webhook PAYMENT.CAPTURE.COMPLETED sans resource :", {
      eventId: event.id,
    });

    return;
  }

  const captureId = capture.id?.trim();

  const orderId = capture.supplementary_data?.related_ids?.order_id?.trim();

  if (!captureId || !orderId) {
    console.error("Webhook PAYMENT.CAPTURE.COMPLETED incomplet :", {
      eventId: event.id,

      captureId,
      orderId,
    });

    return;
  }

  const appointment = await prisma.appointment.findUnique({
    where: {
      paypalOrderId: orderId,
    },

    select: {
      id: true,

      reference: true,

      status: true,

      depositCents: true,

      paymentStatus: true,

      paypalCaptureId: true,

      confirmedAt: true,

      startsAt: true,

      client: {
        select: {
          email: true,

          firstName: true,

          lastName: true,
        },
      },

      staff: {
        select: {
          displayName: true,

          user: {
            select: {
              firstName: true,

              lastName: true,
            },
          },
        },
      },

      services: {
        orderBy: {
          sortOrder: "asc",
        },

        select: {
          serviceName: true,

          quantity: true,
        },
      },
    },
  });

  if (!appointment) {
    console.error("Aucun rendez-vous associé au webhook PayPal :", {
      eventId: event.id,

      orderId,
      captureId,
    });

    return;
  }

  /*
   * PayPal peut envoyer plusieurs fois
   * exactement le même événement.
   */
  if (
    appointment.paymentStatus === "PAID" &&
    appointment.paypalCaptureId === captureId
  ) {
    return;
  }

  /*
   * Une autre capture déjà enregistrée
   * ne doit jamais être écrasée.
   */
  if (appointment.paymentStatus === "PAID" || appointment.paypalCaptureId) {
    console.error("Conflit de capture PayPal :", {
      eventId: event.id,

      appointmentId: appointment.id,

      existingCaptureId: appointment.paypalCaptureId,

      receivedCaptureId: captureId,

      paymentStatus: appointment.paymentStatus,
    });

    return;
  }

  const capturedValue = capture.amount?.value;

  const capturedCurrency = capture.amount?.currency_code;

  const expectedValue = (appointment.depositCents / 100).toFixed(2);

  if (capturedValue !== expectedValue || capturedCurrency !== "EUR") {
    console.error("Le montant du webhook PayPal est incorrect :", {
      appointmentId: appointment.id,

      expectedValue,
      capturedValue,
      capturedCurrency,
    });

    return;
  }

  if (capture.status !== "COMPLETED") {
    console.error("Capture PayPal non terminée malgré le type d'événement :", {
      eventId: event.id,

      captureId,

      status: capture.status,
    });

    return;
  }

  /*
   * Le paiement doit être enregistré même
   * si le webhook arrive après une annulation.
   *
   * En revanche, seul un rendez-vous PENDING
   * peut automatiquement passer à CONFIRMED.
   */
  const transitionToConfirmed = appointment.status === "PENDING";

  const paidAt = new Date();

  const updateResult = await prisma.appointment.updateMany({
    where: {
      id: appointment.id,

      paymentStatus: "PENDING",

      paypalCaptureId: null,
    },

    data: {
      paymentStatus: "PAID",

      paymentMethod: "PAYPAL",

      paypalCaptureId: captureId,

      paypalPayerId: capture.payer?.payer_id ?? null,

      paidAt,

      ...(transitionToConfirmed
        ? {
            status: "CONFIRMED" as const,

            confirmedAt: appointment.confirmedAt ?? paidAt,
          }
        : {}),
    },
  });

  if (updateResult.count === 0) {
    const currentAppointment = await prisma.appointment.findUnique({
      where: {
        id: appointment.id,
      },

      select: {
        status: true,

        paymentStatus: true,

        paypalCaptureId: true,
      },
    });

    if (
      currentAppointment?.paymentStatus === "PAID" &&
      currentAppointment.paypalCaptureId === captureId
    ) {
      return;
    }

    console.error("Mise à jour PayPal concurrente ou incohérente :", {
      eventId: event.id,

      appointmentId: appointment.id,

      captureId,

      currentAppointment,
    });

    return;
  }

  if (!transitionToConfirmed) {
    await prisma.auditLog.create({
      data: {
        action: "PAYPAL_CAPTURE_REQUIRES_REVIEW",

        entityType: "Appointment",

        entityId: appointment.id,

        metadata: {
          eventId: event.id ?? null,

          orderId,
          captureId,

          appointmentReference: appointment.reference,

          appointmentStatus: appointment.status,

          capturedValue: capturedValue ?? null,

          capturedCurrency: capturedCurrency ?? null,

          reason:
            "Le paiement a été reçu sans réactivation automatique du rendez-vous.",
        },
      },
    });

    console.error("Paiement PayPal reçu sur un rendez-vous non PENDING :", {
      eventId: event.id,

      appointmentId: appointment.id,

      appointmentStatus: appointment.status,

      orderId,
      captureId,
    });

    return;
  }

  try {
    await notifyAppointmentStatusChange(appointment.id, "CONFIRMED");
  } catch (reason: unknown) {
    console.error("[PAYPAL_WEBHOOK_CONFIRMATION_NOTIFICATION]", reason);
  }

  try {
    const siteUrl = (
      process.env.NEXT_PUBLIC_APP_URL?.trim() ||
      process.env.NEXTAUTH_URL?.trim() ||
      "https://lepalaisdesongles.fr"
    ).replace(/\/+$/, "");

    const recipientName = [
      appointment.client.firstName,
      appointment.client.lastName,
    ]
      .filter(Boolean)
      .join(" ")
      .trim();

    const staffName =
      appointment.staff?.displayName?.trim() ||
      [appointment.staff?.user.firstName, appointment.staff?.user.lastName]
        .filter(Boolean)
        .join(" ")
        .trim() ||
      null;

    const serviceNames = appointment.services.flatMap((service) =>
      Array.from(
        {
          length: Math.max(service.quantity, 1),
        },
        () => service.serviceName,
      ),
    );

    await sendAppointmentEmail({
      kind: "BOOKING_CONFIRMED",

      recipientEmail: appointment.client.email,

      recipientName,

      appointmentReference: appointment.reference,

      startsAt: appointment.startsAt.toISOString(),

      serviceNames,

      staffName,

      manageUrl: `${siteUrl}/espace-client/rendez-vous/${encodeURIComponent(
        appointment.reference,
      )}`,
    });
  } catch (reason: unknown) {
    /*
     * Le webhook doit répondre avec succès à PayPal
     * même si Resend est momentanément indisponible.
     *
     * Le paiement et la confirmation sont déjà
     * correctement enregistrés dans la base.
     */
    console.error("[PAYPAL_WEBHOOK_BOOKING_CONFIRMED_EMAIL]", reason);
  }
}

async function handleRefundedCapture(event: PayPalWebhookEvent): Promise<void> {
  const refund = event.resource;

  if (!refund) {
    console.error("Webhook PAYMENT.CAPTURE.REFUNDED sans resource :", {
      eventId: event.id,
    });

    return;
  }

  const captureId = refund.supplementary_data?.related_ids?.capture_id?.trim();

  if (!captureId) {
    console.error("Webhook PAYMENT.CAPTURE.REFUNDED sans capture_id :", {
      eventId: event.id,

      refundId: refund.id,
    });

    return;
  }

  /*
   * Cette synchronisation couvre les remboursements
   * déclenchés en dehors de l’application (dashboard
   * PayPal), pas seulement ceux lancés depuis l’admin.
   */
  const result = await recordPayPalRefundFromWebhook({
    paypalCaptureId: captureId,

    refund: {
      id: refund.id,
      status: refund.status,
      amount: refund.amount,
    },
  });

  if (!result.handled) {
    console.error("Remboursement PayPal non synchronisé automatiquement :", {
      eventId: event.id,

      captureId,
      refundId: refund.id,
      reason: result.reason,
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const declaredContentLength = Number(
      request.headers.get("content-length") ?? 0,
    );

    if (
      Number.isFinite(declaredContentLength) &&
      declaredContentLength > MAX_PAYPAL_WEBHOOK_BODY_BYTES
    ) {
      return NextResponse.json(
        {
          error: "Corps du webhook trop volumineux",
        },
        {
          status: 413,
        },
      );
    }

    const rawBody = await request.text();

    if (Buffer.byteLength(rawBody, "utf8") > MAX_PAYPAL_WEBHOOK_BODY_BYTES) {
      return NextResponse.json(
        {
          error: "Corps du webhook trop volumineux",
        },
        {
          status: 413,
        },
      );
    }

    let event: PayPalWebhookEvent;

    try {
      event = JSON.parse(rawBody) as PayPalWebhookEvent;
    } catch {
      return NextResponse.json(
        {
          error: "Corps JSON invalide",
        },
        {
          status: 400,
        },
      );
    }

    const signatureIsValid = await verifyWebhookSignature(request, event);

    if (!signatureIsValid) {
      return NextResponse.json(
        {
          error: "Signature du webhook PayPal invalide",
        },
        {
          status: 401,
        },
      );
    }

    switch (event.event_type) {
      case "PAYMENT.CAPTURE.COMPLETED":
        await handleCompletedCapture(event);
        break;

      case "PAYMENT.CAPTURE.REFUNDED":
        await handleRefundedCapture(event);
        break;

      case "PAYMENT.CAPTURE.DENIED":
        console.warn("Paiement PayPal refusé :", event.resource?.id);
        break;

      case "PAYMENT.CAPTURE.PENDING":
        console.info("Paiement PayPal en attente :", event.resource?.id);
        break;

      default:
        console.info("Événement PayPal ignoré :", event.event_type);
    }

    return NextResponse.json({
      received: true,
    });
  } catch (error) {
    console.error("Erreur webhook PayPal :", error);

    /*
     * Un statut 500 demande à PayPal de retenter l'envoi.
     */
    return NextResponse.json(
      {
        error: "Impossible de traiter le webhook PayPal",
      },
      {
        status: 500,
      },
    );
  }
}
