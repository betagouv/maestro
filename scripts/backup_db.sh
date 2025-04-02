#!/usr/bin/env bash
: "${RESTIC_PASSWORD:?Variable RESTIC_PASSWORD non définie}"
: "${S3_BACKUP_BUCKET:?Variable S3_BACKUP_BUCKET non définie}"
: "${S3_ENDPOINT:?Variable S3_ENDPOINT non définie}"
: "${S3_REGION:?Variable S3_REGION non définie}"
: "${S3_ACCESS_KEY_ID:?Variable S3_ACCESS_KEY_ID non définie}"
: "${S3_SECRET_ACCESS_KEY:?Variable S3_SECRET_ACCESS_KEY non définie}"

if [ "${APP}" != "maestro-prod" ]; then
  return 0
fi

dbclient-fetcher pgsql

pg_dump ${SCALINGO_POSTGRESQL_URL} --clean --if-exists --format=d --no-owner --no-privileges --file=./backups/

restic self-update
AWS_ACCESS_KEY_ID=${S3_ACCESS_KEY_ID} AWS_SECRET_ACCESS_KEY=${S3_SECRET_ACCESS_KEY} restic -o s3.region="${S3_REGION}" -r s3:${S3_ENDPOINT}/${S3_BACKUP_BUCKET} --no-cache backup backups
AWS_ACCESS_KEY_ID=${S3_ACCESS_KEY_ID} AWS_SECRET_ACCESS_KEY=${S3_SECRET_ACCESS_KEY} restic -o s3.region="${S3_REGION}" -r s3:${S3_ENDPOINT}/${S3_BACKUP_BUCKET} --no-cache forget --keep-last 15 --keep-weekly 12 --keep-monthly 12 --keep-yearly 10 --prune
