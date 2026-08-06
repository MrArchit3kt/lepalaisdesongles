import { NextResponse } from "next/server";

import {
  AdminEligibleStaffError,
  getAdminEligibleStaff,
} from "@/features/admin/appointments/services/admin-eligible-staff.service";
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

    const serviceIds = searchParams.getAll("serviceId");

    const staff = await getAdminEligibleStaff(serviceIds);

    return NextResponse.json({ staff });
  } catch (error) {
    if (error instanceof AdminEligibleStaffError) {
      return NextResponse.json({ error: error.message, staff: [] }, { status: 400 });
    }

    console.error("[ADMIN_APPOINTMENTS_STAFF_OPTIONS_GET]", error);

    return NextResponse.json(
      { error: "Impossible de charger les professionnelles disponibles." },
      { status: 400 },
    );
  }
}
