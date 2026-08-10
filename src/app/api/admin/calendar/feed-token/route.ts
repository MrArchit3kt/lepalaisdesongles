import { NextResponse } from "next/server";

import {
  getOrCreateCalendarFeedToken,
  regenerateCalendarFeedToken,
} from "@/features/admin/calendar/services/admin-calendar-feed.service";
import { requireAdminApiUser } from "@/lib/api-session";
import { isTrustedRequestOrigin } from "@/lib/security/request-origin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getSiteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.NEXTAUTH_URL?.trim() ||
    "https://lepalaisdesongles.fr"
  ).replace(/\/+$/, "");
}

function buildFeedUrls(token: string): {
  feedUrl: string;
  webcalUrl: string;
} {
  const siteUrl = getSiteUrl();
  const path = `/api/admin/calendar/feed.ics?token=${encodeURIComponent(token)}`;

  return {
    feedUrl: `${siteUrl}${path}`,
    webcalUrl: `webcal://${siteUrl.replace(/^https?:\/\//, "")}${path}`,
  };
}

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
    const token = await getOrCreateCalendarFeedToken(user.id);

    return jsonResponse({ ...buildFeedUrls(token) }, 200);
  } catch (error) {
    console.error("[ADMIN_CALENDAR_FEED_TOKEN_GET]", error);

    return jsonResponse(
      { error: "Impossible de récupérer le lien de synchronisation." },
      500,
    );
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
    const token = await regenerateCalendarFeedToken(user.id);

    return jsonResponse({ ...buildFeedUrls(token) }, 200);
  } catch (error) {
    console.error("[ADMIN_CALENDAR_FEED_TOKEN_POST]", error);

    return jsonResponse(
      { error: "Impossible de régénérer le lien de synchronisation." },
      500,
    );
  }
}
