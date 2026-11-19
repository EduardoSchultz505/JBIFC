import { useCallback, useEffect, useRef, useState } from "react";
import { Maximize, CirclePlay, Monitor } from "lucide-react";
import axios from "axios";
import { Link, useNavigate } from "react-router";
import { criarJogo } from "../game/loadGame";
import Container from "../components/Container";
import {
  evaluateAchievementUnlocks,
  readAchievementList,
  readPartidasTotais,
  writeAchievementList,
  writePartidasTotais,
} from "../config/achievements";

const API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, "");
const API_URL_LOCAL = import.meta.env.DEV
  ? "http://localhost:5000"
  : API_URL;

export default function Jogar() {
  const [iniciado, setIniciado] = useState(false);
  const [telaCheia, setTelaCheia] = useState(false);
  const [gameOver, setGameOver] = useState(null);
  const [estadoSalvamento, setEstadoSalvamento] = useState("idle");
  const [mensagem, setMensagem] = useState("");
  const [token, setToken] = useState(() => localStorage.getItem("jbifc_token"));
  const [usuario, setUsuario] = useState("");
  const [authCarregando, setAuthCarregando] = useState(() => Boolean(localStorage.getItem("jbifc_token")) && Boolean(API_URL_LOCAL));
  const [authErro, setAuthErro] = useState("");
  const [conquistasNovas, setConquistasNovas] = useState([]);
  
  const [mobile] = useState(
    () => window.matchMedia("(hover: none) and (pointer: coarse)").matches,
  );
  const navigate = useNavigate();

  const containerRef = useRef(null);
  const jogoRef = useRef(null);
  const salvamentoEmAndamentoRef = useRef(false);
  const pontuacaoSalvaRef = useRef(false);
  const jogadorIdRef = useRef(null);
  const usuarioRef = useRef("");
  const tokenRef = useRef(token);
  
  const resumoRef = useRef(null);

  const logado = Boolean(token && usuario);

  
  useEffect(() => {
    if (!token) return;
    if (!API_URL_LOCAL) return;

    axios.get(`${API_URL_LOCAL}/api/usuario`, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 70000,
    }).then(({ data }) => {
      setUsuario(data.usuario);
      usuarioRef.current = data.usuario;
      jogadorIdRef.current = data.id;
      tokenRef.current = token;
    }).catch((erro) => {
      
      if (erro.response?.status !== 401) {
        setAuthErro("Não foi possível verificar seu login agora. Recarregue a página para tentar de novo.");
        return;
      }
      localStorage.removeItem("jbifc_token");
      setToken(null);
      setUsuario("");
      usuarioRef.current = "";
      jogadorIdRef.current = null;
      tokenRef.current = null;
    }).finally(() => setAuthCarregando(false));
  }, [token]);

  
  const processarConquistasDemo = useCallback((resumoFinal) => {
    const contexto = { userId: null, demoMode: true };
    const existentes = readAchievementList(contexto);
    const partidasDepois = readPartidasTotais(contexto) + 1;
    const novas = evaluateAchievementUnlocks(
      { ...resumoFinal, partidasTotaisApos: partidasDepois },
      existentes,
    );

    writeAchievementList([...existentes, ...novas], contexto);
    writePartidasTotais(partidasDepois, contexto);
    setConquistasNovas(novas);
  }, []);

  
  const salvarPontuacao = useCallback(async (pontuacaoCapturada) => {
    if (salvamentoEmAndamentoRef.current || pontuacaoSalvaRef.current) return;

    
    if (!tokenRef.current || !jogadorIdRef.current || !usuarioRef.current) return;

    const pontuacaoFinal = Number(pontuacaoCapturada);
    if (!Number.isInteger(pontuacaoFinal) || pontuacaoFinal < 0) {
      setEstadoSalvamento("erro");
      setMensagem("A pontuação final não é válida.");
      return;
    }
    if (!resumoRef.current) {
      setEstadoSalvamento("erro");
      setMensagem("Os dados da partida não foram encontrados.");
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
      pontuacao: pontuacaoFinal,
      resumo: resumoRef.current,
    };
    console.info("[Ranking] Dados enviados ao backend:", {
      nome: usuarioRef.current,
      dados,
    });

    try {
      const resposta = await axios.post(`${API_URL_LOCAL}/ranking`, dados, {
        headers: { Authorization: `Bearer ${tokenRef.current}` },
        timeout: 70000,
      });
      console.info("[Ranking] Resposta do backend:", resposta.status, resposta.data);
      pontuacaoSalvaRef.current = true;
      setEstadoSalvamento("salvo");
      setConquistasNovas(resposta.data.conquistasNovas ?? []);

      const melhor = Number(resposta.data.registro?.pontuacao ?? pontuacaoFinal);
      const posicao = resposta.data.posicao;
      if (melhor > pontuacaoFinal) {
        
        setMensagem(`Sua melhor pontuação continua sendo ${melhor}${posicao ? ` (${posicao}º lugar)` : ""}.`);
      } else {
        setMensagem(posicao ? `Pontuação salva! Sua posição: ${posicao}º` : "Pontuação salva com sucesso!");
      }
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
  }, []);

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

        const aoTerminarPartida = (resumoFinal) => {
          if (cancelado) return;

          const pontuacaoExata = Number(resumoFinal?.score ?? resumoFinal ?? 0);
          const resumoNormalizado = {
            score: pontuacaoExata,
            vidasRestantes: Number(resumoFinal?.vidasRestantes ?? 0),
            sequenciaMaxima: Number(resumoFinal?.sequenciaMaxima ?? 0),
            fasesCompletas: Number(resumoFinal?.fasesCompletas ?? 0),
            minigameMaisRapidoMs:
              resumoFinal?.minigameMaisRapidoMs === null || resumoFinal?.minigameMaisRapidoMs === undefined
                ? null
                : Number(resumoFinal.minigameMaisRapidoMs),
          };

          console.info("[GameOver] Jogador conectado:", {
            jogadorId: jogadorIdRef.current,
            nome: usuarioRef.current,
          });
          console.info("[GameOver] Pontuação capturada no Phaser:", {
            pontuacaoFinal: pontuacaoExata,
            resumo: resumoNormalizado,
          });
          salvamentoEmAndamentoRef.current = false;
          pontuacaoSalvaRef.current = false;
          resumoRef.current = resumoNormalizado;
          setEstadoSalvamento("idle");
          setMensagem("");
          setConquistasNovas([]);
          setGameOver(pontuacaoExata);

          if (tokenRef.current && jogadorIdRef.current) {
            salvarPontuacao(pontuacaoExata); 
          } else {
            processarConquistasDemo(resumoNormalizado);
          }
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
  }, [iniciado, processarConquistasDemo, salvarPontuacao]);

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

  function voltarAoMenu() {
    setGameOver(null);
    setConquistasNovas([]);
    setIniciado(false);
  }

  return (
    <main className="flex-1 pt-12 pb-16 md:pt-16 md:pb-24">
      <Container className="max-w-6xl">
        {mobile && (
          <div
            role="note"
            className="mb-4 flex items-start gap-3 rounded-lg border border-sun bg-sun/15 p-4 text-sm leading-snug"
          >
            <Monitor aria-hidden="true" size={20} className="mt-0.5 shrink-0" />
            <p>
              <strong>Este jogo só funciona em computador.</strong> Em celular
              e tablet os controles podem não responder. Abra esta página em um
              computador para jogar.
            </p>
          </div>
        )}

        <section className="overflow-hidden rounded-xl border border-game-line bg-game text-white shadow-game">
          <header className="flex items-center justify-between border-b border-white/10 bg-game px-4 py-3">
            <span className="text-sm font-semibold">
              A Regular Mosquito's Day
            </span>

            <button
              type="button"
              onClick={alternarTelaCheia}
              disabled={!iniciado}
              title={telaCheia ? "Sair da tela cheia" : "Tela cheia"}
              aria-label={telaCheia ? "Sair da tela cheia" : "Tela cheia"}
              className="cursor-pointer rounded-md border border-white/15 p-2.5 transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Maximize aria-hidden="true" size={18} />
            </button>
          </header>

          <div className="relative aspect-video w-full overflow-hidden bg-game">
            {!iniciado && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-game">
                {authCarregando ? (
                  <p role="status" className="text-sm text-white/70">Verificando login...</p>
                ) : (
                  <div className="flex flex-col items-center">
                    <p className="mb-4 text-sm font-semibold text-white/80">
                      {logado ? `Jogando como ${usuario}` : "Jogando sem conta"}
                    </p>
                    {authErro && (
                      <p className="mb-4 max-w-xs text-center text-xs text-danger" role="alert">
                        {authErro}
                      </p>
                    )}
                    <button
                      type="button"
                      onClick={() => setIniciado(true)}
                      className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-md bg-[#C5B49B] px-6 py-3 text-lg font-bold text-[#292621] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                    >
                      <CirclePlay aria-hidden="true" size={24} strokeWidth={2} />
                      Jogar
                    </button>
                    {!logado && (
                      <Link
                        to="/login"
                        className="mt-4 flex min-h-11 items-center text-sm font-semibold text-[#67F5A5] underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                      >
                        Entrar ou criar conta
                      </Link>
                    )}
                  </div>
                )}
              </div>
            )}

            <div
              id="phaser-container"
              ref={containerRef}
              className={`absolute inset-0 ${iniciado ? "visible" : "invisible"}`}
            >
              {gameOver !== null && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#151515]/95 px-4">
                  <div className="w-full max-w-sm rounded-xl border border-white/15 bg-[#252525] p-5 text-center shadow-game md:p-8">
                    <h2 className="text-xl font-bold text-danger md:text-2xl">
                      GAME OVER
                    </h2>
                    <p className="mt-3 text-sm text-white/80 md:text-base">
                      Pontuação final:{" "}
                      <strong className="text-sun">{gameOver}</strong>
                    </p>

                    {logado && mensagem && (
                      <p
                        className={`mt-3 text-sm ${
                          estadoSalvamento === "salvo" ? "text-[#67F5A5]" : "text-danger"
                        }`}
                        role="alert"
                      >
                        {mensagem}
                      </p>
                    )}

                    {conquistasNovas.length > 0 && (
                      <div className="mt-4 rounded-xl border border-sun/70 bg-sun-soft/10 p-3 text-left">
                        <p className="text-xs font-bold uppercase tracking-widest text-sun">
                          Novas conquistas
                        </p>
                        <ul className="mt-3 space-y-2">
                          {conquistasNovas.map((item) => (
                            <li key={item.id} className="flex items-start gap-3 rounded-lg bg-[#151515]/40 p-2">
                              <span aria-hidden="true" className="flex size-9 items-center justify-center rounded-lg bg-sun/15 text-xl">
                                {item.icon}
                              </span>
                              <div>
                                <p className="text-sm font-bold text-white">{item.name}</p>
                                <p className="text-xs text-white/70">{item.description}</p>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {logado ? (
                      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                        <button
                          type="button"
                          className="min-h-11 flex-1 cursor-pointer rounded-lg bg-[#67F5A5] px-4 font-bold text-[#151515] disabled:cursor-not-allowed disabled:opacity-50"
                          onClick={() => salvarPontuacao(gameOver)}
                          disabled={estadoSalvamento === "salvando" || estadoSalvamento === "salvo"}
                        >
                          {estadoSalvamento === "salvando" ? "Salvando..." : estadoSalvamento === "salvo" ? "Pontuação salva" : estadoSalvamento === "erro" ? "Tentar novamente" : "Salvar pontuação"}
                        </button>
                        <button
                          type="button"
                          className="min-h-11 flex-1 cursor-pointer rounded-lg border border-white/20 px-4 font-semibold hover:bg-white/10"
                          onClick={voltarAoMenu}
                        >
                          Voltar ao menu
                        </button>
                      </div>
                    ) : (
                      <>
                        <p className="mt-3 text-xs text-white/60">
                          Você jogou sem conta, então esta pontuação não entrou no ranking.
                        </p>
                        <button
                          type="button"
                          className="mt-5 min-h-11 w-full cursor-pointer rounded-lg border border-white/20 px-4 font-semibold hover:bg-white/10"
                          onClick={voltarAoMenu}
                        >
                          Voltar ao menu
                        </button>
                      </>
                    )}

                    {logado && estadoSalvamento === "salvo" && (
                      <button
                        type="button"
                        className="mt-3 min-h-11 w-full cursor-pointer rounded-lg border border-sun px-4 font-semibold text-sun hover:bg-white/10"
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
      </Container>
    </main>
  );
}