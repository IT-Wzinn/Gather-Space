// server/core/worldState.js
// Quản lý Trạng thái Thế giới tập trung (World State) trong RAM

class WorldState {
  constructor() {
    this.players = new Map(); // Key: socket.id -> Value: Player Object
  }

  /**
   * Tìm tọa độ spawn trống tại Sảnh Lễ Tân để các nhân vật không đè lên nhau
   */
  findAvailableSpawnPosition(excludeSocketId = null) {
    const TILE = 32;
    const MIN_SPAWN_DIST = 84; // Khoảng cách tối thiểu 84px (~3 ô) để cả nhân vật lẫn tên không đè lên nhau
    const existingPlayers = Array.from(this.players.values()).filter(p => p.id !== excludeSocketId && !p.isNpc);

    // Các hàng tọa độ hoàn toàn thông thoáng trong Sảnh Lễ Tân (cách nhau 3 ô ngang x 2 ô dọc)
    const xColsPrimary = [54, 57, 51, 59, 48, 45];
    const yRowsPrimary = [69, 67, 71];
    const xColsStagger = [55.5, 52.5, 58.5, 49.5, 46.5];
    const yRowsStagger = [68, 70, 66];

    const candidates = [];
    for (const ty of yRowsPrimary) {
      for (const tx of xColsPrimary) {
        candidates.push({ x: tx * TILE, y: ty * TILE });
      }
    }
    for (const ty of yRowsStagger) {
      for (const tx of xColsStagger) {
        candidates.push({ x: tx * TILE, y: ty * TILE });
      }
    }

    // Chọn ô trống đầu tiên không gần bất kỳ người chơi nào đang đứng
    for (const pos of candidates) {
      const hasOverlap = existingPlayers.some(p => {
        const dx = pos.x - p.x;
        const dy = pos.y - p.y;
        return Math.hypot(dx, dy) < MIN_SPAWN_DIST;
      });
      if (!hasOverlap) {
        return pos;
      }
    }

    // Fallback nếu sảnh cực kỳ đông: tìm điểm có khoảng cách xa nhất tới người gần nhất
    let bestPos = candidates[0];
    let bestMinDist = -1;
    for (let tx = 46; tx <= 59; tx++) {
      for (let ty = 66; ty <= 71; ty++) {
        const cx = tx * TILE;
        const cy = ty * TILE;
        let minDist = Infinity;
        for (const p of existingPlayers) {
          const d = Math.hypot(cx - p.x, cy - p.y);
          if (d < minDist) minDist = d;
        }
        if (minDist > bestMinDist) {
          bestMinDist = minDist;
          bestPos = { x: cx, y: cy };
        }
      }
    }
    return bestPos;
  }

  /**
   * Thêm người chơi mới vào World State
   */
  addPlayer(socketId, data = {}) {
    const spawnPos = this.findAvailableSpawnPosition(socketId);
    const player = {
      id: socketId,
      name: data.name || 'Lữ Quốc Vinh',
      characterId: data.characterId || 'char_1',
      sprite: data.sprite || 'assets/characters/char_1_dev.png',
      x: spawnPos.x,
      y: spawnPos.y,
      direction: data.direction || 'up',
      isMoving: false,
      isSitting: !!data.isSitting,
      seatId: data.seatId || null,
      currentRoom: data.currentRoom || 'reception',
      isCallLocked: false,
      callLockedWith: null,
      joinedAt: Date.now()
    };
    this.players.set(socketId, player);
    return player;
  }

  /**
   * Xóa người chơi khi thoát hoặc rớt mạng
   */
  removePlayer(socketId) {
    const player = this.players.get(socketId);
    if (player) {
      this.players.delete(socketId);
      return player;
    }
    return null;
  }

  /**
   * Lấy thông tin 1 người chơi
   */
  getPlayer(socketId) {
    return this.players.get(socketId) || null;
  }

  /**
   * Cập nhật vị trí và trạng thái di chuyển
   */
  updatePlayerPosition(socketId, movementData) {
    const player = this.players.get(socketId);
    if (!player) return null;

    if (typeof movementData.x === 'number') player.x = movementData.x;
    if (typeof movementData.y === 'number') player.y = movementData.y;
    if (movementData.direction) player.direction = movementData.direction;
    if (typeof movementData.isMoving === 'boolean') player.isMoving = movementData.isMoving;
    if (typeof movementData.isSitting === 'boolean') player.isSitting = movementData.isSitting;
    if (movementData.seatId !== undefined) player.seatId = movementData.seatId;
    if (movementData.currentRoom !== undefined) player.currentRoom = movementData.currentRoom;

    return player;
  }

  /**
   * Lấy toàn bộ danh sách người chơi trực tuyến
   */
  getAllPlayers() {
    return Array.from(this.players.values());
  }

  /**
   * Lấy danh sách những người chơi khác (loại trừ socketId gọi tới)
   */
  getOtherPlayers(excludeSocketId) {
    return Array.from(this.players.values()).filter(p => p.id !== excludeSocketId);
  }

  /**
   * Đếm tổng số người chơi online (chỉ tính người thật)
   */
  getOnlineCount() {
    return this.getHumanCount();
  }

  getHumanCount() {
    let count = 0;
    for (const p of this.players.values()) {
      if (!p.isNpc) count++;
    }
    return count;
  }
}

// Singleton World State
const worldState = new WorldState();
module.exports = worldState;
