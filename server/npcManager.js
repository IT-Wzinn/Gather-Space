// server/npcManager.js
// Generates and animates 90 synchronized autonomous Vietnamese-named NPCs across the campus:
// - 28 seated together on outdoor park benches & corner park tables
// - 28 seated together indoors (Cafeteria, Library, Coworking, Zen, Boardroom, Meeting Pod, VIP Lounge, Pantry, Suites)
// - 14 standing in pairs conversing along outdoor plazas
// - 20 strolling smoothly around cobblestone boulevards & outer campus walkways
// Strict guard: NO NPC is ever allowed to enter Room #2 (central_lounge: x: 43..66, y: 32..50).

const TILE = 32;

const ROOM_2_FORBIDDEN = {
  minX: 42.2 * TILE,
  maxX: 66.8 * TILE,
  minY: 31.2 * TILE,
  maxY: 50.8 * TILE
};

const NPC_VIETNAMESE_NAMES = [
  'Nguyễn Minh Anh', 'Trần Quốc Bảo', 'Lê Hoàng Nam', 'Phạm Thảo Vy', 'Huỳnh Gia Huy',
  'Võ Khánh Linh', 'Đặng Anh Tuấn', 'Bùi Ngọc Hân', 'Đỗ Thành Đạt', 'Hồ Bảo Trâm',
  'Ngô Đức Thịnh', 'Dương Phương Linh', 'Lý Trung Kiên', 'Phan Mỹ Duyên', 'Vũ Quang Huy',
  'Trương Thanh Trúc', 'Nguyễn Hải Đăng', 'Trần Bảo Ngọc', 'Lê Trọng Nghĩa', 'Phạm Khánh Vy',
  'Hoàng Minh Khôi', 'Đinh Thu Trang', 'Nguyễn Tuấn Kiệt', 'Trần Ngọc Ánh', 'Lê Gia Bảo',
  'Phạm Hoài An', 'Huỳnh Minh Quân', 'Võ Hà My', 'Đặng Hữu Phước', 'Bùi Thanh Thảo',
  'Đỗ Nhật Minh', 'Hồ Tường Vy', 'Ngô Công Thành', 'Dương Kim Ngân', 'Lý Hoàng Phúc',
  'Phan Ngọc Bích', 'Vũ Anh Dũng', 'Trương Minh Thư', 'Nguyễn Tiến Dũng', 'Trần Quỳnh Như',
  'Lê Văn Khánh', 'Phạm Hồng Nhung', 'Hoàng Đức Anh', 'Đinh Bảo Châu', 'Nguyễn Hoàng Long',
  'Trần Mai Phương', 'Lê Đình Phong', 'Phạm Yến Nhi', 'Huỳnh Tấn Phát', 'Võ Minh Châu',
  'Đặng Ngọc Mai', 'Bùi Quốc Hưng', 'Đỗ Khánh Huyền', 'Hồ Tuấn Anh', 'Ngô Thanh Vân',
  'Dương Văn Lâm', 'Lý Phương Thảo', 'Phan Gia Khánh', 'Vũ Thùy Linh', 'Trương Hữu Nghĩa',
  'Nguyễn Nhật Hào', 'Trần Thiên Ân', 'Lê Bảo Yến', 'Phạm Văn Toàn', 'Hoàng Kim Oanh',
  'Đinh Minh Trí', 'Nguyễn Ngọc Diệp', 'Trần Duy Khang', 'Lê Thu Hà', 'Phạm Quốc Việt',
  'Huỳnh Lan Anh', 'Võ Tuấn Tài', 'Đặng Thảo Nguyên', 'Bùi Hải Nam', 'Đỗ Ngọc Lan',
  'Hồ Xuân Trường', 'Ngô Minh Tâm', 'Dương Thảo My', 'Lý Quang Minh', 'Phan Tú Anh',
  'Vũ Bảo Long', 'Trương Nhật Lệ', 'Nguyễn Hữu Lộc', 'Trần Hồng Hạnh', 'Lê Khánh Duy',
  'Phạm Kiều Trang', 'Hoàng Trọng Nhân', 'Đinh Phương Anh', 'Nguyễn Công Minh', 'Trần Thủy Tiên'
];

const NPC_SPRITES = [
  { characterId: 'char_1', sprite: 'assets/characters/char_1_dev.png' },
  { characterId: 'char_2', sprite: 'assets/characters/char_2_pm.png' },
  { characterId: 'char_3', sprite: 'assets/characters/char_3_lead.png' },
  { characterId: 'char_4', sprite: 'assets/characters/char_4_designer.png' },
  { characterId: 'char_5', sprite: 'assets/characters/char_5_barista_m.png' },
  { characterId: 'char_6', sprite: 'assets/characters/char_6_barista_f.png' },
  { characterId: 'char_7', sprite: 'assets/characters/char_7_hr.png' },
  { characterId: 'char_8', sprite: 'assets/characters/char_8_sales.png' },
  { characterId: 'char_9', sprite: 'assets/characters/char_9_creator.png' },
  { characterId: 'char_10', sprite: 'assets/characters/char_10_intern.png' }
];

function shuffleArray(list) {
  const arr = list.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
  return arr;
}

/**
 * Computes exact seat world coordinates matching client/seatingSystem.js.
 */
function seatPos(tx, ty, facing, kind, slot = 'S') {
  const cx = tx * TILE;
  const cy = ty * TILE;
  if (kind === 'double') {
    if (facing === 'left' || facing === 'right') {
      const shiftX = facing === 'right' ? 4 : -4;
      const shiftY = slot === 'T' ? -18 : 18;
      return { x: Math.round(cx + shiftX), y: Math.round(cy + shiftY) };
    }
    const shiftY = facing === 'up' ? -2 : 4;
    const shiftX = slot === 'L' ? -20 : 20;
    return { x: Math.round(cx + shiftX), y: Math.round(cy + shiftY) };
  }
  return { x: Math.round(cx), y: Math.round(cy + 3) };
}

function isInsideRoom2(x, y) {
  return x >= ROOM_2_FORBIDDEN.minX && x <= ROOM_2_FORBIDDEN.maxX
    && y >= ROOM_2_FORBIDDEN.minY && y <= ROOM_2_FORBIDDEN.maxY;
}

class NpcManager {
  constructor() {
    this.npcs = [];
    this.walkers = [];
    this.tickTimer = null;
  }

  init(io, worldState) {
    const names = shuffleArray(NPC_VIETNAMESE_NAMES);
    let idx = 0;

    const addNpc = ({ x, y, direction, isMoving = false, isSitting = false, seatId = null, currentRoom = null }) => {
      if (isInsideRoom2(x, y) || currentRoom === 'central_lounge') {
        throw new Error(`NPC attempted placement inside forbidden Room #2 at (${x}, ${y})`);
      }
      const id = `npc_${idx + 1}`;
      const spriteSpec = NPC_SPRITES[(idx + Math.floor(Math.random() * NPC_SPRITES.length)) % NPC_SPRITES.length];
      const npc = {
        id,
        name: names[idx % names.length],
        characterId: spriteSpec.characterId,
        sprite: spriteSpec.sprite,
        x: Math.round(x),
        y: Math.round(y),
        direction: direction || 'down',
        isMoving,
        isSitting,
        seatId,
        currentRoom,
        isCallLocked: false,
        callLockedWith: null,
        isNpc: true,
        joinedAt: Date.now()
      };
      idx++;
      worldState.players.set(id, npc);
      this.npcs.push(npc);
      return npc;
    };

    const addDoubleBenchPair = (prefix, tx, ty, facing) => {
      if (facing === 'left' || facing === 'right') {
        const t = seatPos(tx, ty, facing, 'double', 'T');
        const b = seatPos(tx, ty, facing, 'double', 'B');
        addNpc({ ...t, direction: facing, isSitting: true, seatId: `${prefix}_T`, currentRoom: null });
        addNpc({ ...b, direction: facing, isSitting: true, seatId: `${prefix}_B`, currentRoom: null });
      } else {
        const l = seatPos(tx, ty, facing, 'double', 'L');
        const r = seatPos(tx, ty, facing, 'double', 'R');
        addNpc({ ...l, direction: facing, isSitting: true, seatId: `${prefix}_L`, currentRoom: null });
        addNpc({ ...r, direction: facing, isSitting: true, seatId: `${prefix}_R`, currentRoom: null });
      }
    };

    // 1. 28 NPCs (14 pairs) sitting together OUTDOORS on park benches & corner tables
    addDoubleBenchPair('park_wall_br_e', 26.5, 24.95, 'down');
    addDoubleBenchPair('park_wall_br_w', 9.0, 24.95, 'down');
    addDoubleBenchPair('park_wall_zen_n', 27.5, 31.05, 'up');
    addDoubleBenchPair('park_wall_cw_n1', 16.8, 57.05, 'up');
    addDoubleBenchPair('park_wall_cw_n2', 32.8, 57.05, 'up');
    addDoubleBenchPair('park_wall_lib_w', 73.05, 55.6, 'left');
    addDoubleBenchPair('park_wall_lib_s', 98.0, 60.0, 'down');
    addDoubleBenchPair('park_wall_rec_w', 42.05, 65.5, 'left');

    const outdoorFacingCorners = [
      { prefix: 'corner_nw', cx: 6.8, cy: 4.6, slot: 'T' },
      { prefix: 'corner_ne', cx: 111.5, cy: 6.2, slot: 'T' },
      { prefix: 'corner_ne', cx: 111.5, cy: 6.2, slot: 'B' },
      { prefix: 'corner_sw', cx: 8.5, cy: 88.0, slot: 'T' },
      { prefix: 'corner_sw', cx: 8.5, cy: 88.0, slot: 'B' },
      { prefix: 'corner_se', cx: 111.5, cy: 88.0, slot: 'T' }
    ];
    for (const c of outdoorFacingCorners) {
      const l = seatPos(c.cx - 2.3, c.cy, 'right', 'double', c.slot);
      const r = seatPos(c.cx + 2.3, c.cy, 'left', 'double', c.slot);
      addNpc({ ...l, direction: 'right', isSitting: true, seatId: `${c.prefix}_L_${c.slot}`, currentRoom: null });
      addNpc({ ...r, direction: 'left', isSitting: true, seatId: `${c.prefix}_R_${c.slot}`, currentRoom: null });
    }

    // 2. 28 NPCs (14 pairs) sitting together INDOORS across rooms (NEVER Room #2 central_lounge)
    const indoorFacingPairs = [
      { idA: 'caf_se_group_L_T', xA: 60.0, yA: 21.6, dirA: 'right', kA: 'double', sA: 'T',
        idB: 'caf_se_group_R_S', xB: 64.0, yB: 21.6, dirB: 'left', kB: 'single', sB: 'S', room: 'cafeteria_dining' },
      { idA: 'lib_chair_1_S', xA: 85.0, yA: 50.6, dirA: 'down', kA: 'single', sA: 'S',
        idB: 'lib_chair_3_S', xB: 85.0, yB: 54.4, dirB: 'up', kB: 'single', sB: 'S', room: 'library_room' },
      { idA: 'lib_east_group_L_T', xA: 96.2, yA: 51.6, dirA: 'right', kA: 'double', sA: 'T',
        idB: 'lib_east_group_R_T', xB: 101.0, yB: 51.6, dirB: 'left', kB: 'double', sB: 'T', room: 'library_room' },
      { idA: 'cw_chair_1_S', xA: 16.0, yA: 65.2, dirA: 'down', kA: 'single', sA: 'S',
        idB: 'cw_chair_3_S', xB: 16.0, yB: 69.8, dirB: 'up', kB: 'single', sB: 'S', room: 'open_workspace' },
      { idA: 'cw_east_lounge_L_T', xA: 26.8, yA: 66.2, dirA: 'right', kA: 'double', sA: 'T',
        idB: 'cw_east_lounge_R_T', xB: 31.6, yB: 66.2, dirB: 'left', kB: 'double', sB: 'T', room: 'open_workspace' },
      { idA: 'zen_north_group_L_T', xA: 26.8, yA: 35.0, dirA: 'right', kA: 'double', sA: 'T',
        idB: 'zen_north_group_R_T', xB: 31.6, yB: 35.0, dirB: 'left', kB: 'double', sB: 'T', room: 'zen_garden' },
      { idA: 'br_chair_2_S', xA: 16.2, yA: 16.2, dirA: 'right', kA: 'single', sA: 'S',
        idB: 'br_chair_4_S', xB: 23.8, yB: 16.2, dirB: 'left', kB: 'single', sB: 'S', room: 'large_boardroom' },
      { idA: 'mp_lounge_L_T', xA: 10.3, yA: 36.8, dirA: 'right', kA: 'double', sA: 'T',
        idB: 'mp_lounge_R_T', xB: 14.9, yB: 36.8, dirB: 'left', kB: 'double', sB: 'T', room: 'small_meeting' },
      { idA: 'ql_north_group_L_T', xA: 84.8, yA: 65.4, dirA: 'right', kA: 'double', sA: 'T',
        idB: 'ql_north_group_R_T', xB: 89.6, yB: 65.4, dirB: 'left', kB: 'double', sB: 'T', room: 'quiet_lounge' },
      { idA: 'pan_cafe_group_L_T', xA: 47.2, yA: 18.6, dirA: 'right', kA: 'double', sA: 'T',
        idB: 'pan_cafe_group_R_S', xB: 51.2, yB: 18.6, dirB: 'left', kB: 'single', sB: 'S', room: 'pantry_bar' },
      { idA: 'ceo_lounge_L_S', xA: 79.0, yA: 17.5, dirA: 'right', kA: 'single', sA: 'S',
        idB: 'ceo_lounge_R_T', xB: 83.0, yB: 17.5, dirB: 'left', kB: 'double', sB: 'T', room: 'private_office_1' },
      { idA: 'dir_lounge_L_T', xA: 94.5, yA: 17.6, dirA: 'right', kA: 'double', sA: 'T',
        idB: 'dir_lounge_R_S', xB: 98.5, yB: 17.6, dirB: 'left', kB: 'single', sB: 'S', room: 'private_office_2' },
      { idA: 'pm_nook_L_S', xA: 78.6, yA: 29.0, dirA: 'right', kA: 'single', sA: 'S',
        idB: 'pm_nook_R_S', xB: 81.8, yB: 29.0, dirB: 'left', kB: 'single', sB: 'S', room: 'private_office_3' },
      { idA: 'fp_nook_L_T', xA: 95.2, yA: 29.2, dirA: 'right', kA: 'double', sA: 'T',
        idB: 'fp_nook_R_S', xB: 99.2, yB: 29.2, dirB: 'left', kB: 'single', sB: 'S', room: 'private_office_4' }
    ];
    for (const p of indoorFacingPairs) {
      const posA = seatPos(p.xA, p.yA, p.dirA, p.kA, p.sA);
      const posB = seatPos(p.xB, p.yB, p.dirB, p.kB, p.sB);
      addNpc({ ...posA, direction: p.dirA, isSitting: true, seatId: p.idA, currentRoom: p.room });
      addNpc({ ...posB, direction: p.dirB, isSitting: true, seatId: p.idB, currentRoom: p.room });
    }

    // 3. 14 NPCs (7 pairs) standing together in pairs chatting around plazas & walkways
    const standingPairs = [
      { ax: 49.0 * TILE, ay: 5.5 * TILE, bx: 50.5 * TILE, by: 5.5 * TILE, room: null },
      { ax: 38.3 * TILE, ay: 34.5 * TILE, bx: 39.8 * TILE, by: 34.5 * TILE, room: null },
      { ax: 69.3 * TILE, ay: 48.0 * TILE, bx: 70.8 * TILE, by: 48.0 * TILE, room: null },
      { ax: 54.0 * TILE, ay: 5.0 * TILE, bx: 55.5 * TILE, by: 5.0 * TILE, room: null },
      { ax: 50.0 * TILE, ay: 81.5 * TILE, bx: 51.5 * TILE, by: 81.5 * TILE, room: null },
      { ax: 87.5 * TILE, ay: 4.5 * TILE, bx: 89.0 * TILE, by: 4.5 * TILE, room: null },
      { ax: 4.0 * TILE, ay: 38.0 * TILE, bx: 5.5 * TILE, by: 38.0 * TILE, room: null }
    ];
    for (const pair of standingPairs) {
      addNpc({ x: pair.ax, y: pair.ay, direction: 'right', isSitting: false, currentRoom: pair.room });
      addNpc({ x: pair.bx, y: pair.by, direction: 'left', isSitting: false, currentRoom: pair.room });
    }

    // 4. 20 NPCs walking continuously on cobblestone boulevards & courtyards (always outside Room #2)
    const walkerRoutes = [
      { speed: 4.4, pts: [{ x: 10, y: 28 }, { x: 38, y: 28 }, { x: 69, y: 28 }, { x: 38, y: 28 }] },
      { speed: 4.1, pts: [{ x: 69, y: 54 }, { x: 39, y: 54 }, { x: 12, y: 54 }, { x: 39, y: 54 }] },
      { speed: 4.5, pts: [{ x: 39, y: 28 }, { x: 39, y: 54 }, { x: 39, y: 74 }, { x: 39, y: 54 }] },
      { speed: 4.3, pts: [{ x: 70, y: 23 }, { x: 70, y: 48 }, { x: 70, y: 74 }, { x: 70, y: 48 }] },
      { speed: 4.6, pts: [{ x: 39, y: 28 }, { x: 70, y: 28 }, { x: 70, y: 54 }, { x: 39, y: 54 }] },
      { speed: 4.0, pts: [{ x: 70, y: 54 }, { x: 70, y: 28 }, { x: 39, y: 28 }, { x: 39, y: 54 }] },
      { speed: 4.2, pts: [{ x: 70, y: 23 }, { x: 89, y: 23 }, { x: 89, y: 6 }, { x: 89, y: 23 }, { x: 105, y: 23 }, { x: 89, y: 23 }, { x: 89, y: 43 }, { x: 89, y: 23 }] },
      { speed: 4.0, pts: [{ x: 54, y: 86 }, { x: 54, y: 61 }, { x: 46, y: 61 }, { x: 54, y: 61 }] },
      { speed: 4.2, pts: [{ x: 20, y: 28 }, { x: 54, y: 28 }, { x: 54, y: 12 }, { x: 54, y: 28 }] },
      { speed: 3.9, pts: [{ x: 6, y: 54 }, { x: 38, y: 54 }, { x: 38, y: 38 }, { x: 38, y: 54 }] },
      { speed: 4.3, pts: [{ x: 24, y: 84 }, { x: 54, y: 84 }, { x: 70, y: 84 }, { x: 54, y: 84 }] },
      { speed: 4.1, pts: [{ x: 74, y: 23 }, { x: 106, y: 23 }, { x: 89, y: 23 }] },
      { speed: 4.4, pts: [{ x: 107, y: 18 }, { x: 107, y: 54 }, { x: 107, y: 74 }, { x: 107, y: 45 }] },
      { speed: 4.0, pts: [{ x: 4, y: 18 }, { x: 4, y: 48 }, { x: 4, y: 28 }, { x: 22, y: 28 }, { x: 4, y: 28 }] },
      { speed: 4.2, pts: [{ x: 15, y: 82 }, { x: 54, y: 82 }, { x: 95, y: 82 }, { x: 54, y: 82 }] },
      { speed: 4.1, pts: [{ x: 15, y: 4.5 }, { x: 54, y: 4.5 }, { x: 95, y: 4.5 }, { x: 54, y: 4.5 }] },
      { speed: 4.3, pts: [{ x: 89, y: 8 }, { x: 89, y: 44 }, { x: 89, y: 23 }] },
      { speed: 4.0, pts: [{ x: 15, y: 80 }, { x: 54, y: 80 }, { x: 72, y: 80 }, { x: 54, y: 80 }] },
      { speed: 4.2, pts: [{ x: 54, y: 78 }, { x: 54, y: 86 }, { x: 70, y: 86 }, { x: 70, y: 62 }, { x: 70, y: 86 }, { x: 54, y: 86 }] },
      { speed: 4.1, pts: [{ x: 39, y: 75 }, { x: 39, y: 54 }, { x: 20, y: 54 }, { x: 39, y: 54 }] }
    ];

    for (const cfg of walkerRoutes) {
      const startPt = cfg.pts[0];
      const npc = addNpc({
        x: startPt.x * TILE,
        y: startPt.y * TILE,
        direction: 'right',
        isMoving: true,
        isSitting: false,
        currentRoom: null
      });
      this.walkers.push({
        npc,
        route: cfg.pts.map(p => ({ x: p.x * TILE, y: p.y * TILE })),
        wpIdx: 1,
        speed: cfg.speed,
        pauseUntil: 0
      });
    }

    if (this.tickTimer) clearInterval(this.tickTimer);
    this.tickTimer = setInterval(() => this.tick(io, worldState), 90);
    console.log(`[NPC] Initialized ${this.npcs.length} autonomous Vietnamese-named NPCs (0 inside Room #2 central_lounge).`);
  }

  tick(io, worldState) {
    if (worldState.getHumanCount() === 0) return;

    const now = Date.now();
    const updates = [];

    for (const w of this.walkers) {
      const { npc, route } = w;
      if (now < w.pauseUntil) {
        if (npc.isMoving) {
          npc.isMoving = false;
          updates.push({
            id: npc.id,
            x: Math.round(npc.x),
            y: Math.round(npc.y),
            direction: npc.direction,
            isMoving: false
          });
        }
        continue;
      }

      const target = route[w.wpIdx];
      const dx = target.x - npc.x;
      const dy = target.y - npc.y;
      const dist = Math.hypot(dx, dy);

      if (dist <= w.speed + 0.5) {
        npc.x = target.x;
        npc.y = target.y;
        w.wpIdx = (w.wpIdx + 1) % route.length;
        if (Math.random() < 0.35) {
          w.pauseUntil = now + 900 + Math.floor(Math.random() * 1400);
          npc.isMoving = false;
        }
      } else {
        const vx = (dx / dist) * w.speed;
        const vy = (dy / dist) * w.speed;
        const nextX = npc.x + vx;
        const nextY = npc.y + vy;
        if (!isInsideRoom2(nextX, nextY)) {
          npc.x = nextX;
          npc.y = nextY;
        }
        npc.isMoving = true;
        if (Math.abs(dx) >= Math.abs(dy)) {
          npc.direction = dx >= 0 ? 'right' : 'left';
        } else {
          npc.direction = dy >= 0 ? 'down' : 'up';
        }
      }

      updates.push({
        id: npc.id,
        x: Math.round(npc.x),
        y: Math.round(npc.y),
        direction: npc.direction,
        isMoving: npc.isMoving
      });
    }

    if (updates.length > 0) {
      io.emit('NPC_TICK', updates);
    }
  }
}

module.exports = new NpcManager();
