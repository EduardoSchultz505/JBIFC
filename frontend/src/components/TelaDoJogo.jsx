import { useRef } from "react";
import { Link } from "react-router";
import Menuprint from "../assets/Menuprint.png";

function TelaDoJogo() {
  const ref = useRef(null);

  function inclinar(e) {
    if (e.pointerType !== "mouse") return;
    const r = ref.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    ref.current.style.setProperty("--ry", `${x * 10}deg`);
    ref.current.style.setProperty("--rx", `${-y * 10}deg`);
  }

  function soltar() {
    ref.current.style.setProperty("--rx", "0deg");
    ref.current.style.setProperty("--ry", "0deg");
  }

  return (
    <Link
      to="/jogar"
      aria-label="Jogar JBIFC: Mosquito's Average Day"
      className="block w-full min-w-0 perspective-[1000px]"
      onPointerMove={inclinar}
      onPointerLeave={soltar}
    >
      <div
        ref={ref}
        className="transition-transform duration-150 ease-out transform-[rotateX(var(--rx,0deg))_rotateY(var(--ry,0deg))] motion-reduce:transform-none"
      >
        <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-game-line bg-game text-white shadow-game">
          <img
            src={Menuprint}
            alt="Menu inicial do jogo"
            className="block size-full object-cover [image-rendering:pixelated]"
          />
          <div
            aria-hidden="true"
            className="scanlines pointer-events-none absolute inset-0 opacity-30"
          />
          <div
            aria-hidden="true"
            className="animate-varredura pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 bg-linear-to-r from-transparent via-white/10 to-transparent motion-reduce:hidden"
          />
          <p
            aria-hidden="true"
            className="animate-piscar absolute inset-x-0 bottom-4 text-center text-xs font-bold tracking-[.2em] text-white motion-reduce:animate-none"
          >
            PRESSIONE PARA JOGAR
          </p>
        </div>
      </div>
    </Link>
  );
}

export default TelaDoJogo;
