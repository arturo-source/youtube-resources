import { getConfig } from "./config.js";
import { escapeHtml } from "./lib/utils.js";

let allProducts = [];
export const getProducts = () => allProducts;

export async function initProducts() {
  // ✅ TIP 4: un único endpoint con todos los productos (antes: 1 + 12 peticiones en serie)
  // ✅ y las peticiones independientes van en paralelo con Promise.all
  const [config, products] = await Promise.all([
    getConfig(),
    fetch("/api/products.json").then((res) => res.json()),
  ]);

  allProducts = products.toSorted((a, b) => b.rating - a.rating);
  renderProducts(allProducts, config);
}

// Las tarjetas miden ~280px (1 columna en móvil)
const SIZES = "(max-width: 560px) calc(100vw - 32px), 280px";

export function renderProducts(products, config) {
  const format = new Intl.NumberFormat(config.locale, { style: "currency", currency: config.currency });
  const grid = document.getElementById("product-grid");
  grid.innerHTML = products
    .map(
      (p) => `
      <article class="card">
        <!-- ✅ TIP 2: formatos modernos, tamaño adecuado, dimensiones y lazy loading -->
        <picture>
          <source type="image/avif" srcset="${p.image}-300.avif 300w, ${p.image}-600.avif 600w" sizes="${SIZES}">
          <source type="image/webp" srcset="${p.image}-300.webp 300w, ${p.image}-600.webp 600w" sizes="${SIZES}">
          <img src="${p.image}-600.jpg" srcset="${p.image}-300.jpg 300w, ${p.image}-600.jpg 600w" sizes="${SIZES}"
               width="600" height="600" loading="lazy" decoding="async" alt="${escapeHtml(p.name)}">
        </picture>
        <div class="card-body">
          <span class="category">${escapeHtml(p.category)}</span>
          <h3>${escapeHtml(p.name)}</h3>
          <span class="rating"><svg class="icon" aria-hidden="true" style="width:14px;height:14px;color:currentColor"><use href="#i-star"/></svg> ${p.rating}</span>
          <span class="price">${format.format(p.price)}</span>
          <button class="btn btn-primary btn-sm" data-add="${p.id}">Añadir al carrito</button>
        </div>
      </article>`
    )
    .join("");

  grid.querySelectorAll("[data-add]").forEach((btn) =>
    btn.addEventListener("click", () => {
      const counter = document.getElementById("cart-count");
      counter.textContent = Number(counter.textContent) + 1;
      window.__analytics?.track("add_to_cart", { id: btn.dataset.add });
    })
  );
}
