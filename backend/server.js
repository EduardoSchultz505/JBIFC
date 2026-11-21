import path from "node:path";
import dns from "node:dns";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { randomUUID } from "node:crypto";
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { avaliarConquistas, validarResumo } from "./conquistas.js";
import BancoRateLimitStore from "./rateLimitStore.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, ".env"), quiet: true });

const PORT = process.env.PORT || 5000;
const SUPABASE_URL = process.env.SUPABASE_URL?.replace(/\/$/, "");
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY?.trim();
const JWT_SECRET = process.env.JWT_SECRET?.trim();
const JWT_EXPIRACAO = process.env.JWT_EXPIRACAO || "24h";


const ORIGENS_PERMITIDAS = (process.env.FRONTEND_URL || "http://localhost:5173,http://127.0.0.1:5173")
  .split(",")
  .map((o) => o.trim().replace(/\/$/, ""))
  .filter(Boolean);


if (!JWT_SECRET) {
  console.error("[Auth] JWT_SECRET não está configurada. Defina a variável antes de iniciar o servidor.");
  process.exit(1);
}
if (JWT_SECRET.length < 32) {
  console.error("[Auth] JWT_SECRET precisa ter pelo menos 32 caracteres aleatórios.");
  process.exit(1);
}

// Login aceita qualquer letra (contas antigas). Cadastro novo só aceita letras latinas,
// o que bloqueia homóglifos de outros alfabetos (ex.: "а" cirílico no lugar de "a").
const USUARIO_VALIDO = /^[\p{L}\p{N}_-]{3,20}$/u;
const USUARIO_NOVO = /^[\p{Script=Latin}0-9_-]{3,20}$/u;
const NOMES_RESERVADOS = new Set([
  "admin", "administrador", "administrator", "root", "sistema", "suporte",
  "moderador", "professor", "prof", "jbifc", "ifc", "mosquito",
]);
const BCRYPT_CUSTO = 12;
// Prova de tempo: uma partida termina com 3 derrotas e cada rodada leva, no mínimo,
// 3,5 s de instrução (instrucao.js) + 0,9 s de feedback (partida.js). Usamos 4 s por folga.
const VIDAS_INICIAIS = 3;
const SEGUNDOS_MINIMOS_POR_RODADA = 4;
const DURACAO_MAXIMA_PARTIDA_S = 6 * 60 * 60;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const PONTOS_POR_NIVEL = 5; // mesmo valor de PONTOS_PARA_AUMENTAR_NIVEL em partida.js
const INT_MAX = 2147483647;
const LIMITE_RANKING_MAX = 100;


const HASH_FALSO = bcrypt.hashSync("senha-falsa-para-igualar-o-tempo", BCRYPT_CUSTO);



const escaparLike = (texto) => texto.replace(/[\\%_]/g, "\\$&");

const app = express();
app.disable("x-powered-by");
app.set("trust proxy", 1);

// Cabeçalhos de segurança da API (sem dependência extra)
app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Content-Security-Policy", "default-src 'none'; frame-ancestors 'none'");
  res.setHeader("Cross-Origin-Resource-Policy", "same-origin");
  res.setHeader("Strict-Transport-Security", "max-age=15552000");
  res.setHeader("Cache-Control", "no-store");
  next();
}); 

function buildSupabaseHeaders({ useServiceRole = true } = {}) {
  const apiKey = useServiceRole
    ? SUPABASE_SERVICE_ROLE_KEY
    : SUPABASE_ANON_KEY || SUPABASE_SERVICE_ROLE_KEY;

  if (!apiKey) {
    throw new Error("Chave do Supabase não configurada. Defina SUPABASE_SERVICE_ROLE_KEY (backend) e SUPABASE_ANON_KEY (opcional) em .env.");
  }

  return {
    "Content-Type": "application/json",
    apikey: apiKey,
    Authorization: `Bearer ${apiKey}`,
    Prefer: "return=representation",
  };
}

async function diagnosticarSupabase() {
  const diagnostico = {
    host: SUPABASE_URL ? new URL(SUPABASE_URL).hostname : null,
    dns: null,
    http: null,
    serviceRoleConfigured: Boolean(SUPABASE_SERVICE_ROLE_KEY),
  };

  if (!SUPABASE_URL) {
    diagnostico.dns = { status: "sem_url" };
    diagnostico.http = { status: "sem_url" };
    return diagnostico;
  }

  try {
    const resultado = await dns.promises.lookup(diagnostico.host);
    diagnostico.dns = { status: "resolvido", address: resultado.address };
  } catch (erro) {
    diagnostico.dns = { status: "nao_resolve", code: erro.code || erro.name, message: erro.message };
    return diagnostico;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const resposta = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      headers: buildSupabaseHeaders({ useServiceRole: true }),
      signal: controller.signal,
    });
    diagnostico.http = { status: resposta.status, ok: resposta.ok };
  } catch (erro) {
    diagnostico.http = { status: "falha_conexao", message: erro.message, code: erro.code || erro.name };
  } finally {
    clearTimeout(timeout);
  }

  return diagnostico;
}

async function supabaseFetch(table, { method = "GET", query = "", body = null, useServiceRole = true, prefer } = {}) {
  if (!SUPABASE_URL) {
    throw new Error("SUPABASE_URL não configurada.");
  }

  const url = query ? `${SUPABASE_URL}/rest/v1/${table}?${query}` : `${SUPABASE_URL}/rest/v1/${table}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const headers = buildSupabaseHeaders({ useServiceRole });
    // prefer: undefined mantém o padrão, null remove o cabeçalho, string substitui
    if (method === "GET" || prefer === null) delete headers.Prefer;
    else if (prefer) headers.Prefer = prefer;

    const response = await fetch(url, {
      method,
      headers,
      body: body === null || body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    });

    const texto = await response.text();
    let payload = null;

    if (texto) {
      try {
        payload = JSON.parse(texto);
      } catch {
        payload = texto;
      }
    }

    if (!response.ok) {
      const mensagem = typeof payload === "object" && payload !== null
        ? payload.message || payload.error || JSON.stringify(payload)
        : payload || "Erro ao acessar o Supabase.";
      throw new Error(`Supabase ${table}: ${mensagem}`);
    }

    return payload;
  } finally {
    clearTimeout(timeout);
  }
}

app.use(cors({ origin: ORIGENS_PERMITIDAS, methods: ["GET", "POST"] }));
app.use(express.json({ limit: "10kb" }));

// CSRF: pedidos que alteram dados só valem se vierem do próprio site. Navegadores modernos
// enviam Sec-Fetch-Site; os mais antigos caem na checagem do Origin. Clientes sem navegador
// (curl, testes) não mandam nenhum dos dois e não são alvo desse tipo de ataque.
app.use((req, res, next) => {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next();

  const site = req.get("sec-fetch-site");
  if (site === "same-origin" || site === "none") return next();

  const origem = req.get("origin");
  if (!site && !origem) return next();

  let hostOrigem = null;
  try {
    hostOrigem = new URL(origem).host;
  } catch {
    // origem ausente ou "null"
  }
  if (origem && (hostOrigem === req.get("host") || ORIGENS_PERMITIDAS.includes(origem))) {
    return next();
  }
  return res.status(403).json({ erro: "Origem não permitida." });
});



const mensagemLimite = (erro) => ({ erro });

// Limitadores sensíveis guardam a contagem no Supabase (a memória não é compartilhada
// entre as instâncias da Vercel). O limite geral continua em memória, para não custar
// uma ida ao banco em toda requisição.
const limitadorComBanco = (prefixo, opcoes) =>
  rateLimit({
    ...opcoes,
    store: new BancoRateLimitStore({
      prefixo,
      chamarRpc: (nome, corpo) =>
        supabaseFetch(`rpc/${nome}`, { method: "POST", body: corpo, prefer: null }),
    }),
  });

const limiteGeral = rateLimit({
  windowMs: 60 * 1000,
  limit: 120,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: mensagemLimite("Muitas requisições. Aguarde um instante."),
});


const limiteLogin = limitadorComBanco("login", {
  windowMs: 15 * 60 * 1000,
  limit: 20,
  skipSuccessfulRequests: true,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: mensagemLimite("Muitas tentativas de login. Tente de novo em alguns minutos."),
});

// Por conta: segura força bruta distribuída (vários IPs contra o mesmo usuário)
const limiteLoginConta = limitadorComBanco("login-conta", {
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  keyGenerator: (req) => `c:${String(req.body?.usuario ?? "").trim().toLowerCase().slice(0, 40)}`,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: mensagemLimite("Muitas tentativas para esta conta. Tente de novo em alguns minutos."),
});

const limiteCadastro = limitadorComBanco("cadastro", {
  windowMs: 60 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: mensagemLimite("Muitos cadastros deste endereço. Tente mais tarde."),
});

// Perfil público: limite menor para dificultar a varredura de nomes
const limitePerfil = rateLimit({
  windowMs: 60 * 1000,
  limit: 30,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: mensagemLimite("Muitas consultas de perfil. Aguarde um instante."),
});

// Envio de pontuação: limite por usuário (não por IP), só roda depois de autenticar
const chaveUsuario = (req) => `u:${req.usuario?.id ?? "anon"}`;

const limitePontuacaoCurto = limitadorComBanco("pontuacao-curto", {
  windowMs: 10 * 1000,
  limit: 1,
  keyGenerator: chaveUsuario,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: mensagemLimite("Aguarde alguns segundos antes de enviar outra partida."),
});

const limitePontuacaoHora = limitadorComBanco("pontuacao-hora", {
  windowMs: 60 * 60 * 1000,
  limit: 100,
  keyGenerator: chaveUsuario,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: mensagemLimite("Muitas partidas enviadas nesta hora. Tente mais tarde."),
});

const limitePartidaNova = limitadorComBanco("partida-nova", {
  windowMs: 60 * 1000,
  limit: 10,
  keyGenerator: chaveUsuario,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: mensagemLimite("Muitas partidas iniciadas. Aguarde um instante."),
});

app.use(limiteGeral);

app.get("/api/health", async (_req, res) => {
  try {
    await supabaseFetch("jogadores", { query: "select=id&limit=1" });
    res.json({ banco: "ok" });
  } catch (err) {
    console.warn("[Health] Banco indisponível:", err.message || err);
    res.status(503).json({ banco: "indisponivel" });
  }
});


// Usada só no cadastro. O login mantém a regra antiga para não travar contas existentes.
function validarUsuarioESenha(usuario, senha) {
  if (typeof usuario !== "string" || !USUARIO_NOVO.test(usuario.trim())) {
    return "Use de 3 a 20 letras latinas, números, _ ou -.";
  }
  if (NOMES_RESERVADOS.has(usuario.toLowerCase().replace(/[_-]/g, ""))) {
    return "Este nome de usuário não está disponível.";
  }
  if (typeof senha !== "string" || senha.length < 8 || Buffer.byteLength(senha, "utf8") > 72) {
    return "A senha deve ter de 8 a 72 caracteres.";
  }
  if (senha.toLowerCase() === usuario.toLowerCase()) {
    return "A senha não pode ser igual ao nome de usuário.";
  }
  return null;
}


async function buscarJogadorPorNome(nome, campos = "id,usuario") {
  if (!USUARIO_VALIDO.test(nome)) return null;
  const achados = await supabaseFetch("jogadores", {
    query: `select=${campos}&usuario=ilike.${encodeURIComponent(escaparLike(nome))}&limit=5`,
  });
  const lista = Array.isArray(achados) ? achados : [];
  return lista.find((j) => j.usuario.toLowerCase() === nome.toLowerCase()) ?? null;
}


async function buscarPosicao(jogadorId) {
  const rows = await supabaseFetch("ranking_posicoes", {
    query: `select=posicao,pontuacao,nivel&jogador_id=eq.${jogadorId}`,
  });
  const r = Array.isArray(rows) ? rows[0] : null;
  if (!r) return null;
  return { posicao: Number(r.posicao), pontuacao: Number(r.pontuacao), nivel: Number(r.nivel ?? 0) };
}

const formatarConquista = (c) => ({
  id: c.codigo,
  name: c.nome,
  description: c.descricao,
  icon: c.icone,
  unlockedAt: c.desbloqueado_em,
});

function criarToken(id, usuario) {
  return jwt.sign({ id, usuario }, JWT_SECRET, { algorithm: "HS256", expiresIn: JWT_EXPIRACAO });
}

// Sessão em cookie httpOnly: o JavaScript da página (e qualquer XSS) não consegue ler o token.
// Path /api: o navegador só envia o cookie para a API.
const EM_PRODUCAO = process.env.NODE_ENV === "production";
const COOKIE_SESSAO = "jbifc_token";
const OPCOES_COOKIE = { httpOnly: true, secure: EM_PRODUCAO, sameSite: "lax", path: "/api" };

function iniciarSessao(res, id, usuario) {
  const token = criarToken(id, usuario);
  const { exp } = jwt.decode(token);
  res.cookie(COOKIE_SESSAO, token, { ...OPCOES_COOKIE, maxAge: exp * 1000 - Date.now() });
}

function lerCookie(req, nome) {
  const bruto = req.headers.cookie;
  if (typeof bruto !== "string") return null;
  for (const parte of bruto.split(";")) {
    const i = parte.indexOf("=");
    if (i > 0 && parte.slice(0, i).trim() === nome) {
      try {
        return decodeURIComponent(parte.slice(i + 1).trim());
      } catch {
        return null;
      }
    }
  }
  return null;
}

function autenticar(req, res, next) {
  const token = lerCookie(req, COOKIE_SESSAO);

  if (!token) return res.status(401).json({ erro: "Faça login para continuar." });

  try {
    const dados = jwt.verify(token, JWT_SECRET, { algorithms: ["HS256"] });
    
    if (!Number.isInteger(dados.id)) throw new Error("id inválido");
    req.usuario = dados;
    next();
  } catch {
    return res.status(401).json({ erro: "Sessão inválida ou expirada. Entre novamente." });
  }
}


// Soma 1 no próprio banco (função SQL), sem ler e gravar em duas etapas
async function incrementarPartidas(jogadorId) {
  const total = await supabaseFetch("rpc/incrementar_partidas", {
    method: "POST",
    body: { p_jogador: jogadorId },
    prefer: null,
  });
  return Number(total);
}

async function registrarPartida(jogadorId, resumo) {
  const [partidasTotaisApos, existentes] = await Promise.all([
    incrementarPartidas(jogadorId),
    supabaseFetch("conquistas_jogador", { query: `select=codigo&jogador_id=eq.${jogadorId}` }),
  ]);

  const novas = avaliarConquistas(
    { ...resumo, partidasTotaisApos },
    (existentes ?? []).map((e) => e.codigo),
  );

  if (novas.length === 0) return [];

  const agora = new Date().toISOString();
  // ignore-duplicates: duas requisições simultâneas não derrubam o INSERT inteiro
  const inseridas = await supabaseFetch("conquistas_jogador", {
    method: "POST",
    query: "on_conflict=jogador_id,codigo",
    prefer: "resolution=ignore-duplicates,return=representation",
    body: novas.map((d) => ({
      jogador_id: jogadorId,
      codigo: d.id,
      nome: d.name,
      descricao: d.description,
      icone: d.icon,
      desbloqueado_em: agora,
    })),
  });

  return (inseridas ?? []).map(formatarConquista);
}

async function validarConfiguracaoSupabase() {
  const diagnostico = await diagnosticarSupabase();

  if (!SUPABASE_URL) {
    console.warn("[Banco] SUPABASE_URL não configurada. Verifique o arquivo backend/.env.");
    return false;
  }
  if (!SUPABASE_SERVICE_ROLE_KEY) {
    console.warn("[Banco] SUPABASE_SERVICE_ROLE_KEY não configurada. Verifique o arquivo backend/.env.");
    return false;
  }
  if (diagnostico.dns?.status !== "resolvido") {
    console.error("[Banco] Falha de DNS/URL do Supabase:", diagnostico);
    return false;
  }

  try {
    await supabaseFetch("jogadores", { query: "select=id&limit=1" });
    await supabaseFetch("ranking_posicoes", { query: "select=posicao&limit=1" });
    console.info("[Banco] Conexão com o Supabase validada com sucesso.");
    return true;
  } catch (err) {
    console.error("[Banco] Falha ao consultar o Supabase (a view ranking_posicoes existe?):", {
      diagnostico,
      erro: err.message || err,
    });
    return false;
  }
}

app.post("/api/conta", limiteCadastro, async (req, res) => {
  const usuario = typeof req.body?.usuario === "string" ? req.body.usuario.trim() : "";
  const senha = req.body?.senha;
  const erro = validarUsuarioESenha(usuario, senha);
  if (erro) return res.status(400).json({ erro });

  try {
    if (await buscarJogadorPorNome(usuario)) {
      return res.status(409).json({ erro: "Este nome de usuário já está em uso." });
    }

    const senhaHash = await bcrypt.hash(senha, BCRYPT_CUSTO);
    const rows = await supabaseFetch("jogadores", {
      method: "POST",
      body: { usuario, senha_hash: senhaHash },
    });

    const jogador = Array.isArray(rows) ? rows[0] : rows;
    iniciarSessao(res, jogador.id, jogador.usuario);
    res.status(201).json({ id: jogador.id, usuario: jogador.usuario });
  } catch (err) {
    
    const mensagem = err.message || "";
    if (mensagem.includes("duplicate") || mensagem.includes("already")) {
      return res.status(409).json({ erro: "Este nome de usuário já está em uso." });
    }
    console.error("[Conta] Erro ao criar conta:", err);
    res.status(500).json({ erro: "Erro ao criar a conta." });
  }
});

app.post("/api/login", limiteLogin, limiteLoginConta, async (req, res) => {
  const usuario = typeof req.body?.usuario === "string" ? req.body.usuario.trim() : "";
  const senha = typeof req.body?.senha === "string" ? req.body.senha : "";
  const credenciaisInvalidas = { erro: "Nome de usuário ou senha incorretos." };

  if (!usuario || !senha || Buffer.byteLength(senha, "utf8") > 72) {
    return res.status(401).json(credenciaisInvalidas);
  }

  try {
    const jogador = await buscarJogadorPorNome(usuario, "id,usuario,senha_hash");
    
    const senhaCorreta = await bcrypt.compare(senha, jogador?.senha_hash ?? HASH_FALSO);

    if (!jogador || !senhaCorreta) {
      return res.status(401).json(credenciaisInvalidas);
    }

    iniciarSessao(res, jogador.id, jogador.usuario);
    res.json({ id: jogador.id, usuario: jogador.usuario });
  } catch (err) {
    console.error("[Login] Erro ao entrar:", err);
    res.status(500).json({ erro: "Erro ao entrar. Tente novamente." });
  }
});

app.post("/api/logout", (_req, res) => {
  res.clearCookie(COOKIE_SESSAO, OPCOES_COOKIE);
  res.status(204).end();
});

app.get("/api/usuario", autenticar, async (req, res) => {
  try {
    const rows = await supabaseFetch("jogadores", {
      query: `select=id,usuario,partidas_totais&id=eq.${req.usuario.id}`,
    });

    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(401).json({ erro: "Conta não encontrada. Entre novamente." });
    }

    res.json({ id: rows[0].id, usuario: rows[0].usuario, partidasTotais: Number(rows[0].partidas_totais ?? 0) });
  } catch (err) {
    console.error("[Conta] Erro ao verificar sessão:", err);
    res.status(500).json({ erro: "Erro ao verificar a sessão." });
  }
});


app.get("/api/usuarios/:usuario", limitePerfil, async (req, res) => {
  const nome = String(req.params.usuario ?? "").trim();

  try {
    const jogador = await buscarJogadorPorNome(nome, "id,usuario,partidas_totais");
    if (!jogador) return res.status(404).json({ erro: "Usuário não encontrado." });

    const [conquistasRows, posicao] = await Promise.all([
      supabaseFetch("conquistas_jogador", {
        query: `select=codigo,nome,descricao,icone,desbloqueado_em&jogador_id=eq.${jogador.id}&order=desbloqueado_em.asc`,
      }),
      buscarPosicao(jogador.id),
    ]);

    res.json({
      usuario: jogador.usuario,
      partidasTotais: Number(jogador.partidas_totais ?? 0),
      
      ranking: posicao,
      conquistas: (Array.isArray(conquistasRows) ? conquistasRows : []).map(formatarConquista),
    });
  } catch (err) {
    console.error("[Perfil] Erro ao buscar perfil:", err);
    res.status(500).json({ erro: "Erro ao buscar o perfil." });
  }
});

app.get("/api/conquistas", autenticar, async (req, res) => {
  try {
    const [linhas, jogador] = await Promise.all([
      supabaseFetch("conquistas_jogador", {
        query: `select=codigo,nome,descricao,icone,desbloqueado_em&jogador_id=eq.${req.usuario.id}&order=desbloqueado_em.asc`,
      }),
      supabaseFetch("jogadores", {
        query: `select=partidas_totais&id=eq.${req.usuario.id}`,
      }),
    ]);

    const conquistas = Array.isArray(linhas)
      ? linhas.map((item) => ({ ...formatarConquista(item), codigo: item.codigo }))
      : [];

    res.json({
      conquistas,
      partidasTotais: Number(Array.isArray(jogador) && jogador[0] ? jogador[0].partidas_totais ?? 0 : 0),
    });
  } catch (err) {
    console.error("[Conquistas] Erro ao buscar conquistas:", err);
    res.status(500).json({ erro: "Erro ao buscar as conquistas." });
  }
});



app.get("/api/ranking", async (req, res) => {
  try {
    const pedido = parseInt(req.query.limite, 10);
    const limite = Number.isInteger(pedido) && pedido > 0
      ? Math.min(pedido, LIMITE_RANKING_MAX)
      : LIMITE_RANKING_MAX;

    const rows = await supabaseFetch("ranking_posicoes", {
      query: `select=posicao,usuario,pontuacao,nivel&order=posicao.asc&limit=${limite}`,
    });

    res.json((Array.isArray(rows) ? rows : []).map((r) => ({
      posicao: Number(r.posicao),
      usuario: r.usuario,
      pontuacao: Number(r.pontuacao),
      nivel: Number(r.nivel ?? 0),
    })));
  } catch (err) {
    console.error("[Ranking] Erro ao buscar o ranking:", err);
    res.status(500).json({ erro: "Erro ao buscar o ranking." });
  }
});

// Registra o início de uma partida. O relógio é do servidor e cada jogador tem uma só
// partida em andamento: iniciar outra substitui a anterior.
app.post("/api/partida", autenticar, limitePartidaNova, async (req, res) => {
  const id = randomUUID();
  try {
    await supabaseFetch("partidas_em_andamento", {
      method: "POST",
      query: "on_conflict=jogador_id",
      prefer: "resolution=merge-duplicates,return=representation",
      body: { jogador_id: req.usuario.id, id, iniciada_em: new Date().toISOString(), usada: false },
    });
    res.status(201).json({ partida: id });
  } catch (err) {
    console.error("[Partida] Erro ao registrar o início:", err);
    res.status(500).json({ erro: "Erro ao iniciar a partida." });
  }
});

app.post("/api/ranking", autenticar, limitePontuacaoCurto, limitePontuacaoHora, async (req, res) => {
  // O nível vem da pontuação, nunca do cliente (é critério de desempate do ranking)
  const { pontuacao, resumo, partida } = req.body || {};

  if (!Number.isInteger(pontuacao) || pontuacao < 0 || pontuacao > INT_MAX) {
    return res.status(400).json({ erro: "A pontuação deve ser um inteiro não negativo." });
  }
  const nivelValido = Math.floor(pontuacao / PONTOS_POR_NIVEL);

  const resumoValido = validarResumo(resumo, pontuacao);
  if (!resumoValido) {
    return res.status(400).json({ erro: "Resumo da partida inválido." });
  }

  if (typeof partida !== "string" || !UUID_RE.test(partida)) {
    return res.status(400).json({ erro: "Partida não registrada. Jogue novamente para salvar." });
  }

  let partidaConsumida = false;

  try {
    const jogadores = await supabaseFetch("jogadores", {
      query: `select=id,usuario&id=eq.${req.usuario.id}`,
    });
    const jogador = Array.isArray(jogadores) && jogadores.length > 0 ? jogadores[0] : null;

    if (!jogador) {
      return res.status(401).json({ erro: "Conta não encontrada. Entre novamente." });
    }

    // Uso único: a partida é consumida antes de qualquer outra checagem, então não dá
    // para testar valores repetidamente com o mesmo identificador.
    const consumida = await supabaseFetch("partidas_em_andamento", {
      method: "PATCH",
      query: `jogador_id=eq.${jogador.id}&id=eq.${partida}&usada=eq.false`,
      body: { usada: true },
    });

    if (!Array.isArray(consumida) || consumida.length === 0) {
      const linhas = await supabaseFetch("partidas_em_andamento", {
        query: `select=id,usada&jogador_id=eq.${jogador.id}`,
      });
      const atualPartida = Array.isArray(linhas) ? linhas[0] : null;
      if (atualPartida?.id === partida && atualPartida.usada) {
        return res.status(409).json({ erro: "Esta partida já foi registrada.", codigo: "partida_ja_registrada" });
      }
      return res.status(409).json({ erro: "Partida inválida ou substituída por uma mais nova.", codigo: "partida_invalida" });
    }
    partidaConsumida = true;

    const duracaoS = (Date.now() - Date.parse(consumida[0].iniciada_em)) / 1000;
    const minimoS = (pontuacao + VIDAS_INICIAIS) * SEGUNDOS_MINIMOS_POR_RODADA;
    if (duracaoS > DURACAO_MAXIMA_PARTIDA_S || duracaoS < minimoS) {
      // Recusada: apaga a partida para não ser confundida com uma já registrada
      await supabaseFetch("partidas_em_andamento", {
        method: "DELETE",
        query: `jogador_id=eq.${jogador.id}&id=eq.${partida}`,
      }).catch(() => {});
      partidaConsumida = false;
      return duracaoS > DURACAO_MAXIMA_PARTIDA_S
        ? res.status(409).json({ erro: "Partida expirada.", codigo: "partida_invalida" })
        : res.status(400).json({ erro: "A partida terminou rápido demais para ser válida." });
    }

    const atual = await supabaseFetch("ranking", {
      query: `select=id,pontuacao&jogador_id=eq.${jogador.id}`,
    });
    const existente = Array.isArray(atual) ? atual[0] : null;
    const agora = new Date().toISOString();

    
    if (!existente) {
      await supabaseFetch("ranking", {
        method: "POST",
        body: { jogador_id: jogador.id, usuario: jogador.usuario, pontuacao, nivel: nivelValido, data: agora },
      });
    } else if (pontuacao > Number(existente.pontuacao)) {
      await supabaseFetch("ranking", {
        method: "PATCH",
        query: `jogador_id=eq.${jogador.id}`,
        body: { usuario: jogador.usuario, pontuacao, nivel: nivelValido, data: agora },
      });
    }

    const registro = await buscarPosicao(jogador.id);

    
    let conquistasNovas = [];
    try {
      conquistasNovas = await registrarPartida(jogador.id, resumoValido);
    } catch (err) {
      console.error("[Conquistas] Erro ao registrar a partida:", err);
    }

    res.status(201).json({
      mensagem: "Pontuação registrada.",
      posicao: registro?.posicao ?? null,
      registro: {
        usuario: jogador.usuario,
        pontuacao: registro?.pontuacao ?? 0,
        nivel: registro?.nivel ?? nivelValido,
      },
      conquistasNovas,
    });
  } catch (err) {
    console.error("[Ranking] Erro ao salvar pontuação:", err);
    // Falha de infraestrutura: devolve a partida para o jogador poder tentar de novo
    if (partidaConsumida) {
      try {
        await supabaseFetch("partidas_em_andamento", {
          method: "PATCH",
          query: `jogador_id=eq.${req.usuario.id}&id=eq.${partida}`,
          body: { usada: false },
        });
      } catch {
        // sem resposta do banco: o jogador precisará jogar outra partida
      }
    }
    res.status(500).json({ erro: "Erro ao salvar no ranking." });
  }
});


app.use((_req, res) => {
  res.status(404).json({ erro: "Rota não encontrada." });
});

app.use((err, _req, res, _next) => {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ erro: "JSON inválido." });
  }
  if (err.type === "entity.too.large") {
    return res.status(413).json({ erro: "Requisição grande demais." });
  }
  console.error("[Erro] Não tratado:", err);
  res.status(500).json({ erro: "Erro interno." });
});

export default app;

if (process.env.VERCEL !== "1") {
  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });

  validarConfiguracaoSupabase().catch((err) => {
    console.warn(
      "[Banco] Verificação inicial do Supabase falhou sem bloquear a inicialização:",
      err.message || err
    );
  });
}