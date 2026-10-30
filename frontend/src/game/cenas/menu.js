
import Phaser from "phaser";

export default class Menu extends Phaser.Scene {
  constructor() {
    super("Menu");
  }

  create() {
    const largura = this.scale.width;
    const altura = this.scale.height;
    const k = altura / 450;

    this.cameras.main.setBackgroundColor("#151515");

    this.add
      .text(largura / 2, 105 * k, "A REGULAR", {
        fontFamily: "PressStart2P",
        fontSize: "48px",
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setResolution(2);

    this.add
      .text(largura / 2, 150 * k, "MOSQUITO'S DAY", {
        fontFamily: "PressStart2P",
        fontSize: "32px",
        color: "#2ecc71",
      })
      .setOrigin(0.5)
      .setResolution(2);

    this.criarBotao(largura / 2, 245 * k, "JOGAR", () => this.scene.start("Partida"));
    this.criarBotao(largura / 2, 305 * k, "PRÁTICA", () => this.abrirCena("Pratica"));
    this.criarBotao(largura / 2, 365 * k, "OPÇÕES", () => this.abrirCena("Opcoes"));
  }


  criarBotao(x, y, texto, acao) {
    const botao = this.add
      .text(x, y, texto, {
        fontFamily: "PressStart2P",
        fontSize: "24px",
        color: "#ffffff",
        backgroundColor: "#252525",
        padding: { x: 29, y: 19 },
      })
      .setOrigin(0.5)
      .setResolution(2)
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
