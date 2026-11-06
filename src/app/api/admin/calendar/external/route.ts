import { NextResponse } from "next/server";

import { addExternalCalendar, listExternalCalendars } from "@/features/calendar-import/service";
import { requireAdminApiUser } from "@/lib/api-session";
import { isTrustedRequestOrigin } from "@/lib/security/request-origin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PERMISSIONS: ["SUPER_ADMIN", "ADMIN", "STAFF"] = ["SUPER_ADMIN", "ADMIN", "STAFF"];

export async function GET(): Promise<Response> {
  const { user, response } = await requireAdminApiUser(PERMISSIONS);

  if (!user) {
    return response;
  }

  const calendars = await listExternalCalendars();

  return NextResponse.json({
    calendars: calendars.map((calendar) => ({
      id: calendar.id,
      name: calendar.name,
      url: calendar.url,
      busyCount: calendar._count.busyBlocks,
      lastSyncedAt: calendar.lastSyncedAt,
      error: calendar.lastError,
    })),
  });
}

export async function POST(request: Request): Promise<Response> {
  if (!isTrustedRequestOrigin(request)) {
    return NextResponse.json({ error: "L’origine de la requête n’est pas autorisée." }, { status: 403 });
  }

  const { user, response } = await requireAdminApiUser(PERMISSIONS);

  if (!user) {
    return response;
  }

  const body = (await request.json().catch(() => ({}))) as { url?: unknown; name?: unknown };
  const url = typeof body.url === "string" ? body.url.trim() : "";
  const name = typeof body.name === "string" ? body.name.trim() : null;

  if (url.length < 8) {
    return NextResponse.json({ error: "Collez le lien iCal de l’agenda." }, { status: 400 });
  }

  const result = await addExternalCalendar(url, name || null);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ events: result.events });
}
