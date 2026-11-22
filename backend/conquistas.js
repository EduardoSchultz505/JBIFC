const DEFS = [
  {
    id: "primeiro-dia",
    name: "Primeiro Dia",
    description: "Completar a primeira partida.",
    icon: "☀️",
    test: (s) => s.partidasTotaisApos >= 1,
  },
  {
    id: "sobrevivente",
    name: "Sobrevivente",
    description: "Vencer 5 minigames em uma partida.",
    icon: "🛡️",
    test: (s) => s.fasesCompletas >= 5,
  },
  {
    id: "quase-um-milagre",
    name: "Quase um Milagre",
    description: "Vencer um minigame com apenas uma vida restante.",
    icon: "✨",
    test: (s) => s.venceuComUmaVida === true,
  },
  {
    id: "velocista",
    name: "Velocista",
    description: "Vencer um minigame em até 10 segundos.",
    icon: "⚡",
    test: (s) =>
      s.minigameMaisRapidoMs !== null &&
      s.minigameMaisRapidoMs <= 10000,
  },
  {
    id: "colecionador-de-pontos",
    name: "Colecionador de Pontos",
    description: "Vencer 15 minigames em uma partida.",
    icon: "🏆",
    test: (s) => s.fasesCompletas >= 15,
  },
  {
    id: "persistente",
    name: "Persistente",
    description: "Completar 10 partidas.",
    icon: "🔁",
    test: (s) => s.partidasTotaisApos >= 10,
  },
  {
    id: "veterano-do-ifc",
    name: "Veterano do IFC",
    description: "Vencer 10 minigames em uma partida.",
    icon: "🎓",
    test: (s) => s.fasesCompletas >= 10,
  },
  {
    id: "sem-medo",
    name: "Sem Medo",
    description: "Vencer 5 minigames consecutivos sem falhar.",
    icon: "😤",
    test: (s) => s.sequenciaMaxima >= 5,
  },
];

export function avaliarConquistas(resumo, codigosExistentes = []) {
  return DEFS.filter(
    (d) =>
      !codigosExistentes.includes(d.id) &&
      d.test(resumo)
  );
}

const inteiro = (n, min, max) =>
  Number.isInteger(n) && n >= min && n <= max;

export function validarResumo(resumo, pontuacao) {
  if (!resumo || typeof resumo !== "object") return null;

  const {
    score,
    vidasRestantes,
    sequenciaMaxima,
    fasesCompletas,
    minigameMaisRapidoMs,
    venceuComUmaVida,
  } = resumo;

  if (typeof venceuComUmaVida !== "boolean") return null;

  if (!inteiro(pontuacao, 0, 1_000_000) || score !== pontuacao) {
    return null;
  }

  if (!inteiro(vidasRestantes, 0, 3)) return null;

  if (!inteiro(sequenciaMaxima, 0, 10_000)) return null;

  if (!inteiro(fasesCompletas, 0, 10_000)) return null;

  if (minigameMaisRapidoMs !== null) {
    if (
      !Number.isFinite(minigameMaisRapidoMs) ||
      minigameMaisRapidoMs < 100 ||
      minigameMaisRapidoMs > 60000
    ) {
      return null;
    }
  }

  if (vidasRestantes !== 0) return null;
  if (fasesCompletas !== pontuacao) return null;
  if (sequenciaMaxima > fasesCompletas) return null;
  if (fasesCompletas === 0 && (minigameMaisRapidoMs !== null || venceuComUmaVida)) {
    return null;
  }

  return {
    score,
    vidasRestantes,
    sequenciaMaxima,
    fasesCompletas,
    minigameMaisRapidoMs,
    venceuComUmaVida,
  };
}