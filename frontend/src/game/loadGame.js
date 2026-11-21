
import Phaser from "phaser";

import Menu from "./cenas/menu";
import Carregamento from "./cenas/carregamento";
import Partida from "./cenas/partida";
import Opening from "./cenas/opening";
import Pratica from "./cenas/praticar";
import Opcoes from "./cenas/opcoes";

import {
  obterConfiguracaoRenderizacao,
} from "./sistema/qualidadeGraficos";

const CHAVE_VOLUME = "pixel-arcade-volume";

export function criarJogo(parent) {
  const jogo = new Phaser.Game({
    type: Phaser.AUTO,
    parent,

    width: 1280,
    height: 720,

    ...obterConfiguracaoRenderizacao(),

    backgroundColor: "#757575",

    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      fullscreenTarget: parent,
    },

    scene: [
      Carregamento,
      Opening,
      Menu,
      Partida,
      Pratica,
      Opcoes,
    ],
  });

  const volumeSalvo = Number(
    localStorage.getItem(CHAVE_VOLUME)
  );

  const volume =
    Number.isFinite(volumeSalvo) &&
    volumeSalvo >= 0 &&
    volumeSalvo <= 100
      ? volumeSalvo
      : 100;

  jogo.sound.volume = volume / 100;

  return jogo;
}
