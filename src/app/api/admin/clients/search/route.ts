import { NextResponse } from "next/server";

import { searchAdminClients } from "@/features/admin/appointments/services/admin-client-search.service";
import { requireAdminApiUser } from "@/lib/api-session";

export const runtime = "nodejs";

export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<Response> {
  const authentication = await requireAdminApiUser([
    "SUPER_ADMIN",
    "ADMIN",
    "STAFF",
  ]);

  if (!authentication.user) {
    return authentication.response;
  }

  try {
    const { searchParams } = new URL(request.url);

    const query = searchParams.get("q") ?? "";

    const clients = await searchAdminClients(query);

    return NextResponse.json({ clients });
  } catch (error) {
    console.error("[ADMIN_CLIENTS_SEARCH_GET]", error);

    return NextResponse.json(
      { error: "Impossible de rechercher les clientes." },
      { status: 400 },
    );
  }
}
