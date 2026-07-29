# Bloc 3.0.4.3 — Verrouillage du créneau

## Sécurisation du flux public

- Vérification locale que le créneau sélectionné appartient toujours à la dernière réponse de disponibilité.
- Envoi exclusif des identifiants réels de la professionnelle et du poste.
- Protection contre les doubles clics grâce à l'état `submitting`.
- Réponse API structurée avec le code `SLOT_UNAVAILABLE`.
- Statut HTTP 409 lorsqu'un créneau est devenu indisponible.
- Actualisation automatique des horaires après un conflit.
- Conservation des prestations, de la date, de la professionnelle choisie et du commentaire client.
- Désélection du seul créneau devenu obsolète.
- Message clair lorsqu'une autre cliente vient de réserver le même horaire.

## Protection serveur conservée

Le service `createAppointment` continue de :

1. recalculer les disponibilités ;
2. rechercher le créneau exact ;
3. vérifier les conflits dans une transaction Prisma `Serializable`.
