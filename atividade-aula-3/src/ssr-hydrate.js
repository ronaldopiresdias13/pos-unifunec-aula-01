/**
 * Entrada do bundle de hydration (SSR).
 *
 * O servidor já enviou o HTML completo do pacote. Aqui NÃO recriamos a página
 * com innerHTML: apenas lemos o JSON embutido e ligamos o evento do botão.
 * Assim o DOM do servidor é reaproveitado (hydration).
 */
import { ligarBotaoReservar } from "./template.js";

function lerDadosEmbutidos() {
  const el = document.getElementById("dados");
  if (!el) {
    console.warn("[hydration] Elemento #dados não encontrado.");
    return null;
  }

  // textContent já contém o JSON escapado (\u003c etc.); JSON.parse interpreta
  // as sequências Unicode corretamente.
  try {
    return JSON.parse(el.textContent);
  } catch (erro) {
    console.error("[hydration] Falha ao ler JSON embutido:", erro);
    return null;
  }
}

function hidratar() {
  const dados = lerDadosEmbutidos();

  if (!dados) {
    console.warn("[hydration] Sem dados — interação pode não funcionar.");
    return;
  }

  // Conferência leve: o h1 do servidor deve bater com o nome do JSON.
  // Não alteramos o markup; só validamos para detectar inconsistências.
  const h1 = document.querySelector("h1");
  if (h1 && h1.textContent !== dados.nome) {
    console.warn(
      "[hydration] Divergência entre HTML do servidor e JSON embutido.",
      { html: h1.textContent, json: dados.nome }
    );
  }

  // Hydration de fato: só liga o comportamento ao DOM já existente
  ligarBotaoReservar();
  console.info("[hydration] Concluída — botão Reservar interativo.");
}

hidratar();
