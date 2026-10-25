#!/usr/bin/env bash
# Generates every logo / favicon / Open Graph asset from the master logo in brand-source/.
# Source: brand-source/logo-transparent.webp (official logo, transparent background).
# Requires: python3 with Pillow + numpy, ImageMagick `convert`, headless Chromium.
set -euo pipefail
cd "$(dirname "$0")/.."

LOGO="brand-source/logo-transparent.webp"
PUB="public/brand"
SRC="src/assets/brand"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
mkdir -p "$PUB" "$SRC"

[ -f "$LOGO" ] || { echo "Missing $LOGO"; exit 1; }
command -v convert >/dev/null || { echo "Missing tool: ImageMagick convert"; exit 1; }
CHROME="${CHROME:-$(ls -d /opt/pw-browsers/chromium-*/chrome-linux/chrome 2>/dev/null | head -1 || true)}"
[ -z "$CHROME" ] && CHROME="$(command -v chromium || command -v chromium-browser || command -v google-chrome || true)"
[ -z "$CHROME" ] && { echo "Missing tool: headless Chromium/Chrome (set CHROME=/path/to/chrome)"; exit 1; }

# 1. Emblem (ring + head, no wordmark) for the site; Astro converts it to AVIF/WebP at build time.
python3 -I scripts/brand/extract_emblem.py "$LOGO" "$TMP"
cp "$TMP/emblem.png" "$SRC/emblem.png"

# 2. Full logo (dark wordmark, for light backgrounds / search engines / JSON-LD).
cp "$LOGO" "$PUB/logo-full.webp" && chmod 644 "$PUB/logo-full.webp"

# 3. Favicons + PWA icons from the square emblem.
for size in 16 32 192 512; do
  convert "$TMP/emblem-square-1024.png" -filter Lanczos -resize "${size}x${size}" -strip "$TMP/icon-$size.png"
done
cp "$TMP/icon-32.png" "$PUB/icon-32.png"; cp "$TMP/icon-192.png" "$PUB/icon-192.png"; cp "$TMP/icon-512.png" "$PUB/icon-512.png"
cp "$TMP/icon-32.png" public/favicon-32x32.png
convert "$TMP/icon-16.png" "$TMP/icon-32.png" public/favicon.ico
convert -size 1024x1024 xc:'#081D3A' \( "$TMP/emblem-square-1024.png" -resize 88% \) -gravity center -composite \
  -filter Lanczos -resize 180x180 -strip public/apple-touch-icon.png

# 4. Open Graph images 1200x630, one per locale: dark-background lockup (emblem + white wordmark), as on the banner.
FONT_DIR="$PWD/node_modules/@fontsource/montserrat/files"
AR_FONT_DIR="$PWD/node_modules/@fontsource/ibm-plex-sans-arabic/files"
PATTERN="$(base64 -w0 < src/assets/brand/circuit-pattern.svg)"
og() { # og <locale> <tagline-html> <tagline-font> <dir> <letter-spacing> <font-size>
  cat > "$TMP/og-$1.html" <<HTML
<!doctype html><meta charset="utf-8"><style>
@font-face{font-family:M;font-weight:700;src:url('file://$FONT_DIR/montserrat-latin-700-normal.woff2')}
@font-face{font-family:M;font-weight:600;src:url('file://$FONT_DIR/montserrat-latin-600-normal.woff2')}
@font-face{font-family:A;font-weight:600;src:url('file://$AR_FONT_DIR/ibm-plex-sans-arabic-arabic-600-normal.woff2')}
html,body{margin:0;width:1200px;height:630px;overflow:hidden}
body{background:#081D3A url('data:image/svg+xml;base64,$PATTERN');font-family:M;color:#fff;display:flex;align-items:center;gap:48px;padding:0 70px;box-sizing:border-box;position:relative}
body::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 34% 58% at 22% 50%,rgba(161,102,255,.42),rgba(106,44,255,.12) 60%,transparent 75%)}
img{width:400px;height:auto;position:relative;flex:none}
div{position:relative}
b{display:block;font-size:82px;letter-spacing:.03em;line-height:1}
.a{display:inline-block;height:.7em;width:.672em;margin:0 .06em 0 .02em;vertical-align:baseline}
small{display:flex;align-items:center;gap:16px;font-size:25px;letter-spacing:.42em;color:#A166FF;font-weight:600;margin-top:16px}
small::before,small::after{content:'';height:3px;width:44px;background:#6A2CFF}
p{margin:40px 0 0;font-size:$6;font-weight:600;letter-spacing:$5;font-family:$3}
i{font-style:normal;color:#6A2CFF;margin:0 .4em}
</style><body><img src="file://$TMP/emblem.png"><div><b>BR<svg class="a" viewBox="0 0 96 100"><path d="M0 100h18L48 24l30 76h18L58 0H38L0 100Z" fill="#fff"/><path d="M48 60l16 40H32l16-40Z" fill="#6A2CFF"/></svg>INSCOPE</b><small>LEARNING CENTER</small><p dir="$4">$2</p></div></body>
HTML
  "$CHROME" --headless=new --no-sandbox --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
    --allow-file-access-from-files --window-size=1200,630 --screenshot="$TMP/og-$1.png" "file://$TMP/og-$1.html" >/dev/null 2>&1
  convert "$TMP/og-$1.png" -crop 1200x630+0+0 +repage -strip -quality 86 "$PUB/og-image-$1.jpg"
}
LATIN_TAGLINE='Think<i>•</i>Create<i>•</i>Lead'
og en "$LATIN_TAGLINE" M ltr .14em 36px
og fr "$LATIN_TAGLINE" M ltr .14em 36px
og ar 'فكِّر<i>•</i>ابتكِر<i>•</i>قُد' A rtl 0 50px

echo "Brand assets written to $SRC, $PUB and public/."
