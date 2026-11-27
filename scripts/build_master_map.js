const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const MAP_WIDTH_TILES = 120;
const MAP_HEIGHT_TILES = 96;
const TILE_SIZE = 32;
const CANVAS_WIDTH = MAP_WIDTH_TILES * TILE_SIZE;  // 3840px
const CANVAS_HEIGHT = MAP_HEIGHT_TILES * TILE_SIZE; // 3072px

// Load all sprites from resources/Background/CornerCafe/CornerCafe/sprites as Base64 strings
const projectRoot = path.join(__dirname, '..');
const spritesDir = path.join(projectRoot, 'resources', 'Background', 'CornerCafe', 'CornerCafe', 'sprites');
const spriteFiles = fs.readdirSync(spritesDir).filter(f => f.endsWith('.png'));
const SPRITES_B64 = {};
spriteFiles.forEach(f => {
  const name = f.replace('.png', '');
  SPRITES_B64[name] = fs.readFileSync(path.join(spritesDir, f)).toString('base64');
});
console.log(`Loaded ${Object.keys(SPRITES_B64).length} sprites from CornerCafe.`);

// 11 Functional Rooms Definitions with EXTRA WIDE CORRIDORS (7-9 tiles / 112-144px)
const ROOMS = [
  {
    id: "reception",
    num: "1",
    name: "SẢNH LỄ TÂN",
    sub: "Reception Lobby • Welcome & Spawn",
    x: 43, y: 58, w: 23, h: 18,
    isDetailedPixelArt: true,
    accent: "#2563eb",
    door: { x: 52, y: 58, w: 4 },
    spawn: { x: 54 * TILE_SIZE, y: 69 * TILE_SIZE }
  },
  {
    id: "central_lounge",
    num: "2",
    name: "TIẾP KHÁCH & NGHỈ NGƠI TRUNG TÂM",
    sub: "Central Lounge • Social Hub",
    x: 43, y: 32, w: 23, h: 18,
    isDetailedPixelArt: true,
    accent: "#b45309",
    doors: [
      { x: 52, y: 50, w: 4 }, // south to avenue (8 tiles wide)
      { x: 52, y: 32, w: 4 }, // north to avenue (8 tiles wide)
      { x: 43, y: 38, w: 3 }, // west to west boulevard
      { x: 66, y: 38, w: 3 }  // east to east boulevard
    ]
  },
  {
    id: "zen_garden",
    num: "3",
    name: "VƯỜN TIỂU CẢNH & HỒ CÁ KOI",
    sub: "Indoor Zen Garden & Koi Pond",
    x: 21, y: 32, w: 14, h: 18,
    isDetailedPixelArt: true,
    accent: "#059669",
    hasPond: true,
    doors: [
      { x: 21, y: 38, w: 3 },
      { x: 35, y: 38, w: 3 },
      { x: 26, y: 50, w: 4 }
    ]
  },
  {
    id: "open_workspace",
    num: "4",
    name: "KHU VỰC LÀM VIỆC CHUNG (TEAM)",
    sub: "Open Team Workspace • Dev / Design / Marketing",
    x: 7, y: 58, w: 28, h: 18,
    isDetailedPixelArt: true,
    accent: "#475569",
    doors: [
      { x: 27, y: 58, w: 4 },
      { x: 35, y: 65, w: 3 }
    ]
  },
  {
    id: "large_boardroom",
    num: "5",
    name: "PHÒNG HỌP LỚN",
    sub: "Executive Boardroom • 14 Seats & Presentation",
    x: 7, y: 7, w: 28, h: 17,
    isDetailedPixelArt: true,
    accent: "#4f46e5",
    doors: [
      { x: 19, y: 24, w: 4 }
    ]
  },
  {
    id: "small_meeting",
    num: "6",
    name: "PHÒNG HỌP NHỎ",
    sub: "Small Huddle Room • 6 Seats",
    x: 7, y: 32, w: 11, h: 18,
    isDetailedPixelArt: true,
    accent: "#0284c7",
    doors: [
      { x: 18, y: 38, w: 3 },
      { x: 11, y: 32, w: 3 }
    ]
  },
  {
    id: "private_office_1",
    num: "7A",
    name: "PHÒNG RIÊNG 1 (CEO)",
    sub: "Executive Suite 01",
    x: 74, y: 7, w: 13, h: 13,
    isDetailedPixelArt: true,
    accent: "#c2410c",
    doors: [{ x: 79, y: 20, w: 3 }]
  },
  {
    id: "private_office_2",
    num: "7B",
    name: "PHÒNG RIÊNG 2 (DIRECTOR)",
    sub: "Executive Suite 02",
    x: 91, y: 7, w: 13, h: 13,
    isDetailedPixelArt: true,
    accent: "#2563eb",
    doors: [{ x: 96, y: 20, w: 3 }]
  },
  {
    id: "private_office_3",
    num: "7C",
    name: "PHÒNG RIÊNG 3 (MANAGER)",
    sub: "Focus Studio 01",
    x: 74, y: 27, w: 13, h: 13,
    isDetailedPixelArt: true,
    accent: "#d97706",
    doors: [{ x: 79, y: 40, w: 3 }]
  },
  {
    id: "private_office_4",
    num: "7D",
    name: "PHÒNG RIÊNG 4 (FOCUS POD)",
    sub: "Focus Studio 02",
    x: 91, y: 27, w: 13, h: 13,
    isDetailedPixelArt: true,
    accent: "#7c3aed",
    doors: [{ x: 96, y: 40, w: 3 }]
  },
  {
    id: "library_room",
    num: "8",
    name: "PHÒNG ĐỌC SÁCH & THẢO LUẬN",
    sub: "Library & Quiet Discussion Room",
    x: 74, y: 46, w: 30, h: 13,
    isDetailedPixelArt: true,
    accent: "#334155",
    doors: [
      { x: 74, y: 50, w: 3 },
      { x: 87, y: 46, w: 3 }
    ]
  },
  {
    id: "quiet_lounge",
    num: "9",
    name: "PHÒNG THƯ GIÃN & TIẾP KHÁCH NHỎ",
    sub: "Quiet Relaxation Room • Acoustic Lounge",
    x: 74, y: 62, w: 30, h: 15,
    isDetailedPixelArt: true,
    accent: "#4338ca",
    doors: [
      { x: 74, y: 67, w: 3 },
      { x: 87, y: 62, w: 3 }
    ]
  },
  {
    id: "pantry_bar",
    num: "10",
    name: "QUẦY PANTRY & CAFE",
    sub: "Coffee Bar & Beverage Station",
    x: 43, y: 7, w: 10, h: 17,
    isDetailedPixelArt: true,
    accent: "#0284c7",
    doors: [
      { x: 46, y: 24, w: 3 },
      { x: 53, y: 14, w: 3 }
    ]
  },
  {
    id: "cafeteria_dining",
    num: "11",
    name: "PHÒNG ĂN (CAFETERIA)",
    sub: "Communal Dining & Lunch Area",
    x: 55, y: 7, w: 11, h: 17,
    isDetailedPixelArt: true,
    accent: "#ea580c",
    doors: [
      { x: 55, y: 14, w: 3 },
      { x: 58, y: 24, w: 3 }
    ]
  }
];

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: CANVAS_WIDTH, height: CANVAS_HEIGHT });

  const htmlContent = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      body, html { margin: 0; padding: 0; overflow: hidden; background: #1c1d21; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
      canvas { display: block; image-rendering: pixelated; }
    </style>
  </head>
  <body>
    <canvas id="cv" width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}"></canvas>
    <script>
      const cv = document.getElementById('cv');
      const ctx = cv.getContext('2d');
      ctx.imageSmoothingEnabled = false;

      const TILE = ${TILE_SIZE};
      const W = ${CANVAS_WIDTH};
      const H = ${CANVAS_HEIGHT};
      const rooms = ${JSON.stringify(ROOMS)};
      const SPRITES_B64 = ${JSON.stringify(SPRITES_B64)};

      window.mapRenderComplete = false;

      async function renderScene() {
        // 1. Load all sprite images
        const sprites = {};
        const loadPromises = Object.entries(SPRITES_B64).map(([name, b64]) => {
          return new Promise(res => {
            const img = new Image();
            img.src = 'data:image/png;base64,' + b64;
            img.onload = () => { sprites[name] = img; res(); };
            img.onerror = () => res();
          });
        });
        await Promise.all(loadPromises);

        const FURNITURE_SCALE = 1.15;

        function isFurniture(name) {
          if (!name) return false;
          if (name.startsWith('tree_')) return false;
          if (name.startsWith('outdoor_')) return false;
          if (name.startsWith('floor_')) return false;
          if (name.startsWith('rug_')) return false;
          if (name.includes('rug')) return false;
          if (name.startsWith('wall_')) return false;
          if (name.includes('mat')) return false;
          if (name.includes('tatami')) return false;
          if (name.includes('sand')) return false;
          if (name.includes('stepping')) return false;
          if (name.includes('bridge')) return false;
          if (name.includes('scroll')) return false;
          if (name.includes('chime')) return false;
          if (name.includes('logo')) return false;
          if (name.includes('banner')) return false;
          if (name.includes('chandelier')) return false;
          if (name.includes('dashboard')) return false;
          if (name.includes('video_wall')) return false;
          if (name.includes('table_u_shape')) return false;
          if (name.includes('teleconference')) return false;
          if (name.includes('canvas_wall_art')) return false;
          if (name.includes('huddle_oval_table')) return false;
          if (name.includes('desk_l_shape')) return false;
          if (name.includes('ticker_display')) return false;
          if (name.includes('canvas_painting')) return false;
          if (name.includes('standing_desk_smart')) return false;
          if (name.includes('architecture_glass_board')) return false;
          if (name.includes('burndown_display')) return false;
          if (name.includes('trophy_shelf')) return false;
          if (name.includes('agile_standing_desk')) return false;
          if (name.includes('wireframe_board')) return false;
          if (name.includes('acoustic_desk')) return false;
          if (name.includes('blackboard')) return false;
          if (name.includes('ambient_light_shelf')) return false;
          if (name.includes('reading_table')) return false;
          if (name.includes('emerald_lamps')) return false;
          if (name.includes('tabletop_study')) return false;
          if (name.includes('massive_wall_bookcase')) return false;
          if (name.includes('rolling_ladder')) return false;
          if (name.includes('biophilic_living_moss_wall')) return false;
          if (name.includes('acoustic_slat_wood')) return false;
          if (name.includes('edison_pendant')) return false;
          if (name.includes('mug_shelf')) return false;
          if (name.includes('dome_pendant')) return false;
          if (name.includes('runner')) return false;
          if (name.includes('nameplate')) return false;
          if (name.includes('diffuser')) return false;
          if (name.includes('long_bench_workstations')) return false;
          if (name.includes('wooden_bleacher_seats')) return false;
          if (name.includes('acoustic_phone_booths')) return false;
          if (name.includes('interactive_miro_board')) return false;
          if (name.includes('barstool_row')) return false;
          return true;
        }

        function drawSprite(name, x, y, w, h) {
          const img = sprites[name];
          if (!img) return;

          const tileUnitsW = (w !== undefined) ? (w / 16) : (img.width / 16);
          const tileUnitsH = (h !== undefined) ? (h / 16) : (img.height / 16);

          const baseW = tileUnitsW * TILE;
          const baseH = tileUnitsH * TILE;

          if (isFurniture(name)) {
            const scale = FURNITURE_SCALE;
            const nw = Math.round(baseW * scale);
            const nh = Math.round(baseH * scale);
            const nx = Math.round(x - (nw - baseW) / 2);
            const ny = Math.round(y - (nh - baseH) / 2);
            ctx.drawImage(img, nx, ny, nw, nh);
          } else {
            ctx.drawImage(img, x, y, baseW, baseH);
          }
        }

        function drawBadgePill(num, label, bx, by, accent = '#2563eb') {
          const s = TILE / 16;
          ctx.font = 'bold ' + Math.round(8.5 * s) + 'px sans-serif';
          const textW = ctx.measureText(label).width;
          const radius = Math.round(11 * s);
          const pillH = radius * 2;
          const pillW = Math.round(textW + 36 * s);

          ctx.fillStyle = 'rgba(255, 255, 255, 0.94)';
          ctx.beginPath();
          ctx.roundRect(bx, by, pillW, pillH, radius);
          ctx.fill();
          ctx.strokeStyle = accent;
          ctx.lineWidth = Math.max(1, 1.2 * s);
          ctx.stroke();

          // Circle badge icon with number
          ctx.fillStyle = accent;
          ctx.beginPath();
          ctx.arc(bx + radius, by + radius, radius * 0.65, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold ' + Math.round(8 * s) + 'px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(num, bx + radius, by + radius);

          ctx.fillStyle = '#1e293b';
          ctx.font = 'bold ' + Math.round(8.5 * s) + 'px sans-serif';
          ctx.textAlign = 'left';
          ctx.fillText(label, bx + radius * 2 + 4 * s, by + radius);
        }

        function drawFloorTiles(name, rx, ry, rw, rh) {
          for (let y = ry; y < ry + rh; y += TILE) {
            for (let x = rx; x < rx + rw; x += TILE) {
              drawSprite(name, x, y, 16, 16);
            }
          }
        }

        function drawRug(tx, ty, tw, th) {
          for (let y = 0; y < th; y++) {
            for (let x = 0; x < tw; x++) {
              let sprite = 'rug_c';
              if (y === 0 && x === 0) sprite = 'rug_tl';
              else if (y === 0 && x === tw - 1) sprite = 'rug_tr';
              else if (y === th - 1 && x === 0) sprite = 'rug_bl';
              else if (y === th - 1 && x === tw - 1) sprite = 'rug_br';
              else if (y === 0) sprite = 'rug_t';
              else if (y === th - 1) sprite = 'rug_b';
              else if (x === 0) sprite = 'rug_l';
              else if (x === tw - 1) sprite = 'rug_r';
              drawSprite(sprite, (tx + x) * TILE, (ty + y) * TILE, 16, 16);
            }
          }
        }

        // 2. Continuous Grass Floor Covering Whole Canvas
        const bx = 2 * TILE;
        const by = 2 * TILE;
        const bw = W - 4 * TILE;
        const bh = H - 4 * TILE;

        const pathwayImg = sprites['floor_pathway_stone_brick'];
        if (pathwayImg) {
          const pathwayPattern = ctx.createPattern(pathwayImg, 'repeat');
          ctx.fillStyle = pathwayPattern;
          ctx.fillRect(0, 0, W, H);
        } else {
          ctx.fillStyle = '#3da639';
          ctx.fillRect(0, 0, W, H);
        }

        // 2.5 Render Widened Outdoor Cobblestone Pathways & Grand Avenues
        const cobbleImg = sprites['outdoor_cobblestone_pavement'];
        if (cobbleImg) {
          const cobblePat = ctx.createPattern(cobbleImg, 'repeat');
          ctx.save();

          // Define all Grand Avenues and Walkways (Spacious, Elegant, Connecting all Rooms & Gates)
                    // Define all Grand Avenues and Walkways: 8 BLOCKS WIDE TOTAL!
          // 4 blocks in the center paved in cobblestone, flanked by 2 blocks of original green grass on both sides!
          const walkways = [
            // 1. North Grand Avenue (Corridor between y=24 and y=32: exactly 8 blocks wide!)
            // Center stone road: 4 blocks from y=26 to y=30. Leaves 2 blocks grass (y: 24..26) & 2 blocks grass (y: 30..32)!
            // Extends fully from left map border (x=1.5) to East Grand Boulevard (x=72.0)!
            { x: 1.5 * TILE, y: 26.0 * TILE, w: 70.5 * TILE, h: 4.0 * TILE },

            // 2. South Grand Avenue (Corridor between y=50 and y=58: exactly 8 blocks wide!)
            // Center stone road: 4 blocks from y=52 to y=56. Leaves 2 blocks grass (y: 50..52) & 2 blocks grass (y: 56..58)!
            // Extends fully from left map border (x=1.5) to East Grand Boulevard (x=72.0)!
            { x: 1.5 * TILE, y: 52.0 * TILE, w: 70.5 * TILE, h: 4.0 * TILE },

            // 3. West Grand Boulevard (Corridor between x=35 and x=43: exactly 8 blocks wide!)
            // Center stone road: 4 blocks from x=37 to x=41. Leaves 2 blocks grass (x: 35..37) & 2 blocks grass (x: 41..43)!
            // Extends fully down to touch the bottom map border!
            { x: 37.0 * TILE, y: 26.0 * TILE, w: 4.0 * TILE, h: (bh + by + 0.5 * TILE - 26.0 * TILE) },

            // 4. East Grand Boulevard (Corridor between x=66 and x=74: exactly 8 blocks wide!)
            // Center stone road: 4 blocks from x=68 to x=72. Leaves 2 blocks grass (x: 66..68) & 2 blocks grass (x: 72..74)!
            // Extends fully down to touch the bottom map border!
            { x: 68.0 * TILE, y: 20.0 * TILE, w: 4.0 * TILE, h: (bh + by + 0.5 * TILE - 20.0 * TILE) },

            // 5. Grand Main Entrance Boulevard (Avenue between x=50 and x=58: exactly 8 blocks wide!)
            // Center stone road: 4 blocks from x=52 to x=56, running straight from South Campus Gate into Reception door!
            // Leaves 2 blocks grass on west (x: 50..52) & 2 blocks grass on east (x: 56..58)!
            { x: 52.0 * TILE, y: 58.0 * TILE, w: 4.0 * TILE, h: (bh + by + 2.0 * TILE - 58.0 * TILE) },

            // 6. North Central Promenade & Walkway to North Grand Orb Fountain
            { x: 52.0 * TILE, y: 1.0 * TILE, w: 4.0 * TILE, h: 25.0 * TILE },
            // North Fountain Grand Plaza
            { x: 47.0 * TILE, y: 1.0 * TILE, w: 14.0 * TILE, h: 6.0 * TILE },

            // 7. Executive Suites Crossroads Promenade (Connecting Suites 7A, 7B, 7C, 7D)
            // Horizontal branch: connects from East Grand Boulevard (x=68.0) all the way to right map boundary (bx + bw + 0.5)!
            { x: 68.0 * TILE, y: 21.0 * TILE, w: (bw + bx + 0.5 * TILE - 68.0 * TILE), h: 4.0 * TILE },
            // Vertical branch: extends from top map boundary (y=1.5) down through crossroads to Library (Room 8) entrance at y=46.0!
            { x: 87.0 * TILE, y: 1.5 * TILE, w: 4.0 * TILE, h: (46.0 - 1.5) * TILE },

            // 8. Door Connecting Spurs (Connecting room doorways cleanly to the 4-tile center stone road across the 2-tile grass margin)
            // Room 5 door (x: 19, y: 24, w: 4): from y=24 to y=26
            { x: 19.0 * TILE, y: 24.0 * TILE, w: 4.0 * TILE, h: 2.0 * TILE },
            // Room 10 door (x: 46, y: 24, w: 3): from y=24 to y=26
            { x: 46.0 * TILE, y: 24.0 * TILE, w: 3.0 * TILE, h: 2.0 * TILE },
            // Room 11 door (x: 58, y: 24, w: 3): from y=24 to y=26
            { x: 58.0 * TILE, y: 24.0 * TILE, w: 3.0 * TILE, h: 2.0 * TILE },
            // Room 6 door (x: 11, y: 32, w: 3): from y=30 to y=32
            { x: 11.0 * TILE, y: 30.0 * TILE, w: 3.0 * TILE, h: 2.0 * TILE },
            // Room 2 north door (x: 52, y: 32, w: 4): from y=30 to y=32
            { x: 52.0 * TILE, y: 30.0 * TILE, w: 4.0 * TILE, h: 2.0 * TILE },
            // Room 2 south door (x: 52, y: 50, w: 4): from y=50 to y=52
            { x: 52.0 * TILE, y: 50.0 * TILE, w: 4.0 * TILE, h: 2.0 * TILE },
            // Room 1 north door (x: 52, y: 58, w: 4): from y=56 to y=58
            { x: 52.0 * TILE, y: 56.0 * TILE, w: 4.0 * TILE, h: 2.0 * TILE },
            // Room 4 north door (x: 27, y: 58, w: 4): from y=56 to y=58
            { x: 27.0 * TILE, y: 56.0 * TILE, w: 4.0 * TILE, h: 2.0 * TILE },
            // Room 3 south door (x: 26, y: 50, w: 4): from y=50 to y=52
            { x: 26.0 * TILE, y: 50.0 * TILE, w: 4.0 * TILE, h: 2.0 * TILE },
            // Room 2 west door (x: 43, y: 38, w: 3): from x=41 to x=43
            { x: 41.0 * TILE, y: 38.0 * TILE, w: 2.0 * TILE, h: 3.0 * TILE },
            // Room 3 east door (x: 35, y: 38, w: 3): from x=35 to x=37
            { x: 35.0 * TILE, y: 38.0 * TILE, w: 2.0 * TILE, h: 3.0 * TILE },
            // Room 2 east door (x: 66, y: 38, w: 3): from x=66 to x=68
            { x: 66.0 * TILE, y: 38.0 * TILE, w: 2.0 * TILE, h: 3.0 * TILE },
            // Room 4 east door (x: 35, y: 65, w: 3): from x=35 to x=37
            { x: 35.0 * TILE, y: 65.0 * TILE, w: 2.0 * TILE, h: 3.0 * TILE },
            // Room 8 west door (x: 74, y: 50, w: 3): from x=72 to x=74
            { x: 72.0 * TILE, y: 50.0 * TILE, w: 2.0 * TILE, h: 3.0 * TILE },
            // Room 9 west door (x: 74, y: 67, w: 3): from x=72 to x=74
            { x: 72.0 * TILE, y: 67.0 * TILE, w: 2.0 * TILE, h: 3.0 * TILE }
          ];

          // 1. Soft depth drop shadow beneath all paved roads onto grass
          ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
          ctx.shadowBlur = 8;
          ctx.shadowOffsetY = 3;
          ctx.fillStyle = cobblePat;

          walkways.forEach(w => {
            ctx.fillRect(w.x, w.y, w.w, w.h);
          });
          ctx.restore();

          // 2. High-contrast authentic stone curbing along outer walkway boundaries
          ctx.save();
          ctx.lineWidth = 3;
          ctx.strokeStyle = '#2c2d2e';
          walkways.forEach(w => {
            ctx.strokeRect(w.x, w.y, w.w, w.h);
          });

          // Inner subtle highlight bevel
          ctx.lineWidth = 1;
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
          walkways.forEach(w => {
            ctx.strokeRect(w.x + 1.5, w.y + 1.5, w.w - 3, w.h - 3);
          });
          ctx.restore();
        }

        // 3. Render All Rooms Floors
        rooms.forEach(r => {
          const rx = r.x * TILE;
          const ry = r.y * TILE;
          const rw = r.w * TILE;
          const rh = r.h * TILE;

          if (r.id === 'central_lounge') {
            // Authentic Pixel Art Oak Wood Floor
            drawFloorTiles('floor_wood_a', rx, ry, rw, rh);
          } else if (r.id === 'pantry_bar') {
            // Authentic Pixel Art Bistro Checker Tile Floor
            drawFloorTiles('floor_checker', rx, ry, rw, rh);
          } else if (r.id === 'reception') {
            // Authentic Pixel Art Slate Stone Floor
            drawFloorTiles('floor_stone', rx, ry, rw, rh);
          } else if (r.id === 'cafeteria_dining') {
            // Authentic Pixel Art Warm Terracotta Brick Floor
            drawFloorTiles('floor_terracotta', rx, ry, rw, rh);
          } else if (r.id === 'library_room') {
            // Authentic Pixel Art Bright Wood Floor
            drawFloorTiles('floor_wood_b', rx, ry, rw, rh);
          } else if (r.id === 'quiet_lounge') {
            // Authentic Pixel Art Warm Chestnut Wood Floor (Quiet Relaxation Lounge)
            drawFloorTiles('floor_wood_b', rx, ry, rw, rh);
          } else if (r.id === 'large_boardroom') {
            // Authentic Pixel Art Executive Dark Wood Floor
            drawFloorTiles('floor_wood_c', rx, ry, rw, rh);
          } else if (r.id === 'small_meeting') {
            // Authentic Pixel Art Ceramic Blue Tile Floor
            drawFloorTiles('floor_tile_blue', rx, ry, rw, rh);
          } else if (r.id === 'zen_garden') {
            // Authentic Pixel Art Natural Slate Stone Floor
            drawFloorTiles('floor_stone', rx, ry, rw, rh);
          } else if (r.id === 'open_workspace') {
            // Authentic Pixel Art Modern Oak Wood Floor
            drawFloorTiles('floor_wood_a', rx, ry, rw, rh);
          } else if (r.id === 'private_office_1') {
            // Authentic Pixel Art Executive Dark Wood Floor (CEO Suite)
            drawFloorTiles('floor_wood_c', rx, ry, rw, rh);
          } else if (r.id === 'private_office_2') {
            // Authentic Pixel Art Modern Oak Wood Floor (Director Suite)
            drawFloorTiles('floor_wood_a', rx, ry, rw, rh);
          } else if (r.id === 'private_office_3') {
            // Authentic Pixel Art Warm Chestnut Wood Floor (Manager Studio)
            drawFloorTiles('floor_wood_b', rx, ry, rw, rh);
          } else if (r.id === 'private_office_4') {
            // Authentic Pixel Art Plum Velvet Carpet Floor (Focus Pod)
            drawFloorTiles('floor_carpet_plum', rx, ry, rw, rh);
          } else if (r.id === 'library_room') {
            // Authentic Pixel Art Warm Parquet Chestnut Wood Floor (Grand Oxford Library)
            drawFloorTiles('floor_wood_b', rx, ry, rw, rh);
          } else {
            // Floor Background for blueprint rooms
            ctx.fillStyle = r.floorBg;
            ctx.fillRect(rx, ry, rw, rh);

            // Pattern
            ctx.fillStyle = r.floorPattern;
            if (r.floorType === 'checker') {
              for (let y = ry; y < ry + rh; y += TILE) {
                for (let x = rx; x < rx + rw; x += TILE) {
                  if (((x - rx) / TILE + (y - ry) / TILE) % 2 === 0) {
                    ctx.fillRect(x, y, TILE, TILE);
                  }
                }
              }
            } else if (r.floorType.startsWith('wood')) {
              for (let y = ry; y < ry + rh; y += TILE / 2) {
                ctx.fillStyle = (Math.floor(y / (TILE/2)) % 2 === 0) ? r.floorPattern : r.floorBg;
                ctx.fillRect(rx, y, rw, TILE / 2);
                ctx.strokeStyle = 'rgba(0,0,0,0.06)';
                ctx.beginPath();
                ctx.moveTo(rx, y);
                ctx.lineTo(rx + rw, y);
                ctx.stroke();
              }
            } else if (r.floorType.startsWith('carpet')) {
              ctx.fillStyle = 'rgba(0,0,0,0.06)';
              for (let y = ry; y < ry + rh; y += TILE) {
                for (let x = rx; x < rx + rw; x += TILE) {
                  ctx.fillRect(x + 2, y + 2, TILE - 4, TILE - 4);
                }
              }
            } else if (r.floorType === 'tile_mosaic') {
              for (let y = ry; y < ry + rh; y += TILE) {
                for (let x = rx; x < rx + rw; x += TILE) {
                  ctx.strokeStyle = 'rgba(255,255,255,0.4)';
                  ctx.strokeRect(x, y, TILE, TILE);
                }
              }
            } else if (r.floorType === 'garden') {
              ctx.fillStyle = '#6ee7b7';
              ctx.fillRect(rx, ry, rw, rh);

              // Koi Pond
              const px = rx + 2 * TILE;
              const py = ry + 2 * TILE;
              const pw = rw - 4 * TILE;
              const ph = rh - 4 * TILE;

              ctx.fillStyle = '#94a3b8';
              ctx.beginPath();
              ctx.roundRect(px - 4, py - 4, pw + 8, ph + 8, 16);
              ctx.fill();

              const grad = ctx.createLinearGradient(px, py, px + pw, py + ph);
              grad.addColorStop(0, '#38bdf8');
              grad.addColorStop(1, '#0284c7');
              ctx.fillStyle = grad;
              ctx.beginPath();
              ctx.roundRect(px, py, pw, ph, 12);
              ctx.fill();

              ctx.strokeStyle = 'rgba(255,255,255,0.4)';
              ctx.lineWidth = 1.5;
              ctx.beginPath();
              ctx.arc(px + pw * 0.3, py + ph * 0.4, 18, 0, Math.PI * 2);
              ctx.stroke();
              ctx.beginPath();
              ctx.arc(px + pw * 0.7, py + ph * 0.6, 22, 0, Math.PI * 2);
              ctx.stroke();

              // Water lilies & fish
              ctx.fillStyle = '#22c55e';
              ctx.beginPath();
              ctx.arc(px + pw * 0.25, py + ph * 0.35, 7, 0, Math.PI * 2);
              ctx.fill();
              ctx.beginPath();
              ctx.arc(px + pw * 0.75, py + ph * 0.7, 9, 0, Math.PI * 2);
              ctx.fill();

              ctx.fillStyle = '#ea580c';
              ctx.beginPath();
              ctx.ellipse(px + pw * 0.45, py + ph * 0.5, 9, 4, Math.PI / 4, 0, Math.PI * 2);
              ctx.fill();
              ctx.beginPath();
              ctx.ellipse(px + pw * 0.55, py + ph * 0.3, 7, 3, -Math.PI / 6, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        });

        // 4. FURNITURE PASS FOR KHU 2 (CENTRAL LOUNGE - DENSE LUXURY SOCIAL HUB)
        {
          // ==========================================
          // PHÂN KHU 1: ĐẠI ĐẢO SOFA & BÀN LÒ SƯỞI TRUNG TÂM (Trọng tâm phòng, x = 47..56, y = 35..41)
          // ==========================================
          // Grand Persian Royal Carpet (8x6 tiles)
          drawSprite('persian_royal_rug_8x6', 50.50 * TILE, 38.50 * TILE, 128, 96);

          // Modern Basalt & Glass Fireplace Hearth (Centerpiece - surrounding 4-dir sofas/armchairs rendered interactively by SeatingSystem)
          drawSprite('modern_fireplace_hearth', 53.50 * TILE, 40.80 * TILE, 32, 32);

          // Grand Crystal Chandelier suspended directly above central carpet
          drawSprite('grand_chandelier_crystal', 53.50 * TILE, 38.20 * TILE, 32, 32);

          // Floor Lamp & Corner Plants for center island
          drawSprite('lamp_floor', 50.50 * TILE, 39 * TILE, 16, 16);
          drawSprite('plant_floor', 58 * TILE, 39 * TILE, 16, 16);

          // ==========================================
          // PHÂN KHU 2: QUẦY BAR COFFEE & ĐỒ UỐNG TỰ PHỤC VỤ (Góc Tây Bắc, x = 41..46, y = 30..34)
          // ==========================================
          // Wall decor on North wall
          drawSprite('wall_clock', 47 * TILE, 32.50 * TILE, 16, 16);
          drawSprite('plant_hanging', 45.50 * TILE, 32.50 * TILE, 16, 16);
          drawSprite('plant_hanging', 49 * TILE, 32.50 * TILE, 16, 16);

          // Glass minibar beverage cooler
          drawSprite('glass_mini_fridge', 44.50 * TILE, 33 * TILE, 16, 32);

          // Back prep counter along North wall
          drawSprite('counter_m', 46 * TILE, 33.50 * TILE, 16, 16);
          drawSprite('counter_r', 47 * TILE, 33.50 * TILE, 16, 16);
          // Deluxe commercial espresso machine on back counter
          drawSprite('espresso_machine_deluxe', 46 * TILE, 33.20 * TILE, 32, 16);
          drawSprite('coffee_cup', 47.80 * TILE, 33.20 * TILE, 16, 16);

          // Granite L-Bar Counter facing South
          drawSprite('counter_bar_corner', 45.50 * TILE, 35.50 * TILE, 32, 32);
          drawSprite('counter_m', 47.50 * TILE, 35.50 * TILE, 16, 16);
          drawSprite('counter_r', 48.50 * TILE, 35.50 * TILE, 16, 16);

          // 3 Leather & Brass Swivel Barstools
          drawSprite('barstool_leather_brass', 45.50 * TILE, 37.20 * TILE, 16, 16);
          drawSprite('barstool_leather_brass', 47 * TILE, 37.20 * TILE, 16, 16);
          drawSprite('barstool_leather_brass', 48.50 * TILE, 37.20 * TILE, 16, 16);

          // ==========================================
          // PHÂN KHU 3: KHU GIẢI TRÍ, BOARDGAME & ARCADE (Góc Tây Nam, x = 41..46, y = 41..46)
          // ==========================================
          // Professional Wooden Foosball Table
          drawSprite('foosball_table_wood', 44.50 * TILE, 44.20 * TILE, 32, 32);

          // Retro Arcade Machine
          drawSprite('retro_arcade_cabinet', 47.50 * TILE, 44 * TILE, 16, 32);

          // Chess Board Game Table with inlaid board & tucked chairs
          drawSprite('chess_board_table', 45 * TILE, 47.20 * TILE, 32, 32);

          // 2-Tier Wooden Boardgame & Comic Shelf
          drawSprite('boardgame_shelf_wood', 47.80 * TILE, 47.50 * TILE, 32, 32);
          drawSprite('plant_floor', 44.20 * TILE, 48.50 * TILE, 16, 16);

          // ==========================================
          // PHÂN KHU 4: GÓC ACOUSTIC & THƯ VIỆN NHẠC CỤ (Góc Đông Bắc, x = 57..62, y = 30..35)
          // ==========================================
          // Lacquered Ebony Baby Grand Piano with Bench
          drawSprite('grand_piano_ebony', 60 * TILE, 33.50 * TILE, 48, 48);

          // Tall Walnut Library Bookshelf on North Wall
          drawSprite('tall_walnut_bookshelf', 63.50 * TILE, 32.50 * TILE, 32, 48);

          // Wingback Reading Armchair with matching Ottoman
          drawSprite('reading_armchair_ottoman', 63.50 * TILE, 36 * TILE, 32, 32);

          // Arched Brass Floor Reading Lamp
          drawSprite('brass_reading_lamp', 65 * TILE, 35.50 * TILE, 16, 32);

          // Wall artwork & Indoor Ficus
          drawSprite('picture_frame_b', 61 * TILE, 32.20 * TILE, 16, 16);
          drawSprite('plant_floor', 59.50 * TILE, 33 * TILE, 16, 16);

          // ==========================================
          // PHÂN KHU 5: PHÒNG CHAT BÁN RIÊNG TƯ & VÁCH LAM GỖ (Góc Đông Nam, x = 56..62, y = 41..46)
          // ==========================================
          // Vertical Wooden Acoustic Slat Partition screening the area
          drawSprite('wooden_acoustic_slat_partition', 59.50 * TILE, 44.50 * TILE, 16, 48);

          // Round Boho Woven Jute Rug
          drawSprite('round_boho_rug', 61 * TILE, 45 * TILE, 48, 48);

          // Round Calacatta Marble Bistro Accent Table (flanked by left/right armchairs in SeatingSystem)
          drawSprite('round_accent_table', 62 * TILE, 46 * TILE, 16, 16);

          // Live-Edge Slab Accent Table at South Border
          drawSprite('live_edge_coffee_table_3x2', 61 * TILE, 48.20 * TILE, 48, 32);

          // Amenities: Water Dispenser & Trash Bin
          drawSprite('water_dispenser_cold_hot', 64.50 * TILE, 47.80 * TILE, 16, 32);
          drawSprite('trash_bin', 65 * TILE, 49.20 * TILE, 16, 16);
          drawSprite('plant_floor', 60 * TILE, 48.80 * TILE, 16, 16);

          // Stylish Room Badge Pill (Central Lounge)
          const badgeX = 50.50 * TILE;
          const badgeY = 35 * TILE;
          const badgeW = 145;
          const badgeH = 26;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.94)';
          ctx.beginPath();
          ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 13);
          ctx.fill();
          ctx.strokeStyle = '#b45309';
          ctx.lineWidth = 1.2;
          ctx.stroke();

          ctx.fillStyle = '#b45309';
          ctx.beginPath();
          ctx.arc(badgeX + 13, badgeY + 13, 8, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 9px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('2', badgeX + 13, badgeY + 13);

          ctx.fillStyle = '#1e293b';
          ctx.font = 'bold 9.5px sans-serif';
          ctx.textAlign = 'left';
          ctx.fillText('TIẾP KHÁCH TRUNG TÂM', badgeX + 26, badgeY + 13);
        }

        // 5. FURNITURE PASS FOR KHU 10 (PANTRY BAR & ARTISAN COFFEE STATION)
        {
          // ==========================================
          // PHÂN KHU 2: TRẠM THIẾT BỊ BẾP HIỆN ĐẠI & TỦ LẠNH (Tường Bắc, x: 41..49, y: 7..10.5)
          // ==========================================
          // Built-in Microwave & Convection Oven Tower (1x2 tiles: w=16, h=32)
          drawSprite('pantry_built_in_microwave_oven_tower_1x2', 44.20 * TILE, 7.20 * TILE, 16, 32);

          // Kitchen Sink Counter Unit with Touchless Faucet (3x1.5 tiles: w=48, h=24)
          drawSprite('pantry_kitchen_sink_counter_unit_3x1', 45.80 * TILE, 7.50 * TILE, 48, 24);

          // Wall-Mounted Mug Shelf & French Press Organizer (2x1 tiles: w=32, h=16)
          drawSprite('pantry_mug_shelf_organizer_wall_2x1', 46.30 * TILE, 7 * TILE, 32, 16);

          // Smart French-Door 4-Door Refrigerator (2x2 tiles: w=32, h=32)
          drawSprite('pantry_smart_french_door_refrigerator_2x2', 49.50 * TILE, 7.20 * TILE, 32, 32);

          // Hanging Plant on North Wall
          drawSprite('plant_hanging', 48.80 * TILE, 7 * TILE, 16, 16);

          // ==========================================
          // PHÂN KHU 5A: BẢNG MENU PHẤN VINTAGE (Góc Đông Bắc, x: 48.5..49.5, y: 9..11)
          // ==========================================
          drawSprite('pantry_chalkboard_cafe_menu_sign_1x2', 51.80 * TILE, 9.20 * TILE, 16, 32);

          // ==========================================
          // PHÂN KHU 1: ĐẠI QUẦY PHA CHẾ L-SHAPE ĐÁ NERO MARQUINA & THIẾT BỊ ESPRESSO (x: 41.5..45.5, y: 11..14)
          // ==========================================
          // Grand L-Bar Counter in Nero Marquina Black Marble & Oak (4x3 tiles: w=64, h=48)
          drawSprite('pantry_grand_l_bar_counter_4x3', 44.50 * TILE, 11 * TILE, 64, 48);

          // Commercial 3-Group Espresso Machine (2x1 tiles: w=32, h=16)
          drawSprite('pantry_commercial_espresso_machine_3group', 45.20 * TILE, 10.80 * TILE, 32, 16);

          // Nitro Cold Brew Dispenser Tower (1x1.5 tiles: w=16, h=24)
          drawSprite('pantry_nitro_cold_brew_dispenser_tower', 47.50 * TILE, 10.80 * TILE, 16, 24);

          // Curved Glass Pastry Showcase (2x1 tiles: w=32, h=16)
          drawSprite('pantry_curved_glass_pastry_display_case_2x1', 44.80 * TILE, 12.80 * TILE, 32, 16);

          // ==========================================
          // PHÂN KHU 4: DÃY GHẾ BAR CHÂN CAO BÊN ĐẢO & ĐÈN THẢ THỦY TINH (x: 45.8..47.5, y: 11..16)
          // ==========================================
          // Amber Glass Edison Pendant Lights (3x1 tiles: w=48, h=16)
          drawSprite('pantry_amber_edison_pendant_lights_row', 45.50 * TILE, 10.50 * TILE, 48, 16);

          // Vertical Row of 3 Moss Green Leather Barstools (1x3 tiles: w=16, h=48)
          drawSprite('pantry_moss_green_leather_barstools_row', 48.80 * TILE, 11 * TILE, 16, 48);

          // ==========================================
          // PHÂN KHU 3: QUẦY TRÀ THẢO MỘC, DETOX & MÁY LỌC NƯỚC RO (Tường Tây, x: 41..44, y: 16.5..22)
          // ==========================================
          // Smart Freestanding RO Water Purifier Dispenser (1x2 tiles: w=16, h=32)
          drawSprite('pantry_smart_water_purifier_dispenser', 44.20 * TILE, 16.50 * TILE, 16, 32);

          // Artisan Tea & Flavor Syrup Station Rack (2x1 tiles: w=32, h=16)
          drawSprite('pantry_artisan_syrup_tea_station_rack', 44.20 * TILE, 18.80 * TILE, 32, 16);

          // Stainless 3-Compartment Recycling Waste Station (2x1 tiles: w=32, h=16)
          drawSprite('pantry_recycling_waste_station_3bin', 44.20 * TILE, 21 * TILE, 32, 16);

          // ==========================================
          // PHÂN KHU 5B: TIỂU CẢNH CÂY XANH CHẬU GỐM (Góc Đông Nam, x: 48..49.5, y: 21..23)
          // ==========================================
          // Fiddle Leaf Fig Tree in Terracotta Pot (1x2 tiles: w=16, h=32)
          drawSprite('pantry_fiddle_fig_terracotta_pot', 51 * TILE, 21 * TILE, 16, 32);

          // Stylish Room Badge Pill (Pantry Bar)
          const pBadgeX = 46.50 * TILE;
          const pBadgeY = 18 * TILE;
          const pBadgeW = 150;
          const pBadgeH = 24;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.94)';
          ctx.beginPath();
          ctx.roundRect(pBadgeX, pBadgeY, pBadgeW, pBadgeH, 12);
          ctx.fill();
          ctx.strokeStyle = '#0284c7';
          ctx.lineWidth = 1.2;
          ctx.stroke();

          ctx.fillStyle = '#0284c7';
          ctx.beginPath();
          ctx.arc(pBadgeX + 12, pBadgeY + 12, 7.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 8.5px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('10', pBadgeX + 12, pBadgeY + 12);

          ctx.fillStyle = '#1e293b';
          ctx.font = 'bold 8.5px sans-serif';
          ctx.textAlign = 'left';
          ctx.fillText('QUẦY PANTRY & CAFE', pBadgeX + 24, pBadgeY + 12);
        }

        // 6. FURNITURE PASS FOR KHU 1 (RECEPTION LOBBY & SPAWN ATRIUM - DENSE LUXURY)
        {
          // ==========================================
          // PHÂN KHU 1: CỔNG ĐÓN KHÁCH & HỆ THỐNG AN NINH CHECK-IN (Phía Nam, y = 66..70)
          // ==========================================
          // Grand Welcome Velvet Mat (Navy & Gold, 3x2 tiles)
          drawSprite('grand_welcome_mat_3x2', 52.50 * TILE, 73 * TILE, 48, 32);

          // Threshold entry rubber mats
          drawSprite('door_mat', 52.50 * TILE, 75.20 * TILE, 16, 16);
          drawSprite('door_mat', 55 * TILE, 75.20 * TILE, 16, 16);

          // Digital LED Marquee Banner across entrance ceiling
          drawSprite('led_marquee_banner', 51.50 * TILE, 75.70 * TILE, 80, 16);

          // Dual Security Turnstiles (Left & Right Flanks)
          drawSprite('security_turnstiles_pair', 49 * TILE, 73 * TILE, 32, 32);
          drawSprite('security_turnstiles_pair', 57 * TILE, 73 * TILE, 32, 32);

          // Smart Facial-Recognition Check-in Kiosks
          drawSprite('touch_kiosk_checkin', 47.50 * TILE, 72.50 * TILE, 16, 32);
          drawSprite('touch_kiosk_checkin', 59.50 * TILE, 72.50 * TILE, 16, 32);

          // Grand Palm Planters flanking entrance
          drawSprite('grand_palm_pot', 46.50 * TILE, 72.50 * TILE, 16, 32);
          drawSprite('grand_palm_pot', 60.50 * TILE, 72.50 * TILE, 16, 32);

          // Wet Umbrella Auto-wrapping Station
          drawSprite('umbrella_wrapping_station', 51 * TILE, 74 * TILE, 16, 16);

          // Campus Wayfinding Stand
          drawSprite('menu_stand', 56.20 * TILE, 74 * TILE, 16, 16);

          // ==========================================
          // PHÂN KHU 2: ĐẠI QUẦY TIẾP TÂN TRUNG TÂM & VÁCH THƯƠNG HIỆU (y = 54..59, x = 47..56)
          // ==========================================
          // Feature Brand Wall / Panel (Freestanding Luxury Partition behind receptionists)
          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.roundRect(51.50 * TILE, 59.50 * TILE, 6 * TILE, 2 * TILE, 4);
          ctx.fill();
          ctx.strokeStyle = '#d97706';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Gold Glowing LED Company Logo
          drawSprite('company_logo_led_gold', 52.50 * TILE, 59.80 * TILE, 48, 16);

          // World Time Digital Clocks
          drawSprite('world_time_wall_clock', 53 * TILE, 60.80 * TILE, 32, 16);

          // Ergonomic Navy Receptionist Chairs (2 stations)
          drawSprite('chair_front_blue', 52.50 * TILE, 62.20 * TILE, 16, 16);
          drawSprite('chair_front_blue', 55.50 * TILE, 62.20 * TILE, 16, 16);

          // Grand Marble Reception Counter (7 segments spanning x = 48 to 55, y = 57.5)
          drawSprite('counter_l', 51 * TILE, 63.50 * TILE, 16, 16);
          drawSprite('counter_m', 52 * TILE, 63.50 * TILE, 16, 16);
          drawSprite('counter_m', 53 * TILE, 63.50 * TILE, 16, 16);
          drawSprite('counter_m', 54 * TILE, 63.50 * TILE, 16, 16);
          drawSprite('counter_m', 55 * TILE, 63.50 * TILE, 16, 16);
          drawSprite('counter_m', 56 * TILE, 63.50 * TILE, 16, 16);
          drawSprite('counter_r', 57 * TILE, 63.50 * TILE, 16, 16);

          // Countertop Equipment & Luxury Decor
          drawSprite('reception_imac_desktop', 52.20 * TILE, 63.20 * TILE, 16, 16);
          drawSprite('cash_register', 53.20 * TILE, 63.20 * TILE, 16, 16);
          drawSprite('open_book', 54.10 * TILE, 63.20 * TILE, 16, 16);
          drawSprite('reception_imac_desktop', 55.80 * TILE, 63.20 * TILE, 16, 16);
          drawSprite('orchid_flower_pot', 51.20 * TILE, 63.20 * TILE, 16, 16);
          drawSprite('orchid_flower_pot', 57 * TILE, 63.20 * TILE, 16, 16);
          drawSprite('coffee_cup', 54.90 * TILE, 63.20 * TILE, 16, 16);

          // ==========================================
          // PHÂN KHU 3: PHÒNG CHỜ VIP & DOANH NGHIỆP (Cánh Tây, x = 41..46, y = 54..64)
          // ==========================================
          // Deep Royal Plum Carpet
          drawRug(44, 60, 5, 8);

          // Luxury L-Shape Plum Sofa
          drawSprite('sofa_l_shape_plum_3x2', 44.50 * TILE, 60.80 * TILE, 48, 32);

          // Marble Coffee Table
          drawSprite('marble_coffee_table_2x1', 45.50 * TILE, 64 * TILE, 32, 16);
          drawSprite('teapot', 45.60 * TILE, 63.70 * TILE, 16, 16);
          drawSprite('coffee_cup', 46.60 * TILE, 63.70 * TILE, 16, 16);

          // Opposing Armchairs & Ottoman
          drawSprite('armchair_teal', 48 * TILE, 62.50 * TILE, 16, 16);
          drawSprite('armchair_plum', 48 * TILE, 64.50 * TILE, 16, 16);
          drawSprite('chair_front_mustard', 46 * TILE, 66.20 * TILE, 16, 16);

          // Gold Magazine & Press Rack
          drawSprite('magazine_rack_gold', 44.50 * TILE, 67.50 * TILE, 16, 16);

          // Standing Water Dispenser (Hot/Cold) against North corner
          drawSprite('water_dispenser_cold_hot', 48.50 * TILE, 59 * TILE, 16, 32);

          // Floor Lamp & Air Purifying Plants
          drawSprite('lamp_floor', 44.50 * TILE, 59.80 * TILE, 16, 16);
          drawSprite('plant_floor', 48.50 * TILE, 67.50 * TILE, 16, 16);
          drawSprite('picture_frame_a', 45.50 * TILE, 58.30 * TILE, 16, 16);

          // ==========================================
          // PHÂN KHU 4: TRIỂN LÃM THÀNH TỰU & LOCKER THÔNG MINH (Cánh Đông, x = 57..62, y = 53..64)
          // ==========================================
          // Tall Glass Trophy Cabinet
          drawSprite('trophy_glass_cabinet_tall', 60.50 * TILE, 58.80 * TILE, 32, 48);

          // 8-Door Electronic Smart Lockers
          drawSprite('smart_lockers_8door', 63 * TILE, 58.80 * TILE, 32, 32);

          // Interactive Campus Surface Table (Touchscreen kiosk table)
          drawSprite('interactive_surface_table', 61 * TILE, 63.50 * TILE, 32, 32);
          drawSprite('chair_side_l', 60 * TILE, 64 * TILE, 16, 16);
          drawSprite('chair_side_r', 63.50 * TILE, 64 * TILE, 16, 16);

          // Long Padded Rest Bench
          drawSprite('bench_cushion_long', 61 * TILE, 68 * TILE, 32, 16);

          // Campus Notice / Directory Board & Trash/Sanitizer
          drawSprite('menu_board_1x2', 64.50 * TILE, 62.50 * TILE, 16, 32);
          drawSprite('trash_bin', 64.50 * TILE, 68 * TILE, 16, 16);
          drawSprite('plant_floor', 60 * TILE, 68 * TILE, 16, 16);

          // ==========================================
          // PHÂN KHU 5: HÀNH LANG CHUYỂN TIẾP & ĐIỀU HƯỚNG BẮC (y = 52..55, x = 46..57)
          // ==========================================
          // Roman Round Marble Pillars flanking the northern avenue
          drawSprite('marble_pillar_round', 50.20 * TILE, 58.20 * TILE, 16, 32);
          drawSprite('marble_pillar_round', 57.80 * TILE, 58.20 * TILE, 16, 32);

          // Navigation Information Kiosk Stand
          drawSprite('menu_stand', 49.20 * TILE, 59.50 * TILE, 16, 16);

          // Stylish Room Badge Pill (Reception Lobby & Spawn)
          const rBadgeX = 50.50 * TILE;
          const rBadgeY = 57.80 * TILE;
          const rBadgeW = 145;
          const rBadgeH = 24;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.94)';
          ctx.beginPath();
          ctx.roundRect(rBadgeX, rBadgeY, rBadgeW, rBadgeH, 12);
          ctx.fill();
          ctx.strokeStyle = '#2563eb';
          ctx.lineWidth = 1.2;
          ctx.stroke();

          ctx.fillStyle = '#2563eb';
          ctx.beginPath();
          ctx.arc(rBadgeX + 12, rBadgeY + 12, 7.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 8.5px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('1', rBadgeX + 12, rBadgeY + 12);

          ctx.fillStyle = '#1e293b';
          ctx.font = 'bold 9px sans-serif';
          ctx.textAlign = 'left';
          ctx.fillText('SẢNH LỄ TÂN (SPAWN)', rBadgeX + 24, rBadgeY + 12);
        }

        // 7. FURNITURE PASS FOR KHU 11 (CAFETERIA DINING & COMMUNAL LUNCH HUB)
        {
          // ==========================================
          // PHÂN KHU 3: QUẦY BUFFET SALAD BAR & HÂM NÓNG THỨC ĂN (Tường Bắc, x: 53..62, y: 7..9.5)
          // ==========================================
          // Tray & Cutlery Dispenser Mobile Station (1x2 tiles: w=16, h=32)
          drawSprite('cafeteria_tray_cutlery_station_dispenser', 56 * TILE, 7.20 * TILE, 16, 32);

          // Buffet Bain-Marie Food Warmer Steam Table (4x1 tiles: w=64, h=16)
          drawSprite('cafeteria_buffet_food_warmer_steam_table_4x1', 57.50 * TILE, 7.50 * TILE, 64, 16);

          // Chilled Salad Bar Cold Well Counter (3x1 tiles: w=48, h=16)
          drawSprite('cafeteria_salad_bar_cold_well_counter_3x1', 61.80 * TILE, 7.50 * TILE, 48, 16);

          // Wall Clock & Bistro Decor
          drawSprite('wall_clock', 60.50 * TILE, 7 * TILE, 16, 16);
          drawSprite('picture_frame_b', 64 * TILE, 7 * TILE, 16, 16);

          // ==========================================
          // PHÂN KHU 1: ĐẠI BÀN ĂN DÀI GỖ SỒI CHUNG & GHẾ BISTRO ĐA SẮC (Trung tâm, x: 54..60, y: 10..13.5)
          // ==========================================
          // Scandi Dining Chairs Front Row (facing South: 6x1 tiles: w=96, h=16)
          drawSprite('cafeteria_scandi_dining_chairs_row_front', 57 * TILE, 9.60 * TILE, 96, 16);

          // Communal Solid English Oak Long Dining Table (6x2 tiles: w=96, h=32)
          drawSprite('cafeteria_communal_oak_dining_table_6x2', 57 * TILE, 10.80 * TILE, 96, 32);

          // Scandi Dining Chairs Back Row (facing North: 6x1 tiles: w=96, h=16)
          drawSprite('cafeteria_scandi_dining_chairs_row_back', 57 * TILE, 12.80 * TILE, 96, 16);

          // ==========================================
          // PHÂN KHU 4: MÁY BÁN NƯỚC VENDING MACHINE & TỦ ĐÁ VIÊN (Tường Đông, x: 60.5..62, y: 10..15)
          // ==========================================
          // Smart Refrigerated Vending Machine (2x2 tiles: w=32, h=32)
          drawSprite('cafeteria_modern_vending_machine_2x2', 63.50 * TILE, 10.20 * TILE, 32, 32);

          // Scotsman Commercial Ice Maker Unit (1x2 tiles: w=16, h=32)
          drawSprite('cafeteria_commercial_ice_maker_unit', 63.80 * TILE, 12.50 * TILE, 16, 32);

          // ==========================================
          // PHÂN KHU 2: CỤM BÀN ĂN NHÓM BOOTH SOFA DA CAM ĐẤT NUNG (Góc Đông Nam, x: 56.5..61.5, y: 16.5..20)
          // ==========================================
          // Cozy Booth Sofa Dining Set in Terracotta Leather (4x3 tiles: w=64, h=48)
          drawSprite('cafeteria_cozy_booth_sofa_dining_set_4x3', 59.50 * TILE, 16.50 * TILE, 64, 48);

          // Industrial Dome Pendant Light
          drawSprite('cafeteria_dome_pendant_light', 61.50 * TILE, 16 * TILE, 16, 16);

          // ==========================================
          // PHÂN KHU 5: TRẠM THU GOM KHAY ĐĨA & CÂY XANH BIOPHILIC (Góc Tây Nam & Nam, x: 53..55, y: 18..23)
          // ==========================================
          // Multi-Tier Dish & Tray Bussing Cart (2x2 tiles: w=32, h=32)
          drawSprite('cafeteria_dish_tray_return_bus_cart_2x2', 56 * TILE, 18 * TILE, 32, 32);

          // Grand Monstera Deliciosa in Ceramic Planter (1x2 tiles: w=16, h=32)
          drawSprite('cafeteria_monstera_deliciosa_grand_pot', 56 * TILE, 21 * TILE, 16, 32);

          // Potted Floor Plant beside South door
          drawSprite('plant_floor', 61.50 * TILE, 21.50 * TILE, 16, 16);

          // Stylish Room Badge Pill (Cafeteria)
          const cBadgeX = 56.50 * TILE;
          const cBadgeY = 15 * TILE;
          const cBadgeW = 145;
          const cBadgeH = 24;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.94)';
          ctx.beginPath();
          ctx.roundRect(cBadgeX, cBadgeY, cBadgeW, cBadgeH, 12);
          ctx.fill();
          ctx.strokeStyle = '#ea580c';
          ctx.lineWidth = 1.2;
          ctx.stroke();

          ctx.fillStyle = '#ea580c';
          ctx.beginPath();
          ctx.arc(cBadgeX + 12, cBadgeY + 12, 7.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 8.5px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('11', cBadgeX + 12, cBadgeY + 12);

          ctx.fillStyle = '#1e293b';
          ctx.font = 'bold 9px sans-serif';
          ctx.textAlign = 'left';
          ctx.fillText('PHÒNG ĂN (CAFETERIA)', cBadgeX + 24, cBadgeY + 12);
        }

        // 8. FURNITURE PASS FOR KHU 8 (GRAND LIBRARY & QUIET DISCUSSION ROOM)
        {
          // ==========================================
          // PHÂN KHU 1: ĐẠI BÀN ĐỌC SÁCH TRUNG TÂM HOÀNG GIA & DÀN ĐÈN BÀN BANKER (Trọng tâm phòng, x: 75..87, y: 44..50)
          // ==========================================
          // Grand Persian Velvet Carpet (12x6 tiles: w=192 -> baseW=384px, h=96 -> baseH=192px)
          drawSprite('library_grand_persian_carpet_12x6', 81 * TILE, 50 * TILE, 192, 96);

          // Grand Long Reading Table in Solid English Oak (8x2 tiles: w=128 -> baseW=256px, h=32 -> baseH=64px)
          drawSprite('library_grand_reading_table_8x2', 83 * TILE, 51.80 * TILE, 128, 32);

          // Row of 4 Banker's Emerald Green Lamps on brass center conduit (8x1 tiles: w=128, h=16)
          drawSprite('library_banker_emerald_lamps_row', 83 * TILE, 51.20 * TILE, 128, 16);

          // Tabletop Scholar Study Items: Open Tome, Glasses, Slanted Rest, Water Decanter
          drawSprite('library_tabletop_study_set', 83 * TILE, 52.20 * TILE, 128, 16);

          // 4 North Chairs (facing down/south)
          drawSprite('library_leather_study_chair_front', 83.50 * TILE, 50.60 * TILE, 16, 16);
          drawSprite('library_leather_study_chair_front', 85.50 * TILE, 50.60 * TILE, 16, 16);
          drawSprite('library_leather_study_chair_front', 87.50 * TILE, 50.60 * TILE, 16, 16);
          drawSprite('library_leather_study_chair_front', 89.50 * TILE, 50.60 * TILE, 16, 16);

          // 4 South Chairs (facing up/north)
          drawSprite('library_leather_study_chair_back', 83.50 * TILE, 54 * TILE, 16, 16);
          drawSprite('library_leather_study_chair_back', 85.50 * TILE, 54 * TILE, 16, 16);
          drawSprite('library_leather_study_chair_back', 87.50 * TILE, 54 * TILE, 16, 16);
          drawSprite('library_leather_study_chair_back', 89.50 * TILE, 54 * TILE, 16, 16);

          // ==========================================
          // PHÂN KHU 2: ĐẠI VÁCH TỦ SÁCH KHỔNG LỒ KỊCH TRẦN & CẦU THANG TRƯỢT GỖ (Vách Bắc, x: 74..97, y: 40..43)
          // ==========================================
          // West of North Door: Massive Bookcase & Rolling Ladder
          drawSprite('library_massive_wall_bookcase_4x3', 80 * TILE, 46 * TILE, 64, 48);
          drawSprite('library_rolling_ladder_bronze_rail', 84.50 * TILE, 46 * TILE, 16, 48);

          // East of North Door: Two Massive Bookcases, Rolling Ladder & Grandfather Clock
          drawSprite('library_massive_wall_bookcase_4x3', 91 * TILE, 46 * TILE, 64, 48);
          drawSprite('library_rolling_ladder_bronze_rail', 95.50 * TILE, 46 * TILE, 16, 48);
          drawSprite('library_massive_wall_bookcase_4x3', 97 * TILE, 46 * TILE, 64, 48);
          drawSprite('library_antique_globe_grandfather_clock', 101.50 * TILE, 46.20 * TILE, 32, 32);

          // ==========================================
          // PHÂN KHU 3: PHÂN KHU THẢO LUẬN NHÓM BÀN TRÒN & BẢNG KÍNH (Góc Tây Nam, x: 69..74, y: 46..53)
          // ==========================================
          // Mobile Glass Research Board on Wheels
          drawSprite('library_mobile_glass_research_board', 75 * TILE, 52.50 * TILE, 32, 32);

          // Olive & Sage Round Discussion Rug (4x4 tiles: w=64, h=64)
          drawSprite('library_round_discussion_rug_4x4', 75.50 * TILE, 54 * TILE, 64, 64);

          // Round Marble Discussion Table Set with 4 Upholstered Armchairs (Teal & Mustard)
          drawSprite('library_round_discussion_table_set_2x2', 76.50 * TILE, 55 * TILE, 32, 32);

          // ==========================================
          // PHÂN KHU 4: ALCOVE ĐỌC SÁCH TƯ TƯỞNG & GHẾ BÀNH WINGBACK (Góc Đông Nam, x: 89..97, y: 47..53)
          // ==========================================
          // Wingback Armchair 1 (Royal Navy Velvet) & Ottoman
          drawSprite('library_wingback_armchair_ottoman', 95 * TILE, 54.50 * TILE, 32, 32);

          // Round Teapoy Mahogany Side Table with Steaming Yixing Teapot
          drawSprite('library_teapoy_side_table', 97.80 * TILE, 55.50 * TILE, 16, 16);

          // Vintage Fluted Brass Floor Lamp casting warm 2700K downward glow
          drawSprite('library_vintage_brass_floor_lamp', 98.50 * TILE, 53.50 * TILE, 16, 32);

          // Wingback Armchair 2 (Royal Navy Velvet) & Ottoman
          drawSprite('library_wingback_armchair_ottoman', 100 * TILE, 54.50 * TILE, 32, 32);

          // Tiered Periodicals & Magazine Stand (The Economist, Nature, MIT Tech Review)
          drawSprite('library_periodical_magazine_rack', 102.50 * TILE, 53.50 * TILE, 16, 32);

          // ==========================================
          // PHÂN KHU 5: TRẠM THỦ THƯ, TRA CỨU OPAC & MÁY KHỬ TRÙNG SÁCH (Cửa Tây & Tây Bắc, x: 69..74, y: 41..45)
          // ==========================================
          // UV-C Book Sterilizer Cabinet Unit
          drawSprite('library_uv_book_sterilizer_unit', 75 * TILE, 47.50 * TILE, 16, 32);

          // Smart Return Book Drop Bin
          drawSprite('library_book_drop_return_bin', 75 * TILE, 49.50 * TILE, 16, 16);

          // Librarian Helpdesk with OPAC Flat Terminal, Service Bell & Stacked Books
          drawSprite('library_librarian_service_desk_2x2', 77 * TILE, 47.50 * TILE, 32, 32);

          // Fiddle Leaf Fig Grand Planter in Fluted Terrazzo Pot
          drawSprite('library_fiddle_leaf_fig_grand_planter', 79.50 * TILE, 47.50 * TILE, 16, 32);

          // Room Badge Pill 8 - Placed elegantly at North wall near door
          const lBadgeX = 86.20 * TILE;
          const lBadgeY = 49.50 * TILE;
          const lBadgeW = 160;
          const lBadgeH = 22;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.94)';
          ctx.beginPath();
          ctx.roundRect(lBadgeX, lBadgeY, lBadgeW, lBadgeH, 11);
          ctx.fill();
          ctx.strokeStyle = '#334155';
          ctx.lineWidth = 1.2;
          ctx.stroke();

          ctx.fillStyle = '#334155';
          ctx.beginPath();
          ctx.arc(lBadgeX + 11, lBadgeY + 11, 6.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 8px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('8', lBadgeX + 11, lBadgeY + 11);

          ctx.fillStyle = '#1e293b';
          ctx.font = 'bold 8.5px sans-serif';
          ctx.textAlign = 'left';
          ctx.fillText('THƯ VIỆN & PHÒNG ĐỌC SÁCH', lBadgeX + 22, lBadgeY + 11);
        }

        // 9. FURNITURE PASS FOR KHU 9 (QUIET RELAXATION ROOM & VIP ACOUSTIC LOUNGE)
        {
          // ==========================================
          // PHÂN KHU 1: SALON TIẾP KHÁCH VIP TRUNG TÂM & BÀN TRÀ ĐÁ CẨM THẠCH (x: 77..89, y: 62..68)
          // ==========================================
          // Moroccan Berber Shag Rug (12x6 tiles: w=192 -> baseW=384px, h=96 -> baseH=192px)
          drawSprite('lounge_moroccan_berber_shag_rug_12x6', 83 * TILE, 68 * TILE, 192, 96);

          // Luxury Velvet Modular Sectional Sofa in Navy/Indigo (6x2 tiles: w=96 -> baseW=192px, h=32 -> baseH=64px)
          drawSprite('lounge_luxury_velvet_sectional_sofa_6x2', 86 * TILE, 68.20 * TILE, 96, 32);

          // Calacatta Marble & Brass Nesting Coffee Tables (3x2 tiles: w=48, h=32)
          drawSprite('lounge_marble_brass_nesting_coffee_table_3x2', 87.50 * TILE, 70.60 * TILE, 48, 32);

          // Smoke Grey Swivel Accent Chairs Pair facing North (3x1 tiles: w=48, h=16)
          drawSprite('lounge_smoke_grey_swivel_accent_chairs', 87.50 * TILE, 73 * TILE, 48, 16);

          // Warm Ambient Floor Lamps Flanking Sofa
          drawSprite('lamp_floor', 84 * TILE, 68.50 * TILE, 16, 16);
          drawSprite('lamp_floor', 93 * TILE, 68.50 * TILE, 16, 16);

          // ==========================================
          // PHÂN KHU 2: QUẦY BAR NƯỚC UỐNG CHILL & MÁY PHA CÀ PHÊ ESPRESSO (Tường Tây Bắc, x: 70..76, y: 57..60)
          // ==========================================
          // Wine Cooler & Chilled Beverage Unit (1x2 tiles: w=16, h=32)
          drawSprite('lounge_wine_cooler_beverage_fridge_unit', 76 * TILE, 63 * TILE, 16, 32);
          drawSprite('plant_floor', 77.30 * TILE, 63 * TILE, 16, 16);

          // Artisan Coffee Bar Island (4x2 tiles: w=64, h=32)
          drawSprite('lounge_artisan_coffee_bar_island_4x2', 77 * TILE, 64.20 * TILE, 64, 32);

          // Row of 3 Modern High Barstools (3x1 tiles: w=48, h=16)
          drawSprite('lounge_modern_high_barstools_row', 77.50 * TILE, 66.50 * TILE, 48, 16);

          // ==========================================
          // PHÂN KHU 3: BỨC TƯỜNG CÂY XANH RÊU BIOPHILIC & BỂ THỦY SINH THẢO MỘC (Tường Bắc, x: 85..97, y: 56..60)
          // ==========================================
          // Biophilic Living Moss Feature Wall (4x3 tiles: w=64, h=48)
          drawSprite('lounge_biophilic_living_moss_wall_4x3', 91 * TILE, 62 * TILE, 64, 48);

          // Nature Iwagumi Aquarium Tank (3x2 tiles: w=48, h=32)
          drawSprite('lounge_nature_aquarium_tank_3x1', 96 * TILE, 63 * TILE, 48, 32);

          // Paradise Palm in Ceramic Planter (1x2 tiles: w=16, h=32)
          drawSprite('lounge_paradise_palm_ceramic_planter', 99.80 * TILE, 63 * TILE, 16, 32);

          // Acoustic Timber Slat Wood Wall Panel (2x3 tiles: w=32, h=48)
          drawSprite('lounge_acoustic_slat_wood_wall_panel_2x3', 101.50 * TILE, 62 * TILE, 32, 48);

          // ==========================================
          // PHÂN KHU 4: GÓC THƯỞNG ÂM HI-FI VINYL & TỦ ĐĨA THAN CỔ ĐIỂN (Góc Đông Nam, x: 91..96, y: 63..69)
          // ==========================================
          // Audiophile Vinyl Turntable & Glowing Tube Amp Console (2x2 tiles: w=32, h=32)
          drawSprite('lounge_vinyl_turntable_tube_amp_console_2x2', 97.50 * TILE, 69.50 * TILE, 32, 32);

          // Vintage Vinyl LP Records Crate Unit (2x1 tiles: w=32, h=16)
          drawSprite('lounge_vinyl_lp_records_crate_unit', 100 * TILE, 69.50 * TILE, 32, 16);

          // Ergonomic Leather Chaise Lounge Recliner (2x2 tiles: w=32, h=32)
          drawSprite('lounge_chaise_lounge_leather_recliner', 98.50 * TILE, 72.20 * TILE, 32, 32);

          // Retro Marshall Bluetooth Speaker on Tripod Stand (1x2 tiles: w=16, h=32)
          drawSprite('lounge_retro_marshall_speaker_stand', 101.50 * TILE, 72.50 * TILE, 16, 32);

          // ==========================================
          // PHÂN KHU 5: GÓC BOARDGAME, TRÒ CHƠI TRÍ TUỆ & TỦ SÁCH (Góc Tây Nam, x: 70..76, y: 64..69)
          // ==========================================
          // Deluxe Boardgame & Chess Table Set (2x2 tiles: w=32, h=32)
          drawSprite('lounge_boardgame_chess_table_2x2', 77.50 * TILE, 70.80 * TILE, 32, 32);

          // Boardgame Collection Cabinet (2x2 tiles: w=32, h=32)
          drawSprite('lounge_boardgame_collection_cabinet_2x2', 76 * TILE, 73.80 * TILE, 32, 32);

          // Potted Floor Plant
          drawSprite('plant_floor', 80 * TILE, 74 * TILE, 16, 16);

          // Stylish Room Badge Pill (Quiet Lounge)
          const qBadgeX = 82.50 * TILE;
          const qBadgeY = 63.50 * TILE;
          const qBadgeW = 190;
          const qBadgeH = 24;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.94)';
          ctx.beginPath();
          ctx.roundRect(qBadgeX, qBadgeY, qBadgeW, qBadgeH, 12);
          ctx.fill();
          ctx.strokeStyle = '#4338ca';
          ctx.lineWidth = 1.2;
          ctx.stroke();

          ctx.fillStyle = '#4338ca';
          ctx.beginPath();
          ctx.arc(qBadgeX + 12, qBadgeY + 12, 7.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 8.5px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('9', qBadgeX + 12, qBadgeY + 12);

          ctx.fillStyle = '#1e293b';
          ctx.font = 'bold 8.5px sans-serif';
          ctx.textAlign = 'left';
          ctx.fillText('PHÒNG THƯ GIÃN & TIẾP KHÁCH', qBadgeX + 24, qBadgeY + 12);
        }

        // 10. FURNITURE PASS FOR KHU 5 (GRAND CONFERENCE HALL & EXECUTIVE BOARDROOM - DENSE LUXURY UPGRADE)
        {
          // ==========================================
          // PHÂN KHU 1: ĐẠI BÀN HỘI NGHỊ CHỮ U & ĐẠI THẢM HOÀNG GIA (x: 15..25, y: 11..19)
          // ==========================================
          // Grand Royal Navy & Gold Boardroom Carpet (10x8 tiles: w=160 -> baseW=320px, h=128 -> baseH=256px)
          drawSprite('boardroom_grand_royal_navy_gold_carpet_10x8', 15 * TILE, 11 * TILE, 160, 128);

          // VIP Red Carpet Runner leading from South Entrance (3x4 tiles: w=48, h=64)
          drawSprite('boardroom_vip_red_carpet_runner_3x4', 19.5 * TILE, 18.5 * TILE, 48, 64);

          // Grand U-Shaped Polished Boardroom Table (6x4 tiles: w=96 -> baseW=192px, h=64 -> baseH=128px)
          drawSprite('grand_boardroom_table_u_shape_6x4', 17 * TILE, 13 * TILE, 96, 64);

          // Executive Cognac Leather Swivel Chairs
          // North row behind head of table
          drawSprite('boardroom_leather_swivel_chair', 17.8 * TILE, 11.8 * TILE, 16, 16);
          drawSprite('boardroom_leather_swivel_chair', 19.3 * TILE, 11.8 * TILE, 16, 16);
          drawSprite('boardroom_leather_swivel_chair', 20.7 * TILE, 11.8 * TILE, 16, 16);
          drawSprite('boardroom_leather_swivel_chair', 22.2 * TILE, 11.8 * TILE, 16, 16);

          // West wing outer chairs
          drawSprite('boardroom_leather_swivel_chair', 15.5 * TILE, 13.5 * TILE, 16, 16);
          drawSprite('boardroom_leather_swivel_chair', 15.5 * TILE, 14.8 * TILE, 16, 16);
          drawSprite('boardroom_leather_swivel_chair', 15.5 * TILE, 16.1 * TILE, 16, 16);

          // East wing outer chairs
          drawSprite('boardroom_leather_swivel_chair', 23.3 * TILE, 13.5 * TILE, 16, 16);
          drawSprite('boardroom_leather_swivel_chair', 23.3 * TILE, 14.8 * TILE, 16, 16);
          drawSprite('boardroom_leather_swivel_chair', 23.3 * TILE, 16.1 * TILE, 16, 16);

          // Delegate Brass Nameplates & Leather Folders on Table Wings
          drawSprite('boardroom_nameplate_brass_row', 17 * TILE, 13.2 * TILE, 64, 16);

          // Delegate Gooseneck Microphones & Amenities
          drawSprite('delegate_gooseneck_microphone', 18.2 * TILE, 12.8 * TILE, 16, 16);
          drawSprite('delegate_gooseneck_microphone', 21.8 * TILE, 12.8 * TILE, 16, 16);
          drawSprite('delegate_gooseneck_microphone', 17.2 * TILE, 14.8 * TILE, 16, 16);
          drawSprite('delegate_gooseneck_microphone', 22.8 * TILE, 14.8 * TILE, 16, 16);
          drawSprite('coffee_cup', 19.8 * TILE, 12.8 * TILE, 16, 16);
          drawSprite('open_book', 17.2 * TILE, 16 * TILE, 16, 16);
          drawSprite('mug', 22.8 * TILE, 16 * TILE, 16, 16);

          // ==========================================
          // PHÂN KHU 2: SÂN KHẤU THUYẾT TRÌNH, MÀN HÌNH LED 120" & VÁCH TIÊU ÂM 3D (x: 13..27, y: 7..11)
          // ==========================================
          // 3D Acoustic Wood Slat Diffusers Flanking Video Wall
          drawSprite('boardroom_3d_acoustic_slat_diffuser_2x3', 14 * TILE, 7 * TILE, 32, 48);
          drawSprite('boardroom_3d_acoustic_slat_diffuser_2x3', 23.5 * TILE, 7 * TILE, 32, 48);

          // 120-inch Ultra-Wide LED Presentation Video Wall (6x1.5 tiles: w=96 -> baseW=192px, h=24 -> baseH=48px)
          drawSprite('ultra_wide_led_video_wall_6x2', 17 * TILE, 7.2 * TILE, 96, 24);

          // Conference Soundbar Line Arrays
          drawSprite('conference_soundbar_pair', 15.6 * TILE, 7.5 * TILE, 16, 16);
          drawSprite('conference_soundbar_pair', 23.2 * TILE, 7.5 * TILE, 16, 16);

          // Speaker's Carved Walnut Lectern Podium
          drawSprite('speaker_lectern_podium', 15 * TILE, 9.2 * TILE, 16, 32);

          // Floor Stage Confidence Prompter Monitor (angled towards speaker podium)
          drawSprite('boardroom_floor_confidence_prompter_monitor', 17.8 * TILE, 10.2 * TILE, 16, 16);

          // Diplomatic Flagstands Pair (National & Corporate Crest Flags)
          drawSprite('boardroom_diplomatic_flagstands_pair', 12.2 * TILE, 8.8 * TILE, 32, 32);

          // Mobile Magnetic Glass Brainstorming Flipchart
          drawSprite('magnetic_glass_flipchart', 22 * TILE, 9.2 * TILE, 16, 32);

          // Stage Decorative Palms
          drawSprite('plant_floor', 11 * TILE, 8 * TILE, 16, 16);
          drawSprite('plant_floor', 25.5 * TILE, 8 * TILE, 16, 16);

          // ==========================================
          // PHÂN KHU 3: CABIN PHIÊN DỊCH SONG NGỮ & BÀN CỐ VẤN CHIẾN LƯỢC (Cánh Đông Bắc, x: 27..34, y: 8..14)
          // ==========================================
          // Simultaneous Interpretation Soundproof Glass Booth (3x2 tiles: w=48, h=32)
          drawSprite('boardroom_simultaneous_translation_booth_3x2', 28 * TILE, 8 * TILE, 48, 32);

          // Advisory Board & Observer Leather Chairs Row (4x1 tiles: w=64, h=16)
          drawSprite('boardroom_advisory_board_chairs_row_4x1', 27.5 * TILE, 11.6 * TILE, 64, 16);

          // Corporate Resolution Archive Bookshelf
          drawSprite('bookshelf_2x2_b', 32.5 * TILE, 8 * TILE, 32, 32);

          // ==========================================
          // PHÂN KHU 4: TRẠM ĐIỀU KHIỂN ÂM THANH ÁNH SÁNG AV & CAMERA PTZ (Cánh Đông Nam, x: 27..34, y: 14.5..23)
          // ==========================================
          // Cisco / Polycom AV Rack Network Server Unit (2x2 tiles: w=32, h=32)
          drawSprite('boardroom_av_rack_network_server_unit_2x2', 32.5 * TILE, 14.5 * TILE, 32, 32);

          // AV Technician Soundcraft Mixing Desk (3x2 tiles: w=48, h=32)
          drawSprite('boardroom_av_technician_soundcraft_desk_3x2', 29 * TILE, 15 * TILE, 48, 32);

          // L-Shaped Executive Secretary Transcription Desk
          drawSprite('secretary_transcription_desk', 29.5 * TILE, 18.5 * TILE, 32, 32);
          drawSprite('chair_front_blue', 31 * TILE, 20 * TILE, 16, 16);

          // AI PTZ 4K Tracking Camera Stands
          drawSprite('boardroom_ptz_camera_stand_pair', 33.5 * TILE, 11.5 * TILE, 16, 32);
          drawSprite('boardroom_ptz_camera_stand_pair', 8.2 * TILE, 11.5 * TILE, 16, 32);

          // VIP Entrance Red Velvet Stanchions with Brass Posts
          drawSprite('red_velvet_stanchions_pair', 25.5 * TILE, 22.5 * TILE, 32, 16);

          // Amenities & Greenery
          drawSprite('plant_floor', 33.5 * TILE, 21.8 * TILE, 16, 16);
          drawSprite('trash_bin', 33.5 * TILE, 19.5 * TILE, 16, 16);

          // ==========================================
          // PHÂN KHU 5: TIỆC TRÀ TEABREAK NGOẠI GIAO & DÃY GHẾ DỰ THÍNH MỞ RỘNG (Cánh Tây, x: 8..14, y: 7..22)
          // ==========================================
          // Champagne & Wine Cooler Cabinet (1x2 tiles: w=16, h=32)
          drawSprite('boardroom_champagne_cooler_cabinet_1x2', 8.2 * TILE, 7.5 * TILE, 16, 32);

          // Formal Pleated Linen Buffet Table (3x1 tiles)
          drawSprite('teabreak_buffet_table_3x1', 9.8 * TILE, 8.5 * TILE, 48, 16);

          // 20L Stainless Steel Coffee Urn
          drawSprite('stainless_coffee_urn_dispenser', 9.8 * TILE, 8.2 * TILE, 16, 16);

          // Commercial Nespresso Capsule Machine
          drawSprite('boardroom_nespresso_capsule_machine', 11.2 * TILE, 8.2 * TILE, 16, 16);

          // French Gourmet Canapé Platter
          drawSprite('boardroom_french_canape_platter', 12.5 * TILE, 8.2 * TILE, 16, 16);

          // Tiered Navy Auditorium Seats (3 rows of 3 seats)
          drawSprite('observer_auditorium_seats_3x1', 9.5 * TILE, 13 * TILE, 48, 16);
          drawSprite('observer_auditorium_seats_3x1', 9.5 * TILE, 15.5 * TILE, 48, 16);
          drawSprite('observer_auditorium_seats_3x1', 9.5 * TILE, 18 * TILE, 48, 16);

          // Corporate Awards, Trophy & Honors Showcase
          drawSprite('corporate_awards_showcase', 9.5 * TILE, 20.5 * TILE, 32, 32);
          drawSprite('plant_floor', 9.5 * TILE, 22.2 * TILE, 16, 16);
          drawSprite('plant_floor', 13 * TILE, 22.2 * TILE, 16, 16);

          // Stylish Room Badge Pill (Conference Hall) - Placed gracefully at x: 25, y: 8.5
          const bBadgeX = 25 * TILE;
          const bBadgeY = 8.5 * TILE;
          const bBadgeW = 180;
          const bBadgeH = 24;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.94)';
          ctx.beginPath();
          ctx.roundRect(bBadgeX, bBadgeY, bBadgeW, bBadgeH, 12);
          ctx.fill();
          ctx.strokeStyle = '#4f46e5';
          ctx.lineWidth = 1.2;
          ctx.stroke();

          ctx.fillStyle = '#4f46e5';
          ctx.beginPath();
          ctx.arc(bBadgeX + 12, bBadgeY + 12, 7.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 8.5px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('5', bBadgeX + 12, bBadgeY + 12);

          ctx.fillStyle = '#1e293b';
          ctx.font = 'bold 9px sans-serif';
          ctx.textAlign = 'left';
          ctx.fillText('PHÒNG HỌP LỚN (HỘI NGHỊ)', bBadgeX + 24, bBadgeY + 12);
        }

        // 11. FURNITURE PASS FOR KHU 6 (SMALL MEETING, INTERVIEW POD & HUDDLE ROOM)
        {
          // ==========================================
          // PHÂN KHU 1: ĐẢO BÀN PHỎNG VẤN & HỌP NHÓM OVAL HIỆN ĐẠI (x: 9.5..15.5, y: 37.5..42.5)
          // ==========================================
          // Scandinavian Geometric Pattern Rug (6x5 tiles: w=96 -> baseW=192px, h=80 -> baseH=160px)
          drawSprite('scandi_geometric_rug_6x5', 9.50 * TILE, 40.50 * TILE, 96, 80);

          // Smart Light Oak Huddle Oval Table (4x2 tiles: w=64 -> baseW=128px, h=32 -> baseH=64px)
          drawSprite('smart_huddle_oval_table_4x2', 10.50 * TILE, 41.80 * TILE, 64, 32);

          // 360-degree Omnidirectional Conference Speakerphone Puck
          drawSprite('jabra_conference_speakerphone_puck', 12 * TILE, 42.20 * TILE, 16, 16);

          // Table Items (Interview laptop, candidate rubric notebook, coffee mug)
          drawSprite('laptop', 11 * TILE, 42.20 * TILE, 16, 16);
          drawSprite('open_book', 13 * TILE, 42.20 * TILE, 16, 16);
          drawSprite('coffee_cup', 13.80 * TILE, 42.20 * TILE, 16, 16);

          // 6 Ergonomic Mid-Century Fabric Swivel Task Chairs
          // North pair (facing South)
          drawSprite('huddle_fabric_swivel_chair', 11.20 * TILE, 40.60 * TILE, 16, 16);
          drawSprite('huddle_fabric_swivel_chair', 12.80 * TILE, 40.60 * TILE, 16, 16);
          // South pair (facing North)
          drawSprite('huddle_fabric_swivel_chair', 11.20 * TILE, 44.20 * TILE, 16, 16);
          drawSprite('huddle_fabric_swivel_chair', 12.80 * TILE, 44.20 * TILE, 16, 16);
          // West head (Interviewer)
          drawSprite('huddle_fabric_swivel_chair', 9.50 * TILE, 42.20 * TILE, 16, 16);
          // East head (Candidate)
          drawSprite('huddle_fabric_swivel_chair', 14.50 * TILE, 42.20 * TILE, 16, 16);

          // ==========================================
          // PHÂN KHU 2: HỆ THỐNG MÀN HÌNH HỌP TRỰC TUYẾN HYBRID & BẢNG FLIPCHART (Vách Bắc, x: 13.5..17, y: 29.5..33)
          // ==========================================
          // 55-inch Ultra-thin Bezel Smart Teleconference Display (3x1 tiles: w=48, h=16)
          drawSprite('smart_wall_tv_teleconference_3x1', 13.80 * TILE, 32.50 * TILE, 48, 16);

          // 4K AI Conference Soundbar Video Bar
          drawSprite('smart_telecon_soundbar_cam', 14.20 * TILE, 33.60 * TILE, 32, 16);

          // Minimalist Nordic Wall Clock
          drawSprite('wall_clock_minimalist', 13 * TILE, 32.80 * TILE, 16, 16);

          // Mobile Tempered Glass Whiteboard with Dry-erase sketches
          drawSprite('mobile_glass_whiteboard_small', 16.50 * TILE, 33.80 * TILE, 16, 32);

          // ==========================================
          // PHÂN KHU 3: GÓC HỒ SƠ ỨNG VIÊN & KỆ TÀI LIỆU NHÂN SỰ (Góc Tây Bắc, x: 8..10, y: 30..35)
          // ==========================================
          // Corporate Handbook & Policy Binders Bookshelf
          drawSprite('bookshelf_corporate_handbook', 8 * TILE, 33 * TILE, 32, 32);

          // 3-Drawer Heavy Steel Security Filing Cabinet
          drawSprite('security_filing_cabinet_tall', 8 * TILE, 35.20 * TILE, 16, 32);

          // Compact Laser Printer / Scanner on Pedestal
          drawSprite('compact_printer_scanner', 8 * TILE, 37.50 * TILE, 16, 24);
          drawSprite('trash_bin_compact', 9.20 * TILE, 38 * TILE, 16, 16);

          // ==========================================
          // PHÂN KHU 4: TRẠM NƯỚC UỐNG REFRESHMENT & CÂY XANH TIÊU ÂM (Góc Tây Nam, x: 8..10.5, y: 43.5..47)
          // ==========================================
          // Touchless RO Water Purification Dispenser Tower
          drawSprite('touchless_water_dispenser_cooler', 8 * TILE, 46.50 * TILE, 16, 32);

          // Tea & Refreshment Caddy Organizer
          drawSprite('tea_refreshment_caddy', 9.20 * TILE, 47.20 * TILE, 16, 16);

          // Tall Fiddle Leaf Fig in Ceramic Cylinder Pot
          drawSprite('fiddle_leaf_fig_tall_pot', 8 * TILE, 48.50 * TILE, 16, 32);
          drawSprite('plant_floor', 9.50 * TILE, 49 * TILE, 16, 16);

          // ==========================================
          // PHÂN KHU 5: GÓC CHỜ PHỎNG VẤN & GHẾ BÀNH ACOUSTIC THƯ GIÃN (Góc Đông Nam, x: 14.5..17, y: 42..47)
          // ==========================================
          // Framed Abstract Bauhaus Canvas Wall Art
          drawSprite('abstract_canvas_wall_art', 16.20 * TILE, 44.50 * TILE, 24, 16);

          // Brushed Brass Arched Floor Lamp
          drawSprite('brass_standing_floor_lamp', 16.50 * TILE, 45.80 * TILE, 16, 32);

          // Acoustic Wingback Petrol Blue Lounge Armchair
          drawSprite('acoustic_wingback_armchair', 14.80 * TILE, 47 * TILE, 20, 24);

          // Slim Round Light Oak Accent Side Table with Forbes Magazine
          drawSprite('slim_round_side_table', 16.50 * TILE, 47.80 * TILE, 16, 16);
          drawSprite('plant_floor', 14.80 * TILE, 49.20 * TILE, 16, 16);

          // Stylish Room Badge Pill (Small Meeting Pod)
          const smBadgeX = 7.50 * TILE;
          const smBadgeY = 39 * TILE;
          const smBadgeW = 125;
          const smBadgeH = 24;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.94)';
          ctx.beginPath();
          ctx.roundRect(smBadgeX, smBadgeY, smBadgeW, smBadgeH, 12);
          ctx.fill();
          ctx.strokeStyle = '#0284c7';
          ctx.lineWidth = 1.2;
          ctx.stroke();

          ctx.fillStyle = '#0284c7';
          ctx.beginPath();
          ctx.arc(smBadgeX + 12, smBadgeY + 12, 7.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 8.5px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('6', smBadgeX + 12, smBadgeY + 12);

          ctx.fillStyle = '#1e293b';
          ctx.font = 'bold 9px sans-serif';
          ctx.textAlign = 'left';
          ctx.fillText('PHÒNG HỌP NHỎ', smBadgeX + 24, smBadgeY + 12);
        }

        // 12. FURNITURE & LANDSCAPE PASS FOR KHU 3 (ZEN GARDEN & KOI POND SANCTUARY)
        {
          const s = TILE / 16;

          // ==========================================
          // PHÂN KHU 1: ĐẠI HỒ CÁ KOI SINH THÁI TRUNG TÂM (x: 25..33, y: 34..43)
          // ==========================================
          const px = 25 * TILE;
          const py = 37 * TILE;
          const pw = 8 * TILE;
          const ph = 8.5 * TILE;

          // Natural Cobblestone Outer Curb
          ctx.fillStyle = '#1e293b';
          ctx.beginPath();
          ctx.roundRect(px - 6 * s, py - 6 * s, pw + 12 * s, ph + 12 * s, 18 * s);
          ctx.fill();

          // Smooth River Pebble Lip
          ctx.fillStyle = '#475569';
          ctx.beginPath();
          ctx.roundRect(px - 2.5 * s, py - 2.5 * s, pw + 5 * s, ph + 5 * s, 15 * s);
          ctx.fill();

          // Crystal Deep Water Basin (Emerald to Cyan to Deep Sapphire Gradient)
          const waterGrad = ctx.createLinearGradient(px, py, px + pw, py + ph);
          waterGrad.addColorStop(0, '#0f766e');
          waterGrad.addColorStop(0.35, '#0284c7');
          waterGrad.addColorStop(1, '#0369a1');
          ctx.fillStyle = waterGrad;
          ctx.beginPath();
          ctx.roundRect(px, py, pw, ph, 13 * s);
          ctx.fill();

          // Concentric Water Ripples
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
          ctx.lineWidth = 1.2 * s;
          ctx.beginPath();
          ctx.arc(px + pw * 0.35, py + ph * 0.38, 14 * s, 0, Math.PI * 2);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(px + pw * 0.68, py + ph * 0.65, 18 * s, 0, Math.PI * 2);
          ctx.stroke();

          // Lily Pads & Blooming Lotus Flowers
          // Lily Pad 1 (North-west cluster)
          ctx.fillStyle = '#15803d';
          ctx.beginPath();
          ctx.arc(px + pw * 0.28, py + ph * 0.32, 9 * s, 0, Math.PI * 2);
          ctx.fill();
          // Lotus Flower 1 (Pink)
          ctx.fillStyle = '#f472b6';
          ctx.beginPath();
          ctx.arc(px + pw * 0.28, py + ph * 0.32, 4 * s, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(px + pw * 0.28 - 1 * s, py + ph * 0.32 - 1 * s, 2 * s, 2 * s);

          // Lily Pad 2 (South-east cluster)
          ctx.fillStyle = '#059669';
          ctx.beginPath();
          ctx.arc(px + pw * 0.72, py + ph * 0.7, 10 * s, 0, Math.PI * 2);
          ctx.fill();
          // Lotus Flower 2 (Rose)
          ctx.fillStyle = '#fb7185';
          ctx.beginPath();
          ctx.arc(px + pw * 0.72, py + ph * 0.7, 4.5 * s, 0, Math.PI * 2);
          ctx.fill();

          // Swimming Japanese Koi Fish
          // Fish 1 (Orange/White Kohaku Koi swimming diagonally)
          ctx.fillStyle = '#ea580c';
          ctx.beginPath();
          ctx.ellipse(px + pw * 0.45, py + ph * 0.52, 11 * s, 5 * s, -Math.PI / 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.ellipse(px + pw * 0.43, py + ph * 0.5, 5.5 * s, 2.8 * s, -Math.PI / 4, 0, Math.PI * 2);
          ctx.fill();

          // Fish 2 (Golden Yellow Ogon Koi swimming down)
          ctx.fillStyle = '#f59e0b';
          ctx.beginPath();
          ctx.ellipse(px + pw * 0.6, py + ph * 0.38, 10 * s, 4.5 * s, Math.PI / 5, 0, Math.PI * 2);
          ctx.fill();

          // Fish 3 (Calico Showa Koi swimming along south)
          ctx.fillStyle = '#c2410c';
          ctx.beginPath();
          ctx.ellipse(px + pw * 0.38, py + ph * 0.74, 9 * s, 4 * s, Math.PI / 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(px + pw * 0.38, py + ph * 0.73, 3 * s, 2 * s);

          // Arched Wooden Moon Bridge crossing northern edge of pond
          drawSprite('arched_wooden_bridge', 26.50 * TILE, 36.50 * TILE, 48, 32);

          // Traditional Japanese Toro Pagoda Stone Lanterns (2 opposing ends of pond)
          drawSprite('japanese_stone_lantern', 24 * TILE, 36 * TILE, 16, 32);
          drawSprite('japanese_stone_lantern', 33.50 * TILE, 45 * TILE, 16, 32);

          // ==========================================
          // PHÂN KHU 2: TRÀ ĐẠO PAVILION & CHIẾU TATAMI THƯ GIÃN (Góc Tây Bắc, x = 21..25, y = 30..35)
          // ==========================================
          // Raised Cedar & Igusa Tatami Mat Platform (3x2 tiles)
          drawSprite('tatami_mat_platform_3x2', 21.50 * TILE, 33.50 * TILE, 48, 32);

          // Low Dark Walnut Chabudai Tea Table in center of Tatami
          drawSprite('zen_tea_table_low', 22 * TILE, 34 * TILE, 32, 16);

          // 4 Zafu Meditation Pleated Cushions around Chabudai
          drawSprite('zafu_meditation_cushion', 22.50 * TILE, 33.20 * TILE, 16, 16);
          drawSprite('zafu_meditation_cushion', 22.50 * TILE, 35.20 * TILE, 16, 16);
          drawSprite('zafu_meditation_cushion', 21.20 * TILE, 34 * TILE, 16, 16);
          drawSprite('zafu_meditation_cushion', 23.80 * TILE, 34 * TILE, 16, 16);

          // Mount Fuji & Enso Zen Hanging Scroll on North Wall
          drawSprite('zen_scroll_painting', 22.50 * TILE, 32.20 * TILE, 16, 32);

          // Floor Lamp & Indoor Planter
          drawSprite('lamp_floor', 21 * TILE, 36.50 * TILE, 16, 16);
          drawSprite('plant_floor', 24.50 * TILE, 33 * TILE, 16, 16);

          // ==========================================
          // PHÂN KHU 3: SHISHI-ODOSHI RÓC RÁCH & RỪNG TRÚC (Góc Tây Nam, x = 21..25, y = 40..46)
          // ==========================================
          // Dense Arashiyama Bamboo Grove against West Wall
          drawSprite('bamboo_grove_cluster', 21 * TILE, 43 * TILE, 32, 48);
          drawSprite('bamboo_grove_cluster', 21 * TILE, 46 * TILE, 32, 48);

          // Shishi-Odoshi Pivoting Bamboo Rocker & Mossy Basalt Basin
          drawSprite('shishi_odoshi_bamboo_fountain', 23.50 * TILE, 45.50 * TILE, 32, 32);

          // Halved Cedar Timber Log Bench
          drawSprite('rustic_log_bench', 22 * TILE, 48.20 * TILE, 32, 16);
          drawSprite('plant_floor', 24.50 * TILE, 48.50 * TILE, 16, 16);

          // ==========================================
          // PHÂN KHU 4: VƯỜN CÁT TRẮNG CÀO KARESANSUI & BONSAI ĐẠI THỤ (Góc Đông Bắc, x = 33..37, y = 30..35)
          // ==========================================
          // Raked Zen Sand & Mossy Rock Island Garden Bed
          drawSprite('raked_sand_zen_garden', 33.50 * TILE, 33.20 * TILE, 48, 32);

          // Centuries-old Grand Pine Bonsai on Rosewood Pedestal
          drawSprite('grand_bonsai_pine_pot', 34.50 * TILE, 35.80 * TILE, 32, 32);

          // Hanging Bamboo Wind Chime on Corner Eaves
          drawSprite('bamboo_wind_chime', 36.80 * TILE, 32.50 * TILE, 16, 32);
          drawSprite('plant_floor', 33 * TILE, 32.80 * TILE, 16, 16);
          drawSprite('lamp_floor', 36.80 * TILE, 36 * TILE, 16, 16);

          // ==========================================
          // PHÂN KHU 5: LỐI ĐI ĐÁ BƯỚC DẪN RA CỬA ĐÔNG (x = 34..38, y = 35..43)
          // ==========================================
          // Natural River Stepping Stone Paths connecting doorway to pond
          drawSprite('zen_stepping_stones_path', 35.50 * TILE, 38.50 * TILE, 32, 32);
          drawSprite('zen_stepping_stones_path', 33.50 * TILE, 41 * TILE, 32, 32);

          // Cedar Slatted Eco Recycling Bin
          drawSprite('wooden_slat_eco_bin', 36.80 * TILE, 42 * TILE, 16, 16);

          // Southeastern Rest Bench & Fern Plants
          drawSprite('rustic_log_bench', 34.50 * TILE, 45 * TILE, 32, 16);
          drawSprite('plant_floor', 34 * TILE, 47.50 * TILE, 16, 16);
          drawSprite('cactus', 35.50 * TILE, 47.50 * TILE, 16, 16);

          // Hanging Ivy along North Wall
          drawSprite('plant_hanging', 27 * TILE, 32.20 * TILE, 16, 16);
          drawSprite('plant_hanging', 29 * TILE, 32.20 * TILE, 16, 16);

          // Stylish Room Badge Pill (Zen Garden)
          const zBadgeX = 21.50 * TILE;
          const zBadgeY = 32.50 * TILE;
          const zBadgeW = 155;
          const zBadgeH = 24;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.94)';
          ctx.beginPath();
          ctx.roundRect(zBadgeX, zBadgeY, zBadgeW, zBadgeH, 12);
          ctx.fill();
          ctx.strokeStyle = '#059669';
          ctx.lineWidth = 1.2;
          ctx.stroke();

          ctx.fillStyle = '#059669';
          ctx.beginPath();
          ctx.arc(zBadgeX + 12, zBadgeY + 12, 7.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 8.5px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('3', zBadgeX + 12, zBadgeY + 12);

          ctx.fillStyle = '#1e293b';
          ctx.font = 'bold 9px sans-serif';
          ctx.textAlign = 'left';
          ctx.fillText('VƯỜN TIỂU CẢNH ZEN', zBadgeX + 24, zBadgeY + 12);
        }

        // 13. FURNITURE PASS FOR KHU 4 (OPEN TEAM WORKSPACE & AGILE COWORKING HUB - DENSE SILICON VALLEY UPGRADE)
        {
          // ==========================================
          // PHÂN KHU 1: ĐẠI CỤM ĐẢO BÀN BENCHING WORKBENCH DÀI & DÀN MÀN HÌNH PRO DISPLAY (x: 13..24, y: 58..65)
          // ==========================================
          // Tech Hexagon Circuit Rug (10x7 tiles: w=160 -> baseW=320px, h=112 -> baseH=224px)
          drawSprite('coworking_tech_hexagon_rug_10x7', 13.50 * TILE, 64 * TILE, 160, 112);

          // Long Benching Workstation System (8x3 tiles: w=128 -> baseW=256px, h=48 -> baseH=96px)
          drawSprite('coworking_long_bench_workstations_8x3', 14.50 * TILE, 66 * TILE, 128, 48);

          // Ergonomic Chairs North Row (Facing South)
          drawSprite('ergonomic_mesh_chair_black', 15.20 * TILE, 64.60 * TILE, 16, 16);
          drawSprite('chair_front_blue', 17.50 * TILE, 64.60 * TILE, 16, 16);
          drawSprite('ergonomic_mesh_chair_black', 19.50 * TILE, 64.60 * TILE, 16, 16);
          drawSprite('chair_front_mustard', 21.80 * TILE, 64.60 * TILE, 16, 16);

          // Ergonomic Chairs South Row (Facing North)
          drawSprite('chair_back_blue', 15.20 * TILE, 69.30 * TILE, 16, 16);
          drawSprite('ergonomic_mesh_chair_black', 17.50 * TILE, 69.30 * TILE, 16, 16);
          drawSprite('chair_back_red', 19.50 * TILE, 69.30 * TILE, 16, 16);
          drawSprite('ergonomic_mesh_chair_black', 21.80 * TILE, 69.30 * TILE, 16, 16);

          // Plants & Floor Lighting for Central Island
          drawSprite('plant_floor', 13.80 * TILE, 66.50 * TILE, 16, 16);
          drawSprite('plant_floor', 23.20 * TILE, 66.50 * TILE, 16, 16);

          // ==========================================
          // PHÂN KHU 2: AGILE WAR ROOM, SCRUM STAND-UP & BẢNG KANBAN KỸ THUẬT SỐ (Phía Bắc, x: 8..19, y: 52..57)
          // ==========================================
          // 75-inch Interactive Miro Board Wall Display (3x2 tiles: w=48, h=32)
          drawSprite('coworking_interactive_miro_board_75inch', 10 * TILE, 58.20 * TILE, 48, 32);
          drawSprite('wall_clock', 13.50 * TILE, 58.20 * TILE, 16, 16);

          // Mobile Agile Scrum Whiteboard on Wheels
          drawSprite('agile_scrum_kanban_board_2x1', 8.50 * TILE, 59.80 * TILE, 32, 32);

          // Agile High-Top Standing Bar Table (4x1.5 tiles: w=64, h=24)
          drawSprite('coworking_agile_hightop_table_4x1', 13 * TILE, 60.20 * TILE, 64, 24);

          // Cognac Leather High Barstools Row (4x1 tiles: w=64, h=16)
          drawSprite('coworking_leather_barstool_row', 13 * TILE, 62 * TILE, 64, 16);
          drawSprite('plant_floor', 8.20 * TILE, 62.50 * TILE, 16, 16);

          // ==========================================
          // PHÂN KHU 3: GÓC THIẾT KẾ ĐỒ HỌA SÁNG TẠO / MAKER STATION & TRẠM IN ẤN (Góc Đông Bắc, x: 22..34, y: 52..57)
          // ==========================================
          // Industrial Mesh Locker Bank (3x2 tiles: w=48, h=32)
          drawSprite('coworking_mesh_locker_bank_3x2', 22.50 * TILE, 58.30 * TILE, 48, 32);

          // Architecture & Drafting Tilt Desk (3x2 tiles: w=48, h=32)
          drawSprite('coworking_drafting_tilt_desk_3x2', 22.50 * TILE, 60.80 * TILE, 48, 32);
          drawSprite('chair_front_mustard', 23.80 * TILE, 62.80 * TILE, 16, 16);

          // Maker 3D Printer Station (2x2 tiles: w=32, h=32)
          drawSprite('coworking_maker_3d_printer_station', 32.50 * TILE, 58.50 * TILE, 32, 32);

          // Enterprise Multifunction Copier & Printer (2x2 tiles)
          drawSprite('enterprise_multifunction_printer', 32.50 * TILE, 61 * TILE, 32, 32);
          drawSprite('paper_shredder_station', 31 * TILE, 62 * TILE, 16, 16);

          // ==========================================
          // PHÂN KHU 4: BỤC NGỒI BẬC THANG KHÁN ĐÀI MINI BLEACHER & GÓC BRAINSTORMING (Góc Tây Nam, x: 8..15, y: 64..70)
          // ==========================================
          // Tiered Wooden Bleacher Stadium Seating (4x3 tiles: w=64, h=48)
          drawSprite('coworking_wooden_bleacher_seats_4x3', 8.50 * TILE, 70 * TILE, 64, 48);

          // Giant Ergonomic Beanbag Loungers Pair (2x1.5 tiles: w=32, h=24)
          drawSprite('coworking_beanbags_pair', 9 * TILE, 73.80 * TILE, 32, 24);

          // Mobile Magnetic Glass Flipchart
          drawSprite('magnetic_glass_flipchart', 13.20 * TILE, 71.50 * TILE, 16, 32);

          // Design Systems & Clean Code Bookshelf
          drawSprite('bookshelf_2x2_c', 8.20 * TILE, 74 * TILE, 16, 16);
          drawSprite('plant_floor', 13 * TILE, 74.20 * TILE, 16, 16);

          // ==========================================
          // PHÂN KHU 5: DÀN BỐT CÁCH ÂM PRIVACY PODS & QUẦY DETOX HYDRATION BAR (Góc Đông Nam, x: 23..34, y: 62..70)
          // ==========================================
          // Acoustic Phone Booths 3-Pod Row (4x2 tiles: w=64, h=32)
          drawSprite('coworking_acoustic_phone_booths_row', 30 * TILE, 69.50 * TILE, 64, 32);

          // Hydration & Healthy Detox Bar (3x1.5 tiles: w=48, h=24)
          drawSprite('coworking_hydration_detox_bar_3x1', 25 * TILE, 69.80 * TILE, 48, 24);

          // Biophilic Planter Room Divider 2-Tier (3x1.5 tiles: w=48, h=24)
          drawSprite('coworking_biophilic_planter_divider_3x1', 25 * TILE, 73 * TILE, 48, 24);

          // Smart Snack & Energy Drink Vending Machine
          drawSprite('vending_machine_snack', 33 * TILE, 72.50 * TILE, 16, 32);

          // Hot & Cold Water Dispenser
          drawSprite('water_dispenser_cold_hot', 31.50 * TILE, 72.50 * TILE, 16, 32);

          // 3-Compartment Recycling Station
          drawSprite('trio_recycle_bin_station', 28.50 * TILE, 73.80 * TILE, 32, 16);
          drawSprite('plant_floor', 33.50 * TILE, 74.50 * TILE, 16, 16);

          // Stylish Room Badge Pill (Open Workspace / Coworking)
          const wBadgeX = 17 * TILE;
          const wBadgeY = 58.80 * TILE;
          const wBadgeW = 175;
          const wBadgeH = 24;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.94)';
          ctx.beginPath();
          ctx.roundRect(wBadgeX, wBadgeY, wBadgeW, wBadgeH, 12);
          ctx.fill();
          ctx.strokeStyle = '#2563eb';
          ctx.lineWidth = 1.2;
          ctx.stroke();

          ctx.fillStyle = '#2563eb';
          ctx.beginPath();
          ctx.arc(wBadgeX + 12, wBadgeY + 12, 7.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 8.5px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('4', wBadgeX + 12, wBadgeY + 12);

          ctx.fillStyle = '#1e293b';
          ctx.font = 'bold 9px sans-serif';
          ctx.textAlign = 'left';
          ctx.fillText('KHU VỰC LÀM VIỆC CHUNG (TEAM)', wBadgeX + 24, wBadgeY + 12);
        }

        // 14. FURNITURE PASS FOR KHU 7A, 7B, 7C, 7D (PRIVATE OFFICES & FOCUS PODS)
        {
          // --- KHU 7A: PHÒNG TỔNG GIÁM ĐỐC / CEO EXECUTIVE SUITE (x: 68..80, y: 7..19) ---
          // ==========================================
          // PHÂN KHU 1: ĐẠI BÀN LÃNH ĐẠO CHỮ L GỖ ÓC CHÓ & GHẾ GIÁM ĐỐC HOÀNG GIA (x: 71..77, y: 10.8..16)
          // ==========================================
          // CEO Imperial Persian Silk Medallion Rug (6x5 tiles: w=96 -> baseW=192px, h=80 -> baseH=160px)
          drawSprite('ceo_silk_persian_rug_6x5', 77 * TILE, 10.80 * TILE, 96, 80);

          // Imperial High-Back Leather Swivel Throne Chair (Dark Cognac / Espresso)
          drawSprite('ceo_executive_highback_leather_chair', 79.50 * TILE, 11.20 * TILE, 16, 16);

          // Solid American Walnut Executive L-Shaped Desk (4x3 tiles: w=64 -> baseW=128px, h=48 -> baseH=96px)
          drawSprite('ceo_walnut_executive_desk_l_shape', 78 * TILE, 12 * TILE, 64, 48);

          // Cantilever Sled Executive Guest Chairs (Pair)
          drawSprite('guest_leather_lowback_chair_pair', 78.80 * TILE, 15.50 * TILE, 32, 16);

          // ==========================================
          // PHÂN KHU 2: ĐẠI TỦ KÍNH BẢO TÀNG KỶ NIỆM CHƯƠNG, HUÂN CHƯƠNG & RƯỢU VANG (Vách Bắc, x: 74..80, y: 7..10)
          // ==========================================
          // Vitrine Archive & Fine Wine Showcase Cabinet (3x2 tiles: w=48, h=32)
          drawSprite('ceo_grand_archive_display_cabinet_3x2', 80.50 * TILE, 7.20 * TILE, 48, 32);

          // Heavy Titanium Biometric Fingerprint Safe
          drawSprite('ceo_biometric_steel_safe', 84.50 * TILE, 7.50 * TILE, 16, 24);
          drawSprite('plant_floor', 85.50 * TILE, 7.50 * TILE, 16, 16);

          // ==========================================
          // PHÂN KHU 3: KHÔNG GIAN TIẾP KHÁCH VIP NGHỆ THUẬT & BÀN TRÀ MARBLE CẨM THẠCH (Góc Tây Nam, x: 69..74, y: 14.5..18.5)
          // ==========================================
          // Italian Caramel Leather 2-Seater VIP Sofa
          drawSprite('ceo_vip_leather_sofa_2seater', 75.20 * TILE, 14.80 * TILE, 32, 16);

          // Calacatta Marble Luxury Coffee Table with Gold Trim (2x1 tiles)
          drawSprite('calacatta_marble_coffee_table_2x1', 75.20 * TILE, 16.80 * TILE, 32, 16);

          // Deluxe White Orchid in Gold Porcelain Vase
          drawSprite('orchid_flower_vase_deluxe', 75.80 * TILE, 16.50 * TILE, 16, 16);

          // Caramel Leather VIP Club Armchair
          drawSprite('ceo_armchair_vip', 77.80 * TILE, 16.80 * TILE, 16, 16);

          // ==========================================
          // PHÂN KHU 4: TRANH SƠN DẦU PHONG THỦY "MÃ ĐÁO THÀNH CÔNG" & BẢNG SỐ REALTIME (Vách Tây, x: 68..71, y: 8.5..14)
          // ==========================================
          // "Mã Đáo Thành Công" Gilt Gold Framed Canvas Painting (2x2 tiles)
          drawSprite('fengshui_gold_canvas_painting_2x2', 74.80 * TILE, 8.50 * TILE, 32, 32);

          // Realtime Financial Stock Ticker Terminal
          drawSprite('executive_market_ticker_display', 74.80 * TILE, 11.50 * TILE, 32, 16);

          // Braided Money Tree in Imperial Emerald Jade Pot
          drawSprite('money_tree_fengshui_pot', 74.80 * TILE, 13 * TILE, 16, 32);

          // ==========================================
          // PHÂN KHU 5: TRẠM ESPRESSO THƯỢNG HẠNG & MINIBAR CHAMPAGNE CỦA CEO (Góc Đông Nam, x: 77..80, y: 14.5..19)
          // ==========================================
          // Walnut Credenza Bar Station with Black Granite Counter
          drawSprite('ceo_credenza_bar_station', 83.80 * TILE, 15 * TILE, 32, 16);

          // Nespresso Luxury Capsule Coffee Machine & Rotating Tower
          drawSprite('nespresso_luxury_capsule_machine', 84 * TILE, 14.50 * TILE, 16, 16);

          // UV Glass Door Chilled Wine & Champagne Cooler Fridge
          drawSprite('mini_wine_cooler_fridge', 84.50 * TILE, 17 * TILE, 16, 24);

          // Handcrafted Saddle-Stitched Leather Wastebasket
          drawSprite('leather_wrapped_wastebasket', 83.50 * TILE, 18 * TILE, 16, 16);

          // Room Badge Pill 7A - Placed gracefully at North-West wall x: 69.5, y: 7.5
          const aBadgeX = 75.50 * TILE;
          const aBadgeY = 7.50 * TILE;
          const aBadgeW = 125;
          const aBadgeH = 22;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.94)';
          ctx.beginPath();
          ctx.roundRect(aBadgeX, aBadgeY, aBadgeW, aBadgeH, 11);
          ctx.fill();
          ctx.strokeStyle = '#c2410c';
          ctx.lineWidth = 1.2;
          ctx.stroke();
          ctx.fillStyle = '#c2410c';
          ctx.beginPath();
          ctx.arc(aBadgeX + 11, aBadgeY + 11, 6.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 8px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('7A', aBadgeX + 11, aBadgeY + 11);
          ctx.fillStyle = '#1e293b';
          ctx.font = 'bold 8.5px sans-serif';
          ctx.textAlign = 'left';
          ctx.fillText('PHÒNG TỔNG GIÁM ĐỐC', aBadgeX + 22, aBadgeY + 11);

          // --- KHU 7B: PHÒNG GIÁM ĐỐC KỸ THUẬT / CTO EXECUTIVE SUITE (x: 85..97, y: 7..19) ---
          // ==========================================
          // PHÂN KHU 1: ĐẢO BÀN LÀM VIỆC NÂNG HẠ CÔNG NGHỆ CAO CỦA CTO (x: 88..94, y: 11..16)
          // ==========================================
          // Cyber Circuit Board Rug (6x5 tiles: w=96 -> baseW=192px, h=80 -> baseH=160px)
          drawSprite('cto_cyber_circuit_rug_6x5', 94 * TILE, 11 * TILE, 96, 80);

          // Herman Miller Aeron Chair Titanium
          drawSprite('herman_miller_aeron_chair_titanium', 96.50 * TILE, 11.20 * TILE, 16, 16);

          // Smart Height-Adjustable Dual Standing Desk (4x2 tiles: w=64 -> baseW=128px, h=32 -> baseH=64px)
          drawSprite('cto_standing_desk_smart_4x2', 95 * TILE, 12.20 * TILE, 64, 32);

          // Triple Curved 4K Monitor Array on Heavy Gas-Spring Mount
          drawSprite('triple_curved_monitor_rig_mount', 95.50 * TILE, 12 * TILE, 32, 16);

          // Tech Lead Cantilever Sled Guest Chairs (Pair)
          drawSprite('tech_lead_guest_chair_pair', 95.50 * TILE, 15 * TILE, 32, 16);

          // ==========================================
          // PHÂN KHU 2: TỦ MÁY CHỦ MINI SERVER RACK 42U & TRUNG TÂM GIÁM SÁT HẠ TẦNG (Vách Bắc, x: 91..97, y: 7..10)
          // ==========================================
          // Enterprise Rackmount UPS Power Unit
          drawSprite('enterprise_ups_power_unit', 97 * TILE, 7.50 * TILE, 16, 16);

          // Mini Datacenter 42U Glass Server Rack
          drawSprite('mini_datacenter_server_rack_42u', 98.50 * TILE, 7.20 * TILE, 16, 32);

          // Wall-Mounted Telemetry Infrastructure Dashboard (K8s Cluster)
          drawSprite('wall_monitor_infra_dashboard_2x1', 100.20 * TILE, 7.20 * TILE, 32, 16);

          // ==========================================
          // PHÂN KHU 3: BẢNG VẼ KIẾN TRÚC HỆ THỐNG & SƠ ĐỒ MICROSERVICES (Vách Tây, x: 85..88, y: 8.5..15)
          // ==========================================
          // Mobile Glass System Architecture Board (Microservices Diagram)
          drawSprite('system_architecture_glass_board_2x2', 91.80 * TILE, 9.50 * TILE, 32, 32);

          // O'Reilly Tech Encyclopedia Bookshelf
          drawSprite('oreilly_tech_encyclopedia_bookshelf', 91.80 * TILE, 13.50 * TILE, 16, 32);

          // ==========================================
          // PHÂN KHU 4: BỘ SƯU TẬP ROBOTICS, GUNDAM & CÚP HACKATHON TECH TITAN (Góc Đông Bắc / Vách Đông, x: 95..97, y: 8..14)
          // ==========================================
          // Smart Hydroponic Bonsai Planter with Purple Grow Light Halo
          drawSprite('hydroponic_bonsai_smart_planter', 101.80 * TILE, 8 * TILE, 16, 20);

          // SpaceX Starship & Gundam Collectibles Glass Showcase
          drawSprite('tech_collectibles_display_case', 101.80 * TILE, 10.20 * TILE, 16, 32);

          // ==========================================
          // PHÂN KHU 5: TRẠM COLD BREW THÁP THỦY TINH & MINIBAR RED BULL DEVELOPER (Góc Đông Nam, x: 93..97, y: 15..19)
          // ==========================================
          // Industrial Credenza Bar Station
          drawSprite('cto_industrial_bar_credenza', 100.20 * TILE, 15.20 * TILE, 32, 16);

          // Dutch Cold Brew Coffee Glass Tower
          drawSprite('dutch_cold_brew_glass_tower', 100.50 * TILE, 14.50 * TILE, 16, 24);

          // Developer Energy Drink Glass Mini-Fridge (Red Bull & Monster)
          drawSprite('developer_energy_drink_mini_fridge', 101.50 * TILE, 17 * TILE, 16, 24);

          // Brushed Stainless E-Waste & Tech Recycle Wastebin
          drawSprite('tech_recycle_wastebin', 99.80 * TILE, 17.50 * TILE, 16, 16);

          // Room Badge Pill 7B - Placed gracefully at North-West wall x: 86.2, y: 7.5
          const bBadgeX = 92.20 * TILE;
          const bBadgeY = 7.50 * TILE;
          const bBadgeW = 125;
          const bBadgeH = 22;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.94)';
          ctx.beginPath();
          ctx.roundRect(bBadgeX, bBadgeY, bBadgeW, bBadgeH, 11);
          ctx.fill();
          ctx.strokeStyle = '#2563eb';
          ctx.lineWidth = 1.2;
          ctx.stroke();
          ctx.fillStyle = '#2563eb';
          ctx.beginPath();
          ctx.arc(bBadgeX + 11, bBadgeY + 11, 6.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 8px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('7B', bBadgeX + 11, bBadgeY + 11);
          ctx.fillStyle = '#1e293b';
          ctx.font = 'bold 8.5px sans-serif';
          ctx.textAlign = 'left';
          ctx.fillText('GIÁM ĐỐC KỸ THUẬT', bBadgeX + 22, bBadgeY + 11);

          // --- KHU 7C: PHÒNG QUẢN LÝ DỰ ÁN & SẢN PHẨM / PM STUDIO (x: 68..80, y: 24..36) ---
          // ==========================================
          // PHÂN KHU 1: ĐẢO BÀN LÀM VIỆC ĐIỀU HÀNH SPRINT CỦA PM / PRODUCT LEAD (x: 71..77, y: 28..33)
          // ==========================================
          // Scandinavian Geometric Wool Rug (6x5 tiles: w=96 -> baseW=192px, h=80 -> baseH=160px)
          drawSprite('pm_scandi_geometric_rug_6x5', 77 * TILE, 31 * TILE, 96, 80);

          // Ergonomic Task Chair Mustard (PM Seat behind desk)
          drawSprite('pm_ergonomic_task_chair_mustard', 79.50 * TILE, 31.20 * TILE, 16, 16);

          // Agile Standing Desk with MacBook & Jira Vertical Pivot Monitor (4x2 tiles: w=64 -> baseW=128px, h=32 -> baseH=64px)
          drawSprite('pm_agile_standing_desk_4x2', 78 * TILE, 32.20 * TILE, 64, 32);

          // Sprint 1-on-1 Guest Chair Pair (in front of desk)
          drawSprite('pm_sprint_guest_chair_pair', 78.50 * TILE, 35.20 * TILE, 32, 16);

          // ==========================================
          // PHÂN KHU 2: ĐẠI BẢNG KANBAN TƯỜNG DÍNH STICKY NOTES & MÀN HÌNH ROADMAP BURNDOWN (Vách Bắc, x: 70..79, y: 24..27)
          // ==========================================
          // Wall-Mounted 3-Column Kanban Board (To Do / In Progress / Done)
          drawSprite('wall_mounted_kanban_board_3x1', 78.20 * TILE, 27.20 * TILE, 48, 16);

          // 65" Ultra-Slim Smart TV Burndown Chart & Roadmap Velocity Metrics
          drawSprite('pm_roadmap_burndown_display_2x1', 81.40 * TILE, 27.20 * TILE, 32, 16);

          // Golden Trophy & Tomato Pomodoro Timer Floating Wall Shelf
          drawSprite('pm_pomodoro_trophy_shelf', 83.80 * TILE, 27.20 * TILE, 16, 16);

          // ==========================================
          // PHÂN KHU 3: KỆ TÀI LIỆU QUẢN TRỊ DỰ ÁN & SÁCH AGILE / SCRUM (Vách Tây, x: 68..71, y: 26..35)
          // ==========================================
          // Tall Agile Spec Library Bookshelf (Scrum, Inspired, Lean UX)
          drawSprite('pm_agile_library_bookshelf_1x2', 74.80 * TILE, 29.50 * TILE, 16, 32);

          // Cây Phát Tài / Kim Tiền Tán Lá Bóng Mượt Trong Chậu Gốm Sứ Chân Gỗ
          drawSprite('pm_fortune_plant_ceramic_pot', 74.80 * TILE, 32.80 * TILE, 16, 20);

          // Tủ Da Lưu Trữ Tài Liệu Đặc Tả PRD & Hộp Hồ Sơ Dự Án
          drawSprite('pm_prd_storage_archive', 74.80 * TILE, 35.50 * TILE, 16, 16);

          // ==========================================
          // PHÂN KHU 4: BÀN TRÒN BRAINSTORMING & THẢO LUẬN 1-ON-1 NHANH (Góc Đông Bắc / Vách Đông, x: 77..80, y: 25..31)
          // ==========================================
          // Bảng Kính Từ Tính Phác Thảo User Persona & Wireframe Flow
          drawSprite('pm_user_persona_wireframe_board', 85 * TILE, 28 * TILE, 16, 16);

          // Bàn Tròn Thảo Luận Mặt Đá Terrazzo Trắng
          drawSprite('pm_brainstorm_round_table_1x1', 84.50 * TILE, 30.20 * TILE, 16, 16);

          // Cặp Ghế Đôn Cao Chân Thép Tựa Thấp Cho Trao Đổi Ngắn
          drawSprite('pm_high_stool_pair', 84.50 * TILE, 31.80 * TILE, 16, 16);

          // ==========================================
          // PHÂN KHU 5: TRẠM TIỆN ÍCH PM, MÁY HỦY TÀI LIỆU & QUẦY TỰ PHỤC VỤ TRÀ (Góc Đông Nam, x: 76..80, y: 32..36)
          // ==========================================
          // Máy In Màu Đa Năng & Máy Hủy Tài Liệu Bảo Mật Confetti
          drawSprite('pm_secure_paper_shredder_printer', 84.80 * TILE, 34.80 * TILE, 16, 20);

          // Quầy Tủ Sideboard Gỗ Walnut Phục Vụ Trà Thảo Mộc & Bình Nước Infuser
          drawSprite('pm_herbal_tea_station_credenza', 83.50 * TILE, 37 * TILE, 32, 16);

          // Thùng Rác Inox Phân Loại 2 Ngăn Có Bàn Đạp
          drawSprite('pm_dual_compartment_recycle_bin', 82 * TILE, 38.50 * TILE, 16, 16);

          // Room Badge Pill 7C - Placed gracefully at North-West corner
          const cBadgeX = 74.50 * TILE;
          const cBadgeY = 27.50 * TILE;
          const cBadgeW = 110;
          const cBadgeH = 22;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.94)';
          ctx.beginPath();
          ctx.roundRect(cBadgeX, cBadgeY, cBadgeW, cBadgeH, 11);
          ctx.fill();
          ctx.strokeStyle = '#d97706';
          ctx.lineWidth = 1.2;
          ctx.stroke();
          ctx.fillStyle = '#d97706';
          ctx.beginPath();
          ctx.arc(cBadgeX + 11, cBadgeY + 11, 6.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 8px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('7C', cBadgeX + 11, cBadgeY + 11);
          ctx.fillStyle = '#1e293b';
          ctx.font = 'bold 8.5px sans-serif';
          ctx.textAlign = 'left';
          ctx.fillText('QUẢN LÝ DỰ ÁN', cBadgeX + 22, cBadgeY + 11);

          // --- KHU 7D: STUDIO TẬP TRUNG CHUYÊN SÂU / DEEP WORK POD (x: 85..98, y: 24..37) ---
          // ==========================================
          // PHÂN KHU 1: ĐẢO TRẠM LÀM VIỆC DEEP WORK CÔNG THÁI HỌC VÁCH TIÊU ÂM (x: 88..94, y: 28..33)
          // ==========================================
          // Acoustic Soundwave Wool Rug (6x5 tiles: w=96 -> baseW=192px, h=80 -> baseH=160px)
          drawSprite('focus_acoustic_soundwave_rug_6x5', 94 * TILE, 31 * TILE, 96, 80);

          // Steelcase Gesture Ergonomic Task Chair (facing down)
          drawSprite('focus_steelcase_gesture_chair', 96.50 * TILE, 31.20 * TILE, 16, 16);

          // Deep Work Acoustic Surround Desk (4x2 tiles: w=64 -> baseW=128px, h=32 -> baseH=64px)
          drawSprite('focus_deep_work_acoustic_desk_4x2', 95 * TILE, 32.20 * TILE, 64, 32);

          // Ergonomic Rocking Footrest (under desk)
          drawSprite('focus_ergonomic_footrest', 96.50 * TILE, 33.50 * TILE, 16, 16);

          // ==========================================
          // PHÂN KHU 2: GÓC ĐỌC SÁCH THƯ GIÃN & GHẾ BÀNH TƯ TƯỞNG EAMES LOUNGE (Góc Đông Nam, x: 92..97, y: 32..36)
          // ==========================================
          // Iconic Eames Lounge Chair & Ottoman (2x2 tiles: w=32 -> baseW=64px, h=32 -> baseH=64px)
          drawSprite('focus_eames_lounge_chair_ottoman_2x2', 100.50 * TILE, 36 * TILE, 32, 32);

          // Arched Floor Reading Lamp casting warm 2700K downward glow
          drawSprite('focus_curved_reading_floor_lamp', 102.80 * TILE, 34.80 * TILE, 16, 32);

          // Nero Marquina Black Marble Accent Table with Hot Chamomile Tea
          drawSprite('focus_marble_accent_table_with_tea', 99.20 * TILE, 36.50 * TILE, 16, 16);

          // ==========================================
          // PHÂN KHU 3: BẢNG KÍNH TOÁN HỌC / THUẬT TOÁN & DẢI ĐÈN AMBIENT LIGHT (Vách Bắc, x: 87..96, y: 24..27)
          // ==========================================
          // Full-Width Matte Black Glass Algorithm Blackboard (3x1 tiles: w=48 -> baseW=96px)
          drawSprite('focus_algorithm_math_blackboard_3x1', 95.80 * TILE, 27.20 * TILE, 48, 16);

          // Floating Dark Oak Ambient Light Shelf & Essential Oil Ultrasonic Diffuser
          drawSprite('focus_diffuser_ambient_light_shelf_2x1', 99.50 * TILE, 27.20 * TILE, 32, 16);

          // ==========================================
          // PHÂN KHU 4: KỆ TỦ SÁCH HỌC THUẬT & TRẠM ÂM THANH SÓNG NÃO BINAURAL (Vách Tây, x: 85..88, y: 26..35)
          // ==========================================
          // Tall Academic Research Bookshelf in Black Stained Oak (Knuth TAOCP, CLRS, AI)
          drawSprite('focus_academic_research_bookshelf_1x2', 91.80 * TILE, 29.50 * TILE, 16, 32);

          // Architectural Snake Plant in Slate Planter
          drawSprite('focus_snake_plant_slate_planter', 91.80 * TILE, 32.80 * TILE, 16, 20);

          // White Noise Sound Machine & Audiophile Headphone Audio Station
          drawSprite('focus_white_noise_audio_station', 91.80 * TILE, 35.50 * TILE, 16, 16);

          // ==========================================
          // PHÂN KHU 5: MÁY LỌC KHÔNG KHÍ HEPA ION ÂM & TỦ KÍNH THẠCH ANH (Góc Đông Bắc / Vách Đông, x: 94..97, y: 25..31)
          // ==========================================
          // Dyson Pure Cool Bladeless Air Purifier Tower
          drawSprite('focus_dyson_air_purifier_tower', 102 * TILE, 28.50 * TILE, 16, 20);

          // Amethyst Crystal Geode & Newton's Cradle Balance Balls Credenza
          drawSprite('focus_crystals_newton_cradle_credenza', 102 * TILE, 31 * TILE, 16, 16);

          // Smart Infrared Sensor Automatic Trashcan
          drawSprite('focus_smart_sensor_trashbin', 102 * TILE, 33.50 * TILE, 16, 16);

          // Room Badge Pill 7D - Placed gracefully at North-West corner
          const dBadgeX = 91.50 * TILE;
          const dBadgeY = 27.50 * TILE;
          const dBadgeW = 125;
          const dBadgeH = 22;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.94)';
          ctx.beginPath();
          ctx.roundRect(dBadgeX, dBadgeY, dBadgeW, dBadgeH, 11);
          ctx.fill();
          ctx.strokeStyle = '#7c3aed';
          ctx.lineWidth = 1.2;
          ctx.stroke();
          ctx.fillStyle = '#7c3aed';
          ctx.beginPath();
          ctx.arc(dBadgeX + 11, dBadgeY + 11, 6.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 8px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('7D', dBadgeX + 11, dBadgeY + 11);
          ctx.fillStyle = '#1e293b';
          ctx.font = 'bold 8.5px sans-serif';
          ctx.textAlign = 'left';
          ctx.fillText('STUDIO TẬP TRUNG', dBadgeX + 22, dBadgeY + 11);
        }

        // 16. SCATTERED OUTDOOR BIOPHILIC TREES PASS (OUTSIDE ROOM WALLS ONLY - ZERO TREES INSIDE ROOMS)
        {
                    const outdoorTrees = [
            // --- Zone 1: North Perimeter (Campus Top Edge, Spaced ~20-24 tiles apart, Giant Trees) ---
            { name: 'tree_leafy_deep_green', x: 15.0 * TILE, y: 1.5 * TILE, w: 70, h: 84 },
            { name: 'tree_sakura_wide_canopy', x: 38.5 * TILE, y: 1.2 * TILE, w: 104, h: 76 },
            { name: 'tree_leafy_deep_green', x: 63.0 * TILE, y: 1.8 * TILE, w: 70, h: 84 },
            { name: 'tree_cherry_blossom_voxel', x: 92.0 * TILE, y: 1.2 * TILE, w: 92, h: 70 },

            // --- Zone 4: South Perimeter & Bottom Corners (Cherry Blossom Boulevard: y: 77..84) ---
            { name: 'tree_sakura_wide_canopy', x: 5.0 * TILE, y: 76.5 * TILE, w: 104, h: 76 },
            { name: 'tree_cherry_blossom_voxel', x: 20.2 * TILE, y: 76.5 * TILE, w: 64, h: 48 },
            { name: 'tree_cherry_blossom_voxel', x: 84.0 * TILE, y: 77.2 * TILE, w: 92, h: 70 },
            { name: 'tree_sakura_curved_bonsai', x: 104.2 * TILE, y: 77.2 * TILE, w: 86, h: 86 },

            // --- Zone 5: West & East Exterior Campus Walls (Grand Canopy Trees) ---
            { name: 'tree_leafy_deep_green', x: 2.5 * TILE, y: 13.0 * TILE, w: 70, h: 84 },
            { name: 'tree_sakura_curved_bonsai', x: 2.2 * TILE, y: 59.5 * TILE, w: 60, h: 60 },
            { name: 'tree_sakura_wide_canopy', x: 104.2 * TILE, y: 11.5 * TILE, w: 104, h: 76 },
            { name: 'tree_leafy_deep_green', x: 104.2 * TILE, y: 50.0 * TILE, w: 70, h: 84 },

            // --- Zone 6: Vertical Courtyards Hugging Room Walls (in 2-tile grass margins) ---
            { name: 'tree_sakura_wide_canopy', x: 35.0 * TILE, y: 12.5 * TILE, w: 96, h: 72 },
            { name: 'tree_cherry_blossom_voxel', x: 66.2 * TILE, y: 12.5 * TILE, w: 60, h: 56 },

            // --- Zone 7: Additional Cherry Blossom Trees (Areas 4 and Spawn) ---
            // Khu vực 4 (Khu vực làm việc chung / Open Workspace):
            { name: 'tree_sakura_wide_canopy', x: 2.2 * TILE, y: 68.8 * TILE, w: 68, h: 50 },
            { name: 'tree_cherry_blossom_voxel', x: 27.5 * TILE, y: 76.5 * TILE, w: 64, h: 48 },

            // Khu vực Spawn (Sảnh Lễ Tân / South Campus Entrance Boulevard):
            { name: 'tree_cherry_blossom_voxel', x: 45.5 * TILE, y: 76.5 * TILE, w: 70, h: 52 },
            { name: 'tree_cherry_blossom_voxel', x: 59.5 * TILE, y: 76.5 * TILE, w: 66, h: 52 },
            // Mở rộng thêm cây hoa anh đào & cây bóng mát trên thảm cỏ mở rộng phía Nam & Đông:
            { name: 'tree_cherry_blossom_voxel', x: 45.5 * TILE, y: 88.0 * TILE, w: 70, h: 52 },
            { name: 'tree_cherry_blossom_voxel', x: 59.5 * TILE, y: 88.0 * TILE, w: 66, h: 52 },
            { name: 'tree_sakura_wide_canopy', x: 18.0 * TILE, y: 87.5 * TILE, w: 104, h: 76 },
            { name: 'tree_sakura_wide_canopy', x: 80.0 * TILE, y: 87.5 * TILE, w: 104, h: 76 },
            { name: 'tree_leafy_deep_green', x: 111.0 * TILE, y: 35.0 * TILE, w: 70, h: 84 },
            { name: 'tree_sakura_curved_bonsai', x: 111.0 * TILE, y: 62.0 * TILE, w: 86, h: 86 }
          ];

          outdoorTrees.forEach(t => {
            const s = TILE / 16;
            const tw = (t.w / 16) * TILE;
            const th = (t.h / 16) * TILE;
            const shadowX = t.x + tw / 2;
            const shadowY = t.y + th * 0.88;

            // Deep prominent multi-layer drop shadow under tree root base
            ctx.save();
            // Ensure drop shadow never bleeds into room interiors
            rooms.forEach(r => {
              if (t.x + tw > r.x * TILE && t.x < (r.x + r.w) * TILE && t.y + th >= r.y * TILE - 32 && t.y < r.y * TILE) {
                ctx.beginPath();
                ctx.rect(0, 0, W, r.y * TILE - 6);
                ctx.clip();
              }
            });

            // Compact, natural shadow sized proportionally to tree height and width
            const sRadX1 = (tw * 0.54) / 2;
            const sRadY1 = Math.min(6 * s, th * 0.12);
            const sRadX2 = (tw * 0.38) / 2;
            const sRadY2 = Math.min(4 * s, th * 0.08);

            // Layer 1: Soft ambient outer spread
            ctx.fillStyle = 'rgba(10, 15, 30, 0.38)';
            ctx.beginPath();
            ctx.ellipse(shadowX, shadowY, sRadX1, sRadY1, 0, 0, Math.PI * 2);
            ctx.fill();

            // Layer 2: Dense grounding core shadow
            ctx.fillStyle = 'rgba(5, 10, 20, 0.58)';
            ctx.beginPath();
            ctx.ellipse(shadowX, shadowY + 1 * s, sRadX2, sRadY2, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            // Draw tree sprite
            drawSprite(t.name, t.x, t.y, t.w, t.h);
          });
        }

        // 17. OUTDOOR WALKWAY DECORATIONS PASS (Spacious, Elegant, Natural Architectural Placement)
        {
                    const outdoorWalkwayProps = [
            // --- 5 Magnified High-Definition Water Features ---
            // 1. North Promenade Centerpiece: Grand Crystal Orb Tiered Basin
            { name: 'outdoor_fountain_grand_orb', x: 52.4 * TILE, y: 1.8 * TILE, w: 96, h: 62 },
            // 2. South-West Campus Park: Grand Crystal Orb Fountain (Below Room 4)
            { name: 'outdoor_fountain_grand_orb', x: 12.8 * TILE, y: 77.5 * TILE, w: 96, h: 62 },
            // 3. South-East Relaxation Lagoon: Kidney-Shaped Swimming Pool (Below Room 9)
            { name: 'outdoor_water_pool_kidney', x: 90.5 * TILE, y: 77.5 * TILE, w: 76, h: 71 },
            // 4. North Executive Terrace: Classic Tiered Cast Bronze Fountain
            { name: 'outdoor_fountain_tiered_classic', x: 23.0 * TILE, y: 2.0 * TILE, w: 60, h: 60 },
            // 5. South Central Promenade: Classic Tiered Cast Bronze Fountain
            { name: 'outdoor_fountain_tiered_classic', x: 32.0 * TILE, y: 77.5 * TILE, w: 60, h: 60 },
            // 6. West Sanctuary Garden: Circular Natural Stone Basalt Fountain
            { name: 'outdoor_fountain_circular_stone', x: 3.2 * TILE, y: 41.5 * TILE, w: 42, h: 40 },
            // 7. East VIP Courtyard: Circular Natural Stone Basalt Fountain
            { name: 'outdoor_fountain_circular_stone', x: 87.5 * TILE, y: 2.0 * TILE, w: 54, h: 50 },
            // 8. Executive Crossroads: Ornate Pedestal Fountain
            { name: 'outdoor_fountain_ornate_pedestal', x: 90.0 * TILE, y: 22.5 * TILE, w: 42, h: 44 },
            // 9. East Garden: Ornate Pedestal Fountain
            { name: 'outdoor_fountain_ornate_pedestal', x: 70.8 * TILE, y: 14.0 * TILE, w: 42, h: 44 },

            // --- Street Lampposts with Warm 2700K Glow (Sitting in 2-tile grass margins) ---
            { name: 'outdoor_street_lamppost', x: 41.8 * TILE, y: 24.15 * TILE, w: 16, h: 27, hasGlow: true },
            { name: 'outdoor_street_lamppost', x: 66.4 * TILE, y: 24.15 * TILE, w: 16, h: 27, hasGlow: true },
            { name: 'outdoor_street_lamppost', x: 41.8 * TILE, y: 30.20 * TILE, w: 16, h: 27, hasGlow: true },
            { name: 'outdoor_street_lamppost', x: 66.4 * TILE, y: 30.20 * TILE, w: 16, h: 27, hasGlow: true },
            { name: 'outdoor_street_lamppost', x: 41.8 * TILE, y: 50.15 * TILE, w: 16, h: 27, hasGlow: true },
            { name: 'outdoor_street_lamppost', x: 66.4 * TILE, y: 50.15 * TILE, w: 16, h: 27, hasGlow: true },
            { name: 'outdoor_street_lamppost', x: 41.8 * TILE, y: 56.20 * TILE, w: 16, h: 27, hasGlow: true },
            { name: 'outdoor_street_lamppost', x: 66.4 * TILE, y: 56.20 * TILE, w: 16, h: 27, hasGlow: true },
            { name: 'outdoor_street_lamppost', x: 50.0 * TILE, y: 77.0 * TILE, w: 26, h: 40, hasGlow: true },
            { name: 'outdoor_street_lamppost', x: 57.5 * TILE, y: 77.0 * TILE, w: 26, h: 40, hasGlow: true },
            { name: 'outdoor_street_lamppost', x: 50.0 * TILE, y: 88.0 * TILE, w: 26, h: 40, hasGlow: true },
            { name: 'outdoor_street_lamppost', x: 57.5 * TILE, y: 88.0 * TILE, w: 26, h: 40, hasGlow: true },
            // Room Outer-Corner Park Lampposts:
            { name: 'outdoor_street_lamppost', x: 5.8 * TILE, y: 5.20 * TILE, w: 16, h: 27, hasGlow: true },
            { name: 'outdoor_street_lamppost', x: 35.4 * TILE, y: 5.20 * TILE, w: 16, h: 27, hasGlow: true },
            { name: 'outdoor_street_lamppost', x: 5.8 * TILE, y: 24.15 * TILE, w: 16, h: 27, hasGlow: true },
            { name: 'outdoor_street_lamppost', x: 34.4 * TILE, y: 24.15 * TILE, w: 16, h: 27, hasGlow: true },
            { name: 'outdoor_street_lamppost', x: 5.8 * TILE, y: 30.20 * TILE, w: 16, h: 27, hasGlow: true },
            { name: 'outdoor_street_lamppost', x: 18.2 * TILE, y: 30.20 * TILE, w: 16, h: 27, hasGlow: true },
            { name: 'outdoor_street_lamppost', x: 5.8 * TILE, y: 50.15 * TILE, w: 16, h: 27, hasGlow: true },
            { name: 'outdoor_street_lamppost', x: 18.2 * TILE, y: 50.15 * TILE, w: 16, h: 27, hasGlow: true },
            { name: 'outdoor_street_lamppost', x: 19.8 * TILE, y: 30.20 * TILE, w: 16, h: 27, hasGlow: true },
            { name: 'outdoor_street_lamppost', x: 35.4 * TILE, y: 30.20 * TILE, w: 16, h: 27, hasGlow: true },
            { name: 'outdoor_street_lamppost', x: 19.8 * TILE, y: 50.15 * TILE, w: 16, h: 27, hasGlow: true },
            { name: 'outdoor_street_lamppost', x: 34.4 * TILE, y: 50.15 * TILE, w: 16, h: 27, hasGlow: true },
            { name: 'outdoor_street_lamppost', x: 5.8 * TILE, y: 56.20 * TILE, w: 16, h: 27, hasGlow: true },
            { name: 'outdoor_street_lamppost', x: 35.4 * TILE, y: 56.20 * TILE, w: 16, h: 27, hasGlow: true },
            { name: 'outdoor_street_lamppost', x: 5.8 * TILE, y: 74.20 * TILE, w: 16, h: 27, hasGlow: true },
            { name: 'outdoor_street_lamppost', x: 35.4 * TILE, y: 74.20 * TILE, w: 16, h: 27, hasGlow: true },
            { name: 'outdoor_street_lamppost', x: 45.4 * TILE, y: 5.20 * TILE, w: 16, h: 27, hasGlow: true },
            { name: 'outdoor_street_lamppost', x: 67.4 * TILE, y: 6.20 * TILE, w: 16, h: 27, hasGlow: true },
            { name: 'outdoor_street_lamppost', x: 41.8 * TILE, y: 76.15 * TILE, w: 16, h: 27, hasGlow: true },
            { name: 'outdoor_street_lamppost', x: 66.4 * TILE, y: 76.15 * TILE, w: 16, h: 27, hasGlow: true },
            { name: 'outdoor_street_lamppost', x: 72.8 * TILE, y: 5.20 * TILE, w: 16, h: 27, hasGlow: true },
            { name: 'outdoor_street_lamppost', x: 85.8 * TILE, y: 5.20 * TILE, w: 16, h: 27, hasGlow: true },
            { name: 'outdoor_street_lamppost', x: 72.8 * TILE, y: 18.20 * TILE, w: 16, h: 27, hasGlow: true },
            { name: 'outdoor_street_lamppost', x: 91.1 * TILE, y: 5.62 * TILE, w: 16, h: 27, hasGlow: true },
            { name: 'outdoor_street_lamppost', x: 104.4 * TILE, y: 5.20 * TILE, w: 16, h: 27, hasGlow: true },
            { name: 'outdoor_street_lamppost', x: 104.4 * TILE, y: 18.20 * TILE, w: 16, h: 27, hasGlow: true },
            { name: 'outdoor_street_lamppost', x: 72.8 * TILE, y: 25.20 * TILE, w: 16, h: 27, hasGlow: true },
            { name: 'outdoor_street_lamppost', x: 85.8 * TILE, y: 25.20 * TILE, w: 16, h: 27, hasGlow: true },
            { name: 'outdoor_street_lamppost', x: 72.8 * TILE, y: 40.15 * TILE, w: 16, h: 27, hasGlow: true },
            { name: 'outdoor_street_lamppost', x: 85.8 * TILE, y: 40.15 * TILE, w: 16, h: 27, hasGlow: true },
            { name: 'outdoor_street_lamppost', x: 92.8 * TILE, y: 25.20 * TILE, w: 16, h: 27, hasGlow: true },
            { name: 'outdoor_street_lamppost', x: 104.4 * TILE, y: 25.20 * TILE, w: 16, h: 27, hasGlow: true },
            { name: 'outdoor_street_lamppost', x: 91.2 * TILE, y: 40.15 * TILE, w: 16, h: 27, hasGlow: true },
            { name: 'outdoor_street_lamppost', x: 104.4 * TILE, y: 40.15 * TILE, w: 16, h: 27, hasGlow: true },
            { name: 'outdoor_street_lamppost', x: 72.8 * TILE, y: 44.20 * TILE, w: 16, h: 27, hasGlow: true },
            { name: 'outdoor_street_lamppost', x: 104.4 * TILE, y: 44.20 * TILE, w: 16, h: 27, hasGlow: true },
            { name: 'outdoor_street_lamppost', x: 72.8 * TILE, y: 59.15 * TILE, w: 16, h: 27, hasGlow: true },
            { name: 'outdoor_street_lamppost', x: 104.4 * TILE, y: 59.15 * TILE, w: 16, h: 27, hasGlow: true },
            { name: 'outdoor_street_lamppost', x: 72.8 * TILE, y: 60.20 * TILE, w: 16, h: 27, hasGlow: true },
            { name: 'outdoor_street_lamppost', x: 104.4 * TILE, y: 60.20 * TILE, w: 16, h: 27, hasGlow: true },
            { name: 'outdoor_street_lamppost', x: 72.8 * TILE, y: 77.15 * TILE, w: 16, h: 27, hasGlow: true },
            { name: 'outdoor_street_lamppost', x: 104.4 * TILE, y: 75.20 * TILE, w: 16, h: 27, hasGlow: true },

            // --- Scattered Daisy Flowerbeds & Dense Grass Tufts (In the 2-tile grass margins) ---
            { name: 'outdoor_daisy_flowerbed', x: 18.0 * TILE, y: 3.8 * TILE, w: 36, h: 25 },
            { name: 'outdoor_daisy_flowerbed', x: 28.5 * TILE, y: 3.8 * TILE, w: 36, h: 25 },
            { name: 'outdoor_daisy_flowerbed', x: 42.0 * TILE, y: 3.8 * TILE, w: 36, h: 25 },
            { name: 'outdoor_daisy_flowerbed', x: 66.0 * TILE, y: 3.8 * TILE, w: 36, h: 25 },
            { name: 'outdoor_daisy_flowerbed', x: 81.0 * TILE, y: 3.8 * TILE, w: 36, h: 25 },
            { name: 'outdoor_daisy_flowerbed', x: 95.0 * TILE, y: 3.8 * TILE, w: 36, h: 25 },
            { name: 'outdoor_daisy_flowerbed', x: 14.5 * TILE, y: 24.3 * TILE, w: 36, h: 25 },
            { name: 'outdoor_daisy_flowerbed', x: 30.0 * TILE, y: 24.3 * TILE, w: 36, h: 25 },
            { name: 'outdoor_daisy_flowerbed', x: 35.2 * TILE, y: 30.5 * TILE, w: 22, h: 16 },
            { name: 'outdoor_daisy_flowerbed', x: 46.5 * TILE, y: 30.5 * TILE, w: 22, h: 16 },
            { name: 'outdoor_daisy_flowerbed', x: 60.0 * TILE, y: 30.5 * TILE, w: 22, h: 16 },
            { name: 'outdoor_daisy_flowerbed', x: 63.8 * TILE, y: 24.3 * TILE, w: 22, h: 16 },
            { name: 'outdoor_daisy_flowerbed', x: 84.5 * TILE, y: 25.5 * TILE, w: 36, h: 25 },
            { name: 'outdoor_daisy_flowerbed', x: 84.0 * TILE, y: 41.0 * TILE, w: 36, h: 25 },
            { name: 'outdoor_daisy_flowerbed', x: 91.5 * TILE, y: 41.0 * TILE, w: 36, h: 25 },
            { name: 'outdoor_daisy_flowerbed', x: 13.5 * TILE, y: 57.2 * TILE, w: 36, h: 25 },
            { name: 'outdoor_daisy_flowerbed', x: 22.5 * TILE, y: 57.2 * TILE, w: 36, h: 25 },
            { name: 'outdoor_daisy_flowerbed', x: 48.5 * TILE, y: 50.3 * TILE, w: 22, h: 16 },
            { name: 'outdoor_daisy_flowerbed', x: 61.5 * TILE, y: 50.3 * TILE, w: 22, h: 16 },
            { name: 'outdoor_daisy_flowerbed', x: 58.0 * TILE, y: 57.2 * TILE, w: 22, h: 16 },
            { name: 'outdoor_daisy_flowerbed', x: 80.0 * TILE, y: 61.2 * TILE, w: 36, h: 25 },
            { name: 'outdoor_daisy_flowerbed', x: 94.0 * TILE, y: 61.2 * TILE, w: 36, h: 25 },
            { name: 'outdoor_daisy_flowerbed', x: 8.5 * TILE, y: 78.0 * TILE, w: 36, h: 25 },
            { name: 'outdoor_daisy_flowerbed', x: 24.8 * TILE, y: 78.2 * TILE, w: 36, h: 25 },
            { name: 'outdoor_daisy_flowerbed', x: 43.5 * TILE, y: 78.5 * TILE, w: 36, h: 25 },
            { name: 'outdoor_daisy_flowerbed', x: 63.5 * TILE, y: 77.0 * TILE, w: 36, h: 25 },
            { name: 'outdoor_daisy_flowerbed', x: 79.0 * TILE, y: 78.0 * TILE, w: 36, h: 25 },
            { name: 'outdoor_daisy_flowerbed', x: 96.0 * TILE, y: 78.5 * TILE, w: 36, h: 25 },
            { name: 'outdoor_daisy_flowerbed', x: 100.0 * TILE, y: 78.0 * TILE, w: 36, h: 25 },
            { name: 'outdoor_daisy_flowerbed', x: 3.5 * TILE, y: 16.5 * TILE, w: 36, h: 25 },
            { name: 'outdoor_daisy_flowerbed', x: 2.5 * TILE, y: 46.2 * TILE, w: 36, h: 25 },
            { name: 'outdoor_daisy_flowerbed', x: 3.5 * TILE, y: 65.5 * TILE, w: 36, h: 25 },
            { name: 'outdoor_daisy_flowerbed', x: 106.5 * TILE, y: 15.5 * TILE, w: 36, h: 25 },
            { name: 'outdoor_daisy_flowerbed', x: 106.5 * TILE, y: 52.5 * TILE, w: 36, h: 25 },
            { name: 'outdoor_daisy_flowerbed', x: 106.5 * TILE, y: 74.0 * TILE, w: 36, h: 25 },
            { name: 'outdoor_daisy_flowerbed', x: 18.0 * TILE, y: 45.5 * TILE, w: 36, h: 25 },
            { name: 'outdoor_daisy_flowerbed', x: 35.2 * TILE, y: 34.5 * TILE, w: 22, h: 16 },
            { name: 'outdoor_daisy_flowerbed', x: 35.2 * TILE, y: 71.5 * TILE, w: 22, h: 16 },
            { name: 'outdoor_daisy_flowerbed', x: 66.3 * TILE, y: 34.5 * TILE, w: 22, h: 16 },
            { name: 'outdoor_daisy_flowerbed', x: 66.3 * TILE, y: 69.5 * TILE, w: 22, h: 16 },

            // Dense Green Grass Tufts
            { name: 'outdoor_tall_grass_tuft_a', x: 13.8 * TILE, y: 4.0 * TILE, w: 20, h: 13 },
            { name: 'outdoor_tall_grass_tuft_a', x: 21.0 * TILE, y: 4.2 * TILE, w: 20, h: 13 },
            { name: 'outdoor_tall_grass_tuft_a', x: 33.5 * TILE, y: 4.0 * TILE, w: 20, h: 13 },
            { name: 'outdoor_tall_grass_tuft_a', x: 42.5 * TILE, y: 4.0 * TILE, w: 20, h: 13 },
            { name: 'outdoor_tall_grass_tuft_a', x: 69.5 * TILE, y: 4.0 * TILE, w: 20, h: 13 },
            { name: 'outdoor_tall_grass_tuft_a', x: 85.2 * TILE, y: 4.0 * TILE, w: 20, h: 13 },
            { name: 'outdoor_tall_grass_tuft_a', x: 100.0 * TILE, y: 4.0 * TILE, w: 20, h: 13 },
            { name: 'outdoor_tall_grass_tuft_a', x: 15.5 * TILE, y: 24.6 * TILE, w: 20, h: 13 },
            { name: 'outdoor_tall_grass_tuft_a', x: 35.5 * TILE, y: 24.6 * TILE, w: 20, h: 13 },
            { name: 'outdoor_tall_grass_tuft_b', x: 66.5 * TILE, y: 24.6 * TILE, w: 18, h: 13 },
            { name: 'outdoor_tall_grass_tuft_a', x: 48.0 * TILE, y: 30.8 * TILE, w: 20, h: 13 },
            { name: 'outdoor_tall_grass_tuft_a', x: 64.5 * TILE, y: 30.8 * TILE, w: 20, h: 13 },
            { name: 'outdoor_tall_grass_tuft_a', x: 76.5 * TILE, y: 25.5 * TILE, w: 20, h: 13 },
            { name: 'outdoor_tall_grass_tuft_a', x: 100.5 * TILE, y: 25.5 * TILE, w: 20, h: 13 },
            { name: 'outdoor_tall_grass_tuft_a', x: 85.0 * TILE, y: 41.2 * TILE, w: 20, h: 13 },
            { name: 'outdoor_tall_grass_tuft_a', x: 10.5 * TILE, y: 57.3 * TILE, w: 20, h: 13 },
            { name: 'outdoor_tall_grass_tuft_a', x: 19.5 * TILE, y: 57.3 * TILE, w: 20, h: 13 },
            { name: 'outdoor_tall_grass_tuft_b', x: 35.5 * TILE, y: 51.0 * TILE, w: 18, h: 13 },
            { name: 'outdoor_tall_grass_tuft_a', x: 41.5 * TILE, y: 56.4 * TILE, w: 20, h: 13 },
            { name: 'outdoor_tall_grass_tuft_a', x: 43.8 * TILE, y: 57.2 * TILE, w: 20, h: 13 },
            { name: 'outdoor_tall_grass_tuft_a', x: 62.0 * TILE, y: 57.3 * TILE, w: 20, h: 13 },
            { name: 'outdoor_tall_grass_tuft_b', x: 66.5 * TILE, y: 56.4 * TILE, w: 18, h: 13 },
            { name: 'outdoor_tall_grass_tuft_a', x: 77.0 * TILE, y: 61.3 * TILE, w: 20, h: 13 },
            { name: 'outdoor_tall_grass_tuft_a', x: 83.5 * TILE, y: 61.3 * TILE, w: 20, h: 13 },
            { name: 'outdoor_tall_grass_tuft_a', x: 101.0 * TILE, y: 61.3 * TILE, w: 20, h: 13 },
            { name: 'outdoor_tall_grass_tuft_a', x: 4.5 * TILE, y: 78.5 * TILE, w: 20, h: 13 },
            { name: 'outdoor_tall_grass_tuft_a', x: 11.0 * TILE, y: 78.8 * TILE, w: 20, h: 13 },
            { name: 'outdoor_tall_grass_tuft_a', x: 22.0 * TILE, y: 78.8 * TILE, w: 20, h: 13 },
            { name: 'outdoor_tall_grass_tuft_a', x: 30.0 * TILE, y: 78.5 * TILE, w: 20, h: 13 },
            { name: 'outdoor_tall_grass_tuft_a', x: 50.5 * TILE, y: 77.2 * TILE, w: 20, h: 13 },
            { name: 'outdoor_tall_grass_tuft_a', x: 63.0 * TILE, y: 77.5 * TILE, w: 20, h: 13 },
            { name: 'outdoor_tall_grass_tuft_a', x: 74.5 * TILE, y: 78.8 * TILE, w: 20, h: 13 },
            { name: 'outdoor_tall_grass_tuft_a', x: 83.0 * TILE, y: 79.0 * TILE, w: 20, h: 13 },
            { name: 'outdoor_tall_grass_tuft_a', x: 95.5 * TILE, y: 78.8 * TILE, w: 20, h: 13 },
            { name: 'outdoor_tall_grass_tuft_a', x: 105.5 * TILE, y: 78.5 * TILE, w: 20, h: 13 },
            { name: 'outdoor_tall_grass_tuft_a', x: 4.8 * TILE, y: 12.0 * TILE, w: 20, h: 13 },
            { name: 'outdoor_tall_grass_tuft_a', x: 4.8 * TILE, y: 40.5 * TILE, w: 20, h: 13 },
            { name: 'outdoor_tall_grass_tuft_a', x: 4.8 * TILE, y: 62.5 * TILE, w: 20, h: 13 },
            { name: 'outdoor_tall_grass_tuft_a', x: 107.5 * TILE, y: 11.0 * TILE, w: 20, h: 13 },
            { name: 'outdoor_tall_grass_tuft_a', x: 107.5 * TILE, y: 46.5 * TILE, w: 20, h: 13 },
            { name: 'outdoor_tall_grass_tuft_a', x: 107.5 * TILE, y: 69.5 * TILE, w: 20, h: 13 },
            { name: 'outdoor_tall_grass_tuft_a', x: 18.2 * TILE, y: 40.5 * TILE, w: 20, h: 13 },
            { name: 'outdoor_tall_grass_tuft_a', x: 35.5 * TILE, y: 41.5 * TILE, w: 20, h: 13 },
            { name: 'outdoor_tall_grass_tuft_a', x: 35.5 * TILE, y: 64.0 * TILE, w: 20, h: 13 },
            { name: 'outdoor_tall_grass_tuft_a', x: 66.5 * TILE, y: 41.5 * TILE, w: 20, h: 13 },
            { name: 'outdoor_tall_grass_tuft_a', x: 66.5 * TILE, y: 64.5 * TILE, w: 20, h: 13 },
            { name: 'outdoor_wild_grass_row', x: 12.0 * TILE, y: 24.3 * TILE, w: 42, h: 11 },
            { name: 'outdoor_wild_grass_row', x: 62.5 * TILE, y: 57.3 * TILE, w: 42, h: 11 },
            { name: 'outdoor_wild_grass_row', x: 92.0 * TILE, y: 61.3 * TILE, w: 42, h: 11 }
          ];

          outdoorWalkwayProps.forEach(p => {
            const tw = (p.w / 16) * TILE;
            const th = (p.h / 16) * TILE;
            const s = TILE / 16;

            // 1. High-Contrast Multi-Layer Drop Shadows & Enhanced Lighting
            ctx.save();
            // Ensure drop shadow never bleeds into room interiors
            rooms.forEach(r => {
              if (p.x + tw > r.x * TILE && p.x < (r.x + r.w) * TILE && p.y + th >= r.y * TILE - 32 && p.y < r.y * TILE) {
                ctx.beginPath();
                ctx.rect(0, 0, W, r.y * TILE - 6);
                ctx.clip();
              }
            });

            if (p.name === 'outdoor_street_lamppost') {
              // Post base multi-layer drop shadow
              const postBaseX = p.x + tw * 0.36;
              const postBaseY = p.y + th - 2 * s;
              ctx.fillStyle = 'rgba(10, 15, 30, 0.45)';
              ctx.beginPath();
              ctx.ellipse(postBaseX, postBaseY, 13 * s, 6 * s, 0, 0, Math.PI * 2);
              ctx.fill();
              ctx.fillStyle = 'rgba(5, 10, 20, 0.75)';
              ctx.beginPath();
              ctx.ellipse(postBaseX, postBaseY, 8 * s, 3.5 * s, 0, 0, Math.PI * 2);
              ctx.fill();

              if (p.hasGlow) {
                const lanternGroundX = p.x + tw * 0.72;
                const lanternGroundY = p.y + th - 2 * s;
                const glowGrad = ctx.createRadialGradient(lanternGroundX, lanternGroundY, 3 * s, lanternGroundX, lanternGroundY, 38 * s);
                glowGrad.addColorStop(0, 'rgba(255, 240, 140, 0.48)');
                glowGrad.addColorStop(0.40, 'rgba(255, 220, 110, 0.22)');
                glowGrad.addColorStop(0.75, 'rgba(255, 210, 90, 0.08)');
                glowGrad.addColorStop(1, 'rgba(255, 210, 90, 0.0)');
                ctx.fillStyle = glowGrad;
                ctx.beginPath();
                ctx.arc(lanternGroundX, lanternGroundY, 38 * s, 0, Math.PI * 2);
                ctx.fill();
              }
            } else if (p.name.includes('fountain') || p.name.includes('pool')) {
              // Fountain & Pool Grounding Drop Shadow
              const shadowX = p.x + tw / 2;
              const shadowY = p.y + th - 3 * s;
              ctx.fillStyle = 'rgba(10, 25, 35, 0.45)';
              ctx.beginPath();
              ctx.ellipse(shadowX, shadowY, (tw * 0.90) / 2, (th * 0.38) / 2, 0, 0, Math.PI * 2);
              ctx.fill();
              ctx.fillStyle = 'rgba(5, 12, 20, 0.75)';
              ctx.beginPath();
              ctx.ellipse(shadowX, shadowY + 1 * s, (tw * 0.68) / 2, (th * 0.22) / 2, 0, 0, Math.PI * 2);
              ctx.fill();
            } else if (p.name.includes('pillar') || p.name.includes('pedestal')) {
              const shadowX = p.x + tw / 2;
              const shadowY = p.y + th - 2 * s;
              ctx.fillStyle = 'rgba(10, 15, 30, 0.48)';
              ctx.beginPath();
              ctx.ellipse(shadowX, shadowY, (tw * 0.88) / 2, 6.5 * s, 0, 0, Math.PI * 2);
              ctx.fill();
              ctx.fillStyle = 'rgba(5, 10, 20, 0.76)';
              ctx.beginPath();
              ctx.ellipse(shadowX, shadowY + 1 * s, (tw * 0.58) / 2, 4 * s, 0, 0, Math.PI * 2);
              ctx.fill();
            } else if (p.name.includes('flowerbed')) {
              const shadowX = p.x + tw / 2;
              const shadowY = p.y + th - 3 * s;
              ctx.fillStyle = 'rgba(10, 25, 12, 0.40)';
              ctx.beginPath();
              ctx.ellipse(shadowX, shadowY, (tw * 0.80) / 2, 8 * s, 0, 0, Math.PI * 2);
              ctx.fill();
              ctx.fillStyle = 'rgba(5, 15, 8, 0.65)';
              ctx.beginPath();
              ctx.ellipse(shadowX, shadowY + 1 * s, (tw * 0.54) / 2, 4.5 * s, 0, 0, Math.PI * 2);
              ctx.fill();
            } else if (p.name.includes('grass')) {
              const shadowX = p.x + tw / 2;
              const shadowY = p.y + th - 2 * s;
              ctx.fillStyle = 'rgba(10, 20, 10, 0.42)';
              ctx.beginPath();
              ctx.ellipse(shadowX, shadowY, (tw * 0.75) / 2, 3.5 * s, 0, 0, Math.PI * 2);
              ctx.fill();
            }
            ctx.restore();

            // 2. Draw sprite
            drawSprite(p.name, p.x, p.y, p.w, p.h);
          });
        }

        // 15. RENDER ALL WALLS & DOORWAYS PASS
        rooms.forEach(r => {
          const rx = r.x * TILE;
          const ry = r.y * TILE;
          const rw = r.w * TILE;
          const rh = r.h * TILE;
          const doorList = r.doors || (r.door ? [r.door] : []);

          // Top Wall
          const topDoors = doorList.filter(d => d.y === r.y).map(d => ({ start: d.x * TILE, end: (d.x + d.w) * TILE })).sort((a, b) => a.start - b.start);
          let curX = rx;
          topDoors.forEach(item => {
            if (item.start > curX) drawHWall(curX, item.start, ry);
            drawHDoor(item.start, item.end - item.start, ry);
            curX = Math.max(curX, item.end);
          });
          if (curX < rx + rw) drawHWall(curX, rx + rw, ry);

          // Bottom Wall
          const bottomDoors = doorList.filter(d => d.y === r.y + r.h).map(d => ({ start: d.x * TILE, end: (d.x + d.w) * TILE })).sort((a, b) => a.start - b.start);
          if (r.id === 'reception') {
            bottomDoors.push({ start: 52 * TILE, end: 56 * TILE });
            bottomDoors.sort((a, b) => a.start - b.start);
          }
          curX = rx;
          bottomDoors.forEach(item => {
            if (item.start > curX) drawHWall(curX, item.start, ry + rh);
            drawHDoor(item.start, item.end - item.start, ry + rh);
            curX = Math.max(curX, item.end);
          });
          if (curX < rx + rw) drawHWall(curX, rx + rw, ry + rh);

          // Left Wall
          const leftDoors = doorList.filter(d => d.x === r.x).map(d => ({ start: d.y * TILE, end: (d.y + (d.h || d.w)) * TILE })).sort((a, b) => a.start - b.start);
          let curY = ry;
          leftDoors.forEach(item => {
            if (item.start > curY) drawVWall(rx, curY, item.start);
            drawVDoor(rx, item.start, item.end - item.start);
            curY = Math.max(curY, item.end);
          });
          if (curY < ry + rh) drawVWall(rx, curY, ry + rh);

          // Right Wall
          const rightDoors = doorList.filter(d => d.x === r.x + r.w).map(d => ({ start: d.y * TILE, end: (d.y + (d.h || d.w)) * TILE })).sort((a, b) => a.start - b.start);
          curY = ry;
          rightDoors.forEach(item => {
            if (item.start > curY) drawVWall(rx + rw, curY, item.start);
            drawVDoor(rx + rw, item.start, item.end - item.start);
            curY = Math.max(curY, item.end);
          });
          if (curY < ry + rh) drawVWall(rx + rw, curY, ry + rh);

          // Blueprint label cards for other rooms
          if (!r.isDetailedPixelArt && !r.hasPond) {
            const cx = rx + rw / 2;
            const cy = ry + rh / 2;

            const cardW = Math.min(rw - 20, 210);
            const cardH = 50;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.94)';
            ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
            ctx.shadowBlur = 10;
            ctx.shadowOffsetY = 3;
            ctx.beginPath();
            ctx.roundRect(cx - cardW / 2, cy - cardH / 2, cardW, cardH, 10);
            ctx.fill();
            ctx.shadowColor = 'transparent';

            ctx.strokeStyle = r.accent;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.roundRect(cx - cardW / 2, cy - cardH / 2, cardW, cardH, 10);
            ctx.stroke();

            // Badge
            ctx.fillStyle = r.accent;
            ctx.beginPath();
            ctx.arc(cx - cardW / 2 + 18, cy, 11, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 10px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(r.num, cx - cardW / 2 + 18, cy);

            // Name
            ctx.textAlign = 'left';
            ctx.fillStyle = '#0f172a';
            ctx.font = 'bold 10.5px sans-serif';
            ctx.fillText(r.name, cx - cardW / 2 + 35, cy - 7);

            // Sub
            ctx.fillStyle = '#64748b';
            ctx.font = '9px sans-serif';
            const maxTextW = cardW - 42;
            let subText = r.sub;
            if (ctx.measureText(subText).width > maxTextW) {
              subText = subText.substring(0, 22) + '...';
            }
            ctx.fillText(subText, cx - cardW / 2 + 35, cy + 7);
          } else if (!r.isDetailedPixelArt && r.hasPond) {
            const cx = rx + rw / 2;
            const cy = ry + 20;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
            ctx.beginPath();
            ctx.roundRect(cx - 90, cy - 12, 180, 24, 8);
            ctx.fill();
            ctx.strokeStyle = r.accent;
            ctx.lineWidth = 1.2;
            ctx.stroke();

            ctx.fillStyle = r.accent;
            ctx.font = 'bold 9.5px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('3. VƯỜN TIỂU CẢNH & HỒ CÁ KOI', cx, cy);
          }
        });

        // Wall Helpers
        function drawHWall(x1, x2, y) {
          const w = x2 - x1;
          const s = TILE / 16;
          ctx.fillStyle = 'rgba(15, 23, 42, 0.16)';
          ctx.fillRect(x1, y + 4 * s, w, 5 * s);
          ctx.fillStyle = '#334155';
          ctx.fillRect(x1, y - 3 * s, w, 8 * s);
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(x1 - 1 * s, y - 6 * s, w + 2 * s, 4 * s);
          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = 1 * s;
          ctx.strokeRect(x1, y - 6 * s, w, 11 * s);
        }

        function drawVWall(x, y1, y2) {
          const h = y2 - y1;
          const s = TILE / 16;
          ctx.fillStyle = 'rgba(15, 23, 42, 0.16)';
          ctx.fillRect(x + 4 * s, y1, 4 * s, h);
          ctx.fillStyle = '#334155';
          ctx.fillRect(x - 4 * s, y1, 8 * s, h);
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(x - 5 * s, y1, 4 * s, h);
          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = 1 * s;
          ctx.strokeRect(x - 4 * s, y1, 8 * s, h);
        }

        function drawHDoor(x, w, y) {
          const s = TILE / 16;
          const doorTileImg = sprites['outdoor_cobblestone_pavement'] || sprites['floor_pathway_stone_brick'];
          if (doorTileImg) {
            ctx.fillStyle = ctx.createPattern(doorTileImg, 'repeat');
          } else {
            ctx.fillStyle = '#334155';
          }
          ctx.fillRect(x, y - 5 * s, w, 10 * s);
          ctx.fillStyle = '#475569';
          ctx.fillRect(x, y - 2 * s, w, 4 * s);
          ctx.strokeStyle = '#1e293b';
          ctx.lineWidth = 1 * s;
          ctx.strokeRect(x, y - 2 * s, w, 4 * s);
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(x - 3 * s, y - 6 * s, 5 * s, 12 * s);
          ctx.fillRect(x + w - 2 * s, y - 6 * s, 5 * s, 12 * s);
          ctx.fillStyle = '#64748b';
          ctx.fillRect(x - 2 * s, y - 5 * s, 3 * s, 3 * s);
          ctx.fillRect(x + w - 1 * s, y - 5 * s, 3 * s, 3 * s);
        }

        function drawVDoor(x, y, h) {
          const s = TILE / 16;
          const doorTileImg = sprites['outdoor_cobblestone_pavement'] || sprites['floor_pathway_stone_brick'];
          if (doorTileImg) {
            ctx.fillStyle = ctx.createPattern(doorTileImg, 'repeat');
          } else {
            ctx.fillStyle = '#334155';
          }
          ctx.fillRect(x - 5 * s, y, 10 * s, h);
          ctx.fillStyle = '#475569';
          ctx.fillRect(x - 2 * s, y, 4 * s, h);
          ctx.strokeStyle = '#1e293b';
          ctx.lineWidth = 1 * s;
          ctx.strokeRect(x - 2 * s, y, 4 * s, h);
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(x - 6 * s, y - 3 * s, 12 * s, 5 * s);
          ctx.fillRect(x - 6 * s, y + h - 2 * s, 12 * s, 5 * s);
          ctx.fillStyle = '#64748b';
          ctx.fillRect(x - 5 * s, y - 2 * s, 3 * s, 3 * s);
          ctx.fillRect(x - 5 * s, y + h - 1 * s, 3 * s, 3 * s);
        }

        // 7. Heavy Exterior Building Walls
        const wallS = TILE / 16;
        ctx.lineWidth = 8 * wallS;
        ctx.strokeStyle = '#0f172a';
        ctx.beginPath();
        ctx.roundRect(bx, by, bw, bh, 6 * wallS);
        ctx.stroke();

        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(bx - 4 * wallS, by - 4 * wallS, bw + 8 * wallS, 8 * wallS);

        // Main Entrance Gate
        const gateX = 52 * TILE;
        const gateY = by + bh;
        const gateW = 4 * TILE;
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(gateX, gateY - 6 * wallS, gateW, 14 * wallS);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold ' + Math.round(10.5 * wallS) + 'px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('▼ MAIN ENTRANCE', gateX + gateW / 2, gateY + 22 * wallS);

        window.mapRenderComplete = true;
      }

      renderScene();
    </script>
  </body>
  </html>
  `;

  await page.setContent(htmlContent);
  await page.waitForFunction(() => window.mapRenderComplete === true, { timeout: 15000 });
  await new Promise(r => setTimeout(r, 600));

  const outBlueprint = path.join(projectRoot, 'client', 'assets', 'office_master_blueprint.png');
  await page.screenshot({ path: outBlueprint });
  console.log('Saved Phase 2 master blueprint to', outBlueprint);

  const meta = {
    mapSize: { width: CANVAS_WIDTH, height: CANVAS_HEIGHT, tilesX: MAP_WIDTH_TILES, tilesY: MAP_HEIGHT_TILES, tileSize: TILE_SIZE },
    rooms: ROOMS,
    spawn: { x: 51 * TILE_SIZE, y: 66 * TILE_SIZE }
  };
  fs.writeFileSync(path.join(projectRoot, 'client', 'assets', 'map_metadata.json'), JSON.stringify(meta, null, 2));
  console.log('Saved assets/map_metadata.json');

  await browser.close();
})();
