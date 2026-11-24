const COPIAS = [0, 1, 2, 3];

import JonhaBird from "../assets/jonha_bird_print.jpg";
import SolteOsPorcos from "../assets/solte_os_porcos_print.jpg";
import PegueMaisLanche from "../assets/pegue_mais_lanche_print.jpg";
import UseOTotem from "../assets/use_o_totem_print.jpg";
import VigiliaDosPorcos from "../assets/vigilia_dos_porcos_print.jpg";

const jogos = [
  { nome: "Vigília dos Porcos", imagem: VigiliaDosPorcos },
  { nome: "Jogue sem ser Pego", imagem: JonhaBird },
  { nome: "Solte os Porcos", imagem: SolteOsPorcos },
  { nome: "Pegue Mais Lanche", imagem: PegueMaisLanche },
  { nome: "Use o Totem", imagem: UseOTotem },
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