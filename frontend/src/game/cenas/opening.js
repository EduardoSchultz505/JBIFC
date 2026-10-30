
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

    this.textures.get("logo").setFilter(Phaser.Textures.FilterMode.NEAREST);

    ifc.setScale(
      Math.min((width * 0.3) / ifc.width, (height * 0.4) / ifc.height)
    );
    logo.setScale(8);

    [ifc, logo].forEach((imagem) => {
      imagem.setScale(
        Math.min(
          (width * 0.3) / imagem.width,
          (height * 0.4) / imagem.height
        )
      );

      imagem.setAlpha(0);
    });

    this.tweens.add({
      targets: [ifc, logo],
      alpha: 1,
      duration: FADE_MS,
      ease: "Sine.easeInOut",
      onComplete: () => {
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
