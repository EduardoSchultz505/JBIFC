import Phaser from "phaser";

export default class Menu extends Phaser.Scene {
  constructor() {
    super("Menu");
  }

  preload() {
    this.load.image("play", "/game/icons/play.svg");
  }

  create() {
    const { width, height } = this.scale;

    this.criarBotaoPlay(width / 2, height / 2);

    this.input.keyboard.once("keydown-SPACE", () => this.iniciar());
    this.input.keyboard.once("keydown-ENTER", () => this.iniciar());
  }

  criarBotaoPlay(x, y) {
  const botao = this.add.image(x, y, "play");

  botao.setDisplaySize(128, 128);
  botao.setInteractive({ useHandCursor: true });

  botao.on("pointerdown", () => {
    this.iniciar();
  });
}

  escalar(alvo, escala) {
    this.tweens.add({
      targets: alvo,
      scale: escala,
      duration: 120,
      ease: "Power2"
    });
  }

  iniciar() {
    this.scene.start("Partida");
  }
}
