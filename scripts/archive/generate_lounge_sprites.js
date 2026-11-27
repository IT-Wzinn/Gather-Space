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
    // 1. Grand Persian Royal Rug (8x6 tiles = 128x96 px)
    {
      name: 'persian_royal_rug_8x6',
      w: 128, h: 96,
      draw: (ctx, w, h) => {
        // Outer fringe (top and bottom)
        ctx.fillStyle = '#fef08a';
        for (let i = 2; i < w - 2; i += 2) {
          ctx.fillRect(i, 0, 1, 2);
          ctx.fillRect(i, h - 2, 1, 2);
        }
        // Outer border: Royal navy
        ctx.fillStyle = '#1e1b4b';
        ctx.fillRect(2, 2, w - 4, h - 4);
        // Gold braid border
        ctx.strokeStyle = '#eab308';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(4, 4, w - 8, h - 8);

        // Secondary floral border: Burgundy
        ctx.fillStyle = '#831843';
        ctx.fillRect(6, 6, w - 12, h - 12);
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 1;
        ctx.strokeRect(8, 8, w - 16, h - 16);

        // Inner field: Deep crimson ruby
        ctx.fillStyle = '#881337';
        ctx.fillRect(10, 10, w - 20, h - 20);

        // Intricate floral field motifs (repeat pattern)
        ctx.fillStyle = '#991b1b';
        for (let y = 14; y < h - 14; y += 8) {
          for (let x = 14; x < w - 14; x += 10) {
            ctx.fillRect(x, y, 2, 2);
          }
        }

        // 4 Ornate Gold Corner Spandrels
        const drawCorner = (cx, cy, flipX, flipY) => {
          ctx.fillStyle = '#b45309';
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx + (flipX ? -16 : 16), cy);
          ctx.lineTo(cx, cy + (flipY ? -14 : 14));
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = '#facc15';
          ctx.fillRect(cx + (flipX ? -6 : 4), cy + (flipY ? -6 : 4), 3, 3);
        };
        drawCorner(10, 10, false, false);
        drawCorner(w - 10, 10, true, false);
        drawCorner(10, h - 10, false, true);
        drawCorner(w - 10, h - 10, true, true);

        // Grand Central Medallion (Double Star & Rosette)
        const mx = w / 2;
        const my = h / 2;
        // Outer navy halo
        ctx.fillStyle = '#1e1b4b';
        ctx.beginPath();
        ctx.ellipse(mx, my, 22, 16, 0, 0, Math.PI * 2);
        ctx.fill();
        // Gold serrated ring
        ctx.strokeStyle = '#eab308';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        // Inner gold core
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.ellipse(mx, my, 12, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        // Ruby center stone
        ctx.fillStyle = '#be123c';
        ctx.beginPath();
        ctx.arc(mx, my, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    },

    // 2. Modern Fireplace Hearth / Marble Fire Pit (32x32 px)
    {
      name: 'modern_fireplace_hearth',
      w: 32, h: 32,
      draw: (ctx, w, h) => {
        // Drop shadow
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.fillRect(2, 6, 28, 24);

        // Basalt/Granite dark base
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(3, 8, 26, 20);
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1;
        ctx.strokeRect(3, 8, 26, 20);

        // White marble veining lines
        ctx.strokeStyle = 'rgba(255,255,255,0.25)';
        ctx.beginPath();
        ctx.moveTo(5, 12); ctx.lineTo(12, 22);
        ctx.moveTo(18, 10); ctx.lineTo(24, 24);
        ctx.stroke();

        // Recessed fire pit cavity
        ctx.fillStyle = '#020617';
        ctx.fillRect(6, 12, 20, 12);
        // Dark lava stones
        ctx.fillStyle = '#1e293b';
        for (let x = 7; x < 25; x += 3) {
          ctx.fillRect(x, 20, 2, 2);
          ctx.fillRect(x + 1, 18, 2, 2);
        }

        // Glass safety guard panels (translucent cyan)
        ctx.fillStyle = 'rgba(186, 230, 253, 0.45)';
        ctx.fillRect(5, 10, 22, 2);
        ctx.fillRect(5, 23, 22, 2);
        ctx.fillRect(5, 10, 2, 14);
        ctx.fillRect(25, 10, 2, 14);

        // Vibrant flames
        // Ambient orange glow
        ctx.fillStyle = 'rgba(249, 115, 22, 0.45)';
        ctx.beginPath();
        ctx.ellipse(16, 16, 9, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Outer orange flame tongues
        ctx.fillStyle = '#f97316';
        ctx.fillRect(9, 15, 3, 5);
        ctx.fillRect(13, 13, 4, 7);
        ctx.fillRect(18, 14, 3, 6);
        ctx.fillRect(22, 16, 2, 4);

        // Inner yellow flame cores
        ctx.fillStyle = '#facc15';
        ctx.fillRect(10, 16, 2, 3);
        ctx.fillRect(14, 14, 2, 5);
        ctx.fillRect(19, 15, 2, 4);

        // White hot center spark
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(15, 16, 2, 2);
      }
    },

    // 3. Live Edge Organic Slab Coffee Table (48x32 px)
    {
      name: 'live_edge_coffee_table_3x2',
      w: 48, h: 32,
      draw: (ctx, w, h) => {
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.beginPath();
        ctx.ellipse(24, 24, 21, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // 4 Hairpin steel legs
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(8, 16); ctx.lineTo(6, 26);
        ctx.moveTo(40, 16); ctx.lineTo(42, 26);
        ctx.moveTo(14, 18); ctx.lineTo(12, 27);
        ctx.moveTo(34, 18); ctx.lineTo(36, 27);
        ctx.stroke();

        // Organic live edge wooden slab
        ctx.fillStyle = '#78350f';
        ctx.beginPath();
        ctx.moveTo(6, 12);
        ctx.bezierCurveTo(12, 9, 24, 10, 42, 11);
        ctx.bezierCurveTo(45, 13, 46, 18, 43, 21);
        ctx.bezierCurveTo(34, 23, 20, 22, 5, 20);
        ctx.bezierCurveTo(3, 17, 4, 14, 6, 12);
        ctx.fill();

        // Wood rim highlight
        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Top surface lighter grain
        ctx.fillStyle = '#92400e';
        ctx.beginPath();
        ctx.moveTo(7, 13);
        ctx.bezierCurveTo(13, 10, 25, 11, 41, 12);
        ctx.bezierCurveTo(43, 14, 44, 17, 41, 19);
        ctx.bezierCurveTo(33, 21, 21, 20, 6, 18);
        ctx.fill();

        // Butterfly bow-tie joints
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(16, 14, 3, 2);
        ctx.fillRect(32, 14, 3, 2);

        // Decor on table:
        // Glass hurricane lantern with candle
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.fillRect(10, 12, 4, 5);
        ctx.fillStyle = '#facc15';
        ctx.fillRect(11, 14, 2, 2);

        // Ceramic tea tray & cups
        ctx.fillStyle = '#f1f5f9';
        ctx.fillRect(22, 13, 9, 4);
        ctx.fillStyle = '#0284c7'; // tiny teapot
        ctx.fillRect(24, 12, 3, 3);
        ctx.fillStyle = '#ffffff'; // mini cups
        ctx.fillRect(28, 14, 2, 2);

        // Succulent in round bowl
        ctx.fillStyle = '#334155';
        ctx.beginPath();
        ctx.arc(38, 15, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(37, 13, 2, 2);
      }
    },

    // 4. Grand Chandelier Crystal (32x32 px)
    {
      name: 'grand_chandelier_crystal',
      w: 32, h: 32,
      draw: (ctx, w, h) => {
        // Soft radial light glow
        const radGlow = ctx.createRadialGradient(16, 16, 2, 16, 16, 15);
        radGlow.addColorStop(0, 'rgba(254, 240, 138, 0.7)');
        radGlow.addColorStop(0.5, 'rgba(250, 204, 21, 0.25)');
        radGlow.addColorStop(1, 'rgba(250, 204, 21, 0)');
        ctx.fillStyle = radGlow;
        ctx.fillRect(0, 0, w, h);

        // Ceiling chain & canopy
        ctx.fillStyle = '#b45309';
        ctx.fillRect(15, 0, 2, 6);
        ctx.fillStyle = '#d97706';
        ctx.fillRect(14, 5, 4, 2);

        // Top gold armature tier
        ctx.strokeStyle = '#eab308';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(11, 10); ctx.lineTo(21, 10);
        ctx.moveTo(7, 16); ctx.lineTo(25, 16);
        ctx.stroke();

        // 6 Candle lights with flickering flame dots
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(7, 12, 2, 3);
        ctx.fillRect(11, 7, 2, 3);
        ctx.fillRect(19, 7, 2, 3);
        ctx.fillRect(23, 12, 2, 3);
        ctx.fillStyle = '#f97316';
        ctx.fillRect(7, 10, 2, 2);
        ctx.fillRect(11, 5, 2, 2);
        ctx.fillRect(19, 5, 2, 2);
        ctx.fillRect(23, 10, 2, 2);

        // Hanging multifaceted crystals (cyan/white sparkles)
        ctx.fillStyle = '#ffffff';
        [8, 12, 16, 20, 24].forEach(x => {
          ctx.fillRect(x, 17, 1, 3);
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(x, 20, 1, 2);
          ctx.fillStyle = '#ffffff';
        });

        // Center bottom crystal teardrop pendant
        ctx.fillStyle = '#7dd3fc';
        ctx.beginPath();
        ctx.moveTo(16, 20); ctx.lineTo(18, 25); ctx.lineTo(14, 25);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(15, 25, 2, 2);
      }
    },

    // 5. Granite Top Corner Bar Counter (32x32 px)
    {
      name: 'counter_bar_corner',
      w: 32, h: 32,
      draw: (ctx, w, h) => {
        // Base shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(2, 6, 28, 26);

        // Granite Countertop
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(2, 6, 28, 8);
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1;
        ctx.strokeRect(2, 6, 28, 8);
        // Granite sheen/specular
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.fillRect(4, 7, 24, 1);

        // Under-counter warm LED accent strip
        ctx.fillStyle = '#fde047';
        ctx.fillRect(3, 14, 26, 1);

        // Vertical oak slat front body
        ctx.fillStyle = '#451a03';
        ctx.fillRect(3, 15, 26, 14);
        ctx.fillStyle = '#78350f';
        for (let x = 5; x < 28; x += 3) {
          ctx.fillRect(x, 15, 1.5, 14);
        }

        // Brass footrest rail
        ctx.fillStyle = '#d97706';
        ctx.fillRect(4, 27, 24, 2);
        ctx.fillStyle = '#facc15';
        ctx.fillRect(4, 27, 24, 1);
      }
    },

    // 6. Deluxe 2-Group Espresso Machine (32x16 px)
    {
      name: 'espresso_machine_deluxe',
      w: 32, h: 16,
      draw: (ctx, w, h) => {
        // Chrome machine body
        ctx.fillStyle = '#475569';
        ctx.fillRect(2, 2, 28, 12);
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(3, 3, 26, 10);

        // Cup warmer tray on top
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(3, 1, 26, 2);
        // 3 mini espresso cups warming
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(6, 0, 3, 2);
        ctx.fillRect(14, 0, 3, 2);
        ctx.fillRect(22, 0, 3, 2);

        // Dial pressure gauges (circular cyan)
        ctx.fillStyle = '#0284c7';
        ctx.beginPath();
        ctx.arc(8, 6, 2, 0, Math.PI * 2);
        ctx.arc(23, 6, 2, 0, Math.PI * 2);
        ctx.fill();

        // 2 Group Heads & Portafilters
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(11, 7, 4, 3);
        ctx.fillRect(17, 7, 4, 3);
        // Brass handles
        ctx.fillStyle = '#b45309';
        ctx.fillRect(12, 10, 2, 3);
        ctx.fillRect(18, 10, 2, 3);

        // Chrome drip tray with grille
        ctx.fillStyle = '#64748b';
        ctx.fillRect(3, 12, 26, 3);
        ctx.fillStyle = '#334155';
        for (let x = 5; x < 27; x += 2) {
          ctx.fillRect(x, 13, 1, 1);
        }
      }
    },

    // 7. Glass Minibar Beverage Cooler (16x32 px)
    {
      name: 'glass_mini_fridge',
      w: 16, h: 32,
      draw: (ctx, w, h) => {
        // Outer stainless frame
        ctx.fillStyle = '#334155';
        ctx.fillRect(1, 2, 14, 28);
        ctx.fillStyle = '#64748b';
        ctx.fillRect(2, 3, 12, 26);

        // Interior backlit cool blue LED
        ctx.fillStyle = '#0369a1';
        ctx.fillRect(3, 4, 10, 24);
        ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.fillRect(3, 4, 10, 24);

        // 3 Wire shelves with drinks
        // Shelf 1 (top): Soda cans
        ctx.fillStyle = '#ef4444'; // Red Coke cans
        ctx.fillRect(4, 7, 2, 4);
        ctx.fillRect(7, 7, 2, 4);
        ctx.fillStyle = '#22c55e'; // Green Sprite cans
        ctx.fillRect(10, 7, 2, 4);
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1;
        ctx.strokeRect(3, 11, 10, 1);

        // Shelf 2 (mid): Sparkling water bottles
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(4, 14, 2, 5);
        ctx.fillRect(7, 14, 2, 5);
        ctx.fillStyle = '#f97316';
        ctx.fillRect(10, 14, 2, 5);
        ctx.strokeRect(3, 19, 10, 1);

        // Shelf 3 (bottom): Cold brew bottles
        ctx.fillStyle = '#78350f';
        ctx.fillRect(4, 22, 3, 5);
        ctx.fillRect(9, 22, 3, 5);

        // Glass reflection diagonal stripe
        ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.beginPath();
        ctx.moveTo(3, 5); ctx.lineTo(11, 5); ctx.lineTo(5, 25); ctx.lineTo(3, 25);
        ctx.fill();

        // Vertical metal handle
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(11, 12, 1.5, 8);
      }
    },

    // 8. Leather Swivel Barstool with Brass Base (16x16 px)
    {
      name: 'barstool_leather_brass',
      w: 16, h: 16,
      draw: (ctx, w, h) => {
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.arc(8, 14, 5, 0, Math.PI * 2);
        ctx.fill();

        // Heavy brass round base disc
        ctx.fillStyle = '#b45309';
        ctx.beginPath();
        ctx.ellipse(8, 14, 5, 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.ellipse(8, 13.5, 4, 1.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Brass support pole & footrest ring
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(8, 7); ctx.lineTo(8, 14);
        ctx.stroke();
        // Footrest ring
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(8, 11, 3.5, 1.5, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Tufted cognac leather round seat
        ctx.fillStyle = '#78350f';
        ctx.beginPath();
        ctx.ellipse(8, 5, 6, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#d97706';
        ctx.beginPath();
        ctx.ellipse(8, 4.5, 5, 3, 0, 0, Math.PI * 2);
        ctx.fill();
        // Leather tufting button
        ctx.fillStyle = '#451a03';
        ctx.fillRect(7, 4, 2, 1);
      }
    },

    // 9. Foosball Table Wood (32x32 px)
    {
      name: 'foosball_table_wood',
      w: 32, h: 32,
      draw: (ctx, w, h) => {
        // Drop shadow
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.fillRect(2, 6, 28, 24);

        // 4 Sturdy wooden legs
        ctx.fillStyle = '#451a03';
        ctx.fillRect(4, 22, 3, 7);
        ctx.fillRect(25, 22, 3, 7);
        ctx.fillRect(4, 4, 3, 6);
        ctx.fillRect(25, 4, 3, 6);

        // Cherry wood table cabinet
        ctx.fillStyle = '#78350f';
        ctx.fillRect(3, 5, 26, 20);
        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = 1;
        ctx.strokeRect(3, 5, 26, 20);

        // Green playing pitch
        ctx.fillStyle = '#15803d';
        ctx.fillRect(6, 8, 20, 14);

        // White pitch lines & center circle
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(16, 8); ctx.lineTo(16, 22);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(16, 15, 3, 0, Math.PI * 2);
        ctx.stroke();

        // 4 Chrome player rods across width
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1;
        [10, 13, 17, 20].forEach((y, idx) => {
          ctx.beginPath();
          ctx.moveTo(1, y); ctx.lineTo(31, y);
          ctx.stroke();
          // Black handles on ends
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(1, y - 1, 2, 2);
          ctx.fillRect(29, y - 1, 2, 2);

          // Miniature players (alternating Red & Blue)
          ctx.fillStyle = (idx % 2 === 0) ? '#ef4444' : '#3b82f6';
          ctx.fillRect(10, y - 2, 2, 4);
          ctx.fillRect(20, y - 2, 2, 4);
        });

        // Score bead trackers at goals
        ctx.fillStyle = '#eab308';
        ctx.fillRect(7, 6, 5, 1);
        ctx.fillRect(20, 6, 5, 1);
      }
    },

    // 10. Retro Arcade Cabinet (16x32 px)
    {
      name: 'retro_arcade_cabinet',
      w: 16, h: 32,
      draw: (ctx, w, h) => {
        // Cabinet dark body
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(1, 2, 14, 28);

        // Neon magenta/cyan edge highlights
        ctx.strokeStyle = '#ec4899';
        ctx.lineWidth = 1;
        ctx.strokeRect(1, 2, 14, 28);

        // Top illuminated marquee "ARCADE"
        ctx.fillStyle = '#f43f5e';
        ctx.fillRect(2, 3, 12, 5);
        ctx.fillStyle = '#fef08a';
        ctx.font = 'bold 4px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('ARCADE', 8, 7);

        // Curved CRT Screen with retro space game
        ctx.fillStyle = '#020617';
        ctx.fillRect(2, 9, 12, 10);
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 0.8;
        ctx.strokeRect(2.5, 9.5, 11, 9);
        // Pixel alien invader on screen
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(6, 12, 4, 2);
        ctx.fillRect(5, 14, 6, 2);
        ctx.fillRect(7, 16, 2, 1);

        // Control Panel (angled)
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(1, 19, 14, 5);
        // Red Joystick
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(5, 22); ctx.lineTo(5, 20);
        ctx.stroke();
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(5, 20, 1.5, 0, Math.PI * 2);
        ctx.fill();
        // Colorful buttons
        ctx.fillStyle = '#3b82f6'; ctx.fillRect(8, 20, 1.5, 1.5);
        ctx.fillStyle = '#eab308'; ctx.fillRect(10, 20, 1.5, 1.5);
        ctx.fillStyle = '#22c55e'; ctx.fillRect(12, 20, 1.5, 1.5);

        // Coin door with red illuminated coin return buttons
        ctx.fillStyle = '#020617';
        ctx.fillRect(4, 25, 8, 4);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(5, 26, 2, 1.5);
        ctx.fillRect(9, 26, 2, 1.5);
      }
    },

    // 11. Chess Board Table with Chairs (32x32 px)
    {
      name: 'chess_board_table',
      w: 32, h: 32,
      draw: (ctx, w, h) => {
        // Chairs on North and South
        // North Chair back
        ctx.fillStyle = '#451a03';
        ctx.fillRect(10, 2, 12, 4);
        ctx.fillStyle = '#d97706';
        ctx.fillRect(11, 4, 10, 3);

        // South Chair seat
        ctx.fillStyle = '#d97706';
        ctx.fillRect(11, 25, 10, 4);
        ctx.fillStyle = '#451a03';
        ctx.fillRect(10, 28, 12, 2);

        // Square carved table top
        ctx.fillStyle = '#78350f';
        ctx.fillRect(6, 7, 20, 18);
        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = 1;
        ctx.strokeRect(6, 7, 20, 18);

        // 8x8 Chessboard grid
        const boardX = 8;
        const boardY = 9;
        const sq = 2;
        for (let r = 0; r < 7; r++) {
          for (let c = 0; c < 8; c++) {
            ctx.fillStyle = ((r + c) % 2 === 0) ? '#fef3c7' : '#78350f';
            ctx.fillRect(boardX + c * sq, boardY + r * sq, sq, sq);
          }
        }

        // Tiny pixel chess pieces
        // Black pieces on top rows
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(9, 9, 1, 2);
        ctx.fillRect(13, 9, 1, 2);
        ctx.fillRect(17, 9, 1, 2);
        ctx.fillRect(21, 9, 1, 2);

        // White pieces on bottom rows
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(9, 21, 1, 2);
        ctx.fillRect(13, 21, 1, 2);
        ctx.fillRect(17, 21, 1, 2);
        ctx.fillRect(21, 21, 1, 2);
      }
    },

    // 12. Wooden Boardgame Shelf (32x32 px)
    {
      name: 'boardgame_shelf_wood',
      w: 32, h: 32,
      draw: (ctx, w, h) => {
        // Shelf wood frame
        ctx.fillStyle = '#451a03';
        ctx.fillRect(2, 4, 28, 26);
        ctx.fillStyle = '#78350f';
        ctx.fillRect(4, 6, 24, 22);

        // Shelves dividers
        ctx.fillStyle = '#451a03';
        ctx.fillRect(4, 16, 24, 2); // mid shelf
        ctx.fillRect(15, 6, 2, 22); // vertical divider

        // Top Left: Stacked game boxes (Yellow Catan + Blue Wingspan)
        ctx.fillStyle = '#eab308'; ctx.fillRect(6, 12, 7, 3);
        ctx.fillStyle = '#0284c7'; ctx.fillRect(6, 9, 7, 3);

        // Top Right: Red Carcassonne box + Dice cups
        ctx.fillStyle = '#dc2626'; ctx.fillRect(18, 10, 6, 5);
        ctx.fillStyle = '#f59e0b'; ctx.fillRect(25, 11, 2, 4);

        // Bottom Left: Large Green strategy game box standing vertically
        ctx.fillStyle = '#16a34a'; ctx.fillRect(6, 19, 4, 8);
        ctx.fillStyle = '#9333ea'; ctx.fillRect(11, 21, 3, 6);

        // Bottom Right: Monopoly & playing cards
        ctx.fillStyle = '#0284c7'; ctx.fillRect(18, 23, 8, 4);
        ctx.fillStyle = '#ffffff'; ctx.fillRect(20, 20, 4, 3);
      }
    },

    // 13. Baby Grand Piano Ebony with Bench (48x48 px)
    {
      name: 'grand_piano_ebony',
      w: 48, h: 48,
      draw: (ctx, w, h) => {
        // Piano shadow
        ctx.fillStyle = 'rgba(0,0,0,0.38)';
        ctx.beginPath();
        ctx.ellipse(24, 26, 20, 14, 0, 0, Math.PI * 2);
        ctx.fill();

        // Baby Grand Body (Lacquered Ebony)
        ctx.fillStyle = '#020617';
        ctx.beginPath();
        ctx.moveTo(8, 12);
        ctx.lineTo(38, 12); // Front keyboard side
        ctx.bezierCurveTo(44, 18, 42, 34, 28, 38); // Curved tail
        ctx.lineTo(8, 38); // Straight left cheek
        ctx.closePath();
        ctx.fill();

        // Rim highlight
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Cast-iron golden harp & soundboard inside
        ctx.fillStyle = '#b45309';
        ctx.beginPath();
        ctx.moveTo(10, 16);
        ctx.lineTo(34, 16);
        ctx.bezierCurveTo(38, 20, 36, 32, 26, 34);
        ctx.lineTo(10, 34);
        ctx.closePath();
        ctx.fill();

        // Gold strings
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 0.7;
        for (let x = 12; x < 32; x += 2.5) {
          ctx.beginPath();
          ctx.moveTo(x, 17);
          ctx.lineTo(Math.max(12, x - 6), 33);
          ctx.stroke();
        }

        // Open piano lid prop stick
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(32, 14); ctx.lineTo(34, 8);
        ctx.stroke();

        // Keyboard (Front North edge)
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(10, 10, 26, 4);
        // Black keys
        ctx.fillStyle = '#000000';
        for (let k = 11; k < 35; k += 2.2) {
          ctx.fillRect(k, 10, 1.2, 2.5);
        }

        // Sheet Music Stand with white sheet notes
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(20, 6, 8, 4);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(22, 7, 4, 1);
        ctx.fillRect(22, 9, 4, 1);

        // Matching cushioned piano bench (placed south of keyboard)
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(16, 2, 14, 5);
        ctx.fillStyle = '#be123c'; // Ruby velvet cushion
        ctx.fillRect(17, 3, 12, 3);
      }
    },

    // 14. Tall Walnut Library Bookshelf (32x48 px)
    {
      name: 'tall_walnut_bookshelf',
      w: 32, h: 48,
      draw: (ctx, w, h) => {
        // Cabinet frame
        ctx.fillStyle = '#451a03';
        ctx.fillRect(2, 2, 28, 44);
        ctx.fillStyle = '#78350f';
        ctx.fillRect(4, 4, 24, 40);

        // 4 Horizontal Shelves
        ctx.fillStyle = '#451a03';
        [14, 24, 34].forEach(y => {
          ctx.fillRect(4, y, 24, 2.5);
        });

        // Books on Shelves (Various luxury colors with gold spines)
        const bookColors = ['#881337', '#1e3a8a', '#14532d', '#b45309', '#581c87', '#0f172a'];
        [5, 17, 27, 37].forEach((shelfY, sIdx) => {
          let curX = 6;
          while (curX < 26) {
            const bWidth = 2 + (curX % 2);
            ctx.fillStyle = bookColors[(curX + sIdx) % bookColors.length];
            ctx.fillRect(curX, shelfY, bWidth, 8);
            // Gold foil spine line
            ctx.fillStyle = '#facc15';
            ctx.fillRect(curX, shelfY + 2, bWidth, 1);
            curX += bWidth + 0.8;
          }
        });

        // Brass Library Ladder hooked on right side
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 1.5;
        // Rails
        ctx.beginPath();
        ctx.moveTo(25, 4); ctx.lineTo(25, 46);
        ctx.moveTo(29, 4); ctx.lineTo(29, 46);
        ctx.stroke();
        // Rungs
        for (let ry = 8; ry < 44; ry += 6) {
          ctx.beginPath();
          ctx.moveTo(25, ry); ctx.lineTo(29, ry);
          ctx.stroke();
        }
      }
    },

    // 15. Reading Wingback Armchair with Ottoman (32x32 px)
    {
      name: 'reading_armchair_ottoman',
      w: 32, h: 32,
      draw: (ctx, w, h) => {
        // Drop shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(6, 6, 20, 24);

        // Wingback Chair (Charcoal Tweed Fabric)
        // High backrest
        ctx.fillStyle = '#334155';
        ctx.fillRect(7, 4, 18, 12);
        // Wings
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(5, 5, 3, 10);
        ctx.fillRect(24, 5, 3, 10);

        // Rolled armrests
        ctx.fillStyle = '#475569';
        ctx.fillRect(4, 13, 4, 7);
        ctx.fillRect(24, 13, 4, 7);

        // Deep plush seat cushion
        ctx.fillStyle = '#475569';
        ctx.fillRect(8, 12, 16, 7);

        // Cream throw pillow
        ctx.fillStyle = '#fef3c7';
        ctx.fillRect(12, 9, 8, 4);

        // Wooden legs
        ctx.fillStyle = '#78350f';
        ctx.fillRect(6, 19, 2, 3);
        ctx.fillRect(24, 19, 2, 3);

        // Matching Cushioned Ottoman Footstool in front
        ctx.fillStyle = '#334155';
        ctx.fillRect(9, 23, 14, 6);
        ctx.fillStyle = '#475569';
        ctx.fillRect(10, 22, 12, 4);
        ctx.fillStyle = '#78350f';
        ctx.fillRect(9, 28, 2, 2);
        ctx.fillRect(21, 28, 2, 2);
      }
    },

    // 16. Arched Brass Floor Reading Lamp (16x32 px)
    {
      name: 'brass_reading_lamp',
      w: 16, h: 32,
      draw: (ctx, w, h) => {
        // Warm downward light cone
        const glow = ctx.createRadialGradient(11, 22, 1, 11, 22, 10);
        glow.addColorStop(0, 'rgba(254, 240, 138, 0.6)');
        glow.addColorStop(1, 'rgba(254, 240, 138, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(11, 22, 10, 0, Math.PI * 2);
        ctx.fill();

        // Round brass base
        ctx.fillStyle = '#b45309';
        ctx.beginPath();
        ctx.ellipse(5, 29, 4, 2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Slender arched brass stem
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(5, 29);
        ctx.lineTo(5, 10);
        ctx.bezierCurveTo(5, 4, 11, 4, 11, 9);
        ctx.stroke();

        // Brass dome lampshade
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(11, 11, 3.5, Math.PI, 0);
        ctx.closePath();
        ctx.fill();

        // Illuminated bulb
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(11, 12, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    },

    // 17. Wooden Acoustic Slat Partition with Greenery (16x48 px)
    {
      name: 'wooden_acoustic_slat_partition',
      w: 16, h: 48,
      draw: (ctx, w, h) => {
        // Dark acoustic felt backing
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(1, 2, 14, 44);

        // Vertical oak slats
        ctx.fillStyle = '#b45309';
        for (let x = 2; x < 14; x += 3) {
          ctx.fillRect(x, 2, 1.8, 44);
        }

        // Hanging planter box at center
        ctx.fillStyle = '#334155';
        ctx.fillRect(2, 20, 12, 6);
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 1;
        ctx.strokeRect(2, 20, 12, 6);

        // Cascading pothos vines / snake plant leaves
        ctx.fillStyle = '#15803d';
        ctx.fillRect(3, 17, 3, 4);
        ctx.fillRect(7, 15, 3, 6);
        ctx.fillRect(10, 18, 3, 3);
        // Vines trailing down
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(4, 26, 2, 5);
        ctx.fillRect(8, 26, 2, 8);
        ctx.fillRect(11, 26, 2, 4);
      }
    },

    // 18. Round Boho Woven Jute Rug (48x48 px)
    {
      name: 'round_boho_rug',
      w: 48, h: 48,
      draw: (ctx, w, h) => {
        const cx = w / 2;
        const cy = h / 2;

        // Outer fringe dots
        ctx.fillStyle = '#fef08a';
        for (let a = 0; a < Math.PI * 2; a += Math.PI / 16) {
          const fx = cx + Math.cos(a) * 22;
          const fy = cy + Math.sin(a) * 22;
          ctx.fillRect(fx, fy, 1.5, 1.5);
        }

        // Outer jute ring
        ctx.fillStyle = '#d97706';
        ctx.beginPath();
        ctx.arc(cx, cy, 20, 0, Math.PI * 2);
        ctx.fill();

        // Ivory cotton band
        ctx.fillStyle = '#fef3c7';
        ctx.beginPath();
        ctx.arc(cx, cy, 16, 0, Math.PI * 2);
        ctx.fill();

        // Teal Aztec geometric ring
        ctx.fillStyle = '#0d9488';
        ctx.beginPath();
        ctx.arc(cx, cy, 12, 0, Math.PI * 2);
        ctx.fill();

        // Natural center jute rosette
        ctx.fillStyle = '#b45309';
        ctx.beginPath();
        ctx.arc(cx, cy, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fef3c7';
        ctx.beginPath();
        ctx.arc(cx, cy, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    },

    // 19. Round Marble Accent Table (16x16 px)
    {
      name: 'round_accent_table',
      w: 16, h: 16,
      draw: (ctx, w, h) => {
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(8, 13, 5, 2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Slim tripod brass legs
        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(8, 7); ctx.lineTo(4, 14);
        ctx.moveTo(8, 7); ctx.lineTo(12, 14);
        ctx.moveTo(8, 7); ctx.lineTo(8, 14);
        ctx.stroke();

        // White Calacatta Marble top
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.ellipse(8, 6, 6, 3.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 0.8;
        ctx.stroke();

        // Marble gray veins
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(5, 6); ctx.lineTo(11, 6.5);
        ctx.stroke();

        // Glass bud vase with red rose
        ctx.fillStyle = 'rgba(56, 189, 248, 0.7)';
        ctx.fillRect(7, 4, 2, 3);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(7, 2, 2, 2);
      }
    }
  ];

  for (const s of spriteDefs) {
    const pngBuffer = await page.evaluate(({ w, h, drawFnStr }) => {
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = false;

      const fn = new Function('ctx', 'w', 'h', drawFnStr);
      fn(ctx, w, h);

      return canvas.toDataURL('image/png').split(',')[1];
    }, { w: s.w, h: s.h, drawFnStr: s.draw.toString().replace(/^[^{]*{\s*/, '').replace(/\s*}[^}]*$/, '') });

    const filePath = path.join(outDir, s.name + '.png');
    fs.writeFileSync(filePath, Buffer.from(pngBuffer, 'base64'));
    console.log(`Generated sprite: ${s.name}.png (${s.w}x${s.h})`);
  }

  await browser.close();
  console.log('All 19 Central Lounge sprites successfully generated!');
})();
