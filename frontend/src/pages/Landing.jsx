import { Link } from "react-router";

const desafios = [
  {
    title: "Rotina acadêmica",
    description: "A experiência se baseia em situações cotidianas do ambiente universitário, com ritmo acelerado e atenção constante.",
  },
  {
    title: "Desafios curtos",
    description: "Cada rodada é objetiva e instigante, reforçando a ideia de ação rápida, reação e controle emocional.",
  },
  {
    title: "Competição saudável",
    description: "A pontuação e o ranking transformam a performance em uma disputa leve, mas séria, entre os estudantes.",
  },
];

const estatisticas = [
  { label: "Minigames", value: "8+" },
  { label: "Tempo", value: "rápido" },
  { label: "Tema", value: "IFC" },
];

function Landing() {
  return (
    <main className="min-h-screen bg-[#101522] text-white">
      <section className="mx-auto max-w-6xl px-6 py-16 lg:px-10">
        <div className="grid items-center gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <span className="inline-flex rounded-full border border-[#d9c7ae]/60 bg-[#d9c7ae]/10 px-4 py-1 text-sm font-medium tracking-[0.14em] text-[#e9dcc3] uppercase">
              projeto acadêmico
            </span>

            <h1 className="mt-6 text-4xl font-semibold tracking-[-0.04em] text-[#f5f0e8] md:text-5xl lg:text-6xl">
              JBIFC
            </h1>

            <p className="mt-4 max-w-xl text-lg leading-relaxed text-[#d9d3c8]">
              Um conjunto de minigames inspirados na rotina dos estudantes do IFC, com desafios rápidos, mecânicas diretas e uma proposta de competição leve entre a turma.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/jogar"
                className="rounded-md bg-[#6b8c5a] px-6 py-3 text-base font-medium text-[#f7f4ea] transition hover:opacity-90"
              >
                Jogar agora
              </Link>

              <Link
                to="/ranking"
                className="rounded-md border border-white/15 bg-white/3 px-6 py-3 text-base font-medium text-[#f5f0e8] transition hover:bg-white/5"
              >
                Ranking
              </Link>
            </div>

            <div className="mt-10 grid max-w-lg grid-cols-3 gap-4">
              {estatisticas.map((item) => (
                <div key={item.label} className="rounded-xl border border-white/10 bg-[#1b232a]/80 p-4 text-center">
                  <p className="text-2xl font-semibold text-[#f4d7a1]">{item.value}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[#c9c0b3]">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-[#d9c7ae]/15 bg-[#111821] p-6 shadow-[0_16px_40px_rgba(0,0,0,0.14)]">
            <div className="rounded-[1.25rem] border border-white/5 bg-[#171e28] p-5">
              <p className="text-xs font-medium uppercase tracking-[0.22em] text-[#d9c7ae]">em cada rodada</p>
              <ul className="mt-5 space-y-4 text-base text-[#e6e0d8]">
                <li>Foco e rapidez para cumprir a tarefa proposta.</li>
                <li>Mecânicas inspiradas em situações do cotidiano universitário.</li>
                <li>Pontuação e melhor desempenho em um ranking da turma.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20 lg:px-10">
        <div className="mb-8">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-[#d9c7ae]">sobre o jogo</p>
          <h2 className="mt-3 text-3xl font-semibold text-[#f3efe8] md:text-4xl">Uma proposta simples, direta e reconhecível</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {desafios.map((item) => (
            <article key={item.title} className="rounded-2xl border border-white/10 bg-[#111821] p-6">
              <h3 className="text-xl font-semibold text-[#f4f0ea]">{item.title}</h3>
              <p className="mt-3 text-base leading-relaxed text-[#cbc3b8]">{item.description}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export default Landing;