// scenes/Carregar.js
import Phaser from "phaser";


export default class Carregar extends Phaser.Scene {
  constructor() {
    super("Carregar");
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
    this.load.on("loaderror", (arquivo) => console.error("falhou:", arquivo.key, arquivo.src));

    // todos os arquivos do jogo são carregados aqui
    this.load.svg("play", "/game/icons/play.svg", { width: 128, height: 128 });
    this.load.image("alvo", "/game/clique/alvo.png");
  }

  create() {
    // só abre o menu depois que o carregamento terminou
    this.scene.start("Menu");
  }
}