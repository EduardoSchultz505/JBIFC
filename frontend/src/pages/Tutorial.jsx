import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import Carrossel from "../components/Carrossel";
import ComoFunciona from "../components/ComoFunciona";
import Container from "../components/Container";

const regras = [
  "Você começa cada partida com 3 vidas.",
  "Cada acerto vale 1 ponto.",
  "Cada erro custa uma vida.",
  "A cada 5 acertos seguidos, o tempo diminui.",
  "Quando as vidas acabam, a pontuação vai para o ranking.",
  "Desbloqueie conquistas e seja o melhor do ranking.",
];

export default function Tutorial() {
  return (
    <main className="flex-1">
      <Container className="max-w-5xl pt-12 md:pt-16">
        <header className="mb-10 md:mb-12">
          <p className="text-xs font-bold uppercase tracking-widest text-brand">
            Antes de começar
          </p>
          <h1 className="mt-2 text-3xl font-bold leading-tight tracking-tight md:text-4xl">
            Como jogar
          </h1>
          <p className="mt-4 max-w-prose text-base leading-relaxed text-muted md:text-lg">
            Preste atenção à instrução e responda antes do tempo acabar. Cada
            rodada dura só alguns segundos.
          </p>
        </header>

        <section className="border-t border-line py-10 md:py-12">
          <h2 className="mb-8 text-2xl font-semibold tracking-tight">Passo a passo</h2>
          <ComoFunciona />
        </section>

        <section className="border-t border-line py-10 md:py-12">
          <h2 className="mb-8 text-2xl font-semibold tracking-tight">Regras</h2>

          <ol className="grid grid-cols-1 gap-x-12 md:grid-cols-2">
            {regras.map((regra, i) => (
              <li
                key={regra}
                className="flex min-h-16 items-center gap-4 border-b border-line py-3 text-base leading-snug"
              >
                <span aria-hidden="true" className="text-xs font-bold tabular-nums text-brand">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {regra}
              </li>
            ))}
          </ol>
        </section>
      </Container>

      <section className="border-t border-line bg-brand-soft py-14 md:py-16">
        <div className="overflow-hidden motion-reduce:overflow-x-auto">
          <Carrossel />
        </div>
      </section>

      <Container className="max-w-5xl py-10 md:py-12">
        <Link
          to="/jogar"
          className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2.5 rounded-lg bg-brand px-6 text-base font-semibold text-white transition duration-150 hover:-translate-y-px hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          Jogar agora
          <ArrowRight aria-hidden="true" size={18} />
        </Link>
      </Container>
      <Container>
      <p className="mb-8 text-md font-semibold tracking-tight bg-green-100 text-green-800 p-2 rounded-md">
        Segredo: Utilize o código Konami na tela inicial do jogo (↑ ↑ ↓ ↓ ← → ← → B A)
      </p>
      </Container>
    </main>
  );
}