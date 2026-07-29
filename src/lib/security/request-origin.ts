import "server-only";

/* -------------------------------------------------------------------------- */
/*                          ORIGINES DE L’APPLICATION                          */
/* -------------------------------------------------------------------------- */

function normalizeOrigin(
  value:
    string | null | undefined,
): string | null {
  const normalizedValue =
    value?.trim();

  if (
    !normalizedValue ||
    normalizedValue ===
      "null"
  ) {
    return null;
  }

  try {
    return new URL(
      normalizedValue,
    ).origin;
  } catch {
    return null;
  }
}

function getConfiguredOrigins(
  request:
    Request,
): Set<string> {
  const origins =
    new Set<string>();

  const configuredUrls = [
    process.env
      .NEXT_PUBLIC_APP_URL,

    process.env
      .NEXTAUTH_URL,
  ];

  for (
    const configuredUrl
    of configuredUrls
  ) {
    const origin =
      normalizeOrigin(
        configuredUrl,
      );

    if (
      origin
    ) {
      origins.add(
        origin,
      );
    }
  }

  /*
   * En développement, le port local peut changer.
   * En production, seules les URL explicitement
   * configurées sont considérées comme fiables.
   */
  if (
    process.env.NODE_ENV !==
      "production"
  ) {
    const requestOrigin =
      normalizeOrigin(
        request.url,
      );

    if (
      requestOrigin
    ) {
      origins.add(
        requestOrigin,
      );
    }
  }

  return origins;
}

function getRequestOrigin(
  request:
    Request,
): string | null {
  const originHeader =
    normalizeOrigin(
      request.headers.get(
        "origin",
      ),
    );

  if (
    originHeader
  ) {
    return originHeader;
  }

  return normalizeOrigin(
    request.headers.get(
      "referer",
    ),
  );
}

/* -------------------------------------------------------------------------- */
/*                                VALIDATION                                  */
/* -------------------------------------------------------------------------- */

export function isTrustedRequestOrigin(
  request:
    Request,
): boolean {
  const fetchSite =
    request.headers
      .get(
        "sec-fetch-site",
      )
      ?.trim()
      .toLowerCase();

  /*
   * Le navigateur indique explicitement
   * que la requête vient d’un autre site.
   */
  if (
    fetchSite ===
      "cross-site"
  ) {
    return false;
  }

  const requestOrigin =
    getRequestOrigin(
      request,
    );

  if (
    !requestOrigin
  ) {
    return false;
  }

  const trustedOrigins =
    getConfiguredOrigins(
      request,
    );

  return trustedOrigins.has(
    requestOrigin,
  );
}
