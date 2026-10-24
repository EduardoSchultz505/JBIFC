import { useEffect, useRef } from "react";
import { criarJogo } from "../game/loadGame";

export default function Jogar() {
  const containerRef = useRef(null);

  useEffect(() => {
    const jogo = criarJogo(containerRef.current);
    return () => jogo.destroy(true); // remove o canvas (T21)
  }, []);

  return (
    <main className="min-h-screen bg-[#101522] text-white flex flex-col items-center px-4 py-[30px]">
      <h1>JBIFC</h1>
      <p>Teste</p>
      <div
        ref={containerRef}
        className="aspect-video w-full max-w-[800px] overflow-hidden rounded-lg border-2 border-[#67F5A5]"
      />
    </main>
  );
}