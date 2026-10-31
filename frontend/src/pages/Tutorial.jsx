import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import Carrossel from "../components/Carrossel";
import ComoFunciona from "../components/ComoFunciona";

export default function Tutorial() {
  return (
    <main className="flex-1 pt-12 pb-18 md:pt-16 md:pb-22">
      <div className="mx-auto w-[calc(100%-32px)] max-w-240 md:w-[calc(100%-48px)]">
        <div className="mb-9.5 md:mb-12">
          <p className="text-xs leading-snug font-bold tracking-[.11em] text-brand">
            ANTES DE COMEÇAR
          </p>
          <h1 className="mt-2.25 text-[30px] leading-[1.15] font-bold tracking-tight md:text-[32px]">
            Como jogar
          </h1>
          <p className="mt-3.5 max-w-[62ch] text-base leading-[1.55] text-muted md:text-[17px]">
            Preste atenção à instrução e responda antes do tempo acabar. Cada
            rodada dura só alguns segundos.
          </p>
        </div>

        <section className="border-t border-line py-14 md:py-18">
          <ComoFunciona />
        </section>

        <section className="border-t border-line py-10.5 md:py-13">
          <div className="mb-7.5 flex flex-col items-start gap-2.5 md:flex-row md:items-end md:justify-between md:gap-6">
            <div>
              <h2 className="mt-1.75 text-2xl font-semibold tracking-tight">
                Regras
              </h2>
            </div>
          </div>

          <ul className="grid grid-cols-1 gap-x-12 md:grid-cols-2">
            <li className="flex min-h-16 items-center gap-4.5 border-b border-line text-[15px] leading-[1.45] text-ink">
              <span className="text-xs font-bold text-brand">01</span>
              Você começa cada partida com 3 vidas.
            </li>

            <li className="flex min-h-16 items-center gap-4.5 border-b border-line text-[15px] leading-[1.45] text-ink">
              <span className="text-xs font-bold text-brand">02</span>
              Cada acerto vale 1 ponto.
            </li>

            <li className="flex min-h-16 items-center gap-4.5 border-b border-line text-[15px] leading-[1.45] text-ink">
              <span className="text-xs font-bold text-brand">03</span>
              Cada erro custa uma vida.
            </li>

            <li className="flex min-h-16 items-center gap-4.5 border-b border-line text-[15px] leading-[1.45] text-ink">
              <span className="text-xs font-bold text-brand">04</span>
              A cada 5 acertos seguidos, o tempo diminui.
            </li>

            <li className="flex min-h-16 items-center gap-4.5 border-b border-line text-[15px] leading-[1.45] text-ink">
              <span className="text-xs font-bold text-brand">05</span>
              Quando as vidas acabam, a pontuação vai para o ranking.
            </li>

            <li className="flex min-h-16 items-center gap-4.5 border-b border-line text-[15px] leading-[1.45] text-ink">
              <span className="text-xs font-bold text-brand">06</span>
              Os controles funcionam somente por mouse ou toque.
            </li>
          </ul>
        </section>
      </div>

      {/* fora do container, para a faixa e o fundo ocuparem a tela toda */}
      <section className="mt-14 border-t border-line bg-brand-soft py-14 md:py-18">
        <Carrossel />
      </section>

      <div className="mx-auto mt-8 w-[calc(100%-32px)] max-w-240 md:w-[calc(100%-48px)]">
        <Link
          className="inline-flex min-h-12 items-center justify-center gap-2.5 rounded-lg border border-transparent bg-brand px-5.5 text-[15px] font-semibold text-white transition duration-150 hover:-translate-y-px hover:bg-brand-hover"
          to="/jogar"
        >
          Jogar agora
          <ArrowRight aria-hidden="true" size={18} />
        </Link>
      </div>
    </main>
  );
}