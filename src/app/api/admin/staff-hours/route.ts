import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import {
  getStaffHours,
  resetStaffHours,
  saveStaffHours,
  staffHoursSchema,
} from "@/features/admin/staff-hours/staff-hours";

type SessionUser = { id?: string; role?: string };

function allowed(user: SessionUser | undefined) {
  return Boolean(user?.id && ["SUPER_ADMIN", "ADMIN"].includes(user.role ?? ""));
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser | undefined;

  if (!allowed(user)) {
    return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
  }

  const staffId = new URL(request.url).searchParams.get("staffId");
  if (!staffId) {
    return NextResponse.json({ error: "Professionnelle manquante." }, { status: 400 });
  }

  try {
    return NextResponse.json({ hours: await getStaffHours(staffId) });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Lecture impossible." },
      { status: 400 },
    );
  }
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser | undefined;

  if (!allowed(user)) {
    return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
  }

  const parsed = staffHoursSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Horaires invalides." },
      { status: 400 },
    );
  }

  try {
    return NextResponse.json({
      success: true,
      hours: await saveStaffHours(parsed.data),
    });
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

  if (!allowed(user)) {
    return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
  }

  const staffId = new URL(request.url).searchParams.get("staffId");
  if (!staffId) {
    return NextResponse.json({ error: "Professionnelle manquante." }, { status: 400 });
  }

  try {
    return NextResponse.json({
      success: true,
      hours: await resetStaffHours(staffId),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Réinitialisation impossible." },
      { status: 400 },
    );
  }
}
