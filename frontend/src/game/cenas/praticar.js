
import Phaser from "phaser";


const MINIGAMES = Object.values(
  import.meta.glob(["../minigames/*.js", "!../minigames/_*.js"], {
    eager: true,
  })
)
  .map((modulo) => modulo.default)
  .filter(Boolean);

const FONTE = "PressStart2P";
const COR = {
  fundo: "#151515",
  branco: "#FFFFFF",
  verde: "#2ECC71",
  amarelo: "#FFC93C",
  vermelho: "#CD191E",
  cinza: "#252525",
};

const JOGOS_POR_PAGINA = 6;

export default class Pratica extends Phaser.Scene {
  constructor() {
    super("Pratica");
  }

  create() {
    this.cameras.main.setBackgroundColor(COR.fundo);

    this.minigame = null;
    this.estado = "selecao";
    this.pagina = 0;

    this.mostrarSelecao();

    this.events.once("shutdown", () => {
      this.limparMinigame();
    });
  }

  
  
  

  mostrarSelecao() {
    this.limparTela();

    this.estado = "selecao";

    const { width, height } = this.scale;

    this.add
      .text(width / 2, 65, "MODO PRÁTICA", {
        fontFamily: FONTE,
        fontSize: "25px",
        color: COR.verde,
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, 105, "ESCOLHA UM MINIGAME", {
        fontFamily: FONTE,
        fontSize: "11px",
        color: COR.branco,
      })
      .setOrigin(0.5);

    if (MINIGAMES.length === 0) {
      this.add
        .text(width / 2, height / 2, "NENHUM MINIGAME ENCONTRADO", {
          fontFamily: FONTE,
          fontSize: "12px",
          color: COR.vermelho,
        })
        .setOrigin(0.5);

      this.criarBotao(width / 2, height - 45, "VOLTAR AO MENU", () => {
        this.scene.start("Menu");
      });

      return;
    }

    const inicio = this.pagina * JOGOS_POR_PAGINA;
    const jogosPagina = MINIGAMES.slice(
      inicio,
      inicio + JOGOS_POR_PAGINA
    );

    const colunas = 2;
    const espacamentoX = 260;
    const espacamentoY = 75;

    jogosPagina.forEach((Minigame, index) => {
      const coluna = index % colunas;
      const linha = Math.floor(index / colunas);

      const x = width / 2 + (coluna === 0 ? -espacamentoX / 2 : espacamentoX / 2);
      const y = 190 + linha * espacamentoY;

      const nome = this.formatarNome(Minigame.name);

      this.criarBotao(x, y, nome, () => {
        this.iniciarMinigame(Minigame);
      });
    });

    const totalPaginas = Math.ceil(MINIGAMES.length / JOGOS_POR_PAGINA);

    this.add
      .text(width / 2, height - 85, `${this.pagina + 1} / ${totalPaginas}`, {
        fontFamily: FONTE,
        fontSize: "11px",
        color: COR.branco,
      })
      .setOrigin(0.5);

    if (this.pagina > 0) {
      this.criarBotao(120, height - 85, "ANTERIOR", () => {
        this.pagina--;
        this.mostrarSelecao();
      });
    }

    if (this.pagina < totalPaginas - 1) {
      this.criarBotao(width - 120, height - 85, "PRÓXIMA", () => {
        this.pagina++;
        this.mostrarSelecao();
      });
    }

    this.criarBotao(width / 2, height - 35, "VOLTAR AO MENU", () => {
      this.scene.start("Menu");
    });
  }

  formatarNome(nome) {
    if (!nome) return "MINIGAME";

    return nome
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/[_-]/g, " ")
      .toUpperCase();
  }

  
  
  

  iniciarMinigame(Minigame) {
  this.limparMinigame();
  this.limparTela();

  this.minigameSelecionado = Minigame;
  this.estado = "instrucao";
  this.minigame = new Minigame(this);

    const { width, height } = this.scale;

    this.textoInstrucao = this.add
      .text(width / 2, height / 2, this.minigame.instrucao || "", {
        fontFamily: FONTE,
        fontSize: "35px",
        color: COR.branco,
        align: "center",
      })
      .setOrigin(0.5)
      .setDepth(100);

    this.criarBotao(width - 100, 30, "SAIR", () => {
      this.voltarSelecao();
    });

    this.eventoInstrucao = this.time.delayedCall(1000, () => {
      if (!this.minigame) return;

      this.textoInstrucao?.destroy();
      this.textoInstrucao = null;

      this.tempoTotal = Math.max(0, this.minigame.duracao || 0) * 1000;
      this.tempoRestante = this.tempoTotal;

      this.criarBarraTempo();

      this.minigame.iniciar();
      this.estado = "jogando";
    });
  }

  
  
  

  criarBarraTempo() {
    const { width, height } = this.scale;

    this.barraFundo = this.add
      .rectangle(0, height - 8, width, 12, 0x444444)
      .setOrigin(0, 0.5)
      .setDepth(90);

    this.barraTempo = this.add
      .rectangle(0, height - 8, width, 12, 0xffc93c)
      .setOrigin(0, 0.5)
      .setDepth(91);
  }

  update(_, delta) {
    if (this.estado !== "jogando" || !this.minigame) return;

    if (this.tempoTotal > 0) {
      this.tempoRestante -= delta;

      this.barraTempo?.setScale(
        Math.max(0, this.tempoRestante / this.tempoTotal),
        1
      );
    }

    this.minigame.atualizar(delta);

    let resultado = this.minigame.resultado();

    if (resultado === "jogando" && this.tempoTotal > 0 && this.tempoRestante <= 0) {
      resultado = this.minigame.venceAoFimDoTempo ? "ganhou" : "perdeu";
    }

    if (resultado !== "jogando") {
      this.encerrarMinigame(resultado === "ganhou");
    }
  }

  
  
  

  encerrarMinigame(venceu) {
    if (this.estado !== "jogando") return;

    this.estado = "resultado";

    const { width, height } = this.scale;

    this.limparMinigame();

    this.barraFundo?.destroy();
    this.barraTempo?.destroy();

    this.add
      .text(width / 2, height / 2 - 65, venceu ? "VOCÊ VENCEU!" : "FIM DE JOGO", {
        fontFamily: FONTE,
        fontSize: "25px",
        color: venceu ? COR.verde : COR.vermelho,
      })
      .setOrigin(0.5);

    this.criarBotao(width / 2, height / 2 + 15, "JOGAR NOVAMENTE", () => {
      this.iniciarMinigame(this.minigameSelecionado);
    });

    this.criarBotao(width / 2, height / 2 + 75, "ESCOLHER OUTRO", () => {
      this.mostrarSelecao();
    });

    this.criarBotao(width / 2, height / 2 + 135, "VOLTAR AO MENU", () => {
      this.scene.start("Menu");
    });
  }

  
  
  

  voltarSelecao() {
    this.limparMinigame();
    this.mostrarSelecao();
  }

  limparMinigame() {
    this.eventoInstrucao?.remove(false);
    this.eventoInstrucao = null;

    this.minigame?.destruir();
    this.minigame = null;
  }

  limparTela() {
    this.children.removeAll(true);

    this.textoInstrucao = null;
    this.barraFundo = null;
    this.barraTempo = null;
  }

  criarBotao(x, y, texto, acao) {
    const botao = this.add
      .text(x, y, texto, {
        fontFamily: FONTE,
        fontSize: "11px",
        color: COR.branco,
        backgroundColor: COR.cinza,
        padding: {
          x: 14,
          y: 12,
        },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    botao.on("pointerover", () => {
      botao.setStyle({
        color: COR.verde,
        backgroundColor: "#303030",
      });
    });

    botao.on("pointerout", () => {
      botao.setStyle({
        color: COR.branco,
        backgroundColor: COR.cinza,
      });
    });

    botao.on("pointerdown", acao);

    return botao;
  }
}
