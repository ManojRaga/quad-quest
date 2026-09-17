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
echo "GitHub Pages will publish https://manojraga.github.io/quad-quest/"
