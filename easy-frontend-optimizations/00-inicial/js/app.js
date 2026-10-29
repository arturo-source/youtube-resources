// ❌ TODO el código de la app en un único fichero que se descarga, parsea y
//    ejecuta en la carga inicial, aunque el usuario nunca abra el chat,
//    nunca baje hasta la gráfica ni abra las opiniones.
// ❌ Depende de librerías globales enormes (lodash, moment, Chart.js)
//    cargadas de forma síncrona en el <head>.

document.addEventListener("DOMContentLoaded", () => {
  initPromo();
  initProducts();
  initSearch();
  initStats();
  initReviews();
  initChat();
  initFooter();
});

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

// ❌ Cada parte de la app pide la config por su cuenta → 3 peticiones iguales
async function getConfig() {
  const res = await fetch("/api/config.json");
  return res.json();
}

async function initPromo() {
  const config = await getConfig();
  document.getElementById("promo").textContent = config.promo;
}

async function initFooter() {
  const config = await getConfig();
  document.getElementById("footer-text").textContent =
    `© ${moment().year()} ${config.storeName} · ${config.supportEmail}`;
}

// ---------------------------------------------------------------------------
// Productos
// ---------------------------------------------------------------------------

let allProducts = [];

async function initProducts() {
  const config = await getConfig();
  const ids = await (await fetch("/api/product-ids.json")).json();

  // ❌ Una petición por producto, y además en serie (cascada / waterfall)
  const products = [];
  for (const id of ids) {
    const res = await fetch(`/api/products/${id}.json`);
    products.push(await res.json());
  }

  allProducts = _.sortBy(products, (p) => -p.rating);
  renderProducts(allProducts, config);
}

function renderProducts(products, config) {
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

// ---------------------------------------------------------------------------
// Búsqueda
// ---------------------------------------------------------------------------

let searchIndex = null;

function initSearch() {
  // ❌ Construimos un índice de búsqueda "pesado" en la carga inicial,
  //    aunque la mayoría de usuarios nunca usan el buscador.
  searchIndex = buildSearchIndex();

  const input = document.getElementById("search");
  input.addEventListener(
    "input",
    _.debounce(async () => {
      const q = input.value.trim().toLowerCase();
      const config = await getConfig();
      const filtered = q ? allProducts.filter((p) => p.name.toLowerCase().includes(q)) : allProducts;
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

// ---------------------------------------------------------------------------
// Gráfica de ventas
// ---------------------------------------------------------------------------

async function initStats() {
  // ❌ La gráfica está muy abajo en la página, pero cargamos Chart.js (200 KB)
  //    y la dibujamos nada más entrar.
  const stats = await (await fetch("/api/stats.json")).json();
  new Chart(document.getElementById("sales-chart"), {
    type: "line",
    data: {
      labels: stats.labels,
      datasets: [{ label: "Ventas", data: stats.sales, borderColor: "#7c5cff", backgroundColor: "rgba(124,92,255,.2)", fill: true, tension: 0.35 }],
    },
    options: { plugins: { legend: { labels: { color: "#e6e9f2" } } }, scales: { x: { ticks: { color: "#9aa3b8" } }, y: { ticks: { color: "#9aa3b8" } } } },
  });
}

// ---------------------------------------------------------------------------
// Opiniones
// ---------------------------------------------------------------------------

async function initReviews() {
  // ❌ Descargamos y pintamos las opiniones aunque el modal esté cerrado
  const reviews = await (await fetch("/api/reviews.json")).json();
  moment.locale("es");
  document.getElementById("reviews-list").innerHTML = reviews
    .map(
      (r) => `
      <li>
        <strong>${_.escape(r.author)}</strong> · ${"★".repeat(r.rating)}
        <div class="meta">${moment(r.date).fromNow()} · ${moment(r.date).format("LL")}</div>
        <p>${_.escape(r.text)}</p>
      </li>`
    )
    .join("");

  const dialog = document.getElementById("reviews-dialog");
  document.getElementById("open-reviews").addEventListener("click", () => dialog.showModal());
  dialog.querySelector("[data-close]").addEventListener("click", () => dialog.close());
}

// ---------------------------------------------------------------------------
// Chat de soporte
// ---------------------------------------------------------------------------

function initChat() {
  // ❌ Construimos el widget de chat completo al cargar, aunque esté oculto
  const panel = document.createElement("div");
  panel.className = "chat-panel";
  panel.hidden = true;
  panel.innerHTML = `
    <strong>Soporte TechStore</strong>
    <div class="messages">
      <div class="msg">¡Hola! 👋 ¿En qué podemos ayudarte?</div>
    </div>
    <input type="text" placeholder="Escribe un mensaje…">`;
  document.body.appendChild(panel);

  const input = panel.querySelector("input");
  input.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" || !input.value.trim()) return;
    const msg = document.createElement("div");
    msg.className = "msg";
    msg.textContent = `Tú (${moment().format("HH:mm")}): ${input.value}`;
    panel.querySelector(".messages").appendChild(msg);
    input.value = "";
  });

  document.getElementById("chat-bubble").addEventListener("click", () => {
    panel.hidden = !panel.hidden;
    if (!panel.hidden) input.focus();
  });
}
