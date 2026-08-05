import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

import {
  AdminAppointmentRefundError,
  synchronizeAdminAppointmentPayPalRefund,
} from "@/features/admin/appointments/services/admin-appointment-refund.service";

import { authOptions } from "@/lib/auth";
import { isTrustedRequestOrigin } from "@/lib/security/request-origin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    reference: string;
  }>;
};

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

export async function POST(
  request: NextRequest,
  context: RouteContext,
): Promise<NextResponse> {
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

    if (!user?.id || !["SUPER_ADMIN", "ADMIN"].includes(user.role ?? "")) {
      return jsonResponse(
        {
          success: false,
          error: "Accès administrateur refusé.",
        },
        403,
      );
    }

    const { reference } = await context.params;

    const cleanReference = reference.trim().toUpperCase();

    if (!cleanReference || cleanReference.length > 64) {
      return jsonResponse(
        {
          success: false,
          error: "La référence du rendez-vous est invalide.",
        },
        400,
      );
    }

    const result = await synchronizeAdminAppointmentPayPalRefund({
      reference: cleanReference,

      actorId: user.id,
    });

    return jsonResponse(
      {
        success: true,

        message:
          result.paypalRefundStatus === "COMPLETED"
            ? "Le remboursement est maintenant terminé."
            : result.paypalRefundStatus === "PENDING"
              ? "Le remboursement est toujours en cours de traitement chez PayPal."
              : `PayPal indique le statut ${result.paypalRefundStatus}.`,

        refund: {
          reference: result.reference,

          paymentStatus: result.paymentStatus,

          paypalCaptureId: result.paypalCaptureId,

          paypalRefundId: result.paypalRefundId,

          paypalRefundRequestId: result.paypalRefundRequestId,

          paypalRefundStatus: result.paypalRefundStatus,

          refundedAmountCents: result.refundedAmountCents,

          refundRequestedAt: result.refundRequestedAt.toISOString(),

          refundedAt: result.refundedAt?.toISOString() ?? null,

          refundReason: result.refundReason,

          alreadyRefunded: result.alreadyRefunded,

          synchronized: true,
        },
      },
      result.paypalRefundStatus === "PENDING" ? 202 : 200,
    );
  } catch (error: unknown) {
    if (error instanceof AdminAppointmentRefundError) {
      return jsonResponse(
        {
          success: false,
          error: error.message,
          code: error.code,
        },
        error.status,
      );
    }

    console.error("[ADMIN_APPOINTMENT_PAYPAL_REFUND_SYNC]", error);

    return jsonResponse(
      {
        success: false,
        error:
          "Une erreur interne empêche la synchronisation du remboursement.",
      },
      500,
    );
  }
}
