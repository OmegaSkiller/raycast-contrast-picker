#!/usr/bin/env bash
# Copies the Store files of this extension to your fork of raycast/extensions and pushes the PR branch.
# Usage: scripts/sync-to-raycast.sh "commit message"
set -euo pipefail

SRC="$(cd "$(dirname "$0")/.." && pwd)"
FORK="${RAYCAST_FORK:-OmegaSkiller/extensions}"
BRANCH="${RAYCAST_BRANCH:-ext/contrast-picker}"
MESSAGE="${1:-Update contrast-picker}"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

git clone --quiet --depth 1 --branch "$BRANCH" "https://github.com/$FORK.git" "$WORK/fork"
DEST="$WORK/fork/extensions/contrast-picker"
rm -rf "$DEST"
mkdir -p "$DEST"

rsync -a \
  --exclude '.git' --exclude 'node_modules' --exclude 'test' --exclude 'scripts' \
  --exclude 'vitest.config.mts' --exclude 'LICENSE' --exclude 'CONTRIBUTING.md' \
  --exclude 'package-lock.json' --exclude 'raycast-env.d.ts' --exclude 'dist' \
  --exclude '.build' --exclude '.swiftpm' --exclude '.raycast-swift-build' --exclude 'compiled_raycast_swift' \
  "$SRC/" "$DEST/"

node -e '
const fs = require("fs");
const file = process.argv[1];
const pkg = JSON.parse(fs.readFileSync(file, "utf8"));
delete pkg.scripts.test;
delete pkg.scripts["generate:tailwind"];
delete pkg.devDependencies.vitest;
delete pkg.devDependencies.tailwindcss;
fs.writeFileSync(file, JSON.stringify(pkg, null, 2) + "\n");
' "$DEST/package.json"

(cd "$DEST" && npm install --package-lock-only --silent)

cd "$WORK/fork"
git add -A
if git diff --cached --quiet; then
  echo "No changes to push."
  exit 0
fi
git commit --quiet -m "$MESSAGE"
git push --quiet origin "$BRANCH"
echo "Pushed to $FORK:$BRANCH"
