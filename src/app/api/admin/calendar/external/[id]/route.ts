import { NextResponse } from "next/server";

import { removeExternalCalendar, syncExternalCalendar } from "@/features/calendar-import/service";
import { requireAdminApiUser } from "@/lib/api-session";
import { isTrustedRequestOrigin } from "@/lib/security/request-origin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PERMISSIONS: ["SUPER_ADMIN", "ADMIN", "STAFF"] = ["SUPER_ADMIN", "ADMIN", "STAFF"];

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }): Promise<Response> {
  if (!isTrustedRequestOrigin(request)) {
    return NextResponse.json({ error: "L’origine de la requête n’est pas autorisée." }, { status: 403 });
  }

  const { user, response } = await requireAdminApiUser(PERMISSIONS);

  if (!user) {
    return response;
  }

  const { id } = await params;
  const removed = await removeExternalCalendar(id);

  return NextResponse.json({ ok: removed });
}

/* Re-synchronise un agenda à la demande. */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }): Promise<Response> {
  if (!isTrustedRequestOrigin(request)) {
    return NextResponse.json({ error: "L’origine de la requête n’est pas autorisée." }, { status: 403 });
  }

  const { user, response } = await requireAdminApiUser(PERMISSIONS);

  if (!user) {
    return response;
  }

  const { id } = await params;
  await syncExternalCalendar(id);

  return NextResponse.json({ ok: true });
}
