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
    // 1. CEO Imperial Persian Silk Rug (192x160 px = 6x5 tiles in 32px grid)
    {
      name: 'ceo_silk_persian_rug_6x5',
      w: 192, h: 160,
      draw: (ctx, w, h) => {
        // Drop shadow
        ctx.fillStyle = 'rgba(0,0,0,0.32)';
        ctx.fillRect(4, 6, w - 8, h - 8);

        // Deep Royal Burgundy / Crimson Velvet Base
        ctx.fillStyle = '#450a0a';
        ctx.fillRect(6, 6, w - 12, h - 12);

        // Outer Amber Gold Border
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 3;
        ctx.strokeRect(9, 9, w - 18, h - 18);

        // Intricate Inner Navy Border Band
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(12, 12, w - 24, 8);
        ctx.fillRect(12, h - 20, w - 24, 8);
        ctx.fillRect(12, 12, 8, h - 24);
        ctx.fillRect(w - 20, 12, 8, h - 24);

        // Gold Floral Scrollwork on Navy Band
        ctx.fillStyle = '#f59e0b';
        for (let x = 16; x < w - 24; x += 12) {
          ctx.beginPath();
          ctx.arc(x + 4, 16, 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(x + 4, h - 16, 2, 0, Math.PI * 2);
          ctx.fill();
        }
        for (let y = 16; y < h - 24; y += 12) {
          ctx.beginPath();
          ctx.arc(16, y + 4, 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(w - 16, y + 4, 2, 0, Math.PI * 2);
          ctx.fill();
        }

        // Inner Field Border
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 1;
        ctx.strokeRect(22, 22, w - 44, h - 44);

        // Central Grand Royal Medallion
        const cx = w / 2;
        const cy = h / 2;
        ctx.fillStyle = '#7f1d1d';
        ctx.beginPath();
        ctx.ellipse(cx, cy, 42, 28, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 1.8;
        ctx.stroke();

        // Medallion Inner Star / Arabesque
        ctx.fillStyle = '#d97706';
        ctx.beginPath();
        ctx.ellipse(cx, cy, 26, 16, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(cx, cy, 8, 0, Math.PI * 2);
        ctx.fill();

        // 4 Corner Medallions (Quarter Arcs)
        const corners = [
          { x: 23, y: 23 },
          { x: w - 23, y: 23 },
          { x: 23, y: h - 23 },
          { x: w - 23, y: h - 23 }
        ];
        corners.forEach(c => {
          ctx.fillStyle = '#7f1d1d';
          ctx.beginPath();
          ctx.arc(c.x, c.y, 16, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#fbbf24';
          ctx.lineWidth = 1.2;
          ctx.stroke();
        });

        // Fringed Golden Edge Tassels (Top & Bottom)
        ctx.fillStyle = '#fef08a';
        for (let x = 8; x < w - 8; x += 4) {
          ctx.fillRect(x, 3, 2, 4);
          ctx.fillRect(x, h - 7, 2, 4);
        }
      }
    },

    // 2. CEO American Walnut L-Shaped Executive Desk (128x96 px = 4x3 tiles in 32px grid)
    {
      name: 'ceo_walnut_executive_desk_l_shape',
      w: 128, h: 96,
      draw: (ctx, w, h) => {
        // Drop shadow
        ctx.fillStyle = 'rgba(0,0,0,0.38)';
        ctx.fillRect(6, 10, w - 12, h - 16);

        // Walnut Base Structure (Main desk & left return wing)
        ctx.fillStyle = '#271004';
        // Main front desk body (Right / South section)
        ctx.fillRect(36, 12, 86, 76);
        // Left return credenza body
        ctx.fillRect(8, 12, 34, 76);

        // Hollow seating bay for CEO chair
        ctx.clearRect(44, 12, 44, 42);

        // American Walnut Solid Desktop Surfaces
        ctx.fillStyle = '#451a03';
        // Main desk top
        ctx.fillRect(8, 54, 114, 34);
        // Left return top
        ctx.fillRect(8, 12, 36, 46);

        // Polished Walnut Surface Highlight
        ctx.fillStyle = '#78350f';
        ctx.fillRect(10, 56, 110, 30);
        ctx.fillRect(10, 14, 32, 44);

        // Champagne Gold Edge Inlay Trim
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 1.5;
        // Outer border
        ctx.strokeRect(9, 13, 112, 74);
        // Seating bay inner trim
        ctx.strokeRect(43, 13, 46, 43);

        // Modesty Panel Slats on front face
        ctx.fillStyle = '#271004';
        for (let x = 46; x < 118; x += 6) {
          ctx.fillRect(x, 82, 3, 5);
        }

        // Left Return Credenza Storage (Drawers with brass handles)
        ctx.fillStyle = '#1c0d02';
        [20, 34].forEach(y => {
          ctx.fillRect(12, y, 26, 10);
          ctx.fillStyle = '#fbbf24'; // Brass pull handle
          ctx.fillRect(22, y + 4, 6, 1.5);
          ctx.fillStyle = '#1c0d02';
        });

        // Desktop Accessories & Technology
        // 1. Executive Leather Blotter Pad (Dark Brown with gold stitch)
        ctx.fillStyle = '#1c0d02';
        ctx.fillRect(52, 62, 36, 20);
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 0.8;
        ctx.strokeRect(53, 63, 34, 18);
        // White contract document & signature line
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(56, 65, 18, 14);
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(58, 68, 14, 1);
        ctx.fillRect(58, 71, 12, 1);
        ctx.fillRect(58, 74, 10, 1);

        // 2. Curved All-in-One Silver Retina Display
        ctx.fillStyle = '#334155';
        ctx.fillRect(92, 60, 22, 14);
        ctx.fillStyle = '#38bdf8'; // Glowing cyan screen
        ctx.fillRect(93, 61, 20, 12);
        ctx.fillStyle = '#94a3b8'; // Metal stand
        ctx.fillRect(101, 74, 4, 3);
        ctx.fillRect(99, 77, 8, 1.5);

        // 3. Montblanc Gold Pen Stand & Crystal Paperweight
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(44, 66, 4, 4);
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(46, 66); ctx.lineTo(44, 60);
        ctx.stroke();

        // 4. Executive Multi-line Telephone on left return
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(14, 22, 12, 10);
        ctx.fillStyle = '#38bdf8'; // Phone screen
        ctx.fillRect(16, 24, 8, 3);
        ctx.fillStyle = '#94a3b8'; // Keypad
        ctx.fillRect(16, 28, 8, 3);

        // 5. Mini Desk Flags (National & Company)
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(118, 60); ctx.lineTo(118, 50);
        ctx.stroke();
        ctx.fillStyle = '#dc2626'; // Red flag
        ctx.fillRect(118, 50, 6, 4);
      }
    },

    // 3. CEO Executive High-Back Leather Swivel Chair (16x16 px)
    {
      name: 'ceo_executive_highback_leather_chair',
      w: 16, h: 16,
      draw: (ctx, w, h) => {
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.beginPath();
        ctx.ellipse(8, 14, 5.5, 2, 0, 0, Math.PI * 2);
        ctx.fill();

        // 5-Star Chrome Swivel Base
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(8, 12); ctx.lineTo(4, 14);
        ctx.moveTo(8, 12); ctx.lineTo(12, 14);
        ctx.moveTo(8, 12); ctx.lineTo(8, 15);
        ctx.stroke();

        // High Backrest in Rich Dark Espresso Leather
        ctx.fillStyle = '#1c0d02';
        ctx.fillRect(3.5, 1, 9, 8);
        ctx.fillStyle = '#451a03';
        ctx.fillRect(4.5, 2, 7, 7);

        // Diamond button tufting
        ctx.fillStyle = '#271004';
        ctx.fillRect(6, 3, 1, 1);
        ctx.fillRect(9, 3, 1, 1);
        ctx.fillRect(6, 6, 1, 1);
        ctx.fillRect(9, 6, 1, 1);

        // Padded Headrest
        ctx.fillStyle = '#78350f';
        ctx.fillRect(5, 1.5, 6, 2);

        // Leather Seat Cushion
        ctx.fillStyle = '#271004';
        ctx.beginPath();
        ctx.ellipse(8, 9.5, 6, 3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#451a03';
        ctx.beginPath();
        ctx.ellipse(8, 9, 5, 2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Walnut Capped Armrests
        ctx.fillStyle = '#78350f';
        ctx.fillRect(2.5, 5, 2, 4);
        ctx.fillRect(11.5, 5, 2, 4);
      }
    },

    // 4. Pair of Cantilever Executive Guest Chairs (32x16 px)
    {
      name: 'guest_leather_lowback_chair_pair',
      w: 32, h: 16,
      draw: (ctx, w, h) => {
        // Draw 2 chairs side by side at x=3 and x=17
        [3, 17].forEach(bx => {
          // Shadow
          ctx.fillStyle = 'rgba(0,0,0,0.28)';
          ctx.beginPath();
          ctx.ellipse(bx + 6, 14, 5, 2, 0, 0, Math.PI * 2);
          ctx.fill();

          // Cantilever Sled Chrome Frame
          ctx.strokeStyle = '#cbd5e1';
          ctx.lineWidth = 1;
          ctx.strokeRect(bx + 2, 12, 8, 3);

          // Cognac Leather Backrest
          ctx.fillStyle = '#451a03';
          ctx.fillRect(bx + 2, 2, 8, 7);
          ctx.fillStyle = '#78350f';
          ctx.fillRect(bx + 3, 3, 6, 6);

          // Seat cushion
          ctx.fillStyle = '#b45309';
          ctx.beginPath();
          ctx.ellipse(bx + 6, 9.5, 4.5, 2.5, 0, 0, Math.PI * 2);
          ctx.fill();

          // Chrome armrests
          ctx.strokeStyle = '#cbd5e1';
          ctx.strokeRect(bx + 1, 5, 1.5, 4);
          ctx.strokeRect(bx + 9.5, 5, 1.5, 4);
        });
      }
    },

    // 5. CEO Grand Vitrine Archive & Wine Cabinet (96x64 px = 3x2 tiles in 32px grid)
    {
      name: 'ceo_grand_archive_display_cabinet_3x2',
      w: 96, h: 64,
      draw: (ctx, w, h) => {
        // Drop shadow
        ctx.fillStyle = 'rgba(0,0,0,0.38)';
        ctx.fillRect(2, 6, w - 4, h - 8);

        // Solid Walnut Architectural Frame
        ctx.fillStyle = '#271004';
        ctx.fillRect(2, 2, w - 4, h - 6);
        ctx.fillStyle = '#451a03';
        ctx.fillRect(4, 4, w - 8, h - 10);

        // 3 Vertical Glass Bays
        const bayW = 27;
        [6, 35, 64].forEach(bx => {
          // Bay dark background
          ctx.fillStyle = '#1c0d02';
          ctx.fillRect(bx, 6, bayW, h - 14);

          // Top Shelf (y: 8..23): Golden Trophies & Awards
          ctx.fillStyle = '#fbbf24'; // Gold Trophy 1
          ctx.beginPath();
          ctx.arc(bx + 7, 13, 3.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillRect(bx + 5, 16, 4, 4);
          ctx.fillRect(bx + 4, 20, 6, 2);

          // Framed Gold Patent Award
          ctx.fillStyle = '#fef08a';
          ctx.fillRect(bx + 14, 10, 8, 10);
          ctx.strokeStyle = '#d97706';
          ctx.lineWidth = 0.8;
          ctx.strokeRect(bx + 14, 10, 8, 10);

          // Middle Shelf (y: 26..42): Vintage Wine & Crystal Decanter
          ctx.fillStyle = '#78350f'; // Shelf divider
          ctx.fillRect(bx, 24, bayW, 2);

          // Wine bottles (Deep Green & Burgundy)
          ctx.fillStyle = '#14532d'; // Bordeaux
          ctx.fillRect(bx + 4, 30, 3, 9);
          ctx.fillRect(bx + 5, 27, 1, 3);
          ctx.fillStyle = '#450a0a'; // Cabernet
          ctx.fillRect(bx + 8, 30, 3, 9);
          ctx.fillRect(bx + 9, 27, 1, 3);

          // Crystal Decanter
          ctx.fillStyle = 'rgba(224, 242, 254, 0.75)';
          ctx.beginPath();
          ctx.moveTo(bx + 18, 32);
          ctx.lineTo(bx + 21, 38);
          ctx.lineTo(bx + 15, 38);
          ctx.closePath();
          ctx.fill();
          ctx.fillRect(bx + 17.5, 28, 1.5, 4);

          // Bottom Shelf (y: 44..56): Leather Strategic Books
          ctx.fillStyle = '#78350f';
          ctx.fillRect(bx, 42, bayW, 2);

          const bookCols = ['#7f1d1d', '#1e3a8a', '#14532d', '#78350f', '#0f172a'];
          bookCols.forEach((col, i) => {
            ctx.fillStyle = col;
            ctx.fillRect(bx + 3 + i * 4.5, 45, 3.5, 10);
            ctx.fillStyle = '#fbbf24'; // Gold spine text
            ctx.fillRect(bx + 4 + i * 4.5, 47, 1.5, 6);
          });

          // Sliding Glass Door Reflective Sheen
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(bx + 4, 8); ctx.lineTo(bx + 18, 38);
          ctx.stroke();
        });

        // Top Crown Molding & LED Pelmet
        ctx.fillStyle = '#78350f';
        ctx.fillRect(2, 2, w - 4, 4);
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(4, 5, w - 8, 1);
      }
    },

    // 6. Biometric Fingerprint Steel Safe (16x24 px)
    {
      name: 'ceo_biometric_steel_safe',
      w: 16, h: 24,
      draw: (ctx, w, h) => {
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.fillRect(2, 21, 12, 3);

        // Heavy Titanium Steel Chassis
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(2, 3, 12, 19);
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(3, 4, 10, 17);

        // Heavy Vault Door Bevel
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1;
        ctx.strokeRect(3, 4, 10, 17);

        // Biometric Scanner Module (Top Center)
        ctx.fillStyle = '#020617';
        ctx.fillRect(5, 6, 6, 4);
        ctx.fillStyle = '#22c55e'; // Glowing Fingerprint Green LED
        ctx.beginPath();
        ctx.arc(8, 8, 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Heavy Rotating Spoke Vault Wheel
        ctx.fillStyle = '#cbd5e1';
        ctx.beginPath();
        ctx.arc(8, 14, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(8, 11); ctx.lineTo(8, 17);
        ctx.moveTo(5, 14); ctx.lineTo(11, 14);
        ctx.stroke();
      }
    },

    // 7. Italian Leather 2-Seater VIP Sofa (32x16 px)
    {
      name: 'ceo_vip_leather_sofa_2seater',
      w: 32, h: 16,
      draw: (ctx, w, h) => {
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.32)';
        ctx.fillRect(2, 13, 28, 3);

        // Dark Walnut Plinth Base
        ctx.fillStyle = '#271004';
        ctx.fillRect(2, 12, 28, 3);

        // Caramel Leather Backrest
        ctx.fillStyle = '#78350f';
        ctx.fillRect(2, 2, 28, 7);
        ctx.fillStyle = '#b45309';
        ctx.fillRect(3, 3, 26, 6);

        // Horizontal Tufting Channels
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(3, 6); ctx.lineTo(29, 6);
        ctx.stroke();

        // 2 Deep Seat Cushions
        ctx.fillStyle = '#92400e';
        ctx.fillRect(3, 8, 12.5, 5);
        ctx.fillRect(16.5, 8, 12.5, 5);
        ctx.fillStyle = '#b45309';
        ctx.fillRect(4, 8.5, 10.5, 4);
        ctx.fillRect(17.5, 8.5, 10.5, 4);

        // Padded Armrests
        ctx.fillStyle = '#78350f';
        ctx.fillRect(1, 5, 2.5, 7);
        ctx.fillRect(28.5, 5, 2.5, 7);
      }
    },

    // 8. Calacatta Marble Luxury Coffee Table (32x16 px)
    {
      name: 'calacatta_marble_coffee_table_2x1',
      w: 32, h: 16,
      draw: (ctx, w, h) => {
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(16, 13, 13, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Champagne Gold Leg Frame
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 1.2;
        ctx.strokeRect(3, 9, 26, 5);

        // Calacatta Marble Top (Off-white / Polished)
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(3, 4, 26, 7);
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1;
        ctx.strokeRect(3, 4, 26, 7);

        // Characteristic Grey & Gold Marble Veining
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(6, 5);
        ctx.quadraticCurveTo(12, 8, 18, 6);
        ctx.lineTo(24, 9);
        ctx.stroke();

        ctx.strokeStyle = '#f59e0b'; // Gold vein
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.moveTo(14, 6);
        ctx.lineTo(20, 8);
        ctx.stroke();

        // Champagne Gold Edge Bevel
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 0.8;
        ctx.strokeRect(2.5, 3.5, 27, 8);
      }
    },

    // 9. Deluxe White Orchid in Gold Porcelain Vase (16x16 px)
    {
      name: 'orchid_flower_vase_deluxe',
      w: 16, h: 16,
      draw: (ctx, w, h) => {
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(8, 14, 4, 1.8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Gold-Rimmed White Porcelain Fluted Pot
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(8, 11, 4.5, 2.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Slender Curved Bamboo Orchid Stems
        ctx.strokeStyle = '#15803d';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(8, 10);
        ctx.quadraticCurveTo(6, 5, 8, 2);
        ctx.moveTo(8, 10);
        ctx.quadraticCurveTo(10, 6, 12, 3);
        ctx.stroke();

        // 3 White Phalaenopsis Orchid Blossoms
        const flowers = [
          { x: 7, y: 3 },
          { x: 9, y: 5 },
          { x: 12, y: 4 }
        ];
        flowers.forEach(f => {
          // Petals
          ctx.fillStyle = '#f8fafc';
          ctx.beginPath();
          ctx.arc(f.x, f.y, 2.5, 0, Math.PI * 2);
          ctx.fill();
          // Yellow-Magenta Center Lip
          ctx.fillStyle = '#f59e0b';
          ctx.fillRect(f.x - 0.8, f.y - 0.8, 1.6, 1.6);
          ctx.fillStyle = '#dc2626';
          ctx.fillRect(f.x - 0.4, f.y - 0.4, 0.8, 0.8);
        });
      }
    },

    // 10. Single Caramel Leather VIP Armchair (16x16 px)
    {
      name: 'ceo_armchair_vip',
      w: 16, h: 16,
      draw: (ctx, w, h) => {
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(8, 14, 5.5, 2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Walnut plinth base
        ctx.fillStyle = '#271004';
        ctx.fillRect(3, 12, 10, 2);

        // Caramel Leather Backrest
        ctx.fillStyle = '#78350f';
        ctx.fillRect(3, 2, 10, 7);
        ctx.fillStyle = '#b45309';
        ctx.fillRect(4, 3, 8, 6);

        // Seat cushion
        ctx.fillStyle = '#92400e';
        ctx.beginPath();
        ctx.ellipse(8, 9.5, 5, 2.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Armrests
        ctx.fillStyle = '#78350f';
        ctx.fillRect(2, 5, 2, 6);
        ctx.fillRect(12, 5, 2, 6);
      }
    },

    // 11. "Mã Đáo Thành Công" Feng Shui Oil Canvas Painting (32x32 px)
    {
      name: 'fengshui_gold_canvas_painting_2x2',
      w: 32, h: 32,
      draw: (ctx, w, h) => {
        // Carved Gilt Gold Ornate Frame
        ctx.fillStyle = '#b45309';
        ctx.fillRect(1, 1, 30, 30);
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(2, 2, 28, 28);
        ctx.fillStyle = '#d97706';
        ctx.fillRect(3, 3, 26, 26);

        // Majestic Sunset Sky (Orange & Crimson Gradient)
        const skyGrad = ctx.createLinearGradient(4, 4, 28, 28);
        skyGrad.addColorStop(0, '#f59e0b');
        skyGrad.addColorStop(0.5, '#ea580c');
        skyGrad.addColorStop(1, '#7f1d1d');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(4, 4, 24, 24);

        // Golden Mountains in Background
        ctx.fillStyle = '#78350f';
        ctx.beginPath();
        ctx.moveTo(4, 20);
        ctx.lineTo(10, 12);
        ctx.lineTo(16, 17);
        ctx.lineTo(23, 10);
        ctx.lineTo(28, 22);
        ctx.lineTo(4, 22);
        ctx.closePath();
        ctx.fill();

        // Golden Sun Disc
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(12, 10, 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Galloping Steeds Silhouettes (Mã Đáo Thành Công)
        ctx.fillStyle = '#1c0d02';
        // Horse 1 (Lead)
        ctx.fillRect(18, 17, 5, 3);
        ctx.fillRect(21, 15, 2, 3);
        ctx.fillRect(17, 20, 2, 4);
        ctx.fillRect(21, 20, 2, 4);

        // Horse 2 (Following)
        ctx.fillRect(10, 18, 5, 3);
        ctx.fillRect(13, 16, 2, 3);
        ctx.fillRect(9, 21, 2, 4);
        ctx.fillRect(13, 21, 2, 4);

        // Foreground Terrain
        ctx.fillStyle = '#451a03';
        ctx.fillRect(4, 24, 24, 4);
      }
    },

    // 12. Realtime Executive Financial Market Ticker (32x16 px)
    {
      name: 'executive_market_ticker_display',
      w: 32, h: 16,
      draw: (ctx, w, h) => {
        // Titanium Frame
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, 32, 16);
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 0.8;
        ctx.strokeRect(0.5, 0.5, 31, 15);

        // Screen area
        ctx.fillStyle = '#020617';
        ctx.fillRect(2, 2, 28, 12);

        // Header ticker
        ctx.fillStyle = '#22c55e';
        ctx.font = 'bold 3px sans-serif';
        ctx.fillText('NASDAQ: +2.8%  VN-INDEX: ▲1,385', 3, 5.5);

        // Candlestick Chart (Green & Red bars)
        const bars = [
          { x: 4, y: 10, h: 3, green: true },
          { x: 8, y: 9, h: 4, green: true },
          { x: 12, y: 11, h: 2, green: false },
          { x: 16, y: 8, h: 5, green: true },
          { x: 20, y: 7, h: 6, green: true },
          { x: 24, y: 6, h: 7, green: true }
        ];
        bars.forEach(b => {
          ctx.fillStyle = b.green ? '#22c55e' : '#ef4444';
          ctx.fillRect(b.x, b.y, 2.5, b.h);
        });
      }
    },

    // 13. Money Tree in Jade-Glazed Ceramic Pot (16x32 px)
    {
      name: 'money_tree_fengshui_pot',
      w: 16, h: 32,
      draw: (ctx, w, h) => {
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.beginPath();
        ctx.ellipse(8, 30, 6, 2.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Imperial Emerald Jade Glazed Pot
        ctx.fillStyle = '#065f46';
        ctx.fillRect(4, 20, 8, 9);
        ctx.fillStyle = '#047857';
        ctx.fillRect(5, 21, 6, 8);
        // Pot gold trim
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 1;
        ctx.strokeRect(3.5, 19, 9, 2);

        // Braided Woody Trunk
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(7, 20); ctx.lineTo(9, 14); ctx.lineTo(7, 8);
        ctx.moveTo(9, 20); ctx.lineTo(7, 14); ctx.lineTo(9, 8);
        ctx.stroke();

        // Vibrant Umbrella Palmate Foliage (5 Crown Clusters)
        const clusters = [
          { x: 5, y: 8, r: 4.5 },
          { x: 11, y: 8, r: 4.5 },
          { x: 8, y: 4, r: 5 },
          { x: 4, y: 5, r: 3.5 },
          { x: 12, y: 5, r: 3.5 }
        ];
        clusters.forEach((c, idx) => {
          ctx.fillStyle = idx % 2 === 0 ? '#15803d' : '#22c55e';
          ctx.beginPath();
          ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#86efac';
          ctx.beginPath();
          ctx.arc(c.x - 0.5, c.y - 0.5, c.r * 0.4, 0, Math.PI * 2);
          ctx.fill();
        });
      }
    },

    // 14. CEO Walnut Credenza Bar Station (32x16 px)
    {
      name: 'ceo_credenza_bar_station',
      w: 32, h: 16,
      draw: (ctx, w, h) => {
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.32)';
        ctx.fillRect(2, 13, 28, 3);

        // Walnut Credenza Frame
        ctx.fillStyle = '#271004';
        ctx.fillRect(2, 4, 28, 10);
        ctx.fillStyle = '#451a03';
        ctx.fillRect(3, 5, 26, 8);

        // Black Granite Polished Countertop
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(1, 3, 30, 3);
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 0.8;
        ctx.strokeRect(1, 3, 30, 3);

        // Brass handles on 3 cabinet doors
        [8, 16, 24].forEach(x => {
          ctx.fillStyle = '#fbbf24';
          ctx.fillRect(x, 9, 1.5, 3);
        });
      }
    },

    // 15. Nespresso Luxury Capsule Machine & Tower (16x16 px)
    {
      name: 'nespresso_luxury_capsule_machine',
      w: 16, h: 16,
      draw: (ctx, w, h) => {
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(2, 13, 12, 2);

        // Chrome & Piano Black Machine
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(2, 4, 8, 10);
        ctx.fillStyle = '#cbd5e1'; // Chrome lever
        ctx.fillRect(4, 2, 4, 2);

        // Transparent side water tank
        ctx.fillStyle = 'rgba(56, 189, 248, 0.6)';
        ctx.fillRect(2, 5, 2.5, 7);

        // Coffee dispensing spout & cup
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(6, 10, 3, 3);
        ctx.fillStyle = '#451a03'; // Rich crema
        ctx.fillRect(6.5, 10.5, 2, 1);

        // Rotating Capsule Carousel Tower
        ctx.fillStyle = '#fbbf24'; // Brass spindle
        ctx.fillRect(12, 3, 1.5, 11);
        // Colorful coffee capsules
        const capCols = ['#dc2626', '#eab308', '#2563eb', '#16a34a', '#9333ea'];
        capCols.forEach((col, i) => {
          ctx.fillStyle = col;
          ctx.fillRect(11, 4 + i * 2, 3.5, 1.5);
        });
      }
    },

    // 16. Glass-Door Mini Wine Cooler Fridge (16x24 px)
    {
      name: 'mini_wine_cooler_fridge',
      w: 16, h: 24,
      draw: (ctx, w, h) => {
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.32)';
        ctx.fillRect(2, 21, 12, 3);

        // Stainless Steel Outer Frame
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(2, 3, 12, 19);
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1;
        ctx.strokeRect(2, 3, 12, 19);

        // Dark UV Glass Door with Blue LED Glow
        ctx.fillStyle = '#020617';
        ctx.fillRect(3.5, 4.5, 9, 16);

        // Blue Interior Ambient Light
        ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
        ctx.fillRect(4, 5, 8, 15);

        // Chilled Wine Racks (Horizontal bottles)
        [7, 12, 17].forEach(y => {
          ctx.fillStyle = '#334155'; // Wire rack
          ctx.fillRect(4, y, 8, 1);
          // Bottles
          ctx.fillStyle = '#14532d'; // Champagne green
          ctx.fillRect(5, y - 2, 6, 2);
          ctx.fillStyle = '#fef08a'; // Gold foil neck
          ctx.fillRect(11, y - 1.5, 1.5, 1);
        });

        // Digital Temperature Display (7°C)
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(6, 4, 4, 1.5);
      }
    },

    // 17. Handcrafted Leather-Wrapped Wastebasket (16x16 px)
    {
      name: 'leather_wrapped_wastebasket',
      w: 16, h: 16,
      draw: (ctx, w, h) => {
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(8, 14, 5, 2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Dark Espresso Leather Body
        ctx.fillStyle = '#271004';
        ctx.beginPath();
        ctx.moveTo(4, 5);
        ctx.lineTo(12, 5);
        ctx.lineTo(11, 13);
        ctx.lineTo(5, 13);
        ctx.closePath();
        ctx.fill();

        // Champagne Gold Rim
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(8, 5, 4.5, 1.8, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Saddle Stitching
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.moveTo(8, 6); ctx.lineTo(8, 12.5);
        ctx.stroke();
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
  console.log(`All ${spriteDefs.length} CEO Suite sprites successfully generated!`);
})();
