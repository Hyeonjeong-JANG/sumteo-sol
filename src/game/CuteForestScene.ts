import Phaser from "phaser";

// ── Layout Constants ──
const ZONE = {
  SKY: { start: 0, end: 0.3 },
  BG: { start: 0.3, end: 0.6 },
  READING: { start: 0.6, end: 0.85 },
  GROUND: { start: 0.85, end: 1.0 },
};

const CHAR_SCALE = 1.0;
const SEAT_COUNT = 6;
const DESK_WIDTH_RATIO = 0.85;

interface SeatPosition {
  x: number;
  y: number;
  occupied: boolean;
  characterIndex: number | null;
}

interface TimerData {
  container: Phaser.GameObjects.Container;
  timeText: Phaser.GameObjects.Text;
  minutes: number;
  active: boolean;
}

const CHARACTER_DATA = [
  { name: "토끼찡", color: 0xffffff, accent: 0xffb6c1, minutes: 42, active: true, seatIndex: 0, type: 'rabbit' },
  { name: "곰돌이", color: 0xdeb887, accent: 0x8b4513, minutes: 67, active: false, seatIndex: 2, type: 'bear' },
  { name: "나(냥냥)", color: 0xffe4e1, accent: 0xff9999, minutes: 15, active: true, seatIndex: 3, isMe: true, type: 'cat' },
];

export class CuteForestScene extends Phaser.Scene {
  private sceneObjects: Phaser.GameObjects.GameObject[] = [];
  private characters: Phaser.GameObjects.Container[] = [];
  private timers: TimerData[] = [];
  private seatPositions: SeatPosition[] = [];

  constructor() {
    super({ key: "CuteForestScene" });
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
    this.timers = [];
    this.seatPositions = [];
  }

  private track<T extends Phaser.GameObjects.GameObject>(obj: T): T {
    this.sceneObjects.push(obj);
    return obj;
  }

  private drawScene(w: number, h: number) {
    this.drawSky(w, h);
    this.drawClouds(w, h);
    this.drawGround(w, h);
    this.drawFluffyTrees(w, h);
    this.drawDesk(w, h);
    this.drawChairs(w, h);
    this.drawCharacters(w, h);
    this.createMagicalDust(w, h);
  }

  private drawSky(w: number, h: number) {
    const bg = this.track(this.add.graphics());
    // Warm pastel sunset
    bg.fillGradientStyle(0xffb2c1, 0xffb2c1, 0xffe0b2, 0xffe0b2);
    bg.fillRect(0, 0, w, h);
    
    // Smiling Moon
    const mx = w - 100;
    const my = h * 0.2;
    const moon = this.track(this.add.graphics());
    moon.fillStyle(0xfff9c4, 1);
    moon.fillCircle(mx, my, 50);
    // Glow
    moon.fillStyle(0xfff9c4, 0.3);
    moon.fillCircle(mx, my, 70);
    // Blush
    moon.fillStyle(0xffccbc, 0.8);
    moon.fillCircle(mx - 20, my + 10, 10);
    moon.fillCircle(mx + 20, my + 10, 10);
    // Eyes
    moon.fillStyle(0x8d6e63, 1);
    moon.fillCircle(mx - 15, my - 10, 4);
    moon.fillCircle(mx + 15, my - 10, 4);
    // Smile
    moon.lineStyle(3, 0x8d6e63);
    moon.beginPath();
    moon.arc(mx, my + 5, 12, Phaser.Math.DegToRad(20), Phaser.Math.DegToRad(160));
    moon.strokePath();

    this.tweens.add({
      targets: moon,
      y: '-=10',
      duration: 3000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  private drawClouds(w: number, h: number) {
    const cloudColor = 0xffffff;
    const drawCloud = (x: number, y: number, scale: number) => {
      const cloud = this.track(this.add.graphics());
      cloud.fillStyle(cloudColor, 0.8);
      cloud.fillCircle(x, y, 20 * scale);
      cloud.fillCircle(x - 15 * scale, y + 5 * scale, 15 * scale);
      cloud.fillCircle(x + 15 * scale, y + 5 * scale, 15 * scale);
      cloud.fillRect(x - 15 * scale, y + 5 * scale, 30 * scale, 15 * scale);
      
      this.tweens.add({
        targets: cloud,
        x: x + 30 * scale,
        duration: 4000 * scale,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    };

    drawCloud(w * 0.2, h * 0.15, 1.5);
    drawCloud(w * 0.7, h * 0.25, 1.2);
    drawCloud(w * 0.4, h * 0.08, 1.0);
  }

  private drawGround(w: number, h: number) {
    const groundY = h * ZONE.BG.end;
    const ground = this.track(this.add.graphics());
    
    // Light cute green grass
    ground.fillStyle(0xaed581);
    ground.fillRect(0, groundY, w, h - groundY);
    
    // Front grass slightly darker curve
    ground.fillStyle(0x9ccc65);
    ground.beginPath();
    ground.moveTo(0, groundY + 50);
    for (let x = 0; x <= w; x += 40) {
      ground.lineTo(x, groundY + 50 + Math.sin(x * 0.05) * 10);
    }
    ground.lineTo(w, h);
    ground.lineTo(0, h);
    ground.fillPath();
  }

  private drawFluffyTrees(w: number, h: number) {
    const groundY = h * ZONE.BG.end;
    const drawTree = (x: number, y: number, scale: number, color: number) => {
      const treeContainer = this.track(this.add.container(x, y));
      const tree = this.add.graphics();
      // Trunk
      tree.fillStyle(0x8d6e63);
      tree.fillRoundedRect(-10 * scale, -40 * scale, 20 * scale, 40 * scale, 5 * scale);
      
      // Fluffy leaves
      tree.fillStyle(color);
      tree.fillCircle(0, -60 * scale, 35 * scale);
      tree.fillCircle(-25 * scale, -45 * scale, 25 * scale);
      tree.fillCircle(25 * scale, -45 * scale, 25 * scale);
      tree.fillCircle(0, -90 * scale, 30 * scale);

      treeContainer.add(tree);

      this.tweens.add({
        targets: treeContainer,
        scaleY: 1.02,
        scaleX: 0.98,
        duration: 2000 + Math.random() * 1000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    };

    drawTree(w * 0.1, groundY + 20, 1.2, 0x81c784);
    drawTree(w * 0.2, groundY - 10, 0.9, 0x66bb6a);
    drawTree(w * 0.85, groundY + 15, 1.3, 0x81c784);
    drawTree(w * 0.95, groundY - 5, 1.0, 0x66bb6a);
  }

  private drawDesk(w: number, h: number) {
    const deskW = w * DESK_WIDTH_RATIO;
    const deskX = (w - deskW) / 2;
    const deskY = h * 0.65;
    const deskH = 25;

    const desk = this.track(this.add.graphics());

    // Chubby Desk legs
    desk.fillStyle(0xd7ccc8);
    desk.fillRoundedRect(deskX + 20, deskY + 10, 20, 50, 8);
    desk.fillRoundedRect(deskX + deskW - 40, deskY + 10, 20, 50, 8);

    // Rounded Desk top
    desk.fillStyle(0xffe0b2);
    desk.fillRoundedRect(deskX, deskY, deskW, deskH, 12);
    
    // Highlight
    desk.fillStyle(0xfff3e0);
    desk.fillRoundedRect(deskX + 10, deskY + 3, deskW - 20, 8, 4);
    
    // Little apple prop
    const apple = this.track(this.add.graphics());
    const ax = deskX + 80;
    const ay = deskY - 10;
    apple.fillStyle(0xff5252);
    apple.fillCircle(ax, ay, 10);
    apple.fillStyle(0x7cb342); 
    apple.fillTriangle(ax, ay-10, ax+6, ay-16, ax+4, ay-6);
  }

  private drawChairs(w: number, h: number) {
    const deskW = w * DESK_WIDTH_RATIO;
    const deskX = (w - deskW) / 2;
    const chairY = h * 0.65 + 40;

    this.seatPositions = [];

    for (let i = 0; i < SEAT_COUNT; i++) {
      const seatX = deskX + (deskW / (SEAT_COUNT + 1)) * (i + 1);
      const charData = CHARACTER_DATA.find((c) => c.seatIndex === i);
      const occupied = !!charData;

      this.seatPositions.push({
        x: seatX,
        y: chairY,
        occupied,
        characterIndex: charData ? CHARACTER_DATA.indexOf(charData) : null,
      });

      this.drawCuteChair(seatX, chairY, occupied);
    }
  }

  private drawCuteChair(x: number, y: number, occupied: boolean) {
    const chair = this.track(this.add.graphics());
    const alpha = occupied ? 1 : 0.6;

    // Chair base
    chair.fillStyle(0xffccbc, alpha);
    chair.fillRoundedRect(x - 18, y, 36, 24, 10);
    
    // Chair cushion
    chair.fillStyle(0xffab91, alpha);
    chair.fillRoundedRect(x - 14, y - 6, 28, 12, 6);
    
    // Visual hint for empty chair
    if (!occupied) {
      const hint = this.track(this.add.graphics());
      hint.lineStyle(3, 0xffffff, 0.8);
      hint.strokeCircle(x, y - 15, 14);
      
      this.tweens.add({
        targets: hint,
        y: '-=8',
        alpha: { from: 1, to: 0.1 },
        duration: 2000,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    }
  }

  private drawCharacters(w: number, h: number) {
    const deskY = h * 0.65;

    CHARACTER_DATA.forEach((charData, idx) => {
      const seat = this.seatPositions[charData.seatIndex];
      if (!seat) return;

      const charY = deskY - 5; 
      const container = this.drawCuteCharacter(seat.x, charY, charData);
      this.characters.push(container);

      this.drawCuteTimer(container, charData.minutes, charData.active);

      this.tweens.add({
        targets: container,
        y: container.y - 4,
        scaleY: 1.04,
        duration: 900 + idx * 150,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    });
  }

  private drawCuteCharacter(x: number, y: number, data: any): Phaser.GameObjects.Container {
    const container = this.track(this.add.container(x, y));
    const gfx = this.add.graphics();

    const color = data.color;
    const accent = data.accent;
    
    // Chubby Body
    gfx.fillStyle(color);
    gfx.fillRoundedRect(-24, -40, 48, 45, 22);
    
    if (data.type === 'rabbit') {
      // Ears
      gfx.fillRoundedRect(-18, -65, 12, 35, 6);
      gfx.fillRoundedRect(6, -65, 12, 35, 6);
      gfx.fillStyle(accent);
      gfx.fillRoundedRect(-15, -60, 6, 20, 3);
      gfx.fillRoundedRect(9, -60, 6, 20, 3);
    } else if (data.type === 'bear') {
      // Ears
      gfx.fillCircle(-18, -38, 12);
      gfx.fillCircle(18, -38, 12);
      gfx.fillStyle(accent);
      gfx.fillCircle(-18, -38, 6);
      gfx.fillCircle(18, -38, 6);
    } else if (data.type === 'cat') {
      // Ears
      gfx.fillTriangle(-18, -28, -24, -50, -6, -38);
      gfx.fillTriangle(18, -28, 24, -50, 6, -38);
      gfx.fillStyle(accent);
      gfx.fillTriangle(-18, -31, -21, -45, -9, -38);
      gfx.fillTriangle(18, -31, 21, -45, 9, -38);
    }
    
    // Eyes
    gfx.fillStyle(0x5d4037);
    gfx.fillCircle(-10, -22, 4);
    gfx.fillCircle(10, -22, 4);
    
    // Blush
    gfx.fillStyle(0xff8a80, 0.7);
    gfx.fillCircle(-15, -16, 5);
    gfx.fillCircle(15, -16, 5);
    
    // Smile
    gfx.lineStyle(2, 0x5d4037);
    gfx.beginPath();
    gfx.arc(0, -16, 5, 0, Math.PI);
    gfx.strokePath();

    // Cute paws
    gfx.fillStyle(color);
    gfx.fillCircle(-14, 2, 8);
    gfx.fillCircle(14, 2, 8);

    // Book
    gfx.fillStyle(0xffffff);
    gfx.fillRoundedRect(-18, -6, 36, 18, 5);
    gfx.fillStyle(accent);
    gfx.fillRect(-3, -6, 6, 18); 
    
    container.add(gfx);

    // Name label Bubble
    const labelBg = this.add.graphics();
    labelBg.fillStyle(0xffffff, 0.9);
    labelBg.fillRoundedRect(-30, -84, 60, 18, 9);
    container.add(labelBg);

    const label = this.add.text(0, -75, data.name, {
      fontSize: "11px",
      color: "#5d4037",
      fontFamily: "sans-serif",
      fontStyle: "bold",
    });
    label.setOrigin(0.5, 0.5);
    container.add(label);

    // sprout for "isMe"
    if (data.isMe) {
      const sprout = this.add.graphics();
      sprout.lineStyle(2, 0x66bb6a);
      sprout.beginPath();
      sprout.moveTo(0, -42);
      sprout.lineTo(0, -54);
      sprout.strokePath();
      sprout.fillStyle(0x81c784);
      sprout.fillCircle(-4, -56, 4);
      sprout.fillCircle(4, -56, 4);
      container.add(sprout);
      
      this.tweens.add({
        targets: sprout,
        scaleX: 1.1,
        angle: 5,
        duration: 500,
        yoyo: true,
        repeat: -1
      });
    }

    return container;
  }

  private drawCuteTimer(charContainer: Phaser.GameObjects.Container, minutes: number, active: boolean) {
    const timerY = -110;
    const hgContainer = this.add.container(0, timerY);
    charContainer.add(hgContainer);

    const gfx = this.add.graphics();
    
    if (active) {
      // Glow
      gfx.fillStyle(0xffeb3b, 0.35);
      gfx.fillCircle(0, 0, 18);
      
      // Little sandglass shape
      gfx.fillStyle(0xffb74d);
      gfx.fillTriangle(-10, -12, 10, -12, 0, 0);
      gfx.fillTriangle(0, 0, -10, 12, 10, 12);
      
      const heart = this.add.text(16, -8, "♥", { color: '#ff5252', fontSize: '12px' });
      hgContainer.add(heart);
      this.tweens.add({
        targets: heart,
        scale: 1.4,
        alpha: 0.6,
        yoyo: true,
        repeat: -1,
        duration: 600
      });
      
    } else {
      // Sleepy
      gfx.fillStyle(0x9e9e9e, 0.5);
      gfx.fillCircle(0, 0, 12);
      const zzz = this.add.text(0, -3, "Zzz", { color: '#ffffff', fontSize: '10px', fontStyle: 'bold' });
      zzz.setOrigin(0.5, 0.5);
      hgContainer.add(zzz);
    }

    const textBg = this.add.graphics();
    textBg.fillStyle(0xffffff, 0.9);
    textBg.fillRoundedRect(-22, -32, 44, 16, 6);
    hgContainer.add(textBg);

    const timeText = this.add.text(0, -24, `${minutes}m`, {
      fontSize: "13px",
      color: active ? "#ff9800" : "#9e9e9e",
      fontFamily: "sans-serif",
      fontStyle: "bold",
    });
    timeText.setOrigin(0.5, 0.5);
    
    hgContainer.add(timeText);
    hgContainer.add(gfx);

    if (active) {
      this.tweens.add({
        targets: hgContainer,
        y: timerY - 4,
        duration: 1200,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut"
      });
    }

    this.timers.push({ container: hgContainer, timeText, minutes, active });
  }

  private createMagicalDust(w: number, h: number) {
    for (let i = 0; i < 25; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const dust = this.track(this.add.graphics());
      
      const colors = [0xffeb3b, 0xffa726, 0xff4081, 0x4fc3f7, 0xffffff];
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      dust.fillStyle(color, 0.7);
      
      if (Math.random() > 0.4) {
        dust.fillCircle(0, 0, Math.random() * 2.5 + 1.5);
      } else {
        const r = Math.random() * 2 + 1.5;
        dust.fillRect(-r, -r/2, r*2, r);
        dust.fillRect(-r/2, -r, r, r*2);
      }
      
      dust.setPosition(x, y);

      this.tweens.add({
        targets: dust,
        y: '-=40',
        x: '+=10',
        alpha: { from: 0, to: 0.9 },
        scale: { from: 0, to: 1.5 },
        duration: 2500 + Math.random() * 3000,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
        delay: Math.random() * 2000
      });
    }
  }
}
