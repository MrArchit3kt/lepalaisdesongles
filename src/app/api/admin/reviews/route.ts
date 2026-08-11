import { NextResponse } from "next/server";
import { ZodError } from "zod";

import {
  createAdminReview,
  getAdminReviews,
} from "@/features/admin/reviews/services/admin-reviews.service";
import { adminReviewSchema } from "@/features/admin/reviews/schemas/admin-review.schema";
import { requireAdminApiUser } from "@/lib/api-session";
import { isTrustedRequestOrigin } from "@/lib/security/request-origin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function jsonResponse(body: Record<string, unknown>, status: number) {
  return NextResponse.json(body, {
    status,

    headers: {
      "Cache-Control": "private, no-store, no-cache, max-age=0, must-revalidate",
    },
  });
}

export async function GET(): Promise<Response> {
  const { user, response } = await requireAdminApiUser([
    "SUPER_ADMIN",
    "ADMIN",
    "STAFF",
  ]);

  if (!user) {
    return response;
  }

  try {
    const reviews = await getAdminReviews();

    return jsonResponse({ reviews }, 200);
  } catch (error) {
    console.error("[ADMIN_REVIEWS_GET]", error);

    return jsonResponse({ error: "Impossible de charger les avis." }, 500);
  }
}

export async function POST(request: Request): Promise<Response> {
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
    const body: unknown = await request.json();

    const payload = adminReviewSchema.parse(body);

    const review = await createAdminReview(payload);

    return jsonResponse(
      { success: true, id: review.id, message: "L’avis a été ajouté." },
      201,
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return jsonResponse(
        {
          error: error.issues[0]?.message ?? "Les informations saisies sont invalides.",
        },
        400,
      );
    }

    console.error("[ADMIN_REVIEWS_POST]", error);

    return jsonResponse({ error: "Impossible d’ajouter cet avis." }, 400);
  }
}
