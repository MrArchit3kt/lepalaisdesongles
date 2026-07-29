import {
    NextResponse,
  } from "next/server";
  
  import {
    deleteAllReadNotifications,
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
  /*                                  DELETE                                    */
  /* -------------------------------------------------------------------------- */
  
  export async function DELETE(): Promise<Response> {
    try {
      const user =
        await requireAdminUser();
  
      const deletedCount =
        await deleteAllReadNotifications(
          user.id,
        );
  
      return NextResponse.json({
        success: true,
        deletedCount,
      });
    } catch (
      reason: unknown
    ) {
      console.error(
        "[DELETE /api/admin/notifications/delete-read]",
        reason,
      );
  
      return jsonError(
        reason instanceof Error
          ? reason.message
          : "Impossible de supprimer les notifications lues.",
        500,
      );
    }
  }