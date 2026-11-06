# Parte 1 - Modelo da matriz de decisão
## SSG
- **HTML inicial com conteúdo**\
Sim, contém todo o conteúdo no HTML inicial.
- **LCP esperado**\
O LCP é o mais rápido dos três, porque o arquvio é estático, não existe consultas em bancos de dados ou renderização.
- **JavaScript necessário**\
JavaScript não é necessário, a página pode ser feita completamente de HTML e CSS já que nenhuma requisição precisa ser feita dinamicamente.
- **SEO e compartilhamento**\
Funcional, porque robôs conseguem enxergar o conteúdo imediatamente.
- **Dados atualizados**\
A atualização dos dados significativamente dificultada, já que exige substituição de arquivos estáticos no servidor, os quais são sujeitos a várias camadas de cache na internet que não podem ser controladas pelo desenvolvedor.
- **Custo de infraestrutura**\
O custo mais baixo, não é necessário um back-end, apenas um servidor de arquivos.
- **Indicado para (cenários 1–6)**\
Ideal para landing pages e sites institucionais. O conteúdo é público e não muda constantemente.\
[1]
## SSR
- **HTML inicial com conteúdo**\
Sim, contém todo o conteúdo no HTML inicial
- **LCP esperado**\
Rápido. O navegador recebe a página pronta de uma vez só.
- **JavaScript necessário**\
Não é necessário. A página pode ser feita completamente de HTML e CSS já que nenhuma requisição precisa obrigatoriamente ser feita dinamicamente.
- **SEO e compartilhamento**\
Funcional. Robôs conseguem acessar a página e visualizar o conteúdo de imediato.
- **Dados atualizados**\
O conteúdo pode ser atualizado para cada requisição sem problemas.
- **Custo de infraestrutura**\
Alto. O servidor precisa renderizar o conteúdo em formato HTML. Soluções de caching se tornam necessárias rápido.
- **Indicado para (cenários 1–6)**\
Ideal para portais de notícia, de forma que o conteúdo é público (para todos ou para assinantes) e SEO é importante.\
É importante também para E-commerces, de forma híbrida, nas partes públicas como o feeds e páginas de produto, onde SEO é importante, mas não deve estar em locais que mostram valores frequentemente atualizados (plataformas como mercado livre evitam mostrar valores precisos e mostram "99+ restantes" para viabilizar SSR). Pode ser usado com caches de longa duração.\
Pode ser usado de forma híbrida para partes públicas de sites que tem área logada.\
[2, 3, 6]
## CSR
- **HTML inicial com conteúdo**\
Não contém conteúdo no HTML inicial, apenas esqueletos.
- **LCP esperado**\
Longo, recebe uma página vazia e depende do navegador baixar arquivos JavaScript antes de conseguir executar a busca do conteúdo.
- **JavaScript necessário**\
Sim, o JavaScript precisa ser baixado para realizar a busca dos conteúdos.
- **SEO e compartilhamento**\
SEO é dificultado, robôs de mecanismo de busca como Google atualmente conseguem visualizar conteúdo dinâmico, mas com menor prioridade devido ao alto consumo de recursos. Robôs mais simples não conseguem visualizar o conteúdo dinâmico ao todo.
- **Dados atualizados**\
Sim, os dados podem ser atualizados frequentemente. O uso de JavaScript permite o uso de websockets também para atualizações em tempo real sem pooling.
- **Custo de infraestrutura**\
É alto para o primeiro acesso, precisando entregar o HTML, JavaScript e realizar eventuais buscas no navegador. Após o primeiro acesso, se torna menor do que SSR devido ao conteúdo devolvido pelo servidor ser menor e não envolver renderização.
- **Indicado para (cenários 1–6)**\
Ideal para paineis administrativos e sites autenticados que não dependem de SEO. São sistemas onde o usuário acessa mais de uma vez, e a experiência do primeiro acesso não precisa ser tão rápida. O custo a longo prazo fica menor para ter conteúdo dinâmico, de forma que o HTML e JavaScript ficam no cache e o servidor retorna dados menores, sem renderização. São mais seguros em termos de complexidade para manter a segurança em termos de autenticação e cache.\
É importante para algumas partes de E-commerces, como partes que precisam de resposta em tempo real, verificação de estoque e pagamentos.\
Pode ser usado de forma híbrida para partes logadas de sites que tem áreas públicas.\
[2, 4, 5, 6]
# Parte 2 - Análise CSR × SSR/SSG
