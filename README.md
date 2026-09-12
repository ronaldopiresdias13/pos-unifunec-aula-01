# Performance Lab — Catálogo de Eventos

Projeto estático em **HTML, CSS e JavaScript** criado para aula de Performance Web Avançada.

A aplicação contém alguns comportamentos propositalmente imperfeitos para que os alunos pratiquem **observação, diagnóstico e uso do Chrome DevTools antes de alterar o código**.

## Objetivo do laboratório

Escolha um percurso repetível, por exemplo:

> “Filtrar eventos de sábado e abrir um resultado.”

Depois:

1. Abra o Chrome DevTools.
2. Registre as condições do teste (rede, cache, dispositivo, navegador).
3. Repita o percurso pelo menos 3 vezes.
4. Separe **fato**, **hipótese** e **evidência**.
5. Use **Network**, **Performance** e **Lighthouse** para investigar.
6. Só depois proponha uma intervenção.

## Estrutura

- `index.html` — interface do catálogo
- `styles.css` — estilos
- `app.js` — comportamento e cenários do laboratório
- `data/events.json` — dados usados pela consulta
- `assets/` — imagens locais dos eventos
- `STUDENT_TASK.md` — atividade para os alunos

## Rodar localmente

O `fetch()` usado no projeto precisa de um servidor HTTP. Não abra apenas com duplo clique no `index.html`.

### Opção 1 — VS Code / Live Server

Instale a extensão **Live Server** e clique em **Open with Live Server**.

### Opção 2 — Python

```bash
python3 -m http.server 8080
```

Depois abra:

```text
http://localhost:8080
```

### Opção 3 — Node

```bash
npx serve .
```

## Publicar no GitHub Pages

1. Crie um repositório no GitHub.
2. Envie todos os arquivos deste projeto.
3. Abra **Settings > Pages**.
4. Em **Build and deployment**, escolha **Deploy from a branch**.
5. Selecione `main` e `/root`.
6. Salve e aguarde a URL do GitHub Pages.

## Importante

Este projeto é didático. Alguns atrasos e comportamentos foram inseridos de propósito e não representam boas práticas de produção.
