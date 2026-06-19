// URL base da API — vem do arquivo .env (VITE_API_URL)
const BASE_URL = import.meta.env.VITE_API_URL

// Monta os headers com o token JWT salvo no localStorage
// Usado em todas as rotas protegidas (que exigem login)
function headersAuth() {
  const token = localStorage.getItem("token")
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  }
}

// Lê a resposta e lança erro se o status não for 2xx
// Usa .text() primeiro para evitar erro em respostas com body vazio
async function tratarResposta(resposta) {
  const texto = await resposta.text()
  const dados = texto ? JSON.parse(texto) : {}

  if (!resposta.ok) {
    throw new Error(dados.mensagem || `Erro ${resposta.status}`)
  }
  return dados
}

// ─── AUTENTICAÇÃO ────────────────────────────────────────────────────────────

// Faz login — rota pública, não precisa de token
// POST /membros/login → retorna { token }
export async function login(email, senha) {
  const resposta = await fetch(`${BASE_URL}/membros/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, senha }),
  })
  return tratarResposta(resposta)
}

// ─── MEMBROS ─────────────────────────────────────────────────────────────────

// Lista todos os membros — GET /membros
export async function listarMembros() {
  const resposta = await fetch(`${BASE_URL}/membros`, {
    headers: headersAuth(),
  })
  return tratarResposta(resposta)
}

// Cadastra novo membro — POST /membros
// dados: { nome, email, senha, cargo, data_nascimento, telefone? }
export async function cadastrarMembro(dados) {
  const resposta = await fetch(`${BASE_URL}/membros`, {
    method: "POST",
    headers: headersAuth(),
    body: JSON.stringify(dados),
  })
  return tratarResposta(resposta)
}

// Atualiza parcialmente um membro — PATCH /membros/:id
export async function atualizarMembro(id, dados) {
  const resposta = await fetch(`${BASE_URL}/membros/${id}`, {
    method: "PATCH",
    headers: headersAuth(),
    body: JSON.stringify(dados),
  })
  return tratarResposta(resposta)
}

// Remove um membro — DELETE /membros/:id
export async function deletarMembro(id) {
  const resposta = await fetch(`${BASE_URL}/membros/${id}`, {
    method: "DELETE",
    headers: headersAuth(),
  })
  return tratarResposta(resposta)
}

// ─── EVENTOS ─────────────────────────────────────────────────────────────────

// Lista todos os eventos — GET /eventos
export async function listarEventos() {
  const resposta = await fetch(`${BASE_URL}/eventos`, {
    headers: headersAuth(),
  })
  return tratarResposta(resposta)
}

// Cadastra novo evento — POST /eventos
// dados: { nome_evento, data_evento (YYYY-MM-DD HH:MM), local_evento, limite_membros? }
export async function cadastrarEvento(dados) {
  const resposta = await fetch(`${BASE_URL}/eventos`, {
    method: "POST",
    headers: headersAuth(),
    body: JSON.stringify(dados),
  })
  return tratarResposta(resposta)
}
