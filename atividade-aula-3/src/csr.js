/**
 * Entrada do bundle CSR.
 * O HTML inicial é um casco quase vazio; todo o conteúdo é montado no navegador
 * depois do fetch na API (com o mesmo atraso de 300 ms da versão SSR).
 */
import { renderPacoteHTML, ligarBotaoReservar } from "./template.js";

const app = document.getElementById("app");

function obterIdDaUrl() {
  // /csr/pacotes/:id
  const partes = window.location.pathname.split("/").filter(Boolean);
  return partes[partes.length - 1] || "pantanal";
}

async function iniciar() {
  const id = obterIdDaUrl();

  // Skeleton simples enquanto carrega (sem conteúdo real do pacote)
  app.innerHTML = `
    <div class="skeleton" aria-busy="true" aria-live="polite">
      <div class="skeleton-linha skeleton-titulo"></div>
      <div class="skeleton-hero"></div>
      <div class="skeleton-linha"></div>
      <div class="skeleton-linha"></div>
    </div>
  `;

  try {
    const resposta = await fetch(`/api/pacotes/${encodeURIComponent(id)}`);
    if (!resposta.ok) {
      throw new Error(`Falha ao carregar pacote (${resposta.status})`);
    }
    const pacote = await resposta.json();

    // Monta a página inteira no cliente (mesma função do SSR)
    app.innerHTML = renderPacoteHTML(pacote, { prioridadeLcp: false });
    ligarBotaoReservar();
  } catch (erro) {
    console.error(erro);
    app.innerHTML = `<p class="erro">Não foi possível carregar o pacote.</p>`;
  }
}

iniciar();
