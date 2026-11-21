import { useId, useRef, useState } from "react";
import Ranking from "../assets/ranking.png";
import Jogo from "../assets/jogo.png";
import Instrucoes from "../assets/instrucoes.png";

const passos = [
  {
    titulo: "Leia a instrução",
    texto:
      "Cada minijogo começa com uma ordem curta, e é ela que diz o que fazer.",
    imagem: Instrucoes,
    alt: "Tela de instrução de um minijogo",
  },
  {
    titulo: "Acerte e some pontos",
    texto: "Cada acerto vale 1 ponto, e cada erro custa uma das 3 vidas.",
    imagem: Jogo,
    alt: "Tela de uma rodada com vidas e pontuação",
  },
  {
    titulo: "Entre no ranking",
    texto: "Quando as vidas acabam, a pontuação vai para o ranking.",
    imagem: Ranking,
    alt: "Tela do ranking de pontuações",
  },
];

export default function ComoFunciona() {
  const [ativo, setAtivo] = useState(0);
  const botoes = useRef([]);
  const id = useId();

  function aoTeclar(e) {
    const total = passos.length;
    const destino = {
      ArrowRight: ativo + 1,
      ArrowDown: ativo + 1,
      ArrowLeft: ativo - 1,
      ArrowUp: ativo - 1,
      Home: 0,
      End: total - 1,
    }[e.key];
    if (destino === undefined) return;

    e.preventDefault();
    const novo = (destino + total) % total;
    setAtivo(novo);
    botoes.current[novo]?.focus();
  }

  return (
    <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-[2fr_3fr] md:gap-12">
      <div
        role="tablist"
        aria-label="Como funciona"
        aria-orientation="vertical"
        onKeyDown={aoTeclar}
        className="flex flex-col gap-3"
      >
        {passos.map((passo, i) => {
          const selecionado = i === ativo;
          return (
            <button
              key={passo.titulo}
              ref={(el) => (botoes.current[i] = el)}
              id={`${id}-aba-${i}`}
              type="button"
              role="tab"
              aria-selected={selecionado}
              aria-controls={`${id}-painel`}
              tabIndex={selecionado ? 0 : -1}
              onClick={() => setAtivo(i)}
              className={`grid cursor-pointer grid-cols-[2.75rem_1fr] rounded-lg border p-4 text-left transition duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
                selecionado
                  ? "border-brand bg-brand-soft"
                  : "border-line hover:bg-subtle"
              }`}
            >
              <span
                className={`row-span-2 text-2xl font-bold tracking-tighter tabular-nums ${
                  selecionado ? "text-brand" : "text-muted"
                }`}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-lg font-semibold">{passo.titulo}</span>
              <span className="mt-1.5 max-w-sm text-base leading-relaxed text-muted">
                {passo.texto}
              </span>
            </button>
          );
        })}
      </div>

      <div
        id={`${id}-painel`}
        role="tabpanel"
        aria-labelledby={`${id}-aba-${ativo}`}
        className="relative aspect-video w-full overflow-hidden rounded-xl border border-game-line bg-game shadow-game"
      >
        {passos.map((passo, i) => (
          <div
            key={passo.titulo}
            aria-hidden={i !== ativo}
            className={`absolute inset-0 transition-opacity duration-300 motion-reduce:transition-none ${
              i === ativo ? "opacity-100" : "opacity-0"
            }`}
          >
            {passo.imagem ? (
              <img
                src={passo.imagem}
                alt={passo.alt}
                loading="lazy"
                decoding="async"
                className="size-full object-contain [image-rendering:pixelated]"
              />
            ) : (
              <div className="flex size-full items-center justify-center text-sm text-white/60">
                {passo.titulo}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
