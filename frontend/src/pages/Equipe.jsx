import Tecnologias from "../components/Tecnologias"

export default function Equipe() {
  return (
    <main className="flex-1 pt-12 pb-18 md:pt-16 md:pb-22">
      <div className="mx-auto w-[calc(100%-32px)] md:w-[calc(100%-48px)] max-w-240">
        <div className="mb-9.5 md:mb-12">
          <p className="text-xs leading-snug font-bold tracking-[.11em] text-brand">SOBRE O PROJETO</p>
          <h1 className="mt-2.25 text-[30px] leading-[1.15] font-bold tracking-tight md:text-[32px]">Equipe</h1>
          <p className="mt-3.5 text-base leading-[1.55] text-muted md:text-[17px]">
            Projeto da disciplina de Desenvolvimento Web 2, do Instituto Federal Catarinense - Campus Concórdia.
          </p>
        </div>

        <section className="border-t border-line py-10.5 md:py-13">
          <div className="flex flex-col items-start gap-2.5 md:flex-row md:items-end md:justify-between md:gap-6 mb-7.5">
            <div>
              <h2 className="mt-1.75 text-2xl font-semibold tracking-tight">Integrantes</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3.5 md:grid-cols-3">
            <article className="min-h-31 rounded-lg border border-line bg-surface p-5 md:min-h-37">
              <span className="mb-5 block text-xs font-bold text-brand md:mb-7">01</span>
              <h3 className="text-[15px] font-semibold">Eduardo Schultz</h3>
              <p className="mt-1.5 text-[13px] leading-[1.4] text-muted">Desenvolvimento dos Jogos</p>
            </article>

            <article className="min-h-31 rounded-lg border border-line bg-surface p-5 md:min-h-37">
              <span className="mb-5 block text-xs font-bold text-brand md:mb-7">02</span>
              <h3 className="text-[15px] font-semibold">Endrio Ruan</h3>
              <p className="mt-1.5 text-[13px] leading-[1.4] text-muted">Design dos Jogos</p>
            </article>

            <article className="min-h-31 rounded-lg border border-line bg-surface p-5 md:min-h-37">
              <span className="mb-5 block text-xs font-bold text-brand md:mb-7">03</span>
              <h3 className="text-[15px] font-semibold">Guilherme Otávio</h3>
              <p className="mt-1.5 text-[13px] leading-[1.4] text-muted">Design dos Jogos</p>
            </article>

            <article className="min-h-31 rounded-lg border border-line bg-surface p-5 md:min-h-37">
              <span className="mb-5 block text-xs font-bold text-brand md:mb-7">04</span>
              <h3 className="text-[15px] font-semibold">Gustavo Kell</h3>
              <p className="mt-1.5 text-[13px] leading-[1.4] text-muted">Design dos Jogos</p>
            </article>

            <article className="min-h-31 rounded-lg border border-line bg-surface p-5 md:min-h-37">
              <span className="mb-5 block text-xs font-bold text-brand md:mb-7">05</span>
              <h3 className="text-[15px] font-semibold">João Araldi</h3>
              <p className="mt-1.5 text-[13px] leading-[1.4] text-muted">Gerenciamento de grupo e Testes</p>
            </article>

            <article className="min-h-31 rounded-lg border border-line bg-surface p-5 md:min-h-37">
              <span className="mb-5 block text-xs font-bold text-brand md:mb-7">06</span>
              <h3 className="text-[15px] font-semibold">Vinicius Pecini</h3>
              <p className="mt-1.5 text-[13px] leading-[1.4] text-muted">Desenvolvimento do Banco de Dados</p>
            </article>
          </div>
        </section>

        <section className="border-t border-line py-10.5 md:py-13">
          <div className="flex flex-col items-start gap-2.5 md:flex-row md:items-end md:justify-between md:gap-6 mb-7.5">
            <div>
              <h2 className="mt-1.75 text-2xl font-semibold tracking-tight">Tecnologias</h2>
            </div>
          </div>

          <Tecnologias />
        </section>
      </div>
    </main>
  )
}