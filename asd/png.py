
from PIL import Image
from pathlib import Path

# Localização dos arquivos
pasta = Path(__file__).resolve().parent
arquivo_entrada = pasta / "imagem.png"
arquivo_saida = pasta / "resultado.svg"

# Abre a imagem preservando transparência
img = Image.open(arquivo_entrada).convert("RGBA")
width, height = img.size

print(f"Imagem carregada: {width}x{height}")
print("Convertendo para SVG...")

with open(arquivo_saida, "w", encoding="utf-8") as f:

    # Cabeçalho SVG
    f.write(
        f'<svg xmlns="http://www.w3.org/2000/svg" '
        f'width="{width}" height="{height}" '
        f'viewBox="0 0 {width} {height}" '
        f'shape-rendering="crispEdges">\n'
    )

    # Processa uma linha por vez
    for y in range(height):

        x = 0

        while x < width:

            color = img.getpixel((x, y))

            # Ignora pixels totalmente transparentes
            if color[3] == 0:
                x += 1
                continue

            # Procura pixels consecutivos da mesma cor
            start_x = x

            while x < width and img.getpixel((x, y)) == color:
                x += 1

            pixel_width = x - start_x

            r, g, b, a = color

            hex_color = f"#{r:02X}{g:02X}{b:02X}"

            opacity = a / 255

            # Cria retângulo SVG
            f.write(
                f'<rect x="{start_x}" y="{y}" '
                f'width="{pixel_width}" height="1" '
                f'fill="{hex_color}" '
                f'fill-opacity="{opacity:.6f}"/>\n'
            )

    # Fecha SVG
    f.write("</svg>")

print("--------------------------------")
print("CONVERSÃO CONCLUÍDA!")
print(f"Arquivo salvo em: {arquivo_saida}")
print("--------------------------------")
