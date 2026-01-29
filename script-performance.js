import http from "k6/http";
import { sleep, group } from "k6";
import { Trend } from 'k6/metrics'
import { checkStatus, getAuthToken } from "./helpers.js";

// Função simples para gerar número aleatório para username
function randomNumber() {
  return Math.floor(Math.random() * 1000000);
}



// Trends personalizados
const loginTrend = new Trend("login_duration");
const myLoansTrend = new Trend("my_loans_duration");

export const options = {
  stages: [
    { duration: "10s", target: 5 },   // ramp-up
    { duration: "30s", target: 30 },  // carga constante
    { duration: "10s", target: 0 },   // ramp-down
  ],
  thresholds: {
    http_req_duration: ["p(90)<=90", "p(95)<=100"],
    http_req_failed: ["rate<0.01"],
    login_duration: ["p(95)<200"],
    my_loans_duration: ["p(95)<200"],
  },
};

// Data-driven: permite rodar com diferentes usuários
const defaultPassword = __ENV.PASSWORD || "123456";

export default function () {
  // Geração dinâmica de usuário sem faker
  let username = `user_${randomNumber()}`;
  let password = defaultPassword;

  group("Cadastro de membro", function () {
    let res = http.post(
      "http://localhost:3000/members/register",
      JSON.stringify({ username, password, membershipType: "standard" }),
      { headers: { "Content-Type": "application/json" } }
    );
    if (!checkStatus(res, 201)) {
      console.error(`Falha ao cadastrar membro: ${res.status} - ${res.body}`);
      return; // Não prossegue se não cadastrou
    }
  });

  let responseMemberLogin;
  group("Fazendo login", function () {
    let start = Date.now();
    responseMemberLogin = http.post(
      "http://localhost:3000/members/login",
      JSON.stringify({ username, password }),
      { headers: { "Content-Type": "application/json" } }
    );
    loginTrend.add(Date.now() - start);
    if (!checkStatus(responseMemberLogin, 200)) {
      console.error(`Falha ao fazer login: ${responseMemberLogin.status} - ${responseMemberLogin.body}`);
      return;
    }
  });

  group("Listando meus empréstimos", function () {
    if (!responseMemberLogin || !getAuthToken(responseMemberLogin)) {
      console.error("Token de autenticação ausente. Pulando listagem de empréstimos.");
      return;
    }
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

  group("Simulando o pensamento do usuário", function () {
    sleep(1);
  });
}
