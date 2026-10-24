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

    this.add.text(width / 2, y - 40, "Carregando", { fontSize: "32px", color: "#67F5A5" }).setOrigin(0.5);

    const grafico = this.add.graphics();
    grafico.lineStyle(2, 0x67f5a5).strokeRect(x, y, largura, 16);

    this.load.on("progress", (valor) => {
      grafico.fillStyle(0x67f5a5).fillRect(x, y, largura * valor, 16);
    });

    this.falhou = false;
    this.load.on("loaderror", () => {
      this.falhou = true;
    });

    // Sprites e sons entram aqui
    // this.load.image("jogador", "/sprites/jogador.png");
    // this.load.audio("acerto", "/sons/acerto.mp3");
  }

  create() {
    if (this.falhou) this.scene.start("Menu", { erro: true });
    else this.scene.start("Partida");
  }
}