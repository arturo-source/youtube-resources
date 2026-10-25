#!/usr/bin/env bash
# ✅ TIP 2: genera versiones optimizadas de las imágenes originales.
#   - Formatos modernos: AVIF (el más ligero) y WebP, con JPG como fallback
#   - Varios tamaños para servir con srcset/sizes según la pantalla
#   - Compresión con pérdida razonable y sin metadatos (-strip)
#
# Requisitos: ImageMagick 7 (`magick`) con soporte AVIF y WebP.
# Uso: ./scripts/optimizar-imagenes.sh   (desde la carpeta 02-optimizacion-imagenes)
set -euo pipefail

SRC="../00-inicial/img"   # originales pesados
OUT="img"
mkdir -p "$OUT/products"

convert_all() { # <origen> <destino-sin-extensión> <ancho>
  local src=$1 dst=$2 width=$3
  magick "$src" -strip -resize "${width}x" -quality 50 "$dst-$width.avif"
  magick "$src" -strip -resize "${width}x" -quality 75 "$dst-$width.webp"
  magick "$src" -strip -resize "${width}x" -quality 78 -interlace Plane "$dst-$width.jpg"
}

# Hero: ocupa el 100% del ancho → 3 tamaños
for w in 800 1280 1920; do
  convert_all "$SRC/hero.jpg" "$OUT/hero" "$w" &
done

# Productos: se muestran a ~280px → 300px (1x) y 600px (pantallas retina)
for f in "$SRC"/products/*.jpg; do
  name=$(basename "$f" .jpg)
  for w in 300 600; do
    convert_all "$f" "$OUT/products/$name" "$w" &
  done
done

wait
echo "Antes:   $(du -sh "$SRC" | cut -f1)"
echo "Después: $(du -sh "$OUT" | cut -f1) (todas las variantes juntas; el navegador solo descarga una por imagen)"
