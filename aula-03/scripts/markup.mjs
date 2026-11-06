export function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

export function renderCard(event) {
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

export function renderDocument({ strategy, description, status, cardsHtml }) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="${escapeHtml(description)}" />
  <title>Catálogo de eventos — ${strategy}</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <header class="topbar">
    <div class="container topbar__content">
      <a class="brand" href="./">
        <span class="brand__mark" aria-hidden="true">PL</span>
        <span>
          <strong>Performance Lab</strong>
          <small>Catálogo de eventos</small>
        </span>
      </a>
      <span class="strategy-pill">${strategy}</span>
    </div>
  </header>

  <main>
    <section class="container filter-card" aria-labelledby="filterTitle">
      <div class="filter-card__head">
        <div>
          <p class="eyebrow">AULA 3</p>
          <h1 id="filterTitle">Eventos do fim de semana</h1>
        </div>
        <span id="resultStatus" class="status-pill" aria-live="polite">${escapeHtml(status)}</span>
      </div>

      <form id="filterForm" class="filters">
        <label>
          <span>Categoria</span>
          <select id="categoryFilter" name="category">
            <option value="all">Todas</option>
            <option value="musica">Música</option>
            <option value="gastronomia">Gastronomia</option>
            <option value="familia">Família</option>
            <option value="esporte">Esporte</option>
          </select>
        </label>

        <label>
          <span>Dia</span>
          <select id="dayFilter" name="day">
            <option value="all">Qualquer dia</option>
            <option value="sexta">Sexta-feira</option>
            <option value="sabado">Sábado</option>
            <option value="domingo">Domingo</option>
          </select>
        </label>

        <button id="applyFilters" class="primary-btn" type="submit">Aplicar filtros</button>
      </form>
    </section>

    <section class="container content" aria-labelledby="resultsTitle">
      <div class="section-head">
        <h2 id="resultsTitle">Eventos encontrados</h2>
        <button id="sortBtn" class="ghost-btn" type="button">Ordenar por distância</button>
      </div>
      <div id="eventsGrid" class="events-grid" aria-live="polite">
        ${cardsHtml}
        <div id="emptyState" class="empty-state" hidden>Nenhum evento encontrado para estes filtros.</div>
      </div>
    </section>
  </main>

  <dialog id="eventDetailsDialog" aria-labelledby="eventDetailsTitle">
    <div class="dialog__content event-details">
      <div class="dialog__head">
        <div>
          <p class="eyebrow">DETALHES DO EVENTO</p>
          <h2 id="eventDetailsTitle"></h2>
        </div>
        <button id="closeEventDetailsBtn" class="icon-btn" type="button" aria-label="Fechar detalhes">×</button>
      </div>
      <img id="eventDetailsImage" class="event-details__image" alt="" width="1000" height="563" />
      <div class="event-details__meta">
        <span id="eventDetailsDate"></span>
        <span id="eventDetailsDistance"></span>
      </div>
      <p id="eventDetailsLocation" class="event-details__location"></p>
      <p id="eventDetailsDescription"></p>
      <button id="eventDetailsOkBtn" class="primary-btn" type="button">Fechar</button>
    </div>
  </dialog>

  <script src="app.js" defer></script>
</body>
</html>
`;
}
