import { getConfig } from "./config.js";
import { getProducts, renderProducts } from "./products.js";

let searchIndex = null;

export function initSearch() {
  // ❌ Seguimos construyendo el índice en la carga inicial (lo arreglamos en el tip 3)
  searchIndex = buildSearchIndex();

  const input = document.getElementById("search");
  input.addEventListener(
    "input",
    _.debounce(async () => {
      const q = input.value.trim().toLowerCase();
      const config = await getConfig();
      const products = getProducts();
      const filtered = q ? products.filter((p) => p.name.toLowerCase().includes(q)) : products;
      renderProducts(filtered, config);
    }, 200)
  );
}

function buildSearchIndex() {
  // Simula tokenizar / generar n-gramas de un catálogo grande (~300 ms)
  const start = performance.now();
  const index = new Map();
  let i = 0;
  while (performance.now() - start < 300) {
    const token = `token-${i % 5000}`;
    index.set(token, (index.get(token) || 0) + 1);
    i++;
  }
  return index;
}
