import Phaser from "phaser";

const PIXEL_SCALE = 4;

interface SeatData {
  angle: number;  
  radiusMultiplier: number; 
}

const SEATS: SeatData[] = [
  { angle: 270, radiusMultiplier: 1.1 }, // 0: Top
  { angle: 330, radiusMultiplier: 1.0 }, // 1: Top Right
  { angle: 30, radiusMultiplier: 1.0 },  // 2: Bottom Right
  { angle: 90, radiusMultiplier: 1.1 },  // 3: Bottom
  { angle: 150, radiusMultiplier: 1.0 }, // 4: Bottom Left
  { angle: 210, radiusMultiplier: 1.0 }, // 5: Top Left
];

const PIXEL_PALETTE: Record<string, number> = {
  'K': 0x222222,
  'S': 0xffd3b6,
  'W': 0xffffff,
  'E': 0x4a90e2,
  'e': 0x111111,
  'P': 0xffb6c1,
  'B': 0x3b82f6,
  'R': 0x8b4513,
  'r': 0xfff0c2,
  'G': 0xffd700,
  'a': 0x888888,
  'A': 0xd1d5db,
};

const SPRITE_FRONT = [
  "      HHHHHH      ",
  "    HHHHHHHHHH    ",
  "   H SSSSSS S H   ",
  "   H SWeSWe S H   ",
  "   H SSPSSP S H   ",
  "      SSSSSS      ",
  "     11111111     ",
  "    1111111111    ",
  "   11 RrrrrR 11   ",
  "   11 RrrrrR 11   ",
  "      RRRRRR      ",
  "       BBBB       ",
  "      BB  BB      ",
  "     BB    BB     "
];

const SPRITE_BACK = [
  "      HHHHHH      ",
  "    HHHHHHHHHH    ",
  "   HHHHHHHHHHHH   ",
  "   HHHHHHHHHHHH   ",
  "     HHHHHHHH     ",
  "      HHHHHH      ",
  "     11111111     ",
  "    1111111111    ",
  "   11   11   11   ",
  "   11   11   11   ",
  "      111111      ",
  "       BBBB       ",
  "      BB  BB      ",
  "     BB    BB     "
];

const SPRITE_SIDE = [
  "      HHHHHH      ",
  "    HHHHHHHHHH    ",
  "    HH SSSSSS     ",
  "    HH SWeSSS     ",
  "     H SSPSSS     ",
  "       SSSSSS     ",
  "      111111      ",
  "     11111111     ",
  "    1111RRRR      ",
  "    11  RrrR      ",
  "        RrrR      ",
  "        BBBB      ",
  "        B  B      ",
  "        B   B     "
];

const SPRITE_HG_ACTIVE = [
  " GGGGGGGG ",
  " WGGGGGGW ",
  "  WWSSWW  ",
  "   WWWW   ",
  "   WWWW   ",
  "  WWSSWW  ",
  " WGGSSSSW ",
  " GGGGGGGG "
];

const SPRITE_HG_INACTIVE = [
  " aaaaaaaa ",
  " WaWaWaWW ",
  "  WWWWWW  ",
  "   WWWW   ",
  "   WWWW   ",
  "  WWWWWW  ",
  " WaaaaaaW ",
  " aaaaaaaa "
];

const CHARACTER_DATA = [
  { name: "친구1", minutes: 42, active: true, seatIndex: 0, pal: 'char_0' },
  { name: "친구2", minutes: 67, active: false, seatIndex: 4, pal: 'char_1' },
  { name: "나(냥냥)", minutes: 15, active: true, seatIndex: 2, isMe: true, pal: 'char_2' },
];

export class PixelCafeScene extends Phaser.Scene {
  constructor() {
    super({ key: "PixelCafeScene" });
  }

  create() {
    this.generatePixelTextures();
    const { width, height } = this.scale;
    this.drawScene(width, height);

    this.scale.on("resize", (gameSize: Phaser.Structs.Size) => {
      this.children.removeAll();
      this.tweens.killAll();
      this.drawScene(gameSize.width, gameSize.height);
    });
  }

  private generatePixelTextures() {
    const generate = (key: string, layout: string[], colors: Record<string, number>) => {
      if (this.textures.exists(key)) return;
      const w = layout[0].length;
      const h = layout.length;
      const g = this.make.graphics({x: 0, y: 0});
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const c = layout[y][x];
          if (c !== ' ' && colors[c] !== undefined) {
            g.fillStyle(colors[c]);
            g.fillRect(x * PIXEL_SCALE, y * PIXEL_SCALE, PIXEL_SCALE, PIXEL_SCALE);
          }
        }
      }
      g.generateTexture(key, w * PIXEL_SCALE, h * PIXEL_SCALE);
      g.destroy();
    };

    const charPalettes = [
      { ...PIXEL_PALETTE, '1': 0xffa07a, 'H': 0xa0522d }, // Friend 1
      { ...PIXEL_PALETTE, '1': 0xba55d3, 'H': 0x4b0082 }, // Friend 2
      { ...PIXEL_PALETTE, '1': 0x10b981, 'H': 0x222222 }, // Me
    ];

    charPalettes.forEach((pal, idx) => {
      generate(`char_${idx}_front`, SPRITE_FRONT, pal);
      generate(`char_${idx}_back`, SPRITE_BACK, pal);
      generate(`char_${idx}_side`, SPRITE_SIDE, pal);
    });

    generate('hg_active', SPRITE_HG_ACTIVE, { ...PIXEL_PALETTE, 'S': 0xf4a460 });
    generate('hg_inactive', SPRITE_HG_INACTIVE, PIXEL_PALETTE);
  }

  private drawScene(w: number, h: number) {
    const cx = w / 2;
    const cy = h * 0.55;

    // Background Room Floor
    const bg = this.add.graphics();
    bg.fillGradientStyle(0xe8eaf6, 0xe8eaf6, 0xebf4f5, 0xebf4f5, 1);
    bg.fillRect(0, 0, w, h);

    // Warm Rug (Zep style)
    const rug = this.add.graphics();
    rug.fillStyle(0xffcdd2, 1);
    rug.fillEllipse(cx, cy + 20, Math.min(w * 0.8, 700), Math.min(h * 0.6, 400));
    rug.fillStyle(0xffb5b5, 1);
    rug.fillEllipse(cx, cy + 20, Math.min(w * 0.75, 650), Math.min(h * 0.55, 360));
    rug.setDepth(-10);

    // Round Coffee Desk (Isometric)
    const deskR_X = Math.min(w * 0.25, 200);
    const deskR_Y = deskR_X * 0.5;

    const desk = this.add.graphics();
    // Shadow
    desk.fillStyle(0x000000, 0.1);
    desk.fillEllipse(cx, cy + 30, deskR_X * 1.1, deskR_Y * 1.1);
    // Desk Base/Rim
    desk.fillStyle(0x8d6e63);
    desk.fillEllipse(cx, cy + 12, deskR_X, deskR_Y);
    // Desk Top (Glass/Light Wood)
    desk.fillStyle(0xfff3e0);
    desk.fillEllipse(cx, cy, deskR_X, deskR_Y);
    // Inner Glass Layer
    desk.fillStyle(0xe0f7fa, 0.7);
    desk.fillEllipse(cx, cy, deskR_X * 0.85, deskR_Y * 0.85);

    // Glass Reflex Line
    desk.lineStyle(4, 0xffffff, 0.6);
    desk.beginPath();
    desk.arc(cx, cy, deskR_X * 0.7, Phaser.Math.DegToRad(190), Phaser.Math.DegToRad(260));
    desk.strokePath();

    desk.setDepth(cy); // Depth sorting key

    // Center Prop (Tablet & Plant)
    const plant = this.add.graphics();
    plant.fillStyle(0xa1887f);
    plant.fillRoundedRect(cx - 15, cy - 8, 30, 20, 4); // pot
    plant.fillStyle(0x81c784);
    plant.fillCircle(cx, cy - 15, 18);
    plant.fillStyle(0x4caf50);
    plant.fillCircle(cx - 8, cy - 20, 12);
    plant.fillCircle(cx + 10, cy - 12, 15);
    plant.setDepth(cy + 1);

    // Setup Characters on Beanbags around the table
    const seatR_X = deskR_X + 90; // distance from center
    const seatR_Y = deskR_Y + 60;

    SEATS.forEach((seat, idx) => {
      const rad = Phaser.Math.DegToRad(seat.angle);
      const sx = cx + seatR_X * seat.radiusMultiplier * Math.cos(rad);
      const sy = cy + seatR_Y * seat.radiusMultiplier * Math.sin(rad);

      // Draw Beanbag chair
      const bb = this.add.graphics();
      bb.fillStyle(0xffffff, 0.95);
      bb.fillEllipse(sx, sy, 60, 40);
      bb.fillStyle(0xf5f5f5, 1);
      bb.fillEllipse(sx, sy - 5, 54, 34);
      bb.setDepth(sy - 1); 

      // Check if occupied
      const charData = CHARACTER_DATA.find(c => c.seatIndex === idx);

      if (charData) {
        this.drawCharacter(sx, sy, rad, charData);
      } else {
        const hint = this.add.graphics();
        hint.lineStyle(3, 0x4a90e2, 0.5);
        hint.strokeEllipse(sx, sy - 5, 54, 34);
        hint.setDepth(sy);
        this.tweens.add({
          targets: hint,
          alpha: 0.1,
          duration: 1500,
          yoyo: true,
          repeat: -1,
        });
      }
    });

    this.createFloatingEmotes(cx, cy, w, h);
  }

  private drawCharacter(x: number, y: number, rad: number, data: any) {
    let texture = `${data.pal}_front`;
    let flipX = false;

    // Angle relative to table center
    const deg = Phaser.Math.RadToDeg(rad) % 360;
    const ang = deg < 0 ? deg + 360 : deg;

    if (ang > 225 && ang < 315) {
      // Top section: faces down (FRONT)
      texture = `${data.pal}_front`;
    } else if (ang >= 45 && ang <= 135) {
      // Bottom section: faces up (BACK)
      texture = `${data.pal}_back`;
    } else {
      // Sides: faces sideways
      texture = `${data.pal}_side`;
      if (ang > 135 && ang < 225) {
        // Left side -> faces Right
        flipX = false;
      } else {
        // Right side -> faces Left
        flipX = true;
      }
    }

    const sprite = this.add.image(0, -26, texture);
    sprite.setOrigin(0.5, 0.5);
    sprite.setFlipX(flipX);

    const container = this.add.container(x, y, [sprite]);
    container.setDepth(y + 10);

    // Subtle breath animation
    this.tweens.add({
      targets: sprite,
      y: -29,
      duration: 800 + Math.random() * 400,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // ZEP Style Name Tag Bubble
    const tagBg = this.add.graphics();
    tagBg.fillStyle(0x000000, 0.6);
    tagBg.fillRoundedRect(-30, -82, 60, 18, 9);
    container.add(tagBg);

    const nameText = this.add.text(0, -73, data.name, {
      fontSize: "11px",
      color: "#ffffff",
      fontFamily: "sans-serif",
      fontStyle: "bold"
    }).setOrigin(0.5, 0.5);
    container.add(nameText);

    // Hourglass logic
    const hgKey = data.active ? 'hg_active' : 'hg_inactive';
    const hgSprite = this.add.image(-12, -100, hgKey);
    container.add(hgSprite);

    const timeText = this.add.text(8, -100, `${data.minutes}m`, {
      fontSize: "12px",
      color: data.active ? "#eab308" : "#aaaaaa",
      fontFamily: "sans-serif",
      fontStyle: "bold",
      shadow: { color: '#000', fill: true, blur: 2, offsetY: 1 }
    }).setOrigin(0, 0.5);
    container.add(timeText);

    if (data.active) {
      this.tweens.add({
        targets: hgSprite,
        angle: 5,
        duration: 400,
        yoyo: true,
        repeat: -1,
        ease: 'Quad.easeInOut'
      });
    }

    // "Me" highlight
    if (data.isMe) {
      const arrow = this.add.text(0, -125, "▼", { color: "#10b981", fontSize: "16px" }).setOrigin(0.5, 0.5);
      container.add(arrow);
      this.tweens.add({
        targets: arrow,
        y: -120,
        duration: 500,
        yoyo: true,
        repeat: -1
      });
    }
  }

  private createFloatingEmotes(cx: number, cy: number, w: number, h: number) {
    const emojis = ["💬", "👍", "❤️", "👏", "☕"];
    for (let i = 0; i < 7; i++) {
        const text = this.add.text(
            cx + (Math.random()-0.5) * w * 0.8, 
            cy + (Math.random()-0.5) * h * 0.8, 
            emojis[Math.floor(Math.random()*emojis.length)], 
            { fontSize: "24px" }
        );
        text.setAlpha(0);
        text.setDepth(10000); 
        
        this.tweens.add({
            targets: text,
            y: "-=50",
            alpha: { from: 1, to: 0 },
            duration: 2500 + Math.random() * 1500,
            delay: Math.random() * 6000,
            repeat: -1,
            onRepeat: () => {
                text.setPosition(cx + (Math.random()-0.5)*w*0.8, cy + (Math.random()-0.5)*h*0.8);
            }
        });
    }
  }
}
