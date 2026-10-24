import Phaser from "phaser";
import Menu from "./cenas/menu";
import Carregamento from "./cenas/carregamento";
import Partida from "./cenas/partida";

export function criarJogo(parent) {
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: 800,
    height: 450,
    backgroundColor: "#101522",
    pixelArt: true,
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    scene: [Menu, Carregamento, Partida],
  });
}