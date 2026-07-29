# Bloc 3.0.5.3.1 — Correctif des mocks API

Le test simulait `@/auth`, alors que la route charge l'authentification depuis
`@/lib/auth`. Le vrai module était donc évalué et initialisait Prisma, ce qui
provoquait l'erreur `DATABASE_URL est absente`.

Le correctif aligne également le mock du service de création sur son alias
absolu afin que Vitest intercepte exactement le module importé par la route.

Aucune variable d'environnement factice n'est ajoutée et aucune base de données
n'est utilisée pendant ces tests.
