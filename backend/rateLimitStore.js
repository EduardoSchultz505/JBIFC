import { createHash } from "node:crypto";

const TEMPO_MAXIMO_BANCO_MS = 2500;

const comTempo = (promessa) =>
  Promise.race([
    promessa,
    new Promise((_, rejeitar) =>
      setTimeout(() => rejeitar(new Error("tempo esgotado")), TEMPO_MAXIMO_BANCO_MS),
    ),
  ]);

// Store do express-rate-limit guardada no Supabase. Em serverless cada instância tem a
// sua memória, então a contagem precisa ficar num lugar compartilhado.
// Se o banco falhar, cai para uma contagem local (limite fraco, mas a API não para).
export default class BancoRateLimitStore {
  constructor({ prefixo, chamarRpc }) {
    this.prefixo = prefixo;
    this.chamarRpc = chamarRpc;
    this.local = new Map();
    this.ultimoAviso = 0;
  }

  init(opcoes) {
    this.windowMs = opcoes.windowMs;
  }

  // O IP vira hash para não ficar gravado em texto no banco
  chave(chaveBruta) {
    const hash = createHash("sha256").update(String(chaveBruta)).digest("hex").slice(0, 32);
    return `${this.prefixo}:${hash}`;
  }

  avisar(err) {
    const agora = Date.now();
    if (agora - this.ultimoAviso < 60_000) return;
    this.ultimoAviso = agora;
    console.warn(`[RateLimit:${this.prefixo}] Banco indisponível, usando contagem local:`, err.message || err);
  }

  incrementarLocal(chave) {
    const agora = Date.now();
    let item = this.local.get(chave);
    if (!item || item.resetTime <= agora) {
      item = { totalHits: 0, resetTime: agora + this.windowMs };
    }
    item.totalHits += 1;
    this.local.set(chave, item);
    return { totalHits: item.totalHits, resetTime: new Date(item.resetTime) };
  }

  async increment(chaveBruta) {
    try {
      const linhas = await comTempo(
        this.chamarRpc("rate_limit_hit", {
          p_chave: this.chave(chaveBruta),
          p_janela_ms: this.windowMs,
        }),
      );
      const linha = Array.isArray(linhas) ? linhas[0] : linhas;
      return { totalHits: Number(linha.total), resetTime: new Date(linha.reseta_em) };
    } catch (err) {
      this.avisar(err);
      return this.incrementarLocal(chaveBruta);
    }
  }

  async decrement(chaveBruta) {
    const item = this.local.get(chaveBruta);
    if (item && item.totalHits > 0) item.totalHits -= 1;
    try {
      await comTempo(this.chamarRpc("rate_limit_undo", { p_chave: this.chave(chaveBruta) }));
    } catch (err) {
      this.avisar(err);
    }
  }

  async resetKey(chaveBruta) {
    this.local.delete(chaveBruta);
    try {
      await comTempo(this.chamarRpc("rate_limit_reset", { p_chave: this.chave(chaveBruta) }));
    } catch (err) {
      this.avisar(err);
    }
  }
}