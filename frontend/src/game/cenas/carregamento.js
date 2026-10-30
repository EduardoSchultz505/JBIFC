import Phaser from "phaser";

export default class Carregamento extends Phaser.Scene {
  constructor() {
    super("Carregamento");
  }

  preload() {
    const { width, height } = this.scale;
    const largura = 400;
    const x = (width - largura) / 2;
    const y = height / 2;

    this.add
      .text(width / 2, y - 40, "Carregando...", {
        fontSize: "32px",
        color: "#67F5A5",
      })
      .setOrigin(0.5);

    const grafico = this.add.graphics();

    grafico.lineStyle(2, 0x67f5a5);
    grafico.strokeRect(x, y, largura, 16);

    this.load.on("progress", (valor) => {
      grafico.clear();
      grafico.lineStyle(2, 0x67f5a5);
      grafico.strokeRect(x, y, largura, 16);
      grafico.fillStyle(0x67f5a5);
      grafico.fillRect(x, y, largura * valor, 16);
    });

    this.load.on("loaderror", (arquivo) => {
      console.error("Falha ao carregar:", arquivo.key, arquivo.src);
    });

    this.load.image("logo", "/game/JBIFC.svg");
    this.load.image("IFC", "/game/IFC.svg");
  }

  create() {
    document.fonts
      .load("16px PressStart2P")
      .then(() => this.scene.start("Opening"));
    this.scene.start("Opening");
  }
}