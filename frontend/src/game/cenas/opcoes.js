
import Phaser from "phaser";

import {
  obterNivelQualidade,
  salvarNivelQualidade,
  criarTexto,
} from "../sistema/qualidadeGraficos";

const FONTE = "PressStart2P";

const CHAVE_VOLUME = "pixel-arcade-volume";

const COR = {
  fundo: "#151515",
  branco: "#FFFFFF",
  verde: "#2ECC71",
  amarelo: "#FFC93C",
  cinza: "#252525",
  vermelho: "#CD191E",
};

export default class Opcoes extends Phaser.Scene {
  constructor() {
    super("Opcoes");
  }

  create() {
    this.cameras.main.setBackgroundColor(COR.fundo);

    this.qualidade = obterNivelQualidade();
    this.qualidadeInicial = this.qualidade;

    this.volume = this.carregarVolume();

    this.botoesQualidade = [];

    this.criarTitulo();
    this.criarOpcoesQualidade();
    this.criarOpcoesAudio();
    this.criarBotaoAplicar();
    this.criarBotaoVoltar();

    this.aplicarVolume();
  }

  // =========================================
  // CONFIGURAÇÕES DE ÁUDIO
  // =========================================

  carregarVolume() {
    const valor = Number(
      localStorage.getItem(CHAVE_VOLUME)
    );

    if (
      Number.isFinite(valor) &&
      valor >= 0 &&
      valor <= 100
    ) {
      return valor;
    }

    return 100;
  }

  salvarVolume() {
    localStorage.setItem(
      CHAVE_VOLUME,
      String(this.volume)
    );
  }

  aplicarVolume() {
    this.sound.volume = this.volume / 100;
  }

  alterarVolume(valor) {
    this.volume = Phaser.Math.Clamp(
      this.volume + valor,
      0,
      100
    );

    this.salvarVolume();
    this.aplicarVolume();
    this.atualizarTextoVolume();
  }

  // =========================================
  // TÍTULO
  // =========================================

  criarTitulo() {
    const { width } = this.scale;

    criarTexto(this, width / 2, 45, "OPÇÕES", {
      fontFamily: FONTE,
      fontSize: "25px",
      color: COR.verde,
    }).setOrigin(0.5);

    criarTexto(this, width / 2, 90, "CONFIGURAÇÕES DO JOGO", {
      fontFamily: FONTE,
      fontSize: "10px",
      color: COR.branco,
    }).setOrigin(0.5);
  }

  // =========================================
  // QUALIDADE GRÁFICA
  // =========================================

  criarOpcoesQualidade() {
    const { width } = this.scale;

    criarTexto(this, width / 2, 145, "QUALIDADE GRÁFICA", {
      fontFamily: FONTE,
      fontSize: "13px",
      color: COR.branco,
    }).setOrigin(0.5);

    criarTexto(this, width / 2, 175, "ESCOLHA UM NÍVEL DE 1 A 5", {
      fontFamily: FONTE,
      fontSize: "8px",
      color: "#AAAAAA",
    }).setOrigin(0.5);

    const espacamento = 85;
    const inicioX = width / 2 - espacamento * 2;

    for (let nivel = 1; nivel <= 5; nivel++) {
      const botao = criarTexto(
        this,
        inicioX + (nivel - 1) * espacamento,
        235,
        String(nivel),
        {
          fontFamily: FONTE,
          fontSize: "18px",
          color: COR.branco,
          backgroundColor: COR.cinza,
          padding: {
            x: 20,
            y: 18,
          },
        }
      )
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

      botao.on("pointerdown", () => {
        this.qualidade = nivel;

        this.atualizarBotoesQualidade();
        this.atualizarAvisoQualidade();
        this.atualizarBotaoAplicar();
      });

      botao.on("pointerover", () => {
        if (nivel !== this.qualidade) {
          botao.setStyle({
            color: COR.verde,
          });
        }
      });

      botao.on("pointerout", () => {
        this.atualizarBotoesQualidade();
      });

      this.botoesQualidade.push({
        nivel,
        botao,
      });
    }

    this.textoQualidade = criarTexto(
      this,
      width / 2,
      290,
      "",
      {
        fontFamily: FONTE,
        fontSize: "9px",
        color: COR.amarelo,
      }
    ).setOrigin(0.5);

    this.atualizarBotoesQualidade();

    // Aviso sobre a necessidade de reiniciar.
    this.textoAviso = criarTexto(
      this,
      width / 2,
      325,
      "",
      {
        fontFamily: FONTE,
        fontSize: "7px",
        color: COR.amarelo,
        align: "center",
      }
    ).setOrigin(0.5);

    this.atualizarAvisoQualidade();
  }

  atualizarBotoesQualidade() {
    this.botoesQualidade.forEach(({ nivel, botao }) => {
      const selecionado = nivel === this.qualidade;

      botao.setStyle({
        color: selecionado ? COR.verde : COR.branco,
        backgroundColor: selecionado
          ? "#303030"
          : COR.cinza,
      });
    });

    this.atualizarTextoQualidade();
  }

  atualizarTextoQualidade() {
    if (!this.textoQualidade) return;

    const descricoes = {
      1: "QUALIDADE MUITO BAIXA",
      2: "QUALIDADE BAIXA",
      3: "QUALIDADE NORMAL",
      4: "QUALIDADE ALTA",
      5: "QUALIDADE MUITO ALTA",
    };

    this.textoQualidade.setText(
      descricoes[this.qualidade] || "QUALIDADE NORMAL"
    );
  }

  atualizarAvisoQualidade() {
    if (!this.textoAviso) return;

    if (this.qualidade !== this.qualidadeInicial) {
      this.textoAviso
        .setText("AVISO: REINICIE O JOGO PARA APLICAR A QUALIDADE.")
        .setColor(COR.amarelo);
    } else {
      this.textoAviso
        .setText("A QUALIDADE ATUAL JÁ ESTÁ APLICADA.")
        .setColor("#AAAAAA");
    }
  }

  // =========================================
  // ÁUDIO
  // =========================================

  criarOpcoesAudio() {
    const { width } = this.scale;

    criarTexto(this, width / 2, 405, "CONFIGURAÇÕES DE ÁUDIO", {
      fontFamily: FONTE,
      fontSize: "13px",
      color: COR.branco,
    }).setOrigin(0.5);

    criarTexto(this, width / 2, 445, "VOLUME GERAL", {
      fontFamily: FONTE,
      fontSize: "9px",
      color: "#AAAAAA",
    }).setOrigin(0.5);

    this.botaoDiminuirVolume = this.criarBotao(
      width / 2 - 100,
      500,
      "-",
      () => this.alterarVolume(-10)
    );

    this.botaoAumentarVolume = this.criarBotao(
      width / 2 + 100,
      500,
      "+",
      () => this.alterarVolume(10)
    );

    this.textoVolume = criarTexto(
      this,
      width / 2,
      500,
      "",
      {
        fontFamily: FONTE,
        fontSize: "13px",
        color: COR.amarelo,
      }
    ).setOrigin(0.5);

    this.atualizarTextoVolume();
  }

  atualizarTextoVolume() {
    if (!this.textoVolume) return;

    this.textoVolume.setText(`${this.volume}%`);

    this.botaoDiminuirVolume.setAlpha(
      this.volume === 0 ? 0.4 : 1
    );

    this.botaoAumentarVolume.setAlpha(
      this.volume === 100 ? 0.4 : 1
    );
  }

  // =========================================
  // APLICAR E REINICIAR
  // =========================================

  criarBotaoAplicar() {
    const { width } = this.scale;

    this.botaoAplicar = criarTexto(
      this,
      width / 2,
      585,
      "APLICAR E REINICIAR",
      {
        fontFamily: FONTE,
        fontSize: "10px",
        color: COR.branco,
        backgroundColor: COR.cinza,
        padding: {
          x: 18,
          y: 14,
        },
      }
    )
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    this.botaoAplicar.on("pointerover", () => {
      this.botaoAplicar.setStyle({
        color: COR.verde,
      });
    });

    this.botaoAplicar.on("pointerout", () => {
      this.botaoAplicar.setStyle({
        color: COR.branco,
      });
    });

    this.botaoAplicar.on("pointerdown", () => {
      this.aplicarConfiguracoes();
    });

    this.atualizarBotaoAplicar();
  }

  atualizarBotaoAplicar() {
    if (!this.botaoAplicar) return;

    const alterou =
      this.qualidade !== this.qualidadeInicial;

    this.botaoAplicar.setAlpha(alterou ? 1 : 0.5);
  }

  aplicarConfiguracoes() {
    if (this.qualidade === this.qualidadeInicial) {
      return;
    }

    const salvou = salvarNivelQualidade(this.qualidade);

    if (!salvou) {
      this.textoAviso
        .setText("ERRO AO SALVAR A CONFIGURAÇÃO.")
        .setColor(COR.vermelho);

      return;
    }

    this.textoAviso
      .setText("REINICIANDO O JOGO...")
      .setColor(COR.verde);

    // Recarrega a página para recriar o Phaser
    // com a nova configuração de renderização.
    this.time.delayedCall(400, () => {
      window.location.reload();
    });
  }

  // =========================================
  // BOTÃO VOLTAR
  // =========================================

  criarBotaoVoltar() {
    const { width, height } = this.scale;

    this.criarBotao(
      width / 2,
      height - 35,
      "VOLTAR AO MENU",
      () => {
        this.scene.start("Menu");
      }
    );
  }

  // =========================================
  // BOTÃO GENÉRICO
  // =========================================

  criarBotao(x, y, texto, acao) {
    const botao = criarTexto(this, x, y, texto, {
      fontFamily: FONTE,
      fontSize: "11px",
      color: COR.branco,
      backgroundColor: COR.cinza,
      padding: {
        x: 15,
        y: 12,
      },
    })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    botao.on("pointerover", () => {
      botao.setStyle({
        color: COR.verde,
      });
    });

    botao.on("pointerout", () => {
      botao.setStyle({
        color: COR.branco,
      });
    });

    botao.on("pointerdown", () => {
      acao();
    });

    return botao;
  }
}