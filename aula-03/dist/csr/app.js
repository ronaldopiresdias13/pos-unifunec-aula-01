const grid = document.querySelector("#grid");
const status = document.querySelector("#status");
const form = document.querySelector("#filters");
const dialog = document.querySelector("#detail");
const detailTitle = document.querySelector("#detail-title");
const detailMeta = document.querySelector("#detail-meta");
const detailBody = document.querySelector("#detail-body");

const categoryLabel = {
  musica: "Música",
  gastronomia: "Gastronomia",
  familia: "Família",
  esporte: "Esporte"
};

let events = [];

form.addEventListener("submit", (event) => {
  event.preventDefault();
  paint();
});

grid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-detail]");
  if (!button) return;
  const card = button.closest(".card");
  detailTitle.textContent = card.dataset.title;
  detailMeta.textContent = `${card.dataset.date} · ${card.dataset.location} · ${card.dataset.distance} km`;
  detailBody.textContent = card.dataset.description;
  dialog.showModal();
});

async function main() {
  try {
    const response = await fetch("data/events.json");
    if (!response.ok) throw new Error(String(response.status));
    events = await response.json();
    paint();
  } catch {
    status.textContent = "Não foi possível carregar os eventos.";
  }
}

function paint() {
  const visible = select(events);
  grid.replaceChildren();
  visible.forEach((event, index) => grid.append(card(event, index === 0)));
  status.textContent = countLabel(visible.length);
}

function select(list) {
  const day = form.day.value;
  const category = form.category.value;
  const sort = form.sort.value;
  const visible = list.filter((event) => {
    const dayOk = day === "todos" || event.day === day;
    const categoryOk = category === "todas" || event.category === category;
    return dayOk && categoryOk;
  });
  visible.sort((a, b) => compare(a, b, sort));
  return visible;
}

function compare(a, b, sort) {
  if (sort === "perto") return a.distance - b.distance;
  if (sort === "longe") return b.distance - a.distance;
  if (sort === "titulo") return a.title.localeCompare(b.title, "pt-BR");
  return a.id - b.id;
}

function card(event, first) {
  const article = document.createElement("article");
  article.className = "card";
  article.dataset.title = event.title;
  article.dataset.description = event.description;
  article.dataset.date = event.date;
  article.dataset.location = event.location;
  article.dataset.distance = String(event.distance);

  const image = document.createElement("img");
  image.src = `../../../${event.image}`;
  image.alt = event.title;
  image.width = 1000;
  image.height = 563;
  image.decoding = "async";
  if (first) image.fetchPriority = "high";
  else image.loading = "lazy";

  const body = document.createElement("div");
  body.className = "card-body";

  const meta = document.createElement("p");
  meta.className = "meta";
  meta.textContent = `${event.date} · ${event.location} · ${categoryLabel[event.category]}`;

  const title = document.createElement("h2");
  title.textContent = event.title;

  const description = document.createElement("p");
  description.textContent = event.description;

  const distance = document.createElement("p");
  distance.className = "distance";
  distance.textContent = `${event.distance.toFixed(1).replace(".", ",")} km`;

  const button = document.createElement("button");
  button.type = "button";
  button.className = "detail";
  button.dataset.detail = "";
  button.textContent = "Ver detalhes";

  body.append(meta, title, description, distance, button);
  article.append(image, body);
  return article;
}

function countLabel(total) {
  if (total === 0) return "0 eventos encontrados";
  if (total === 1) return "1 evento encontrado";
  return `${total} eventos encontrados`;
}

main();
