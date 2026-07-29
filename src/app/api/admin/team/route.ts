import {
  NextResponse,
} from "next/server";

import {
  createTeamMember,
  getTeamMembers,
} from "@/features/admin/team/services/team.service";

import {
  createTeamMemberSchema,
} from "@/features/admin/team/schemas/create-team-member.schema";

import type {
  TeamQuery,
  TeamSortDirection,
  TeamSortField,
} from "@/features/admin/team/types/team.types";

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
/*                                 CONSTANTES                                 */
/* -------------------------------------------------------------------------- */

const SORT_FIELDS: TeamSortField[] = [
  "displayName",
  "createdAt",
  "appointments",
  "revenue",
];

const SORT_DIRECTIONS: TeamSortDirection[] = [
  "asc",
  "desc",
];

/* -------------------------------------------------------------------------- */
/*                                  HELPERS                                   */
/* -------------------------------------------------------------------------- */

function parseBoolean(
  value: string | null,
  defaultValue: boolean,
): boolean {
  if (value === null) {
    return defaultValue;
  }

  return (
    value === "true" ||
    value === "1"
  );
}

function parseSortField(
  value: string | null,
): TeamSortField {
  if (
    value &&
    SORT_FIELDS.includes(
      value as TeamSortField,
    )
  ) {
    return value as TeamSortField;
  }

  return "displayName";
}

function parseSortDirection(
  value: string | null,
): TeamSortDirection {
  if (
    value &&
    SORT_DIRECTIONS.includes(
      value as TeamSortDirection,
    )
  ) {
    return value as TeamSortDirection;
  }

  return "asc";
}

function getErrorMessage(
  error: unknown,
  fallback: string,
): string {
  return error instanceof Error
    ? error.message
    : fallback;
}

/* -------------------------------------------------------------------------- */
/*                                    GET                                     */
/* -------------------------------------------------------------------------- */

export async function GET(
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
    const {
      searchParams,
    } = new URL(request.url);

    const query: TeamQuery = {
      filters: {
        search:
          searchParams
            .get("search")
            ?.trim() ?? "",

        activeOnly:
          parseBoolean(
            searchParams.get(
              "activeOnly",
            ),
            false,
          ),

        onlineBookingOnly:
          parseBoolean(
            searchParams.get(
              "onlineBookingOnly",
            ),
            false,
          ),

        includeOwner:
          parseBoolean(
            searchParams.get(
              "includeOwner",
            ),
            true,
          ),
      },

      sortField:
        parseSortField(
          searchParams.get(
            "sortField",
          ),
        ),

      sortDirection:
        parseSortDirection(
          searchParams.get(
            "sortDirection",
          ),
        ),
    };

    const result =
      await getTeamMembers(
        query,
      );

    return NextResponse.json(
      result,
    );
  } catch (error) {
    console.error(
      "[ADMIN_TEAM_GET]",
      error,
    );

    return NextResponse.json(
      {
        error:
          getErrorMessage(
            error,
            "Impossible de charger l’équipe.",
          ),
      },
      {
        status: 400,
      },
    );
  }
}

/* -------------------------------------------------------------------------- */
/*                                    POST                                    */
/* -------------------------------------------------------------------------- */

export async function POST(
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
      createTeamMemberSchema.safeParse(
        body,
      );

    if (!parsed.success) {
      return NextResponse.json(
        {
          error:
            parsed.error.issues[0]
              ?.message ??
            "Informations invalides.",

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

    /*
     * La désignation d'une propriétaire est une action
     * critique. Elle retire automatiquement ce statut à
     * l'ancienne propriétaire et crée un compte ADMIN.
     */
    if (
      parsed.data.isOwner &&
      authentication.user.role !==
        "SUPER_ADMIN"
    ) {
      return NextResponse.json(
        {
          error:
            "Seul un super administrateur peut désigner une propriétaire.",
        },
        {
          status: 403,
        },
      );
    }

    const member =
      await createTeamMember(
        parsed.data,
      );

    return NextResponse.json(
      {
        success: true,
        member,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error(
      "[ADMIN_TEAM_POST]",
      error,
    );

    const message =
      getErrorMessage(
        error,
        "Impossible de créer la professionnelle.",
      );

    const status =
      message.includes(
        "déjà utilisée",
      )
        ? 409
        : 400;

    return NextResponse.json(
      {
        error: message,
      },
      {
        status,
      },
    );
  }
}
