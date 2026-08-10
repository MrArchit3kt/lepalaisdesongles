import { NextResponse } from "next/server";

import { getCalendarFeedIcs } from "@/features/admin/calendar/services/admin-calendar-feed.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/*
 * Flux ICS public, authentifié par jeton (?token=...) plutôt que par
 * session : les applications de calendrier (Calendrier iPhone, etc.)
 * interrogent cette URL périodiquement sans cookie de session.
 */
export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);

  const token = searchParams.get("token") ?? "";

  const icsContent = await getCalendarFeedIcs(token);

  if (!icsContent) {
    return NextResponse.json(
      { error: "Lien de synchronisation invalide." },
      { status: 404 },
    );
  }

  return new Response(icsContent, {
    status: 200,

    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="agenda-salon.ics"',

      // Le flux doit rester privé (jeton secret dans l'URL) mais reste
      // interrogeable sans cookie : pas de mise en cache partagée, un
      // court cache navigateur/CDN suffit à limiter la charge entre
      // deux rafraîchissements de l'app de calendrier.
      "Cache-Control": "private, max-age=300",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
