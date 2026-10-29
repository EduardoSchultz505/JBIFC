
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
        // Aguarda a fonte Fredoka antes de criar os textos do Phaser.
        if (document.fonts) {
          await document.fonts.load('16px "PressStart2P"');
await document.fonts.ready;
        }

        // O componente pode ter sido desmontado durante o carregamento.
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

        document.addEventListener(
          "fullscreenchange",
          atualizarTelaCheia
        );

        // Guarda a função para remover o evento na limpeza.
        jogo.events.once("destroy", () => {
          document.removeEventListener(
            "fullscreenchange",
            atualizarTelaCheia
          );
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

        document.removeEventListener("fullscreenchange", () => {});

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
    <main className="min-h-screen bg-[#17191d] px-4 py-8 text-white sm:px-8">
      <div className="mx-auto max-w-5xl">
        <section className="overflow-hidden rounded-lg border border-white/10 bg-[#0d0e10]">
          <header className="flex items-center justify-between border-b border-white/10 bg-[#202226] px-4 py-3">
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

          <div className="relative aspect-video w-full overflow-hidden bg-[#101814]">
            {!iniciado && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#101814]">
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
              className={`absolute inset-0 ${
                iniciado ? "visible" : "invisible"
              }`}
            />
          </div>
        </section>
      </div>
    </main>
  );
}
