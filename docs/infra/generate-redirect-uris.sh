#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 2 ]]; then
  echo "Usage: $0 <start_index> <count> >> dex-config.yaml" >&2
  exit 1
fi

start=$1
count=$2
end=$((start + count - 1))

for i in $(seq "$start" "$end"); do
  echo "      - https://maestro-staging-pr${i}.osc-fr1.scalingo.io/login-callback"
done
