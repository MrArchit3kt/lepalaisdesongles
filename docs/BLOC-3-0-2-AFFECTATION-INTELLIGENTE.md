# Bloc 3.0.2 — Affectation intelligente

## Comportement

- `staffId=any` cherche toutes les professionnelles compatibles.
- Une seule proposition est retournée pour une heure identique.
- La priorité va à la professionnelle ayant :
  1. le moins de rendez-vous dans la journée ;
  2. le moins de minutes déjà occupées ;
  3. le plus petit `sortOrder`.
- Le créneau retourné contient toujours le véritable `staff.id` et le véritable poste.
- La création du rendez-vous continue donc à verrouiller la professionnelle et le poste sélectionnés.
- Le choix explicite d'une professionnelle conserve le comportement précédent.

## Correctifs inclus

- correction de la sélection Prisma de `StaffTimeOff` ;
- chargement du nettoyage pour les rendez-vous utilisant un poste ;
- conservation du préavis de 15 minutes ;
- conservation des horaires, pauses, absences et exceptions.
