import { useEffect, useRef, useState } from "react";
import { Maximize, CirclePlay } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router";
import { criarJogo } from "../game/loadGame";

const API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, "");
const API_URL_LOCAL = import.meta.env.DEV
  ? "http://localhost:5000"
  : API_URL;

export default function Jogar() {
  const [iniciado, setIniciado] = useState(false);
  const [telaCheia, setTelaCheia] = useState(false);
  const [gameOver, setGameOver] = useState(null);
  const [nome, setNome] = useState("");
  const [estadoSalvamento, setEstadoSalvamento] = useState("idle");
  const [mensagem, setMensagem] = useState("");
  const navigate = useNavigate();

  const containerRef = useRef(null);
  const jogoRef = useRef(null);
  const salvamentoEmAndamentoRef = useRef(false);
  const pontuacaoSalvaRef = useRef(false);

  useEffect(() => {
    if (!iniciado || !containerRef.current) return;

    let cancelado = false;
    let jogo = null;

    async function iniciarJogo() {
      try {
        if (document.fonts) {
          await document.fonts.load('16px "PressStart2P"');
          await document.fonts.ready;
        }

        if (cancelado || !containerRef.current) return;

        jogo = criarJogo(containerRef.current);
        jogoRef.current = jogo;

        const aoTerminarPartida = (pontuacaoFinal) => {
          if (cancelado) return;
          console.info("[GameOver] Pontuação recebida pelo React:", pontuacaoFinal);
          salvamentoEmAndamentoRef.current = false;
          pontuacaoSalvaRef.current = false;
          setNome("");
          setEstadoSalvamento("idle");
          setMensagem("");
          setGameOver(Number(pontuacaoFinal) || 0);
        };

        jogo.events.on("fim-de-partida", aoTerminarPartida);

        const atualizarTelaCheia = () => {
          if (!jogo || cancelado) return;

          setTelaCheia(jogo.scale.isFullscreen);

          requestAnimationFrame(() => {
            if (!cancelado && jogo) {
              jogo.scale.refresh();
            }
          });
        };

        jogo.scale.on("enterfullscreen", atualizarTelaCheia);
        jogo.scale.on("leavefullscreen", atualizarTelaCheia);

        document.addEventListener("fullscreenchange", atualizarTelaCheia);

        jogo.events.once("destroy", () => {
          document.removeEventListener("fullscreenchange", atualizarTelaCheia);
          jogo.events.off("fim-de-partida", aoTerminarPartida);
        });
      } catch (erro) {
        console.error("Erro ao iniciar o jogo:", erro);
      }
    }

    iniciarJogo();

    return () => {
      cancelado = true;

      if (jogo) {
        jogo.scale.off("enterfullscreen");
        jogo.scale.off("leavefullscreen");

        jogo.destroy(true);
      }

      if (jogoRef.current === jogo) {
        jogoRef.current = null;
      }
    };
  }, [iniciado]);

  async function alternarTelaCheia() {
    const jogo = jogoRef.current;

    if (!jogo) return;

    try {
      if (jogo.scale.isFullscreen) {
        jogo.scale.stopFullscreen();
      } else {
        await jogo.scale.startFullscreen();
      }
    } catch (erro) {
      console.error("Erro ao ativar tela cheia:", erro);
    }
  }

  async function salvarPontuacao() {
    const nomeLimpo = nome.trim();

    if (!nomeLimpo) {
      setEstadoSalvamento("erro");
      setMensagem("Digite seu nome para salvar a pontuação.");
      return;
    }

    if (salvamentoEmAndamentoRef.current || pontuacaoSalvaRef.current) return;
    if (!Number.isFinite(gameOver) || gameOver < 0) {
      setEstadoSalvamento("erro");
      setMensagem("A pontuação final não é válida.");
      return;
    }
    if (!API_URL_LOCAL) {
      setEstadoSalvamento("erro");
      setMensagem("VITE_API_URL não está configurada no frontend.");
      console.error("[Ranking] VITE_API_URL não está configurada.");
      return;
    }

    salvamentoEmAndamentoRef.current = true;
    setEstadoSalvamento("salvando");
    setMensagem("");

    const dados = {
      usuario: nomeLimpo,
      pontuacao: gameOver,
      nivel: 0,
    };
    console.info("[Ranking] Dados enviados ao backend:", dados);

    try {
      const resposta = await axios.post(`${API_URL_LOCAL}/ranking`, dados, {
        timeout: 70000,
      });
      console.info("[Ranking] Resposta do backend:", resposta.status, resposta.data);
      pontuacaoSalvaRef.current = true;
      setEstadoSalvamento("salvo");
      setMensagem("Pontuação salva com sucesso!");
    } catch (erro) {
      console.error("[Ranking] Erro ao salvar a pontuação:", {
        status: erro.response?.status,
        dados: erro.response?.data,
        mensagem: erro.message,
      });
      setEstadoSalvamento("erro");
      setMensagem("Não foi possível salvar a pontuação. Tente novamente.");
    } finally {
      salvamentoEmAndamentoRef.current = false;
    }
  }

  function voltarAoMenu() {
    setGameOver(null);
    setIniciado(false);
  }

  return (
    <main className="flex-1 pt-12 pb-18 md:pt-16 md:pb-22">
      <div className="mx-auto w-[calc(100%-32px)] max-w-275 md:w-[calc(100%-48px)]">
        <section className="overflow-hidden rounded-xl border border-game-line bg-game text-white shadow-game">
          <header className="flex items-center justify-between border-b border-white/10 bg-game px-4 py-3">
            <span className="text-sm font-semibold">
              A Regular Mosquito's Day
            </span>

            <button
              onClick={alternarTelaCheia}
              disabled={!iniciado}
              title={telaCheia ? "Sair da tela cheia" : "Tela cheia"}
              aria-label={telaCheia ? "Sair da tela cheia" : "Tela cheia"}
              className="rounded-md border border-white/15 p-2 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Maximize size={18} />
            </button>
          </header>

          <div className="relative aspect-video w-full overflow-hidden bg-game">
            {!iniciado && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-game">
                <span aria-hidden="true" className="absolute top-3 left-3 size-5.5 border-t border-l border-white/10 md:top-5.5 md:left-5.5 md:size-9.5" />
                <span aria-hidden="true" className="absolute right-3 bottom-3 size-5.5 border-r border-b border-white/10 md:right-5.5 md:bottom-5.5 md:size-9.5" />

                <button
                  onClick={() => setIniciado(true)}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-[#C5B49B] px-6 py-3 text-lg font-bold text-[#292621]"
                >
                  <CirclePlay size={24} strokeWidth={2} />
                  Jogar
                </button>
              </div>
            )}

            <div
              id="phaser-container"
              ref={containerRef}
              className={`absolute inset-0 ${iniciado ? "visible" : "invisible"}`}
            >
              {gameOver !== null && (
                <div className="absolute inset-0 z-[9999] flex items-center justify-center bg-[#151515]/95 px-4">
                  <div className="w-full max-w-sm rounded-xl border border-white/15 bg-[#252525] p-5 text-center shadow-game md:p-7">
                  <h2 className="text-xl font-bold text-[#CD191E] md:text-2xl">
                    GAME OVER
                  </h2>
                  <p className="mt-3 text-sm text-white/80 md:text-base">
                    Pontuação final:{" "}
                    <strong className="text-[#FFC93C]">{gameOver}</strong>
                  </p>

                  <label className="mt-5 block text-left text-sm font-semibold" htmlFor="nome-jogador">
                    Nome do jogador
                  </label>
                  <input
                    id="nome-jogador"
                    className="mt-2 min-h-11 w-full rounded-lg border border-white/20 bg-[#151515] px-3 text-white outline-none focus:border-[#67F5A5]"
                    maxLength={50}
                    value={nome}
                    onChange={(evento) => setNome(evento.target.value)}
                    onKeyDown={(evento) => {
                      if (evento.key === "Enter") salvarPontuacao();
                    }}
                    disabled={estadoSalvamento === "salvo"}
                    placeholder="Digite seu nome"
                  />

                  {mensagem && (
                    <p
                      className={`mt-3 text-sm ${
                        estadoSalvamento === "salvo" ? "text-[#67F5A5]" : "text-[#CD191E]"
                      }`}
                      role="alert"
                    >
                      {mensagem}
                    </p>
                  )}

                  <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                    <button
                      type="button"
                      className="min-h-11 flex-1 rounded-lg bg-[#67F5A5] px-4 font-bold text-[#151515] disabled:cursor-not-allowed disabled:opacity-50"
                      onClick={salvarPontuacao}
                      disabled={estadoSalvamento === "salvando" || estadoSalvamento === "salvo"}
                    >
                      {estadoSalvamento === "salvando" ? "Salvando..." : estadoSalvamento === "salvo" ? "Salvo" : "Salvar pontuação"}
                    </button>
                    <button
                      type="button"
                      className="min-h-11 flex-1 rounded-lg border border-white/20 px-4 font-semibold hover:bg-white/10"
                      onClick={voltarAoMenu}
                    >
                      Voltar ao menu
                    </button>
                  </div>

                  {estadoSalvamento === "salvo" && (
                    <button
                      type="button"
                      className="mt-3 min-h-11 w-full rounded-lg border border-[#FFC93C] px-4 font-semibold text-[#FFC93C] hover:bg-white/10"
                      onClick={() => navigate("/ranking")}
                    >
                      Ver ranking
                    </button>
                  )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}