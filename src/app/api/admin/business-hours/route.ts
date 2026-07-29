import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import {
  businessHoursSchema,
  getBusinessHours,
  saveBusinessHours,
} from "@/features/admin/business-hours/business-hours";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SessionUser = { id?: string; role?: string };

function allowed(user: SessionUser | undefined) {
  return Boolean(user?.id && ["SUPER_ADMIN", "ADMIN"].includes(user.role ?? ""));
}

export async function GET() {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser | undefined;
  if (!allowed(user)) return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
  return NextResponse.json({ hours: await getBusinessHours() });
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as SessionUser | undefined;
    if (!allowed(user)) return NextResponse.json({ error: "Accès refusé." }, { status: 403 });

    const parsed = businessHoursSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Horaires invalides." },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      hours: await saveBusinessHours(parsed.data),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Enregistrement impossible." },
      { status: 400 },
    );
  }
}
