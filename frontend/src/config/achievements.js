
export const ACHIEVEMENT_DEFS = [
  {
    id: "primeiro-dia",
    name: "Primeiro Dia",
    description: "Completar a primeira partida.",
    icon: "☀️",
    hint: "Conclua sua primeira partida.",
    target: 1,
    test: (summary) =>
      Number(summary?.partidasTotaisApos ?? 0) >= 1,
  },
  {
    id: "sobrevivente",
    name: "Sobrevivente",
    description: "Vencer 5 minigames em uma mesma partida.",
    icon: "🛡️",
    hint: "Consiga pelo menos 5 vitórias antes do fim da partida.",
    target: 5,
    test: (summary) =>
      Number(summary?.fasesCompletas ?? 0) >= 5,
  },
  {
    id: "quase-um-milagre",
    name: "Quase um Milagre",
    description: "Vencer um minigame com apenas uma vida restante.",
    icon: "✨",
    hint: "Consiga vencer uma rodada quando estiver com apenas uma vida.",
    target: 1,
    test: (summary) =>
      summary?.venceuComUmaVida === true,
  },
  {
    id: "velocista",
    name: "Velocista",
    description: "Vencer um minigame em até 10 segundos.",
    icon: "⚡",
    hint: "Conclua uma rodada vitoriosa em até 10 segundos.",
    target: 10,
    test: (summary) =>
      summary?.minigameMaisRapidoMs != null &&
      Number(summary.minigameMaisRapidoMs) <= 10000,
  },
  {
    id: "colecionador-de-pontos",
    name: "Colecionador de Pontos",
    description: "Vencer 15 minigames em uma mesma partida.",
    icon: "🏆",
    hint: "Alcance 15 vitórias durante uma única partida.",
    target: 15,
    test: (summary) =>
      Number(summary?.fasesCompletas ?? 0) >= 15,
  },
  {
    id: "persistente",
    name: "Persistente",
    description: "Completar 10 partidas.",
    icon: "🔁",
    hint: "Jogue e conclua 10 partidas no total.",
    target: 10,
    test: (summary) =>
      Number(summary?.partidasTotaisApos ?? 0) >= 10,
  },
  {
    id: "veterano-do-ifc",
    name: "Veterano do IFC",
    description: "Vencer 10 minigames em uma mesma partida.",
    icon: "🎓",
    hint: "Alcance 10 vitórias durante uma única partida.",
    target: 10,
    test: (summary) =>
      Number(summary?.fasesCompletas ?? 0) >= 10,
  },
  {
    id: "sem-medo",
    name: "Sem Medo",
    description: "Vencer 5 minigames consecutivos sem falhar.",
    icon: "😤",
    hint: "Mantenha uma sequência de 5 vitórias consecutivas.",
    target: 5,
    test: (summary) =>
      Number(summary?.sequenciaMaxima ?? 0) >= 5,
  },
];

export function normalizeAchievement(item) {
  if (!item || typeof item !== "object") return null;

  const referencia = ACHIEVEMENT_DEFS.find(
    (definicao) => definicao.id === (item.id || item.codigo)
  );

  return {
    id: item.id || item.codigo,
    name: item.name || item.nome || referencia?.name || "Conquista",
    description:
      item.description ||
      item.descricao ||
      referencia?.description ||
      "Conquista desbloqueada.",
    icon: item.icon || item.icone || referencia?.icon || "🏆",
    unlockedAt:
      item.unlockedAt ||
      item.desbloqueado_em ||
      item.unlocked_at ||
      null,
  };
}

export function getAchievementStorageKey({
  userId = null,
  demoMode = false,
} = {}) {
  if (demoMode || !userId) {
    return "jbifc_achievements_demo";
  }

  return `jbifc_achievements_${String(userId)}`;
}

export function getPartidasTotaisStorageKey({
  userId = null,
  demoMode = false,
} = {}) {
  if (demoMode || !userId) {
    return "jbifc_partidas_totais_demo";
  }

  return `jbifc_partidas_totais_${String(userId)}`;
}

export function readAchievementList({
  userId = null,
  demoMode = false,
} = {}) {
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

export function writeAchievementList(
  items,
  { userId = null, demoMode = false } = {}
) {
  if (typeof window === "undefined") return [];

  const key = getAchievementStorageKey({ userId, demoMode });

  const normalizados = Array.isArray(items)
    ? items.map(normalizeAchievement).filter(Boolean)
    : [];

  window.localStorage.setItem(key, JSON.stringify(normalizados));

  return normalizados;
}

export function readPartidasTotais({
  userId = null,
  demoMode = false,
} = {}) {
  if (typeof window === "undefined") return 0;

  try {
    const key = getPartidasTotaisStorageKey({ userId, demoMode });
    const valor = Number(window.localStorage.getItem(key) ?? 0);

    return Number.isFinite(valor) && valor >= 0
      ? valor
      : 0;
  } catch {
    return 0;
  }
}

export function writePartidasTotais(
  valor,
  { userId = null, demoMode = false } = {}
) {
  if (typeof window === "undefined") return 0;

  const total = Math.max(0, Number(valor) || 0);
  const key = getPartidasTotaisStorageKey({ userId, demoMode });

  window.localStorage.setItem(key, String(total));

  return total;
}

export function evaluateAchievementUnlocks(
  summary,
  existingAchievements = []
) {
  const existentes = (
    Array.isArray(existingAchievements)
      ? existingAchievements
      : []
  ).map((item) => item.id || item.codigo);

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
