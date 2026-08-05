import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

import {
  AdminCreateAppointmentError,
  adminCreateAppointment,
} from "@/features/admin/appointments/services/admin-create-appointment.service";
import { adminCreateAppointmentSchema } from "@/features/admin/appointments/schemas/admin-create-appointment.schema";
import { authOptions } from "@/lib/auth";
import { isTrustedRequestOrigin } from "@/lib/security/request-origin";

export const runtime = "nodejs";

export const dynamic = "force-dynamic";

type SessionUser = {
  id?: string;
  role?: string;
  name?: string | null;
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

    const payload = adminCreateAppointmentSchema.parse(body);

    const result = await adminCreateAppointment(payload, {
      id: user.id,
      displayName: user.name?.trim() || "un membre de l’équipe",
    });

    return jsonResponse(
      {
        success: true,

        message: result.requiresPayment
          ? "Le rendez-vous a été créé. Une demande de paiement d’acompte a été envoyée à la cliente."
          : "Le rendez-vous a été créé et confirmé.",

        appointment: {
          reference: result.reference,
          status: result.status,
          paymentStatus: result.paymentStatus,
          depositCents: result.depositCents,
          requiresPayment: result.requiresPayment,
        },
      },
      201,
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

    if (error instanceof AdminCreateAppointmentError) {
      return jsonResponse(
        {
          success: false,

          error: error.message,

          code: error.code,
        },
        error.status,
      );
    }

    const message =
      error instanceof Error
        ? error.message
        : "Impossible de créer le rendez-vous.";

    /*
     * createAppointment() (partagée avec le tunnel public) lève des
     * erreurs métier en clair (créneau indisponible, prestation
     * inactive...) : on les relaie telles quelles, elles ne
     * contiennent aucune information technique sensible.
     */
    console.error("[ADMIN_APPOINTMENT_CREATE]", error);

    return jsonResponse(
      {
        success: false,

        error: message,
      },
      400,
    );
  }
}
