# PSPC

## Développement

### Prérequis

* node
* npm
* serveur Postgres (sur macOS, possible d'utiliser [postgresapp](https://postgresapp.com>))

### Base de données

Créer une base de données vide pour l'application (par exemple `pspc`) et une autre pour les tests (par exemple `test_pspc`).

La création des tables et autres structures SQL se fera automatiquement lors du lancement de l'application via les migrations [KnexJS](http://knexjs.org/#Migrations) contenues dans le répertoire `/database/migrations`

### Installation de l'application

```bash
git clone https://github.com/betagouv/pspc.git

cd pspc
npm i

cd frontend
npm i
```

### Variables d'environnement

//TODO


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

La version de démo de l'application est accessible à l'adresse <https://pspc.incubateur.net>

## Production
