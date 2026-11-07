const grid = document.querySelector("#grid");
const status = document.querySelector("#status");
const form = document.querySelector("#filters");
const dialog = document.querySelector("#detail");
const detailTitle = document.querySelector("#detail-title");
const detailMeta = document.querySelector("#detail-meta");
const detailBody = document.querySelector("#detail-body");

const cards = [...grid.querySelectorAll(".card")];

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

function paint() {
  const day = form.day.value;
  const category = form.category.value;
  const sort = form.sort.value;
  const visible = cards.filter((card) => {
    const dayOk = day === "todos" || card.dataset.day === day;
    const categoryOk = category === "todas" || card.dataset.category === category;
    return dayOk && categoryOk;
  });
  visible.sort((a, b) => compare(a, b, sort));
  for (const card of cards) card.hidden = true;
  for (const card of visible) {
    card.hidden = false;
    grid.append(card);
  }
  status.textContent = countLabel(visible.length);
}

function compare(a, b, sort) {
  if (sort === "perto") return Number(a.dataset.distance) - Number(b.dataset.distance);
  if (sort === "longe") return Number(b.dataset.distance) - Number(a.dataset.distance);
  if (sort === "titulo") return a.dataset.title.localeCompare(b.dataset.title, "pt-BR");
  return Number(a.dataset.id) - Number(b.dataset.id);
}

function countLabel(total) {
  if (total === 0) return "0 eventos encontrados";
  if (total === 1) return "1 evento encontrado";
  return `${total} eventos encontrados`;
}
