// server/handlers/signalHandler.js
// Máy chủ Báo hiệu WebRTC (Signaling Broker qua WebSocket)
// Chuyển tiếp các gói tin bắt tay kết nối P2P: SDP Offer, SDP Answer và ICE Candidates

function registerSignalHandlers(io, socket, worldState) {
  /**
   * SIGNAL_OFFER: Peer A gửi SDP Offer tới Peer B
   * Payload: { targetPeerId: string, sdp: RTCSessionDescriptionInit, roomId: string }
   */
  socket.on('SIGNAL_OFFER', (payload) => {
    if (!payload || !payload.targetPeerId || !payload.sdp) return;

    // Chuyển tiếp trực tiếp tới Socket đích
    io.to(payload.targetPeerId).emit('SIGNAL_OFFER', {
      senderPeerId: socket.id,
      sdp: payload.sdp,
      roomId: payload.roomId
    });
  });

  /**
   * SIGNAL_ANSWER: Peer B phản hồi SDP Answer về Peer A
   * Payload: { targetPeerId: string, sdp: RTCSessionDescriptionInit, roomId: string }
   */
  socket.on('SIGNAL_ANSWER', (payload) => {
    if (!payload || !payload.targetPeerId || !payload.sdp) return;

    // Chuyển tiếp trực tiếp về Socket người khởi tạo
    io.to(payload.targetPeerId).emit('SIGNAL_ANSWER', {
      senderPeerId: socket.id,
      sdp: payload.sdp,
      roomId: payload.roomId
    });
  });

  /**
   * SIGNAL_ICE: Trao đổi ứng viên kết nối mạng (ICE Candidates thu thập từ Google STUN)
   * Payload: { targetPeerId: string, candidate: RTCIceCandidateInit, roomId: string }
   */
  socket.on('SIGNAL_ICE', (payload) => {
    if (!payload || !payload.targetPeerId || !payload.candidate) return;

    io.to(payload.targetPeerId).emit('SIGNAL_ICE', {
      senderPeerId: socket.id,
      candidate: payload.candidate,
      roomId: payload.roomId
    });
  });

  /**
   * PROXIMITY_START: Khi một người tiến lại gần người khác (hoặc bấm Go To tới)
   * Đồng bộ cuộc gọi video 2 người tới cả 2 phía (kiểm tra trạng thái khóa riêng tư)
   */
  socket.on('PROXIMITY_START', (payload) => {
    if (!payload || !payload.targetPeerId) return;
    const target = worldState ? worldState.getPlayer(payload.targetPeerId) : null;
    if (target && target.isCallLocked && target.callLockedWith && target.callLockedWith !== socket.id) {
      socket.emit('PROXIMITY_LOCKED_NOTICE', {
        targetPeerId: payload.targetPeerId,
        message: `🔒 Cuộc trò chuyện của ${target.name || 'người này'} đang bị khóa riêng tư.`
      });
      return;
    }
    io.to(payload.targetPeerId).emit('PROXIMITY_START', {
      senderPeerId: socket.id,
      senderPlayer: worldState ? worldState.getPlayer(socket.id) : null
    });
  });

  /**
   * CONVERSATION_LOCK_TOGGLE: Khóa hoặc mở khóa cuộc gọi 2 người
   */
  socket.on('CONVERSATION_LOCK_TOGGLE', (payload) => {
    if (!payload || !payload.peerId) return;
    const isLocked = !!payload.isLocked;
    const user = worldState ? worldState.getPlayer(socket.id) : null;
    const target = worldState ? worldState.getPlayer(payload.peerId) : null;

    if (user) {
      user.isCallLocked = isLocked;
      user.callLockedWith = isLocked ? payload.peerId : null;
    }
    if (target) {
      target.isCallLocked = isLocked;
      target.callLockedWith = isLocked ? socket.id : null;
    }

    io.to(payload.peerId).emit('CONVERSATION_LOCK_UPDATED', {
      isLocked: isLocked,
      byPeerId: socket.id
    });

    io.emit('PLAYER_LOCK_STATE_CHANGED', {
      userId1: socket.id,
      userId2: payload.peerId,
      isLocked: isLocked
    });
  });

  /**
   * PROXIMITY_END: Khi một trong hai bên rời khỏi cuộc gọi thoại
   */
  socket.on('PROXIMITY_END', (payload) => {
    if (!payload || !payload.targetPeerId) return;
    const user = worldState ? worldState.getPlayer(socket.id) : null;
    const target = worldState ? worldState.getPlayer(payload.targetPeerId) : null;
    if (user) {
      user.isCallLocked = false;
      user.callLockedWith = null;
    }
    if (target) {
      target.isCallLocked = false;
      target.callLockedWith = null;
    }
    io.emit('PLAYER_LOCK_STATE_CHANGED', {
      userId1: socket.id,
      userId2: payload.targetPeerId,
      isLocked: false
    });
    io.to(payload.targetPeerId).emit('PROXIMITY_END', {
      senderPeerId: socket.id,
      manualLeave: !!payload.manualLeave
    });
  });

  /**
   * SCREEN_SHARE_STATE: Thông báo trạng thái chia sẻ màn hình tới các peer trong cuộc gọi
   */
  socket.on('SCREEN_SHARE_STATE', (payload) => {
    if (!payload) return;
    const targets = Array.isArray(payload.targetPeerIds) && payload.targetPeerIds.length > 0
      ? payload.targetPeerIds
      : (payload.targetPeerId ? [payload.targetPeerId] : []);
    targets.forEach((tid) => {
      if (!tid || tid === socket.id) return;
      io.to(tid).emit('SCREEN_SHARE_STATE', {
        senderPeerId: socket.id,
        isSharing: !!payload.isSharing,
        sourceLabel: payload.sourceLabel || 'Toàn màn hình',
        optimizeVideo: !!payload.optimizeVideo,
        shareAudio: !!payload.shareAudio
      });
    });
  });

  /**
   * CAMERA_STATE: Đồng bộ trạng thái bật/tắt camera để các peer cập nhật khung video và bubble trên đầu nhân vật
   */
  socket.on('CAMERA_STATE', (payload) => {
    const isCameraOn = !!(payload && payload.isCameraOn);
    const user = worldState ? worldState.getPlayer(socket.id) : null;
    if (user) {
      user.isCameraOn = isCameraOn;
    }
    socket.broadcast.emit('CAMERA_STATE', {
      senderPeerId: socket.id,
      isCameraOn
    });
  });
}

module.exports = registerSignalHandlers;
