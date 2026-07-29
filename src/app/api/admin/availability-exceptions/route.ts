import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import {
  createException,
  deleteException,
  getAvailabilityExceptions,
} from "@/features/admin/availability-exceptions/availability-exceptions";

type SessionUser = { id?: string; role?: string };

function allowed(user: SessionUser | undefined) {
  return Boolean(user?.id && ["SUPER_ADMIN", "ADMIN"].includes(user.role ?? ""));
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser | undefined;
  if (!allowed(user)) return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
  return NextResponse.json(await getAvailabilityExceptions());
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser | undefined;
  if (!allowed(user) || !user?.id) {
    return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
  }

  try {
    const body = await request.json() as { kind?: string; payload?: unknown };
    if (!body.kind || !["staff-time-off", "salon-time-off", "salon-override", "staff-override"].includes(body.kind)) {
      return NextResponse.json({ error: "Type d’exception invalide." }, { status: 400 });
    }

    await createException(
      body.kind as "staff-time-off" | "salon-time-off" | "salon-override" | "staff-override",
      body.payload,
      user.id,
    );

    return NextResponse.json({ success: true, ...(await getAvailabilityExceptions()) });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Enregistrement impossible." },
      { status: 400 },
    );
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser | undefined;
  if (!allowed(user)) return NextResponse.json({ error: "Accès refusé." }, { status: 403 });

  const url = new URL(request.url);
  const kind = url.searchParams.get("kind");
  const id = url.searchParams.get("id");
  if (!kind || !id) return NextResponse.json({ error: "Paramètres invalides." }, { status: 400 });

  try {
    await deleteException(kind, id);
    return NextResponse.json({ success: true, ...(await getAvailabilityExceptions()) });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Suppression impossible." },
      { status: 400 },
    );
  }
}
