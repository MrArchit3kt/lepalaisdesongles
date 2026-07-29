import {
  NextResponse,
} from "next/server";

import {
  markAllNotificationsAsRead,
} from "@/features/notifications/services/notification.service";

import {
  requireAdminUser,
} from "@/lib/session";

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
/*                                   POST                                     */
/* -------------------------------------------------------------------------- */

export async function POST(): Promise<Response> {
  try {
    const user =
      await requireAdminUser();

    const updatedCount =
      await markAllNotificationsAsRead(
        user.id,
      );

    return NextResponse.json({
      success: true,
      updatedCount,
      unreadCount: 0,
    });
  } catch (
    reason: unknown
  ) {
    console.error(
      "[POST /api/admin/notifications/read-all]",
      reason,
    );

    return jsonError(
      reason instanceof Error
        ? reason.message
        : "Impossible de marquer les notifications comme lues.",
      500,
    );
  }
}
