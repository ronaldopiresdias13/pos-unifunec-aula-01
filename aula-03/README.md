# Aula 3 — CSR, SSR e SSG

Entrega na branch `davi-torelli`.

- [Parte 1](PARTE-1-matriz.md) — matriz CSR × SSR × SSG, com a estratégia de cada um dos seis cenários e a justificativa.
- [Parte 2](PARTE-2-analise.md) — a mesma página em CSR e SSG, comparando HTML inicial, waterfall, JavaScript, LCP e hydration.

SSR entra na matriz. Não há uma terceira aplicação: conteúdo estável se resolve no build, e um servidor renderizando a cada request seria outro processo.

## Gerar o build

```bash
node scripts/build.mjs
```

Saída:

- `dist/csr/` — HTML casca, `app.js` busca `data/events.json` e monta os cards
- `dist/ssg/` — HTML com os cards já escritos, `app.js` só liga filtro, ordenação e detalhe
- `dist/index.html` — atalho para as duas URLs

## Abrir

O `fetch` do CSR precisa de HTTP.

```bash
python3 -m http.server 4173 --directory dist --bind 127.0.0.1
```

- http://127.0.0.1:4173/csr/
- http://127.0.0.1:4173/ssg/

## Medir de novo

`node scripts/measure.mjs` sobe o `dist/` na porta 4173, roda o Lighthouse três vezes em cada URL e regrava `evidencias/`. Use a mesma porta livre e o mesmo Chrome.
