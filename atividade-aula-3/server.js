import compression from "compression";
import express from "express";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  escapeJsonForScript,
  renderPacoteHTML,
} from "./src/template.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORTA = Number(process.env.PORT) || 3000;
const ATRASO_API_MS = 300; // atraso artificial idêntico nas duas versões

const pacotes = JSON.parse(
  readFileSync(join(__dirname, "data", "pacotes.json"), "utf8")
);

const app = express();

// Compressão ativada nas duas versões (mesmo middleware, mesma config)
app.use(compression());

// Arquivos estáticos com headers de cache iguais para CSR e SSR
app.use(
  express.static(join(__dirname, "public"), {
    etag: true,
    lastModified: true,
    setHeaders(res, caminho) {
      if (caminho.endsWith(".html")) {
        res.setHeader("Cache-Control", "no-cache");
        return;
      }
      // CSS, JS e imagens: cache curto para medições previsíveis
      res.setHeader("Cache-Control", "public, max-age=60");
    },
  })
);

function buscarPacote(id) {
  return pacotes.find((p) => p.id === id) || null;
}

function atrasar(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * API JSON — usada pelo navegador no CSR e pelo próprio servidor no SSR.
 * Sempre aplica o mesmo atraso de 300 ms.
 */
app.get("/api/pacotes/:id", async (req, res) => {
  await atrasar(ATRASO_API_MS);

  const pacote = buscarPacote(req.params.id);
  if (!pacote) {
    res.status(404).json({ erro: "Pacote não encontrado" });
    return;
  }

  res.setHeader("Cache-Control", "no-store");
  res.json(pacote);
});

/** Documento HTML “casco” da versão CSR */
app.get("/csr/pacotes/:id", (req, res) => {
  const id = req.params.id;
  if (!buscarPacote(id)) {
    res.status(404).type("html").send(paginaErro("Pacote não encontrado"));
    return;
  }

  res.setHeader("Cache-Control", "no-cache");
  res.type("html").send(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Pacote — Horizonte Verde (CSR)</title>
  <link rel="stylesheet" href="/css/estilo.css" />
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/dist/csr.js"></script>
</body>
</html>`);
});

/**
 * Versão SSR: busca os dados (mesmo atraso da API) e devolve HTML completo.
 * Embutimos o JSON em <script id="dados"> para a hydration no cliente.
 */
app.get("/ssr/pacotes/:id", async (req, res) => {
  await atrasar(ATRASO_API_MS);

  const pacote = buscarPacote(req.params.id);
  if (!pacote) {
    res.status(404).type("html").send(paginaErro("Pacote não encontrado"));
    return;
  }

  const htmlPacote = renderPacoteHTML(pacote, { prioridadeLcp: true });
  const jsonSeguro = escapeJsonForScript(pacote);

  res.setHeader("Cache-Control", "no-cache");
  res.type("html").send(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeAttr(pacote.nome)} — Horizonte Verde (SSR)</title>
  <link rel="stylesheet" href="/css/estilo.css" />
</head>
<body>
  <div id="app">
${htmlPacote}
  </div>
  <!-- JSON escapado (\u003c) para não quebrar com </script> no conteúdo -->
  <script id="dados" type="application/json">${jsonSeguro}</script>
  <script type="module" src="/dist/ssr-hydrate.js"></script>
</body>
</html>`);
});

app.get("/", (_req, res) => {
  res.type("html").send(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>CSR × SSR — Performance Web</title>
  <link rel="stylesheet" href="/css/estilo.css" />
</head>
<body class="pagina-indice">
  <main class="conteudo">
    <h1>Comparação CSR × SSR</h1>
    <p>Atividade de Performance Web — Pacote Pantanal</p>
    <ul>
      <li><a href="/csr/pacotes/pantanal">Versão CSR</a></li>
      <li><a href="/ssr/pacotes/pantanal">Versão SSR</a></li>
      <li><a href="/api/pacotes/pantanal">API JSON</a></li>
    </ul>
  </main>
</body>
</html>`);
});

function paginaErro(mensagem) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Erro</title>
  <link rel="stylesheet" href="/css/estilo.css" />
</head>
<body>
  <main class="conteudo"><p class="erro">${escapeAttr(mensagem)}</p></main>
</body>
</html>`;
}

function escapeAttr(texto) {
  return String(texto)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

app.listen(PORTA, () => {
  console.log(`Servidor em http://localhost:${PORTA}`);
  console.log(`  CSR → http://localhost:${PORTA}/csr/pacotes/pantanal`);
  console.log(`  SSR → http://localhost:${PORTA}/ssr/pacotes/pantanal`);
});
