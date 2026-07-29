# Bloc 2.9.2 — Horaires de l’équipe

Route : `/admin/horaires/equipe`

Fonctions :
- sélection d’une professionnelle ;
- jours travaillés et jours de repos ;
- horaires individuels ;
- pauses individuelles ;
- héritage automatique des horaires du salon ;
- réinitialisation complète sur les horaires du salon ;
- API administrateur sécurisée.

Vérification :

```bash
pnpm db:generate
pnpm typecheck
pnpm build
```
