#!/usr/bin/env bash
#
# Appelle une route de tâche planifiée de l'app (remplace les
# "crons" de vercel.json, qui ne fonctionnent que sur Vercel).
#
# Usage : ./run-cron.sh <notifications|uploads>
#
# Installation dans crontab (crontab -e) :
#   0 * * * *  /chemin/vers/nailstudio-pro/deploy/run-cron.sh notifications >> /chemin/vers/nailstudio-pro/deploy/logs/cron.log 2>&1
#   0 3 * * *  /chemin/vers/nailstudio-pro/deploy/run-cron.sh uploads       >> /chemin/vers/nailstudio-pro/deploy/logs/cron.log 2>&1

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(dirname "$SCRIPT_DIR")"

TARGET="${1:-}"

case "$TARGET" in
  notifications)
    ROUTE="/api/cron/notifications"
    ;;
  uploads)
    ROUTE="/api/cron/uploads"
    ;;
  *)
    echo "Usage: $0 <notifications|uploads>" >&2
    exit 1
    ;;
esac

# Charge CRON_SECRET depuis le .env de l'app sans exposer le reste
# des variables au shell appelant. `|| true` évite que `set -e` tue
# le script quand grep ne trouve rien (pipefail ferait sinon échouer
# tout le pipeline silencieusement, avant même le message d'erreur
# ci-dessous).
CRON_SECRET="$(grep -E '^CRON_SECRET=' "$APP_DIR/.env" 2>/dev/null | head -n1 | cut -d '=' -f2- | tr -d '"' || true)"

if [ -z "$CRON_SECRET" ]; then
  echo "$(date -Is) [$TARGET] CRON_SECRET manquant dans $APP_DIR/.env" >&2
  exit 1
fi

# Appelle le vrai domaine public plutôt que 127.0.0.1:<port> : deviner
# le port local est fragile sur un VPS qui héberge plusieurs apps (le
# port réellement utilisé par PM2 au démarrage peut différer de celui
# écrit dans deploy/ecosystem.config.cjs, par ex. si l'app a été
# lancée avec un PORT= passé en ligne de commande). nginx, lui, route
# déjà correctement vers le bon process : on s'appuie dessus plutôt
# que de dupliquer cette logique ici.
APP_URL="$(grep -E '^NEXT_PUBLIC_APP_URL=' "$APP_DIR/.env" 2>/dev/null | head -n1 | cut -d '=' -f2- | tr -d '"' || true)"

if [ -z "$APP_URL" ]; then
  APP_URL="$(grep -E '^NEXTAUTH_URL=' "$APP_DIR/.env" 2>/dev/null | head -n1 | cut -d '=' -f2- | tr -d '"' || true)"
fi

if [ -z "$APP_URL" ]; then
  APP_URL="https://lepalaisdesongles.fr"
fi

RESPONSE=$(curl -sS -o /tmp/cron-response.$$ -w "%{http_code}" \
  -H "Authorization: Bearer $CRON_SECRET" \
  "${APP_URL%/}${ROUTE}")

STATUS="$RESPONSE"
BODY="$(cat /tmp/cron-response.$$ 2>/dev/null || true)"
rm -f /tmp/cron-response.$$

if [ "$STATUS" != "200" ]; then
  echo "$(date -Is) [$TARGET] échec (HTTP $STATUS) : $BODY" >&2
  exit 1
fi

echo "$(date -Is) [$TARGET] ok : $BODY"
