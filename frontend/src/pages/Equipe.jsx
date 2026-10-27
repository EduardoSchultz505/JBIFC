export default function Equipe() {
  return (
    <main className="min-h-screen bg-[#101522] px-6 py-16 text-white lg:px-10">
      <div className="mx-auto max-w-4xl rounded-3xl border border-white/10 bg-white/5 p-8">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-verde-claro">Equipe</p>
        <h1 className="mt-3 text-4xl font-black">Quem criou o JBIFC</h1>

        <div className="mt-8 space-y-6 text-white/75">
          <p>
            O JBIFC foi desenvolvido como um projeto de Desenvolvimento Web 2, com foco em criar uma experiência divertida,
            rápida e inspirada no cotidiano dos estudantes do IFC.
          </p>
          <p>
            A ideia é reunir vários minigames em um único jogo, cada um com mecânicas simples, visuais marcantes e desafios
            que remetem à rotina acadêmica, sem perder o clima de competição entre a turma.
          </p>
          <p className="rounded-2xl border border-amarelo/30 bg-amarelo/10 p-4 text-amarelo">
            Projeto acadêmico, sem relação oficial com o Instituto Federal Catarinense real.
          </p>
        </div>
      </div>
    </main>
  );
}
