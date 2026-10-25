# 06 · Bonus: Medir el rendimiento con Lighthouse y Web Vitals

**Cambios respecto a 05**

- `vendor/web-vitals.js`: la librería oficial de Google (7 KB).
- `js/vitals.js`: mide **LCP, INP y CLS** (más FCP y TTFB) de usuarios reales y los
  muestra en la consola. Con `?vitals` en la URL, también en un panel sobre la página.
  Incluye comentado cómo enviarlos a tu backend con `navigator.sendBeacon`.
- `main.js` carga `vitals.js` tras el evento `load` (la medición tampoco debe frenar la carga).
- `../scripts/medir.sh`: pasa Lighthouse a los 7 pasos y pinta la tabla de antes/después.

**Umbrales "buenos"** (percentil 75 de tus usuarios):

| Métrica | Qué mide | Bueno |
|---|---|---|
| LCP | Cuándo se pinta el elemento más grande | ≤ 2,5 s |
| INP | Cuánto tarda en responder a clics/teclas | ≤ 200 ms |
| CLS | Cuánto "salta" el contenido | ≤ 0,1 |

**Laboratorio vs campo**: Lighthouse (DevTools o `medir.sh`) es una simulación,
ideal para comparar antes/después. PageSpeed Insights además muestra datos de
campo (CrUX) de usuarios reales, y `web-vitals` te da los tuyos propios.
INP solo existe con interacciones reales: Lighthouse no puede medirlo (usa TBT como aproximación).

**Qué enseñar**: `http://localhost:8006/?vitals` y `./scripts/medir.sh`.
