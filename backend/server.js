import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, ".env"), quiet: true });

const app = express();
const PORT = process.env.PORT || 5000;
const SUPABASE_URL = process.env.SUPABASE_URL?.replace(/\/$/, "");
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY?.trim();
const JWT_SECRET = process.env.JWT_SECRET?.trim();
const JWT_EXPIRACAO = process.env.JWT_EXPIRACAO || "7d";

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

async function supabaseFetch(table, { method = "GET", query = "", body = null, useServiceRole = true } = {}) {
  if (!SUPABASE_URL) {
    throw new Error("SUPABASE_URL não configurada.");
  }

  const url = query ? `${SUPABASE_URL}/rest/v1/${table}?${query}` : `${SUPABASE_URL}/rest/v1/${table}`;
  const response = await fetch(url, {
    method,
    headers: buildSupabaseHeaders({ useServiceRole }),
    body: body === null || body === undefined ? undefined : JSON.stringify(body),
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
}

app.use(cors());
app.use(express.json());

function validarUsuarioESenha(usuario, senha) {
  if (typeof usuario !== "string") return "Informe um nome de usuário válido.";
  const nome = usuario.trim();
  if (nome.length < 1 || nome.length > 20) {
    return "O nome de usuário deve ter entre 1 e 20 caracteres.";
  }
  if (typeof senha !== "string" || senha.length < 8 || senha.length > 72) {
    return "A senha deve ter entre 8 e 72 caracteres.";
  }
  return null;
}

function criarToken(id, usuario) {
  return jwt.sign({ id, usuario }, JWT_SECRET, { expiresIn: JWT_EXPIRACAO });
}

function autenticar(req, res, next) {
  const cabecalho = req.headers.authorization;
  const token = typeof cabecalho === "string" && cabecalho.startsWith("Bearer ")
    ? cabecalho.slice(7)
    : null;

  if (!token) return res.status(401).json({ erro: "Faça login para continuar." });

  try {
    req.usuario = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ erro: "Sessão inválida ou expirada. Entre novamente." });
  }
}

async function validarConfiguracaoSupabase() {
  if (!SUPABASE_URL) {
    throw new Error("SUPABASE_URL não está configurada.");
  }
  if (!SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY não está configurada.");
  }

  await supabaseFetch("jogadores", { query: "select=id&limit=1" });
  console.info("[Banco] Conexão HTTPS com o Supabase validada com sucesso.");
}

app.get("/health", async (_req, res) => {
  try {
    const resultado = await supabaseFetch("jogadores", { query: "select=id&limit=1" });
    res.json({ banco: "conectado", rows: resultado?.length ?? 0 });
  } catch (err) {
    console.error("[Banco] Falha na verificação de saúde:", err);
    res.status(503).json({ banco: "indisponível", erro: err.message });
  }
});

app.post("/api/conta", async (req, res) => {
  const usuario = typeof req.body?.usuario === "string" ? req.body.usuario.trim() : "";
  const senha = req.body?.senha;
  const erro = validarUsuarioESenha(usuario, senha);
  if (erro) return res.status(400).json({ erro });

  try {
    const existente = await supabaseFetch("jogadores", {
      query: `select=id&usuario=ilike.${encodeURIComponent(usuario)}`,
    });

    if (Array.isArray(existente) && existente.length > 0) {
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
    const mensagem = err.message || "Erro ao criar a conta.";
    if (mensagem.includes("duplicate") || mensagem.includes("already")) {
      return res.status(409).json({ erro: "Este nome de usuário já está em uso." });
    }
    console.error("[Conta] Erro ao criar conta:", err);
    res.status(500).json({ erro: "Erro ao criar a conta." });
  }
});

app.post("/api/login", async (req, res) => {
  const usuario = typeof req.body?.usuario === "string" ? req.body.usuario.trim() : "";
  const senha = typeof req.body?.senha === "string" ? req.body.senha : "";

  if (!usuario || !senha || usuario.length > 20 || senha.length > 72) {
    return res.status(401).json({ erro: "Nome de usuário ou senha incorretos." });
  }

  try {
    const rows = await supabaseFetch("jogadores", {
      query: `select=id,usuario,senha_hash&usuario=ilike.${encodeURIComponent(usuario)}`,
    });
    const jogador = Array.isArray(rows) ? rows[0] : null;
    const senhaCorreta = jogador ? await bcrypt.compare(senha, jogador.senha_hash) : false;

    if (!jogador || !senhaCorreta) {
      return res.status(401).json({ erro: "Nome de usuário ou senha incorretos." });
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
      query: `select=id,usuario&id=eq.${req.usuario.id}`,
    });

    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(401).json({ erro: "Conta não encontrada. Entre novamente." });
    }

    res.json({ id: rows[0].id, usuario: rows[0].usuario });
  } catch (err) {
    console.error("[Conta] Erro ao verificar sessão:", err);
    res.status(500).json({ erro: "Erro ao verificar a sessão." });
  }
});

app.get("/ranking", async (req, res) => {
  try {
    const limite = parseInt(req.query.limite, 10);
    const usaLimite = Number.isInteger(limite) && limite > 0;
    const rows = await supabaseFetch("ranking", {
      query: "select=id,jogador_id,usuario,pontuacao,nivel,data&order=pontuacao.desc,nivel.desc,data.asc",
    });

    const ranking = (Array.isArray(rows) ? rows : []).map((jogador, index) => ({
      posicao: index + 1,
      usuario: jogador.usuario,
      pontuacao: Number(jogador.pontuacao),
      nivel: Number(jogador.nivel ?? 0),
    }));

    res.json(usaLimite ? ranking.slice(0, limite) : ranking);
  } catch (err) {
    console.error("[Ranking] Erro ao buscar o ranking:", err);
    res.status(500).json({ erro: "Erro ao buscar o ranking." });
  }
});

app.post("/ranking", autenticar, async (req, res) => {
  const { jogadorId, pontuacao, nivel } = req.body || {};
  const nivelValido = nivel === undefined ? 0 : nivel;

  console.info("[Ranking] Recebido:", {
    jogadorId,
    jogadorAutenticadoId: req.usuario.id,
    jogadorAutenticadoNome: req.usuario.usuario,
    pontuacao,
  });

  if (!Number.isInteger(jogadorId) || jogadorId !== req.usuario.id) {
    return res.status(403).json({ erro: "O jogador enviado não corresponde à sessão autenticada." });
  }
  if (!Number.isInteger(pontuacao) || pontuacao < 0 || pontuacao > 2147483647) {
    return res.status(400).json({ erro: "A pontuação deve ser um inteiro não negativo." });
  }
  if (!Number.isInteger(nivelValido) || nivelValido < 0) {
    return res.status(400).json({ erro: "O campo 'nivel' deve ser um inteiro maior ou igual a 0." });
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
      query: `select=id,jogador_id,usuario,pontuacao,nivel,data&jogador_id=eq.${jogador.id}`,
    });

    let registro;
    if (!Array.isArray(atual) || atual.length === 0) {
      const legado = await supabaseFetch("ranking", {
        query: `select=id,usuario,pontuacao&usuario=ilike.${encodeURIComponent(jogador.usuario)}`,
      });

      if (Array.isArray(legado) && legado.length > 0) {
        const registroLegado = legado[0];
        const atualLegado = await supabaseFetch("ranking", {
          query: `select=id,pontuacao,usuario,data&jogador_id=eq.${jogador.id}`,
        });

        if (pontuacao > Number((Array.isArray(atualLegado) && atualLegado[0]) ? atualLegado[0].pontuacao : 0)) {
          const atualizado = await supabaseFetch("ranking", {
            method: "PATCH",
            query: `id=eq.${registroLegado.id}`,
            body: {
              jogador_id: jogador.id,
              usuario: jogador.usuario,
              pontuacao,
              nivel: nivelValido,
              data: new Date().toISOString(),
            },
          });
          registro = Array.isArray(atualizado) ? atualizado[0] : atualizado;
        } else {
          registro = Array.isArray(atualLegado) && atualLegado.length > 0 ? atualLegado[0] : registroLegado;
        }
      } else {
        const inserido = await supabaseFetch("ranking", {
          method: "POST",
          body: {
            jogador_id: jogador.id,
            usuario: jogador.usuario,
            pontuacao,
            nivel: nivelValido,
            data: new Date().toISOString(),
          },
        });
        registro = Array.isArray(inserido) ? inserido[0] : inserido;
      }
    } else if (pontuacao > Number(atual[0].pontuacao)) {
      const atualizado = await supabaseFetch("ranking", {
        method: "PATCH",
        query: `jogador_id=eq.${jogador.id}`,
        body: {
          usuario: jogador.usuario,
          pontuacao,
          nivel: nivelValido,
          data: new Date().toISOString(),
        },
      });
      registro = Array.isArray(atualizado) ? atualizado[0] : atualizado;
    } else {
      registro = atual[0];
    }

    const todos = await supabaseFetch("ranking", {
      query: "select=id,jogador_id,usuario,pontuacao,nivel,data&order=pontuacao.desc,nivel.desc,data.asc",
    });

    const ranking = Array.isArray(todos) ? todos : [];
    const posicao = ranking.findIndex((item) => item.jogador_id === jogador.id) + 1;

    console.info("[Ranking] Operação concluída:", {
      jogadorId: jogador.id,
      jogadorNome: jogador.usuario,
      pontuacaoRecebida: pontuacao,
      melhorPontuacao: registro?.pontuacao,
      posicao,
    });

    res.status(201).json({
      mensagem: "Pontuação registrada.",
      posicao,
      registro: {
        usuario: registro?.usuario ?? jogador.usuario,
        pontuacao: Number(registro?.pontuacao ?? 0),
        nivel: Number(registro?.nivel ?? nivelValido),
      },
    });
  } catch (err) {
    console.error("Erro ao salvar pontuação no ranking:", err);
    res.status(500).json({ erro: "Erro ao salvar no ranking." });
  }
});

if (!JWT_SECRET) {
  console.error("[Auth] JWT_SECRET não está configurada. Defina a variável antes de iniciar o servidor.");
  process.exit(1);
}

validarConfiguracaoSupabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Servidor rodando em http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Falha ao conectar ao Supabase sobre HTTPS:", err);
    process.exit(1);
  });
