# Maestro 

## Développement

### Prérequis

- node
- npm
- serveur Postgres (sur macOS, possible d'utiliser [postgresapp](https://postgresapp.com>))
- service de stockage S3
- serveur mail (par exemple mailDev)

### Base de données

Créer une base de données vide pour l'application (par exemple `maestro`) et une autre pour les tests (par exemple `test_maestro`).

La création des tables et autres structures SQL se fera automatiquement lors du lancement de l'application via les migrations [KnexJS](http://knexjs.org/#Migrations) contenues dans le répertoire `/database/migrations`

### Stockage S3

Pour le stockage des fichiers, l'application utilise un service S3. 
En local et pour les tests, il est possible d'utiliser https://github.com/adobe/S3Mock
```bash
docker compose up -d
```

### Installation de l'application

```bash
git clone https://github.com/betagouv/maestro.git

cd maestro 
npm ci

cd frontend
npm ci
```

### Variables d'environnement

L'application utilise les variables d'environnement suivantes :

```
APPLICATION_HOST
NODE_ENV
API_PORT
AUTH_SECRET
AUTH_EXPIRES_IN
DATABASE_URL
MAILER_PROVIDER
MAILER_HOST
MAILER_PORT
MAILER_USER
MAILER_PASSWORD
MAILER_API_KEY
MAILER_EVENT_API_KEY
MAILER_SECURE
MAX_RATE
S3_ENDPOINT
S3_REGION
S3_ACCESS_KEY_ID
S3_SECRET_ACCESS_KEY
S3_BUCKET
S3_FILE_PATH
INBOX_MAILBOX_NAME
INBOX_TRASHBOX_NAME
INBOX_ERRORBOX_NAME
INBOX_HOST
INBOX_PORT
INBOX_USER
INBOX_PASSWORD
M2M_BASIC_TOKEN

REACT_APP_PUBLIC_URL
REACT_APP_API_URL
```

En local, elles peuvent être définies dans des fichiers `.env` :
- un fichier dans le dossier `frontend` pour les variables d'environnement `REACT_APP...` nécessaires au frontend (voir `frontend/.env.example` pour un exemple)
- un fichier à la racine du projet pour les autres variables d'environnement (voir `.env.example` pour un exemple)


### Chargement des données

Vous pouvez injecter un jeu de données grâce au répertoire `/database/seeds/dummy`.

```bash
npm run seed
```

### Lancement de l'application en local

```bash
npm run start-local
```

L'application est accessible à l'adresse sur <http://localhost:3000>

### Lancement des tests

**Frontend**

```bash
npm run frontend:test
```

**Backend**

```bash
npm run test
```

## Démo

La version de démo de l'application est accessible à l'adresse <https://maestro.incubateur.net>

## Production
