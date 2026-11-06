# Parte 1 — Matriz de decisão CSR × SSR × SSG

A mesma página não precisa nascer do mesmo jeito em todo produto. CSR, SSR e SSG mudam quatro coisas ao mesmo tempo: o que já vem no HTML, quando o LCP pode acontecer, o quanto de JavaScript é obrigatório e o quão fresco está o dado.

## Matriz

| Critério | CSR | SSR | SSG |
| --- | --- | --- | --- |
| HTML inicial com conteúdo | Não. A resposta é uma casca: cabeçalho, filtros e um espaço vazio. O conteúdo entra depois, pelo JavaScript. | Sim. O servidor monta o HTML com o conteúdo daquela request e envia a página pronta. | Sim. O HTML completo é gerado no build. O servidor só entrega o arquivo. |
| LCP esperado | O pior dos três. O elemento principal só é descoberto depois do download e da execução do JavaScript e, em geral, de um segundo request de dados. | Bom. Texto e imagem já estão no HTML, então o navegador começa cedo. O TTFB é maior que no SSG, porque existe render a cada request. | Em geral o melhor. O HTML já traz o conteúdo e o TTFB fica baixo, porque a resposta é um arquivo em CDN. |
| JavaScript necessário | Obrigatório para aparecer qualquer conteúdo. Sem JS, a página fica vazia. | Não é necessário para ler o conteúdo. É necessário para hidratar e ligar a interação. | Não é necessário para ler o conteúdo. Serve só para interação: filtro, ordenação, detalhe. |
| SEO e compartilhamento | Fraco. O crawler e o preview de link podem ver só a casca, sem título do conteúdo, texto ou imagem principal. | Forte. Título, texto e links estão no HTML da resposta, inclusive quando o dado muda por request. | Forte. O HTML entregue é o mesmo que foi gerado no build, então crawler e preview enxergam o conteúdo. |
| Dados atualizados | Frescos no momento do fetch, no cliente. Cada visita busca de novo. | Frescos a cada request. Preço, estoque ou uma notícia publicada agora entram na próxima resposta. | Congelados no build. Mudança de preço ou notícia nova só aparece depois de gerar de novo. |
| Custo de infraestrutura | Baixo. CDN entrega HTML, JS e dados estáticos. Não há render no servidor. | Mais alto. Cada visita gasta CPU para montar o HTML. Escala com o número de requests, não com o número de páginas geradas. | Baixo. O custo fica concentrado no build. A visita em si é leitura de arquivo na CDN. |
| Indicado para (cenários 1–6) | 4 e 5. No 6, só a área logada. | 2 e 3. No 6, a parte pública cujo dado muda o tempo todo. | 1. No 6, a parte pública que quase não muda. |

O cenário 6 aparece nas três colunas de propósito. Um site aberto com área logada não cabe numa estratégia só.

## Cenários

### 1. Landing page institucional

Conteúdo estável, com SEO e conversão. A página muda quando alguém edita o site, não a cada visita. **SSG**: o HTML já sai pronto, o LCP não espera JavaScript e o custo de servir é o de um arquivo estático.

### 2. E-commerce

Catálogo grande, preço e estoque mudam. SEO importa na página de produto, então CSR deixa o crawler na casca e ainda mostra preço velho se o HTML tiver sido gerado antes. SSG puro segura o preço até o próximo build. **SSR**: cada request lê preço e estoque atuais e devolve isso no HTML.

### 3. Portal de notícias

Entra matéria o tempo todo e o SEO é crítico. CSR atrasa o texto e enfraquece o compartilhamento. SSG puro deixa a home desatualizada entre builds. **SSR** publica a matéria na próxima request, com o texto já no HTML. Um rebuild contínuo (ISR) é uma variação de SSG para esse caso; na escolha entre as três estratégias puras, SSR é a que atende frescor e SEO juntos.

### 4. Painel administrativo

Muito interativo e fechado para usuários internos. Não há SEO, não há preview de link e o primeiro HTML não precisa carregar o dado de todo mundo. **CSR**: a casca carrega a aplicação, e os dados vêm autenticados depois do login.

### 5. Sistema autenticado

Cada usuário vê os próprios dados e a página não deve ser indexada. O HTML público não pode trazer esse conteúdo, nem no build nem numa resposta cacheada. **CSR**, com os dados buscados na sessão do usuário.

### 6. Público + privado

O miolo aberto (institucional, estável) fica em **SSG**. O que é público mas muda o tempo todo, como um preço na vitrine, fica em **SSR**. A área logada fica em **CSR**. São três respostas HTTP diferentes, não uma estratégia única para o site inteiro.
