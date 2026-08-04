#!/usr/bin/env bash
#
# Start a Salla preview, healing the version-tag drift on the way.
#
# Salla holds the theme version counter server-side and increments it on every
# preview attempt. An attempt that dies before its tag reaches GitHub leaves the
# two out of step, and every later attempt fails with `Tag <version> already
# exists`. The fix is always the same: push the tag Salla named, then retry.
# See docs/building-a-salla-theme.md point 25.
#
# Usage:  ./scripts/preview.sh [store-name]        (default: SamarStore)

set -uo pipefail

STORE="${1:-SamarStore}"
LOG="$(mktemp -t salla-preview)"
trap 'rm -f "$LOG"' EXIT

# A preview left running from an earlier session competes for the asset server on
# :8002. When it wins, the storefront loads no theme CSS at all and the page renders
# bare — which reads as a broken theme, not a stale process. One was found still
# alive 13 hours later, pointed at a store that no longer existed.
EXISTING="$(pgrep -f 'salla theme preview' 2>/dev/null)"
if [ -n "$EXISTING" ]; then
  echo "✗ A preview is already running:" >&2
  # shellcheck disable=SC2086
  ps -o pid,lstart,command -p $EXISTING 2>/dev/null | sed 1d | cut -c1-110 >&2
  echo "" >&2
  echo "  Stop it first, then run this again:" >&2
  echo "    kill $(echo "$EXISTING" | tr '\n' ' ')" >&2
  exit 1
fi

run_preview() {
  salla theme preview --store "$STORE" --without-editor 2>&1 | tee "$LOG"
  return "${PIPESTATUS[0]}"
}

echo "→ preview · store: $STORE"
run_preview && exit 0

TAG="$(grep -oE 'Tag [0-9]+\.[0-9]+\.[0-9]+ already exists' "$LOG" \
       | head -1 | awk '{print $2}')"

if [ -z "$TAG" ]; then
  echo "" >&2
  echo "✗ Preview failed for a reason this script does not handle." >&2
  echo "  Read the error above. Do not invent a tag or switch stores blindly —" >&2
  echo "  a dead store reports HTTP 410 while still listed by \`salla store list\`." >&2
  echo "  See docs/building-a-salla-theme.md 23b." >&2
  exit 1
fi

if git rev-parse -q --verify "refs/tags/$TAG" >/dev/null; then
  echo "" >&2
  echo "✗ Tag $TAG already exists locally, so this is not the usual drift." >&2
  echo "  Stopping rather than guessing. Inspect it: git show $TAG" >&2
  exit 1
fi

echo ""
echo "→ Salla asked for tag $TAG; the repo does not have it. Closing the gap."
git push origin master   || { echo "✗ could not push master" >&2; exit 1; }
git tag "$TAG"           || { echo "✗ could not create tag $TAG" >&2; exit 1; }
git push origin "$TAG"   || { echo "✗ could not push tag $TAG" >&2; exit 1; }

echo "→ tag $TAG pushed at $(git rev-parse --short HEAD). Retrying once."
echo ""
run_preview
