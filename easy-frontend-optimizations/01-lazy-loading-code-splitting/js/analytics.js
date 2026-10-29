// Simula un script de terceros (analítica, tag manager, A/B testing…).
// ❌ Se carga de forma síncrona en el <head> y hace trabajo pesado al ejecutarse,
//    bloqueando el parser y el primer pintado.
(function () {
  const start = performance.now();
  // ~250 ms de trabajo "de fingerprinting" en el hilo principal
  let hash = 0;
  while (performance.now() - start < 250) {
    hash = (hash * 31 + Math.floor(Math.random() * 1000)) | 0;
  }
  window.__analytics = {
    id: hash,
    track(event, data) {
      console.debug("[analytics]", event, data || "");
    },
  };
  window.__analytics.track("page_view", { path: location.pathname });
})();
