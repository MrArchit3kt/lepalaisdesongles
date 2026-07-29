import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { ZodError, z } from "zod";

import { authOptions } from "@/lib/auth";

import { executeAdminGiftCardMutation } from "@/features/admin/gift-cards/services/admin-gift-card-actions.service";
import { GiftCardServiceError } from "@/features/gift-cards/services/gift-card.service";

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

const mutationSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("REDEEM"),
    amountCents: z.number().int().positive(),
    note: z.string().trim().max(500).optional(),
  }),
  z.object({
    action: z.literal("REVERSE_REDEMPTION"),
    transactionId: z.string().trim().min(1),
    reason: z.string().trim().min(5).max(500),
  }),
  z.object({
    action: z.literal("CANCEL"),
    reason: z.string().trim().min(5).max(500),
  }),
  z.object({
    action: z.literal("REVOKE"),
    reason: z.string().trim().min(5).max(500),
  }),
  z.object({
    action: z.literal("REACTIVATE"),
    reason: z.string().trim().min(5).max(500),
  }),
]);

function getStatusCode(error: GiftCardServiceError): number {
  switch (error.code) {
    case "NOT_FOUND":
      return 404;
    case "CONFLICT":
    case "ALREADY_REVERSED":
      return 409;
    case "FORBIDDEN_OPERATION":
      return 403;
    case "INVALID_STATUS":
    case "INVALID_AMOUNT":
    case "EXPIRED":
      return 422;
    default:
      return 400;
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions);

    const user = session?.user as SessionUser | undefined;

    if (
      !user?.id ||
      !["SUPER_ADMIN", "ADMIN", "STAFF"].includes(user.role ?? "")
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Accès administrateur refusé.",
        },
        {
          status: 403,
        },
      );
    }

    const { reference } = await context.params;

    const mutation = mutationSchema.parse(await request.json());

    const result = await executeAdminGiftCardMutation({
      reference: decodeURIComponent(reference),
      actorId: user.id,
      mutation,
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          error:
            error.issues[0]?.message ?? "Les données envoyées sont invalides.",
        },
        {
          status: 400,
        },
      );
    }

    if (error instanceof GiftCardServiceError) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          code: error.code,
        },
        {
          status: getStatusCode(error),
        },
      );
    }

    console.error("[ADMIN_GIFT_CARD_MUTATION]", error);

    return NextResponse.json(
      {
        success: false,
        error: "Une erreur interne empêche cette opération.",
      },
      {
        status: 500,
      },
    );
  }
}
