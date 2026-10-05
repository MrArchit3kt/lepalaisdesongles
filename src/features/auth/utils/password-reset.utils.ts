import "server-only";

import { createHash, randomBytes } from "node:crypto";

/*
 * Même principe que les jetons de checkout des cartes cadeaux
 * (gift-card.utils.ts) : seul le hash est stocké en base, le jeton
 * en clair ne transite que dans l'e-mail et l'URL de réinitialisation.
 */
export function generatePasswordResetToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashPasswordResetToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
