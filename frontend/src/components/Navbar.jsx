import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { Menu, X } from "lucide-react";
import Container from "./Container";
import { useAuth } from "../auth/useAuth";

const rotaPerfil = (nome) => `/perfil/${encodeURIComponent(nome)}`;

const LINKS = [
  ["/", "Início"],
  ["/ranking", "Ranking"],
  ["/como-jogar", "Como jogar"],
  ["/equipe", "Equipe"],
];

const foco ="focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";
function MenuUsuario({ usuario, aoSair }) {
  const [aberto, setAberto] = useState(false);
  const raiz = useRef(null);
  const botao = useRef(null);

  useEffect(() => {
    if (!aberto) return;
    const aoClicarFora = (e) => {
      if (!raiz.current?.contains(e.target)) setAberto(false);
    };
    const aoApertarTecla = (e) => {
      if (e.key === "Escape") {
        setAberto(false);
        botao.current?.focus();
      }
    };
    document.addEventListener("pointerdown", aoClicarFora);
    document.addEventListener("keydown", aoApertarTecla);
    return () => {
      document.removeEventListener("pointerdown", aoClicarFora);
      document.removeEventListener("keydown", aoApertarTecla);
    };
  }, [aberto]);

  const classeItem =
    "flex min-h-11 w-full cursor-pointer items-center rounded-md px-3 text-sm font-medium hover:bg-subtle focus-visible:bg-subtle focus-visible:outline-none";

  return (
    <div ref={raiz} className="relative">
      <button
        ref={botao}
        type="button"
        onClick={() => setAberto((a) => !a)}
        aria-expanded={aberto}
        aria-controls="menu-usuario"
        aria-label={`Menu de ${usuario}`}
        className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-lg text-white ${foco}`}
      >
        <span
          aria-hidden="true"
          className="grid size-9 place-items-center rounded-full bg-white/15 text-sm font-bold uppercase"
        >
          {Array.from(usuario)[0]}
        </span>
        <span className="hidden max-w-32 truncate text-sm font-medium md:block">
          {usuario}
        </span>
      </button>

      {aberto && (
        <div
          id="menu-usuario"
          className="absolute top-full right-0 z-30 mt-3 w-48 rounded-lg border border-line bg-surface p-2 shadow-game"
        >
          <p className="truncate px-3 py-2 text-xs text-muted">
            Conectado como {usuario}
          </p>
          <Link
            to={rotaPerfil(usuario)}
            onClick={() => setAberto(false)}
            className={classeItem}
          >
            Meu perfil
          </Link>
          <button
            type="button"
            onClick={() => {
              setAberto(false);
              aoSair();
            }}
            className={`${classeItem} text-left`}
          >
            Sair
          </button>
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [menuAberto, setMenuAberto] = useState(false);
  const botaoMenu = useRef(null);
  const { usuario, sair: encerrarSessao } = useAuth();

  useEffect(() => {
    if (!menuAberto) return;
    const aoApertarTecla = (e) => {
      if (e.key === "Escape") {
        setMenuAberto(false);
        botaoMenu.current?.focus();
      }
    };
    document.addEventListener("keydown", aoApertarTecla);
    return () => document.removeEventListener("keydown", aoApertarTecla);
  }, [menuAberto]);

  async function sair() {
    await encerrarSessao();
    navigate("/");
  }

  return (
    <header className="sticky top-0 z-20 bg-brand">
      <Container className="flex h-16 max-w-6xl items-center md:h-18">
        <Link
          aria-label="Ir para o início"
          onClick={() => setMenuAberto(false)}
          className={`flex min-h-11 items-center gap-2 rounded-lg text-white md:gap-3 ${foco}`}
          to="/"
        >
          <img src="/game/JBIFC.svg" alt="" className="w-12" />
          <span className="text-base font-bold tracking-tight md:text-lg">JBIFC</span>
        </Link>

        <nav
          aria-label="Navegação principal"
          className="ml-auto hidden items-stretch gap-8 self-stretch md:flex"
        >
          {LINKS.map(([rota, rotulo]) => (
            <Link
              key={rota}
              to={rota}
              aria-current={pathname === rota ? "page" : undefined}
              className={`relative flex items-center text-sm font-medium after:absolute after:inset-x-0 after:bottom-3 after:h-0.5 ${foco} ${
                pathname === rota
                  ? "text-white after:bg-white"
                  : "text-white/85 after:bg-transparent hover:text-white"
              }`}
            >
              {rotulo}
            </Link>
          ))}
        </nav>

        <Link
          to="/jogar"
          className={`ml-8 hidden min-h-11 items-center justify-center rounded-lg bg-white px-6 text-base font-semibold text-brand transition duration-150 hover:-translate-y-px md:inline-flex ${foco}`}
        >
          Jogar
        </Link>

        <div className="ml-auto md:ml-4">
          {usuario ? (
            <MenuUsuario usuario={usuario} aoSair={sair} />
          ) : (
            <Link
              to="/login"
              aria-current={pathname === "/login" ? "page" : undefined}
              className={`flex min-h-11 items-center rounded-lg px-2 text-sm font-medium text-white/85 hover:text-white ${foco}`}
            >
              Entrar
            </Link>
          )}
        </div>

        <button
          ref={botaoMenu}
          type="button"
          onClick={() => setMenuAberto((a) => !a)}
          aria-expanded={menuAberto}
          aria-controls="menu-mobile"
          aria-label="Menu"
          className={`ml-1 grid size-11 cursor-pointer place-items-center rounded-lg text-white md:hidden ${foco}`}
        >
          {menuAberto ? (
            <X aria-hidden="true" size={24} />
          ) : (
            <Menu aria-hidden="true" size={24} />
          )}
        </button>
      </Container>
        <nav
  id="menu-mobile"
  aria-label="Navegação principal"
  className={`overflow-hidden transition-[max-height,visibility] duration-300 ease-out motion-reduce:transition-none md:hidden ${
    menuAberto ? "visible max-h-96" : "invisible max-h-0"
  }`}
>
  <Container className="flex max-w-6xl flex-col gap-1 border-t border-white/15 py-3">
    {LINKS.map(([rota, rotulo]) => (
      <Link
        key={rota}
        to={rota}
        onClick={() => setMenuAberto(false)}
        aria-current={pathname === rota ? "page" : undefined}
        className={`flex min-h-12 items-center rounded-lg px-3 text-base font-medium ${foco} ${
          pathname === rota
            ? "bg-white/15 text-white"
            : "text-white/85 hover:bg-white/10 hover:text-white"
        }`}
      >
        {rotulo}
      </Link>
    ))}
    <Link
      to="/jogar"
      onClick={() => setMenuAberto(false)}
      className={`mt-2 flex min-h-12 items-center justify-center rounded-lg bg-white text-base font-semibold text-brand ${foco}`}
    >
      Jogar
    </Link>
  </Container>
</nav>
    </header>
  );
}