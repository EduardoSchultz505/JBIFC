const COPIAS = [0, 1, 2, 3];

const jogos = [
  { nome: "Vigília dos Porcos", imagem: "" },
  { nome: "Não Seja Pego", imagem: "" },
  { nome: "Lâmpada no Teto", imagem: "" },
  { nome: "Raciocínio", imagem: "" },
  { nome: "Pegar Dois Lanches", imagem: "" },
  { nome: "Use o Totem", imagem: "" },
];

export default function Carrossel() {
  return (
    <div className="overflow-hidden motion-reduce:overflow-x-auto">
      <h2 className="sr-only">Minijogos</h2>

      <ul className="flex w-max animate-carrossel motion-reduce:animate-none">
        {COPIAS.map((copia) =>
          jogos.map((item) => (
            <li
              key={`${copia}-${item.nome}`}
              aria-hidden={copia > 0}
              className={`mr-4 w-40 shrink-0 md:w-48 ${copia > 0 ? "motion-reduce:hidden" : ""}`}
            >
              <div className="aspect-square overflow-hidden rounded-lg border border-line bg-surface">
                {item.imagem && (
                  <img
                    src={item.imagem}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="size-full object-cover [image-rendering:pixelated]"
                  />
                )}
              </div>
              <h3 className="mt-3 text-sm font-semibold">{item.nome}</h3>
            </li>
          )),
        )}
      </ul>
    </div>
  );
}