import { Link } from "react-router";

export default function Tutorial() {
  return (
    <main className="min-h-screen bg-[#101522] px-6 py-16 text-white lg:px-10">
      <div className="mx-auto max-w-4xl rounded-3xl border border-white/10 bg-white/5 p-8">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-verde-claro">Como jogar</p>
        <h1 className="mt-3 text-4xl font-black">Regras rápidas</h1>

        <ol className="mt-8 space-y-5 text-white/80">
          <li><span className="font-bold text-amarelo">1.</span> Abra a tela de jogo e clique em “Jogar”.</li>
          <li><span className="font-bold text-amarelo">2.</span> Cada rodada apresenta uma instrução curta e um desafio de poucos segundos.</li>
          <li><span className="font-bold text-amarelo">3.</span> Vence quem completar a tarefa dentro do tempo e soma pontos.</li>
          <li><span className="font-bold text-amarelo">4.</span> Três derrotas encerram a partida e sua pontuação é registrada no ranking.</li>
        </ol>

        <div className="mt-8">
          <Link
            to="/jogar"
            className="inline-flex rounded-xl bg-verde px-6 py-3 font-bold text-white shadow-botao transition hover:-translate-y-0.5 hover:shadow-none"
          >
            Ir para o jogo
          </Link>
        </div>
      </div>
    </main>
  );
}
