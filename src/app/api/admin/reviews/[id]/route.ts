import { NextResponse } from "next/server";
import { ZodError } from "zod";

import {
  AdminReviewNotFoundError,
  deleteAdminReview,
  updateAdminReview,
} from "@/features/admin/reviews/services/admin-reviews.service";
import { adminReviewSchema } from "@/features/admin/reviews/schemas/admin-review.schema";
import { requireAdminApiUser } from "@/lib/api-session";
import { isTrustedRequestOrigin } from "@/lib/security/request-origin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function jsonResponse(body: Record<string, unknown>, status: number) {
  return NextResponse.json(body, {
    status,

    headers: {
      "Cache-Control": "private, no-store, no-cache, max-age=0, must-revalidate",
    },
  });
}

export async function PATCH(
  request: Request,
  context: RouteContext,
): Promise<Response> {
  if (!isTrustedRequestOrigin(request)) {
    return jsonResponse(
      { error: "L’origine de la requête n’est pas autorisée." },
      403,
    );
  }

  const { user, response } = await requireAdminApiUser([
    "SUPER_ADMIN",
    "ADMIN",
    "STAFF",
  ]);

  if (!user) {
    return response;
  }

  try {
    const { id } = await context.params;

    const body: unknown = await request.json();

    const payload = adminReviewSchema.parse(body);

    await updateAdminReview(id, payload);

    return jsonResponse({ success: true, message: "L’avis a été mis à jour." }, 200);
  } catch (error) {
    if (error instanceof ZodError) {
      return jsonResponse(
        {
          error: error.issues[0]?.message ?? "Les informations saisies sont invalides.",
        },
        400,
      );
    }

    if (error instanceof AdminReviewNotFoundError) {
      return jsonResponse({ error: error.message }, 404);
    }

    console.error("[ADMIN_REVIEWS_PATCH]", error);

    return jsonResponse({ error: "Impossible de modifier cet avis." }, 400);
  }
}

export async function DELETE(
  request: Request,
  context: RouteContext,
): Promise<Response> {
  if (!isTrustedRequestOrigin(request)) {
    return jsonResponse(
      { error: "L’origine de la requête n’est pas autorisée." },
      403,
    );
  }

  const { user, response } = await requireAdminApiUser([
    "SUPER_ADMIN",
    "ADMIN",
    "STAFF",
  ]);

  if (!user) {
    return response;
  }

  try {
    const { id } = await context.params;

    await deleteAdminReview(id);

    return jsonResponse({ success: true, message: "L’avis a été supprimé." }, 200);
  } catch (error) {
    if (error instanceof AdminReviewNotFoundError) {
      return jsonResponse({ error: error.message }, 404);
    }

    console.error("[ADMIN_REVIEWS_DELETE]", error);

    return jsonResponse({ error: "Impossible de supprimer cet avis." }, 400);
  }
}
