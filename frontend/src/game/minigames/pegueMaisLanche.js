import Phaser from "phaser";

const DEBUG = false;
const FONTE = "PressStart2P"; 
const POS_CONTADOR_Y = 20; 

export default class PegueOLanche {
  static titulo = "PEGUE O LANCHE";
  descricao = "A tia está servindo o lanche! Pare a barra na zona verde 5 vezes para pegar o máximo que conseguir. Errou, perdeu.";
  controles = ["ESPAÇO / MOUSE 1: PARAR A BARRA"];
  duracao = 10;
  venceAoFimDoTempo = false;

  constructor(scene) {
    this.scene = scene;
    this.estado = "jogando";
    this.ritmo = 1;
    this.acertosNecessarios = 5;
    this.acertos = 0;
    this.velocidadeBase = 520; 
    this.direcao = 1;

    
    this.quadrosMao = ["pml-mao1", "pml-mao2", "pml-mao3", "pml-mao2"];
    this.intervaloMao = 200; 
    this.tempoMao = 0;
    this.quadroMao = 0;
  }

  aplicarDificuldade(nivel) {
    this.ritmo = Math.min(1.8, 1 / 0.9 ** nivel);
  }

  
  medir(chave) {
    const { width, height } = this.scene.scale;
    const fonte = this.scene.textures.get(chave).getSourceImage();
    const c = document.createElement("canvas");
    c.width = fonte.width;
    c.height = fonte.height;
    const ctx = c.getContext("2d");
    ctx.drawImage(fonte, 0, 0);
    const d = ctx.getImageData(0, 0, c.width, c.height).data;

    let x0 = c.width, x1 = -1, y0 = c.height, y1 = -1;
    for (let y = 0; y < c.height; y += 2) {
      for (let x = 0; x < c.width; x += 2) {
        if (d[(y * c.width + x) * 4 + 3] > 20) {
          if (x < x0) x0 = x;
          if (x > x1) x1 = x;
          if (y < y0) y0 = y;
          if (y > y1) y1 = y;
        }
      }
    }
    if (x1 < 0) return null;

    const ex = width / c.width;
    const ey = height / c.height;
    return { x0: x0 * ex, x1: (x1 + 1) * ex, y0: y0 * ey, y1: (y1 + 1) * ey };
  }

  iniciar() {
    const { width, height } = this.scene.scale;
    const add = this.scene.add;

    const tela = (chave, depth) =>
      add.image(width / 2, height / 2, chave)
        .setDisplaySize(width, height)
        .setDepth(depth);

    this.tiaBg = tela("pml-tia-bg", 0);
    this.rosto = tela("pml-rosto1", 1);
    this.maoTia = tela("pml-mao-tia1", 2);
    this.maoAluno = tela("pml-mao1", 3);
    this.barraFundo = tela("pml-barra-fundo", 4);
    this.barraDetalhe = tela("pml-barra-detalhe", 5);
    this.barraAcerto = tela("pml-barra-acerto", 6);

    
    this.contador = add
  .text(width / 2, POS_CONTADOR_Y, `0 / ${this.acertosNecessarios}`, {
    fontFamily: FONTE,
    fontSize: "40px",
    color: "#ffffff",
  })
  .setOrigin(0.5, 0)
  .setDepth(8);

    const verde = this.medir("pml-barra-acerto");
    if (!verde) {
      console.warn("PegueOLanche: não consegui medir a zona verde. Confira a chave e o load.svg.");
    }

    
    this.xMin = width * 0.255;
    this.xMax = width * 0.745;
    this.verdeMin = verde?.x0 ?? width * 0.45;
    this.verdeMax = verde?.x1 ?? width * 0.55;
    this.barraY = verde ? (verde.y0 + verde.y1) / 2 : height - 70;
    const altura = verde ? verde.y1 - verde.y0 : 40;

    this.marcadorX = this.xMin;
    this.marcador = add
      .rectangle(this.marcadorX, this.barraY, 8, altura + 16, 0xffffff)
      .setStrokeStyle(2, 0x1f2a30)
      .setDepth(7);

    if (DEBUG) {
      this.contorno = add
        .rectangle(
          (this.verdeMin + this.verdeMax) / 2,
          this.barraY,
          this.verdeMax - this.verdeMin,
          altura
        )
        .setStrokeStyle(2, 0xff0000)
        .setDepth(20);
    }

    this.aoApertar = () => this.apertar();
    this.aoToque = (_ponteiro, sobre) => {
      if (sobre.length) return;
      this.apertar();
    };
    this.scene.input.on("pointerdown", this.aoToque);

    const teclado = this.scene.input.keyboard;
    this.tecla = teclado?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.tecla?.on("down", this.aoApertar);

    this.aoAtualizar = () => this.quadro();
    this.scene.events.on("update", this.aoAtualizar);
  }

  atualizar() {}

  quadro() {
    if (this.estado !== "jogando" || this.scene.estado !== "jogando") return;

    const dt = Math.min(this.scene.game.loop.delta, 50) / 1000;


    
    this.tempoMao += dt * 1000;
    if (this.tempoMao >= this.intervaloMao) {
      this.tempoMao = 0;
      this.quadroMao = (this.quadroMao + 1) % this.quadrosMao.length;
      this.maoAluno.setTexture(this.quadrosMao[this.quadroMao]);
    }

    
    this.marcadorX += this.direcao * this.velocidadeBase * this.ritmo * dt;
    if (this.marcadorX >= this.xMax) {
      this.marcadorX = this.xMax;
      this.direcao = -1;
    } else if (this.marcadorX <= this.xMin) {
      this.marcadorX = this.xMin;
      this.direcao = 1;
    }
    this.marcador.x = this.marcadorX;
  }

  apertar() {
    if (this.estado !== "jogando" || this.scene.estado !== "jogando") return;

    const dentro =
      this.marcadorX >= this.verdeMin && this.marcadorX <= this.verdeMax;
    if (!dentro) {
      this.estado = "perdeu";
      return;
    }

    this.acertos++;
this.contador.setText(`${this.acertos} / ${this.acertosNecessarios}`);


if (this.acertos >= this.acertosNecessarios - 1) {
  this.maoTia.setTexture("pml-mao-tia2");
}

if (this.acertos >= this.acertosNecessarios) {
  this.rosto.setTexture("pml-rosto2");
  this.estado = "ganhou";
}
  }

  resultado() {
    return this.estado;
  }

  destruir() {
    this.scene.events.off("update", this.aoAtualizar);
    this.scene.input.off("pointerdown", this.aoToque);
    this.tecla?.off("down", this.aoApertar);
    if (this.tecla) this.scene.input.keyboard?.removeKey(this.tecla);

    [
      this.tiaBg, this.rosto, this.maoTia, this.maoAluno,
      this.barraFundo, this.barraAcerto, this.barraDetalhe,
      this.marcador, this.contorno, this.contador,
    ].forEach((o) => o?.destroy());
  }
}