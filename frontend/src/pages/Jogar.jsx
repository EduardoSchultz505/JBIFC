
import { useEffect, useRef } from "react";

export default function Jogar() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    let x = 50;
    let y = 50;
    const tamanho = 30;
    const velocidade = 5;

    const teclas = {};

    function pressionarTecla(e) {
      teclas[e.key] = true;

      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
      }
    }

    function soltarTecla(e) {
      teclas[e.key] = false;
    }

    function atualizar() {
      if (teclas.ArrowUp) y -= velocidade;
      if (teclas.ArrowDown) y += velocidade;
      if (teclas.ArrowLeft) x -= velocidade;
      if (teclas.ArrowRight) x += velocidade;

      x = Math.max(0, Math.min(canvas.width - tamanho, x));
      y = Math.max(0, Math.min(canvas.height - tamanho, y));
    }

    function desenhar() {
      ctx.fillStyle = "#101522";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Jogador
      ctx.fillStyle = "#67F5A5";
      ctx.fillRect(x, y, tamanho, tamanho);
    }

    let animacao;

    function loop() {
      atualizar();
      desenhar();
      animacao = requestAnimationFrame(loop);
    }

    window.addEventListener("keydown", pressionarTecla);
    window.addEventListener("keyup", soltarTecla);

    loop();

    return () => {
      window.removeEventListener("keydown", pressionarTecla);
      window.removeEventListener("keyup", soltarTecla);
      cancelAnimationFrame(animacao);
    };
  }, []);

  return (
    <main style={estilos.pagina}>
      <h1>JBIFC</h1>
      <p>Teste</p>

      <canvas
        ref={canvasRef}
        width={800}
        height={450}
        style={estilos.canvas}
      />
    </main>
  );
}

const estilos = {
  pagina: {
    minHeight: "100vh",
    background: "#101522",
    color: "#ffffff",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "30px 16px",
    fontFamily: "Arial, sans-serif",
  },
  canvas: {
    width: "100%",
    maxWidth: "800px",
    height: "auto",
    border: "2px solid #67F5A5",
    borderRadius: "8px",
    imageRendering: "pixelated",
  },
};
