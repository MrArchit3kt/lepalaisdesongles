import { NextResponse } from "next/server";

import { requireClientUser } from "@/lib/session";
import { listNotifications } from "@/features/notifications/services/notification.service";

export const dynamic = "force-dynamic";

function parsePositiveInteger(value: string | null): number | undefined {
  if (!value) return undefined;

  const parsed = Number.parseInt(value, 10);

  return Number.isFinite(parsed) && parsed > 0
    ? parsed
    : undefined;
}

export async function GET(request: Request): Promise<Response> {
  try {
    const user = await requireClientUser();
    const url = new URL(request.url);

    const result = await listNotifications({
      userId: user.id,
      page: parsePositiveInteger(url.searchParams.get("page")),
      pageSize: parsePositiveInteger(
        url.searchParams.get("pageSize"),
      ),
      unreadOnly:
        url.searchParams.get("unreadOnly") === "1" ||
        url.searchParams.get("unreadOnly") === "true",
    });

    return NextResponse.json(result);
  } catch (reason: unknown) {
    console.error("[GET /api/notifications]", reason);

    return NextResponse.json(
      {
        message:
          reason instanceof Error
            ? reason.message
            : "Impossible de récupérer les notifications.",
      },
      { status: 500 },
    );
  }
}
