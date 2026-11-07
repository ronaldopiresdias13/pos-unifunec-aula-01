# Parte 1 — Matriz de decisão CSR × SSR × SSG

A escolha não é qual estratégia é mais moderna. É o que a primeira resposta HTTP precisa conter, com que frequência o dado muda, e se alguém além do usuário logado precisa ler essa página.

## Matriz

| Critério | CSR | SSR | SSG |
| --- | --- | --- | --- |
| HTML inicial com conteúdo | Não. A resposta é a casca: título, filtros e uma área vazia. O dado chega num segundo request e o JavaScript monta os elementos. | Sim. O servidor lê o dado daquela request e devolve o HTML já preenchido. | Sim. O HTML completo é gravado no build. A visita só lê o arquivo. |
| LCP esperado | O mais tardio. O elemento principal só existe depois do download do script, da execução e, em geral, do fetch de dados. | Cedo para o conteúdo, com TTFB maior que o do arquivo estático, porque cada request gasta tempo montando a página. | Em geral o mais cedo. O navegador descobre texto e imagem no primeiro HTML, e a CDN responde como arquivo. |
| JavaScript necessário | Obrigatório para aparecer qualquer conteúdo. Sem o script, a página fica na casca. | Não é necessário para ler. É necessário para hidratar e ligar o que depende de clique, filtro ou estado. | Não é necessário para ler. O script só liga a interação que o HTML sozinho não faz. |
| SEO e compartilhamento | Fraco. Crawler simples e preview de link enxergam a casca, sem o título do conteúdo nem a imagem principal. | Forte, inclusive quando o dado muda por request: o HTML da resposta já tem título, texto e links. | Forte para o que foi gerado. Preview e crawler veem o mesmo HTML do build. |
| Dados atualizados | Frescos no momento do fetch no cliente. Cada visita pode buscar de novo. | Frescos a cada request. Preço, estoque ou uma matéria publicada agora entram na próxima resposta. | Congelados no build. Mudança só aparece depois de gerar e publicar de novo. |
| Custo de infraestrutura | Baixo para servir: CDN entrega HTML, script e JSON. O custo de montar a página vai para o aparelho de quem visita. | Alto. Cada visita gasta CPU no servidor. O custo cresce com o número de requests. | Baixo na visita. O custo fica no build, não em cada abertura da página. |
| Indicado para (cenários 1–6) | 4 e 5. No 6, a área logada. | 2 e 3. No 6, a parte pública cujo dado muda o tempo todo. | 1. No 6, a parte pública que quase não muda. |

O cenário 6 não cabe numa coluna só. São três respostas HTTP diferentes.

## Cenários

### 1. Landing page institucional

O texto muda quando alguém edita o site, não a cada visita. SEO e a primeira pintura importam, e não há dado por usuário. **SSG**: o HTML já sai pronto, o LCP não espera JavaScript e servir a página é entregar um arquivo.

### 2. E-commerce

A página de produto precisa ser indexada, e preço e estoque mudam fora do ciclo de build. CSR entrega a casca para o crawler e ainda pode mostrar um número que o cliente só descobre depois do fetch. SSG segura o preço até o próximo build. **SSR**: a request lê o valor atual e devolve esse valor dentro do HTML.

### 3. Portal de notícias

Entra matéria o tempo todo e o texto é o produto, inclusive no compartilhamento. CSR atrasa a matéria e enfraquece o preview. SSG puro deixa a home velha entre um build e outro. **SSR** publica a matéria na próxima request, com o texto já no HTML. Regenerar em intervalo curto é uma variação de SSG; entre as três estratégias puras, SSR é a que junta frescor e HTML completo.

### 4. Painel administrativo

A tela é uma ferramenta: muita interação, nenhum preview de link, nenhum crawler. O primeiro HTML não precisa trazer o dado de todos os usuários. **CSR**: a casca sobe a aplicação e os dados vêm depois, na sessão de quem está logado.

### 5. Sistema autenticado

Cada pessoa vê os próprios dados, e essa página não deve ser indexada nem cacheada como HTML público. Colocar o conteúdo no build, ou numa resposta cacheada, vazaria ou mostraria o dado de outra pessoa. **CSR**, com o dado buscado na sessão.

### 6. Público + privado

O miolo aberto e estável, como a página institucional, fica em **SSG**. O que é público e muda o tempo todo, como o preço na vitrine, fica em **SSR**. A área logada fica em **CSR**. Um site com os dois lados não escolhe uma estratégia para o domínio inteiro.
