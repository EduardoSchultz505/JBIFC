
import Phaser from "phaser";

const FADE_MS = 900;
const PAUSA_MS = 1200;

export default class Opening extends Phaser.Scene {
  constructor() {
    super("Opening");
  }

  create() {
    this.cameras.main.setBackgroundColor("#000000");

    const { width, height } = this.scale;

    const ifc = this.add.image(width * 0.35, height / 2, "IFC");
    const logo = this.add.image(width * 0.65, height / 2, "logo");

    // Ajusta o tamanho das duas imagens
    [ifc, logo].forEach((imagem) => {
      imagem.setScale(
        Math.min(
          (width * 0.3) / imagem.width,
          (height * 0.4) / imagem.height
        )
      );

      // Começam invisíveis
      imagem.setAlpha(0);
    });

    // Fade-in das duas logos
    this.tweens.add({
      targets: [ifc, logo],
      alpha: 1,
      duration: FADE_MS,
      ease: "Sine.easeInOut",
      onComplete: () => {
        // Mantém as logos visíveis antes de desaparecerem
        this.time.delayedCall(PAUSA_MS, () => {
          this.tweens.add({
            targets: [ifc, logo],
            alpha: 0,
            duration: FADE_MS,
            ease: "Sine.easeInOut",
            onComplete: () => {
              this.scene.start("Menu");
            },
          });
        });
      },
    });
  }
}
