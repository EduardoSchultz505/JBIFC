import { useEffect, useState } from "react";
import { Link } from "react-router";
import axios from "axios";
import { ArrowLeft, ArrowRight, RotateCw } from "lucide-react";
import Container from "../components/Container";

const colunas = "grid-cols-[3.5rem_1fr_4rem] md:grid-cols-[6rem_1fr_7rem]";

const botaoBase =
  "inline-flex min-h-12 cursor-pointer items-center justify-center gap-2.5 rounded-lg border px-6 text-base font-semibold transition duration-150 hover:-translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";
const botaoPrimario = `${botaoBase} border-transparent bg-brand text-white hover:bg-brand-hover`;
const botaoSecundario = `${botaoBase} border-line bg-surface hover:border-brand hover:bg-subtle`;

function Mensagem({ titulo, texto, role, children }) {
  return (
    <div
      role={role}
      className="flex min-h-72 flex-col items-center justify-center rounded-xl border border-line bg-surface p-6 text-center md:min-h-80 md:p-10"
    >
      {children}
      <h2 className="text-xl font-semibold">{titulo}</h2>
      <p className="mt-2 max-w-prose text-sm leading-normal text-muted">{texto}</p>
    </div>
  );
}

export default function Ranking() {
  const [estado, setEstado] = useState("carregando"); 
  const [ranking, setRanking] = useState([]);
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    axios.get("/api/ranking", {
        signal: controller.signal,
        timeout: 70000,
      })
      .then(({ data }) => {
        
        if (!Array.isArray(data)) throw new Error("Resposta inválida");
        setRanking(data);
        setEstado(data.length === 0 ? "vazio" : "pronto");
      })
      .catch((err) => {
        if (axios.isCancel(err)) return;
        console.error(err);
        setEstado("erro");
      });
    return () => controller.abort();
  }, [tentativa]);
  function tentarDeNovo() {
    setEstado("carregando");
    setTentativa((n) => n + 1);
  }
  return (
    <main className="flex-1 pt-12 pb-16 md:pt-16 md:pb-24">
      <Container className="max-w-5xl">
        <header className="mb-10 md:mb-12">
          <p className="text-xs font-bold uppercase tracking-widest text-brand">
            Classificação geral
          </p>
          <h1 className="mt-2 text-3xl font-bold leading-tight tracking-tight md:text-4xl">
            Ranking
          </h1>
          <p className="mt-4 max-w-prose text-base leading-relaxed text-muted md:text-lg">
            Veja a pontuação de todos os usuários
          </p>
        </header>
        {estado === "pronto" && (
          <div
            role="table"
            aria-label="Classificação dos jogadores"
            className="overflow-hidden rounded-xl border border-line bg-surface"
          >
            <div
              role="row"
              className={`grid ${colunas} min-h-12 items-center border-b border-line bg-subtle px-4 text-xs font-semibold tracking-wide text-muted md:px-6`}
            >
              <span role="columnheader">Pos.</span>
              <span role="columnheader">Nome</span>
              <span role="columnheader" className="text-right">
                Pontos
              </span>
            </div>
            {ranking.map((jogador) => {
              const primeiro = jogador.posicao === 1;
              return (
                <div
                  key={jogador.usuario}
                  role="row"
                  className={`grid ${colunas} min-h-14 items-center border-b border-line px-4 text-base last:border-b-0 md:min-h-16 md:px-6 ${
                    primeiro ? "bg-sun-soft" : ""
                  }`}
                >
                  <span
                    role="cell"
                    className={`tabular-nums ${primeiro ? "font-bold text-brand" : "text-muted"}`}
                  >
                    {String(jogador.posicao).padStart(2, "0")}
                  </span>
                  <span role="cell" className="min-w-0 pr-2">
                    <Link
                      to={`/perfil/${encodeURIComponent(jogador.usuario)}`}
                      className="block truncate font-semibold hover:text-brand hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                    >
                      {jogador.usuario}
                    </Link>
                  </span>
                  <span role="cell" className="text-right font-bold tabular-nums">
                    {Number(jogador.pontuacao).toLocaleString("pt-BR")}
                  </span>
                </div>
              );
            })}
          </div>
        )}
        {estado === "carregando" && (
          <Mensagem
            role="status"
            titulo="Carregando o ranking..."
            texto="Na primeira vez do dia, o servidor pode levar até um minuto para acordar."
          >
            <span
              aria-hidden="true"
              className="mb-5 size-10 animate-spin rounded-full border-2 border-line border-t-brand"
            />
          </Mensagem>
        )}
        {estado === "erro" && (
          <Mensagem
            role="alert"
            titulo="Não foi possível carregar o ranking."
            texto="Verifique sua conexão e tente novamente."
          >
            <button type="button" onClick={tentarDeNovo} className={`${botaoSecundario} order-last mt-6`}>
              <RotateCw aria-hidden="true" size={18} />
              Tentar de novo
            </button>
          </Mensagem>
        )}
        {estado === "vazio" && <Mensagem titulo="Ninguém jogou ainda." texto="Seja o primeiro!" />}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link className={botaoSecundario} to="/">
            <ArrowLeft aria-hidden="true" size={18} />
            Voltar ao início
          </Link>
          <Link className={botaoPrimario} to="/jogar">
            Jogar agora
            <ArrowRight aria-hidden="true" size={18} />
          </Link>
        </div>
      </Container>
    </main>
  );
}