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
    // 1. Dual Motorized Standing Desk Pod (32x32 px)
    {
      name: 'dual_standing_desk_pod_2x2',
      w: 32, h: 32,
      draw: (ctx, w, h) => {
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(2, 6, 28, 24);

        // Black steel frame legs & crossbeams
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(3, 10, 2, 18);
        ctx.fillRect(27, 10, 2, 18);
        ctx.fillRect(3, 20, 26, 2);

        // Light Oak Desk Surfaces (Dual opposing desks)
        // North Desk surface
        ctx.fillStyle = '#d97706';
        ctx.fillRect(2, 6, 28, 9);
        ctx.fillStyle = '#fde68a';
        ctx.fillRect(3, 7, 26, 7);

        // South Desk surface
        ctx.fillStyle = '#d97706';
        ctx.fillRect(2, 17, 28, 9);
        ctx.fillStyle = '#fde68a';
        ctx.fillRect(3, 18, 26, 7);

        // Center Acoustic Felt Partition Screen (Dark Teal)
        ctx.fillStyle = '#0f766e';
        ctx.fillRect(2, 14, 28, 3);
        ctx.fillStyle = '#14b8a6';
        ctx.fillRect(3, 14.5, 26, 1);

        // Cable pass-through grommets
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(6, 13, 2, 1.5);
        ctx.fillRect(24, 13, 2, 1.5);
        ctx.fillRect(6, 17.5, 2, 1.5);
        ctx.fillRect(24, 17.5, 2, 1.5);
      }
    },

    // 2. High-End Ergonomic Mesh Office Chair (16x16 px)
    {
      name: 'ergonomic_mesh_chair_black',
      w: 16, h: 16,
      draw: (ctx, w, h) => {
        // 5-Star Caster Base Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.beginPath();
        ctx.ellipse(8, 13, 5, 2, 0, 0, Math.PI * 2);
        ctx.fill();

        // 5-Star Caster Base (Chrome/Black)
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(8, 12); ctx.lineTo(4, 14);
        ctx.moveTo(8, 12); ctx.lineTo(12, 14);
        ctx.moveTo(8, 12); ctx.lineTo(8, 15);
        ctx.stroke();

        // Pneumatic cylinder
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(7, 9, 2, 3);

        // Contoured Mesh Seat Cushion
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.ellipse(8, 8, 5.5, 3.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#334155';
        ctx.beginPath();
        ctx.ellipse(8, 7.5, 4.5, 2.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Curved Lumbar Mesh Backrest
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(4, 2, 8, 5);
        // Translucent mesh weave pattern
        ctx.fillStyle = '#475569';
        for (let y = 3; y < 6; y += 1.5) {
          ctx.fillRect(5, y, 6, 0.8);
        }

        // Adjustable 3D Armrests
        ctx.fillStyle = '#64748b';
        ctx.fillRect(3, 5, 1.5, 3.5);
        ctx.fillRect(11.5, 5, 1.5, 3.5);
      }
    },

    // 3. UltraWide Curved Monitor on Stand (32x16 px)
    {
      name: 'ultrawide_curved_monitor',
      w: 32, h: 16,
      draw: (ctx, w, h) => {
        // Metal desktop stand base
        ctx.fillStyle = '#475569';
        ctx.fillRect(12, 13, 8, 2);
        ctx.fillStyle = '#64748b';
        ctx.fillRect(15, 9, 2, 4);

        // Curved UltraWide Screen (Bezel)
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.moveTo(2, 3);
        ctx.quadraticCurveTo(16, 5, 30, 3);
        ctx.lineTo(30, 10);
        ctx.quadraticCurveTo(16, 12, 2, 10);
        ctx.closePath();
        ctx.fill();

        // Glowing Screen Display (Code Editor / Chart Dashboard)
        ctx.fillStyle = '#0284c7';
        ctx.beginPath();
        ctx.moveTo(3, 4);
        ctx.quadraticCurveTo(16, 5.8, 29, 4);
        ctx.lineTo(29, 9);
        ctx.quadraticCurveTo(16, 10.8, 3, 9);
        ctx.closePath();
        ctx.fill();

        // Code syntax lines / charts
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(5, 5, 5, 1);
        ctx.fillRect(5, 7, 7, 1);
        ctx.fillStyle = '#4ade80';
        ctx.fillRect(13, 5, 6, 1);
        ctx.fillRect(15, 7, 5, 1);
        ctx.fillStyle = '#f43f5e';
        ctx.fillRect(22, 5, 5, 1.5);
      }
    },

    // 4. Agile Scrum Kanban Mobile Board (32x32 px)
    {
      name: 'agile_scrum_kanban_board_2x1',
      w: 32, h: 32,
      draw: (ctx, w, h) => {
        // Base shadow & caster wheels
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(4, 28, 24, 3);

        // Caster legs
        ctx.fillStyle = '#334155';
        ctx.fillRect(4, 25, 3, 4);
        ctx.fillRect(25, 25, 3, 4);
        ctx.fillRect(5, 28, 2, 2);
        ctx.fillRect(25, 28, 2, 2);

        // Aluminum frame posts
        ctx.fillStyle = '#64748b';
        ctx.fillRect(4, 3, 2, 22);
        ctx.fillRect(26, 3, 2, 22);

        // Whiteboard Body
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(5, 3, 22, 21);
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1;
        ctx.strokeRect(5, 3, 22, 21);

        // 3 Kanban Columns (To Do, In Progress, Done)
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(12, 3); ctx.lineTo(12, 24);
        ctx.moveTo(19, 3); ctx.lineTo(19, 24);
        ctx.stroke();

        // Header titles
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(6, 4, 5, 1.5);
        ctx.fillRect(13, 4, 5, 1.5);
        ctx.fillRect(20, 4, 5, 1.5);

        // Colorful Sticky Notes
        // Column 1: Yellow & Pink
        ctx.fillStyle = '#facc15'; ctx.fillRect(6, 7, 4, 3);
        ctx.fillStyle = '#ec4899'; ctx.fillRect(6, 11, 4, 3);
        ctx.fillStyle = '#facc15'; ctx.fillRect(6, 15, 4, 3);

        // Column 2: Cyan & Orange
        ctx.fillStyle = '#06b6d4'; ctx.fillRect(13, 8, 4, 3);
        ctx.fillStyle = '#f97316'; ctx.fillRect(13, 12, 4, 3);

        // Column 3: Lime Green (Done!)
        ctx.fillStyle = '#22c55e'; ctx.fillRect(20, 7, 4, 3);
        ctx.fillStyle = '#22c55e'; ctx.fillRect(20, 11, 4, 3);
        ctx.fillStyle = '#22c55e'; ctx.fillRect(20, 15, 4, 3);

        // Marker tray at bottom
        ctx.fillStyle = '#475569';
        ctx.fillRect(6, 23, 20, 1.5);
      }
    },

    // 5. Wall TV Analytics Dashboard (32x16 px)
    {
      name: 'wall_tv_analytics_dashboard',
      w: 32, h: 16,
      draw: (ctx, w, h) => {
        // TV Bezel
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(1, 1, 30, 14);
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1;
        ctx.strokeRect(1, 1, 30, 14);

        // Screen area (Dark mode dashboard)
        ctx.fillStyle = '#020617';
        ctx.fillRect(2, 2, 28, 12);

        // Top KPI Cards
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(4, 3, 6, 3);
        ctx.fillRect(12, 3, 6, 3);
        ctx.fillRect(20, 3, 8, 3);
        // Metrics numbers
        ctx.fillStyle = '#22c55e'; ctx.fillRect(5, 4, 4, 1);
        ctx.fillStyle = '#38bdf8'; ctx.fillRect(13, 4, 4, 1);
        ctx.fillStyle = '#facc15'; ctx.fillRect(21, 4, 5, 1);

        // Line Chart (Burndown)
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(4, 12);
        ctx.lineTo(8, 9);
        ctx.lineTo(12, 10);
        ctx.lineTo(16, 7);
        ctx.lineTo(20, 8);
        ctx.lineTo(24, 6);
        ctx.stroke();

        // Bar chart on right
        ctx.fillStyle = '#a855f7';
        ctx.fillRect(26, 9, 1.5, 4);
        ctx.fillRect(28, 7, 1.5, 6);
      }
    },

    // 6. Standing Meeting Round Table (32x32 px)
    {
      name: 'standing_meeting_table_round',
      w: 32, h: 32,
      draw: (ctx, w, h) => {
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(16, 26, 9, 3.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Brushed metal tulip base & high pillar
        ctx.fillStyle = '#64748b';
        ctx.beginPath();
        ctx.ellipse(16, 25, 7, 2.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(15, 13, 2, 12);

        // Circular Light Oak Tabletop
        ctx.fillStyle = '#b45309';
        ctx.beginPath();
        ctx.ellipse(16, 11, 12, 7, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fde68a';
        ctx.beginPath();
        ctx.ellipse(16, 10, 11, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Open Macbook in center of standing table
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(13, 7, 6, 4);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(14, 7.5, 4, 2.5);
      }
    },

    // 7. Enterprise Multifunction Copier & Printer (32x32 px)
    {
      name: 'enterprise_multifunction_printer',
      w: 32, h: 32,
      draw: (ctx, w, h) => {
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.fillRect(3, 8, 26, 22);

        // Printer Main Base Chassis (Office White/Gray)
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(4, 10, 24, 18);
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1;
        ctx.strokeRect(4, 10, 24, 18);

        // Paper Trays (2 Drawers at bottom)
        ctx.fillStyle = '#64748b';
        ctx.fillRect(6, 21, 20, 2.5);
        ctx.fillRect(6, 25, 20, 2.5);
        // Handles
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(14, 21.5, 4, 1);
        ctx.fillRect(14, 25.5, 4, 1);

        // Center Recessed Output Tray with white papers
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(6, 13, 20, 6);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(8, 15, 14, 3);

        // Upper Document Feeder Scanner Unit
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(4, 6, 24, 5);
        ctx.fillStyle = '#334155';
        ctx.fillRect(8, 4, 16, 3); // top document feeder

        // Color Touchscreen Display Control Panel (Pivoting)
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(23, 7, 6, 5);
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(24, 8, 4, 3);

        // Status LED light (Green ready)
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(6, 8, 2, 2);
      }
    },

    // 8. Cross-Cut Paper Shredder Station (16x16 px)
    {
      name: 'paper_shredder_station',
      w: 16, h: 16,
      draw: (ctx, w, h) => {
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(2, 4, 12, 11);

        // Shredder housing (Matte Black)
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(2, 3, 12, 11);
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1;
        ctx.strokeRect(2, 3, 12, 11);

        // Top paper feeding slot
        ctx.fillStyle = '#020617';
        ctx.fillRect(4, 4, 8, 1.5);

        // Clear window showing shredded paper confetti
        ctx.fillStyle = '#334155';
        ctx.fillRect(4, 8, 8, 5);
        ctx.fillStyle = '#ffffff';
        // Shredded paper lines
        ctx.fillRect(5, 9, 2, 3);
        ctx.fillRect(8, 10, 2, 2);
        ctx.fillRect(9, 9, 2, 3);

        // Power LED (Green)
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(11, 4, 1.5, 1.5);
      }
    },

    // 9. Steel Filing Cabinet Tall (16x32 px)
    {
      name: 'steel_filing_cabinet_tall',
      w: 16, h: 32,
      draw: (ctx, w, h) => {
        // Outer cabinet frame (Charcoal Powder-coat Steel)
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(1, 2, 14, 28);
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1;
        ctx.strokeRect(1, 2, 14, 28);

        // 3 Large Filing Drawers
        [4, 12, 20].forEach(y => {
          ctx.fillStyle = '#334155';
          ctx.fillRect(2, y, 12, 7);
          ctx.strokeStyle = '#475569';
          ctx.lineWidth = 0.8;
          ctx.strokeRect(2, y, 12, 7);

          // Chrome label holder card & recessed handle
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(4, y + 2, 4, 2);
          ctx.fillStyle = '#94a3b8';
          ctx.fillRect(9, y + 2, 3, 2);
        });

        // Digital combination lock at top
        ctx.fillStyle = '#020617';
        ctx.fillRect(6, 28, 4, 1.5);
      }
    },

    // 10. Acoustic Phone Booth Pod (16x32 px)
    {
      name: 'acoustic_phone_booth_pod_1x2',
      w: 16, h: 32,
      draw: (ctx, w, h) => {
        // Outer frame (Anodized Dark Gray Aluminum)
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(1, 1, 14, 30);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1;
        ctx.strokeRect(1, 1, 14, 30);

        // Soundproof Interior (Warm illuminated LED)
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(2, 2, 12, 28);
        ctx.fillStyle = 'rgba(254, 240, 138, 0.25)';
        ctx.fillRect(2, 2, 12, 28);

        // Ceiling LED panel
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(4, 2, 8, 2);

        // Internal small wooden standing shelf/desk
        ctx.fillStyle = '#d97706';
        ctx.fillRect(3, 16, 10, 2);

        // Small laptop on shelf
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(4, 14, 4, 2);

        // High padded stool inside
        ctx.fillStyle = '#0f766e';
        ctx.fillRect(6, 21, 4, 3);
        ctx.fillStyle = '#64748b';
        ctx.fillRect(7.5, 24, 1, 4);

        // Tempered glass door diagonal glare
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.beginPath();
        ctx.moveTo(3, 5); ctx.lineTo(9, 5); ctx.lineTo(4, 26); ctx.lineTo(3, 26);
        ctx.fill();

        // Sleek vertical chrome door handle
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(11, 14, 1.5, 6);
      }
    },

    // 11. Snack & Energy Drink Vending Machine (16x32 px)
    {
      name: 'vending_machine_snack',
      w: 16, h: 32,
      draw: (ctx, w, h) => {
        // Outer chassis (Bold Crimson Red)
        ctx.fillStyle = '#991b1b';
        ctx.fillRect(1, 2, 14, 28);
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 1;
        ctx.strokeRect(1, 2, 14, 28);

        // Top illuminated branding header "SNACKS"
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(2, 3, 12, 4);
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 3px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('SNACK', 8, 6);

        // Large Glass Display Window
        ctx.fillStyle = '#020617';
        ctx.fillRect(2, 8, 12, 14);

        // 3 Shelves of Snacks & Drinks
        // Shelf 1: Potato chip bags
        ctx.fillStyle = '#eab308'; ctx.fillRect(3, 10, 2, 3);
        ctx.fillStyle = '#3b82f6'; ctx.fillRect(6, 10, 2, 3);
        ctx.fillStyle = '#22c55e'; ctx.fillRect(9, 10, 2, 3);

        // Shelf 2: Candy bars
        ctx.fillStyle = '#b45309'; ctx.fillRect(3, 15, 2.5, 2);
        ctx.fillStyle = '#ec4899'; ctx.fillRect(6.5, 15, 2.5, 2);
        ctx.fillStyle = '#8b5cf6'; ctx.fillRect(10, 15, 2.5, 2);

        // Shelf 3: Energy drink cans (Red Bull / Monster style)
        ctx.fillStyle = '#06b6d4'; ctx.fillRect(3, 18, 2, 3);
        ctx.fillStyle = '#f43f5e'; ctx.fillRect(6, 18, 2, 3);
        ctx.fillStyle = '#84cc16'; ctx.fillRect(9, 18, 2, 3);

        // Glass reflection
        ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.beginPath();
        ctx.moveTo(3, 9); ctx.lineTo(8, 9); ctx.lineTo(3, 21);
        ctx.fill();

        // Push flap retrieval door & Keypad
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(2, 23, 8, 5);
        ctx.fillStyle = '#475569';
        ctx.fillRect(3, 24, 6, 3); // flap

        // Keypad & Coin/Card reader
        ctx.fillStyle = '#38bdf8'; // digital price screen
        ctx.fillRect(11, 23, 3, 2);
        ctx.fillStyle = '#e2e8f0'; // keypad buttons
        ctx.fillRect(11, 26, 3, 2);
      }
    },

    // 12. Tiered Indoor Office Plant Shelf (32x32 px)
    {
      name: 'tiered_plant_shelf_indoor',
      w: 32, h: 32,
      draw: (ctx, w, h) => {
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(3, 6, 26, 24);

        // Black metal frame A-stand
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(6, 28); ctx.lineTo(10, 6); ctx.lineTo(14, 28);
        ctx.moveTo(18, 28); ctx.lineTo(22, 6); ctx.lineTo(26, 28);
        ctx.stroke();

        // 3 Light oak shelves
        ctx.fillStyle = '#b45309';
        ctx.fillRect(4, 22, 24, 2);
        ctx.fillRect(6, 14, 20, 2);
        ctx.fillRect(9, 6, 14, 2);

        // Top Shelf Plants (Trailing Pothos & succulent)
        ctx.fillStyle = '#f8fafc'; ctx.fillRect(10, 4, 3, 2); // pot
        ctx.fillStyle = '#22c55e'; ctx.fillRect(10, 1, 3, 3);
        ctx.fillStyle = '#15803d'; ctx.fillRect(16, 2, 4, 4); // snake plant

        // Middle Shelf Plants (Peace lily & Calathea)
        ctx.fillStyle = '#ea580c'; ctx.fillRect(8, 11, 4, 3); // terracotta pot
        ctx.fillStyle = '#16a34a'; ctx.fillRect(7, 8, 6, 3);
        ctx.fillStyle = '#ffffff'; ctx.fillRect(9, 7, 2, 2); // white lily bloom
        ctx.fillStyle = '#0f766e'; ctx.fillRect(18, 11, 4, 3);
        ctx.fillStyle = '#22c55e'; ctx.fillRect(17, 8, 6, 3);

        // Bottom Shelf Plants (Large Monstera deliciosa)
        ctx.fillStyle = '#334155'; ctx.fillRect(12, 18, 8, 4);
        ctx.fillStyle = '#14532d';
        ctx.beginPath();
        ctx.arc(16, 16, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(14, 15, 4, 2);
      }
    },

    // 13. Trio Recycling Station (32x16 px)
    {
      name: 'trio_recycle_bin_station',
      w: 32, h: 16,
      draw: (ctx, w, h) => {
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(2, 4, 28, 11);

        // Outer brushed stainless cabinet
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(2, 2, 28, 12);
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 1;
        ctx.strokeRect(2, 2, 28, 12);

        // 3 Separate Sorting Compartments
        // Compartment 1 (Left): Organics (Green)
        ctx.fillStyle = '#16a34a';
        ctx.fillRect(3, 3, 8, 10);
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(7, 5, 2.5, 1.2, 0, 0, Math.PI * 2); // slot
        ctx.fill();
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(6, 8, 2, 2); // apple/leaf icon

        // Compartment 2 (Center): Recyclable Paper/Plastic (Blue)
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(12, 3, 8, 10);
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(16, 5, 2.5, 1.2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(15, 8, 2, 2); // recycle mobius icon

        // Compartment 3 (Right): General Landfill Waste (Dark Gray)
        ctx.fillStyle = '#334155';
        ctx.fillRect(21, 3, 8, 10);
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(25, 5, 2.5, 1.2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(24, 8, 2, 2); // trash can icon
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
  console.log('All 13 Coworking sprites successfully generated!');
})();
