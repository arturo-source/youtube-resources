# 00 · Punto de partida

La tienda "como la haría cualquiera con prisa". Todo funciona, pero:

- `app.js` con **toda** la app y 3 librerías gigantes (lodash 540 KB, moment 620 KB,
  Chart.js 200 KB) cargadas de forma síncrona en el `<head>`.
- Script de analítica síncrono que bloquea ~250 ms el hilo principal.
- `bootstrap.css` completo (280 KB) para usar 3 clases.
- `styles.css` con `@import` en cadena → más round-trips antes de pintar.
- 5 pesos de fuente en `.woff` con `font-display: block` (texto invisible mientras cargan).
- Hero JPG de 3840 px (1,3 MB) y 12 productos JPG de 2000 px (~850 KB cada uno),
  sin `width`/`height`, sin `loading="lazy"`.
- 1 + 12 peticiones en serie para los productos, `config.json` pedido 3 veces,
  8 iconos SVG sueltos, opiniones descargadas aunque nadie abra el modal.
- Índice de búsqueda de 300 ms construido al cargar.
- Sin compresión ni `Cache-Control`.

Lighthouse móvil: **41** · 53 peticiones · 13 MB.
