import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),

      /*
       * Le paquet "server-only" lève volontairement une erreur
       * dès qu'il est importé — Next.js l'intercepte via son
       * bundler pour les modules serveur. Vitest n'a pas cette
       * intégration : on le neutralise pour pouvoir tester le
       * code serveur qui l'importe (garde-fous, services...).
       */
      "server-only": fileURLToPath(
        new URL("./src/test/server-only-stub.ts", import.meta.url),
      ),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "src/**/*.spec.ts"],
    clearMocks: true,
    restoreMocks: true,
  },
});
