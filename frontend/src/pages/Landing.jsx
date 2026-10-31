import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import TelaDoJogo from "../components/TelaDoJogo";
import Carrossel from "../components/Carrossel";
import ComoFunciona from "../components/ComoFunciona";

export default function Landing() {
  const larguraDosNomes = ["w-2/5", "w-1/3", "w-1/2", "w-2/5", "w-1/4"];
  return (
    <main>
      <section className="pt-11.5 pb-14 md:pt-18 md:pb-20">
        <div className="mx-auto grid w-[calc(100%-32px)] max-w-275 grid-cols-1 items-center gap-10.5 max-xs:gap-9 md:w-[calc(100%-48px)] md:grid-cols-[.83fr_1.17fr] md:gap-18">
          <div>
            <p className="text-xs leading-snug font-bold tracking-[.11em] text-brand">
              PROJETO IFC · DESENVOLVIMENTO WEB 2
            </p>
            <h1 className="mt-3 text-[38px] leading-[1.07] font-bold tracking-tighter max-xs:text-4xl md:mt-3.5 md:text-[44px]">
              JBIFC: Mosquito's Average Day
            </h1>
            <p className="mt-4.5 mb-6.5 max-w-120 text-[17px] leading-[1.55] text-muted md:mt-6 md:mb-8 md:text-lg">
              Leia a instrução, aja rápido e entre no ranking.
            </p>
            <Link
              className="inline-flex min-h-12 items-center justify-center gap-2.5 rounded-lg border border-transparent bg-brand px-5.5 text-[15px] font-semibold text-white transition duration-150 hover:-translate-y-px hover:bg-brand-hover"
              to="/jogar"
            >
              Jogar agora
              <ArrowRight aria-hidden="true" size={18} />
            </Link>
          </div>

          <TelaDoJogo />
        </div>
      </section>

      <section className="border-t border-line py-14 md:py-18">
        <div className="mx-auto w-[calc(100%-32px)] max-w-275 md:w-[calc(100%-48px)]">
          <div className="mb-7 flex flex-col items-start gap-2.5 md:mb-9 md:flex-row md:items-end md:justify-between md:gap-6">
            <div>
              <p className="text-xs leading-snug font-bold tracking-[.11em] text-brand">
                EM TRÊS PASSOS
              </p>
              <h2 className="mt-1.75 text-2xl font-semibold tracking-tight">
                Como funciona
              </h2>
            </div>
          </div>
          <ComoFunciona />
        </div>
      </section>

      <section className="border-t border-line bg-brand-soft py-14 md:py-18">
        <div className="overflow-hidden motion-reduce:overflow-x-auto">
          <Carrossel />
        </div>
      </section>

      <section className="border-t border-line py-14 md:py-18">
        <div className="mx-auto w-[calc(100%-32px)] max-w-205 md:w-[calc(100%-48px)]">
          <div className="mb-7 md:mb-9">
            <p className="text-xs leading-snug font-bold tracking-[.11em] text-brand">
              MELHORES PONTUAÇÕES
            </p>
            <h2 className="mt-1.75 text-2xl font-semibold tracking-tight">
              Ranking
            </h2>
          </div>

          <div className="relative overflow-hidden rounded-xl border border-line bg-surface">
            <div aria-hidden="true">
              <div className="grid min-h-12 grid-cols-[55px_1fr_66px] items-center border-b border-line bg-subtle px-3.5 md:grid-cols-[90px_1fr_110px] md:px-6">
                <div className="esqueleto h-2.5 w-8 rounded bg-line" />
                <div className="esqueleto h-2.5 w-14 rounded bg-line" />
                <div className="esqueleto ml-auto h-2.5 w-10 rounded bg-line" />
              </div>

              {larguraDosNomes.map((largura, i) => (
                <div
                  key={i}
                  style={{ "--atraso": `${i * 150}ms` }}
                  className={`grid min-h-14.5 grid-cols-[55px_1fr_66px] items-center border-b border-line px-3.5 last:border-b-0 md:min-h-15.5 md:grid-cols-[90px_1fr_110px] md:px-6 ${i === 0 ? "bg-sun-soft" : ""}`}
                >
                  <div className="esqueleto h-3 w-6 rounded bg-subtle" />
                  <div
                    className={`esqueleto h-3 rounded bg-subtle ${largura}`}
                  />
                  <div className="esqueleto ml-auto h-3 w-10 rounded bg-subtle" />
                </div>
              ))}
            </div>

            <div className="absolute inset-0 flex items-center justify-center bg-surface/50">
              <Link
                to="/ranking"
                className="inline-flex min-h-12 items-center justify-center gap-2.5 rounded-lg bg-brand px-5.5 text-[15px] font-semibold text-white shadow-game transition duration-150 hover:-translate-y-px hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                Visualizar ranking
                <ArrowRight aria-hidden="true" size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
