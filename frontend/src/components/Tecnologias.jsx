import { useId, useRef, useState } from "react";

const tecnologias = [
  {
    nome: "React",
    texto:
      "Biblioteca de JavaScript para montar interfaces. O site é dividido em componentes reutilizáveis, como a tela do jogo e o ranking, que se atualizam sozinhos quando os dados mudam. É ele que cuida das páginas e da navegação entre elas.",
  },
  {
    nome: "Tailwind CSS",
    texto:
      "Framework de CSS que estiliza o site por classes escritas direto no código, como cores, espaçamentos e tamanhos de texto. Com ele o visual fica consistente entre as páginas e se adapta a telas de celular e de computador.",
  },
  {
    nome: "Phaser",
    texto:
      "Motor de jogos 2D para JavaScript. Ele desenha os gráficos, controla o tempo e recebe os cliques e toques de cada minijogo dentro do navegador, sem precisar instalar nada. É a peça que roda o jogo na página Jogar.",
  },
  {
    nome: "Express",
    texto:
      "Framework de Node.js para criar o servidor. Ele recebe os pedidos que o site faz, aplica as regras do lado do servidor e responde com os dados, ficando entre o site e o banco de dados.",
  },
  {
    nome: "PostgreSQL",
    texto:
      "Banco de dados relacional de código aberto. Guarda as informações em tabelas ligadas entre si e permite consultá-las com SQL, o que mantém os dados organizados e seguros.",
  },
];

export default function Tecnologias() {
  const [ativa, setAtiva] = useState(0);
  const id = useId();
  const abas = useRef([]);

  function aoTeclar(e) {
    const total = tecnologias.length;
    let prox;
    if (e.key === "ArrowRight") prox = (ativa + 1) % total;
    else if (e.key === "ArrowLeft") prox = (ativa - 1 + total) % total;
    else if (e.key === "Home") prox = 0;
    else if (e.key === "End") prox = total - 1;
    else return;

    e.preventDefault();
    setAtiva(prox);
    abas.current[prox]?.focus();
  }

  return (
    <div>
      <div
        role="tablist"
        aria-label="Tecnologias utilizadas"
        onKeyDown={aoTeclar}
        className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap"
      >
        {tecnologias.map((tec, i) => {
          const selecionada = i === ativa;
          return (
            <button
              key={tec.nome}
              ref={(el) => (abas.current[i] = el)}
              id={`${id}-aba-${i}`}
              type="button"
              role="tab"
              aria-selected={selecionada}
              aria-controls={`${id}-painel-${i}`}
              tabIndex={selecionada ? 0 : -1}
              onClick={() => setAtiva(i)}
              className={`min-h-11 cursor-pointer rounded-lg border px-4 text-sm font-semibold transition duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
                selecionada
                  ? "border-brand bg-brand text-white"
                  : "border-line bg-brand-soft text-brand hover:border-brand"
              }`}
            >
              {tec.nome}
            </button>
          );
        })}
      </div>

      <div className="mt-5 grid">
        {tecnologias.map((tec, i) => (
          <p
            key={tec.nome}
            id={`${id}-painel-${i}`}
            role="tabpanel"
            aria-labelledby={`${id}-aba-${i}`}
            className={`col-start-1 row-start-1 max-w-prose text-base leading-relaxed text-muted ${
              i === ativa ? "" : "invisible"
            }`}
          >
            {tec.texto}
          </p>
        ))}
      </div>
    </div>
  );
}