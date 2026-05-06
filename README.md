# Modelagem do Sistema: Farmácia Stock (PharmaStock)

## 1. Escopo do Produto e Escopo do Projeto

### 1.1 Escopo do Produto
O **Farmácia Stock** é um sistema web de gestão farmacêutica desenvolvido para otimizar os processos diários de uma drogaria. O produto final entrega um ambiente centralizado onde administradores e atendentes podem gerenciar o cadastro de clientes, funcionários, fornecedores e laboratórios. O núcleo do produto é o seu controle de estoque inteligente e gestão financeira, oferecendo módulos de movimentação de produtos, acompanhamento de validades, emissão de relatórios gerenciais e cálculo de fluxo de caixa (receitas vs. despesas) em tempo real.

### 1.2 Escopo do Projeto
O projeto consiste na idealização, prototipação e desenvolvimento completo de uma aplicação *Single Page Application (SPA)*. O escopo abrange o desenvolvimento do Front-end (HTML5, CSS3 Vanilla e JavaScript puro) e a estruturação de um Back-end minimalista em Python que atua como uma API RESTful local, garantindo a persistência de dados através da manipulação de arquivos JSON. Todo o design UI/UX foi idealizado com base em um tema "Minimalista de Coruja", exigindo a criação de componentes estilizados customizados, sem o uso de bibliotecas de terceiros como Bootstrap ou Tailwind.

---

## 2. Requisitos do Sistema

### 2.1 Requisitos Funcionais (RF)
* **RF01 - Autenticação e Autorização:** O sistema deve permitir o login seguro de funcionários cadastrados e de um usuário administrador mestre.
* **RF02 - Gestão de Pessoas e Entidades:** O sistema deve possuir operações de CRUD (Criar, Ler, Atualizar, Deletar/Inativar) para Clientes, Funcionários, Fornecedores e Laboratórios.
* **RF03 - Controle de Estoque:** O sistema deve permitir o cadastro de medicamentos/produtos, gerando alertas visuais automáticos para produtos com estoque mínimo atingido ou validades próximas.
* **RF04 - Movimentação de Estoque:** O sistema deve registrar entradas (compras) e saídas (vendas, avarias ou vencimentos), mantendo um histórico auditável.
* **RF05 - Relatórios Gerenciais e Financeiros:** O sistema deve calcular automaticamente as receitas e despesas baseadas nas movimentações, gerando relatórios filtráveis por período (ex: últimos 30 dias) com opção de impressão/exportação.

### 2.2 Requisitos Não Funcionais (RNF)
* **RNF01 - Arquitetura SPA (Single Page Application):** A navegação não deve recarregar a página web, promovendo uma transição fluida entre as telas utilizando injeção de HTML via JavaScript.
* **RNF02 - Tecnologia Front-end:** A interface deve ser desenvolvida aplicando estritamente os conceitos de **Programação de Internet 1** (HTML5 Semântico, CSS3 Flexbox/Grid e JavaScript Vanilla com manipulação do DOM).
* **RNF03 - Persistência de Dados (Portabilidade):** O banco de dados deve ser inteiramente baseado em arquivos `.json` gerenciados por um servidor nativo Python (`http.server`), garantindo total portabilidade do sistema via pen-drive sem necessidade de instalação de SGBDs pesados (ex: MySQL).
* **RNF04 - Usabilidade e Estética:** O sistema deve possuir alta legibilidade visual, com *feedback* imediato das ações (animações, hover states e *toasts/alerts*), além de utilizar paletas de cores confortáveis (Dark Mode parcial e tons azulados/premium).
* **RNF05 - Desempenho e Cache:** A aplicação deve garantir o carregamento da versão mais recente de seus *scripts* por meio de controle de versão (cache-busters via Query Strings).

---

## 3. A Interface (Protótipo e Programação de Internet 1)

A construção da interface foi fortemente baseada nas diretrizes fundamentais da disciplina de **Programação de Internet 1**, focando na tríade sagrada do desenvolvimento web:

### 3.1 Estruturação e Semântica (HTML5)
O sistema foi modularizado. O arquivo `index.html` atua como a porta de entrada (login), enquanto o `menu.html` serve como um esqueleto da SPA. Páginas internas (como `estoque.html` e `clientes.html`) consistem puramente de fragmentos (`<section>`, `<div>`, `<table>`) carregados via `fetch API`. O uso correto de atributos `aria-labels` e *tags* de cabeçalho (`<header>`, `<main>`, `<aside>`) foi mantido para acessibilidade estrutural.

### 3.2 Estilização e Design System (CSS3 Vanilla)
Para a interface gráfica, não foram utilizados *frameworks*. Toda a prototipação foi convertida em código CSS puro (`style.css` e arquivos CSS modulares para cada página).
* **Variáveis CSS (Custom Properties):** Utilizadas para padronização de cores e espaçamentos globais, facilitando a aplicação da identidade visual temática.
* **Flexbox e Grid Layout:** Adotados na construção do menu lateral (*sidebar*), disposição dos cartões (*cards* de KPI) de Relatórios, e estruturação formulários responsivos.
* **Micro-interações:** Implementação de `hover`, `transitions` e `box-shadow` dinâmicos (Glassmorphism) para trazer vida à interface e dar *feedback* tátil visual para o usuário.

### 3.3 Comportamento e Dinamismo (JavaScript DOM)
O cérebro da aplicação reside no uso do JavaScript para simular uma aplicação moderna:
* **Roteamento SPA:** O arquivo `script.js` intercepta os cliques do menu lateral, requisita o HTML da sub-página e a injeta no `innerHTML` do contêiner principal.
* **Fetch API e Assincronismo:** A comunicação com o Back-end Python ocorre inteiramente de forma assíncrona (`async/await`), processando os dados e construindo tabelas dinâmicas (`document.createElement`) utilizando manipulação direta do DOM.
* **Manipulação de Eventos:** Uso de *Event Listeners* delegados (`addEventListener`) para escutar formulários e cliques em botões (Ex: Máscaras de CPF em tempo real, expansão de detalhes em tabelas).

O protótipo final reflete exatamente os moldes acadêmicos requisitados: uma aplicação leve, responsiva, de código limpo, que não depende de "caixas pretas" oferecidas por grandes bibliotecas web contemporâneas.
