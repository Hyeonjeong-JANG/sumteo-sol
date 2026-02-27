import Phaser from "phaser";

const PIXEL_SCALE = 3.5;

interface SeatData {
  angle: number;  
  radiusMultiplier: number; 
}

// Closer seating around a central table (평상)
const SEATS: SeatData[] = [
  { angle: 270, radiusMultiplier: 0.9 }, // 0: Top
  { angle: 330, radiusMultiplier: 0.8 }, // 1: Top Right
  { angle: 30, radiusMultiplier: 0.8 },  // 2: Bottom Right
  { angle: 90, radiusMultiplier: 0.9 },  // 3: Bottom
  { angle: 150, radiusMultiplier: 0.8 }, // 4: Bottom Left
  { angle: 210, radiusMultiplier: 0.8 }, // 5: Top Left
];

const PIXEL_PALETTE: Record<string, number> = {
  'K': 0x222222,
  'S': 0xd4a574, // Skin tone from original ForestScene
  'W': 0xffffff,
  'e': 0x2c1810, // Eyes from original
  'H': 0x1a3a2a, // Hat/Hair placeholder (using bg green tone)
  'B': 0x2a1c0e, // Outline
  'R': 0x6b4226, // Book color placeholder
  'r': 0xf5f5dc, // Pages
  'G': 0xffd700,
  'a': 0x888888,
};

const SPRITE_FRONT = [
  "      HHHHHH      ",
  "    HHHHHHHHHH    ",
  "   H SSSSSS S H   ",
  "   H SeeSee S H   ",
  "   H SSSSSS S H   ",
  "      SSSSSS      ",
  "     11111111     ",
  "    1111111111    ",
  "   11 rrrrrr 11   ",
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
  "    HH SeeSSS     ",
  "     H SSSSSS     ",
  "       SSSSSS     ",
  "      111111      ",
  "     11111111     ",
  "    1111rrrr      ",
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
  { name: "친구1", highlight: 0x8b6914, minutes: 42, active: true, seatIndex: 0, pal: 'char_0' },
  { name: "친구2", highlight: 0xc4841d, minutes: 67, active: false, seatIndex: 4, pal: 'char_1' },
  { name: "나", highlight: 0x10b981, minutes: 15, active: true, seatIndex: 2, isMe: true, pal: 'char_2' },
];

export class SumteoZepScene extends Phaser.Scene {
  private characters: Phaser.GameObjects.Container[] = [];

  constructor() {
    super({ key: "SumteoZepScene" });
  }

  create() {
    this.generatePixelTextures();
    const { width, height } = this.scale;
    this.drawScene(width, height);

    this.scale.on("resize", (gameSize: Phaser.Structs.Size) => {
      this.children.removeAll();
      this.tweens.killAll();
      this.characters = [];
      this.drawScene(gameSize.width, gameSize.height);
    });
  }

  private generatePixelTextures() {
    const generate = (key: string, layout: string[], colors: Record<string, number>) => {
      if (this.textures.exists(key)) return;
      const w = layout[0].length;
      const h = layout.length;
      const g = this.make.graphics({x: 0, y: 0, add: false});
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

    // Use original ForestScene colors for clothes ('1')
    CHARACTER_DATA.forEach((char, idx) => {
      const pal = { ...PIXEL_PALETTE, '1': char.highlight, 'H': 0x1a2f1a }; // dark green hair/hat
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

    // Background (Original Deep Forest Night)
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0a1628, 0x0a1628, 0x1a3a2a, 0x1a3a2a, 1);
    bg.fillRect(0, 0, w, h);

    // Floor/Grass
    bg.fillStyle(0x1a2f1a);
    bg.fillRect(0, cy - 80, w, h - (cy - 80));

    // Wooden Platform (평상)
    const platW = Math.min(w * 0.6, 600);
    const platH = platW * 0.5; // Isometric squish
    const platY = cy + 20;

    const plat = this.add.graphics();
    
    // Shadow
    plat.fillStyle(0x000000, 0.3);
    plat.fillRoundedRect(cx - platW/2 + 10, platY + 10, platW, platH, 10);
    
    // Base/Legs
    plat.fillStyle(0x3d2817);
    plat.fillRoundedRect(cx - platW/2, platY + 15, platW, platH, 8);
    
    // Top Wood Surface
    plat.fillStyle(0x6b4226);
    plat.fillRoundedRect(cx - platW/2, platY, platW, platH, 8);
    
    // Plank lines
    plat.lineStyle(2, 0x4a2d14, 0.6);
    for (let x = cx - platW/2 + 30; x < cx + platW/2; x += 40) {
      plat.beginPath();
      plat.moveTo(x, platY);
      plat.lineTo(x, platY + platH);
      plat.strokePath();
    }
    
    // Wood grain highlight
    plat.fillStyle(0x7d5233, 0.4);
    plat.fillRect(cx - platW/2, platY + 4, platW, 4);

    plat.setDepth(platY - 100); 

    // Watermelon in the middle of platform
    this.drawWatermelon(cx, platY + platH/2, platY);

    // Setup Characters sitting on the platform
    const seatR_X = platW * 0.35; // Closer! Fits inside platform
    const seatR_Y = platH * 0.35;

    SEATS.forEach((seat, idx) => {
      const rad = Phaser.Math.DegToRad(seat.angle);
      const sx = cx + seatR_X * seat.radiusMultiplier * Math.cos(rad);
      const sy = platY + platH/2 + seatR_Y * seat.radiusMultiplier * Math.sin(rad) - 10; // Lift up slightly

      // Custom cushions
      const cushion = this.add.graphics();
      cushion.fillStyle(0x5c3a21, 0.7); // Darker wood/cushion
      cushion.fillEllipse(sx, sy + 15, 30, 20); // Shadow/base
      cushion.fillStyle(0x8b6914, 0.5); // Warm top
      cushion.fillEllipse(sx, sy + 12, 28, 18);
      cushion.setDepth(sy - 1); 

      const charData = CHARACTER_DATA.find(c => c.seatIndex === idx);

      if (charData) {
        this.drawCharacter(sx, sy, rad, charData);
      } else {
        // Glowing empty spot (Original style)
        const glow = this.add.graphics();
        glow.fillStyle(0xffd700, 0.08);
        glow.fillCircle(sx, sy + 10, 16);
        glow.setDepth(sy);
        this.tweens.add({
          targets: glow,
          alpha: { from: 0.4, to: 1 },
          duration: 2000,
          yoyo: true,
          repeat: -1,
        });
      }
    });

    this.createFireflies(w, h);
  }

  private drawWatermelon(x: number, y: number, depth: number) {
    const wm = this.add.graphics();
    // Shadow
    wm.fillStyle(0x000000, 0.2);
    wm.fillEllipse(x, y + 5, 45, 20);
    
    // Plate
    wm.fillStyle(0xf5f5dc); // Bone white plate
    wm.fillEllipse(x, y, 40, 18);
    wm.fillStyle(0xe8e8c8);
    wm.fillEllipse(x, y + 2, 36, 14);

    const drawSlice = (sx: number, sy: number, rot: number) => {
        const slice = this.add.graphics();
        slice.setPosition(sx, sy);
        slice.setRotation(rot);
        
        // Rind (Green)
        slice.fillStyle(0x2a4f2a);
        slice.beginPath();
        slice.arc(0, 0, 15, 0, Math.PI);
        slice.lineTo(-15, 0);
        slice.fillPath();
        
        // Inner Rind (White/Light Green)
        slice.fillStyle(0x9ccc65);
        slice.beginPath();
        slice.arc(0, 0, 13, 0, Math.PI);
        slice.lineTo(-13, 0);
        slice.fillPath();

        // Flesh (Red)
        slice.fillStyle(0xff5252);
        slice.beginPath();
        slice.arc(0, 0, 11, 0, Math.PI);
        slice.lineTo(-11, 0);
        slice.fillPath();
        
        // Seeds
        slice.fillStyle(0x111111);
        slice.fillCircle(-4, 4, 1.5);
        slice.fillCircle(4, 4, 1.5);
        slice.fillCircle(0, 7, 1.5);
        
        wm.add(slice);
    };

    // Arrange a few slices
    drawSlice(x - 8, y, -0.4);
    drawSlice(x, y-2, 0);
    drawSlice(x + 10, y+2, 0.3);

    wm.setDepth(depth + 10);
  }

  private drawCharacter(x: number, y: number, rad: number, data: any) {
    let texture = `${data.pal}_front`;
    let flipX = false;

    // Angle relative to table center
    const deg = Phaser.Math.RadToDeg(rad) % 360;
    const ang = deg < 0 ? deg + 360 : deg;

    if (ang > 225 && ang < 315) {
      texture = `${data.pal}_front`;
    } else if (ang >= 45 && ang <= 135) {
      texture = `${data.pal}_back`;
    } else {
      texture = `${data.pal}_side`;
      flipX = !(ang > 135 && ang < 225);
    }

    const sprite = this.add.image(0, -20, texture);
    sprite.setOrigin(0.5, 0.5);
    sprite.setFlipX(flipX);

    const container = this.add.container(x, y, [sprite]);
    container.setDepth(y + 10);
    this.characters.push(container);

    // Book reading breathing animation
    this.tweens.add({
      targets: sprite,
      y: -22,
      duration: 1600 + Math.random() * 400, // Slower, calmer breathing
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Name label
    const nameText = this.add.text(0, -55, data.name, {
      fontSize: "12px",
      color: "#ffffff",
      fontFamily: "sans-serif",
      fontStyle: "bold",
      shadow: { color: "#000", fill: true, blur: 2, offsetY: 1 }
    }).setOrigin(0.5, 0.5);
    container.add(nameText);

    // Hourglass
    const hgKey = data.active ? 'hg_active' : 'hg_inactive';
    const hgSprite = this.add.image(-12, -75, hgKey);
    container.add(hgSprite);

    const timeText = this.add.text(8, -75, `${data.minutes}m`, {
      fontSize: "12px",
      color: data.active ? "#ffd700" : "#aaaaaa", // Original gold
      fontFamily: "sans-serif",
      fontStyle: "bold",
      shadow: { color: '#000', fill: true, blur: 2, offsetY: 1 }
    }).setOrigin(0, 0.5);
    container.add(timeText);

    if (data.active) {
      // Glow pulse for active hourglass
      this.tweens.add({
        targets: hgSprite,
        alpha: 0.6,
        duration: 1200,
        yoyo: true,
        repeat: -1,
      });
    }

    if (data.isMe) {
        const sapling = this.add.graphics();
        sapling.fillStyle(0x10b981);
        sapling.fillRect(-1.5, -95, 3, 10);
        sapling.fillStyle(0x34d399);
        sapling.fillTriangle(-1, -100, -7, -90, 6, -90);
        container.add(sapling);
    }
  }

  private createFireflies(w: number, h: number) {
    for (let i = 0; i < 15; i++) {
      const x = Math.random() * w;
      const y = Math.random() * (h * 0.7);
      const firefly = this.add.graphics();
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
