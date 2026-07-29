import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { updateAdminAppointment } from "@/features/admin/appointments/services/admin-appointment.service";
import type { AdminAppointmentMutation } from "@/features/admin/appointments/types/admin-appointment.types";

type Context = { params: Promise<{ reference: string }> };
type SessionUser = { id?: string; role?: string };
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(request: Request, context: Context) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as SessionUser | undefined;
    if (!user?.id || !["SUPER_ADMIN", "ADMIN", "STAFF"].includes(user.role ?? "")) {
      return NextResponse.json({ error: "Accès administrateur refusé." }, { status: 403 });
    }
    const { reference } = await context.params;
    const payload = (await request.json()) as AdminAppointmentMutation;
    const appointment = await updateAdminAppointment({ reference, actorId: user.id, ...payload });
    return NextResponse.json({ success: true, appointment: {
      id: appointment.id, reference: appointment.reference, status: appointment.status,
      paymentStatus: appointment.paymentStatus, startsAt: appointment.startsAt.toISOString(),
      endsAt: appointment.endsAt.toISOString(), adminComment: appointment.adminComment,
      cancellationReason: appointment.cancellationReason,
    }});
  } catch (error) {
    console.error("[ADMIN_APPOINTMENT_UPDATE]", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Impossible de modifier le rendez-vous." }, { status: 400 });
  }
}
