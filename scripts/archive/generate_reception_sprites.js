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
    {
      name: 'grand_welcome_mat_3x2',
      w: 48, h: 32,
      draw: (ctx, w, h) => {
        // Deep Navy Velvet Rug with Gold Greek Key border
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, w, h);
        // Outer gold border
        ctx.strokeStyle = '#eab308';
        ctx.lineWidth = 2;
        ctx.strokeRect(1, 1, w - 2, h - 2);
        // Inner navy field
        ctx.fillStyle = '#1e3a8a';
        ctx.fillRect(3, 3, w - 6, h - 6);
        // Gold corner accents
        ctx.fillStyle = '#facc15';
        ctx.fillRect(4, 4, 3, 3);
        ctx.fillRect(w - 7, 4, 3, 3);
        ctx.fillRect(4, h - 7, 3, 3);
        ctx.fillRect(w - 7, h - 7, 3, 3);
        // Gold laurel wreath center
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(w / 2, h / 2, 8, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = '#facc15';
        ctx.font = 'bold 7px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('QV', w / 2, h / 2);
      }
    },
    {
      name: 'security_turnstiles_pair',
      w: 32, h: 16,
      draw: (ctx, w, h) => {
        // Left post (stainless steel)
        ctx.fillStyle = '#64748b';
        ctx.fillRect(1, 1, 9, 14);
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(2, 2, 7, 3);
        // Green LED arrow
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(4, 7, 3, 3);

        // Right post
        ctx.fillStyle = '#64748b';
        ctx.fillRect(22, 1, 9, 14);
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(23, 2, 7, 3);
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(25, 7, 3, 3);

        // Glass swing flap in center
        ctx.fillStyle = 'rgba(56, 189, 248, 0.5)';
        ctx.fillRect(10, 6, 12, 4);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1;
        ctx.strokeRect(10, 6, 12, 4);
      }
    },
    {
      name: 'touch_kiosk_checkin',
      w: 16, h: 32,
      draw: (ctx, w, h) => {
        // Heavy base
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(2, 28, 12, 4);
        // Sleek stand
        ctx.fillStyle = '#334155';
        ctx.fillRect(4, 18, 8, 10);
        // Kiosk head
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(1, 1, 14, 18);
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 1;
        ctx.strokeRect(1, 1, 14, 18);
        // Glowing cyan screen
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(3, 3, 10, 13);
        // Face scanner frame on screen
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1;
        ctx.strokeRect(5, 5, 6, 6);
        // Indicator LED
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(7, 13, 2, 2);
      }
    },
    {
      name: 'umbrella_wrapping_station',
      w: 16, h: 16,
      draw: (ctx, w, h) => {
        // Metallic cylinder
        ctx.fillStyle = '#475569';
        ctx.fillRect(3, 2, 10, 13);
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(4, 3, 8, 3);
        // Gold trim
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(2, 13, 12, 2);
        // Slots
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(5, 4, 2, 8);
        ctx.fillRect(9, 4, 2, 8);
        // Umbrella handles sticking out
        ctx.strokeStyle = '#dc2626';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(6, 3, 2, Math.PI, 0);
        ctx.stroke();
      }
    },
    {
      name: 'grand_palm_pot',
      w: 16, h: 32,
      draw: (ctx, w, h) => {
        // Heavy marble planter pot
        ctx.fillStyle = '#f1f5f9';
        ctx.fillRect(2, 20, 12, 11);
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1;
        ctx.strokeRect(2, 20, 12, 11);
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(4, 22, 8, 7);

        // Lush Palm fronds
        ctx.fillStyle = '#15803d';
        // Left frond
        ctx.beginPath();
        ctx.ellipse(4, 12, 8, 4, -Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();
        // Right frond
        ctx.beginPath();
        ctx.ellipse(12, 12, 8, 4, Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();
        // Center crown
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.ellipse(8, 7, 5, 7, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(3, 8, 6, 3, -Math.PI / 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(13, 8, 6, 3, Math.PI / 6, 0, Math.PI * 2);
        ctx.fill();
      }
    },
    {
      name: 'reception_imac_desktop',
      w: 16, h: 16,
      draw: (ctx, w, h) => {
        // Aluminum stand
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(6, 12, 4, 3);
        ctx.fillRect(5, 14, 6, 1);
        // Slim display
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(1, 1, 14, 11);
        // Blue screen
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(2, 2, 12, 8);
        // Aluminum chin
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(1, 10, 14, 2);
        // Keyboard & mouse
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(3, 14, 7, 2);
        ctx.fillRect(11, 14, 2, 2);
      }
    },
    {
      name: 'company_logo_led_gold',
      w: 48, h: 16,
      draw: (ctx, w, h) => {
        // Backing dark acoustic wood panel
        ctx.fillStyle = '#1e1b4b';
        ctx.fillRect(1, 1, w - 2, h - 2);
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 1;
        ctx.strokeRect(1, 1, w - 2, h - 2);
        // Golden glowing text
        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('✦ QV GATHER ✦', w / 2, h / 2 - 1);
        ctx.fillStyle = '#94a3b8';
        ctx.font = 'bold 5px sans-serif';
        ctx.fillText('ENTERPRISE CAMPUS', w / 2, h / 2 + 5);
      }
    },
    {
      name: 'world_time_wall_clock',
      w: 32, h: 16,
      draw: (ctx, w, h) => {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, w, h);
        const cities = ['HN', 'TYO', 'LDN', 'NYC'];
        for (let i = 0; i < 4; i++) {
          const cx = 4 + i * 8;
          const cy = 6;
          // Clock face
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(cx, cy, 3, 0, Math.PI * 2);
          ctx.fill();
          // Hands
          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx, cy - 2);
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx + 1.5, cy);
          ctx.stroke();
          // Label
          ctx.fillStyle = '#94a3b8';
          ctx.font = '4.5px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(cities[i], cx, 14);
        }
      }
    },
    {
      name: 'water_dispenser_cold_hot',
      w: 16, h: 24,
      draw: (ctx, w, h) => {
        // Inverted Blue Water Bottle
        ctx.fillStyle = '#0284c7';
        ctx.beginPath();
        ctx.roundRect(4, 1, 8, 8, 3);
        ctx.fill();
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(5, 2, 2, 6);
        // White dispenser body
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(3, 9, 10, 14);
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1;
        ctx.strokeRect(3, 9, 10, 14);
        // Dispenser recess
        ctx.fillStyle = '#334155';
        ctx.fillRect(5, 12, 6, 5);
        // Red (Hot) & Blue (Cold) faucets
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(5.5, 12, 2, 2);
        ctx.fillStyle = '#3b82f6';
        ctx.fillRect(8.5, 12, 2, 2);
        // Cup stack
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(1, 11, 2, 7);
      }
    },
    {
      name: 'trophy_glass_cabinet_tall',
      w: 32, h: 32,
      draw: (ctx, w, h) => {
        // Dark wood frame
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(1, 1, w - 2, h - 2);
        // Glass shelves
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(3, 3, w - 6, h - 6);
        // Top shelf trophies
        ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.fillRect(3, 15, w - 6, 2); // glass divider
        // Trophies on top shelf
        // Gold Cup 1
        ctx.fillStyle = '#eab308';
        ctx.fillRect(7, 8, 6, 6);
        ctx.fillRect(9, 14, 2, 1);
        ctx.fillRect(6, 9, 1, 3);
        ctx.fillRect(13, 9, 1, 3);
        // Silver Plaque
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(18, 7, 7, 7);
        // Bottom shelf awards
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(8, 20, 5, 8);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(19, 21, 6, 7);
        // Glass reflection sheen
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(4, 4);
        ctx.lineTo(28, 28);
        ctx.stroke();
      }
    },
    {
      name: 'smart_lockers_8door',
      w: 32, h: 32,
      draw: (ctx, w, h) => {
        // Cabinet frame
        ctx.fillStyle = '#78350f';
        ctx.fillRect(1, 1, w - 2, h - 2);
        // 8 doors (4 columns x 2 rows)
        for (let row = 0; row < 2; row++) {
          for (let col = 0; col < 4; col++) {
            const dx = 3 + col * 7;
            const dy = 3 + row * 13;
            ctx.fillStyle = '#b45309';
            ctx.fillRect(dx, dy, 6, 12);
            ctx.strokeStyle = '#92400e';
            ctx.lineWidth = 0.8;
            ctx.strokeRect(dx, dy, 6, 12);
            // Digital keypad
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(dx + 1, dy + 2, 4, 3);
            ctx.fillStyle = '#22c55e';
            ctx.fillRect(dx + 2, dy + 3, 1, 1);
            // Handle
            ctx.fillStyle = '#fef08a';
            ctx.fillRect(dx + 4, dy + 7, 1, 2);
          }
        }
      }
    },
    {
      name: 'magazine_rack_gold',
      w: 16, h: 24,
      draw: (ctx, w, h) => {
        // Gold wireframe stand
        ctx.strokeStyle = '#eab308';
        ctx.lineWidth = 1.2;
        ctx.strokeRect(2, 2, 12, 20);
        // 3 Tiers
        const colors = ['#dc2626', '#2563eb', '#16a34a'];
        for (let i = 0; i < 3; i++) {
          const ty = 4 + i * 6;
          ctx.fillStyle = colors[i];
          ctx.fillRect(4, ty, 8, 4);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(5, ty + 1, 3, 1);
          // Wire lip
          ctx.strokeStyle = '#facc15';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(3, ty + 5);
          ctx.lineTo(13, ty + 5);
          ctx.stroke();
        }
      }
    },
    {
      name: 'sofa_l_shape_plum_3x2',
      w: 48, h: 32,
      draw: (ctx, w, h) => {
        // L-shaped Sectional Sofa (Plum Velvet)
        ctx.fillStyle = '#581c87';
        // Backrest (horizontal across top)
        ctx.fillRect(2, 2, 44, 7);
        // Backrest (vertical on left side)
        ctx.fillRect(2, 2, 8, 28);
        // Main seating cushions
        ctx.fillStyle = '#7e22ce';
        ctx.fillRect(10, 8, 35, 12);
        ctx.fillRect(10, 19, 14, 10);
        // Cushion dividing seams
        ctx.strokeStyle = '#3b0764';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(22, 8); ctx.lineTo(22, 20);
        ctx.moveTo(34, 8); ctx.lineTo(34, 20);
        ctx.stroke();
        // Decorative Throw Pillows (mustard & teal)
        ctx.fillStyle = '#eab308';
        ctx.fillRect(10, 8, 4, 4);
        ctx.fillStyle = '#06b6d4';
        ctx.fillRect(40, 8, 4, 4);
        ctx.fillStyle = '#eab308';
        ctx.fillRect(10, 24, 4, 4);
      }
    },
    {
      name: 'marble_coffee_table_2x1',
      w: 32, h: 16,
      draw: (ctx, w, h) => {
        // Gold metal legs
        ctx.fillStyle = '#eab308';
        ctx.fillRect(2, 13, 2, 2);
        ctx.fillRect(28, 13, 2, 2);
        // Black Marquina Marble Tabletop
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(1, 2, 30, 11);
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 0.8;
        // White lightning veining
        ctx.beginPath();
        ctx.moveTo(4, 4);
        ctx.lineTo(12, 9);
        ctx.lineTo(18, 6);
        ctx.lineTo(28, 10);
        ctx.stroke();
        // Glass Tea Pot & Macarons on Table
        ctx.fillStyle = 'rgba(56, 189, 248, 0.7)';
        ctx.fillRect(8, 4, 4, 4);
        // Macaron plate
        ctx.fillStyle = '#f472b6';
        ctx.fillRect(18, 5, 2, 2);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(21, 5, 2, 2);
      }
    },
    {
      name: 'interactive_surface_table',
      w: 32, h: 24,
      draw: (ctx, w, h) => {
        // Heavy base
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(6, 18, 20, 5);
        // Angled display surface
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(2, 2, 28, 16);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.2;
        ctx.strokeRect(2, 2, 28, 16);
        // Blueprint schematic lines on surface
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 0.8;
        ctx.strokeRect(6, 5, 10, 8);
        ctx.strokeRect(18, 5, 8, 8);
        ctx.beginPath();
        ctx.moveTo(11, 5); ctx.lineTo(11, 13);
        ctx.moveTo(6, 9); ctx.lineTo(16, 9);
        ctx.stroke();
      }
    },
    {
      name: 'marble_pillar_round',
      w: 16, h: 32,
      draw: (ctx, w, h) => {
        // Capital & Base
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(1, 1, 14, 4);
        ctx.fillRect(1, 27, 14, 4);
        // Fluted column shaft
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(3, 5, 10, 22);
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(5, 5, 1, 22);
        ctx.fillRect(8, 5, 1, 22);
        ctx.fillRect(11, 5, 1, 22);
      }
    },
    {
      name: 'led_marquee_banner',
      w: 48, h: 12,
      draw: (ctx, w, h) => {
        ctx.fillStyle = '#020617';
        ctx.fillRect(0, 0, w, h);
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1;
        ctx.strokeRect(0, 0, w, h);
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 5.5px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('► WELCOME TO CAMPUS ◄', w / 2, h / 2);
      }
    },
    {
      name: 'orchid_flower_pot',
      w: 16, h: 16,
      draw: (ctx, w, h) => {
        // Ceramic Pot
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.arc(8, 12, 3.5, 0, Math.PI * 2);
        ctx.fill();
        // Green Stem
        ctx.strokeStyle = '#15803d';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(8, 9);
        ctx.quadraticCurveTo(6, 5, 9, 3);
        ctx.stroke();
        // White Orchid Flowers
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(7, 5, 2, 0, Math.PI * 2);
        ctx.arc(10, 3, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#eab308';
        ctx.fillRect(7, 5, 1, 1);
        ctx.fillRect(10, 3, 1, 1);
      }
    },
    {
      name: 'bench_cushion_long',
      w: 32, h: 16,
      draw: (ctx, w, h) => {
        // Wood base legs
        ctx.fillStyle = '#78350f';
        ctx.fillRect(3, 12, 2, 3);
        ctx.fillRect(27, 12, 2, 3);
        // Tufted Cushion
        ctx.fillStyle = '#475569';
        ctx.beginPath();
        ctx.roundRect(2, 4, 28, 8, 3);
        ctx.fill();
        // Tufting buttons
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(8, 7, 1.5, 1.5);
        ctx.fillRect(16, 7, 1.5, 1.5);
        ctx.fillRect(24, 7, 1.5, 1.5);
      }
    }
  ];

  console.log(`Generating ${spriteDefs.length} custom pixel art sprites for Reception Lobby...`);

  for (const def of spriteDefs) {
    const html = `
      <!DOCTYPE html>
      <html>
      <body style="margin:0;overflow:hidden;background:transparent;">
        <canvas id="c" width="${def.w}" height="${def.h}"></canvas>
      </body>
      </html>
    `;
    await page.setContent(html);
    await page.evaluate((d) => {
      const c = document.getElementById('c');
      const ctx = c.getContext('2d');
      // Execute the draw function
      const drawFn = new Function('ctx', 'w', 'h', '(' + d.drawStr + ')(ctx, w, h)');
      drawFn(ctx, d.w, d.h);
    }, { w: def.w, h: def.h, drawStr: def.draw.toString() });

    const elem = await page.$('#c');
    const buf = await elem.screenshot({ omitBackground: true });
    const targetFile = path.join(outDir, `${def.name}.png`);
    fs.writeFileSync(targetFile, buf);
    console.log(`✓ Saved ${def.name}.png (${def.w}x${def.h})`);
  }

  await browser.close();
  console.log('All custom reception sprites generated successfully!');
})();
