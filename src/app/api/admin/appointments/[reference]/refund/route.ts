import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z, ZodError } from "zod";

import {
  AdminAppointmentRefundError,
  refundAdminAppointmentPayPal,
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

const refundSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(5, "Le motif doit contenir au moins 5 caractères.")
    .max(500, "Le motif ne peut pas dépasser 500 caractères."),
});

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

    const parsed = refundSchema.parse(body);

    const result = await refundAdminAppointmentPayPal({
      reference: cleanReference,

      actorId: user.id,

      reason: parsed.reason,
    });

    return jsonResponse(
      {
        success: true,

        message: result.alreadyRefunded
          ? "Ce paiement avait déjà été remboursé."
          : "Le paiement PayPal a été remboursé avec succès.",

        refund: {
          reference: result.reference,

          paymentStatus: result.paymentStatus,

          paypalCaptureId: result.paypalCaptureId,

          paypalRefundId: result.paypalRefundId,

          paypalRefundRequestId: result.paypalRefundRequestId,

          refundedAmountCents: result.refundedAmountCents,

          refundedAt: result.refundedAt?.toISOString() ?? null,

          alreadyRefunded: result.alreadyRefunded,
        },
      },
      result.alreadyRefunded ? 200 : 201,
    );
  } catch (error: unknown) {
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

    console.error("[ADMIN_APPOINTMENT_PAYPAL_REFUND]", error);

    return jsonResponse(
      {
        success: false,

        error: "Une erreur interne empêche le remboursement.",
      },
      500,
    );
  }
}
