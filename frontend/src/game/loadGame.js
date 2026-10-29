
import Phaser from "phaser";
import Menu from "./cenas/menu";
import Carregamento from "./cenas/carregamento";
import Partida from "./cenas/partida";
import Opening from "./cenas/opening";

export function criarJogo(parent) {
  return new Phaser.Game({
  type: Phaser.AUTO,
  parent,
  width: 800,
  height: 450,
  backgroundColor: "#757575",

  pixelArt: true,
  render: {
  antialias: true,
  antialiasGL: true,
  roundPixels: false,
},

  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    fullscreenTarget: parent,
  },

  scene: [Carregamento, Opening, Menu, Partida],
});
}
