import {
  NextResponse,
} from "next/server";

import {
  getTeamFormOptions,
} from "@/features/admin/team/services/team.service";

import {
  requireAdminApiUser,
} from "@/lib/api-session";

/* -------------------------------------------------------------------------- */
/*                                CONFIGURATION                               */
/* -------------------------------------------------------------------------- */

export const runtime =
  "nodejs";

export const dynamic =
  "force-dynamic";

/* -------------------------------------------------------------------------- */
/*                                    GET                                     */
/* -------------------------------------------------------------------------- */

export async function GET(): Promise<Response> {
  const authentication =
    await requireAdminApiUser([
      "SUPER_ADMIN",
      "ADMIN",
    ]);

  if (!authentication.user) {
    return authentication.response;
  }

  try {
    const options =
      await getTeamFormOptions();

    return NextResponse.json(
      options,
    );
  } catch (error) {
    console.error(
      "[ADMIN_TEAM_OPTIONS_GET]",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Impossible de charger les options du formulaire.",
      },
      {
        status: 400,
      },
    );
  }
}
