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
    // 1. Scandinavian Geometric Wool Rug (192x160 px = 6x5 tiles in 32px grid)
    {
      name: 'pm_scandi_geometric_rug_6x5',
      w: 192, h: 160,
      draw: (ctx, w, h) => {
        // Drop shadow
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.fillRect(4, 6, w - 8, h - 8);

        // Warm Cream / Off-white Wool Base
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(6, 6, w - 12, h - 12);

        // Fringed top and bottom edges
        ctx.fillStyle = '#e2e8f0';
        for (let x = 8; x < w - 8; x += 3) {
          ctx.fillRect(x, 4, 1.5, 3);
          ctx.fillRect(x, h - 7, 1.5, 3);
        }

        // Inner Border
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1;
        ctx.strokeRect(10, 10, w - 20, h - 20);

        // Geometric Diamond & Triangle Scandinavian Pattern
        const colors = ['#f59e0b', '#334155', '#ea580c', '#0d9488', '#94a3b8'];
        const cols = 8;
        const rows = 6;
        const dw = (w - 28) / cols;
        const dh = (h - 28) / rows;

        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const x = 14 + c * dw;
            const y = 14 + r * dh;
            const colorIdx = (c + r * 2) % colors.length;

            ctx.fillStyle = colors[colorIdx];
            ctx.beginPath();
            ctx.moveTo(x + dw / 2, y + 2);
            ctx.lineTo(x + dw - 2, y + dh / 2);
            ctx.lineTo(x + dw / 2, y + dh - 2);
            ctx.lineTo(x + 2, y + dh / 2);
            ctx.closePath();
            ctx.fill();

            // Inner contrasting diamond
            ctx.fillStyle = colors[(colorIdx + 2) % colors.length];
            ctx.beginPath();
            ctx.moveTo(x + dw / 2, y + 6);
            ctx.lineTo(x + dw - 6, y + dh / 2);
            ctx.lineTo(x + dw / 2, y + dh - 6);
            ctx.lineTo(x + 6, y + dh / 2);
            ctx.closePath();
            ctx.fill();
          }
        }

        // Subtle weave texture lines
        ctx.fillStyle = 'rgba(0,0,0,0.03)';
        for (let y = 10; y < h - 10; y += 4) {
          ctx.fillRect(10, y, w - 20, 1);
        }
      }
    },

    // 2. Agile Standing Desk (128x64 px = 4x2 tiles in 32px grid)
    {
      name: 'pm_agile_standing_desk_4x2',
      w: 128, h: 64,
      draw: (ctx, w, h) => {
        // Drop shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(8, 12, w - 16, h - 16);

        // A-Frame Matte Black Steel Legs
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(18, 22, 6, 36);
        ctx.fillRect(w - 24, 22, 6, 36);
        // Feet
        ctx.fillRect(14, 56, 14, 4);
        ctx.fillRect(w - 28, 56, 14, 4);
        // Crossbar
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(24, 40, w - 48, 3);

        // Light Oak Wooden Desktop
        ctx.fillStyle = '#d4a373';
        ctx.fillRect(10, 10, w - 20, 24);

        // Desktop Top Edge Highlight & Wood Planks
        ctx.fillStyle = '#faedcd';
        ctx.fillRect(10, 10, w - 20, 2);
        ctx.fillStyle = '#b08968';
        ctx.fillRect(10, 32, w - 20, 3); // Beveled underside shadow

        // Wood grain lines
        ctx.fillStyle = 'rgba(176, 137, 104, 0.4)';
        ctx.fillRect(14, 16, w - 28, 1);
        ctx.fillRect(14, 24, w - 28, 1);

        // --- Desktop Items ---
        // 1. Camel Leather Desk Blotter in center
        ctx.fillStyle = '#b45309';
        ctx.fillRect(44, 13, 48, 18);
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 0.8;
        ctx.strokeRect(45, 14, 46, 16);

        // 2. MacBook Pro (center on blotter)
        ctx.fillStyle = '#94a3b8'; // Aluminum base
        ctx.fillRect(58, 22, 20, 8);
        ctx.fillStyle = '#0f172a'; // Screen bezel
        ctx.fillRect(59, 13, 18, 9);
        ctx.fillStyle = '#38bdf8'; // Retina screen
        ctx.fillRect(60, 14, 16, 7);
        // Code / UI Wireframe rows on screen
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(62, 16, 6, 1);
        ctx.fillRect(62, 18, 10, 1);
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(69, 16, 4, 1);

        // 3. Vertical Pivot 27" Monitor on Left
        ctx.fillStyle = '#020617';
        ctx.fillRect(24, 10, 14, 22); // Screen bezel
        ctx.fillStyle = '#0369a1';
        ctx.fillRect(25, 11, 12, 20); // Screen surface
        // Jira / Kanban Swimlanes on vertical monitor
        ctx.fillStyle = '#38bdf8'; // To Do lane
        ctx.fillRect(26, 12, 10, 2);
        ctx.fillStyle = '#fde047'; // Task card
        ctx.fillRect(27, 15, 8, 2);
        ctx.fillStyle = '#fb923c'; // In Progress lane
        ctx.fillRect(26, 19, 10, 2);
        ctx.fillStyle = '#ffffff'; // Task card
        ctx.fillRect(27, 22, 8, 2);
        ctx.fillStyle = '#4ade80'; // Done lane
        ctx.fillRect(26, 26, 10, 2);
        ctx.fillStyle = '#22c55e'; // Task card
        ctx.fillRect(27, 28, 8, 2);
        // Monitor stand
        ctx.fillStyle = '#64748b';
        ctx.fillRect(29, 31, 4, 3);
        ctx.fillRect(27, 33, 8, 1);

        // 4. Sprint Planner Notebook on right
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(96, 15, 12, 15);
        ctx.fillStyle = '#f8fafc'; // Pages
        ctx.fillRect(97, 16, 10, 13);
        // Spiral spine & ribbon bookmark
        ctx.fillStyle = '#e2e8f0';
        for (let sy = 16; sy < 28; sy += 2) {
          ctx.fillRect(96, sy, 1.5, 1);
        }
        ctx.fillStyle = '#ef4444'; // Red ribbon bookmark
        ctx.fillRect(101, 17, 1.5, 13);

        // 5. Ceramic Coffee Mug (Teal)
        ctx.fillStyle = '#0d9488';
        ctx.fillRect(112, 20, 6, 7);
        ctx.fillStyle = '#14b8a6';
        ctx.fillRect(117, 22, 2, 3); // Handle
        ctx.fillStyle = '#78350f'; // Dark coffee inside
        ctx.fillRect(113, 20, 4, 2);

        // 6. Pen Holder with colorful markers
        ctx.fillStyle = '#475569';
        ctx.fillRect(40, 18, 5, 8);
        ctx.fillStyle = '#ef4444'; // Red pen
        ctx.fillRect(41, 14, 1, 4);
        ctx.fillStyle = '#22c55e'; // Green pen
        ctx.fillRect(42, 13, 1, 5);
        ctx.fillStyle = '#3b82f6'; // Blue pen
        ctx.fillRect(43, 15, 1, 3);
      }
    },

    // 3. Ergonomic Task Chair Mustard (32x32 px)
    {
      name: 'pm_ergonomic_task_chair_mustard',
      w: 32, h: 32,
      draw: (ctx, w, h) => {
        // Drop shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(16, 26, 9, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // 5-Star Chrome Rolling Base
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1.5;
        const angles = [0, 72, 144, 216, 288];
        angles.forEach(a => {
          const rad = (a * Math.PI) / 180;
          ctx.beginPath();
          ctx.moveTo(16, 22);
          ctx.lineTo(16 + Math.cos(rad) * 9, 22 + Math.sin(rad) * 4);
          ctx.stroke();
          // Caster wheel
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(15 + Math.cos(rad) * 9, 21 + Math.sin(rad) * 4, 2, 2);
        });

        // Hydraulic Cylinder
        ctx.fillStyle = '#334155';
        ctx.fillRect(15, 18, 2, 4);

        // Mustard Cushion Seat
        ctx.fillStyle = '#b45309'; // Shadow
        ctx.beginPath();
        ctx.roundRect(8, 14, 16, 7, 3);
        ctx.fill();
        ctx.fillStyle = '#f59e0b'; // Amber fabric
        ctx.beginPath();
        ctx.roundRect(9, 13, 14, 6, 2);
        ctx.fill();
        ctx.fillStyle = '#fbbf24'; // Highlight
        ctx.fillRect(11, 14, 10, 2);

        // Breathable Mesh Backrest (Mustard & Lumbar)
        ctx.fillStyle = '#0f172a'; // Frame
        ctx.beginPath();
        ctx.roundRect(7, 3, 18, 11, 3);
        ctx.fill();

        ctx.fillStyle = '#d97706'; // Mesh base
        ctx.fillRect(9, 5, 14, 8);
        ctx.fillStyle = '#f59e0b'; // Mesh pattern
        for (let my = 5; my < 13; my += 2) {
          ctx.fillRect(9, my, 14, 1);
        }

        // Black Lumbar Support bar
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(9, 9, 14, 2);

        // 3D Armrests
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(6, 10, 3, 7);
        ctx.fillRect(23, 10, 3, 7);
        ctx.fillStyle = '#0f172a'; // Arm pads
        ctx.fillRect(5, 9, 4, 2);
        ctx.fillRect(23, 9, 4, 2);
      }
    },

    // 4. Sprint 1-on-1 Guest Chair Pair (64x32 px)
    {
      name: 'pm_sprint_guest_chair_pair',
      w: 64, h: 32,
      draw: (ctx, w, h) => {
        const drawChair = (cx) => {
          // Drop shadow
          ctx.fillStyle = 'rgba(0,0,0,0.25)';
          ctx.beginPath();
          ctx.ellipse(cx, 24, 10, 4, 0, 0, Math.PI * 2);
          ctx.fill();

          // Polished Chrome Cantilever Sled Legs
          ctx.strokeStyle = '#cbd5e1';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(cx - 9, 24);
          ctx.lineTo(cx + 9, 24);
          ctx.lineTo(cx + 9, 16);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(cx - 9, 24);
          ctx.lineTo(cx - 9, 16);
          ctx.stroke();

          // Charcoal Heather Seat Cushion
          ctx.fillStyle = '#1e293b';
          ctx.beginPath();
          ctx.roundRect(cx - 10, 13, 20, 8, 3);
          ctx.fill();
          ctx.fillStyle = '#475569';
          ctx.beginPath();
          ctx.roundRect(cx - 9, 12, 18, 7, 2);
          ctx.fill();
          ctx.fillStyle = '#64748b';
          ctx.fillRect(cx - 7, 13, 14, 2);

          // Chair Backrest (facing desk / north)
          ctx.fillStyle = '#334155';
          ctx.beginPath();
          ctx.roundRect(cx - 9, 4, 18, 9, 2);
          ctx.fill();
          ctx.fillStyle = '#475569';
          ctx.fillRect(cx - 8, 5, 16, 7);

          // Top chrome handle
          ctx.fillStyle = '#e2e8f0';
          ctx.fillRect(cx - 6, 3, 12, 1.5);
        };

        drawChair(16);
        drawChair(48);
      }
    },

    // 5. Wall Mounted Kanban Board (96x32 px = 3x1 tiles)
    {
      name: 'wall_mounted_kanban_board_3x1',
      w: 96, h: 32,
      draw: (ctx, w, h) => {
        // Drop shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(2, 2, w - 4, h - 2);

        // Aluminum Outer Frame
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#f8fafc'; // Whiteboard surface
        ctx.fillRect(2, 2, w - 4, h - 6);

        // 3 Column Dividers
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1;
        const c1 = 32;
        const c2 = 64;
        ctx.beginPath();
        ctx.moveTo(c1, 2); ctx.lineTo(c1, h - 4);
        ctx.moveTo(c2, 2); ctx.lineTo(c2, h - 4);
        ctx.stroke();

        // Column 1 Header: TO DO (Blue)
        ctx.fillStyle = '#2563eb';
        ctx.fillRect(4, 4, 25, 4);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 3px sans-serif';
        ctx.fillText('TO DO', 7, 7);

        // Column 2 Header: IN PROGRESS (Amber)
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(c1 + 3, 4, 26, 4);
        ctx.fillStyle = '#ffffff';
        ctx.fillText('PROGRESS', c1 + 5, 7);

        // Column 3 Header: DONE (Green)
        ctx.fillStyle = '#10b981';
        ctx.fillRect(c2 + 3, 4, 25, 4);
        ctx.fillStyle = '#ffffff';
        ctx.fillText('DONE', c2 + 8, 7);

        // Sticky Notes in Column 1 (To Do)
        const c1Notes = [
          { x: 5, y: 10, color: '#fde047' }, // Yellow
          { x: 17, y: 10, color: '#f472b6' }, // Pink
          { x: 5, y: 17, color: '#38bdf8' }, // Cyan
          { x: 17, y: 17, color: '#fde047' }, // Yellow
          { x: 10, y: 22, color: '#fb923c' }  // Orange
        ];
        c1Notes.forEach(n => {
          ctx.fillStyle = n.color;
          ctx.fillRect(n.x, n.y, 9, 5);
          ctx.fillStyle = 'rgba(0,0,0,0.3)';
          ctx.fillRect(n.x + 1, n.y + 2, 7, 0.8);
          ctx.fillRect(n.x + 1, n.y + 3.5, 5, 0.8);
        });

        // Sticky Notes in Column 2 (In Progress)
        const c2Notes = [
          { x: c1 + 4, y: 10, color: '#fb923c' },
          { x: c1 + 16, y: 10, color: '#fde047' },
          { x: c1 + 6, y: 17, color: '#a78bfa' }, // Purple
          { x: c1 + 17, y: 17, color: '#38bdf8' }
        ];
        c2Notes.forEach(n => {
          ctx.fillStyle = n.color;
          ctx.fillRect(n.x, n.y, 9, 5);
          ctx.fillStyle = 'rgba(0,0,0,0.3)';
          ctx.fillRect(n.x + 1, n.y + 2, 7, 0.8);
          // Progress bar
          ctx.fillStyle = '#22c55e';
          ctx.fillRect(n.x + 1, n.y + 3.5, 4, 1);
        });

        // Sticky Notes in Column 3 (Done) with Checkmarks
        const c3Notes = [
          { x: c2 + 4, y: 10, color: '#fde047' },
          { x: c2 + 16, y: 10, color: '#4ade80' },
          { x: c2 + 5, y: 16, color: '#38bdf8' },
          { x: c2 + 16, y: 16, color: '#fde047' },
          { x: c2 + 10, y: 22, color: '#4ade80' }
        ];
        c3Notes.forEach(n => {
          ctx.fillStyle = n.color;
          ctx.fillRect(n.x, n.y, 9, 5);
          // Green Checkmark
          ctx.fillStyle = '#15803d';
          ctx.fillRect(n.x + 6, n.y + 1, 2, 2);
        });

        // Marker Pen Tray at bottom
        ctx.fillStyle = '#64748b';
        ctx.fillRect(20, h - 4, 56, 2);
        ctx.fillStyle = '#ef4444'; ctx.fillRect(24, h - 3.5, 6, 1);
        ctx.fillStyle = '#2563eb'; ctx.fillRect(32, h - 3.5, 6, 1);
        ctx.fillStyle = '#16a34a'; ctx.fillRect(40, h - 3.5, 6, 1);
        ctx.fillStyle = '#0f172a'; ctx.fillRect(48, h - 3.5, 6, 1); // Eraser
      }
    },

    // 6. PM Roadmap & Burndown Display (64x32 px = 2x1 tiles)
    {
      name: 'pm_roadmap_burndown_display_2x1',
      w: 64, h: 32,
      draw: (ctx, w, h) => {
        // Drop shadow
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.fillRect(2, 2, w - 4, h - 2);

        // Thin Black TV Bezel
        ctx.fillStyle = '#020617';
        ctx.fillRect(0, 0, w, h - 2);

        // Dark Dashboard Screen
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(2, 2, w - 4, h - 6);

        // Top Status Bar
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(2, 2, w - 4, 5);
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 3.5px sans-serif';
        ctx.fillText('SPRINT 42 ROADMAP', 4, 5.5);

        // 88% Velocity Metric Pill on right
        ctx.fillStyle = '#065f46';
        ctx.fillRect(w - 20, 3, 16, 3.5);
        ctx.fillStyle = '#34d399';
        ctx.font = 'bold 2.5px monospace';
        ctx.fillText('94% DONE', w - 18, 5.5);

        // Burndown Chart Graph Area (Left half)
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(4, 9, 26, 14);

        // Ideal burndown line (Dashed Grey)
        ctx.strokeStyle = '#64748b';
        ctx.setLineDash([2, 1]);
        ctx.beginPath();
        ctx.moveTo(5, 10);
        ctx.lineTo(29, 22);
        ctx.stroke();
        ctx.setLineDash([]);

        // Actual Burndown Line (Stepped Bright Green to Cyan)
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(5, 10);
        ctx.lineTo(10, 11);
        ctx.lineTo(14, 15);
        ctx.lineTo(20, 16);
        ctx.lineTo(25, 21);
        ctx.lineTo(29, 22);
        ctx.stroke();

        // Release Roadmap Gantt Bars (Right half)
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(34, 9, 26, 14);

        // Gantt row 1 (MVP)
        ctx.fillStyle = '#a855f7';
        ctx.fillRect(36, 11, 14, 2.5);
        // Gantt row 2 (Design Review)
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(42, 15, 16, 2.5);
        // Gantt row 3 (QA & Release)
        ctx.fillStyle = '#06b6d4';
        ctx.fillRect(48, 19, 11, 2.5);

        // TV Chin LED
        ctx.fillStyle = '#3b82f6';
        ctx.fillRect(w / 2 - 1, h - 3.5, 2, 1);
      }
    },

    // 7. Pomodoro & Trophy Wall Shelf (32x32 px)
    {
      name: 'pm_pomodoro_trophy_shelf',
      w: 32, h: 32,
      draw: (ctx, w, h) => {
        // Floating Oak Wood Shelf
        ctx.fillStyle = '#78350f';
        ctx.fillRect(2, 20, 28, 4);
        ctx.fillStyle = '#b45309';
        ctx.fillRect(2, 20, 28, 1); // Highlight
        // Shelf brackets
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(6, 24, 2, 4);
        ctx.fillRect(24, 24, 2, 4);

        // Gold Trophy Cup (Left)
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.moveTo(7, 10);
        ctx.lineTo(13, 10);
        ctx.lineTo(12, 16);
        ctx.lineTo(8, 16);
        ctx.closePath();
        ctx.fill();
        // Trophy base
        ctx.fillStyle = '#78350f';
        ctx.fillRect(8.5, 17, 3, 3);
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(7, 19, 6, 1.5);
        // Trophy handles
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(6.5, 12, 2, 0, Math.PI * 2);
        ctx.arc(13.5, 12, 2, 0, Math.PI * 2);
        ctx.stroke();

        // Red Pomodoro Tomato Timer (Center)
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(17, 15, 3.5, 0, Math.PI * 2);
        ctx.fill();
        // Tomato green stem
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(16.5, 10.5, 1, 2);
        ctx.fillRect(15.5, 11.5, 3, 0.8);
        // White dial markers
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(15.5, 15, 3, 0.8);

        // Mini Trailing Succulent Plant in Terracotta pot (Right)
        ctx.fillStyle = '#ea580c'; // Pot
        ctx.fillRect(23, 15, 6, 5);
        ctx.fillStyle = '#15803d'; // Green foliage
        ctx.beginPath();
        ctx.arc(26, 13, 3, 0, Math.PI * 2);
        ctx.fill();
        // Trailing vines
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(24, 18); ctx.lineTo(23, 26);
        ctx.moveTo(27, 18); ctx.lineTo(28, 28);
        ctx.stroke();
      }
    },

    // 8. Agile Library & Spec Bookshelf (32x64 px = 1x2 tiles)
    {
      name: 'pm_agile_library_bookshelf_1x2',
      w: 32, h: 64,
      draw: (ctx, w, h) => {
        // Drop shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(2, 6, w - 4, h - 6);

        // Oak Bookshelf Frame
        ctx.fillStyle = '#b45309';
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#d4a373';
        ctx.fillRect(2, 2, w - 4, h - 4);

        // 3 Shelves
        const sY = [18, 36, 54];
        sY.forEach(y => {
          ctx.fillStyle = '#92400e';
          ctx.fillRect(2, y, w - 4, 3);
        });

        // Top Shelf: Thick Project Binders (Blue, Red, Green, Orange)
        const binders = [
          { x: 4, w: 4, h: 14, color: '#2563eb' },
          { x: 9, w: 4, h: 13, color: '#dc2626' },
          { x: 14, w: 4, h: 15, color: '#16a34a' },
          { x: 19, w: 4, h: 14, color: '#ea580c' },
          { x: 24, w: 4, h: 13, color: '#7c3aed' }
        ];
        binders.forEach(b => {
          ctx.fillStyle = b.color;
          ctx.fillRect(b.x, 18 - b.h, b.w, b.h);
          // Finger ring pull on binder spine
          ctx.fillStyle = '#f8fafc';
          ctx.fillRect(b.x + 1, 18 - b.h / 2, 2, 2);
        });

        // Middle Shelf: Hardcover Books (Scrum, Lean Startup, Design Sprint)
        const books = [
          { x: 4, w: 3, h: 13, color: '#0f766e' },
          { x: 8, w: 3, h: 14, color: '#ca8a04' },
          { x: 12, w: 3, h: 12, color: '#be185d' },
          { x: 16, w: 4, h: 15, color: '#1e293b' }
        ];
        books.forEach(bk => {
          ctx.fillStyle = bk.color;
          ctx.fillRect(bk.x, 36 - bk.h, bk.w, bk.h);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(bk.x + 0.5, 36 - bk.h + 2, bk.w - 1, 1);
        });
        // Leaning book
        ctx.save();
        ctx.translate(22, 36);
        ctx.rotate(-0.25);
        ctx.fillStyle = '#ea580c';
        ctx.fillRect(0, -13, 3, 13);
        ctx.restore();

        // Bottom Shelf: Magazine File Organizers & PRD Archives
        ctx.fillStyle = '#334155';
        ctx.fillRect(4, 40, 7, 14);
        ctx.fillStyle = '#475569';
        ctx.fillRect(12, 40, 7, 14);
        ctx.fillStyle = '#64748b';
        ctx.fillRect(20, 42, 8, 12);
        // Geometric Wood Cube Decor
        ctx.fillStyle = '#d97706';
        ctx.fillRect(23, 48, 5, 5);
      }
    },

    // 9. Fortune Kim Tiền Plant Ceramic Pot (32x40 px)
    {
      name: 'pm_fortune_plant_ceramic_pot',
      w: 32, h: 40,
      draw: (ctx, w, h) => {
        // Drop shadow
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.beginPath();
        ctx.ellipse(16, 36, 8, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Mid-Century Wood Stand Legs
        ctx.fillStyle = '#78350f';
        ctx.fillRect(9, 30, 2, 8);
        ctx.fillRect(21, 30, 2, 8);
        ctx.fillRect(8, 32, 16, 2);

        // Fluted White Ceramic Cylinder Pot
        ctx.fillStyle = '#e2e8f0';
        ctx.beginPath();
        ctx.roundRect(10, 20, 12, 13, 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(11, 21, 10, 11);
        // Vertical fluted grooves
        ctx.fillStyle = '#f1f5f9';
        ctx.fillRect(13, 22, 1, 9);
        ctx.fillRect(16, 22, 1, 9);
        ctx.fillRect(19, 22, 1, 9);

        // Rich Soil
        ctx.fillStyle = '#3f2e21';
        ctx.fillRect(11, 20, 10, 2);

        // Braided Sculptural Pachira Trunk
        ctx.strokeStyle = '#854d0e';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(14, 21); ctx.lineTo(17, 14); ctx.lineTo(15, 8);
        ctx.moveTo(18, 21); ctx.lineTo(15, 14); ctx.lineTo(17, 8);
        ctx.stroke();

        // Lush Glossy Leaves Cluster (Pachira 5-leaf fans)
        const leafClusters = [
          { x: 10, y: 7, r: 5, c: '#15803d' },
          { x: 16, y: 5, r: 6, c: '#16a34a' },
          { x: 22, y: 8, r: 5, c: '#15803d' },
          { x: 13, y: 11, r: 5.5, c: '#22c55e' },
          { x: 19, y: 11, r: 5.5, c: '#16a34a' },
          { x: 16, y: 13, r: 4, c: '#4ade80' }
        ];
        leafClusters.forEach(lc => {
          ctx.fillStyle = lc.c;
          ctx.beginPath();
          ctx.arc(lc.x, lc.y, lc.r, 0, Math.PI * 2);
          ctx.fill();
        });

        // Glossy Highlights on foliage
        ctx.fillStyle = '#86efac';
        ctx.fillRect(15, 3, 2, 2);
        ctx.fillRect(12, 8, 2, 2);
      }
    },

    // 10. PRD Storage Archive Credenza (32x32 px)
    {
      name: 'pm_prd_storage_archive',
      w: 32, h: 32,
      draw: (ctx, w, h) => {
        // Drop shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(2, 6, w - 4, h - 6);

        // 2-Drawer Filing Credenza in Walnut
        ctx.fillStyle = '#78350f';
        ctx.fillRect(2, 8, 28, 22);

        // Drawer 1
        ctx.fillStyle = '#9a3412';
        ctx.fillRect(4, 10, 24, 9);
        ctx.fillStyle = '#f59e0b'; // Brass label pull
        ctx.fillRect(13, 13, 6, 2.5);

        // Drawer 2
        ctx.fillStyle = '#9a3412';
        ctx.fillRect(4, 20, 24, 9);
        ctx.fillStyle = '#f59e0b'; // Brass label pull
        ctx.fillRect(13, 23, 6, 2.5);

        // Top surface: Stack of PRD leather folders
        ctx.fillStyle = '#b45309';
        ctx.fillRect(5, 5, 12, 3);
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(6, 3, 10, 2);
        // Binder clip
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(7, 2, 2, 3);

        // Desk stamp pad
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(20, 4, 6, 4);
        ctx.fillStyle = '#ef4444'; // Red ink pad
        ctx.fillRect(21, 5, 4, 2);
      }
    },

    // 11. Round Brainstorming High Table (32x32 px)
    {
      name: 'pm_brainstorm_round_table_1x1',
      w: 32, h: 32,
      draw: (ctx, w, h) => {
        // Drop shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(16, 26, 12, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        // White Tulip Pedestal Leg & Base
        ctx.fillStyle = '#cbd5e1';
        ctx.beginPath();
        ctx.ellipse(16, 25, 8, 3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(14, 14, 4, 11);

        // White Terrazzo Round Tabletop
        ctx.fillStyle = '#e2e8f0';
        ctx.beginPath();
        ctx.arc(16, 12, 13, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(16, 11, 12, 0, Math.PI * 2);
        ctx.fill();

        // Terrazzo Flecks (Amber, Charcoal, Mint)
        const flecks = [
          { x: 10, y: 7, c: '#f59e0b' },
          { x: 18, y: 6, c: '#334155' },
          { x: 22, y: 11, c: '#0d9488' },
          { x: 14, y: 15, c: '#ea580c' },
          { x: 8, y: 13, c: '#3b82f6' },
          { x: 20, y: 16, c: '#f59e0b' }
        ];
        flecks.forEach(f => {
          ctx.fillStyle = f.c;
          ctx.fillRect(f.x, f.y, 1.5, 1.5);
        });

        // Wireframe Sketchpad on Table
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(11, 8, 9, 8);
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(11, 8, 9, 8);
        // Mobile UI wireframe frame
        ctx.strokeStyle = '#6366f1';
        ctx.strokeRect(13, 9, 5, 6);

        // Dry-erase marker
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(21, 10, 1.5, 4);
      }
    },

    // 12. High Counter Stool Pair (32x32 px)
    {
      name: 'pm_high_stool_pair',
      w: 32, h: 32,
      draw: (ctx, w, h) => {
        const drawStool = (cx, seatColor) => {
          // Drop shadow
          ctx.fillStyle = 'rgba(0,0,0,0.25)';
          ctx.beginPath();
          ctx.ellipse(cx, 27, 5, 2, 0, 0, Math.PI * 2);
          ctx.fill();

          // Black Slim Steel Legs & Footring
          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(cx - 5, 27); ctx.lineTo(cx - 2, 13);
          ctx.moveTo(cx + 5, 27); ctx.lineTo(cx + 2, 13);
          ctx.stroke();

          // Footrest ring
          ctx.strokeStyle = '#334155';
          ctx.beginPath();
          ctx.ellipse(cx, 22, 4, 1.5, 0, 0, Math.PI * 2);
          ctx.stroke();

          // Padded Bucket Seat
          ctx.fillStyle = seatColor;
          ctx.beginPath();
          ctx.ellipse(cx, 12, 6, 3.5, 0, 0, Math.PI * 2);
          ctx.fill();

          // Low Curved Backrest
          ctx.fillStyle = seatColor;
          ctx.beginPath();
          ctx.roundRect(cx - 5, 7, 10, 5, 2);
          ctx.fill();
        };

        drawStool(10, '#0d9488'); // Pastel Teal
        drawStool(22, '#d97706'); // Mustard Amber
      }
    },

    // 13. User Persona & Wireframe Wall Board (32x32 px)
    {
      name: 'pm_user_persona_wireframe_board',
      w: 32, h: 32,
      draw: (ctx, w, h) => {
        // Drop shadow
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.fillRect(2, 2, w - 4, h - 2);

        // Frameless Frosted Glass Board
        ctx.fillStyle = 'rgba(241, 245, 249, 0.9)';
        ctx.fillRect(1, 1, w - 2, h - 3);
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1;
        ctx.strokeRect(1, 1, w - 2, h - 3);

        // Persona 1: Avatar Circle (Blue)
        ctx.fillStyle = '#3b82f6';
        ctx.beginPath();
        ctx.arc(8, 8, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(6, 6, 4, 1); // Silhouette head
        ctx.fillRect(5, 8, 6, 2);
        // Persona trait lines
        ctx.fillStyle = '#64748b';
        ctx.fillRect(14, 6, 14, 1);
        ctx.fillRect(14, 9, 10, 1);

        // Flow Arrow downwards
        ctx.strokeStyle = '#8b5cf6';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(16, 12); ctx.lineTo(16, 17);
        ctx.stroke();

        // Persona 2 / Wireframe Box
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 1;
        ctx.strokeRect(5, 18, 10, 9);
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(6, 19, 8, 2); // Header
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(6, 22, 4, 4); // CTA Button

        // Sticky Notes (Lime green & Lavender)
        ctx.fillStyle = '#a3e635';
        ctx.fillRect(18, 18, 5, 4);
        ctx.fillStyle = '#c084fc';
        ctx.fillRect(24, 18, 5, 4);
        ctx.fillStyle = '#fde047';
        ctx.fillRect(20, 23, 6, 4);
      }
    },

    // 14. Herbal Tea Station & Snack Credenza (64x32 px = 2x1 tiles)
    {
      name: 'pm_herbal_tea_station_credenza',
      w: 64, h: 32,
      draw: (ctx, w, h) => {
        // Drop shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(2, 6, w - 4, h - 6);

        // Walnut Credenza Frame
        ctx.fillStyle = '#78350f';
        ctx.fillRect(0, 8, w, 22);

        // Tambour Slatted Sliding Doors
        ctx.fillStyle = '#9a3412';
        ctx.fillRect(2, 10, w - 4, 18);
        ctx.fillStyle = '#78350f';
        for (let x = 4; x < w - 4; x += 3) {
          ctx.fillRect(x, 10, 1, 18);
        }

        // Top Surface Rim
        ctx.fillStyle = '#b45309';
        ctx.fillRect(0, 8, w, 2);

        // --- Surface Items ---
        // 1. Glass Electric Kettle with Blue Glow
        ctx.fillStyle = '#0284c7'; // Illuminated base
        ctx.fillRect(6, 6, 8, 3);
        ctx.fillStyle = 'rgba(186, 230, 253, 0.85)'; // Glass body
        ctx.fillRect(7, 1, 6, 6);
        ctx.fillStyle = '#0f172a'; // Handle & lid
        ctx.fillRect(6, 0, 8, 1.5);
        ctx.fillRect(5, 2, 2, 4);

        // 2. 6-Compartment Wooden Tea Organizer Box
        ctx.fillStyle = '#b45309';
        ctx.fillRect(18, 2, 18, 7);
        // Colorful tea packet rows
        const teas = ['#22c55e', '#eab308', '#ec4899', '#3b82f6', '#f97316', '#a855f7'];
        for (let i = 0; i < 6; i++) {
          const tx = 19 + (i % 3) * 5.5;
          const ty = 3 + Math.floor(i / 3) * 2.5;
          ctx.fillStyle = teas[i];
          ctx.fillRect(tx, ty, 4.5, 2);
        }

        // 3. Clear Glass Infuser Carafe with Lemon & Mint
        ctx.fillStyle = 'rgba(240, 253, 244, 0.85)';
        ctx.beginPath();
        ctx.roundRect(40, 1, 7, 7, 2);
        ctx.fill();
        ctx.fillStyle = '#facc15'; // Lemon slice
        ctx.fillRect(41, 4, 3, 3);
        ctx.fillStyle = '#22c55e'; // Mint leaf
        ctx.fillRect(43, 2, 2, 2);

        // 4. Porcelain Cookie Jar with Golden Lid
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.roundRect(50, 2, 10, 6, 2);
        ctx.fill();
        ctx.fillStyle = '#f59e0b'; // Gold lid
        ctx.fillRect(51, 1, 8, 1.5);
        ctx.fillStyle = '#d97706';
        ctx.fillRect(54, 0, 2, 1.5);
      }
    },

    // 15. Secure Multifunction Printer & Paper Shredder (32x40 px)
    {
      name: 'pm_secure_paper_shredder_printer',
      w: 32, h: 40,
      draw: (ctx, w, h) => {
        // Drop shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(2, 6, w - 4, h - 6);

        // Lower Unit: Heavy-Duty Cross-Cut Paper Shredder
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(4, 18, 24, 20);

        // Brushed Stainless Steel Face
        ctx.fillStyle = '#334155';
        ctx.fillRect(6, 20, 20, 16);

        // Confetti Viewing Window with Shredded Paper Strips
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(8, 23, 16, 10);
        ctx.fillStyle = '#f8fafc'; // Shredded paper
        for (let sx = 9; sx < 23; sx += 2) {
          ctx.fillRect(sx, 26, 1, 6);
        }

        // Green Power Ready LED
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(22, 21, 2, 1.5);

        // Upper Unit: Multifunction Color Laser Printer
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(3, 4, 26, 14);

        // Dark Gray Scanner Bed Lid
        ctx.fillStyle = '#475569';
        ctx.fillRect(3, 3, 26, 2);

        // Color Touchscreen Display
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(5, 7, 6, 5);

        // Paper Output Tray & Fresh Printed Page
        ctx.fillStyle = '#334155';
        ctx.fillRect(13, 9, 14, 5);
        ctx.fillStyle = '#ffffff'; // Printed sheet
        ctx.fillRect(14, 10, 11, 3);
        ctx.fillStyle = '#3b82f6';
        ctx.fillRect(15, 11, 6, 1);
      }
    },

    // 16. Dual-Compartment Stainless Recycle Bin (32x32 px)
    {
      name: 'pm_dual_compartment_recycle_bin',
      w: 32, h: 32,
      draw: (ctx, w, h) => {
        // Drop shadow
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.beginPath();
        ctx.ellipse(16, 27, 10, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Main Bin Body (Brushed Stainless Steel)
        ctx.fillStyle = '#64748b';
        ctx.beginPath();
        ctx.roundRect(6, 8, 20, 18, 3);
        ctx.fill();
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(7, 9, 18, 16);

        // Center divider line
        ctx.fillStyle = '#475569';
        ctx.fillRect(15.5, 8, 1, 18);

        // Left Lid: Blue (Paper & Docs)
        ctx.fillStyle = '#2563eb';
        ctx.fillRect(7, 7, 8, 2);
        // Blue Recycle Arrow icon
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(10, 13, 2, 2);

        // Right Lid: Green (Bottles & Cans)
        ctx.fillStyle = '#16a34a';
        ctx.fillRect(17, 7, 8, 2);
        // Green Recycle Arrow icon
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(20, 13, 2, 2);

        // Dual Chrome Foot Pedals
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(9, 26, 4, 2);
        ctx.fillRect(19, 26, 4, 2);
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
  console.log(`All ${spriteDefs.length} PM Studio sprites successfully generated!`);
})();
