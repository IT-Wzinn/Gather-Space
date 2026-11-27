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
    // 1. Acoustic Soundwave Wool Rug (192x160 px = 6x5 tiles in 32px grid)
    {
      name: 'focus_acoustic_soundwave_rug_6x5',
      w: 192, h: 160,
      draw: (ctx, w, h) => {
        // Drop shadow
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.fillRect(4, 6, w - 8, h - 8);

        // Midnight Plum / Obsidian Charcoal Velvet Base
        ctx.fillStyle = '#181124';
        ctx.fillRect(6, 6, w - 12, h - 12);

        // Inner Border with Silver Stitching
        ctx.strokeStyle = '#3b2d54';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(10, 10, w - 20, h - 20);

        // Concentric Acoustic Sine Wave Curves
        const cx = w / 2;
        const cy = h / 2;
        const waveColors = ['#a855f7', '#818cf8', '#c084fc', '#e9d5ff', '#6366f1'];

        for (let r = 18; r < 75; r += 11) {
          ctx.strokeStyle = waveColors[(r / 11) % waveColors.length];
          ctx.lineWidth = 1;
          ctx.beginPath();
          for (let a = 0; a <= Math.PI * 2; a += 0.05) {
            // Modulate radius with high-frequency soundwave harmonics
            const wave = Math.sin(a * 8) * 3 + Math.cos(a * 4) * 2;
            const px = cx + (r + wave) * Math.cos(a) * 1.15;
            const py = cy + (r + wave) * Math.sin(a) * 0.95;
            if (a === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.stroke();
        }

        // Center Acoustic Focus Diamond / Medallion
        ctx.fillStyle = '#261b38';
        ctx.beginPath();
        ctx.arc(cx, cy, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#c084fc';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        ctx.fillStyle = '#a855f7';
        ctx.beginPath();
        ctx.arc(cx, cy, 5, 0, Math.PI * 2);
        ctx.fill();

        // Silver corner flourishes
        const corners = [
          [14, 14], [w - 14, 14], [14, h - 14], [w - 14, h - 14]
        ];
        ctx.fillStyle = '#e9d5ff';
        corners.forEach(([x, y]) => {
          ctx.fillRect(x - 2, y - 2, 4, 4);
        });
      }
    },

    // 2. Deep Work Acoustic Surround Desk (128x64 px = 4x2 tiles in 32px grid)
    {
      name: 'focus_deep_work_acoustic_desk_4x2',
      w: 128, h: 64,
      draw: (ctx, w, h) => {
        // Drop shadow
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.fillRect(8, 12, w - 16, h - 16);

        // Matte Black Steel Desk Base & Legs
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(18, 22, 6, 36);
        ctx.fillRect(w - 24, 22, 6, 36);
        ctx.fillRect(14, 56, 14, 4);
        ctx.fillRect(w - 28, 56, 14, 4);

        // Dark Walnut Desktop
        ctx.fillStyle = '#422817';
        ctx.fillRect(12, 16, w - 24, 22);
        ctx.fillStyle = '#5c3821';
        ctx.fillRect(12, 16, w - 24, 2); // Highlight
        ctx.fillStyle = '#29180c';
        ctx.fillRect(12, 36, w - 24, 3); // Beveled shadow

        // --- 3-Sided U-Shaped Acoustic Felt Privacy Screens (Heather Charcoal) ---
        ctx.fillStyle = '#1e293b'; // Outer Felt border
        // Rear Wall Acoustic Screen
        ctx.fillRect(10, 4, w - 20, 14);
        // Left Acoustic Wing
        ctx.fillRect(8, 4, 6, 30);
        // Right Acoustic Wing
        ctx.fillRect(w - 14, 4, 6, 30);

        // Acoustic Felt Texture & Sound Absorbing Grooves
        ctx.fillStyle = '#334155';
        ctx.fillRect(12, 6, w - 24, 10);
        ctx.fillRect(10, 6, 4, 26);
        ctx.fillRect(w - 14, 6, 4, 26);

        // Sound-dampening vertical grooves
        ctx.fillStyle = '#1e293b';
        for (let x = 16; x < w - 16; x += 6) {
          ctx.fillRect(x, 6, 1.5, 10);
        }

        // --- Desktop Workstation Items ---
        // 1. Curved 34" Low-Glare E-ink / Matte Screen
        const mx = w / 2 - 20;
        ctx.fillStyle = '#0f172a'; // Curved frame
        ctx.beginPath();
        ctx.roundRect(mx, 12, 40, 15, 2);
        ctx.fill();
        ctx.fillStyle = '#f8fafc'; // E-ink Paper Screen
        ctx.fillRect(mx + 2, 14, 36, 11);
        // Mathematical LaTeX lines & formulas on screen
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(mx + 4, 16, 14, 1.5);
        ctx.fillRect(mx + 20, 16, 16, 1.5);
        ctx.fillRect(mx + 6, 19, 28, 1.2);
        ctx.fillRect(mx + 4, 22, 18, 1.2);
        // Purple Greek letter Psi / Sigma on screen
        ctx.fillStyle = '#7c3aed';
        ctx.fillRect(mx + 26, 21, 8, 2);

        // Screen heavy aluminum pivot stand
        ctx.fillStyle = '#64748b';
        ctx.fillRect(w / 2 - 3, 26, 6, 4);

        // 2. Custom Stealth HHKB Wireless Mechanical Keyboard
        ctx.fillStyle = '#020617';
        ctx.fillRect(w / 2 - 14, 30, 28, 6);
        ctx.fillStyle = '#1e293b'; // Charcoal keycaps
        for (let kx = w / 2 - 12; kx < w / 2 + 12; kx += 3.5) {
          ctx.fillRect(kx, 31, 2.5, 2);
          ctx.fillRect(kx, 33.5, 2.5, 2);
        }

        // 3. Sony WH-1000XM5 Headphones on Metal Stand (Right)
        ctx.fillStyle = '#64748b'; // Stand pole
        ctx.fillRect(w - 28, 15, 2, 16);
        ctx.fillRect(w - 30, 30, 6, 2);
        // Headphone headband & earcups
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(w - 27, 18, 5, Math.PI, 0); // Headband
        ctx.stroke();
        ctx.fillRect(w - 33, 17, 3, 6); // Left earcup
        ctx.fillRect(w - 24, 17, 3, 6); // Right earcup
        ctx.fillStyle = '#b45309'; // Copper logo ring
        ctx.fillRect(w - 32, 19, 1, 2);
        ctx.fillRect(w - 24, 19, 1, 2);

        // 4. Glass 45-Minute Sand Timer (Left)
        ctx.fillStyle = '#b45309'; // Brass top & bottom bases
        ctx.fillRect(20, 16, 8, 1.5);
        ctx.fillRect(20, 27, 8, 1.5);
        ctx.fillStyle = 'rgba(241, 245, 249, 0.85)'; // Glass hourglass
        ctx.beginPath();
        ctx.moveTo(21, 17.5); ctx.lineTo(27, 17.5); ctx.lineTo(24, 21.5); ctx.lineTo(27, 25.5); ctx.lineTo(21, 25.5); ctx.lineTo(24, 21.5);
        ctx.closePath();
        ctx.fill();
        // Purple Sand
        ctx.fillStyle = '#c084fc';
        ctx.fillRect(22, 18, 4, 3);
        ctx.fillRect(23.5, 21, 1, 3);
        ctx.fillRect(22, 24, 4, 2);

        // 5. Moleskine Black Leather Notebook
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(32, 26, 12, 9);
        ctx.fillStyle = '#f8fafc'; // White silk ribbon
        ctx.fillRect(37, 26, 1.5, 10);

        // 6. Slim Horizontal Eye-Care LED Lamp Bar
        ctx.fillStyle = '#020617';
        ctx.fillRect(w / 2 - 18, 10, 36, 2);
        ctx.fillStyle = '#fef08a'; // Warm LED glow strip
        ctx.fillRect(w / 2 - 16, 11, 32, 1);
      }
    },

    // 3. Steelcase Gesture Chair (32x32 px)
    {
      name: 'focus_steelcase_gesture_chair',
      w: 32, h: 32,
      draw: (ctx, w, h) => {
        // Drop shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(16, 26, 9, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Graphite Star Caster Base
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1.5;
        const angles = [0, 72, 144, 216, 288];
        angles.forEach(a => {
          const rad = (a * Math.PI) / 180;
          ctx.beginPath();
          ctx.moveTo(16, 22);
          ctx.lineTo(16 + Math.cos(rad) * 9, 22 + Math.sin(rad) * 4);
          ctx.stroke();
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(15 + Math.cos(rad) * 9, 21 + Math.sin(rad) * 4, 2, 2);
        });

        // Hydraulic Cylinder
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(15, 18, 2, 4);

        // Charcoal Velvet Padded Seat Cushion
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.roundRect(8, 13, 16, 8, 3);
        ctx.fill();
        ctx.fillStyle = '#334155';
        ctx.beginPath();
        ctx.roundRect(9, 13, 14, 7, 2);
        ctx.fill();
        ctx.fillStyle = '#475569'; // Plush highlight
        ctx.fillRect(11, 14, 10, 2);

        // Flexible Backrest with Core Skeleton
        ctx.fillStyle = '#0f172a'; // Spine
        ctx.fillRect(14, 3, 4, 12);
        ctx.fillStyle = '#1e293b'; // Outer shell
        ctx.beginPath();
        ctx.roundRect(7, 3, 18, 11, 4);
        ctx.fill();
        ctx.fillStyle = '#334155'; // Fabric cushion
        ctx.beginPath();
        ctx.roundRect(9, 5, 14, 8, 2);
        ctx.fill();

        // 360-degree Adjustable Armrests
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(5, 9, 4, 2);
        ctx.fillRect(23, 9, 4, 2);
        ctx.fillRect(6, 11, 2, 6);
        ctx.fillRect(24, 11, 2, 6);
      }
    },

    // 4. Ergonomic Rocking Footrest (32x32 px)
    {
      name: 'focus_ergonomic_footrest',
      w: 32, h: 32,
      draw: (ctx, w, h) => {
        // Drop shadow
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.beginPath();
        ctx.ellipse(16, 22, 10, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Curved Rocker Base (Brushed Aluminum)
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(16, 16, 11, 0.25 * Math.PI, 0.75 * Math.PI);
        ctx.stroke();

        // Non-Slip Tread Surface Pad
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.roundRect(6, 12, 20, 8, 2);
        ctx.fill();

        // Massage Textured Ridges
        ctx.fillStyle = '#334155';
        for (let x = 8; x < 24; x += 3) {
          ctx.fillRect(x, 13, 1.5, 6);
        }
      }
    },

    // 5. Eames Lounge Chair & Ottoman (64x64 px = 2x2 tiles in 32px grid)
    {
      name: 'focus_eames_lounge_chair_ottoman_2x2',
      w: 64, h: 64,
      draw: (ctx, w, h) => {
        // Drop shadow
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.beginPath();
        ctx.ellipse(32, 52, 24, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        // --- PART A: EAMES LOUNGE CHAIR (Top Portion) ---
        // 1. Molded Walnut Plywood Back Shell
        ctx.fillStyle = '#5c3821';
        ctx.beginPath();
        ctx.roundRect(14, 4, 36, 26, 6);
        ctx.fill();
        ctx.fillStyle = '#78462a'; // Wood grain veneer
        ctx.fillRect(16, 6, 32, 22);

        // 2. Tufted Black Leather Cushions (Headrest & Backrest)
        ctx.fillStyle = '#0a0a0f'; // Deep black leather
        ctx.beginPath();
        ctx.roundRect(18, 6, 28, 10, 4); // Headrest
        ctx.fill();
        ctx.fillStyle = '#1e293b'; // Leather sheen
        ctx.fillRect(20, 8, 24, 2);
        // Tufting buttons
        ctx.fillStyle = '#000000';
        ctx.fillRect(24, 11, 2, 2);
        ctx.fillRect(38, 11, 2, 2);

        // Lower back cushion
        ctx.fillStyle = '#0a0a0f';
        ctx.beginPath();
        ctx.roundRect(18, 18, 28, 11, 3);
        ctx.fill();
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(20, 20, 24, 2);
        ctx.fillStyle = '#000000';
        ctx.fillRect(25, 23, 2, 2);
        ctx.fillRect(37, 23, 2, 2);

        // 3. Padded Armrests (Left & Right)
        ctx.fillStyle = '#0a0a0f';
        ctx.beginPath();
        ctx.roundRect(10, 16, 7, 14, 3); // Left arm
        ctx.fill();
        ctx.beginPath();
        ctx.roundRect(47, 16, 7, 14, 3); // Right arm
        ctx.fill();

        // 4. Seat Cushion
        ctx.fillStyle = '#0a0a0f';
        ctx.beginPath();
        ctx.roundRect(16, 26, 32, 12, 4);
        ctx.fill();

        // --- PART B: OTTOMAN FOOTSTOOL (Bottom Portion) ---
        // Walnut Plywood Ottoman Shell
        ctx.fillStyle = '#5c3821';
        ctx.beginPath();
        ctx.roundRect(18, 42, 28, 16, 4);
        ctx.fill();
        ctx.fillStyle = '#78462a';
        ctx.fillRect(20, 44, 24, 12);

        // Tufted Black Leather Ottoman Cushion
        ctx.fillStyle = '#0a0a0f';
        ctx.beginPath();
        ctx.roundRect(20, 43, 24, 13, 3);
        ctx.fill();
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(22, 45, 20, 2);
        // Buttons
        ctx.fillStyle = '#000000';
        ctx.fillRect(26, 49, 2, 2);
        ctx.fillRect(36, 49, 2, 2);

        // Polished Die-Cast Aluminum Base & Swivel Star
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(32, 38); ctx.lineTo(24, 42);
        ctx.moveTo(32, 38); ctx.lineTo(40, 42);
        ctx.moveTo(32, 56); ctx.lineTo(24, 60);
        ctx.moveTo(32, 56); ctx.lineTo(40, 60);
        ctx.stroke();
      }
    },

    // 6. Arched Floor Reading Lamp (32x64 px = 1x2 tiles)
    {
      name: 'focus_curved_reading_floor_lamp',
      w: 32, h: 64,
      draw: (ctx, w, h) => {
        // Heavy Black Marble Round Base
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.ellipse(24, 58, 7, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Slender Arched Steel Arm
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(24, 58);
        ctx.lineTo(24, 30);
        ctx.bezierCurveTo(24, 10, 8, 8, 8, 20);
        ctx.stroke();

        // Dome Lampshade
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(8, 20, 5, Math.PI, 0);
        ctx.closePath();
        ctx.fill();

        // Warm 2700K Glow Cone radiating downwards
        const glow = ctx.createLinearGradient(8, 22, 8, 55);
        glow.addColorStop(0, 'rgba(254, 240, 138, 0.55)');
        glow.addColorStop(1, 'rgba(254, 240, 138, 0.0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.moveTo(4, 22);
        ctx.lineTo(12, 22);
        ctx.lineTo(20, 56);
        ctx.lineTo(0, 56);
        ctx.closePath();
        ctx.fill();
      }
    },

    // 7. Nero Marquina Marble Table with Tea (32x32 px)
    {
      name: 'focus_marble_accent_table_with_tea',
      w: 32, h: 32,
      draw: (ctx, w, h) => {
        // Drop shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(16, 25, 10, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Satin Brass Tripod Pedestal Legs
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(16, 17); ctx.lineTo(10, 25);
        ctx.moveTo(16, 17); ctx.lineTo(22, 25);
        ctx.moveTo(16, 17); ctx.lineTo(16, 25);
        ctx.stroke();

        // Round Nero Marquina Marble Tabletop (Black with White Veins)
        ctx.fillStyle = '#0a0a0f';
        ctx.beginPath();
        ctx.ellipse(16, 14, 11, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#d97706'; // Brass rim
        ctx.lineWidth = 0.8;
        ctx.stroke();

        // White Marble Veining
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.moveTo(10, 12); ctx.lineTo(15, 15); ctx.lineTo(21, 13);
        ctx.moveTo(13, 16); ctx.lineTo(19, 17);
        ctx.stroke();

        // Glass Teapot with Golden Chamomile Tea
        ctx.fillStyle = 'rgba(254, 243, 199, 0.9)'; // Amber tea liquid
        ctx.beginPath();
        ctx.arc(14, 10, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#0f172a'; // Lid & handle
        ctx.fillRect(13, 6, 2, 1);
        ctx.fillRect(10, 9, 1.5, 2);

        // Small matching Teacup
        ctx.fillStyle = 'rgba(254, 243, 199, 0.9)';
        ctx.fillRect(19, 11, 3, 2.5);
      }
    },

    // 8. Algorithm & Machine Learning Blackboard (96x32 px = 3x1 tiles)
    {
      name: 'focus_algorithm_math_blackboard_3x1',
      w: 96, h: 32,
      draw: (ctx, w, h) => {
        // Drop shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(2, 2, w - 4, h - 2);

        // Titanium Frame
        ctx.fillStyle = '#334155';
        ctx.fillRect(0, 0, w, h);

        // Matte Black Magnetic Glassboard
        ctx.fillStyle = '#090d16';
        ctx.fillRect(2, 2, w - 4, h - 6);

        // --- Mathematics & Algorithm Formulas in Chalk/Neon ---
        // Formula 1: Loss Function & Gradient Descent (Cyan)
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 3.5px monospace';
        ctx.fillText('L(θ) = -Σ y·log(ŷ) + λ||θ||²', 5, 8);

        // Formula 2: Transformer Attention Equation (Lavender)
        ctx.fillStyle = '#c084fc';
        ctx.fillText('Attn(Q,K,V) = softmax(QK^T / √d)·V', 5, 15);

        // Formula 3: Bayes Theorem (Green)
        ctx.fillStyle = '#4ade80';
        ctx.fillText('P(A|B) = P(B|A)·P(A) / P(B)', 5, 22);

        // Directed Acyclic Graph (DAG) / Neural Network Nodes (Right portion)
        const nodes = [
          { x: 74, y: 8, c: '#38bdf8' },
          { x: 74, y: 15, c: '#38bdf8' },
          { x: 74, y: 22, c: '#38bdf8' },
          { x: 84, y: 11, c: '#c084fc' },
          { x: 84, y: 19, c: '#c084fc' },
          { x: 92, y: 15, c: '#4ade80' }
        ];

        // Connecting weight lines
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 0.6;
        for (let i = 0; i < 3; i++) {
          for (let j = 3; j < 5; j++) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
        for (let j = 3; j < 5; j++) {
          ctx.beginPath();
          ctx.moveTo(nodes[j].x, nodes[j].y);
          ctx.lineTo(nodes[5].x, nodes[5].y);
          ctx.stroke();
        }

        // Draw nodes
        nodes.forEach(n => {
          ctx.fillStyle = n.c;
          ctx.beginPath();
          ctx.arc(n.x, n.y, 2, 0, Math.PI * 2);
          ctx.fill();
        });

        // Bottom Chalk Tray & Eraser
        ctx.fillStyle = '#475569';
        ctx.fillRect(20, h - 4, 56, 2);
        ctx.fillStyle = '#ffffff'; ctx.fillRect(25, h - 3.5, 5, 1);
        ctx.fillStyle = '#38bdf8'; ctx.fillRect(32, h - 3.5, 5, 1);
        ctx.fillStyle = '#c084fc'; ctx.fillRect(39, h - 3.5, 5, 1);
        ctx.fillStyle = '#0f172a'; ctx.fillRect(48, h - 3.5, 7, 1); // Eraser
      }
    },

    // 9. Ambient Light Shelf & Essential Oil Diffuser (64x32 px = 2x1 tiles)
    {
      name: 'focus_diffuser_ambient_light_shelf_2x1',
      w: 64, h: 32,
      draw: (ctx, w, h) => {
        // Floating Dark Oak Shelf
        ctx.fillStyle = '#3b2416';
        ctx.fillRect(2, 20, w - 4, 4);
        ctx.fillStyle = '#5c3821';
        ctx.fillRect(2, 20, w - 4, 1);

        // Upward Ambient Warm Glow (2700K)
        const glow = ctx.createLinearGradient(w / 2, 20, w / 2, 2);
        glow.addColorStop(0, 'rgba(254, 240, 138, 0.45)');
        glow.addColorStop(1, 'rgba(254, 240, 138, 0.0)');
        ctx.fillStyle = glow;
        ctx.fillRect(4, 4, w - 8, 16);

        // Ultrasonic Ceramic Diffuser (White Cone)
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(16, 20);
        ctx.lineTo(24, 20);
        ctx.lineTo(21, 10);
        ctx.lineTo(19, 10);
        ctx.closePath();
        ctx.fill();
        // Diffuser soft warm base ring
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(17, 19, 6, 1);

        // Delicate Rising Vapor Puffs
        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.beginPath();
        ctx.arc(20, 7, 2, 0, Math.PI * 2);
        ctx.arc(21, 4, 2.5, 0, Math.PI * 2);
        ctx.arc(19, 1.5, 1.8, 0, Math.PI * 2);
        ctx.fill();

        // 3 Amber Glass Essential Oil Dropper Bottles (Cedarwood, Bergamot, Lavender)
        const oils = [
          { x: 32, c: '#b45309' },
          { x: 38, c: '#0d9488' },
          { x: 44, c: '#8b5cf6' }
        ];
        oils.forEach(oil => {
          ctx.fillStyle = '#78350f'; // Amber bottle
          ctx.fillRect(oil.x, 13, 4, 7);
          ctx.fillStyle = oil.c; // Label
          ctx.fillRect(oil.x, 15, 4, 3);
          ctx.fillStyle = '#0f172a'; // Dropper cap
          ctx.fillRect(oil.x + 1, 11, 2, 2);
        });

        // Small polished Zen meditation stone
        ctx.fillStyle = '#475569';
        ctx.beginPath();
        ctx.ellipse(54, 18, 5, 2.5, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    },

    // 10. Academic Research Bookshelf (32x64 px = 1x2 tiles)
    {
      name: 'focus_academic_research_bookshelf_1x2',
      w: 32, h: 64,
      draw: (ctx, w, h) => {
        // Drop shadow
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.fillRect(2, 6, w - 4, h - 6);

        // Black Stained Oak Bookshelf Frame
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(2, 2, w - 4, h - 4);

        // Shelves
        const sY = [18, 36, 54];
        sY.forEach(y => {
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(2, y, w - 4, 3);
        });

        // Top Shelf: Knuth TAOCP Boxed Set & Hardcovers (Purple, Dark Red, Navy)
        const topBooks = [
          { x: 4, w: 5, h: 14, c: '#581c87' }, // Vol 1
          { x: 10, w: 5, h: 14, c: '#581c87' }, // Vol 2
          { x: 16, w: 5, h: 14, c: '#581c87' }, // Vol 3
          { x: 22, w: 6, h: 15, c: '#1e1b4b' }  // Vol 4
        ];
        topBooks.forEach(b => {
          ctx.fillStyle = b.c;
          ctx.fillRect(b.x, 18 - b.h, b.w, b.h);
          ctx.fillStyle = '#f59e0b'; // Gold embossed lettering on spine
          ctx.fillRect(b.x + 1.5, 18 - b.h + 3, b.w - 3, 1);
          ctx.fillRect(b.x + 1.5, 18 - b.h + 6, b.w - 3, 1);
        });

        // Middle Shelf: CLRS Algorithm & Machine Learning Books
        const midBooks = [
          { x: 4, w: 6, h: 15, c: '#7f1d1d' }, // CLRS Red
          { x: 11, w: 5, h: 13, c: '#14532d' },
          { x: 17, w: 5, h: 14, c: '#1f2937' },
          { x: 23, w: 5, h: 12, c: '#0369a1' }
        ];
        midBooks.forEach(b => {
          ctx.fillStyle = b.c;
          ctx.fillRect(b.x, 36 - b.h, b.w, b.h);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(b.x + 1, 36 - b.h + 2, b.w - 2, 1);
        });

        // Bottom Shelf: Bound Research Proceedings & Geometric Brass Bookend
        ctx.fillStyle = '#334155';
        ctx.fillRect(4, 40, 14, 14);
        ctx.fillStyle = '#f59e0b'; // Brass bookend
        ctx.beginPath();
        ctx.moveTo(19, 54); ctx.lineTo(24, 44); ctx.lineTo(24, 54);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#475569';
        ctx.fillRect(25, 46, 4, 8);
      }
    },

    // 11. Snake Plant in Slate Planter (32x40 px)
    {
      name: 'focus_snake_plant_slate_planter',
      w: 32, h: 40,
      draw: (ctx, w, h) => {
        // Drop shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(16, 36, 8, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Dark Charcoal Slate Cube Planter
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(8, 22, 16, 14);
        ctx.fillStyle = '#334155';
        ctx.fillRect(9, 23, 14, 12);
        // Slate Texture Lines
        ctx.fillStyle = '#475569';
        ctx.fillRect(9, 27, 14, 1);
        ctx.fillRect(9, 31, 14, 1);

        // Soil & White River Stones
        ctx.fillStyle = '#29180c';
        ctx.fillRect(9, 21, 14, 3);
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(11, 21.5, 2, 1.5);
        ctx.fillRect(17, 21.5, 2, 1.5);

        // Upright Snake Plant Leaves (Variegated Yellow Edges & Green Marbled Interior)
        const leaves = [
          { x: 11, h: 18, curve: -2 },
          { x: 14, h: 22, curve: 0 },
          { x: 16, h: 24, curve: 1 },
          { x: 19, h: 21, curve: -1 },
          { x: 21, h: 17, curve: 2 }
        ];

        leaves.forEach(l => {
          // Yellow Variegated Border
          ctx.strokeStyle = '#fde047';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(l.x, 22);
          ctx.quadraticCurveTo(l.x + l.curve, 22 - l.h / 2, l.x + l.curve * 1.5, 22 - l.h);
          ctx.stroke();

          // Deep Green Center
          ctx.strokeStyle = '#15803d';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(l.x, 22);
          ctx.quadraticCurveTo(l.x + l.curve, 22 - l.h / 2, l.x + l.curve * 1.5, 22 - l.h);
          ctx.stroke();
        });
      }
    },

    // 12. White Noise Sound Station (32x32 px)
    {
      name: 'focus_white_noise_audio_station',
      w: 32, h: 32,
      draw: (ctx, w, h) => {
        // Drop shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(2, 6, w - 4, h - 6);

        // Dark Walnut Mini Credenza
        ctx.fillStyle = '#29180c';
        ctx.fillRect(2, 12, 28, 18);
        ctx.fillStyle = '#422817';
        ctx.fillRect(4, 14, 24, 14);

        // Circular White Noise Machine with Breathing LED Ring
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(10, 8, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#38bdf8'; // Cyan Breathing LED Ring
        ctx.beginPath();
        ctx.arc(10, 8, 3.5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = '#1e293b'; // Speaker mesh
        ctx.beginPath();
        ctx.arc(10, 8, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Audiophile Headphone DAC Amplifier with VU Meter
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(18, 5, 11, 7);
        ctx.fillStyle = '#f59e0b'; // Amber illuminated VU meter
        ctx.fillRect(19, 6, 5, 3);
        ctx.fillStyle = '#d97706'; // Gold volume dial
        ctx.beginPath();
        ctx.arc(26, 8.5, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    },

    // 13. Dyson Pure Cool Tower Air Purifier (32x40 px)
    {
      name: 'focus_dyson_air_purifier_tower',
      w: 32, h: 40,
      draw: (ctx, w, h) => {
        // Drop shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(16, 36, 7, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Lower Cylindrical Base (HEPA Filter & Motor)
        ctx.fillStyle = '#1e3a8a'; // Deep Royal Blue
        ctx.beginPath();
        ctx.roundRect(10, 22, 12, 15, 2);
        ctx.fill();
        // Silver Mesh Filter Grille
        ctx.fillStyle = '#94a3b8';
        for (let y = 24; y < 35; y += 2) {
          ctx.fillRect(11, y, 10, 1);
        }

        // Circular Digital AQI Display
        ctx.fillStyle = '#020617';
        ctx.beginPath();
        ctx.arc(16, 20, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#22c55e'; // Green AQI Ring: 01 EXCELLENT
        ctx.fillRect(15, 19, 2, 2);

        // Upper Bladeless Loop Amplifier (Sleek Oval Ring)
        ctx.strokeStyle = '#cbd5e1'; // Platinum Silver Loop
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.roundRect(11, 3, 10, 16, 5);
        ctx.stroke();

        // Hollow center air slot
        ctx.strokeStyle = '#0284c7'; // Air jet slit
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.roundRect(12, 4, 8, 14, 4);
        ctx.stroke();
      }
    },

    // 14. Amethyst Crystal & Newton Cradle Credenza (32x32 px)
    {
      name: 'focus_crystals_newton_cradle_credenza',
      w: 32, h: 32,
      draw: (ctx, w, h) => {
        // Drop shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(2, 6, w - 4, h - 6);

        // Low Dark Wood Credenza
        ctx.fillStyle = '#1e142b';
        ctx.fillRect(2, 12, 28, 18);
        ctx.fillStyle = '#2d1b40';
        ctx.fillRect(4, 14, 24, 14);

        // Purple Raw Amethyst Crystal Geode Cluster (Left)
        ctx.fillStyle = '#3b0764'; // Outer dark rock matrix
        ctx.beginPath();
        ctx.moveTo(6, 12); ctx.lineTo(13, 12); ctx.lineTo(11, 4); ctx.lineTo(8, 4);
        ctx.closePath();
        ctx.fill();
        // Sparkling Purple Quartz Facets
        ctx.fillStyle = '#c084fc';
        ctx.fillRect(8, 5, 2, 3);
        ctx.fillRect(10, 7, 2, 3);
        ctx.fillStyle = '#e9d5ff'; // Diamond glint
        ctx.fillRect(9, 6, 1, 1);

        // Newton's Cradle Balance Balls (Right)
        ctx.strokeStyle = '#94a3b8'; // Metal Frame
        ctx.lineWidth = 1;
        ctx.strokeRect(17, 3, 12, 9);

        // 5 Silver Steel Balls
        const bX = [18, 20.5, 23, 25.5, 29];
        bX.forEach((bx, idx) => {
          // Suspension string
          ctx.strokeStyle = '#cbd5e1';
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          if (idx === 4) { // Right ball swinging outwards!
            ctx.moveTo(28, 3); ctx.lineTo(30, 9);
          } else {
            ctx.moveTo(bx + 1, 3); ctx.lineTo(bx + 1, 9);
          }
          ctx.stroke();

          // Steel ball
          ctx.fillStyle = '#f8fafc';
          ctx.beginPath();
          if (idx === 4) {
            ctx.arc(30, 9.5, 1.2, 0, Math.PI * 2);
          } else {
            ctx.arc(bx + 1, 9.5, 1.2, 0, Math.PI * 2);
          }
          ctx.fill();
        });
      }
    },

    // 15. Smart Sensor Trashcan (32x32 px)
    {
      name: 'focus_smart_sensor_trashbin',
      w: 32, h: 32,
      draw: (ctx, w, h) => {
        // Drop shadow
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.beginPath();
        ctx.ellipse(16, 26, 8, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Matte Black Stainless Body
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.roundRect(9, 10, 14, 16, 3);
        ctx.fill();
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(10, 11, 12, 14);

        // Automatic Lid with Soft-Close Seal
        ctx.fillStyle = '#334155';
        ctx.fillRect(8, 8, 16, 3);

        // Cyan Infrared Sensor Light
        ctx.fillStyle = '#06b6d4';
        ctx.beginPath();
        ctx.arc(16, 9.5, 1, 0, Math.PI * 2);
        ctx.fill();
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
  console.log(`All ${spriteDefs.length} Focus Pod sprites successfully generated!`);
})();
