import "server-only";

import { randomUUID } from "node:crypto";

import {
  PaymentMethod,
  PaymentStatus,
  Prisma,
} from "@/generated/prisma/client";

import { getPayPalBaseUrl } from "@/lib/paypal";
import { prisma } from "@/lib/prisma";

/* -------------------------------------------------------------------------- */
/*                                    TYPES                                   */
/* -------------------------------------------------------------------------- */

export type AdminAppointmentRefundState =
  "PENDING" | "COMPLETED" | "FAILED" | "CANCELLED";

export type AdminAppointmentRefundResult = {
  appointmentId: string;
  reference: string;

  paymentStatus: PaymentStatus;

  paypalCaptureId: string;
  paypalRefundId: string;
  paypalRefundRequestId: string;
  paypalRefundStatus: AdminAppointmentRefundState;

  refundedAmountCents: number;

  refundRequestedAt: Date;
  refundedAt: Date | null;

  refundReason: string | null;

  alreadyRefunded: boolean;
  synchronized: boolean;
};

type PayPalAccessTokenResponse = {
  access_token?: string;
  error?: string;
  error_description?: string;
};

type PayPalMoney = {
  currency_code?: string;
  value?: string;
};

type PayPalCaptureResponse = {
  id?: string;
  status?: string;
  amount?: PayPalMoney;
  invoice_id?: string;
  custom_id?: string;
};

type PayPalRefundResponse = {
  id?: string;
  status?: string;

  amount?: PayPalMoney;

  invoice_id?: string;
  custom_id?: string;

  create_time?: string;
  update_time?: string;

  status_details?: {
    reason?: string;
  };

  message?: string;

  details?: Array<{
    issue?: string;
    description?: string;
  }>;
};

type RefundErrorCode =
  | "NOT_FOUND"
  | "FORBIDDEN"
  | "INVALID_PAYMENT"
  | "ALREADY_REFUNDED"
  | "REFUND_IN_PROGRESS"
  | "PAYPAL_CAPTURE_NOT_FOUND"
  | "PAYPAL_CAPTURE_INVALID"
  | "PAYPAL_REFUND_NOT_FOUND"
  | "PAYPAL_AMOUNT_MISMATCH"
  | "PAYPAL_REFUND_REJECTED"
  | "CONFLICT";

/* -------------------------------------------------------------------------- */
/*                                   ERREURS                                  */
/* -------------------------------------------------------------------------- */

export class AdminAppointmentRefundError extends Error {
  public readonly code: RefundErrorCode;
  public readonly status: number;

  public constructor(code: RefundErrorCode, message: string, status: number) {
    super(message);

    this.name = "AdminAppointmentRefundError";
    this.code = code;
    this.status = status;
  }
}

/* -------------------------------------------------------------------------- */
/*                                  CONSTANTES                                */
/* -------------------------------------------------------------------------- */

const REFUND_REASON_MIN_LENGTH = 5;
const REFUND_REASON_MAX_LENGTH = 500;

const ALLOWED_ADMIN_ROLES = ["SUPER_ADMIN", "ADMIN"] as const;

const TERMINAL_REFUND_STATUSES = new Set(["COMPLETED", "FAILED", "CANCELLED"]);

/* -------------------------------------------------------------------------- */
/*                              OUTILS GÉNÉRAUX                               */
/* -------------------------------------------------------------------------- */

function normalizeReason(value: string): string {
  const reason = value.replace(/\s+/g, " ").trim();

  if (reason.length < REFUND_REASON_MIN_LENGTH) {
    throw new AdminAppointmentRefundError(
      "INVALID_PAYMENT",
      "Le motif du remboursement doit contenir au moins 5 caractères.",
      400,
    );
  }

  if (reason.length > REFUND_REASON_MAX_LENGTH) {
    throw new AdminAppointmentRefundError(
      "INVALID_PAYMENT",
      "Le motif du remboursement ne peut pas dépasser 500 caractères.",
      400,
    );
  }

  return reason;
}

function centsToPayPalValue(amountCents: number): string {
  if (!Number.isSafeInteger(amountCents) || amountCents <= 0) {
    throw new AdminAppointmentRefundError(
      "INVALID_PAYMENT",
      "Le montant à rembourser est invalide.",
      400,
    );
  }

  return (amountCents / 100).toFixed(2);
}

function payPalValueToCents(value: string | undefined): number | null {
  if (!value) {
    return null;
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  const cents = Math.round(parsed * 100);

  return Number.isSafeInteger(cents) ? cents : null;
}

function parsePayPalDate(
  value: string | undefined,
  fallback = new Date(),
): Date {
  if (!value) {
    return fallback;
  }

  const parsed = new Date(value);

  return Number.isNaN(parsed.getTime()) ? fallback : parsed;
}

function normalizeRefundStatus(
  value: string | undefined,
): AdminAppointmentRefundState {
  switch (value) {
    case "COMPLETED":
      return "COMPLETED";

    case "FAILED":
      return "FAILED";

    case "CANCELLED":
      return "CANCELLED";

    default:
      return "PENDING";
  }
}

function toJsonValue(value: Record<string, unknown>): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}

function getPayPalCredentials(): {
  clientId: string;
  clientSecret: string;
} {
  const clientId = process.env.PAYPAL_CLIENT_ID?.trim();

  const clientSecret = process.env.PAYPAL_CLIENT_SECRET?.trim();

  if (!clientId || !clientSecret) {
    throw new AdminAppointmentRefundError(
      "PAYPAL_REFUND_REJECTED",
      "La configuration PayPal du serveur est incomplète.",
      500,
    );
  }

  return {
    clientId,
    clientSecret,
  };
}

/* -------------------------------------------------------------------------- */
/*                              CLIENT API PAYPAL                             */
/* -------------------------------------------------------------------------- */

async function getPayPalAccessToken(): Promise<string> {
  const { clientId, clientSecret } = getPayPalCredentials();

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString(
    "base64",
  );

  const response = await fetch(`${getPayPalBaseUrl()}/v1/oauth2/token`, {
    method: "POST",

    headers: {
      Authorization: `Basic ${credentials}`,
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    },

    body: "grant_type=client_credentials",
    cache: "no-store",
  });

  const payload = (await response.json()) as PayPalAccessTokenResponse;

  if (!response.ok || !payload.access_token) {
    console.error("[PAYPAL_REFUND_ACCESS_TOKEN]", {
      status: response.status,
      error: payload.error,
      description: payload.error_description,
    });

    throw new AdminAppointmentRefundError(
      "PAYPAL_REFUND_REJECTED",
      "PayPal refuse actuellement l’authentification du remboursement.",
      502,
    );
  }

  return payload.access_token;
}

async function getPayPalCapture(
  accessToken: string,
  captureId: string,
): Promise<PayPalCaptureResponse> {
  const response = await fetch(
    `${getPayPalBaseUrl()}/v2/payments/captures/${encodeURIComponent(
      captureId,
    )}`,
    {
      method: "GET",

      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },

      cache: "no-store",
    },
  );

  const payload = (await response.json()) as PayPalCaptureResponse;

  if (response.status === 404) {
    throw new AdminAppointmentRefundError(
      "PAYPAL_CAPTURE_NOT_FOUND",
      "La capture PayPal associée à ce rendez-vous est introuvable.",
      404,
    );
  }

  if (!response.ok) {
    console.error("[PAYPAL_REFUND_CAPTURE_READ]", {
      captureId,
      status: response.status,
      payload,
    });

    throw new AdminAppointmentRefundError(
      "PAYPAL_CAPTURE_INVALID",
      "Impossible de vérifier le paiement auprès de PayPal.",
      502,
    );
  }

  return payload;
}

async function createPayPalRefund(
  accessToken: string,
  captureId: string,
  requestId: string,
): Promise<PayPalRefundResponse> {
  const response = await fetch(
    `${getPayPalBaseUrl()}/v2/payments/captures/${encodeURIComponent(
      captureId,
    )}/refund`,
    {
      method: "POST",

      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
        "Content-Type": "application/json",
        "PayPal-Request-Id": requestId,
        Prefer: "return=representation",
      },

      body: JSON.stringify({}),
      cache: "no-store",
    },
  );

  const payload = (await response.json()) as PayPalRefundResponse;

  if (!response.ok) {
    console.error("[PAYPAL_REFUND_CREATE]", {
      captureId,
      requestId,
      status: response.status,
      message: payload.message,
      details: payload.details,
    });

    throw new AdminAppointmentRefundError(
      "PAYPAL_REFUND_REJECTED",
      payload.details?.[0]?.description ??
        payload.message ??
        "PayPal a refusé le remboursement.",
      response.status >= 500 ? 502 : 422,
    );
  }

  return payload;
}

async function getPayPalRefund(
  accessToken: string,
  refundId: string,
): Promise<PayPalRefundResponse> {
  const response = await fetch(
    `${getPayPalBaseUrl()}/v2/payments/refunds/${encodeURIComponent(refundId)}`,
    {
      method: "GET",

      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },

      cache: "no-store",
    },
  );

  const payload = (await response.json()) as PayPalRefundResponse;

  if (response.status === 404) {
    throw new AdminAppointmentRefundError(
      "PAYPAL_REFUND_NOT_FOUND",
      "Le remboursement enregistré est introuvable chez PayPal.",
      404,
    );
  }

  if (!response.ok) {
    console.error("[PAYPAL_REFUND_READ]", {
      refundId,
      status: response.status,
      payload,
    });

    throw new AdminAppointmentRefundError(
      "PAYPAL_REFUND_REJECTED",
      "Impossible de synchroniser le remboursement avec PayPal.",
      502,
    );
  }

  return payload;
}

/* -------------------------------------------------------------------------- */
/*                         AUTORISATION ADMINISTRATEUR                        */
/* -------------------------------------------------------------------------- */

async function getAuthorizedActor(actorId: string): Promise<{
  id: string;
  displayName: string;
}> {
  const actor = await prisma.user.findFirst({
    where: {
      id: actorId,
      status: "ACTIVE",

      role: {
        in: [...ALLOWED_ADMIN_ROLES],
      },
    },

    select: {
      id: true,
      firstName: true,
      lastName: true,
    },
  });

  if (!actor) {
    throw new AdminAppointmentRefundError(
      "FORBIDDEN",
      "Seuls les administrateurs peuvent effectuer un remboursement.",
      403,
    );
  }

  return {
    id: actor.id,

    displayName:
      [actor.firstName, actor.lastName].filter(Boolean).join(" ").trim() ||
      "Administrateur",
  };
}

/* -------------------------------------------------------------------------- */
/*                           VALIDATION DES MONTANTS                          */
/* -------------------------------------------------------------------------- */

function validatePayPalAmount(
  payload: {
    amount?: PayPalMoney;
  },
  expectedAmountCents: number,
): number {
  const expectedValue = centsToPayPalValue(expectedAmountCents);

  const actualValue = payload.amount?.value ?? null;

  const currency = payload.amount?.currency_code ?? null;

  if (currency !== "EUR" || actualValue !== expectedValue) {
    throw new AdminAppointmentRefundError(
      "PAYPAL_AMOUNT_MISMATCH",
      "Le montant retourné par PayPal ne correspond pas au paiement du rendez-vous.",
      422,
    );
  }

  const amountCents = payPalValueToCents(actualValue);

  if (amountCents !== expectedAmountCents) {
    throw new AdminAppointmentRefundError(
      "PAYPAL_AMOUNT_MISMATCH",
      "Le montant remboursé ne correspond pas au montant encaissé.",
      422,
    );
  }

  return amountCents;
}

/* -------------------------------------------------------------------------- */
/*                         CLÉ IDEMPOTENTE LOCALE                             */
/* -------------------------------------------------------------------------- */

async function claimRefundRequestId(appointmentId: string): Promise<string> {
  const generatedRequestId = randomUUID();

  await prisma.appointment.updateMany({
    where: {
      id: appointmentId,

      paymentStatus: PaymentStatus.PAID,

      paypalRefundId: null,

      paypalRefundRequestId: null,
    },

    data: {
      paypalRefundRequestId: generatedRequestId,
    },
  });

  const current = await prisma.appointment.findUnique({
    where: {
      id: appointmentId,
    },

    select: {
      paymentStatus: true,

      paypalRefundId: true,

      paypalRefundRequestId: true,

      paypalRefundStatus: true,
    },
  });

  if (!current) {
    throw new AdminAppointmentRefundError(
      "NOT_FOUND",
      "Le rendez-vous est introuvable.",
      404,
    );
  }

  if (
    current.paymentStatus === PaymentStatus.REFUNDED &&
    current.paypalRefundId
  ) {
    throw new AdminAppointmentRefundError(
      "ALREADY_REFUNDED",
      "Ce paiement a déjà été remboursé.",
      409,
    );
  }

  if (current.paypalRefundId || current.paypalRefundStatus === "PENDING") {
    throw new AdminAppointmentRefundError(
      "REFUND_IN_PROGRESS",
      "Un remboursement existe déjà pour ce paiement.",
      409,
    );
  }

  if (!current.paypalRefundRequestId) {
    throw new AdminAppointmentRefundError(
      "CONFLICT",
      "Le remboursement n’a pas pu être réservé. Rechargez la fiche puis réessayez.",
      409,
    );
  }

  return current.paypalRefundRequestId;
}

/* -------------------------------------------------------------------------- */
/*                    ENREGISTREMENT D'UN REMBOURSEMENT                       */
/* -------------------------------------------------------------------------- */

async function saveRefundState(input: {
  appointment: {
    id: string;
    reference: string;
    clientId: string;
    status:
      | "PENDING"
      | "CONFIRMED"
      | "IN_PROGRESS"
      | "COMPLETED"
      | "REFUSED"
      | "CANCELLED_BY_CLIENT"
      | "CANCELLED_BY_ADMIN"
      | "NO_SHOW"
      | "EXPIRED";

    paymentStatus: PaymentStatus;
    paymentMethod: PaymentMethod | null;

    depositCents: number;

    paypalOrderId: string | null;
    paypalCaptureId: string;
    paypalRefundRequestId: string;
  };

  /*
   * `null` identifie un remboursement synchronisé
   * automatiquement (webhook PayPal), sans acteur
   * administrateur humain.
   */
  actor: {
    id: string;
    displayName: string;
  } | null;

  reason: string;

  refund: PayPalRefundResponse;

  synchronized: boolean;
}): Promise<AdminAppointmentRefundResult> {
  const refundId = input.refund.id?.trim();

  if (!refundId) {
    throw new AdminAppointmentRefundError(
      "PAYPAL_REFUND_REJECTED",
      "PayPal n’a pas retourné l’identifiant du remboursement.",
      502,
    );
  }

  const refundStatus = normalizeRefundStatus(input.refund.status);

  const refundedAmountCents = validatePayPalAmount(
    input.refund,
    input.appointment.depositCents,
  );

  const refundRequestedAt = parsePayPalDate(input.refund.create_time);

  const updatedAt = parsePayPalDate(
    input.refund.update_time,
    refundRequestedAt,
  );

  const isCompleted = refundStatus === "COMPLETED";

  const nextPaymentStatus = isCompleted
    ? PaymentStatus.REFUNDED
    : PaymentStatus.PAID;

  const completedAt = isCompleted ? updatedAt : null;

  const historyAction = isCompleted
    ? "PAYPAL_REFUND_COMPLETED"
    : refundStatus === "PENDING"
      ? "PAYPAL_REFUND_PENDING"
      : `PAYPAL_REFUND_${refundStatus}`;

  await prisma.$transaction(
    async (transaction) => {
      const current = await transaction.appointment.findUnique({
        where: {
          id: input.appointment.id,
        },

        select: {
          paymentStatus: true,

          paypalRefundId: true,

          paypalRefundStatus: true,

          refundedAt: true,
        },
      });

      if (!current) {
        throw new AdminAppointmentRefundError(
          "NOT_FOUND",
          "Le rendez-vous est introuvable.",
          404,
        );
      }

      const alreadySaved =
        current.paypalRefundId === refundId &&
        current.paypalRefundStatus === refundStatus &&
        (!isCompleted ||
          (current.paymentStatus === PaymentStatus.REFUNDED &&
            current.refundedAt !== null));

      if (alreadySaved) {
        return;
      }

      await transaction.appointment.update({
        where: {
          id: input.appointment.id,
        },

        data: {
          paymentStatus: nextPaymentStatus,

          paypalRefundId: refundId,

          paypalRefundStatus: refundStatus,

          refundRequestedAt,

          refundedAmountCents,

          refundedAt: completedAt,

          refundReason: input.reason,

          refundedById: input.actor?.id ?? null,
        },
      });

      await transaction.appointmentHistory.create({
        data: {
          appointmentId: input.appointment.id,

          actorId: input.actor?.id ?? null,

          action: historyAction,

          previousStatus: input.appointment.status,

          nextStatus: input.appointment.status,

          reason: input.reason,

          metadata: toJsonValue({
            source: input.actor
              ? input.synchronized
                ? "ADMIN_PAYPAL_REFUND_SYNC"
                : "ADMIN_PAYPAL_REFUND"
              : "PAYPAL_WEBHOOK_REFUND",

            paypalOrderId: input.appointment.paypalOrderId,

            paypalCaptureId: input.appointment.paypalCaptureId,

            paypalRefundId: refundId,

            paypalRefundRequestId: input.appointment.paypalRefundRequestId,

            paypalRefundStatus: refundStatus,

            statusDetailsReason: input.refund.status_details?.reason ?? null,

            refundedAmountCents,

            currency: "EUR",

            refundRequestedAt: refundRequestedAt.toISOString(),

            refundedAt: completedAt?.toISOString() ?? null,

            actorName: input.actor?.displayName ?? "PayPal (webhook)",
          }),
        },
      });

      await transaction.auditLog.create({
        data: {
          actorId: input.actor?.id ?? null,

          action: historyAction,

          entityType: "Appointment",

          entityId: input.appointment.id,

          metadata: toJsonValue({
            reference: input.appointment.reference,

            clientId: input.appointment.clientId,

            paypalOrderId: input.appointment.paypalOrderId,

            paypalCaptureId: input.appointment.paypalCaptureId,

            paypalRefundId: refundId,

            paypalRefundRequestId: input.appointment.paypalRefundRequestId,

            paypalRefundStatus: refundStatus,

            statusDetailsReason: input.refund.status_details?.reason ?? null,

            refundedAmountCents,

            currency: "EUR",

            reason: input.reason,

            refundRequestedAt: refundRequestedAt.toISOString(),

            refundedAt: completedAt?.toISOString() ?? null,
          }),
        },
      });
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    },
  );

  return {
    appointmentId: input.appointment.id,

    reference: input.appointment.reference,

    paymentStatus: nextPaymentStatus,

    paypalCaptureId: input.appointment.paypalCaptureId,

    paypalRefundId: refundId,

    paypalRefundRequestId: input.appointment.paypalRefundRequestId,

    paypalRefundStatus: refundStatus,

    refundedAmountCents,

    refundRequestedAt,

    refundedAt: completedAt,

    refundReason: input.reason,

    alreadyRefunded: isCompleted,

    synchronized: input.synchronized,
  };
}

/* -------------------------------------------------------------------------- */
/*                      CRÉATION DU REMBOURSEMENT ADMIN                       */
/* -------------------------------------------------------------------------- */

export async function refundAdminAppointmentPayPal(input: {
  reference: string;
  actorId: string;
  reason: string;
}): Promise<AdminAppointmentRefundResult> {
  const reference = input.reference.trim().toUpperCase();

  const actorId = input.actorId.trim();

  const reason = normalizeReason(input.reason);

  if (!reference || !actorId) {
    throw new AdminAppointmentRefundError(
      "FORBIDDEN",
      "La demande de remboursement est invalide.",
      403,
    );
  }

  const actor = await getAuthorizedActor(actorId);

  const appointment = await prisma.appointment.findUnique({
    where: {
      reference,
    },

    select: {
      id: true,
      reference: true,
      clientId: true,
      status: true,

      paymentStatus: true,
      paymentMethod: true,

      depositCents: true,

      paypalOrderId: true,
      paypalCaptureId: true,

      paypalRefundId: true,
      paypalRefundRequestId: true,
      paypalRefundStatus: true,

      refundRequestedAt: true,

      refundedAmountCents: true,
      refundedAt: true,
      refundReason: true,
    },
  });

  if (!appointment) {
    throw new AdminAppointmentRefundError(
      "NOT_FOUND",
      "Le rendez-vous est introuvable.",
      404,
    );
  }

  if (
    appointment.paymentStatus === PaymentStatus.REFUNDED &&
    appointment.paypalRefundId &&
    appointment.paypalRefundRequestId &&
    appointment.refundRequestedAt
  ) {
    return {
      appointmentId: appointment.id,

      reference: appointment.reference,

      paymentStatus: PaymentStatus.REFUNDED,

      paypalCaptureId: appointment.paypalCaptureId ?? "",

      paypalRefundId: appointment.paypalRefundId,

      paypalRefundRequestId: appointment.paypalRefundRequestId,

      paypalRefundStatus: "COMPLETED",

      refundedAmountCents: appointment.refundedAmountCents,

      refundRequestedAt: appointment.refundRequestedAt,

      refundedAt: appointment.refundedAt,

      refundReason: appointment.refundReason,

      alreadyRefunded: true,

      synchronized: false,
    };
  }

  if (
    appointment.paypalRefundId ||
    appointment.paypalRefundStatus === "PENDING"
  ) {
    throw new AdminAppointmentRefundError(
      "REFUND_IN_PROGRESS",
      "Un remboursement est déjà en cours pour ce rendez-vous.",
      409,
    );
  }

  if (appointment.paymentMethod !== PaymentMethod.PAYPAL) {
    throw new AdminAppointmentRefundError(
      "INVALID_PAYMENT",
      "Ce rendez-vous n’a pas été réglé avec PayPal.",
      422,
    );
  }

  if (appointment.paymentStatus !== PaymentStatus.PAID) {
    throw new AdminAppointmentRefundError(
      "INVALID_PAYMENT",
      "Seul un paiement PayPal encaissé peut être remboursé.",
      422,
    );
  }

  if (!appointment.paypalCaptureId) {
    throw new AdminAppointmentRefundError(
      "INVALID_PAYMENT",
      "L’identifiant de capture PayPal est absent.",
      422,
    );
  }

  const requestId = await claimRefundRequestId(appointment.id);

  const accessToken = await getPayPalAccessToken();

  const capture = await getPayPalCapture(
    accessToken,
    appointment.paypalCaptureId,
  );

  if (capture.id !== appointment.paypalCaptureId) {
    throw new AdminAppointmentRefundError(
      "PAYPAL_CAPTURE_INVALID",
      "La capture retournée par PayPal ne correspond pas au rendez-vous.",
      422,
    );
  }

  if (capture.status !== "COMPLETED" && capture.status !== "REFUNDED") {
    throw new AdminAppointmentRefundError(
      "PAYPAL_CAPTURE_INVALID",
      `La capture PayPal possède le statut ${capture.status ?? "inconnu"} et ne peut pas être remboursée.`,
      422,
    );
  }

  validatePayPalAmount(capture, appointment.depositCents);

  const refund = await createPayPalRefund(
    accessToken,
    appointment.paypalCaptureId,
    requestId,
  );

  return saveRefundState({
    appointment: {
      id: appointment.id,

      reference: appointment.reference,

      clientId: appointment.clientId,

      status: appointment.status,

      paymentStatus: appointment.paymentStatus,

      paymentMethod: appointment.paymentMethod,

      depositCents: appointment.depositCents,

      paypalOrderId: appointment.paypalOrderId,

      paypalCaptureId: appointment.paypalCaptureId,

      paypalRefundRequestId: requestId,
    },

    actor,
    reason,
    refund,

    synchronized: false,
  });
}

/* -------------------------------------------------------------------------- */
/*                      SYNCHRONISATION D'UN REMBOURSEMENT                    */
/* -------------------------------------------------------------------------- */

export async function synchronizeAdminAppointmentPayPalRefund(input: {
  reference: string;
  actorId: string;
}): Promise<AdminAppointmentRefundResult> {
  const reference = input.reference.trim().toUpperCase();

  const actorId = input.actorId.trim();

  if (!reference || !actorId) {
    throw new AdminAppointmentRefundError(
      "FORBIDDEN",
      "La demande de synchronisation est invalide.",
      403,
    );
  }

  const actor = await getAuthorizedActor(actorId);

  const appointment = await prisma.appointment.findUnique({
    where: {
      reference,
    },

    select: {
      id: true,
      reference: true,
      clientId: true,
      status: true,

      paymentStatus: true,
      paymentMethod: true,

      depositCents: true,

      paypalOrderId: true,
      paypalCaptureId: true,

      paypalRefundId: true,
      paypalRefundRequestId: true,
      paypalRefundStatus: true,

      refundRequestedAt: true,

      refundedAmountCents: true,
      refundedAt: true,
      refundReason: true,
    },
  });

  if (!appointment) {
    throw new AdminAppointmentRefundError(
      "NOT_FOUND",
      "Le rendez-vous est introuvable.",
      404,
    );
  }

  if (
    appointment.paymentMethod !== PaymentMethod.PAYPAL ||
    !appointment.paypalCaptureId
  ) {
    throw new AdminAppointmentRefundError(
      "INVALID_PAYMENT",
      "Ce rendez-vous ne possède pas de paiement PayPal synchronisable.",
      422,
    );
  }

  if (!appointment.paypalRefundId || !appointment.paypalRefundRequestId) {
    throw new AdminAppointmentRefundError(
      "PAYPAL_REFUND_NOT_FOUND",
      "Aucun remboursement PayPal n’est enregistré pour ce rendez-vous.",
      404,
    );
  }

  if (
    appointment.paymentStatus === PaymentStatus.REFUNDED &&
    appointment.paypalRefundStatus === "COMPLETED" &&
    appointment.refundRequestedAt
  ) {
    return {
      appointmentId: appointment.id,

      reference: appointment.reference,

      paymentStatus: PaymentStatus.REFUNDED,

      paypalCaptureId: appointment.paypalCaptureId,

      paypalRefundId: appointment.paypalRefundId,

      paypalRefundRequestId: appointment.paypalRefundRequestId,

      paypalRefundStatus: "COMPLETED",

      refundedAmountCents: appointment.refundedAmountCents,

      refundRequestedAt: appointment.refundRequestedAt,

      refundedAt: appointment.refundedAt,

      refundReason: appointment.refundReason,

      alreadyRefunded: true,

      synchronized: true,
    };
  }

  const accessToken = await getPayPalAccessToken();

  const refund = await getPayPalRefund(accessToken, appointment.paypalRefundId);

  if (refund.id !== appointment.paypalRefundId) {
    throw new AdminAppointmentRefundError(
      "PAYPAL_REFUND_NOT_FOUND",
      "Le remboursement retourné par PayPal ne correspond pas au rendez-vous.",
      422,
    );
  }

  const reason =
    appointment.refundReason ?? "Synchronisation du remboursement PayPal.";

  return saveRefundState({
    appointment: {
      id: appointment.id,

      reference: appointment.reference,

      clientId: appointment.clientId,

      status: appointment.status,

      paymentStatus: appointment.paymentStatus,

      paymentMethod: appointment.paymentMethod,

      depositCents: appointment.depositCents,

      paypalOrderId: appointment.paypalOrderId,

      paypalCaptureId: appointment.paypalCaptureId,

      paypalRefundRequestId: appointment.paypalRefundRequestId,
    },

    actor,
    reason,
    refund,

    synchronized: true,
  });
}

export function isTerminalPayPalRefundStatus(status: string | null): boolean {
  return status ? TERMINAL_REFUND_STATUSES.has(status) : false;
}

/* -------------------------------------------------------------------------- */
/*                SYNCHRONISATION DEPUIS LE WEBHOOK PAYPAL                    */
/* -------------------------------------------------------------------------- */

export type RecordPayPalRefundFromWebhookResult =
  | {
      handled: true;
    }
  | {
      handled: false;

      reason:
        | "APPOINTMENT_NOT_FOUND"
        | "MISSING_REFUND_ID"
        | "NOT_PAYPAL_PAYMENT"
        | "REFUND_CONFLICT"
        | "AMOUNT_MISMATCH";
    };

/*
 * PayPal peut notifier un remboursement initié en dehors
 * de l’application (dashboard PayPal, remboursement manuel).
 *
 * Ce chemin met à jour la base sans acteur administrateur,
 * en réutilisant les mêmes garde-fous que le remboursement
 * déclenché depuis l’administration : vérification du
 * montant, idempotence, historique et audit.
 */
export async function recordPayPalRefundFromWebhook(input: {
  paypalCaptureId: string;

  refund: {
    id?: string;
    status?: string;
    amount?: PayPalMoney;
  };
}): Promise<RecordPayPalRefundFromWebhookResult> {
  const captureId = input.paypalCaptureId.trim();

  const refundId = input.refund.id?.trim();

  if (!captureId || !refundId) {
    return {
      handled: false,
      reason: "MISSING_REFUND_ID",
    };
  }

  const appointment = await prisma.appointment.findFirst({
    where: {
      paypalCaptureId: captureId,
    },

    select: {
      id: true,
      reference: true,
      clientId: true,
      status: true,

      paymentStatus: true,
      paymentMethod: true,

      depositCents: true,

      paypalOrderId: true,
      paypalCaptureId: true,

      paypalRefundId: true,
      paypalRefundRequestId: true,

      refundReason: true,
    },
  });

  if (!appointment || !appointment.paypalCaptureId) {
    return {
      handled: false,
      reason: "APPOINTMENT_NOT_FOUND",
    };
  }

  if (appointment.paymentMethod !== PaymentMethod.PAYPAL) {
    return {
      handled: false,
      reason: "NOT_PAYPAL_PAYMENT",
    };
  }

  /*
   * Un remboursement différent est déjà enregistré :
   * on ne l’écrase jamais automatiquement, ça part
   * en revue manuelle (visible dans les journaux d’audit).
   */
  if (appointment.paypalRefundId && appointment.paypalRefundId !== refundId) {
    await prisma.auditLog.create({
      data: {
        action: "PAYPAL_WEBHOOK_REFUND_CONFLICT",

        entityType: "Appointment",
        entityId: appointment.id,

        metadata: toJsonValue({
          reference: appointment.reference,
          existingRefundId: appointment.paypalRefundId,
          incomingRefundId: refundId,
        }),
      },
    });

    return {
      handled: false,
      reason: "REFUND_CONFLICT",
    };
  }

  try {
    validatePayPalAmount(input.refund, appointment.depositCents);
  } catch {
    await prisma.auditLog.create({
      data: {
        action: "PAYPAL_WEBHOOK_REFUND_AMOUNT_MISMATCH",

        entityType: "Appointment",
        entityId: appointment.id,

        metadata: toJsonValue({
          reference: appointment.reference,
          refundId,
          expectedAmountCents: appointment.depositCents,
          receivedAmount: toJsonValue(input.refund.amount ?? {}),
        }),
      },
    });

    return {
      handled: false,
      reason: "AMOUNT_MISMATCH",
    };
  }

  await saveRefundState({
    appointment: {
      id: appointment.id,
      reference: appointment.reference,
      clientId: appointment.clientId,
      status: appointment.status,

      paymentStatus: appointment.paymentStatus,
      paymentMethod: appointment.paymentMethod,

      depositCents: appointment.depositCents,

      paypalOrderId: appointment.paypalOrderId,
      paypalCaptureId: appointment.paypalCaptureId,

      paypalRefundRequestId: appointment.paypalRefundRequestId ?? "",
    },

    actor: null,

    reason:
      appointment.refundReason ??
      "Remboursement synchronisé automatiquement depuis PayPal.",

    refund: input.refund,

    synchronized: true,
  });

  return {
    handled: true,
  };
}
