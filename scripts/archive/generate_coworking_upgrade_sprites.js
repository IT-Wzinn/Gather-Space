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
    // 1. Tech Hexagon Circuit Rug (10x7 tiles = 320x224 px)
    {
      name: 'coworking_tech_hexagon_rug_10x7',
      w: 320, h: 224,
      draw: (ctx, w, h) => {
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(4, 6, w - 8, h - 8);

        // Charcoal / Slate Field
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(6, 6, w - 12, h - 12);

        // Inner Felt Charcoal
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(12, 12, w - 24, h - 24);

        // Glowing Cyan Border
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 2.5;
        ctx.strokeRect(10, 10, w - 20, h - 20);

        // Neon Glow Accent Border
        ctx.strokeStyle = 'rgba(34, 211, 238, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(16, 16, w - 32, h - 32);

        // Hexagonal Grid Pattern
        ctx.save();
        ctx.rect(18, 18, w - 36, h - 36);
        ctx.clip();

        function drawHex(hx, hy, r) {
          ctx.beginPath();
          for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i;
            const x = hx + r * Math.cos(angle);
            const y = hy + r * Math.sin(angle);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.closePath();
          ctx.stroke();
        }

        ctx.strokeStyle = 'rgba(6, 182, 212, 0.15)';
        ctx.lineWidth = 1;
        const hexRadius = 16;
        const dx = hexRadius * 1.5;
        const dy = hexRadius * Math.sqrt(3);

        for (let x = 16; x < w - 16; x += dx) {
          for (let y = 16; y < h - 16; y += dy) {
            const rowOffset = ((Math.floor(x / dx) % 2) * dy) / 2;
            drawHex(x, y + rowOffset, hexRadius - 1);
          }
        }

        // Circuit Line Accents & Cyan Nodes
        ctx.strokeStyle = '#22d3ee';
        ctx.lineWidth = 1.5;
        ctx.fillStyle = '#38bdf8';

        // Left circuit trace
        ctx.beginPath();
        ctx.moveTo(24, 40); ctx.lineTo(60, 40); ctx.lineTo(80, 60); ctx.lineTo(120, 60);
        ctx.stroke();
        ctx.beginPath(); ctx.arc(120, 60, 3, 0, Math.PI * 2); ctx.fill();

        // Right circuit trace
        ctx.beginPath();
        ctx.moveTo(w - 24, h - 40); ctx.lineTo(w - 60, h - 40); ctx.lineTo(w - 80, h - 60); ctx.lineTo(w - 120, h - 60);
        ctx.stroke();
        ctx.beginPath(); ctx.arc(w - 120, h - 60, 3, 0, Math.PI * 2); ctx.fill();

        // Center glowing motif
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.5)';
        ctx.lineWidth = 2;
        drawHex(w / 2, h / 2, 28);
        ctx.fillStyle = 'rgba(34, 211, 238, 0.2)';
        ctx.fill();

        ctx.restore();
      }
    },

    // 2. Long Benching Workstation System (8x3 tiles = 256x96 px)
    {
      name: 'coworking_long_bench_workstations_8x3',
      w: 256, h: 96,
      draw: (ctx, w, h) => {
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(8, 12, w - 16, h - 14);

        // Black Steel Leg Frames
        ctx.fillStyle = '#1e293b';
        // Left loop leg
        ctx.fillRect(10, 16, 8, h - 22);
        // Middle loop leg
        ctx.fillRect(w / 2 - 4, 16, 8, h - 22);
        // Right loop leg
        ctx.fillRect(w - 18, 16, 8, h - 22);

        // Desktops (Top & Bottom halves)
        // Top desk half
        ctx.fillStyle = '#fde68a';
        ctx.fillRect(8, 14, w - 16, 32);
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(8, 44, w - 16, 2); // bevel

        // Bottom desk half
        ctx.fillStyle = '#fde68a';
        ctx.fillRect(8, 50, w - 16, 32);
        ctx.fillStyle = '#d97706';
        ctx.fillRect(8, 80, w - 16, 3); // edge depth

        // Central Acoustic Divider Screen (Blue/Teal Felt)
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(12, 44, w - 24, 7);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(12, 43, w - 24, 2); // highlight top rim

        // 4 Workstation Desk Pads & Equipment (2 on North, 2 on South)
        const podPositions = [
          { x: 32, y: 18, facing: 'south' },
          { x: 156, y: 18, facing: 'south' },
          { x: 32, y: 54, facing: 'north' },
          { x: 156, y: 54, facing: 'north' }
        ];

        podPositions.forEach(p => {
          // Desk Mat (Dark grey felt)
          ctx.fillStyle = '#334155';
          ctx.fillRect(p.x, p.y + 2, 72, 22);

          // Dual Monitor Setup on arm
          if (p.facing === 'south') {
            // Monitor back/stand facing screen
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(p.x + 8, p.y + 14, 26, 8);
            ctx.fillRect(p.x + 38, p.y + 14, 26, 8);
            // Glowing screen reflection
            ctx.fillStyle = '#38bdf8';
            ctx.fillRect(p.x + 9, p.y + 15, 24, 6);
            ctx.fillStyle = '#a855f7';
            ctx.fillRect(p.x + 39, p.y + 15, 24, 6);

            // Laptop open
            ctx.fillStyle = '#94a3b8';
            ctx.fillRect(p.x + 18, p.y + 4, 18, 9);
            // Keyboard & Mouse
            ctx.fillStyle = '#0284c7';
            ctx.fillRect(p.x + 40, p.y + 4, 16, 6);
            ctx.fillStyle = '#e2e8f0';
            ctx.fillRect(p.x + 58, p.y + 5, 4, 5);
          } else {
            // Facing North
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(p.x + 8, p.y + 2, 26, 8);
            ctx.fillRect(p.x + 38, p.y + 2, 26, 8);
            ctx.fillStyle = '#22c55e';
            ctx.fillRect(p.x + 9, p.y + 3, 24, 6);
            ctx.fillStyle = '#38bdf8';
            ctx.fillRect(p.x + 39, p.y + 3, 24, 6);

            // Laptop & Keyboard
            ctx.fillStyle = '#94a3b8';
            ctx.fillRect(p.x + 18, p.y + 12, 18, 9);
            ctx.fillStyle = '#f43f5e';
            ctx.fillRect(p.x + 40, p.y + 12, 16, 6);
            ctx.fillStyle = '#e2e8f0';
            ctx.fillRect(p.x + 58, p.y + 13, 4, 5);
          }

          // Mug & notebook
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(p.x + 66, p.y + 10, 4, 4);
          ctx.fillStyle = '#10b981';
          ctx.fillRect(p.x + 2, p.y + 8, 5, 7);
        });

        // Aluminum cable grommets
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(115, 44, 10, 6);
        ctx.fillRect(235, 44, 10, 6);
      }
    },

    // 3. Agile High-Top Standing Bar Table (4x1.5 tiles = 128x48 px)
    {
      name: 'coworking_agile_hightop_table_4x1',
      w: 128, h: 48,
      draw: (ctx, w, h) => {
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.fillRect(6, 12, w - 12, h - 16);

        // Black A-Frame Metal Legs
        ctx.fillStyle = '#1e293b';
        // Left A-frame
        ctx.fillRect(10, 16, 6, h - 20);
        ctx.fillRect(18, 16, 6, h - 20);
        ctx.fillRect(10, 34, 14, 4); // footrest bar
        // Right A-frame
        ctx.fillRect(w - 24, 16, 6, h - 20);
        ctx.fillRect(w - 16, 16, 6, h - 20);
        ctx.fillRect(w - 24, 34, 14, 4); // footrest bar
        // Center stretcher bar
        ctx.fillRect(20, 34, w - 40, 3);

        // Solid Natural Oak Butcher Block Top
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(6, 10, w - 12, 22);
        ctx.fillStyle = '#d97706';
        ctx.fillRect(6, 30, w - 12, 4); // table edge

        // Items on standing table
        // iPad Pro on stand
        ctx.fillStyle = '#334155';
        ctx.fillRect(20, 14, 18, 12);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(22, 16, 14, 8);

        // Multi-color sticky note stacks
        ctx.fillStyle = '#facc15'; // yellow sticky
        ctx.fillRect(48, 16, 10, 10);
        ctx.fillStyle = '#f472b6'; // pink sticky
        ctx.fillRect(62, 16, 10, 10);
        ctx.fillStyle = '#4ade80'; // green sticky
        ctx.fillRect(76, 16, 10, 10);

        // Marker pen holder cup
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(94, 14, 8, 10);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(95, 11, 2, 4);
        ctx.fillStyle = '#3b82f6';
        ctx.fillRect(98, 11, 2, 4);

        // Hydro flask water bottle
        ctx.fillStyle = '#06b6d4';
        ctx.fillRect(108, 13, 6, 13);
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(109, 11, 4, 3);
      }
    },

    // 4. Row of 4 Cognac Leather High Barstools (4x1 tiles = 128x32 px)
    {
      name: 'coworking_leather_barstool_row',
      w: 128, h: 32,
      draw: (ctx, w, h) => {
        const spacing = w / 4;
        for (let i = 0; i < 4; i++) {
          const cx = i * spacing + spacing / 2;

          // Shadow
          ctx.fillStyle = 'rgba(0,0,0,0.25)';
          ctx.beginPath();
          ctx.ellipse(cx, 26, 10, 4, 0, 0, Math.PI * 2);
          ctx.fill();

          // Black Slim Legs
          ctx.strokeStyle = '#1e293b';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(cx - 5, 14); ctx.lineTo(cx - 8, 26);
          ctx.moveTo(cx + 5, 14); ctx.lineTo(cx + 8, 26);
          ctx.moveTo(cx, 14); ctx.lineTo(cx, 26);
          ctx.stroke();

          // Circular Footring
          ctx.strokeStyle = '#64748b';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.ellipse(cx, 21, 6, 2, 0, 0, Math.PI * 2);
          ctx.stroke();

          // Cognac Leather Seat Cushion
          ctx.fillStyle = '#9a3412'; // dark cognac shadow
          ctx.beginPath();
          ctx.ellipse(cx, 13, 10, 7, 0, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#ea580c'; // rich saddle leather
          ctx.beginPath();
          ctx.ellipse(cx, 11, 9, 6, 0, 0, Math.PI * 2);
          ctx.fill();

          // Stitching highlight
          ctx.strokeStyle = '#fed7aa';
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.ellipse(cx, 11, 7, 4, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
    },

    // 5. 75" Interactive Digital Miro / Jamboard (3x2 tiles = 96x64 px)
    {
      name: 'coworking_interactive_miro_board_75inch',
      w: 96, h: 64,
      draw: (ctx, w, h) => {
        // Back wall glow
        ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
        ctx.fillRect(2, 2, w - 4, h - 4);

        // Thin Black Matte Bezel
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(4, 6, w - 8, h - 12);

        // Inner Screen Display
        ctx.fillStyle = '#090d16';
        ctx.fillRect(6, 8, w - 12, h - 16);

        // UI Header Bar (Miro style)
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(6, 8, w - 12, 8);
        ctx.fillStyle = '#f59e0b'; // Miro logo dot
        ctx.fillRect(8, 10, 4, 4);
        ctx.fillStyle = '#e2e8f0';
        ctx.font = 'bold 5px sans-serif';
        ctx.fillText('SPRINT 42 • WAR ROOM', 16, 14);

        // 4 Kanban Columns
        const colW = (w - 18) / 4;
        const colNames = ['BACKLOG', 'IN DEV', 'REVIEW', 'DONE'];
        const colColors = ['#f59e0b', '#06b6d4', '#a855f7', '#10b981'];

        for (let i = 0; i < 4; i++) {
          const colX = 8 + i * (colW + 1);
          // Column Header
          ctx.fillStyle = 'rgba(255,255,255,0.1)';
          ctx.fillRect(colX, 18, colW, 6);
          ctx.fillStyle = colColors[i];
          ctx.fillRect(colX, 18, colW, 1.5);
          ctx.font = '4px sans-serif';
          ctx.fillText(colNames[i], colX + 1, 23);

          // Sticky Notes in column
          ctx.fillStyle = colColors[i];
          ctx.fillRect(colX + 1, 26, colW - 2, 7);
          ctx.fillRect(colX + 1, 35, colW - 2, 7);
          if (i === 3) {
            ctx.fillStyle = '#22c55e';
            ctx.fillRect(colX + 1, 44, colW - 2, 6);
          }
        }

        // Mini Burndown Graph at bottom right
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(56, 48); ctx.lineTo(66, 44); ctx.lineTo(76, 40); ctx.lineTo(86, 34);
        ctx.stroke();

        // White Soundbar / Stylus tray below screen
        ctx.fillStyle = '#64748b';
        ctx.fillRect(24, h - 6, w - 48, 4);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(36, h - 5, 8, 2); // stylus
      }
    },

    // 6. Drafting Tilt Architecture Desk (3x2 tiles = 96x64 px)
    {
      name: 'coworking_drafting_tilt_desk_3x2',
      w: 96, h: 64,
      draw: (ctx, w, h) => {
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(6, 12, w - 12, h - 16);

        // Cast-Iron Vintage Heavy Legs
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(10, 18, 8, h - 24);
        ctx.fillRect(w - 18, 18, 8, h - 24);
        ctx.fillRect(8, h - 10, 12, 6);
        ctx.fillRect(w - 20, h - 10, 12, 6);
        ctx.fillRect(14, 38, w - 28, 4); // heavy stretcher bar

        // Tilted Birch Wood Drafting Board
        ctx.fillStyle = '#fde68a';
        ctx.fillRect(6, 10, w - 12, 34);
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(6, 42, w - 12, 4); // lower pencil ledge

        // 27" Wacom Cintiq Display on board
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(14, 14, 38, 26);
        ctx.fillStyle = '#0284c7'; // screen showing UI sketch
        ctx.fillRect(16, 16, 34, 22);
        // UI wireframe lines on screen
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(18, 18, 14, 18);
        ctx.strokeRect(34, 18, 14, 8);
        ctx.strokeRect(34, 28, 14, 8);

        // Architecture Tracing Paper Blueprint on right side
        ctx.fillStyle = '#e0f2fe';
        ctx.fillRect(56, 14, 32, 24);
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 0.8;
        ctx.strokeRect(58, 16, 28, 20);
        ctx.beginPath();
        ctx.moveTo(60, 26); ctx.lineTo(84, 26);
        ctx.moveTo(72, 18); ctx.lineTo(72, 34);
        ctx.stroke();

        // Parallel T-Square Ruler
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.fillRect(52, 28, 38, 3);
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(50, 20, 4, 18);

        // Copic Marker Set in holder on bottom ledge
        const markers = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#8b5cf6'];
        for (let m = 0; m < markers.length; m++) {
          ctx.fillStyle = markers[m];
          ctx.fillRect(16 + m * 5, 43, 3, 3);
        }
      }
    },

    // 7. Maker 3D Printer Station (2x2 tiles = 64x64 px)
    {
      name: 'coworking_maker_3d_printer_station',
      w: 64, h: 64,
      draw: (ctx, w, h) => {
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(6, 10, w - 12, h - 14);

        // Heavy Sturdy Work Table (Industrial Metal)
        ctx.fillStyle = '#334155';
        ctx.fillRect(6, 36, w - 12, 24);
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(8, 42, 6, 18);
        ctx.fillRect(w - 14, 42, 6, 18);

        // Bambu Lab Enclosed 3D Printer Frame
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(10, 8, 44, 32);

        // Glass Chamber with Cyan Internal LED Glow
        ctx.fillStyle = '#083344';
        ctx.fillRect(13, 11, 38, 24);
        ctx.fillStyle = 'rgba(6, 182, 212, 0.35)';
        ctx.fillRect(14, 12, 36, 22);

        // Heated Textured Bed Plate
        ctx.fillStyle = '#475569';
        ctx.fillRect(16, 28, 32, 3);

        // 3D Object actively printing (Bright Neon Orange)
        ctx.fillStyle = '#f97316';
        ctx.fillRect(28, 22, 9, 6);

        // Extruder Print Head & Gantry
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(24, 18, 16, 4);
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(31, 21, 3, 2); // brass nozzle

        // Filament Spool on top
        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.arc(42, 6, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(42, 6, 2, 0, Math.PI * 2);
        ctx.fill();

        // Color Touchscreen on printer
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(44, 30, 6, 4);

        // Filament scrap bin on table
        ctx.fillStyle = '#64748b';
        ctx.fillRect(12, 38, 8, 8);
        ctx.fillStyle = '#f97316';
        ctx.fillRect(13, 37, 6, 2);
      }
    },

    // 8. Industrial Mesh Locker Bank (3x2 tiles = 96x64 px)
    {
      name: 'coworking_mesh_locker_bank_3x2',
      w: 96, h: 64,
      draw: (ctx, w, h) => {
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(4, 8, w - 8, h - 10);

        // Outer Dark Slate Steel Frame
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(6, 6, w - 12, h - 10);

        // 6 Lockers (2 rows of 3)
        const colW = (w - 18) / 3;
        const rowH = (h - 18) / 2;

        for (let r = 0; r < 2; r++) {
          for (let c = 0; c < 3; c++) {
            const lx = 9 + c * (colW + 1);
            const ly = 9 + r * (rowH + 1);

            // Door Face (Charcoal Mesh)
            ctx.fillStyle = '#334155';
            ctx.fillRect(lx, ly, colW, rowH);

            // Perforated vent dots
            ctx.fillStyle = '#0f172a';
            for (let vx = lx + 4; vx < lx + colW - 6; vx += 4) {
              ctx.fillRect(vx, ly + 4, 1.5, 1.5);
              ctx.fillRect(vx, ly + 8, 1.5, 1.5);
            }

            // Brass Digital Keypad Lock
            ctx.fillStyle = '#d4af37';
            ctx.fillRect(lx + colW - 6, ly + rowH / 2 - 4, 4, 8);
            // Red / Green LED indicator
            ctx.fillStyle = (r === 0 && c === 1) ? '#ef4444' : '#22c55e';
            ctx.fillRect(lx + colW - 5, ly + rowH / 2 - 3, 2, 2);

            // Locker Number Badge
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(lx + 4, ly + rowH / 2 - 2, 6, 4);
          }
        }

        // Top edge shadow
        ctx.fillStyle = '#475569';
        ctx.fillRect(6, 6, w - 12, 2);
      }
    },

    // 9. Tiered Wooden Bleacher Seating Platform (4x3 tiles = 128x96 px)
    {
      name: 'coworking_wooden_bleacher_seats_4x3',
      w: 128, h: 96,
      draw: (ctx, w, h) => {
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(6, 12, w - 12, h - 16);

        // 3 Tiers of Pine Wood Stadium Seating
        // Tier 3 (Highest, North)
        ctx.fillStyle = '#b45309'; // riser shadow
        ctx.fillRect(8, 10, w - 16, 26);
        ctx.fillStyle = '#fde68a'; // wood plank surface
        ctx.fillRect(8, 10, w - 16, 22);
        // Wood grain plank dividers
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 1;
        for (let x = 32; x < w - 16; x += 24) {
          ctx.beginPath(); ctx.moveTo(x, 10); ctx.lineTo(x, 32); ctx.stroke();
        }

        // Tier 2 (Middle)
        ctx.fillStyle = '#92400e'; // riser
        ctx.fillRect(8, 36, w - 16, 28);
        ctx.fillStyle = '#fde68a'; // surface
        ctx.fillRect(8, 38, w - 16, 22);
        for (let x = 24; x < w - 16; x += 24) {
          ctx.beginPath(); ctx.moveTo(x, 38); ctx.lineTo(x, 60); ctx.stroke();
        }

        // Tier 1 (Lowest, South)
        ctx.fillStyle = '#78350f'; // riser
        ctx.fillRect(8, 64, w - 16, 28);
        ctx.fillStyle = '#fde68a'; // surface
        ctx.fillRect(8, 66, w - 16, 22);
        ctx.fillStyle = '#d97706'; // front rim
        ctx.fillRect(8, 88, w - 16, 3);
        for (let x = 36; x < w - 16; x += 24) {
          ctx.beginPath(); ctx.moveTo(x, 66); ctx.lineTo(x, 88); ctx.stroke();
        }

        // Seat Cushions on various tiers
        // Tier 3 Cushions
        ctx.fillStyle = '#f59e0b'; // Mustard
        ctx.fillRect(20, 14, 22, 14);
        ctx.fillStyle = '#06b6d4'; // Cyan
        ctx.fillRect(76, 14, 22, 14);

        // Tier 2 Cushions & Pillows
        ctx.fillStyle = '#ea580c'; // Terracotta
        ctx.fillRect(44, 42, 24, 14);
        ctx.fillStyle = '#10b981'; // Mint Green
        ctx.fillRect(96, 42, 20, 14);
        // Pillow
        ctx.fillStyle = '#f43f5e';
        ctx.fillRect(36, 43, 9, 12);

        // Tier 1 Cushions & Throw blanket
        ctx.fillStyle = '#3b82f6'; // Royal Blue
        ctx.fillRect(18, 70, 22, 14);
        ctx.fillStyle = '#8b5cf6'; // Violet
        ctx.fillRect(68, 70, 22, 14);
        // Throw blanket draped over tier 1
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(100, 72, 16, 15);

        // Integrated Power Outlet Plates on risers
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(58, 33, 8, 4);
        ctx.fillRect(88, 61, 8, 4);
      }
    },

    // 10. Giant Ergonomic Beanbag Loungers Pair (2x1.5 tiles = 64x48 px)
    {
      name: 'coworking_beanbags_pair',
      w: 64, h: 48,
      draw: (ctx, w, h) => {
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.beginPath();
        ctx.ellipse(19, 28, 16, 9, 0, 0, Math.PI * 2);
        ctx.ellipse(45, 28, 16, 9, 0, 0, Math.PI * 2);
        ctx.fill();

        // Beanbag 1: Terracotta Orange (#ea580c)
        ctx.fillStyle = '#c2410c'; // shadow fold
        ctx.beginPath();
        ctx.ellipse(18, 22, 16, 14, -0.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ea580c'; // main body
        ctx.beginPath();
        ctx.ellipse(17, 20, 14, 12, -0.1, 0, Math.PI * 2);
        ctx.fill();
        // Indentation highlight
        ctx.fillStyle = '#fb923c';
        ctx.beginPath();
        ctx.ellipse(16, 17, 9, 7, 0, 0, Math.PI * 2);
        ctx.fill();

        // Beanbag 2: Mint Sage Green (#10b981)
        ctx.fillStyle = '#047857'; // shadow fold
        ctx.beginPath();
        ctx.ellipse(46, 22, 15, 14, 0.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#10b981'; // main body
        ctx.beginPath();
        ctx.ellipse(46, 20, 13, 12, 0.1, 0, Math.PI * 2);
        ctx.fill();
        // Indentation highlight
        ctx.fillStyle = '#34d399';
        ctx.beginPath();
        ctx.ellipse(46, 17, 8, 7, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    },

    // 11. Acoustic Phone Booths Row (3 Pods, 4x2 tiles = 128x64 px)
    {
      name: 'coworking_acoustic_phone_booths_row',
      w: 128, h: 64,
      draw: (ctx, w, h) => {
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.fillRect(6, 12, w - 12, h - 16);

        const podW = 36;
        const startX = 6;
        const statuses = ['VACANT', 'IN USE', 'VACANT'];
        const ledColors = ['#22c55e', '#ef4444', '#22c55e'];

        for (let i = 0; i < 3; i++) {
          const px = startX + i * (podW + 4);

          // Matte Slate Acoustic Outer Shell with Rounded Corners
          ctx.fillStyle = '#1e293b';
          ctx.beginPath();
          ctx.roundRect(px, 8, podW, h - 14, 4);
          ctx.fill();

          // Acoustic Fabric Felt Interior
          ctx.fillStyle = '#334155';
          ctx.fillRect(px + 3, 14, podW - 6, h - 22);

          // Interior Compact Standing Desk & Stool
          ctx.fillStyle = '#f59e0b';
          ctx.fillRect(px + 6, 36, podW - 12, 4);
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(px + 10, 40, podW - 20, 8); // stool

          // Acoustic Double-Glazed Glass Door (Tinted cyan/grey)
          ctx.fillStyle = 'rgba(6, 182, 212, 0.2)';
          ctx.fillRect(px + 4, 14, podW - 8, h - 24);
          // Glass reflection diagonal highlight
          ctx.fillStyle = 'rgba(255,255,255,0.25)';
          ctx.beginPath();
          ctx.moveTo(px + 6, 16); ctx.lineTo(px + 16, 16);
          ctx.lineTo(px + 8, 48); ctx.lineTo(px + 4, 48);
          ctx.fill();

          // Door Handle
          ctx.fillStyle = '#e2e8f0';
          ctx.fillRect(px + podW - 8, 30, 2, 12);

          // LED Status Indicator Bar on Roof
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(px + 6, 10, podW - 12, 3);
          ctx.fillStyle = ledColors[i];
          ctx.fillRect(px + 8, 10, podW - 16, 2);
        }
      }
    },

    // 12. Hydration & Healthy Detox Bar (3x1.5 tiles = 96x48 px)
    {
      name: 'coworking_hydration_detox_bar_3x1',
      w: 96, h: 48,
      draw: (ctx, w, h) => {
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(4, 12, w - 8, h - 16);

        // Fluted Oak Base Cabinet
        ctx.fillStyle = '#b45309';
        ctx.fillRect(6, 20, w - 12, h - 24);
        // Vertical slat lines
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 1;
        for (let x = 10; x < w - 12; x += 4) {
          ctx.beginPath(); ctx.moveTo(x, 22); ctx.lineTo(x, h - 5); ctx.stroke();
        }

        // White Calacatta Quartz Countertop with Gold Vein
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(4, 14, w - 8, 9);
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(4, 22, w - 8, 2); // bevel

        // 2 Glass Beverage Dispensers with Fruit & Brass Spigots
        // Dispenser 1: Cucumber Mint Infused (Green)
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(16, 10, 16, 12);
        ctx.fillStyle = 'rgba(34, 197, 94, 0.45)';
        ctx.fillRect(17, 11, 14, 10);
        ctx.fillStyle = '#15803d'; // cucumber slices
        ctx.fillRect(19, 13, 3, 3); ctx.fillRect(24, 15, 3, 3);
        ctx.fillStyle = '#d4af37'; // brass spigot & lid
        ctx.fillRect(19, 7, 10, 3); ctx.fillRect(23, 19, 3, 3);

        // Dispenser 2: Berry Citrus Infused (Ruby / Amber)
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(38, 10, 16, 12);
        ctx.fillStyle = 'rgba(239, 68, 68, 0.45)';
        ctx.fillRect(39, 11, 14, 10);
        ctx.fillStyle = '#fbbf24'; // lemon slice
        ctx.fillRect(41, 14, 4, 3);
        ctx.fillStyle = '#be123c'; // berries
        ctx.fillRect(47, 15, 3, 3);
        ctx.fillStyle = '#d4af37'; // brass spigot & lid
        ctx.fillRect(41, 7, 10, 3); ctx.fillRect(45, 19, 3, 3);

        // 3 Glass Jars for Healthy Nuts / Granola
        const jars = ['#d97706', '#92400e', '#fef08a'];
        for (let j = 0; j < 3; j++) {
          const jx = 60 + j * 9;
          ctx.fillStyle = '#e2e8f0';
          ctx.fillRect(jx, 12, 7, 9);
          ctx.fillStyle = jars[j];
          ctx.fillRect(jx + 1, 14, 5, 6);
          ctx.fillStyle = '#94a3b8'; // lid
          ctx.fillRect(jx + 1, 11, 5, 2);
        }

        // Stacks of Glass Tumblers
        ctx.fillStyle = 'rgba(56, 189, 248, 0.6)';
        ctx.fillRect(86, 13, 5, 8);
      }
    },

    // 13. Biophilic Planter Divider 2-Tier (3x1.5 tiles = 96x48 px)
    {
      name: 'coworking_biophilic_planter_divider_3x1',
      w: 96, h: 48,
      draw: (ctx, w, h) => {
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(4, 12, w - 8, h - 16);

        // Matte Black Steel Frame & Oak Trough Planter Box
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(6, 18, w - 12, h - 22);
        ctx.fillStyle = '#d97706';
        ctx.fillRect(8, 20, w - 16, 10); // oak insert

        // Dark Rich Soil & River Pebbles
        ctx.fillStyle = '#451a03';
        ctx.fillRect(8, 18, w - 16, 4);

        // Upright Snake Plants (Sansevieria)
        ctx.fillStyle = '#15803d';
        ctx.beginPath();
        for (let x = 14; x < w - 16; x += 14) {
          ctx.moveTo(x - 2, 20); ctx.lineTo(x, 4); ctx.lineTo(x + 2, 20);
        }
        ctx.fill();
        ctx.strokeStyle = '#facc15'; // yellow variegation margins
        ctx.lineWidth = 0.8;
        for (let x = 14; x < w - 16; x += 14) {
          ctx.beginPath();
          ctx.moveTo(x - 2, 20); ctx.lineTo(x, 4); ctx.lineTo(x + 2, 20);
          ctx.stroke();
        }

        // Monstera Broad Leaves
        ctx.fillStyle = '#16a34a';
        ctx.beginPath();
        ctx.ellipse(28, 12, 8, 6, -0.2, 0, Math.PI * 2);
        ctx.ellipse(54, 11, 9, 6, 0.1, 0, Math.PI * 2);
        ctx.ellipse(78, 13, 8, 5, 0.3, 0, Math.PI * 2);
        ctx.fill();

        // Trailing Ivy Vines Cascading Over Edge
        ctx.fillStyle = '#22c55e';
        for (let v = 16; v < w - 16; v += 18) {
          ctx.fillRect(v, 24, 3, 8);
          ctx.fillRect(v + 1, 30, 4, 6);
          ctx.fillRect(v - 2, 34, 3, 5);
        }
      }
    }
  ];

  console.log(`Generating ${spriteDefs.length} Coworking upgrade sprites...`);

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
      const fn = new Function('ctx', 'w', 'h', '(' + fnStr + ')(ctx, w, h)');
      fn(ctx, w, h);
    }, s.draw.toString(), s.w, s.h);

    const canvasHandle = await page.$('#c');
    const outPath = path.join(outDir, `${s.name}.png`);
    await canvasHandle.screenshot({ path: outPath, omitBackground: true });
    console.log(`Created: ${s.name}.png (${s.w}x${s.h})`);
  }

  await browser.close();
  console.log('All 13 Coworking sprites generated successfully!');
})();
