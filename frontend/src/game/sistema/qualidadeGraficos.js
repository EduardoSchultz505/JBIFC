
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


export function obterPerfilQualidade() {
  const nivel = obterNivelQualidade();

  return {
    nivel,
    ...PERFIS[nivel],
  };
}


export function aplicarQualidade(scene) {
  const perfil = obterPerfilQualidade();

  scene.qualidadeGraficos = perfil;
  scene.registry.set("qualidadeGraficos", perfil);

  return perfil;
}


function obterPerfilDaCena(scene) {
  return (
    scene?.qualidadeGraficos ||
    scene?.scene?.qualidadeGraficos ||
    scene?.registry?.get("qualidadeGraficos") ||
    obterPerfilQualidade()
  );
}


export function criarTexto(scene, x, y, conteudo, estilo = {}) {
  const perfil = obterPerfilDaCena(scene);

  
  const texto = scene.add.text(x, y, conteudo, estilo);

  
  texto.setResolution(perfil.resolucaoTexto);

  return texto;
}


export function aplicarQualidadeTexto(texto, scene) {
  if (!texto || typeof texto.setResolution !== "function") {
    return texto;
  }

  const perfil = obterPerfilDaCena(scene);

  texto.setResolution(perfil.resolucaoTexto);

  return texto;
}


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
