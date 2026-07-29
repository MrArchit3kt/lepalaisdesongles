import {
  createHmac,
} from "node:crypto";

import {
  Prisma,
} from "@/generated/prisma/client";
import {
  prisma,
} from "@/lib/prisma";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

export type SecurityHeaderSource =
  | Headers
  | {
      get(
        name: string,
      ): string | null;
    }
  | Record<
      string,
      string | string[] | undefined
    >;

export type SecurityRateLimitStatus = {
  allowed:
    boolean;

  attempts:
    number;

  remaining:
    number;

  blockedUntil:
    Date | null;

  retryAfterSeconds:
    number;
};

export type SecurityRateLimitOptions = {
  action:
    string;

  subject:
    string;

  maxAttempts:
    number;

  windowMs:
    number;

  blockMs:
    number;
};

/* -------------------------------------------------------------------------- */
/*                                CONSTANTES                                  */
/* -------------------------------------------------------------------------- */

const MAX_ACTION_LENGTH =
  80;

const MAX_SUBJECT_LENGTH =
  500;

const MAX_IP_LENGTH =
  128;

const MAX_USER_AGENT_LENGTH =
  500;

const TRANSACTION_RETRY_COUNT =
  3;

const CLEANUP_RETENTION_MS =
  24 * 60 * 60 * 1000;

/* -------------------------------------------------------------------------- */
/*                              EN-TÊTES HTTP                                 */
/* -------------------------------------------------------------------------- */

function readHeader(
  headers:
    SecurityHeaderSource,
  name:
    string,
): string | null {
  if (
    typeof (
      headers as {
        get?: unknown;
      }
    ).get ===
    "function"
  ) {
    return (
      headers as {
        get(
          headerName: string,
        ): string | null;
      }
    ).get(
      name,
    );
  }

  const record =
    headers as Record<
      string,
      string | string[] | undefined
    >;

  const value =
    record[
      name
    ] ??
    record[
      name.toLowerCase()
    ] ??
    record[
      name.toUpperCase()
    ];

  if (
    Array.isArray(
      value,
    )
  ) {
    return (
      value[0] ??
      null
    );
  }

  return (
    value ??
    null
  );
}

function normalizeForwardedIp(
  value:
    string | null,
): string | null {
  const firstValue =
    value
      ?.split(
        ",",
      )[0]
      ?.trim();

  if (
    !firstValue
  ) {
    return null;
  }

  return firstValue
    .replace(
      /^\[|\]$/g,
      "",
    )
    .slice(
      0,
      MAX_IP_LENGTH,
    );
}

export function getClientIpAddress(
  headers:
    SecurityHeaderSource,
): string {
  const candidates = [
    readHeader(
      headers,
      "x-vercel-forwarded-for",
    ),

    readHeader(
      headers,
      "cf-connecting-ip",
    ),

    readHeader(
      headers,
      "x-real-ip",
    ),

    readHeader(
      headers,
      "x-forwarded-for",
    ),
  ];

  for (
    const candidate
    of candidates
  ) {
    const normalized =
      normalizeForwardedIp(
        candidate,
      );

    if (
      normalized
    ) {
      return normalized;
    }
  }

  return "unknown";
}

export function getClientUserAgent(
  headers:
    SecurityHeaderSource,
): string | null {
  const userAgent =
    readHeader(
      headers,
      "user-agent",
    )
      ?.replace(
        /[\u0000-\u001F\u007F]/g,
        "",
      )
      .trim()
      .slice(
        0,
        MAX_USER_AGENT_LENGTH,
      );

  return (
    userAgent ||
    null
  );
}

/* -------------------------------------------------------------------------- */
/*                              NORMALISATION                                 */
/* -------------------------------------------------------------------------- */

function requireSecuritySecret():
  string {
  const secret =
    process.env
      .SECURITY_HASH_SECRET
      ?.trim() ||
    process.env
      .AUTH_SECRET
      ?.trim() ||
    process.env
      .NEXTAUTH_SECRET
      ?.trim();

  if (
    !secret
  ) {
    throw new Error(
      "SECURITY_HASH_SECRET, AUTH_SECRET ou NEXTAUTH_SECRET doit être configuré.",
    );
  }

  return secret;
}

function normalizeAction(
  action:
    string,
): string {
  const normalized =
    action
      .trim()
      .toUpperCase()
      .replace(
        /[^A-Z0-9:_-]/g,
        "_",
      )
      .slice(
        0,
        MAX_ACTION_LENGTH,
      );

  if (
    !normalized
  ) {
    throw new Error(
      "L’action de sécurité est invalide.",
    );
  }

  return normalized;
}

function normalizeSubject(
  subject:
    string,
): string {
  const normalized =
    subject
      .normalize(
        "NFKC",
      )
      .trim()
      .toLowerCase()
      .slice(
        0,
        MAX_SUBJECT_LENGTH,
      );

  if (
    !normalized
  ) {
    return "unknown";
  }

  return normalized;
}

export function hashSecuritySubject(
  subject:
    string,
): string {
  return createHmac(
    "sha256",
    requireSecuritySecret(),
  )
    .update(
      normalizeSubject(
        subject,
      ),
      "utf8",
    )
    .digest(
      "hex",
    );
}

function buildBucket(
  action:
    string,
  subjectHash:
    string,
): string {
  return `${action}:${subjectHash}`;
}

/* -------------------------------------------------------------------------- */
/*                                  OUTILS                                    */
/* -------------------------------------------------------------------------- */

function assertOptions(
  options:
    SecurityRateLimitOptions,
): void {
  if (
    !Number.isInteger(
      options.maxAttempts,
    ) ||
    options.maxAttempts <
      1
  ) {
    throw new Error(
      "maxAttempts doit être un entier supérieur à zéro.",
    );
  }

  if (
    !Number.isFinite(
      options.windowMs,
    ) ||
    options.windowMs <=
      0
  ) {
    throw new Error(
      "windowMs doit être supérieur à zéro.",
    );
  }

  if (
    !Number.isFinite(
      options.blockMs,
    ) ||
    options.blockMs <=
      0
  ) {
    throw new Error(
      "blockMs doit être supérieur à zéro.",
    );
  }
}

function getRetryAfterSeconds(
  blockedUntil:
    Date | null,
  now:
    Date,
): number {
  if (
    !blockedUntil ||
    blockedUntil <=
      now
  ) {
    return 0;
  }

  return Math.max(
    1,
    Math.ceil(
      (
        blockedUntil.getTime() -
        now.getTime()
      ) /
        1000,
    ),
  );
}

function buildStatus({
  attempts,
  maxAttempts,
  blockedUntil,
  now,
}: {
  attempts:
    number;

  maxAttempts:
    number;

  blockedUntil:
    Date | null;

  now:
    Date;
}): SecurityRateLimitStatus {
  const retryAfterSeconds =
    getRetryAfterSeconds(
      blockedUntil,
      now,
    );

  return {
    allowed:
      retryAfterSeconds ===
      0,

    attempts,

    remaining:
      Math.max(
        maxAttempts -
          attempts,
        0,
      ),

    blockedUntil,

    retryAfterSeconds,
  };
}

function isRetryableTransactionError(
  error:
    unknown,
): boolean {
  return (
    error instanceof
      Prisma.PrismaClientKnownRequestError &&
    (
      error.code ===
        "P2002" ||
      error.code ===
        "P2034"
    )
  );
}

async function runSerializableTransaction<
  Result,
>(
  callback: (
    transaction:
      Prisma.TransactionClient,
  ) => Promise<Result>,
): Promise<Result> {
  let lastError:
    unknown;

  for (
    let attempt =
      1;
    attempt <=
    TRANSACTION_RETRY_COUNT;
    attempt +=
      1
  ) {
    try {
      return await prisma.$transaction(
        callback,
        {
          isolationLevel:
            Prisma
              .TransactionIsolationLevel
              .Serializable,
        },
      );
    } catch (
      error: unknown
    ) {
      lastError =
        error;

      if (
        !isRetryableTransactionError(
          error,
        ) ||
        attempt ===
          TRANSACTION_RETRY_COUNT
      ) {
        throw error;
      }
    }
  }

  throw lastError;
}

/* -------------------------------------------------------------------------- */
/*                            CONSULTATION DU BLOCAGE                          */
/* -------------------------------------------------------------------------- */

export async function getSecurityRateLimitStatus(
  options:
    SecurityRateLimitOptions,
): Promise<SecurityRateLimitStatus> {
  assertOptions(
    options,
  );

  const action =
    normalizeAction(
      options.action,
    );

  const subjectHash =
    hashSecuritySubject(
      options.subject,
    );

  const bucket =
    buildBucket(
      action,
      subjectHash,
    );

  const now =
    new Date();

  const record =
    await prisma.securityRateLimit.findUnique({
      where: {
        bucket,
      },

      select: {
        attempts:
          true,

        windowStartedAt:
          true,

        blockedUntil:
          true,

        expiresAt:
          true,
      },
    });

  if (
    !record ||
    record.expiresAt <=
      now
  ) {
    return buildStatus({
      attempts:
        0,

      maxAttempts:
        options.maxAttempts,

      blockedUntil:
        null,

      now,
    });
  }

  if (
    record.blockedUntil &&
    record.blockedUntil >
      now
  ) {
    return buildStatus({
      attempts:
        record.attempts,

      maxAttempts:
        options.maxAttempts,

      blockedUntil:
        record.blockedUntil,

      now,
    });
  }

  const windowEndsAt =
    new Date(
      record
        .windowStartedAt
        .getTime() +
        options.windowMs,
    );

  if (
    windowEndsAt <=
      now
  ) {
    return buildStatus({
      attempts:
        0,

      maxAttempts:
        options.maxAttempts,

      blockedUntil:
        null,

      now,
    });
  }

  return buildStatus({
    attempts:
      record.attempts,

    maxAttempts:
      options.maxAttempts,

    blockedUntil:
      null,

    now,
  });
}

/* -------------------------------------------------------------------------- */
/*                         ENREGISTREMENT D’UN ÉCHEC                           */
/* -------------------------------------------------------------------------- */

export async function registerSecurityRateLimitFailure(
  options:
    SecurityRateLimitOptions,
): Promise<SecurityRateLimitStatus> {
  assertOptions(
    options,
  );

  const action =
    normalizeAction(
      options.action,
    );

  const subjectHash =
    hashSecuritySubject(
      options.subject,
    );

  const bucket =
    buildBucket(
      action,
      subjectHash,
    );

  return runSerializableTransaction(
    async (
      transaction,
    ) => {
      const now =
        new Date();

      const existing =
        await transaction.securityRateLimit.findUnique({
          where: {
            bucket,
          },
        });

      if (
        existing?.blockedUntil &&
        existing.blockedUntil >
          now
      ) {
        return buildStatus({
          attempts:
            existing.attempts,

          maxAttempts:
            options.maxAttempts,

          blockedUntil:
            existing.blockedUntil,

          now,
        });
      }

      const existingWindowEndsAt =
        existing
          ? new Date(
              existing
                .windowStartedAt
                .getTime() +
                options.windowMs,
            )
          : null;

      const mustResetWindow =
        !existing ||
        existing.expiresAt <=
          now ||
        !existingWindowEndsAt ||
        existingWindowEndsAt <=
          now;

      const attempts =
        mustResetWindow
          ? 1
          : existing.attempts +
            1;

      const blockedUntil =
        attempts >=
        options.maxAttempts
          ? new Date(
              now.getTime() +
                options.blockMs,
            )
          : null;

      const windowStartedAt =
        mustResetWindow
          ? now
          : existing.windowStartedAt;

      const windowExpiresAt =
        new Date(
          windowStartedAt.getTime() +
            options.windowMs,
        );

      const expiresAt =
        new Date(
          Math.max(
            windowExpiresAt.getTime(),
            blockedUntil?.getTime() ??
              0,
          ) +
            CLEANUP_RETENTION_MS,
        );

      const record =
        await transaction.securityRateLimit.upsert({
          where: {
            bucket,
          },

          create: {
            bucket,
            action,
            subjectHash,
            attempts,
            windowStartedAt,
            blockedUntil,
            lastAttemptAt:
              now,
            expiresAt,
          },

          update: {
            action,
            subjectHash,
            attempts,
            windowStartedAt,
            blockedUntil,
            lastAttemptAt:
              now,
            expiresAt,
          },

          select: {
            attempts:
              true,

            blockedUntil:
              true,
          },
        });

      return buildStatus({
        attempts:
          record.attempts,

        maxAttempts:
          options.maxAttempts,

        blockedUntil:
          record.blockedUntil,

        now,
      });
    },
  );
}

/* -------------------------------------------------------------------------- */
/*                     CONSOMMATION D’UNE REQUÊTE PUBLIQUE                     */
/* -------------------------------------------------------------------------- */

export async function consumeSecurityRateLimit(
  options:
    SecurityRateLimitOptions,
): Promise<SecurityRateLimitStatus> {
  const currentStatus =
    await getSecurityRateLimitStatus(
      options,
    );

  if (
    !currentStatus.allowed
  ) {
    return currentStatus;
  }

  return registerSecurityRateLimitFailure(
    options,
  );
}

/* -------------------------------------------------------------------------- */
/*                         RÉINITIALISATION APRÈS SUCCÈS                        */
/* -------------------------------------------------------------------------- */

export async function clearSecurityRateLimit({
  action,
  subject,
}: {
  action:
    string;

  subject:
    string;
}): Promise<void> {
  const normalizedAction =
    normalizeAction(
      action,
    );

  const subjectHash =
    hashSecuritySubject(
      subject,
    );

  const bucket =
    buildBucket(
      normalizedAction,
      subjectHash,
    );

  await prisma.securityRateLimit.deleteMany({
    where: {
      bucket,
    },
  });
}

/* -------------------------------------------------------------------------- */
/*                          NETTOYAGE DES ENTRÉES                              */
/* -------------------------------------------------------------------------- */

export async function deleteExpiredSecurityRateLimits(
  now:
    Date =
      new Date(),
): Promise<number> {
  const result =
    await prisma.securityRateLimit.deleteMany({
      where: {
        expiresAt: {
          lte:
            now,
        },
      },
    });

  return result.count;
}
