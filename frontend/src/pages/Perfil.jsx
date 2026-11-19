import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import axios from "axios";
import { ArrowLeft, RotateCw } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, "");
const API_URL_LOCAL = import.meta.env.DEV ? "http://localhost:5000" : API_URL;

const ATRASO_AVISO_MS = 4000;

const larguraPagina =
  "mx-auto w-[calc(100%-32px)] max-w-205 md:w-[calc(100%-48px)]";

const classeBotaoBase =
  "inline-flex min-h-12 items-center justify-center gap-2.5 rounded-lg border px-5.5 text-[15px] font-semibold transition duration-150 hover:-translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";
const classeBotaoPrimario = `${classeBotaoBase} border-transparent bg-brand text-white hover:bg-brand-hover`;
const classeBotaoSecundario = `${classeBotaoBase} border-line bg-surface text-foreground hover:bg-subtle`;

function formatarData(iso) {
  const data = iso ? new Date(iso) : null;
  return data && !Number.isNaN(data.getTime())
    ? data.toLocaleDateString("pt-BR")
    : "";
}

const formatarNumero = (n) => Number(n ?? 0).toLocaleString("pt-BR");

function Eyebrow({ children }) {
  return (
    <p className="text-xs leading-snug font-bold tracking-[.11em] text-brand">
      {children}
    </p>
  );
}

function Numero({ valor, rotulo }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-4 md:p-5">
      <p className="text-3xl font-bold tracking-tight text-brand">{valor}</p>
      <p className="mt-1 text-sm text-muted">{rotulo}</p>
    </div>
  );
}

export default function Perfil() {
  const { nome } = useParams();
  const [perfil, setPerfil] = useState(null);
  const [erro, setErro] = useState(null);
  const [demorando, setDemorando] = useState(false);
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPerfil(null);
    setErro(null);
    setDemorando(false);

    if (!API_URL_LOCAL) {
      setErro({ texto: "A URL da API não está configurada.", repetir: false });
      return;
    }

    const controller = new AbortController();
    const aviso = setTimeout(() => setDemorando(true), ATRASO_AVISO_MS);

    axios
      .get(`${API_URL_LOCAL}/api/usuarios/${encodeURIComponent(nome)}`, {
        timeout: 70000,
        signal: controller.signal,
      })
      .then((resposta) => setPerfil(resposta.data))
      .catch((e) => {
        if (axios.isCancel(e)) return;
        setErro({
          texto: e.response?.data?.erro || "Não foi possível carregar o perfil.",
          repetir: e.response?.status !== 404,
        });
      })
      .finally(() => clearTimeout(aviso));

    return () => {
      controller.abort();
      clearTimeout(aviso);
    };
  }, [nome, tentativa]);

  if (erro) {
    return (
      <main className="py-14 md:py-18">
        <div className={larguraPagina}>
          <div role="alert">
            <h1 className="text-2xl font-semibold tracking-tight">{erro.texto}</h1>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            {erro.repetir && (
              <button
                type="button"
                onClick={() => setTentativa((t) => t + 1)}
                className={classeBotaoPrimario}
              >
                <RotateCw aria-hidden="true" size={18} />
                Tentar de novo
              </button>
            )}
            <Link
              className={erro.repetir ? classeBotaoSecundario : classeBotaoPrimario}
              to="/ranking"
            >
              <ArrowLeft aria-hidden="true" size={18} />
              Voltar ao ranking
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (!perfil) {
    return (
      <main className="py-14 md:py-18" aria-busy="true">
        <div className={larguraPagina}>
          <div className="esqueleto h-8 w-1/3 rounded bg-subtle" />
          <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                style={{ "--atraso": `${i * 150}ms` }}
                className="esqueleto h-24 rounded-xl bg-subtle"
              />
            ))}
          </div>
          <p
            role="status"
            className={demorando ? "mt-6 text-sm text-muted" : "sr-only"}
          >
            {demorando
              ? "O servidor pode levar até 1 minuto para acordar. Aguarde."
              : "Carregando perfil..."}
          </p>
        </div>
      </main>
    );
  }

  const { ranking } = perfil;
  const conquistas = perfil.conquistas ?? [];

  return (
    <main>
      <section className="py-14 md:py-18">
        <div className={larguraPagina}>
          <Eyebrow>PERFIL DO JOGADOR</Eyebrow>
          <h1 className="mt-1.75 text-[38px] leading-[1.07] font-bold tracking-tighter wrap-break-word md:text-[44px]">
            {perfil.usuario}
          </h1>

          <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
            <Numero valor={ranking ? `${ranking.posicao}º` : "-"} rotulo="Posição" />
            <Numero
              valor={formatarNumero(ranking?.pontuacao)}
              rotulo="Melhor pontuação"
            />
            <Numero valor={formatarNumero(ranking?.nivel)} rotulo="Nível" />
            <Numero valor={formatarNumero(perfil.partidasTotais)} rotulo="Partidas" />
          </div>

          {!ranking && (
            <p className="mt-4 text-muted">
              Este jogador ainda não tem pontuação no ranking.
            </p>
          )}
        </div>
      </section>

      <section className="border-t border-line bg-brand-soft py-14 md:py-18">
        <div className={larguraPagina}>
          <Eyebrow>DESBLOQUEADAS</Eyebrow>
          <h2 className="mt-1.75 text-2xl font-semibold tracking-tight">
            Conquistas ({conquistas.length})
          </h2>

          {conquistas.length === 0 ? (
            <p className="mt-6 text-muted">Nenhuma conquista desbloqueada ainda.</p>
          ) : (
            <ul className="mt-6 grid gap-3 md:grid-cols-2">
              {conquistas.map((c) => {
                const data = formatarData(c.unlockedAt);
                return (
                  <li
                    key={c.id}
                    className="flex items-start gap-3.5 rounded-xl border border-line bg-surface p-4"
                  >
                    <span className="text-3xl leading-none" aria-hidden="true">
                      {c.icon}
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold">{c.name}</p>
                      <p className="mt-0.5 text-sm text-muted">{c.description}</p>
                      {data && (
                        <p className="mt-1.5 text-xs text-muted">
                          Desbloqueada em {data}
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          <Link className={`${classeBotaoPrimario} mt-8`} to="/ranking">
            <ArrowLeft aria-hidden="true" size={18} />
            Voltar ao ranking
          </Link>
        </div>
      </section>
    </main>
  );
}