
import { Link } from "react-router";
import { ArrowLeft, Bug } from "lucide-react";
import Container from "../components/Container";

const botao =
  "inline-flex min-h-12 items-center justify-center gap-2.5 rounded-lg bg-brand px-6 text-base font-semibold text-white transition duration-150 hover:-translate-y-px hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

export default function Pagina404() {
  return (
    <main className="flex min-h-[75vh] flex-1 items-center justify-center py-16">
      <Container className="max-w-3xl">
        <section className="text-center">
          <div
            aria-hidden="true"
            className="mx-auto mb-8 flex size-16 items-center justify-center rounded-2xl border border-line bg-brand-soft"
          >
            <Bug size={32} className="text-brand" />
          </div>

          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand">
            Página não encontrada
          </p>

          <h1 className="mt-4 text-8xl font-bold tracking-tighter text-brand md:text-9xl">
            404
          </h1>

          <h2 className="mt-5 text-2xl font-semibold tracking-tight md:text-3xl">
            Ops! Você se perdeu no caminho.
          </h2>

          <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-muted md:text-lg">
            Parece que esta página não existe ou foi movida.
            Que tal voltar ao início e continuar sua jornada?
          </p>

          <div className="mt-8 flex justify-center">
            <Link to="/" className={botao}>
              <ArrowLeft aria-hidden="true" size={18} />
              Voltar ao início
            </Link>
          </div>

          <p className="mt-12 text-xs font-medium tracking-wide text-muted">
            JBIFC · Regular Mosquito's Day
          </p>
        </section>
      </Container>
    </main>
  );
}
