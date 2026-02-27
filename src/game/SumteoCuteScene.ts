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

export class SumteoCuteScene extends Phaser.Scene {
  private sceneObjects: Phaser.GameObjects.GameObject[] = [];
  private characters: Phaser.GameObjects.Container[] = [];
  private hourglasses: HourglassData[] = [];
  private seatPositions: SeatPosition[] = [];

  constructor() {
    super({ key: "SumteoCuteScene" });
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
    
    // Add sleepy face into the moon
    moon.lineStyle(2, 0xbcbc8d, 0.8);
    moon.beginPath();
    moon.arc(mx - 5, my - 2, 3, Math.PI * 0.1, Math.PI * 0.9, false);
    moon.strokePath();
    moon.beginPath();
    moon.arc(mx + 5, my - 2, 3, Math.PI * 0.1, Math.PI * 0.9, false);
    moon.strokePath();
    moon.fillStyle(0xbcbc8d, 0.8);
    moon.fillCircle(mx - 8, my + 2, 2);
    moon.fillCircle(mx + 8, my + 2, 2);
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
    // Softer rounded trunk
    tree.fillStyle(0x3d2817);
    tree.fillRoundedRect(x - 8 * scale, y - 60 * scale, 16 * scale, 60 * scale, 4 * scale);

    // Milder triangles for leaves
    tree.fillStyle(color);
    tree.fillTriangle(x, y - 160 * scale, x - 45 * scale, y - 60 * scale, x + 45 * scale, y - 60 * scale);
    tree.fillTriangle(x, y - 200 * scale, x - 35 * scale, y - 110 * scale, x + 35 * scale, y - 110 * scale);
    tree.fillTriangle(x, y - 230 * scale, x - 25 * scale, y - 150 * scale, x + 25 * scale, y - 150 * scale);
  }

  // ── Back Wall ──

  private drawBackWall(w: number, h: number) {
    const wallY = h * ZONE.BG.end - 40;
    const wallW = w * 0.55;
    const wallH = 50;
    const wallX = (w - wallW) / 2;

    const wall = this.track(this.add.graphics());

    // Wooden planks
    wall.fillStyle(0x3d2817, 0.7);
    wall.fillRoundedRect(wallX, wallY, wallW, wallH, 4);

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
      w / 2, wallY - 22,
      wallX - 10, wallY + 2,
      wallX + wallW + 10, wallY + 2
    );

    // Small window with warm light
    const winX = w / 2 - 12;
    const winY = wallY + 12;
    wall.fillStyle(0xffe066, 0.9);
    wall.fillRoundedRect(winX, winY, 24, 20, 6);
    wall.lineStyle(2, 0x5c3a21, 0.9);
    wall.strokeRoundedRect(winX, winY, 24, 20, 6);
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
    const deskH = 12;

    const desk = this.track(this.add.graphics());

    // Shadow
    desk.fillStyle(0x000000, 0.15);
    desk.fillRoundedRect(deskX + 4, deskY + 3, deskW, deskH, 4);

    // Table top
    desk.fillStyle(0x6b4226);
    desk.fillRoundedRect(deskX, deskY, deskW, deskH, 6);

    // Wood grain highlight
    desk.fillStyle(0x7d5233, 0.6);
    desk.fillRoundedRect(deskX + 2, deskY + 1, deskW - 4, 4, 2);

    // Desk legs (rounder)
    desk.fillStyle(0x4a2d14);
    const legW = 8;
    desk.fillRoundedRect(deskX + 16, deskY + deskH - 2, legW, 28, 4);
    desk.fillRoundedRect(deskX + deskW - 24, deskY + deskH - 2, legW, 28, 4);
  }

  // ── Stools ──

  private drawStools(w: number, h: number) {
    const deskW = w * DESK_WIDTH_RATIO;
    const deskX = (w - deskW) / 2;
    const stoolY = h * 0.67 + 10 + 28 + 2; 

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
    const alpha = occupied ? 1 : 0.4;

    // Soft stool seat
    stool.fillStyle(0x5c3a21, alpha);
    stool.fillCircle(x, y, 12);
    stool.fillStyle(0x6b4226, alpha * 0.8);
    stool.fillCircle(x, y - 1, 10);

    // Single leg (rounder)
    stool.fillStyle(0x3d2817, alpha);
    stool.fillRoundedRect(x - 3, y + 8, 6, 14, 3);

    // Glow for empty seats
    if (!occupied) {
      const glow = this.track(this.add.graphics());
      glow.fillStyle(0xffd700, 0.08);
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

  // ── Characters (New Cute Design!) ──

  private drawCharacters(w: number, h: number) {
    const deskY = h * 0.67;

    CHARACTER_DATA.forEach((charData, idx) => {
      const seat = this.seatPositions[charData.seatIndex];
      if (!seat) return;

      const charY = deskY - 8; 
      const container = this.drawCharacter(seat.x, charY, charData.name, charData.highlight, !!charData.isMe);
      this.characters.push(container);

      // Hourglass
      this.drawHourglassAboveHead(container, charData.minutes, charData.active);

      // Cute breathing/bouncing animation
      this.tweens.add({
        targets: container,
        scaleY: 1.04,
        scaleX: 0.98,
        y: container.y - 3,
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

    // ── Cuter Body (Rounded) ──
    gfx.fillStyle(highlightColor);
    gfx.fillRoundedRect(-14 * s, -12 * s, 28 * s, 26 * s, 10 * s);

    // ── Cuter Head (Bigger & Rounded) ──
    gfx.fillStyle(0xffe0bd); // Softer skin tone
    gfx.fillCircle(0, -22 * s, 13 * s);

    // ── Cute Face Details ──
    // Blush
    gfx.fillStyle(0xff8a80, 0.4);
    gfx.fillCircle(-7 * s, -18 * s, 3.5 * s);
    gfx.fillCircle(7 * s, -18 * s, 3.5 * s);

    // Eyes (Happy reading closed eyes)
    gfx.lineStyle(1.5, 0x5d4037);
    gfx.beginPath();
    gfx.arc(-5 * s, -21 * s, 2.5 * s, Math.PI * 0.1, Math.PI * 0.9, false);
    gfx.strokePath();
    gfx.beginPath();
    gfx.arc(5 * s, -21 * s, 2.5 * s, Math.PI * 0.1, Math.PI * 0.9, false);
    gfx.strokePath();
    
    // Tiny mouth
    gfx.beginPath();
    gfx.arc(0, -15 * s, 1.5 * s, 0, Math.PI, false);
    gfx.strokePath();

    // ── Arms resting on desk ──
    gfx.fillStyle(highlightColor, 0.9);
    gfx.fillRoundedRect(-16 * s, 4 * s, 8 * s, 10 * s, 4 * s);
    gfx.fillRoundedRect(8 * s, 4 * s, 8 * s, 10 * s, 4 * s);
    
    // Tiny hands
    gfx.fillStyle(0xffe0bd);
    gfx.fillCircle(-12 * s, 13 * s, 3 * s);
    gfx.fillCircle(12 * s, 13 * s, 3 * s);

    // ── Book in front ──
    gfx.fillStyle(0xf5f5dc);
    gfx.fillRoundedRect(-10 * s, 6 * s, 20 * s, 12 * s, 3 * s);
    // Book spine
    gfx.fillStyle(highlightColor, 0.7);
    gfx.fillRoundedRect(-1.5 * s, 6 * s, 3 * s, 12 * s, 1 * s);
    
    // Book pages/lines (Cute detail)
    gfx.fillStyle(0xe8e8c8);
    gfx.fillRect(-8 * s, 9 * s, 6 * s, 1 * s);
    gfx.fillRect(-8 * s, 12 * s, 5 * s, 1 * s);
    gfx.fillRect(3 * s, 9 * s, 5 * s, 1 * s);
    gfx.fillRect(2 * s, 12 * s, 6 * s, 1 * s);

    container.add(gfx);

    // ── Name label (bubble style) ──
    const labelBg = this.add.graphics();
    labelBg.fillStyle(0x000000, 0.3);
    labelBg.fillRoundedRect(-20 * s, -45 * s, 40 * s, 16 * s, 6 * s);
    container.add(labelBg);

    const label = this.add.text(0, -37 * s, name, {
      fontSize: `${Math.round(11)}px`,
      color: "#ffffff",
      fontFamily: "sans-serif",
      fontStyle: "bold",
    });
    label.setOrigin(0.5, 0.5);
    container.add(label);

    // Sapling for "나" (cute animated sprout)
    if (isMe) {
      const sapling = this.add.graphics();
      sapling.lineStyle(2, 0x10b981);
      sapling.beginPath();
      sapling.moveTo(0, -35 * s);
      sapling.lineTo(2 * s, -42 * s);
      sapling.strokePath();
      
      sapling.fillStyle(0x34d399);
      sapling.fillCircle(4 * s, -44 * s, 3.5 * s);
      sapling.fillCircle(-1 * s, -42 * s, 2.5 * s);
      container.add(sapling);

      this.tweens.add({
        targets: sapling,
        angle: { from: -5, to: 5 },
        scaleX: { from: 1, to: 1.1 },
        duration: 1500,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    }

    return container;
  }

  // ── Hourglass ──

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

    // Glass bulb outline
    gfx.lineStyle(1.5, glassColor, 0.7);
    gfx.beginPath();
    gfx.moveTo(-capW / 2, topCapY);
    this.bezierTo(gfx, -capW / 2, topCapY, -capW / 2, topBulbCp1Y, -neckW / 2, topBulbCp2Y, -neckW / 2, 0);
    this.bezierTo(gfx, -neckW / 2, 0, -neckW / 2, botBulbCp1Y, -capW / 2, botBulbCp2Y, -capW / 2, botCapY);
    gfx.strokePath();

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

    // Glass fill 
    gfx.fillStyle(glassColor, 0.08);
    gfx.beginPath();
    gfx.moveTo(-capW / 2, topCapY);
    this.bezierTo(gfx, -capW / 2, topCapY, -capW / 2, topBulbCp1Y, -neckW / 2, topBulbCp2Y, -neckW / 2, 0);
    gfx.lineTo(neckW / 2, 0);
    this.bezierTo(gfx, neckW / 2, 0, neckW / 2, topBulbCp2Y, capW / 2, topBulbCp1Y, capW / 2, topCapY);
    gfx.closePath();
    gfx.fillPath();
    gfx.beginPath();
    gfx.moveTo(-neckW / 2, 0);
    this.bezierTo(gfx, -neckW / 2, 0, -neckW / 2, botBulbCp1Y, -capW / 2, botBulbCp2Y, -capW / 2, botCapY);
    gfx.lineTo(capW / 2, botCapY);
    this.bezierTo(gfx, capW / 2, botCapY, capW / 2, botBulbCp2Y, neckW / 2, botBulbCp1Y, neckW / 2, 0);
    gfx.closePath();
    gfx.fillPath();

    hgContainer.add(gfx);

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

    const timeTextBg = this.add.graphics();
    timeTextBg.fillStyle(0x000000, 0.5);
    timeTextBg.fillRoundedRect(-14, -halfH - 18, 28, 12, 4);
    hgContainer.add(timeTextBg);

    const timeText = this.add.text(0, -halfH - 12, `${minutes}분`, {
      fontSize: "10px",
      color: active ? "#ffd700" : "#aaaaaa",
      fontFamily: "sans-serif",
      fontStyle: "bold",
    });
    timeText.setOrigin(0.5, 0.5);
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
