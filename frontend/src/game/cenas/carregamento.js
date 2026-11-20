
import Phaser from "phaser";
import { criarTexto } from "../sistema/qualidadeGraficos";

const FONTES = ['16px "PressStart2P"', '16px "Inter"'];

export default class Carregamento extends Phaser.Scene {
  constructor() {
    super("Carregamento");
  }

  preload() {
    const { width, height } = this.scale;
    const largura = 400;
    const x = (width - largura) / 2;
    const y = height / 2;

    criarTexto(this, width / 2, y - 40, "Carregando...", {
      fontSize: "32px",
      color: "#67F5A5",
    }).setOrigin(0.5);

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

    this.load.svg("botao", "/game/menu/placa.svg", { scale: 2 });
    this.load.svg("botao-hover", "/game/menu/placa_hover.svg", { scale: 2 });
    this.load.svg("corda", "/game/menu/corda.svg", { scale: 2 });

    this.load.audio("musica-pause", "/game/music/menu_pausa.mp3");
    this.load.audio("musica-principal", "/game/music/menu_principal.mp3");
    this.load.audio("musica-minigame1", "/game/music/minigame1.mp3");
    this.load.audio("musica-minigame2", "/game/music/minigame2.mp3");
    this.load.audio("musica-minigame3", "/game/music/minigame3.mp3");
    this.load.audio("musica-minigame4", "/game/music/minigame4.mp3");

    this.load.image(
      "nsp-fundo",
      "/game/nao-seja-pego/tela_principal.svg",
      { width: 2560, height: 1440 }
    );

    this.load.image("nsp-cano", "/game/nao-seja-pego/cano.svg");
    this.load.image("nsp-bird", "/game/nao-seja-pego/fap_bird.svg");
    this.load.image("nsp-bird-bg", "/game/nao-seja-pego/fap_bird_bg.svg");
    this.load.image("nsp-guia", "/game/nao-seja-pego/guia_anonima_bg.svg");
    this.load.image("nsp-guilherme1", "/game/nao-seja-pego/guilherme1.svg");
    this.load.image("nsp-guilherme2", "/game/nao-seja-pego/guilherme2.svg");
    this.load.image("nsp-computador", "/game/nao-seja-pego/computador.svg");

    this.load.image("lock-fuca1", "/game/lockpick/fuca_porco1.svg");
    this.load.image("lock-fuca2", "/game/lockpick/fuca_porco2.svg");
    this.load.image("lock-lockpick1", "/game/lockpick/lockpick1.svg");
    this.load.image("lock-lockpick2", "/game/lockpick/lockpick2.svg");
    this.load.image("lock-lockpick3", "/game/lockpick/lockpick3.svg");
    this.load.image("lock-lockpick4", "/game/lockpick/lockpick4.svg");
    this.load.image("lock-lockpick5", "/game/lockpick/lockpick5.svg");
    this.load.image("lock-lockpick6", "/game/lockpick/lockpick6.svg");
    this.load.image("lock-porco1", "/game/lockpick/porco_corpo1.svg");
    this.load.image("lock-porco2", "/game/lockpick/porco_corpo2.svg");
    this.load.image("lock-portao", "/game/lockpick/portao.svg");

    this.load.image("vdp-campo", "/game/vigilia-dos-porcos/campo_bg.svg");
    this.load.image("vdp-pessoa1", "/game/vigilia-dos-porcos/pessoa1.svg");
    this.load.image("vdp-pessoa2", "/game/vigilia-dos-porcos/pessoa2.svg");
    this.load.image("vdp-pessoa3", "/game/vigilia-dos-porcos/pessoa3.svg");
    this.load.image("vdp-pessoa4", "/game/vigilia-dos-porcos/pessoa4.svg");
    this.load.image("vdp-pessoa5", "/game/vigilia-dos-porcos/pessoa5.svg");
    this.load.image("vdp-pessoa6", "/game/vigilia-dos-porcos/pessoa6.svg");
    this.load.image("vdp-pessoa7", "/game/vigilia-dos-porcos/pessoa7.svg");
    this.load.image("vdp-pessoa8", "/game/vigilia-dos-porcos/pessoa8.svg");
    this.load.image("vdp-pessoa9", "/game/vigilia-dos-porcos/pessoa9.svg");
    this.load.image("vdp-pessoa10", "/game/vigilia-dos-porcos/pessoa10.svg");
    this.load.image("vdp-pessoa11", "/game/vigilia-dos-porcos/pessoa11.svg");
    this.load.image("vdp-pessoa12", "/game/vigilia-dos-porcos/pessoa12.svg");
    this.load.image("vdp-pessoa13", "/game/vigilia-dos-porcos/pessoa13.svg");
    this.load.image("vdp-pessoa14", "/game/vigilia-dos-porcos/pessoa14.svg");
    this.load.image("vdp-pessoa15", "/game/vigilia-dos-porcos/pessoa15.svg");
    this.load.image("vdp-pessoa16", "/game/vigilia-dos-porcos/pessoa16.svg");
    this.load.image("vdp-pessoa17", "/game/vigilia-dos-porcos/pessoa17.svg");
    this.load.image("vdp-pessoa18", "/game/vigilia-dos-porcos/pessoa18.svg");
  }

  create() {
    Promise.allSettled(FONTES.map((f) => document.fonts.load(f))).then(() => {
      if (this.sys.isActive()) {
        this.scene.start("Opening");
      }
    });
  }
}
