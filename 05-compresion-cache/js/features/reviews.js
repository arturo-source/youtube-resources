// ✅ TIP 1: las opiniones solo se cargan cuando el usuario hace clic en "Ver opiniones".
// ✅ TIP 4: ya ni siquiera necesitamos moment.js (600 KB): Intl viene en el navegador.
import { escapeHtml } from "/js/lib/utils.js";

const dialog = document.getElementById("reviews-dialog");
const dateFormat = new Intl.DateTimeFormat("es-ES", { dateStyle: "long" });
const relativeFormat = new Intl.RelativeTimeFormat("es-ES", { numeric: "auto" });
let loaded = false;

function fromNow(date) {
  const days = Math.round((date - Date.now()) / 86_400_000);
  if (Math.abs(days) < 30) return relativeFormat.format(days, "day");
  if (Math.abs(days) < 365) return relativeFormat.format(Math.round(days / 30), "month");
  return relativeFormat.format(Math.round(days / 365), "year");
}

export async function openReviews() {
  if (!loaded) {
    const reviews = await fetch("/api/reviews.json").then((r) => r.json());
    document.getElementById("reviews-list").innerHTML = reviews
      .map((r) => {
        const date = new Date(r.date);
        return `
        <li>
          <strong>${escapeHtml(r.author)}</strong> · ${"★".repeat(r.rating)}
          <div class="meta">${fromNow(date)} · ${dateFormat.format(date)}</div>
          <p>${escapeHtml(r.text)}</p>
        </li>`;
      })
      .join("");
    dialog.querySelector("[data-close]").addEventListener("click", () => dialog.close());
    loaded = true;
  }
  dialog.showModal();
}
