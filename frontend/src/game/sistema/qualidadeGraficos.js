
const CHAVE_QUALIDADE = "pixel-arcade-graficos";

const PERFIS = {
  1: {
    nome: "MUITO BAIXA",
    resolucao: 0.5,
    resolucaoTexto: 0.5,
    quantidadeParticulas: 0,
    efeitos: false,
    efeitosAvancados: false,
  },
  2: {
    nome: "BAIXA",
    resolucao: 0.75,
    resolucaoTexto: 0.75,
    quantidadeParticulas: 5,
    efeitos: true,
    efeitosAvancados: false,
  },
  3: {
    nome: "NORMAL",
    resolucao: 1,
    resolucaoTexto: 1,
    quantidadeParticulas: 10,
    efeitos: true,
    efeitosAvancados: false,
  },
  4: {
    nome: "ALTA",
    resolucao: 1.5,
    resolucaoTexto: 1.5,
    quantidadeParticulas: 20,
    efeitos: true,
    efeitosAvancados: true,
  },
  5: {
    nome: "MUITO ALTA",
    resolucao: 2,
    resolucaoTexto: 2,
    quantidadeParticulas: 30,
    efeitos: true,
    efeitosAvancados: true,
  },
};

// Obtém o nível salvo
export function obterNivelQualidade() {
  try {
    const valor = Number(localStorage.getItem(CHAVE_QUALIDADE));

    return Number.isInteger(valor) && valor >= 1 && valor <= 5
      ? valor
      : 3;
  } catch {
    return 3;
  }
}

// Salva o nível
export function salvarNivelQualidade(nivel) {
  const valor = Number(nivel);

  if (!Number.isInteger(valor) || valor < 1 || valor > 5) {
    return false;
  }

  try {
    localStorage.setItem(CHAVE_QUALIDADE, String(valor));
    return true;
  } catch {
    return false;
  }
}

// Obtém o perfil completo
export function obterPerfilQualidade() {
  const nivel = obterNivelQualidade();

  return {
    nivel,
    ...PERFIS[nivel],
  };
}

// Aplica a qualidade à cena
export function aplicarQualidade(scene) {
  const perfil = obterPerfilQualidade();

  scene.qualidadeGraficos = perfil;
  scene.registry.set("qualidadeGraficos", perfil);

  return perfil;
}

// Localiza o perfil de qualidade da cena
function obterPerfilDaCena(scene) {
  return (
    scene?.qualidadeGraficos ||
    scene?.scene?.qualidadeGraficos ||
    scene?.registry?.get("qualidadeGraficos") ||
    obterPerfilQualidade()
  );
}

// Cria textos já configurados
export function criarTexto(scene, x, y, conteudo, estilo = {}) {
  const perfil = obterPerfilDaCena(scene);

  // Cria o texto usando o método original do Phaser.
  const texto = scene.add.text(x, y, conteudo, estilo);

  // Aplica a resolução definida nas configurações.
  texto.setResolution(perfil.resolucaoTexto);

  return texto;
}

// Aplica a qualidade a um texto já criado
export function aplicarQualidadeTexto(texto, scene) {
  if (!texto || typeof texto.setResolution !== "function") {
    return texto;
  }

  const perfil = obterPerfilDaCena(scene);

  texto.setResolution(perfil.resolucaoTexto);

  return texto;
}

// Configuração do renderizador do Phaser
export function obterConfiguracaoRenderizacao() {
  const perfil = obterPerfilQualidade();

  return {
    resolution: perfil.resolucao,
    render: {
      antialias: false,
      pixelArt: true,
      roundPixels: true,
    },
  };
}
