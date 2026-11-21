import Phaser from "phaser";

const TELA = { x: 368, y: 246, w: 408, h: 304 };

const DEBUG = false;

const ESCALA_CANO = 2;
const LINHA_CORPO = 0.75;
const CHAVE_COMPUTADOR = "nsp-computador";

const TEXTURAS = [
  "nsp-fundo",
  "nsp-cano",
  "nsp-bird",
  "nsp-bird-bg",
  "nsp-guia",
  "nsp-guilherme1",
  "nsp-guilherme2",
  CHAVE_COMPUTADOR,
];

const CANO_ALTO = "nsp-cano-alto";

export default class JogueSemSerPego {
  titulo = "JONHA BIRD";
  descricao = "Jogue o clássico Jonha Bird, mas cuidado! O professor não pode ver você jogando. Quando ele aparecer, esconda o jogo rapidamente apertando E.";
  controles = [
    "ESPAÇO / MOUSE 1: PULAR",
    "E: ALT + TAB",
  ];
  duracao = 8;
  venceAoFimDoTempo = true;

  constructor(scene) {
    this.scene = scene;
    this.estado = "jogando";

    this.ritmo = 1;

    this.gravidade = 900;
    this.impulso = -290;
    this.velocidade = 150;
    this.abertura = 130;
    this.larguraCano = 64;
    this.intervaloCano = 1300;
    this.proximoCano = 600;
    this.passaroX = TELA.x + 70;
    this.vy = this.impulso;
    this.canos = [];

    this.fase = "livre";
    this.cronometro = 0;

    this.espera = Phaser.Math.Between(1200, 2200);

    this.tempoChegando = 400;
    this.tempoOlhando = 1400;
    this.tempoSaindo = 450;

    this.tolerancia = 350;

    this.saida = null;
    this.escondido = false;

    this.professorAtual = null;
  }

  aplicarDificuldade(nivel) {
    this.ritmo = Math.min(1.8, 1 / 0.9 ** nivel);

  }

  iniciar() {
    const { width, height } = this.scene.scale;
    const add = this.scene.add;

    TEXTURAS.filter((chave) =>
      this.scene.textures.exists(chave)
    ).forEach((chave) =>
      this.scene.textures
        .get(chave)
        .setFilter(Phaser.Textures.FilterMode.NEAREST)
    );

    this.montarCano();

    this.camera = this.scene.cameras.add(
      TELA.x,
      TELA.y,
      TELA.w,
      TELA.h
    );

    this.camera.setScroll(TELA.x, TELA.y);

    this.fundo = add
      .image(width / 2, height / 2, "nsp-fundo")
      .setDisplaySize(width, height)
      .setDepth(0);

    const temComputador =
      this.scene.textures.exists(CHAVE_COMPUTADOR);

    if (temComputador) {
      this.computador = add
        .image(width / 2, height / 2, CHAVE_COMPUTADOR)
        .setDisplaySize(width, height)
        .setDepth(0.5);
    }

    this.fundoTela = this.soNoFlappy(
      add
        .image(
          TELA.x + TELA.w / 2,
          TELA.y + TELA.h / 2,
          "nsp-bird-bg"
        )
        .setDisplaySize(TELA.w, TELA.h)
        .setDepth(1)
    );

    this.passaro = this.soNoFlappy(
      add
        .image(
          this.passaroX,
          TELA.y + TELA.h / 2,
          "nsp-bird"
        )
        .setDepth(3)
    );

    this.ajustarAltura(this.passaro, 50);

    this.guia = this.soNoFlappy(
      add
        .image(width / 2, height / 2, "nsp-guia")
        .setDisplaySize(width, height)
        .setDepth(4)
        .setVisible(false)
    );

    this.moldura = this.soNoFlappy(
      add
        .image(
          width / 2,
          height / 2,
          temComputador ? CHAVE_COMPUTADOR : "nsp-fundo"
        )
        .setDisplaySize(width, height)
        .setDepth(4.5)
    );

    const px = width * 0.82;

    this.prof1 = add
      .image(px, height - 10, "nsp-guilherme1")
      .setOrigin(0.5, 1)
      .setDepth(0.25)
      .setVisible(false);

    this.prof2 = add
      .image(px, height - 10, "nsp-guilherme2")
      .setOrigin(0.5, 1)
      .setDepth(0.25)
      .setVisible(false);

    this.ajustarAltura(this.prof1, 800);
    this.ajustarAltura(this.prof2, 800);

    this.profX = px;

    this.profXFora =
      width +
      Math.max(
        this.prof1.displayWidth,
        this.prof2.displayWidth
      ) / 2;

    this.profY = height - 10;

    // Aviso visual para alertas do jogo.
    this.aviso = add
      .text(width / 2, 70, "", {
        fontFamily: "Arial",
        fontSize: "48px",
        fontStyle: "bold",
        color: "#cd191e",
      })
      .setOrigin(0.5)
      .setDepth(8);

    if (DEBUG) {
      this.contorno = add
        .rectangle(
          TELA.x + TELA.w / 2,
          TELA.y + TELA.h / 2,
          TELA.w,
          TELA.h
        )
        .setStrokeStyle(2, 0xff0000)
        .setDepth(20);
    }

    // Controles do jogo.
    this.aoPular = () => this.pular();
    this.aoAba = () => this.alternarAba();

    this.aoToque = (_ponteiro, sobre) => {
      if (sobre.length) return;
      this.pular();
    };

    this.scene.input.on("pointerdown", this.aoToque);

    const teclado = this.scene.input.keyboard;

    this.teclaEspaco = teclado?.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );

    this.teclaE = teclado?.addKey(
      Phaser.Input.Keyboard.KeyCodes.E
    );

    this.teclaEspaco?.on("down", this.aoPular);
    this.teclaE?.on("down", this.aoAba);

    this.aoAtualizar = () => this.quadro();

    this.scene.events.on("update", this.aoAtualizar);
  }

  atualizar() {}

  soNoFlappy(objeto) {
    this.scene.cameras.main.ignore(objeto);
    return objeto;
  }

  montarCano() {
    const fonte = this.scene.textures
      .get("nsp-cano")
      .getSourceImage();

    const w = fonte.width;
    const h = fonte.height;

    this.larguraCano = w * ESCALA_CANO;

    if (this.scene.textures.exists(CANO_ALTO)) return;

    const altura = Math.max(
      h,
      Math.ceil(TELA.h / ESCALA_CANO)
    );

    const textura = this.scene.textures.createCanvas(
      CANO_ALTO,
      w,
      altura
    );

    const ctx = textura.getContext();

    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(fonte, 0, 0);

    const linha = Math.min(
      h - 1,
      Math.floor(h * LINHA_CORPO)
    );

    for (let y = h; y < altura; y++) {
      ctx.drawImage(
        fonte,
        0,
        linha,
        w,
        1,
        0,
        y,
        w,
        1
      );
    }

    textura.refresh();
    textura.setFilter(Phaser.Textures.FilterMode.NEAREST);
  }

  ajustarAltura(img, altura) {
    img.setScale(altura / img.height);
  }

  pular() {
    if (
      this.estado !== "jogando" ||
      this.scene.estado !== "jogando" ||
      this.escondido
    ) {
      return;
    }

    this.vy = this.impulso;
  }

  alternarAba() {
    if (
      this.estado !== "jogando" ||
      this.scene.estado !== "jogando" ||
      this.fase === "livre"
    ) {
      return;
    }

    this.escondido = !this.escondido;
    this.guia.setVisible(this.escondido);
  }

  quadro() {
    if (
      this.estado !== "jogando" ||
      this.scene.estado !== "jogando"
    ) {
      return;
    }

    const delta = this.scene.game.loop.delta * this.ritmo;

    this.cronometro += delta;

    this.atualizarProfessor();

    if (this.estado !== "jogando") return;

    this.animarProfessor(delta);

    if (!this.escondido) {
      this.atualizarFlappy(
        Math.min(delta, 50) / 1000
      );
    }
  }

  atualizarProfessor() {
    if (
      this.fase === "livre" &&
      this.cronometro >= this.espera
    ) {
      this.fase = "chegando";
      this.cronometro = 0;
      this.saida = null;

      this.professorAtual =
        Phaser.Math.Between(1, 2) === 1
          ? this.prof1
          : this.prof2;

      this.prof1.setVisible(false);
      this.prof2.setVisible(false);

      this.professorAtual
        .setPosition(this.profXFora, this.profY)
        .setVisible(true);
    } else if (
      this.fase === "chegando" &&
      this.cronometro >= this.tempoChegando
    ) {
      this.fase = "olhando";
      this.cronometro = 0;
    } else if (this.fase === "olhando") {
      if (
        !this.escondido &&
        this.cronometro >= this.tolerancia
      ) {
        this.perder("PEGO!");
        return;
      }

      if (this.cronometro >= this.tempoOlhando) {
        this.fase = "livre";
        this.cronometro = 0;

        this.espera = Phaser.Math.Between(1200, 2200);

        this.escondido = false;
        this.guia.setVisible(false);

        this.saida = 0;

        this.professorAtual
          .setPosition(this.profX, this.profY)
          .setVisible(true);
      }
    }
  }

  salto(ms) {
    return Math.abs(Math.sin(ms / 60)) * 10;
  }

  animarProfessor(delta) {
    if (this.fase === "chegando" && this.professorAtual) {
      const t = Math.min(
        this.cronometro / this.tempoChegando,
        1
      );

      this.professorAtual.x = Phaser.Math.Linear(
        this.profXFora,
        this.profX,
        t
      );

      this.professorAtual.y =
        this.profY - this.salto(this.cronometro);
    } else if (
      this.saida !== null &&
      this.professorAtual
    ) {
      this.saida += delta;

      const t = Math.min(
        this.saida / this.tempoSaindo,
        1
      );

      this.professorAtual.x = Phaser.Math.Linear(
        this.profX,
        this.profXFora,
        t
      );

      this.professorAtual.y =
        this.profY - this.salto(this.saida);

      if (t >= 1) {
        this.professorAtual.setVisible(false);

        this.professorAtual = null;
        this.saida = null;
      }
    }
  }

  atualizarFlappy(dt) {
    this.vy += this.gravidade * dt;

    this.passaro.y += this.vy * dt;

    this.passaro.rotation = Phaser.Math.Clamp(
      this.vy / 600,
      -0.4,
      0.8
    );

    const meioAltura = this.passaro.displayHeight / 2;

    if (this.passaro.y - meioAltura <= TELA.y) {
      this.passaro.y = TELA.y + meioAltura;
      this.vy = 0;
    }

    if (
      this.passaro.y + meioAltura >=
      TELA.y + TELA.h
    ) {
      this.perder("BATEU!");
      return;
    }

    this.proximoCano -= dt * 1000;

    if (this.proximoCano <= 0) {
      this.criarCano();
      this.proximoCano = this.intervaloCano;
    }

    const bw = this.passaro.displayWidth * 0.7;
    const bh = this.passaro.displayHeight * 0.7;

    for (const cano of this.canos) {
      cano.x -= this.velocidade * dt;

      cano.topo.x = cano.x;
      cano.baixo.x = cano.x;

      const alinhado =
        Math.abs(this.passaro.x - cano.x) <
        (bw + this.larguraCano) / 2;

      const foraDaAbertura =
        this.passaro.y - bh / 2 < cano.gapTop ||
        this.passaro.y + bh / 2 > cano.gapBottom;

      if (alinhado && foraDaAbertura) {
        this.perder("BATEU!");
        return;
      }
    }

    this.canos = this.canos.filter((cano) => {
      if (cano.x > TELA.x - this.larguraCano) {
        return true;
      }

      cano.topo.destroy();
      cano.baixo.destroy();

      return false;
    });
  }

  criarCano() {
    const metade = this.abertura / 2;

    const centro = Phaser.Math.Between(
      TELA.y + 40 + metade,
      TELA.y + TELA.h - 40 - metade
    );

    const x = TELA.x + TELA.w + this.larguraCano;

    const gapTop = centro - metade;
    const gapBottom = centro + metade;

    const add = this.scene.add;

    const topo = this.soNoFlappy(
      add
        .image(x, gapTop, CANO_ALTO)
        .setOrigin(0.5, 1)
        .setFlipY(true)
        .setScale(ESCALA_CANO)
        .setDepth(2)
    );

    const baixo = this.soNoFlappy(
      add
        .image(x, gapBottom, CANO_ALTO)
        .setOrigin(0.5, 0)
        .setScale(ESCALA_CANO)
        .setDepth(2)
    );

    this.canos.push({
      x,
      gapTop,
      gapBottom,
      topo,
      baixo,
    });
  }

  perder() {
    this.estado = "perdeu";
  }

  resultado() {
    return this.estado;
  }

  destruir() {
    this.scene.events.off(
      "update",
      this.aoAtualizar
    );

    this.scene.input.off(
      "pointerdown",
      this.aoToque
    );

    this.teclaEspaco?.off(
      "down",
      this.aoPular
    );

    this.teclaE?.off(
      "down",
      this.aoAba
    );

    const teclado = this.scene.input.keyboard;

    if (this.teclaEspaco) {
      teclado?.removeKey(this.teclaEspaco);
    }

    if (this.teclaE) {
      teclado?.removeKey(this.teclaE);
    }

    this.canos.forEach((c) => {
      c.topo.destroy();
      c.baixo.destroy();
    });

    this.canos = [];

    [
      this.fundo,
      this.computador,
      this.fundoTela,
      this.passaro,
      this.guia,
      this.prof1,
      this.prof2,
      this.aviso,
      this.moldura,
      this.contorno,
    ].forEach((o) => o?.destroy());

    if (this.camera) {
      this.scene.cameras.remove(this.camera);
    }
  }
}