# Parte 1 · Matriz de decisão (CSR × SSR × SSG)

## Matriz CSR × SSR × SSG

| Critério | CSR | SSR | SSG |
|---|---|---|---|
| HTML inicial com conteúdo | Quase vazio: o JS monta o HTML no navegador | HTML completo gerado e enviado pelo servidor a cada request | HTML completo já gerado no build (arquivo estático) |
| LCP esperado | Pior: espera JS + fetch + render | Bom: conteúdo chega no primeiro HTML | Melhor: HTML estático rápido (CDN) |
| JavaScript necessário | Obrigatório para ver conteúdo | Necessário só para hidratação/interatividade | Opcional ou mínimo (páginas estáticas) |
| SEO e compartilhamento | Fraco (bots/previews veem pouco) | Bom (HTML com conteúdo na resposta) | Excelente (HTML estático indexável) |
| Dados atualizados | Em tempo real (fetch no cliente) | Sempre atualizados (render na request) | Desatualizados até novo build |
| Custo de infraestrutura | Baixo (host estático + API) | Mais alto (servidor Node a cada request) | Baixo (CDN/arquivos estáticos) |
| Indicado para (cenários 1–6) | 4 e 5 | 2, 3 e parte de 6 | 1 e parte pública de 6 |

---

## Estratégia escolhida e justificativa por cenário

### 1. Landing page institucional
Conteúdo estável, foco em SEO e conversão.

- **Estratégia:** SSG
- **Justificativa:** O conteúdo muda pouco, então gerar HTML no build e servir via CDN entrega LCP excelente, SEO forte e custo baixo. Não há ganho real em renderizar a cada request.

### 2. E-commerce
Catálogo grande, preço e estoque mudam.

- **Estratégia:** SSR
- **Justificativa:** Preço e estoque mudam com frequência, então o HTML precisa ser gerado a cada request com dados atualizados. O SSR mantém SEO e compartilhamento bons, sem o risco de páginas estáticas desatualizadas.

### 3. Portal de notícias
Conteúdo novo o tempo todo, SEO crítico.

- **Estratégia:** SSR (com cache/CDN quando possível)
- **Justificativa:** Notícias novas precisam aparecer rápido e com HTML completo para indexação e compartilhamento. SSR entrega conteúdo fresco; cache curto reduz custo sem sacrificar SEO.

### 4. Painel administrativo
Muito interativo, só para usuários internos.

- **Estratégia:** CSR
- **Justificativa:** Não precisa de SEO nem de HTML inicial indexável. A prioridade é interatividade e estado no cliente; um SPA/CSR reduz complexidade de servidor e atende bem usuários autenticados internos.

### 5. Sistema autenticado
Dados de cada usuário, sem SEO.

- **Estratégia:** CSR
- **Justificativa:** O conteúdo é personalizado e privado, então pré-gerar ou indexar não faz sentido. O cliente busca os dados após login; CSR evita renderizar HTML sensível no servidor para crawlers e simplifica a entrega.

### 6. Público + privado
Site aberto com área logada.

- **Estratégia:** Híbrida (SSG/SSR no público + CSR no privado)
- **Justificativa:** Rotas públicas (home, blog, marketing) usam SSG ou SSR para SEO e performance; a área logada usa CSR, pois é interativa, personalizada e sem necessidade de indexação.