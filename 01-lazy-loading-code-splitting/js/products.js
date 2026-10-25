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

export function renderProducts(products, config) {
  const format = new Intl.NumberFormat(config.locale, { style: "currency", currency: config.currency });
  const grid = document.getElementById("product-grid");
  grid.innerHTML = products
    .map(
      (p) => `
      <article class="card">
        <!-- ❌ Imagen de 2000x2000 px (~850 KB) para mostrarla a ~280 px, sin lazy loading ni dimensiones -->
        <img src="${p.image}" alt="${_.escape(p.name)}">
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
