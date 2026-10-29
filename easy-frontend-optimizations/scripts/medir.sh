#!/usr/bin/env bash
# ✅ BONUS: mide todos los pasos con Lighthouse y muestra una tabla comparativa.
#
# Requisitos: Node, Chrome/Chromium y los servidores levantados (`caddy run` en la raíz).
# Uso:
#   ./scripts/medir.sh            → perfil móvil (el que usa PageSpeed Insights)
#   ./scripts/medir.sh desktop    → perfil escritorio
set -euo pipefail
cd "$(dirname "$0")/.."

PRESET=${1:-mobile}
OUT="reports/$PRESET"
mkdir -p "$OUT"

STEPS=(00-inicial 01-lazy-loading-code-splitting 02-optimizacion-imagenes 03-evitar-bloqueo-render 04-reducir-peticiones 05-compresion-cache 06-bonus-medicion)

EXTRA=()
[[ $PRESET == desktop ]] && EXTRA+=(--preset=desktop)

for i in "${!STEPS[@]}"; do
  step=${STEPS[$i]}
  url="http://localhost:800$i/"
  echo "▶ Midiendo $step ($url)…"
  npx --yes lighthouse@12 "$url" \
    --only-categories=performance \
    --output=json --output=html \
    --output-path="$OUT/$step" \
    --chrome-flags="--headless=new --no-sandbox" \
    --quiet "${EXTRA[@]}"
done

node scripts/resumen.mjs "$OUT" "${STEPS[@]}"
