#!/bin/sh
# Publish the committed web app using the same branch model as Rational Realms.
set -eu
cd "$(dirname "$0")/.."
if [ "$(git branch --show-current)" != "main" ]; then
  echo "Switch to main before deploying."
  exit 1
fi
if [ -n "$(git status --porcelain)" ]; then
  echo "Commit your changes before deploying so GitHub receives the tested version."
  exit 1
fi
npm test
git subtree split --prefix=www --branch=gh-pages
git push --atomic origin main gh-pages
# Explicitly queue publication even when GitHub does not schedule a branch build.
gh api --method POST repos/ManojRaga/quad-quest/pages/builds
echo "GitHub Pages will publish https://manojraga.github.io/quad-quest/"
