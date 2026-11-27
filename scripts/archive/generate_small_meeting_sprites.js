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
    // 1. Scandinavian Geometric Rug (192x160 px = 6x5 tiles in 32px grid)
    {
      name: 'scandi_geometric_rug_6x5',
      w: 192, h: 160,
      draw: (ctx, w, h) => {
        // Drop shadow
        ctx.fillStyle = 'rgba(0,0,0,0.18)';
        ctx.fillRect(4, 6, w - 8, h - 8);

        // Cream woven linen base
        ctx.fillStyle = '#f1f5f9';
        ctx.fillRect(6, 6, w - 12, h - 12);

        // Subtle weave grid texture
        ctx.fillStyle = '#e2e8f0';
        for (let x = 8; x < w - 8; x += 8) {
          ctx.fillRect(x, 6, 1, h - 12);
        }
        for (let y = 8; y < h - 8; y += 8) {
          ctx.fillRect(6, y, w - 12, 1);
        }

        // Geometric triangles pattern (Mustard, Slate Blue, Teal, Warm Clay)
        const cols = [
          '#eab308', // Mustard
          '#64748b', // Slate
          '#0d9488', // Teal
          '#ea580c', // Clay
          '#3b82f6'  // Sky
        ];

        // Draw rhythmic geometric diamond / triangle patchwork
        const cellW = 30;
        const cellH = 26;
        let cIdx = 0;
        for (let y = 14; y < h - 24; y += cellH) {
          for (let x = 14; x < w - 24; x += cellW) {
            ctx.fillStyle = cols[cIdx % cols.length];
            ctx.beginPath();
            ctx.moveTo(x + cellW / 2, y);
            ctx.lineTo(x + cellW - 2, y + cellH - 4);
            ctx.lineTo(x + 2, y + cellH - 4);
            ctx.closePath();
            ctx.fill();

            // Complementary inner triangle
            ctx.fillStyle = cols[(cIdx + 2) % cols.length];
            ctx.beginPath();
            ctx.moveTo(x + 2, y);
            ctx.lineTo(x + cellW - 2, y);
            ctx.lineTo(x + cellW / 2, y + cellH - 4);
            ctx.closePath();
            ctx.fill();

            cIdx++;
          }
        }

        // Border piping (Charcoal stitch)
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(8, 8, w - 16, h - 16);

        // Fringed edge tassels (Top & Bottom)
        ctx.fillStyle = '#cbd5e1';
        for (let x = 10; x < w - 10; x += 4) {
          ctx.fillRect(x, 4, 2, 3);
          ctx.fillRect(x, h - 7, 2, 3);
        }
      }
    },

    // 2. Smart Huddle Light Oak Oval Table (128x64 px = 4x2 tiles in 32px grid)
    {
      name: 'smart_huddle_oval_table_4x2',
      w: 128, h: 64,
      draw: (ctx, w, h) => {
        // Drop shadow
        ctx.fillStyle = 'rgba(0,0,0,0.32)';
        ctx.beginPath();
        ctx.ellipse(w / 2, h / 2 + 5, 58, 24, 0, 0, Math.PI * 2);
        ctx.fill();

        // Angled Matte Black Metal Legs
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(24, 38, 4, 18);
        ctx.fillRect(100, 38, 4, 18);
        ctx.fillRect(28, 40, 72, 3); // center connecting stretcher
        // Floor glides
        ctx.fillStyle = '#64748b';
        ctx.fillRect(22, 54, 8, 2);
        ctx.fillRect(98, 54, 8, 2);

        // Tabletop Edge Bevel (Darker Oak Shadow)
        ctx.fillStyle = '#b45309';
        ctx.beginPath();
        ctx.ellipse(w / 2, h / 2, 58, 24, 0, 0, Math.PI * 2);
        ctx.fill();

        // Scandinavian Light Oak Tabletop Surface
        ctx.fillStyle = '#d97706';
        ctx.beginPath();
        ctx.ellipse(w / 2, h / 2 - 2, 56, 22, 0, 0, Math.PI * 2);
        ctx.fill();

        // Surface sheen & woodgrain highlight
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.ellipse(w / 2, h / 2 - 3, 52, 19, 0, 0, Math.PI * 2);
        ctx.fill();

        // Fine woodgrain striations
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 0.8;
        for (let y = 18; y <= 42; y += 6) {
          ctx.beginPath();
          ctx.moveTo(28, y);
          ctx.lineTo(100, y);
          ctx.stroke();
        }

        // Center Recessed Aluminum Power & Connectivity Hub
        ctx.fillStyle = '#334155';
        ctx.fillRect(52, 24, 24, 12);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(54, 26, 20, 8);

        // Power outlets & USB ports
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(56, 28, 4, 4);
        ctx.fillRect(68, 28, 4, 4);
        ctx.fillStyle = '#38bdf8'; // Type-C blue port
        ctx.fillRect(63, 29, 2, 2);
      }
    },

    // 3. Huddle Ergonomic Fabric Swivel Chair (16x16 px)
    {
      name: 'huddle_fabric_swivel_chair',
      w: 16, h: 16,
      draw: (ctx, w, h) => {
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(8, 14, 5, 2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Matte black 5-star caster base
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(8, 12); ctx.lineTo(4, 14);
        ctx.moveTo(8, 12); ctx.lineTo(12, 14);
        ctx.moveTo(8, 12); ctx.lineTo(8, 15);
        ctx.stroke();

        // Mustard Yellow Textured Fabric Backrest
        ctx.fillStyle = '#b45309';
        ctx.fillRect(4, 2, 8, 7);
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(5, 3, 6, 6);

        // Seat cushion
        ctx.fillStyle = '#d97706';
        ctx.beginPath();
        ctx.ellipse(8, 9.5, 5, 2.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Sleek black armrests
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(3, 5, 1.5, 4);
        ctx.fillRect(11.5, 5, 1.5, 4);
      }
    },

    // 4. Jabra Conference Speakerphone Puck (16x16 px)
    {
      name: 'jabra_conference_speakerphone_puck',
      w: 16, h: 16,
      draw: (ctx, w, h) => {
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.beginPath();
        ctx.ellipse(8, 9, 6, 3.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Matte Black Body
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(8, 8, 5.5, 0, Math.PI * 2);
        ctx.fill();

        // Micro-perforated Speaker Grille
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.arc(8, 8, 4.5, 0, Math.PI * 2);
        ctx.fill();

        // Active 360-degree Cyan LED Light Ring
        ctx.strokeStyle = '#22d3ee';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(8, 8, 3.5, 0, Math.PI * 2);
        ctx.stroke();

        // Center Aluminum Touch Control Button
        ctx.fillStyle = '#94a3b8';
        ctx.beginPath();
        ctx.arc(8, 8, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    },

    // 5. Smart Wall TV 55-inch Teleconference (96x32 px = 3x1 tiles in 32px grid)
    {
      name: 'smart_wall_tv_teleconference_3x1',
      w: 96, h: 32,
      draw: (ctx, w, h) => {
        // Outer Ultra-thin Black Titanium Bezel
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, w, h);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1;
        ctx.strokeRect(0.5, 0.5, w - 1, h - 1);

        // Screen area
        ctx.fillStyle = '#020617';
        ctx.fillRect(2, 2, w - 4, h - 4);

        // Top Status Header (Google Meet / Zoom Bar)
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(2, 2, w - 4, 7);
        ctx.fillStyle = '#f43f5e'; // Live REC red dot
        ctx.beginPath();
        ctx.arc(6, 5.5, 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 4.5px sans-serif';
        ctx.fillText('GOOGLE MEET • SENIOR DEV & PM INTERVIEW', 11, 6.5);

        // 2x2 Teleconference Participant Grid
        const gridX = 4;
        const gridY = 10;
        const paneW = 42;
        const paneH = 9;

        // Pane 1: Top-Left (Candidate)
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(gridX, gridY, paneW, paneH);
        ctx.strokeStyle = '#22c55e'; // Active speaker green border
        ctx.lineWidth = 0.8;
        ctx.strokeRect(gridX, gridY, paneW, paneH);
        // Candidate avatar
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(gridX + 7, gridY + 4.5, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = '3.5px sans-serif';
        ctx.fillText('Ung Vien (Candidate)', gridX + 13, gridY + 6);

        // Pane 2: Top-Right (Tech Lead)
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(gridX + paneW + 3, gridY, paneW, paneH);
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(gridX + paneW + 10, gridY + 4.5, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = '3.5px sans-serif';
        ctx.fillText('Tech Lead (Tokyo)', gridX + paneW + 16, gridY + 6);

        // Pane 3: Bottom-Left (HR Director)
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(gridX, gridY + paneH + 2, paneW, paneH);
        ctx.fillStyle = '#ec4899';
        ctx.beginPath();
        ctx.arc(gridX + 7, gridY + paneH + 6.5, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = '3.5px sans-serif';
        ctx.fillText('HR Director', gridX + 13, gridY + paneH + 8);

        // Pane 4: Bottom-Right (Design Lead)
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(gridX + paneW + 3, gridY + paneH + 2, paneW, paneH);
        ctx.fillStyle = '#a855f7';
        ctx.beginPath();
        ctx.arc(gridX + paneW + 10, gridY + paneH + 6.5, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = '3.5px sans-serif';
        ctx.fillText('Design Lead', gridX + paneW + 16, gridY + paneH + 8);
      }
    },

    // 6. Smart Teleconference Soundbar & 4K Camera (32x16 px)
    {
      name: 'smart_telecon_soundbar_cam',
      w: 32, h: 16,
      draw: (ctx, w, h) => {
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(2, 9, 28, 4);

        // Soundbar Bar Body
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(2, 5, 28, 6);

        // Fabric Speaker Mesh
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(4, 6, 10, 4);
        ctx.fillRect(18, 6, 10, 4);

        // Center 4K AI Camera Module
        ctx.fillStyle = '#020617';
        ctx.beginPath();
        ctx.arc(16, 8, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#38bdf8'; // Blue glass lens reflection
        ctx.beginPath();
        ctx.arc(16, 8, 1.2, 0, Math.PI * 2);
        ctx.fill();

        // Active Green Micro-LED
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(15.5, 3.5, 1, 1);
      }
    },

    // 7. Mobile Glass Whiteboard Small (16x32 px)
    {
      name: 'mobile_glass_whiteboard_small',
      w: 16, h: 32,
      draw: (ctx, w, h) => {
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.28)';
        ctx.fillRect(2, 28, 12, 3);

        // Rolling Aluminum Leg Frame
        ctx.fillStyle = '#64748b';
        ctx.fillRect(3, 14, 2, 15);
        ctx.fillRect(11, 14, 2, 15);
        ctx.fillRect(1, 28, 6, 2); // Caster foot L
        ctx.fillRect(9, 28, 6, 2); // Caster foot R
        // Casters
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(1, 29.5, 2, 2);
        ctx.fillRect(5, 29.5, 2, 2);
        ctx.fillRect(9, 29.5, 2, 2);
        ctx.fillRect(13, 29.5, 2, 2);

        // Tempered Frosted Glass Board Surface
        ctx.fillStyle = 'rgba(240, 249, 255, 0.95)';
        ctx.fillRect(2, 2, 12, 18);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1;
        ctx.strokeRect(2, 2, 12, 18);

        // Diagram sketches & notes
        ctx.fillStyle = '#2563eb'; // Blue diagram
        ctx.fillRect(4, 5, 4, 3);
        ctx.fillRect(9, 5, 3, 3);
        ctx.strokeStyle = '#2563eb';
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.moveTo(8, 6.5); ctx.lineTo(9, 6.5);
        ctx.stroke();

        ctx.fillStyle = '#f43f5e'; // Red bullet notes
        ctx.fillRect(4, 10, 2, 1);
        ctx.fillRect(4, 13, 2, 1);
        ctx.fillRect(4, 16, 2, 1);

        ctx.fillStyle = '#0f172a'; // Text scribble
        ctx.fillRect(7, 10, 5, 1);
        ctx.fillRect(7, 13, 6, 1);
        ctx.fillRect(7, 16, 4, 1);

        // Aluminum Marker Pen Tray
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(2, 20, 12, 2);
        // Colored markers
        ctx.fillStyle = '#ef4444'; ctx.fillRect(4, 19.5, 2, 1);
        ctx.fillStyle = '#3b82f6'; ctx.fillRect(7, 19.5, 2, 1);
        ctx.fillStyle = '#10b981'; ctx.fillRect(10, 19.5, 2, 1);
      }
    },

    // 8. Minimalist Nordic Wall Clock (16x16 px)
    {
      name: 'wall_clock_minimalist',
      w: 16, h: 16,
      draw: (ctx, w, h) => {
        // Matte Black Rim
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(8, 8, 6.5, 0, Math.PI * 2);
        ctx.fill();

        // White Face Dial
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(8, 8, 5.2, 0, Math.PI * 2);
        ctx.fill();

        // 12, 3, 6, 9 Hour tick marks
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(7.5, 3.5, 1, 1.5);
        ctx.fillRect(7.5, 11, 1, 1.5);
        ctx.fillRect(3.5, 7.5, 1.5, 1);
        ctx.fillRect(11, 7.5, 1.5, 1);

        // Black hour & minute hands
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(8, 8); ctx.lineTo(8, 5); // 12
        ctx.moveTo(8, 8); ctx.lineTo(10.5, 8); // 3:00
        ctx.stroke();

        // Orange accent center pin
        ctx.fillStyle = '#ea580c';
        ctx.beginPath();
        ctx.arc(8, 8, 0.8, 0, Math.PI * 2);
        ctx.fill();
      }
    },

    // 9. Tall Security Filing Cabinet (16x32 px)
    {
      name: 'security_filing_cabinet_tall',
      w: 16, h: 32,
      draw: (ctx, w, h) => {
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.fillRect(1, 28, 14, 4);

        // Dark Charcoal Steel Body
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(1, 2, 14, 28);
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 1;
        ctx.strokeRect(1, 2, 14, 28);

        // 3 Drawer Segments
        [3, 12, 21].forEach((y, idx) => {
          ctx.fillStyle = '#334155';
          ctx.fillRect(2.5, y, 11, 8);
          ctx.strokeStyle = '#1e293b';
          ctx.lineWidth = 0.8;
          ctx.strokeRect(2.5, y, 11, 8);

          // Brushed Aluminum Flush Handle
          ctx.fillStyle = '#cbd5e1';
          ctx.fillRect(5, y + 4, 6, 1.5);

          // Metal label slot
          ctx.fillStyle = '#f8fafc';
          ctx.fillRect(6, y + 1.5, 4, 1.5);
        });

        // Top Drawer Digital Keypad Lock
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(11, 4, 2, 3);
        ctx.fillStyle = '#38bdf8'; // Keypad blue LED
        ctx.fillRect(11.5, 4.5, 1, 1);
      }
    },

    // 10. Corporate Handbook & Archive Bookshelf (32x32 px = 1x1 tile)
    {
      name: 'bookshelf_corporate_handbook',
      w: 32, h: 32,
      draw: (ctx, w, h) => {
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.fillRect(2, 28, 28, 4);

        // Light Oak Wooden Frame
        ctx.fillStyle = '#78350f';
        ctx.fillRect(2, 2, 28, 28);
        ctx.fillStyle = '#b45309';
        ctx.fillRect(3, 3, 26, 26);

        // Shelves backboards (Dark tone)
        ctx.fillStyle = '#451a03';
        ctx.fillRect(4, 5, 24, 7);
        ctx.fillRect(4, 14, 24, 7);
        ctx.fillRect(4, 23, 24, 5);

        // Shelf 1 (Top): Vibrant HR Policy Binders & Trailing Potted Plant
        const bookCols1 = ['#3b82f6', '#3b82f6', '#ef4444', '#ef4444', '#10b981', '#f59e0b'];
        bookCols1.forEach((col, i) => {
          ctx.fillStyle = col;
          ctx.fillRect(5 + i * 2.5, 5.5, 2, 6.5);
        });
        // Mini succulent / trailing vine
        ctx.fillStyle = '#cbd5e1'; // white pot
        ctx.fillRect(21, 8, 4, 4);
        ctx.fillStyle = '#22c55e'; // green leaves spilling down
        ctx.fillRect(21, 6, 5, 3);
        ctx.fillRect(24, 9, 2, 3);

        // Shelf 2 (Middle): Interview Rubrics, Training Manuals & Folders
        const bookCols2 = ['#6366f1', '#6366f1', '#06b6d4', '#06b6d4', '#eab308', '#ec4899', '#64748b'];
        bookCols2.forEach((col, i) => {
          ctx.fillStyle = col;
          ctx.fillRect(5 + i * 2.8, 14.5, 2.2, 6.5);
        });
        // Bookend
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(25, 15, 2, 6);

        // Shelf 3 (Bottom): Heavy Archive Box Files with White Labels
        [5, 12, 19].forEach(bx => {
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(bx, 23.5, 5.5, 4.5);
          ctx.fillStyle = '#f8fafc';
          ctx.fillRect(bx + 1.5, 24.5, 2.5, 2);
        });
      }
    },

    // 11. Compact Laser Printer & Pedestal (16x24 px)
    {
      name: 'compact_printer_scanner',
      w: 16, h: 24,
      draw: (ctx, w, h) => {
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(2, 21, 12, 3);

        // Light Wood Pedestal Stand
        ctx.fillStyle = '#b45309';
        ctx.fillRect(2, 14, 12, 8);
        ctx.fillStyle = '#d97706';
        ctx.fillRect(3, 15, 10, 6);

        // Printer Main Chassis (Matte White/Grey)
        ctx.fillStyle = '#f1f5f9';
        ctx.fillRect(2, 4, 12, 9);
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 0.8;
        ctx.strokeRect(2, 4, 12, 9);

        // Top Scanner Glass Lid (Charcoal)
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(3, 3, 10, 2);

        // Paper output slot & tray
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(4, 9, 8, 2);
        ctx.fillStyle = '#ffffff'; // Paper sheet peeking out
        ctx.fillRect(5, 9.5, 6, 2.5);

        // Status Touch Screen & LED
        ctx.fillStyle = '#38bdf8'; // Screen
        ctx.fillRect(10, 5, 3, 2);
        ctx.fillStyle = '#22c55e'; // Green ready LED
        ctx.fillRect(11, 7.5, 1, 1);
      }
    },

    // 12. Touchless RO Water Purification Cooler (16x32 px)
    {
      name: 'touchless_water_dispenser_cooler',
      w: 16, h: 32,
      draw: (ctx, w, h) => {
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.fillRect(2, 28, 12, 4);

        // Main Sleek Black Piano Tower
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(2, 3, 12, 26);
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 0.8;
        ctx.strokeRect(2, 3, 12, 26);

        // Brushed Stainless Steel Fascia
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(3, 5, 10, 10);

        // Dispensing Recess (Dark cavity)
        ctx.fillStyle = '#020617';
        ctx.fillRect(4, 7, 8, 7);

        // Dual Nozzles (Red Hot & Blue Cold)
        ctx.fillStyle = '#ef4444'; // Hot
        ctx.fillRect(5.5, 8, 1.5, 1.5);
        ctx.fillStyle = '#3b82f6'; // Cold
        ctx.fillRect(9, 8, 1.5, 1.5);

        // Glass tumbler standing in tray
        ctx.fillStyle = 'rgba(56, 189, 248, 0.6)';
        ctx.fillRect(7, 10.5, 2, 3);

        // Stainless Steel Bottom Drip Grille
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(4, 13.5, 8, 1);

        // Lower Cabinet Door Line
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(3, 18); ctx.lineTo(13, 18);
        ctx.stroke();

        // Blue LED Purification Active Indicator
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(7.5, 4, 1, 1);
      }
    },

    // 13. Tea & Refreshment Caddy Organizer (16x16 px)
    {
      name: 'tea_refreshment_caddy',
      w: 16, h: 16,
      draw: (ctx, w, h) => {
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(2, 12, 12, 3);

        // Wooden Box Organizer
        ctx.fillStyle = '#b45309';
        ctx.fillRect(2, 6, 12, 7);
        ctx.fillStyle = '#d97706';
        ctx.fillRect(3, 7, 10, 5);

        // Tea Boxes (Yellow Lipton, Red Twinings, Green Tea)
        ctx.fillStyle = '#eab308'; // Yellow Lipton
        ctx.fillRect(3.5, 4, 3, 4);
        ctx.fillStyle = '#ef4444'; // Red Twinings
        ctx.fillRect(7, 4, 3, 4);
        ctx.fillStyle = '#10b981'; // Green tea
        ctx.fillRect(10.5, 4, 2.5, 4);

        // Stacked White Paper Cups on the side
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(4, 9, 3, 3);
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(4, 10, 3, 1);

        // Stirrer sticks
        ctx.fillStyle = '#78350f';
        ctx.fillRect(9, 8, 1, 3);
        ctx.fillRect(11, 8, 1, 3);
      }
    },

    // 14. Tall Fiddle Leaf Fig in Ceramic Pot (16x32 px)
    {
      name: 'fiddle_leaf_fig_tall_pot',
      w: 16, h: 32,
      draw: (ctx, w, h) => {
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.beginPath();
        ctx.ellipse(8, 30, 6, 2.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Wooden Tripod Stand
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(4, 30); ctx.lineTo(5, 23);
        ctx.moveTo(12, 30); ctx.lineTo(11, 23);
        ctx.moveTo(8, 30.5); ctx.lineTo(8, 23);
        ctx.stroke();

        // White Matte Ceramic Cylinder Pot
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(4, 18, 8, 7);
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1;
        ctx.strokeRect(4, 18, 8, 7);
        // Pot Rim
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(3, 17, 10, 2);
        // Rich potting soil
        ctx.fillStyle = '#451a03';
        ctx.fillRect(4.5, 17, 7, 1);

        // Slender Main Stem
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(8, 17);
        ctx.quadraticCurveTo(7, 10, 8, 3);
        ctx.stroke();

        // Violin-shaped broad lush green leaves
        const leaves = [
          { x: 5, y: 14, rx: 4, ry: 2.5, rot: -0.4 },
          { x: 11, y: 13, rx: 4, ry: 2.5, rot: 0.5 },
          { x: 4, y: 9, rx: 4.5, ry: 3, rot: -0.3 },
          { x: 11.5, y: 8, rx: 4.5, ry: 3, rot: 0.35 },
          { x: 6, y: 4, rx: 4, ry: 3, rot: -0.15 },
          { x: 10, y: 3.5, rx: 4, ry: 3, rot: 0.2 },
          { x: 8, y: 2, rx: 3.5, ry: 3, rot: 0 }
        ];

        leaves.forEach((l, idx) => {
          // Leaf base
          ctx.fillStyle = idx % 2 === 0 ? '#15803d' : '#16a34a';
          ctx.beginPath();
          ctx.ellipse(l.x, l.y, l.rx, l.ry, l.rot, 0, Math.PI * 2);
          ctx.fill();

          // Leaf center highlight
          ctx.fillStyle = '#4ade80';
          ctx.beginPath();
          ctx.ellipse(l.x, l.y - 0.5, l.rx * 0.6, l.ry * 0.5, l.rot, 0, Math.PI * 2);
          ctx.fill();

          // Vein
          ctx.strokeStyle = '#14532d';
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(l.x - 2, l.y);
          ctx.lineTo(l.x + 2, l.y);
          ctx.stroke();
        });
      }
    },

    // 15. Acoustic Wingback Lounge Armchair (20x24 px)
    {
      name: 'acoustic_wingback_armchair',
      w: 20, h: 24,
      draw: (ctx, w, h) => {
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.32)';
        ctx.beginPath();
        ctx.ellipse(10, 22, 8, 2.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Tapered Natural Oak Dowel Legs
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(5, 17); ctx.lineTo(3, 22);
        ctx.moveTo(15, 17); ctx.lineTo(17, 22);
        ctx.moveTo(9, 18); ctx.lineTo(8, 23);
        ctx.moveTo(12, 18); ctx.lineTo(13, 23);
        ctx.stroke();

        // High Acoustic Backrest (Petrol Blue / Deep Teal)
        ctx.fillStyle = '#0f766e';
        ctx.beginPath();
        ctx.moveTo(4, 4);
        ctx.lineTo(16, 4);
        ctx.lineTo(15, 16);
        ctx.lineTo(5, 16);
        ctx.closePath();
        ctx.fill();

        // Sound-dampening Curved Flared Wings
        ctx.fillStyle = '#115e59';
        ctx.beginPath();
        ctx.ellipse(3.5, 8, 2, 5, 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(16.5, 8, 2, 5, -0.2, 0, Math.PI * 2);
        ctx.fill();

        // Backrest Tufted Texture
        ctx.fillStyle = '#14b8a6';
        ctx.fillRect(7, 7, 6, 6);

        // Thick Comfortable Seat Cushion
        ctx.fillStyle = '#0f766e';
        ctx.beginPath();
        ctx.ellipse(10, 15, 7, 3.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#14b8a6';
        ctx.beginPath();
        ctx.ellipse(10, 14.5, 6, 2.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Mustard Yellow Accent Pillow
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.ellipse(10, 13.5, 3.5, 2, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    },

    // 16. Slim Round Scandinavian Accent Side Table (16x16 px)
    {
      name: 'slim_round_side_table',
      w: 16, h: 16,
      draw: (ctx, w, h) => {
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(8, 14, 5.5, 2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Matte black metal tripod hairpin legs
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(5, 7); ctx.lineTo(3, 14);
        ctx.moveTo(11, 7); ctx.lineTo(13, 14);
        ctx.moveTo(8, 8); ctx.lineTo(8, 14.5);
        ctx.stroke();

        // Light Oak Round Tabletop
        ctx.fillStyle = '#b45309';
        ctx.beginPath();
        ctx.ellipse(8, 6.5, 6.5, 3.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.ellipse(8, 6, 5.5, 2.8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Forbes / Bloomberg Business Magazine on top
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(6, 4.5, 4, 3);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(7, 5, 2, 1);
      }
    },

    // 17. Brushed Brass Arched Floor Lamp (16x32 px)
    {
      name: 'brass_standing_floor_lamp',
      w: 16, h: 32,
      draw: (ctx, w, h) => {
        // Heavy brass round base shadow
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.beginPath();
        ctx.ellipse(8, 30, 5, 2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Brass Base Disc
        ctx.fillStyle = '#b45309';
        ctx.beginPath();
        ctx.ellipse(8, 29, 4, 1.8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.ellipse(8, 28.5, 3.2, 1.2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Slender Gracefully Arched Brass Stem
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(8, 28);
        ctx.lineTo(8, 12);
        ctx.quadraticCurveTo(8, 4, 12, 4);
        ctx.stroke();

        // Hanging Bell Shade (Brushed Brass)
        ctx.fillStyle = '#b45309';
        ctx.beginPath();
        ctx.moveTo(10, 5);
        ctx.lineTo(14, 5);
        ctx.lineTo(15, 8);
        ctx.lineTo(9, 8);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(10, 5, 4, 2);

        // Warm Glowing Light Cone
        ctx.fillStyle = 'rgba(254, 240, 138, 0.45)';
        ctx.beginPath();
        ctx.moveTo(12, 8);
        ctx.lineTo(16, 20);
        ctx.lineTo(8, 20);
        ctx.closePath();
        ctx.fill();

        // Illuminated bulb center
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(12, 8.5, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    },

    // 18. Abstract Nordic Canvas Wall Art (24x16 px)
    {
      name: 'abstract_canvas_wall_art',
      w: 24, h: 16,
      draw: (ctx, w, h) => {
        // Thin Oak Frame
        ctx.fillStyle = '#78350f';
        ctx.fillRect(1, 1, w - 2, h - 2);

        // Off-white Matte Canvas
        ctx.fillStyle = '#fdfbf7';
        ctx.fillRect(2, 2, w - 4, h - 4);

        // Terracotta & Sage Green Organic Bauhaus Shapes
        ctx.fillStyle = '#c2410c'; // Terracotta arc
        ctx.beginPath();
        ctx.arc(8, 10, 5, Math.PI, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#047857'; // Sage green circle
        ctx.beginPath();
        ctx.arc(16, 6, 3.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#eab308'; // Mustard accent bar
        ctx.fillRect(13, 10, 7, 2);

        ctx.strokeStyle = '#1e293b'; // Fine black arch
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.arc(8, 10, 7, Math.PI * 1.1, Math.PI * 1.9);
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
  console.log(`All ${spriteDefs.length} Small Meeting & Interview Pod sprites successfully generated!`);
})();
