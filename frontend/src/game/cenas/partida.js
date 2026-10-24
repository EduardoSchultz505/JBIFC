import Phaser from "phaser";

// Pega o export default de cada arquivo de src/jogo/minigame
const MINIGAMES = Object.values(
  import.meta.glob("../minigame/*.js", { eager: true })
)
  .map((modulo) => modulo.default)
  .filter(Boolean);

const VIDAS = 3;
const PONTOS_POR_VITORIA = 10;
const TEMPO_INSTRUCAO = 1000; // ms
const TEMPO_FEEDBACK = 900; // ms
const TEMPO_MINIMO = 1500; // ms (RN06)

export default class Partida extends Phaser.Scene {
  constructor() {
    super("Partida");
  }

  init() {
    this.vidas = VIDAS;
    this.pontos = 0;
    this.sequencia = 0;
    this.ultimo = null;
    this.minigame = null;
    this.estado = "instrucao"; // instrucao | jogando | feedback | fim
  }

  create() {
    const { width, height } = this.scale;

    this.textoPontos = this.add.text(16, 12, "", { fontSize: "24px", color: "#FFC93C" });
    this.textoVidas = this.add
      .text(width - 16, 12, "", { fontSize: "24px", color: "#ffffff" })
      .setOrigin(1, 0);
    this.textoCentro = this.add
      .text(width / 2, height / 2, "", {
        fontSize: "56px",
        fontStyle: "bold",
        color: "#ffffff",
        align: "center",
      })
      .setOrigin(0.5)
      .setDepth(10);
    this.barra = this.add
      .rectangle(0, height - 6, width, 8, 0xffc93c)
      .setOrigin(0, 0.5)
      .setScale(0, 1);

    // Se sair no meio da rodada, limpa o minigame
    this.events.once("shutdown", () => this.minigame?.destruir());

    this.atualizarHud();

    if (MINIGAMES.length === 0) {
      this.textoCentro.setText("Nenhum minigame\nem src/jogo/minigame").setFontSize(32);
      return;
    }
    this.proximaRodada();
  }

  atualizarHud() {
    this.textoPontos.setText(`Pontos: ${this.pontos}`);
    this.textoVidas.setText(`Vidas: ${this.vidas}`);
  }

  // Nunca o mesmo minigame duas vezes seguidas (RF02)
  sortear() {
    const opcoes =
      MINIGAMES.length > 1 ? MINIGAMES.filter((M) => M !== this.ultimo) : MINIGAMES;
    const escolhido = Phaser.Utils.Array.GetRandom(opcoes);
    this.ultimo = escolhido;
    return escolhido;
  }

  // RN06: -10% a cada 5 vitórias seguidas, mínimo de 1,5 s
  calcularTempo(duracaoBase) {
    const ms = duracaoBase * 1000 * 0.9 ** Math.floor(this.sequencia / 5);
    return Math.max(TEMPO_MINIMO, ms);
  }

  proximaRodada() {
    const Minigame = this.sortear();
    this.minigame = new Minigame(this);
    this.estado = "instrucao";
    this.barra.setScale(0, 1);
    this.textoCentro.setText(this.minigame.instrucao).setColor("#ffffff");

    this.time.delayedCall(TEMPO_INSTRUCAO, () => {
      this.textoCentro.setText("");
      this.tempoTotal = this.calcularTempo(this.minigame.duracao);
      this.tempoRestante = this.tempoTotal;
      this.minigame.iniciar();
      this.estado = "jogando";
    });
  }

  update(_, delta) {
    if (this.estado !== "jogando") return;

    this.tempoRestante -= delta;
    this.barra.setScale(Math.max(0, this.tempoRestante / this.tempoTotal), 1);
    this.minigame.atualizar(delta);

    let resultado = this.minigame.resultado(); // jogando | ganhou | perdeu
    if (resultado === "jogando" && this.tempoRestante <= 0) {
      // Minigames de "sobreviver" definem venceAoFimDoTempo = true
      resultado = this.minigame.venceAoFimDoTempo ? "ganhou" : "perdeu";
    }
    if (resultado !== "jogando") this.encerrarRodada(resultado === "ganhou");
  }

  encerrarRodada(venceu) {
    this.estado = "feedback";
    this.minigame.destruir();
    this.minigame = null;
    this.barra.setScale(0, 1);

    if (venceu) {
      this.pontos += PONTOS_POR_VITORIA;
      this.sequencia += 1;
      this.textoCentro.setText("ACERTOU!").setColor("#67F5A5");
    } else {
      this.vidas -= 1;
      this.sequencia = 0;
      this.textoCentro.setText("ERROU!").setColor("#CD191E");
    }
    this.atualizarHud();

    this.time.delayedCall(TEMPO_FEEDBACK, () => {
      if (this.vidas > 0) this.proximaRodada();
      else this.terminar();
    });
  }

  terminar() {
    const { width, height } = this.scale;
    this.estado = "fim";
    this.textoCentro.setText(`Fim de jogo\n${this.pontos} pontos`).setColor("#ffffff");
    this.add
      .text(width / 2, height / 2 + 110, "Enter para jogar de novo", { fontSize: "22px" })
      .setOrigin(0.5);

    // O React escuta isso e envia a pontuação à API (RN05: uma vez por partida)
    this.game.events.emit("fim-de-partida", this.pontos);

    this.input.keyboard.once("keydown-ENTER", () => this.scene.restart());
  }
}