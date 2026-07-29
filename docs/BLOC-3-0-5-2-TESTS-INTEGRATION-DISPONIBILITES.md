# Bloc 3.0.5.2 — Tests d'intégration des disponibilités

Ce bloc ajoute des tests avec Prisma simulé pour vérifier :

- les horaires généraux du salon ;
- les fermetures propres à une professionnelle ;
- les absences de l'équipe ;
- les fermetures globales ;
- les rendez-vous existants et le nettoyage ;
- l'affectation d'un autre poste compatible ;
- le mode `staffId=any` ;
- la priorité donnée à la professionnelle la moins chargée ;
- la déduplication des horaires automatiques ;
- le refus d'une professionnelle incompatible.

Aucune donnée réelle de la base n'est modifiée.
