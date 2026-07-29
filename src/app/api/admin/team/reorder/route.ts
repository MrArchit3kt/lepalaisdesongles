import {
  NextResponse,
} from "next/server";

import {
  z,
} from "zod";

import {
  reorderTeamMembers,
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
/*                                  SCHÉMA                                    */
/* -------------------------------------------------------------------------- */

const reorderSchema =
  z.object({
    orderedIds: z
      .array(
        z.string().cuid(
          "Identifiant invalide.",
        ),
      )
      .min(
        1,
        "La liste des professionnelles est vide.",
      ),
  });

/* -------------------------------------------------------------------------- */
/*                                   PATCH                                    */
/* -------------------------------------------------------------------------- */

export async function PATCH(
  request: Request,
): Promise<Response> {
  const authentication =
    await requireAdminApiUser([
      "SUPER_ADMIN",
      "ADMIN",
    ]);

  if (!authentication.user) {
    return authentication.response;
  }

  try {
    const body: unknown =
      await request.json();

    const parsed =
      reorderSchema.safeParse(
        body,
      );

    if (!parsed.success) {
      return NextResponse.json(
        {
          error:
            parsed.error.issues[0]
              ?.message ??
            "Ordre invalide.",

          issues:
            parsed.error.issues.map(
              (issue) => ({
                path:
                  issue.path.join(
                    ".",
                  ),

                message:
                  issue.message,
              }),
            ),
        },
        {
          status: 400,
        },
      );
    }

    const result =
      await reorderTeamMembers(
        parsed.data.orderedIds,
      );

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error(
      "[ADMIN_TEAM_REORDER]",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Impossible de réorganiser l’équipe.",
      },
      {
        status: 400,
      },
    );
  }
}
