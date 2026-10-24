import { lazy, Suspense, useRef, useState } from "react";
import { Link } from "react-router";

// o Phaser só é baixado quando o jogador aperta o play
const Game = lazy(() => import("../game/Game"));

const API = import.meta.env.VITE_API_URL ?? "http://localhost:5000";
const CHAVE_NOME = "microjogos:nome";

const MENSAGEM_ENVIO = {
  enviando: "Enviando sua pontuação. Na primeira vez, o servidor pode levar alguns segundos para acordar.",
  ok: "Pontuação salva no ranking.",
  erro: "Não foi possível salvar. Sua pontuação continua na tela, tente de novo.",
};

const foco = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-grafite";

const botaoContorno = [
  "inline-block min-h-11 rounded-xl border-2 border-grafite px-5 py-2 text-center text-lg font-semibold text-grafite",
  "hover:bg-grafite/10",
  foco,
].join(" ");

// o nome fica salvo para não digitar de novo
function lerNomeSalvo() {
  try {
    return localStorage.getItem(CHAVE_NOME) ?? "";
  } catch {
    return "";
  }
}

function salvarNome(nome) {
  try {
    localStorage.setItem(CHAVE_NOME, nome);
  } catch {
    // sem armazenamento, segue sem salvar
  }
}

async function enviarPontuacao(nome, pontos) {
  const resposta = await fetch(`${API}/api/pontuacao`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nome, pontos }),
  });
  if (!resposta.ok) throw new Error("falha ao enviar");
}

function BotaoPlay({ rotulo, aoClicar }) {
  return (
    <button
      className={`flex size-14 items-center justify-center rounded-full border-4 border-grafite bg-amarelo shadow-botao active:translate-y-1 active:shadow-none md:size-24 ${foco}`}
      type="button"
      aria-label={rotulo}
      onClick={aoClicar}
    >
      <svg className="ml-1 size-6 fill-grafite md:size-10" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 4l14 8-14 8z" />
      </svg>
    </button>
  );
}

export default function Jogar() {
  const [fase, setFase] = useState("capa"); // "capa" | "jogando" | "fim"
  const [nome, setNome] = useState(lerNomeSalvo);
  const [erroNome, setErroNome] = useState("");
  const [pontos, setPontos] = useState(0);
  const [envio, setEnvio] = useState("enviando"); // "enviando" | "ok" | "erro"

  const janelaRef = useRef(null);
  const nomeRef = useRef(null);
  const podeTelaCheia = typeof document !== "undefined" && document.fullscreenEnabled;

  const enviar = async (n, p) => {
    setEnvio("enviando");
    try {
      await enviarPontuacao(n, p);
      setEnvio("ok");
    } catch {
      setEnvio("erro");
    }
  };

  const iniciar = () => {
    const limpo = nome.trim();
    if (!limpo) {
      setErroNome("Digite um nome de 1 a 20 caracteres para jogar.");
      nomeRef.current?.focus();
      return;
    }
    setNome(limpo);
    salvarNome(limpo);
    setErroNome("");
    setFase("jogando");
  };

  // o Game chama esta função uma vez, quando as vidas acabam
  const terminar = (pontosFinais) => {
    setPontos(pontosFinais);
    setFase("fim");
    enviar(nome, pontosFinais);
  };

  const telaCheia = () => {
    janelaRef.current?.requestFullscreen?.().catch(() => {});
  };

  return (
    <section className="mx-auto max-w-4xl px-5 py-10 text-grafite">
      <h1 className="text-3xl font-bold text-verde-escuro md:text-4xl">Jogar</h1>
      <p className="mt-1 mb-6 text-lg text-grafite/75">
        Aperte o botão para carregar o jogo. Cada vitória acelera as próximas rodadas.
      </p>

      {/* janela do jogo; touch-none só durante a partida, para a página rolar no resto do tempo */}
      <div
        ref={janelaRef}
        className={`relative aspect-video w-full overflow-hidden rounded-3xl border-4 border-grafite bg-verde-claro shadow-moldura ${
          fase === "jogando" ? "touch-none" : ""
        }`}
        role="region"
        aria-label="Área do jogo"
      >
        {fase === "jogando" ? (
          <Suspense
            fallback={
              <p className="absolute inset-0 flex items-center justify-center text-xl font-semibold text-verde-escuro">
                Carregando o jogo...
              </p>
            }
          >
            <Game aoTerminar={terminar} />
          </Suspense>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
            {/* placeholder da capa, trocar pela arte dos designers */}
            <div aria-hidden="true" className="absolute inset-x-0 -bottom-8 h-1/3 rounded-t-full bg-verde" />

            <div className="relative flex flex-col items-center gap-2 md:gap-4">
              {fase === "capa" ? (
                <>
                  <p className="text-3xl font-bold text-verde-escuro md:text-6xl">Microjogos</p>
                  <BotaoPlay rotulo="Jogar" aoClicar={iniciar} />
                  <p className="hidden text-xl text-grafite/80 md:block">3 vidas. Só mouse ou toque.</p>
                </>
              ) : (
                <>
                  <p className="text-xl font-bold text-verde-escuro md:text-4xl">Fim de jogo</p>
                  <p className="text-5xl font-bold md:text-8xl">{pontos}</p>
                  <p className="text-base md:text-2xl">{pontos === 1 ? "rodada vencida" : "rodadas vencidas"}</p>
                  <BotaoPlay rotulo="Jogar de novo" aoClicar={iniciar} />
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="w-full max-w-sm">
          <label className="block text-lg font-semibold" htmlFor="nome">
            Seu nome
          </label>
          <input
            ref={nomeRef}
            id="nome"
            className={`mt-1 w-full rounded-xl border-2 border-grafite bg-white px-4 py-3 text-xl disabled:opacity-60 aria-invalid:border-vermelho ${foco}`}
            type="text"
            maxLength={20}
            autoComplete="nickname"
            value={nome}
            disabled={fase === "jogando"}
            onChange={(e) => setNome(e.target.value)}
            aria-invalid={erroNome ? "true" : undefined}
            aria-describedby="nome-ajuda"
          />
          <p
            id="nome-ajuda"
            className={`mt-1 text-base ${erroNome ? "text-vermelho" : "text-grafite/75"}`}
            aria-live="polite"
          >
            {erroNome || "Aparece no ranking. Até 20 caracteres."}
          </p>
        </div>

        <div className="flex gap-3">
          {fase === "jogando" && (
            <button className={botaoContorno} type="button" onClick={() => setFase("capa")}>
              Parar partida
            </button>
          )}
          {podeTelaCheia && (
            <button className={botaoContorno} type="button" onClick={telaCheia}>
              Tela cheia
            </button>
          )}
        </div>
      </div>

      {fase === "fim" && (
        <div className="mt-6 rounded-2xl border-2 border-grafite bg-white p-4">
          <p className={`text-lg ${envio === "erro" ? "text-vermelho" : "text-grafite/80"}`} aria-live="polite">
            {MENSAGEM_ENVIO[envio]}
          </p>
          <div className="mt-3 flex flex-wrap gap-3">
            {envio === "erro" && (
              <button className={botaoContorno} type="button" onClick={() => enviar(nome, pontos)}>
                Tentar de novo
              </button>
            )}
            <Link className={botaoContorno} to="/ranking">
              Ver ranking
            </Link>
          </div>
        </div>
      )}

      <p className="mt-8 text-base text-grafite/75">
        Ficou com dúvida? Veja as regras em{" "}
        <Link className="font-semibold text-verde-escuro underline" to="/como-jogar">
          Como jogar
        </Link>
        .
      </p>
    </section>
  );
}