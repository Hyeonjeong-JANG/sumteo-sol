import Phaser from "phaser";

export class ForestScene extends Phaser.Scene {
  private trees: Phaser.GameObjects.Graphics[] = [];
  private particles: Phaser.GameObjects.Graphics[] = [];
  private cabin!: Phaser.GameObjects.Graphics;
  private characters: Phaser.GameObjects.Container[] = [];

  constructor() {
    super({ key: "ForestScene" });
  }

  create() {
    const { width, height } = this.scale;

    // Dark forest background gradient
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0a1628, 0x0a1628, 0x1a3a2a, 0x1a3a2a);
    bg.fillRect(0, 0, width, height);

    // Ground
    const ground = this.add.graphics();
    ground.fillStyle(0x1a2f1a);
    ground.fillRect(0, height - 100, width, 100);

    // Draw trees
    this.drawForest(width, height);

    // Draw cabin
    this.drawCabin(width / 2, height - 150);

    // Draw reading space (benches + characters)
    this.drawReadingSpace(width / 2, height - 150);

    // Floating particles (fireflies)
    this.createFireflies(width, height);

    // Moon
    this.drawMoon(width - 80, 80);
  }

  private drawForest(width: number, height: number) {
    // Background trees (darker, smaller)
    for (let i = 0; i < 8; i++) {
      const x = (width / 8) * i + Math.random() * 50;
      this.drawTree(x, height - 120, 0.5, 0x0d2818);
    }

    // Foreground trees (lighter, bigger)
    for (let i = 0; i < 5; i++) {
      const x = (width / 5) * i + Math.random() * 80;
      this.drawTree(x, height - 100, 0.8, 0x1a4028);
    }
  }

  private drawTree(x: number, y: number, scale: number, color: number) {
    const tree = this.add.graphics();

    // Trunk
    tree.fillStyle(0x3d2817);
    tree.fillRect(x - 8 * scale, y, 16 * scale, 60 * scale);

    // Foliage layers
    tree.fillStyle(color);
    tree.fillTriangle(
      x, y - 100 * scale,
      x - 50 * scale, y,
      x + 50 * scale, y
    );
    tree.fillTriangle(
      x, y - 140 * scale,
      x - 40 * scale, y - 50 * scale,
      x + 40 * scale, y - 50 * scale
    );
    tree.fillTriangle(
      x, y - 170 * scale,
      x - 30 * scale, y - 90 * scale,
      x + 30 * scale, y - 90 * scale
    );

    this.trees.push(tree);
  }

  private drawCabin(x: number, y: number) {
    this.cabin = this.add.graphics();

    // Cabin body
    this.cabin.fillStyle(0x5c3a21);
    this.cabin.fillRect(x - 60, y - 60, 120, 80);

    // Roof
    this.cabin.fillStyle(0x8b4513);
    this.cabin.fillTriangle(x, y - 100, x - 80, y - 50, x + 80, y - 50);

    // Door
    this.cabin.fillStyle(0x3d2817);
    this.cabin.fillRect(x - 15, y - 30, 30, 50);

    // Window with light
    this.cabin.fillStyle(0xffd700);
    this.cabin.fillRect(x + 25, y - 45, 25, 25);
    this.cabin.fillRect(x - 50, y - 45, 25, 25);

    // Window glow
    const glow = this.add.graphics();
    glow.fillStyle(0xffd700, 0.2);
    glow.fillCircle(x + 37, y - 32, 30);
    glow.fillCircle(x - 37, y - 32, 30);
  }

  private createFireflies(width: number, height: number) {
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * width;
      const y = Math.random() * (height - 150) + 50;
      const firefly = this.add.graphics();
      firefly.fillStyle(0xffff88, 0.8);
      firefly.fillCircle(0, 0, 2);
      firefly.setPosition(x, y);
      this.particles.push(firefly);

      // Animate fireflies
      this.tweens.add({
        targets: firefly,
        x: x + Math.random() * 100 - 50,
        y: y + Math.random() * 60 - 30,
        alpha: { from: 0.3, to: 1 },
        duration: 2000 + Math.random() * 2000,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    }
  }

  private drawReadingSpace(cabinX: number, cabinY: number) {
    // Bench positions: left, center, right relative to cabin
    const benchPositions = [
      { x: cabinX - 130, y: cabinY + 10 },
      { x: cabinX, y: cabinY + 30 },
      { x: cabinX + 130, y: cabinY + 10 },
    ];

    // Draw benches
    benchPositions.forEach((pos) => {
      this.drawBench(pos.x, pos.y);
    });

    // Character data
    const characters = [
      { name: "친구1", x: benchPositions[0].x, y: benchPositions[0].y, color: 0xd4a574, highlight: 0x8b6914 },
      { name: "나", x: benchPositions[1].x, y: benchPositions[1].y, color: 0xd4a574, highlight: 0x10b981 },
      { name: "친구2", x: benchPositions[2].x, y: benchPositions[2].y, color: 0xd4a574, highlight: 0xc4841d },
    ];

    characters.forEach((char, i) => {
      const container = this.drawCharacter(char.x, char.y, char.name, char.highlight, i === 1);
      this.characters.push(container);

      // Breathing animation — slight vertical bob
      this.tweens.add({
        targets: container,
        y: container.y - 2,
        duration: 1800 + i * 400,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    });
  }

  private drawBench(x: number, y: number) {
    const bench = this.add.graphics();

    // Bench seat
    bench.fillStyle(0x5c3a21);
    bench.fillRect(x - 35, y - 5, 70, 8);

    // Bench legs
    bench.fillStyle(0x3d2817);
    bench.fillRect(x - 30, y + 3, 6, 15);
    bench.fillRect(x + 24, y + 3, 6, 15);
  }

  private drawCharacter(
    x: number,
    y: number,
    name: string,
    highlightColor: number,
    isMe: boolean
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y - 30);

    const gfx = this.add.graphics();

    // Body (rectangle)
    gfx.fillStyle(highlightColor);
    gfx.fillRect(-10, -8, 20, 22);

    // Head (circle)
    gfx.fillStyle(0xd4a574);
    gfx.fillCircle(0, -18, 10);

    // Book (small rectangle in front)
    gfx.fillStyle(0xf5f5dc);
    gfx.fillRect(-8, 2, 16, 10);
    // Book spine
    gfx.fillStyle(highlightColor, 0.7);
    gfx.fillRect(-1, 2, 2, 10);

    container.add(gfx);

    // Name label above head
    const label = this.add.text(0, -36, name, {
      fontSize: "11px",
      color: "#ffffff",
      fontFamily: "sans-serif",
    });
    label.setOrigin(0.5, 1);
    container.add(label);

    // Sapling next to "나" character (reading progress visualization)
    if (isMe) {
      const sapling = this.add.graphics();
      // Stem
      sapling.fillStyle(0x10b981);
      sapling.fillRect(22, -8, 3, 16);
      // Leaves
      sapling.fillStyle(0x34d399);
      sapling.fillTriangle(23, -18, 16, -6, 30, -6);
      container.add(sapling);
    }

    return container;
  }

  private drawMoon(x: number, y: number) {
    const moon = this.add.graphics();

    // Moon glow
    moon.fillStyle(0xffffff, 0.1);
    moon.fillCircle(x, y, 60);
    moon.fillStyle(0xffffff, 0.15);
    moon.fillCircle(x, y, 45);

    // Moon
    moon.fillStyle(0xf5f5dc);
    moon.fillCircle(x, y, 30);

    // Moon craters
    moon.fillStyle(0xe8e8c8, 0.5);
    moon.fillCircle(x - 10, y - 5, 8);
    moon.fillCircle(x + 8, y + 10, 5);
  }
}
