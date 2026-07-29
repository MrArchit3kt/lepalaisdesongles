import { NextResponse } from "next/server";

import { requireClientUser } from "@/lib/session";
import { deleteAllReadNotifications } from "@/features/notifications/services/notification.service";

export async function DELETE(): Promise<Response> {
  try {
    const user = await requireClientUser();

    const deletedCount =
      await deleteAllReadNotifications(user.id);

    return NextResponse.json({
      success: true,
      deletedCount,
    });
  } catch (reason: unknown) {
    console.error(
      "[DELETE /api/notifications/delete-read]",
      reason,
    );

    return NextResponse.json(
      {
        message:
          reason instanceof Error
            ? reason.message
            : "Impossible de supprimer les notifications lues.",
      },
      { status: 500 },
    );
  }
}
