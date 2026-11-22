
import Phaser from "phaser";

const CHAVE_FUNDO = "tot-totem_bg";
const CHAVE_CERTO = "tot-certo";
const CHAVE_ERRADO = "tot-errado";
const CHAVE_PAPEL = "tot-papel";

const COLUNAS = 3;
const LINHAS = 4;
const TOTAL_ITENS = COLUNAS * LINHAS;

const TOTAL_TELAS = 3;

const TAMANHO_ITEM = {
  w: 24,
  h: 27,
};


const POSICOES_X = [126, 164, 202];
const POSICOES_Y = [33, 66, 99, 132];


const INCLINACAO_X = [0, 3, 6];

class Totem {
  static titulo = "TOTEM";

  descricao =
    "Compre todos os lanches bons no totem";

  controles = ["MOUSE 1: SELECIONAR"];

  duracao = 8;

  constructor(scene) {
    this.scene = scene;

    this.estado = "jogando";

    this.fundo = null;
    this.itens = [];

    this.telaAtual = 1;
    this.totalCorretos = 0;
    this.acertos = 0;

    this.tempoTroca = null;

    this.escalaX = 1;
    this.escalaY = 1;
  }

  iniciar() {
    const { width, height } = this.scene.scale;

    this.escalaX = width / 320;
    this.escalaY = height / 160;

    
    [CHAVE_FUNDO, CHAVE_CERTO, CHAVE_ERRADO, CHAVE_PAPEL].forEach((chave) => {
  if (this.scene.textures.exists(chave)) {
    this.scene.textures
      .get(chave)
      .setFilter(Phaser.Textures.FilterMode.NEAREST);
  }
});

    
    this.fundo = this.scene.add
      .image(width / 2, height / 2, CHAVE_FUNDO)
      .setDisplaySize(width, height)
      .setDepth(0);

    this.papel = this.scene.add
  .image(width / 2, height / 2, CHAVE_PAPEL)
  .setDisplaySize(width, height)
  .setDepth(10);

    
    this.gerarTela();
  }

  gerarTela() {
    this.limparItens();

    this.acertos = 0;

    
    this.totalCorretos = Phaser.Math.Between(3, 6);

    
    const indicesCorretos = Phaser.Utils.Array.Shuffle(
      Array.from({ length: TOTAL_ITENS }, (_, i) => i)
    ).slice(0, this.totalCorretos);

    const corretos = new Set(indicesCorretos);

    for (let i = 0; i < TOTAL_ITENS; i++) {
      const coluna = i % COLUNAS;
      const linha = Math.floor(i / COLUNAS);

      const correto = corretos.has(i);

      const x = POSICOES_X[coluna] * this.escalaX;

      const y =
        (POSICOES_Y[linha] + INCLINACAO_X[coluna]) *
        this.escalaY;

      const chave = correto ? CHAVE_CERTO : CHAVE_ERRADO;

      const item = this.scene.add
        .image(x, y, chave)
        .setDisplaySize(
          TAMANHO_ITEM.w * this.escalaX,
          TAMANHO_ITEM.h * this.escalaY
        )
        .setDepth(2)
        .setInteractive({ useHandCursor: true });

      item.correto = correto;
      item.selecionado = false;

      item.on("pointerdown", () => {
        this.selecionar(item);
      });

      this.itens.push(item);
    }
  }

  selecionar(item) {
    if (this.estado !== "jogando") return;
    if (!item || item.selecionado) return;

    item.selecionado = true;
    item.disableInteractive();

    
    if (!item.correto) {
      this.estado = "perdeu";
      item.setAlpha(0.35);
      return;
    }

    
    this.acertos++;

    item.setAlpha(0.25);

    
    if (this.acertos >= this.totalCorretos) {
      this.completarTela();
    }
  }

  completarTela() {
    if (this.estado !== "jogando") return;

    
    if (this.telaAtual >= TOTAL_TELAS) {
      this.estado = "ganhou";
      return;
    }

    
    this.telaAtual++;

    
    this.tempoTroca = this.scene.time.delayedCall(350, () => {
      if (this.estado !== "jogando") return;

      this.gerarTela();
      this.tempoTroca = null;
    });
  }

  limparItens() {
    this.itens.forEach((item) => {
      if (item && item.active) {
        item.destroy();
      }
    });

    this.itens = [];
  }

  atualizar() {
    
  }

  resultado() {
    return this.estado;
  }

  destruir() {
    if (this.tempoTroca) {
      this.tempoTroca.remove(false);
      this.tempoTroca = null;
    }

    this.limparItens();

    if (this.fundo) {
      this.fundo.destroy();
      this.fundo = null;
    }

    if (this.papel) {
  this.papel.destroy();
  this.papel = null;
}
  }
}

export default Totem;
