import { getConfig } from "./config.js";
import { getProducts, renderProducts } from "./products.js";
import { debounce } from "./lib/utils.js";

let searchIndex = null;

export function initSearch() {
  const input = document.getElementById("search");

  // ✅ TIP 3: evitar trabajo innecesario en la carga inicial.
  //    El índice (300 ms de CPU) solo se construye cuando el usuario
  //    entra en el buscador, no al cargar la página.
  input.addEventListener("focus", () => {
    searchIndex ??= buildSearchIndex();
  }, { once: true });

  input.addEventListener(
    "input",
    debounce(async () => {
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
