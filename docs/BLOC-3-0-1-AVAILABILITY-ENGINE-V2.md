# Bloc 3.0.1 — Availability Engine V2

Ce correctif améliore le moteur existant sans modifier l'API publique.

## Ajouts

- préavis minimum de réservation de 15 minutes ;
- prise en compte du nettoyage après les rendez-vous existants ;
- prise en compte du nettoyage pour les conflits de poste ;
- obligation de terminer le nettoyage avant la fermeture ;
- tri déterministe des créneaux par heure, professionnelle et poste ;
- conservation des horaires, pauses, absences et exceptions existants.

## Vérification

```bash
pnpm typecheck
pnpm build
```

API conservée :

`GET /api/availability?staffId=...&date=YYYY-MM-DD&serviceId=...`
