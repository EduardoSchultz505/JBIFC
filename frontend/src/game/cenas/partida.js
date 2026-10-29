import Phaser from "phaser";

// Pega o export default de cada arquivo de src/game/minigames.
// Arquivos auxiliares (como a classe base) devem começar com _ para ficarem de fora.
const MINIGAMES = Object.values(
  import.meta.glob(["../minigames/*.js", "!../minigames/_*.js"], { eager: true })
)
  .map((modulo) => modulo.default)
  .filter(Boolean);

const VIDAS = 3;
const PONTOS_POR_VITORIA = 1; // RF07
const TEMPO_INSTRUCAO = 1000; // ms
const TEMPO_FEEDBACK = 900; // ms
const TEMPO_MINIMO = 1500; // ms (RN06)

const FONTE = "PressStart2P";
const COR = { amarelo: "#FFC93C", verde: "#67F5A5", vermelho: "#CD191E", branco: "#FFFFFF" };

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
    // tamanhos proporcionais à altura do jogo (base 720), para o texto não ficar minúsculo no celular
    const k = height / 720;
    const px = (n) => `${Math.round(n * k)}px`;

    this.textoPontos = this.add
      .text(24, 16, "", { fontFamily: FONTE, fontSize: px(40), color: COR.amarelo })
      .setDepth(20);
    this.textoVidas = this.add
      .text(width - 24, 16, "", { fontFamily: FONTE, fontSize: px(40), color: COR.branco })
      .setOrigin(1, 0)
      .setDepth(20);
    this.textoCentro = this.add
      .text(width / 2, height / 2, "", {
        fontFamily: FONTE,
        fontSize: px(110),
        fontStyle: "bold",
        color: COR.branco,
        align: "center",
      })
      .setOrigin(0.5)
      .setDepth(10);
      
this.textoPontos.setResolution(2);
this.textoVidas.setResolution(2);
this.textoCentro.setResolution(3);
    this.barra = this.add
      .rectangle(0, height - 8 * k, width, 12 * k, 0xffc93c)
      .setOrigin(0, 0.5)
      .setScale(0, 1)
      .setDepth(20);

    // Se sair no meio da rodada, limpa o minigame
    this.events.once("shutdown", () => this.limparMinigame());

    this.atualizarHud();

    if (MINIGAMES.length === 0) {
      this.textoCentro.setText("Nenhum minigame\nem src/game/minigames").setFontSize(px(48));
      return;
    }
    this.proximaRodada();
  }

  redimensionar(width, height) {
  const escala = Math.min(width / 800, height / 450);
  const px = (n) => `${Math.round(n * escala)}px`;

  this.textoPontos
    .setPosition(24 * escala, 16 * escala)
    .setFontSize(px(40));

  this.textoVidas
    .setPosition(width - 24 * escala, 16 * escala)
    .setFontSize(px(40));

  this.textoCentro
    .setPosition(width / 2, height / 2)
    .setFontSize(px(110));

  this.barra
    .setPosition(0, height - 8 * escala)
    .setSize(width, 12 * escala);
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
    this.textoCentro.setText(this.minigame.instrucao).setColor(COR.branco);

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
    this.barra.setScale(0, 1);

    if (venceu) {
      this.pontos += PONTOS_POR_VITORIA;
      this.sequencia += 1;
      this.textoCentro.setText("ACERTOU!").setColor(COR.verde);
    } else {
      this.vidas -= 1;
      this.sequencia = 0;
      this.textoCentro.setText("ERROU!").setColor(COR.vermelho);
    }
    this.atualizarHud();

    // o minigame continua visível durante o feedback e só some depois
    this.time.delayedCall(TEMPO_FEEDBACK, () => {
      this.limparMinigame();
      if (this.vidas > 0) this.proximaRodada();
      else this.terminar();
    });
  }

  limparMinigame() {
    this.minigame?.destruir();
    this.minigame = null;
  }

  terminar() {
    this.estado = "fim";
    // O React escuta isso, mostra a tela final e envia a pontuação (RN05: uma vez por partida)
    this.game.events.emit("fim-de-partida", this.pontos);
  }
}