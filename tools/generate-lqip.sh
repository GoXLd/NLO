#!/usr/bin/env bash
#
# generate-lqip.sh — make a Low-Quality Image Placeholder (LQIP) data URI.
#
# Downscales an image so its longer side is 19px, encodes it as WebP, and
# prints a `data:image/webp;base64,...` string ready to drop into front matter
# (`image.lqip:`) or `_config.yml` (`nlo.branding.logo_lqip:`).
#
# Usage: tools/generate-lqip.sh path/to/image.png
#
# Deps: sips (macOS), cwebp (`brew install webp`), openssl. Exits 2 if a tool
# is missing so callers can skip gracefully.
set -euo pipefail

src="${1:?usage: generate-lqip.sh <image>}"
[ -f "$src" ] || { echo "generate-lqip: no such file: $src" >&2; exit 1; }

for tool in sips cwebp openssl; do
  command -v "$tool" >/dev/null 2>&1 || { echo "generate-lqip: missing '$tool'" >&2; exit 2; }
done

tmp="$(mktemp -t lqip).${src##*.}"
webp="${tmp%.*}.webp"
trap 'rm -f "$tmp" "$webp"' EXIT

cp "$src" "$tmp"
sips -Z 19 "$tmp" >/dev/null            # resample: longer side = 19px, aspect kept
cwebp -quiet -q 40 "$tmp" -o "$webp"    # encode WebP
printf 'data:image/webp;base64,%s\n' "$(openssl base64 -A -in "$webp")"
