# Bloc 3.0.4.1 — Première professionnelle disponible

## Interface ajoutée

- Carte claire « Première professionnelle disponible ».
- Badge indiquant que ce mode est recommandé.
- Confirmation visuelle après sélection d'un créneau.
- Affichage de la date, de l'heure, de la professionnelle et du poste.
- Mention « attribuée automatiquement » en mode `any`.
- Résumé latéral détaillé avant le paiement.

## Sécurité du flux

Le formulaire transmet toujours les identifiants réels contenus dans le créneau :

- `selectedSlot.staff.id`
- `selectedSlot.workstation.id`

Aucune valeur `any` n'est envoyée lors de la création du rendez-vous.
