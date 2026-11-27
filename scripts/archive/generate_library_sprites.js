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
    // 1. Grand Persian Velvet Carpet (384x192 px = 12x6 tiles in 32px grid)
    {
      name: 'library_grand_persian_carpet_12x6',
      w: 384, h: 192,
      draw: (ctx, w, h) => {
        // Drop shadow
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.fillRect(4, 6, w - 8, h - 8);

        // Deep Bordeaux Wine Velvet Base
        ctx.fillStyle = '#4a0e17';
        ctx.fillRect(6, 6, w - 12, h - 12);

        // Intricate Gold Filigree Outer Border
        ctx.strokeStyle = '#d4af37';
        ctx.lineWidth = 2.5;
        ctx.strokeRect(10, 10, w - 20, h - 20);

        // Secondary Navy Blue Inset Border
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(14, 14, w - 28, 6);
        ctx.fillRect(14, h - 20, w - 28, 6);
        ctx.fillRect(14, 14, 6, h - 28);
        ctx.fillRect(w - 20, 14, 6, h - 28);

        // Golden Floral Arabesque Motifs along border
        ctx.fillStyle = '#fbbf24';
        for (let x = 24; x < w - 24; x += 16) {
          ctx.beginPath();
          ctx.arc(x, 17, 2, 0, Math.PI * 2);
          ctx.arc(x, h - 17, 2, 0, Math.PI * 2);
          ctx.fill();
        }
        for (let y = 24; y < h - 24; y += 16) {
          ctx.beginPath();
          ctx.arc(17, y, 2, 0, Math.PI * 2);
          ctx.arc(w - 17, y, 2, 0, Math.PI * 2);
          ctx.fill();
        }

        // Inner Field: Ornate Royal Medallions
        const cx = w / 2;
        const cy = h / 2;

        // Center Grand Medallion
        ctx.fillStyle = '#1e1b4b'; // Royal Midnight Blue
        ctx.beginPath();
        ctx.ellipse(cx, cy, 54, 38, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = '#991b1b'; // Crimson Core
        ctx.beginPath();
        ctx.ellipse(cx, cy, 32, 22, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fde68a';
        ctx.lineWidth = 1;
        ctx.stroke();

        // 8-Pointed Gold Star in Center
        ctx.fillStyle = '#fbbf24';
        for (let a = 0; a < 8; a++) {
          const rad = (a * Math.PI) / 4;
          ctx.beginPath();
          ctx.arc(cx + Math.cos(rad) * 12, cy + Math.sin(rad) * 8, 2, 0, Math.PI * 2);
          ctx.fill();
        }

        // Flanking Side Medallions (Left & Right)
        const sideXs = [cx - 100, cx + 100];
        sideXs.forEach(sx => {
          ctx.fillStyle = '#1e1b4b';
          ctx.beginPath();
          ctx.ellipse(sx, cy, 30, 22, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 1.2;
          ctx.stroke();

          ctx.fillStyle = '#fbbf24';
          ctx.beginPath();
          ctx.arc(sx, cy, 4, 0, Math.PI * 2);
          ctx.fill();
        });

        // Corner Spandrel Ornaments
        const corners = [
          [24, 24], [w - 24, 24], [24, h - 24], [w - 24, h - 24]
        ];
        ctx.fillStyle = '#d4af37';
        corners.forEach(([x, y]) => {
          ctx.beginPath();
          ctx.arc(x, y, 6, 0, Math.PI * 2);
          ctx.fill();
        });

        // Delicate Fringe on East and West ends
        ctx.fillStyle = '#fef3c7';
        for (let y = 8; y < h - 8; y += 3) {
          ctx.fillRect(4, y, 2.5, 1.5);
          ctx.fillRect(w - 6.5, y, 2.5, 1.5);
        }
      }
    },

    // 2. Grand Long Reading Table (256x64 px = 8x2 tiles in 32px grid)
    {
      name: 'library_grand_reading_table_8x2',
      w: 256, h: 64,
      draw: (ctx, w, h) => {
        // Drop shadow
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.fillRect(10, 16, w - 20, h - 20);

        // Heavy Fluted Oak Turned Legs (6 Pedestal Legs)
        const legXs = [22, 70, 128, 186, 234];
        legXs.forEach(lx => {
          ctx.fillStyle = '#27170e';
          ctx.fillRect(lx - 4, 30, 8, 28);
          ctx.fillStyle = '#4a2c1b';
          ctx.fillRect(lx - 3, 30, 6, 26);
          // Turned ring moldings
          ctx.fillStyle = '#5c3821';
          ctx.fillRect(lx - 5, 34, 10, 3);
          ctx.fillRect(lx - 5, 48, 10, 3);
          // Brass Foot Casters
          ctx.fillStyle = '#d97706';
          ctx.fillRect(lx - 4, 56, 8, 3);
        });

        // Connecting Walnut Under-Stretcher Rail
        ctx.fillStyle = '#27170e';
        ctx.fillRect(20, 50, w - 40, 4);

        // Massive Solid English Oak Tabletop
        ctx.fillStyle = '#3f2b1d';
        ctx.fillRect(12, 14, w - 24, 28);
        ctx.fillStyle = '#5c3821';
        ctx.fillRect(12, 14, w - 24, 2); // Highlight bevel
        ctx.fillStyle = '#23140b';
        ctx.fillRect(12, 40, w - 24, 3); // Underside shadow

        // Classical Inlaid Leather Writing Pads (4 segments)
        const padW = 46;
        for (let i = 0; i < 4; i++) {
          const px = 22 + i * 56;
          // North pad
          ctx.fillStyle = '#1c2826'; // Deep British Racing Green Tooled Leather
          ctx.fillRect(px, 17, padW, 10);
          ctx.strokeStyle = '#d4af37'; // Gold leaf embossed border
          ctx.lineWidth = 0.8;
          ctx.strokeRect(px + 1, 18, padW - 2, 8);

          // South pad
          ctx.fillStyle = '#1c2826';
          ctx.fillRect(px, 29, padW, 10);
          ctx.strokeStyle = '#d4af37';
          ctx.lineWidth = 0.8;
          ctx.strokeRect(px + 1, 30, padW - 2, 8);
        }

        // Center Brass Partition Ridge / Cable Conduit
        ctx.fillStyle = '#b45309';
        ctx.fillRect(18, 27, w - 36, 2);
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(18, 27.5, w - 36, 1);
      }
    },

    // 3. Banker's Emerald Lamp Row (256x32 px = 8x1 tiles)
    {
      name: 'library_banker_emerald_lamps_row',
      w: 256, h: 32,
      draw: (ctx, w, h) => {
        // 4 Classical Banker's Lamps with Emerald Green Cased Glass Shades
        const lampXs = [45, 101, 157, 213];

        lampXs.forEach(lx => {
          // Warm green ambient glow pool
          const glow = ctx.createRadialGradient(lx, 14, 2, lx, 14, 18);
          glow.addColorStop(0, 'rgba(74, 222, 128, 0.45)');
          glow.addColorStop(0.5, 'rgba(254, 240, 138, 0.25)');
          glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(lx, 14, 18, 0, Math.PI * 2);
          ctx.fill();

          // Heavy Round Stepped Brass Base
          ctx.fillStyle = '#b45309';
          ctx.beginPath();
          ctx.ellipse(lx, 22, 5, 2, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#f59e0b';
          ctx.fillRect(lx - 3, 21, 6, 1);

          // Curved Brass Arm
          ctx.strokeStyle = '#d97706';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(lx, 21);
          ctx.lineTo(lx, 14);
          ctx.stroke();

          // Horizontal Emerald Green Glass Shade
          ctx.fillStyle = '#065f46'; // Dark Emerald
          ctx.beginPath();
          ctx.roundRect(lx - 8, 9, 16, 5, 2);
          ctx.fill();
          ctx.fillStyle = '#10b981'; // Green Highlight
          ctx.fillRect(lx - 7, 10, 14, 1.5);
          ctx.fillStyle = '#34d399'; // Inner bulb glow
          ctx.fillRect(lx - 5, 12.5, 10, 1.5);

          // Hanging Beaded Brass Pull Chain
          ctx.strokeStyle = '#fbbf24';
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(lx + 4, 14);
          ctx.lineTo(lx + 4, 19);
          ctx.stroke();
          ctx.fillStyle = '#d97706';
          ctx.beginPath();
          ctx.arc(lx + 4, 19.5, 0.8, 0, Math.PI * 2);
          ctx.fill();
        });
      }
    },

    // 4. Library Leather Study Chair Front (32x32 px)
    {
      name: 'library_leather_study_chair_front',
      w: 32, h: 32,
      draw: (ctx, w, h) => {
        // Drop shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(16, 26, 8, 3.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Carved Dark Oak Legs
        ctx.fillStyle = '#27170e';
        ctx.fillRect(9, 21, 2.5, 7);
        ctx.fillRect(20.5, 21, 2.5, 7);

        // Cognac Leather Seat Cushion
        ctx.fillStyle = '#78350f';
        ctx.beginPath();
        ctx.roundRect(7, 14, 18, 8, 2);
        ctx.fill();
        ctx.fillStyle = '#9a3412';
        ctx.fillRect(8, 15, 16, 6);
        ctx.fillStyle = '#b45309';
        ctx.fillRect(9, 16, 14, 2); // Highlight

        // Brass Nailhead Trim
        ctx.fillStyle = '#f59e0b';
        for (let bx = 8; bx <= 24; bx += 3) {
          ctx.fillRect(bx, 21, 1, 1);
        }

        // Tufted Backrest (viewed facing front/down)
        ctx.fillStyle = '#451a03';
        ctx.beginPath();
        ctx.roundRect(7, 4, 18, 11, 3);
        ctx.fill();
        ctx.fillStyle = '#78350f';
        ctx.fillRect(9, 6, 14, 8);
        // Diamond tufting buttons
        ctx.fillStyle = '#27170e';
        ctx.fillRect(12, 8, 1.5, 1.5);
        ctx.fillRect(18, 8, 1.5, 1.5);
        ctx.fillRect(15, 11, 1.5, 1.5);

        // Curved Wooden Arms
        ctx.fillStyle = '#5c3821';
        ctx.fillRect(5, 10, 3, 8);
        ctx.fillRect(24, 10, 3, 8);
      }
    },

    // 5. Library Leather Study Chair Back (32x32 px)
    {
      name: 'library_leather_study_chair_back',
      w: 32, h: 32,
      draw: (ctx, w, h) => {
        // Drop shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(16, 26, 8, 3.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Carved Dark Oak Legs
        ctx.fillStyle = '#27170e';
        ctx.fillRect(9, 21, 2.5, 7);
        ctx.fillRect(20.5, 21, 2.5, 7);

        // Cognac Leather Backrest (viewed facing north/table)
        ctx.fillStyle = '#27170e';
        ctx.beginPath();
        ctx.roundRect(7, 5, 18, 18, 3);
        ctx.fill();
        ctx.fillStyle = '#78350f';
        ctx.beginPath();
        ctx.roundRect(8, 6, 16, 16, 2);
        ctx.fill();
        ctx.fillStyle = '#9a3412';
        ctx.fillRect(10, 8, 12, 12);

        // Brass Nailhead Trim on Back Edge
        ctx.fillStyle = '#f59e0b';
        for (let by = 7; by <= 21; by += 3.5) {
          ctx.fillRect(8, by, 1, 1);
          ctx.fillRect(23, by, 1, 1);
        }
        for (let bx = 9; bx <= 22; bx += 3) {
          ctx.fillRect(bx, 6, 1, 1);
        }
      }
    },

    // 6. Tabletop Study Set (256x32 px = 8x1 tiles)
    {
      name: 'library_tabletop_study_set',
      w: 256, h: 32,
      draw: (ctx, w, h) => {
        // 4 study stations on table
        // Station 1 (x ~ 36): Open Heavy Tome with Ribbon
        ctx.fillStyle = '#fef3c7'; // Cream parchment pages
        ctx.beginPath();
        ctx.roundRect(28, 10, 16, 12, 1);
        ctx.fill();
        ctx.fillStyle = '#78350f'; // Leather cover
        ctx.fillRect(27, 10, 1, 12);
        ctx.fillRect(44, 10, 1, 12);
        // Text lines
        ctx.fillStyle = '#78716c';
        ctx.fillRect(29, 12, 6, 1); ctx.fillRect(29, 14, 6, 1); ctx.fillRect(29, 16, 5, 1);
        ctx.fillRect(37, 12, 6, 1); ctx.fillRect(37, 14, 6, 1); ctx.fillRect(37, 16, 5, 1);
        // Red silk ribbon
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(35.5, 9, 1, 14);

        // Station 2 (x ~ 92): Gold Wire-Rim Reading Glasses & Leather Notebook
        ctx.fillStyle = '#0f172a'; // Black notebook
        ctx.fillRect(84, 11, 14, 10);
        ctx.fillStyle = '#fbbf24'; // Gold ribbon
        ctx.fillRect(88, 11, 1.5, 10);
        // Glasses
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.arc(102, 15, 2.5, 0, Math.PI * 2);
        ctx.arc(108, 15, 2.5, 0, Math.PI * 2);
        ctx.moveTo(104.5, 15); ctx.lineTo(105.5, 15);
        ctx.stroke();

        // Station 3 (x ~ 148): Slanted Wooden Book Rest with Lexicon
        ctx.fillStyle = '#5c3821';
        ctx.fillRect(140, 9, 18, 14);
        ctx.fillStyle = '#78462a';
        ctx.fillRect(141, 10, 16, 12);
        ctx.fillStyle = '#fef3c7'; // Book on rest
        ctx.fillRect(143, 11, 12, 10);
        ctx.fillStyle = '#b91c1c'; // Red bookmark
        ctx.fillRect(148, 10, 1.5, 12);

        // Station 4 (x ~ 204): Cut Crystal Glass Decanter & Porcelain Tea Cup
        ctx.fillStyle = 'rgba(224, 242, 254, 0.85)'; // Crystal Carafe
        ctx.beginPath();
        ctx.roundRect(198, 8, 7, 13, 2);
        ctx.fill();
        ctx.fillStyle = '#38bdf8'; // Water level
        ctx.fillRect(199, 12, 5, 8);
        ctx.fillStyle = '#f8fafc'; // Stopper
        ctx.fillRect(200, 6, 3, 2);

        // White Bone China Teacup on Saucer
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(211, 17, 4, 1.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(209, 12, 4, 4);
        ctx.fillStyle = '#b45309'; // Earl Grey tea
        ctx.fillRect(210, 13, 2, 2);
      }
    },

    // 7. Massive Wall Bookcase (128x96 px = 4x3 tiles in 32px grid)
    {
      name: 'library_massive_wall_bookcase_4x3',
      w: 128, h: 96,
      draw: (ctx, w, h) => {
        // Drop shadow
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.fillRect(4, 6, w - 8, h - 6);

        // Solid English Walnut Frame
        ctx.fillStyle = '#29180c';
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#3f2817';
        ctx.fillRect(3, 3, w - 6, h - 6);

        // Classical Crown Cornice Molding at Top
        ctx.fillStyle = '#5c3821';
        ctx.fillRect(0, 0, w, 5);
        ctx.fillStyle = '#1c0f07';
        ctx.fillRect(0, 5, w, 2);

        // 4 Horizontal Shelves
        const sY = [24, 46, 68, 90];
        sY.forEach(y => {
          ctx.fillStyle = '#1c0f07';
          ctx.fillRect(3, y, w - 6, 3);
          ctx.fillStyle = '#5c3821';
          ctx.fillRect(3, y, w - 6, 1);
        });

        // 3 Vertical Mullion Dividers
        const divX = [34, 64, 94];
        divX.forEach(x => {
          ctx.fillStyle = '#29180c';
          ctx.fillRect(x, 6, 3, h - 9);
        });

        // Books Palette (Crimson, Navy, Forest Green, Gold, Ochre, Plum)
        const bookColors = ['#991b1b', '#1e3a8a', '#14532d', '#78350f', '#581c87', '#b45309', '#0f766e', '#1c1917'];

        // Fill each compartment with dense rows of books
        const cols = [
          { minX: 5, maxX: 33 },
          { minX: 38, maxX: 63 },
          { minX: 68, maxX: 93 },
          { minX: 98, maxX: 124 }
        ];

        for (let row = 0; row < 4; row++) {
          const shelfBottom = sY[row];
          cols.forEach(c => {
            let curX = c.minX;
            while (curX < c.maxX - 3) {
              const bWidth = 2.5 + (Math.sin(curX * 3 + row) > 0 ? 1.5 : 0.5);
              const bHeight = 13 + (Math.cos(curX * 5 + row) * 3);
              const colorIdx = Math.abs(Math.round(curX * 7 + row * 11)) % bookColors.length;

              ctx.fillStyle = bookColors[colorIdx];
              ctx.fillRect(curX, shelfBottom - bHeight, bWidth, bHeight);

              // Gold embossed spine bands
              if (bWidth >= 3) {
                ctx.fillStyle = '#f59e0b';
                ctx.fillRect(curX + 0.5, shelfBottom - bHeight + 2, bWidth - 1, 0.8);
                ctx.fillRect(curX + 0.5, shelfBottom - 3, bWidth - 1, 0.8);
              }
              curX += bWidth + 0.5;
            }
          });
        }

        // Brass Library Shelf Label Holders
        ctx.fillStyle = '#d4af37';
        sY.forEach(y => {
          cols.forEach(c => {
            ctx.fillRect((c.minX + c.maxX) / 2 - 4, y + 0.5, 8, 2);
          });
        });
      }
    },

    // 8. Rolling Library Ladder with Bronze Rail (32x96 px = 1x3 tiles)
    {
      name: 'library_rolling_ladder_bronze_rail',
      w: 32, h: 96,
      draw: (ctx, w, h) => {
        // Horizontal Bronze Rail at top
        ctx.fillStyle = '#d97706';
        ctx.fillRect(0, 10, w, 2.5);
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(0, 10, w, 0.8);

        // Upper Brass Hook Rollers with Wheels
        ctx.fillStyle = '#b45309';
        ctx.beginPath();
        ctx.arc(10, 10, 2.5, 0, Math.PI * 2);
        ctx.arc(22, 10, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Slanted Wooden Ladder Stringers (Oak)
        ctx.strokeStyle = '#5c3821';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(10, 11); ctx.lineTo(6, 90);
        ctx.moveTo(22, 11); ctx.lineTo(18, 90);
        ctx.stroke();

        // Ladder Rungs (Steps)
        ctx.strokeStyle = '#78462a';
        ctx.lineWidth = 1.8;
        for (let y = 18; y < 88; y += 7) {
          const t = (y - 11) / 79;
          const lx = 10 + (6 - 10) * t;
          const rx = 22 + (18 - 22) * t;
          ctx.beginPath();
          ctx.moveTo(lx, y); ctx.lineTo(rx, y);
          ctx.stroke();
        }

        // Bottom Brass Caster Wheels
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(6, 92, 2.5, 0, Math.PI * 2);
        ctx.arc(18, 92, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    },

    // 9. Antique Globe & Westminster Grandfather Clock (64x64 px = 2x2 tiles)
    {
      name: 'library_antique_globe_grandfather_clock',
      w: 64, h: 64,
      draw: (ctx, w, h) => {
        // Drop shadow
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.fillRect(6, 12, w - 12, h - 14);

        // --- ITEM A: GRANDFATHER CLOCK (Left, w = 24) ---
        // Dark Mahogany Case
        ctx.fillStyle = '#29180c';
        ctx.fillRect(8, 4, 22, 56);
        ctx.fillStyle = '#451a03';
        ctx.fillRect(10, 6, 18, 52);

        // Crown Pediment Arch
        ctx.fillStyle = '#5c3821';
        ctx.beginPath();
        ctx.arc(19, 6, 7, Math.PI, 0);
        ctx.fill();
        ctx.fillStyle = '#f59e0b'; // Brass finial
        ctx.fillRect(18.5, 1, 1.5, 3);

        // Clock Face (Porcelain & Gold Numerals)
        ctx.fillStyle = '#fef3c7';
        ctx.beginPath();
        ctx.arc(19, 16, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#d4af37';
        ctx.lineWidth = 1;
        ctx.stroke();
        // Hands
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(19, 16); ctx.lineTo(19, 12);
        ctx.moveTo(19, 16); ctx.lineTo(22, 16);
        ctx.stroke();

        // Glass Pendulum Waist Door
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(12, 25, 14, 26);
        // Brass Pendulum & Weights
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(19, 26); ctx.lineTo(19, 44);
        ctx.stroke();
        // Pendulum bob
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(19, 44, 3.5, 0, Math.PI * 2);
        ctx.fill();
        // Two hanging cylinder weights
        ctx.fillStyle = '#d97706';
        ctx.fillRect(14, 30, 2.5, 9);
        ctx.fillRect(21.5, 30, 2.5, 9);

        // --- ITEM B: ANTIQUE REVOLVING GLOBE (Right, w = 32) ---
        // Carved Mahogany Tripod Stand
        ctx.fillStyle = '#29180c';
        ctx.fillRect(44, 46, 4, 12); // Center post
        // Tripod legs
        ctx.strokeStyle = '#5c3821';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(46, 54); ctx.lineTo(36, 60);
        ctx.moveTo(46, 54); ctx.lineTo(56, 60);
        ctx.stroke();
        // Brass Horizon Ring
        ctx.fillStyle = '#b45309';
        ctx.beginPath();
        ctx.ellipse(46, 38, 14, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fbbf24';
        ctx.stroke();

        // Brass Meridian Half-Ring
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(46, 36, 11, 0.2 * Math.PI, 1.2 * Math.PI);
        ctx.stroke();

        // Terrestrial Sphere (Parchment & Ocean Teal)
        ctx.fillStyle = '#0e7490'; // Ocean Blue
        ctx.beginPath();
        ctx.arc(46, 36, 9.5, 0, Math.PI * 2);
        ctx.fill();

        // Continents (Old Gold Parchment)
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(42, 31, 6, 4);
        ctx.fillRect(40, 36, 8, 4);
        ctx.fillRect(47, 33, 5, 6);
        ctx.fillRect(44, 41, 5, 3);
      }
    },

    // 10. Round Discussion Rug (128x128 px = 4x4 tiles in 32px grid)
    {
      name: 'library_round_discussion_rug_4x4',
      w: 128, h: 128,
      draw: (ctx, w, h) => {
        const cx = w / 2;
        const cy = h / 2;

        // Drop shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.arc(cx, cy + 3, 58, 0, Math.PI * 2);
        ctx.fill();

        // Olive & Sage Velvet Circular Rug
        ctx.fillStyle = '#283618';
        ctx.beginPath();
        ctx.arc(cx, cy, 58, 0, Math.PI * 2);
        ctx.fill();

        // Concentric Gold Filigree Rings
        ctx.strokeStyle = '#dda15e';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(cx, cy, 52, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#606c38';
        ctx.beginPath();
        ctx.arc(cx, cy, 46, 0, Math.PI * 2);
        ctx.fill();

        // Floral petal ring
        ctx.fillStyle = '#fefae0';
        for (let a = 0; a < 12; a++) {
          const rad = (a * Math.PI) / 6;
          ctx.beginPath();
          ctx.arc(cx + Math.cos(rad) * 36, cy + Math.sin(rad) * 36, 4, 0, Math.PI * 2);
          ctx.fill();
        }

        // Center Rosette
        ctx.fillStyle = '#283618';
        ctx.beginPath();
        ctx.arc(cx, cy, 22, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#dda15e';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        ctx.fillStyle = '#bc6c25';
        ctx.beginPath();
        ctx.arc(cx, cy, 8, 0, Math.PI * 2);
        ctx.fill();
      }
    },

    // 11. Round Discussion Table Set (64x64 px = 2x2 tiles in 32px grid)
    {
      name: 'library_round_discussion_table_set_2x2',
      w: 64, h: 64,
      draw: (ctx, w, h) => {
        const cx = 32;
        const cy = 32;

        // Drop shadow
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.beginPath();
        ctx.arc(cx, cy + 3, 24, 0, Math.PI * 2);
        ctx.fill();

        // 4 Surrounding Upholstered Armchairs (North, South, West, East)
        // North Armchair (Teal)
        ctx.fillStyle = '#0f766e';
        ctx.beginPath();
        ctx.roundRect(cx - 7, cy - 24, 14, 10, 3);
        ctx.fill();

        // South Armchair (Mustard)
        ctx.fillStyle = '#d97706';
        ctx.beginPath();
        ctx.roundRect(cx - 7, cy + 14, 14, 10, 3);
        ctx.fill();

        // West Armchair (Mustard)
        ctx.fillStyle = '#d97706';
        ctx.beginPath();
        ctx.roundRect(cx - 24, cy - 7, 10, 14, 3);
        ctx.fill();

        // East Armchair (Teal)
        ctx.fillStyle = '#0f766e';
        ctx.beginPath();
        ctx.roundRect(cx + 14, cy - 7, 10, 14, 3);
        ctx.fill();

        // Central Round Carrara White Marble Table with Walnut Rim
        ctx.fillStyle = '#5c3821';
        ctx.beginPath();
        ctx.arc(cx, cy, 17, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#f8fafc'; // White Marble
        ctx.beginPath();
        ctx.arc(cx, cy, 15, 0, Math.PI * 2);
        ctx.fill();

        // Delicate Marble Veining
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.moveTo(cx - 10, cy - 6); ctx.lineTo(cx, cy + 2); ctx.lineTo(cx + 8, cy - 5);
        ctx.stroke();

        // Center Table Items: Open Research Binder & Coffee Cups
        ctx.fillStyle = '#2563eb'; // Blue binder
        ctx.fillRect(cx - 5, cy - 5, 10, 7);
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(cx - 4, cy - 4, 8, 5);

        // 2 Coffee cups
        ctx.fillStyle = '#b45309';
        ctx.beginPath();
        ctx.arc(cx - 6, cy + 5, 2, 0, Math.PI * 2);
        ctx.arc(cx + 6, cy + 5, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    },

    // 12. Mobile Glass Research Board (64x64 px = 2x2 tiles in 32px grid)
    {
      name: 'library_mobile_glass_research_board',
      w: 64, h: 64,
      draw: (ctx, w, h) => {
        // Drop shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(10, 14, w - 20, h - 20);

        // Black Steel A-Frame Mobile Stand with Wheels
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(14, 56); ctx.lineTo(20, 20); ctx.lineTo(26, 56);
        ctx.moveTo(w - 26, 56); ctx.lineTo(w - 20, 20); ctx.lineTo(w - 14, 56);
        ctx.stroke();
        // Crossbar
        ctx.fillRect(18, 50, w - 36, 2);
        // 4 Caster Wheels
        ctx.fillStyle = '#334155';
        ctx.fillRect(12, 56, 4, 3); ctx.fillRect(24, 56, 4, 3);
        ctx.fillRect(w - 28, 56, 4, 3); ctx.fillRect(w - 16, 56, 4, 3);

        // Frosted Glass Whiteboard
        ctx.fillStyle = 'rgba(248, 250, 252, 0.9)';
        ctx.beginPath();
        ctx.roundRect(14, 6, 36, 42, 3);
        ctx.fill();
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1;
        ctx.strokeRect(14, 6, 36, 42);

        // Research Discussion Diagrams & Hypotheses
        ctx.fillStyle = '#2563eb';
        ctx.font = 'bold 3.5px sans-serif';
        ctx.fillText('RESEARCH SYMPOSIUM', 16, 12);

        // Mindmap nodes
        ctx.strokeStyle = '#8b5cf6';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(24, 22); ctx.lineTo(32, 17);
        ctx.moveTo(24, 22); ctx.lineTo(40, 24);
        ctx.moveTo(24, 22); ctx.lineTo(30, 32);
        ctx.stroke();

        ctx.fillStyle = '#0d9488'; ctx.beginPath(); ctx.arc(24, 22, 3, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#f59e0b'; ctx.beginPath(); ctx.arc(32, 17, 2.5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#3b82f6'; ctx.beginPath(); ctx.arc(40, 24, 2.5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#ec4899'; ctx.beginPath(); ctx.arc(30, 32, 2.5, 0, Math.PI * 2); ctx.fill();

        // Bottom Marker Tray & Pens
        ctx.fillStyle = '#64748b';
        ctx.fillRect(18, 46, 28, 2);
        ctx.fillStyle = '#ef4444'; ctx.fillRect(20, 45, 4, 1);
        ctx.fillStyle = '#3b82f6'; ctx.fillRect(26, 45, 4, 1);
        ctx.fillStyle = '#10b981'; ctx.fillRect(32, 45, 4, 1);
      }
    },

    // 13. Wingback Armchair & Ottoman (64x64 px = 2x2 tiles in 32px grid)
    {
      name: 'library_wingback_armchair_ottoman',
      w: 64, h: 64,
      draw: (ctx, w, h) => {
        // Drop shadow
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.beginPath();
        ctx.ellipse(32, 52, 22, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Carved Dark Wood Cabriole Legs
        ctx.fillStyle = '#29180c';
        ctx.fillRect(18, 36, 3, 6);
        ctx.fillRect(43, 36, 3, 6);
        ctx.fillRect(20, 56, 3, 5);
        ctx.fillRect(41, 56, 3, 5);

        // --- PART A: WINGBACK CHAIR (Top) ---
        // Royal Navy Velvet Shell
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.roundRect(14, 6, 36, 32, 6);
        ctx.fill();

        // Flaring "Wings" on Left and Right
        ctx.fillStyle = '#1e3a8a';
        ctx.beginPath();
        ctx.moveTo(14, 8); ctx.lineTo(8, 16); ctx.lineTo(14, 24); ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(50, 8); ctx.lineTo(56, 16); ctx.lineTo(50, 24); ctx.closePath();
        ctx.fill();

        // Deep Navy Tufted Back Cushion
        ctx.fillStyle = '#1d4ed8';
        ctx.beginPath();
        ctx.roundRect(16, 8, 32, 22, 4);
        ctx.fill();
        ctx.fillStyle = '#2563eb';
        ctx.fillRect(18, 10, 28, 3); // Top highlight
        // Diamond button tufting
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(24, 14, 1.5, 1.5); ctx.fillRect(38, 14, 1.5, 1.5);
        ctx.fillRect(31, 19, 1.5, 1.5); ctx.fillRect(24, 24, 1.5, 1.5); ctx.fillRect(38, 24, 1.5, 1.5);

        // Scroll Arms
        ctx.fillStyle = '#1e3a8a';
        ctx.beginPath();
        ctx.roundRect(10, 20, 7, 14, 3); ctx.fill();
        ctx.beginPath();
        ctx.roundRect(47, 20, 7, 14, 3); ctx.fill();

        // Thick Padded Seat Cushion
        ctx.fillStyle = '#1e40af';
        ctx.beginPath();
        ctx.roundRect(16, 26, 32, 12, 3);
        ctx.fill();

        // --- PART B: MATCHING FOOTSTOOL OTTOMAN (Bottom) ---
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.roundRect(20, 44, 24, 13, 3);
        ctx.fill();
        ctx.fillStyle = '#1d4ed8';
        ctx.beginPath();
        ctx.roundRect(21, 44, 22, 11, 2);
        ctx.fill();
        ctx.fillStyle = '#2563eb';
        ctx.fillRect(23, 46, 18, 2);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(27, 49, 1.5, 1.5); ctx.fillRect(35, 49, 1.5, 1.5);
      }
    },

    // 14. Vintage Brass Floor Lamp (32x64 px = 1x2 tiles)
    {
      name: 'library_vintage_brass_floor_lamp',
      w: 32, h: 64,
      draw: (ctx, w, h) => {
        // Drop shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(16, 58, 8, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Ornate Stepped Brass Base
        ctx.fillStyle = '#b45309';
        ctx.beginPath();
        ctx.ellipse(16, 57, 7, 2.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(14, 55, 4, 2);

        // Fluted Brass Stem Pole
        ctx.fillStyle = '#d97706';
        ctx.fillRect(15, 18, 2, 38);
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(15.5, 18, 1, 38);

        // Mid-Stem Small Round Mahogany Drinks Tray
        ctx.fillStyle = '#5c3821';
        ctx.beginPath();
        ctx.ellipse(16, 38, 7, 2.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Pleated Fabric Conical Lampshade (Warm Ivory/Gold)
        ctx.fillStyle = '#fef3c7';
        ctx.beginPath();
        ctx.moveTo(11, 10); ctx.lineTo(21, 10); ctx.lineTo(25, 20); ctx.lineTo(7, 20);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Shade Pleats
        ctx.fillStyle = '#fde68a';
        for (let x = 9; x <= 23; x += 2.5) {
          ctx.fillRect(x, 11, 1, 8);
        }

        // Warm 2700K Ambient Downward Glow
        const glow = ctx.createLinearGradient(16, 21, 16, 55);
        glow.addColorStop(0, 'rgba(254, 240, 138, 0.45)');
        glow.addColorStop(1, 'rgba(254, 240, 138, 0.0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.moveTo(7, 21); ctx.lineTo(25, 21); ctx.lineTo(31, 56); ctx.lineTo(1, 56);
        ctx.closePath();
        ctx.fill();
      }
    },

    // 15. Periodical Magazine & Newspaper Rack (32x64 px = 1x2 tiles)
    {
      name: 'library_periodical_magazine_rack',
      w: 32, h: 64,
      draw: (ctx, w, h) => {
        // Drop shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(2, 6, w - 4, h - 6);

        // Dark Walnut Stand Frame
        ctx.fillStyle = '#29180c';
        ctx.fillRect(2, 8, 28, 52);
        ctx.fillStyle = '#451a03';
        ctx.fillRect(4, 10, 24, 48);

        // 3 Slanted Magazine Display Racks (Tiered)
        const tiers = [12, 26, 40];
        const mags = [
          { title: 'THE ECONOMIST', c: '#dc2626' },
          { title: 'NATURE JOURNAL', c: '#0f766e' },
          { title: 'MIT TECH REVIEW', c: '#2563eb' }
        ];

        tiers.forEach((ty, idx) => {
          // Brass retaining lip
          ctx.fillStyle = '#d97706';
          ctx.fillRect(4, ty + 12, 24, 2);

          // Magazine Cover on display
          ctx.fillStyle = mags[idx].c;
          ctx.fillRect(6, ty, 20, 12);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(8, ty + 2, 16, 2);
          ctx.fillStyle = '#fde68a';
          ctx.fillRect(8, ty + 5, 8, 5);
        });

        // Bottom Wooden Newspaper Rails with Folded Broadsheets
        ctx.fillStyle = '#f8fafc'; // Folded Newspapers
        ctx.fillRect(6, 54, 20, 3);
        ctx.fillRect(8, 56, 16, 2);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(8, 54.5, 10, 1);
      }
    },

    // 16. Teapoy Side Table with Steaming Kettle (32x32 px)
    {
      name: 'library_teapoy_side_table',
      w: 32, h: 32,
      draw: (ctx, w, h) => {
        // Drop shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(16, 25, 9, 3.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Carved Dark Mahogany Tripod Legs
        ctx.strokeStyle = '#29180c';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(16, 17); ctx.lineTo(10, 25);
        ctx.moveTo(16, 17); ctx.lineTo(22, 25);
        ctx.moveTo(16, 17); ctx.lineTo(16, 25);
        ctx.stroke();

        // Round Mahogany Tabletop with Pie-Crust Edge
        ctx.fillStyle = '#451a03';
        ctx.beginPath();
        ctx.ellipse(16, 14, 11, 5.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#78350f';
        ctx.beginPath();
        ctx.ellipse(16, 13.5, 10, 4.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Terracotta Yixing Teapot with Spout & Handle
        ctx.fillStyle = '#9a3412';
        ctx.beginPath();
        ctx.arc(14, 9, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(11, 8, 1.5, 2); // Handle
        ctx.fillRect(17, 8, 2, 1.5); // Spout

        // Wisps of Steam
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(18, 7); ctx.quadraticCurveTo(17, 4, 19, 2);
        ctx.stroke();

        // Small Matchbox and Ceramic Teacup
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(20, 11, 3, 2.5);
      }
    },

    // 17. Librarian Service Desk (64x64 px = 2x2 tiles in 32px grid)
    {
      name: 'library_librarian_service_desk_2x2',
      w: 64, h: 64,
      draw: (ctx, w, h) => {
        // Drop shadow
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.fillRect(6, 16, w - 12, h - 18);

        // Mahogany Paneled Reception Counter Desk
        ctx.fillStyle = '#29180c';
        ctx.fillRect(4, 16, w - 8, 42);
        ctx.fillStyle = '#451a03';
        ctx.fillRect(6, 18, w - 12, 38);

        // Recessed Fluted Wood Panels with Carved Academic Crest
        ctx.fillStyle = '#29180c';
        ctx.fillRect(10, 24, 18, 28);
        ctx.fillRect(w - 28, 24, 18, 28);
        // Brass Trim
        ctx.strokeStyle = '#d4af37';
        ctx.lineWidth = 1;
        ctx.strokeRect(10, 24, 18, 28);
        ctx.strokeRect(w - 28, 24, 18, 28);

        // Center Carved Scholar Crest (Open Book with Laurel Leaves)
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(30, 32, 6, 5);
        ctx.beginPath();
        ctx.arc(33, 34, 5, 0, Math.PI * 2);
        ctx.stroke();

        // Thick Bullnose Countertop Edge
        ctx.fillStyle = '#5c3821';
        ctx.fillRect(2, 14, w - 4, 4);

        // --- Surface Items ---
        // 1. Modern OPAC Flat Screen Terminal
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(14, 5, 14, 10);
        ctx.fillStyle = '#0284c7'; // Screen searching catalog
        ctx.fillRect(15, 6, 12, 8);
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(16, 8, 8, 1);
        ctx.fillRect(16, 10, 10, 1);
        ctx.fillStyle = '#64748b'; // Stand
        ctx.fillRect(19, 14, 4, 2);

        // 2. Brass Librarian Service Bell
        ctx.fillStyle = '#d97706';
        ctx.beginPath();
        ctx.arc(36, 13, 3, Math.PI, 0);
        ctx.fill();
        ctx.fillRect(34, 13, 4, 1.5);
        ctx.fillRect(35.5, 9, 1, 1.5);

        // 3. RFID Barcode Handheld Scanner & Cradle
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(44, 9, 4, 6);
        ctx.fillStyle = '#dc2626'; // Red laser lens
        ctx.fillRect(44, 8, 4, 1);
        ctx.fillStyle = '#475569';
        ctx.fillRect(43, 14, 6, 2);

        // 4. Stack of Returned Library Books with Due Date Slips
        ctx.fillStyle = '#991b1b'; ctx.fillRect(52, 12, 8, 3);
        ctx.fillStyle = '#1e3a8a'; ctx.fillRect(51, 9, 9, 3);
        ctx.fillStyle = '#14532d'; ctx.fillRect(52, 6, 8, 3);
        ctx.fillStyle = '#ffffff'; // White slip poking out
        ctx.fillRect(55, 5, 2, 2);
      }
    },

    // 18. UV Book Sterilizer Unit (32x64 px = 1x2 tiles)
    {
      name: 'library_uv_book_sterilizer_unit',
      w: 32, h: 64,
      draw: (ctx, w, h) => {
        // Drop shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(2, 6, w - 4, h - 6);

        // Sleek Hospital-Grade Medical White / Stainless Cabinet
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(4, 10, 24, 50);
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(5, 11, 22, 48);

        // UV-C Chamber Window (Glowing Violet / Ultraviolet)
        ctx.fillStyle = '#1e1b4b';
        ctx.beginPath();
        ctx.roundRect(7, 16, 18, 30, 2);
        ctx.fill();

        // Glowing Purple UV-C Light Rays
        const uvGlow = ctx.createLinearGradient(7, 16, 25, 46);
        uvGlow.addColorStop(0, '#c084fc');
        uvGlow.addColorStop(0.5, '#7c3aed');
        uvGlow.addColorStop(1, '#a855f7');
        ctx.fillStyle = uvGlow;
        ctx.fillRect(8, 17, 16, 28);

        // 2 Books on wire shelf inside undergoing sterilization
        ctx.fillStyle = '#fde68a';
        ctx.fillRect(10, 24, 12, 4);
        ctx.fillStyle = '#93c5fd';
        ctx.fillRect(10, 34, 12, 4);

        // Top Digital Touch Controller
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(8, 12, 16, 3);
        ctx.fillStyle = '#22c55e'; // Green 99.9% STERILE indicator
        ctx.fillRect(10, 13, 2, 1);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(14, 13, 8, 1);

        // Bottom Ventilation Exhaust Louvers
        ctx.fillStyle = '#94a3b8';
        for (let y = 50; y < 58; y += 2.5) {
          ctx.fillRect(8, y, 16, 1);
        }
      }
    },

    // 19. Smart Book Drop Return Bin (32x32 px)
    {
      name: 'library_book_drop_return_bin',
      w: 32, h: 32,
      draw: (ctx, w, h) => {
        // Drop shadow
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.beginPath();
        ctx.ellipse(16, 26, 9, 3.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Oxford Blue Heavy Metal Return Bin Body
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.roundRect(6, 6, 20, 22, 3);
        ctx.fill();
        ctx.fillStyle = '#1e3a8a';
        ctx.fillRect(7, 7, 18, 20);

        // Stainless Steel Drop Slot with Spring-Loaded Flap
        ctx.fillStyle = '#64748b';
        ctx.fillRect(8, 10, 16, 6);
        ctx.fillStyle = '#cbd5e1'; // Flap
        ctx.fillRect(9, 11, 14, 4);

        // Book Drop Label & Down Arrow Icon
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(14, 18, 4, 1);
        ctx.beginPath();
        ctx.moveTo(13, 20); ctx.lineTo(19, 20); ctx.lineTo(16, 23); ctx.closePath();
        ctx.fill();
      }
    },

    // 20. Fiddle Leaf Fig Grand Planter (32x64 px = 1x2 tiles)
    {
      name: 'library_fiddle_leaf_fig_grand_planter',
      w: 32, h: 64,
      draw: (ctx, w, h) => {
        // Drop shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(16, 58, 8, 3.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Dark Charcoal Fluted Terrazzo Planter Pot
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.roundRect(8, 40, 16, 18, 3);
        ctx.fill();
        ctx.fillStyle = '#334155';
        ctx.fillRect(9, 41, 14, 16);
        // Vertical ribs
        ctx.fillStyle = '#475569';
        ctx.fillRect(12, 42, 1, 14); ctx.fillRect(16, 42, 1, 14); ctx.fillRect(20, 42, 1, 14);

        // Rich Soil
        ctx.fillStyle = '#29180c';
        ctx.fillRect(9, 39, 14, 3);

        // Slender Woody Trunk
        ctx.strokeStyle = '#78462a';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(16, 40);
        ctx.lineTo(16, 24);
        ctx.lineTo(13, 16);
        ctx.moveTo(16, 24);
        ctx.lineTo(19, 14);
        ctx.stroke();

        // Large Violin-Shaped Fiddle Leaves (Deep Emerald Green with Gloss)
        const leaves = [
          { x: 10, y: 12, rx: 7, ry: 9, c: '#14532d' },
          { x: 22, y: 10, rx: 7, ry: 10, c: '#15803d' },
          { x: 15, y: 6, rx: 8, ry: 9, c: '#16a34a' },
          { x: 9, y: 22, rx: 6, ry: 8, c: '#15803d' },
          { x: 23, y: 20, rx: 7, ry: 9, c: '#14532d' },
          { x: 16, y: 16, rx: 7.5, ry: 9, c: '#16a34a' }
        ];

        leaves.forEach(l => {
          ctx.fillStyle = l.c;
          ctx.beginPath();
          ctx.ellipse(l.x, l.y, l.rx, l.ry, 0, 0, Math.PI * 2);
          ctx.fill();

          // Leaf pale vein
          ctx.strokeStyle = '#4ade80';
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(l.x, l.y - l.ry + 2);
          ctx.lineTo(l.x, l.y + l.ry - 2);
          ctx.stroke();
        });
      }
    }
  ];

  for (const def of spriteDefs) {
    await page.evaluate(({ name, w, h, drawFnStr }) => {
      let canvas = document.getElementById('genCanvas');
      if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'genCanvas';
        document.body.appendChild(canvas);
      }
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, w, h);

      // Execute drawing function
      const fn = new Function('ctx', 'w', 'h', drawFnStr);
      fn(ctx, w, h);
    }, {
      name: def.name,
      w: def.w,
      h: def.h,
      drawFnStr: `(${def.draw.toString()})(ctx, w, h);`
    });

    const canvasHandle = await page.$('#genCanvas');
    const outPath = path.join(outDir, `${def.name}.png`);
    await canvasHandle.screenshot({ path: outPath, omitBackground: true });
    console.log(`Generated sprite: ${def.name}.png (${def.w}x${def.h})`);
  }

  await browser.close();
  console.log(`All ${spriteDefs.length} Grand Library sprites successfully generated!`);
})();
