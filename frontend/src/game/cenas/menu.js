
import Phaser from "phaser";
import { criarTexto } from "../sistema/qualidadeGraficos";

const KONAMI = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];

export default class Menu extends Phaser.Scene {
  constructor() {
    super("Menu");
  }

  create() {
    this.largura = this.scale.width;
    this.altura = this.scale.height;

    this.menuIniciado = false;

    this.iniciarMusica();

    this.cameras.main.setBackgroundColor("#151515");

    this.criarCenario();
    this.criarMosquito();
    this.criarProfessor();
    this.criarCorinthians();
    this.criarTitulo();
    this.criarPlacas();

    if (this.registry.get("introMenuVista")) {
      this.mostrarMenuPronto();
    } else {
      this.registry.set("introMenuVista", true);
      this.animarMosquito();
    }

    this.configurarKonami();
  }

  iniciarMusica() {
    let musicaMenu = this.registry.get("musicaMenu");

    if (
      !musicaMenu ||
      (!musicaMenu.isPlaying && !musicaMenu.isPaused)
    ) {
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
  }

  pararMusicaMenu() {
    const musica = this.registry.get("musicaMenu");

    if (musica) {
      musica.stop();
      musica.destroy();
      this.registry.remove("musicaMenu");
    }
  }

  criarImagemTelaCheia(chave, depth) {
    return this.add
      .image(0, 0, chave)
      .setOrigin(0, 0)
      .setDisplaySize(this.largura, this.altura)
      .setDepth(depth);
  }

  criarCenario() {
    this.criarImagemTelaCheia("menu-ceu", 0);
    this.criarImagemTelaCheia("menu-efeito", 1);
    this.criarImagemTelaCheia("menu-nuvem", 2);
    this.criarImagemTelaCheia("menu-arvore", 3);
    this.criarImagemTelaCheia("menu-grama", 4);
  }

  criarMosquito() {
    const eixoX = this.largura * 0.84;
    const eixoY = this.altura * 0.75;

    this.containerMosquito = this.add.container(
      eixoX,
      eixoY
    ).setDepth(5);

    this.mosquito = this.add
      .image(-eixoX, -eixoY, "menu-mosquito")
      .setOrigin(0, 0)
      .setDisplaySize(this.largura, this.altura);

    this.containerMosquito.add(this.mosquito);
  }

  animarMosquito() {
    this.containerMosquito.setPosition(
      this.largura * 1.5,
      this.altura * 1.5
    );

    this.tweens.add({
      targets: this.containerMosquito,
      x: this.largura * 0.85,
      y: this.altura * 0.80,
      angle: 355,
      duration: 1400,
      ease: "Back.Out",

      onComplete: () => {
        this.containerMosquito.setAngle(-5);
        this.animarFlutuacaoMosquito();
        this.animarTitulo();
      },
    });
  }

  animarFlutuacaoMosquito() {
    this.tweens.add({
      targets: this.containerMosquito,
      y: this.altura * 0.80 - 9,
      duration: 1100,
      ease: "Sine.InOut",
      yoyo: true,
      repeat: -1,
    });

    this.tweens.add({
      targets: this.containerMosquito,
      angle: {
        from: -5,
        to: 5,
      },
      duration: 1800,
      ease: "Sine.InOut",
      yoyo: true,
      repeat: -1,
    });
  }

  criarProfessor() {
    this.professor = this.add.image(0, 0, "professor");

    this.professor.setScale(
      (this.altura * 0.3) / this.professor.height
    );

    this.containerMosquito.add(this.professor);

    this.aplicarProfessor(
      this.registry.get("eggProfessor") === true
    );
  }

  aplicarProfessor(ativo) {
    this.professor.setVisible(ativo);
    this.mosquito.setVisible(!ativo);

    this.registry.set("eggProfessor", ativo);
  }

  criarCorinthians() {
    const alturaImagem = this.altura * 0.45;

    this.corinthians = this.add
      .image(
        this.largura * 0.16,
        this.altura * 0.75,
        "corinthians"
      )
      .setOrigin(0.5)
      .setDepth(5)
      .setAlpha(0)
      .setVisible(false);

    const proporcao =
      this.corinthians.width / this.corinthians.height;

    this.corinthians.setDisplaySize(
      alturaImagem * proporcao,
      alturaImagem
    );
  }

  animarCorinthians() {
    const destinoX = this.largura * 0.16;
    const destinoY = this.altura * 0.75;

    this.tweens.killTweensOf(this.corinthians);

    this.corinthians
      .setPosition(destinoX - 150, destinoY + 20)
      .setAngle(-8)
      .setAlpha(0)
      .setVisible(true);

    this.tweens.add({
      targets: this.corinthians,
      x: destinoX,
      y: destinoY,
      alpha: 1,
      angle: 0,
      duration: 1100,
      ease: "Back.Out",

      onComplete: () => {
        this.tweens.add({
          targets: this.corinthians,
          y: destinoY - 7,
          angle: -3,
          duration: 1500,
          ease: "Sine.InOut",
          yoyo: true,
          repeat: -1,
        });
      },
    });
  }

  esconderCorinthians() {
    this.tweens.killTweensOf(this.corinthians);

    this.tweens.add({
      targets: this.corinthians,
      alpha: 0,
      x: this.corinthians.x - 100,
      duration: 400,
      ease: "Sine.In",

      onComplete: () => {
        this.corinthians.setVisible(false);
      },
    });
  }

  criarTitulo() {
    this.titulo = this.add
      .image(0, -this.altura, "menu-titulo1")
      .setOrigin(0, 0)
      .setDisplaySize(this.largura, this.altura)
      .setDepth(6)
      .setAlpha(0);
  }

  animarTitulo() {
    this.tweens.add({
      targets: this.titulo,
      y: 0,
      alpha: 1,
      duration: 650,
      ease: "Bounce.Out",

      onComplete: () => {
        this.animarFlutuacaoTitulo();
        this.animarPlaca();
      },
    });
  }

  animarFlutuacaoTitulo() {
    this.tweens.add({
      targets: this.titulo,
      y: -3,
      duration: 1800,
      ease: "Sine.InOut",
      yoyo: true,
      repeat: -1,
    });
  }

  criarPlacas() {
    this.imagemPlacas = this.add
      .image(0, this.altura, "menu-placa")
      .setOrigin(0, 0)
      .setDisplaySize(this.largura, this.altura)
      .setDepth(7);

    const itens = [
      {
        texto: "JOGAR",
        y: 337,
        acao: () => {
          this.pararMusicaMenu();
          this.scene.start("Partida");
        },
      },
      {
        texto: "PRÁTICA",
        y: 482,
        acao: () => this.abrirCena("Pratica"),
      },
      {
        texto: "OPÇÕES",
        y: 627,
        acao: () => this.scene.start("Opcoes"),
      },
    ];

    this.botoes = [];

    itens.forEach((item) => {
      const rotulo = criarTexto(
        this,
        this.largura / 2 - 12,
        item.y,
        item.texto,
        {
          fontFamily: "PressStart2P",
          fontSize: "30px",
          color: "#ffffff",
          stroke: "#3b2410",
          strokeThickness: 5,
        }
      )
        .setOrigin(0.5)
        .setDepth(8)
        .setAlpha(0);

      const zona = this.add
        .zone(
          this.largura / 2 - 12,
          item.y,
          260,
          68
        )
        .setDepth(9);

      this.botoes.push({
        rotulo,
        zona,
        acao: item.acao,
      });
    });
  }

  animarPlaca() {
    this.tweens.add({
      targets: this.imagemPlacas,
      y: 0,
      duration: 850,
      ease: "Back.Out",

      onComplete: () => {
        this.animarBotoes(0);
      },
    });
  }

  animarBotoes(indice) {
    if (indice >= this.botoes.length) {
      this.menuIniciado = true;
      return;
    }

    const item = this.botoes[indice];

    this.tweens.add({
      targets: item.rotulo,
      alpha: 1,
      duration: 350,
      ease: "Sine.Out",

      onComplete: () => {
        this.configurarInteracao(item);

        this.time.delayedCall(180, () => {
          this.animarBotoes(indice + 1);
        });
      },
    });
  }

  configurarInteracao(item) {
    const { rotulo, zona, acao } = item;

    zona.setInteractive({
      useHandCursor: true,
    });

    zona.on("pointerover", () => {
      this.tweens.add({
        targets: rotulo,
        scale: 1.08,
        duration: 150,
        ease: "Sine.Out",
      });

      rotulo.setColor("#67F5A5");
    });

    zona.on("pointerout", () => {
      this.tweens.add({
        targets: rotulo,
        scale: 1,
        duration: 150,
        ease: "Sine.Out",
      });

      rotulo.setColor("#ffffff");
    });

    zona.on("pointerdown", () => {
      if (this.menuIniciado) {
        acao();
      }
    });
  }

  mostrarMenuPronto() {
    this.containerMosquito.setPosition(
      this.largura * 0.85,
      this.altura * 0.80
    );

    this.animarFlutuacaoMosquito();

    this.titulo.setPosition(0, 0).setAlpha(1);
    this.animarFlutuacaoTitulo();

    this.imagemPlacas.setY(0);

    this.botoes.forEach((item) => {
      item.rotulo.setAlpha(1);
      this.configurarInteracao(item);
    });

    this.menuIniciado = true;

    if (this.registry.get("eggProfessor") === true) {
      this.animarCorinthians();
      this.titulo.setTexture("menu-titulo2");
    }
  }

  configurarKonami() {
    const combo = this.input.keyboard.createCombo(KONAMI, {
      resetOnMatch: true,
    });

    const aoCompletar = () => {
      if (!this.menuIniciado) return;

      const ativo =
        this.registry.get("eggProfessor") !== true;

      this.aplicarProfessor(ativo);

      if (ativo) {
        this.titulo.setTexture("menu-titulo2");
        this.animarCorinthians();
      } else {
        this.titulo.setTexture("menu-titulo1");
        this.esconderCorinthians();
      }
    };

    this.input.keyboard.on("keycombomatch", aoCompletar);

    this.events.once("shutdown", () => {
      this.input.keyboard.off("keycombomatch", aoCompletar);
      combo.destroy();
    });
  }

  abrirCena(nome) {
    if (this.scene.manager.keys[nome]) {
      this.scene.start(nome);
    } else {
      console.warn(
        `A cena "${nome}" ainda não foi implementada.`
      );
    }
  }
}
