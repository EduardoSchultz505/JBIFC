import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import axios from 'axios'
import { ArrowRight, RotateCw } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL

export default function Ranking() {
  const [state, setState] = useState('carregando') 
  const [ranking, setRanking] = useState([])
  const [tentativa, setTentativa] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    axios
      .get(`${API_URL}/ranking`, {
        params: { limite: 10 },
        signal: controller.signal,
        timeout: 70000, 
      })
      .then(({ data }) => {
        setRanking(data)
        setState(data.length === 0 ? 'vazio' : 'pronto')
      })
      .catch((err) => {
        if (axios.isCancel(err)) return
        console.error(err)
        setState('erro')
      })

    return () => controller.abort()
  }, [tentativa])

  function tentarDeNovo() {
    setState('carregando')
    setTentativa((n) => n + 1)
  }

  return (
    <main className="flex-1 pt-12 pb-18 md:pt-16 md:pb-22">
      <div className="mx-auto w-[calc(100%-32px)] max-w-240 md:w-[calc(100%-48px)]">
        <div className="mb-9.5 md:mb-12">
          <p className="text-xs leading-snug font-bold tracking-[.11em] text-brand">CLASSIFICAÇÃO GERAL</p>
          <h1 className="mt-2.25 text-[30px] leading-[1.15] font-bold tracking-tight md:text-[32px]">Ranking</h1>
          <p className="mt-3.5 max-w-[62ch] text-base leading-[1.55] text-muted md:text-[17px]">
            Veja a pontuação de todos os usuários
          </p>
        </div>

        {state === 'pronto' && (
          <div
            className="overflow-hidden rounded-xl border border-line bg-surface"
            role="table"
            aria-label="Classificação dos jogadores"
          >
            <div
              className="grid min-h-12 grid-cols-[55px_1fr_66px] items-center border-b border-line bg-subtle px-3.5 text-xs font-semibold tracking-[.04em] text-muted md:grid-cols-[90px_1fr_110px] md:px-6"
              role="row"
            >
              <span role="columnheader">Pos.</span>
              <span role="columnheader">Nome</span>
              <span className="text-right" role="columnheader">Pontos</span>
            </div>

            {ranking.map((jogador) => {
              const vencedor = jogador.posicao === 1
              return (
                <div
                  className={`grid min-h-14.5 grid-cols-[55px_1fr_66px] items-center border-b border-line px-3.5 text-[15px] last:border-b-0 md:min-h-15.5 md:grid-cols-[90px_1fr_110px] md:px-6 ${
                    vencedor ? 'bg-sun-soft' : ''
                  }`}
                  key={jogador.usuario}
                  role="row"
                >
                  <span className={`tabular-nums ${vencedor ? 'font-bold text-sun-ink' : 'text-muted'}`} role="cell">
                    {String(jogador.posicao).padStart(2, '0')}
                  </span>
                  <strong role="cell">{jogador.usuario}</strong>
                  <span className="text-right font-bold tabular-nums" role="cell">
                    {Number(jogador.pontuacao).toLocaleString('pt-BR')}
                  </span>
                </div>
              )
            })}
          </div>
        )}

        {state === 'carregando' && (
          <div className="flex min-h-82.5 flex-col items-center justify-center rounded-xl border border-line bg-surface px-5 py-7.5 text-center md:min-h-90 md:p-10">
            <span
              aria-hidden="true"
              className="size-9.5 animate-spin rounded-full border-2 border-brand-soft border-t-brand"
            />
            <h2 className="mt-5 text-xl font-semibold">Carregando o ranking...</h2>
            <p className="mt-2.5 max-w-[50ch] text-sm leading-normal text-muted">
              Na primeira vez do dia, o servidor pode levar até um minuto para acordar.
            </p>
          </div>
        )}

        {state === 'erro' && (
          <div className="flex min-h-82.5 flex-col items-center justify-center rounded-xl border border-line bg-surface px-5 py-7.5 text-center md:min-h-90 md:p-10">
            <h2 className="text-xl font-semibold">Não foi possível carregar o ranking.</h2>
            <p className="mt-2.5 max-w-[50ch] text-sm leading-normal text-muted">
              Verifique sua conexão e tente novamente.
            </p>
            <button
              className="mt-6 inline-flex min-h-12 items-center justify-center gap-2.5 rounded-lg border border-line bg-surface px-5.5 text-[15px] font-semibold text-ink transition duration-150 hover:-translate-y-px hover:border-line-strong hover:bg-subtle"
              onClick={tentarDeNovo}
              type="button"
            >
              <RotateCw aria-hidden="true" size={18} />
              Tentar de novo
            </button>
          </div>
        )}

        {state === 'vazio' && (
          <div className="flex min-h-82.5 flex-col items-center justify-center rounded-xl border border-line bg-surface px-5 py-7.5 text-center md:min-h-90 md:p-10">
            <h2 className="text-xl font-semibold">Ninguém jogou ainda.</h2>
            <p className="mt-2.5 max-w-[50ch] text-sm leading-normal text-muted">Seja o primeiro!</p>
          </div>
        )}

        <div className="mt-8 flex justify-center">
          <Link
            className="inline-flex min-h-12 items-center justify-center gap-2.5 rounded-lg border border-transparent bg-brand px-5.5 text-[15px] font-semibold text-white transition duration-150 hover:-translate-y-px hover:bg-brand-hover"
            to="/jogar"
          >
            Jogar agora
            <ArrowRight aria-hidden="true" size={18} strokeWidth={1.8} />
          </Link>
        </div>
      </div>
    </main>
  )
}