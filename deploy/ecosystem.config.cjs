/**
 * Configuration PM2 pour faire tourner NailStudio Pro en production
 * sur le VPS (Ubuntu 24.04).
 *
 * Utilisation :
 *   pm2 start deploy/ecosystem.config.js
 *   pm2 save
 *   pm2 startup   # affiche la commande à lancer une seule fois pour
 *                 # que PM2 redémarre l'app automatiquement au reboot
 *
 * Voir deploy/README.md pour la procédure complète.
 */
module.exports = {
  apps: [
    {
      name: "nailstudio-pro",
      cwd: __dirname + "/..",
      script: "node_modules/.bin/next",
      // Port 3000 par défaut : si le VPS héberge déjà une autre app
      // sur ce port, changez-le ici ET dans `env.PORT` ci-dessous ET
      // dans `deploy/nginx.conf` (proxy_pass). `deploy/run-cron.sh`
      // lit lui la valeur directement depuis `.env`, pas besoin de le
      // modifier séparément.
      args: "start -p 3000",

      // Un seul process pour commencer : suffisant pour le trafic
      // d'un salon, plus simple à surveiller. Le rate-limiting est
      // stocké en base (pas en mémoire), donc passer en mode cluster
      // plus tard (plusieurs instances) est possible sans le revoir.
      instances: 1,
      exec_mode: "fork",

      autorestart: true,
      max_restarts: 10,
      restart_delay: 5000,

      // Redémarre si l'app dépasse cette mémoire (fuite éventuelle),
      // à ajuster selon la RAM réelle du VPS.
      max_memory_restart: "512M",

      env: {
        NODE_ENV: "production",
        PORT: "3000",
      },

      out_file: "deploy/logs/out.log",
      error_file: "deploy/logs/error.log",
      merge_logs: true,
      time: true,
    },
  ],
};
