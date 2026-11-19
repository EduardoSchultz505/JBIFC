import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import TelaDoJogo from "../components/TelaDoJogo";
import Carrossel from "../components/Carrossel";
import ComoFunciona from "../components/ComoFunciona";
import Container from "../components/Container";

const larguraDosNomes = ["w-2/5", "w-1/3", "w-1/2", "w-2/5", "w-1/4"];

const botao = "inline-flex min-h-12 items-center justify-center gap-2.5 rounded-lg bg-brand px-6 text-base font-semibold text-white transition duration-150 hover:-translate-y-px hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

export default function Landing() {
  return (
    <main>
      <section className="pt-12 pb-14 md:pt-16 md:pb-20">
        <Container className="grid max-w-6xl grid-cols-1 items-center gap-10 lg:grid-cols-[5fr_7fr] lg:gap-16 md:gap-16">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-brand">
              Projeto IFC · Desenvolvimento Web 2
            </p>
            <h1 className="mt-3 text-4xl font-bold leading-tight tracking-tighter lg:text-5xl">
              JBIFC: Mosquito's Average Day
            </h1>
            <p className="mt-4 mb-6 max-w-prose text-base leading-relaxed text-muted md:mt-6 md:mb-8 md:text-lg">
              Leia a instrução, aja rápido e entre no ranking.
            </p>
            <Link className={botao} to="/jogar">
              Jogar agora
              <ArrowRight aria-hidden="true" size={18} />
            </Link>
          </div>

          <TelaDoJogo />
        </Container>
      </section>

      <section className="border-t border-line py-14 md:py-16">
        <Container>
          <div className="mb-8 md:mb-10">
            <p className="text-xs font-bold uppercase tracking-widest text-brand">
              Em três passos
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">Como funciona</h2>
          </div>
          <ComoFunciona />
        </Container>
      </section>

      <section className="border-t border-line bg-brand-soft py-14 md:py-16">
        <div className="overflow-hidden motion-reduce:overflow-x-auto">
          <Carrossel />
        </div>
      </section>

      <section className="border-t border-line py-14 md:py-16">
        <Container className="max-w-3xl">
          <div className="mb-8 md:mb-10">
            <p className="text-xs font-bold uppercase tracking-widest text-brand">
              Melhores pontuações
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">Ranking</h2>
          </div>

          <div className="relative overflow-hidden rounded-xl border border-line bg-surface">
            {/* Esqueleto decorativo, escondido de leitores de tela */}
            <div aria-hidden="true">
              <div className="grid min-h-12 grid-cols-[3.5rem_1fr_4rem] items-center border-b border-line bg-subtle px-4 md:grid-cols-[6rem_1fr_7rem] md:px-6">
                <div className="esqueleto h-2.5 w-8 rounded bg-line" />
                <div className="esqueleto h-2.5 w-14 rounded bg-line" />
                <div className="esqueleto ml-auto h-2.5 w-10 rounded bg-line" />
              </div>

              {larguraDosNomes.map((largura, i) => (
                <div
                  key={i}
                  style={{ "--atraso": `${i * 150}ms` }}
                  className={`grid min-h-14 grid-cols-[3.5rem_1fr_4rem] items-center border-b border-line px-4 last:border-b-0 md:min-h-16 md:grid-cols-[6rem_1fr_7rem] md:px-6 ${i === 0 ? "bg-sun-soft" : ""}`}
                >
                  <div className="esqueleto h-3 w-6 rounded bg-subtle" />
                  <div className={`esqueleto h-3 rounded bg-subtle ${largura}`} />
                  <div className="esqueleto ml-auto h-3 w-10 rounded bg-subtle" />
                </div>
              ))}
            </div>

            <div className="absolute inset-0 flex items-center justify-center bg-surface/50">
              <Link to="/ranking" className={`${botao} shadow-game`}>
                Visualizar ranking
                <ArrowRight aria-hidden="true" size={18} />
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}