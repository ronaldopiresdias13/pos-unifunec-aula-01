/**
 * Template compartilhado: gera o mesmo HTML do pacote no SSR (servidor)
 * e no CSR (navegador). Isso garante comparação justa e markup idêntico.
 */

/**
 * Escapa JSON para embutir com segurança em <script type="application/json">.
 * Troca "<" por "\u003c" para evitar que uma sequência "</script>" no conteúdo
 * feche prematuramente a tag e quebre o HTML / cause XSS.
 */
export function escapeJsonForScript(dados) {
  return JSON.stringify(dados).replace(/</g, "\\u003c");
}

/**
 * Gera o HTML interno do pacote (conteúdo de #app).
 * Não usa Date.now(), Math.random() nem typeof window — o markup deve ser
 * determinístico para não gerar incompatibilidade de hydration.
 *
 * @param {object} pacote — objeto do pacotes.json
 * @param {{ prioridadeLcp?: boolean }} opcoes
 *   prioridadeLcp: true no SSR (fetchpriority="high"); false/omitido no CSR
 */
export function renderPacoteHTML(pacote, opcoes = {}) {
  const prioridadeLcp = opcoes.prioridadeLcp === true;
  const fetchPriorityAttr = prioridadeLcp ? ' fetchpriority="high"' : "";

  const itensLista = pacote.incluidos
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join("");

  return `
<header class="cabecalho">
  <p class="agencia">Horizonte Verde Turismo</p>
</header>
<main class="conteudo">
  <h1>${escapeHtml(pacote.nome)}</h1>
  <figure class="hero">
    <img
      src="${escapeHtml(pacote.imagem)}"
      alt="${escapeHtml(pacote.imagemAlt)}"
      width="${pacote.imagemWidth}"
      height="${pacote.imagemHeight}"${fetchPriorityAttr}
    />
  </figure>
  <p class="preco">${escapeHtml(pacote.preco)}</p>
  <p class="descricao">${escapeHtml(pacote.descricao)}</p>
  <section class="incluidos" aria-labelledby="titulo-incluidos">
    <h2 id="titulo-incluidos">O que está incluso</h2>
    <ul>
      ${itensLista}
    </ul>
  </section>
  <button type="button" id="btn-reservar" class="btn-reservar">Reservar</button>
  <p id="mensagem-reserva" class="mensagem-reserva" hidden role="status"></p>
</main>
`.trim();
}

/** Escapa texto para inserção segura em HTML. */
function escapeHtml(texto) {
  return String(texto)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Liga o evento do botão Reservar (usado no CSR após montar e no SSR na hydration).
 * Não recria o DOM — apenas adiciona o listener.
 */
export function ligarBotaoReservar() {
  const botao = document.getElementById("btn-reservar");
  const mensagem = document.getElementById("mensagem-reserva");

  if (!botao || !mensagem) {
    console.warn("[hydration] Botão ou mensagem de reserva não encontrados no DOM.");
    return;
  }

  // Evita listeners duplicados se o script for executado mais de uma vez
  if (botao.dataset.hidratado === "1") {
    return;
  }
  botao.dataset.hidratado = "1";

  botao.addEventListener("click", () => {
    mensagem.hidden = false;
    mensagem.textContent =
      "Reserva iniciada! Em breve nossa equipe entrará em contato.";
  });
}
