# Déploiement sur VPS (Ubuntu 24.04)

Guide pour mettre NailStudio Pro en production sur un VPS, en
remplacement de Vercel. `vercel.json` reste dans le dépôt mais n'est
lu que par Vercel — il est inactif ici, les tâches planifiées qu'il
décrivait sont reprises par `deploy/crontab.txt`.

## 1. Prérequis sur le serveur

```bash
# Node.js 22 (via nvm, recommandé pour pouvoir changer de version facilement)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
nvm install 22
nvm use 22

# pnpm
corepack enable
corepack prepare pnpm@latest --activate

# PostgreSQL, nginx, certbot, PM2
sudo apt update
sudo apt install -y postgresql nginx certbot python3-certbot-nginx
npm install -g pm2
```

Crée la base et l'utilisateur PostgreSQL dédiés à l'app (adapte les
identifiants) :

```bash
sudo -u postgres psql -c "CREATE USER nailstudio WITH PASSWORD 'change-moi';"
sudo -u postgres psql -c "CREATE DATABASE nailstudio_db OWNER nailstudio;"
```

## 2. Récupérer et configurer l'application

```bash
git clone git@github.com:MrArchit3kt/lepalaisdesongles.git nailstudio-pro
cd nailstudio-pro
cp .env.example .env
```

Édite `.env` avec les vraies valeurs de production. Points
particulièrement importants :

- `DATABASE_URL` → pointe vers la base PostgreSQL créée ci-dessus.
- `NEXT_PUBLIC_APP_URL` et `NEXTAUTH_URL` → `https://lepalaisdesongles.fr`
  (le `https://` conditionne l'activation des cookies sécurisés, voir
  `src/lib/auth-cookie-policy.ts`).
- `AUTH_SECRET` / `NEXTAUTH_SECRET` → générés avec `openssl rand -base64 48`,
  différents des valeurs de développement.
- `CRON_SECRET` → généré de la même façon, utilisé par `deploy/run-cron.sh`.
- `PAYPAL_ENVIRONMENT=live` avec les vraies clés PayPal (pas les clés
  sandbox utilisées en développement).
- Toutes les autres clés (Resend, UploadThing, Google...) avec leurs
  valeurs réelles.

## 3. Installer, générer, migrer, builder

Tout se fait directement sur le VPS : le moteur Prisma généré
correspondra ainsi automatiquement à cet environnement (Ubuntu 24.04
/ OpenSSL 3.0, déjà déclaré explicitement dans
`prisma/schema.prisma` via `binaryTargets`).

```bash
pnpm install
pnpm db:generate
pnpm db:deploy         # applique les migrations (jamais db:push en prod)
pnpm db:seed           # compte admin, catégories, prestations, horaires...
pnpm seed:workstations # ⚠️ étape séparée et indispensable, voir ci-dessous
pnpm build
```

> **`pnpm seed:workstations` est indispensable, pas optionnel.**
> `db:seed` crée les prestations, le personnel et les postes de
> travail comme des enregistrements séparés, mais ne les relie pas
> entre eux. Sans `seed:workstations` (qui assigne le personnel aux
> postes et les postes aux prestations), le moteur de disponibilité
> ne trouve aucune combinaison valide : **aucun créneau ne
> s'affichera jamais côté réservation**, même si tout paraît actif
> dans l'admin. Toujours lancer `db:seed` avant `seed:workstations`
> (le second dépend des données créées par le premier).

## 4. Lancer l'app avec PM2

```bash
mkdir -p deploy/logs
pm2 start deploy/ecosystem.config.cjs
pm2 save
pm2 startup         # exécute la commande affichée (une seule fois)
```

Vérifie que l'app répond en local avant de brancher nginx :

```bash
curl -I http://127.0.0.1:3000
```

## 5. nginx + HTTPS

```bash
sudo cp deploy/nginx.conf /etc/nginx/sites-available/lepalaisdesongles.fr
sudo ln -s /etc/nginx/sites-available/lepalaisdesongles.fr /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

sudo certbot --nginx -d lepalaisdesongles.fr -d www.lepalaisdesongles.fr
```

Certbot modifie automatiquement `/etc/nginx/sites-available/lepalaisdesongles.fr`
pour ajouter le bloc HTTPS et la redirection HTTP → HTTPS, et met en
place le renouvellement automatique du certificat.

## 6. Tâches planifiées (remplace les crons Vercel)

```bash
chmod +x deploy/run-cron.sh
crontab -e
# coller le contenu de deploy/crontab.txt en adaptant les chemins
```

Teste chaque route manuellement avant de faire confiance au cron :

```bash
./deploy/run-cron.sh notifications
./deploy/run-cron.sh uploads
```

## 7. Vérifications post-déploiement

- [ ] `https://lepalaisdesongles.fr` répond avec un cadenas valide
- [ ] `NEXT_PUBLIC_APP_URL` et `NEXTAUTH_URL` valent bien
      `https://lepalaisdesongles.fr` dans le `.env` du VPS (sinon
      l'inscription, l'envoi de messages, la création de rendez-vous
      et l'upload d'images échouent tous avec une erreur "origine non
      autorisée", silencieusement pour l'upload)
- [ ] Un compte cliente peut être créé depuis le site
- [ ] Une image peut être importée dans la galerie ou une prestation
      depuis l'admin
- [ ] Des créneaux s'affichent bien en réservant une prestation
      (sinon : `pnpm seed:workstations` n'a probablement pas été lancé)
- [ ] Connexion admin fonctionnelle, cookies bien envoyés en `Secure`
- [ ] Un rendez-vous test peut être créé et payé (webhook PayPal
      configuré sur `https://lepalaisdesongles.fr/api/paypal/webhook`
      dans le dashboard PayPal, avec `PAYPAL_WEBHOOK_ID` renseigné)
- [ ] `pm2 status` montre l'app `online`, `pm2 logs` sans erreur en boucle
- [ ] Les deux crons ont bien tourné au moins une fois
      (`tail deploy/logs/cron.log`)
- [ ] `pm2 startup` + `pm2 save` confirmés : un `sudo reboot` du VPS
      doit relancer l'app toute seule

## Mise à jour ultérieure

```bash
cd nailstudio-pro
git pull
pnpm install
pnpm db:generate
pnpm db:deploy
pnpm build
pm2 restart nailstudio-pro
```
