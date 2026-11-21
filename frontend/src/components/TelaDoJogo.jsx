import { useRef } from "react";
import { Link } from "react-router";
import Menuprint from "../assets/mosquito_logo.png";

export default function TelaDoJogo() {
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
      className="block w-full min-w-0 rounded-xl perspective-[1000px] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
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
            fetchPriority="high"
            decoding="async"
            className="block h-9/10 w-9/10 mx-auto my-auto pt-5 object-contain [image-rendering:pixelated]"
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
            className="animate-piscar absolute inset-x-0 bottom-3 text-center text-xs font-bold uppercase tracking-widest text-white drop-shadow-md motion-reduce:animate-none md:bottom-4"
          >
            Pressione para jogar
          </p>
        </div>
      </div>
    </Link>
  );
}
