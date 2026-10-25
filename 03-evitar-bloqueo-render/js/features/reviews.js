// ✅ TIP 1: las opiniones (y moment.js, 600 KB) solo se cargan
//    cuando el usuario hace clic en "Ver opiniones".
import { loadScript } from "../lib/lazy.js";

const dialog = document.getElementById("reviews-dialog");
let loaded = false;

export async function openReviews() {
  if (!loaded) {
    const [, reviews] = await Promise.all([
      loadScript("/vendor/moment-with-locales.js"),
      fetch("/api/reviews.json").then((r) => r.json()),
    ]);
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
    dialog.querySelector("[data-close]").addEventListener("click", () => dialog.close());
    loaded = true;
  }
  dialog.showModal();
}
