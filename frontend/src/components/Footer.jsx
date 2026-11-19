import { Link } from "react-router";
import Container from "./Container";

const LINKS = [
  ["/", "Início"],
  ["/jogar", "Jogar"],
  ["/ranking", "Ranking"],
  ["/como-jogar", "Como jogar"],
  ["/equipe", "Equipe"],
  ["/login", "Entrar"],
];

export default function Footer() {
  return (
    <footer className="mt-auto bg-footer text-white">
      <Container className="flex max-w-6xl flex-col items-start gap-6 py-8 md:flex-row md:items-center md:justify-between md:gap-8 md:py-10">
        <div className="flex shrink-0 items-center gap-4">
          <img src="/game/JBIFC.svg" alt="JBIFC" className="h-12 w-auto" />
          <img
            src="/game/IFC.svg"
            alt="Instituto Federal Catarinense"
            className="h-12 w-auto"
          />
        </div>

        <nav
          aria-label="Navegação do rodapé"
          className="flex flex-wrap gap-x-6 gap-y-1 md:justify-end md:gap-x-8"
        >
          {LINKS.map(([rota, rotulo]) => (
            <Link
              key={rota}
              to={rota}
              className="flex min-h-11 items-center rounded-md text-sm text-white/80 hover:text-white hover:underline hover:underline-offset-4 focus-visible:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              {rotulo}
            </Link>
          ))}
        </nav>
      </Container>

      <Container className="max-w-6xl border-t border-white/15 py-5 text-sm leading-normal text-white/70">
        Trabalho de Desenvolvimento Web 2, Instituto Federal Catarinense - Campus Concórdia.
      </Container>
    </footer>
  );
}