#!/usr/bin/env bash
set -euo pipefail
VER="${1:-}"; [ -z "$VER" ] && { echo "Gebruik: ./release.sh 1.2.0"; exit 1; }

# helpers
bump() {
  local FILE="$1"
  [ -f "$FILE" ] || return 0
  if command -v jq >/dev/null 2>&1; then
    jq --arg v "$VER" '.version=$v' "$FILE" > "$FILE.tmp" && mv "$FILE.tmp" "$FILE"
  else
    sed -i "s/\"version\": \".*\"/\"version\": \"$VER\"/" "$FILE"
  fi
}

# 1) bump versies
bump app.json
bump .homeycompose/app.json
bump package.json || true

# 2) changelog notes sinds vorige tag
LAST_TAG="$(git describe --tags --abbrev=0 2>/dev/null || echo '')"
if [ -n "$LAST_TAG" ]; then
  RANGE="${LAST_TAG}..HEAD"
else
  RANGE="HEAD"
fi

NOTES="$(git log --pretty='- %s' --no-merges $RANGE || true)"
DATE="$(date +%F)"
HEADER="## [${VER}] — ${DATE}"
if [ -z "${NOTES}" ]; then
  NOTES="- Release ${VER}"
fi

# 3) schrijf CHANGELOG.md (prepend)
if [ -f CHANGELOG.md ]; then
  printf "%s\n%s\n\n%s" "${HEADER}" "${NOTES}" "$(cat CHANGELOG.md)" > CHANGELOG.md
else
  printf "# Changelog\n\n%s\n%s\n" "${HEADER}" "${NOTES}" > CHANGELOG.md
fi

# 4) commit + tag + push
git add app.json .homeycompose/app.json package.json CHANGELOG.md 2>/dev/null || true
git commit -m "release: bump to v${VER}"
git tag -a "v${VER}" -m "Release v${VER}"
git push origin main
git push origin "v${VER}"

echo "✅ v${VER} gepusht. CI maakt nu de GitHub Release + app.homey."
