import { NextResponse } from "next/server";

import { requireClientUser } from "@/lib/session";
import { markAllNotificationsAsRead } from "@/features/notifications/services/notification.service";

export async function PATCH(): Promise<Response> {
  try {
    const user = await requireClientUser();

    const updatedCount =
      await markAllNotificationsAsRead(user.id);

    return NextResponse.json({
      success: true,
      updatedCount,
    });
  } catch (reason: unknown) {
    console.error(
      "[PATCH /api/notifications/read-all]",
      reason,
    );

    return NextResponse.json(
      {
        message:
          reason instanceof Error
            ? reason.message
            : "Impossible de marquer les notifications comme lues.",
      },
      { status: 500 },
    );
  }
}
