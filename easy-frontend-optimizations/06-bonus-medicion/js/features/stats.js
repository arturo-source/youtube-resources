// ✅ TIP 1: este módulo (y Chart.js, 200 KB) solo se descarga cuando
//    la sección de la gráfica está a punto de verse.
import { loadScript } from "/js/lib/lazy.js";

export async function initStats() {
  const [, stats] = await Promise.all([
    loadScript("/vendor/chart.umd.js"),
    fetch("/api/stats.json").then((r) => r.json()),
  ]);

  new Chart(document.getElementById("sales-chart"), {
    type: "line",
    data: {
      labels: stats.labels,
      datasets: [{ label: "Ventas", data: stats.sales, borderColor: "#7c5cff", backgroundColor: "rgba(124,92,255,.2)", fill: true, tension: 0.35 }],
    },
    options: { plugins: { legend: { labels: { color: "#e6e9f2" } } }, scales: { x: { ticks: { color: "#9aa3b8" } }, y: { ticks: { color: "#9aa3b8" } } } },
  });
}
