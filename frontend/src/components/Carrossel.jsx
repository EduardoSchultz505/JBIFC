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
      <div
        style={{
          display: "flex",
          width: "max-content",
          animation: "carrossel 40s linear infinite",
        }}
      >
        {COPIAS.map((copia) =>
          jogos.map((item) => (
            <article
              key={`${copia}-${item.nome}`}
              aria-hidden={copia > 0}
              className={`mr-4 w-40 shrink-0 md:w-48 ${copia > 0 ? "motion-reduce:hidden" : ""}`}
            >
              <div className="relative aspect-square overflow-hidden rounded-lg border border-brand-line bg-subtle">
                <img
                  src={item.imagem}
                  alt=""
                  className="size-full object-cover"
                />
              </div>
              <h3 className="mt-3 text-sm font-semibold">{item.nome}</h3>
            </article>
          )),
        )}
      </div>
    </div>
  );
}


