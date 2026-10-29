// ✅ TIP 5: build mínimo (sin dependencias) que prepara los ficheros para
//    servirlos con compresión y caché agresiva.
//
//    1. Fingerprinting: añade un hash del contenido al nombre de cada fichero
//       (main.js → main.3f9a1c2b.js) y reescribe todas las referencias.
//       Si el contenido cambia, cambia el nombre → podemos cachearlo "para siempre".
//    2. Precompresión: genera .br (Brotli) y .gz (Gzip) con el máximo nivel.
//       Comprimir al vuelo en cada petición no permite niveles tan altos.
//
// Uso: node build.mjs   → genera ./dist
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, extname, join, relative } from "node:path";
import { brotliCompressSync, constants, gzipSync } from "node:zlib";

const SRC = import.meta.dirname;
const DIST = join(SRC, "dist");
const SOURCE_DIRS = ["css", "js", "vendor", "fonts", "img", "api"];
const TEXT = new Set([".html", ".css", ".js", ".json", ".svg"]);

// No llevan hash:
//  - index.html: su URL tiene que ser siempre la misma (se sirve con no-cache)
//  - /api: son datos, no assets
//  - /img/products: sus URLs se construyen en JS a partir de los datos de la API
const isHashable = (path) =>
  path !== "/index.html" && !path.startsWith("/api/") && !path.startsWith("/img/products/");

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

const files = ["/index.html", ...SOURCE_DIRS.flatMap((d) => walk(join(SRC, d)))]
  .map((f) => (f.startsWith("/index") ? f : "/" + relative(SRC, f)));

const read = (path) => readFileSync(join(SRC, path));
const isText = (path) => TEXT.has(extname(path));

// Rutas originales → rutas con hash. Reemplazamos primero las más largas
// para que "/js/main.js" no pise a otra ruta que la contenga.
const renamed = new Map();
function rewrite(content) {
  for (const [from, to] of [...renamed].sort((a, b) => b[0].length - a[0].length)) {
    content = content.replaceAll(from, to);
  }
  return content;
}

const output = new Map(); // ruta final → contenido
const write = (path, content) => output.set(path, content);

// Hasheamos en orden de dependencias: un fichero solo se procesa cuando todos
// los ficheros que referencia ya tienen su nombre definitivo (si main.js
// importa products.js, el hash de main.js depende del hash de products.js).
let pending = files.filter(isHashable);
while (pending.length) {
  const next = pending.filter((path) => {
    if (!isText(path)) return true;
    const text = read(path).toString();
    return !pending.some((other) => other !== path && text.includes(other));
  });
  if (!next.length) throw new Error("Referencias circulares entre: " + pending.join(", "));

  for (const path of next) {
    const content = isText(path) ? Buffer.from(rewrite(read(path).toString())) : read(path);
    const hash = createHash("sha256").update(content).digest("hex").slice(0, 8);
    const ext = extname(path);
    const hashed = path.slice(0, -ext.length) + "." + hash + ext;
    renamed.set(path, hashed);
    write(hashed, content);
  }
  pending = pending.filter((p) => !next.includes(p));
}

for (const path of files.filter((p) => !isHashable(p))) {
  write(path, isText(path) ? Buffer.from(rewrite(read(path).toString())) : read(path));
}

// Escribimos dist/ y precomprimimos los ficheros de texto
rmSync(DIST, { recursive: true, force: true });
const rows = [];
for (const [path, content] of output) {
  const target = join(DIST, path);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, content);

  // Imágenes y fuentes ya van comprimidas: volver a comprimirlas no sirve de nada
  if (!isText(path) || content.length < 1024) continue;

  const br = brotliCompressSync(content, {
    params: { [constants.BROTLI_PARAM_QUALITY]: 11, [constants.BROTLI_PARAM_SIZE_HINT]: content.length },
  });
  const gz = gzipSync(content, { level: 9 });
  writeFileSync(target + ".br", br);
  writeFileSync(target + ".gz", gz);
  rows.push({ fichero: path, original: kb(content.length), gzip: kb(gz.length), brotli: kb(br.length), ahorro: pct(br.length, content.length) });
}

console.table(rows);
console.log(`\n✔ dist/ generado: ${output.size} ficheros (${renamed.size} con hash)`);

function kb(bytes) {
  return (bytes / 1024).toFixed(1) + " KB";
}
function pct(part, total) {
  return "-" + Math.round((1 - part / total) * 100) + "%";
}
