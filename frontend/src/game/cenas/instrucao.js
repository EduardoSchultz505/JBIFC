import Phaser from "phaser";

// Exportadas para a Partida reaproveitar no HUD e no feedback
export const FONTE = "PressStart2P";
export const COR = {
  amarelo: "#FFC93C",
  verde: "#67F5A5",
  vermelho: "#CD191E",
  branco: "#FFFFFF",
};

// Tempos em ms: painel entra, fica parado para leitura, painel sai
const TEMPOS = { entrada: 350, leitura: 1800, saida: 350 };
const COR_PAINEL = 0x141b1f;
const OPACIDADE_PAINEL = 0.85;
const CHAVE = "Instrucao";

// A animação roda em uma cena própria, por cima da Partida.
// Enquanto ela toca, a Partida fica pausada: timers, tweens,
// listeners de update e input do minigame ficam congelados.
class CenaInstrucao extends Phaser.Scene {
  constructor() {
    super(CHAVE);
  }

  init(dados) {
    this.dados = dados;
  }

  create() {
    const { minigame, cenaPai } = this.dados;
    const { width, height } = this.scale;
    const k = height / 720;

    const estilo = (tamanho, cor) => ({
      fontFamily: FONTE,
      fontSize: `${Math.round(tamanho * k)}px`,
      color: cor,
      align: "center",
      wordWrap: { width: width * 0.85 },
    });

    // Painel começa com largura 0, preso na borda esquerda
    this.painel = this.add
      .rectangle(0, 0, width, height, COR_PAINEL, OPACIDADE_PAINEL)
      .setOrigin(0, 0)
      .setScale(0, 1);

    this.textos = [
      this.add.text(width / 2, height * 0.32, minigame.titulo ?? minigame.instrucao ?? "", estilo(60, COR.branco)),
      this.add.text(width / 2, height * 0.5, minigame.descricao ?? "", estilo(28, COR.branco)),
      this.add.text(width / 2, height * 0.68, (minigame.controles ?? []).join("   "), estilo(32, COR.amarelo)),
    ];
    this.textos.forEach((t) => t.setOrigin(0.5).setAlpha(0).setResolution(2));

    // Se a Partida for encerrada no meio, esta cena também para
    cenaPai.events.once("shutdown", this.cancelar, this);

    // Entra da esquerda para a direita
    this.tweens.add({
      targets: this.painel,
      scaleX: 1,
      duration: TEMPOS.entrada,
      ease: "Cubic.easeOut",
      onComplete: () => {
        this.tweens.add({ targets: this.textos, alpha: 1, duration: 200 });
        this.time.delayedCall(TEMPOS.leitura, () => this.sair());
      },
    });
  }

  sair() {
    this.tweens.add({ targets: this.textos, alpha: 0, duration: 150 });
    // Volta para a esquerda
    this.tweens.add({
      targets: this.painel,
      scaleX: 0,
      duration: TEMPOS.saida,
      ease: "Cubic.easeIn",
      onComplete: () => this.finalizar(),
    });
  }

  cancelar() {
    this.scene.stop();
  }

  finalizar() {
    const { cenaPai, aoFinalizar } = this.dados;
    cenaPai.events.off("shutdown", this.cancelar, this);
    this.scene.stop();
    cenaPai.scene.resume(); // descongela o minigame
    aoFinalizar();
  }
}

export function mostrarInstrucao(cena, minigame, aoFinalizar) {
  // Registra a cena uma única vez, sem precisar mexer no config do Phaser
  if (!cena.scene.get(CHAVE)) cena.scene.add(CHAVE, CenaInstrucao, false);

  cena.scene.pause();
  cena.scene.launch(CHAVE, { minigame, aoFinalizar, cenaPai: cena });
  cena.scene.bringToTop(CHAVE);
}