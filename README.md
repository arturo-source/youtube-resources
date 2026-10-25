# 5 tips (+ bonus) para hacer tu frontend más rápido

Demo para el vídeo: la misma tienda (**TechStore**) en 7 carpetas. Cada carpeta
aplica **una optimización más** sobre la anterior, así que puedes comparar
cualquier paso con el anterior (`diff -r 02-… 03-…`) y ver exactamente qué cambia.

Es HTML + CSS + JS nativo (módulos ES), sin frameworks ni bundler, para que
cada optimización se vea "a pelo" en el código y en DevTools.

| Carpeta | Tip | Puerto |
|---|---|---|
| `00-inicial` | Punto de partida: todo mal a propósito | 8000 |
| `01-lazy-loading-code-splitting` | 1. Lazy loading y code splitting | 8001 |
| `02-optimizacion-imagenes` | 2. Optimización de imágenes | 8002 |
| `03-evitar-bloqueo-render` | 3. Evitar bloquear el renderizado | 8003 |
| `04-reducir-peticiones` | 4. Reducir las peticiones de red | 8004 |
| `05-compresion-cache` | 5. Compresión y caché (Brotli, Gzip, Cache-Control, Caddy) | 8005 |
| `06-bonus-medicion` | Bonus: Lighthouse y Core Web Vitals | 8006 |

Cada carpeta tiene su propio `README.md` con los cambios y qué enseñar en pantalla.
En el código, los problemas están marcados con `❌` y las soluciones con `✅ TIP N`.

## Cómo arrancarlo

Requisitos: [Caddy](https://caddyserver.com/docs/install) 2.x y Node 22+.

```bash
# Solo la primera vez (o si cambias algo en 05/06): genera dist/ con hashes y .br/.gz
(cd 05-compresion-cache && node build.mjs)
(cd 06-bonus-medicion && node build.mjs)

# Levanta los 7 pasos a la vez (puertos 8000–8006)
caddy run
```

Abre `http://localhost:8006/?vitals` para ver el panel de Web Vitals en vivo.

## Medir todos los pasos

```bash
./scripts/medir.sh           # Lighthouse móvil (como PageSpeed Insights)
./scripts/medir.sh desktop   # Lighthouse escritorio
```

Guarda los informes HTML en `reports/<perfil>/` y pinta una tabla comparativa.
Resultados obtenidos al preparar la demo (Lighthouse 12, Chrome headless, localhost):

**Móvil** (CPU 4× más lenta + red 4G lenta simuladas)

| Paso | Nota | FCP | LCP | TBT | CLS | Peticiones | Transferido |
|---|---|---|---|---|---|---|---|
| 00 inicial | **41** | 11,9 s | 18,1 s | 554 ms | 0 | 53 | 13,1 MB |
| 01 lazy loading | 59 | 6,4 s | 13,2 s | 10 ms | 0 | 53 | 12,3 MB |
| 02 imágenes | 60 | 6,4 s | 7,3 s | 10 ms | 0 | 47 | 1,1 MB |
| 03 render | 73 | 2,6 s | 7,0 s | 10 ms | 0 | 46 | 1,0 MB |
| 04 peticiones | 100 | 1,1 s | 1,7 s | 0 ms | 0 | 21 | 190 KB |
| 05 compresión/caché | 100 | 1,1 s | 1,6 s | 0 ms | 0 | 21 | 176 KB |
| 06 bonus | **100** | 1,1 s | 1,8 s | 0 ms | 0 | 23 | 180 KB |

**Escritorio**: 74 → 92 → 95 → 97 → 100 → 100 → 100.

**Qué significa cada columna**

| Columna | Qué mide | Bueno |
|---|---|---|
| Nota | Puntuación de rendimiento de Lighthouse (0–100), ponderando FCP, LCP, TBT y CLS | ≥ 90 |
| FCP (First Contentful Paint) | Cuándo aparece el primer texto o imagen: el usuario deja de ver la pantalla en blanco | ≤ 1,8 s |
| LCP (Largest Contentful Paint) | Cuándo se pinta el elemento más grande de la pantalla (aquí, el hero): la página "parece cargada" | ≤ 2,5 s |
| TBT (Total Blocking Time) | Tiempo total que el hilo principal estuvo bloqueado por tareas largas entre FCP y la interactividad: la página se ve pero no responde | ≤ 200 ms |
| CLS (Cumulative Layout Shift) | Cuánto "salta" el contenido mientras carga (sin unidades): evita pulsar donde ya no está el botón | ≤ 0,1 |
| Peticiones | Número de peticiones de red al cargar la página | cuantas menos, mejor |
| Transferido | Bytes descargados por la red (ya comprimidos) | cuantos menos, mejor |

> Los números de laboratorio cambian un poco entre ejecuciones y máquinas.
> En localhost el TTFB es casi 0, así que en producción todo será algo más lento.

## Guion sugerido

1. **Intro (00)**: abrir `:8000` con DevTools → Network (con *Disable cache* y throttling
   "Fast 4G"). Se ven 13 MB, 53 peticiones y la pantalla en blanco varios segundos.
   Pasar Lighthouse: 41.
2. **Tip 1 (01)**: Network filtrado por JS. moment y Chart.js ya no salen al cargar.
   Bajar hasta la gráfica → aparecen `stats.js` y `chart.umd.js`. Clic en "Ver opiniones"
   → `reviews.js` + `moment`. Clic en el chat → `chat.js`.
3. **Tip 2 (02)**: Network filtrado por Img. De ~850 KB por producto a ~17 KB (AVIF).
   Hacer scroll y ver cómo las imágenes se piden al acercarse. Redimensionar la
   ventana para mostrar que el hero cambia de tamaño (srcset).
4. **Tip 3 (03)**: pestaña Performance. Antes: tarea larga de `analytics.js` y CSS en
   cadena (`@import`) antes del primer pintado. Después: el texto aparece al momento
   (`font-display: swap`) y el hero se pide con prioridad alta (columna *Priority*).
5. **Tip 4 (04)**: Network. 12 peticiones de productos en cascada → 1. Tres
   `config.json` → 1. Ocho `.svg` → 0 (sprite). Fuera bootstrap (280 KB) y lodash (540 KB).
6. **Tip 5 (05)**: `curl -I -H "Accept-Encoding: br" localhost:8005/` y en DevTools la
   columna *Content-Encoding*. Bajar hasta la gráfica: Chart.js pasa de 200 KB a 59 KB.
   **Recargar sin "Disable cache"**: en `:8004` todo se revalida (304), en `:8005` los
   assets salen de *disk/memory cache* sin tocar la red.
   ⚠️ **Mencionar en el vídeo**: el `no-cache` de 00–04 lo pone el `Caddyfile` a propósito
   para que la demo sea repetible; **no es el comportamiento por defecto**. Un servidor
   sin `Cache-Control` (solo `ETag`/`Last-Modified`) hace que el navegador *adivine*
   (frescura heurística: ~10 % del tiempo desde `Last-Modified`) y reutilice los ficheros
   sin preguntar, sin 304 y sin control sobre cuándo se actualizan.
7. **Bonus (06)**: `:8006/?vitals` con el panel de LCP/INP/CLS. Ejecutar
   `./scripts/medir.sh` y enseñar la tabla de antes/después. Mencionar PageSpeed
   Insights para medir la web real (datos de campo de usuarios reales, CrUX).

## Detalles que pueden salir en el vídeo

- **`async` no siempre basta** (paso 03): el script de analítica con `async` se
  seguía ejecutando en mitad de la carga y Lighthouse lo contaba como 1 s de TBT.
  La solución fue cargarlo tras `load` + `requestIdleCallback` y **trocear su
  trabajo** en tareas de ~8 ms cediendo el hilo (`scheduler.yield()`).
- **CLS por contenido que llega tarde** (paso 03): la promo y el grid de productos
  se rellenan por JS. Sin reservar espacio, empujaban la página y además hacían
  que la gráfica (lazy) se cargase antes de tiempo porque al principio quedaba
  dentro del viewport.
- **Brotli en Caddy** (paso 05): Caddy comprime al vuelo con zstd y gzip, pero
  Brotli al vuelo necesita un plugin. Por eso `build.mjs` genera los `.br` y
  Caddy los sirve con `precompressed`. También hay un `nginx.conf.example`.
- **El paso 05 apenas cambia la nota de Lighthouse** porque Lighthouse mide una
  primera visita en frío y para entonces quedaban pocos bytes de texto. Su gran
  ventaja es la caché en visitas repetidas y en recursos grandes como Chart.js.

## Estructura

```
00-inicial/ … 04-reducir-peticiones/   la app, servida tal cual
05-compresion-cache/, 06-bonus-medicion/
  build.mjs                genera dist/ (hashes + .br/.gz)
  caddy-optimizado.conf    compresión + Cache-Control (lo importa el Caddyfile raíz)
  Caddyfile                para probar solo ese paso (puerto 8080)
  dist/                    lo que se sirve
02-optimizacion-imagenes/scripts/optimizar-imagenes.sh   genera AVIF/WebP/JPG
scripts/medir.sh, scripts/resumen.mjs                     Lighthouse de todos los pasos
Caddyfile                                                 sirve los 7 pasos
```
