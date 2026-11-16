# Infra pour la génération de PDFs et pour l'authentification de preprod

## `docker-compose.yml`

Lance trois services :

- **Caddy** : reverse proxy HTTPS (terminaison TLS automatique) qui expose `login-maestro.vcmb.dev` vers Dex.
- **Dex** : fournisseur OIDC configuré via `dex-config.yaml` (utilisateurs et clients statiques en mémoire).
- **Browserless** : Chromium headless pour la génération de PDF.

> ⚠️ **TODO** :
> - remplacer le `TOKEN=1234512345` du service `browserless` par un secret avant tout déploiement ;
> - remplacer dans `dex-config.yaml` le `hash` du `staticPasswords` (mot de passe admin) par un hash bcrypt propre ;
> - remplacer le `secret` du client `maestro-staging` par une valeur générée aléatoirement.

```bash
docker compose up -d
```

## `generate-redirect-uris.sh`

Génère une plage de `redirectURIs` pour les PR de staging Scalingo, à coller dans `dex-config.yaml` sous le client `maestro-staging`.

```bash
./generate-redirect-uris.sh <start_index> <count> >> dex-config.yaml
# ex: ./generate-redirect-uris.sh 830 20
```
