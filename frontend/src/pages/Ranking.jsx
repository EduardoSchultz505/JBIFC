import { Link } from "react-router";

const ranking = [
  { nome: "Ana", pontos: 420 },
  { nome: "Bruno", pontos: 390 },
  { nome: "Caio", pontos: 360 },
  { nome: "Duda", pontos: 330 },
  { nome: "Eli", pontos: 290 },
];

export default function Ranking() {
  return (
    <main className="min-h-screen bg-[#101522] px-6 py-16 text-white lg:px-10">
      <div className="mx-auto max-w-4xl rounded-3xl border border-white/10 bg-white/5 p-8 shadow-xl shadow-black/20">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-verde-claro">Ranking</p>
        <h1 className="mt-3 text-4xl font-black">Top da turma</h1>
        <p className="mt-3 max-w-2xl text-white/75">
          Veja quem está dominando os minigames e tente bater a pontuação dos estudantes mais rápidos do IFC.
        </p>

        <div className="mt-8 overflow-hidden rounded-2xl border border-white/10">
          <table className="min-w-full text-left">
            <thead className="bg-verde text-white">
              <tr>
                <th className="px-4 py-3 font-semibold">Posição</th>
                <th className="px-4 py-3 font-semibold">Jogador</th>
                <th className="px-4 py-3 font-semibold text-right">Pontuação</th>
              </tr>
            </thead>
            <tbody>
              {ranking.map((jogador, index) => (
                <tr key={jogador.nome} className="border-t border-white/10 bg-[#111827]">
                  <td className="px-4 py-3">#{index + 1}</td>
                  <td className="px-4 py-3">{jogador.nome}</td>
                  <td className="px-4 py-3 text-right font-bold text-amarelo">{jogador.pontos}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8">
          <Link
            to="/jogar"
            className="inline-flex rounded-xl bg-vermelho px-6 py-3 font-bold text-white shadow-botao transition hover:-translate-y-0.5 hover:shadow-none"
          >
            Jogar agora
          </Link>
        </div>
      </div>
    </main>
  );
}
