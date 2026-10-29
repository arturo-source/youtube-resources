// Utilidades de carga bajo demanda

// Ejecuta `callback` una sola vez cuando `element` se acerca al viewport.
// rootMargin adelanta la carga 200px para que el usuario no note la espera.
export function whenVisible(element, callback, rootMargin = "200px") {
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        observer.disconnect();
        callback();
      }
    },
    { rootMargin }
  );
  observer.observe(element);
}

// Carga un script clásico (UMD) bajo demanda y lo cachea para no repetirlo.
const scripts = new Map();
export function loadScript(src) {
  if (!scripts.has(src)) {
    scripts.set(
      src,
      new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      })
    );
  }
  return scripts.get(src);
}
