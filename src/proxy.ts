import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  shouldUseSecureAuthCookies,
} from "@/lib/auth-cookie-policy";
import { isAdminRole } from "@/lib/roles";

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const token = await getToken({
    req: request,

    secret:
      process.env.AUTH_SECRET ??
      process.env.NEXTAUTH_SECRET,

    /*
     * Cette option doit impérativement rester
     * identique à authOptions.useSecureCookies.
     */
    secureCookie:
      shouldUseSecureAuthCookies(),
  });

  /*
   * La présence d’un objet JWT ne suffit pas.
   *
   * Une session révoquée peut encore être décodée,
   * mais elle porte alors un identifiant vide ou le
   * marqueur sessionInvalidated.
   */
  const hasValidToken =
    token !== null &&
    Boolean(token.id) &&
    token.status === "ACTIVE" &&
    token.sessionInvalidated !== true &&
    typeof token.authVersion === "number" &&
    token.authVersion >= 0;

  const isAdminPage =
    pathname === "/admin" ||
    pathname.startsWith("/admin/");

  const isClientPage =
    pathname === "/espace-client" ||
    pathname.startsWith("/espace-client/");

  if (isAdminPage) {
    /*
     * Le contrôle explicite de token permet à TypeScript
     * de garantir que token n’est plus null après ce bloc.
     */
    if (!token || !hasValidToken) {
      const callbackUrl = encodeURIComponent(
        `${pathname}${search}`,
      );

      return NextResponse.redirect(
        new URL(
          `/connexion?callbackUrl=${callbackUrl}`,
          request.url,
        ),
      );
    }

    if (!isAdminRole(token.role)) {
      return NextResponse.redirect(
        new URL(
          "/espace-client",
          request.url,
        ),
      );
    }
  }

  if (isClientPage) {
    /*
     * Même garde explicite pour les pages clientes.
     */
    if (!token || !hasValidToken) {
      const callbackUrl = encodeURIComponent(
        `${pathname}${search}`,
      );

      return NextResponse.redirect(
        new URL(
          `/connexion?callbackUrl=${callbackUrl}`,
          request.url,
        ),
      );
    }

    if (isAdminRole(token.role)) {
      return NextResponse.redirect(
        new URL(
          "/admin/dashboard",
          request.url,
        ),
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/espace-client/:path*",
  ],
};
