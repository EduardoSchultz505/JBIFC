import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import axios from "axios";
import { ArrowLeft, RotateCw } from "lucide-react";
import Container from "../components/Container";


const ATRASO_AVISO_MS = 4000;

const classeBotaoBase =
  "inline-flex min-h-12 cursor-pointer items-center justify-center gap-2.5 rounded-lg border px-6 text-base font-semibold transition duration-150 hover:-translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";
const classeBotaoPrimario = `${classeBotaoBase} border-transparent bg-brand text-white hover:bg-brand-hover`;
const classeBotaoSecundario = `${classeBotaoBase} border-line bg-surface hover:bg-subtle`;

function formatarData(iso) {
  const data = iso ? new Date(iso) : null;
  return data && !Number.isNaN(data.getTime())
    ? data.toLocaleDateString("pt-BR")
    : "";
}

const formatarNumero = (n) => Number(n ?? 0).toLocaleString("pt-BR");

function Eyebrow({ children }) {
  return (
    <p className="text-xs font-bold uppercase tracking-widest text-brand">
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

    const controller = new AbortController();
    const aviso = setTimeout(() => setDemorando(true), ATRASO_AVISO_MS);
    axios.get(`/api/usuarios/${encodeURIComponent(nome)}`, {
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
      <main className="flex-1 py-14 md:py-16">
        <Container className="max-w-4xl">
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
        </Container>
      </main>
    );
  }

  if (!perfil) {
    return (
      <main className="flex-1 py-14 md:py-16" aria-busy="true">
        <Container className="max-w-4xl">
          <div className="esqueleto h-8 w-1/3 rounded bg-subtle" />
          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[0, 1, 2].map((i) => (
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
        </Container>
      </main>
    );
  }

  const { ranking } = perfil;
  const conquistas = perfil.conquistas ?? [];

  return (
    <main className="flex-1">
      <section className="py-14 md:py-16">
        <Container className="max-w-4xl">
          <Eyebrow>Perfil do jogador</Eyebrow>
          <h1 className="mt-2 text-4xl font-bold leading-tight tracking-tighter wrap-break-word md:text-5xl">
            {perfil.usuario}
          </h1>

          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Numero valor={ranking ? `${ranking.posicao}º` : "-"} rotulo="Posição" />
            <Numero
              valor={formatarNumero(ranking?.pontuacao)}
              rotulo="Melhor pontuação"
            />
            <Numero valor={formatarNumero(perfil.partidasTotais)} rotulo="Partidas" />
          </div>

          {!ranking && (
            <p className="mt-4 text-muted">
              Este jogador ainda não tem pontuação no ranking.
            </p>
          )}
        </Container>
      </section>

      <section className="border-t border-line bg-brand-soft py-14 md:py-16">
        <Container className="max-w-4xl">
          <Eyebrow>Desbloqueadas</Eyebrow>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">
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
                    className="flex items-start gap-4 rounded-xl border border-line bg-surface p-4"
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
        </Container>
      </section>
    </main>
  );
}