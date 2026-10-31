import { Link, useLocation } from "react-router";

export default function Navbar() {
  const { pathname } = useLocation();
  return (
    <header className="sticky top-0 z-20 bg-brand">
      <div className="mx-auto flex h-16 w-[calc(100%-32px)] max-w-275 items-center md:h-18 md:w-[calc(100%-48px)]">
        <Link
          aria-label="Ir para o início"
          className="flex min-h-11 items-center gap-2.5 text-white md:gap-3.5"
          to="/"
        >
          <img src="/game/JBIFC.svg" alt="JBIFC" className="w-12" />
          <span className="text-base font-bold tracking-tight md:text-lg">
            JBIFC
          </span>
        </Link>

        <nav
          aria-label="Navegação principal"
          className="ml-auto flex items-stretch gap-4 self-stretch md:gap-7.5"
        >
          <Link
            className={`relative flex items-center text-sm font-medium after:absolute after:inset-x-0 after:bottom-3.75 after:h-0.5 ${
              pathname === "/"
                ? "text-white after:bg-white"
                : "text-white/85 after:bg-transparent hover:text-white"
            }`}
            to="/"
          >
            Início
          </Link>

          <Link
            className={`relative flex items-center text-sm font-medium after:absolute after:inset-x-0 after:bottom-3.75 after:h-0.5 ${
              pathname === "/ranking"
                ? "text-white after:bg-white"
                : "text-white/85 after:bg-transparent hover:text-white"
            }`}
            to="/ranking"
          >
            Ranking
          </Link>

          <Link
            className={`relative flex items-center text-sm font-medium after:absolute after:inset-x-0 after:bottom-3.75 after:h-0.5 ${
              pathname === "/como-jogar"
                ? "text-white after:bg-white"
                : "text-white/85 after:bg-transparent hover:text-white"
            }`}
            to="/como-jogar"
          >
            Como jogar
          </Link>

          <Link
            className={`relative flex items-center text-sm font-medium after:absolute after:inset-x-0 after:bottom-3.75 after:h-0.5 ${
              pathname === "/equipe"
                ? "text-white after:bg-white"
                : "text-white/85 after:bg-transparent hover:text-white"
            }`}
            to="/equipe"
          >
            Equipe
          </Link>
        </nav>

        <div className="hidden md:ml-9.5 md:block">
          <Link
            className="inline-flex min-h-10.5 items-center justify-center gap-2.5 rounded-lg border border-transparent bg-white px-5.5 text-[15px] font-semibold text-brand-hover transition duration-150 hover:-translate-y-px"
            to="/jogar"
          >
            Jogar
          </Link>
        </div>
      </div>
    </header>
  );
}
