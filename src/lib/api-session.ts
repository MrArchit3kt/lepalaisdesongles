import type {
  UserRole,
} from "@/generated/prisma/client";

import {
  getServerSession,
} from "next-auth";

import {
  NextResponse,
} from "next/server";

import {
  authOptions,
} from "@/lib/auth";

export type ApiSessionUser = {
  id: string;
  role: UserRole;
  status: string;
  sessionInvalidated?: boolean;
};

type ApiAuthenticationSuccess = {
  user: ApiSessionUser;
  response: null;
};

type ApiAuthenticationFailure = {
  user: null;
  response: NextResponse;
};

export type ApiAuthenticationResult =
  | ApiAuthenticationSuccess
  | ApiAuthenticationFailure;

function jsonError(
  message: string,
  status: number,
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    {
      status,
    },
  );
}

export async function requireApiUser(): Promise<ApiAuthenticationResult> {
  const session =
    await getServerSession(
      authOptions,
    );

  const user =
    session?.user;

  if (
    !user?.id ||
    user.sessionInvalidated
  ) {
    return {
      user: null,
      response: jsonError(
        "Authentification requise.",
        401,
      ),
    };
  }

  if (
    user.status !== "ACTIVE"
  ) {
    return {
      user: null,
      response: jsonError(
        "Ce compte est désactivé.",
        403,
      ),
    };
  }

  return {
    user: {
      id: user.id,
      role: user.role,
      status: user.status,
      sessionInvalidated:
        user.sessionInvalidated,
    },
    response: null,
  };
}

export async function requireAdminApiUser(
  allowedRoles: UserRole[] = [
    "SUPER_ADMIN",
    "ADMIN",
    "STAFF",
  ],
): Promise<ApiAuthenticationResult> {
  const authentication =
    await requireApiUser();

  if (!authentication.user) {
    return authentication;
  }

  if (
    !allowedRoles.includes(
      authentication.user.role,
    )
  ) {
    return {
      user: null,
      response: jsonError(
        "Accès refusé.",
        403,
      ),
    };
  }

  return authentication;
}
