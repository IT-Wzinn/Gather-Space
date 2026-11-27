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
    // 1. Grand Royal Navy & Gold Boardroom Carpet (10x8 tiles = 320x256 px)
    {
      name: 'boardroom_grand_royal_navy_gold_carpet_10x8',
      w: 320, h: 256,
      draw: (ctx, w, h) => {
        // Drop shadow
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.fillRect(6, 8, w - 12, h - 12);

        // Deep Royal Navy Field
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(8, 8, w - 16, h - 16);

        // Rich Indigo Inset Field
        ctx.fillStyle = '#1e1b4b';
        ctx.fillRect(16, 16, w - 32, h - 32);

        // Outer Polished Gold Filigree Border
        ctx.strokeStyle = '#d4af37';
        ctx.lineWidth = 3;
        ctx.strokeRect(14, 14, w - 28, h - 28);

        // Secondary Greek Key / Geometric Inset Line
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(22, 22, w - 44, h - 44);

        // Damask Diamond Lattice Repeat in Central Field
        ctx.strokeStyle = 'rgba(212, 175, 55, 0.18)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        const step = 32;
        for (let x = -h; x < w + h; x += step) {
          ctx.moveTo(x, 26);
          ctx.lineTo(x + h, h - 26);
          ctx.moveTo(x + h, 26);
          ctx.lineTo(x, h - 26);
        }
        ctx.save();
        ctx.rect(26, 26, w - 52, h - 52);
        ctx.clip();
        ctx.stroke();
        ctx.restore();

        // 4 Golden Corner Palmette Crests
        const corners = [
          { x: 24, y: 24 },
          { x: w - 24, y: 24 },
          { x: 24, y: h - 24 },
          { x: w - 24, y: h - 24 }
        ];
        corners.forEach(c => {
          ctx.fillStyle = '#fbbf24';
          ctx.beginPath();
          ctx.arc(c.x, c.y, 6, 0, Math.PI * 2);
          ctx.fill();
        });
      }
    },

    // 2. VIP Red Carpet Runner (3x4 tiles = 96x128 px)
    {
      name: 'boardroom_vip_red_carpet_runner_3x4',
      w: 96, h: 128,
      draw: (ctx, w, h) => {
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(4, 4, w - 8, h - 6);

        // Ceremonial Scarlet Red Base
        ctx.fillStyle = '#991b1b';
        ctx.fillRect(6, 4, w - 12, h - 8);

        // Velvet Center Highlight Field
        ctx.fillStyle = '#b91c1c';
        ctx.fillRect(16, 4, w - 32, h - 8);

        // Golden Braided Side Edges
        ctx.fillStyle = '#d4af37';
        ctx.fillRect(8, 4, 3, h - 8);
        ctx.fillRect(w - 11, 4, 3, h - 8);

        // Gold Fringe Tassels at Top and Bottom
        ctx.fillStyle = '#fef08a';
        for (let x = 8; x <= w - 10; x += 4) {
          ctx.fillRect(x, 2, 2, 3);
          ctx.fillRect(x, h - 5, 2, 3);
        }
      }
    },

    // 3. Delegate Brass Nameplates & Leather Folder Set (4x1 tiles = 128x32 px)
    {
      name: 'boardroom_nameplate_brass_row',
      w: 128, h: 32,
      draw: (ctx, w, h) => {
        // 4 Delegate Positions across 128px
        [16, 48, 80, 112].forEach(dx => {
          // Polished Brass Triangular Nameplate
          ctx.fillStyle = '#b45309';
          ctx.beginPath();
          ctx.moveTo(dx - 10, 18);
          ctx.lineTo(dx + 10, 18);
          ctx.lineTo(dx + 8, 12);
          ctx.lineTo(dx - 8, 12);
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = '#d4af37';
          ctx.fillRect(dx - 9, 13, 18, 4);

          // Black Acrylic Name Strip with white lettering
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(dx - 7, 14, 14, 2);
          ctx.fillStyle = '#f8fafc';
          ctx.fillRect(dx - 5, 14.5, 10, 1);

          // Leather Bound Agenda Folder (Navy & Gold logo)
          ctx.fillStyle = '#1e3a8a';
          ctx.fillRect(dx - 8, 20, 16, 8);
          ctx.fillStyle = '#d4af37';
          ctx.fillRect(dx - 2, 23, 4, 2); // Gold logo

          // Glass Water Bottle & Crystal Glass
          ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
          ctx.fillRect(dx + 9, 12, 3, 7);
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(dx + 9, 15, 3, 4);
        });
      }
    },

    // 4. Simultaneous Interpretation Soundproof Glass Booth (3x2 tiles = 96x64 px)
    {
      name: 'boardroom_simultaneous_translation_booth_3x2',
      w: 96, h: 64,
      draw: (ctx, w, h) => {
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.32)';
        ctx.fillRect(4, 6, w - 8, h - 8);

        // Soundproof Booth Exterior (Dark Titanium / Anthracite)
        ctx.fillStyle = '#18181b';
        ctx.beginPath();
        ctx.roundRect(6, 4, w - 12, h - 8, 4);
        ctx.fill();

        // Sound Absorption Perforated Side Panels
        ctx.fillStyle = '#27272a';
        ctx.fillRect(8, 8, 8, h - 16);
        ctx.fillRect(w - 16, 8, 8, h - 16);

        // Acoustic Double Glass Observation Window (Center 64px)
        ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
        ctx.fillRect(18, 8, w - 36, 36);
        ctx.strokeStyle = '#71717a';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(18, 8, w - 36, 36);

        // Glass Reflection Glare
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(24, 40);
        ctx.lineTo(44, 12);
        ctx.moveTo(56, 40);
        ctx.lineTo(74, 14);
        ctx.stroke();

        // Inside Booth: 2 Professional Interpreters with headsets
        [34, 62].forEach(ix => {
          // Head / hair
          ctx.fillStyle = '#3f3f46';
          ctx.beginPath();
          ctx.arc(ix, 20, 6, 0, Math.PI * 2);
          ctx.fill();
          // Headset band & earcups
          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(ix, 19, 7, Math.PI, 0);
          ctx.stroke();
          ctx.fillStyle = '#0284c7'; // Blue earcups
          ctx.fillRect(ix - 8, 17, 3, 5);
          ctx.fillRect(ix + 5, 17, 3, 5);
          // Mic boom
          ctx.strokeStyle = '#e2e8f0';
          ctx.beginPath();
          ctx.moveTo(ix + 5, 20);
          ctx.lineTo(ix + 2, 25);
          ctx.stroke();
          // Shoulders / business attire
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(ix - 8, 26, 16, 12);
        });

        // Translation Audio Mixer Console on Desk
        ctx.fillStyle = '#09090b';
        ctx.fillRect(20, 38, w - 40, 6);
        // Blinking Channel Status LEDs (Green, Red, Blue)
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(26, 40, 2, 2);
        ctx.fillRect(38, 40, 2, 2);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(58, 40, 2, 2);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(70, 40, 2, 2);

        // Lower Booth Baffle & Ventilation Grille
        ctx.fillStyle = '#27272a';
        ctx.fillRect(18, 48, w - 36, 8);
        for (let x = 22; x < w - 24; x += 4) {
          ctx.fillStyle = '#09090b';
          ctx.fillRect(x, 50, 2, 4);
        }
      }
    },

    // 5. Advisory Board & Observer Leather Chairs Row (4x1 tiles = 128x32 px)
    {
      name: 'boardroom_advisory_board_chairs_row_4x1',
      w: 128, h: 32,
      draw: (ctx, w, h) => {
        // 4 Executive Armchairs at x=16, x=48, x=80, x=112
        [16, 48, 80, 112].forEach(ax => {
          // Shadow
          ctx.fillStyle = 'rgba(0,0,0,0.25)';
          ctx.beginPath();
          ctx.ellipse(ax, 26, 11, 4, 0, 0, Math.PI * 2);
          ctx.fill();

          // Chrome Cantilever Base
          ctx.strokeStyle = '#cbd5e1';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(ax - 9, 26);
          ctx.lineTo(ax - 6, 14);
          ctx.moveTo(ax + 9, 26);
          ctx.lineTo(ax + 6, 14);
          ctx.stroke();

          // Royal Blue Velvet High Backrest
          ctx.fillStyle = '#1e3a8a';
          ctx.beginPath();
          ctx.roundRect(ax - 9, 6, 18, 16, 4);
          ctx.fill();

          // Inner Seat Cushion
          ctx.fillStyle = '#1d4ed8';
          ctx.beginPath();
          ctx.roundRect(ax - 7, 12, 14, 10, 3);
          ctx.fill();

          // Dark Walnut Padded Armrests
          ctx.fillStyle = '#451a03';
          ctx.fillRect(ax - 10, 10, 2.5, 10);
          ctx.fillRect(ax + 7.5, 10, 2.5, 10);
        });
      }
    },

    // 6. Diplomatic Flagstands Pair (National & Corporate Crest Flags: 2x2 tiles = 64x64 px)
    {
      name: 'boardroom_diplomatic_flagstands_pair',
      w: 64, h: 64,
      draw: (ctx, w, h) => {
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.28)';
        ctx.beginPath();
        ctx.ellipse(32, h - 5, 24, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Heavy Circular Mahogany & Brass Pedestals
        [20, 44].forEach(px => {
          ctx.fillStyle = '#d4af37';
          ctx.beginPath();
          ctx.ellipse(px, h - 8, 10, 4, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#451a03';
          ctx.beginPath();
          ctx.ellipse(px, h - 9, 8, 3, 0, 0, Math.PI * 2);
          ctx.fill();

          // Tall Mahogany Flagpole with Gold Spear Finial
          ctx.fillStyle = '#78350f';
          ctx.fillRect(px - 1, 4, 2, h - 13);
          // Spear tip
          ctx.fillStyle = '#f59e0b';
          ctx.beginPath();
          ctx.moveTo(px, 0);
          ctx.lineTo(px - 3, 6);
          ctx.lineTo(px + 3, 6);
          ctx.closePath();
          ctx.fill();
        });

        // Flag 1 (Left): Draped National Red Flag with Gold Star / Crest
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.moveTo(20, 6);
        ctx.quadraticCurveTo(10, 18, 12, 36);
        ctx.quadraticCurveTo(18, 40, 20, 34);
        ctx.quadraticCurveTo(24, 22, 20, 6);
        ctx.closePath();
        ctx.fill();
        // Gold Star Crest
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(15, 22, 3, 0, Math.PI * 2);
        ctx.fill();
        // Gold Fringe Hem
        ctx.fillStyle = '#d4af37';
        ctx.fillRect(11, 35, 9, 2);

        // Flag 2 (Right): Draped Corporate Royal Blue & Gold Crest Flag
        ctx.fillStyle = '#1e3a8a';
        ctx.beginPath();
        ctx.moveTo(44, 6);
        ctx.quadraticCurveTo(34, 18, 36, 36);
        ctx.quadraticCurveTo(42, 40, 44, 34);
        ctx.quadraticCurveTo(48, 22, 44, 6);
        ctx.closePath();
        ctx.fill();
        // Golden Corporate Laurel Emblem
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(39, 22, 3, 0, Math.PI * 2);
        ctx.fill();
        // Gold Fringe Hem
        ctx.fillStyle = '#d4af37';
        ctx.fillRect(35, 35, 9, 2);
      }
    },

    // 7. Cisco / Polycom AV Rack Server Unit (2x2 tiles = 64x64 px)
    {
      name: 'boardroom_av_rack_network_server_unit_2x2',
      w: 64, h: 64,
      draw: (ctx, w, h) => {
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(4, 6, w - 8, h - 8);

        // Steel Server Rack Cabinet
        ctx.fillStyle = '#09090b';
        ctx.fillRect(6, 4, w - 12, h - 8);
        ctx.fillStyle = '#18181b';
        ctx.fillRect(8, 6, w - 16, h - 12);

        // Smoked Glass Door Frame with Neon Cyan Edge
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 1.2;
        ctx.strokeRect(9, 7, w - 18, h - 14);

        // 4 Rack Mounted Units (Extron Switcher, Cisco Codec, Shure Mic Hub, Power Conditioner)
        for (let y = 10; y < 50; y += 10) {
          ctx.fillStyle = '#27272a';
          ctx.fillRect(11, y, w - 22, 8);
          ctx.fillStyle = '#3f3f46';
          ctx.fillRect(12, y + 1, w - 24, 2);

          // Activity LEDs (Green, Blue, Amber)
          ctx.fillStyle = '#22c55e';
          ctx.fillRect(14, y + 4, 1.5, 1.5);
          ctx.fillRect(17, y + 4, 1.5, 1.5);
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(21, y + 4, 1.5, 1.5);
          ctx.fillStyle = '#f59e0b';
          ctx.fillRect(25, y + 4, 1.5, 1.5);

          // Digital Display readout
          ctx.fillStyle = '#0284c7';
          ctx.fillRect(36, y + 3, 12, 3);
        }

        // Cable Management D-Rings & Bundles
        ctx.fillStyle = '#3b82f6';
        ctx.fillRect(w - 14, 10, 2, 40);
      }
    },

    // 8. AV Technician Soundcraft Mixing Desk (3x2 tiles = 96x64 px)
    {
      name: 'boardroom_av_technician_soundcraft_desk_3x2',
      w: 96, h: 64,
      draw: (ctx, w, h) => {
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(4, 10, w - 8, h - 14);

        // Technical Desk Frame
        ctx.fillStyle = '#18181b';
        ctx.fillRect(6, 18, w - 12, 36);
        ctx.fillStyle = '#27272a';
        ctx.fillRect(8, 20, w - 16, 32);

        // Dual Wide Monitors on Ergonomic Arms
        // Monitor 1 (Left - Camera 360 Multiview)
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(12, 4, 32, 20);
        ctx.fillStyle = '#0284c7'; // Quad view feeds
        ctx.fillRect(14, 6, 13, 7);
        ctx.fillRect(29, 6, 13, 7);
        ctx.fillRect(14, 15, 13, 7);
        ctx.fillRect(29, 15, 13, 7);

        // Monitor 2 (Right - Audio Spectrogram & Room Telemetry)
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(52, 4, 32, 20);
        ctx.fillStyle = '#1e1b4b';
        ctx.fillRect(54, 6, 28, 16);
        // Spectrum graph
        ctx.fillStyle = '#22c55e';
        for (let x = 56; x < 80; x += 3) {
          const barH = 3 + ((x * 7) % 10);
          ctx.fillRect(x, 20 - barH, 2, barH);
        }

        // Soundcraft Digital Audio Mixing Console on desk surface
        ctx.fillStyle = '#09090b';
        ctx.fillRect(16, 28, 54, 20);
        // Motorized Fader Strips
        for (let x = 20; x < 66; x += 5) {
          ctx.fillStyle = '#27272a';
          ctx.fillRect(x, 30, 2, 14);
          // Fader knob (Silver)
          ctx.fillStyle = '#e2e8f0';
          const fy = 32 + ((x * 3) % 8);
          ctx.fillRect(x - 1, fy, 4, 2.5);
        }
        // Gooseneck Talkback Mic
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(74, 32);
        ctx.quadraticCurveTo(74, 22, 68, 20);
        ctx.stroke();

        // Ergonomic Mesh Task Chair
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.roundRect(40, 48, 16, 12, 3);
        ctx.fill();
        ctx.fillStyle = '#334155';
        ctx.fillRect(42, 50, 12, 6);
      }
    },

    // 9. AI PTZ 4K Tracking Conference Camera on Stand (1x2 tiles = 32x64 px)
    {
      name: 'boardroom_ptz_camera_stand_pair',
      w: 32, h: 64,
      draw: (ctx, w, h) => {
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.beginPath();
        ctx.ellipse(16, h - 4, 9, 3.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Heavy Base Plate
        ctx.fillStyle = '#18181b';
        ctx.beginPath();
        ctx.ellipse(16, h - 6, 8, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Sleek Black Telescopic Upright Mast
        ctx.fillStyle = '#27272a';
        ctx.fillRect(15, 18, 2, h - 24);
        ctx.fillStyle = '#d4af37'; // Brass collar ring
        ctx.fillRect(14, 36, 4, 2);

        // PTZ Motorized Gimbal Base
        ctx.fillStyle = '#18181b';
        ctx.beginPath();
        ctx.roundRect(10, 14, 12, 6, 2);
        ctx.fill();

        // PTZ Camera Sphere & Optical Glass Lens
        ctx.fillStyle = '#09090b';
        ctx.beginPath();
        ctx.arc(16, 10, 7, 0, Math.PI * 2);
        ctx.fill();

        // Front Glass Lens with blue optical anti-reflective coating
        ctx.fillStyle = '#0284c7';
        ctx.beginPath();
        ctx.arc(16, 10, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(15, 9, 1.5, 1.5);

        // Active Recording / AI Tracking Green/Red Tally Light
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.arc(16, 3, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    },

    // 10. Diplomatic Champagne & Wine Cooler Cabinet (1x2 tiles = 32x64 px)
    {
      name: 'boardroom_champagne_cooler_cabinet_1x2',
      w: 32, h: 64,
      draw: (ctx, w, h) => {
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(2, 4, w - 4, h - 6);

        // Polished Stainless Steel Chassis
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(3, 2, w - 6, h - 4);
        ctx.fillStyle = '#475569';
        ctx.fillRect(4, 3, w - 8, h - 6);

        // UV-Tinted Double Glass Door with Soft Amber LED
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(6, 6, w - 12, h - 12);
        ctx.fillStyle = 'rgba(254, 240, 138, 0.12)';
        ctx.fillRect(6, 6, w - 12, h - 12);

        // 4 Scalloped Chrome Wine Cradles
        for (let y = 14; y < h - 12; y += 11) {
          ctx.fillStyle = '#94a3b8';
          ctx.fillRect(7, y, w - 14, 1.5);

          // Champagne Bottles with Gold Foil Neck Caps
          ctx.fillStyle = '#065f46'; // Dark green bottle
          ctx.fillRect(9, y - 7, 4, 7);
          ctx.fillStyle = '#fbbf24'; // Gold foil neck
          ctx.fillRect(10, y - 9, 2, 3);

          ctx.fillStyle = '#881337'; // Rosé champagne
          ctx.fillRect(16, y - 7, 4, 7);
          ctx.fillStyle = '#fbbf24';
          ctx.fillRect(17, y - 9, 2, 3);

          ctx.fillStyle = '#065f46';
          ctx.fillRect(23, y - 7, 4, 7);
          ctx.fillStyle = '#fbbf24';
          ctx.fillRect(24, y - 9, 2, 3);
        }

        // Sleek Vertical Brass Handle
        ctx.fillStyle = '#d4af37';
        ctx.fillRect(w - 7, 22, 2, 16);
      }
    },

    // 11. Commercial Nespresso Capsule Machine (1x1 tile = 32x32 px)
    {
      name: 'boardroom_nespresso_capsule_machine',
      w: 32, h: 32,
      draw: (ctx, w, h) => {
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.beginPath();
        ctx.ellipse(16, 28, 11, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Chrome & Black Machine Body
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.roundRect(6, 8, 20, 18, 3);
        ctx.fill();

        // Polished Chrome Front Fascia
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(8, 10, 16, 6);
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(8, 10, 16, 1.5);

        // Touchscreen Capsule Selector Display
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(10, 12, 12, 3);

        // Dual Chrome Coffee Outlets
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(13, 17, 2, 3);
        ctx.fillRect(17, 17, 2, 3);

        // Espresso Cup resting on Drip Grid
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(14, 20, 4, 4);
        ctx.fillStyle = '#451a03'; // Crema
        ctx.fillRect(14.5, 20, 3, 1);

        // Stainless Drip Tray
        ctx.fillStyle = '#475569';
        ctx.fillRect(8, 24, 16, 2.5);
      }
    },

    // 12. French Gourmet Canapé Platter (1x1 tile = 32x32 px)
    {
      name: 'boardroom_french_canape_platter',
      w: 32, h: 32,
      draw: (ctx, w, h) => {
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.beginPath();
        ctx.ellipse(16, 24, 12, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Two-Tier Silver Tray
        // Bottom Platter (Large Silver Oval)
        ctx.fillStyle = '#cbd5e1';
        ctx.beginPath();
        ctx.ellipse(16, 22, 12, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.ellipse(16, 21, 10, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Top Platter (Small Silver Tier)
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(15.5, 12, 1, 9); // Center rod
        ctx.fillStyle = '#cbd5e1';
        ctx.beginPath();
        ctx.ellipse(16, 13, 7, 2.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Delicate Canapés on Tray:
        // Salmon Blinis (Pink with green dill)
        ctx.fillStyle = '#f43f5e';
        ctx.fillRect(9, 20, 3, 2);
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(10, 19, 1, 1);

        // Brie & Fig Tartlets (Cream with dark purple fig)
        ctx.fillStyle = '#fef3c7';
        ctx.fillRect(15, 21, 3, 2);
        ctx.fillStyle = '#581c87';
        ctx.fillRect(16, 20, 1.5, 1.5);

        // Caviar Cracker (Black beads)
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(20, 20, 3, 2);

        // Top Tier: Mini Macarons
        ctx.fillStyle = '#a3e635';
        ctx.fillRect(13, 11, 2.5, 2);
        ctx.fillStyle = '#f472b6';
        ctx.fillRect(17, 11, 2.5, 2);
      }
    },

    // 13. 3D Acoustic Wood Slat Diffuser Panel (2x3 tiles = 64x96 px)
    {
      name: 'boardroom_3d_acoustic_slat_diffuser_2x3',
      w: 64, h: 96,
      draw: (ctx, w, h) => {
        // Deep Charcoal Acoustic Felt Backing
        ctx.fillStyle = '#09090b';
        ctx.fillRect(4, 4, w - 8, h - 8);

        // Undulating 3D Solid Walnut Slats with variable depths
        const depths = [3, 5, 2, 6, 4, 7, 3, 5];
        for (let i = 0; i < 8; i++) {
          const x = 6 + i * 6.5;
          const d = depths[i];

          // Ambient drop shadow beside deeper slats
          ctx.fillStyle = '#020617';
          ctx.fillRect(x + 3.5, 6, 2, h - 12);

          // Slat Body
          ctx.fillStyle = '#451a03';
          ctx.fillRect(x, 6, 3.5, h - 12);

          // Front highlight tone (depending on depth)
          ctx.fillStyle = d > 4 ? '#92400e' : '#78350f';
          ctx.fillRect(x + 0.8, 6, 2, h - 12);
        }

        // Top & Bottom Warm LED Grazing Light Wash
        ctx.fillStyle = 'rgba(254, 240, 138, 0.15)';
        ctx.fillRect(4, 4, w - 8, 14);
        ctx.fillRect(4, h - 18, w - 8, 14);

        // Polished Brass Frame Accent
        ctx.strokeStyle = '#d4af37';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(4, 4, w - 8, h - 8);
      }
    },

    // 14. Floor Stage Confidence Prompter Monitor (1x1 tile = 32x32 px)
    {
      name: 'boardroom_floor_confidence_prompter_monitor',
      w: 32, h: 32,
      draw: (ctx, w, h) => {
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(16, 26, 12, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // 45-degree Angled Heavy-Duty Stage Wedge Case
        ctx.fillStyle = '#18181b';
        ctx.beginPath();
        ctx.moveTo(4, 26);
        ctx.lineTo(28, 26);
        ctx.lineTo(26, 10);
        ctx.lineTo(6, 10);
        ctx.closePath();
        ctx.fill();

        // Steel Corner Caps
        ctx.fillStyle = '#71717a';
        ctx.fillRect(4, 23, 3, 3);
        ctx.fillRect(25, 23, 3, 3);

        // Angled Screen Face
        ctx.fillStyle = '#020617';
        ctx.beginPath();
        ctx.moveTo(7, 24);
        ctx.lineTo(25, 24);
        ctx.lineTo(24, 12);
        ctx.lineTo(8, 12);
        ctx.closePath();
        ctx.fill();

        // Glowing Slide Notes / Countdown Timer (Green & Yellow)
        ctx.fillStyle = '#22c55e'; // "14:52" Remaining
        ctx.fillRect(10, 14, 12, 2.5);
        ctx.fillStyle = '#fde047'; // Presentation slide title
        ctx.fillRect(10, 18, 12, 1.5);
        ctx.fillRect(10, 21, 8, 1.5);
      }
    }
  ];

  console.log(`Starting generation of ${spriteDefs.length} upgrade sprites for Khu 5...`);

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
      const drawFn = new Function('ctx', 'w', 'h', '(' + fnStr + ')(ctx, w, h)');
      drawFn(ctx, w, h);
    }, s.draw.toString(), s.w, s.h);

    const canvasHandle = await page.$('#c');
    const outPath = path.join(outDir, `${s.name}.png`);
    await canvasHandle.screenshot({ path: outPath, omitBackground: true });
    console.log(`Saved: ${s.name}.png (${s.w}x${s.h})`);
  }

  await browser.close();
  console.log('Finished generating all Khu 5 upgrade sprites successfully!');
})();
