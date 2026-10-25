# 04 · Tip 4: Reducir las peticiones de red

**Cambios respecto a 03**

- Productos: `product-ids.json` + 12 `products/N.json` en serie → **un** `products.json`.
- `config.json`: se pedía 3 veces → `getConfig()` guarda la *promesa* y se reutiliza.
- Peticiones independientes en paralelo con `Promise.all`.
- 8 ficheros `.svg` → sprite SVG inline en el HTML (`<use href="#i-cart">`).
- Fuera `bootstrap.css` (280 KB): las reglas de `.btn` que usábamos están en `components.css`.
- Fuera `lodash` (540 KB): `toSorted`, y `escapeHtml`/`debounce` en `lib/utils.js`.
- Fuera `moment` (620 KB): `Intl.DateTimeFormat` e `Intl.RelativeTimeFormat`.
- Fuentes: 5 pesos → 2 (400 y 700).
- `<link rel="icon" href="data:,">` evita la petición a `/favicon.ico` (está en todos los pasos).

**Qué enseñar**: Network sin filtro: 46 → 21 peticiones, 1 MB → 190 KB.
Comparar la cascada de productos de 03 con la única petición de 04.

Lighthouse móvil: 73 → **100** (LCP 7,0 s → 1,7 s).
