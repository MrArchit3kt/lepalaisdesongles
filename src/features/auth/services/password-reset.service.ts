import "server-only";

import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/features/auth/services/password-reset-email.service";
import {
  generatePasswordResetToken,
  hashPasswordResetToken,
} from "@/features/auth/utils/password-reset.utils";

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

/*
 * Plancher de durée de réponse : la demande de réinitialisation ne
 * doit pas prendre un temps visiblement différent selon que le
 * compte existe ou non (sinon l'écart de latence permet de deviner
 * si une adresse e-mail est inscrite — même préoccupation que
 * DUMMY_PASSWORD_HASH dans lib/auth.ts pour la connexion).
 */
const MINIMUM_RESPONSE_TIME_MS = 400;

export class PasswordResetError extends Error {
  public readonly code: "INVALID_TOKEN";

  public constructor(message: string) {
    super(message);

    this.name = "PasswordResetError";
    this.code = "INVALID_TOKEN";
  }
}

function getSiteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.NEXTAUTH_URL?.trim() ||
    "https://lepalaisdesongles.fr"
  ).replace(/\/+$/, "");
}

/*
 * Toujours résout avec succès, que le compte existe ou non : c'est à
 * l'appelant (route API) de renvoyer un message générique identique
 * dans les deux cas, pour ne pas permettre l'énumération des
 * adresses e-mail inscrites.
 */
export async function requestPasswordReset(rawEmail: string): Promise<void> {
  const startedAt = Date.now();

  try {
    const email = rawEmail.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email },

      select: {
        id: true,
        email: true,
        firstName: true,
        role: true,
        status: true,
        passwordHash: true,
      },
    });

    if (
      user &&
      user.role === "CLIENT" &&
      user.status === "ACTIVE" &&
      user.passwordHash
    ) {
      const token = generatePasswordResetToken();
      const tokenHash = hashPasswordResetToken(token);

      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
        },
      });

      const resetUrl = `${getSiteUrl()}/reinitialiser-mot-de-passe?token=${encodeURIComponent(
        token,
      )}`;

      try {
        await sendPasswordResetEmail({
          recipientEmail: user.email,
          recipientName: user.firstName,
          resetUrl,
        });
      } catch (reason: unknown) {
        console.error("[PASSWORD_RESET_EMAIL]", reason);
      }
    }
  } finally {
    const elapsed = Date.now() - startedAt;

    if (elapsed < MINIMUM_RESPONSE_TIME_MS) {
      await new Promise((resolve) =>
        setTimeout(resolve, MINIMUM_RESPONSE_TIME_MS - elapsed),
      );
    }
  }
}

export async function resetPassword(
  rawToken: string,
  newPassword: string,
): Promise<void> {
  const tokenHash = hashPasswordResetToken(rawToken);
  const now = new Date();

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    select: { id: true, userId: true, expiresAt: true, usedAt: true },
  });

  if (!resetToken || resetToken.usedAt || resetToken.expiresAt <= now) {
    throw new PasswordResetError(
      "Ce lien de réinitialisation est invalide ou a expiré.",
    );
  }

  const newPasswordHash = await bcrypt.hash(newPassword, 12);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetToken.userId },

      data: {
        passwordHash: newPasswordHash,
        authVersion: { increment: 1 },
      },
    }),

    // Marque aussi comme utilisés les autres liens non expirés
    // éventuellement encore en circulation pour ce compte.
    prisma.passwordResetToken.updateMany({
      where: { userId: resetToken.userId, usedAt: null },
      data: { usedAt: now },
    }),
  ]);
}
