#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SPEC="$ROOT_DIR/services/api/openapi/watch-store-api.yaml"
OUT_DIR="$ROOT_DIR/packages/api-client/src/generated"

if ! command -v npx >/dev/null 2>&1; then
  echo "Error: npx is required." >&2
  exit 1
fi

mkdir -p "$OUT_DIR"
npx --yes openapi-typescript "$SPEC" -o "$OUT_DIR/schema.d.ts"
echo "Generated TypeScript types at packages/api-client/src/generated/schema.d.ts"
