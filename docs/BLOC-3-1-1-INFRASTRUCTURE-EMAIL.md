# Bloc 3.1.1 — Infrastructure e-mail

Ce bloc ajoute :

- les types des notifications de rendez-vous ;
- les modèles d'e-mails en français ;
- la confirmation, modification, annulation et les rappels ;
- un fournisseur Resend sans dépendance npm supplémentaire ;
- l'échappement HTML ;
- un mode désactivé ou non configuré sans erreur ;
- six tests unitaires.

Variables :

```env
EMAIL_ENABLED=true
RESEND_API_KEY=
EMAIL_FROM="Le Palais des Ongles <contact@lepalaisdesongles.fr>"
```

Ce sous-bloc ne déclenche pas encore les e-mails automatiquement.
