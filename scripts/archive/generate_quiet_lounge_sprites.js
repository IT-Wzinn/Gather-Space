const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, 'Background', 'CornerCafe', 'CornerCafe', 'sprites');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  const spriteDefs = [
    // 1. Moroccan Berber Shag Rug (12x6 tiles = 384x192 px)
    {
      name: 'lounge_moroccan_berber_shag_rug_12x6',
      w: 384, h: 192,
      draw: (ctx, w, h) => {
        // Soft drop shadow
        ctx.fillStyle = 'rgba(0,0,0,0.22)';
        ctx.fillRect(4, 6, w - 8, h - 8);

        // Plush Ivory / Cream Shaggy Base
        ctx.fillStyle = '#f8f6f0';
        ctx.fillRect(6, 6, w - 12, h - 12);

        // Subtle weave texture speckles
        ctx.fillStyle = '#eae5d9';
        for (let i = 0; i < 200; i++) {
          const rx = 10 + Math.random() * (w - 20);
          const ry = 10 + Math.random() * (h - 20);
          ctx.fillRect(rx, ry, 2, 2);
        }

        // Charcoal Moroccan Diamond Lattice Pattern
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 3;
        ctx.beginPath();
        const step = 48;
        for (let x = -h; x < w + h; x += step) {
          ctx.moveTo(x, 10);
          ctx.lineTo(x + h, h - 10);
        }
        for (let x = -h; x < w + h; x += step) {
          ctx.moveTo(x + h, 10);
          ctx.lineTo(x, h - 10);
        }
        ctx.save();
        ctx.rect(10, 10, w - 20, h - 20);
        ctx.clip();
        ctx.stroke();
        ctx.restore();

        // Fringe / Tassels on left and right edges
        ctx.fillStyle = '#f1f5f9';
        for (let y = 10; y < h - 10; y += 6) {
          ctx.fillRect(2, y, 5, 2);
          ctx.fillRect(w - 7, y, 5, 2);
        }
        // Warm braided outer border
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 2;
        ctx.strokeRect(8, 8, w - 16, h - 16);
      }
    },

    // 2. Luxury Velvet Sectional Modular Sofa (6x2 tiles = 192x64 px)
    {
      name: 'lounge_luxury_velvet_sectional_sofa_6x2',
      w: 192, h: 64,
      draw: (ctx, w, h) => {
        // Ambient shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(4, 10, w - 8, h - 12);

        // Sofa base / frame in deep indigo navy velvet
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(6, 8, w - 12, h - 16);

        // Deep tufted velvet backrest (North side)
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(8, 10, w - 16, 18);
        ctx.fillStyle = '#334155';
        ctx.fillRect(8, 10, w - 16, 4);

        // Tufting buttons & creases
        ctx.fillStyle = '#090d16';
        for (let x = 16; x < w - 16; x += 16) {
          ctx.fillRect(x, 16, 3, 3);
          ctx.fillRect(x - 1, 20, 5, 1);
        }

        // Armrests on Left and Right
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(6, 12, 14, 38);
        ctx.fillRect(w - 20, 12, 14, 38);
        ctx.fillStyle = '#475569';
        ctx.fillRect(7, 12, 12, 4);
        ctx.fillRect(w - 19, 12, 12, 4);

        // Plush seat cushions (3 wide segments)
        const seatW = (w - 40) / 3;
        for (let i = 0; i < 3; i++) {
          const sx = 20 + i * seatW;
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(sx + 2, 28, seatW - 4, 24);
          ctx.fillStyle = '#334155';
          ctx.fillRect(sx + 4, 30, seatW - 8, 4);
          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(sx + 2, 28, seatW - 4, 24);
        }

        // Colorful silk accent throw pillows
        // Mustard pillow (left)
        ctx.fillStyle = '#eab308';
        ctx.beginPath();
        ctx.roundRect(24, 22, 16, 14, 3);
        ctx.fill();
        ctx.fillStyle = '#ca8a04';
        ctx.fillRect(26, 24, 12, 2);

        // Emerald teal pillow (center-left)
        ctx.fillStyle = '#0d9488';
        ctx.beginPath();
        ctx.roundRect(75, 22, 16, 14, 3);
        ctx.fill();

        // Burnt orange pillow (right)
        ctx.fillStyle = '#ea580c';
        ctx.beginPath();
        ctx.roundRect(148, 22, 16, 14, 3);
        ctx.fill();
        ctx.fillStyle = '#c2410c';
        ctx.fillRect(150, 24, 12, 2);

        // Brushed Brass minimalist stiletto legs
        ctx.fillStyle = '#d4af37';
        ctx.fillRect(8, h - 8, 4, 7);
        ctx.fillRect(w - 12, h - 8, 4, 7);
        ctx.fillRect(w / 2 - 2, h - 8, 4, 7);
      }
    },

    // 3. Calacatta Marble & Brass Nesting Coffee Table (3x2 tiles = 96x64 px)
    {
      name: 'lounge_marble_brass_nesting_coffee_table_3x2',
      w: 96, h: 64,
      draw: (ctx, w, h) => {
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.beginPath();
        ctx.ellipse(36, 36, 28, 18, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(68, 30, 22, 14, 0, 0, Math.PI * 2);
        ctx.fill();

        // Secondary Nesting Round Table (Right, Dark Smoked Bronze Glass)
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.ellipse(68, 28, 22, 14, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#d4af37';
        ctx.lineWidth = 2;
        ctx.stroke();
        // Glass highlight
        ctx.strokeStyle = 'rgba(255,255,255,0.4)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(68, 26, 18, 10, 0, -Math.PI * 0.7, -Math.PI * 0.2);
        ctx.stroke();

        // Main Calacatta Marble Table (Left, Large Oval)
        // Brass rim
        ctx.fillStyle = '#b45309';
        ctx.beginPath();
        ctx.ellipse(36, 34, 30, 18, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#d4af37';
        ctx.beginPath();
        ctx.ellipse(36, 33, 29, 17, 0, 0, Math.PI * 2);
        ctx.fill();

        // White Calacatta Marble Surface
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.ellipse(36, 31, 27, 15, 0, 0, Math.PI * 2);
        ctx.fill();

        // Marble veins (gold-grey)
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(18, 31);
        ctx.bezierCurveTo(28, 26, 38, 36, 54, 28);
        ctx.stroke();
        ctx.strokeStyle = '#e2e8f0';
        ctx.beginPath();
        ctx.moveTo(25, 34);
        ctx.bezierCurveTo(34, 32, 42, 38, 50, 36);
        ctx.stroke();

        // Decor on Marble Table:
        // 1. Crystal vase with pink peonies
        ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.fillRect(44, 22, 7, 10);
        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.arc(47, 20, 5, 0, Math.PI * 2);
        ctx.arc(45, 17, 4, 0, Math.PI * 2);
        ctx.arc(50, 18, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(47, 22, 2, 4);

        // 2. French Macarons on Brass Tiered Tray
        ctx.fillStyle = '#d4af37';
        ctx.fillRect(24, 30, 14, 2);
        ctx.fillStyle = '#f472b6'; // Rose macaron
        ctx.fillRect(25, 27, 4, 3);
        ctx.fillStyle = '#a3e635'; // Pistachio macaron
        ctx.fillRect(29, 27, 4, 3);
        ctx.fillStyle = '#fde047'; // Lemon macaron
        ctx.fillRect(33, 27, 4, 3);

        // 3. Scented Candle with soft flame
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(16, 26, 5, 7);
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(18.5, 24, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    },

    // 4. Smoke Grey Swivel Accent Chairs (Pair facing North: 3x1 tiles = 96x32 px)
    {
      name: 'lounge_smoke_grey_swivel_accent_chairs',
      w: 96, h: 32,
      draw: (ctx, w, h) => {
        // Two chairs at x=14 and x=62
        [14, 62].forEach(cx => {
          // Shadow
          ctx.fillStyle = 'rgba(0,0,0,0.25)';
          ctx.beginPath();
          ctx.ellipse(cx + 10, 24, 13, 6, 0, 0, Math.PI * 2);
          ctx.fill();

          // Brass swivel disc base
          ctx.fillStyle = '#d4af37';
          ctx.beginPath();
          ctx.ellipse(cx + 10, 22, 8, 4, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillRect(cx + 9, 18, 2, 4);

          // Chair seat & rounded bucket backrest (facing North)
          ctx.fillStyle = '#475569';
          ctx.beginPath();
          ctx.roundRect(cx, 6, 20, 16, 6);
          ctx.fill();

          // Inner seat cushion
          ctx.fillStyle = '#64748b';
          ctx.beginPath();
          ctx.roundRect(cx + 2, 10, 16, 10, 4);
          ctx.fill();

          // Lumbar cushion highlight
          ctx.fillStyle = '#94a3b8';
          ctx.fillRect(cx + 4, 8, 12, 3);
        });
      }
    },

    // 5. Artisan Coffee Bar Island (4x2 tiles = 128x64 px)
    {
      name: 'lounge_artisan_coffee_bar_island_4x2',
      w: 128, h: 64,
      draw: (ctx, w, h) => {
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(6, 12, w - 12, h - 14);

        // Fluted dark walnut bar counter body
        ctx.fillStyle = '#2d1810';
        ctx.fillRect(8, 18, w - 16, h - 22);

        // Vertical fluted slats
        ctx.fillStyle = '#451a03';
        for (let x = 12; x < w - 12; x += 6) {
          ctx.fillRect(x, 20, 3, h - 26);
        }

        // Brushed Brass Kickplate
        ctx.fillStyle = '#d4af37';
        ctx.fillRect(8, h - 7, w - 16, 4);

        // White Quartz Waterfall Countertop
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(6, 12, w - 12, 10);
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(6, 20, w - 12, 2);
        // Left & right waterfall edges
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(6, 12, 4, h - 16);
        ctx.fillRect(w - 10, 12, 4, h - 16);

        // On Counter Equipment:
        // A. La Marzocco Espresso Machine (Chrome & Red accent)
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(18, 4, 30, 14);
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(20, 5, 26, 4);
        ctx.fillStyle = '#dc2626'; // Red brand badge
        ctx.fillRect(30, 9, 6, 3);
        // Portafilters & levers
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(24, 15, 3, 4);
        ctx.fillRect(36, 15, 3, 4);
        // Steam wand
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(46, 10);
        ctx.lineTo(49, 17);
        ctx.stroke();

        // B. Coffee Bean Grinder (Black & Brass Hopper)
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(54, 4, 12, 14);
        ctx.fillStyle = '#d4af37';
        ctx.beginPath();
        ctx.ellipse(60, 4, 5, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        // C. Glass Citrus Detox Water Dispenser with brass spigot
        ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.fillRect(74, 2, 16, 16);
        ctx.fillStyle = '#f97316'; // Orange slice floating
        ctx.beginPath();
        ctx.arc(80, 8, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#84cc16'; // Lime slice
        ctx.beginPath();
        ctx.arc(84, 12, 2.5, 0, Math.PI * 2);
        ctx.fill();
        // Wooden stand & lid
        ctx.fillStyle = '#78350f';
        ctx.fillRect(72, 16, 20, 3);
        ctx.fillRect(74, 0, 16, 3);
        // Spigot
        ctx.fillStyle = '#d4af37';
        ctx.fillRect(81, 14, 3, 2);

        // D. Stack of ceramic cups & saucer
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(98, 8, 8, 4);
        ctx.fillRect(98, 12, 8, 4);
        ctx.fillRect(96, 15, 12, 2);
        ctx.fillRect(110, 8, 8, 4);
        ctx.fillRect(110, 12, 8, 4);
        ctx.fillRect(108, 15, 12, 2);
      }
    },

    // 6. Modern High Barstools Row (3 barstools: 3x1 tiles = 96x32 px)
    {
      name: 'lounge_modern_high_barstools_row',
      w: 96, h: 32,
      draw: (ctx, w, h) => {
        [16, 48, 80].forEach(bx => {
          // Shadow
          ctx.fillStyle = 'rgba(0,0,0,0.25)';
          ctx.beginPath();
          ctx.ellipse(bx, 28, 9, 3, 0, 0, Math.PI * 2);
          ctx.fill();

          // Brass slender legs & footrest rung
          ctx.strokeStyle = '#d4af37';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(bx - 6, 28);
          ctx.lineTo(bx - 4, 10);
          ctx.moveTo(bx + 6, 28);
          ctx.lineTo(bx + 4, 10);
          ctx.stroke();
          // Footrest rung
          ctx.strokeRect(bx - 6, 20, 12, 1);

          // Camel Cognac Leather Padded Seat
          ctx.fillStyle = '#9a3412';
          ctx.beginPath();
          ctx.roundRect(bx - 8, 6, 16, 8, 4);
          ctx.fill();
          ctx.fillStyle = '#c2410c';
          ctx.fillRect(bx - 6, 7, 12, 3);
        });
      }
    },

    // 7. Wine Cooler & Chilled Beverage Unit (1x2 tiles = 32x64 px)
    {
      name: 'lounge_wine_cooler_beverage_fridge_unit',
      w: 32, h: 64,
      draw: (ctx, w, h) => {
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(2, 4, w - 4, h - 6);

        // Stainless steel outer frame
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(3, 2, w - 6, h - 4);
        ctx.fillStyle = '#475569';
        ctx.fillRect(4, 3, w - 8, h - 6);

        // Double pane glass interior with soft amber-blue illumination
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(6, 6, w - 12, h - 12);
        ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
        ctx.fillRect(6, 6, w - 12, h - 12);

        // 4 Wooden wine shelves
        for (let y = 14; y < h - 14; y += 11) {
          ctx.fillStyle = '#78350f';
          ctx.fillRect(7, y, w - 14, 2);

          // Chilled bottles (green & burgundy)
          ctx.fillStyle = '#065f46';
          ctx.fillRect(9, y - 6, 4, 6);
          ctx.fillStyle = '#881337';
          ctx.fillRect(15, y - 6, 4, 6);
          ctx.fillStyle = '#d97706';
          ctx.fillRect(21, y - 6, 4, 6);
        }

        // Glass reflection diagonal
        ctx.strokeStyle = 'rgba(255,255,255,0.25)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(8, 30);
        ctx.lineTo(24, 10);
        ctx.stroke();

        // Sleek vertical handle
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(w - 8, 20, 2, 16);
      }
    },

    // 8. Biophilic Living Moss Feature Wall (4x3 tiles = 128x96 px)
    {
      name: 'lounge_biophilic_living_moss_wall_4x3',
      w: 128, h: 96,
      draw: (ctx, w, h) => {
        // Wall drop shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(4, 4, w - 8, h - 8);

        // Dark Walnut Architectural Frame
        ctx.fillStyle = '#2d1810';
        ctx.fillRect(4, 4, w - 8, h - 8);
        ctx.fillStyle = '#451a03';
        ctx.fillRect(6, 6, w - 12, h - 12);

        // Inner Backing
        ctx.fillStyle = '#14532d';
        ctx.fillRect(10, 10, w - 20, h - 20);

        // Organic Preserved Moss Patches (Cluster mosaic in shades of emerald, chartreuse, forest)
        const mossColors = ['#065f46', '#15803d', '#16a34a', '#65a30d', '#84cc16', '#047857'];
        for (let x = 12; x < w - 16; x += 10) {
          for (let y = 12; y < h - 16; y += 10) {
            const color = mossColors[(x * 7 + y * 13) % mossColors.length];
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(x + 5, y + 5, 6 + ((x + y) % 3), 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Embedded Natural Slate Stone Accent
        ctx.fillStyle = '#475569';
        ctx.beginPath();
        ctx.ellipse(36, 45, 12, 7, Math.PI * 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(88, 55, 14, 8, -Math.PI * 0.15, 0, Math.PI * 2);
        ctx.fill();

        // Integrated Overhead Brass Downlight Spots
        for (let x = 24; x < w - 20; x += 28) {
          ctx.fillStyle = '#d4af37';
          ctx.fillRect(x, 4, 8, 4);
          // Soft downlight cone
          ctx.fillStyle = 'rgba(254, 240, 138, 0.15)';
          ctx.beginPath();
          ctx.moveTo(x + 4, 8);
          ctx.lineTo(x - 12, 45);
          ctx.lineTo(x + 20, 45);
          ctx.closePath();
          ctx.fill();
        }
      }
    },

    // 9. Nature Iwagumi Aquarium Tank (3x2 tiles = 96x64 px)
    {
      name: 'lounge_nature_aquarium_tank_3x1',
      w: 96, h: 64,
      draw: (ctx, w, h) => {
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(4, 10, w - 8, h - 14);

        // Minimalist Black Cabinet Stand (Lower 24px)
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(6, 40, w - 12, 22);
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(8, 42, (w - 20) / 2, 18);
        ctx.fillRect((w - 20) / 2 + 10, 42, (w - 20) / 2, 18);

        // Ultra-clear Rimless Glass Tank (Upper 36px)
        ctx.fillStyle = 'rgba(14, 165, 233, 0.2)';
        ctx.fillRect(8, 8, w - 16, 32);

        // Aqua background gradient feel
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(9, 9, w - 18, 30);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(9, 9, w - 18, 12);

        // Dark substrate (Amazonia aqua soil)
        ctx.fillStyle = '#292524';
        ctx.fillRect(9, 32, w - 18, 7);

        // Iwagumi Dragon Stones
        ctx.fillStyle = '#57534e';
        ctx.beginPath();
        ctx.moveTo(25, 33);
        ctx.lineTo(34, 18);
        ctx.lineTo(44, 33);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(55, 33);
        ctx.lineTo(62, 22);
        ctx.lineTo(70, 33);
        ctx.closePath();
        ctx.fill();

        // Lush green aquatic moss & carpeting plants
        ctx.fillStyle = '#22c55e';
        for (let x = 12; x < w - 20; x += 4) {
          ctx.fillRect(x, 31, 3, 3);
        }

        // Tiny Neon Tetras (Glowing blue/red specks)
        const fish = [
          { x: 30, y: 15 },
          { x: 42, y: 22 },
          { x: 68, y: 16 },
          { x: 76, y: 20 }
        ];
        fish.forEach(f => {
          ctx.fillStyle = '#38bdf8'; // Blue neon stripe
          ctx.fillRect(f.x, f.y, 4, 1.5);
          ctx.fillStyle = '#ef4444'; // Red tail
          ctx.fillRect(f.x - 2, f.y, 2, 1.5);
        });

        // Air bubbles
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.fillRect(36, 12, 1.5, 1.5);
        ctx.fillRect(64, 14, 1.5, 1.5);

        // Slim Overhead LED Light Hanging Fixture
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(14, 4, w - 28, 3);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(16, 6, w - 32, 1);
      }
    },

    // 10. Paradise Palm in Tall Fluted Ceramic Planter (1x2 tiles = 32x64 px)
    {
      name: 'lounge_paradise_palm_ceramic_planter',
      w: 32, h: 64,
      draw: (ctx, w, h) => {
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.beginPath();
        ctx.ellipse(16, h - 4, 10, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Wooden tripod feet
        ctx.fillStyle = '#78350f';
        ctx.fillRect(9, h - 8, 3, 6);
        ctx.fillRect(20, h - 8, 3, 6);

        // Tall Fluted Matte Ceramic Pot
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(8, h - 26, 16, 19);
        ctx.fillStyle = '#cbd5e1';
        for (let x = 10; x <= 22; x += 3) {
          ctx.fillRect(x, h - 25, 1.5, 18);
        }
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(7, h - 27, 18, 3);

        // Soil
        ctx.fillStyle = '#451a03';
        ctx.fillRect(9, h - 26, 14, 2);

        // Arching Palm Fronds
        ctx.strokeStyle = '#15803d';
        ctx.lineWidth = 2;
        // Central stem
        ctx.beginPath();
        ctx.moveTo(16, h - 25);
        ctx.quadraticCurveTo(16, 18, 6, 8);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(16, h - 25);
        ctx.quadraticCurveTo(16, 16, 26, 8);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(16, h - 25);
        ctx.quadraticCurveTo(16, 12, 16, 4);
        ctx.stroke();

        // Palm Leaflets
        ctx.fillStyle = '#22c55e';
        const fronds = [
          { x: 6, y: 8, r: 8 },
          { x: 26, y: 8, r: 8 },
          { x: 16, y: 4, r: 9 },
          { x: 10, y: 15, r: 7 },
          { x: 22, y: 15, r: 7 }
        ];
        fronds.forEach(f => {
          ctx.beginPath();
          ctx.ellipse(f.x, f.y, f.r, 4, Math.PI * 0.25, 0, Math.PI * 2);
          ctx.fill();
        });
      }
    },

    // 11. Acoustic Timber Slat Wall Panel (2x3 tiles = 64x96 px)
    {
      name: 'lounge_acoustic_slat_wood_wall_panel_2x3',
      w: 64, h: 96,
      draw: (ctx, w, h) => {
        // Black acoustic felt backing
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(4, 4, w - 8, h - 8);

        // Vertical warm oak timber slats with 3D bevel
        for (let x = 8; x < w - 8; x += 8) {
          // Shadow beside slat
          ctx.fillStyle = '#020617';
          ctx.fillRect(x + 4, 6, 2, h - 12);

          // Slat body
          ctx.fillStyle = '#92400e';
          ctx.fillRect(x, 6, 4, h - 12);

          // Slat front highlight
          ctx.fillStyle = '#b45309';
          ctx.fillRect(x + 1, 6, 2, h - 12);
        }

        // Frame edge
        ctx.strokeStyle = '#451a03';
        ctx.lineWidth = 2;
        ctx.strokeRect(4, 4, w - 8, h - 8);
      }
    },

    // 12. Audiophile Vinyl Turntable & Glowing Tube Amp Console (2x2 tiles = 64x64 px)
    {
      name: 'lounge_vinyl_turntable_tube_amp_console_2x2',
      w: 64, h: 64,
      draw: (ctx, w, h) => {
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(4, 10, w - 8, h - 14);

        // Mid-century Walnut Console Body
        ctx.fillStyle = '#451a03';
        ctx.fillRect(6, 22, w - 12, 32);
        ctx.fillStyle = '#78350f';
        ctx.fillRect(8, 24, w - 16, 28);

        // Hairpin metal legs
        ctx.strokeStyle = '#d4af37';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(10, 54);
        ctx.lineTo(8, h - 3);
        ctx.moveTo(w - 10, 54);
        ctx.lineTo(w - 8, h - 3);
        ctx.stroke();

        // Front Panel: Analog VU Meters (Dual backlit yellow needles)
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(12, 32, 16, 12);
        ctx.fillRect(w - 28, 32, 16, 12);
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(13, 33, 14, 10);
        ctx.fillRect(w - 27, 33, 14, 10);
        // Needles
        ctx.strokeStyle = '#dc2626';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(20, 42);
        ctx.lineTo(24, 35);
        ctx.moveTo(w - 20, 42);
        ctx.lineTo(w - 17, 35);
        ctx.stroke();

        // Top Surface Equipment:
        // A. Vinyl Turntable (Left)
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(8, 10, 24, 14);
        // Black LP record
        ctx.fillStyle = '#020617';
        ctx.beginPath();
        ctx.arc(19, 17, 8, 0, Math.PI * 2);
        ctx.fill();
        // Vinyl center label (Red)
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(19, 17, 2.5, 0, Math.PI * 2);
        ctx.fill();
        // Chrome tonearm
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(29, 12);
        ctx.lineTo(25, 17);
        ctx.stroke();

        // B. Glowing Vacuum Tube Amplifier (Right)
        ctx.fillStyle = '#334155';
        ctx.fillRect(36, 12, 20, 12);
        // 3 Glowing amber glass tubes
        [40, 46, 52].forEach(tx => {
          ctx.fillStyle = 'rgba(245, 158, 11, 0.4)';
          ctx.beginPath();
          ctx.arc(tx, 14, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#fef08a';
          ctx.fillRect(tx - 1, 12, 2, 5);
        });
      }
    },

    // 13. Vintage Vinyl LP Records Crate Unit (2x1 tiles = 64x32 px)
    {
      name: 'lounge_vinyl_lp_records_crate_unit',
      w: 64, h: 32,
      draw: (ctx, w, h) => {
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.fillRect(4, 6, w - 8, h - 8);

        // Two Rustic Oak Crates side-by-side
        [6, 34].forEach(cx => {
          ctx.fillStyle = '#78350f';
          ctx.fillRect(cx, 8, 24, 18);
          ctx.fillStyle = '#92400e';
          ctx.fillRect(cx + 2, 10, 20, 14);

          // Colorful LP spines inside crate
          const spineColors = ['#ef4444', '#3b82f6', '#eab308', '#10b981', '#8b5cf6', '#f97316'];
          for (let i = 0; i < 6; i++) {
            ctx.fillStyle = spineColors[i];
            ctx.fillRect(cx + 3 + i * 3, 11, 2, 12);
          }
        });

        // Audiophile Headphone Stand on top of crate
        ctx.fillStyle = '#d4af37';
        ctx.fillRect(28, 4, 2, 12);
        ctx.beginPath();
        ctx.arc(29, 6, 4, Math.PI, 0);
        ctx.stroke();
        // Headphone earcups
        ctx.fillStyle = '#78350f';
        ctx.fillRect(25, 7, 3, 5);
        ctx.fillRect(30, 7, 3, 5);
      }
    },

    // 14. Ergonomic Leather Chaise Lounge Recliner (2x2 tiles = 64x64 px)
    {
      name: 'lounge_chaise_lounge_leather_recliner',
      w: 64, h: 64,
      draw: (ctx, w, h) => {
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.beginPath();
        ctx.ellipse(32, 42, 24, 12, 0, 0, Math.PI * 2);
        ctx.fill();

        // Curved tubular chrome base
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(12, 46);
        ctx.lineTo(24, 52);
        ctx.lineTo(52, 38);
        ctx.stroke();

        // Caramel Cognac Tufted Leather Contoured Body
        ctx.fillStyle = '#9a3412';
        ctx.beginPath();
        ctx.moveTo(12, 22);
        ctx.quadraticCurveTo(24, 20, 32, 32);
        ctx.quadraticCurveTo(44, 44, 54, 40);
        ctx.lineTo(54, 46);
        ctx.quadraticCurveTo(42, 50, 30, 38);
        ctx.quadraticCurveTo(22, 28, 12, 28);
        ctx.closePath();
        ctx.fill();

        // Leather surface highlight & tufting segments
        ctx.fillStyle = '#c2410c';
        ctx.beginPath();
        ctx.moveTo(14, 23);
        ctx.quadraticCurveTo(24, 22, 32, 33);
        ctx.quadraticCurveTo(44, 43, 52, 41);
        ctx.lineTo(52, 43);
        ctx.quadraticCurveTo(42, 47, 30, 37);
        ctx.quadraticCurveTo(22, 27, 14, 27);
        ctx.closePath();
        ctx.fill();

        // Rolled Leather Headrest Pillow
        ctx.fillStyle = '#7c2d12';
        ctx.beginPath();
        ctx.roundRect(10, 18, 8, 12, 4);
        ctx.fill();

        // Soft Charcoal Wool Throw Blanket draped over footrest
        ctx.fillStyle = '#475569';
        ctx.fillRect(42, 38, 10, 10);
        ctx.fillStyle = '#334155';
        ctx.fillRect(44, 40, 6, 2);
      }
    },

    // 15. Deluxe Boardgame & Chess Table Set (2x2 tiles = 64x64 px)
    {
      name: 'lounge_boardgame_chess_table_2x2',
      w: 64, h: 64,
      draw: (ctx, w, h) => {
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.28)';
        ctx.beginPath();
        ctx.ellipse(32, 36, 24, 16, 0, 0, Math.PI * 2);
        ctx.fill();

        // 4 Mustard Ochre Velvet Chairs surrounding table
        // North chair
        ctx.fillStyle = '#d97706';
        ctx.beginPath();
        ctx.roundRect(24, 6, 16, 10, 3);
        ctx.fill();
        // South chair
        ctx.beginPath();
        ctx.roundRect(24, 46, 16, 10, 3);
        ctx.fill();
        // West chair
        ctx.beginPath();
        ctx.roundRect(6, 24, 10, 16, 3);
        ctx.fill();
        // East chair
        ctx.beginPath();
        ctx.roundRect(48, 24, 10, 16, 3);
        ctx.fill();

        // Solid Walnut Table Top
        ctx.fillStyle = '#451a03';
        ctx.fillRect(16, 16, 32, 32);
        ctx.fillStyle = '#78350f';
        ctx.fillRect(18, 18, 28, 28);

        // Inlaid Chessboard Grid (8x8 squares in Birch & Rosewood)
        const boardX = 22;
        const boardY = 22;
        const sq = 2.5;
        for (let r = 0; r < 8; r++) {
          for (let c = 0; c < 8; c++) {
            ctx.fillStyle = (r + c) % 2 === 0 ? '#fef3c7' : '#92400e';
            ctx.fillRect(boardX + c * sq, boardY + r * sq, sq, sq);
          }
        }

        // Tiny Chess Pieces mid-game
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(boardX + 3 * sq, boardY + 4 * sq, 2, 2);
        ctx.fillRect(boardX + 4 * sq, boardY + 3 * sq, 2, 2);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(boardX + 3 * sq, boardY + 2 * sq, 2, 2);
        ctx.fillRect(boardX + 5 * sq, boardY + 5 * sq, 2, 2);
      }
    },

    // 16. Boardgame Collection & Novel Bookshelf Cabinet (2x2 tiles = 64x64 px)
    {
      name: 'lounge_boardgame_collection_cabinet_2x2',
      w: 64, h: 64,
      draw: (ctx, w, h) => {
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(4, 8, w - 8, h - 10);

        // Dark Walnut Frame
        ctx.fillStyle = '#2d1810';
        ctx.fillRect(6, 4, w - 12, h - 8);
        ctx.fillStyle = '#451a03';
        ctx.fillRect(8, 6, w - 16, h - 12);

        // 3 Shelves
        const shelfH = (h - 18) / 3;
        for (let i = 0; i < 3; i++) {
          const sy = 10 + i * shelfH;
          ctx.fillStyle = '#78350f';
          ctx.fillRect(8, sy + shelfH - 3, w - 16, 3);

          if (i === 0) {
            // Top shelf: Classic Boxed Boardgames stacked horizontally & vertically
            ctx.fillStyle = '#ef4444'; // Red game box (Catan style)
            ctx.fillRect(12, sy + 2, 12, 10);
            ctx.fillStyle = '#3b82f6'; // Blue game box (Ticket to Ride style)
            ctx.fillRect(26, sy + 3, 14, 9);
            ctx.fillStyle = '#eab308'; // Gold box
            ctx.fillRect(42, sy + 2, 12, 10);
          } else if (i === 1) {
            // Middle shelf: Party games & books
            ctx.fillStyle = '#10b981';
            ctx.fillRect(12, sy + 4, 16, 8);
            ctx.fillStyle = '#8b5cf6';
            ctx.fillRect(30, sy + 2, 10, 10);
            ctx.fillStyle = '#ec4899';
            ctx.fillRect(42, sy + 4, 14, 8);
          } else {
            // Bottom shelf: Wooden dice tray, card decks, hourglass
            ctx.fillStyle = '#d4af37'; // Brass hourglass
            ctx.fillRect(14, sy + 3, 6, 9);
            ctx.fillStyle = '#f8fafc'; // Card deck
            ctx.fillRect(24, sy + 5, 8, 7);
            ctx.fillStyle = '#78350f'; // Dice tray
            ctx.fillRect(36, sy + 6, 18, 6);
          }
        }
      }
    },

    // 17. Retro Marshall Style Bluetooth Speaker on Tripod Stand (1x2 tiles = 32x64 px)
    {
      name: 'lounge_retro_marshall_speaker_stand',
      w: 32, h: 64,
      draw: (ctx, w, h) => {
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.beginPath();
        ctx.ellipse(16, h - 4, 10, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Wooden Tripod Legs
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(16, 36);
        ctx.lineTo(8, h - 4);
        ctx.moveTo(16, 36);
        ctx.lineTo(24, h - 4);
        ctx.moveTo(16, 36);
        ctx.lineTo(16, h - 3);
        ctx.stroke();

        // Marshall Speaker Body (Vintage Black Tolex)
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.roundRect(4, 16, 24, 18, 3);
        ctx.fill();

        // Golden Piping / Bezel
        ctx.strokeStyle = '#d4af37';
        ctx.lineWidth = 1.2;
        ctx.strokeRect(6, 18, 20, 14);

        // Gold Vintage Grille Cloth
        ctx.fillStyle = '#b45309';
        ctx.fillRect(7, 19, 18, 12);
        ctx.fillStyle = '#d97706';
        for (let x = 8; x < 24; x += 2) {
          ctx.fillRect(x, 19, 1, 12);
        }

        // Script Logo center
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(13, 24, 6, 2);

        // Brass Top Knobs
        ctx.fillStyle = '#d4af37';
        ctx.fillRect(9, 14, 2, 2);
        ctx.fillRect(15, 14, 2, 2);
        ctx.fillRect(21, 14, 2, 2);
      }
    }
  ];

  console.log(`Starting generation of ${spriteDefs.length} sprites for Khu 9...`);

  for (const s of spriteDefs) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { margin: 0; padding: 0; background: transparent; }
          canvas { image-rendering: pixelated; }
        </style>
      </head>
      <body>
        <canvas id="c" width="${s.w}" height="${s.h}"></canvas>
      </body>
      </html>
    `;

    await page.setContent(html);
    await page.evaluate((fnStr, w, h) => {
      const canvas = document.getElementById('c');
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      const drawFn = new Function('ctx', 'w', 'h', '(' + fnStr + ')(ctx, w, h)');
      drawFn(ctx, w, h);
    }, s.draw.toString(), s.w, s.h);

    const canvasHandle = await page.$('#c');
    const outPath = path.join(outDir, `${s.name}.png`);
    await canvasHandle.screenshot({ path: outPath, omitBackground: true });
    console.log(`Saved: ${s.name}.png (${s.w}x${s.h})`);
  }

  await browser.close();
  console.log('Finished generating all Khu 9 sprites successfully!');
})();
