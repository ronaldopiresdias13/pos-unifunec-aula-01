# Horizonte Verde — CSR × SSR

Página de detalhe do *Pacote Pantanal* em duas versões:

- **CSR** (Client-Side Rendering): HTML inicial quase vazio; o JavaScript busca a API e monta a página no navegador.
- **SSR** (Server-Side Rendering): o servidor devolve HTML completo; o JavaScript do cliente só faz *hydration* (liga o botão Reservar, sem refazer o fetch nem recriar o DOM).

Agência fictícia: **Horizonte Verde Turismo**.

---

## Como instalar e rodar

Requisito: **Node.js 20+**.

```bash
npm install
npm run prepare-hero   # baixa/gera public/img/hero.jpg (~200–400 KB), se ainda não existir
npm run build          # gera public/dist/csr.js e public/dist/ssr-hydrate.js (minificados)
npm start              # sobe o servidor em produção na porta 3000
```

Desenvolvimento (build + servidor):

```bash
npm run dev
```

Abra: [http://localhost:3000](http://localhost:3000)

---

## URLs

| Versão | URL |
|--------|-----|
| CSR | http://localhost:3000/csr/pacotes/pantanal |
| SSR | http://localhost:3000/ssr/pacotes/pantanal |
| API (JSON, atraso 300 ms) | http://localhost:3000/api/pacotes/pantanal |

Outros IDs disponíveis: `amazonia`, `chapada`, `jalapao`, `fernando`.

---

## Estrutura do projeto

```
atividade-aula-3/
├── package.json
├── server.js
├── README.md
├── data/
│   └── pacotes.json
├── scripts/
│   ├── build.js
│   └── prepare-hero.js
├── src/
│   ├── template.js      # HTML compartilhado + escape JSON + botão
│   ├── csr.js           # entrada CSR
│   └── ssr-hydrate.js   # entrada hydration SSR
└── public/
    ├── css/estilo.css
    ├── img/hero.jpg
    └── dist/            # gerado pelo build
        ├── csr.js
        └── ssr-hydrate.js
```

## Decisões técnicas

- Um único Express com compressão (`compression`) nas duas versões.
- API `/api/pacotes/:id` lê `data/pacotes.json` e espera **300 ms** sempre.
- Template único (`src/template.js`) usado pelo servidor (SSR) e pelo navegador (CSR).
- JSON embutido no SSR com escape de `<` → `\u003c` para não quebrar `</script>`.
- Hydration **não** usa `innerHTML` para recriar a página.
