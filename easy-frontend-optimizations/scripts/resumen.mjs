// Lee los informes JSON de Lighthouse y pinta una tabla comparativa.
// Uso: node scripts/resumen.mjs <carpeta-informes> <paso1> <paso2> …
import { readFileSync } from "node:fs";

const [dir, ...steps] = process.argv.slice(2);
const ms = (v) => (v / 1000).toFixed(2) + " s";

const rows = steps.map((step) => {
  const { categories, audits } = JSON.parse(readFileSync(`${dir}/${step}.report.json`, "utf8"));
  const requests = audits["network-requests"].details.items;
  return {
    paso: step,
    nota: Math.round(categories.performance.score * 100),
    FCP: ms(audits["first-contentful-paint"].numericValue),
    LCP: ms(audits["largest-contentful-paint"].numericValue),
    TBT: Math.round(audits["total-blocking-time"].numericValue) + " ms",
    CLS: audits["cumulative-layout-shift"].numericValue.toFixed(3),
    peticiones: requests.length,
    transferido: (requests.reduce((sum, r) => sum + (r.transferSize || 0), 0) / 1024).toFixed(0) + " KB",
  };
});

console.table(rows);
console.log(`\nInformes HTML completos en ${dir}/*.report.html`);
