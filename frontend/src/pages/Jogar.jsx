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
  const [estadoSalvamento, setEstadoSalvamento] = useState("idle");
  const [mensagem, setMensagem] = useState("");
  const [token, setToken] = useState(() => localStorage.getItem("jbifc_token"));
  const [usuario, setUsuario] = useState("");
  const [jogadorId, setJogadorId] = useState(null);
  const [nome, setNome] = useState("");
  const [senha, setSenha] = useState("");
  const [modoAuth, setModoAuth] = useState("login");
  const [authCarregando, setAuthCarregando] = useState(true);
  const [authErro, setAuthErro] = useState("");
  const navigate = useNavigate();

  const containerRef = useRef(null);
  const jogoRef = useRef(null);
  const salvamentoEmAndamentoRef = useRef(false);
  const pontuacaoSalvaRef = useRef(false);
  const jogadorIdRef = useRef(null);
  const usuarioRef = useRef("");
  const tokenRef = useRef(token);

  useEffect(() => {
    if (!token) {
      setAuthCarregando(false);
      return;
    }
    if (!API_URL_LOCAL) {
      setAuthErro("VITE_API_URL não está configurada.");
      setAuthCarregando(false);
      return;
    }
    if (!token) {
      setEstadoSalvamento("erro");
      setMensagem("Faça login novamente para salvar a pontuação.");
      return;
    }

    axios.get(`${API_URL_LOCAL}/api/usuario`, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 70000,
    }).then(({ data }) => {
      setUsuario(data.usuario);
      setJogadorId(data.id);
      usuarioRef.current = data.usuario;
      jogadorIdRef.current = data.id;
      tokenRef.current = token;
    }).catch(() => {
      localStorage.removeItem("jbifc_token");
      setToken(null);
      setUsuario("");
      setJogadorId(null);
      usuarioRef.current = "";
      jogadorIdRef.current = null;
      tokenRef.current = null;
    }).finally(() => setAuthCarregando(false));
  }, [token]);

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
          const pontuacaoExata = Number(pontuacaoFinal);
          console.info("[GameOver] Jogador conectado:", {
            jogadorId: jogadorIdRef.current,
            nome: usuarioRef.current,
          });
          console.info("[GameOver] Pontuação capturada no Phaser:", {
            pontuacaoFinal: pontuacaoExata,
          });
          salvamentoEmAndamentoRef.current = false;
          pontuacaoSalvaRef.current = false;
          setEstadoSalvamento("idle");
          setMensagem("");
          setGameOver(pontuacaoExata);
          salvarPontuacao(pontuacaoExata);
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

  async function salvarPontuacao(pontuacaoCapturada = gameOver) {
    if (salvamentoEmAndamentoRef.current || pontuacaoSalvaRef.current) return;
    const pontuacaoFinal = Number(pontuacaoCapturada);
    if (!Number.isInteger(pontuacaoFinal) || pontuacaoFinal < 0) {
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
    if (!tokenRef.current || !jogadorIdRef.current || !usuarioRef.current) {
      setEstadoSalvamento("erro");
      setMensagem("Faça login novamente para salvar a pontuação.");
      return;
    }

    salvamentoEmAndamentoRef.current = true;
    setEstadoSalvamento("salvando");
    setMensagem("");

    const dados = {
      jogadorId: jogadorIdRef.current,
      pontuacao: pontuacaoFinal,
      nivel: 0,
    };
    console.info("[Ranking] Dados enviados ao backend:", {
      nome: usuarioRef.current,
      jogadorId: jogadorIdRef.current,
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
      setMensagem(
        resposta.data.posicao
          ? `Pontuação salva! Sua posição: ${resposta.data.posicao}º`
          : "Pontuação salva com sucesso!",
      );
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

  async function enviarAutenticacao(evento) {
    evento.preventDefault();
    setAuthErro("");

    const nomeLimpo = nome.trim();
    if (nomeLimpo.length < 1 || nomeLimpo.length > 20) {
      setAuthErro("O nome de usuário deve ter entre 1 e 20 caracteres.");
      return;
    }
    if (senha.length < 8 || senha.length > 72) {
      setAuthErro("A senha deve ter entre 8 e 72 caracteres.");
      return;
    }
    if (!API_URL_LOCAL) {
      setAuthErro("VITE_API_URL não está configurada.");
      return;
    }

    setAuthCarregando(true);
    try {
      const rota = modoAuth === "cadastro" ? "/api/conta" : "/api/login";
      const resposta = await axios.post(`${API_URL_LOCAL}${rota}`, {
        usuario: nomeLimpo,
        senha,
      }, { timeout: 70000 });

      localStorage.setItem("jbifc_token", resposta.data.token);
      setToken(resposta.data.token);
      setUsuario(resposta.data.usuario);
      setJogadorId(resposta.data.id);
      jogadorIdRef.current = resposta.data.id;
      usuarioRef.current = resposta.data.usuario;
      tokenRef.current = resposta.data.token;
      setNome("");
      setSenha("");
    } catch (erro) {
      setAuthErro(erro.response?.data?.erro || "Não foi possível entrar. Tente novamente.");
    } finally {
      setAuthCarregando(false);
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
                {token && usuario ? (
                  <div className="flex flex-col items-center">
                    <p className="mb-4 text-sm font-semibold text-white/80">Jogando como {usuario}</p>
                    <button
                      onClick={() => setIniciado(true)}
                      className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-[#C5B49B] px-6 py-3 text-lg font-bold text-[#292621]"
                    >
                      <CirclePlay size={24} strokeWidth={2} />
                      Jogar
                    </button>
                  </div>
                ) : (
                  <form onSubmit={enviarAutenticacao} className="w-[calc(100%-32px)] max-w-sm rounded-xl border border-white/15 bg-[#252525] p-5 text-center shadow-game">
                    <h2 className="text-lg font-bold">
                      {modoAuth === "cadastro" ? "Criar conta" : "Entrar"}
                    </h2>
                    <label className="mt-4 block text-left text-sm font-semibold" htmlFor="usuario">
                      Nome de usuário
                    </label>
                    <input
                      id="usuario"
                      className="mt-2 min-h-11 w-full rounded-lg border border-white/20 bg-[#151515] px-3 text-white outline-none focus:border-[#67F5A5]"
                      maxLength={20}
                      value={nome}
                      onChange={(evento) => setNome(evento.target.value)}
                      autoComplete="username"
                      placeholder="Seu nome de usuário"
                    />
                    <label className="mt-4 block text-left text-sm font-semibold" htmlFor="senha">
                      Senha
                    </label>
                    <input
                      id="senha"
                      type="password"
                      className="mt-2 min-h-11 w-full rounded-lg border border-white/20 bg-[#151515] px-3 text-white outline-none focus:border-[#67F5A5]"
                      minLength={8}
                      maxLength={72}
                      value={senha}
                      onChange={(evento) => setSenha(evento.target.value)}
                      autoComplete={modoAuth === "cadastro" ? "new-password" : "current-password"}
                      placeholder="Entre 8 e 72 caracteres"
                    />
                    {authErro && <p className="mt-3 text-sm text-[#ff8585]" role="alert">{authErro}</p>}
                    <button
                      type="submit"
                      disabled={authCarregando}
                      className="mt-5 min-h-11 w-full rounded-lg bg-[#67F5A5] px-4 font-bold text-[#151515] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {authCarregando ? "Aguarde..." : modoAuth === "cadastro" ? "Criar conta" : "Entrar"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setModoAuth((modo) => modo === "login" ? "cadastro" : "login");
                        setAuthErro("");
                      }}
                      className="mt-3 min-h-10 text-sm font-semibold text-[#FFC93C] underline"
                    >
                      {modoAuth === "login" ? "Ainda não tenho conta: criar conta" : "Já tenho conta: entrar"}
                    </button>
                  </form>
                )}
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
                      {estadoSalvamento === "salvando" ? "Salvando..." : estadoSalvamento === "salvo" ? "Pontuação salva" : estadoSalvamento === "erro" ? "Tentar novamente" : "Salvando..."}
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