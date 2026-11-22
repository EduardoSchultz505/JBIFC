import Phaser from "phaser";

export default class VigiliaDosPorcos {
  static titulo = "VIGÍLIA DOS PORCOS";
  descricao = "Como um guarda noturno, impeça que os alunos causem confusão durante a noite. Fique atento e não deixe ninguém aprontar!";

  controles = [
    "MOUSE: INTERAGIR",
  ];

  duracao = 8;

  constructor(scene) {
    this.scene = scene;
    this.estado = "jogando";

    this.ladroes = [];
    this.quantidade = 3;

    this.raio = 80;
    this.velSetas = 400;
    this.tempoParaAchar = 600;
  }

  iniciar() {
    const { width, height } = this.scene.scale;

    this.origem = {
      x: 60,
      y: height - 50,
    };

    this.centro = {
      x: width / 2,
      y: height / 2,
    };

    this.ultimoMouse = {
      x: -1,
      y: -1,
    };

    
    this.fundo = this.scene.add
      .image(0, 0, "vdp-campo")
      .setOrigin(0)
      .setDisplaySize(width, height)
      .setDepth(0);

    
    const pessoasDisponiveis = Array.from(
      { length: 18 },
      (_, i) => i + 1
    );

    Phaser.Utils.Array.Shuffle(pessoasDisponiveis);

    this.pessoasEscolhidas = pessoasDisponiveis.slice(
      0,
      this.quantidade
    );

    
    this.ladroes = this.pessoasEscolhidas.map((numero) => {
      const obj = this.scene.add
        .image(0, 0, `vdp-pessoa${numero}`)
        .setOrigin(0)
        .setDisplaySize(width, height)
        .setDepth(1)
        .setAlpha(0.90);

      return {
        obj,
        numero,
        mascara: this.criarMascaraPessoa(numero),
        tempoIluminado: 0,
        achado: false,
      };
    });

    
    this.escuro = this.scene.add
      .rectangle(
        width / 2,
        height / 2,
        width,
        height,
        0x000000,
        0.88
      )
      .setDepth(2);

    
    this.feixe = this.scene.add
      .graphics()
      .setDepth(2.5);

    
    this.lanterna = this.scene.add
      .rectangle(
        this.origem.x,
        this.origem.y,
        44,
        20,
        0xffc93c
      )
      .setDepth(3);

    
    this.teclas = this.scene.input.keyboard.createCursorKeys();

    
    this.aoClicar = (pointer) => {
      if (this.estado !== "jogando") return;

      const x = pointer.x;
      const y = pointer.y;

      for (const l of this.ladroes) {
        if (l.achado) continue;

        if (this.pessoaContemPonto(l, x, y)) {
          this.encontrarPessoa(l);
          break;
        }
      }
    };

    this.scene.input.on("pointerdown", this.aoClicar);

    
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

    if (
      p.x !== this.ultimoMouse.x ||
      p.y !== this.ultimoMouse.y
    ) {
      this.ultimoMouse = {
        x: p.x,
        y: p.y,
      };

      this.centro.x = p.x;
      this.centro.y = p.y;
    }

    
    const passo = this.velSetas * (dt / 1000);

    if (this.teclas.left.isDown) {
      this.centro.x -= passo;
    }

    if (this.teclas.right.isDown) {
      this.centro.x += passo;
    }

    if (this.teclas.up.isDown) {
      this.centro.y -= passo;
    }

    if (this.teclas.down.isDown) {
      this.centro.y += passo;
    }

    
    this.centro.x = Phaser.Math.Clamp(
      this.centro.x,
      0,
      width
    );

    this.centro.y = Phaser.Math.Clamp(
      this.centro.y,
      0,
      height
    );

    const { x: cx, y: cy } = this.centro;

    const ang = Phaser.Math.Angle.Between(
      ox,
      oy,
      cx,
      cy
    );

    
    for (const l of this.ladroes) {
      if (l.achado) continue;

      const iluminada = this.pessoaIluminada(
        l,
        cx,
        cy
      );

      if (iluminada) {
        l.tempoIluminado += dt;
      } else {
        
        l.tempoIluminado = Math.max(
          0,
          l.tempoIluminado - dt * 0.5
        );
      }

      if (l.tempoIluminado >= this.tempoParaAchar) {
        this.encontrarPessoa(l);
      }
    }

    
    const D = Phaser.Math.Distance.Between(
      ox,
      oy,
      cx,
      cy
    );

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

      this.feixe.lineTo(
        cx + Math.cos(a1) * r,
        cy + Math.sin(a1) * r
      );

      this.feixe.arc(
        cx,
        cy,
        r,
        a1,
        a2,
        false
      );

      this.feixe.closePath();
      this.feixe.fillPath();
    }

    
    this.lanterna.setRotation(ang);
  }

  
  encontrarPessoa(ladrao) {
    if (ladrao.achado) return;

    ladrao.achado = true;
    ladrao.tempoIluminado = this.tempoParaAchar;

    ladrao.obj
      .setAlpha(1)
      .setDepth(2.1)
      .clearTint();

    
    if (this.ladroes.every((p) => p.achado)) {
      this.estado = "ganhou";
    }
  }

  
  
  criarMascaraPessoa(numero) {
    const textura = this.scene.textures.get(
      `vdp-pessoa${numero}`
    );

    const imagem = textura.getSourceImage();

    const canvas = document.createElement("canvas");

    canvas.width = imagem.naturalWidth || imagem.width;
    canvas.height = imagem.naturalHeight || imagem.height;

    const contexto = canvas.getContext("2d", {
      willReadFrequently: true,
    });

    contexto.drawImage(imagem, 0, 0);

    const dados = contexto.getImageData(
      0,
      0,
      canvas.width,
      canvas.height
    );

    return {
      largura: canvas.width,
      altura: canvas.height,
      pixels: dados.data,
    };
  }

  
  pessoaContemPonto(ladrao, x, y) {
    const mascara = ladrao.mascara;
    const { width, height } = this.scene.scale;

    if (
      x < 0 ||
      y < 0 ||
      x >= width ||
      y >= height
    ) {
      return false;
    }

    const xImagem = Math.floor(
      (x / width) * mascara.largura
    );

    const yImagem = Math.floor(
      (y / height) * mascara.altura
    );

    const indice =
      (yImagem * mascara.largura + xImagem) * 4;

    return mascara.pixels[indice + 3] > 30;
  }

  
  pessoaIluminada(ladrao, cx, cy) {
    const mascara = ladrao.mascara;
    const { width, height } = this.scene.scale;

    const raio = this.raio;
    const passo = 6;

    for (let dy = -raio; dy <= raio; dy += passo) {
      for (let dx = -raio; dx <= raio; dx += passo) {
        if (dx * dx + dy * dy > raio * raio) {
          continue;
        }

        const xTela = cx + dx;
        const yTela = cy + dy;

        if (
          xTela < 0 ||
          yTela < 0 ||
          xTela >= width ||
          yTela >= height
        ) {
          continue;
        }

        const xImagem = Math.floor(
          (xTela / width) * mascara.largura
        );

        const yImagem = Math.floor(
          (yTela / height) * mascara.altura
        );

        const indice =
          (yImagem * mascara.largura + xImagem) * 4;

        if (mascara.pixels[indice + 3] > 30) {
          return true;
        }
      }
    }

    return false;
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
      this.aoClicar
    );

    
    Object.values(this.teclas ?? {}).forEach((tecla) => {
      this.scene.input.keyboard.removeKey(tecla);
    });

    
    this.escuro?.destroy();
    this.feixe?.destroy();
    this.lanterna?.destroy();
    this.fundo?.destroy();

    
    this.ladroes.forEach((l) => {
      l.obj.destroy();
    });
  }
}