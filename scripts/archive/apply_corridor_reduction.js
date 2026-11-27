const fs = require('fs');
const path = require('path');

// 1. Read build_master_map.js
let bmap = fs.readFileSync(path.join(__dirname, 'build_master_map.js'), 'utf8');

// A. Replace ROOMS definition
const oldRoomsRegex = /const ROOMS = \[[\s\S]*?\n\];/;
const newRooms = `const ROOMS = [
  {
    id: "reception",
    num: "1",
    name: "SẢNH LỄ TÂN",
    sub: "Reception Lobby • Welcome & Spawn",
    x: 40, y: 52, w: 23, h: 18,
    isDetailedPixelArt: true,
    accent: "#2563eb",
    door: { x: 49, y: 52, w: 4 },
    spawn: { x: 51 * TILE_SIZE, y: 63 * TILE_SIZE }
  },
  {
    id: "central_lounge",
    num: "2",
    name: "TIẾP KHÁCH & NGHỈ NGƠI TRUNG TÂM",
    sub: "Central Lounge • Social Hub",
    x: 40, y: 29, w: 23, h: 18,
    isDetailedPixelArt: true,
    accent: "#b45309",
    doors: [
      { x: 49, y: 47, w: 4 }, // south to avenue (5 tiles wide)
      { x: 49, y: 29, w: 4 }, // north to avenue (5 tiles wide)
      { x: 40, y: 35, w: 3 }, // west to west avenue
      { x: 63, y: 35, w: 3 }  // east to east avenue
    ]
  },
  {
    id: "zen_garden",
    num: "3",
    name: "VƯỜN TIỂU CẢNH & HỒ CÁ KOI",
    sub: "Indoor Zen Garden & Koi Pond",
    x: 21, y: 29, w: 14, h: 18,
    isDetailedPixelArt: true,
    accent: "#059669",
    hasPond: true,
    doors: [
      { x: 21, y: 35, w: 3 },
      { x: 35, y: 35, w: 3 },
      { x: 26, y: 47, w: 4 }
    ]
  },
  {
    id: "open_workspace",
    num: "4",
    name: "KHU VỰC LÀM VIỆC CHUNG (TEAM)",
    sub: "Open Team Workspace • Dev / Design / Marketing",
    x: 7, y: 52, w: 28, h: 18,
    isDetailedPixelArt: true,
    accent: "#475569",
    doors: [
      { x: 27, y: 52, w: 4 },
      { x: 35, y: 59, w: 3 }
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
    x: 7, y: 29, w: 11, h: 18,
    isDetailedPixelArt: true,
    accent: "#0284c7",
    doors: [
      { x: 18, y: 35, w: 3 },
      { x: 11, y: 29, w: 3 }
    ]
  },
  {
    id: "private_office_1",
    num: "7A",
    name: "PHÒNG RIÊNG 1 (CEO)",
    sub: "Executive Suite 01",
    x: 68, y: 7, w: 13, h: 13,
    isDetailedPixelArt: true,
    accent: "#c2410c",
    doors: [{ x: 73, y: 20, w: 3 }]
  },
  {
    id: "private_office_2",
    num: "7B",
    name: "PHÒNG RIÊNG 2 (DIRECTOR)",
    sub: "Executive Suite 02",
    x: 85, y: 7, w: 13, h: 13,
    isDetailedPixelArt: true,
    accent: "#2563eb",
    doors: [{ x: 90, y: 20, w: 3 }]
  },
  {
    id: "private_office_3",
    num: "7C",
    name: "PHÒNG RIÊNG 3 (MANAGER)",
    sub: "Focus Studio 01",
    x: 68, y: 24, w: 13, h: 13,
    isDetailedPixelArt: true,
    accent: "#d97706",
    doors: [{ x: 73, y: 37, w: 3 }]
  },
  {
    id: "private_office_4",
    num: "7D",
    name: "PHÒNG RIÊNG 4 (FOCUS POD)",
    sub: "Focus Studio 02",
    x: 85, y: 24, w: 13, h: 13,
    isDetailedPixelArt: true,
    accent: "#7c3aed",
    doors: [{ x: 90, y: 37, w: 3 }]
  },
  {
    id: "library_room",
    num: "8",
    name: "PHÒNG ĐỌC SÁCH & THẢO LUẬN",
    sub: "Library & Quiet Discussion Room",
    x: 68, y: 40, w: 30, h: 13,
    isDetailedPixelArt: true,
    accent: "#334155",
    doors: [
      { x: 68, y: 44, w: 3 },
      { x: 81, y: 40, w: 3 }
    ]
  },
  {
    id: "quiet_lounge",
    num: "9",
    name: "PHÒNG THƯ GIÃN & TIẾP KHÁCH NHỎ",
    sub: "Quiet Relaxation Room • Acoustic Lounge",
    x: 68, y: 56, w: 30, h: 15,
    isDetailedPixelArt: true,
    accent: "#4338ca",
    doors: [
      { x: 68, y: 61, w: 3 },
      { x: 81, y: 56, w: 3 }
    ]
  },
  {
    id: "pantry_bar",
    num: "10",
    name: "QUẦY PANTRY & CAFE",
    sub: "Coffee Bar & Beverage Station",
    x: 40, y: 7, w: 10, h: 17,
    isDetailedPixelArt: true,
    accent: "#0284c7",
    doors: [
      { x: 43, y: 24, w: 3 },
      { x: 50, y: 14, w: 3 }
    ]
  },
  {
    id: "cafeteria_dining",
    num: "11",
    name: "PHÒNG ĂN (CAFETERIA)",
    sub: "Communal Dining & Lunch Area",
    x: 52, y: 7, w: 11, h: 17,
    isDetailedPixelArt: true,
    accent: "#ea580c",
    doors: [
      { x: 52, y: 14, w: 3 },
      { x: 55, y: 24, w: 3 }
    ]
  }
];`;
bmap = bmap.replace(oldRoomsRegex, newRooms);

// B. Replace Grand Boulevard Carpet Runners
const oldCarpetRegex = /\/\/ Grand Boulevard Carpet Runners[\s\S]*?\/\/ 3\. Render All Rooms Floors/;
const newCarpet = `// Grand Boulevard Carpet Runners (Cozy 5-tile / 160px corridors)
        // North Avenue (y: 24..29)
        ctx.fillStyle = 'rgba(59, 130, 246, 0.05)';
        ctx.fillRect(7 * TILE, 24 * TILE, 91 * TILE, 5 * TILE);
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.12)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(7 * TILE, 26.5 * TILE);
        ctx.lineTo(98 * TILE, 26.5 * TILE);
        ctx.stroke();

        // South Avenue (y: 47..52)
        ctx.fillStyle = 'rgba(59, 130, 246, 0.05)';
        ctx.fillRect(7 * TILE, 47 * TILE, 91 * TILE, 5 * TILE);
        ctx.beginPath();
        ctx.moveTo(7 * TILE, 49.5 * TILE);
        ctx.lineTo(98 * TILE, 49.5 * TILE);
        ctx.stroke();

        // West Avenue (x: 35..40, 5 tiles wide)
        ctx.fillStyle = 'rgba(59, 130, 246, 0.06)';
        ctx.fillRect(35 * TILE, 5 * TILE, 5 * TILE, 66 * TILE);

        // East Avenue (x: 63..68, 5 tiles wide)
        ctx.fillRect(63 * TILE, 5 * TILE, 5 * TILE, 66 * TILE);

        // 3. Render All Rooms Floors`;
bmap = bmap.replace(oldCarpetRegex, newCarpet);

// C. Section 5 Pantry Bar (delta y = +2)
const oldPantryRegex = /\/\/ 5\. FURNITURE PASS FOR KHU 10 \(PANTRY BAR & CAFE\)[\s\S]*?\/\/ 6\. FURNITURE PASS FOR KHU 1 \(RECEPTION LOBBY\)/;
const newPantry = `// 5. FURNITURE PASS FOR KHU 10 (PANTRY BAR & CAFE)
        {
          // A. North Wall Backdrop (y = 7)
          drawSprite('menu_board_1x2', 41 * TILE, 7 * TILE, 16, 32);
          drawSprite('wall_clock', 44 * TILE, 7 * TILE + 2, 16, 16);
          drawSprite('plant_hanging', 46 * TILE, 7 * TILE, 16, 16);
          drawSprite('fridge_1x2', 48 * TILE, 7 * TILE, 16, 32);

          // B. Coffee Bar Counter (along y = 10)
          drawSprite('counter_l', 41 * TILE, 10 * TILE, 16, 16);
          drawSprite('counter_m', 42 * TILE, 10 * TILE, 16, 16);
          drawSprite('counter_m', 43 * TILE, 10 * TILE, 16, 16);
          drawSprite('counter_m', 44 * TILE, 10 * TILE, 16, 16);
          drawSprite('counter_m', 45 * TILE, 10 * TILE, 16, 16);
          drawSprite('counter_corner_r', 46 * TILE, 10 * TILE, 16, 16);

          // C. Countertop Equipment & Supplies
          drawSprite('espresso_machine', 42 * TILE, 9.8 * TILE, 16, 16);
          drawSprite('coffee_cup', 43 * TILE, 9.8 * TILE, 16, 16);
          drawSprite('plate_pastry', 44 * TILE, 9.8 * TILE, 16, 16);
          drawSprite('cash_register', 45 * TILE, 9.8 * TILE, 16, 16);
          drawSprite('tip_jar', 46 * TILE, 9.8 * TILE, 16, 16);

          // D. Customer Bar Stools
          drawSprite('stool', 42 * TILE, 12 * TILE, 16, 16);
          drawSprite('stool', 44 * TILE, 12 * TILE, 16, 16);
          drawSprite('stool', 46 * TILE, 12 * TILE, 16, 16);

          // E. Corner Trash Bin
          drawSprite('trash_bin', 48 * TILE, 11 * TILE, 16, 16);

          // F. Lower Bistro Table & Chair
          drawSprite('table_round', 42 * TILE, 17.5 * TILE, 16, 16);
          drawSprite('chair_front_red', 42 * TILE, 18.8 * TILE, 16, 16);
          drawSprite('mug', 42.2 * TILE, 17.2 * TILE, 16, 16);
          drawSprite('plant_floor', 41 * TILE, 21 * TILE, 16, 16);

          // Stylish Room Badge Pill (Pantry Bar)
          const pBadgeX = 41.5 * TILE;
          const pBadgeY = 14.8 * TILE;
          const pBadgeW = 128;
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
          ctx.font = 'bold 9px sans-serif';
          ctx.textAlign = 'left';
          ctx.fillText('QUẦY PANTRY & CAFE', pBadgeX + 24, pBadgeY + 12);
        }

        // 6. FURNITURE PASS FOR KHU 1 (RECEPTION LOBBY)`;
bmap = bmap.replace(oldPantryRegex, newPantry);

// D. Section 6 Reception Lobby (delta y = -3)
const oldReceptionRegex = /\/\/ 6\. FURNITURE PASS FOR KHU 1 \(RECEPTION LOBBY\)[\s\S]*?\/\/ 7\. FURNITURE PASS FOR KHU 11 \(CAFETERIA DINING\)/;
const newReception = `// 6. FURNITURE PASS FOR KHU 1 (RECEPTION LOBBY)
        {
          // A. Main Entrance Door Mat & Guide (y = 69)
          drawSprite('door_mat', 51 * TILE, 69 * TILE, 16, 16);
          drawSprite('door_mat', 52 * TILE, 69 * TILE, 16, 16);
          drawSprite('menu_stand', 48 * TILE, 68 * TILE, 16, 16);
          drawSprite('plant_floor', 47 * TILE, 68 * TILE, 16, 16);
          drawSprite('plant_floor', 56 * TILE, 68 * TILE, 16, 16);

          // B. Central Reception Desk (facing South, y = 58)
          drawSprite('counter_l', 49 * TILE, 58 * TILE, 16, 16);
          drawSprite('counter_m', 50 * TILE, 58 * TILE, 16, 16);
          drawSprite('counter_m', 51 * TILE, 58 * TILE, 16, 16);
          drawSprite('counter_m', 52 * TILE, 58 * TILE, 16, 16);
          drawSprite('counter_r', 53 * TILE, 58 * TILE, 16, 16);

          // Receptionist Equipment & Supplies
          drawSprite('cash_register', 50 * TILE, 57.8 * TILE, 16, 16);
          drawSprite('open_book', 51 * TILE, 57.8 * TILE, 16, 16);
          drawSprite('cactus', 52 * TILE, 57.8 * TILE, 16, 16);
          drawSprite('coffee_cup', 53 * TILE, 57.8 * TILE, 16, 16);
          drawSprite('chair_front_blue', 51 * TILE, 56.8 * TILE, 16, 16);

          // C. West Guest Waiting Lounge
          drawSprite('sofa_2x1_plum', 43 * TILE, 60 * TILE, 32, 16);
          drawSprite('table_low_1x1', 44 * TILE, 62 * TILE, 16, 16);
          drawSprite('book_stack', 44 * TILE, 61.8 * TILE, 16, 16);
          drawSprite('chair_front_mustard', 42.5 * TILE, 63 * TILE, 16, 16);
          drawSprite('chair_front_red', 45.5 * TILE, 63 * TILE, 16, 16);
          drawSprite('lamp_floor', 42 * TILE, 60 * TILE, 16, 16);
          drawSprite('plant_floor', 46 * TILE, 60 * TILE, 16, 16);

          // D. East Information & Awards Display
          drawSprite('bookshelf_2x2_a', 59 * TILE, 59 * TILE, 32, 32);
          drawSprite('menu_board_1x2', 57 * TILE, 59 * TILE, 16, 32);
          drawSprite('armchair_teal', 56.5 * TILE, 62.5 * TILE, 16, 16);
          drawSprite('table_low_1x1', 58 * TILE, 62.5 * TILE, 16, 16);
          drawSprite('teapot', 58 * TILE, 62.2 * TILE, 16, 16);
          drawSprite('plant_floor', 61 * TILE, 61 * TILE, 16, 16);

          // Stylish Room Badge Pill (Reception)
          const rBadgeX = 47 * TILE;
          const rBadgeY = 53.5 * TILE;
          const rBadgeW = 125;
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

        // 7. FURNITURE PASS FOR KHU 11 (CAFETERIA DINING)`;
bmap = bmap.replace(oldReceptionRegex, newReception);

// E. Section 7 Cafeteria Dining (delta y = +2)
const oldCafeteriaRegex = /\/\/ 7\. FURNITURE PASS FOR KHU 11 \(CAFETERIA DINING\)[\s\S]*?\/\/ 8\. FURNITURE PASS FOR KHU 8 \(LIBRARY & QUIET DISCUSSION ROOM\)/;
const newCafeteria = `// 7. FURNITURE PASS FOR KHU 11 (CAFETERIA DINING)
        {
          // A. Kitchen Back Counter & Appliances on North Wall (y = 7)
          drawSprite('wall_clock', 53 * TILE, 7 * TILE, 16, 16);
          drawSprite('stove_2x1', 54 * TILE, 7 * TILE, 32, 16);
          drawSprite('sink_unit', 57 * TILE, 7 * TILE, 16, 16);
          drawSprite('trash_bin', 59 * TILE, 7 * TILE, 16, 16);
          drawSprite('picture_frame_b', 60 * TILE, 7 * TILE, 16, 16);

          // B. Communal Dining Table 1 (North Table, y = 10)
          drawSprite('table_rect_2x1', 54 * TILE, 10 * TILE, 32, 16);
          drawSprite('table_rect_2x1', 56 * TILE, 10 * TILE, 32, 16);
          drawSprite('table_rect_2x1', 58 * TILE, 10 * TILE, 32, 16);

          // Chairs for Table 1 (North facing front, South facing back)
          drawSprite('chair_front_blue', 54.5 * TILE, 8.8 * TILE, 16, 16);
          drawSprite('chair_front_red', 56.5 * TILE, 8.8 * TILE, 16, 16);
          drawSprite('chair_front_mustard', 58.5 * TILE, 8.8 * TILE, 16, 16);

          drawSprite('chair_back_blue', 54.5 * TILE, 11.2 * TILE, 16, 16);
          drawSprite('chair_back_red', 56.5 * TILE, 11.2 * TILE, 16, 16);
          drawSprite('chair_back_mustard', 58.5 * TILE, 11.2 * TILE, 16, 16);

          // Food & Drinks on Table 1
          drawSprite('plate_pastry', 55 * TILE, 9.8 * TILE, 16, 16);
          drawSprite('kettle', 57 * TILE, 9.8 * TILE, 16, 16);
          drawSprite('coffee_cup', 59 * TILE, 9.8 * TILE, 16, 16);

          // C. Communal Dining Table 2 (South Table, y = 17)
          drawSprite('table_rect_2x1', 55 * TILE, 17 * TILE, 32, 16);
          drawSprite('table_rect_2x1', 57 * TILE, 17 * TILE, 32, 16);

          // Chairs for Table 2
          drawSprite('chair_front_red', 55.5 * TILE, 15.8 * TILE, 16, 16);
          drawSprite('chair_front_blue', 57.5 * TILE, 15.8 * TILE, 16, 16);
          drawSprite('chair_back_red', 55.5 * TILE, 18.2 * TILE, 16, 16);
          drawSprite('chair_back_blue', 57.5 * TILE, 18.2 * TILE, 16, 16);

          // Teapot on Table 2
          drawSprite('teapot', 56.5 * TILE, 16.8 * TILE, 16, 16);

          // Stylish Room Badge Pill (Cafeteria)
          const cBadgeX = 53 * TILE;
          const cBadgeY = 20.5 * TILE;
          const cBadgeW = 140;
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

        // 8. FURNITURE PASS FOR KHU 8 (LIBRARY & QUIET DISCUSSION ROOM)`;
bmap = bmap.replace(oldCafeteriaRegex, newCafeteria);

// F. Section 8 Library (delta x = -4, delta y = 0)
const oldLibraryRegex = /\/\/ 8\. FURNITURE PASS FOR KHU 8 \(LIBRARY & QUIET DISCUSSION ROOM\)[\s\S]*?\/\/ 9\. FURNITURE PASS FOR KHU 9 \(QUIET LOUNGE & VIP SALON\)/;
const newLibrary = `// 8. FURNITURE PASS FOR KHU 8 (LIBRARY & QUIET DISCUSSION ROOM)
        {
          // A. North Wall Library Bookcase Wall (y = 40)
          // West of North door (x = 69..80)
          drawSprite('bookshelf_2x2_a', 69 * TILE, 40 * TILE, 32, 32);
          drawSprite('bookshelf_2x2_b', 71 * TILE, 40 * TILE, 32, 32);
          drawSprite('bookshelf_2x2_c', 73 * TILE, 40 * TILE, 32, 32);
          drawSprite('picture_frame_a', 76 * TILE, 40 * TILE + 2, 16, 16);
          drawSprite('wall_clock', 78 * TILE, 40 * TILE + 2, 16, 16);
          drawSprite('plant_floor', 80 * TILE, 41 * TILE, 16, 16);

          // East of North door (x = 85..97)
          drawSprite('plant_floor', 85 * TILE, 41 * TILE, 16, 16);
          drawSprite('picture_frame_b', 87 * TILE, 40 * TILE + 2, 16, 16);
          drawSprite('bookshelf_2x2_a', 89 * TILE, 40 * TILE, 32, 32);
          drawSprite('bookshelf_2x2_b', 91 * TILE, 40 * TILE, 32, 32);
          drawSprite('bookshelf_tall_1x2', 93 * TILE, 40 * TILE, 16, 32);
          drawSprite('bookshelf_2x2_c', 95 * TILE, 40 * TILE, 32, 32);

          // B. Group Discussion Table (Center-West, y = 46)
          drawSprite('table_rect_2x1', 73 * TILE, 46 * TILE, 32, 16);
          drawSprite('table_rect_2x1', 75 * TILE, 46 * TILE, 32, 16);
          drawSprite('table_rect_2x1', 77 * TILE, 46 * TILE, 32, 16);

          // North chairs
          drawSprite('chair_front_blue', 73.5 * TILE, 44.8 * TILE, 16, 16);
          drawSprite('chair_front_mustard', 75.5 * TILE, 44.8 * TILE, 16, 16);
          drawSprite('chair_front_red', 77.5 * TILE, 44.8 * TILE, 16, 16);

          // South chairs
          drawSprite('chair_back_blue', 73.5 * TILE, 47.2 * TILE, 16, 16);
          drawSprite('chair_back_mustard', 75.5 * TILE, 47.2 * TILE, 16, 16);
          drawSprite('chair_back_red', 77.5 * TILE, 47.2 * TILE, 16, 16);

          // Study items on table
          drawSprite('open_book', 73.5 * TILE, 45.8 * TILE, 16, 16);
          drawSprite('book_stack', 75.5 * TILE, 45.8 * TILE, 16, 16);
          drawSprite('coffee_cup', 77.5 * TILE, 45.8 * TILE, 16, 16);

          // C. Quiet Reading Nook (East Area)
          drawRug(87, 46, 6, 4);
          drawSprite('armchair_teal', 88 * TILE, 47 * TILE, 16, 16);
          drawSprite('table_low_1x1', 90 * TILE, 47 * TILE, 16, 16);
          drawSprite('open_book', 90 * TILE, 46.8 * TILE, 16, 16);
          drawSprite('armchair_plum', 92 * TILE, 47 * TILE, 16, 16);
          drawSprite('lamp_floor', 87 * TILE, 46 * TILE, 16, 16);
          drawSprite('book_stack', 91.5 * TILE, 48 * TILE, 16, 16);
          drawSprite('plant_floor', 94 * TILE, 49 * TILE, 16, 16);

          // Stylish Room Badge Pill (Library)
          const lBadgeX = 77 * TILE;
          const lBadgeY = 42 * TILE;
          const lBadgeW = 160;
          const lBadgeH = 24;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.94)';
          ctx.beginPath();
          ctx.roundRect(lBadgeX, lBadgeY, lBadgeW, lBadgeH, 12);
          ctx.fill();
          ctx.strokeStyle = '#334155';
          ctx.lineWidth = 1.2;
          ctx.stroke();

          ctx.fillStyle = '#334155';
          ctx.beginPath();
          ctx.arc(lBadgeX + 12, lBadgeY + 12, 7.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 8.5px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('8', lBadgeX + 12, lBadgeY + 12);

          ctx.fillStyle = '#1e293b';
          ctx.font = 'bold 9px sans-serif';
          ctx.textAlign = 'left';
          ctx.fillText('PHÒNG ĐỌC SÁCH & THẢO LUẬN', lBadgeX + 24, lBadgeY + 12);
        }

        // 9. FURNITURE PASS FOR KHU 9 (QUIET LOUNGE & VIP SALON)`;
bmap = bmap.replace(oldLibraryRegex, newLibrary);

// G. Section 9 Quiet Lounge (delta x = -4, delta y = -2)
const oldLoungeRegex = /\/\/ 9\. FURNITURE PASS FOR KHU 9 \(QUIET LOUNGE & VIP SALON\)[\s\S]*?\/\/ 10\. FURNITURE PASS FOR KHU 5 \(LARGE BOARDROOM \/ CONFERENCE HALL\)/;
const newLounge = `// 9. FURNITURE PASS FOR KHU 9 (QUIET LOUNGE & VIP SALON)
        {
          // A. North Wall Decor (y = 56)
          drawSprite('bookshelf_2x2_c', 70 * TILE, 56 * TILE, 32, 32);
          drawSprite('picture_frame_a', 73 * TILE, 56 * TILE + 2, 16, 16);
          drawSprite('wall_clock', 75 * TILE, 56 * TILE + 2, 16, 16);
          drawSprite('plant_hanging', 77 * TILE, 56 * TILE, 16, 16);
          drawSprite('plant_floor', 79 * TILE, 57 * TILE, 16, 16);

          drawSprite('plant_floor', 85 * TILE, 57 * TILE, 16, 16);
          drawSprite('picture_frame_b', 88 * TILE, 56 * TILE + 2, 16, 16);
          drawSprite('bookshelf_2x2_b', 91 * TILE, 56 * TILE, 32, 32);
          drawSprite('bookshelf_tall_1x2', 94 * TILE, 56 * TILE, 16, 32);

          // B. Main VIP Relaxation Lounge (Center, y = 61..66)
          // Large 10x6 Velvet Rug
          drawRug(77, 61, 10, 6);

          // 3-Seater Plum Sofa (facing South)
          drawSprite('sofa_3x1_plum', 80.5 * TILE, 62 * TILE, 48, 16);

          // Opposing Sofa or Chairs
          drawSprite('sofa_2x1_plum', 81 * TILE, 65.5 * TILE, 32, 16);

          // Armchairs flanking
          drawSprite('armchair_teal', 78 * TILE, 63.5 * TILE, 16, 16);
          drawSprite('armchair_plum', 85 * TILE, 63.5 * TILE, 16, 16);

          // Round Coffee Table with teapot
          drawSprite('table_round', 81.5 * TILE, 63.8 * TILE, 16, 16);
          drawSprite('teapot', 81.5 * TILE, 63.4 * TILE, 16, 16);

          // Warm Ambient Floor Lamps
          drawSprite('lamp_floor', 77 * TILE, 61 * TILE, 16, 16);
          drawSprite('lamp_floor', 86 * TILE, 61 * TILE, 16, 16);
          drawSprite('plant_floor', 76 * TILE, 65 * TILE, 16, 16);
          drawSprite('plant_floor', 87 * TILE, 65 * TILE, 16, 16);

          // C. Cozy West Reading Nook (x = 70..74, y = 63..67)
          drawRug(70, 63, 4, 4);
          drawSprite('armchair_plum', 71 * TILE, 64 * TILE, 16, 16);
          drawSprite('table_low_1x1', 72.5 * TILE, 64 * TILE, 16, 16);
          drawSprite('mug', 72.5 * TILE, 63.8 * TILE, 16, 16);
          drawSprite('plant_floor', 70 * TILE, 66 * TILE, 16, 16);

          // Stylish Room Badge Pill (Quiet Lounge)
          const qBadgeX = 76.5 * TILE;
          const qBadgeY = 58.5 * TILE;
          const qBadgeW = 175;
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
          ctx.font = 'bold 9px sans-serif';
          ctx.textAlign = 'left';
          ctx.fillText('PHÒNG THƯ GIÃN & TIẾP KHÁCH', qBadgeX + 24, qBadgeY + 12);
        }

        // 10. FURNITURE PASS FOR KHU 5 (LARGE BOARDROOM / CONFERENCE HALL)`;
bmap = bmap.replace(oldLoungeRegex, newLounge);

// H. Section 10 Boardroom (delta x = +3, delta y = +2)
const oldBoardroomRegex = /\/\/ 10\. FURNITURE PASS FOR KHU 5 \(LARGE BOARDROOM \/ CONFERENCE HALL\)[\s\S]*?\/\/ 11\. FURNITURE PASS FOR KHU 6 \(SMALL MEETING & INTERVIEW POD\)/;
const newBoardroom = `// 10. FURNITURE PASS FOR KHU 5 (LARGE BOARDROOM / CONFERENCE HALL)
        {
          // A. North Presentation Wall (y = 7)
          drawSprite('menu_board_1x2', 20 * TILE, 7 * TILE, 16, 32);
          drawSprite('menu_board_1x2', 21 * TILE, 7 * TILE, 16, 32);
          drawSprite('wall_clock', 19 * TILE, 7 * TILE + 2, 16, 16);
          drawSprite('picture_frame_a', 17 * TILE, 7 * TILE + 2, 16, 16);
          drawSprite('picture_frame_b', 23 * TILE, 7 * TILE + 2, 16, 16);
          drawSprite('plant_floor', 16 * TILE, 8 * TILE, 16, 16);
          drawSprite('plant_floor', 25 * TILE, 8 * TILE, 16, 16);
          drawSprite('menu_stand', 18.5 * TILE, 9 * TILE, 16, 16);

          // B. Main Boardroom Conference Table (Center, y = 14, x = 17..25)
          drawSprite('table_rect_2x1', 17 * TILE, 14 * TILE, 32, 16);
          drawSprite('table_rect_2x1', 19 * TILE, 14 * TILE, 32, 16);
          drawSprite('table_rect_2x1', 21 * TILE, 14 * TILE, 32, 16);
          drawSprite('table_rect_2x1', 23 * TILE, 14 * TILE, 32, 16);

          // North Conference Chairs
          drawSprite('chair_front_blue', 17.5 * TILE, 12.8 * TILE, 16, 16);
          drawSprite('chair_front_blue', 19.5 * TILE, 12.8 * TILE, 16, 16);
          drawSprite('chair_front_red', 21.5 * TILE, 12.8 * TILE, 16, 16);
          drawSprite('chair_front_blue', 23.5 * TILE, 12.8 * TILE, 16, 16);

          // South Conference Chairs
          drawSprite('chair_back_blue', 17.5 * TILE, 15.2 * TILE, 16, 16);
          drawSprite('chair_back_blue', 19.5 * TILE, 15.2 * TILE, 16, 16);
          drawSprite('chair_back_red', 21.5 * TILE, 15.2 * TILE, 16, 16);
          drawSprite('chair_back_blue', 23.5 * TILE, 15.2 * TILE, 16, 16);

          // Head / Foot of Table (Side chairs)
          drawSprite('chair_side_l_blue', 16 * TILE, 14 * TILE, 16, 16);
          drawSprite('chair_side_r_blue', 25 * TILE, 14 * TILE, 16, 16);

          // Accessories on Conference Table
          drawSprite('open_book', 17.5 * TILE, 13.8 * TILE, 16, 16);
          drawSprite('coffee_cup', 19.5 * TILE, 13.8 * TILE, 16, 16);
          drawSprite('open_book', 21.5 * TILE, 13.8 * TILE, 16, 16);
          drawSprite('mug', 23.5 * TILE, 13.8 * TILE, 16, 16);

          // C. West Refreshment Bar & Credenza (x = 8..10, y = 8..16)
          drawSprite('bookshelf_2x2_a', 8 * TILE, 8 * TILE, 32, 32);
          drawSprite('table_low_1x1', 8 * TILE, 11 * TILE, 16, 16);
          drawSprite('teapot', 8 * TILE, 10.8 * TILE, 16, 16);
          drawSprite('table_low_1x1', 8 * TILE, 12 * TILE, 16, 16);
          drawSprite('plate_pastry', 8 * TILE, 11.8 * TILE, 16, 16);
          drawSprite('trash_bin', 8 * TILE, 14 * TILE, 16, 16);
          drawSprite('lamp_floor', 8 * TILE, 16 * TILE, 16, 16);

          // D. East Executive Break Nook (x = 30..34, y = 8..16)
          drawSprite('bookshelf_2x2_b', 32 * TILE, 8 * TILE, 32, 32);
          drawRug(30, 12, 4, 4);
          drawSprite('armchair_teal', 31 * TILE, 13 * TILE, 16, 16);
          drawSprite('table_low_1x1', 32.5 * TILE, 13 * TILE, 16, 16);
          drawSprite('coffee_cup', 32.5 * TILE, 12.8 * TILE, 16, 16);
          drawSprite('lamp_floor', 30 * TILE, 11 * TILE, 16, 16);
          drawSprite('plant_floor', 33 * TILE, 16 * TILE, 16, 16);

          // Stylish Room Badge Pill (Conference Hall)
          const bBadgeX = 16.5 * TILE;
          const bBadgeY = 10.5 * TILE;
          const bBadgeW = 160;
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

        // 11. FURNITURE PASS FOR KHU 6 (SMALL MEETING & INTERVIEW POD)`;
bmap = bmap.replace(oldBoardroomRegex, newBoardroom);

// I. Section 11 Small Meeting (delta x = +3, delta y = 0)
const oldSmallMeetingRegex = /\/\/ 11\. FURNITURE PASS FOR KHU 6 \(SMALL MEETING & INTERVIEW POD\)[\s\S]*?\/\/ 12\. FURNITURE & LANDSCAPE PASS FOR KHU 3 \(ZEN GARDEN & KOI POND\)/;
const newSmallMeeting = `// 11. FURNITURE PASS FOR KHU 6 (SMALL MEETING & INTERVIEW POD)
        {
          // A. North-West Bookcase & Preparation Corner
          drawSprite('bookshelf_2x2_a', 8 * TILE, 30 * TILE, 32, 32);
          drawSprite('wall_clock', 8 * TILE, 33 * TILE + 2, 16, 16);
          drawSprite('plant_floor', 10 * TILE, 33 * TILE, 16, 16);

          // B. West Wall Interview Details
          drawSprite('picture_frame_a', 8 * TILE, 37 * TILE, 16, 16);
          drawSprite('menu_stand', 8 * TILE, 39 * TILE, 16, 16);
          drawSprite('trash_bin', 8 * TILE, 44 * TILE, 16, 16);
          drawSprite('plant_floor', 15.5 * TILE, 44 * TILE, 16, 16);

          // C. Private Interview & Negotiation Table (South Zone, y = 42)
          drawRug(9, 40, 5, 4);
          drawSprite('table_rect_2x1', 9.5 * TILE, 42 * TILE, 32, 16);
          drawSprite('table_rect_2x1', 11.5 * TILE, 42 * TILE, 32, 16);

          // Mustard Interview Chairs
          drawSprite('chair_front_mustard', 10 * TILE, 40.8 * TILE, 16, 16);
          drawSprite('chair_front_mustard', 12 * TILE, 40.8 * TILE, 16, 16);
          drawSprite('chair_back_mustard', 10 * TILE, 43.2 * TILE, 16, 16);
          drawSprite('chair_back_mustard', 12 * TILE, 43.2 * TILE, 16, 16);

          // Table Items
          drawSprite('open_book', 10 * TILE, 41.8 * TILE, 16, 16);
          drawSprite('kettle', 11.5 * TILE, 41.8 * TILE, 16, 16);
          drawSprite('coffee_cup', 12.5 * TILE, 41.8 * TILE, 16, 16);

          // Stylish Room Badge Pill (Small Meeting Pod)
          const smBadgeX = 7.5 * TILE;
          const smBadgeY = 35 * TILE;
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

        // 12. FURNITURE & LANDSCAPE PASS FOR KHU 3 (ZEN GARDEN & KOI POND)`;
bmap = bmap.replace(oldSmallMeetingRegex, newSmallMeeting);

// J. Section 12 Zen Garden (delta x = +3, delta y = 0)
const oldZenRegex = /\/\/ 12\. FURNITURE & LANDSCAPE PASS FOR KHU 3 \(ZEN GARDEN & KOI POND\)[\s\S]*?\/\/ 13\. FURNITURE PASS FOR KHU 4 \(OPEN WORKSPACE \/ COWORKING\)/;
const newZen = `// 12. FURNITURE & LANDSCAPE PASS FOR KHU 3 (ZEN GARDEN & KOI POND)
        {
          const s = TILE / 16;
          // A. Central Koi Pond (x: 24..32, y: 33..43)
          const px = 24 * TILE;
          const py = 33 * TILE;
          const pw = 8 * TILE;
          const ph = 10 * TILE;

          // Outer Rock Border
          ctx.fillStyle = '#1e293b';
          ctx.beginPath();
          ctx.roundRect(px - 5 * s, py - 5 * s, pw + 10 * s, ph + 10 * s, 16 * s);
          ctx.fill();

          // Inner Stone Curb Lip
          ctx.fillStyle = '#475569';
          ctx.beginPath();
          ctx.roundRect(px - 2 * s, py - 2 * s, pw + 4 * s, ph + 4 * s, 14 * s);
          ctx.fill();

          // Crystal Water Basin (Turquoise to Deep Blue gradient)
          const waterGrad = ctx.createLinearGradient(px, py, px + pw, py + ph);
          waterGrad.addColorStop(0, '#0d9488');
          waterGrad.addColorStop(0.4, '#0284c7');
          waterGrad.addColorStop(1, '#0369a1');
          ctx.fillStyle = waterGrad;
          ctx.beginPath();
          ctx.roundRect(px, py, pw, ph, 12 * s);
          ctx.fill();

          // Water Ripples
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
          ctx.lineWidth = 1.2 * s;
          ctx.beginPath();
          ctx.arc(px + pw * 0.35, py + ph * 0.35, 14 * s, 0, Math.PI * 2);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(px + pw * 0.65, py + ph * 0.65, 18 * s, 0, Math.PI * 2);
          ctx.stroke();

          // Lily Pads & Lotus Flowers
          // Lily Pad 1
          ctx.fillStyle = '#10b981';
          ctx.beginPath();
          ctx.arc(px + pw * 0.28, py + ph * 0.3, 8 * s, 0, Math.PI * 2);
          ctx.fill();
          // Lotus Flower 1
          ctx.fillStyle = '#f472b6';
          ctx.beginPath();
          ctx.arc(px + pw * 0.28, py + ph * 0.3, 3.5 * s, 0, Math.PI * 2);
          ctx.fill();

          // Lily Pad 2
          ctx.fillStyle = '#059669';
          ctx.beginPath();
          ctx.arc(px + pw * 0.72, py + ph * 0.68, 10 * s, 0, Math.PI * 2);
          ctx.fill();
          // Lotus Flower 2
          ctx.fillStyle = '#fb7185';
          ctx.beginPath();
          ctx.arc(px + pw * 0.72, py + ph * 0.68, 4 * s, 0, Math.PI * 2);
          ctx.fill();

          // Japanese Swimming Koi Fish
          // Fish 1 (Orange Kohaku Koi swimming upwards)
          ctx.fillStyle = '#ea580c';
          ctx.beginPath();
          ctx.ellipse(px + pw * 0.45, py + ph * 0.5, 10 * s, 4.5 * s, -Math.PI / 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.ellipse(px + pw * 0.43, py + ph * 0.48, 5 * s, 2.5 * s, -Math.PI / 4, 0, Math.PI * 2);
          ctx.fill();

          // Fish 2 (Golden Ogon Koi swimming downwards)
          ctx.fillStyle = '#f59e0b';
          ctx.beginPath();
          ctx.ellipse(px + pw * 0.58, py + ph * 0.38, 9 * s, 4 * s, Math.PI / 6, 0, Math.PI * 2);
          ctx.fill();

          // Fish 3 (Calico Showa Koi)
          ctx.fillStyle = '#c2410c';
          ctx.beginPath();
          ctx.ellipse(px + pw * 0.38, py + ph * 0.72, 8 * s, 3.5 * s, Math.PI / 3, 0, Math.PI * 2);
          ctx.fill();

          // B. Contemplation & Tea Drinking Areas
          // North-West Tea Nook
          drawSprite('armchair_teal', 22 * TILE, 30 * TILE, 16, 16);
          drawSprite('table_low_1x1', 23 * TILE, 30 * TILE, 16, 16);
          drawSprite('teapot', 23 * TILE, 29.8 * TILE, 16, 16);
          drawSprite('lamp_floor', 22 * TILE, 31.5 * TILE, 16, 16);

          // North-East Rest Area
          drawSprite('armchair_plum', 33 * TILE, 30 * TILE, 16, 16);
          drawSprite('table_low_1x1', 32 * TILE, 30 * TILE, 16, 16);
          drawSprite('coffee_cup', 32 * TILE, 29.8 * TILE, 16, 16);
          drawSprite('plant_floor', 33 * TILE, 31.5 * TILE, 16, 16);

          // South-West Green Oasis
          drawSprite('plant_floor', 22 * TILE, 44 * TILE, 16, 16);
          drawSprite('cactus', 23 * TILE, 44 * TILE, 16, 16);
          drawSprite('plant_floor', 22 * TILE, 45.5 * TILE, 16, 16);

          // South-East Zen Lantern Nook
          drawSprite('plant_floor', 33 * TILE, 44 * TILE, 16, 16);
          drawSprite('lamp_floor', 32 * TILE, 45.5 * TILE, 16, 16);
          drawSprite('cactus', 33 * TILE, 45.5 * TILE, 16, 16);

          // Hanging Plants on North Wall
          drawSprite('plant_hanging', 27 * TILE, 29 * TILE, 16, 16);
          drawSprite('plant_hanging', 29 * TILE, 29 * TILE, 16, 16);

          // Stylish Room Badge Pill (Zen Garden)
          const zBadgeX = 21.5 * TILE;
          const zBadgeY = 32 * TILE;
          const zBadgeW = 150;
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

        // 13. FURNITURE PASS FOR KHU 4 (OPEN WORKSPACE / COWORKING)`;
bmap = bmap.replace(oldZenRegex, newZen);

// K. Section 13 Open Workspace (delta x = +3, delta y = -3)
const oldWorkspaceRegex = /\/\/ 13\. FURNITURE PASS FOR KHU 4 \(OPEN WORKSPACE \/ COWORKING\)[\s\S]*?\/\/ 14\. FURNITURE PASS FOR KHU 7A, 7B, 7C, 7D \(PRIVATE OFFICES & FOCUS PODS\)/;
const newWorkspace = `// 13. FURNITURE PASS FOR KHU 4 (OPEN WORKSPACE / COWORKING)
        {
          // A. North Wall Agile Sprint Boards & Utilities (y = 52)
          drawSprite('picture_frame_a', 9 * TILE, 52 * TILE + 2, 16, 16);
          drawSprite('menu_board_1x2', 11 * TILE, 52 * TILE, 16, 32);
          drawSprite('menu_board_1x2', 12 * TILE, 52 * TILE, 16, 32);
          drawSprite('wall_clock', 14 * TILE, 52 * TILE + 2, 16, 16);
          drawSprite('picture_frame_b', 16 * TILE, 52 * TILE + 2, 16, 16);
          drawSprite('bookshelf_2x2_c', 18 * TILE, 52 * TILE, 32, 32);

          // B. Cluster 1: Dev Engineering Team Pod (x = 10..16, y = 57)
          drawSprite('table_rect_2x1', 10 * TILE, 57 * TILE, 32, 16);
          drawSprite('table_rect_2x1', 12 * TILE, 57 * TILE, 32, 16);
          drawSprite('table_rect_2x1', 14 * TILE, 57 * TILE, 32, 16);

          // North Chairs
          drawSprite('chair_front_blue', 10.5 * TILE, 55.8 * TILE, 16, 16);
          drawSprite('chair_front_blue', 12.5 * TILE, 55.8 * TILE, 16, 16);
          drawSprite('chair_front_blue', 14.5 * TILE, 55.8 * TILE, 16, 16);

          // South Chairs
          drawSprite('chair_back_blue', 10.5 * TILE, 58.2 * TILE, 16, 16);
          drawSprite('chair_back_blue', 12.5 * TILE, 58.2 * TILE, 16, 16);
          drawSprite('chair_back_blue', 14.5 * TILE, 58.2 * TILE, 16, 16);

          // Side Chairs (Lead Engineers)
          drawSprite('chair_side_l_blue', 9 * TILE, 57 * TILE, 16, 16);
          drawSprite('chair_side_r_blue', 16 * TILE, 57 * TILE, 16, 16);

          // Dev Desks Items (Laptops, coffee, books)
          drawSprite('open_book', 10.5 * TILE, 56.8 * TILE, 16, 16);
          drawSprite('mug', 12 * TILE, 56.8 * TILE, 16, 16);
          drawSprite('book_stack', 13 * TILE, 56.8 * TILE, 16, 16);
          drawSprite('coffee_cup', 14.5 * TILE, 56.8 * TILE, 16, 16);

          // C. Cluster 2: Design & Marketing Pod (x = 10..16, y = 65)
          drawSprite('table_rect_2x1', 10 * TILE, 65 * TILE, 32, 16);
          drawSprite('table_rect_2x1', 12 * TILE, 65 * TILE, 32, 16);
          drawSprite('table_rect_2x1', 14 * TILE, 65 * TILE, 32, 16);

          // North Chairs
          drawSprite('chair_front_red', 10.5 * TILE, 63.8 * TILE, 16, 16);
          drawSprite('chair_front_red', 12.5 * TILE, 63.8 * TILE, 16, 16);
          drawSprite('chair_front_red', 14.5 * TILE, 63.8 * TILE, 16, 16);

          // South Chairs
          drawSprite('chair_back_red', 10.5 * TILE, 66.2 * TILE, 16, 16);
          drawSprite('chair_back_red', 12.5 * TILE, 66.2 * TILE, 16, 16);
          drawSprite('chair_back_red', 14.5 * TILE, 66.2 * TILE, 16, 16);

          // Side Chairs
          drawSprite('chair_side_l_red', 9 * TILE, 65 * TILE, 16, 16);
          drawSprite('chair_side_r_red', 16 * TILE, 65 * TILE, 16, 16);

          // Design Items
          drawSprite('coffee_cup', 10.5 * TILE, 64.8 * TILE, 16, 16);
          drawSprite('open_book', 12 * TILE, 64.8 * TILE, 16, 16);
          drawSprite('plate_pastry', 13 * TILE, 64.8 * TILE, 16, 16);
          drawSprite('open_book', 14.5 * TILE, 64.8 * TILE, 16, 16);

          // D. Cluster 3: Collaboration & Sprint Island (x = 21..25, y = 64)
          drawSprite('table_rect_2x1', 21 * TILE, 64 * TILE, 32, 16);
          drawSprite('table_rect_2x1', 23 * TILE, 64 * TILE, 32, 16);

          // Chairs
          drawSprite('chair_front_mustard', 21.5 * TILE, 62.8 * TILE, 16, 16);
          drawSprite('chair_front_mustard', 23.5 * TILE, 62.8 * TILE, 16, 16);
          drawSprite('chair_back_mustard', 21.5 * TILE, 65.2 * TILE, 16, 16);
          drawSprite('chair_back_mustard', 23.5 * TILE, 65.2 * TILE, 16, 16);

          // Items
          drawSprite('teapot', 21.5 * TILE, 63.8 * TILE, 16, 16);
          drawSprite('book_stack', 23.5 * TILE, 63.8 * TILE, 16, 16);

          // E. Perimeter Plants, Bins & Lighting
          drawSprite('trash_bin', 8 * TILE, 59 * TILE, 16, 16);
          drawSprite('trash_bin', 8 * TILE, 67 * TILE, 16, 16);
          drawSprite('plant_floor', 8 * TILE, 53 * TILE, 16, 16);
          drawSprite('plant_floor', 17 * TILE, 68 * TILE, 16, 16);
          drawSprite('plant_floor', 26 * TILE, 68 * TILE, 16, 16);
          drawSprite('lamp_floor', 20 * TILE, 53 * TILE, 16, 16);

          // Stylish Room Badge Pill (Open Workspace)
          const wBadgeX = 21 * TILE;
          const wBadgeY = 54.5 * TILE;
          const wBadgeW = 165;
          const wBadgeH = 24;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.94)';
          ctx.beginPath();
          ctx.roundRect(wBadgeX, wBadgeY, wBadgeW, wBadgeH, 12);
          ctx.fill();
          ctx.strokeStyle = '#475569';
          ctx.lineWidth = 1.2;
          ctx.stroke();

          ctx.fillStyle = '#475569';
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
          ctx.fillText('KHÔNG GIAN LÀM VIỆC MỞ', wBadgeX + 24, wBadgeY + 12);
        }

        // 14. FURNITURE PASS FOR KHU 7A, 7B, 7C, 7D (PRIVATE OFFICES & FOCUS PODS)`;
bmap = bmap.replace(oldWorkspaceRegex, newWorkspace);

// L. Section 14 Private Offices (delta x = -4, delta y = +2)
const oldOfficesRegex = /\/\/ 14\. FURNITURE PASS FOR KHU 7A, 7B, 7C, 7D \(PRIVATE OFFICES & FOCUS PODS\)[\s\S]*?\/\/ 15\. RENDER ALL WALLS & DOORWAYS PASS/;
const newOffices = `// 14. FURNITURE PASS FOR KHU 7A, 7B, 7C, 7D (PRIVATE OFFICES & FOCUS PODS)
        {
          // --- KHU 7A: PHÒNG TỔNG GIÁM ĐỐC / CEO SUITE (x: 68..81, y: 7..20) ---
          // North Wall Decor & Bookshelf
          drawSprite('bookshelf_2x2_b', 77 * TILE, 7 * TILE, 32, 32);
          drawSprite('wall_clock', 74 * TILE, 7 * TILE + 2, 16, 16);
          drawSprite('picture_frame_a', 70 * TILE, 7 * TILE + 2, 16, 16);
          drawSprite('plant_floor', 69 * TILE, 8 * TILE, 16, 16);

          // Executive CEO Desk & Chairs
          drawSprite('table_rect_2x1', 71.5 * TILE, 12 * TILE, 32, 16);
          drawSprite('table_rect_2x1', 73.5 * TILE, 12 * TILE, 32, 16);
          drawSprite('chair_front_red', 73.5 * TILE, 10.8 * TILE, 16, 16); // CEO Chair
          drawSprite('chair_back_red', 72.5 * TILE, 13.2 * TILE, 16, 16); // Guest 1
          drawSprite('chair_back_red', 74.5 * TILE, 13.2 * TILE, 16, 16); // Guest 2
          drawSprite('open_book', 72.5 * TILE, 11.8 * TILE, 16, 16);
          drawSprite('teapot', 74.5 * TILE, 11.8 * TILE, 16, 16);

          // Peripherals
          drawSprite('trash_bin', 69 * TILE, 18 * TILE, 16, 16);
          drawSprite('lamp_floor', 79 * TILE, 18 * TILE, 16, 16);

          // Room Badge Pill 7A
          const aBadgeX = 69 * TILE;
          const aBadgeY = 9.5 * TILE;
          const aBadgeW = 115;
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

          // --- KHU 7B: PHÒNG GIÁM ĐỐC KỸ THUẬT / DIRECTOR SUITE (x: 85..98, y: 7..20) ---
          // North Wall Strategy Board & Bookcase
          drawSprite('menu_board_1x2', 86 * TILE, 7 * TILE, 16, 32);
          drawSprite('picture_frame_b', 90 * TILE, 7 * TILE + 2, 16, 16);
          drawSprite('wall_clock', 92 * TILE, 7 * TILE + 2, 16, 16);
          drawSprite('bookshelf_tall_1x2', 95 * TILE, 7 * TILE, 16, 32);
          drawSprite('trash_bin', 96 * TILE, 9 * TILE, 16, 16);

          // Tech Director Desk & Chairs
          drawSprite('table_rect_2x1', 88.5 * TILE, 12 * TILE, 32, 16);
          drawSprite('table_rect_2x1', 90.5 * TILE, 12 * TILE, 32, 16);
          drawSprite('chair_front_blue', 90.5 * TILE, 10.8 * TILE, 16, 16); // Director Chair
          drawSprite('chair_back_blue', 89.5 * TILE, 13.2 * TILE, 16, 16); // Guest 1
          drawSprite('chair_back_blue', 91.5 * TILE, 13.2 * TILE, 16, 16); // Guest 2
          drawSprite('book_stack', 89.5 * TILE, 11.8 * TILE, 16, 16);
          drawSprite('mug', 91.5 * TILE, 11.8 * TILE, 16, 16);

          // Peripherals
          drawSprite('lamp_floor', 86 * TILE, 18 * TILE, 16, 16);
          drawSprite('plant_floor', 96 * TILE, 18 * TILE, 16, 16);

          // Room Badge Pill 7B
          const bBadgeX = 86 * TILE;
          const bBadgeY = 9.5 * TILE;
          const bBadgeW = 120;
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

          // --- KHU 7C: PHÒNG QUẢN LÝ DỰ ÁN / MANAGER STUDIO (x: 68..81, y: 24..37) ---
          // North Wall & Bookcase
          drawSprite('bookshelf_2x2_a', 77 * TILE, 24 * TILE, 32, 32);
          drawSprite('wall_clock', 71 * TILE, 24 * TILE + 2, 16, 16);
          drawSprite('cactus', 69 * TILE, 24 * TILE + 2, 16, 16);
          drawSprite('menu_stand', 69 * TILE, 27 * TILE, 16, 16);

          // Project Manager Desk & Chairs
          drawSprite('table_rect_2x1', 71.5 * TILE, 29 * TILE, 32, 16);
          drawSprite('table_rect_2x1', 73.5 * TILE, 29 * TILE, 32, 16);
          drawSprite('chair_front_mustard', 73.5 * TILE, 27.8 * TILE, 16, 16); // Manager Chair
          drawSprite('chair_back_mustard', 72.5 * TILE, 30.2 * TILE, 16, 16); // Guest 1
          drawSprite('chair_back_mustard', 74.5 * TILE, 30.2 * TILE, 16, 16); // Guest 2
          drawSprite('open_book', 72.5 * TILE, 28.8 * TILE, 16, 16);
          drawSprite('coffee_cup', 74.5 * TILE, 28.8 * TILE, 16, 16);

          // Peripherals
          drawSprite('plant_floor', 69 * TILE, 35 * TILE, 16, 16);
          drawSprite('trash_bin', 79 * TILE, 35 * TILE, 16, 16);

          // Room Badge Pill 7C
          const cBadgeX = 69 * TILE;
          const cBadgeY = 26.5 * TILE;
          const cBadgeW = 115;
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

          // --- KHU 7D: STUDIO TẬP TRUNG CHUYÊN SÂU / FOCUS POD (x: 85..98, y: 24..37) ---
          // North Wall & Bookshelf
          drawSprite('picture_frame_b', 87 * TILE, 24 * TILE + 2, 16, 16);
          drawSprite('plant_hanging', 91 * TILE, 24 * TILE, 16, 16);
          drawSprite('bookshelf_tall_1x2', 95 * TILE, 24 * TILE, 16, 32);

          // Deep Work Study Desk
          drawSprite('table_rect_2x1', 89.5 * TILE, 27 * TILE, 32, 16);
          drawSprite('chair_front_blue', 90.5 * TILE, 25.8 * TILE, 16, 16);
          drawSprite('open_book', 90 * TILE, 26.8 * TILE, 16, 16);
          drawSprite('kettle', 91 * TILE, 26.8 * TILE, 16, 16);

          // Cozy Reading Nook with 5x4 Velvet Rug
          drawRug(87, 30, 5, 4);
          drawSprite('armchair_teal', 88 * TILE, 31 * TILE, 16, 16);
          drawSprite('table_low_1x1', 89.5 * TILE, 31 * TILE, 16, 16);
          drawSprite('book_stack', 89.5 * TILE, 30.8 * TILE, 16, 16);
          drawSprite('lamp_floor', 87 * TILE, 33 * TILE, 16, 16);
          drawSprite('plant_floor', 96 * TILE, 34 * TILE, 16, 16);

          // Room Badge Pill 7D
          const dBadgeX = 86 * TILE;
          const dBadgeY = 26.5 * TILE;
          const dBadgeW = 110;
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
          ctx.fillText('FOCUS POD (DEEP WORK)', dBadgeX + 22, dBadgeY + 11);
        }

        // 15. RENDER ALL WALLS & DOORWAYS PASS`;
bmap = bmap.replace(oldOfficesRegex, newOffices);

// M. Reception bottom door in Wall helpers
bmap = bmap.replace(
  "bottomDoors.push({ start: 49 * TILE, end: 55 * TILE });",
  "bottomDoors.push({ start: 49 * TILE, end: 53 * TILE });"
);

// N. Gate width & position
bmap = bmap.replace(
  "const gateW = 6 * TILE;",
  "const gateW = 4 * TILE;"
);

fs.writeFileSync(path.join(__dirname, 'build_master_map.js'), bmap, 'utf8');
console.log('Successfully updated build_master_map.js');
