import path from "node:path";
import dns from "node:dns";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { avaliarConquistas, validarResumo } from "./conquistas.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, ".env"), quiet: true });

const PORT = process.env.PORT || 5000;
const SUPABASE_URL = process.env.SUPABASE_URL?.replace(/\/$/, "");
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY?.trim();
const JWT_SECRET = process.env.JWT_SECRET?.trim();
const JWT_EXPIRACAO = process.env.JWT_EXPIRACAO || "7d";


const ORIGENS_PERMITIDAS = (process.env.FRONTEND_URL || "http://localhost:5173,http://127.0.0.1:5173")
  .split(",")
  .map((o) => o.trim().replace(/\/$/, ""))
  .filter(Boolean);


if (!JWT_SECRET) {
  console.error("[Auth] JWT_SECRET não está configurada. Defina a variável antes de iniciar o servidor.");
  process.exit(1);
}
if (JWT_SECRET.length < 32) {
  console.warn("[Auth] JWT_SECRET curta. Use pelo menos 32 caracteres aleatórios.");
}

const USUARIO_VALIDO = /^[\p{L}\p{N}_-]{3,20}$/u;
const INT_MAX = 2147483647;
const LIMITE_RANKING_MAX = 100;


const HASH_FALSO = bcrypt.hashSync("senha-falsa-para-igualar-o-tempo", 10);



const escaparLike = (texto) => texto.replace(/[\\%_]/g, "\\$&");

const app = express();
app.disable("x-powered-by");
app.set("trust proxy", 1); 

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

async function supabaseFetch(table, { method = "GET", query = "", body = null, useServiceRole = true } = {}) {
  if (!SUPABASE_URL) {
    throw new Error("SUPABASE_URL não configurada.");
  }

  const url = query ? `${SUPABASE_URL}/rest/v1/${table}?${query}` : `${SUPABASE_URL}/rest/v1/${table}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const headers = buildSupabaseHeaders({ useServiceRole });
    if (method === "GET") delete headers.Prefer;

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

app.use(cors({ origin: ORIGENS_PERMITIDAS }));
app.use(express.json({ limit: "10kb" }));


app.get("/api/health", async (_req, res) => {
  try {
    await supabaseFetch("jogadores", { query: "select=id&limit=1" });
    res.json({ banco: "ok" });
  } catch (err) {
    console.warn("[Health] Banco indisponível:", err.message || err);
    res.status(503).json({ banco: "indisponivel" });
  }
});

const mensagemLimite = (erro) => ({ erro });

const limiteGeral = rateLimit({
  windowMs: 60 * 1000,
  limit: 120,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: mensagemLimite("Muitas requisições. Aguarde um instante."),
});


const limiteLogin = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  skipSuccessfulRequests: true,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: mensagemLimite("Muitas tentativas de login. Tente de novo em alguns minutos."),
});

const limiteCadastro = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: mensagemLimite("Muitos cadastros deste endereço. Tente mais tarde."),
});

app.use(limiteGeral);

function validarUsuarioESenha(usuario, senha) {
  if (typeof usuario !== "string" || !USUARIO_VALIDO.test(usuario.trim())) {
    return "Use de 3 a 20 letras, números, _ ou -.";
  }
  
  if (typeof senha !== "string" || senha.length < 8 || Buffer.byteLength(senha, "utf8") > 72) {
    return "A senha deve ter de 8 a 72 caracteres.";
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

function autenticar(req, res, next) {
  const cabecalho = req.headers.authorization;
  const token = typeof cabecalho === "string" && cabecalho.startsWith("Bearer ")
    ? cabecalho.slice(7)
    : null;

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


async function registrarPartida(jogadorId, resumo) {
  const [jogRows, existentes] = await Promise.all([
    supabaseFetch("jogadores", { query: `select=partidas_totais&id=eq.${jogadorId}` }),
    supabaseFetch("conquistas_jogador", { query: `select=codigo&jogador_id=eq.${jogadorId}` }),
  ]);

  const partidasTotaisApos = Number(jogRows?.[0]?.partidas_totais ?? 0) + 1;
  const novas = avaliarConquistas(
    { ...resumo, partidasTotaisApos },
    (existentes ?? []).map((e) => e.codigo),
  );

  await supabaseFetch("jogadores", {
    method: "PATCH",
    query: `id=eq.${jogadorId}`,
    body: { partidas_totais: partidasTotaisApos },
  });

  if (novas.length === 0) return [];

  const agora = new Date().toISOString();
  const inseridas = await supabaseFetch("conquistas_jogador", {
    method: "POST",
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

    const senhaHash = await bcrypt.hash(senha, 10);
    const rows = await supabaseFetch("jogadores", {
      method: "POST",
      body: { usuario, senha_hash: senhaHash },
    });

    const jogador = Array.isArray(rows) ? rows[0] : rows;
    res.status(201).json({
      id: jogador.id,
      usuario: jogador.usuario,
      token: criarToken(jogador.id, jogador.usuario),
    });
  } catch (err) {
    
    const mensagem = err.message || "";
    if (mensagem.includes("duplicate") || mensagem.includes("already")) {
      return res.status(409).json({ erro: "Este nome de usuário já está em uso." });
    }
    console.error("[Conta] Erro ao criar conta:", err);
    res.status(500).json({ erro: "Erro ao criar a conta." });
  }
});

app.post("/api/login", limiteLogin, async (req, res) => {
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

    res.json({
      id: jogador.id,
      usuario: jogador.usuario,
      token: criarToken(jogador.id, jogador.usuario),
    });
  } catch (err) {
    console.error("[Login] Erro ao entrar:", err);
    res.status(500).json({ erro: "Erro ao entrar. Tente novamente." });
  }
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


app.get("/api/usuarios/:usuario", async (req, res) => {
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
      id: jogador.id,
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

app.post("/api/ranking", autenticar, async (req, res) => {
  const { pontuacao, resumo, nivel } = req.body || {};
  const nivelValido = nivel === undefined ? 0 : nivel;

  if (!Number.isInteger(pontuacao) || pontuacao < 0 || pontuacao > INT_MAX) {
    return res.status(400).json({ erro: "A pontuação deve ser um inteiro não negativo." });
  }
  if (!Number.isInteger(nivelValido) || nivelValido < 0 || nivelValido > INT_MAX) {
    return res.status(400).json({ erro: "O campo 'nivel' deve ser um inteiro maior ou igual a 0." });
  }

  const resumoValido = validarResumo(resumo, pontuacao);
  if (!resumoValido) {
    return res.status(400).json({ erro: "Resumo da partida inválido." });
  }

  try {
    const jogadores = await supabaseFetch("jogadores", {
      query: `select=id,usuario&id=eq.${req.usuario.id}`,
    });
    const jogador = Array.isArray(jogadores) && jogadores.length > 0 ? jogadores[0] : null;

    if (!jogador) {
      return res.status(401).json({ erro: "Conta não encontrada. Entre novamente." });
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