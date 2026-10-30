
import Phaser from "phaser";

export default class Menu extends Phaser.Scene {
  constructor() {
    super("Menu");
  }

  create() {
    const largura = this.scale.width;
    // eslint-disable-next-line no-unused-vars
    const altura = this.scale.height;

    this.cameras.main.setBackgroundColor("#151515");

    this.add
      .text(largura / 2, 105, "A REGULAR", {
        fontFamily: "PressStart2P",
        fontSize: "30px",
        color: "#ffffff",
        align: "center",
      })
      .setOrigin(0.5);

    this.add
      .text(largura / 2, 150, "MOSQUITO'S DAY", {
        fontFamily: "PressStart2P",
        fontSize: "20px",
        color: "#2ecc71",
        align: "center",
      })
      .setOrigin(0.5);

    this.criarBotao(
      largura / 2,
      245,
      "JOGAR",
      () => this.scene.start("Partida")
    );

    this.criarBotao(
      largura / 2,
      305,
      "PRÁTICA",
      () => this.abrirCena("Pratica")
    );

    this.criarBotao(
      largura / 2,
      365,
      "OPÇÕES",
      () => this.abrirCena("Opcoes")
    );
  }

  criarBotao(x, y, texto, acao) {
    const botao = this.add
      .text(x, y, texto, {
        fontFamily: "PressStart2P",
        fontSize: "14px",
        color: "#ffffff",
        backgroundColor: "#252525",
        padding: {
          x: 18,
          y: 12,
        },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    botao.on("pointerover", () => {
      botao.setStyle({
        color: "#2ecc71",
        backgroundColor: "#303030",
      });

      this.tweens.add({
        targets: botao,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 100,
      });
    });

    botao.on("pointerout", () => {
      botao.setStyle({
        color: "#ffffff",
        backgroundColor: "#252525",
      });

      this.tweens.add({
        targets: botao,
        scaleX: 1,
        scaleY: 1,
        duration: 100,
      });
    });

    botao.on("pointerdown", acao);
  }

  abrirCena(nome) {
    if (this.scene.manager.keys[nome]) {
      this.scene.start(nome);
    } else {
      console.warn(`A cena "${nome}" ainda não foi implementada.`);
    }
  }
}
