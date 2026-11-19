// Regras das conquistas (espelham o config/achievements do frontend, sem localStorage)
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
    description: "Alcançar pelo menos 500 pontos em uma partida.",
    icon: "🛡️",
    test: (s) => s.score >= 500 && s.vidasRestantes >= 1,
  },
  {
    id: "quase-um-milagre",
    name: "Quase um Milagre",
    description: "Terminar uma partida com exatamente uma vida restante.",
    icon: "✨",
    test: (s) => s.vidasRestantes === 1,
  },
  {
    id: "velocista",
    name: "Velocista",
    description: "Completar um minigame em até 10 segundos.",
    icon: "⚡",
    test: (s) => s.minigameMaisRapidoMs !== null && s.minigameMaisRapidoMs <= 10000,
  },
  {
    id: "colecionador-de-pontos",
    name: "Colecionador de Pontos",
    description: "Alcançar pelo menos 1.000 pontos em uma partida.",
    icon: "🏆",
    test: (s) => s.score >= 1000,
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
    description: "Completar 5 fases.",
    icon: "🎓",
    test: (s) => s.fasesCompletas >= 5,
  },
  {
    id: "sem-medo",
    name: "Sem Medo",
    description: "Completar 5 minigames consecutivos sem falhar.",
    icon: "😤",
    test: (s) => s.sequenciaMaxima >= 5,
  },
];

export function avaliarConquistas(resumo, codigosExistentes) {
  return DEFS.filter((d) => !codigosExistentes.includes(d.id) && d.test(resumo));
}

const inteiro = (n, min, max) => Number.isInteger(n) && n >= min && n <= max;

// Os limites são suposições: ajuste ao que o jogo realmente produz
export function validarResumo(resumo, pontuacao) {
  if (!resumo || typeof resumo !== "object") return null;
  const { score, vidasRestantes, sequenciaMaxima, fasesCompletas, minigameMaisRapidoMs } = resumo;

  if (!inteiro(pontuacao, 0, 1_000_000) || score !== pontuacao) return null;
  if (!inteiro(vidasRestantes, 0, 3)) return null;
  if (!inteiro(sequenciaMaxima, 0, 10_000)) return null;
  if (!inteiro(fasesCompletas, 0, 10_000)) return null;
  if (
    minigameMaisRapidoMs !== null &&
    !(Number.isFinite(minigameMaisRapidoMs) && minigameMaisRapidoMs >= 100 && minigameMaisRapidoMs <= 60000)
  ) {
    return null;
  }

  return { score, vidasRestantes, sequenciaMaxima, fasesCompletas, minigameMaisRapidoMs };
}