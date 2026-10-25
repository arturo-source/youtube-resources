# 03 · Tip 3: Evitar bloquear el renderizado

**Cambios respecto a 02**

- `lodash.js` con `defer` (se descarga en paralelo y se ejecuta tras el parseo).
- `analytics.js`: se inyecta tras `load` + `requestIdleCallback`, y su trabajo
  se trocea en tareas de ~8 ms cediendo el hilo (`scheduler.yield()` / `setTimeout`).
  Solo con `async` seguía metiendo una tarea larga en mitad de la carga.
- CSS sin `@import` en cadena: `styles.css` y `components.css` se piden en paralelo.
- Fuentes en `.woff2` con `font-display: swap` + `<link rel="preload">` de las 2 principales.
- `<link rel="modulepreload">` de los módulos iniciales (evita la cascada main → products → config).
- Hero con `fetchpriority="high"`.
- El índice de búsqueda (300 ms) se construye al enfocar el buscador, no al cargar.
- Espacio reservado para la promo y para el grid mientras llegan los datos (CLS).

**Qué enseñar**: Performance → el primer pintado llega mucho antes y no hay
tareas largas. Network → columna *Priority*: el hero sale en "High".

Lighthouse móvil: 60 → **73** (FCP 6,4 s → 2,6 s).
