
import Phaser from "phaser";



export default class JogueSemSerPego {
  instrucao = "SPAME!";
  duracao = 8;

  constructor(scene) {
    this.scene = scene;
    this.estado = "jogando";
    this.cliquesNecessarios = 28;
    this.tolerancia = 400;
    this.tempoProfessor = 1400;
    this.cliques = 0;
    this.fase = "livre";
    this.cronometro = 0;
    this.espera = Phaser.Math.Between(1500, 2500);
  }

  iniciar() {
    const { width, height } = this.scene.scale;

    // Fundo principal
    this.fundo = this.scene.add
      .image(width / 2, height / 2, "nsp-fundo")
      .setDisplaySize(width, height);

    // Monitor / estrutura
    const monX = 30;
    const monY = 105;
    const monW = width * 0.58 - monX;
    const monH = height - monY - 75;

    const telaX = monX + 14;
    const telaY = monY + 14;

    this.telaW = monW - 28;
    const telaH = monH - 28;

    this.telaX = telaX;
    this.chaoY = telaY + telaH - 40;

    // Cano / estrutura do monitor
    this.cano = this.scene.add
      .image(
        monX + monW / 2,
        monY + monH / 2,
        "nsp-cano"
      )
      .setDisplaySize(monW, monH);

    // Fundo da área de jogo
    this.areaJogo = this.scene.add
      .image(
        telaX + this.telaW / 2,
        telaY + telaH / 2,
        "nsp-bird-bg"
      )
      .setDisplaySize(this.telaW, telaH);

    // Guia
    this.guia = this.scene.add
      .image(width * 0.82, height - 120, "nsp-guia")
      .setVisible(false);

    // Personagem
    this.heroi = this.scene.add
      .image(telaX + 30, this.chaoY - 15, "nsp-bird")
      .setDisplaySize(40, 40);

    // Barra de progresso
    this.barraFundo = this.scene.add.rectangle(
      monX + monW / 2,
      height - 40,
      monW,
      18,
      0x1f2a30
    );

    this.barra = this.scene.add
      .rectangle(monX, height - 40, monW, 12, 0x2f9e41)
      .setOrigin(0, 0.5)
      .setScale(0, 1);

    this.barraLargura = monW;

    // Professor
    const px = width * 0.82;

    this.professor = [
      this.scene.add.image(px, height - 120, "nsp-guilherme1"),
      this.scene.add.image(px, height - 120, "nsp-guilherme2"),
    ];

    this.professor.forEach((o) => o.setVisible(false));

    // Aviso
    this.aviso = this.scene.add
      .text(width / 2, 70, "", {
        fontFamily: "Arial",
        fontSize: "48px",
        fontStyle: "bold",
        color: "#cd191e",
      })
      .setOrigin(0.5)
      .setDepth(5);

    // Controles
    this.tecla = this.scene.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );

    this.aoApertar = () => this.apertar();

    this.scene.input.on("pointerdown", this.aoApertar);
    this.tecla.on("down", this.aoApertar);

    // Atualização
    this.aoAtualizar = () => this.quadro();
    this.scene.events.on("update", this.aoAtualizar);
  }

  atualizar() {}

  apertar() {
    if (this.estado !== "jogando") return;

    if (this.fase === "professor") {
      if (this.cronometro > this.tolerancia) {
        this.estado = "perdeu";
        this.aviso.setText("PEGO!");
      }
      return;
    }

    this.cliques++;

    const prog = Math.min(
      1,
      this.cliques / this.cliquesNecessarios
    );

    this.barra.setScale(prog, 1);

    this.heroi.x =
      this.telaX + 30 + prog * (this.telaW - 60);

    this.heroi.y =
      this.chaoY - (this.cliques % 2 ? 30 : 15);

    if (prog >= 1) {
      this.estado = "ganhou";
    }
  }

  quadro() {
    if (this.estado !== "jogando") return;

    this.cronometro += this.scene.game.loop.delta;

    if (
      this.fase === "livre" &&
      this.cronometro >= this.espera
    ) {
      this.fase = "professor";
      this.cronometro = 0;

      this.professor.forEach((o) => o.setVisible(true));

      // Alterna o sprite do professor
      this.professor[0].setVisible(true);
      this.professor[1].setVisible(false);

    } else if (
      this.fase === "professor" &&
      this.cronometro >= this.tempoProfessor
    ) {
      this.fase = "livre";
      this.cronometro = 0;

      this.espera = Phaser.Math.Between(1500, 2500);

      this.professor.forEach((o) => o.setVisible(false));
    }
  }

  resultado() {
    return this.estado;
  }

  destruir() {
    this.scene.events.off("update", this.aoAtualizar);

    this.scene.input.off("pointerdown", this.aoApertar);

    this.tecla?.off("down", this.aoApertar);

    if (this.tecla) {
      this.scene.input.keyboard.removeKey(this.tecla);
    }

    this.fundo?.destroy();
    this.cano?.destroy();
    this.areaJogo?.destroy();
    this.guia?.destroy();
    this.heroi?.destroy();
    this.barraFundo?.destroy();
    this.barra?.destroy();
    this.aviso?.destroy();

    this.professor?.forEach((o) => o.destroy());
  }
}
