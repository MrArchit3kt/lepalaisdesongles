import {
  timingSafeEqual,
} from "node:crypto";

import {
  NextResponse,
} from "next/server";

import {
  cleanupExpiredSecurityUploads,
} from "@/features/security/services/security-upload-cleanup.service";

export const runtime =
  "nodejs";

export const dynamic =
  "force-dynamic";

export const maxDuration =
  60;

function hasValidCronAuthorization(
  request:
    Request,
): boolean {
  const expectedSecret =
    process.env
      .CRON_SECRET
      ?.trim();

  const authorization =
    request.headers.get(
      "authorization",
    );

  if (
    !expectedSecret ||
    !authorization?.startsWith(
      "Bearer ",
    )
  ) {
    return false;
  }

  const providedSecret =
    authorization
      .slice(
        "Bearer ".length,
      )
      .trim();

  const expectedBuffer =
    Buffer.from(
      expectedSecret,
      "utf8",
    );

  const providedBuffer =
    Buffer.from(
      providedSecret,
      "utf8",
    );

  if (
    expectedBuffer.length !==
    providedBuffer.length
  ) {
    return false;
  }

  return timingSafeEqual(
    expectedBuffer,
    providedBuffer,
  );
}

export async function GET(
  request:
    Request,
): Promise<Response> {
  if (
    !hasValidCronAuthorization(
      request,
    )
  ) {
    return NextResponse.json(
      {
        success:
          false,

        message:
          "Accès interdit.",
      },
      {
        status:
          401,

        headers: {
          "Cache-Control":
            "no-store",
        },
      },
    );
  }

  try {
    const result =
      await cleanupExpiredSecurityUploads();

    return NextResponse.json(
      {
        success:
          true,

        ...result,
      },
      {
        headers: {
          "Cache-Control":
            "no-store",
        },
      },
    );
  } catch (
    reason:
      unknown
  ) {
    console.error(
      "[CRON_SECURITY_UPLOAD_CLEANUP]",
      reason,
    );

    return NextResponse.json(
      {
        success:
          false,

        message:
          "Impossible de nettoyer les fichiers expirés.",
      },
      {
        status:
          500,

        headers: {
          "Cache-Control":
            "no-store",
        },
      },
    );
  }
}
