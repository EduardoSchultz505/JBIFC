import { useEffect, useRef, useState } from "react";
import { Maximize, CirclePlay } from "lucide-react";
import { criarJogo } from "../game/loadGame";

export default function Jogar() {
  const [iniciado, setIniciado] = useState(false);
  const [telaCheia, setTelaCheia] = useState(false);

  const containerRef = useRef(null);
  const jogoRef = useRef(null);

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
            />
          </div>
        </section>
      </div>
    </main>
  );
}