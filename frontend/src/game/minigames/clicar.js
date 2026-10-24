import Phaser from "phaser";

export default class Clicar {
  instrucao = "CLIQUE";
  duracao = 5; // segundos

  constructor(scene) {
    this.scene = scene;
    this.estado = "jogando";
  }

  iniciar() {
    const { width, height } = this.scene.scale;
    const x = Phaser.Math.Between(80, width - 80);
    const y = Phaser.Math.Between(120, height - 80); // longe do HUD
    this.alvo = this.scene.add
      .circle(x, y, 40, 0xffc93c)
      .setInteractive({ useHandCursor: true });
    this.alvo.once("pointerdown", () => (this.estado = "ganhou"));
  }

  atualizar() {}

  resultado() {
    return this.estado;
  }

  destruir() {
    this.alvo?.destroy();
  }
}