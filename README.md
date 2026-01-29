# Sistema de Biblioteca Digital API

API completa para gerenciamento de biblioteca digital, cadastro de membros, catálogo de livros e sistema de empréstimos. Desenvolvida para fins educacionais e testes automatizados de APIs.

## Tecnologias
- Node.js
- Express.js
- GraphQL (Apollo Server)
- Swagger UI (documentação interativa)
- JWT (autenticação)
- bcryptjs (criptografia de senhas)
- Banco de dados em memória

## Instalação

1. Clone o repositório:
   ```sh
   git clone https://github.com/dennyscaetano/pgats-automacao-api-trabalho-final.git
   cd pgats-automacao-api-trabalho-final
   ```
2. Instale as dependências:
   ```sh
   npm install
   ```

## Como rodar

- Para iniciar o servidor REST:
  ```sh
  npm run start-rest
  ```
- Para iniciar o servidor GraphQL:
  ```sh
  npm run start-graphql
  ```
- API REST disponível em `http://localhost:3000`
- API GraphQL disponível em `http://localhost:4000/graphql`
- Documentação Swagger em `http://localhost:3000/api-docs`

## Endpoints principais

### Cadastro de membros
- `POST /members/register`
  - Body: `{ "username": "string", "password": "string", "membershipType": "standard|premium" }`

### Autenticação
- `POST /members/login`
  - Body: `{ "username": "string", "password": "string" }`

### Consulta de membros
- `GET /members`

### Catálogo de livros
- `GET /books` - Listar todos os livros
- `GET /books/search?q=termo` - Buscar livros
- `GET /books/{id}` - Detalhes de um livro

### Sistema de empréstimos
- `POST /loans/borrow` - Emprestar livro
  - Body: `{ "bookId": number, "days": number }`
- `POST /loans/return` - Devolver livro
  - Body: `{ "bookId": number }`
- `GET /loans` - Listar todos os empréstimos
- `GET /loans/my-loans` - Meus empréstimos
- `GET /loans/overdue` - Empréstimos em atraso

### GraphQL Types, Queries e Mutations

Rode `npm run start-graphql` para executar a API do GraphQL e acesse a URL http://localhost:4000/graphql para acessá-la.

- **Types:**
  - `Member`: username, membershipType, maxBooks, borrowedBooks
  - `Book`: id, title, author, isbn, available, category
  - `Loan`: id, memberUsername, bookId, bookTitle, borrowDate, dueDate, returnDate, status
- **Queries:**
  - `members`: lista todos os membros
  - `books`: lista todos os livros
  - `searchBooks(query)`: busca livros por termo
  - `loans`: lista todos os empréstimos (requer autenticação JWT)
  - `myLoans`: lista empréstimos do membro logado (requer autenticação JWT)
  - `overdueLoans`: lista empréstimos em atraso (requer autenticação JWT)
- **Mutations:**
  - `registerMember(username, password, membershipType)`: retorna Member
  - `loginMember(username, password)`: retorna token + Member
  - `borrowBook(bookId, days)`: retorna Loan (requer autenticação JWT)
  - `returnBook(bookId)`: retorna Loan (requer autenticação JWT)

## Regras de negócio
- Não é permitido cadastrar membros com nomes de usuário duplicados.
- Autenticação exige credenciais válidas.
- Membros standard podem emprestar até 3 livros simultaneamente.
- Membros premium podem emprestar até 5 livros simultaneamente.
- Período de empréstimo padrão é de 14 dias (máximo 30 dias).
- Um livro não pode ser emprestado se já estiver emprestado.
- Um membro não pode emprestar o mesmo livro duas vezes.
- Token JWT expira em 2 horas.


## Testes Automatizados

### Testes de API (Mocha)
- O arquivo `app.js` pode ser importado em ferramentas de teste como Supertest.
- Para testar a API GraphQL, importe `graphql/app.js` nos testes.
- Execute todos os testes automatizados:
  ```sh
  npm test
  ```

### Testes de Performance (k6)
Testes de performance são realizados com o [k6](https://k6.io/), uma ferramenta moderna para testes de carga.

#### Pré-requisitos
- Instale o k6 globalmente, se ainda não tiver:
  ```sh
  brew install k6
  # ou
  choco install k6
  # ou consulte https://k6.io/docs/getting-started/installation/
  ```

#### Executando o teste de performance
1. Certifique-se de que a API REST está rodando (`npm run start-rest`).
2. Execute o teste de performance:
   ```sh
   npm run k6:performance
   ```
   Isso executa o script localizado em `test/k6/script-performance.js`.

#### Gerando relatório resumido
Para exportar um resumo dos resultados em JSON:
```sh
npm run k6:performance:summary
```
O arquivo será salvo em `mochawesome-report/k6-summary.json`.


## Teste de Performance com K6 — Conceitos Aplicados

O script de performance está em `test/k6/script-performance.js` e utiliza os principais conceitos de testes de carga modernos:

### 1. Thresholds
Definidos em `options.thresholds` para garantir limites de tempo e taxa de erro:
```js
thresholds: {
  http_req_duration: ["p(90)<=90", "p(95)<=100"],
  http_req_failed: ["rate<0.01"],
  login_duration: ["p(95)<200"],
  my_loans_duration: ["p(95)<200"],
},
```

### 2. Checks
Validações de status HTTP usando helpers:
```js
import { checkStatus } from "./helpers.js";
checkStatus(res, 201);
checkStatus(responseMemberLogin, 200);
```

### 3. Helpers
Funções utilitárias em `test/k6/helpers.js` para checks e extração de token:
```js
export function checkStatus(response, expectedStatus = 200) { ... }
export function getAuthToken(response) { ... }
```

### 4. Trends
Métricas customizadas de tempo de resposta:
```js
const loginTrend = new Trend("login_duration");
loginTrend.add(Date.now() - start);
```

### 5. Geração dinâmica de dados (sem faker)
O script utiliza uma função simples para gerar usernames únicos a cada execução, garantindo testes data-driven sem dependências externas:
```js
// Geração dinâmica de usuário sem faker
function randomNumber() {
  return Math.floor(Math.random() * 1000000);
}
let username = `user_${randomNumber()}`;
```

### Exemplo comentado do script de performance
O arquivo `test/k6/script-performance.js` demonstra o uso de vários conceitos do k6, como Groups, Trends, helpers e autenticação:

```js
import http from "k6/http";
import { sleep, group } from "k6";
import { Trend } from 'k6/metrics';
import { checkStatus, getAuthToken } from "./helpers.js";

// Função para gerar usernames únicos
function randomNumber() {
  return Math.floor(Math.random() * 1000000);
}

const loginTrend = new Trend("login_duration");
const myLoansTrend = new Trend("my_loans_duration");

export default function () {
  // Group: Cadastro de membro
  let username = `user_${randomNumber()}`;
  let password = "123456";
  group("Cadastro de membro", function () {
    let res = http.post(
      "http://localhost:3000/members/register",
      JSON.stringify({ username, password, membershipType: "standard" }),
      { headers: { "Content-Type": "application/json" } }
    );
    checkStatus(res, 201);
  });

  // Group: Login do membro
  let responseMemberLogin;
  group("Fazendo login", function () {
    let start = Date.now();
    responseMemberLogin = http.post(
      "http://localhost:3000/members/login",
      JSON.stringify({ username, password }),
      { headers: { "Content-Type": "application/json" } }
    );
    loginTrend.add(Date.now() - start);
    checkStatus(responseMemberLogin, 200);
  });

  // Group: Listando meus empréstimos
  group("Listando meus empréstimos", function () {
    let start = Date.now();
    let responseBorrowLoans = http.get(
      "http://localhost:3000/loans/my-loans",
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAuthToken(responseMemberLogin)}`,
        },
      }
    );
    myLoansTrend.add(Date.now() - start);
    checkStatus(responseBorrowLoans, 200);
  });
}
```

**Explicação dos principais pontos:**
- `group(...)`: organiza o teste em blocos lógicos, facilitando a leitura e análise dos resultados.
- `checkStatus(...)`: helper importado de outro arquivo, usado para validar o status HTTP das respostas.
- `Trend`: coleta métricas customizadas de tempo de resposta para login e listagem de empréstimos.
- `getAuthToken(...)`: helper para extrair o token JWT da resposta de login e reutilizar em requisições autenticadas.
- Geração dinâmica de dados: usernames únicos a cada execução, simulando múltiplos usuários reais.

### 6. Variável de Ambiente
Permite customizar a senha via `__ENV.PASSWORD`:
```js
const defaultPassword = __ENV.PASSWORD || "123456";
```

### 7. Stages
Configuração de ramp-up, carga e ramp-down:
```js
stages: [
  { duration: "10s", target: 5 },
  { duration: "30s", target: 30 },
  { duration: "10s", target: 0 },
],
```

### 8. Reaproveitamento de Resposta
O token de login é reaproveitado para requisições autenticadas:
```js
Authorization: `Bearer ${getAuthToken(responseMemberLogin)}`
```

### 9. Uso de Token de Autenticação
Obtido no login e usado nos headers:
```js
Authorization: `Bearer ${getAuthToken(responseMemberLogin)}`
```

### 10. Data-Driven Testing
Usuários são gerados dinamicamente a cada execução:
```js
let username = `user_${faker.random.number()}`;
```

### 11. Groups
Organização dos cenários de teste:
```js
group("Cadastro de membro", ...)
group("Fazendo login", ...)
group("Listando meus empréstimos", ...)
```

---

