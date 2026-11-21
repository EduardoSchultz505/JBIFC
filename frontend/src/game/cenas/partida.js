
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

    // Estatísticas das conquistas
    this.sequenciaAtual = 0;
    this.sequenciaMaxima = 0;
    this.venceuComUmaVida = false;
    this.minigameMaisRapidoMs = null;

    this.ultimo = null;
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

    this.proximaRodada();
  }

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

  nivel() {
    return Math.floor(
      this.pontos / PONTOS_PARA_AUMENTAR_NIVEL
    );
  }

  sortear() {
    const opcoes =
      MINIGAMES.length > 1
        ? MINIGAMES.filter((M) => M !== this.ultimo)
        : MINIGAMES;

    const escolhido = Phaser.Utils.Array.GetRandom(opcoes);
    this.ultimo = escolhido;

    return escolhido;
  }

  calcularTempo(duracaoBase) {
    const ms = duracaoBase * 1000 * 0.9 ** this.nivel();

    return Math.max(TEMPO_MINIMO, ms);
  }

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

      // Atualiza pontuação e vitórias
      this.pontos += PONTOS_POR_VITORIA;
      this.fasesCompletas += 1;

      // Atualiza sequência de vitórias consecutivas
      this.sequenciaAtual += 1;

      this.sequenciaMaxima = Math.max(
        this.sequenciaMaxima,
        this.sequenciaAtual
      );

      // Registra vitória com exatamente uma vida restante
      if (this.vidas === 1) {
        this.venceuComUmaVida = true;
      }

      // Registra o menor tempo somente em vitórias
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

      if (subiuDeNivel) {
        console.info(
          `[Dificuldade] Novo nível: ${nivelAtual} | Pontos: ${this.pontos}`
        );
      }
    } else {
      // Perdeu: reduz uma vida e zera a sequência atual
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

    console.info("[GameOver] Resumo da partida:", resumoPartida);

    this.game.events.emit("fim-de-partida", resumoPartida);
  }
}
