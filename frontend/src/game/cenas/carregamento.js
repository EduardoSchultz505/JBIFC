
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

    this.load.svg("logo", "/game/JBIFC.svg");
    this.load.svg("IFC", "/game/IFC.svg");
    this.load.image("professor", "/game/menu/renato.jpg")
    this.load.image("corinthians", "/game/menu/corinthians.png")

    this.load.svg("menu-arvore", "/game/menu/arvore.svg");
    this.load.svg("menu-ceu", "/game/menu/ceu.svg");
    this.load.svg("menu-efeito", "/game/menu/efeito_ceu.svg");
    this.load.svg("menu-grama", "/game/menu/grama.svg");
    this.load.svg("menu-mosquito", "/game/menu/mosquito.svg");
    this.load.svg("menu-nuvem", "/game/menu/nuvem.svg");
    this.load.svg("menu-placa", "/game/menu/placa.svg");
    this.load.svg("menu-titulo1", "/game/menu/titulo1.svg");
    this.load.svg("menu-titulo2", "/game/menu/titulo2.svg");

    this.load.audio("musica-pause", "/game/music/menu_pausa.mp3");
    this.load.audio("musica-principal", "/game/music/menu_principal.mp3");
    this.load.audio("musica-minigame1", "/game/music/minigame1.mp3");
    this.load.audio("musica-minigame2", "/game/music/minigame2.mp3");
    this.load.audio("musica-minigame3", "/game/music/minigame3.mp3");
    this.load.audio("musica-minigame4", "/game/music/minigame4.mp3");
    this.load.audio("musica-corinthians", "/game/music/corinthians.mp3");

    this.load.svg("nsp-fundo","/game/nao-seja-pego/tela_principal.svg");
    this.load.svg("nsp-cano", "/game/nao-seja-pego/cano.svg");
    this.load.svg("nsp-bird", "/game/nao-seja-pego/fap_bird.svg");
    this.load.svg("nsp-bird-bg", "/game/nao-seja-pego/fap_bird_bg.svg");
    this.load.svg("nsp-guia", "/game/nao-seja-pego/guia_anonima_bg.svg");
    this.load.svg("nsp-guilherme1", "/game/nao-seja-pego/guilherme1.svg");
    this.load.svg("nsp-guilherme2", "/game/nao-seja-pego/guilherme2.svg");
    this.load.svg("nsp-computador", "/game/nao-seja-pego/computador.svg");

    this.load.svg("lock-fuca1", "/game/lockpick/fuca_porco1.svg");
    this.load.svg("lock-fuca2", "/game/lockpick/fuca_porco2.svg");
    this.load.svg("lock-lockpick1", "/game/lockpick/lockpick1.svg");
    this.load.svg("lock-lockpick2", "/game/lockpick/lockpick2.svg");
    this.load.svg("lock-lockpick3", "/game/lockpick/lockpick3.svg");
    this.load.svg("lock-lockpick4", "/game/lockpick/lockpick4.svg");
    this.load.svg("lock-lockpick5", "/game/lockpick/lockpick5.svg");
    this.load.svg("lock-lockpick6", "/game/lockpick/lockpick6.svg");
    this.load.svg("lock-porco1", "/game/lockpick/porco_corpo1.svg");
    this.load.svg("lock-porco2", "/game/lockpick/porco_corpo2.svg");
    this.load.svg("lock-portao", "/game/lockpick/portao.svg");

    this.load.svg("vdp-campo", "/game/vigilia-dos-porcos/campo_bg.svg");
    this.load.svg("vdp-pessoa1", "/game/vigilia-dos-porcos/pessoa1.svg");
    this.load.svg("vdp-pessoa2", "/game/vigilia-dos-porcos/pessoa2.svg");
    this.load.svg("vdp-pessoa3", "/game/vigilia-dos-porcos/pessoa3.svg");
    this.load.svg("vdp-pessoa4", "/game/vigilia-dos-porcos/pessoa4.svg");
    this.load.svg("vdp-pessoa5", "/game/vigilia-dos-porcos/pessoa5.svg");
    this.load.svg("vdp-pessoa6", "/game/vigilia-dos-porcos/pessoa6.svg");
    this.load.svg("vdp-pessoa7", "/game/vigilia-dos-porcos/pessoa7.svg");
    this.load.svg("vdp-pessoa8", "/game/vigilia-dos-porcos/pessoa8.svg");
    this.load.svg("vdp-pessoa9", "/game/vigilia-dos-porcos/pessoa9.svg");
    this.load.svg("vdp-pessoa10", "/game/vigilia-dos-porcos/pessoa10.svg");
    this.load.svg("vdp-pessoa11", "/game/vigilia-dos-porcos/pessoa11.svg");
    this.load.svg("vdp-pessoa12", "/game/vigilia-dos-porcos/pessoa12.svg");
    this.load.svg("vdp-pessoa13", "/game/vigilia-dos-porcos/pessoa13.svg");
    this.load.svg("vdp-pessoa14", "/game/vigilia-dos-porcos/pessoa14.svg");
    this.load.svg("vdp-pessoa15", "/game/vigilia-dos-porcos/pessoa15.svg");
    this.load.svg("vdp-pessoa16", "/game/vigilia-dos-porcos/pessoa16.svg");
    this.load.svg("vdp-pessoa17", "/game/vigilia-dos-porcos/pessoa17.svg");
    this.load.svg("vdp-pessoa18", "/game/vigilia-dos-porcos/pessoa18.svg");

    this.load.svg("tot-totem_bg", "/game/totem/totem_bg.svg");
    this.load.svg("tot-certo", "/game/totem/item_certo.svg");
    this.load.svg("tot-errado", "/game/totem/item_errado.svg");
    this.load.svg("tot-papel", "/game/totem/papel.svg");

    this.load.svg("pml-barra-acerto", "/game/pegue-mais-lanche/barra_acerto.svg");
    this.load.svg("pml-barra-fundo", "/game/pegue-mais-lanche/barra_fundo.svg");
    this.load.svg("pml-barra-detalhe", "/game/pegue-mais-lanche/barra_detalhe.svg");
    this.load.svg("pml-mao-tia1", "/game/pegue-mais-lanche/mao_tia1.svg");
    this.load.svg("pml-mao-tia2", "/game/pegue-mais-lanche/mao_tia2.svg");
    this.load.svg("pml-mao1", "/game/pegue-mais-lanche/mao1.svg");
    this.load.svg("pml-mao2", "/game/pegue-mais-lanche/mao2.svg");
    this.load.svg("pml-mao3", "/game/pegue-mais-lanche/mao3.svg");
    this.load.svg("pml-mao4", "/game/pegue-mais-lanche/mao4.svg");
    this.load.svg("pml-mao5", "/game/pegue-mais-lanche/mao5.svg");
    this.load.svg("pml-rosto1", "/game/pegue-mais-lanche/rosto1.svg");
    this.load.svg("pml-rosto2", "/game/pegue-mais-lanche/rosto2.svg");
    this.load.svg("pml-tia-bg", "/game/pegue-mais-lanche/tia_bg.svg");
  }

  create() {
    Promise.allSettled(FONTES.map((f) => document.fonts.load(f))).then(() => {
      if (this.sys.isActive()) {
        this.scene.start("Opening");
      }
    });
  }
}
