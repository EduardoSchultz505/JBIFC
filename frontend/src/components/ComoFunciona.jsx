import { useId, useRef, useState } from "react";

const passos = [
  {
    titulo: "Leia a instrução",
    texto:
      "Cada minijogo começa com uma ordem curta, e é ela que diz o que fazer.",
    imagem: "",
    alt: "Tela de instrução de um minijogo",
  },
  {
    titulo: "Acerte e some pontos",
    texto: "Cada acerto vale 1 ponto, e cada erro custa uma das 3 vidas.",
    imagem: "",
    alt: "Tela de uma rodada com vidas e pontuação",
  },
  {
    titulo: "Entre no ranking",
    texto: "Quando as vidas acabam, a pontuação vai para o ranking.",
    imagem: "",
    alt: "Tela do ranking de pontuações",
  },
];

export default function ComoFunciona() {
  const [ativo, setAtivo] = useState(0);
  const botoes = useRef([]);
  const id = useId();

  function aoTeclar(e) {
    const ultimo = passos.length - 1;
    let novo = null;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      novo = ativo === ultimo ? 0 : ativo + 1;
    }
    if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      novo = ativo === 0 ? ultimo : ativo - 1;
    }
    if (e.key === "Home") novo = 0;
    if (e.key === "End") novo = ultimo;
    if (novo === null) return;
    e.preventDefault();
    setAtivo(novo);
    botoes.current[novo].focus();
  }

  return (
    <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-[.8fr_1.2fr] md:gap-12">
      <div
        role="tablist"
        aria-label="Como funciona"
        aria-orientation="vertical"
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
              onKeyDown={aoTeclar}
              className={`grid min-h-11 grid-cols-[44px_1fr] rounded-lg border px-4 py-4 text-left transition duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
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
              <span className="mt-1.5 max-w-[36ch] text-[15px] leading-[1.55] text-muted">
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
                className="size-full object-cover [image-rendering:pixelated]"
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
