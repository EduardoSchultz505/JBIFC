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

    
    this.cenario = [
      this.scene.add.rectangle(width / 2, height / 2, width, height, 0xf7f4ea),
    ];

    
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

    this.cenario.push(
      this.scene.add.rectangle(monX + monW / 2, monY + monH / 2, monW, monH, 0x1f2a30),
      
      this.scene.add.rectangle(telaX + this.telaW / 2, telaY + telaH / 2, this.telaW, telaH, 0xa8ddb2),
      this.scene.add.rectangle(telaX + this.telaW / 2, telaY + telaH - 20, this.telaW, 40, 0x2f9e41)
    );
    this.heroi = this.scene.add.rectangle(telaX + 30, this.chaoY - 15, 30, 30, 0xffc93c);

    
    this.barraFundo = this.scene.add.rectangle(monX + monW / 2, height - 40, monW, 18, 0x1f2a30);
    this.barra = this.scene.add
      .rectangle(monX, height - 40, monW, 12, 0x2f9e41)
      .setOrigin(0, 0.5)
      .setScale(0, 1);
    this.barraLargura = monW;

    
    const px = width * 0.82;
    this.professor = [
      this.scene.add.rectangle(px, height - 120, 70, 150, 0x1f2a30),
      this.scene.add.circle(px, height - 215, 28, 0x1f2a30),
      this.scene.add
        .text(px, height - 275, "PARE!", {
          fontSize: "36px",
          fontStyle: "bold",
          color: "#cd191e",
        })
        .setOrigin(0.5),
    ];
    this.professor.forEach((o) => o.setVisible(false));

    this.aviso = this.scene.add
      .text(width / 2, 70, "", {
        fontFamily: "Arial",
        fontSize: "48px",
        fontStyle: "bold",
        color: "#cd191e",
      })
      .setOrigin(0.5)
      .setDepth(5);

    
    this.tecla = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.aoApertar = () => this.apertar();
    this.scene.input.on("pointerdown", this.aoApertar);
    this.tecla.on("down", this.aoApertar);

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
    const prog = Math.min(1, this.cliques / this.cliquesNecessarios);
    this.barra.setScale(prog, 1);
    this.heroi.x = this.telaX + 30 + prog * (this.telaW - 60);
    this.heroi.y = this.chaoY - (this.cliques % 2 ? 30 : 15); 
    if (prog >= 1) this.estado = "ganhou";
  }

  quadro() {
    if (this.estado !== "jogando") return;
    this.cronometro += this.scene.game.loop.delta;

    if (this.fase === "livre" && this.cronometro >= this.espera) {
      this.fase = "professor";
      this.cronometro = 0;
      this.professor.forEach((o) => o.setVisible(true));
    } else if (this.fase === "professor" && this.cronometro >= this.tempoProfessor) {
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
    if (this.tecla) this.scene.input.keyboard.removeKey(this.tecla);
    this.cenario?.forEach((o) => o.destroy());
    this.heroi?.destroy();
    this.barraFundo?.destroy();
    this.barra?.destroy();
    this.aviso?.destroy();
    this.professor?.forEach((o) => o.destroy());
  }
}