import "dotenv/config";
import express from "express";
import cors from "cors";
import pg from "pg";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const { Pool } = pg;

const app = express();
const PORT = process.env.PORT || 5000;

function normalizarUrlPostgres(rawUrl) {
  const url = rawUrl?.trim();
  if (!url) return null;

  const separador = url.indexOf("://");
  const ultimoArroba = url.lastIndexOf("@");
  if (separador < 0 || ultimoArroba < 0) return url;

  const prefixo = url.slice(0, separador + 3);
  const autenticacao = url.slice(separador + 3, ultimoArroba);
  const separadorSenha = autenticacao.indexOf(":");
  if (separadorSenha < 0) return url;

  const usuario = autenticacao.slice(0, separadorSenha);
  const senhaOriginal = autenticacao.slice(separadorSenha + 1);
  let senhaCodificada = senhaOriginal;

  try {
    senhaCodificada = encodeURIComponent(decodeURIComponent(senhaOriginal));
  } catch {
    senhaCodificada = encodeURIComponent(senhaOriginal);
  }

  return `${prefixo}${usuario}:${senhaCodificada}${url.slice(ultimoArroba)}`;
}

const databaseUrl = normalizarUrlPostgres(process.env.DATABASE_URL);

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000,
});

app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET?.trim();
const JWT_EXPIRACAO = process.env.JWT_EXPIRACAO || "7d";

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

app.get("/health", async (_req, res) => {
  try {
    const resultado = await pool.query("SELECT NOW() AS agora");
    res.json({ banco: "conectado", agora: resultado.rows[0].agora });
  } catch (err) {
    console.error("[Banco] Falha na verificação de saúde:", err);
    res.status(503).json({ banco: "indisponível", erro: err.message });
  }
});

async function iniciarBanco() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ranking (
      id SERIAL PRIMARY KEY,
      usuario VARCHAR(50) NOT NULL,
      pontuacao DOUBLE PRECISION NOT NULL CHECK (pontuacao >= 0),
      nivel INTEGER NOT NULL CHECK (nivel >= 0),
      data TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await pool.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS ranking_usuario_unico
    ON ranking (LOWER(usuario));
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS jogadores (
      id SERIAL PRIMARY KEY,
      usuario VARCHAR(20) NOT NULL,
      senha_hash VARCHAR(100) NOT NULL,
      criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await pool.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS jogadores_usuario_unico
    ON jogadores (LOWER(usuario));
  `);
  await pool.query(`
    ALTER TABLE ranking ADD COLUMN IF NOT EXISTS jogador_id INTEGER
    REFERENCES jogadores(id) ON DELETE CASCADE;
  `);
  await pool.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS ranking_jogador_unico
    ON ranking (jogador_id)
    WHERE jogador_id IS NOT NULL;
  `);
}

app.post("/api/conta", async (req, res) => {
  const usuario = typeof req.body?.usuario === "string" ? req.body.usuario.trim() : "";
  const senha = req.body?.senha;
  const erro = validarUsuarioESenha(usuario, senha);
  if (erro) return res.status(400).json({ erro });

  try {
    const existente = await pool.query(
      "SELECT id FROM jogadores WHERE LOWER(usuario) = LOWER($1)",
      [usuario],
    );
    if (existente.rowCount > 0) {
      return res.status(409).json({ erro: "Este nome de usuário já está em uso." });
    }

    const senhaHash = await bcrypt.hash(senha, 10);
    const { rows } = await pool.query(
      `INSERT INTO jogadores (usuario, senha_hash)
       VALUES ($1, $2)
       RETURNING id, usuario`,
      [usuario, senhaHash],
    );
    const jogador = rows[0];
    res.status(201).json({
      id: jogador.id,
      usuario: jogador.usuario,
      token: criarToken(jogador.id, jogador.usuario),
    });
  } catch (err) {
    if (err.code === "23505") {
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
    const { rows } = await pool.query(
      "SELECT id, usuario, senha_hash FROM jogadores WHERE LOWER(usuario) = LOWER($1)",
      [usuario],
    );
    const jogador = rows[0];
    const senhaCorreta = jogador
      ? await bcrypt.compare(senha, jogador.senha_hash)
      : false;

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
    const { rows } = await pool.query(
      "SELECT id, usuario FROM jogadores WHERE id = $1",
      [req.usuario.id],
    );
    if (rows.length === 0) {
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

    const { rows } = await pool.query(
      `SELECT ROW_NUMBER() OVER (ORDER BY pontuacao DESC, nivel DESC, data ASC)::int AS posicao,
      usuario, pontuacao, nivel
      FROM ranking
      ORDER BY posicao
      ${usaLimite ? "LIMIT $1" : ""}`,
      usaLimite ? [limite] : [],
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
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
    return res.status(400).json({
      erro: "A pontuação deve ser um inteiro não negativo.",
    });
  }
  if (!Number.isInteger(nivelValido) || nivelValido < 0) {
    return res.status(400).json({
      erro: "O campo 'nivel' deve ser um inteiro maior ou igual a 0.",
    });
  }

  try {
    const { rows: jogadores } = await pool.query(
      "SELECT id, usuario FROM jogadores WHERE id = $1",
      [req.usuario.id],
    );
    if (jogadores.length === 0) {
      return res.status(401).json({ erro: "Conta não encontrada. Entre novamente." });
    }
    const jogador = jogadores[0];

    const atual = await pool.query(
      "SELECT pontuacao FROM ranking WHERE jogador_id = $1",
      [jogador.id],
    );
    let registro;
    if (atual.rowCount === 0) {
      const legado = await pool.query(
        "SELECT id FROM ranking WHERE jogador_id IS NULL AND LOWER(usuario) = LOWER($1)",
        [jogador.usuario],
      );
      if (legado.rowCount > 0) {
        await pool.query(
          "UPDATE ranking SET jogador_id = $1 WHERE id = $2",
          [jogador.id, legado.rows[0].id],
        );
        const atualLegado = await pool.query(
          "SELECT pontuacao FROM ranking WHERE jogador_id = $1",
          [jogador.id],
        );
        if (pontuacao > atualLegado.rows[0].pontuacao) {
          const atualizado = await pool.query(
            `UPDATE ranking SET pontuacao = $2, nivel = $3, usuario = $4
             WHERE jogador_id = $1 RETURNING pontuacao, usuario`,
            [jogador.id, pontuacao, nivelValido, jogador.usuario],
          );
          registro = atualizado.rows[0];
        } else {
          registro = atualLegado.rows.length
            ? { pontuacao: atualLegado.rows[0].pontuacao, usuario: jogador.usuario }
            : null;
        }
      } else {
      const inserido = await pool.query(
        `INSERT INTO ranking (jogador_id, usuario, pontuacao, nivel, data)
         VALUES ($1, $2, $3, $4, NOW())
         RETURNING pontuacao, usuario`,
        [jogador.id, jogador.usuario, pontuacao, nivelValido],
      );
      registro = inserido.rows[0];
      }
    } else if (pontuacao > atual.rows[0].pontuacao) {
      const atualizado = await pool.query(
        `UPDATE ranking
         SET pontuacao = $2, nivel = $3, usuario = $4
         WHERE jogador_id = $1
         RETURNING pontuacao, usuario`,
        [jogador.id, pontuacao, nivelValido, jogador.usuario],
      );
      registro = atualizado.rows[0];
    } else {
      const mantido = await pool.query(
        "SELECT pontuacao, usuario FROM ranking WHERE jogador_id = $1",
        [jogador.id],
      );
      registro = mantido.rows[0];
    }
    const { rows: registroAtual } = await pool.query(
      "SELECT data FROM ranking WHERE jogador_id = $1",
      [jogador.id],
    );
    const { rows } = await pool.query(
      `SELECT COUNT(*)::int + 1 AS posicao
       FROM ranking
       WHERE pontuacao > $1
          OR (pontuacao = $1 AND data < $2)`,
      [registro.pontuacao, registroAtual[0].data],
    );

    const { rows: confirmado } = await pool.query(
      `SELECT jogador_id, usuario, pontuacao, nivel, data
       FROM ranking WHERE jogador_id = $1`,
      [jogador.id],
    );
    console.info("[Supabase] Resultado confirmado:", confirmado[0] ?? null);
    console.info("[Ranking] Operação concluída:", {
      jogadorId: jogador.id,
      jogadorNome: jogador.usuario,
      pontuacaoRecebida: pontuacao,
      melhorPontuacao: registro.pontuacao,
      posicao: rows[0].posicao,
    });

    res.status(201).json({
      mensagem: "Pontuação registrada.",
      posicao: rows[0].posicao,
      registro,
    });
  } catch (err) {
    console.error("Erro ao salvar pontuação no ranking:", err);
    res.status(500).json({ erro: "Erro ao salvar no ranking." });
  }
});

if (!databaseUrl) {
  console.error("[Banco] DATABASE_URL não está configurada. Defina a variável antes de iniciar o servidor.");
  process.exit(1);
}
if (!JWT_SECRET) {
  console.error("[Auth] JWT_SECRET não está configurada. Defina a variável antes de iniciar o servidor.");
  process.exit(1);
}

iniciarBanco()
  .then(() => {
    console.info("[Banco] Tabela ranking inicializada.");
    app.listen(PORT, () => {
      console.log(`Servidor rodando em http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Falha ao conectar/iniciar o banco:", err);
    process.exit(1);
  });
