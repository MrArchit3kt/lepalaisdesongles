/*
 * Remplace le paquet "server-only" pendant les tests Vitest.
 *
 * Le vrai paquet lève une erreur dès son import ; c'est Next.js
 * qui l'intercepte via son bundler pour empêcher qu'un module
 * serveur finisse dans un bundle client. Vitest n'exécute jamais
 * de code client, cette garde n'a donc rien à vérifier ici.
 */
export {};
