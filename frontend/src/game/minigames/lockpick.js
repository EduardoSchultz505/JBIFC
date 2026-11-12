import Phaser from "phaser";

const TECLAS = ["w", "a", "s", "d"];
const COR_FUNDO = 0x262604;
const FONTE = "PressStart2P";
const TEXTURAS = [
  "lock-portao",
  "lock-porco1",
  "lock-porco2",
  "lock-fuca1",
  "lock-fuca2",
  "lock-lockpick1",
  "lock-lockpick2",
  "lock-lockpick3",
  "lock-lockpick4",
  "lock-lockpick5",
  "lock-lockpick6",
];
const INTERVALO_PORCO = 500; 

export default class Lockpick {
  instrucao = "ARROMBE";
  duracao = 15;

  constructor(scene) {
    this.scene = scene;
    this.estado = "jogando";
    this.total = 12; 
    this.encaixado = false; 
    this.acertos = 0;
    this.sequencia = [];
  }

  iniciar() {
    const { width, height } = this.scene.scale;
    const cx = width / 2;
    const cy = height / 2;

    
    TEXTURAS.filter((chave) => this.scene.textures.exists(chave)).forEach((chave) =>
      this.scene.textures.get(chave).setFilter(Phaser.Textures.FilterMode.NEAREST)
    );

    
    for (let i = 0; i < this.total; i++) {
      const opcoes = TECLAS.filter((t) => t !== this.sequencia[i - 1]);
      this.sequencia.push(Phaser.Utils.Array.GetRandom(opcoes));
    }

    
    const tela = (chave, depth) =>
      this.scene.add
        .image(cx, cy, chave)
        .setDisplaySize(width, height)
        .setDepth(depth);

    this.fundo = this.scene.add
      .rectangle(cx, cy, width, height, COR_FUNDO)
      .setDepth(0);
    this.porco = tela("lock-porco1", 0.5);
    this.fuca = tela("lock-fuca1", 0.6);
    this.portao = tela("lock-portao", 1); 
    this.lockpick = tela("lock-lockpick1", 2).setVisible(false);

    
    this.quadroPorco = 1;
    this.timerPorco = this.scene.time.addEvent({
      delay: INTERVALO_PORCO,
      loop: true,
      callback: () => {
        this.quadroPorco = this.quadroPorco === 1 ? 2 : 1;
        this.porco.setTexture(`lock-porco${this.quadroPorco}`);
        this.fuca.setTexture(`lock-fuca${this.quadroPorco}`);
      },
    });

    this.textoTecla = this.scene.add
      .text(cx, 70, "", {
        fontFamily: FONTE,
        fontSize: "64px",
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setDepth(10);

    this.atualizarHud();

    
    document.fonts?.load(`64px PressStart2P`).then(() => {
      if (this.textoTecla?.active) this.textoTecla.style.update(true);
    });

    this.aoTecla = (ev) => this.tecla(ev);
    this.scene.input.keyboard.on("keydown", this.aoTecla);
  }

  atualizar() {}

  tecla(ev) {
    if (this.estado !== "jogando" || ev.repeat) return;
    const t = ev.key.toLowerCase();

    
    if (!this.encaixado) {
      if (t === "e") {
        this.encaixado = true;
        this.lockpick.setTexture("lock-lockpick1").setVisible(true);
        this.atualizarHud();
      }
      return;
    }

    if (!TECLAS.includes(t)) return; 

    if (t === this.sequencia[this.acertos]) {
      this.acertos++;
      if (this.acertos >= this.total) {
        this.vencer();
      } else if (this.acertos % 2 === 0) {
        
        this.lockpick.setTexture(`lock-lockpick${this.acertos / 2 + 1}`);
      }
    } else {
      this.errar();
    }
    this.atualizarHud();
  }

  vencer() {
    this.estado = "ganhou";
  }

  
  errar() {
    this.estado = "perdeu";
  }

  atualizarHud() {
    if (this.estado === "ganhou") {
      this.textoTecla.setText("ABERTO!");
    } else if (this.estado === "perdeu") {
      this.textoTecla.setText("TRAVOU");
    } else if (!this.encaixado) {
      this.textoTecla.setText("E");
    } else {
      this.textoTecla.setText(this.sequencia[this.acertos].toUpperCase());
    }
  }

  resultado() {
    return this.estado;
  }

  destruir() {
    this.scene.input.keyboard.off("keydown", this.aoTecla);
    this.timerPorco?.remove();
    [
      this.fundo,
      this.portao,
      this.porco,
      this.fuca,
      this.lockpick,
      this.textoTecla,
    ].forEach((o) => o?.destroy());
  }
}