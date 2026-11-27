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
    // 1. Arched Wooden Moon Bridge (48x32 px)
    {
      name: 'arched_wooden_bridge',
      w: 48, h: 32,
      draw: (ctx, w, h) => {
        // Drop shadow on water
        ctx.fillStyle = 'rgba(2, 6, 23, 0.45)';
        ctx.beginPath();
        ctx.ellipse(24, 25, 21, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Main arched bridge walkway (Timber planks)
        ctx.fillStyle = '#78350f';
        ctx.beginPath();
        ctx.moveTo(3, 24);
        ctx.quadraticCurveTo(24, 12, 45, 24);
        ctx.lineTo(45, 20);
        ctx.quadraticCurveTo(24, 8, 3, 20);
        ctx.closePath();
        ctx.fill();

        // Individual wood floor planks
        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = 1;
        for (let x = 6; x < 43; x += 3) {
          const t = (x - 3) / 42;
          const topY = 20 - 12 * 4 * t * (1 - t);
          const botY = 24 - 12 * 4 * t * (1 - t);
          ctx.beginPath();
          ctx.moveTo(x, topY);
          ctx.lineTo(x, botY);
          ctx.stroke();
        }

        // Red lacquered bridge railings (Torii red / vermilion)
        ctx.strokeStyle = '#dc2626';
        ctx.lineWidth = 2;
        // Top handrail
        ctx.beginPath();
        ctx.moveTo(3, 15);
        ctx.quadraticCurveTo(24, 3, 45, 15);
        ctx.stroke();

        // Posts with gold finials (Giboshi)
        [4, 14, 24, 34, 44].forEach(x => {
          const t = (x - 3) / 42;
          const archY = 22 - 12 * 4 * t * (1 - t);
          const railY = 15 - 12 * 4 * t * (1 - t);
          ctx.strokeStyle = '#991b1b';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(x, archY);
          ctx.lineTo(x, railY);
          ctx.stroke();
          // Gold finial on post top
          ctx.fillStyle = '#facc15';
          ctx.fillRect(x - 1, railY - 2, 2, 2);
        });
      }
    },

    // 2. Japanese Toro Stone Lantern (16x32 px)
    {
      name: 'japanese_stone_lantern',
      w: 16, h: 32,
      draw: (ctx, w, h) => {
        // Base shadow
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.beginPath();
        ctx.ellipse(8, 30, 6, 2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Hexagonal stone base (Kiso)
        ctx.fillStyle = '#475569';
        ctx.fillRect(3, 26, 10, 4);
        ctx.fillStyle = '#64748b';
        ctx.fillRect(4, 25, 8, 2);

        // Slender round stone pillar (Sao)
        ctx.fillStyle = '#64748b';
        ctx.fillRect(6, 17, 4, 8);
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(6, 17, 1.5, 8); // highlight

        // Middle stone platform (Chudai)
        ctx.fillStyle = '#475569';
        ctx.fillRect(3, 15, 10, 2);
        ctx.fillStyle = '#334155';
        ctx.fillRect(4, 16, 8, 1);

        // Light chamber (Hibukuro) with glowing warm yellow light
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(4, 9, 8, 6);
        // Glowing paper window
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(6, 10, 4, 4);
        // Candle flame
        ctx.fillStyle = '#f97316';
        ctx.fillRect(7, 11, 2, 2);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(7.5, 11.5, 1, 1);
        // Lattice bars
        ctx.fillStyle = '#475569';
        ctx.fillRect(7.5, 9, 1, 6);
        ctx.fillRect(4, 11.5, 8, 1);

        // Sweeping flared pagoda roof (Kasa)
        ctx.fillStyle = '#334155';
        ctx.beginPath();
        ctx.moveTo(1, 9);
        ctx.quadraticCurveTo(8, 5, 15, 9);
        ctx.lineTo(13, 5);
        ctx.quadraticCurveTo(8, 4, 3, 5);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Jewel finial on top (Hoju)
        ctx.fillStyle = '#64748b';
        ctx.beginPath();
        ctx.arc(8, 3, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(7.5, 1.5, 1, 1);
      }
    },

    // 3. Raised Tatami Mat Platform (48x32 px)
    {
      name: 'tatami_mat_platform_3x2',
      w: 48, h: 32,
      draw: (ctx, w, h) => {
        // Cedar wood foundation base (raised border)
        ctx.fillStyle = '#451a03';
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#78350f';
        ctx.fillRect(1, 1, w - 2, h - 2);

        // 3 Tatami Mats side by side
        const matW = 14;
        [2, 17, 32].forEach(mx => {
          // Pale green woven rush straw (Igusa)
          ctx.fillStyle = '#d9f99d';
          ctx.fillRect(mx, 2, matW, h - 4);

          // Fine woven weave lines
          ctx.fillStyle = '#bef264';
          for (let y = 3; y < h - 4; y += 2) {
            ctx.fillRect(mx + 1, y, matW - 2, 1);
          }

          // Traditional black/navy brocade border ribbons (Heri)
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(mx, 2, 2, h - 4);
          ctx.fillRect(mx + matW - 2, 2, 2, h - 4);

          // Subtle gold pattern on heri
          ctx.fillStyle = '#eab308';
          for (let y = 4; y < h - 4; y += 4) {
            ctx.fillRect(mx + 0.5, y, 1, 1);
            ctx.fillRect(mx + matW - 1.5, y, 1, 1);
          }
        });
      }
    },

    // 4. Low Zen Tea Ceremony Table - Chabudai (32x16 px)
    {
      name: 'zen_tea_table_low',
      w: 32, h: 16,
      draw: (ctx, w, h) => {
        // Table shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(3, 4, 26, 11);

        // 4 Low sturdy wooden legs
        ctx.fillStyle = '#271004';
        ctx.fillRect(4, 10, 2, 4);
        ctx.fillRect(26, 10, 2, 4);
        ctx.fillRect(4, 3, 2, 3);
        ctx.fillRect(26, 3, 2, 3);

        // Dark walnut table top
        ctx.fillStyle = '#451a03';
        ctx.fillRect(3, 3, 26, 8);
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 1;
        ctx.strokeRect(3, 3, 26, 8);

        // Bamboo tea tray in center
        ctx.fillStyle = '#fde68a';
        ctx.fillRect(8, 4, 16, 6);
        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = 0.8;
        ctx.strokeRect(8, 4, 16, 6);

        // Yixing purple clay teapot
        ctx.fillStyle = '#831843';
        ctx.beginPath();
        ctx.arc(13, 6.5, 2.5, 0, Math.PI * 2);
        ctx.fill();
        // Spout & handle
        ctx.fillRect(10.5, 6, 2, 1);
        ctx.fillRect(15, 6, 1, 1.5);

        // Bamboo Chasen whisk & 2 ceramic matcha bowls with frothy green tea
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(17, 5, 1.5, 3); // whisk

        // Matcha bowl 1
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.arc(20, 6, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#22c55e'; // green tea froth
        ctx.fillRect(19, 5.5, 2, 1);

        // Matcha bowl 2
        ctx.fillStyle = '#475569';
        ctx.beginPath();
        ctx.arc(22.5, 7, 1.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(22, 6.5, 1.5, 1);
      }
    },

    // 5. Zafu Meditation Cushion (16x16 px)
    {
      name: 'zafu_meditation_cushion',
      w: 16, h: 16,
      draw: (ctx, w, h) => {
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(8, 11, 6, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Round pleated linen cushion (Natural Linen / Indigo)
        ctx.fillStyle = '#1e3a8a'; // Deep Indigo
        ctx.beginPath();
        ctx.ellipse(8, 8, 6, 4.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#1e1b4b';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Top cushion surface highlight
        ctx.fillStyle = '#3b82f6';
        ctx.beginPath();
        ctx.ellipse(8, 7.5, 4.5, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Center tufting button & radial pleats
        ctx.fillStyle = '#fef3c7'; // White sewn name tag / button
        ctx.fillRect(7, 7, 2, 1.5);
      }
    },

    // 6. Zen Scroll Hanging Painting (16x32 px)
    {
      name: 'zen_scroll_painting',
      w: 16, h: 32,
      draw: (ctx, w, h) => {
        // Hanging thread
        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(8, 1); ctx.lineTo(3, 4);
        ctx.moveTo(8, 1); ctx.lineTo(13, 4);
        ctx.stroke();

        // Top wooden rod (Jiku)
        ctx.fillStyle = '#451a03';
        ctx.fillRect(2, 4, 12, 2);

        // Silk mount backing
        ctx.fillStyle = '#fef3c7';
        ctx.fillRect(3, 6, 10, 22);

        // Inner rice paper artwork area
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(4, 8, 8, 18);

        // Ink wash Mount Fuji silhouette
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.moveTo(4, 21);
        ctx.lineTo(8, 14);
        ctx.lineTo(12, 21);
        ctx.closePath();
        ctx.fill();
        // Snow capped peak
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(7, 16); ctx.lineTo(8, 14); ctx.lineTo(9, 16);
        ctx.closePath();
        ctx.fill();

        // Black Enso brush circle
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(8, 11, 2.5, 0.4, Math.PI * 1.8);
        ctx.stroke();

        // Red artist Hanko stamp
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(9, 23, 2, 2);

        // Bottom roller weight with knobs
        ctx.fillStyle = '#451a03';
        ctx.fillRect(1, 28, 14, 2.5);
      }
    },

    // 7. Shishi-Odoshi Bamboo Water Fountain (32x32 px)
    {
      name: 'shishi_odoshi_bamboo_fountain',
      w: 32, h: 32,
      draw: (ctx, w, h) => {
        // Base shadow
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.beginPath();
        ctx.ellipse(16, 26, 13, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Mossy Basalt Stone Basin (Tsukubai)
        ctx.fillStyle = '#334155';
        ctx.beginPath();
        ctx.ellipse(14, 22, 9, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        // Moss accents
        ctx.fillStyle = '#15803d';
        ctx.fillRect(6, 20, 3, 2);
        ctx.fillRect(18, 23, 4, 2);

        // Clear water cavity inside stone
        ctx.fillStyle = '#0284c7';
        ctx.beginPath();
        ctx.ellipse(14, 21, 6, 3.5, 0, 0, Math.PI * 2);
        ctx.fill();
        // Water sparkle
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.fillRect(13, 20, 2, 1);

        // Upright bamboo frame posts
        ctx.fillStyle = '#65a30d'; // Bamboo green/olive
        ctx.fillRect(20, 6, 3, 18);
        ctx.fillRect(24, 8, 3, 16);
        // Bamboo nodes
        ctx.fillStyle = '#3f6212';
        ctx.fillRect(20, 11, 3, 1);
        ctx.fillRect(20, 17, 3, 1);

        // Bamboo pivot rocker arm (slanted)
        ctx.fillStyle = '#a3e635';
        ctx.beginPath();
        ctx.moveTo(11, 14);
        ctx.lineTo(25, 10);
        ctx.lineTo(25, 13);
        ctx.lineTo(11, 17);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#3f6212';
        ctx.fillRect(18, 12, 2, 2); // pivot pin

        // Bamboo water spout (Kakehi) dripping water
        ctx.fillStyle = '#84cc16';
        ctx.fillRect(16, 8, 10, 2.5);
        // Trickling water stream
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.75)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(16, 10);
        ctx.lineTo(14, 20);
        ctx.stroke();

        // Bamboo water ladle resting on stone basin
        ctx.strokeStyle = '#eab308';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(8, 18); ctx.lineTo(18, 21);
        ctx.stroke();
        ctx.fillStyle = '#eab308';
        ctx.fillRect(7, 17, 3, 2);
      }
    },

    // 8. Bamboo Grove Cluster (32x48 px)
    {
      name: 'bamboo_grove_cluster',
      w: 32, h: 48,
      draw: (ctx, w, h) => {
        // Base dirt & moss mound
        ctx.fillStyle = '#14532d';
        ctx.beginPath();
        ctx.ellipse(16, 44, 14, 3.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // 4 Tall Bamboo Stalks
        const stalks = [
          { x: 6, w: 3, h: 44, col: '#65a30d', node: '#3f6212' },
          { x: 13, w: 4, h: 46, col: '#84cc16', node: '#4d7c0f' },
          { x: 21, w: 3, h: 45, col: '#65a30d', node: '#3f6212' },
          { x: 27, w: 2.5, h: 42, col: '#a3e635', node: '#4d7c0f' }
        ];

        stalks.forEach(s => {
          ctx.fillStyle = s.col;
          ctx.fillRect(s.x, 46 - s.h, s.w, s.h);
          // Ring nodes
          ctx.fillStyle = s.node;
          for (let y = 46 - s.h + 8; y < 44; y += 9) {
            ctx.fillRect(s.x - 0.5, y, s.w + 1, 1.5);
          }
        });

        // Feathery Lanceolate Bamboo Leaves branching out
        const leaves = [
          { x: 4, y: 12, dx: -4, dy: -3 },
          { x: 10, y: 8, dx: 6, dy: -4 },
          { x: 16, y: 6, dx: -5, dy: -5 },
          { x: 20, y: 10, dx: 6, dy: -3 },
          { x: 25, y: 14, dx: 5, dy: -4 },
          { x: 12, y: 22, dx: -6, dy: -3 },
          { x: 18, y: 20, dx: 7, dy: -2 },
          { x: 8, y: 30, dx: -5, dy: -2 },
          { x: 22, y: 28, dx: 6, dy: -3 }
        ];

        ctx.fillStyle = '#22c55e';
        leaves.forEach(l => {
          ctx.beginPath();
          ctx.moveTo(l.x, l.y);
          ctx.lineTo(l.x + l.dx, l.y + l.dy);
          ctx.lineTo(l.x + l.dx + 2, l.y + l.dy + 3);
          ctx.closePath();
          ctx.fill();
        });
      }
    },

    // 9. Rustic Log Bench (32x16 px)
    {
      name: 'rustic_log_bench',
      w: 32, h: 16,
      draw: (ctx, w, h) => {
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(3, 6, 26, 9);

        // 2 Tree stump feet
        ctx.fillStyle = '#451a03';
        ctx.fillRect(6, 8, 4, 6);
        ctx.fillRect(22, 8, 4, 6);

        // Halved cedar timber log bench
        ctx.fillStyle = '#78350f';
        ctx.fillRect(2, 4, 28, 6);
        ctx.strokeStyle = '#451a03';
        ctx.lineWidth = 1;
        ctx.strokeRect(2, 4, 28, 6);

        // Polished top seat grain
        ctx.fillStyle = '#b45309';
        ctx.fillRect(3, 4.5, 26, 4);

        // Wood rings on log ends
        ctx.fillStyle = '#d97706';
        ctx.beginPath();
        ctx.arc(4, 7, 1.5, 0, Math.PI * 2);
        ctx.arc(28, 7, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    },

    // 10. Raked Zen Gravel Sand Garden - Karesansui (48x32 px)
    {
      name: 'raked_sand_zen_garden',
      w: 48, h: 32,
      draw: (ctx, w, h) => {
        // Wooden rim border
        ctx.fillStyle = '#78350f';
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#451a03';
        ctx.fillRect(1, 1, w - 2, h - 2);

        // White quartz sand bed
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(2, 2, w - 4, h - 4);

        // Raked wave grooves (horizontal ridges)
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1;
        for (let y = 5; y < h - 4; y += 3) {
          ctx.beginPath();
          ctx.moveTo(4, y);
          ctx.lineTo(w - 4, y);
          ctx.stroke();
        }

        // Concentric raked ripples around 2 Zen rock islands
        // Rock 1 (Center-Left)
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.ellipse(18, 16, 10, 6, 0, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.ellipse(18, 16, 14, 9, 0, 0, Math.PI * 2); ctx.stroke();

        // Dark mossy basalt stone 1
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.ellipse(18, 16, 6, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#16a34a'; // moss patch
        ctx.fillRect(17, 14, 3, 2);

        // Rock 2 (Center-Right smaller stone)
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.ellipse(34, 18, 6, 4, 0, 0, Math.PI * 2); ctx.stroke();

        ctx.fillStyle = '#334155';
        ctx.beginPath();
        ctx.ellipse(34, 18, 3.5, 2.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#15803d';
        ctx.fillRect(34, 17, 2, 1);
      }
    },

    // 11. Grand Bonsai Pine in Antique Pot (32x32 px)
    {
      name: 'grand_bonsai_pine_pot',
      w: 32, h: 32,
      draw: (ctx, w, h) => {
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.beginPath();
        ctx.ellipse(16, 28, 11, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Dark rosewood display stand
        ctx.fillStyle = '#271004';
        ctx.fillRect(6, 25, 20, 2);
        ctx.fillRect(8, 27, 3, 2);
        ctx.fillRect(21, 27, 3, 2);

        // Glazed ceramic oval planter pot (Deep teal / celadon)
        ctx.fillStyle = '#0f766e';
        ctx.beginPath();
        ctx.ellipse(16, 23, 10, 3.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#134e4a';
        ctx.lineWidth = 1;
        ctx.stroke();
        // Soil and velvet moss bed
        ctx.fillStyle = '#15803d';
        ctx.beginPath();
        ctx.ellipse(16, 21.5, 8, 2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Gnarled, twisted pine trunk
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(16, 21);
        ctx.quadraticCurveTo(11, 15, 14, 11);
        ctx.quadraticCurveTo(18, 8, 17, 4);
        ctx.stroke();

        // Secondary branches
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(13, 14); ctx.lineTo(8, 12);
        ctx.moveTo(16, 9); ctx.lineTo(24, 7);
        ctx.stroke();

        // Lush tiered evergreen cloud needle pads
        const pads = [
          { cx: 7, cy: 11, rx: 6, ry: 3 },
          { cx: 23, cy: 7, rx: 7, ry: 3.5 },
          { cx: 16, cy: 4, rx: 8, ry: 4 }
        ];

        pads.forEach(p => {
          ctx.fillStyle = '#14532d'; // Dark forest pine
          ctx.beginPath();
          ctx.ellipse(p.cx, p.cy + 1, p.rx, p.ry, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#16a34a'; // Sunlit needle tops
          ctx.beginPath();
          ctx.ellipse(p.cx, p.cy - 0.5, p.rx - 1, p.ry - 1, 0, 0, Math.PI * 2);
          ctx.fill();
        });
      }
    },

    // 12. Bamboo Wind Chime (16x32 px)
    {
      name: 'bamboo_wind_chime',
      w: 16, h: 32,
      draw: (ctx, w, h) => {
        // Ceiling mount hook
        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(8, 1); ctx.lineTo(8, 5);
        ctx.stroke();

        // Round wood top disc
        ctx.fillStyle = '#78350f';
        ctx.beginPath();
        ctx.ellipse(8, 6, 6, 2, 0, 0, Math.PI * 2);
        ctx.fill();

        // 5 Hollow bamboo chiming tubes of varied lengths
        const tubes = [
          { x: 4, h: 12 },
          { x: 6, h: 16 },
          { x: 8, h: 14 },
          { x: 10, h: 18 },
          { x: 12, h: 13 }
        ];

        tubes.forEach(t => {
          // String
          ctx.strokeStyle = '#fef08a';
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(t.x + 0.5, 7); ctx.lineTo(t.x + 0.5, 9);
          ctx.stroke();

          // Bamboo tube with bevel bottom cut
          ctx.fillStyle = '#eab308';
          ctx.fillRect(t.x, 9, 1.5, t.h);
          ctx.fillStyle = '#ca8a04';
          ctx.fillRect(t.x + 0.8, 9, 0.7, t.h);
        });

        // Center wooden clapper disc & wind sail flap
        ctx.fillStyle = '#b45309';
        ctx.beginPath();
        ctx.ellipse(8, 17, 2, 1, 0, 0, Math.PI * 2);
        ctx.fill();

        // Dangling string to wind catcher
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(8, 18); ctx.lineTo(8, 24);
        ctx.stroke();

        // Wooden wind sail leaf
        ctx.fillStyle = '#78350f';
        ctx.fillRect(6, 24, 4, 6);
        ctx.fillStyle = '#dc2626'; // Japanese red kanji mark
        ctx.fillRect(7, 26, 2, 2);
      }
    },

    // 13. Zen Stepping Stones Path (32x32 px)
    {
      name: 'zen_stepping_stones_path',
      w: 32, h: 32,
      draw: (ctx, w, h) => {
        // 3 organic river stepping stones
        const stones = [
          { cx: 10, cy: 8, rx: 7, ry: 4.5, rot: 0.1 },
          { cx: 22, cy: 17, rx: 8, ry: 5, rot: -0.2 },
          { cx: 12, cy: 26, rx: 7.5, ry: 4.8, rot: 0.15 }
        ];

        stones.forEach(s => {
          // Shadow
          ctx.fillStyle = 'rgba(0,0,0,0.25)';
          ctx.beginPath();
          ctx.ellipse(s.cx + 1, s.cy + 1.5, s.rx, s.ry, s.rot, 0, Math.PI * 2);
          ctx.fill();

          // River slate body
          ctx.fillStyle = '#475569';
          ctx.beginPath();
          ctx.ellipse(s.cx, s.cy, s.rx, s.ry, s.rot, 0, Math.PI * 2);
          ctx.fill();

          // Highlight top surface
          ctx.fillStyle = '#64748b';
          ctx.beginPath();
          ctx.ellipse(s.cx - 0.5, s.cy - 0.5, s.rx - 1.5, s.ry - 1.2, s.rot, 0, Math.PI * 2);
          ctx.fill();
        });
      }
    },

    // 14. Cedar Wood Slat Eco Waste Bin (16x16 px)
    {
      name: 'wooden_slat_eco_bin',
      w: 16, h: 16,
      draw: (ctx, w, h) => {
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(2, 4, 12, 11);

        // Stainless steel inner lid
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(3, 2, 10, 3);
        ctx.fillStyle = '#334155';
        ctx.fillRect(6, 3, 4, 1.5); // circular opening

        // Cedar wood slats outer sleeve
        ctx.fillStyle = '#78350f';
        ctx.fillRect(2, 5, 12, 10);
        ctx.fillStyle = '#451a03';
        for (let x = 3; x < 14; x += 3) {
          ctx.fillRect(x, 5, 1, 10);
        }

        // Green recycle leaf logo
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(7, 8, 2, 3);
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
  console.log('All 14 Zen Garden sprites successfully generated!');
})();
