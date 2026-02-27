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
  angle: number;           // NEW: Circular angle
}

interface HourglassData {
  container: Phaser.GameObjects.Container;
  sandGrains: Phaser.GameObjects.Graphics[];
  timeText: Phaser.GameObjects.Text;
  minutes: number;
  active: boolean;
}

const CHARACTER_DATA: Array<{
  name: string;
  highlight: number;
  minutes: number;
  active: boolean;
  seatIndex: number;
  isMe?: boolean;
}> = [
  { name: "빵돌이", highlight: 0x8b6914, minutes: 42, active: true, seatIndex: 0 },
  { name: "리누스", highlight: 0xc4841d, minutes: 67, active: false, seatIndex: 4 },
];

export class ForestScene extends Phaser.Scene {
  private sceneObjects: Phaser.GameObjects.GameObject[] = [];
  private characters: Phaser.GameObjects.Container[] = [];
  private hourglasses: HourglassData[] = [];
  private seatPositions: SeatPosition[] = [];
  private myCharacter: Phaser.GameObjects.Container | null = null;
  private myHourglass: HourglassData | null = null;
  private mySeatIndex: number | null = null;
  private myTimerEvent: Phaser.Time.TimerEvent | null = null;
  private myDemoTimerEvent: Phaser.Time.TimerEvent | null = null;

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

    this.events.emit("scene-ready");
    if (typeof window !== "undefined") {
      (window as any).__forestScene = this;
    }
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

  // ── Back Wall (Removed to focus on the central stump) ──

  private drawBackWall(w: number, h: number) {
    // Intentionally left blank to simplify the background and keep focus on the natural elements.
  }

  // ── Shared Desk (Now a Tree Stump) ──

  private drawDesk(w: number, h: number) {
    const cx = w / 2;
    const cy = h * 0.72;
    const deskR_X = Math.min(w * 0.22, 180);
    const deskR_Y = deskR_X * 0.45;
    const stumpHeight = 25;

    const desk = this.track(this.add.graphics());

    // Shadow
    desk.fillStyle(0x000000, 0.25);
    desk.fillEllipse(cx, cy + stumpHeight + 8, deskR_X * 1.15, deskR_Y * 1.15);

    // Stump Bark (Sides)
    desk.fillStyle(0x3d2314);
    desk.fillRect(cx - deskR_X, cy, deskR_X * 2, stumpHeight);
    
    // Bottom curve of stump
    desk.fillEllipse(cx, cy + stumpHeight, deskR_X, deskR_Y);

    // Bark Texture (Lines on the side)
    desk.lineStyle(2, 0x24140b, 0.6);
    for (let i = 1; i < 9; i++) {
        const lineX = cx - deskR_X + (deskR_X * 2 / 9) * i;
        desk.beginPath();
        desk.moveTo(lineX, cy + Math.random() * 5);
        desk.lineTo(lineX + (Math.random()*4 - 2), cy + stumpHeight);
        desk.strokePath();
    }

    // Stump Top (Cut wood)
    desk.fillStyle(0xcdae7e); // Lighter wood color
    desk.fillEllipse(cx, cy, deskR_X, deskR_Y);

    // Tree Rings (Age rings on top)
    desk.lineStyle(1.5, 0xa58253, 0.5);
    desk.beginPath();
    desk.strokeEllipse(cx, cy, deskR_X * 0.85, deskR_Y * 0.85);
    desk.strokeEllipse(cx, cy, deskR_X * 0.6, deskR_Y * 0.6);
    desk.strokeEllipse(cx, cy, deskR_X * 0.35, deskR_Y * 0.35);
    desk.strokeEllipse(cx, cy, deskR_X * 0.15, deskR_Y * 0.15);

    // A small lantern in the center for cozy atmosphere
    desk.fillStyle(0x222222);
    desk.fillRect(cx - 8, cy - 12, 16, 12);
    desk.fillStyle(0xffd700, 0.8); // lantern glow
    desk.fillCircle(cx, cy - 6, 6);
    desk.fillStyle(0xfff5e6);      // lantern core
    desk.fillCircle(cx, cy - 6, 3);
    desk.fillStyle(0x111111);      // lantern roof
    desk.fillTriangle(cx, cy - 20, cx - 10, cy - 12, cx + 10, cy - 12);

    // Ambient glow from the lantern
    const glow = this.track(this.add.graphics());
    glow.fillStyle(0xffd700, 0.15);
    glow.fillCircle(cx, cy - 6, 45);

    // Make sure the desk gets sorted correctly in depth (between top and bottom seated characters)
    desk.setDepth(cy); 
  }

  // ── Stools (Arranged circularly around stump) ──

  private drawStools(w: number, h: number) {
    const cx = w / 2;
    const cy = h * 0.72;
    const deskR_X = Math.min(w * 0.22, 180);
    const deskR_Y = deskR_X * 0.45;
    
    // Snug against the stump
    const seatDistX = deskR_X - 10;
    const seatDistY = deskR_Y - 5;

    this.seatPositions = [];

    // Angles for circular arrangement
    const angles = [
      260, // 0: Top Left-ish
      340, // 1: Top Right-ish
      40,  // 2: Bottom Right-ish
      90,  // 3: Bottom
      140, // 4: Bottom Left-ish
      200  // 5: Top Left
    ];

    for (let i = 0; i < SEAT_COUNT; i++) {
      const rad = Phaser.Math.DegToRad(angles[i]);
      const seatX = cx + Math.cos(rad) * seatDistX;
      
      // FIX Y depth order overlapping - make front characters slightly lower 
      // compared to the stump so they render cleanly in front.
      const seatY = cy + Math.sin(rad) * seatDistY + (Math.sin(rad) < 0 ? -25 : 15);

      const charData = CHARACTER_DATA.find((c) => c.seatIndex === i);
      const occupied = !!charData;

      this.seatPositions.push({
        x: seatX,
        y: seatY,
        occupied,
        characterIndex: charData ? CHARACTER_DATA.indexOf(charData) : null,
        angle: angles[i],
      });

      this.drawStool(seatX, seatY, occupied);
    }
  }

  private drawStool(x: number, y: number, occupied: boolean) {
    // Only show a subtle glow for empty seats to indicate you can sit there.
    // We completely remove any "brown graphical blocks" (stools) to prevent rendering bugs.
    if (!occupied) {
      const glow = this.track(this.add.graphics());
      glow.fillStyle(0xffd700, 0.08);
      glow.fillCircle(x, y - 5, 18);
      glow.setDepth(y - 5);

      this.tweens.add({
        targets: glow,
        alpha: { from: 0.2, to: 0.9 },
        duration: 2000,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    }
  }

  // ── Characters ──

  private drawCharacters(w: number, h: number) {
    CHARACTER_DATA.forEach((charData, idx) => {
      const seat = this.seatPositions[charData.seatIndex];
      if (!seat) return;

      const charY = seat.y - 12; // sit on the stool
      const container = this.drawCharacter(seat.x, charY, charData.name, charData.highlight, !!charData.isMe, seat.angle);
      
      // Calculate depth based on Y position so bottom characters overlay top characters
      container.setDepth(seat.y);
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
    isMe: boolean,
    angle: number
  ): Phaser.GameObjects.Container {
    const container = this.track(this.add.container(x, y));
    const s = CHAR_SCALE;

    const gfx = this.add.graphics();

    // Determine orientation based on seated angle
    const rad = Phaser.Math.DegToRad(angle);
    const isBack = Math.sin(rad) >= 0.1; // Sitting at the bottom, looking up towards center
    const isLeft = Math.cos(rad) < -0.1; // Sitting at left, looking right
    const isRight = Math.cos(rad) > 0.1; // Sitting at right, looking left

    // Body
    gfx.fillStyle(highlightColor);
    gfx.fillRect(-10 * s, -8 * s, 20 * s, 22 * s);

    if (isBack) {
      // OVER-THE-SHOULDER / BACK VIEW
      // Draw head without eyes
      gfx.fillStyle(0xd4a574);
      gfx.fillCircle(0, -18 * s, 10 * s);

      // Arms slightly wrapped forward, no book shown (hidden by body/desk)
      gfx.fillStyle(highlightColor, 0.85);
      gfx.fillRect(-12 * s, 2 * s, 4 * s, 10 * s);
      gfx.fillRect(8 * s, 2 * s, 4 * s, 10 * s);
    } else {
      // FRONT / SIDE-ISH VIEW
      const lookOffsetX = isLeft ? 3 * s : (isRight ? -3 * s : 0);
      const lookOffsetY = 2 * s; // Looking down at book

      // Arms resting on desk
      gfx.fillStyle(highlightColor, 0.85);
      gfx.fillRect(-14 * s, 2 * s + lookOffsetY, 5 * s, 12 * s);
      gfx.fillRect(9 * s, 2 * s + lookOffsetY, 5 * s, 12 * s);

      // Head (shifted slightly towards center)
      gfx.fillStyle(0xd4a574);
      gfx.fillCircle(lookOffsetX * 0.5, -18 * s + lookOffsetY * 0.5, 10 * s);

      // Eyes (looking down, shifted towards center)
      gfx.fillStyle(0x2c1810);
      gfx.fillCircle(-3 * s + lookOffsetX, -17 * s + lookOffsetY, 1.5 * s);
      gfx.fillCircle(3 * s + lookOffsetX, -17 * s + lookOffsetY, 1.5 * s);

      // Book in front
      const bookX = -8 * s + lookOffsetX * 1.5;
      const bookY = 6 * s + lookOffsetY;
      gfx.fillStyle(0xf5f5dc);
      gfx.fillRect(bookX, bookY, 16 * s, 10 * s);
      // Book spine
      gfx.fillStyle(highlightColor, 0.7);
      gfx.fillRect(bookX + 7 * s, bookY, 2 * s, 10 * s);
    }

    container.add(gfx);

    // Name label
    const label = this.add.text(0, -38 * s, name, {
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

  // ── Dynamic Character API ──

  addMyCharacter(seatIndex: number = 1) {
    const seat = this.seatPositions[seatIndex];
    if (!seat || seat.occupied) return;

    seat.occupied = true;
    this.mySeatIndex = seatIndex;

    const charY = seat.y - 12;
    const container = this.drawCharacter(seat.x, charY, "최고의순대", 0x10b981, true, seat.angle);
    container.setDepth(seat.y);
    container.setAlpha(0);
    this.track(container);
    this.characters.push(container);
    this.myCharacter = container;

    // Fade in
    this.tweens.add({
      targets: container,
      alpha: 1,
      duration: 600,
      ease: "Quad.easeOut",
    });

    // Breathing
    this.tweens.add({
      targets: container,
      y: container.y - 2,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    // Hourglass starting at 0 min
    this.drawHourglassAboveHead(container, 0, true);
    this.myHourglass = this.hourglasses[this.hourglasses.length - 1];

    this.startMyTimer();
    this.events.emit("seat-joined", seatIndex);
  }

  startMyTimer() {
    if (this.myTimerEvent) this.myTimerEvent.destroy();

    this.myTimerEvent = this.time.addEvent({
      delay: 60000, // every minute (real time)
      callback: () => {
        if (!this.myHourglass) return;
        this.myHourglass.minutes++;
        this.myHourglass.timeText.setText(`${this.myHourglass.minutes}분`);
      },
      loop: true,
    });

    // Also tick once quickly for demo feel (every 3 seconds for demo)
    if (this.myDemoTimerEvent) this.myDemoTimerEvent.destroy();
    this.myDemoTimerEvent = this.time.addEvent({
      delay: 3000,
      callback: () => {
        if (!this.myHourglass) return;
        this.myHourglass.minutes++;
        this.myHourglass.timeText.setText(`${this.myHourglass.minutes}분`);
      },
      loop: true,
    });
  }

  removeMyCharacter() {
    if (this.myTimerEvent) {
      this.myTimerEvent.destroy();
      this.myTimerEvent = null;
    }
    if (this.myDemoTimerEvent) {
      this.myDemoTimerEvent.destroy();
      this.myDemoTimerEvent = null;
    }

    if (this.myCharacter) {
      this.tweens.add({
        targets: this.myCharacter,
        alpha: 0,
        duration: 400,
        ease: "Quad.easeIn",
        onComplete: () => {
          if (this.myCharacter) {
            this.myCharacter.destroy();
            this.myCharacter = null;
          }
        },
      });
    }

    if (this.mySeatIndex !== null) {
      const seat = this.seatPositions[this.mySeatIndex];
      if (seat) seat.occupied = false;
      this.events.emit("seat-left", this.mySeatIndex);
      this.mySeatIndex = null;
    }

    this.myHourglass = null;
  }

  getMyMinutes(): number {
    return this.myHourglass?.minutes ?? 0;
  }
}
