import { useEffect, useReducer, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";

const CHAVE_TOKEN = "jbifc_token";

// Ajuste aqui se a rota do perfil for outra
const rotaPerfil = (nome) => `/perfil/${encodeURIComponent(nome)}`;

const LINKS = [
  ["/", "Início"],
  ["/ranking", "Ranking"],
  ["/como-jogar", "Como jogar"],
  ["/equipe", "Equipe"],
];

// Lê o nome direto do token, sem chamar o servidor. O payload do JWT é só base64;
// quem confere a assinatura é o backend, a cada requisição protegida.
function lerUsuario() {
  try {
    const token = localStorage.getItem(CHAVE_TOKEN);
    if (!token) return null;
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    // TextDecoder para nomes com acento (atob sozinho devolve bytes, não texto)
    const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    const dados = JSON.parse(new TextDecoder().decode(bytes));
    if (dados.exp && dados.exp * 1000 < Date.now()) return null;
    return typeof dados.usuario === "string" && dados.usuario ? dados.usuario : null;
  } catch {
    return null;
  }
}

function MenuUsuario({ usuario, aoSair }) {
  const [aberto, setAberto] = useState(false);
  const raiz = useRef(null);
  const botao = useRef(null);

  // Fecha ao clicar fora ou apertar Esc
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
    "flex min-h-11 w-full items-center rounded-md px-3 text-sm font-medium hover:bg-subtle";

  return (
    <div ref={raiz} className="relative">
      <button
        ref={botao}
        type="button"
        onClick={() => setAberto((a) => !a)}
        aria-expanded={aberto}
        aria-controls="menu-usuario"
        aria-label={`Menu de ${usuario}`}
        className="flex min-h-11 items-center gap-2.5 text-white"
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
          className="absolute top-full right-0 z-30 mt-3 w-48 rounded-lg border border-line bg-surface p-1.5 text-foreground shadow-game"
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
  // Força nova leitura do token (logout e mudanças feitas em outra aba)
  const [, atualizar] = useReducer((n) => n + 1, 0);
  const usuario = lerUsuario();

  useEffect(() => {
    const aoMudarStorage = (e) => {
      if (e.key === CHAVE_TOKEN || e.key === null) atualizar();
    };
    window.addEventListener("storage", aoMudarStorage);
    return () => window.removeEventListener("storage", aoMudarStorage);
  }, []);

  function sair() {
    localStorage.removeItem(CHAVE_TOKEN);
    atualizar();
    navigate("/");
  }

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
          {LINKS.map(([rota, rotulo]) => (
            <Link
              key={rota}
              to={rota}
              aria-current={pathname === rota ? "page" : undefined}
              className={`relative flex items-center text-sm font-medium after:absolute after:inset-x-0 after:bottom-3.75 after:h-0.5 ${
                pathname === rota
                  ? "text-white after:bg-white"
                  : "text-white/85 after:bg-transparent hover:text-white"
              }`}
            >
              {rotulo}
            </Link>
          ))}
        </nav>

        <div className="hidden md:ml-9.5 md:block">
          <Link
            className="inline-flex min-h-10.5 items-center justify-center gap-2.5 rounded-lg border border-transparent bg-white px-5.5 text-[15px] font-semibold text-brand-hover transition duration-150 hover:-translate-y-px"
            to="/jogar"
          >
            Jogar
          </Link>
        </div>

        {usuario && (
          <div className="ml-3 md:ml-4">
            <MenuUsuario usuario={usuario} aoSair={sair} />
          </div>
        )}
      </div>
    </header>
  );
}