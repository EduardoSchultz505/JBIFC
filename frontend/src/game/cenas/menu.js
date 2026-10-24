import Phaser from "phaser";

export default class Menu extends Phaser.Scene {
  constructor() {
    super("Menu");
  }

  create() {
    const { width, height } = this.scale;
    this.criarBotaoPlay(width / 2, height / 2);

    this.input.keyboard.once("keydown-SPACE", () => this.iniciar());
    this.input.keyboard.once("keydown-ENTER", () => this.iniciar());
  }

  criarBotaoPlay(x, y) {
    const raio = 64;
    const fundo = this.add.circle(0, 0, raio, 0xffc93c).setStrokeStyle(6, 0x1f2a30);
    const simbolo = this.add.triangle(8, 0, 0, 0, 0, 60, 52, 30, 0x1f2a30);

    const botao = this.add.container(x, y, [fundo, simbolo]);
    fundo.setInteractive(new Phaser.Geom.Circle(raio, raio, raio), Phaser.Geom.Circle.Contains);
    fundo.input.cursor = "pointer";

    fundo.on("pointerout", () => this.escalar(botao, 1));
    fundo.on("pointerdown", () => this.iniciar());
  }

  escalar(alvo, escala) {
    this.tweens.add({ targets: alvo, scale: escala, duration: 120 });
  }

  iniciar() {
    // troque "Partida" pelo nome da sua cena de jogo
    this.scene.start("Partida");
  }
}