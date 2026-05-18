#!/usr/bin/env bash
# Build script for Netlify — tolerante a DATABASE_URL ausente no momento do build.
# As tabelas são criadas no primeiro acesso via bootstrap() em runtime (deploy preview)
# ou imediatamente aqui se a env já estiver disponível.
set -e

echo "▶ prisma generate"
npx prisma generate

DB_URL="${DATABASE_URL:-${NETLIFY_DATABASE_URL:-${NETLIFY_DATABASE_URL_UNPOOLED:-}}}"

if [ -n "$DB_URL" ]; then
  echo "▶ DATABASE_URL detectado, executando prisma db push"
  DATABASE_URL="$DB_URL" npx prisma db push --accept-data-loss --skip-generate || {
    echo "⚠ prisma db push falhou (provavelmente sem rede no build), continuando — schema será aplicado no primeiro acesso."
  }
else
  echo "⚠ DATABASE_URL não definido neste build context — pulando prisma db push. Será aplicado em runtime."
fi

echo "▶ next build"
npx next build
