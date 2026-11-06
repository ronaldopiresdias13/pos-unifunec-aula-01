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
    É importante também para E-commerces, de forma híbrida, nas partes públicas como o feeds e páginas de produto, onde SEO é importante, mas não deve estar em locais que mostram valores frequentemente atualizados (plataformas como mercado livre evitam mostrar valores precisos e mostram "99+ restantes" para viabilizar   SSR). Pode ser usado com caches de longa duração.\
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
A aplicação está em /src/app-e-commerce-home-page e se trata de uma aplicação NextJs com duas páginas representando uma home page de e-commerce que exibe alguns produtos. Uma delas utilizando server rendering e a outra client rendering.\
Os produtos vem de um stub e foi adicionado um delay intencional de 200 milissegundos para simular uma busca no banco de dados.\
<img width="1475" height="702" alt="image" src="https://github.com/user-attachments/assets/af9fcebe-d917-458a-9733-67529c99b241" />
## SSR
- **HTML inicial**\
    O HTML inicial contém o conteúdo da página:\
    <img width="855" height="552" alt="image" src="https://github.com/user-attachments/assets/e77f8867-0f51-4eb4-b4d3-d9f788c728b4" />
- **Waterfall**\
    O carregamento da página ocupa todo o período de carregamento e começa imediatamente:\
    <img width="872" height="141" alt="image" src="https://github.com/user-attachments/assets/d0e8a146-99bd-48b3-9001-51c120553a4e" />
- **Javascript**\
    Devido a implementação do NextJs, são baixados vários arquivos javascript, mas nunca ocorre um fetch, de forma que os dados vem renderizados na página HTML.\
    <img width="1057" height="479" alt="image" src="https://github.com/user-attachments/assets/4df1d8b4-9c05-40d7-a790-fbc46128223e" />
    Carregamento sem cache:\
    <img width="1060" height="470" alt="image" src="https://github.com/user-attachments/assets/bd681eb2-b667-4d00-80b5-e50d75e0476c" />
- **LCP**\
    Métricas de performance com cache:\
    <img width="746" height="194" alt="image" src="https://github.com/user-attachments/assets/61d9c73c-a2aa-45b8-b2d8-57517d3e05c7" />
    Métricas de performance sem cache:\
    <img width="742" height="191" alt="image" src="https://github.com/user-attachments/assets/50b5139b-0803-4461-954c-04a9f2123d75" />
    Lighthouse Mobile:\
    <img width="396" height="133" alt="image" src="https://github.com/user-attachments/assets/67839e4f-dcd4-4099-abcd-c91e4906a5e8" />
    <img width="692" height="558" alt="image" src="https://github.com/user-attachments/assets/465cb929-740b-4453-a9f4-628be45b20a2" />
- **Hydration**\
    Não ocorrem erros de hydration. Em vez disso, erros ocorrem no servidor e a página inteira é enviada como erro interno caso não exista um tratamento no back-end:\
    <img width="1120" height="659" alt="image" src="https://github.com/user-attachments/assets/1359842d-df4f-40c2-8746-dbb084356ee4" />
## CSR
- **HTML inicial**\
    O HTML inicial não contém o conteúdo da página.\
    <img width="861" height="795" alt="image" src="https://github.com/user-attachments/assets/c11f6373-8a69-4696-971e-f8ffe0fb3ab7" />
- **Waterfall**\
    O arquivo HTML inicia o carregamento imediatamente:\
    <img width="504" height="106" alt="image" src="https://github.com/user-attachments/assets/9abad379-6a43-42cc-ab86-a9105b20ef36" />
    Mas o fetch dos dados da página ocorre somente no final do carregamento da página:\
    <img width="935" height="624" alt="image" src="https://github.com/user-attachments/assets/e3858da4-6170-47a6-98b1-7416c4fcaf0e" />
- **Javascript**\
    Vários arquivos JavaScript são baixados, ocorrendo no fim a requisição que busca os dados da página:\
    <img width="1063" height="518" alt="image" src="https://github.com/user-attachments/assets/1e347e2a-cdd4-4131-96c3-d850df1cbe71" />
    Sem cache:\
    <img width="1056" height="509" alt="image" src="https://github.com/user-attachments/assets/9b25c7d6-408e-407b-851d-ab9a0b44e5b5" />
- **LCP**\
    Métricas de performance com cache:\
    <img width="733" height="195" alt="image" src="https://github.com/user-attachments/assets/4c2e1e36-46ca-40a7-b1fc-173f24120957" />
    Métricas de performance sem cache:\
    <img width="743" height="213" alt="image" src="https://github.com/user-attachments/assets/2ad8465d-2c5b-45fe-a94d-2b3b231b1afe" />
    Lighthouse Mobile:\
    <img width="400" height="141" alt="image" src="https://github.com/user-attachments/assets/8c397054-3bcb-4f4c-aa51-4281e62b58a9" />
    <img width="669" height="561" alt="image" src="https://github.com/user-attachments/assets/65b9486e-5c1a-4bb7-97b7-e909c5a49cf8" />
- **Hydration**\
    <img width="1232" height="137" alt="image" src="https://github.com/user-attachments/assets/6f7d3bcf-00cd-47b2-88de-45eaefc4a8b5" />
    <img width="1052" height="76" alt="image" src="https://github.com/user-attachments/assets/b68c50c9-4768-4185-bcf5-a84d65bd3d9e" />
    <img width="424" height="118" alt="image" src="https://github.com/user-attachments/assets/5f220bfa-fd59-41d8-adb2-0cffe0570880" />
