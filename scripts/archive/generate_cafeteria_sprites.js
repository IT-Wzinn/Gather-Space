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
    // 1. Communal Solid Oak Long Dining Table (6x2 tiles = 192x64 px)
    {
      name: 'cafeteria_communal_oak_dining_table_6x2',
      w: 192, h: 64,
      draw: (ctx, w, h) => {
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(8, 12, w - 16, h - 14);

        // Black Steel Industrial X-Frame Legs
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 3;
        // Left X-leg
        ctx.beginPath();
        ctx.moveTo(18, 20);
        ctx.lineTo(28, h - 4);
        ctx.moveTo(28, 20);
        ctx.lineTo(18, h - 4);
        ctx.stroke();
        // Right X-leg
        ctx.beginPath();
        ctx.moveTo(w - 28, 20);
        ctx.lineTo(w - 18, h - 4);
        ctx.moveTo(w - 18, 20);
        ctx.lineTo(w - 28, h - 4);
        ctx.stroke();
        // Center stabilizer bar
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(23, h - 12);
        ctx.lineTo(w - 23, h - 12);
        ctx.stroke();

        // Solid English Oak Tabletop Slab
        ctx.fillStyle = '#78350f';
        ctx.fillRect(6, 14, w - 12, 34);
        ctx.fillStyle = '#92400e';
        ctx.fillRect(8, 16, w - 16, 30);
        ctx.fillStyle = '#b45309';
        ctx.fillRect(8, 16, w - 16, 6); // Top bevel highlight

        // Natural Oak Plank Lines
        ctx.fillStyle = '#78350f';
        ctx.fillRect(8, 26, w - 16, 1.5);
        ctx.fillRect(8, 36, w - 16, 1.5);

        // Center Table Runner (Linen Charcoal)
        ctx.fillStyle = '#334155';
        ctx.fillRect(20, 24, w - 40, 14);
        ctx.fillStyle = '#475569';
        ctx.fillRect(20, 24, w - 40, 2);

        // Tabletop Accessories:
        // A. Stainless Napkin Caddy & Salt/Pepper (Center-left)
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(68, 26, 8, 8);
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(69, 23, 6, 4); // White napkins folded
        // Salt shaker (White) & Pepper shaker (Black)
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(80, 27, 3, 5);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(85, 27, 3, 5);

        // B. Floral Bud Vase (Center)
        ctx.fillStyle = 'rgba(56, 189, 248, 0.5)';
        ctx.fillRect(96, 26, 5, 8);
        ctx.fillStyle = '#facc15'; // Yellow daisies
        ctx.beginPath();
        ctx.arc(98.5, 23, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(98, 26, 1.5, 3);

        // C. Toothpick dispenser & Condiments (Center-right)
        ctx.fillStyle = '#d4af37';
        ctx.fillRect(112, 27, 4, 6);
        ctx.fillStyle = '#ef4444'; // Sriracha sauce bottle with green cap
        ctx.fillRect(122, 25, 4, 8);
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(123, 23, 2, 2);
      }
    },

    // 2. Scandinavian Dining Chairs Front Row (Facing South: 6x1 tiles = 192x32 px)
    {
      name: 'cafeteria_scandi_dining_chairs_row_front',
      w: 192, h: 32,
      draw: (ctx, w, h) => {
        // 4 chairs along top at x=20, x=68, x=116, x=164
        const chairs = [
          { x: 20, color: '#eab308', pad: '#ca8a04' }, // Mustard
          { x: 68, color: '#0284c7', pad: '#0369a1' }, // Blue
          { x: 116, color: '#ea580c', pad: '#c2410c' }, // Terracotta
          { x: 164, color: '#475569', pad: '#334155' }  // Charcoal
        ];

        chairs.forEach(c => {
          // Shadow
          ctx.fillStyle = 'rgba(0,0,0,0.25)';
          ctx.beginPath();
          ctx.ellipse(c.x + 10, 26, 10, 4, 0, 0, Math.PI * 2);
          ctx.fill();

          // Oak Dowel Legs
          ctx.strokeStyle = '#78350f';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(c.x + 3, 26);
          ctx.lineTo(c.x + 6, 12);
          ctx.moveTo(c.x + 17, 26);
          ctx.lineTo(c.x + 14, 12);
          ctx.stroke();

          // Molded Curved Chair Shell (Front view, looking south)
          ctx.fillStyle = c.color;
          ctx.beginPath();
          ctx.roundRect(c.x, 8, 20, 16, 5);
          ctx.fill();

          // Padded Seat Cushion
          ctx.fillStyle = c.pad;
          ctx.beginPath();
          ctx.roundRect(c.x + 2, 14, 16, 9, 3);
          ctx.fill();

          // Curved Backrest rim highlight
          ctx.strokeStyle = 'rgba(255,255,255,0.3)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(c.x + 10, 13, 7, Math.PI, 0);
          ctx.stroke();
        });
      }
    },

    // 3. Scandinavian Dining Chairs Back Row (Facing North: 6x1 tiles = 192x32 px)
    {
      name: 'cafeteria_scandi_dining_chairs_row_back',
      w: 192, h: 32,
      draw: (ctx, w, h) => {
        // 4 chairs along bottom at x=20, x=68, x=116, x=164
        const chairs = [
          { x: 20, color: '#eab308', dark: '#a16207' },
          { x: 68, color: '#0284c7', dark: '#075985' },
          { x: 116, color: '#ea580c', dark: '#9a3412' },
          { x: 164, color: '#475569', dark: '#1e293b' }
        ];

        chairs.forEach(c => {
          // Shadow
          ctx.fillStyle = 'rgba(0,0,0,0.25)';
          ctx.beginPath();
          ctx.ellipse(c.x + 10, 27, 9, 4, 0, 0, Math.PI * 2);
          ctx.fill();

          // Oak Dowel Legs
          ctx.strokeStyle = '#78350f';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(c.x + 4, 27);
          ctx.lineTo(c.x + 6, 16);
          ctx.moveTo(c.x + 16, 27);
          ctx.lineTo(c.x + 14, 16);
          ctx.stroke();

          // Curved Backrest Shell (Back view, facing north toward table)
          ctx.fillStyle = c.color;
          ctx.beginPath();
          ctx.roundRect(c.x + 1, 4, 18, 14, 5);
          ctx.fill();

          // Outer shell shadow & contour
          ctx.fillStyle = c.dark;
          ctx.fillRect(c.x + 2, 14, 16, 3);

          // Wood grain or subtle contour line
          ctx.strokeStyle = 'rgba(255,255,255,0.25)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(c.x + 4, 6);
          ctx.quadraticCurveTo(c.x + 10, 9, c.x + 16, 6);
          ctx.stroke();
        });
      }
    },

    // 4. Cozy Booth Sofa Dining Set in Terracotta Leather (4x3 tiles = 128x96 px)
    {
      name: 'cafeteria_cozy_booth_sofa_dining_set_4x3',
      w: 128, h: 96,
      draw: (ctx, w, h) => {
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.32)';
        ctx.fillRect(6, 10, w - 12, h - 14);

        // U-Shaped Banquette Booth Backrest (Terracotta Leather)
        ctx.fillStyle = '#7c2d12';
        ctx.fillRect(8, 12, w - 16, h - 20);

        // North Bench Backrest (Fluted leather)
        ctx.fillStyle = '#c2410c';
        ctx.fillRect(10, 14, w - 20, 16);
        ctx.fillStyle = '#9a3412';
        for (let x = 14; x < w - 20; x += 10) {
          ctx.fillRect(x, 14, 2, 16);
        }

        // South Bench Backrest
        ctx.fillStyle = '#c2410c';
        ctx.fillRect(10, h - 22, w - 20, 14);
        ctx.fillStyle = '#9a3412';
        for (let x = 14; x < w - 20; x += 10) {
          ctx.fillRect(x, h - 22, 2, 14);
        }

        // East Connecting Banquette Backrest
        ctx.fillStyle = '#c2410c';
        ctx.fillRect(w - 24, 28, 14, h - 48);

        // Padded Bench Seats
        ctx.fillStyle = '#ea580c';
        // North seat
        ctx.fillRect(12, 30, w - 36, 10);
        // South seat
        ctx.fillRect(12, h - 34, w - 36, 10);
        // East seat
        ctx.fillRect(w - 34, 30, 10, h - 60);

        // Central Walnut Dining Table
        ctx.fillStyle = '#451a03';
        ctx.fillRect(14, 40, w - 48, 22);
        ctx.fillStyle = '#78350f';
        ctx.fillRect(16, 42, w - 52, 18);

        // Place Settings on Table:
        // Left Setting (Ceramic bowl with noodles/salad & chopsticks)
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.arc(32, 51, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#f97316'; // Food inside bowl
        ctx.beginPath();
        ctx.arc(32, 51, 4, 0, Math.PI * 2);
        ctx.fill();
        // Chopsticks
        ctx.fillStyle = '#d4af37';
        ctx.fillRect(26, 45, 12, 1.5);

        // Right Setting (Sandwich plate & iced tea glass)
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.ellipse(64, 51, 7, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ca8a04'; // Toasted sandwich triangle
        ctx.beginPath();
        ctx.moveTo(60, 53);
        ctx.lineTo(66, 48);
        ctx.lineTo(67, 53);
        ctx.closePath();
        ctx.fill();

        // Iced Tea Glass
        ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.fillRect(78, 47, 4, 7);
        ctx.fillStyle = '#b45309'; // Tea
        ctx.fillRect(78, 49, 4, 5);
        ctx.fillStyle = '#facc15'; // Lemon slice
        ctx.fillRect(79, 46, 2, 2);
      }
    },

    // 5. Industrial Dome Pendant Light (1x1 tile = 32x32 px)
    {
      name: 'cafeteria_dome_pendant_light',
      w: 32, h: 32,
      draw: (ctx, w, h) => {
        // Black hanging cord
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(16, 0);
        ctx.lineTo(16, 12);
        ctx.stroke();

        // Brass socket cap
        ctx.fillStyle = '#d4af37';
        ctx.fillRect(14, 12, 4, 2.5);

        // Matte Black Metal Dome Shade
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.arc(16, 20, 8, Math.PI, 0);
        ctx.lineTo(24, 20);
        ctx.lineTo(8, 20);
        ctx.closePath();
        ctx.fill();

        // Warm Gold Interior Rim
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.ellipse(16, 20, 8, 2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Glowing warm bulb
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(16, 20, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Downward soft ambient light
        ctx.fillStyle = 'rgba(254, 240, 138, 0.22)';
        ctx.beginPath();
        ctx.moveTo(9, 20);
        ctx.lineTo(2, 32);
        ctx.lineTo(30, 32);
        ctx.lineTo(23, 20);
        ctx.closePath();
        ctx.fill();
      }
    },

    // 6. Buffet Food Warmer Bain-Marie Steam Table (4x1 tiles = 128x32 px)
    {
      name: 'cafeteria_buffet_food_warmer_steam_table_4x1',
      w: 128, h: 32,
      draw: (ctx, w, h) => {
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.28)';
        ctx.fillRect(4, 6, w - 8, h - 8);

        // Stainless Steel Base Cabinet
        ctx.fillStyle = '#475569';
        ctx.fillRect(6, 10, w - 12, h - 14);
        ctx.fillStyle = '#64748b';
        ctx.fillRect(8, 12, w - 16, h - 18);

        // Stainless Counter Top with Sneeze Guard Posts
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(4, 8, w - 8, 5);
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(4, 8, w - 8, 1.5);

        // Glass Sneeze Guard Canopy
        ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.fillRect(8, 2, w - 16, 4);
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1;
        ctx.strokeRect(8, 2, w - 16, 4);
        // Chrome upright posts
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(10, 2, 2, 8);
        ctx.fillRect(w - 12, 2, 2, 8);

        // 4 Gastronorm Pan Wells with warm food
        const wells = [
          { x: 14, food: '#f8fafc', name: 'Rice' },       // Jasmine rice
          { x: 42, food: '#d97706', name: 'Curry' },      // Golden curry
          { x: 70, food: '#16a34a', name: 'Broccoli' },   // Steamed greens
          { x: 98, food: '#dc2626', name: 'Soup' }        // Tomato bisque
        ];

        wells.forEach(pw => {
          // Pan rim
          ctx.fillStyle = '#cbd5e1';
          ctx.fillRect(pw.x - 1, 11, 24, 15);
          // Food well
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(pw.x, 12, 22, 13);
          // Warm food filling
          ctx.fillStyle = pw.food;
          ctx.fillRect(pw.x + 1, 13, 20, 11);

          // Serving Ladle / Tong handle resting in pan
          ctx.fillStyle = '#e2e8f0';
          ctx.fillRect(pw.x + 8, 9, 2, 8);

          // Temperature digital LED (tiny green dot)
          ctx.fillStyle = '#22c55e';
          ctx.fillRect(pw.x + 10, 28, 2, 1.5);
        });
      }
    },

    // 7. Chilled Salad Bar Cold Well Counter (3x1 tiles = 96x32 px)
    {
      name: 'cafeteria_salad_bar_cold_well_counter_3x1',
      w: 96, h: 32,
      draw: (ctx, w, h) => {
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.28)';
        ctx.fillRect(4, 6, w - 8, h - 8);

        // Stainless Refrigerator Base
        ctx.fillStyle = '#475569';
        ctx.fillRect(6, 10, w - 12, h - 14);
        ctx.fillStyle = '#64748b';
        ctx.fillRect(8, 12, w - 16, h - 18);

        // Countertop & Glass sneeze guard
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(4, 8, w - 8, 5);
        ctx.fillStyle = 'rgba(56, 189, 248, 0.25)'; // Chilled glass guard
        ctx.fillRect(8, 2, w - 16, 4);
        ctx.strokeStyle = '#cbd5e1';
        ctx.strokeRect(8, 2, w - 16, 4);

        // Crushed Ice Bed (Cyan-white texture)
        ctx.fillStyle = '#e0f2fe';
        ctx.fillRect(8, 11, w - 16, 15);

        // Salad ingredient bowls embedded in ice:
        // 1. Crisp Romaine Lettuce (Large green bowl)
        ctx.fillStyle = '#15803d';
        ctx.fillRect(12, 12, 18, 12);
        ctx.fillStyle = '#4ade80';
        ctx.fillRect(14, 13, 14, 10);

        // 2. Cherry Tomatoes (Red bowl)
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(34, 12, 14, 12);
        ctx.fillStyle = '#f87171';
        for (let x = 36; x < 46; x += 4) {
          ctx.fillRect(x, 14, 2, 2);
        }

        // 3. Sweet Corn (Yellow bowl)
        ctx.fillStyle = '#eab308';
        ctx.fillRect(52, 12, 14, 12);
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(54, 13, 10, 10);

        // 4. Dressing Pump Dispensers (Ranch & Balsamic)
        ctx.fillStyle = '#f8fafc'; // White Ranch bottle
        ctx.fillRect(70, 10, 8, 14);
        ctx.fillStyle = '#0f172a'; // Pump
        ctx.fillRect(73, 7, 2, 3);

        ctx.fillStyle = '#451a03'; // Dark Balsamic bottle
        ctx.fillRect(82, 10, 8, 14);
        ctx.fillStyle = '#0f172a'; // Pump
        ctx.fillRect(85, 7, 2, 3);
      }
    },

    // 8. Cafeteria Tray & Silverware Station Dispenser (1x2 tiles = 32x64 px)
    {
      name: 'cafeteria_tray_cutlery_station_dispenser',
      w: 32, h: 64,
      draw: (ctx, w, h) => {
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.beginPath();
        ctx.ellipse(16, h - 4, 10, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Stainless Steel Mobile Cart Frame
        ctx.fillStyle = '#475569';
        ctx.fillRect(6, 12, 20, h - 18);
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(7, 14, 18, h - 22);

        // 4 Swivel Caster Wheels
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(6, h - 6, 4, 4);
        ctx.fillRect(22, h - 6, 4, 4);

        // Spring-Loaded Tray Dispenser Platform (Lower tier)
        ctx.fillStyle = '#334155';
        ctx.fillRect(8, 30, 16, 24);
        // Stack of Melamine Serving Trays (Woodgrain & Navy)
        for (let y = 32; y < 50; y += 3) {
          ctx.fillStyle = (y % 6 === 0) ? '#78350f' : '#1e3a8a';
          ctx.fillRect(7, y, 18, 2);
        }

        // Top Tier: 4 Silverware Cylinders & Napkin Dispenser
        ctx.fillStyle = '#64748b';
        ctx.fillRect(6, 10, 20, 18);

        // Silver Cylinders with Utensils
        const utensils = [9, 15, 21];
        utensils.forEach(ux => {
          ctx.fillStyle = '#cbd5e1';
          ctx.fillRect(ux, 14, 5, 10);
          // Silverware handles sticking out
          ctx.fillStyle = '#f8fafc';
          ctx.fillRect(ux + 1, 8, 1.5, 6);
          ctx.fillRect(ux + 3, 8, 1.5, 6);
        });

        // Napkin dispenser box on top
        ctx.fillStyle = '#334155';
        ctx.fillRect(10, 3, 12, 7);
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(12, 5, 8, 2); // White napkin paper
      }
    },

    // 9. Modern Smart Vending Machine (2x2 tiles = 64x64 px)
    {
      name: 'cafeteria_modern_vending_machine_2x2',
      w: 64, h: 64,
      draw: (ctx, w, h) => {
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(4, 6, w - 8, h - 8);

        // Matte Charcoal Black Exterior Chassis
        ctx.fillStyle = '#09090b';
        ctx.beginPath();
        ctx.roundRect(6, 4, w - 12, h - 8, 3);
        ctx.fill();

        // Large Illuminated Double-Pane Glass Window (Left 36px)
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(10, 8, 34, 38);
        ctx.fillStyle = 'rgba(56, 189, 248, 0.15)'; // Interior LED glow
        ctx.fillRect(10, 8, 34, 38);

        // 3 Shelves of Cold Drinks & Snacks
        // Shelf 1 (Top): Soda Cans (Coca Cola red, Sprite green, Pepsi blue)
        ctx.fillStyle = '#475569';
        ctx.fillRect(11, 18, 32, 1.5);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(13, 10, 4, 8);
        ctx.fillStyle = '#10b981';
        ctx.fillRect(19, 10, 4, 8);
        ctx.fillStyle = '#3b82f6';
        ctx.fillRect(25, 10, 4, 8);
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(31, 10, 4, 8);

        // Shelf 2 (Middle): Tea & Mineral Water Bottles
        ctx.fillStyle = '#475569';
        ctx.fillRect(11, 30, 32, 1.5);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(14, 21, 4, 9);
        ctx.fillStyle = '#15803d';
        ctx.fillRect(20, 21, 4, 9);
        ctx.fillStyle = '#a855f7';
        ctx.fillRect(26, 21, 4, 9);
        ctx.fillStyle = '#f97316';
        ctx.fillRect(32, 21, 4, 9);

        // Shelf 3 (Bottom): Chip Bags & Candy Bars
        ctx.fillStyle = '#475569';
        ctx.fillRect(11, 42, 32, 1.5);
        ctx.fillStyle = '#eab308';
        ctx.fillRect(14, 34, 5, 8);
        ctx.fillStyle = '#ec4899';
        ctx.fillRect(22, 34, 5, 8);
        ctx.fillStyle = '#6366f1';
        ctx.fillRect(30, 34, 5, 8);

        // Right Panel: Smart Touchscreen & Payment Terminal
        ctx.fillStyle = '#18181b';
        ctx.fillRect(46, 8, 12, 38);
        // Touchscreen
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(48, 12, 8, 14);
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(49, 14, 6, 2);
        // NFC contactless tap sensor & Keypad
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(50, 29, 4, 3);
        ctx.fillStyle = '#52525b';
        ctx.fillRect(49, 34, 6, 7);

        // Dispensing Retrieval Door at Bottom
        ctx.fillStyle = '#18181b';
        ctx.fillRect(12, 49, 30, 8);
        ctx.fillStyle = '#27272a';
        ctx.fillRect(14, 50, 26, 6);
        ctx.fillStyle = '#71717a';
        ctx.fillRect(22, 52, 10, 2); // Push flap handle
      }
    },

    // 10. Commercial Scotsman Stainless Ice Maker (1x2 tiles = 32x64 px)
    {
      name: 'cafeteria_commercial_ice_maker_unit',
      w: 32, h: 64,
      draw: (ctx, w, h) => {
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.fillRect(2, 4, w - 4, h - 6);

        // Brushed Stainless Steel Upright Body
        ctx.fillStyle = '#334155';
        ctx.fillRect(4, 2, w - 8, h - 4);
        ctx.fillStyle = '#64748b';
        ctx.fillRect(5, 3, w - 10, h - 6);
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(6, 4, w - 12, h - 8);

        // Top Condenser Air Vents
        ctx.fillStyle = '#1e293b';
        for (let y = 8; y <= 20; y += 3) {
          ctx.fillRect(8, y, w - 16, 1.5);
        }

        // Ice Dispenser Niche (Blue LED)
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(8, 26, 16, 20);
        ctx.fillStyle = 'rgba(56, 189, 248, 0.3)';
        ctx.fillRect(8, 26, 16, 20);

        // Ice Dispensing Chute & Push Lever
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(14, 26, 4, 4);
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(15, 30, 2, 6);

        // Clear Ice Cubes visible in bin window
        ctx.fillStyle = '#e0f2fe';
        ctx.fillRect(11, 38, 3, 3);
        ctx.fillRect(16, 40, 3, 3);
        ctx.fillRect(13, 42, 3, 3);

        // Scotsman Brand Emblem
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(10, 50, 12, 3);

        // Stainless Bottom Drip Pan
        ctx.fillStyle = '#475569';
        ctx.fillRect(6, h - 9, w - 12, 4);
      }
    },

    // 11. Multi-Tier Dish & Tray Bussing Cart Station (2x2 tiles = 64x64 px)
    {
      name: 'cafeteria_dish_tray_return_bus_cart_2x2',
      w: 64, h: 64,
      draw: (ctx, w, h) => {
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.28)';
        ctx.fillRect(4, 8, w - 8, h - 10);

        // Heavy-Duty Stainless Steel Tubular Frame
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 2.5;
        ctx.strokeRect(8, 6, w - 16, h - 14);

        // 4 Caster Wheels
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(8, h - 8, 5, 5);
        ctx.fillRect(w - 13, h - 8, 5, 5);

        // 3 Shelves
        const shelves = [14, 30, 46];
        shelves.forEach((sy, idx) => {
          ctx.fillStyle = '#94a3b8';
          ctx.fillRect(8, sy, w - 16, 3);

          if (idx === 0) {
            // Top Shelf: Stacked used trays & plates
            ctx.fillStyle = '#78350f'; // Tray
            ctx.fillRect(12, sy - 4, 24, 4);
            ctx.fillStyle = '#f8fafc'; // White ceramic plates stacked
            for (let i = 0; i < 3; i++) {
              ctx.fillRect(14, sy - 7 - i * 2, 18, 1.5);
            }
            // Cutlery bin (grey box with spoons/forks)
            ctx.fillStyle = '#475569';
            ctx.fillRect(40, sy - 8, 14, 8);
            ctx.fillStyle = '#cbd5e1';
            ctx.fillRect(42, sy - 11, 2, 4);
            ctx.fillRect(46, sy - 11, 2, 4);
            ctx.fillRect(50, sy - 11, 2, 4);
          } else if (idx === 1) {
            // Middle Shelf: Used bowls & drinking cups
            ctx.fillStyle = '#1e3a8a'; // Blue tray
            ctx.fillRect(12, sy - 4, 36, 4);
            ctx.fillStyle = '#f8fafc'; // Bowls
            ctx.fillRect(15, sy - 8, 8, 4);
            ctx.fillRect(26, sy - 8, 8, 4);
            // Plastic cups
            ctx.fillStyle = 'rgba(56, 189, 248, 0.6)';
            ctx.fillRect(38, sy - 9, 5, 6);
          } else {
            // Bottom Shelf: Food scraps waste bin (Green compost tote)
            ctx.fillStyle = '#15803d';
            ctx.fillRect(12, sy - 10, w - 24, 10);
            ctx.fillStyle = '#166534';
            ctx.fillRect(14, sy - 8, w - 28, 7);
          }
        });
      }
    },

    // 12. Grand Monstera Deliciosa in Ceramic Planter (1x2 tiles = 32x64 px)
    {
      name: 'cafeteria_monstera_deliciosa_grand_pot',
      w: 32, h: 64,
      draw: (ctx, w, h) => {
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.beginPath();
        ctx.ellipse(16, h - 4, 10, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Wooden Tripod Stand
        ctx.fillStyle = '#78350f';
        ctx.fillRect(9, h - 8, 3, 6);
        ctx.fillRect(20, h - 8, 3, 6);

        // Fluted White Ceramic Cylinder Pot
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(8, h - 26, 16, 19);
        ctx.fillStyle = '#e2e8f0';
        for (let x = 10; x <= 22; x += 3) {
          ctx.fillRect(x, h - 25, 1.5, 18);
        }
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(7, h - 27, 18, 3);

        // Pot Soil
        ctx.fillStyle = '#451a03';
        ctx.fillRect(9, h - 26, 14, 2);

        // Stems
        ctx.strokeStyle = '#15803d';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(16, h - 25);
        ctx.quadraticCurveTo(12, 20, 8, 12);
        ctx.moveTo(16, h - 25);
        ctx.quadraticCurveTo(20, 18, 24, 10);
        ctx.moveTo(16, h - 25);
        ctx.quadraticCurveTo(16, 14, 16, 6);
        ctx.stroke();

        // Iconic Split Swiss Cheese Monstera Leaves
        const leaves = [
          { x: 8, y: 12, r: 8, angle: -0.3 },
          { x: 24, y: 10, r: 8, angle: 0.3 },
          { x: 16, y: 6, r: 9, angle: 0 },
          { x: 10, y: 22, r: 7, angle: -0.4 },
          { x: 22, y: 20, r: 7, angle: 0.4 }
        ];

        leaves.forEach(l => {
          ctx.save();
          ctx.translate(l.x, l.y);
          ctx.rotate(l.angle);
          // Leaf body
          ctx.fillStyle = '#16a34a';
          ctx.beginPath();
          ctx.ellipse(0, 0, l.r, 6, 0, 0, Math.PI * 2);
          ctx.fill();

          // Leaf holes / slits (Fenestrations)
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(-3, -2, 2, 4);
          ctx.fillRect(1, -2, 2, 4);

          // Leaf center vein
          ctx.fillStyle = '#86efac';
          ctx.fillRect(-l.r + 2, -0.5, l.r * 2 - 4, 1);
          ctx.restore();
        });
      }
    }
  ];

  console.log(`Starting generation of ${spriteDefs.length} sprites for Khu 11...`);

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
  console.log('Finished generating all Khu 11 sprites successfully!');
})();
