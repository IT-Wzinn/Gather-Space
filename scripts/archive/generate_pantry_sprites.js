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
    // 1. Grand L-Shaped Bar Counter in Nero Marquina Black Marble & Oak (4x3 tiles = 128x96 px)
    {
      name: 'pantry_grand_l_bar_counter_4x3',
      w: 128, h: 96,
      draw: (ctx, w, h) => {
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.32)';
        // Horizontal shadow
        ctx.fillRect(6, 12, w - 12, 38);
        // Vertical wing shadow
        ctx.fillRect(6, 30, 42, h - 34);

        // Tambour Oak Slats Base Body (L-shape)
        ctx.fillStyle = '#2d1810';
        ctx.fillRect(8, 16, w - 16, 28);
        ctx.fillRect(8, 30, 36, h - 36);

        // Warm Oak Slats Texture
        ctx.fillStyle = '#78350f';
        // Horizontal slats
        for (let x = 12; x < w - 12; x += 5) {
          ctx.fillRect(x, 22, 2.5, 20);
        }
        // Vertical wing slats
        for (let y = 46; y < h - 10; y += 5) {
          ctx.fillRect(12, y, 28, 2.5);
        }

        // Brushed Brass Foot Rail along base
        ctx.fillStyle = '#d4af37';
        ctx.fillRect(8, 42, w - 16, 3);
        ctx.fillRect(40, 42, 3, h - 48);

        // Nero Marquina Black Marble Countertop
        ctx.fillStyle = '#09090b';
        // Horizontal slab
        ctx.fillRect(6, 8, w - 12, 16);
        // Vertical wing slab
        ctx.fillRect(6, 20, 38, h - 26);

        // Marble Polish Bevel Highlight (Top edge)
        ctx.fillStyle = '#27272a';
        ctx.fillRect(6, 8, w - 12, 2);
        ctx.fillRect(6, 8, 2, h - 14);

        // White & Grey Crystalline Marble Veins
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        // Vein 1 across top
        ctx.moveTo(12, 18);
        ctx.bezierCurveTo(34, 12, 60, 22, 92, 14);
        ctx.lineTo(118, 16);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(212, 212, 216, 0.35)';
        ctx.beginPath();
        // Vein 2 down the wing
        ctx.moveTo(16, 22);
        ctx.bezierCurveTo(28, 40, 14, 62, 32, 85);
        ctx.stroke();

        // Built-in Barista Sink & Rinse Well on inner corner
        ctx.fillStyle = '#3f3f46';
        ctx.fillRect(14, 28, 14, 14);
        ctx.fillStyle = '#18181b';
        ctx.fillRect(16, 30, 10, 10);
        ctx.fillStyle = '#e4e4e7';
        // Gooseneck pitcher rinser
        ctx.fillRect(20, 34, 2, 4);

        // Knockbox cutout with rubber bar
        ctx.fillStyle = '#18181b';
        ctx.fillRect(14, 50, 14, 10);
        ctx.fillStyle = '#71717a';
        ctx.fillRect(12, 54, 18, 2); // Rubber strike bar
      }
    },

    // 2. Commercial 3-Group Espresso Machine (2x1 tiles = 64x32 px)
    {
      name: 'pantry_commercial_espresso_machine_3group',
      w: 64, h: 32,
      draw: (ctx, w, h) => {
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(4, 8, w - 8, h - 10);

        // Polished Stainless Steel Chassis
        ctx.fillStyle = '#64748b';
        ctx.fillRect(6, 6, w - 12, 20);
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(8, 7, w - 16, 8);
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(8, 7, w - 16, 3); // Chrome reflection

        // Top Cup Warmer Rail & Stacked Espresso Cups
        ctx.fillStyle = '#475569';
        ctx.fillRect(8, 4, w - 16, 2);
        // Small ceramic cups on warmer
        for (let x = 12; x < w - 14; x += 8) {
          ctx.fillStyle = '#f8fafc';
          ctx.fillRect(x, 2, 5, 4);
          ctx.fillStyle = '#e2e8f0';
          ctx.fillRect(x + 1, 1, 3, 1);
        }

        // 3 Chrome Group Heads
        const groups = [16, 32, 48];
        groups.forEach(gx => {
          // Group bell
          ctx.fillStyle = '#e2e8f0';
          ctx.fillRect(gx - 4, 15, 8, 4);
          // Portafilter handle pointing down-forward
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(gx - 2, 19, 4, 5);
          ctx.fillStyle = '#334155';
          ctx.fillRect(gx - 1, 24, 2, 4);
        });

        // Dual Dual-needle Pressure Gauges (Red & Gold)
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(23, 9, 6, 6);
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(26, 12, 2.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#0f172a';
        ctx.fillRect(39, 9, 6, 6);
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(42, 12, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Dual Chrome Steam Wands
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1.5;
        // Left steam wand
        ctx.beginPath();
        ctx.moveTo(9, 14);
        ctx.lineTo(6, 23);
        ctx.stroke();
        // Right steam wand
        ctx.beginPath();
        ctx.moveTo(w - 9, 14);
        ctx.lineTo(w - 6, 23);
        ctx.stroke();

        // Tiny steam puff
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.beginPath();
        ctx.arc(5, 25, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Drip tray with slotted grate
        ctx.fillStyle = '#334155';
        ctx.fillRect(6, 24, w - 12, 4);
        ctx.fillStyle = '#1e293b';
        for (let x = 8; x < w - 8; x += 3) {
          ctx.fillRect(x, 25, 1.5, 2);
        }
      }
    },

    // 3. Nitro Cold Brew & Craft Beverage Dispenser Tower (1x1.5 tiles = 32x48 px)
    {
      name: 'pantry_nitro_cold_brew_dispenser_tower',
      w: 32, h: 48,
      draw: (ctx, w, h) => {
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.beginPath();
        ctx.ellipse(16, h - 4, 10, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Stainless Steel Base Flange
        ctx.fillStyle = '#475569';
        ctx.beginPath();
        ctx.ellipse(16, h - 7, 9, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Brushed Brass Tower Column
        ctx.fillStyle = '#b45309';
        ctx.fillRect(12, 14, 8, h - 20);
        ctx.fillStyle = '#d4af37';
        ctx.fillRect(13, 14, 4, h - 20);
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(14, 14, 2, h - 20); // Reflection highlight

        // Cylindrical Tower Top Cap
        ctx.fillStyle = '#d4af37';
        ctx.beginPath();
        ctx.ellipse(16, 14, 5, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Dual Stout Faucets (Nitro Stout Spouts)
        // Left Spout
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(7, 20, 6, 3);
        ctx.fillRect(6, 23, 3, 6);
        // Tall Black Tap Handle
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(8, 8, 2.5, 12);
        ctx.fillStyle = '#d4af37';
        ctx.fillRect(8, 7, 2.5, 2); // Brass ferrule

        // Right Spout
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(19, 20, 6, 3);
        ctx.fillRect(23, 23, 3, 6);
        // Tall Black Tap Handle
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(21, 8, 2.5, 12);
        ctx.fillStyle = '#d4af37';
        ctx.fillRect(21, 7, 2.5, 2);

        // Stainless Drip Tray
        ctx.fillStyle = '#64748b';
        ctx.fillRect(8, h - 10, 16, 3);
        ctx.fillStyle = '#334155';
        ctx.fillRect(9, h - 9, 14, 1.5);
      }
    },

    // 4. Curved Glass Pastry Showcase (2x1 tiles = 64x32 px)
    {
      name: 'pantry_curved_glass_pastry_display_case_2x1',
      w: 64, h: 32,
      draw: (ctx, w, h) => {
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.28)';
        ctx.fillRect(4, 8, w - 8, h - 10);

        // Black Stainless Base
        ctx.fillStyle = '#18181b';
        ctx.fillRect(6, 22, w - 12, 7);

        // Curved Glass Case
        ctx.fillStyle = 'rgba(254, 240, 138, 0.15)'; // Warm LED interior
        ctx.beginPath();
        ctx.moveTo(6, 22);
        ctx.quadraticCurveTo(8, 8, 20, 7);
        ctx.lineTo(w - 20, 7);
        ctx.quadraticCurveTo(w - 8, 8, w - 6, 22);
        ctx.closePath();
        ctx.fill();

        // Glass Outline & Chrome Frame
        ctx.strokeStyle = '#a1a1aa';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Glass Reflection Sweep
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(14, 18);
        ctx.quadraticCurveTo(24, 10, 42, 9);
        ctx.stroke();

        // Two Interior Glass Shelves
        ctx.fillStyle = '#71717a';
        ctx.fillRect(8, 14, w - 16, 1.5);

        // Top Shelf Pastries:
        // Golden Croissants
        ctx.fillStyle = '#d97706';
        ctx.beginPath();
        ctx.ellipse(16, 12, 5, 2.5, -0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(28, 12, 5, 2.5, -0.2, 0, Math.PI * 2);
        ctx.fill();
        // Blueberry Muffins
        ctx.fillStyle = '#78350f';
        ctx.fillRect(40, 9, 6, 5);
        ctx.fillStyle = '#3b82f6'; // Blueberries
        ctx.fillRect(42, 9, 2, 2);
        ctx.fillStyle = '#78350f';
        ctx.fillRect(50, 9, 6, 5);
        ctx.fillStyle = '#3b82f6';
        ctx.fillRect(52, 9, 2, 2);

        // Bottom Shelf Pastries:
        // Strawberry Tarts
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(16, 20, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(26, 20, 3, 0, Math.PI * 2);
        ctx.fill();
        // Glazed Cinnamon Rolls
        ctx.fillStyle = '#b45309';
        ctx.beginPath();
        ctx.ellipse(38, 20, 4, 3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#f8fafc'; // White sugar glaze
        ctx.fillRect(36, 19, 4, 1.5);
        ctx.fillStyle = '#b45309';
        ctx.beginPath();
        ctx.ellipse(49, 20, 4, 3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(47, 19, 4, 1.5);
      }
    },

    // 5. Smart French-Door 4-Door Refrigerator (2x2 tiles = 64x64 px)
    {
      name: 'pantry_smart_french_door_refrigerator_2x2',
      w: 64, h: 64,
      draw: (ctx, w, h) => {
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(4, 6, w - 8, h - 8);

        // Brushed Stainless Steel Body
        ctx.fillStyle = '#334155';
        ctx.fillRect(6, 4, w - 12, h - 8);
        ctx.fillStyle = '#64748b';
        ctx.fillRect(8, 6, w - 16, h - 12);
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(9, 7, w - 18, h - 14);

        // Center split line for French doors
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(w / 2 - 1, 6, 2, 34);

        // Lower Freezer Drawers split line
        ctx.fillRect(8, 40, w - 16, 2);
        ctx.fillRect(8, 52, w - 16, 2);

        // Smart Touchscreen Display on Right Door
        ctx.fillStyle = '#020617';
        ctx.fillRect(38, 12, 14, 22);
        ctx.fillStyle = '#0284c7'; // Screen interface glow
        ctx.fillRect(40, 14, 10, 4);
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(40, 20, 6, 1.5);
        ctx.fillRect(40, 23, 8, 1.5);

        // Ice & Water Dispenser on Left Door
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(14, 15, 12, 16);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(16, 17, 8, 12);
        // Blue LED dispensing light
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(19, 18, 2, 2);
        // Lever
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(19, 22, 2, 5);

        // Full-length Sleek Recessed Handles
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(w / 2 - 3, 10, 2, 26);
        ctx.fillRect(w / 2 + 1, 10, 2, 26);
        // Lower drawer handles
        ctx.fillRect(14, 45, w - 28, 2);
        ctx.fillRect(14, 56, w - 28, 2);
      }
    },

    // 6. Kitchen Sink Counter Unit with Touchless Gooseneck Faucet (3x1.5 tiles = 96x48 px)
    {
      name: 'pantry_kitchen_sink_counter_unit_3x1',
      w: 96, h: 48,
      draw: (ctx, w, h) => {
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.28)';
        ctx.fillRect(4, 8, w - 8, h - 10);

        // Matte Navy Blue Shaker Cabinet Body
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(6, 16, w - 12, h - 20);
        ctx.fillStyle = '#1e293b';
        // 3 Shaker doors
        for (let i = 0; i < 3; i++) {
          const dx = 8 + i * 27;
          ctx.fillRect(dx + 2, 18, 24, h - 25);
          ctx.strokeStyle = '#334155';
          ctx.lineWidth = 1.2;
          ctx.strokeRect(dx + 4, 20, 20, h - 29);
          // Brushed brass handle
          ctx.fillStyle = '#d4af37';
          ctx.fillRect(dx + 20, 26, 2, 6);
        }

        // White Quartz Countertop with waterfall beveled edge
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(4, 10, w - 8, 8);
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(4, 16, w - 8, 2);

        // Double Basin Stainless Steel Undermount Sink
        ctx.fillStyle = '#475569';
        ctx.fillRect(28, 6, 40, 10);
        ctx.fillStyle = '#1e293b';
        // Left basin
        ctx.fillRect(30, 8, 17, 7);
        // Right basin
        ctx.fillRect(49, 8, 17, 7);
        // Chrome drain plugs
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(37, 11, 3, 2);
        ctx.fillRect(56, 11, 3, 2);

        // Modern Chrome Gooseneck Faucet
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(48, 10);
        ctx.lineTo(48, 2);
        ctx.quadraticCurveTo(48, 0, 44, 0);
        ctx.lineTo(44, 4);
        ctx.stroke();

        // Glass Hand Soap & Lotion Dispensers (Amber glass & brass pump)
        ctx.fillStyle = '#b45309';
        ctx.fillRect(72, 8, 4, 6);
        ctx.fillStyle = '#d4af37';
        ctx.fillRect(73, 5, 2, 3);

        // Stainless Dish Drying Rack on Left
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(10, 8, 14, 8);
        ctx.fillStyle = '#f8fafc';
        // Clean plates stacked in rack
        for (let x = 12; x <= 22; x += 3) {
          ctx.fillRect(x, 6, 1.5, 8);
        }
      }
    },

    // 7. Built-in Microwave & Convection Oven Tower (1x2 tiles = 32x64 px)
    {
      name: 'pantry_built_in_microwave_oven_tower_1x2',
      w: 32, h: 64,
      draw: (ctx, w, h) => {
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(2, 4, w - 4, h - 6);

        // Dark Charcoal / Stainless Tower Cabinet
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(4, 2, w - 8, h - 4);
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(5, 3, w - 10, h - 6);

        // Upper Section: Digital Smart Microwave Oven
        ctx.fillStyle = '#334155';
        ctx.fillRect(6, 6, w - 12, 22);
        // Black glass window
        ctx.fillStyle = '#020617';
        ctx.fillRect(8, 8, 16, 18);
        // Interior warm glow
        ctx.fillStyle = 'rgba(254, 240, 138, 0.2)';
        ctx.fillRect(9, 9, 14, 16);
        // Digital control strip
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(25, 8, 6, 18);
        ctx.fillStyle = '#22c55e'; // Green digital clock "12:00"
        ctx.fillRect(26, 10, 4, 2);
        // Buttons
        ctx.fillStyle = '#64748b';
        ctx.fillRect(26, 14, 4, 1.5);
        ctx.fillRect(26, 17, 4, 1.5);
        ctx.fillRect(26, 20, 4, 1.5);

        // Lower Section: Large Convection Oven
        ctx.fillStyle = '#334155';
        ctx.fillRect(6, 32, w - 12, 26);
        // Glass door
        ctx.fillStyle = '#020617';
        ctx.fillRect(8, 36, w - 16, 18);
        // Wire racks inside
        ctx.fillStyle = '#475569';
        ctx.fillRect(10, 42, w - 20, 1.5);
        ctx.fillRect(10, 48, w - 20, 1.5);
        // Chrome Handle
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(8, 33, w - 16, 2);
      }
    },

    // 8. Wall-Mounted Mug Shelf & French Press Organizer (2x1 tiles = 64x32 px)
    {
      name: 'pantry_mug_shelf_organizer_wall_2x1',
      w: 64, h: 32,
      draw: (ctx, w, h) => {
        // Floating Oak Shelves (2 tiers)
        // Top Shelf
        ctx.fillStyle = '#451a03';
        ctx.fillRect(4, 12, w - 8, 3);
        ctx.fillStyle = '#78350f';
        ctx.fillRect(4, 11, w - 8, 2);

        // Bottom Shelf
        ctx.fillStyle = '#451a03';
        ctx.fillRect(4, 26, w - 8, 3);
        ctx.fillStyle = '#78350f';
        ctx.fillRect(4, 25, w - 8, 2);

        // Brass mounting brackets
        ctx.fillStyle = '#d4af37';
        ctx.fillRect(8, 12, 2, 6);
        ctx.fillRect(w - 10, 12, 2, 6);
        ctx.fillRect(8, 26, 2, 5);
        ctx.fillRect(w - 10, 26, 2, 5);

        // Items on Top Shelf: Colorful Ceramic Mugs
        const mugColors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];
        for (let i = 0; i < 5; i++) {
          const mx = 8 + i * 10;
          ctx.fillStyle = mugColors[i];
          ctx.fillRect(mx, 4, 7, 7);
          // Handle
          ctx.fillRect(mx + 7, 5, 2, 4);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(mx + 1, 4, 5, 1.5);
        }

        // Items on Bottom Shelf: Glass French Press & Coffee Tumblers
        // French Press (Left)
        ctx.fillStyle = 'rgba(56, 189, 248, 0.3)';
        ctx.fillRect(10, 16, 8, 9);
        ctx.fillStyle = '#451a03'; // Ground coffee at bottom
        ctx.fillRect(10, 22, 8, 3);
        ctx.fillStyle = '#0f172a'; // Plunger handle
        ctx.fillRect(13, 13, 2, 4);
        ctx.fillRect(11, 13, 6, 1.5);

        // Insulated Tumblers (Right)
        ctx.fillStyle = '#0d9488'; // Teal tumbler
        ctx.fillRect(26, 15, 6, 10);
        ctx.fillStyle = '#f43f5e'; // Pink tumbler
        ctx.fillRect(36, 15, 6, 10);
        ctx.fillStyle = '#0f172a'; // Matte black tumbler
        ctx.fillRect(46, 15, 6, 10);
      }
    },

    // 9. Smart Freestanding RO Water Purifier Dispenser (1x2 tiles = 32x64 px)
    {
      name: 'pantry_smart_water_purifier_dispenser',
      w: 32, h: 64,
      draw: (ctx, w, h) => {
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.beginPath();
        ctx.ellipse(16, h - 4, 10, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Sleek Matte White Modern Body
        ctx.fillStyle = '#e2e8f0';
        ctx.beginPath();
        ctx.roundRect(6, 6, 20, h - 12, 4);
        ctx.fill();
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.roundRect(7, 7, 18, h - 14, 3);
        ctx.fill();

        // Black Glass Dispensing Niche
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(10, 14, 12, 20);

        // Touch Control Panel with glowing LED icons
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(10, 8, 12, 5);
        ctx.fillStyle = '#ef4444'; // Hot indicator dot
        ctx.fillRect(12, 10, 2, 2);
        ctx.fillStyle = '#38bdf8'; // Cold indicator dot
        ctx.fillRect(16, 10, 2, 2);
        ctx.fillStyle = '#22c55e'; // Ambient
        ctx.fillRect(20, 10, 2, 2);

        // Water Spout & Stream
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(15, 14, 2, 3);
        ctx.fillStyle = 'rgba(56, 189, 248, 0.6)';
        ctx.fillRect(15.5, 17, 1, 6);

        // Glass Pitcher on Drip Tray
        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.fillRect(13, 23, 6, 9);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(13, 27, 6, 5); // Filled water

        // Silver Drip Grille
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(9, 34, 14, 3);
        ctx.fillStyle = '#475569';
        ctx.fillRect(10, 35, 12, 1);
      }
    },

    // 10. Artisan Tea & Flavor Syrup Station Rack (2x1 tiles = 64x32 px)
    {
      name: 'pantry_artisan_syrup_tea_station_rack',
      w: 64, h: 32,
      draw: (ctx, w, h) => {
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.fillRect(4, 6, w - 8, h - 8);

        // Rustic 2-Tier Oak Rack Base
        ctx.fillStyle = '#78350f';
        ctx.fillRect(6, 18, w - 12, 10);
        ctx.fillStyle = '#92400e';
        ctx.fillRect(8, 20, w - 16, 8);

        // Tier 1 (Front): Monin Syrup Bottles with Pumps
        const syrups = [
          { color: '#b45309', label: 'Vanilla' },
          { color: '#78350f', label: 'Caramel' },
          { color: '#9a3412', label: 'Hazelnut' }
        ];
        syrups.forEach((s, idx) => {
          const bx = 10 + idx * 10;
          // Glass bottle
          ctx.fillStyle = s.color;
          ctx.fillRect(bx, 10, 6, 12);
          // Label
          ctx.fillStyle = '#fef3c7';
          ctx.fillRect(bx + 1, 14, 4, 5);
          // Gold neck
          ctx.fillStyle = '#d4af37';
          ctx.fillRect(bx + 2, 8, 2, 2);
          // Black Pump Spout
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(bx + 1, 5, 4, 3);
          ctx.fillRect(bx - 1, 7, 2, 1.5);
        });

        // Tier 2 (Right): Apothecary Glass Loose Leaf Tea Jars with cork stoppers
        const teas = ['#15803d', '#ca8a04', '#b91c1c'];
        teas.forEach((tc, idx) => {
          const jx = 42 + idx * 7;
          // Glass jar
          ctx.fillStyle = 'rgba(255,255,255,0.4)';
          ctx.fillRect(jx, 12, 6, 10);
          // Loose tea leaves inside
          ctx.fillStyle = tc;
          ctx.fillRect(jx, 15, 6, 7);
          // Cork stopper
          ctx.fillStyle = '#d97706';
          ctx.fillRect(jx + 1, 10, 4, 2.5);
        });
      }
    },

    // 11. Stainless 3-Compartment Recycling Waste Station (2x1 tiles = 64x32 px)
    {
      name: 'pantry_recycling_waste_station_3bin',
      w: 64, h: 32,
      draw: (ctx, w, h) => {
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.beginPath();
        ctx.ellipse(w / 2, h - 3, w / 2 - 4, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // 3 Stainless Steel Bins
        const bins = [
          { color: '#3b82f6', icon: 'Plastic' }, // Blue
          { color: '#22c55e', icon: 'Compost' }, // Green
          { color: '#475569', icon: 'General' }  // Dark Grey
        ];

        bins.forEach((b, idx) => {
          const bx = 8 + idx * 17;
          // Can Body
          ctx.fillStyle = '#64748b';
          ctx.beginPath();
          ctx.roundRect(bx, 8, 14, 20, 2);
          ctx.fill();
          ctx.fillStyle = '#94a3b8';
          ctx.fillRect(bx + 1, 9, 12, 18);

          // Color-coded flap lid
          ctx.fillStyle = b.color;
          ctx.beginPath();
          ctx.roundRect(bx + 1, 7, 12, 4, 2);
          ctx.fill();

          // Drop slot
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(bx + 3, 12, 8, 2);

          // Category Icon badge
          ctx.fillStyle = b.color;
          ctx.beginPath();
          ctx.arc(bx + 7, 20, 2.5, 0, Math.PI * 2);
          ctx.fill();

          // Foot pedal
          ctx.fillStyle = '#334155';
          ctx.fillRect(bx + 4, 27, 6, 2);
        });
      }
    },

    // 12. Vertical Row of 3 Moss Green Leather Barstools (1x3 tiles = 32x96 px)
    {
      name: 'pantry_moss_green_leather_barstools_row',
      w: 32, h: 96,
      draw: (ctx, w, h) => {
        // 3 barstools arranged vertically at y=16, y=48, y=80
        [16, 48, 80].forEach(by => {
          // Shadow
          ctx.fillStyle = 'rgba(0,0,0,0.25)';
          ctx.beginPath();
          ctx.ellipse(16, by + 8, 8, 4, 0, 0, Math.PI * 2);
          ctx.fill();

          // Splayed black metal legs & brass footring
          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(10, by + 7);
          ctx.lineTo(13, by - 2);
          ctx.moveTo(22, by + 7);
          ctx.lineTo(19, by - 2);
          ctx.stroke();

          // Brass footrest ring
          ctx.strokeStyle = '#d4af37';
          ctx.lineWidth = 1.2;
          ctx.strokeRect(10, by + 2, 12, 1.5);

          // Moss Green Leather Seat Cushion
          ctx.fillStyle = '#14532d';
          ctx.beginPath();
          ctx.roundRect(8, by - 10, 16, 12, 4);
          ctx.fill();
          ctx.fillStyle = '#166534';
          ctx.beginPath();
          ctx.roundRect(9, by - 9, 14, 10, 3);
          ctx.fill();

          // Leather highlight & piping
          ctx.fillStyle = '#22c55e';
          ctx.fillRect(11, by - 8, 10, 2);
        });
      }
    },

    // 13. Amber Glass Edison Pendant Lights (3x1 tiles = 96x32 px)
    {
      name: 'pantry_amber_edison_pendant_lights_row',
      w: 96, h: 32,
      draw: (ctx, w, h) => {
        // 3 Pendant Lights at x=16, x=48, x=80
        [16, 48, 80].forEach(lx => {
          // Black Braided Cord from ceiling
          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(lx, 0);
          ctx.lineTo(lx, 10);
          ctx.stroke();

          // Brass Socket & Cap
          ctx.fillStyle = '#d4af37';
          ctx.fillRect(lx - 2.5, 10, 5, 3);

          // Fluted Amber Glass Shade
          ctx.fillStyle = '#d97706';
          ctx.beginPath();
          ctx.moveTo(lx - 1, 13);
          ctx.lineTo(lx - 8, 22);
          ctx.lineTo(lx + 8, 22);
          ctx.lineTo(lx + 1, 13);
          ctx.closePath();
          ctx.fill();

          // Glowing Filament & Amber Bulb
          ctx.fillStyle = '#fef08a';
          ctx.beginPath();
          ctx.arc(lx, 19, 3.5, 0, Math.PI * 2);
          ctx.fill();

          // Downward Soft Warm Glow Cone
          ctx.fillStyle = 'rgba(254, 240, 138, 0.22)';
          ctx.beginPath();
          ctx.moveTo(lx - 7, 22);
          ctx.lineTo(lx - 16, 32);
          ctx.lineTo(lx + 16, 32);
          ctx.lineTo(lx + 7, 22);
          ctx.closePath();
          ctx.fill();
        });
      }
    },

    // 14. Chalkboard Cafe Daily Menu Signboard (1x2 tiles = 32x64 px)
    {
      name: 'pantry_chalkboard_cafe_menu_sign_1x2',
      w: 32, h: 64,
      draw: (ctx, w, h) => {
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.fillRect(2, 4, w - 4, h - 6);

        // Rustic Walnut Frame
        ctx.fillStyle = '#451a03';
        ctx.beginPath();
        ctx.roundRect(4, 4, w - 8, h - 8, 3);
        ctx.fill();
        ctx.fillStyle = '#78350f';
        ctx.fillRect(6, 6, w - 12, h - 12);

        // Blackboard Surface
        ctx.fillStyle = '#18181b';
        ctx.fillRect(8, 8, w - 16, h - 16);

        // Handwritten Chalk Lettering in Pastel Colors
        // Header "CAFE MENU" in yellow chalk
        ctx.fillStyle = '#fde047';
        ctx.fillRect(10, 12, 12, 2.5);
        ctx.fillRect(10, 16, 12, 1);

        // Item 1: Espresso / Americano (White chalk)
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(10, 20, 8, 1.5);
        ctx.fillStyle = '#fde047';
        ctx.fillRect(20, 20, 3, 1.5);

        // Item 2: Flat White / Latte (Pink chalk)
        ctx.fillStyle = '#f472b6';
        ctx.fillRect(10, 25, 9, 1.5);
        ctx.fillStyle = '#fde047';
        ctx.fillRect(20, 25, 3, 1.5);

        // Item 3: Nitro Cold Brew (Cyan chalk)
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(10, 30, 9, 1.5);
        ctx.fillStyle = '#fde047';
        ctx.fillRect(20, 30, 3, 1.5);

        // Item 4: Matcha / Herbal Tea (Green chalk)
        ctx.fillStyle = '#4ade80';
        ctx.fillRect(10, 35, 9, 1.5);
        ctx.fillStyle = '#fde047';
        ctx.fillRect(20, 35, 3, 1.5);

        // Item 5: Fresh Bakery Pastries (Orange chalk)
        ctx.fillStyle = '#fb923c';
        ctx.fillRect(10, 42, 12, 1.5);
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(10, 46, 8, 1.5);

        // Cute coffee cup chalk doodle at bottom
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(13, 50, 6, 4);
        ctx.fillRect(19, 51, 1.5, 2);
      }
    },

    // 15. Fiddle Leaf Fig Tree in Artisanal Terracotta Pot (1x2 tiles = 32x64 px)
    {
      name: 'pantry_fiddle_fig_terracotta_pot',
      w: 32, h: 64,
      draw: (ctx, w, h) => {
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.beginPath();
        ctx.ellipse(16, h - 4, 10, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Artisanal Terracotta Pot
        ctx.fillStyle = '#c2410c';
        ctx.beginPath();
        ctx.moveTo(8, h - 22);
        ctx.lineTo(10, h - 6);
        ctx.lineTo(22, h - 6);
        ctx.lineTo(24, h - 22);
        ctx.closePath();
        ctx.fill();

        // Pot Rim
        ctx.fillStyle = '#ea580c';
        ctx.beginPath();
        ctx.roundRect(7, h - 24, 18, 4, 2);
        ctx.fill();

        // Dark Soil
        ctx.fillStyle = '#451a03';
        ctx.fillRect(9, h - 23, 14, 2);

        // Woody Trunk
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(16, h - 22);
        ctx.lineTo(16, 18);
        ctx.stroke();

        // Broad Fiddle Fig Violin Leaves
        const leaves = [
          { x: 10, y: 14, r: 8, angle: -0.3 },
          { x: 22, y: 12, r: 8, angle: 0.3 },
          { x: 16, y: 6, r: 9, angle: 0 },
          { x: 8, y: 24, r: 7, angle: -0.4 },
          { x: 23, y: 22, r: 7, angle: 0.4 }
        ];

        leaves.forEach(l => {
          ctx.save();
          ctx.translate(l.x, l.y);
          ctx.rotate(l.angle);
          ctx.fillStyle = '#15803d';
          ctx.beginPath();
          ctx.ellipse(0, 0, l.r, 5, 0, 0, Math.PI * 2);
          ctx.fill();
          // Leaf vein highlight
          ctx.fillStyle = '#22c55e';
          ctx.fillRect(-l.r + 2, -0.5, l.r * 2 - 4, 1);
          ctx.restore();
        });
      }
    }
  ];

  console.log(`Starting generation of ${spriteDefs.length} sprites for Khu 10...`);

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
  console.log('Finished generating all Khu 10 sprites successfully!');
})();
