import "server-only";

import {
  prisma,
} from "@/lib/prisma";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

export type ReferralLinkPreview = {
  token: string;

  referrerUserId: string;
  referrerFirstName: string;
  referrerDisplayName: string;
};

/* -------------------------------------------------------------------------- */
/*                                CONSTANTES                                  */
/* -------------------------------------------------------------------------- */

const REFERRAL_TOKEN_PATTERN =
  /^[A-Z0-9-]{4,120}$/;

/* -------------------------------------------------------------------------- */
/*                                NORMALISATION                               */
/* -------------------------------------------------------------------------- */

export function normalizeReferralToken(
  value: unknown,
): string | null {
  if (
    typeof value !==
    "string"
  ) {
    return null;
  }

  const token =
    value
      .trim()
      .toUpperCase();

  if (
    !token ||
    !REFERRAL_TOKEN_PATTERN.test(
      token,
    )
  ) {
    return null;
  }

  return token;
}

/* -------------------------------------------------------------------------- */
/*                              RECONNAISSANCE                                */
/* -------------------------------------------------------------------------- */

export async function getReferralLinkPreview(
  value: unknown,
): Promise<ReferralLinkPreview | null> {
  const token =
    normalizeReferralToken(
      value,
    );

  if (!token) {
    return null;
  }

  const [
    configuration,
    account,
  ] =
    await Promise.all([
      prisma.vipConfiguration.findUnique({
        where: {
          key:
            "default",
        },

        select: {
          programStatus:
            true,

          clubEnabled:
            true,

          referralsEnabled:
            true,
        },
      }),

      prisma.loyaltyAccount.findUnique({
        where: {
          referralCode:
            token,
        },

        select: {
          userId:
            true,

          isActive:
            true,

          isSuspended:
            true,

          user: {
            select: {
              firstName:
                true,

              lastName:
                true,

              role:
                true,

              status:
                true,
            },
          },
        },
      }),
    ]);

  const referralsAvailable =
    configuration?.programStatus ===
      "ACTIVE" &&
    configuration.clubEnabled &&
    configuration.referralsEnabled;

  if (
    !referralsAvailable ||
    !account ||
    !account.isActive ||
    account.isSuspended ||
    account.user.role !==
      "CLIENT" ||
    account.user.status !==
      "ACTIVE"
  ) {
    return null;
  }

  const displayName =
    [
      account.user.firstName,
      account.user.lastName,
    ]
      .filter(Boolean)
      .join(" ")
      .trim();

  return {
    token,

    referrerUserId:
      account.userId,

    referrerFirstName:
      account.user.firstName,

    referrerDisplayName:
      displayName ||
      account.user.firstName,
  };
}
