# Bloc 3.0.5.3.2 — Session NextAuth et erreurs API

Ce correctif :

- simule `getServerSession` depuis `next-auth` ;
- fournit un export factice `authOptions` ;
- conserve le mock du service de création ;
- évite toute initialisation de Prisma dans les tests ;
- masque les erreurs techniques internes de l'API ;
- conserve les messages publics liés aux conflits de créneau ;
- conserve les erreurs métier explicitement autorisées.

Aucune migration Prisma n'est nécessaire.
