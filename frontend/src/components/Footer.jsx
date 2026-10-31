import { Link } from "react-router";

export default function Footer() {
  return (
    <footer className="mt-auto bg-footer text-white">
      <div className="mx-auto flex min-h-27 w-[calc(100%-32px)] max-w-275 flex-col items-start gap-6 py-8 md:w-[calc(100%-48px)] md:flex-row md:items-center md:justify-between md:gap-0 md:py-0">
        <div className="flex items-center gap-3.5">
          <img src="/game/JBIFC.svg" alt="JBIFC" className="w-12" />
          <img src="/game/IFC.svg" alt="JBIFC" className="w-12" />
        </div>

        <nav
          aria-label="Navegação do rodapé"
          className="grid w-full grid-cols-2 gap-x-5 gap-y-0.5 md:flex md:w-auto md:gap-7"
        >
          <Link
            className="flex min-h-11 items-center text-left text-sm text-white/75 hover:text-white hover:underline hover:underline-offset-5"
            to="/"
          >
            Início
          </Link>

          <Link
            className="flex min-h-11 items-center text-left text-sm text-white/75 hover:text-white hover:underline hover:underline-offset-5"
            to="/jogar"
          >
            Jogar
          </Link>

          <Link
            className="flex min-h-11 items-center text-left text-sm text-white/75 hover:text-white hover:underline hover:underline-offset-5"
            to="/ranking"
          >
            Ranking
          </Link>

          <Link
            className="flex min-h-11 items-center text-left text-sm text-white/75 hover:text-white hover:underline hover:underline-offset-5"
            to="/como-jogar"
          >
            Como jogar
          </Link>

          <Link
            className="flex min-h-11 items-center text-left text-sm text-white/75 hover:text-white hover:underline hover:underline-offset-5"
            to="/equipe"
          >
            Equipe
          </Link>
        </nav>
      </div>

      <div className="mx-auto w-[calc(100%-32px)] max-w-275 border-t border-white/15 py-5 text-[13px] leading-normal text-white/60 md:w-[calc(100%-48px)]">
        Trabalho de Desenvolvimento Web 2, Instituto Federal Catarinense -
        Campus Concórdia.
      </div>
    </footer>
  );
}
