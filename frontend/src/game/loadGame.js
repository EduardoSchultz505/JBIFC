
import Phaser from "phaser";
import Menu from "./cenas/menu";
import Carregamento from "./cenas/carregamento";
import Partida from "./cenas/partida";
import Opening from "./cenas/opening";
import Pratica from "./cenas/praticar";

export function criarJogo(parent) {
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: 1280,
    height: 720,
    backgroundColor: "#757575",
    render: { antialias: true, roundPixels: false },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      fullscreenTarget: parent,
    },
    scene: [Carregamento, Opening, Menu, Partida, Pratica],
  });
}
