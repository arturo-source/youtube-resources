// ❌ Cada parte de la app pide la config por su cuenta → 3 peticiones iguales
//    (lo arreglamos en el tip 4)
export async function getConfig() {
  const res = await fetch("/api/config.json");
  return res.json();
}
