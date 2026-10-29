# 05 · Tip 5: Compresión y caché de recursos

**Cambios respecto a 04**

- `build.mjs` (Node, sin dependencias) genera `dist/`:
  - **Fingerprinting**: `main.js` → `main.01cc69cf.js` y reescribe todas las referencias.
  - **Precompresión**: `.br` (Brotli nivel 11) y `.gz` (Gzip nivel 9) de cada fichero de texto.
- `caddy-optimizado.conf`:
  - `file_server { precompressed br gzip }` → sirve los `.br`/`.gz` ya generados.
  - `encode zstd gzip` → compresión al vuelo para el resto (Caddy no trae Brotli al vuelo).
  - `Cache-Control`:
    - assets con hash → `max-age=31536000, immutable`
    - HTML → `no-cache` (siempre se revalida, así los despliegues se ven al momento)
    - API → `max-age=60, stale-while-revalidate=600`
    - imágenes de producto (sin hash) → `max-age=604800`
- Los imports JS pasan a rutas absolutas (`/js/config.js`) para que el build pueda reescribirlas.
- `nginx.conf.example`: lo mismo para Nginx.

```bash
node build.mjs          # genera dist/ y muestra una tabla con el ahorro
caddy run               # sirve solo este paso en :8080
curl -sI -H "Accept-Encoding: br" localhost:8080/ | grep -i -E "encoding|cache"
```

**Qué enseñar**: Chart.js 200 KB → 59 KB (Brotli). Recargar **sin** "Disable cache":
en 04 todo se revalida; en 05 los assets salen de *memory/disk cache* sin tocar la red.

Lighthouse móvil: 100 → 100 (176 KB). Lighthouse mide una primera visita en frío;
la gran mejora aquí se ve en las visitas repetidas.
