import express from "express";
import cors from "cors";
import pg from "pg";

const { Pool } = pg;

const app = express();
const PORT = process.env.PORT;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

app.use(cors());
app.use(express.json());

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
}

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

app.post("/ranking", async (req, res) => {
  const { usuario, pontuacao, nivel } = req.body || {};

  if (
    typeof usuario !== "string" ||
    !usuario.trim() ||
    usuario.trim().length > 50
  ) {
    return res
      .status(400)
      .json({ erro: "O campo 'usuario' é obrigatório (máx. 50 caracteres)." });
  }
  if (!Number.isFinite(pontuacao) || pontuacao < 0) {
    return res
      .status(400)
      .json({
        erro: "O campo 'pontuacao' deve ser um número maior ou igual a 0.",
      });
  }
  if (!Number.isInteger(nivel) || nivel < 0) {
    return res
      .status(400)
      .json({
        erro: "O campo 'nivel' deve ser um inteiro maior ou igual a 0.",
      });
  }

  const nome = usuario.trim();

  try {
    const upsert = await pool.query(
      `INSERT INTO ranking (usuario, pontuacao, nivel)
      VALUES ($1, $2, $3)
      ON CONFLICT ((LOWER(usuario))) DO UPDATE
        SET pontuacao = EXCLUDED.pontuacao,
            nivel = EXCLUDED.nivel,
            data = NOW()
        WHERE EXCLUDED.pontuacao > ranking.pontuacao
      RETURNING (xmax = 0) AS inserido`,
      [nome, pontuacao, nivel],
    );

    const atualizado = upsert.rowCount > 0;
    const inserido = atualizado && upsert.rows[0].inserido;

    const { rows } = await pool.query(
      `SELECT COUNT(*)::int + 1 AS posicao
      FROM ranking r, (SELECT pontuacao, nivel FROM ranking WHERE LOWER(usuario) = LOWER($1)) u
      WHERE r.pontuacao > u.pontuacao
          OR (r.pontuacao = u.pontuacao AND r.nivel > u.nivel)`,
      [nome],
    );

    res.status(inserido ? 201 : 200).json({
      mensagem: atualizado
        ? "Ranking atualizado."
        : "Pontuação não superou o recorde atual do usuário.",
      posicao: rows[0].posicao,
    }); 
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao salvar no ranking." });
  }
});

iniciarBanco()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Servidor rodando em http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Falha ao conectar/iniciar o banco:", err);
    process.exit(1);
  });
