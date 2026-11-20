
import Phaser from "phaser";
import { criarTexto } from "../sistema/qualidadeGraficos";

const TEXTURAS = ["botao", "botao-hover", "corda"];
const PIXEL_ART = false;

const PLACA = { altura: 68, passo: 94, yInicial: 195 };
const CORDA = { largura: 10, afastamento: 0.3, sobra: 6 };
const TITULO = { y1: 60, y2: 105 };

export default class Menu extends Phaser.Scene {
  constructor() {
    super("Menu");
  }

  create() {
    const largura = this.scale.width;
    const altura = this.scale.height;
    const k = altura / 450;

    
    let musicaMenu = this.registry.get("musicaMenu");

    if (!musicaMenu || (!musicaMenu.isPlaying && !musicaMenu.isPaused)) {
      if (musicaMenu) {
        musicaMenu.destroy();
      }

      musicaMenu = this.sound.add("musica-principal", {
        loop: true,
        volume: 0.3,
      });

      this.registry.set("musicaMenu", musicaMenu);
      musicaMenu.play();
    }

    const modo = PIXEL_ART
      ? Phaser.Textures.FilterMode.NEAREST
      : Phaser.Textures.FilterMode.LINEAR;

    TEXTURAS.filter((chave) => this.textures.exists(chave)).forEach((chave) =>
      this.textures.get(chave).setFilter(modo)
    );

    this.cameras.main.setBackgroundColor("#151515");

    criarTexto(this, largura / 2, TITULO.y1 * k, "A REGULAR", {
      fontFamily: "PressStart2P",
      fontSize: `${Math.round(48 * k)}px`,
      color: "#ffffff",
    }).setOrigin(0.5);

    criarTexto(this, largura / 2, TITULO.y2 * k, "MOSQUITO'S DAY", {
      fontFamily: "PressStart2P",
      fontSize: `${Math.round(32 * k)}px`,
      color: "#2ecc71",
    }).setOrigin(0.5);

    const fonte = this.textures.get("botao").getSourceImage();

    this.alturaPlaca = PLACA.altura * k;
    this.larguraPlaca = this.alturaPlaca * (fonte.width / fonte.height);

    const itens = [
      {
        texto: "JOGAR",
        acao: () => {
          this.pararMusicaMenu();
          this.scene.start("Partida");
        },
      },
      {
        texto: "PRÁTICA",
        acao: () => this.abrirCena("Pratica"),
      },
      {
        texto: "OPÇÕES",
        acao: () => {
          this.scene.start("Opcoes");
        },
      },
    ];

    const yInicial = PLACA.yInicial * k;
    const passo = PLACA.passo * k;

    for (let i = 0; i < itens.length - 1; i++) {
      this.criarCordas(largura / 2, yInicial + i * passo, passo, k);
    }

    itens.forEach((item, i) => {
      this.criarBotao(
        largura / 2,
        yInicial + i * passo,
        item.texto,
        item.acao,
        k
      );
    });
  }

  pararMusicaMenu() {
    const musica = this.registry.get("musicaMenu");

    if (musica) {
      musica.stop();
      musica.destroy();
      this.registry.remove("musicaMenu");
    }
  }

  criarCordas(x, yPlaca, passo, k) {
    const sobra = CORDA.sobra * k;
    const topo = yPlaca + this.alturaPlaca / 2 - sobra;
    const comprimento = passo - this.alturaPlaca + sobra * 2;
    const dx = this.larguraPlaca * CORDA.afastamento;

    [-dx, dx].forEach((deslocamento) => {
      this.add
        .image(x + deslocamento, topo, "corda")
        .setOrigin(0.5, 0)
        .setDisplaySize(CORDA.largura * k, comprimento)
        .setDepth(0);
    });
  }

  criarBotao(x, y, texto, acao, k) {
    const placa = this.add.image(0, 0, "botao");
    this.ajustarPlaca(placa);

    const rotulo = criarTexto(this, 0, 0, texto, {
      fontFamily: "PressStart2P",
      fontSize: `${Math.round(26 * k)}px`,
      color: "#ffffff",
      stroke: "#3b2410",
      strokeThickness: Math.round(5 * k),
    }).setOrigin(0.5);

    const botao = this.add.container(x, y, [placa, rotulo]).setDepth(1);

    placa.setInteractive({ useHandCursor: true });

    placa.on("pointerover", () => {
      placa.setTexture("botao-hover");
      this.ajustarPlaca(placa);
      rotulo.setColor("#2ecc71");

      this.tweens.add({
        targets: botao,
        scale: 1.05,
        duration: 100,
      });
    });

    placa.on("pointerout", () => {
      placa.setTexture("botao");
      this.ajustarPlaca(placa);
      rotulo.setColor("#ffffff");

      this.tweens.add({
        targets: botao,
        scale: 1,
        duration: 100,
      });
    });

    placa.on("pointerdown", acao);
  }

  ajustarPlaca(placa) {
    placa.setDisplaySize(this.larguraPlaca, this.alturaPlaca);
  }

  abrirCena(nome) {
    if (this.scene.manager.keys[nome]) {
      this.scene.start(nome);
    } else {
      console.warn(`A cena "${nome}" ainda não foi implementada.`);
    }
  }
}
