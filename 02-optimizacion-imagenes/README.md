# 02 · Tip 2: Optimización de imágenes

**Cambios respecto a 01**

- `scripts/optimizar-imagenes.sh` genera, a partir de los originales de `00-inicial/img`:
  - AVIF (calidad 50), WebP (75) y JPG progresivo (78) como fallback, sin metadatos.
  - Hero en 800/1280/1920 px y productos en 300/600 px.
- `<picture>` con `<source type="image/avif">` → `webp` → `<img>` JPG.
- `srcset` + `sizes` para que el navegador elija el tamaño según la pantalla.
- `width`/`height` en todas las imágenes → el navegador reserva el hueco (sin CLS).
- Productos con `loading="lazy"` y `decoding="async"`. El hero **no** (es el LCP).
- `api/products/*.json`: el campo `image` ya no lleva extensión.

**Qué enseñar**: Network → Img. Hero 1,3 MB → 16–55 KB; producto 850 KB → 6–17 KB.
Hacer scroll y ver cómo se piden las imágenes al acercarse.

Imágenes: 12 MB → 2,2 MB *sumando todas las variantes* (el navegador descarga una por imagen).
Lighthouse móvil: 59 → **60**, pero el LCP baja de 13,2 s a 7,3 s y se transfiere 1 MB en vez de 12.
