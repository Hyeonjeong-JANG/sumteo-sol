import Phaser from "phaser";

// ── Layout Constants ──
const ZONE = {
  SKY: { start: 0, end: 0.2 },
  BG: { start: 0.2, end: 0.5 },
  READING: { start: 0.5, end: 0.85 },
  GROUND: { start: 0.85, end: 1.0 },
};

const CHAR_SCALE = 1.6;
const SEAT_COUNT = 6;
const DESK_WIDTH_RATIO = 0.8;

interface SeatPosition {
  x: number;
  y: number;
  occupied: boolean;
  characterIndex: number | null;
}

interface HourglassData {
  container: Phaser.GameObjects.Container;
  sandGrains: Phaser.GameObjects.Graphics[];
  timeText: Phaser.GameObjects.Text;
  minutes: number;
  active: boolean;
}

const CHARACTER_DATA = [
  { name: "친구1", highlight: 0x8b6914, minutes: 42, active: true, seatIndex: 0 },
  { name: "친구2", highlight: 0xc4841d, minutes: 67, active: false, seatIndex: 2 },
  { name: "나", highlight: 0x10b981, minutes: 15, active: true, seatIndex: 3, isMe: true },
];

export class ForestScene extends Phaser.Scene {
  private sceneObjects: Phaser.GameObjects.GameObject[] = [];
  private characters: Phaser.GameObjects.Container[] = [];
  private hourglasses: HourglassData[] = [];
  private seatPositions: SeatPosition[] = [];

  constructor() {
    super({ key: "ForestScene" });
  }

  create() {
    const { width, height } = this.scale;
    this.drawScene(width, height);

    this.scale.on("resize", (gameSize: Phaser.Structs.Size) => {
      this.clearScene();
      this.drawScene(gameSize.width, gameSize.height);
    });
  }

  private clearScene() {
    this.tweens.killAll();
    this.sceneObjects.forEach((obj) => obj.destroy());
    this.sceneObjects = [];
    this.characters = [];
    this.hourglasses = [];
    this.seatPositions = [];
  }

  private track<T extends Phaser.GameObjects.GameObject>(obj: T): T {
    this.sceneObjects.push(obj);
    return obj;
  }

  // ── Main Draw ──

  private drawScene(w: number, h: number) {
    this.drawBackground(w, h);
    this.drawGround(w, h);
    this.drawTrees(w, h);
    this.drawBackWall(w, h);
    this.drawMoon(w, h);
    this.createFireflies(w, h);
    this.drawDesk(w, h);
    this.drawStools(w, h);
    this.drawCharacters(w, h);
  }

  // ── Background & Sky ──

  private drawBackground(w: number, h: number) {
    const bg = this.track(this.add.graphics());
    bg.fillGradientStyle(0x0a1628, 0x0a1628, 0x1a3a2a, 0x1a3a2a);
    bg.fillRect(0, 0, w, h);
  }

  private drawGround(w: number, h: number) {
    const groundY = h * ZONE.GROUND.start;
    const ground = this.track(this.add.graphics());
    ground.fillStyle(0x1a2f1a);
    ground.fillRect(0, groundY, w, h - groundY);

    // Subtle grass line
    ground.lineStyle(2, 0x2a4f2a, 0.6);
    ground.beginPath();
    ground.moveTo(0, groundY);
    for (let x = 0; x < w; x += 20) {
      ground.lineTo(x + 10, groundY - 2 + Math.sin(x * 0.05) * 3);
    }
    ground.lineTo(w, groundY);
    ground.strokePath();
  }

  private drawMoon(w: number, h: number) {
    const mx = w - 60;
    const my = h * 0.08;
    const moon = this.track(this.add.graphics());

    moon.fillStyle(0xffffff, 0.08);
    moon.fillCircle(mx, my, 50);
    moon.fillStyle(0xffffff, 0.12);
    moon.fillCircle(mx, my, 35);
    moon.fillStyle(0xf5f5dc);
    moon.fillCircle(mx, my, 22);
    moon.fillStyle(0xe8e8c8, 0.5);
    moon.fillCircle(mx - 7, my - 4, 6);
    moon.fillCircle(mx + 6, my + 7, 4);
  }

  // ── Trees (sides only, clear center for desk) ──

  private drawTrees(w: number, h: number) {
    const groundY = h * ZONE.GROUND.start;
    const centerLeft = w * 0.15;
    const centerRight = w * 0.85;

    // Background trees (top of BG zone)
    for (let i = 0; i < 6; i++) {
      const x = (w / 6) * i + 15;
      if (x > centerLeft && x < centerRight) continue;
      this.drawTree(x, groundY - 20, 0.5, 0x0d2818);
    }

    // Foreground trees on edges
    [w * 0.03, w * 0.12, w * 0.88, w * 0.97].forEach((x) => {
      this.drawTree(x, groundY, 0.7, 0x1a4028);
    });
  }

  private drawTree(x: number, y: number, scale: number, color: number) {
    const tree = this.track(this.add.graphics());
    tree.fillStyle(0x3d2817);
    tree.fillRect(x - 8 * scale, y - 60 * scale, 16 * scale, 60 * scale);

    tree.fillStyle(color);
    tree.fillTriangle(x, y - 160 * scale, x - 50 * scale, y - 60 * scale, x + 50 * scale, y - 60 * scale);
    tree.fillTriangle(x, y - 200 * scale, x - 40 * scale, y - 110 * scale, x + 40 * scale, y - 110 * scale);
    tree.fillTriangle(x, y - 230 * scale, x - 30 * scale, y - 150 * scale, x + 30 * scale, y - 150 * scale);
  }

  // ── Back Wall (simplified cabin replacement) ──

  private drawBackWall(w: number, h: number) {
    const wallY = h * ZONE.BG.end - 40;
    const wallW = w * 0.55;
    const wallH = 50;
    const wallX = (w - wallW) / 2;

    const wall = this.track(this.add.graphics());

    // Wooden planks
    wall.fillStyle(0x3d2817, 0.7);
    wall.fillRect(wallX, wallY, wallW, wallH);

    // Plank lines
    wall.lineStyle(1, 0x2a1c0e, 0.4);
    for (let py = wallY + 10; py < wallY + wallH; py += 12) {
      wall.beginPath();
      wall.moveTo(wallX, py);
      wall.lineTo(wallX + wallW, py);
      wall.strokePath();
    }

    // Roof overhang
    wall.fillStyle(0x5c3a21, 0.8);
    wall.fillTriangle(
      w / 2, wallY - 25,
      wallX - 15, wallY + 2,
      wallX + wallW + 15, wallY + 2
    );

    // Small window with warm light
    const winX = w / 2 - 12;
    const winY = wallY + 12;
    wall.fillStyle(0xffd700, 0.8);
    wall.fillRect(winX, winY, 24, 20);
    wall.lineStyle(2, 0x5c3a21, 0.9);
    wall.strokeRect(winX, winY, 24, 20);
    wall.beginPath();
    wall.moveTo(winX + 12, winY);
    wall.lineTo(winX + 12, winY + 20);
    wall.strokePath();

    // Window glow
    const glow = this.track(this.add.graphics());
    glow.fillStyle(0xffd700, 0.12);
    glow.fillCircle(w / 2, winY + 10, 35);
  }

  // ── Shared Desk ──

  private drawDesk(w: number, h: number) {
    const deskW = w * DESK_WIDTH_RATIO;
    const deskX = (w - deskW) / 2;
    const deskY = h * 0.67;
    const deskH = 10;

    const desk = this.track(this.add.graphics());

    // Shadow
    desk.fillStyle(0x000000, 0.15);
    desk.fillRect(deskX + 4, deskY + 3, deskW, deskH);

    // Table top
    desk.fillStyle(0x6b4226);
    desk.fillRect(deskX, deskY, deskW, deskH);

    // Wood grain highlight
    desk.fillStyle(0x7d5233, 0.6);
    desk.fillRect(deskX, deskY, deskW, 3);

    // Desk legs
    desk.fillStyle(0x4a2d14);
    const legW = 6;
    desk.fillRect(deskX + 12, deskY + deskH, legW, 28);
    desk.fillRect(deskX + deskW - 18, deskY + deskH, legW, 28);
  }

  // ── Stools ──

  private drawStools(w: number, h: number) {
    const deskW = w * DESK_WIDTH_RATIO;
    const deskX = (w - deskW) / 2;
    const stoolY = h * 0.67 + 10 + 28 + 2; // below desk legs

    this.seatPositions = [];

    for (let i = 0; i < SEAT_COUNT; i++) {
      const seatX = deskX + (deskW / (SEAT_COUNT + 1)) * (i + 1);
      const charData = CHARACTER_DATA.find((c) => c.seatIndex === i);
      const occupied = !!charData;

      this.seatPositions.push({
        x: seatX,
        y: stoolY,
        occupied,
        characterIndex: charData ? CHARACTER_DATA.indexOf(charData) : null,
      });

      this.drawStool(seatX, stoolY, occupied);
    }
  }

  private drawStool(x: number, y: number, occupied: boolean) {
    const stool = this.track(this.add.graphics());
    const alpha = occupied ? 1 : 0.35;

    // Stool seat (circular)
    stool.fillStyle(0x5c3a21, alpha);
    stool.fillCircle(x, y, 10);
    stool.fillStyle(0x6b4226, alpha * 0.7);
    stool.fillCircle(x, y - 1, 8);

    // Single leg
    stool.fillStyle(0x3d2817, alpha);
    stool.fillRect(x - 2, y + 8, 4, 14);

    // Glow for empty seats (future touch hint)
    if (!occupied) {
      const glow = this.track(this.add.graphics());
      glow.fillStyle(0xffd700, 0.06);
      glow.fillCircle(x, y, 16);

      this.tweens.add({
        targets: glow,
        alpha: { from: 0.4, to: 0.9 },
        duration: 2000,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    }
  }

  // ── Characters ──

  private drawCharacters(w: number, h: number) {
    const deskY = h * 0.67;

    CHARACTER_DATA.forEach((charData, idx) => {
      const seat = this.seatPositions[charData.seatIndex];
      if (!seat) return;

      const charY = deskY - 8; // sit above desk
      const container = this.drawCharacter(seat.x, charY, charData.name, charData.highlight, !!charData.isMe);
      this.characters.push(container);

      // Hourglass above head (inside character container)
      this.drawHourglassAboveHead(container, charData.minutes, charData.active);

      // Breathing animation
      this.tweens.add({
        targets: container,
        y: container.y - 2,
        duration: 1800 + idx * 400,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    });
  }

  private drawCharacter(
    x: number,
    y: number,
    name: string,
    highlightColor: number,
    isMe: boolean
  ): Phaser.GameObjects.Container {
    const container = this.track(this.add.container(x, y));
    const s = CHAR_SCALE;

    const gfx = this.add.graphics();

    // Body
    gfx.fillStyle(highlightColor);
    gfx.fillRect(-10 * s, -8 * s, 20 * s, 22 * s);

    // Arms resting on desk
    gfx.fillStyle(highlightColor, 0.85);
    gfx.fillRect(-14 * s, 2 * s, 5 * s, 12 * s);
    gfx.fillRect(9 * s, 2 * s, 5 * s, 12 * s);

    // Head
    gfx.fillStyle(0xd4a574);
    gfx.fillCircle(0, -18 * s, 10 * s);

    // Eyes (tiny dots)
    gfx.fillStyle(0x2c1810);
    gfx.fillCircle(-3 * s, -19 * s, 1.5 * s);
    gfx.fillCircle(3 * s, -19 * s, 1.5 * s);

    // Book in front
    gfx.fillStyle(0xf5f5dc);
    gfx.fillRect(-8 * s, 6 * s, 16 * s, 10 * s);
    // Book spine
    gfx.fillStyle(highlightColor, 0.7);
    gfx.fillRect(-1 * s, 6 * s, 2 * s, 10 * s);

    container.add(gfx);

    // Name label
    const label = this.add.text(0, -36 * s, name, {
      fontSize: `${Math.round(13)}px`,
      color: "#ffffff",
      fontFamily: "sans-serif",
    });
    label.setOrigin(0.5, 1);
    container.add(label);

    // Sapling for "나"
    if (isMe) {
      const sapling = this.add.graphics();
      sapling.fillStyle(0x10b981);
      sapling.fillRect(18 * s, -8 * s, 3 * s, 16 * s);
      sapling.fillStyle(0x34d399);
      sapling.fillTriangle(19 * s, -18 * s, 13 * s, -6 * s, 26 * s, -6 * s);
      container.add(sapling);
    }

    return container;
  }

  // ── Hourglass (Bezier bulb, above character head) ──

  /** Draw a cubic bezier on graphics from current pen position */
  private bezierTo(
    gfx: Phaser.GameObjects.Graphics,
    x0: number, y0: number,
    cp1x: number, cp1y: number,
    cp2x: number, cp2y: number,
    ex: number, ey: number,
    segments = 16
  ) {
    for (let i = 1; i <= segments; i++) {
      const t = i / segments;
      const mt = 1 - t;
      const px = mt * mt * mt * x0 + 3 * mt * mt * t * cp1x + 3 * mt * t * t * cp2x + t * t * t * ex;
      const py = mt * mt * mt * y0 + 3 * mt * mt * t * cp1y + 3 * mt * t * t * cp2y + t * t * t * ey;
      gfx.lineTo(px, py);
    }
  }

  private drawHourglassAboveHead(
    charContainer: Phaser.GameObjects.Container,
    minutes: number,
    active: boolean
  ) {
    const s = CHAR_SCALE;
    const hgY = -36 * s - 30;

    const hgContainer = this.add.container(0, hgY);
    charContainer.add(hgContainer);

    const glassColor = active ? 0xffd700 : 0x888888;
    const sandColor = active ? 0xf4a460 : 0x999977;

    const gfx = this.add.graphics();

    const capW = 20;
    const neckW = 4;
    const totalH = 28;
    const halfH = totalH / 2;
    const capH = 3;

    // Top & bottom caps
    gfx.fillStyle(glassColor, 0.9);
    gfx.fillRect(-capW / 2, -halfH, capW, capH);
    gfx.fillRect(-capW / 2, halfH - capH, capW, capH);

    // Control point coordinates
    const topCapY = -halfH + capH;
    const botCapY = halfH - capH;
    const topBulbCp1Y = topCapY + halfH * 0.4;
    const topBulbCp2Y = topCapY + halfH * 0.5;
    const botBulbCp1Y = halfH * 0.5;
    const botBulbCp2Y = botCapY - halfH * 0.4;

    // Glass bulb outline — left side
    gfx.lineStyle(1.5, glassColor, 0.7);
    gfx.beginPath();
    gfx.moveTo(-capW / 2, topCapY);
    this.bezierTo(gfx, -capW / 2, topCapY, -capW / 2, topBulbCp1Y, -neckW / 2, topBulbCp2Y, -neckW / 2, 0);
    this.bezierTo(gfx, -neckW / 2, 0, -neckW / 2, botBulbCp1Y, -capW / 2, botBulbCp2Y, -capW / 2, botCapY);
    gfx.strokePath();

    // Glass bulb outline — right side
    gfx.beginPath();
    gfx.moveTo(capW / 2, topCapY);
    this.bezierTo(gfx, capW / 2, topCapY, capW / 2, topBulbCp1Y, neckW / 2, topBulbCp2Y, neckW / 2, 0);
    this.bezierTo(gfx, neckW / 2, 0, neckW / 2, botBulbCp1Y, capW / 2, botBulbCp2Y, capW / 2, botCapY);
    gfx.strokePath();

    // Sand in top bulb
    gfx.fillStyle(sandColor, 0.8);
    const sandTopY = active ? topCapY + 5 : topCapY + halfH * 0.7;
    gfx.beginPath();
    gfx.moveTo(-6, sandTopY);
    gfx.lineTo(6, sandTopY);
    this.bezierTo(gfx, 6, sandTopY, 4, sandTopY + 4, neckW / 2 - 1, sandTopY + 6, neckW / 2 - 1, 0);
    gfx.lineTo(-neckW / 2 + 1, 0);
    this.bezierTo(gfx, -neckW / 2 + 1, 0, -neckW / 2 + 1, sandTopY + 6, -4, sandTopY + 4, -6, sandTopY);
    gfx.closePath();
    gfx.fillPath();

    // Sand in bottom bulb
    gfx.fillStyle(sandColor, 0.85);
    const sandBotY = active ? botCapY - 6 : botCapY - halfH * 0.6;
    gfx.beginPath();
    gfx.moveTo(-capW / 2 + 3, botCapY);
    gfx.lineTo(capW / 2 - 3, botCapY);
    this.bezierTo(gfx, capW / 2 - 3, botCapY, capW / 2 - 4, sandBotY + 2, neckW / 2 - 1, sandBotY, neckW / 2 - 1, 0);
    gfx.lineTo(-neckW / 2 + 1, 0);
    this.bezierTo(gfx, -neckW / 2 + 1, 0, -neckW / 2 - 1, sandBotY, -capW / 2 + 4, sandBotY + 2, -capW / 2 + 3, botCapY);
    gfx.closePath();
    gfx.fillPath();

    // Glass fill (semi-transparent)
    gfx.fillStyle(glassColor, 0.08);
    // Top bulb fill
    gfx.beginPath();
    gfx.moveTo(-capW / 2, topCapY);
    this.bezierTo(gfx, -capW / 2, topCapY, -capW / 2, topBulbCp1Y, -neckW / 2, topBulbCp2Y, -neckW / 2, 0);
    gfx.lineTo(neckW / 2, 0);
    this.bezierTo(gfx, neckW / 2, 0, neckW / 2, topBulbCp2Y, capW / 2, topBulbCp1Y, capW / 2, topCapY);
    gfx.closePath();
    gfx.fillPath();
    // Bottom bulb fill
    gfx.beginPath();
    gfx.moveTo(-neckW / 2, 0);
    this.bezierTo(gfx, -neckW / 2, 0, -neckW / 2, botBulbCp1Y, -capW / 2, botBulbCp2Y, -capW / 2, botCapY);
    gfx.lineTo(capW / 2, botCapY);
    this.bezierTo(gfx, capW / 2, botCapY, capW / 2, botBulbCp2Y, neckW / 2, botBulbCp1Y, neckW / 2, 0);
    gfx.closePath();
    gfx.fillPath();

    hgContainer.add(gfx);

    // Sand grain particles falling through neck
    const sandGrains: Phaser.GameObjects.Graphics[] = [];
    if (active) {
      for (let i = 0; i < 3; i++) {
        const grain = this.add.graphics();
        grain.fillStyle(sandColor, 0.9);
        grain.fillCircle(0, 0, 1.2);
        grain.setPosition(0, -2);
        hgContainer.add(grain);
        sandGrains.push(grain);

        this.tweens.add({
          targets: grain,
          y: halfH - capH - 4,
          duration: 500 + i * 180,
          repeat: -1,
          delay: i * 250,
          ease: "Quad.easeIn",
          onRepeat: () => {
            grain.setPosition(Phaser.Math.Between(-1, 1), -2);
          },
        });
      }

      // Glow pulse
      this.tweens.add({
        targets: hgContainer,
        alpha: { from: 0.85, to: 1 },
        duration: 1200,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    } else {
      hgContainer.setAlpha(0.55);
    }

    // Time text above hourglass
    const timeText = this.add.text(0, -halfH - 10, `${minutes}분`, {
      fontSize: "11px",
      color: active ? "#ffd700" : "#888888",
      fontFamily: "sans-serif",
      fontStyle: "bold",
    });
    timeText.setOrigin(0.5, 1);
    hgContainer.add(timeText);

    this.hourglasses.push({ container: hgContainer, sandGrains, timeText, minutes, active });
  }

  // ── Fireflies ──

  private createFireflies(w: number, h: number) {
    const skyEnd = h * ZONE.BG.end;
    for (let i = 0; i < 15; i++) {
      const x = Math.random() * w;
      const y = Math.random() * skyEnd + 30;
      const firefly = this.track(this.add.graphics());
      firefly.fillStyle(0xffff88, 0.8);
      firefly.fillCircle(0, 0, 2);
      firefly.setPosition(x, y);

      this.tweens.add({
        targets: firefly,
        x: x + Math.random() * 80 - 40,
        y: y + Math.random() * 50 - 25,
        alpha: { from: 0.3, to: 1 },
        duration: 2000 + Math.random() * 2000,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    }
  }
}
