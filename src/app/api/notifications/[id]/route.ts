import { NextResponse } from "next/server";

import { requireClientUser } from "@/lib/session";
import {
  deleteNotification,
  markNotificationAsRead,
  markNotificationAsUnread,
} from "@/features/notifications/services/notification.service";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(
  request: Request,
  context: RouteContext,
): Promise<Response> {
  try {
    const user = await requireClientUser();
    const { id } = await context.params;
    const body = (await request.json()) as {
      isRead?: boolean;
    };

    if (typeof body.isRead !== "boolean") {
      return NextResponse.json(
        {
          message: "Le champ isRead doit être un booléen.",
        },
        { status: 400 },
      );
    }

    const updated = body.isRead
      ? await markNotificationAsRead(user.id, id)
      : await markNotificationAsUnread(user.id, id);

    if (!updated) {
      return NextResponse.json(
        {
          message:
            "Notification introuvable ou déjà dans cet état.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      isRead: body.isRead,
    });
  } catch (reason: unknown) {
    console.error(
      "[PATCH /api/notifications/:id]",
      reason,
    );

    return NextResponse.json(
      {
        message:
          reason instanceof Error
            ? reason.message
            : "Impossible de mettre à jour la notification.",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  context: RouteContext,
): Promise<Response> {
  try {
    const user = await requireClientUser();
    const { id } = await context.params;

    const deleted = await deleteNotification(
      user.id,
      id,
    );

    if (!deleted) {
      return NextResponse.json(
        { message: "Notification introuvable." },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (reason: unknown) {
    console.error(
      "[DELETE /api/notifications/:id]",
      reason,
    );

    return NextResponse.json(
      {
        message:
          reason instanceof Error
            ? reason.message
            : "Impossible de supprimer la notification.",
      },
      { status: 500 },
    );
  }
}
