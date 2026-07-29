# Bloc 3.0.3 — Optimisation intelligente du planning

## Règles ajoutées

- Les horaires restent affichés dans l'ordre chronologique.
- Quand plusieurs professionnelles sont disponibles à la même heure, le moteur privilégie celle dont le créneau réduit le plus les trous du planning.
- Un créneau directement avant ou après un rendez-vous existant obtient la meilleure priorité.
- En cas d'égalité, la charge quotidienne, les minutes occupées et le `sortOrder` départagent les professionnelles.
- Le choix manuel d'une professionnelle reste inchangé.
- Aucun changement de schéma Prisma n'est nécessaire.
