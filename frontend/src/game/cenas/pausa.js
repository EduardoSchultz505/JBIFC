
import Phaser from "phaser";
import { COR, FONTE } from "./instrucao.js";
import { criarTexto } from "../sistema/qualidadeGraficos";

export default class Pausa extends Phaser.Scene {
  constructor() {
    super("Pausa");
  }

  create() {
    const { width, height } = this.scale;
    const escala = Math.min(width / 800, height / 450);
    const px = (n) => `${Math.round(n * escala)}px`;

    this.add
      .rectangle(0, 0, width, height, 0x000000, 0.75)
      .setOrigin(0)
      .setInteractive();

    criarTexto(this, width / 2, height * 0.35, "JOGO PAUSADO", {
      fontFamily: FONTE,
      fontSize: px(48),
      color: COR.amarelo,
      align: "center",
    }).setOrigin(0.5);

    this.criarBotao(
      width / 2,
      height * 0.52,
      "CONTINUAR",
      COR.verde,
      () => this.continuar()
    );

    this.criarBotao(
      width / 2,
      height * 0.67,
      "SAIR",
      COR.vermelho,
      () => this.sair()
    );

    this.input.keyboard.on("keydown-ESC", this.continuar, this);
    this.input.keyboard.on("keydown-P", this.continuar, this);

    this.events.once("shutdown", () => {
      this.input.keyboard.off("keydown-ESC", this.continuar, this);
      this.input.keyboard.off("keydown-P", this.continuar, this);
    });
  }

  criarBotao(x, y, texto, cor, callback) {
    const escala = Math.min(
      this.scale.width / 800,
      this.scale.height / 450
    );

    const botao = criarTexto(this, x, y, texto, {
      fontFamily: FONTE,
      fontSize: `${Math.round(25 * escala)}px`,
      color: cor,
      backgroundColor: "#1f2a30",
      padding: { x: 24, y: 14 },
    })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    botao.on("pointerover", () => botao.setAlpha(0.7));
    botao.on("pointerout", () => botao.setAlpha(1));
    botao.on("pointerdown", callback);

    return botao;
  }

  continuar() {
    const partida = this.scene.get("Partida");

    partida.retomarMusica();

    this.scene.resume("Partida");
    this.scene.stop();
  }

  sair() {
    const partida = this.scene.get("Partida");

    partida.pararMusicas();

    this.scene.stop("Partida");
    this.scene.stop();
    this.scene.start("Menu");
  }
}
