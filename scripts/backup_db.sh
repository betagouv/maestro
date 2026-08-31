#!/usr/bin/env bash
set -euo pipefail

: "${RESTIC_PASSWORD:?Variable RESTIC_PASSWORD non définie}"
: "${S3_BACKUP_BUCKET:?Variable S3_BACKUP_BUCKET non définie}"
: "${S3_ENDPOINT:?Variable S3_ENDPOINT non définie}"
: "${S3_REGION:?Variable S3_REGION non définie}"
: "${S3_ACCESS_KEY_ID:?Variable S3_ACCESS_KEY_ID non définie}"
: "${S3_SECRET_ACCESS_KEY:?Variable S3_SECRET_ACCESS_KEY non définie}"

if [ "${APP}" != "maestro-prod" ]; then
  exit 0
fi

dbclient-fetcher pgsql 17

pg_dump ${SCALINGO_POSTGRESQL_URL} --clean --if-exists --format=d --no-owner --no-privileges --file=./backups/

if [ ! -s ./backups/toc.dat ]; then
  echo "Dump invalide : ./backups/toc.dat absent ou vide, sauvegarde annulée" >&2
  exit 1
fi

export AWS_ACCESS_KEY_ID="${S3_ACCESS_KEY_ID}"
export AWS_SECRET_ACCESS_KEY="${S3_SECRET_ACCESS_KEY}"

restic -o s3.region="${S3_REGION}" -r "s3:${S3_ENDPOINT}/${S3_BACKUP_BUCKET}" --no-cache backup backups
restic -o s3.region="${S3_REGION}" -r "s3:${S3_ENDPOINT}/${S3_BACKUP_BUCKET}" --no-cache forget --group-by paths --keep-last 30 --keep-weekly 26 --keep-monthly 24 --keep-yearly 10 --prune
