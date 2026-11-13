export const ACHIEVEMENT_DEFS = [
  {
    id: "primeiro-dia",
    name: "Primeiro Dia",
    description: "Completar a primeira partida.",
    icon: "☀️",
    hint: "Conclua sua primeira partida para dar o pontapé inicial.",
    target: 1,
    test: (summary) => Number(summary?.partidasTotaisApos ?? 0) >= 1,
  },
  {
    id: "sobrevivente",
    name: "Sobrevivente",
    description: "Alcançar pelo menos 500 pontos em uma partida.",
    icon: "🛡️",
    hint: "Mantenha o bom desempenho e ultrapasse 500 pontos em um único jogo.",
    target: 500,
    test: (summary) => Number(summary?.score ?? 0) >= 500 && Number(summary?.vidasRestantes ?? 0) >= 1,
  },
  {
    id: "quase-um-milagre",
    name: "Quase um Milagre",
    description: "Terminar uma partida com exatamente uma vida restante.",
    icon: "✨",
    hint: "Chegue ao fim da partida com uma vida sobrando.",
    target: 1,
    test: (summary) => Number(summary?.vidasRestantes ?? 0) === 1,
  },
  {
    id: "velocista",
    name: "Velocista",
    description: "Completar um minigame em até 10 segundos.",
    icon: "⚡",
    hint: "Faça um minigame em até 10 segundos para mostrar agilidade.",
    target: 10,
    test: (summary) => Number(summary?.minigameMaisRapidoMs ?? Number.POSITIVE_INFINITY) <= 10000,
  },
  {
    id: "colecionador-de-pontos",
    name: "Colecionador de Pontos",
    description: "Alcançar pelo menos 1.000 pontos em uma partida.",
    icon: "🏆",
    hint: "Acumule 1.000 pontos ou mais em uma mesma partida.",
    target: 1000,
    test: (summary) => Number(summary?.score ?? 0) >= 1000,
  },
  {
    id: "persistente",
    name: "Persistente",
    description: "Completar 10 partidas.",
    icon: "🔁",
    hint: "Volte ao jogo e alcance 10 partidas concluídas no total.",
    target: 10,
    test: (summary) => Number(summary?.partidasTotaisApos ?? 0) >= 10,
  },
  {
    id: "veterano-do-ifc",
    name: "Veterano do IFC",
    description: "Completar 5 fases.",
    icon: "🎓",
    hint: "Passe por cinco fases para provar que você domina o desafio.",
    target: 5,
    test: (summary) => Number(summary?.partidasTotaisApos ?? 0) >= 5 || Number(summary?.score ?? 0) >= 5,
  },
  {
    id: "sem-medo",
    name: "Sem Medo",
    description: "Completar 5 minigames consecutivos sem falhar.",
    icon: "😤",
    hint: "Mantém a sequência e conclua 5 minigames seguidos sem errar.",
    target: 5,
    test: (summary) => Number(summary?.sequenciaMaxima ?? 0) >= 5,
  },
];

export function normalizeAchievement(item) {
  if (!item || typeof item !== "object") return null;

  const referencia = ACHIEVEMENT_DEFS.find((definicao) => definicao.id === item.id);

  return {
    id: item.id,
    name: item.name || referencia?.name || "Conquista",
    description: item.description || referencia?.description || "Conquista desbloqueada.",
    icon: item.icon || referencia?.icon || "🏆",
    unlockedAt: item.unlockedAt || item.desbloqueado_em || item.unlocked_at || null,
  };
}

export function getAchievementStorageKey({ userId = null, demoMode = false } = {}) {
  if (demoMode || !userId) {
    return "jbifc_achievements_demo";
  }

  return `jbifc_achievements_${String(userId)}`;
}

export function getPartidasTotaisStorageKey({ userId = null, demoMode = false } = {}) {
  if (demoMode || !userId) {
    return "jbifc_partidas_totais_demo";
  }

  return `jbifc_partidas_totais_${String(userId)}`;
}

export function readAchievementList({ userId = null, demoMode = false } = []) {
  if (typeof window === "undefined") return [];

  try {
    const key = getAchievementStorageKey({ userId, demoMode });
    const raw = window.localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];

    return Array.isArray(parsed)
      ? parsed.map(normalizeAchievement).filter(Boolean)
      : [];
  } catch {
    return [];
  }
}

export function writeAchievementList(items, { userId = null, demoMode = false } = {}) {
  if (typeof window === "undefined") return [];

  const key = getAchievementStorageKey({ userId, demoMode });
  const normalizados = Array.isArray(items)
    ? items.map(normalizeAchievement).filter(Boolean)
    : [];

  window.localStorage.setItem(key, JSON.stringify(normalizados));
  return normalizados;
}

export function readPartidasTotais({ userId = null, demoMode = false } = {}) {
  if (typeof window === "undefined") return 0;

  try {
    const key = getPartidasTotaisStorageKey({ userId, demoMode });
    const valor = Number(window.localStorage.getItem(key) ?? 0);
    return Number.isFinite(valor) && valor >= 0 ? valor : 0;
  } catch {
    return 0;
  }
}

export function writePartidasTotais(valor, { userId = null, demoMode = false } = {}) {
  if (typeof window === "undefined") return 0;

  const total = Math.max(0, Number(valor) || 0);
  const key = getPartidasTotaisStorageKey({ userId, demoMode });
  window.localStorage.setItem(key, String(total));
  return total;
}

export function evaluateAchievementUnlocks(summary, existingAchievements = []) {
  const existentes = (Array.isArray(existingAchievements) ? existingAchievements : []).map((item) => item.id || item.codigo);
  const novas = [];

  for (const item of ACHIEVEMENT_DEFS) {
    if (existentes.includes(item.id)) continue;
    if (item.test(summary)) {
      novas.push({
        id: item.id,
        name: item.name,
        description: item.description,
        icon: item.icon,
        unlockedAt: new Date().toISOString(),
      });
    }
  }

  return novas;
}

export function formatAchievementDate(dataIso) {
  if (!dataIso) return "";

  const data = new Date(dataIso);
  if (Number.isNaN(data.getTime())) return "";

  return data.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
