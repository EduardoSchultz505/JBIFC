
import Phaser from "phaser";
import { criarTexto } from "../sistema/qualidadeGraficos";


export const FONTE = "PressStart2P";

export const COR = {
  amarelo: "#FFC93C",
  verde: "#67F5A5",
  vermelho: "#CD191E",
  branco: "#FFFFFF",
};


const TEMPOS = {
  entrada: 350,
  leitura: 2800,
  saida: 350,
};

const COR_PAINEL = 0x141b1f;
const OPACIDADE_PAINEL = 0.85;
const CHAVE = "Instrucao";



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


    this.painel = this.add
      .rectangle(0, 0, width, height, COR_PAINEL, OPACIDADE_PAINEL)
      .setOrigin(0, 0)
      .setScale(0, 1);

    this.textos = [
      criarTexto(
        this,
        width / 2,
        height * 0.32,
        minigame.constructor.titulo ?? minigame.titulo ?? minigame.instrucao ?? "",
        estilo(60, COR.branco)
      ),

      criarTexto(
        this,
        width / 2,
        height * 0.5,
        minigame.descricao ?? "",
        estilo(28, COR.branco)
      ),

      criarTexto(
        this,
        width / 2,
        height * 0.68,
        (minigame.controles ?? []).join("\n"),
        estilo(32, COR.amarelo)
      ),
    ];

    this.textos.forEach((texto) => {
      texto.setOrigin(0.5).setAlpha(0);
    });


    cenaPai.events.once("shutdown", this.cancelar, this);


    this.tweens.add({
      targets: this.painel,
      scaleX: 1,
      duration: TEMPOS.entrada,
      ease: "Cubic.easeOut",

      onComplete: () => {
        this.tweens.add({
          targets: this.textos,
          alpha: 1,
          duration: 200,
        });

        this.time.delayedCall(TEMPOS.leitura, () => this.sair());
      },
    });
  }

  sair() {
    this.tweens.add({
      targets: this.textos,
      alpha: 0,
      duration: 150,
    });


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


    cenaPai.scene.resume();

    aoFinalizar();
  }
}

export function mostrarInstrucao(cena, minigame, aoFinalizar) {

  if (!cena.scene.get(CHAVE)) {
    cena.scene.add(CHAVE, CenaInstrucao, false);
  }

  cena.scene.pause();
  cena.scene.launch(CHAVE, {
    minigame,
    aoFinalizar,
    cenaPai: cena,
  });

  cena.scene.bringToTop(CHAVE);
}
