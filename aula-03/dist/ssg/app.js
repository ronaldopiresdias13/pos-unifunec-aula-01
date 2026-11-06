const els = {
  form: document.querySelector('#filterForm'),
  category: document.querySelector('#categoryFilter'),
  day: document.querySelector('#dayFilter'),
  grid: document.querySelector('#eventsGrid'),
  empty: document.querySelector('#emptyState'),
  status: document.querySelector('#resultStatus'),
  sortBtn: document.querySelector('#sortBtn'),
  dialog: document.querySelector('#eventDetailsDialog'),
  title: document.querySelector('#eventDetailsTitle'),
  image: document.querySelector('#eventDetailsImage'),
  date: document.querySelector('#eventDetailsDate'),
  distance: document.querySelector('#eventDetailsDistance'),
  location: document.querySelector('#eventDetailsLocation'),
  description: document.querySelector('#eventDetailsDescription'),
  closeBtn: document.querySelector('#closeEventDetailsBtn'),
  okBtn: document.querySelector('#eventDetailsOkBtn'),
};

const state = { sortAsc: false, sorted: false };

function cards() {
  return [...els.grid.querySelectorAll('.event-card')];
}

function applyView() {
  cards().forEach((card) => {
    const categoryOk = els.category.value === 'all' || card.dataset.category === els.category.value;
    const dayOk = els.day.value === 'all' || card.dataset.day === els.day.value;
    card.hidden = !(categoryOk && dayOk);
  });

  if (state.sorted) {
    cards()
      .sort((a, b) => (
        state.sortAsc
          ? Number(a.dataset.distance) - Number(b.dataset.distance)
          : Number(b.dataset.distance) - Number(a.dataset.distance)
      ))
      .forEach((card) => els.empty.before(card));
  }

  const visibleCount = cards().filter((card) => !card.hidden).length;
  els.empty.hidden = visibleCount > 0;
  els.status.textContent = visibleCount === cards().length
    ? `${visibleCount} eventos disponíveis`
    : `${visibleCount} eventos encontrados`;
}

function openDetails(card) {
  const image = card.querySelector('img');
  els.title.textContent = card.querySelector('h2').textContent;
  els.image.src = image.getAttribute('src');
  els.image.alt = image.alt;
  els.date.textContent = card.dataset.date;
  els.distance.textContent = `${Number(card.dataset.distance).toFixed(1)} km de distância`;
  els.location.textContent = card.dataset.location;
  els.description.textContent = card.dataset.description;
  els.dialog.showModal();
}

els.form.addEventListener('submit', (event) => {
  event.preventDefault();
  applyView();
});

els.sortBtn.addEventListener('click', () => {
  state.sorted = true;
  state.sortAsc = !state.sortAsc;
  els.sortBtn.textContent = state.sortAsc ? 'Ordem inversa' : 'Ordenar por distância';
  applyView();
});

els.grid.addEventListener('click', (event) => {
  const button = event.target.closest('.card-btn');
  if (!button) return;
  openDetails(button.closest('.event-card'));
});

els.closeBtn.addEventListener('click', () => els.dialog.close());
els.okBtn.addEventListener('click', () => els.dialog.close());
