// ✅ TIP 1: punto de entrada pequeño. Solo importa de forma estática lo que
//    se necesita para pintar la primera pantalla. El resto se carga con
//    import() dinámico cuando el usuario lo necesita.
import { getConfig } from "/js/config.js";
import { initProducts } from "/js/products.js";
import { initSearch } from "/js/search.js";
import { whenVisible } from "/js/lib/lazy.js";

initPromo();
initProducts();
initSearch();
initFooter();

// Gráfica: se carga cuando la sección está a punto de entrar en pantalla
whenVisible(document.getElementById("stats"), async () => {
  const { initStats } = await import("/js/features/stats.js");
  initStats();
});

// Opiniones: se cargan al hacer clic en el botón
document.getElementById("open-reviews").addEventListener("click", async () => {
  const { openReviews } = await import("/js/features/reviews.js");
  openReviews();
});

// Chat: se carga al hacer clic en la burbuja
document.getElementById("chat-bubble").addEventListener("click", async () => {
  const { toggleChat } = await import("/js/features/chat.js");
  toggleChat();
});

async function initPromo() {
  const config = await getConfig();
  document.getElementById("promo").textContent = config.promo;
}

async function initFooter() {
  const config = await getConfig();
  // Ya no necesitamos moment solo para obtener el año
  document.getElementById("footer-text").textContent =
    `© ${new Date().getFullYear()} ${config.storeName} · ${config.supportEmail}`;
}
