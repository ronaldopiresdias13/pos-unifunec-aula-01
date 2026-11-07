import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repo = resolve(root, "..");
const events = JSON.parse(await readFile(resolve(repo, "data/events.json"), "utf8"));
const styles = await readFile(resolve(root, "src/styles.css"));
const csrJs = await readFile(resolve(root, "src/csr.js"));
const ssgJs = await readFile(resolve(root, "src/ssg.js"));

const categoryLabel = {
  musica: "Música",
  gastronomia: "Gastronomia",
  familia: "Família",
  esporte: "Esporte"
};

await writeStrategy("csr", {
  script: "app.js",
  status: "Carregando eventos...",
  grid: "",
  description: "Catálogo montado no navegador. O HTML inicial não traz os eventos."
});
await writeStrategy("ssg", {
  script: "app.js",
  status: `${events.length} eventos encontrados`,
  grid: events.map((event, index) => card(event, index === 0)).join("\n"),
  description: "Catálogo gerado no build. O HTML inicial já traz os 12 eventos."
});

await mkdir(resolve(root, "dist/csr/data"), { recursive: true });
await writeFile(resolve(root, "dist/csr/data/events.json"), JSON.stringify(events));
await writeFile(resolve(root, "dist/csr/app.js"), csrJs);
await writeFile(resolve(root, "dist/csr/styles.css"), styles);
await writeFile(resolve(root, "dist/ssg/app.js"), ssgJs);
await writeFile(resolve(root, "dist/ssg/styles.css"), styles);
await writeFile(resolve(root, "dist/index.html"), `<!DOCTYPE html>\n<html lang=\"pt-BR\">\n<head>\n  <meta charset=\"utf-8\">\n  <title>Aula 3 — CSR e SSG</title>\n</head>\n<body>\n  <p><a href=\"csr/\">CSR</a> — o conteúdo entra depois do JavaScript.</p>\n  <p><a href=\"ssg/\">SSG</a> — o conteúdo já está no HTML.</p>\n</body>\n</html>\n`);

console.log(`build ok: ${events.length} eventos`);

async function writeStrategy(name, { script, status, grid, description }) {
  const html = page({ name, script, status, grid, description });
  const file = resolve(root, "dist", name, "index.html");
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, html);
}

function page({ name, script, status, grid, description }) {
  const label = name.toUpperCase();
  return `<!DOCTYPE html>\n<html lang=\"pt-BR\">\n<head>\n  <meta charset=\"utf-8\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n  <title>Catálogo de eventos — ${label}</title>\n  <meta name=\"description\" content=\"${escapeAttr(description)}\">\n  <link rel=\"stylesheet\" href=\"styles.css\">\n</head>\n<body>\n  <header class=\"wrap\">\n    <p class=\"eyebrow\">Performance web · aula 3 <span class=\"badge\">${label}</span></p>\n    <h1>O que acontece na cidade neste fim de semana</h1>\n    <p class=\"lede\">${escapeText(description)}</p>\n  </header>\n  <main class=\"wrap\">\n    <form id=\"filters\">\n      <label>Dia\n        <select name=\"day\">\n          <option value=\"todos\">Todos</option>\n          <option value=\"sexta\">Sexta</option>\n          <option value=\"sabado\">Sábado</option>\n          <option value=\"domingo\">Domingo</option>\n        </select>\n      </label>\n      <label>Categoria\n        <select name=\"category\">\n          <option value=\"todas\">Todas</option>\n          <option value=\"musica\">Música</option>\n          <option value=\"gastronomia\">Gastronomia</option>\n          <option value=\"familia\">Família</option>\n          <option value=\"esporte\">Esporte</option>\n        </select>\n      </label>\n      <label>Ordem\n        <select name=\"sort\">\n          <option value=\"catalogo\">Catálogo</option>\n          <option value=\"perto\">Mais perto</option>\n          <option value=\"longe\">Mais longe</option>\n          <option value=\"titulo\">Título</option>\n        </select>\n      </label>\n      <button type=\"submit\">Aplicar filtros</button>\n    </form>\n    <p id=\"status\">${escapeText(status)}</p>\n    <div id=\"grid\" class=\"grid\">\n${grid}\n    </div>\n  </main>\n  <dialog id=\"detail\">\n    <h2 id=\"detail-title\"></h2>\n    <p id=\"detail-meta\"></p>\n    <p id=\"detail-body\"></p>\n    <form method=\"dialog\"><button type=\"submit\">Fechar</button></form>\n  </dialog>\n  <script src=\"${script}\"></script>\n</body>\n</html>\n`;
}

function card(event, first) {
  const priority = first ? ' fetchpriority="high"' : ' loading="lazy"';
  return `      <article class="card" data-id="${event.id}" data-day="${escapeAttr(event.day)}" data-category="${escapeAttr(event.category)}" data-distance="${event.distance}" data-title="${escapeAttr(event.title)}" data-description="${escapeAttr(event.description)}" data-date="${escapeAttr(event.date)}" data-location="${escapeAttr(event.location)}">\n        <img src="../../../${escapeAttr(event.image)}" alt="${escapeAttr(event.title)}" width="1000" height="563" decoding="async"${priority}>\n        <div class="card-body">\n          <p class="meta">${escapeText(event.date)} · ${escapeText(event.location)} · ${escapeText(categoryLabel[event.category])}</p>\n          <h2>${escapeText(event.title)}</h2>\n          <p>${escapeText(event.description)}</p>\n          <p class="distance">${event.distance.toFixed(1).replace(".", ",")} km</p>\n          <button type="button" class="detail" data-detail>Ver detalhes</button>\n        </div>\n      </article>`;
}

function escapeText(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function escapeAttr(value) {
  return escapeText(value).replaceAll('"', "&quot;");
}
