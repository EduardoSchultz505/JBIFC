import Phaser from "phaser";

export default class Menu extends Phaser.Scene {
  constructor() {
    super("Menu");
  }

  init(dados) {
    this.erro = dados?.erro;
  }

  create() {
    const { width, height } = this.scale;

    this.add
      .text(width / 2, height / 2 - 70, "JBIFC", { fontSize: "64px", fontStyle: "bold", color: "#67F5A5" })
      .setOrigin(0.5);

    if (this.erro) {
      this.add
        .text(width / 2, height / 2 - 10, "Não foi possível carregar o jogo.", { fontSize: "20px", color: "#ffffff" })
        .setOrigin(0.5);
    }

    const botao = this.add
      .text(width / 2, height / 2 + 50, this.erro ? "Tentar de novo" : "Jogar", {
        fontSize: "28px",
        fontStyle: "bold",
        color: "#1F2A30",
        backgroundColor: "#FFC93C",
        padding: { x: 32, y: 12 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    const iniciar = () => this.scene.start("Carregamento");
    botao.on("pointerdown", iniciar);
    this.input.keyboard.once("keydown-ENTER", iniciar);
    this.input.keyboard.once("keydown-SPACE", iniciar);
  }
}