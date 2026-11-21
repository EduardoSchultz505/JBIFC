const CHAVES_CENARIO = [
  "menu-ceu",
  "menu-efeito",
  "menu-nuvem",
  "menu-arvore",
  "menu-grama",
];

export function criarFundoMenu(cena, escuro = 0.65) {
  const { width, height } = cena.scale;

  CHAVES_CENARIO.forEach((chave, indice) => {
    cena.add
      .image(0, 0, chave)
      .setOrigin(0, 0)
      .setDisplaySize(width, height)
      .setDepth(-20 + indice);
  });

  cena.add
    .rectangle(0, 0, width, height, 0x000000, escuro)
    .setOrigin(0, 0)
    .setDepth(-10);
}