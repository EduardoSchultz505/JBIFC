from PIL import Image
from pathlib import Path

pasta = Path(__file__).resolve().parent
extensoes = {".png", ".jpg", ".jpeg", ".bmp", ".gif", ".webp"}


def converter(arquivo_entrada: Path, arquivo_saida: Path) -> None:
    # Preserva a transparência
    img = Image.open(arquivo_entrada).convert("RGBA")
    width, height = img.size
    px = img.load()  # acesso direto aos pixels, bem mais rápido que getpixel

    with open(arquivo_saida, "w", encoding="utf-8") as f:
        f.write(
            f'<svg xmlns="http://www.w3.org/2000/svg" '
            f'width="{width}" height="{height}" '
            f'viewBox="0 0 {width} {height}" '
            f'shape-rendering="crispEdges">\n'
        )

        for y in range(height):
            x = 0
            while x < width:
                color = px[x, y]

                # Ignora pixels totalmente transparentes
                if color[3] == 0:
                    x += 1
                    continue

                # Agrupa pixels consecutivos da mesma cor
                start_x = x
                while x < width and px[x, y] == color:
                    x += 1

                r, g, b, a = color
                opacidade = "" if a == 255 else f' fill-opacity="{a / 255:.6f}"'

                f.write(
                    f'<rect x="{start_x}" y="{y}" '
                    f'width="{x - start_x}" height="1" '
                    f'fill="#{r:02X}{g:02X}{b:02X}"{opacidade}/>\n'
                )

        f.write("</svg>")


imagens = sorted(
    p for p in pasta.iterdir() if p.is_file() and p.suffix.lower() in extensoes
)

if not imagens:
    print("Nenhuma imagem encontrada na pasta.")

for caminho in imagens:
    saida = caminho.with_suffix(".svg")
    print(f"Convertendo {caminho.name} -> {saida.name}")
    try:
        converter(caminho, saida)
    except Exception as erro:
        # Um arquivo com problema não derruba os outros
        print(f"  Falhou: {erro}")

print("Conversão concluída.")