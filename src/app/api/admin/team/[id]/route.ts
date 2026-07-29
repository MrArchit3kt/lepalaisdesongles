import {
  NextResponse,
} from "next/server";

import {
  prisma,
} from "@/lib/prisma";

import {
  requireAdminApiUser,
} from "@/lib/api-session";

import {
  deleteTeamMember,
  getTeamMemberById,
  setTeamMemberActive,
  updateTeamMember,
} from "@/features/admin/team/services/team.service";

import {
  updateTeamMemberSchema,
} from "@/features/admin/team/schemas/update-team-member.schema";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type PatchActionBody = {
  action?: unknown;
  isActive?: unknown;
};

type TargetTeamMember = {
  id: string;
  userId: string;
  isOwner: boolean;
  user: {
    role: string;
  };
};

/* -------------------------------------------------------------------------- */
/*                                CONFIGURATION                               */
/* -------------------------------------------------------------------------- */

export const runtime =
  "nodejs";

export const dynamic =
  "force-dynamic";

/* -------------------------------------------------------------------------- */
/*                                  HELPERS                                   */
/* -------------------------------------------------------------------------- */

function getErrorMessage(
  error: unknown,
  fallback: string,
): string {
  return error instanceof Error
    ? error.message
    : fallback;
}

function getErrorStatus(
  message: string,
): number {
  if (
    message.includes(
      "introuvable",
    )
  ) {
    return 404;
  }

  if (
    message.includes(
      "déjà utilisée",
    )
  ) {
    return 409;
  }

  if (
    message.includes(
      "ne peut pas être supprimé",
    )
  ) {
    return 409;
  }

  if (
    message.includes(
      "Accès refusé",
    ) ||
    message.includes(
      "autorisé",
    ) ||
    message.includes(
      "administrateur",
    ) ||
    message.includes(
      "propriétaire",
    ) ||
    message.includes(
      "votre propre",
    )
  ) {
    return 403;
  }

  return 400;
}

async function getTargetTeamMember(
  id: string,
): Promise<TargetTeamMember> {
  const cleanId =
    id.trim();

  if (!cleanId) {
    throw new Error(
      "Identifiant de la professionnelle manquant.",
    );
  }

  const target =
    await prisma.staffProfile.findUnique({
      where: {
        id: cleanId,
      },
      select: {
        id: true,
        userId: true,
        isOwner: true,

        user: {
          select: {
            role: true,
          },
        },
      },
    });

  if (!target) {
    throw new Error(
      "Professionnelle introuvable.",
    );
  }

  return target;
}

function assertCanManageTarget(
  actor: {
    id: string;
    role: string;
  },
  target: TargetTeamMember,
): void {
  if (
    actor.role ===
    "SUPER_ADMIN"
  ) {
    return;
  }

  /*
   * Un administrateur classique peut uniquement gérer
   * les comptes STAFF.
   */
  if (
    target.isOwner ||
    target.user.role ===
      "ADMIN" ||
    target.user.role ===
      "SUPER_ADMIN"
  ) {
    throw new Error(
      "Accès refusé : seul un super administrateur peut gérer ce compte.",
    );
  }
}

function assertCanChangeOwnership(
  actorRole: string,
  wantsOwnership: boolean,
): void {
  if (
    wantsOwnership &&
    actorRole !==
      "SUPER_ADMIN"
  ) {
    throw new Error(
      "Seul un super administrateur peut désigner une propriétaire.",
    );
  }
}

function assertNotSelfDestructiveAction(
  actorUserId: string,
  targetUserId: string,
  action:
    | "disable"
    | "delete",
): void {
  if (
    actorUserId !==
    targetUserId
  ) {
    return;
  }

  if (
    action === "disable"
  ) {
    throw new Error(
      "Vous ne pouvez pas désactiver votre propre compte.",
    );
  }

  throw new Error(
    "Vous ne pouvez pas supprimer votre propre compte.",
  );
}

/* -------------------------------------------------------------------------- */
/*                                    GET                                     */
/* -------------------------------------------------------------------------- */

export async function GET(
  _request: Request,
  context: RouteContext,
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
      id,
    } = await context.params;

    const member =
      await getTeamMemberById(
        id,
      );

    return NextResponse.json({
      member,
    });
  } catch (error) {
    console.error(
      "[ADMIN_TEAM_MEMBER_GET]",
      error,
    );

    const message =
      getErrorMessage(
        error,
        "Impossible de charger la professionnelle.",
      );

    return NextResponse.json(
      {
        error: message,
      },
      {
        status:
          getErrorStatus(
            message,
          ),
      },
    );
  }
}

/* -------------------------------------------------------------------------- */
/*                                    PUT                                     */
/* -------------------------------------------------------------------------- */

export async function PUT(
  request: Request,
  context: RouteContext,
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
      id,
    } = await context.params;

    const target =
      await getTargetTeamMember(
        id,
      );

    assertCanManageTarget(
      authentication.user,
      target,
    );

    const body: unknown =
      await request.json();

    const parsed =
      updateTeamMemberSchema.safeParse({
        ...(typeof body ===
          "object" &&
        body !== null
          ? body
          : {}),
        id,
      });

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

    assertCanChangeOwnership(
      authentication.user.role,
      parsed.data.isOwner,
    );

    /*
     * Un administrateur classique ne peut pas transformer
     * un compte STAFF en propriétaire ni gérer un ADMIN.
     * La vérification de la cible est effectuée avant toute
     * modification.
     */
    const member =
      await updateTeamMember(
        parsed.data,
      );

    return NextResponse.json({
      success: true,
      member,
    });
  } catch (error) {
    console.error(
      "[ADMIN_TEAM_MEMBER_PUT]",
      error,
    );

    const message =
      getErrorMessage(
        error,
        "Impossible de modifier la professionnelle.",
      );

    return NextResponse.json(
      {
        error: message,
      },
      {
        status:
          getErrorStatus(
            message,
          ),
      },
    );
  }
}

/* -------------------------------------------------------------------------- */
/*                                   PATCH                                    */
/* -------------------------------------------------------------------------- */

export async function PATCH(
  request: Request,
  context: RouteContext,
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
      id,
    } = await context.params;

    const target =
      await getTargetTeamMember(
        id,
      );

    assertCanManageTarget(
      authentication.user,
      target,
    );

    const body =
      (await request.json()) as PatchActionBody;

    if (
      body.action !==
      "set-active"
    ) {
      return NextResponse.json(
        {
          error:
            "Action invalide.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      typeof body.isActive !==
      "boolean"
    ) {
      return NextResponse.json(
        {
          error:
            "L’état d’activation est invalide.",
        },
        {
          status: 400,
        },
      );
    }

    if (!body.isActive) {
      assertNotSelfDestructiveAction(
        authentication.user.id,
        target.userId,
        "disable",
      );
    }

    const member =
      await setTeamMemberActive(
        id,
        body.isActive,
      );

    return NextResponse.json({
      success: true,
      member,
    });
  } catch (error) {
    console.error(
      "[ADMIN_TEAM_MEMBER_PATCH]",
      error,
    );

    const message =
      getErrorMessage(
        error,
        "Impossible de modifier l’état de la professionnelle.",
      );

    return NextResponse.json(
      {
        error: message,
      },
      {
        status:
          getErrorStatus(
            message,
          ),
      },
    );
  }
}

/* -------------------------------------------------------------------------- */
/*                                   DELETE                                   */
/* -------------------------------------------------------------------------- */

export async function DELETE(
  _request: Request,
  context: RouteContext,
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
      id,
    } = await context.params;

    const target =
      await getTargetTeamMember(
        id,
      );

    assertCanManageTarget(
      authentication.user,
      target,
    );

    assertNotSelfDestructiveAction(
      authentication.user.id,
      target.userId,
      "delete",
    );

    const result =
      await deleteTeamMember(
        id,
      );

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error(
      "[ADMIN_TEAM_MEMBER_DELETE]",
      error,
    );

    const message =
      getErrorMessage(
        error,
        "Impossible de supprimer la professionnelle.",
      );

    return NextResponse.json(
      {
        error: message,
      },
      {
        status:
          getErrorStatus(
            message,
          ),
      },
    );
  }
}
