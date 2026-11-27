// server/handlers/roomHandler.js
// Quản lý Phân nhóm Room (Application-Layer Multicast) và trạng thái thảm họp

function registerRoomHandlers(io, socket, worldState) {
  /**
   * Sự kiện ROOM_JOIN: Khi nhân vật bước vào bounding box của một phòng
   * Payload: { roomId: string, roomName: string }
   */
  socket.on('ROOM_JOIN', (payload) => {
    if (!payload || !payload.roomId) return;

    const roomId = payload.roomId;
    const roomChannel = `room_${roomId}`;
    const player = worldState.getPlayer(socket.id);

    // Rời phòng cũ nếu đang ở phòng khác
    if (player && player.currentRoom && player.currentRoom !== roomId) {
      const oldChannel = `room_${player.currentRoom}`;
      socket.leave(oldChannel);
      socket.to(oldChannel).emit('ROOM_PEER_LEFT', {
        peerId: socket.id,
        roomId: player.currentRoom
      });
    }

    // Gia nhập socket room mới
    socket.join(roomChannel);
    if (player) {
      player.currentRoom = roomId;
    }

    console.log(`[Network:Room] 🚪 "${player ? player.name : socket.id}" joined ${roomChannel} ("${payload.roomName || roomId}")`);

    // Lấy danh sách các peer (người thật) đang có mặt trong phòng này
    const existingPeers = worldState.getAllPlayers().filter(
      p => p.currentRoom === roomId && p.id !== socket.id && !p.isNpc
    );

    // 1. Phản hồi cho chính người mới danh sách các peer hiện tại trong phòng
    socket.emit('ROOM_MEMBERS', {
      roomId: roomId,
      roomName: payload.roomName || roomId,
      peers: existingPeers
    });

    // 2. Multicast báo cho các thành viên cũ trong phòng biết có người mới bước vào
    socket.to(roomChannel).emit('ROOM_PEER_JOINED', {
      peerId: socket.id,
      player: player || { id: socket.id, name: 'Anonymous' },
      roomId: roomId
    });
  });

  /**
   * Sự kiện ROOM_LEAVE: Khi nhân vật bước ra khỏi phòng
   * Payload: { roomId: string }
   */
  socket.on('ROOM_LEAVE', (payload) => {
    if (!payload || !payload.roomId) return;

    const roomId = payload.roomId;
    const roomChannel = `room_${roomId}`;
    const player = worldState.getPlayer(socket.id);

    socket.leave(roomChannel);
    if (player && player.currentRoom === roomId) {
      player.currentRoom = null;
    }

    console.log(`[Network:Room] 🚶 "${player ? player.name : socket.id}" left ${roomChannel}`);

    // Multicast báo cho các thành viên trong phòng dọn dẹp kết nối
    socket.to(roomChannel).emit('ROOM_PEER_LEFT', {
      peerId: socket.id,
      roomId: roomId
    });
  });
}

module.exports = registerRoomHandlers;
