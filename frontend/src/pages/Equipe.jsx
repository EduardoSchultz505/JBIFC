import Tecnologias from "../components/Tecnologias"

const integrantes = [
  { nome: "Eduardo Schultz", funcao: "Desenvolvimento dos jogos e página web" },
  { nome: "Endrio Ruan", funcao: "Diretor de arte, Criação do Trailer e design dos jogos Use o Totem e da Interface do Menu" },
  { nome: "Guilherme Otávio", funcao: "Design dos Jogos Vilígia dos Porcos e Pegue Mais Lanche" },
  { nome: "Gustavo Kell", funcao: "Design dos Jogos Jonha Bird e Solte os Porcos" },
  { nome: "João Araldi", funcao: "Gerenciamento de Grupo, Gerador de Ideias, Sonoplasta, Scrum Master, Product Owner, Revisador de conteúdo nas páginas, Gerenciador do Sistema Scrum e Testador de Jogos" },
  { nome: "Vinicius Pecini", funcao: "Desenvolvimento do banco de dados e backend" },
]

export default function Equipe() {
  return (
    <main className="flex-1 pt-12 pb-16 md:pt-16 md:pb-24">
      <div className="mx-auto w-full max-w-240 px-4 md:px-6">
        <header className="mb-10 md:mb-12">
          <p className="text-xs font-bold uppercase tracking-widest text-brand">Sobre o projeto</p>
          <h1 className="mt-2 text-3xl font-bold leading-tight tracking-tight md:text-4xl">Equipe</h1>
          <p className="mt-4 text-base leading-relaxed text-muted md:text-lg">
            Projeto da disciplina de Desenvolvimento Web 2, do Instituto Federal Catarinense - Campus Concórdia.
          </p>
        </header>

        <section className="border-t border-line py-10 md:py-12">
          <h2 className="mb-8 text-2xl font-semibold tracking-tight">Integrantes</h2>

          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {integrantes.map(({ nome, funcao }, i) => (
              <li key={nome} className="rounded-lg border border-line bg-surface p-5">
                <span aria-hidden="true" className="mb-5 block text-xs font-bold text-brand md:mb-7">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="text-base font-semibold">{nome}</h3>
                <p className="mt-1.5 text-sm leading-snug text-muted">{funcao}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="border-t border-line py-10 md:py-12">
          <h2 className="mb-8 text-2xl font-semibold tracking-tight">Tecnologias</h2>
          <Tecnologias />
        </section>
      </div>
    </main>
  )
}