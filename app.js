const state = {
  events: [],
  filtered: [],
  sortAsc: false,
};

const els = {
  form: document.querySelector('#filterForm'),
  category: document.querySelector('#categoryFilter'),
  day: document.querySelector('#dayFilter'),
  grid: document.querySelector('#eventsGrid'),
  status: document.querySelector('#resultStatus'),
  sortBtn: document.querySelector('#sortBtn'),
  helpBtn: document.querySelector('#labHelpBtn'),
  helpDialog: document.querySelector('#helpDialog'),
  closeHelpBtn: document.querySelector('#closeHelpBtn'),
  dialogOkBtn: document.querySelector('#dialogOkBtn'),
  eventDetailsDialog: document.querySelector('#eventDetailsDialog'),
  eventDetailsTitle: document.querySelector('#eventDetailsTitle'),
  eventDetailsImage: document.querySelector('#eventDetailsImage'),
  eventDetailsDate: document.querySelector('#eventDetailsDate'),
  eventDetailsDistance: document.querySelector('#eventDetailsDistance'),
  eventDetailsLocation: document.querySelector('#eventDetailsLocation'),
  eventDetailsDescription: document.querySelector('#eventDetailsDescription'),
  closeEventDetailsBtn: document.querySelector('#closeEventDetailsBtn'),
  eventDetailsOkBtn: document.querySelector('#eventDetailsOkBtn'),
};

function renderEvents(events) {
  if (!events.length) {
    els.grid.innerHTML = '<div class="empty-state">Nenhum evento encontrado para estes filtros.</div>';
    return;
  }

  els.grid.innerHTML = events.map((event) => `
    <article class="event-card">
      <div class="event-card__image-wrap">
        <img src="${event.image}" alt="Ilustração do evento ${event.title}" width="1200" height="675" loading="lazy" decoding="async" />
      </div>
      <div class="event-card__body">
        <div class="event-card__meta">
          <span>${event.date}</span>
          <span>${event.distance.toFixed(1)} km</span>
        </div>
        <h3>${event.title}</h3>
        <p>${event.location} • ${event.description}</p>
        <button class="card-btn" type="button" data-event-id="${event.id}">Ver detalhes</button>
      </div>
    </article>
  `).join('');
}

async function fetchEvents() {
  const response = await fetch('data/events.json');
  if (!response.ok) throw new Error('Falha ao carregar eventos');
  return response.json();
}

function applyCurrentFilters(events) {
  return events.filter((event) => {
    const catOk = els.category.value === 'all' || event.category === els.category.value;
    const dayOk = els.day.value === 'all' || event.day === els.day.value;
    return catOk && dayOk;
  });
}

function openEventDetails(eventId) {
  const selectedEvent = state.events.find((event) => event.id === eventId);
  if (!selectedEvent) return;

  els.eventDetailsTitle.textContent = selectedEvent.title;
  els.eventDetailsImage.src = selectedEvent.image;
  els.eventDetailsImage.alt = `Ilustração do evento ${selectedEvent.title}`;
  els.eventDetailsDate.textContent = selectedEvent.date;
  els.eventDetailsDistance.textContent = `${selectedEvent.distance.toFixed(1)} km de distância`;
  els.eventDetailsLocation.textContent = selectedEvent.location;
  els.eventDetailsDescription.textContent = selectedEvent.description;
  els.eventDetailsDialog.showModal();
}

function runFilterFlow() {
  state.filtered = applyCurrentFilters(state.events);
  renderEvents(state.filtered);
  els.status.textContent = `${state.filtered.length} eventos encontrados`;
}

els.form.addEventListener('submit', (event) => {
  event.preventDefault();
  runFilterFlow();
});

els.sortBtn.addEventListener('click', () => {
  state.sortAsc = !state.sortAsc;
  state.filtered.sort((a, b) => state.sortAsc ? a.distance - b.distance : b.distance - a.distance);
  renderEvents(state.filtered);
  els.sortBtn.textContent = state.sortAsc ? 'Ordenar: maior distância primeiro' : 'Ordenar: menor distância primeiro';
});

els.grid.addEventListener('click', (event) => {
  const button = event.target.closest('[data-event-id]');
  if (!button) return;
  const card = button.closest('.event-card');
  card.animate([
    { transform: 'scale(1)' },
    { transform: 'scale(.985)' },
    { transform: 'scale(1)' },
  ], { duration: 220 });
  openEventDetails(Number(button.dataset.eventId));
});

els.helpBtn.addEventListener('click', () => els.helpDialog.showModal());
els.closeHelpBtn.addEventListener('click', () => els.helpDialog.close());
els.dialogOkBtn.addEventListener('click', () => els.helpDialog.close());
els.closeEventDetailsBtn.addEventListener('click', () => els.eventDetailsDialog.close());
els.eventDetailsOkBtn.addEventListener('click', () => els.eventDetailsDialog.close());

async function init() {
  try {
    const data = await fetchEvents();
    state.events = data;
    state.filtered = data;
    renderEvents(data);
    els.status.textContent = `${data.length} eventos disponíveis`;
  } catch (error) {
    els.grid.innerHTML = '<div class="empty-state">Falha ao carregar o catálogo inicial.</div>';
    console.error(error);
  }
}

init();
