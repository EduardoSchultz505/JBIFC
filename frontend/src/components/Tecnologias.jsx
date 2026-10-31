import { useId, useState } from "react";

const tecnologias = [
  {
    nome: "React",
    texto:
      "Biblioteca de JavaScript para montar interfaces. O site é dividido em componentes reutilizáveis, como o carrossel e a tela do jogo, que aparecem em mais de uma página e se atualizam sozinhos quando os dados mudam. É ele que cuida das páginas de início, jogar, ranking, como jogar e equipe.",
  },
  {
    nome: "Tailwind CSS",
    texto:
      "Framework de CSS que estiliza o site por classes escritas direto no código, como cores, espaçamentos e tamanhos de texto. Com ele o visual fica consistente entre as páginas, se adapta a telas de celular e de computador e também ajuda a controlar animações, como a do carrossel dos minijogos.",
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

  return (
    <div>
      <div className="flex flex-wrap gap-2.5">
        {tecnologias.map((tec, i) => {
          const selecionada = i === ativa;
          return (
            <button
              key={tec.nome}
              type="button"
              aria-pressed={selecionada}
              aria-controls={`${id}-texto`}
              onClick={() => setAtiva(i)}
              className={`min-h-11 cursor-pointer rounded-lg border px-3.5 text-sm font-semibold transition duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
                selecionada
                  ? "border-brand bg-brand text-white"
                  : "border-brand-line bg-brand-soft text-brand hover:border-brand"
              }`}
            >
              {tec.nome}
            </button>
          );
        })}
      </div>

      <p
        id={`${id}-texto`}
        aria-live="polite"
        className="mt-5 min-h-28 max-w-[64ch] md:min-h-24 text-[15px] leading-[1.55] text-muted"
      >
        {tecnologias[ativa].texto}
      </p>
    </div>
  );
}
