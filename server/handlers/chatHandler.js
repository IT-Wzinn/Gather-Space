// server/handlers/chatHandler.js
// Xử lý gói tin Chat: Broadcast toàn mạng và Geocasting theo không gian địa lý

const { getNearbySockets } = require('../core/geocastRouter');
const db = require('../database/db');

function registerChatHandlers(io, socket, worldState) {
  /**
   * Sự kiện CHAT_SEND: Nhận tin nhắn từ Client
   * Payload: { text: string, scope: 'everyone' | 'nearby', senderName?: string }
   */
  socket.on('CHAT_SEND', (payload) => {
    if (!payload || typeof payload.text !== 'string' || !payload.text.trim()) {
      return;
    }

    const player = worldState.getPlayer(socket.id);
    const senderName = (player && player.name) || payload.senderName || 'Lữ Quốc Vinh';
    const scope = (payload.scope === 'nearby') ? 'nearby' : 'everyone';
    const text = payload.text.trim();

    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const baseMessage = {
      id: messageId,
      senderId: socket.id,
      senderName: senderName,
      text: text,
      scope: scope,
      channel: payload.channel || 'general',
      timestamp: Date.now()
    };

    // Lưu trữ bền vững vào Database (Phase 5)
    db.saveChatMessage(baseMessage);

    if (scope === 'nearby') {
      // 1. Định tuyến không gian (Spatial Geocasting)
      const nearbyRecipients = getNearbySockets(socket.id, 250, worldState);
      console.log(`[Network:Chat] 📍 Geocast "Nearby" from "${senderName}" (${socket.id}) routed to ${nearbyRecipients.length} recipient(s) in 250px radius`);

      nearbyRecipients.forEach(({ socketId, distance }) => {
        io.to(socketId).emit('CHAT_RECEIVE', {
          ...baseMessage,
          distance: Math.round(distance)
        });
      });
    } else {
      // 2. Phát sóng toàn mạng (Broadcast)
      console.log(`[Network:Chat] 🌐 Broadcast "Everyone" from "${senderName}" (${socket.id}) routed to ALL sockets`);
      io.emit('CHAT_RECEIVE', baseMessage);
    }
  });

  /**
   * Sự kiện USER_WAVE: Gửi lời chào vẫy tay tới một người dùng cụ thể
   */
  socket.on('USER_WAVE', (payload) => {
    if (payload && payload.targetId) {
      console.log(`[Network:Wave] 👋 "${payload.senderName}" (${socket.id}) waved at "${payload.targetName}" (${payload.targetId})`);
      io.to(payload.targetId).emit('USER_WAVED', {
        senderId: socket.id,
        senderName: payload.senderName || 'Đồng nghiệp'
      });
    }
  });

  /**
   * Sự kiện DIRECT_DM_SEND: Nhắn tin trực tiếp 1-1 giữa 2 người dùng (profile card DM)
   */
  socket.on('DIRECT_DM_SEND', (payload) => {
    if (!payload || !payload.targetId || typeof payload.text !== 'string' || !payload.text.trim()) return;
    const player = worldState.getPlayer(socket.id);
    const senderName = (player && player.name) || payload.senderName || 'Đồng nghiệp';
    const dm = {
      id: `dm_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      senderId: socket.id,
      senderName,
      targetId: payload.targetId,
      text: payload.text.trim().slice(0, 500),
      timestamp: Date.now()
    };
    io.to(payload.targetId).emit('DIRECT_DM_RECEIVE', dm);
  });

  /**
   * Sự kiện PLAYER_EMOTE: Phát biểu cảm Emoji hiển thị trên đầu nhân vật
   */
  socket.on('PLAYER_EMOTE', (payload) => {
    if (!payload || typeof payload.emoji !== 'string' || !payload.emoji.trim()) return;
    socket.broadcast.emit('PLAYER_EMOTE', {
      playerId: socket.id,
      emoji: payload.emoji.trim().slice(0, 8),
      timestamp: Date.now()
    });
  });

  /**
   * Sự kiện PLAYER_CHAT_BUBBLE: Phát lời nhắn thoại hiển thị trực tiếp trên đầu nhân vật
   */
  socket.on('PLAYER_CHAT_BUBBLE', (payload) => {
    if (!payload || typeof payload.text !== 'string' || !payload.text.trim()) return;
    socket.broadcast.emit('PLAYER_CHAT_BUBBLE', {
      playerId: socket.id,
      text: payload.text.trim().slice(0, 120),
      timestamp: Date.now()
    });
  });
}

module.exports = registerChatHandlers;
