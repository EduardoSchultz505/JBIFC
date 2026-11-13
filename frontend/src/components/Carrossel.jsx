import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Lock, Sparkles } from "lucide-react";
import { ACHIEVEMENT_DEFS, formatAchievementDate, readAchievementList } from "../config/achievements";

const COPIAS = [0, 1, 2, 3];

export default function Carrossel({ conquistas: conquistasProp = [] }) {
  const containerRef = useRef(null);
  const [indiceAtual, setIndiceAtual] = useState(0);
  const [conquistas, setConquistas] = useState(Array.isArray(conquistasProp) ? conquistasProp : []);

  useEffect(() => {
    if (Array.isArray(conquistasProp) && conquistasProp.length > 0) {
      setConquistas(conquistasProp);
      return;
    }

    const token = typeof window !== "undefined" ? window.localStorage.getItem("jbifc_token") : null;
    setConquistas(readAchievementList({ demoMode: !token }));
  }, [conquistasProp]);

  const itens = ACHIEVEMENT_DEFS.map((definicao) => {
    const desbloqueada = (conquistas || []).some((item) => item.id === definicao.id);
    const progressoAtual = desbloqueada ? definicao.target : 0;

    return {
      ...definicao,
      desbloqueada,
      progressoAtual,
      progressoTexto: `${progressoAtual}/${definicao.target}`,
      unlockedAt: (conquistas || []).find((item) => item.id === definicao.id)?.unlockedAt || null,
    };
  });

  const concluidas = itens.filter((item) => item.desbloqueada).length;

  const mover = (direcao) => {
    if (!containerRef.current || itens.length === 0) return;

    const proximoIndice = (indiceAtual + direcao + itens.length) % itens.length;
    const item = containerRef.current.querySelectorAll("[data-mission-card]")[proximoIndice];

    if (item) {
      item.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }

    setIndiceAtual(proximoIndice);
  };

  return (
    <div className="mx-auto w-full max-w-275 px-3 md:px-0">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs leading-snug font-bold tracking-[.11em] text-brand">
            MISSÕES
          </p>
          <h2 className="mt-1.5 text-2xl font-semibold tracking-tight text-ink">
            Progresso do jogador
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => mover(-1)}
            aria-label="Missão anterior"
            className="flex size-10 items-center justify-center rounded-full border border-brand-line bg-white text-brand transition hover:-translate-y-px hover:bg-brand-soft"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={() => mover(1)}
            aria-label="Próxima missão"
            className="flex size-10 items-center justify-center rounded-full border border-brand-line bg-white text-brand transition hover:-translate-y-px hover:bg-brand-soft"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="mb-5 flex items-center justify-between gap-3 rounded-full border border-brand-line bg-white/70 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted">
        <span>Concluídas</span>
        <span className="text-brand">{concluidas}/{itens.length}</span>
      </div>

      <div className="overflow-hidden motion-reduce:overflow-x-auto">
        <div
          ref={containerRef}
          style={{
            display: "flex",
            width: "max-content",
            animation: "carrossel 40s linear infinite",
          }}
        >
          {COPIAS.map((copia) =>
            itens.map((item, index) => (
              <article
                key={`${copia}-${item.id}`}
                data-mission-card
                aria-hidden={copia > 0}
                className={`mr-4 w-40 shrink-0 rounded-lg border border-brand-line bg-subtle p-3 shadow-game transition md:w-48 ${
                  item.desbloqueada ? "border-[#ffc93c]/80 bg-[#fff8e6] text-ink" : "text-muted"
                } ${copia > 0 ? "motion-reduce:hidden" : ""} ${index === indiceAtual ? "scale-[1.01]" : ""}`}
              >
                <div className="mb-3 flex items-center justify-between gap-2">
                  <div
                    className={`flex size-10 items-center justify-center rounded-xl text-xl ${
                      item.desbloqueada ? "bg-[#1e6b2c]/10" : "bg-[#dfe3de]"
                    }`}
                  >
                    {item.desbloqueada ? item.icon : <Lock size={18} className="text-muted" />}
                  </div>

                  {item.desbloqueada && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#1e6b2c] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-white">
                      <Sparkles size={10} />
                      ok
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-semibold leading-tight">{item.name}</h3>

                <p className="mt-2 text-[11px] leading-relaxed text-current/80">
                  {item.desbloqueada ? item.description : item.hint}
                </p>

                <div className="mt-3">
                  <div className="mb-1.5 flex items-center justify-between text-[9px] font-semibold uppercase tracking-[0.12em] text-current/70">
                    <span>Progresso</span>
                    <span>{item.progressoTexto}</span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-[#e7e9e7]">
                    <div
                      className={`h-full rounded-full ${item.desbloqueada ? "bg-[#1e6b2c]" : "bg-brand"}`}
                      style={{ width: `${item.desbloqueada ? 100 : 0}%` }}
                    />
                  </div>
                </div>

                {item.desbloqueada && item.unlockedAt ? (
                  <p className="mt-3 text-[9px] font-semibold uppercase tracking-[0.12em] text-brand/80">
                    {formatAchievementDate(item.unlockedAt)}
                  </p>
                ) : !item.desbloqueada ? (
                  <p className="mt-3 text-[9px] font-semibold uppercase tracking-[0.12em] text-muted">
                    Bloqueada
                  </p>
                ) : null}
              </article>
            )),
          )}
        </div>
      </div>
    </div>
  );
}


