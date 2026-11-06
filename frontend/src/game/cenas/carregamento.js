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
    

    this.load.image("nsp-fundo", "/game/nao-seja-pego/tela_principal.svg", { width: 2560, height: 1440 })
    this.load.image("nsp-cano", "/game/nao-seja-pego/cano.svg")
    this.load.image("nsp-bird", "/game/nao-seja-pego/fap_bird.svg")
    this.load.image("nsp-bird-bg", "/game/nao-seja-pego/fap_bird_bg.svg")
    this.load.image("nsp-guia", "/game/nao-seja-pego/guia_anonima_bg.svg")
    this.load.image("nsp-guilherme1", "/game/nao-seja-pego/guilherme1.svg")
    this.load.image("nsp-guilherme2", "/game/nao-seja-pego/guilherme2.svg")
    this.load.image("nsp-computador", "/game/nao-seja-pego/computador.svg")
  }

  create() {
    document.fonts
      .load("16px PressStart2P")
      .then(() => this.scene.start("Opening"));
    this.scene.start("Opening");
  }
}