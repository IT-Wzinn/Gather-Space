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
    // 1. Grand Boardroom U-Shaped Table (192x128 px = 6x4 tiles in 32px grid)
    {
      name: 'grand_boardroom_table_u_shape_6x4',
      w: 192, h: 128,
      draw: (ctx, w, h) => {
        // Drop shadow
        ctx.fillStyle = 'rgba(0,0,0,0.38)';
        ctx.fillRect(8, 12, w - 16, h - 16);

        // Mahogany base structure
        ctx.fillStyle = '#451a03';
        // Left wing
        ctx.fillRect(10, 10, 44, 110);
        // Right wing
        ctx.fillRect(138, 10, 44, 110);
        // North head connecting bridge
        ctx.fillRect(10, 10, 172, 40);

        // Clear hollow center (Speakers walk in here)
        ctx.clearRect(54, 48, 84, 80);

        // Polished Mahogany Tabletop Surface (with rich wood tones)
        ctx.fillStyle = '#78350f';
        // North section
        ctx.fillRect(12, 12, 168, 36);
        // Left wing
        ctx.fillRect(12, 48, 40, 70);
        // Right wing
        ctx.fillRect(140, 48, 40, 70);

        // Surface sheen & woodgrain highlight
        ctx.fillStyle = '#92400e';
        ctx.fillRect(16, 16, 160, 26);
        ctx.fillRect(16, 48, 32, 66);
        ctx.fillRect(144, 48, 32, 66);

        // Bevel outer & inner border
        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = 2;
        ctx.strokeRect(12, 12, 168, 106);
        ctx.strokeRect(52, 46, 88, 74);

        // Gold inlay trim border
        ctx.strokeStyle = '#eab308';
        ctx.lineWidth = 1.2;
        // Outer rim
        ctx.strokeRect(14, 14, 164, 102);
        // Inner U opening rim
        ctx.strokeRect(54, 48, 84, 70);

        // Delegate Microphones & Power Ports along the table
        ctx.fillStyle = '#1e293b';
        // North head mics & power ports
        [32, 64, 96, 128, 160].forEach(x => {
          ctx.fillRect(x - 3, 20, 6, 4);
          ctx.fillStyle = '#22c55e'; // mic led
          ctx.fillRect(x - 1, 18, 2, 2);
          ctx.fillStyle = '#1e293b';
        });
        // Left wing mics
        [60, 84, 104].forEach(y => {
          ctx.fillRect(32, y - 2, 4, 6);
          ctx.fillStyle = '#22c55e';
          ctx.fillRect(33, y - 3, 2, 2);
          ctx.fillStyle = '#1e293b';
        });
        // Right wing mics
        [60, 84, 104].forEach(y => {
          ctx.fillRect(156, y - 2, 4, 6);
          ctx.fillStyle = '#22c55e';
          ctx.fillRect(157, y - 3, 2, 2);
          ctx.fillStyle = '#1e293b';
        });

        // Leather conference blotting pads (Navy) & delegate documents
        ctx.fillStyle = '#1e3a8a';
        [40, 72, 120, 152].forEach(x => {
          ctx.fillRect(x - 8, 28, 16, 12);
          // White agenda paper
          ctx.fillStyle = '#f8fafc';
          ctx.fillRect(x - 6, 30, 12, 8);
          ctx.fillStyle = '#1e3a8a';
        });
        [62, 86, 106].forEach(y => {
          // West pads
          ctx.fillStyle = '#1e3a8a';
          ctx.fillRect(18, y - 6, 12, 14);
          ctx.fillStyle = '#f8fafc';
          ctx.fillRect(20, y - 4, 8, 10);
          // East pads
          ctx.fillStyle = '#1e3a8a';
          ctx.fillRect(162, y - 6, 12, 14);
          ctx.fillStyle = '#f8fafc';
          ctx.fillRect(164, y - 4, 8, 10);
        });

        // Glass water tumblers on coaster
        ctx.fillStyle = 'rgba(56, 189, 248, 0.7)';
        [48, 80, 112, 144].forEach(x => {
          ctx.beginPath();
          ctx.arc(x, 22, 3, 0, Math.PI * 2);
          ctx.fill();
        });
        [72, 96].forEach(y => {
          ctx.beginPath();
          ctx.arc(42, y, 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(150, y, 3, 0, Math.PI * 2);
          ctx.fill();
        });
      }
    },

    // 2. Boardroom Executive Leather Swivel Chair (16x16 px)
    {
      name: 'boardroom_leather_swivel_chair',
      w: 16, h: 16,
      draw: (ctx, w, h) => {
        // Caster shadow
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.beginPath();
        ctx.ellipse(8, 13, 5, 2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Chrome 5-star base
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(8, 12); ctx.lineTo(4, 14);
        ctx.moveTo(8, 12); ctx.lineTo(12, 14);
        ctx.moveTo(8, 12); ctx.lineTo(8, 15);
        ctx.stroke();

        // Cognac Brown Leather High Backrest
        ctx.fillStyle = '#451a03';
        ctx.fillRect(4, 1, 8, 8);
        ctx.fillStyle = '#b45309';
        ctx.fillRect(5, 2, 6, 7);

        // Deep button tufting
        ctx.fillStyle = '#78350f';
        ctx.fillRect(6, 4, 1, 1);
        ctx.fillRect(9, 4, 1, 1);
        ctx.fillRect(6, 7, 1, 1);
        ctx.fillRect(9, 7, 1, 1);

        // Leather seat cushion
        ctx.fillStyle = '#78350f';
        ctx.beginPath();
        ctx.ellipse(8, 9, 5.5, 3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#b45309';
        ctx.beginPath();
        ctx.ellipse(8, 8.5, 4.5, 2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Dark walnut armrests
        ctx.fillStyle = '#271004';
        ctx.fillRect(3, 5, 1.5, 4);
        ctx.fillRect(11.5, 5, 1.5, 4);
      }
    },

    // 3. Delegate Conference Gooseneck Microphone (16x16 px)
    {
      name: 'delegate_gooseneck_microphone',
      w: 16, h: 16,
      draw: (ctx, w, h) => {
        // Desktop Base (Matte Charcoal)
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.ellipse(8, 11, 4.5, 2.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Push-to-talk button
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(7, 10, 2, 1.5);

        // Curved black gooseneck stem
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(8, 10);
        ctx.quadraticCurveTo(6, 6, 9, 3);
        ctx.stroke();

        // Microphone capsule head & glowing green speech ring
        ctx.fillStyle = '#22c55e'; // Green ring (active)
        ctx.fillRect(8.5, 2.5, 2, 1);
        ctx.fillStyle = '#0f172a'; // mic foam windscreen
        ctx.fillRect(8, 1, 3, 2.5);
      }
    },

    // 4. 120-inch Ultra-Wide LED Video Wall (192x48 px = 6x1.5 tiles in 32px grid)
    {
      name: 'ultra_wide_led_video_wall_6x2',
      w: 192, h: 48,
      draw: (ctx, w, h) => {
        // Outer ultra-thin bezel (Brushed Titanium)
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, w, h);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(1, 1, w - 2, h - 2);

        // Screen area
        ctx.fillStyle = '#020617';
        ctx.fillRect(2, 2, w - 4, h - 4);

        // Slide Background Header (Deep Blue Gradient)
        const slideGrad = ctx.createLinearGradient(3, 3, w - 6, h - 6);
        slideGrad.addColorStop(0, '#0a0f1d');
        slideGrad.addColorStop(0.5, '#1e3a8a');
        slideGrad.addColorStop(1, '#0a0f1d');
        ctx.fillStyle = slideGrad;
        ctx.fillRect(3, 3, w - 6, h - 6);

        // Slide Header Bar
        ctx.fillStyle = '#091e42';
        ctx.fillRect(3, 3, w - 6, 11);
        ctx.fillStyle = '#facc15';
        ctx.font = 'bold 7.5px sans-serif';
        ctx.fillText('QV ENTERPRISE GLOBAL SUMMIT • LIVE BOARDROOM', 8, 11);
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.arc(w - 14, 8.5, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Slide Content: Left bullet points
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 5.5px sans-serif';
        ctx.fillText('• Strategic Roadmap 2027', 8, 20);
        ctx.fillStyle = '#94a3b8';
        ctx.font = '5px sans-serif';
        ctx.fillText('• Revenue Growth: +245% YoY', 8, 28);
        ctx.fillText('• Autonomous AI Multi-Agent Campus', 8, 36);
        ctx.fillText('• Status: ALL SYSTEMS OPERATIONAL', 8, 43);

        // Slide Content: Right Live Area Chart
        const chartLeft = 118;
        const chartRight = 184;
        const chartBottom = 42;
        const chartTop = 18;

        // Chart grid
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.lineWidth = 0.8;
        [24, 30, 36].forEach(gy => {
          ctx.beginPath();
          ctx.moveTo(chartLeft, gy);
          ctx.lineTo(chartRight, gy);
          ctx.stroke();
        });

        // Area fill
        ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
        ctx.beginPath();
        ctx.moveTo(chartLeft, chartBottom);
        ctx.lineTo(chartLeft + 12, chartBottom - 6);
        ctx.lineTo(chartLeft + 26, chartBottom - 11);
        ctx.lineTo(chartLeft + 42, chartBottom - 15);
        ctx.lineTo(chartLeft + 54, chartBottom - 21);
        ctx.lineTo(chartRight, chartTop);
        ctx.lineTo(chartRight, chartBottom);
        ctx.closePath();
        ctx.fill();

        // Trend line
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(chartLeft, chartBottom);
        ctx.lineTo(chartLeft + 12, chartBottom - 6);
        ctx.lineTo(chartLeft + 26, chartBottom - 11);
        ctx.lineTo(chartLeft + 42, chartBottom - 15);
        ctx.lineTo(chartLeft + 54, chartBottom - 21);
        ctx.lineTo(chartRight, chartTop);
        ctx.stroke();

        // Data nodes on chart
        ctx.fillStyle = '#f43f5e';
        [
          { x: chartLeft + 12, y: chartBottom - 6 },
          { x: chartLeft + 26, y: chartBottom - 11 },
          { x: chartLeft + 42, y: chartBottom - 15 },
          { x: chartLeft + 54, y: chartBottom - 21 },
          { x: chartRight, y: chartTop }
        ].forEach(pt => {
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 2, 0, Math.PI * 2);
          ctx.fill();
        });
      }
    },

    // 5. Speaker Lectern Podium (16x32 px)
    {
      name: 'speaker_lectern_podium',
      w: 16, h: 32,
      draw: (ctx, w, h) => {
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.fillRect(2, 27, 12, 4);

        // Carved Dark Walnut Column Base
        ctx.fillStyle = '#271004';
        ctx.fillRect(2, 25, 12, 4);
        ctx.fillStyle = '#451a03';
        ctx.fillRect(4, 11, 8, 14);

        // Angled Podium Front Panel
        ctx.fillStyle = '#78350f';
        ctx.fillRect(3, 10, 10, 15);
        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = 1;
        ctx.strokeRect(3, 10, 10, 15);

        // Gold Presidential Crest / Seal on front
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(8, 17, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#854d0e';
        ctx.beginPath();
        ctx.arc(8, 17, 1.8, 0, Math.PI * 2);
        ctx.fill();

        // Angled Reading Desk Top
        ctx.fillStyle = '#451a03';
        ctx.fillRect(1, 6, 14, 5);
        ctx.fillStyle = '#78350f';
        ctx.fillRect(2, 5, 12, 4);

        // Manuscript / Notes on desk
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(4, 6, 5, 3);

        // Attached Gooseneck Mic
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(11, 6);
        ctx.lineTo(10, 2);
        ctx.stroke();
        ctx.fillStyle = '#22c55e'; // mic led
        ctx.fillRect(9, 1.5, 2, 1.5);
      }
    },

    // 6. Magnetic Glass Brainstorming Flipchart (16x32 px)
    {
      name: 'magnetic_glass_flipchart',
      w: 16, h: 32,
      draw: (ctx, w, h) => {
        // Base shadow & tripod legs
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(8, 25); ctx.lineTo(3, 30);
        ctx.moveTo(8, 25); ctx.lineTo(13, 30);
        ctx.moveTo(8, 25); ctx.lineTo(8, 31);
        ctx.stroke();

        // Main frosted glass board
        ctx.fillStyle = 'rgba(241, 245, 249, 0.85)';
        ctx.fillRect(2, 4, 12, 20);
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 1;
        ctx.strokeRect(2, 4, 12, 20);

        // Mind map / flow diagram on glass
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 0.8;
        ctx.strokeRect(4, 7, 3, 2);
        ctx.strokeRect(9, 7, 3, 2);
        ctx.strokeRect(6, 13, 4, 2);
        // Connectors
        ctx.beginPath();
        ctx.moveTo(5.5, 9); ctx.lineTo(7, 13);
        ctx.moveTo(10.5, 9); ctx.lineTo(9, 13);
        ctx.stroke();

        // Sticky notes
        ctx.fillStyle = '#facc15'; ctx.fillRect(4, 18, 3, 2.5);
        ctx.fillStyle = '#f43f5e'; ctx.fillRect(9, 18, 3, 2.5);

        // Pen tray
        ctx.fillStyle = '#64748b';
        ctx.fillRect(2, 23.5, 12, 1.5);
      }
    },

    // 7. Conference Line-Array Soundbar (16x16 px)
    {
      name: 'conference_soundbar_pair',
      w: 16, h: 16,
      draw: (ctx, w, h) => {
        // Wall mount shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(3, 2, 10, 13);

        // Speaker cabinet (Matte Black)
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(4, 1, 8, 14);
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 0.8;
        ctx.strokeRect(4, 1, 8, 14);

        // Acoustic speaker grille dots
        ctx.fillStyle = '#475569';
        for (let y = 3; y < 13; y += 2) {
          ctx.fillRect(6, y, 1.5, 1);
          ctx.fillRect(8.5, y, 1.5, 1);
        }

        // Blue status LED on top
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(7.5, 13, 1, 1);
      }
    },

    // 8. Observer Auditorium Tiered Seats (48x16 px = 3x1 tiles)
    {
      name: 'observer_auditorium_seats_3x1',
      w: 48, h: 16,
      draw: (ctx, w, h) => {
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(2, 4, 44, 11);

        // 3 Attached Theater/Auditorium Seats
        [3, 18, 33].forEach(x => {
          // Steel seat base
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(x + 2, 10, 8, 5);

          // Royal Navy Velvet Fold-Down Seat Cushion
          ctx.fillStyle = '#1e3a8a';
          ctx.fillRect(x + 1, 8, 10, 5);
          ctx.fillStyle = '#3b82f6';
          ctx.fillRect(x + 2, 8.5, 8, 3.5);

          // Plush Navy Backrest
          ctx.fillStyle = '#1e3a8a';
          ctx.fillRect(x + 1, 2, 10, 7);
          ctx.fillStyle = '#2563eb';
          ctx.fillRect(x + 2, 3, 8, 5);

          // Padded armrests
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(x - 1, 6, 2, 6);
          ctx.fillRect(x + 11, 6, 2, 6);
        });
      }
    },

    // 9. Corporate Awards & Trophy Showcase (32x32 px)
    {
      name: 'corporate_awards_showcase',
      w: 32, h: 32,
      draw: (ctx, w, h) => {
        // Dark walnut frame
        ctx.fillStyle = '#271004';
        ctx.fillRect(2, 2, 28, 28);
        ctx.fillStyle = '#451a03';
        ctx.fillRect(3, 3, 26, 26);

        // Interior mirror & LED spotlight back
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(4, 4, 24, 24);

        // Glass shelf divider (mid)
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.fillRect(4, 16, 24, 1.5);

        // Shelf 1 (Top): Gold Cup Trophy & Certificate Plaques
        // Gold Cup
        ctx.fillStyle = '#eab308';
        ctx.beginPath();
        ctx.arc(16, 8, 3.5, 0, Math.PI);
        ctx.fill();
        ctx.fillRect(15, 11, 2, 3); // stem
        ctx.fillRect(13, 14, 6, 1.5); // base
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(14, 7, 2, 2); // sparkle

        // Crystal Plaque (Left)
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(7, 8, 4, 7);

        // Partnership Honor Plaque (Right)
        ctx.fillStyle = '#b45309';
        ctx.fillRect(21, 8, 5, 7);
        ctx.fillStyle = '#facc15';
        ctx.fillRect(22, 10, 3, 3);

        // Shelf 2 (Bottom): Medals & Commemorative Book
        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.arc(9, 21, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(16, 21, 2.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(21, 20, 6, 5);

        // Glass sliding door reflection
        ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.beginPath();
        ctx.moveTo(5, 5); ctx.lineTo(15, 5); ctx.lineTo(5, 27);
        ctx.fill();
      }
    },

    // 10. Teabreak Buffet Table with Linen (48x16 px = 3x1 tiles)
    {
      name: 'teabreak_buffet_table_3x1',
      w: 48, h: 16,
      draw: (ctx, w, h) => {
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(2, 5, 44, 10);

        // Pleated White Tablecloth Drape
        ctx.fillStyle = '#f1f5f9';
        ctx.fillRect(2, 4, 44, 11);
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1;
        ctx.strokeRect(2, 4, 44, 11);

        // Gold Satin Center Table Runner
        ctx.fillStyle = '#facc15';
        ctx.fillRect(4, 4, 40, 2);

        // Pleat lines along drape
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 0.8;
        for (let x = 6; x < 44; x += 4) {
          ctx.beginPath();
          ctx.moveTo(x, 6); ctx.lineTo(x, 15);
          ctx.stroke();
        }

        // Tableware & napkins
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(6, 2, 6, 3); // napkin stack
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(36, 2, 6, 3); // plates stack
      }
    },

    // 11. Stainless Coffee & Hot Water Urn (16x16 px)
    {
      name: 'stainless_coffee_urn_dispenser',
      w: 16, h: 16,
      draw: (ctx, w, h) => {
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(8, 14, 5, 2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Tripod legs
        ctx.fillStyle = '#475569';
        ctx.fillRect(4, 12, 2, 3);
        ctx.fillRect(10, 12, 2, 3);

        // Polished Stainless Steel Cylindrical Body
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(4, 3, 8, 10);
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(5, 3, 3, 10); // highlight

        // Dome Lid & Top Handle
        ctx.fillStyle = '#cbd5e1';
        ctx.beginPath();
        ctx.arc(8, 3, 4, Math.PI, 0);
        ctx.fill();
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(7, 0.5, 2, 2);

        // Dispenser push spigot faucet
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(2, 9, 3, 2);
        ctx.fillStyle = '#ef4444'; // hot water push lever
        ctx.fillRect(2, 8, 1.5, 1.5);

        // Coffee mug catching drips
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(1, 11, 2.5, 2.5);
      }
    },

    // 12. Afternoon Tea Pastry Tier Stand (16x16 px)
    {
      name: 'pastry_tier_stand',
      w: 16, h: 16,
      draw: (ctx, w, h) => {
        // Chrome central stem & ring handle
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(8, 14); ctx.lineTo(8, 2);
        ctx.stroke();
        // Ring handle on top
        ctx.beginPath();
        ctx.arc(8, 2, 1.5, 0, Math.PI * 2);
        ctx.stroke();

        // 3 Tiers of White Porcelain Plates
        // Bottom Tier (Largest)
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.ellipse(8, 12, 6, 2, 0, 0, Math.PI * 2);
        ctx.fill();
        // Colorful Macarons (Pink, Green, Yellow)
        ctx.fillStyle = '#f472b6'; ctx.fillRect(4, 10.5, 2, 1.5);
        ctx.fillStyle = '#4ade80'; ctx.fillRect(7, 10.5, 2, 1.5);
        ctx.fillStyle = '#facc15'; ctx.fillRect(10, 10.5, 2, 1.5);

        // Middle Tier
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.ellipse(8, 8, 4.5, 1.8, 0, 0, Math.PI * 2);
        ctx.fill();
        // Cupcakes with cherry
        ctx.fillStyle = '#818cf8'; ctx.fillRect(5, 6.5, 2, 1.5);
        ctx.fillStyle = '#fb923c'; ctx.fillRect(9, 6.5, 2, 1.5);

        // Top Tier (Smallest)
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.ellipse(8, 4.5, 3, 1.2, 0, 0, Math.PI * 2);
        ctx.fill();
        // Fresh strawberries
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(7, 3.5, 2, 1.5);
      }
    },

    // 13. Secretary Transcription Desk (32x32 px)
    {
      name: 'secretary_transcription_desk',
      w: 32, h: 32,
      draw: (ctx, w, h) => {
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(3, 6, 26, 24);

        // L-shaped walnut executive secretary desk
        ctx.fillStyle = '#451a03';
        ctx.fillRect(4, 6, 24, 22);
        ctx.clearRect(16, 16, 12, 12); // L hollow inner space

        ctx.fillStyle = '#78350f';
        ctx.fillRect(5, 7, 22, 9);
        ctx.fillRect(5, 16, 10, 11);

        // Chrome desk legs
        ctx.fillStyle = '#64748b';
        ctx.fillRect(4, 27, 2, 3);
        ctx.fillRect(14, 27, 2, 3);

        // Equipment on secretary desk:
        // Dual Laptops (1 open for minutes transcription, 1 closed)
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(8, 8, 7, 5);
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(9, 8.5, 5, 3.5); // screen

        // Audio recording mixer / sound recorder
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(18, 9, 6, 4);
        ctx.fillStyle = '#22c55e'; // vu meter green dots
        ctx.fillRect(19, 10, 2, 1);
        ctx.fillRect(22, 10, 1, 1);

        // Leather binder / official document folders
        ctx.fillStyle = '#881337';
        ctx.fillRect(7, 18, 6, 8);
        ctx.fillStyle = '#facc15';
        ctx.fillRect(8, 19, 4, 1); // gold seal on folder
      }
    },

    // 14. Red Velvet Stanchions with Brass Posts (32x16 px)
    {
      name: 'red_velvet_stanchions_pair',
      w: 32, h: 16,
      draw: (ctx, w, h) => {
        // Shadows under posts
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(6, 14, 4, 1.5, 0, 0, Math.PI * 2);
        ctx.ellipse(26, 14, 4, 1.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Draped Red Velvet Rope (Braided Catenary Curve)
        ctx.strokeStyle = '#991b1b';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(6, 6);
        ctx.quadraticCurveTo(16, 12, 26, 6);
        ctx.stroke();

        ctx.strokeStyle = '#dc2626';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(6, 6);
        ctx.quadraticCurveTo(16, 11.5, 26, 6);
        ctx.stroke();

        // 2 Polished Brass Posts
        [6, 26].forEach(x => {
          // Weighted round base
          ctx.fillStyle = '#b45309';
          ctx.beginPath();
          ctx.ellipse(x, 14, 3.5, 1.5, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#facc15';
          ctx.beginPath();
          ctx.ellipse(x, 13.5, 2.8, 1, 0, 0, Math.PI * 2);
          ctx.fill();

          // Brass pole
          ctx.fillStyle = '#d97706';
          ctx.fillRect(x - 1, 4, 2, 10);
          ctx.fillStyle = '#fef08a';
          ctx.fillRect(x - 0.5, 4, 1, 10); // highlight

          // Ball finial on top
          ctx.fillStyle = '#facc15';
          ctx.beginPath();
          ctx.arc(x, 3.5, 2, 0, Math.PI * 2);
          ctx.fill();
        });
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
  console.log('All 14 Conference Hall sprites successfully generated!');
})();
