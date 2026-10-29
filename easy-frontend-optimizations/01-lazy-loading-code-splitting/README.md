# 01 · Tip 1: Lazy loading y code splitting

Cargar código y componentes solo cuando hacen falta.

**Cambios respecto a 00**

- `js/app.js` → módulos ES: `main.js` (entrada) + `config.js`, `products.js`, `search.js`.
- Lo que no se ve al entrar se carga con `import()` dinámico:
  - `features/stats.js` + Chart.js → cuando la gráfica se acerca al viewport (`IntersectionObserver`, `lib/lazy.js`).
  - `features/reviews.js` + moment.js + `reviews.json` → al hacer clic en "Ver opiniones".
  - `features/chat.js` → al hacer clic en la burbuja del chat.
- `loadScript()` carga librerías UMD bajo demanda y no las repite.
- Los `<script type="module">` se comportan como `defer` por defecto.

**Qué enseñar**: Network → JS. Al cargar ya no aparecen `chart.umd.js` ni
`moment-with-locales.js`; aparecen al hacer scroll / clic.

Lighthouse móvil: 41 → **59** (TBT 554 ms → 10 ms).
