const grid = document.querySelector("#grid");
const status = document.querySelector("#status");
const form = document.querySelector("#filters");
const dialog = document.querySelector("#detail");
const detailTitle = document.querySelector("#detail-title");
const detailMeta = document.querySelector("#detail-meta");
const detailBody = document.querySelector("#detail-body");

let events = [];

form.addEventListener("submit", (event) => {
  event.preventDefault();
  paint();
});

grid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-detail]");
  if (!button) return;
  const item = events.find((entry) => String(entry.id) === button.dataset.detail);
  if (!item) return;
  detailTitle.textContent = item.title;
  detailMeta.textContent = `${item.date} · ${item.location} · ${item.distance} km`;
  detailBody.textContent = item.description;
  dialog.showModal();
});

load();

async function load() {
  const response = await fetch("data/events.json");
  events = await response.json();
  paint();
}

function paint() {
  const day = form.day.value;
  const category = form.category.value;
  const sort = form.sort.value;
  const visible = events.filter((item) => {
    const dayOk = day === "todos" || item.day === day;
    const categoryOk = category === "todas" || item.category === category;
    return dayOk && categoryOk;
  });
  visible.sort(compare);
  grid.replaceChildren();
  for (const [index, item] of visible.entries()) grid.append(card(item, index === 0));
  status.textContent = countLabel(visible.length);
}

function compare(a, b) {
  const sort = form.sort.value;
  if (sort === "perto") return a.distance - b.distance;
  if (sort === "longe") return b.distance - a.distance;
  if (sort === "titulo") return a.title.localeCompare(b.title, "pt-BR");
  return a.id - b.id;
}

function card(item, first) {
  const article = document.createElement("article");
  article.className = "card";

  const image = document.createElement("img");
  image.alt = item.title;
  image.width = 640;
  image.height = 360;
  image.src = `../../../${item.image}`;
  if (first) image.fetchPriority = "high";
  else image.loading = "lazy";

  const body = document.createElement("div");
  body.className = "card-body";

  const meta = document.createElement("p");
  meta.className = "meta";
  meta.textContent = `${label(item.category)} · ${item.date}`;

  const title = document.createElement("h2");
  title.textContent = item.title;

  const place = document.createElement("p");
  place.textContent = item.location;

  const distance = document.createElement("p");
  distance.className = "distance";
  distance.textContent = `${item.distance} km do centro`;

  const button = document.createElement("button");
  button.className = "detail";
  button.type = "button";
  button.dataset.detail = String(item.id);
  button.textContent = "Ver detalhes";

  body.append(meta, title, place, distance, button);
  article.append(image, body);
  return article;
}

function label(category) {
  return {
    musica: "Música",
    gastronomia: "Gastronomia",
    familia: "Família",
    esporte: "Esporte",
  }[category];
}

function countLabel(total) {
  if (total === 0) return "0 eventos encontrados";
  if (total === 1) return "1 evento encontrado";
  return `${total} eventos encontrados`;
}
