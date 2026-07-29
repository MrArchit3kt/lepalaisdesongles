import {
  NextResponse,
} from "next/server";

import {
  deleteNotification,
  markNotificationAsRead,
  markNotificationAsUnread,
} from "@/features/notifications/services/notification.service";

import {
  requireAdminUser,
} from "@/lib/session";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type UpdateNotificationBody = {
  isRead?: unknown;
};

/* -------------------------------------------------------------------------- */
/*                                CONFIGURATION                               */
/* -------------------------------------------------------------------------- */

export const dynamic =
  "force-dynamic";

export const runtime =
  "nodejs";

/* -------------------------------------------------------------------------- */
/*                                  HELPERS                                   */
/* -------------------------------------------------------------------------- */

function jsonError(
  message: string,
  status: number,
): Response {
  return NextResponse.json(
    {
      success: false,
      message,
    },
    {
      status,
    },
  );
}

/* -------------------------------------------------------------------------- */
/*                                   PATCH                                    */
/* -------------------------------------------------------------------------- */

export async function PATCH(
  request: Request,
  context: RouteContext,
): Promise<Response> {
  try {
    const user =
      await requireAdminUser();

    const {
      id,
    } =
      await context.params;

    const body =
      (await request.json()) as UpdateNotificationBody;

    if (
      typeof body.isRead !==
      "boolean"
    ) {
      return jsonError(
        "La propriété isRead doit être un booléen.",
        400,
      );
    }

    const updated =
      body.isRead
        ? await markNotificationAsRead(
            user.id,
            id,
          )
        : await markNotificationAsUnread(
            user.id,
            id,
          );

    if (!updated) {
      return jsonError(
        "Notification introuvable ou déjà dans cet état.",
        404,
      );
    }

    return NextResponse.json({
      success: true,
      id,
      isRead:
        body.isRead,
    });
  } catch (
    reason: unknown
  ) {
    console.error(
      "[PATCH /api/admin/notifications/:id]",
      reason,
    );

    return jsonError(
      reason instanceof Error
        ? reason.message
        : "Impossible de mettre à jour la notification.",
      500,
    );
  }
}

/* -------------------------------------------------------------------------- */
/*                                  DELETE                                    */
/* -------------------------------------------------------------------------- */

export async function DELETE(
  _request: Request,
  context: RouteContext,
): Promise<Response> {
  try {
    const user =
      await requireAdminUser();

    const {
      id,
    } =
      await context.params;

    const deleted =
      await deleteNotification(
        user.id,
        id,
      );

    if (!deleted) {
      return jsonError(
        "Notification introuvable.",
        404,
      );
    }

    return NextResponse.json({
      success: true,
      id,
    });
  } catch (
    reason: unknown
  ) {
    console.error(
      "[DELETE /api/admin/notifications/:id]",
      reason,
    );

    return jsonError(
      reason instanceof Error
        ? reason.message
        : "Impossible de supprimer la notification.",
      500,
    );
  }
}
