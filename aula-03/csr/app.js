const state = {
  events: [],
  sortAsc: false,
  sorted: false,
};

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

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function renderCard(event) {
  const lcp = event.id === 1;
  const imageAttrs = lcp
    ? 'fetchpriority="high" loading="eager" decoding="async"'
    : 'loading="lazy" decoding="async"';
  const cardClass = lcp ? 'event-card event-card--lcp' : 'event-card';
  const title = escapeHtml(event.title);
  const date = escapeHtml(event.date);
  const location = escapeHtml(event.location);
  const description = escapeHtml(event.description);
  const distance = Number(event.distance).toFixed(1);

  return `<article class="${cardClass}" data-event-id="${event.id}" data-category="${escapeHtml(event.category)}" data-day="${escapeHtml(event.day)}" data-distance="${event.distance}" data-date="${date}" data-location="${location}" data-description="${description}">
        <div class="event-card__image-wrap">
          <img src="${escapeHtml(event.image)}" alt="Ilustração do evento ${title}" width="1000" height="563" ${imageAttrs} />
        </div>
        <div class="event-card__body">
          <div class="event-card__meta">
            <span>${date}</span>
            <span>${distance} km</span>
          </div>
          <h2>${title}</h2>
          <p>${location} • ${description}</p>
          <button class="card-btn" type="button" data-event-id="${event.id}">Ver detalhes</button>
        </div>
      </article>`;
}

function visibleEvents() {
  return state.events.filter((event) => {
    const categoryOk = els.category.value === 'all' || event.category === els.category.value;
    const dayOk = els.day.value === 'all' || event.day === els.day.value;
    return categoryOk && dayOk;
  });
}

function render({ initial = false } = {}) {
  const events = visibleEvents();
  if (state.sorted) {
    events.sort((a, b) => (
      state.sortAsc ? a.distance - b.distance : b.distance - a.distance
    ));
  }
  els.grid.querySelectorAll('.event-card').forEach((card) => card.remove());
  els.empty.hidden = events.length > 0;
  if (!events.length) {
    els.status.textContent = '0 eventos encontrados';
    return;
  }
  els.empty.insertAdjacentHTML('beforebegin', events.map(renderCard).join(''));
  els.status.textContent = initial
    ? `${state.events.length} eventos disponíveis`
    : `${events.length} eventos encontrados`;
}

function openDetails(eventId) {
  const event = state.events.find((item) => item.id === eventId);
  if (!event) return;
  els.title.textContent = event.title;
  els.image.src = event.image;
  els.image.alt = `Ilustração do evento ${event.title}`;
  els.date.textContent = event.date;
  els.distance.textContent = `${Number(event.distance).toFixed(1)} km de distância`;
  els.location.textContent = event.location;
  els.description.textContent = event.description;
  els.dialog.showModal();
}

els.form.addEventListener('submit', (event) => {
  event.preventDefault();
  render();
});

els.sortBtn.addEventListener('click', () => {
  state.sorted = true;
  state.sortAsc = !state.sortAsc;
  els.sortBtn.textContent = state.sortAsc ? 'Ordem inversa' : 'Ordenar por distância';
  render();
});

els.grid.addEventListener('click', (event) => {
  const button = event.target.closest('[data-event-id]');
  if (!button || !button.classList.contains('card-btn')) return;
  openDetails(Number(button.dataset.eventId));
});

els.closeBtn.addEventListener('click', () => els.dialog.close());
els.okBtn.addEventListener('click', () => els.dialog.close());

async function init() {
  try {
    const response = await fetch('data/events.json');
    if (!response.ok) throw new Error('Falha ao carregar eventos');
    state.events = await response.json();
    render({ initial: true });
  } catch (error) {
    els.empty.hidden = false;
    els.empty.textContent = 'Falha ao carregar o catálogo.';
    els.status.textContent = 'Falha ao carregar';
    console.error(error);
  }
}

init();
