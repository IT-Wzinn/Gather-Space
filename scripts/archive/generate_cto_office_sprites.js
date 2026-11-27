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
    // 1. CTO Cyber Circuit Board Rug (192x160 px = 6x5 tiles in 32px grid)
    {
      name: 'cto_cyber_circuit_rug_6x5',
      w: 192, h: 160,
      draw: (ctx, w, h) => {
        // Drop shadow
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.fillRect(4, 6, w - 8, h - 8);

        // Dark Obsidian / Carbon Slate Base
        ctx.fillStyle = '#090d16';
        ctx.fillRect(6, 6, w - 12, h - 12);

        // Subtle PCB grid texture
        ctx.fillStyle = '#0f172a';
        for (let x = 12; x < w - 12; x += 12) {
          ctx.fillRect(x, 6, 1, h - 12);
        }
        for (let y = 12; y < h - 12; y += 12) {
          ctx.fillRect(6, y, w - 12, 1);
        }

        // Glowing Neon Cyan & Electric Green Circuit Traces
        ctx.strokeStyle = '#06b6d4'; // Cyan
        ctx.lineWidth = 1.2;

        const traces = [
          // Outer perimeter circuit runs
          [[16, 20], [60, 20], [80, 40], [130, 40], [150, 20], [176, 20]],
          [[16, 140], [50, 140], [70, 120], [120, 120], [140, 140], [176, 140]],
          [[20, 20], [20, 70], [40, 90], [40, 140]],
          [[172, 20], [172, 70], [152, 90], [152, 140]],
          // Internal chip traces
          [[50, 50], [90, 50], [100, 60], [140, 60]],
          [[50, 110], [90, 110], [100, 100], [140, 100]],
          [[70, 60], [70, 100]],
          [[122, 60], [122, 100]]
        ];

        traces.forEach(t => {
          ctx.beginPath();
          ctx.moveTo(t[0][0], t[0][1]);
          for (let i = 1; i < t.length; i++) {
            ctx.lineTo(t[i][0], t[i][1]);
          }
          ctx.stroke();
        });

        // Glowing Solder Nodes & Microchip Pads
        const nodes = [
          { x: 16, y: 20 }, { x: 60, y: 20 }, { x: 80, y: 40 }, { x: 130, y: 40 }, { x: 150, y: 20 }, { x: 176, y: 20 },
          { x: 16, y: 140 }, { x: 50, y: 140 }, { x: 70, y: 120 }, { x: 120, y: 120 }, { x: 140, y: 140 }, { x: 176, y: 140 },
          { x: 20, y: 70 }, { x: 40, y: 90 }, { x: 172, y: 70 }, { x: 152, y: 90 },
          { x: 50, y: 50 }, { x: 140, y: 60 }, { x: 50, y: 110 }, { x: 140, y: 100 }
        ];

        ctx.fillStyle = '#22d3ee';
        nodes.forEach(n => {
          ctx.beginPath();
          ctx.arc(n.x, n.y, 2.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(n.x, n.y, 1, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#22d3ee';
        });

        // Center Microprocessor Die Graphic (Silicon Core)
        const cx = w / 2;
        const cy = h / 2;
        ctx.fillStyle = '#020617';
        ctx.fillRect(cx - 24, cy - 20, 48, 40);
        ctx.strokeStyle = '#10b981'; // Green core
        ctx.lineWidth = 1.5;
        ctx.strokeRect(cx - 24, cy - 20, 48, 40);

        ctx.fillStyle = '#065f46';
        ctx.fillRect(cx - 18, cy - 14, 36, 28);
        ctx.fillStyle = '#34d399';
        ctx.font = 'bold 6px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('CORE AI-8X', cx, cy);

        // Outer Neon Border
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(8, 8, w - 16, h - 16);
      }
    },

    // 2. CTO Smart Height-Adjustable Standing Desk (128x64 px = 4x2 tiles in 32px grid)
    {
      name: 'cto_standing_desk_smart_4x2',
      w: 128, h: 64,
      draw: (ctx, w, h) => {
        // Drop shadow
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.fillRect(8, 12, w - 16, h - 16);

        // Dual Motorized Matte Black Steel Legs & Feet
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(20, 24, 6, 32); // Left leg
        ctx.fillRect(102, 24, 6, 32); // Right leg
        ctx.fillRect(14, 52, 18, 4); // Left foot
        ctx.fillRect(96, 52, 18, 4); // Right foot
        ctx.fillRect(26, 28, 76, 3); // Crossbeam

        // Solid Dark American Walnut Desktop Bevel
        ctx.fillStyle = '#271004';
        ctx.fillRect(10, 10, 108, 38);

        // Desktop Surface
        ctx.fillStyle = '#451a03';
        ctx.fillRect(10, 10, 108, 36);
        ctx.fillStyle = '#78350f';
        ctx.fillRect(12, 12, 104, 32);

        // Full-coverage Felt/Leather Desk Mat (Charcoal)
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(24, 18, 80, 24);
        ctx.strokeStyle = '#38bdf8'; // Subtle cyan stitch
        ctx.lineWidth = 0.8;
        ctx.strokeRect(24, 18, 80, 24);

        // Digital Height Controller Keypad (Right edge)
        ctx.fillStyle = '#020617';
        ctx.fillRect(106, 38, 10, 6);
        ctx.fillStyle = '#38bdf8'; // Blue OLED height readout "105"
        ctx.fillRect(108, 40, 6, 2);

        // Custom Mechanical Keyboard with RGB Underglow (75% layout)
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(48, 28, 24, 10);
        // RGB keycaps rainbow row
        const rgb = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];
        rgb.forEach((c, idx) => {
          ctx.fillStyle = c;
          ctx.fillRect(50 + idx * 4, 30, 3, 3);
          ctx.fillRect(50 + idx * 4, 34, 3, 3);
        });

        // Vertical Ergonomic Mouse (MX Master)
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.ellipse(77, 33, 2.5, 4, 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(76, 31, 1, 2); // Scroll wheel

        // Sony Studio Headphones on Aluminum Stand (Left)
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(30, 36); ctx.lineTo(30, 22);
        ctx.stroke();
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.ellipse(30, 23, 4, 3, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    },

    // 3. Herman Miller Aeron Chair Titanium (16x16 px)
    {
      name: 'herman_miller_aeron_chair_titanium',
      w: 16, h: 16,
      draw: (ctx, w, h) => {
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.32)';
        ctx.beginPath();
        ctx.ellipse(8, 14, 5.5, 2, 0, 0, Math.PI * 2);
        ctx.fill();

        // 5-Star Chrome Swivel Base
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(8, 12); ctx.lineTo(4, 14);
        ctx.moveTo(8, 12); ctx.lineTo(12, 14);
        ctx.moveTo(8, 12); ctx.lineTo(8, 15);
        ctx.stroke();

        // Pellicle Mesh Backrest Frame (Mineral Titanium)
        ctx.fillStyle = '#475569';
        ctx.fillRect(3.5, 1, 9, 8);
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(4.5, 2, 7, 7);

        // Breathable Mesh Pattern
        ctx.fillStyle = '#64748b';
        ctx.fillRect(5, 3, 6, 5);

        // PostureFit SL Lumbar Spine Support
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(6, 4.5, 4, 2);

        // Contoured Pellicle Mesh Seat Pan
        ctx.fillStyle = '#475569';
        ctx.beginPath();
        ctx.ellipse(8, 9.5, 5.5, 2.8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#94a3b8';
        ctx.beginPath();
        ctx.ellipse(8, 9, 4.5, 1.8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Fully Adjustable 3D Armrests
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(2.5, 5, 2, 4);
        ctx.fillRect(11.5, 5, 2, 4);
      }
    },

    // 4. Triple Curved 4K Monitor Array on Heavy Gas-Spring Mount (32x16 px)
    {
      name: 'triple_curved_monitor_rig_mount',
      w: 32, h: 16,
      draw: (ctx, w, h) => {
        // Heavy gas spring desk clamp mount & arms
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(14, 11, 4, 4);
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(16, 12); ctx.lineTo(6, 7);
        ctx.moveTo(16, 12); ctx.lineTo(26, 7);
        ctx.stroke();

        // Screen 1: Left Vertical Code Review Monitor (Vertical pivot)
        ctx.fillStyle = '#020617';
        ctx.fillRect(2, 1, 7, 12);
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 0.8;
        ctx.strokeRect(2, 1, 7, 12);
        // Code lines (Terminal / Log stream)
        ctx.fillStyle = '#10b981'; ctx.fillRect(3.5, 3, 4, 1);
        ctx.fillStyle = '#38bdf8'; ctx.fillRect(3.5, 5, 4, 1);
        ctx.fillStyle = '#f59e0b'; ctx.fillRect(3.5, 7, 3, 1);
        ctx.fillStyle = '#ef4444'; ctx.fillRect(3.5, 9, 4, 1);

        // Screen 2: Center 27" Curved Primary IDE Display
        ctx.fillStyle = '#020617';
        ctx.fillRect(10, 2, 12, 8);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 0.8;
        ctx.strokeRect(10, 2, 12, 8);
        // VS Code editor syntax lines
        ctx.fillStyle = '#c084fc'; ctx.fillRect(11, 3.5, 3, 1); // def/fn
        ctx.fillStyle = '#60a5fa'; ctx.fillRect(15, 3.5, 5, 1); // funcName
        ctx.fillStyle = '#4ade80'; ctx.fillRect(12, 5.5, 7, 1); // string
        ctx.fillStyle = '#f87171'; ctx.fillRect(12, 7.5, 6, 1); // return

        // Screen 3: Right Curved Secondary Display (Terminal/Live Profiler)
        ctx.fillStyle = '#020617';
        ctx.fillRect(23, 2, 8, 8);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 0.8;
        ctx.strokeRect(23, 2, 8, 8);
        // Live charts / CPU thread bars
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(24, 4, 6, 1.5);
        ctx.fillRect(24, 6.5, 4, 1.5);
      }
    },

    // 5. Tech Lead Executive Guest Chair Pair (32x16 px)
    {
      name: 'tech_lead_guest_chair_pair',
      w: 32, h: 16,
      draw: (ctx, w, h) => {
        [3, 17].forEach(bx => {
          // Shadow
          ctx.fillStyle = 'rgba(0,0,0,0.28)';
          ctx.beginPath();
          ctx.ellipse(bx + 6, 14, 5, 2, 0, 0, Math.PI * 2);
          ctx.fill();

          // Chrome Sled Base
          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 1;
          ctx.strokeRect(bx + 2, 12, 8, 3);

          // Charcoal Mesh Backrest
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(bx + 2, 2, 8, 7);
          ctx.fillStyle = '#334155';
          ctx.fillRect(bx + 3, 3, 6, 6);

          // Seat cushion
          ctx.fillStyle = '#1e293b';
          ctx.beginPath();
          ctx.ellipse(bx + 6, 9.5, 4.5, 2.5, 0, 0, Math.PI * 2);
          ctx.fill();

          // Black armrests
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(bx + 1, 5, 1.5, 4);
          ctx.fillRect(bx + 9.5, 5, 1.5, 4);
        });
      }
    },

    // 6. Mini Datacenter 42U Server Rack (16x32 px)
    {
      name: 'mini_datacenter_server_rack_42u',
      w: 16, h: 32,
      draw: (ctx, w, h) => {
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.38)';
        ctx.fillRect(1, 28, 14, 4);

        // Heavy Cold-Rolled Steel Chassis
        ctx.fillStyle = '#020617';
        ctx.fillRect(1, 2, 14, 28);
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1;
        ctx.strokeRect(1, 2, 14, 28);

        // Tinted Perforated Glass Door
        ctx.fillStyle = '#090d16';
        ctx.fillRect(2.5, 3.5, 11, 25);

        // Rack Mounting Rails (1U..4U Server Blades)
        for (let y = 5; y < 27; y += 4) {
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(3.5, y, 9, 3);

          // Server Faceplate detail & Drive Caddies
          ctx.fillStyle = '#475569';
          ctx.fillRect(4.5, y + 0.5, 4, 2);

          // Pulsing Activity LEDs (Green, Blue, Amber)
          ctx.fillStyle = (y % 8 === 5) ? '#22c55e' : '#38bdf8';
          ctx.fillRect(9.5, y + 1, 1, 1);
          ctx.fillStyle = '#f59e0b';
          ctx.fillRect(11, y + 1, 1, 1);
        }

        // Top Exhaust Fan Grille & Blue LED Ambience
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(4, 2.5, 8, 1);
      }
    },

    // 7. Wall-Mounted Telemetry Infrastructure Dashboard (32x16 px)
    {
      name: 'wall_monitor_infra_dashboard_2x1',
      w: 32, h: 16,
      draw: (ctx, w, h) => {
        // Titanium Frame
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, 32, 16);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 0.8;
        ctx.strokeRect(0.5, 0.5, 31, 15);

        // Screen area
        ctx.fillStyle = '#020617';
        ctx.fillRect(2, 2, 28, 12);

        // Header: "K8S CLUSTER • 99.999% SLA"
        ctx.fillStyle = '#22c55e';
        ctx.font = 'bold 3px sans-serif';
        ctx.fillText('K8S PROD: 99.999% SLA', 3, 5.5);

        // Cluster Pods Status (Grid of small green squares)
        for (let r = 0; r < 2; r++) {
          for (let c = 0; c < 5; c++) {
            ctx.fillStyle = '#22c55e'; // healthy pod
            ctx.fillRect(3 + c * 3, 7 + r * 2.5, 2, 1.8);
          }
        }

        // Latency Area Chart (Right pane)
        ctx.fillStyle = 'rgba(56, 189, 248, 0.3)';
        ctx.beginPath();
        ctx.moveTo(19, 13);
        ctx.lineTo(21, 10);
        ctx.lineTo(24, 11);
        ctx.lineTo(27, 8);
        ctx.lineTo(29, 7);
        ctx.lineTo(29, 13);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(19, 13);
        ctx.lineTo(21, 10);
        ctx.lineTo(24, 11);
        ctx.lineTo(27, 8);
        ctx.lineTo(29, 7);
        ctx.stroke();
      }
    },

    // 8. Enterprise Rackmount UPS Power Unit (16x16 px)
    {
      name: 'enterprise_ups_power_unit',
      w: 16, h: 16,
      draw: (ctx, w, h) => {
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.32)';
        ctx.fillRect(2, 13, 12, 2);

        // Chassis
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(2, 4, 12, 10);
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 0.8;
        ctx.strokeRect(2, 4, 12, 10);

        // Digital LCD Voltage Display (230V)
        ctx.fillStyle = '#020617';
        ctx.fillRect(4, 6, 8, 4);
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 3px monospace';
        ctx.fillText('230V', 5, 9);

        // Status LEDs & Red Emergency Switch
        ctx.fillStyle = '#22c55e'; ctx.fillRect(4, 11, 1.5, 1.5);
        ctx.fillStyle = '#3b82f6'; ctx.fillRect(6.5, 11, 1.5, 1.5);
        ctx.fillStyle = '#ef4444'; ctx.fillRect(10, 11, 2, 1.5);
      }
    },

    // 9. Mobile Glass System Architecture Board (32x32 px)
    {
      name: 'system_architecture_glass_board_2x2',
      w: 32, h: 32,
      draw: (ctx, w, h) => {
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(3, 28, 26, 3);

        // Aluminum Leg Stand with Casters
        ctx.fillStyle = '#64748b';
        ctx.fillRect(4, 18, 2, 11);
        ctx.fillRect(26, 18, 2, 11);
        ctx.fillRect(2, 28, 6, 2);
        ctx.fillRect(24, 28, 6, 2);
        // Casters
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(2, 29.5, 2, 2); ctx.fillRect(6, 29.5, 2, 2);
        ctx.fillRect(24, 29.5, 2, 2); ctx.fillRect(28, 29.5, 2, 2);

        // Frosted Glass Board Surface
        ctx.fillStyle = 'rgba(240, 249, 255, 0.94)';
        ctx.fillRect(3, 2, 26, 20);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1;
        ctx.strokeRect(3, 2, 26, 20);

        // Architecture Microservices Diagram
        // 1. API Gateway (Top box)
        ctx.fillStyle = '#3b82f6';
        ctx.fillRect(12, 4, 8, 3.5);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 2.5px sans-serif';
        ctx.fillText('GATEWAY', 12.5, 6.5);

        // Connecting lines down
        ctx.strokeStyle = '#2563eb';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(16, 7.5); ctx.lineTo(8, 11);
        ctx.moveTo(16, 7.5); ctx.lineTo(16, 11);
        ctx.moveTo(16, 7.5); ctx.lineTo(24, 11);
        ctx.stroke();

        // 2. Microservice Pods (3 boxes)
        ctx.fillStyle = '#10b981'; // Auth
        ctx.fillRect(5, 11, 6, 3.5);
        ctx.fillStyle = '#f59e0b'; // Order
        ctx.fillRect(13, 11, 6, 3.5);
        ctx.fillStyle = '#a855f7'; // Payment
        ctx.fillRect(21, 11, 6, 3.5);

        // Kafka Event Bus (Bottom cyan strip)
        ctx.fillStyle = '#06b6d4';
        ctx.fillRect(6, 17, 20, 2);
        ctx.fillStyle = '#ffffff';
        ctx.font = '2px sans-serif';
        ctx.fillText('KAFKA EVENT BUS', 10, 18.5);

        // Marker tray
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(3, 22, 26, 2);
      }
    },

    // 10. O'Reilly Tech Encyclopedia Bookshelf (16x32 px)
    {
      name: 'oreilly_tech_encyclopedia_bookshelf',
      w: 16, h: 32,
      draw: (ctx, w, h) => {
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.fillRect(1, 28, 14, 4);

        // Dark Graphite Frame
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(1, 2, 14, 28);
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(2, 3, 12, 26);

        // 3 Shelves
        [3, 12, 21].forEach((y, sIdx) => {
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(2, y + 8, 12, 1.5);

          // Iconic O'Reilly White Books with Red/Black Top Headers
          for (let b = 0; b < 4; b++) {
            const bx = 3 + b * 2.8;
            ctx.fillStyle = '#f8fafc'; // White spine
            ctx.fillRect(bx, y + 1, 2.4, 7);
            ctx.fillStyle = (b % 2 === 0) ? '#dc2626' : '#0f172a'; // Red/Black banner
            ctx.fillRect(bx, y + 1, 2.4, 1.8);
          }
        });
      }
    },

    // 11. SpaceX Starship & Gundam Tech Showcase (16x32 px)
    {
      name: 'tech_collectibles_display_case',
      w: 16, h: 32,
      draw: (ctx, w, h) => {
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.fillRect(1, 28, 14, 4);

        // Dark Titanium Frame
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(1, 2, 14, 28);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1;
        ctx.strokeRect(1, 2, 14, 28);

        // Illuminated Glass Interior
        ctx.fillStyle = '#020617';
        ctx.fillRect(2.5, 3.5, 11, 25);

        // Shelf 1 (Top): SpaceX Starship Stainless Rocket Model
        ctx.fillStyle = '#e2e8f0'; // Silver hull
        ctx.fillRect(7, 5, 2.5, 7);
        // Nosecone
        ctx.beginPath();
        ctx.moveTo(8.25, 3.5); ctx.lineTo(9.5, 5); ctx.lineTo(7, 5);
        ctx.closePath();
        ctx.fill();
        // Heat shield black back
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(7, 5, 1, 7);

        // Shelf divider
        ctx.fillStyle = '#334155';
        ctx.fillRect(2.5, 13, 11, 1);

        // Shelf 2 (Middle): Gundam Mech Figure (White, Blue, Red, Gold V-fin)
        ctx.fillStyle = '#3b82f6'; // Blue chest
        ctx.fillRect(6.5, 16, 3.5, 3);
        ctx.fillStyle = '#ffffff'; // Head
        ctx.fillRect(7, 14, 2.5, 2);
        ctx.fillStyle = '#fbbf24'; // Gold V-Fin
        ctx.fillRect(6, 13.5, 4.5, 1);
        ctx.fillStyle = '#ef4444'; // Red waist
        ctx.fillRect(7, 19, 2.5, 1.5);
        ctx.fillStyle = '#ffffff'; // Legs
        ctx.fillRect(6, 20.5, 1.5, 3);
        ctx.fillRect(9, 20.5, 1.5, 3);

        // Shelf divider
        ctx.fillStyle = '#334155';
        ctx.fillRect(2.5, 24, 11, 1);

        // Shelf 3 (Bottom): Gold Tech Titan Hackathon Trophy Cup
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(8.25, 26, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(7.25, 27.5, 2, 2);
        ctx.fillRect(6.25, 29, 4, 1.5);
      }
    },

    // 12. Smart Hydroponic Bonsai Planter (16x20 px)
    {
      name: 'hydroponic_bonsai_smart_planter',
      w: 16, h: 20,
      draw: (ctx, w, h) => {
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(8, 18, 5.5, 2, 0, 0, Math.PI * 2);
        ctx.fill();

        // White Smart Planter Base
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(3, 12, 10, 6);
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 0.8;
        ctx.strokeRect(3, 12, 10, 6);

        // Blue Water Level Tube
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(11, 13.5, 1, 3);

        // Miniature Bonsai Twisted Trunk
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(8, 12);
        ctx.quadraticCurveTo(5, 8, 8, 4);
        ctx.stroke();

        // Lush Green Bonsai Foliage Pads
        ctx.fillStyle = '#15803d';
        ctx.beginPath();
        ctx.ellipse(6, 6, 3, 2, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(10, 5, 3.5, 2, 0.3, 0, Math.PI * 2);
        ctx.fill();

        // Overhead Slim LED Grow Light (Halo)
        ctx.strokeStyle = '#c084fc'; // Purple grow light
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(8, 2, 4, Math.PI, Math.PI * 2);
        ctx.stroke();
      }
    },

    // 13. Industrial Credenza Bar Station (32x16 px)
    {
      name: 'cto_industrial_bar_credenza',
      w: 32, h: 16,
      draw: (ctx, w, h) => {
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.32)';
        ctx.fillRect(2, 13, 28, 3);

        // Black Metal & Walnut Cabinet Frame
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(2, 4, 28, 10);
        ctx.fillStyle = '#451a03';
        ctx.fillRect(3, 5, 26, 8);

        // Industrial Slatted Front
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 0.8;
        for (let x = 6; x < 28; x += 4) {
          ctx.beginPath();
          ctx.moveTo(x, 5); ctx.lineTo(x, 13);
          ctx.stroke();
        }

        // Brushed Stainless Top
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(1, 3, 30, 2.5);
      }
    },

    // 14. Dutch Cold Brew Coffee Glass Tower (16x24 px)
    {
      name: 'dutch_cold_brew_glass_tower',
      w: 16, h: 24,
      draw: (ctx, w, h) => {
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(2, 21, 12, 2);

        // Dark Wood Architecture Frame
        ctx.fillStyle = '#451a03';
        ctx.fillRect(3, 2, 1.5, 20);
        ctx.fillRect(11.5, 2, 1.5, 20);
        ctx.fillRect(3, 21, 10, 2); // Base

        // Tier 1 (Top): Glass Ice Water Globe
        ctx.fillStyle = 'rgba(224, 242, 254, 0.8)';
        ctx.beginPath();
        ctx.arc(8, 6, 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Brass Dripper Valve
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(7.5, 9.5, 1, 2);

        // Tier 2 (Middle): Ground Coffee Cylinder Chamber
        ctx.fillStyle = '#271004'; // Dark roasted coffee
        ctx.fillRect(6, 12, 4, 4);
        ctx.strokeStyle = 'rgba(224, 242, 254, 0.8)';
        ctx.strokeRect(6, 12, 4, 4);

        // Tier 3 (Bottom): Glass Carafe collecting rich Cold Brew
        ctx.fillStyle = '#1c0d02';
        ctx.beginPath();
        ctx.arc(8, 18.5, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(224, 242, 254, 0.9)';
        ctx.stroke();
      }
    },

    // 15. Developer Energy Drink Glass Mini-Fridge (16x24 px)
    {
      name: 'developer_energy_drink_mini_fridge',
      w: 16, h: 24,
      draw: (ctx, w, h) => {
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.fillRect(2, 21, 12, 3);

        // Matte Black Chassis
        ctx.fillStyle = '#020617';
        ctx.fillRect(2, 3, 12, 19);
        ctx.strokeStyle = '#22c55e'; // Green LED accent
        ctx.lineWidth = 0.8;
        ctx.strokeRect(2, 3, 12, 19);

        // Tinted Glass Door with Emerald Green Glow
        ctx.fillStyle = '#090d16';
        ctx.fillRect(3.5, 4.5, 9, 16);
        ctx.fillStyle = 'rgba(34, 197, 94, 0.25)';
        ctx.fillRect(4, 5, 8, 15);

        // Shelves with Energy Drink Cans (Red Bull, Monster)
        // Shelf 1: Red Bull (Silver / Blue / Red)
        ctx.fillStyle = '#3b82f6'; ctx.fillRect(4.5, 6, 2, 4);
        ctx.fillStyle = '#ef4444'; ctx.fillRect(5, 7, 1, 1);
        ctx.fillStyle = '#3b82f6'; ctx.fillRect(7.5, 6, 2, 4);
        ctx.fillStyle = '#f59e0b'; ctx.fillRect(10, 6, 2, 4);

        // Shelf divider
        ctx.fillStyle = '#475569';
        ctx.fillRect(4, 11, 8, 0.8);

        // Shelf 2: Monster Energy (Black with Neon Green Claw)
        ctx.fillStyle = '#020617'; ctx.fillRect(4.5, 13, 2, 4);
        ctx.fillStyle = '#22c55e'; ctx.fillRect(5, 14, 1, 2);
        ctx.fillStyle = '#020617'; ctx.fillRect(7.5, 13, 2, 4);
        ctx.fillStyle = '#22c55e'; ctx.fillRect(8, 14, 1, 2);
        ctx.fillStyle = '#d97706'; ctx.fillRect(10, 13, 2, 4); // Mate
      }
    },

    // 16. Brushed Steel Tech & E-Waste Recycle Bin (16x16 px)
    {
      name: 'tech_recycle_wastebin',
      w: 16, h: 16,
      draw: (ctx, w, h) => {
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(8, 14, 5, 2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Brushed Stainless Cylindrical Body
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(4, 4, 8, 10);
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(5, 4, 6, 10);

        // Soft-close pedal
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(7, 13.5, 2, 1.5);

        // Blue E-Waste Recycle Symbol
        ctx.fillStyle = '#3b82f6';
        ctx.beginPath();
        ctx.arc(8, 8.5, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(7.5, 8, 1, 1);
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
  console.log(`All ${spriteDefs.length} CTO Executive Suite sprites successfully generated!`);
})();
