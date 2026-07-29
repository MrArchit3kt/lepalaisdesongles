import {
  NextResponse,
} from "next/server";
import {
  ZodError,
} from "zod";

import {
  EmailAlreadyUsedError,
  registerClient,
} from "@/features/auth/services/register.service";
import {
  consumeSecurityRateLimit,
  getClientIpAddress,
} from "@/lib/security/rate-limit";
import {
  isTrustedRequestOrigin,
} from "@/lib/security/request-origin";

export const runtime =
  "nodejs";

export const dynamic =
  "force-dynamic";

/* -------------------------------------------------------------------------- */
/*                           SÉCURITÉ INSCRIPTION                              */
/* -------------------------------------------------------------------------- */

const REGISTRATION_MAX_ATTEMPTS =
  8;

const REGISTRATION_WINDOW_MS =
  60 * 60 * 1000;

const REGISTRATION_BLOCK_MS =
  2 * 60 * 60 * 1000;

const MAX_REGISTRATION_BODY_BYTES =
  32 * 1024;

function noStoreHeaders(
  additionalHeaders?: Record<
    string,
    string
  >,
): Record<string, string> {
  return {
    "Cache-Control":
      "private, no-store, no-cache, max-age=0, must-revalidate",

    Pragma:
      "no-cache",

    ...additionalHeaders,
  };
}

function getRequestBodySize(
  value: string,
): number {
  return Buffer.byteLength(
    value,
    "utf8",
  );
}

/* -------------------------------------------------------------------------- */
/*                                 INSCRIPTION                                */
/* -------------------------------------------------------------------------- */

export async function POST(
  request: Request,
) {
  if (
    !isTrustedRequestOrigin(
      request,
    )
  ) {
    return NextResponse.json(
      {
        success:
          false,

        message:
          "L’origine de la requête n’est pas autorisée.",
      },
      {
        status:
          403,

        headers:
          noStoreHeaders(),
      },
    );
  }

  const ipAddress =
    getClientIpAddress(
      request.headers,
    );

  const rateLimit =
    await consumeSecurityRateLimit({
      action:
        "AUTH_REGISTER_IP",

      subject:
        ipAddress,

      maxAttempts:
        REGISTRATION_MAX_ATTEMPTS,

      windowMs:
        REGISTRATION_WINDOW_MS,

      blockMs:
        REGISTRATION_BLOCK_MS,
    });

  if (
    !rateLimit.allowed
  ) {
    return NextResponse.json(
      {
        success:
          false,

        message:
          "Trop de tentatives d’inscription ont été effectuées. Réessayez plus tard.",

        retryAfterSeconds:
          rateLimit.retryAfterSeconds,
      },
      {
        status:
          429,

        headers:
          noStoreHeaders({
            "Retry-After":
              String(
                rateLimit.retryAfterSeconds,
              ),
          }),
      },
    );
  }

  const contentType =
    request.headers.get(
      "content-type",
    );

  if (
    !contentType
      ?.toLowerCase()
      .includes(
        "application/json",
      )
  ) {
    return NextResponse.json(
      {
        success:
          false,

        message:
          "Le format de la requête n’est pas valide.",
      },
      {
        status:
          415,

        headers:
          noStoreHeaders(),
      },
    );
  }

  const declaredContentLength =
    Number(
      request.headers.get(
        "content-length",
      ) ??
        0,
    );

  if (
    Number.isFinite(
      declaredContentLength,
    ) &&
    declaredContentLength >
      MAX_REGISTRATION_BODY_BYTES
  ) {
    return NextResponse.json(
      {
        success:
          false,

        message:
          "La requête envoyée est trop volumineuse.",
      },
      {
        status:
          413,

        headers:
          noStoreHeaders(),
      },
    );
  }

  let rawBody:
    string;

  try {
    rawBody =
      await request.text();
  } catch {
    return NextResponse.json(
      {
        success:
          false,

        message:
          "Impossible de lire la requête.",
      },
      {
        status:
          400,

        headers:
          noStoreHeaders(),
      },
    );
  }

  if (
    getRequestBodySize(
      rawBody,
    ) >
    MAX_REGISTRATION_BODY_BYTES
  ) {
    return NextResponse.json(
      {
        success:
          false,

        message:
          "La requête envoyée est trop volumineuse.",
      },
      {
        status:
          413,

        headers:
          noStoreHeaders(),
      },
    );
  }

  let body:
    unknown;

  try {
    body =
      JSON.parse(
        rawBody,
      ) as unknown;
  } catch {
    return NextResponse.json(
      {
        success:
          false,

        message:
          "Le contenu JSON de la requête n’est pas valide.",
      },
      {
        status:
          400,

        headers:
          noStoreHeaders(),
      },
    );
  }

  try {
    const user =
      await registerClient(
        body,
      );

    /*
     * La réponse reste volontairement identique
     * lorsqu’un compte existe déjà afin d’éviter
     * l’énumération des adresses e-mail.
     */
    void user;

    return NextResponse.json(
      {
        success:
          true,

        message:
          "Votre demande d’inscription a été prise en compte.",
      },
      {
        status:
          202,

        headers:
          noStoreHeaders(),
      },
    );
  } catch (
    error: unknown
  ) {
    if (
      error instanceof
      EmailAlreadyUsedError
    ) {
      return NextResponse.json(
        {
          success:
            true,

          message:
            "Votre demande d’inscription a été prise en compte.",
        },
        {
          status:
            202,

          headers:
            noStoreHeaders(),
        },
      );
    }

    if (
      error instanceof
      ZodError
    ) {
      return NextResponse.json(
        {
          success:
            false,

          message:
            "Certaines informations sont incorrectes.",

          errors:
            error.issues.map(
              (
                issue,
              ) => ({
                field:
                  issue.path.join(
                    ".",
                  ),

                message:
                  issue.message,
              }),
            ),
        },
        {
          status:
            422,

          headers:
            noStoreHeaders(),
        },
      );
    }

    console.error(
      "[REGISTER_POST]",
      error,
    );

    return NextResponse.json(
      {
        success:
          false,

        message:
          "Une erreur est survenue pendant la création du compte.",
      },
      {
        status:
          500,

        headers:
          noStoreHeaders(),
      },
    );
  }
}
