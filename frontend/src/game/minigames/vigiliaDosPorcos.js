import Phaser from "phaser";

export default class VigiliaDosPorcos {
  instrucao = "ILUMINE";
  duracao = 8; 

  constructor(scene) {
    this.scene = scene;
    this.estado = "jogando";
    this.ladroes = [];
    this.quantidade = 3;
    this.tempoParaAchar = 600; 
    this.raio = 80;            
    this.velSetas = 400;       
  }

  iniciar() {
    const { width, height } = this.scene.scale;
    this.origem = { x: 60, y: height - 50 };
    this.centro = { x: width / 2, y: height / 2 }; 
    this.ultimoMouse = { x: -1, y: -1 };

    
    this.fundo = [
      this.scene.add.rectangle(width / 2, height / 2, width, height, 0x1e6b2c),
      this.scene.add.ellipse(width * 0.3, height * 0.7, 700, 220, 0x2f9e41),
      this.scene.add.ellipse(width * 0.8, height * 0.75, 600, 200, 0x2f9e41),
    ].map((f) => f.setDepth(0));

    
    while (this.ladroes.length < this.quantidade) {
      const x = Phaser.Math.Between(120, width - 60);
      const y = Phaser.Math.Between(150, height - 110);
      const longe = this.ladroes.every(
        (l) => Phaser.Math.Distance.Between(x, y, l.obj.x, l.obj.y) > 110
      );
      if (!longe) continue;
      const obj = this.scene.add
        .rectangle(x, y, 34, 70, 0x1f2a30)
        .setDepth(2.6)
        .setAlpha(0);
      this.ladroes.push({ obj, luz: 0, achado: false });
    }

    this.escuro = this.scene.add
      .rectangle(width / 2, height / 2, width, height, 0x000000, 0.88)
      .setDepth(2);
    this.feixe = this.scene.add.graphics().setDepth(2.5);
    this.lanterna = this.scene.add
      .rectangle(this.origem.x, this.origem.y, 44, 20, 0xffc93c)
      .setDepth(3);

    this.teclas = this.scene.input.keyboard.createCursorKeys();

    this.aoAtualizar = () => this.quadro();
    this.scene.events.on("update", this.aoAtualizar);
  }

  atualizar() {} 

  quadro() {
    if (this.estado !== "jogando") return;
    const dt = this.scene.game.loop.delta;
    const { width, height } = this.scene.scale;
    const { x: ox, y: oy } = this.origem;
    const r = this.raio;

    
    const p = this.scene.input.activePointer;
    if (p.x !== this.ultimoMouse.x || p.y !== this.ultimoMouse.y) {
      this.ultimoMouse = { x: p.x, y: p.y };
      this.centro.x = p.x;
      this.centro.y = p.y;
    }

    
    const passo = this.velSetas * (dt / 1000);
    if (this.teclas.left.isDown) this.centro.x -= passo;
    if (this.teclas.right.isDown) this.centro.x += passo;
    if (this.teclas.up.isDown) this.centro.y -= passo;
    if (this.teclas.down.isDown) this.centro.y += passo;
    this.centro.x = Phaser.Math.Clamp(this.centro.x, 0, width);
    this.centro.y = Phaser.Math.Clamp(this.centro.y, 0, height);

    const { x: cx, y: cy } = this.centro;
    const ang = Phaser.Math.Angle.Between(ox, oy, cx, cy);

        
    const D = Phaser.Math.Distance.Between(ox, oy, cx, cy);
    this.feixe.clear();
    this.feixe.fillStyle(0xffc93c, 0.3);
    if (D <= r) {
      
      this.feixe.fillCircle(cx, cy, r);
    } else {
      
      const beta = Math.acos(r / D);
      const a1 = ang - (Math.PI - beta);
      const a2 = ang + (Math.PI - beta);
      this.feixe.beginPath();
      this.feixe.moveTo(ox, oy);
      this.feixe.lineTo(cx + Math.cos(a1) * r, cy + Math.sin(a1) * r);
      this.feixe.arc(cx, cy, r, a1, a2, false); 
      this.feixe.closePath();
      this.feixe.fillPath();
    }
    this.lanterna.setRotation(ang);

    
    for (const l of this.ladroes) {
      if (l.achado) continue;
      const dist = Phaser.Math.Distance.Between(cx, cy, l.obj.x, l.obj.y);
      const iluminado = dist < r + 17; 

      l.obj.setAlpha(iluminado ? 1 : 0);
      l.luz = iluminado ? l.luz + dt : Math.max(0, l.luz - dt * 0.5);
      if (l.luz >= this.tempoParaAchar) {
        l.achado = true;
        l.obj.setFillStyle(0xcd191e).setAlpha(1);
      }
    }

    if (this.ladroes.every((l) => l.achado)) this.estado = "ganhou";
  }

  resultado() {
    return this.estado;
  }

  destruir() {
    this.scene.events.off("update", this.aoAtualizar);
    Object.values(this.teclas ?? {}).forEach((k) =>
      this.scene.input.keyboard.removeKey(k)
    );
    this.escuro?.destroy();
    this.feixe?.destroy();
    this.lanterna?.destroy();
    this.fundo?.forEach((f) => f.destroy());
    this.ladroes.forEach((l) => l.obj.destroy());
  }
}