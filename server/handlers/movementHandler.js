// server/handlers/movementHandler.js
// Xử lý gói tin di chuyển tọa độ nhân vật và đồng bộ TCP

function registerMovementHandlers(io, socket, worldState) {
  /**
   * Sự kiện PLAYER_MOVE: Nhận gói tin tọa độ từ Client (đã qua Throttling 30Hz)
   */
  socket.on('PLAYER_MOVE', (payload) => {
    if (!payload || typeof payload.x !== 'number' || typeof payload.y !== 'number') {
      return;
    }

    const updated = worldState.updatePlayerPosition(socket.id, {
      x: payload.x,
      y: payload.y,
      direction: payload.direction,
      isMoving: payload.isMoving,
      isSitting: payload.isSitting,
      seatId: payload.seatId,
      currentRoom: payload.currentRoom
    });

    if (updated) {
      // Broadcast tới tất cả client khác trong mạng (trừ người gửi)
      socket.broadcast.emit('PLAYER_MOVED', {
        id: socket.id,
        x: updated.x,
        y: updated.y,
        direction: updated.direction,
        isMoving: updated.isMoving,
        isSitting: updated.isSitting,
        seatId: updated.seatId,
        currentRoom: updated.currentRoom
      });
    }
  });
}

module.exports = registerMovementHandlers;
