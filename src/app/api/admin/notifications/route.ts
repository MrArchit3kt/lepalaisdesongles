import { NextResponse } from "next/server";

import { listNotifications } from "@/features/notifications/services/notification.service";
import { requireAdminUser } from "@/lib/session";

export const dynamic = "force-dynamic";

function parsePositiveInteger(
  value: string | null,
  fallback: number,
): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);

  if (
    !Number.isFinite(parsed) ||
    parsed <= 0
  ) {
    return fallback;
  }

  return Math.trunc(parsed);
}

export async function GET(
  request: Request,
) {
  try {
    const user =
      await requireAdminUser();

    const { searchParams } =
      new URL(request.url);

    const page =
      parsePositiveInteger(
        searchParams.get("page"),
        1,
      );

    const pageSize =
      parsePositiveInteger(
        searchParams.get(
          "pageSize",
        ),
        20,
      );

    const unreadOnly =
      searchParams.get(
        "unreadOnly",
      ) === "true";

    const result =
      await listNotifications({
        userId: user.id,
        page,
        pageSize,
        unreadOnly,
      });

    return NextResponse.json(
      result,
    );
  } catch (error) {
    console.error(
      error,
    );

    return NextResponse.json(
      {
        message:
          "Impossible de récupérer les notifications.",
      },
      {
        status: 500,
      },
    );
  }
}