// Simula un script de terceros (analítica, tag manager, A/B testing…).
// ✅ TIP 3: hace el mismo trabajo (~250 ms de CPU), pero troceado en tareas
//    de ~8 ms y cediendo el hilo principal entre una y otra. Así el navegador
//    puede pintar y responder a clics entre medias: no hay "tareas largas" (>50 ms).
//    Si un script de terceros no te deja hacer esto, al menos cárgalo tarde
//    (ver index.html) o bajo interacción.
(async function () {
  // scheduler.yield() es la API moderna; setTimeout(0) es el fallback universal
  const yieldToMain = () =>
    globalThis.scheduler?.yield ? scheduler.yield() : new Promise((resolve) => setTimeout(resolve, 0));

  let hash = 0;
  let pending = 250; // ms de trabajo "de fingerprinting"
  while (pending > 0) {
    const start = performance.now();
    while (performance.now() - start < 8) {
      hash = (hash * 31 + Math.floor(Math.random() * 1000)) | 0;
    }
    pending -= performance.now() - start;
    await yieldToMain();
  }

  window.__analytics = {
    id: hash,
    track(event, data) {
      console.debug("[analytics]", event, data || "");
    },
  };
  window.__analytics.track("page_view", { path: location.pathname });
})();
