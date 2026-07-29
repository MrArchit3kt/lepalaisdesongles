/**
 * Détermine si les cookies NextAuth doivent utiliser
 * l’attribut Secure.
 *
 * NEXTAUTH_URL est prioritaire :
 * - https://...  => cookies sécurisés ;
 * - http://...   => cookies non sécurisés, notamment
 *   pour les tests locaux avec `next start`.
 *
 * En l’absence d’URL exploitable, la production reste
 * sécurisée par défaut.
 */
export function shouldUseSecureAuthCookies():
  boolean {
  const configuredUrl =
    process.env.NEXTAUTH_URL?.trim();

  if (
    configuredUrl
  ) {
    try {
      return (
        new URL(
          configuredUrl,
        ).protocol ===
        "https:"
      );
    } catch {
      /*
       * Une URL incorrecte ne doit pas désactiver
       * les cookies sécurisés en production.
       */
    }
  }

  return (
    process.env.NODE_ENV ===
    "production"
  );
}
