#!/bin/bash
set -e
pnpm install --frozen-lockfile
pnpm --filter db push || echo "Skipping db push during post-merge setup"
