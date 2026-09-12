const state = {
  events: [],
  filtered: [],
  sortAsc: true,
  requestCount: 0,
};

const els = {
  form: document.querySelector('#filterForm'),
  category: document.querySelector('#categoryFilter'),
  day: document.querySelector('#dayFilter'),
  button: document.querySelector('#applyFilters'),
  loading: document.querySelector('#loadingState'),
  grid: document.querySelector('#eventsGrid'),
  status: document.querySelector('#resultStatus'),
  bannerSlot: document.querySelector('#lateBannerSlot'),
  sortBtn: document.querySelector('#sortBtn'),
  helpBtn: document.querySelector('#labHelpBtn'),
  helpDialog: document.querySelector('#helpDialog'),
  closeHelpBtn: document.querySelector('#closeHelpBtn'),
  dialogOkBtn: document.querySelector('#dialogOkBtn'),
};

function busyMainThread(ms = 340) {
  // PROPOSITAL: simula trabalho síncrono pesado para o laboratório.
  const start = performance.now();
  let acc = 0;
  while (performance.now() - start < ms) {
    for (let i = 1; i < 3000; i += 1) acc += Math.sqrt(i * Math.random());
  }
  return acc;
}

function createSkeletonCards(count = 6) {
  return Array.from({ length: count }, () => `
    <article class="event-card" aria-hidden="true">
      <div class="event-card__image-wrap skeleton"></div>
      <div class="event-card__body">
        <div class="skeleton" style="height:14px;width:45%;border-radius:6px"></div>
        <div class="skeleton" style="height:22px;width:80%;border-radius:7px;margin-top:12px"></div>
        <div class="skeleton" style="height:14px;width:100%;border-radius:6px;margin-top:10px"></div>
        <div class="skeleton" style="height:42px;width:100%;border-radius:10px;margin-top:16px"></div>
      </div>
    </article>`).join('');
}

function renderEvents(events) {
  if (!events.length) {
    els.grid.innerHTML = '<div class="empty-state">Nenhum evento encontrado para estes filtros.</div>';
    return;
  }

  els.grid.innerHTML = events.map((event, index) => `
    <article class="event-card">
      <div class="event-card__image-wrap">
        <img data-src="${event.image}" alt="Ilustração do evento ${event.title}" width="1200" height="675" />
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

  // PROPOSITAL: imagens são iniciadas de forma escalonada, não imediatamente.
  [...els.grid.querySelectorAll('img[data-src]')].forEach((img, index) => {
    window.setTimeout(() => {
      img.src = img.dataset.src;
      img.removeAttribute('data-src');
    }, 180 + index * 140);
  });
}

async function fetchEvents() {
  state.requestCount += 1;
  const response = await fetch(`data/events.json?run=${state.requestCount}`, { cache: 'no-store' });
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

async function runFilterFlow() {
  performance.mark('filter-clicked');

  // PROPOSITAL: por alguns instantes o botão não dá feedback visual claro.
  await new Promise((resolve) => setTimeout(resolve, 650));

  els.loading.hidden = false;
  els.grid.innerHTML = createSkeletonCards();
  els.status.textContent = 'Consultando...';
  performance.mark('loading-visible');

  // PROPOSITAL: trabalho bloqueante antes da requisição.
  busyMainThread(320);
  performance.mark('before-request');

  try {
    const data = await fetchEvents();
    performance.mark('response-received');

    // PROPOSITAL: atraso adicional após a resposta para diferenciar rede x renderização.
    await new Promise((resolve) => setTimeout(resolve, 700));

    state.events = data;
    state.filtered = applyCurrentFilters(data);
    renderEvents(state.filtered);
    els.status.textContent = `${state.filtered.length} eventos encontrados`;
    performance.mark('results-usable');
    performance.measure('tempo-ate-feedback', 'filter-clicked', 'loading-visible');
    performance.measure('tempo-antes-request', 'filter-clicked', 'before-request');
    performance.measure('tempo-request', 'before-request', 'response-received');
    performance.measure('tempo-ate-resultados', 'filter-clicked', 'results-usable');
  } catch (error) {
    els.grid.innerHTML = '<div class="empty-state">Não foi possível carregar os eventos. Tente novamente.</div>';
    els.status.textContent = 'Falha na consulta';
    console.error(error);
  } finally {
    els.loading.hidden = true;
  }
}

els.form.addEventListener('submit', (event) => {
  event.preventDefault();
  runFilterFlow();
});

els.sortBtn.addEventListener('click', () => {
  state.sortAsc = !state.sortAsc;
  state.filtered.sort((a, b) => state.sortAsc ? a.distance - b.distance : b.distance - a.distance);
  renderEvents(state.filtered);
  els.sortBtn.textContent = state.sortAsc ? 'Ordenar por distância' : 'Ordem inversa';
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
});

els.helpBtn.addEventListener('click', () => els.helpDialog.showModal());
els.closeHelpBtn.addEventListener('click', () => els.helpDialog.close());
els.dialogOkBtn.addEventListener('click', () => els.helpDialog.close());

async function init() {
  els.grid.innerHTML = createSkeletonCards();
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

  // PROPOSITAL: banner tardio inserido acima dos resultados, causando deslocamento de layout.
  window.setTimeout(() => {
    els.bannerSlot.innerHTML = `
      <div class="promo-banner">
        <strong>Novidade do fim de semana</strong>
        Uma programação especial acabou de ser adicionada ao catálogo.
      </div>`;
  }, 2400);
}

init();
