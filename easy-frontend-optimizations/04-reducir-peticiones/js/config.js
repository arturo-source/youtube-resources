// ✅ TIP 4: guardamos la *promesa*, no el resultado. Así, aunque promo, footer,
//    productos y buscador la pidan a la vez, solo sale UNA petición de red.
let configPromise = null;

export function getConfig() {
  configPromise ??= fetch("/api/config.json").then((res) => res.json());
  return configPromise;
}
