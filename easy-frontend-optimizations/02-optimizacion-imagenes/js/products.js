import { getConfig } from "./config.js";

let allProducts = [];
export const getProducts = () => allProducts;

export async function initProducts() {
  const config = await getConfig();
  const ids = await (await fetch("/api/product-ids.json")).json();

  // ❌ Una petición por producto, y además en serie (lo arreglamos en el tip 4)
  const products = [];
  for (const id of ids) {
    const res = await fetch(`/api/products/${id}.json`);
    products.push(await res.json());
  }

  allProducts = _.sortBy(products, (p) => -p.rating);
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
               width="600" height="600" loading="lazy" decoding="async" alt="${_.escape(p.name)}">
        </picture>
        <div class="card-body">
          <span class="category">${_.escape(p.category)}</span>
          <h3>${_.escape(p.name)}</h3>
          <span class="rating"><img src="/icons/star.svg" alt="" class="icon" style="width:14px;height:14px"> ${p.rating}</span>
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
      window.__analytics.track("add_to_cart", { id: btn.dataset.add });
    })
  );
}
