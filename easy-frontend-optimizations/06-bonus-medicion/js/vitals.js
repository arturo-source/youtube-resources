// ✅ BONUS: medir Core Web Vitals de usuarios reales (RUM) con la librería
//    oficial web-vitals de Google.
//
//    - LCP (Largest Contentful Paint): cuándo se pinta el elemento más grande. Bueno ≤ 2,5 s
//    - INP (Interaction to Next Paint): cuánto tarda la página en responder a clics/teclas. Bueno ≤ 200 ms
//    - CLS (Cumulative Layout Shift): cuánto "salta" el contenido. Bueno ≤ 0,1
//    + FCP y TTFB como métricas de apoyo.
//
//    Los resultados salen en la consola. Añade ?vitals a la URL para verlos
//    también en un panel sobre la página (útil para grabar el vídeo).
import { onCLS, onFCP, onINP, onLCP, onTTFB } from "/vendor/web-vitals.js";

const COLORS = { good: "#22c55e", "needs-improvement": "#f59e0b", poor: "#ef4444" };
const showPanel = new URLSearchParams(location.search).has("vitals");
const panel = showPanel ? createPanel() : null;

function report(metric) {
  const value = metric.name === "CLS" ? metric.value.toFixed(3) : `${Math.round(metric.value)} ms`;
  console.log(`%c${metric.name}%c ${value} (${metric.rating})`, `background:${COLORS[metric.rating]};color:#000;padding:2px 6px;border-radius:4px`, "", metric);

  if (panel) {
    let row = panel.querySelector(`[data-metric="${metric.name}"]`);
    if (!row) {
      row = document.createElement("div");
      row.dataset.metric = metric.name;
      panel.appendChild(row);
    }
    row.innerHTML = `<b style="color:${COLORS[metric.rating]}">●</b> ${metric.name}: ${value}`;
  }

  // En producción enviarías la métrica a tu backend o herramienta de analítica.
  // sendBeacon no bloquea y sobrevive aunque el usuario cierre la pestaña:
  // navigator.sendBeacon("/api/vitals", JSON.stringify({ name: metric.name, value: metric.value, rating: metric.rating, page: location.pathname }));
}

// reportAllChanges: muestra también los valores intermedios (útil al depurar)
const options = { reportAllChanges: true };
onLCP(report, options);
onINP(report, options);
onCLS(report, options);
onFCP(report, options);
onTTFB(report, options);

function createPanel() {
  const el = document.createElement("div");
  el.style.cssText =
    "position:fixed;left:16px;bottom:16px;z-index:100;padding:12px 16px;border-radius:12px;" +
    "background:rgba(0,0,0,.85);color:#fff;font:14px/1.6 ui-monospace,monospace;pointer-events:none";
  el.innerHTML = "<strong>Web Vitals</strong>";
  document.body.appendChild(el);
  return el;
}
