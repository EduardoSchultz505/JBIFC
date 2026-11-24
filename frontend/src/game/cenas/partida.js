
import Phaser from "phaser";
import { COR, FONTE, mostrarInstrucao } from "./instrucao.js";
import Pausa from "./pausa.js";
import {
  aplicarQualidade,
  criarTexto,
} from "../sistema/qualidadeGraficos";

const MINIGAMES = Object.values(
  import.meta.glob(["../minigames/*.js", "!../minigames/_*.js"], {
    eager: true,
  })
)
  .map((modulo) => modulo.default)
  .filter(Boolean);

const VIDAS = 3;
const PONTOS_POR_VITORIA = 1;
const PONTOS_PARA_AUMENTAR_NIVEL = 5;
const TEMPO_FEEDBACK = 900;
const TEMPO_MINIMO = 1500;

// Configurações do sorteio inteligente
const HISTORICO_MAXIMO = 3;
const PESO_FREQUENCIA = 0.35;
const PESO_AUSENCIA = 0.25;
const PESO_DIFICULDADE = 0.25;

const FAIXAS_PARTIDA = [
  "musica-minigame1",
  "musica-minigame2",
  "musica-minigame3",
  "musica-minigame4",
];

export default class Partida extends Phaser.Scene {
  constructor() {
    super("Partida");
  }

  init() {
    this.vidas = VIDAS;
    this.pontos = 0;
    this.fasesCompletas = 0;

    this.sequenciaAtual = 0;
    this.sequenciaMaxima = 0;
    this.venceuComUmaVida = false;
    this.minigameMaisRapidoMs = null;

    // Sistema de sorteio adaptativo
    this.rodadaSorteio = 0;
    this.registroSorteio = new Map();
    this.historicoMinigames = [];

    this.minigame = null;
    this.estado = "instrucao";
    this.partidaTerminada = false;

    this.musicas = {};
    this.musicaAtual = null;
    this.musicaPausada = false;
    this.ultimaMusicaIndex = -1;
  }

  create() {
    const { width, height } = this.scale;

    this.qualidadeGraficos = aplicarQualidade(this);

    const k = height / 720;
    const px = (n) => `${Math.round(n * k)}px`;

    if (!this.scene.get("Pausa")) {
      this.scene.add("Pausa", Pausa, false);
    }

    this.carregarMusicas();
    this.iniciarPlaylist();

    this.textoPontos = criarTexto(this, 24, 16, "", {
      fontFamily: FONTE,
      fontSize: px(40),
      color: COR.amarelo,
    }).setDepth(20);

    this.textoVidas = criarTexto(this, width - 24, 16, "", {
      fontFamily: FONTE,
      fontSize: px(40),
      color: COR.branco,
    })
      .setOrigin(1, 0)
      .setDepth(20);

    this.textoCentro = criarTexto(
      this,
      width / 2,
      height / 2,
      "",
      {
        fontFamily: FONTE,
        fontSize: px(110),
        fontStyle: "bold",
        color: COR.branco,
        align: "center",
      }
    )
      .setOrigin(0.5)
      .setDepth(10);

    this.barra = this.add
      .rectangle(0, height - 8 * k, width, 12 * k, 0xffc93c)
      .setOrigin(0, 0.5)
      .setScale(0, 1)
      .setDepth(20);

    this.input.keyboard.on("keydown-P", this.pausar, this);

    this.events.once("shutdown", () => {
      this.input.keyboard.off("keydown-P", this.pausar, this);
      this.limparMinigame();
      this.pararMusicas();
    });

    this.atualizarHud();

    if (MINIGAMES.length === 0) {
      this.textoCentro
        .setText("Nenhum minigame\nem src/game/minigames")
        .setFontSize(px(48));

      return;
    }

    this.game.events.emit("inicio-de-partida");

    this.proximaRodada();
  }

  // ==========================================
  // SISTEMA DE MÚSICA
  // ==========================================

  carregarMusicas() {
    this.musicas = {
      pausa: this.sound.add("musica-pause", {
        loop: true,
        volume: 0.3,
      }),

      partida: FAIXAS_PARTIDA.map((chave) =>
        this.sound.add(chave, {
          loop: false,
          volume: 0.3,
        })
      ),
    };

    this.musicaAtual = null;
    this.musicaPausada = false;
  }

  iniciarPlaylist() {
    this.tocarProximaMusica();
  }

  tocarProximaMusica() {
    if (this.musicaPausada || this.partidaTerminada) return;

    const playlist = this.musicas.partida;

    if (!playlist || playlist.length === 0) return;

    let novoIndice;

    if (playlist.length === 1) {
      novoIndice = 0;
    } else {
      do {
        novoIndice = Phaser.Math.Between(0, playlist.length - 1);
      } while (novoIndice === this.ultimaMusicaIndex);
    }

    this.ultimaMusicaIndex = novoIndice;

    const musica = playlist[novoIndice];

    this.musicaAtual = musica;

    musica.once("complete", this.tocarProximaMusica, this);
    musica.play();
  }

  pausarMusica() {
    if (this.musicaPausada) return;

    if (this.musicaAtual && this.musicaAtual.isPlaying) {
      this.musicaAtual.pause();
    }

    this.musicas.pausa.play();
    this.musicaPausada = true;
  }

  retomarMusica() {
    if (!this.musicaPausada) return;

    this.musicas.pausa.stop();

    if (this.musicaAtual && this.musicaAtual.isPaused) {
      this.musicaAtual.resume();
    }

    this.musicaPausada = false;
  }

  pararMusicas() {
    if (!this.musicas) return;

    if (this.musicas.partida) {
      this.musicas.partida.forEach((musica) => {
        musica.stop();
        musica.removeAllListeners("complete");
        musica.destroy();
      });
    }

    if (this.musicas.pausa) {
      this.musicas.pausa.stop();
      this.musicas.pausa.destroy();
    }

    this.musicaAtual = null;
    this.musicaPausada = false;
  }

  // ==========================================
  // SORTEIO INTELIGENTE E ADAPTATIVO
  // ==========================================

  obterDificuldade(Minigame) {
    const dificuldade =
      Minigame.dificuldadeSorteio ??
      Minigame.dificuldade ??
      Minigame.prototype?.dificuldadeSorteio ??
      Minigame.prototype?.dificuldade ??
      3;

    return Phaser.Math.Clamp(Number(dificuldade) || 3, 1, 5);
  }

  obterPesoPersonalizado(Minigame) {
    const peso =
      Minigame.pesoSorteio ??
      Minigame.prototype?.pesoSorteio ??
      1;

    return Math.max(0.1, Number(peso) || 1);
  }

  calcularPesoSorteio(Minigame, rodada) {
    const registro = this.registroSorteio.get(Minigame) ?? {
      vezes: 0,
      ultima: -1,
    };

    // 1. Frequência: favorece jogos que apareceram menos.
    const pesoFrequencia =
      1 / (1 + registro.vezes * PESO_FREQUENCIA);

    // 2. Ausência: favorece jogos que estão há mais tempo sem aparecer.
    const ausencia = registro.ultima === -1
      ? rodada + 1
      : rodada - registro.ultima;

    const pesoAusencia =
      1 + Math.min(ausencia, 10) * PESO_AUSENCIA;

    // 3. Dificuldade: adapta a seleção ao nível da partida.
    const dificuldade = this.obterDificuldade(Minigame);

    const dificuldadeDesejada = Phaser.Math.Clamp(
      2.5 + this.nivel() * 0.35,
      1,
      5
    );

    const pesoDificuldade = Math.exp(
      -Math.abs(dificuldade - dificuldadeDesejada) *
        PESO_DIFICULDADE
    );

    // 4. Peso personalizado definido pelo próprio minigame.
    const pesoPersonalizado = this.obterPesoPersonalizado(Minigame);

    return (
      pesoFrequencia *
      pesoAusencia *
      pesoDificuldade *
      pesoPersonalizado
    );
  }

  sortear() {
    if (MINIGAMES.length === 1) {
      const unico = MINIGAMES[0];

      this.registrarSorteio(unico);

      return unico;
    }

    const rodada = this.rodadaSorteio++;

    // Primeiro, remove os minigames das últimas 3 rodadas.
    let candidatos = MINIGAMES.filter(
      (Minigame) =>
        !this.historicoMinigames.includes(Minigame)
    );

    // Se não houver candidatos, relaxa a restrição.
    // Isso permite partidas com menos de 4 minigames.
    if (candidatos.length === 0) {
      candidatos = MINIGAMES.filter(
        (Minigame) =>
          Minigame !== this.historicoMinigames[
            this.historicoMinigames.length - 1
          ]
      );
    }

    // Segurança para qualquer configuração de quantidade.
    if (candidatos.length === 0) {
      candidatos = MINIGAMES;
    }

    // Calcula o peso de cada candidato.
    const opcoes = candidatos.map((Minigame) => ({
      Minigame,
      peso: this.calcularPesoSorteio(Minigame, rodada),
    }));

    const pesoTotal = opcoes.reduce(
      (total, opcao) => total + opcao.peso,
      0
    );

    // Sorteio ponderado.
    let alvo = Math.random() * pesoTotal;

    let escolhido = opcoes[opcoes.length - 1].Minigame;

    for (const opcao of opcoes) {
      alvo -= opcao.peso;

      if (alvo <= 0) {
        escolhido = opcao.Minigame;
        break;
      }
    }

    this.registrarSorteio(escolhido);

    return escolhido;
  }

  registrarSorteio(Minigame) {
    const registro = this.registroSorteio.get(Minigame) ?? {
      vezes: 0,
      ultima: -1,
    };

    registro.vezes += 1;
    registro.ultima = this.rodadaSorteio - 1;

    this.registroSorteio.set(Minigame, registro);

    // Atualiza o histórico recente.
    this.historicoMinigames.push(Minigame);

    if (this.historicoMinigames.length > HISTORICO_MAXIMO) {
      this.historicoMinigames.shift();
    }
  }

  // ==========================================
  // DIFICULDADE E TEMPO
  // ==========================================

  nivel() {
    return Math.floor(
      this.pontos / PONTOS_PARA_AUMENTAR_NIVEL
    );
  }

  calcularTempo(duracaoBase) {
    const ms = duracaoBase * 1000 * 0.9 ** this.nivel();

    return Math.max(TEMPO_MINIMO, ms);
  }

  // ==========================================
  // RODADAS
  // ==========================================

  proximaRodada() {
    const Minigame = this.sortear();

    this.minigame = new Minigame(this);

    this.minigame.aplicarDificuldade?.(this.nivel());

    this.estado = "instrucao";
    this.barra.setScale(0, 1);
    this.textoCentro.setText("");

    this.minigame.iniciar();

    mostrarInstrucao(this, this.minigame, () => {
      this.tempoTotal = this.calcularTempo(this.minigame.duracao);
      this.tempoRestante = this.tempoTotal;
      this.estado = "jogando";
    });
  }

  update(_, delta) {
    if (this.estado !== "jogando") return;

    this.tempoRestante -= delta;

    this.barra.setScale(
      Math.max(0, this.tempoRestante / this.tempoTotal),
      1
    );

    this.minigame.atualizar(delta);

    let resultado = this.minigame.resultado();

    if (resultado === "jogando" && this.tempoRestante <= 0) {
      resultado = this.minigame.venceAoFimDoTempo
        ? "ganhou"
        : "perdeu";
    }

    if (resultado !== "jogando") {
      this.encerrarRodada(resultado === "ganhou");
    }
  }

  // ==========================================
  // RESULTADO DA RODADA
  // ==========================================

  encerrarRodada(venceu) {
    if (this.estado !== "jogando") return;

    this.estado = "feedback";
    this.barra.setScale(0, 1);

    const tempoExecutado =
      Number.isFinite(this.tempoTotal) &&
      Number.isFinite(this.tempoRestante)
        ? this.tempoTotal - this.tempoRestante
        : 0;

    if (venceu) {
      const nivelAnterior = this.nivel();

      this.pontos += PONTOS_POR_VITORIA;
      this.fasesCompletas += 1;

      this.sequenciaAtual += 1;

      this.sequenciaMaxima = Math.max(
        this.sequenciaMaxima,
        this.sequenciaAtual
      );

      if (this.vidas === 1) {
        this.venceuComUmaVida = true;
      }

      if (tempoExecutado > 0) {
        if (
          this.minigameMaisRapidoMs === null ||
          tempoExecutado < this.minigameMaisRapidoMs
        ) {
          this.minigameMaisRapidoMs = tempoExecutado;
        }
      }

      const nivelAtual = this.nivel();
      const subiuDeNivel = nivelAtual > nivelAnterior;

      this.textoCentro
        .setText(
          subiuDeNivel
            ? `ACERTOU!\nNÍVEL ${nivelAtual}!`
            : "ACERTOU!"
        )
        .setColor(COR.verde);
    } else {
      this.vidas -= 1;
      this.sequenciaAtual = 0;

      this.textoCentro
        .setText("ERROU!")
        .setColor(COR.vermelho);
    }

    this.atualizarHud();

    this.time.delayedCall(TEMPO_FEEDBACK, () => {
      this.limparMinigame();

      if (this.vidas > 0) {
        this.proximaRodada();
      } else {
        this.terminar();
      }
    });
  }

  // ==========================================
  // FINALIZAÇÃO
  // ==========================================

  atualizarHud() {
    this.textoPontos.setText(`Pontos: ${this.pontos}`);
    this.textoVidas.setText(`Vidas: ${this.vidas}`);
  }

  pausar() {
    if (this.estado !== "jogando") return;

    this.pausarMusica();
    this.scene.launch("Pausa");
    this.scene.pause();
  }

  limparMinigame() {
    this.minigame?.destruir();
    this.minigame = null;
  }

  terminar() {
    this.estado = "fim";

    if (this.partidaTerminada) return;

    this.partidaTerminada = true;
    this.pararMusicas();

    const pontuacaoFinal = this.pontos;

    const resumoPartida = {
      score: pontuacaoFinal,
      vidasRestantes: this.vidas,
      fasesCompletas: this.fasesCompletas,
      sequenciaMaxima: this.sequenciaMaxima,
      minigameMaisRapidoMs: this.minigameMaisRapidoMs,
      venceuComUmaVida: this.venceuComUmaVida,
    };

    this.game.events.emit("fim-de-partida", resumoPartida);
  }
}