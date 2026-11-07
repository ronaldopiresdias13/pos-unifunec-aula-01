# Aula 3 — CSR, SSR e SSG

Entrega na branch `fabricio`.

- [Parte 1](PARTE-1-matriz.md) — matriz CSR × SSR × SSG e a estratégia de cada um dos seis cenários.
- [Parte 2](PARTE-2-analise.md) — o mesmo catálogo em CSR e em SSG, comparado por HTML inicial, waterfall, JavaScript, LCP e hydration.

SSR fica na matriz. Não há uma terceira aplicação: o catálogo não muda por request, então o HTML nasce no build. Um servidor renderizando a cada visita seria outro processo, sem mudar o dado.

## Gerar

Na raiz do repositório:

```bash
node aula-03/scripts/build.mjs
```

Saída:

- `aula-03/dist/csr/` — HTML casca. `app.js` busca `data/events.json` e cria os cards.
- `aula-03/dist/ssg/` — HTML com os 12 cards. `app.js` só liga filtro, ordenação e o detalhe.
- `aula-03/dist/index.html` — atalho para as duas.

As imagens continuam em `assets/` na raiz. Por isso o servidor HTTP tem de ser a raiz do repositório, não a pasta `dist`.

## Abrir

```bash
python3 -m http.server 4727 --bind 127.0.0.1
```

- http://127.0.0.1:4727/aula-03/dist/csr/
- http://127.0.0.1:4727/aula-03/dist/ssg/

Filtro, ordenação e **Ver detalhes** funcionam nas duas. Sábado devolve quatro eventos. Esporte na sexta devolve zero.

## Medir de novo

```bash
node aula-03/scripts/measure.mjs
```

O script sobe o repositório na porta 4727, abre o Chrome três vezes em cada URL e regrava `aula-03/evidencias/`.
