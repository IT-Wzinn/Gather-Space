// Network - WebSocket / Socket.io Initialization
let socket = null;
if (typeof io !== 'undefined') {
  socket = io();
  window.socket = socket;

  socket.on('connect', () => {
    console.log('[Network] Connected to server via Socket ID:', socket.id);
  });

  socket.on('connect_error', (err) => {
    console.warn('[Network] Socket connection error:', err.message);
  });

  socket.on('disconnect', (reason) => {
    console.log('[Network] Disconnected from server:', reason);
    if (window.mapEngineInstance) {
      window.mapEngineInstance.setRemotePlayers([]);
    }
    onlineRemotePlayers = [];
    updateOnlineRoster();
  });

  // Receive server-assigned non-overlapping spawn position for self
  socket.on('SPAWN_POSITION', ({ x, y, direction }) => {
    window.hasReceivedSpawnPos = true;
    lastSentMovement = {
      x: Math.round(x),
      y: Math.round(y),
      direction: direction || 'up',
      isMoving: false
    };
    if (window.mapEngineInstance && typeof window.mapEngineInstance.setPlayerPosition === 'function') {
      window.mapEngineInstance.setPlayerPosition(x, y, direction);
    }
  });

  // Receive full roster of existing players in office
  socket.on('CURRENT_PLAYERS', (players) => {
    console.log(`[Network] Received ${players.length} online remote player(s)`);
    if (!window.remoteCameraStates) window.remoteCameraStates = new Map();
    if (Array.isArray(players)) {
      players.forEach(p => {
        if (p && p.id && !p.isNpc) window.remoteCameraStates.set(p.id, !!p.isCameraOn);
      });
    }
    if (window.mapEngineInstance) {
      window.mapEngineInstance.setRemotePlayers(players);
    }
    onlineRemotePlayers = Array.isArray(players) ? players.filter(p => !p.isNpc) : [];
    updateOnlineRoster();
  });

  // Batch update positions for ambient NPCs walking on the map
  socket.on('NPC_TICK', (updates) => {
    if (!Array.isArray(updates) || !window.mapEngineInstance) return;
    updates.forEach(u => window.mapEngineInstance.updateRemotePlayer(u));
  });

  // A new remote player joined the office
  socket.on('PLAYER_JOINED', (newPlayer) => {
    console.log(`[Network] Player joined office: "${newPlayer.name}" (${newPlayer.id})`);
    if (!window.remoteCameraStates) window.remoteCameraStates = new Map();
    if (newPlayer && newPlayer.id && !newPlayer.isNpc) {
      window.remoteCameraStates.set(newPlayer.id, !!newPlayer.isCameraOn);
    }
    if (window.mapEngineInstance) {
      window.mapEngineInstance.addRemotePlayer(newPlayer);
      if (typeof window.mapEngineInstance.triggerSpawnEffect === 'function') {
        const rp = window.mapEngineInstance.remotePlayers.get(newPlayer.id);
        window.mapEngineInstance.triggerSpawnEffect(newPlayer.x, newPlayer.y, rp || newPlayer, true);
      }
    }
    updateOnlineRoster();
  });

  // A remote player moved
  socket.on('PLAYER_MOVED', (data) => {
    if (window.mapEngineInstance) {
      window.mapEngineInstance.updateRemotePlayer(data);
    }
    if (data && data.currentRoom !== undefined) {
      updateOnlineRoster();
    }
  });

  // A remote player left or disconnected
  socket.on('PLAYER_LEFT', (data) => {
    console.log(`[Network] Player left office: ${data.playerId}`);
    if (window.mapEngineInstance) {
      window.mapEngineInstance.removeRemotePlayer(data.playerId);
    }
    updateOnlineRoster();
  });

  // Receive network chat message (Broadcast or Geocasting Nearby)
  socket.on('CHAT_RECEIVE', (msgData) => {
    renderReceivedChatMessage(msgData);
  });

  // Receive network wave greeting
  socket.on('USER_WAVED', (data) => {
    const senderName = data.senderName || 'Đồng nghiệp';
    showRoomBannerToast(`👋 ${senderName} vừa vẫy tay chào bạn!`);
    if (typeof window.recordDirectActivity === 'function') {
      window.recordDirectActivity({ id: data.senderId, name: senderName }, {
        senderId: data.senderId,
        senderName,
        text: `${senderName} waved at you`,
        timestamp: Date.now(),
        isWave: true
      });
    }
  });

  // Receive 1-on-1 Direct Message in profile chat card
  socket.on('DIRECT_DM_RECEIVE', (dm) => {
    if (!dm) return;
    if (typeof window.recordDirectActivity === 'function') {
      window.recordDirectActivity({ id: dm.senderId, name: dm.senderName }, dm);
    }
    showRoomBannerToast(`💬 ${dm.senderName || 'Đồng nghiệp'}: ${dm.text}`);
  });

  // Phase 4: Room Events & WebRTC Mesh Coordination
  socket.on('ROOM_MEMBERS', ({ roomId, roomName, peers }) => {
    console.log(`[Network:Room] Joined room "${roomName}" (${roomId}) with ${peers.length} existing peer(s)`);
    if (window.webrtcManager) {
      window.webrtcManager.joinMeetingRoom(roomId, peers);
    }
    peers.forEach(p => addRemoteVideoTilePlaceholder(p.id, p.name));
  });

  socket.on('ROOM_PEER_JOINED', ({ peerId, player, roomId }) => {
    console.log(`[Network:Room] Peer joined room:`, player ? player.name : peerId);
    showRoomBannerToast(`${(player && player.name) || 'Đồng nghiệp'} đã bước vào phòng`);
    addRemoteVideoTilePlaceholder(peerId, player ? player.name : 'Đồng nghiệp');
  });

  socket.on('ROOM_PEER_LEFT', ({ peerId, roomId }) => {
    console.log(`[Network:Room] Peer left room:`, peerId);
    if (window.webrtcManager) {
      window.webrtcManager.removePeer(peerId);
    }
    removeRemoteVideoTile(peerId);
    if (typeof window.removePeerFromGroupCall === 'function') {
      window.removePeerFromGroupCall(peerId, false);
    }
  });

  // Proximity & group video call synchronization across participants
  socket.on('PROXIMITY_START', ({ senderPeerId, senderPlayer }) => {
    if (window.remoteLeftCallPeers && senderPeerId) {
      window.remoteLeftCallPeers.delete(senderPeerId);
    }
    const isLocallyDismissed = (window.dismissedProximityPeerIds && window.dismissedProximityPeerIds.has(senderPeerId))
      || window.dismissedProximityPeerId === senderPeerId;
    if (isLocallyDismissed) {
      return;
    }
    let peer = null;
    if (window.mapEngineInstance && window.mapEngineInstance.remotePlayers) {
      peer = window.mapEngineInstance.remotePlayers.get(senderPeerId);
    }
    if (!peer && senderPlayer) {
      peer = senderPlayer;
    }
    if (!peer) {
      peer = { id: senderPeerId, name: 'Đồng nghiệp' };
    }
    showProximityVideoBar(peer, false);
  });

  socket.on('PROXIMITY_END', ({ senderPeerId, manualLeave }) => {
    if (manualLeave && senderPeerId) {
      if (!window.remoteLeftCallPeers) window.remoteLeftCallPeers = new Set();
      window.remoteLeftCallPeers.add(senderPeerId);
    }
    if (typeof window.removePeerFromGroupCall === 'function') {
      window.removePeerFromGroupCall(senderPeerId, false);
    } else if (window.activeProximityPeer && window.activeProximityPeer.id === senderPeerId) {
      hideProximityVideoBar(false);
    }
  });

  socket.on('SCREEN_SHARE_STATE', ({ senderPeerId, isSharing, sourceLabel }) => {
    const inGroupCall = window.activeCallPeers && window.activeCallPeers.has(senderPeerId);
    const matchesSingle = window.activeProximityPeer && window.activeProximityPeer.id === senderPeerId;
    if (!inGroupCall && !matchesSingle) return;
    if (typeof window.applyRemoteScreenShareState === 'function') {
      window.applyRemoteScreenShareState(senderPeerId, isSharing, sourceLabel);
    }
  });

  socket.on('CAMERA_STATE', ({ senderPeerId, isCameraOn: remoteCam }) => {
    if (!senderPeerId) return;
    if (!window.remoteCameraStates) window.remoteCameraStates = new Map();
    window.remoteCameraStates.set(senderPeerId, !!remoteCam);
    if (window.mapEngineInstance && window.mapEngineInstance.remotePlayers) {
      const rp = window.mapEngineInstance.remotePlayers.get(senderPeerId);
      if (rp) rp.isCameraOn = !!remoteCam;
    }
    if (typeof renderGroupCallVideoCards === 'function') {
      renderGroupCallVideoCards();
    }
    if (typeof window.syncWhiteboardParticipantsUI === 'function') {
      window.syncWhiteboardParticipantsUI();
    }
  });

  // Khóa/mở khóa cuộc trò chuyện từ người cùng gọi
  socket.on('CONVERSATION_LOCK_UPDATED', ({ isLocked, byPeerId }) => {
    updateCallLockUI(isLocked);
    const peerName = (window.activeProximityPeer && window.activeProximityPeer.name) || 'Đồng nghiệp';
    const msg = isLocked
      ? `🔒 ${peerName} đã khóa cuộc trò chuyện này (Private).`
      : `🔓 ${peerName} đã mở khóa cuộc trò chuyện.`;
    showRoomBannerToast(msg);
  });

  // Đồng bộ trạng thái khóa cuộc gọi của tất cả người chơi
  socket.on('PLAYER_LOCK_STATE_CHANGED', ({ userId1, userId2, isLocked }) => {
    if (window.mapEngineInstance && window.mapEngineInstance.remotePlayers) {
      const p1 = window.mapEngineInstance.remotePlayers.get(userId1);
      if (p1) {
        p1.isCallLocked = isLocked;
        p1.callLockedWith = isLocked ? userId2 : null;
      }
      const p2 = window.mapEngineInstance.remotePlayers.get(userId2);
      if (p2) {
        p2.isCallLocked = isLocked;
        p2.callLockedWith = isLocked ? userId1 : null;
      }
    }
    if (window.activeProximityPeer) {
      if (window.activeProximityPeer.id === userId1 || window.activeProximityPeer.id === userId2) {
        window.activeProximityPeer.isCallLocked = isLocked;
        window.activeProximityPeer.callLockedWith = isLocked ? (window.activeProximityPeer.id === userId1 ? userId2 : userId1) : null;
      }
    }
  });

  // Thông báo khi cố gắng tham gia cuộc gọi đã bị khóa
  socket.on('PROXIMITY_LOCKED_NOTICE', ({ targetPeerId, message }) => {
    showRoomBannerToast(message || '🔒 Cuộc trò chuyện này đang bị khóa riêng tư.');
  });

  // Nhận Emoji Reaction trên đầu nhân vật từ người dùng khác
  socket.on('PLAYER_EMOTE', ({ playerId, emoji }) => {
    if (window.mapEngineInstance && typeof window.mapEngineInstance.triggerOverheadEmoji === 'function') {
      window.mapEngineInstance.triggerOverheadEmoji(emoji, playerId);
    }
  });

  // Nhận Speech Bubble Chat trên đầu nhân vật từ người dùng khác
  socket.on('PLAYER_CHAT_BUBBLE', ({ playerId, text }) => {
    if (window.mapEngineInstance && typeof window.mapEngineInstance.triggerOverheadChat === 'function') {
      window.mapEngineInstance.triggerOverheadChat(text, playerId);
    }
  });
}

// Network Movement Synchronization with Throttling (30Hz ~ 33ms)
let lastMoveEmitTime = 0;
const MOVE_THROTTLE_MS = 33; // 30Hz: Giới hạn tối đa 30 gói tin/giây chống bão mạng
let lastSentMovement = { x: null, y: null, direction: null, isMoving: false };

function setupNetworkMovementSync() {
  if (!window.mapEngineInstance) return;

  window.mapEngineInstance.onMovement = (pos) => {
    if (!socket || !socket.connected || !window.hasReceivedSpawnPos) return;

    const now = performance.now();
    const timeElapsed = now - lastMoveEmitTime;
    const posChanged = pos.x !== lastSentMovement.x || pos.y !== lastSentMovement.y;
    const stateChanged =
      pos.isMoving !== lastSentMovement.isMoving ||
      pos.direction !== lastSentMovement.direction ||
      !!pos.isSitting !== !!lastSentMovement.isSitting ||
      pos.seatId !== lastSentMovement.seatId;

    // Send packet if:
    // 1. Throttling interval (33ms) elapsed AND player moved
    // OR 2. State changed (e.g. stopped walking, changed direction, sat down/stood up)
    if ((timeElapsed >= MOVE_THROTTLE_MS && posChanged) || stateChanged) {
      socket.emit('PLAYER_MOVE', {
        x: pos.x,
        y: pos.y,
        direction: pos.direction,
        isMoving: pos.isMoving,
        isSitting: !!pos.isSitting,
        seatId: pos.seatId || null
      });

      lastMoveEmitTime = now;
      lastSentMovement = { ...pos };
    }
  };
}

// Spatial Room Detection & WebRTC Video Strip Coordination (Phase 4)
let roomToastTimer = null;

function showRoomBannerToast(text) {
  const toast = document.getElementById('roomBannerToast');
  const toastText = document.getElementById('roomBannerText');
  if (!toast || !toastText) return;

  toastText.textContent = text;
  toast.classList.remove('hidden');

  if (roomToastTimer) clearTimeout(roomToastTimer);
  roomToastTimer = setTimeout(() => {
    toast.classList.add('hidden');
  }, 3500);
}

function showMeetingVideoGridUI(roomName) {
  const grid = document.getElementById('meetingVideoGrid');
  const title = document.getElementById('meetingRoomTitle');
  const localVideo = document.getElementById('meetingLocalVideo');
  const localPlaceholder = document.getElementById('localTilePlaceholder');
  const localName = document.getElementById('localTileName');
  const currentName = userNameInput ? (userNameInput.value.trim() || 'Bạn') : 'Bạn';

  if (!grid) return;
  grid.classList.remove('hidden');
  if (title) title.textContent = `📹 ${roomName}`;
  if (localName) localName.textContent = `${currentName} (Local)`;

  // Attach local stream if active
  if (mediaStream && localVideo) {
    localVideo.srcObject = mediaStream;
    localVideo.play().catch(e => console.warn(e));
    if (localPlaceholder) localPlaceholder.style.display = 'none';
  } else if (localPlaceholder) {
    localPlaceholder.style.display = 'flex';
  }
}

function hideMeetingVideoGridUI() {
  const grid = document.getElementById('meetingVideoGrid');
  if (grid) grid.classList.add('hidden');

  // Clear remote peer video tiles
  const container = document.getElementById('videoStreamsContainer');
  if (container) {
    const tiles = container.querySelectorAll('.remote-tile');
    tiles.forEach(tile => tile.remove());
  }
}

function addRemoteVideoTilePlaceholder(peerId, peerName = 'Đồng nghiệp') {
  const container = document.getElementById('videoStreamsContainer');
  if (!container) return;

  let existing = document.getElementById(`peer-tile-${peerId}`);
  if (!existing) {
    const firstChar = (peerName || 'U').charAt(0).toUpperCase();
    const tile = document.createElement('div');
    tile.className = 'video-tile remote-tile';
    tile.id = `peer-tile-${peerId}`;
    tile.innerHTML = `
      <video id="video-stream-${peerId}" autoplay playsinline></video>
      <div class="video-tile-placeholder" id="placeholder-${peerId}">
        <div class="tile-avatar" style="background: #8b5cf6;">${firstChar}</div>
        <span>${escapeHtml(peerName)}</span>
      </div>
      <span class="video-tile-name">${escapeHtml(peerName)}</span>
    `;
    container.appendChild(tile);
  }
}

function renderRemoteVideoTile(peerId, stream) {
  addRemoteVideoTilePlaceholder(peerId);
  const videoElem = document.getElementById(`video-stream-${peerId}`);
  const placeholder = document.getElementById(`placeholder-${peerId}`);
  if (videoElem && stream) {
    videoElem.srcObject = stream;
    videoElem.play().catch(e => console.warn(e));
    if (placeholder) placeholder.style.display = 'none';
  }
}

function removeRemoteVideoTile(peerId) {
  const tile = document.getElementById(`peer-tile-${peerId}`);
  if (tile) tile.remove();
}

// Spatial Proximity Video Call Bar (Gather Town style)
window.activeProximityPeer = null;
window.isConversationLocked = false;

function updateCallLockUI(isLocked) {
  window.isConversationLocked = !!isLocked;
  const lockBtn = document.getElementById('callLockBtn');
  const lockShackle = document.getElementById('callLockShackle');
  const footer = document.getElementById('proximityVideoFooter');

  if (lockBtn) {
    if (window.isConversationLocked) {
      lockBtn.classList.add('locked');
      lockBtn.title = 'Mở khóa cuộc trò chuyện (Unlock conversation)';
      if (lockShackle) lockShackle.setAttribute('d', 'M7 11V7a5 5 0 0 1 10 0v4');
    } else {
      lockBtn.classList.remove('locked');
      lockBtn.title = 'Khóa cuộc trò chuyện (Lock conversation)';
      if (lockShackle) lockShackle.setAttribute('d', 'M7 11V7a5 5 0 0 1 9.9-1');
    }
  }

  if (footer) {
    if (window.isConversationLocked) {
      footer.innerHTML = `🔒 Conversation is locked (Private)`;
      footer.style.color = '#fca5a5';
    } else {
      footer.textContent = 'Nearby people may listen in';
      footer.style.color = '';
    }
  }
}

function toggleConversationLock() {
  if (!window.activeProximityPeer || !window.activeProximityPeer.id) return;
  const newLockState = !window.isConversationLocked;
  updateCallLockUI(newLockState);

  if (socket && socket.connected) {
    socket.emit('CONVERSATION_LOCK_TOGGLE', {
      peerId: window.activeProximityPeer.id,
      isLocked: newLockState
    });
  }

  const msg = newLockState 
    ? '🔒 Bạn đã khóa cuộc trò chuyện này. Người khác sẽ không thể tham gia.'
    : '🔓 Bạn đã mở khóa cuộc trò chuyện.';
  showRoomBannerToast(msg);
}

function setupCallLockControls() {
  const lockBtn = document.getElementById('callLockBtn');
  const bar = document.getElementById('proximityVideoBar');
  if (bar) {
    bar.addEventListener('mousedown', (e) => e.stopPropagation());
    bar.addEventListener('mouseup', (e) => e.stopPropagation());
  }
  if (lockBtn) {
    lockBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleConversationLock();
    });
  }

  // Top-Right 3 Dark Buttons (PiP, Map, Grid)
  const pipBtn = document.getElementById('callPipBtn');
  const mapBtn = document.getElementById('callMapBtn');
  const gridBtn = document.getElementById('callGridBtn');
  const localCard = document.getElementById('localCallCard');
  const remoteCard = document.getElementById('remoteCallCard');

  window.activeCallPeers = window.activeCallPeers || new Map();
  window.dismissedProximityPeerIds = window.dismissedProximityPeerIds || new Set();

  function setCallSpotlight(targetCardId) {
    if (!bar) return;
    const cardsContainer = bar.querySelector('.proximity-video-cards');
    const allCards = cardsContainer ? Array.from(cardsContainer.querySelectorAll('.call-video-card')) : [];
    if (!targetCardId || !bar.classList.contains('grid-mode')) {
      bar.classList.remove('has-spotlight');
      allCards.forEach(c => c.classList.remove('spotlight-main', 'spotlight-thumb'));
      return;
    }

    bar.classList.add('has-spotlight');
    allCards.forEach(c => {
      const isMain = c.id === targetCardId;
      c.classList.toggle('spotlight-main', isMain);
      c.classList.toggle('spotlight-thumb', !isMain);
    });
  }
  window.setCallSpotlight = setCallSpotlight;

  function bindCallCardEvents(card) {
    if (!card || card.dataset.callCardBound === '1') return;
    card.dataset.callCardBound = '1';
    const unpinBtn = card.querySelector('.call-card-unpin-btn');
    if (unpinBtn) {
      unpinBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        setCallSpotlight(null);
      });
    }
    card.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!bar || !bar.classList.contains('grid-mode')) return;
      if (card.classList.contains('spotlight-main')) {
        setCallSpotlight(null);
      } else {
        setCallSpotlight(card.id);
      }
    });
  }
  window.bindCallCardEvents = bindCallCardEvents;

  [localCard, remoteCard].forEach(bindCallCardEvents);

  function setCallViewMode(mode) {
    const isGrid = mode === 'grid';
    if (!isGrid) {
      setCallSpotlight(null);
    }
    if (bar) {
      bar.classList.toggle('grid-mode', isGrid);
    }
    if (gridBtn) gridBtn.classList.toggle('active', isGrid);
    if (mapBtn) mapBtn.classList.toggle('active', !isGrid);

    if (isGrid) {
      if (typeof closeUserProfileCard === 'function') {
        closeUserProfileCard(false);
      }
    } else if (window.activeProximityPeer && typeof openUserProfileCard === 'function') {
      openUserProfileCard(window.activeProximityPeer);
    }
  }
  window.setCallViewMode = setCallViewMode;

  if (pipBtn) {
    pipBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      setCallViewMode('map');
      showRoomBannerToast('📺 Chế độ xem thu nhỏ (Mini view)');
    });
  }
  if (mapBtn) {
    mapBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      setCallViewMode('map');
      if (window.mapEngineInstance) {
        window.mapEngineInstance.camera.x = window.mapEngineInstance.player.x;
        window.mapEngineInstance.camera.y = window.mapEngineInstance.player.y;
        window.mapEngineInstance.clampCamera();
      }
      showRoomBannerToast('🗺️ Chế độ thu gọn trên bản đồ (Map view)');
    });
  }
  if (gridBtn) {
    gridBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (bar && bar.classList.contains('grid-mode') && bar.classList.contains('has-spotlight')) {
        setCallSpotlight(null);
        return;
      }
      const nextMode = bar && bar.classList.contains('grid-mode') ? 'map' : 'grid';
      setCallViewMode(nextMode);
    });
  }
}

function getPeerForCallCard(videoEl, placeholderEl, stream, peerId = null) {
  if (!videoEl || !placeholderEl) return;
  if (!stream) {
    videoEl.srcObject = null;
    videoEl.classList.remove('active');
    placeholderEl.style.display = 'flex';
    return;
  }
  if (videoEl.srcObject !== stream) {
    videoEl.srcObject = stream;
  }
  const safePlay = () => {
    const p = videoEl.play();
    if (p !== undefined) {
      p.catch(() => {
        // Fallback to muted if browser blocks unmuted autoplay before interaction
        videoEl.muted = true;
        videoEl.play().catch(() => {});
      });
    }
  };
  safePlay();

  const checkDimensions = () => {
    const knownCamState = peerId && window.remoteCameraStates ? window.remoteCameraStates.get(peerId) : undefined;
    const hasLiveTrack = stream.getVideoTracks().some(t => t.readyState === 'live' && t.enabled);
    const isRealCam = knownCamState === true
      ? (videoEl.videoWidth > 0 && hasLiveTrack)
      : (knownCamState === false ? false : videoEl.videoWidth > 200);
    if (isRealCam) {
      safePlay();
      videoEl.classList.add('active');
      placeholderEl.style.display = 'none';
    } else {
      videoEl.classList.remove('active');
      placeholderEl.style.display = 'flex';
    }
  };
  videoEl.onloadedmetadata = checkDimensions;
  videoEl.onresize = checkDimensions;
  videoEl.onplaying = checkDimensions;
  checkDimensions();
}

function renderGroupCallVideoCards() {
  const bar = document.getElementById('proximityVideoBar');
  const cardsContainer = bar ? bar.querySelector('.proximity-video-cards') : null;
  if (!bar || !cardsContainer) return;

  const peers = window.activeCallPeers ? Array.from(window.activeCallPeers.values()) : [];
  bar.classList.toggle('group-multi', peers.length >= 2);

  // Remove stale extra remote peer cards (> peer #0)
  const keepIds = new Set(peers.slice(1).map(p => p.id));
  cardsContainer.querySelectorAll('.remote-peer-card').forEach(el => {
    if (!keepIds.has(el.dataset.peerId)) el.remove();
  });

  const firstPeer = peers[0] || null;
  const remoteCard = document.getElementById('remoteCallCard');
  if (remoteCard) {
    remoteCard.style.display = firstPeer ? '' : 'none';
    if (firstPeer) {
      remoteCard.dataset.peerId = firstPeer.id;
      const rNameElem = document.getElementById('remoteCallUserName');
      const rAvCircle = document.getElementById('remoteCallAvatarCircle');
      const pName = firstPeer.name || 'Đồng nghiệp';
      if (rNameElem) rNameElem.textContent = pName;
      if (rAvCircle) rAvCircle.textContent = pName.charAt(0).toUpperCase();
      const s0 = window.webrtcManager?.remoteStreams?.get(firstPeer.id) || null;
      attachRemoteCallVideoIfReal(s0, firstPeer.id);
    }
  }

  // Render cards for additional group call participants (peers[1..N])
  peers.slice(1).forEach((peer) => {
    const safeId = String(peer.id).replace(/[^a-zA-Z0-9_-]/g, '_');
    const cardId = `remoteCallCard_${safeId}`;
    let card = document.getElementById(cardId);
    const pName = peer.name || 'Đồng nghiệp';
    const initial = pName.charAt(0).toUpperCase();

    if (!card) {
      card = document.createElement('div');
      card.className = 'call-video-card remote-peer-card';
      card.id = cardId;
      card.dataset.peerId = peer.id;
      card.innerHTML = `
        <video class="call-card-video" autoplay playsinline></video>
        <div class="call-avatar-placeholder">
          <div class="call-avatar-circle">${escapeHtml(initial)}</div>
        </div>
        <button class="call-card-unpin-btn" type="button" title="Thu về nhiều khung" aria-label="Thu về nhiều khung">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 14 10 14 10 20"></polyline><polyline points="20 10 14 10 14 4"></polyline><line x1="14" y1="10" x2="21" y2="3"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>
        </button>
        <span class="call-thumb-chevron" aria-hidden="true">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
        </span>
        <div class="call-name-badge">
          <svg class="badge-mic-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="2" y1="2" x2="22" y2="22" stroke="#ea3943" stroke-width="2.5"></line><path d="M18.89 13.23A7.12 7.12 0 0 0 19 12v-2"></path><path d="M5 10v2a7 7 0 0 0 12 5"></path><path d="M15 9.34V5a3 3 0 0 0-5.68-1.33"></path><path d="M9 9v3a3 3 0 0 0 5.12 2.12"></path><line x1="12" y1="19" x2="12" y2="22"></line></svg>
          <span class="call-user-name">${escapeHtml(pName)}</span>
        </div>
      `;
      cardsContainer.appendChild(card);
      if (typeof window.bindCallCardEvents === 'function') {
        window.bindCallCardEvents(card);
      }
    } else {
      const nameEl = card.querySelector('.call-user-name');
      const avEl = card.querySelector('.call-avatar-circle');
      if (nameEl) nameEl.textContent = pName;
      if (avEl) avEl.textContent = initial;
    }

    const vid = card.querySelector('.call-card-video');
    const ph = card.querySelector('.call-avatar-placeholder');
    const stream = window.webrtcManager?.remoteStreams?.get(peer.id) || null;
    getPeerForCallCard(vid, ph, stream, peer.id);
  });
}

function showProximityVideoBar(peer, notifyPeer = true) {
  if (!peer || peer.isNpc) return;
  if (peer.isCallLocked && peer.callLockedWith && socket && socket.id && peer.callLockedWith !== socket.id) {
    showRoomBannerToast(`🔒 Cuộc trò chuyện của ${peer.name || 'người này'} đang được khóa riêng tư.`);
    return;
  }
  const bar = document.getElementById('proximityVideoBar');
  if (!bar) return;

  if (!window.activeCallPeers) window.activeCallPeers = new Map();
  const wasNewPeer = peer.id ? !window.activeCallPeers.has(peer.id) : false;
  if (peer.id) {
    window.activeCallPeers.set(peer.id, peer);
  }
  const primaryPeer = window.activeCallPeers.values().next().value || peer;
  window.activeProximityPeer = primaryPeer;

  // Local user setup
  const localNameElem = document.getElementById('localCallUserName');
  const localAvatarCircle = document.getElementById('localCallAvatarCircle');
  const localVideo = document.getElementById('localCallVideo');
  const localPlaceholder = document.getElementById('localCallPlaceholder');
  const currentName = (userNameInput && userNameInput.value.trim()) ? userNameInput.value.trim() : 'Lữ Quốc Vinh';

  if (localNameElem) localNameElem.textContent = currentName;
  if (localAvatarCircle) localAvatarCircle.textContent = currentName.charAt(0).toUpperCase();

  // Attach local media stream to both Call Bar & Chat Mini Call Dock
  const miniLocalVideo = document.getElementById('chatMiniLocalVideo');
  const miniLocalAvatar = document.getElementById('chatMiniLocalAvatar');
  if (miniLocalAvatar) miniLocalAvatar.textContent = currentName.charAt(0).toUpperCase();
  if (isCameraOn && mediaStream && localVideo) {
    localVideo.srcObject = mediaStream;
    localVideo.play().catch(e => console.warn(e));
    localVideo.classList.add('active');
    if (localPlaceholder) localPlaceholder.style.display = 'none';
    if (miniLocalVideo) {
      miniLocalVideo.srcObject = mediaStream;
      miniLocalVideo.play().catch(() => {});
      miniLocalVideo.classList.add('active');
      if (miniLocalAvatar) miniLocalAvatar.style.display = 'none';
    }
  } else {
    if (localVideo) {
      localVideo.srcObject = null;
      localVideo.classList.remove('active');
    }
    if (localPlaceholder) localPlaceholder.style.display = 'flex';
    if (miniLocalVideo) {
      miniLocalVideo.srcObject = null;
      miniLocalVideo.classList.remove('active');
      if (miniLocalAvatar) miniLocalAvatar.style.display = 'flex';
    }
  }

  // Top-left Pill Badge (Avatars + Room Title) & Lock Controls
  const bAv1 = document.getElementById('callBadgeAvatar1');
  const bAv2 = document.getElementById('callBadgeAvatar2');
  const bTitle = document.getElementById('callBadgeRoomTitle');
  if (bAv1) bAv1.textContent = currentName.charAt(0).toUpperCase();
  if (bAv2) {
    bAv2.textContent = window.activeCallPeers.size >= 2
      ? `+${window.activeCallPeers.size}`
      : (primaryPeer.name || 'Đồng nghiệp').charAt(0).toUpperCase();
  }
  let currentRoom = null;
  if (window.mapEngineInstance && typeof window.mapEngineInstance.getRoomAtPosition === 'function') {
    currentRoom = window.mapEngineInstance.getRoomAtPosition(
      window.mapEngineInstance.player.x,
      window.mapEngineInstance.player.y
    );
  }
  if (bTitle) bTitle.textContent = getEnglishConversationTitle(currentRoom);
  updateCallLockUI(window.isConversationLocked || false);

  // Connect WebRTC P2P for every peer in group call
  if (window.webrtcManager && peer.id) {
    const isInitiator = socket && socket.id ? (socket.id > peer.id) : true;
    window.webrtcManager.createPeerConnection(peer.id, isInitiator).catch(e => console.warn(e));
  }

  renderGroupCallVideoCards();

  bar.classList.remove('hidden');
  updateCallDockActions(true);

  // Auto-collapse left office panel when entering call
  const officeSidebar = document.querySelector('.office-left-sidebar');
  if (officeSidebar) {
    if (typeof window.wasPanelCollapsedBeforeCall !== 'boolean') {
      window.wasPanelCollapsedBeforeCall = officeSidebar.classList.contains('collapsed');
    }
    if (typeof window.setOfficePanelCollapsed === 'function') {
      window.setOfficePanelCollapsed(true, false);
    } else {
      officeSidebar.classList.add('collapsed');
    }
  }

  if (window.activeCallPeers.size === 1) {
    openUserProfileCard(primaryPeer);
  } else {
    closeUserProfileCard(false);
  }

  updateSidebarConversationsUI();
  if (typeof window.syncChatMiniCallDock === 'function') {
    window.syncChatMiniCallDock();
  }
  if (typeof window.syncWhiteboardParticipantsUI === 'function') {
    window.syncWhiteboardParticipantsUI();
  }
  if (typeof window.syncLobbyMusicState === 'function') {
    window.syncLobbyMusicState();
  }

  if (notifyPeer && wasNewPeer && peer.id && socket && socket.connected) {
    socket.emit('PROXIMITY_START', { targetPeerId: peer.id });
  }
}

function syncGroupCallPeers(eligiblePeers = []) {
  const validList = Array.isArray(eligiblePeers) ? eligiblePeers.filter(p => p && p.id && !p.isNpc) : [];
  if (!window.activeCallPeers) window.activeCallPeers = new Map();
  const validIds = new Set(validList.map(p => p.id));

  // Remove peers no longer eligible
  const toRemove = [];
  window.activeCallPeers.forEach((_, pid) => {
    if (!validIds.has(pid)) toRemove.push(pid);
  });
  toRemove.forEach(pid => removePeerFromGroupCall(pid, true));

  // Add newly eligible peers
  validList.forEach(p => {
    if (!window.activeCallPeers.has(p.id)) {
      showProximityVideoBar(p, true);
    }
  });
}
window.syncGroupCallPeers = syncGroupCallPeers;

function removePeerFromGroupCall(peerId, notifyPeer = false) {
  if (!peerId || !window.activeCallPeers || !window.activeCallPeers.has(peerId)) return;
  const removed = window.activeCallPeers.get(peerId);
  window.activeCallPeers.delete(peerId);

  if (notifyPeer && socket && socket.connected) {
    socket.emit('PROXIMITY_END', { targetPeerId: peerId });
  }

  if (window.activeCallPeers.size === 0) {
    // Restore previous single-peer reference so hideProximityVideoBar sets dismissed cleanly
    window.activeProximityPeer = removed;
    hideProximityVideoBar(false);
    return;
  }

  window.activeProximityPeer = window.activeCallPeers.values().next().value || null;
  renderGroupCallVideoCards();
  updateSidebarConversationsUI();
  if (typeof window.syncChatMiniCallDock === 'function') window.syncChatMiniCallDock();
  if (typeof window.syncWhiteboardParticipantsUI === 'function') window.syncWhiteboardParticipantsUI();
  if (typeof window.syncLobbyMusicState === 'function') window.syncLobbyMusicState();
}
window.removePeerFromGroupCall = removePeerFromGroupCall;

function attachRemoteCallVideoIfReal(stream, peerId = null) {
  const remoteVideo = document.getElementById('remoteCallVideo');
  const remotePlaceholder = document.getElementById('remoteCallPlaceholder');
  const resolvedPeerId = peerId || (window.activeCallPeers && window.activeCallPeers.keys().next().value) || (window.activeProximityPeer && window.activeProximityPeer.id) || null;
  getPeerForCallCard(remoteVideo, remotePlaceholder, stream, resolvedPeerId);
}

function hideProximityVideoBar(notifyPeer = true) {
  const bar = document.getElementById('proximityVideoBar');
  if (typeof window.setCallViewMode === 'function') {
    window.setCallViewMode('map');
  } else if (bar) {
    bar.classList.remove('grid-mode');
  }
  if (bar) {
    bar.classList.remove('group-multi');
    bar.classList.add('hidden');
    bar.querySelectorAll('.remote-peer-card').forEach(el => el.remove());
  }
  updateCallDockActions(false);
  if (window.whiteboardManager && typeof window.whiteboardManager.close === 'function') {
    window.whiteboardManager.close();
  }
  if (typeof window.stopScreenShare === 'function') {
    window.stopScreenShare(false);
  }
  if (typeof window.closeScreenShareModal === 'function') {
    window.closeScreenShareModal();
  }
  if (typeof window.applyRemoteScreenShareState === 'function') {
    window.applyRemoteScreenShareState(null, false, '');
  }
  const prevPeers = window.activeCallPeers && window.activeCallPeers.size > 0
    ? Array.from(window.activeCallPeers.values())
    : (window.activeProximityPeer ? [window.activeProximityPeer] : []);
  const prevPeer = window.activeProximityPeer;
  if (notifyPeer) {
    if (prevPeer) {
      window.dismissedProximityPeerId = prevPeer.id;
    }
    if (window.dismissedProximityPeerIds) {
      prevPeers.forEach(p => { if (p && p.id) window.dismissedProximityPeerIds.add(p.id); });
    }
  }
  if (window.activeCallPeers) window.activeCallPeers.clear();
  window.activeProximityPeer = null;
  if (window.isConversationLocked) {
    window.isConversationLocked = false;
    updateCallLockUI(false);
  }
  if (window.mapEngineInstance && typeof window.mapEngineInstance.setSelectedPlayer === 'function') {
    window.mapEngineInstance.setSelectedPlayer(null);
  }
  const localVideo = document.getElementById('localCallVideo');
  const remoteVideo = document.getElementById('remoteCallVideo');
  if (localVideo) {
    localVideo.srcObject = null;
    localVideo.classList.remove('active');
  }
  if (remoteVideo) {
    remoteVideo.srcObject = null;
    remoteVideo.classList.remove('active');
  }
  closeUserProfileCard(false);
  updateSidebarConversationsUI();
  if (typeof window.syncChatMiniCallDock === 'function') {
    window.syncChatMiniCallDock();
  }
  if (typeof window.syncWhiteboardParticipantsUI === 'function') {
    window.syncWhiteboardParticipantsUI();
  }
  if (typeof window.syncLobbyMusicState === 'function') {
    window.syncLobbyMusicState();
  }

  // Restore left office panel to its pre-call state when call ends
  if (typeof window.wasPanelCollapsedBeforeCall === 'boolean') {
    const shouldStayCollapsed = window.wasPanelCollapsedBeforeCall;
    window.wasPanelCollapsedBeforeCall = null;
    if (typeof window.setOfficePanelCollapsed === 'function') {
      window.setOfficePanelCollapsed(shouldStayCollapsed, false);
    }
  } else {
    const officeSidebar = document.querySelector('.office-left-sidebar');
    const expandBtn = document.getElementById('officePanelExpandBtn');
    if (officeSidebar && officeSidebar.classList.contains('collapsed') && expandBtn) {
      expandBtn.classList.remove('hidden');
    }
  }

  if (notifyPeer && socket && socket.connected) {
    prevPeers.forEach((p) => {
      if (p && p.id) socket.emit('PROXIMITY_END', { targetPeerId: p.id, manualLeave: true });
    });
  }
}

function getEnglishConversationTitle(room) {
  if (!room) return 'Street Conversations';
  if (room.englishName) return `${room.englishName} Conversations`;

  const idMap = {
    'reception': 'Reception',
    'open_workspace': 'Coworking',
    'coworking': 'Coworking',
    'central_lounge': 'Central Lounge',
    'zen_garden': 'Zen Garden',
    'large_boardroom': 'Boardroom',
    'small_meeting': 'Meeting Pod',
    'private_office_1': 'CEO Office',
    'private_office_2': 'Director Office',
    'private_office_3': 'PM Office',
    'private_office_4': 'Focus Pod',
    'library_room': 'Library',
    'quiet_lounge': 'VIP Lounge',
    'pantry_bar': 'Pantry',
    'cafeteria_dining': 'Cafeteria'
  };
  if (room.id && idMap[room.id]) {
    return `${idMap[room.id]} Conversations`;
  }
  if (room.name) {
    const match = room.name.match(/\(([^)]+)\)/);
    if (match && match[1]) {
      return `${match[1].trim()} Conversations`;
    }
  }
  return 'Street Conversations';
}

function updateSidebarConversationsUI() {
  const section = document.getElementById('sidebarConversationsSection');
  if (!section) return;

  const peer = window.activeProximityPeer;
  if (!peer) {
    section.classList.add('hidden');
    return;
  }

  const titleElem = document.getElementById('conversationsRoomTitle');
  const remoteAvatar = document.getElementById('convoAvatarRemote');
  const localAvatar = document.getElementById('convoAvatarLocal');
  const card = document.getElementById('activeConversationCard');

  const currentName = (userNameInput && userNameInput.value.trim()) ? userNameInput.value.trim() : 'Lữ Quốc Vinh';
  const peerName = peer.name || 'Đồng nghiệp';

  let currentRoom = null;
  if (window.mapEngineInstance && typeof window.mapEngineInstance.getRoomAtPosition === 'function') {
    currentRoom = window.mapEngineInstance.getRoomAtPosition(
      window.mapEngineInstance.player.x,
      window.mapEngineInstance.player.y
    );
  }
  const areaLabel = getEnglishConversationTitle(currentRoom);

  if (titleElem) titleElem.textContent = areaLabel;
  const bTitle = document.getElementById('callBadgeRoomTitle');
  if (bTitle) bTitle.textContent = areaLabel;
  if (remoteAvatar) remoteAvatar.textContent = peerName.charAt(0).toUpperCase();
  if (localAvatar) localAvatar.textContent = currentName.charAt(0).toUpperCase();
  if (card) card.title = `Đang trò chuyện với ${peerName}`;

  section.classList.remove('hidden');
}

function setupSidebarConversations() {
  const headerBtn = document.getElementById('conversationsHeaderBtn');
  const section = document.getElementById('sidebarConversationsSection');
  const card = document.getElementById('activeConversationCard');

  if (headerBtn && section) {
    headerBtn.addEventListener('click', () => {
      section.classList.toggle('collapsed');
    });
  }

  if (card) {
    card.addEventListener('click', () => {
      if (window.mapEngineInstance && window.activeProximityPeer) {
        window.mapEngineInstance.camera.x = window.mapEngineInstance.player.x;
        window.mapEngineInstance.camera.y = window.mapEngineInstance.player.y;
        window.mapEngineInstance.clampCamera();
      }
    });
  }
}

window.showProximityVideoBar = showProximityVideoBar;
window.hideProximityVideoBar = hideProximityVideoBar;
window.updateSidebarConversationsUI = updateSidebarConversationsUI;

function setupSpatialRoomDetection() {
  if (!window.mapEngineInstance) return;

  // Initialize WebRTC Manager with socket
  if (window.webrtcManager && socket) {
    window.webrtcManager.init(socket, mediaStream);
    window.webrtcManager.onStreamAdded = (peerId, stream) => {
      renderRemoteVideoTile(peerId, stream);
      const inGroup = (window.activeCallPeers && window.activeCallPeers.has(peerId))
        || (window.activeProximityPeer && window.activeProximityPeer.id === peerId);
      if (inGroup) {
        if (window.remoteScreenSharingPeerId === peerId) {
          const shareVideo = document.getElementById('callScreenShareVideo');
          if (shareVideo) {
            shareVideo.srcObject = stream;
            playScreenShareVideoSafely(shareVideo, false);
          }
        } else {
          renderGroupCallVideoCards();
          if (typeof window.syncWhiteboardParticipantsUI === 'function') {
            window.syncWhiteboardParticipantsUI();
          }
        }
      }
    };
    window.webrtcManager.onStreamRemoved = (peerId) => {
      removeRemoteVideoTile(peerId);
      if ((window.activeCallPeers && window.activeCallPeers.has(peerId))
        || (window.activeProximityPeer && window.activeProximityPeer.id === peerId)) {
        renderGroupCallVideoCards();
        if (typeof window.syncWhiteboardParticipantsUI === 'function') {
          window.syncWhiteboardParticipantsUI();
        }
      }
    };
  }

  window.mapEngineInstance.onRoomChange = (newRoom, oldRoom) => {
    // 1. Khi bước ra khỏi phòng cũ
    if (oldRoom && (!newRoom || newRoom.id !== oldRoom.id)) {
      console.log(`[Spatial] Left room: ${oldRoom.name}`);
      if (socket && socket.connected) {
        socket.emit('ROOM_LEAVE', { roomId: oldRoom.id });
      }
      if (window.webrtcManager) {
        window.webrtcManager.leaveMeetingRoom();
      }
      hideMeetingVideoGridUI();
    }

    // 2. Khi bước vào phòng mới
    if (newRoom) {
      console.log(`[Spatial] Entered room: ${newRoom.name} (${newRoom.id})`);
      showRoomBannerToast(`Bạn đã bước vào ${newRoom.name}`);

      if (socket && socket.connected) {
        socket.emit('ROOM_JOIN', {
          roomId: newRoom.id,
          roomName: newRoom.name
        });
      }

      // Kích hoạt giao diện Video Grid nếu là phòng họp/phòng thảo luận
      if (newRoom.isMeetingRoom) {
        showMeetingVideoGridUI(newRoom.name);
      }

      // Kích hoạt trạng thái sóng tín hiệu đang ở trong phòng
      document.querySelectorAll('.dock-avatar-btn').forEach(btn => {
        btn.classList.add('in-active-room');
        btn.title = `Tài khoản (${userNameInput ? userNameInput.value.trim() : 'Bạn'} đang trong ${newRoom.name})`;
      });
    } else {
      showRoomBannerToast('Bạn đang ở Hành lang');
      document.querySelectorAll('.dock-avatar-btn').forEach(btn => {
        btn.classList.remove('in-active-room');
        btn.title = `Tài khoản (${userNameInput ? userNameInput.value.trim() : 'Bạn'} - Đang phát tín hiệu)`;
      });
    }
    updateOnlineRoster();
    updateSidebarConversationsUI();
    if (typeof window.syncLobbyMusicState === 'function') {
      window.syncLobbyMusicState();
    }
  };
}

// State variables
let isCameraOn = false;
let isMicOn = false;
let mediaStream = null;
let activeDropdown = null;

// DOM Elements - Screens
const prejoinView = document.getElementById('prejoinView');
const officeView = document.getElementById('officeView');
const chatView = document.getElementById('chatView');
const calendarView = document.getElementById('calendarView');
const activityView = document.getElementById('activityView');

// Dock navigation buttons
const navChatBtns = document.querySelectorAll('.nav-chat-btn');
const navOfficeBtns = document.querySelectorAll('.nav-office-btn');
const navCalendarBtns = document.querySelectorAll('.nav-calendar-btn');
const navActivityBtns = document.querySelectorAll('.nav-activity-btn');
const leaveRoomBtns = document.querySelectorAll('.btn-leave-room');

// Prejoin elements
const videoDisplay = document.getElementById('videoDisplay');
const webcamVideo = document.getElementById('webcamVideo');
const cameraOffState = document.getElementById('cameraOffState');
const toggleMicBtn = document.getElementById('toggleMicBtn');
const toggleCamBtn = document.getElementById('toggleCamBtn');
const micMenuBtn = document.getElementById('micMenuBtn');
const camMenuBtn = document.getElementById('camMenuBtn');
const deviceDropdown = document.getElementById('deviceDropdown');
const dropdownTitle = document.getElementById('dropdownTitle');
const deviceList = document.getElementById('deviceList');
const userNameInput = document.getElementById('userNameInput');

// Chat elements
const chatMessageForm = document.getElementById('chatMessageForm');
const chatTextInput = document.getElementById('chatTextInput');
const dynamicMessagesList = document.getElementById('dynamicMessagesList');
const chatMessagesContainer = document.getElementById('chatMessagesContainer');

// Global User display elements
const userDisplayNames = document.querySelectorAll('.user-display-name');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  setupNavigation();
  setupPanelCollapse();
  setupMediaControls();
  setupChatMessaging();
  setupCharacterSelection();
  setupWhiteboardButtons();
  setupPeopleSearch();
  setupUserProfileCard();
  setupLeaveConversationModal();
  setupSidebarConversations();
  setupCallLockControls();
  setupDockEmojiAndChat();
  loadSavedSettings();
  updateMicrophoneUI(isMicOn);
  updateCameraUI(isCameraOn);
  updateOnlineRoster();
  setTimeout(() => {
    setupNetworkMovementSync();
    setupSpatialRoomDetection();
    if (window.whiteboardManager && socket) {
      window.whiteboardManager.init(socket);
    }
  }, 150);
});

/**
 * Show or hide in-call bottom dock actions (Whiteboard and Screen Share).
 * @param {boolean} inCall Whether a proximity/video call is currently active.
 */
function updateCallDockActions(inCall) {
  const bottomDock = document.querySelector('.widget-bottom-dock');
  if (bottomDock) {
    bottomDock.classList.toggle('in-call', !!inCall);
  }
  const wbBtn = document.getElementById('dockWhiteboardBtn');
  const ssBtn = document.getElementById('dockScreenShareBtn');
  [wbBtn, ssBtn].forEach(btn => {
    if (!btn) return;
    btn.classList.toggle('hidden', !inCall);
    if (!inCall) btn.classList.remove('active');
  });
}

function setupWhiteboardButtons() {
  const dockWbBtn = document.getElementById('dockWhiteboardBtn');
  const dockSsBtn = document.getElementById('dockScreenShareBtn');

  if (dockWbBtn) {
    dockWbBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const modal = document.getElementById('whiteboardModal');
      if (!window.whiteboardManager || !modal) return;
      if (modal.classList.contains('hidden')) {
        const me = window.mapEngineInstance;
        const currentRoom = me
          ? ((typeof me.getRoomAtPosition === 'function' ? me.getRoomAtPosition(me.player.x, me.player.y) : null) || me.currentRoom)
          : null;
        let boardId = currentRoom ? currentRoom.id : 'general';
        let roomName = currentRoom ? currentRoom.name : 'Văn phòng chung';
        if (!currentRoom && socket && socket.id) {
          const peerIds = window.activeCallPeers && window.activeCallPeers.size > 0
            ? Array.from(window.activeCallPeers.keys())
            : (window.activeProximityPeer && window.activeProximityPeer.id ? [window.activeProximityPeer.id] : []);
          if (peerIds.length > 0) {
            boardId = `call_${[socket.id, ...peerIds].sort().join('_')}`;
            roomName = peerIds.length > 1
              ? `Cuộc gọi nhóm (${peerIds.length + 1} người)`
              : `Cuộc gọi với ${(window.activeProximityPeer && window.activeProximityPeer.name) || 'Đồng nghiệp'}`;
          }
        }
        const myName = (userNameInput && userNameInput.value.trim()) ? userNameInput.value.trim() : (me?.player?.name || 'Bạn');
        window.whiteboardManager.localUserName = myName;
        window.whiteboardManager.open(boardId, roomName);
        dockWbBtn.classList.add('active');
      } else {
        window.whiteboardManager.close();
        dockWbBtn.classList.remove('active');
      }
    });
  }

  if (dockSsBtn) {
    dockSsBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (window.isLocalScreenSharing) {
        stopScreenShare(true);
      } else {
        openScreenShareModal();
      }
    });
  }

  setupScreenShareUI();
}

const SCREEN_SHARE_SOURCES = [
  { id: 'entire-screen', name: 'Toàn màn hình', appIcon: '', appBg: 'transparent', theme: 'desktop' },
  { id: 'gather-desktop', name: 'Gather Desktop', appIcon: 'G', appBg: '#4f46e5', theme: 'gather' },
  { id: 'chrome-prejoin', name: 'Muted - Phòng họp của QV | Gather ...', appIcon: 'C', appBg: '#16a34a', theme: 'browser' },
  { id: 'dark-notes', name: 'Đánh Giá Và Định Hướng Đồ...', appIcon: 'A', appBg: '#0284c7', theme: 'darkapp' },
  { id: 'whiteboard-win', name: 'Bảng trắng cộng tác (Whiteboard)', appIcon: 'W', appBg: '#0b57a4', theme: 'whiteboard' },
  { id: 'code-editor', name: 'Gather Space - Visual Studio Code', appIcon: '</>', appBg: '#007acc', theme: 'code' }
];

let selectedScreenSourceId = 'entire-screen';
let activeScreenShareStream = null;
let fallbackCaptureRaf = null;
window.isLocalScreenSharing = false;

function drawScreenSourceThumbnail(canvas, src) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  if (src.theme === 'desktop' || src.theme === 'gather') {
    const mapCanvas = document.getElementById('officeMapCanvas');
    if (mapCanvas && mapCanvas.width > 0 && mapCanvas.height > 0) {
      ctx.drawImage(mapCanvas, 0, 0, w, h);
      ctx.fillStyle = 'rgba(0,0,0,0.42)';
      ctx.fillRect(0, 0, w, h);
    } else {
      ctx.fillStyle = '#416d3b';
      ctx.fillRect(0, 0, w, h);
    }
    // Mini "Share your screen" nested frame like Gather Desktop preview
    ctx.fillStyle = '#1b1c20';
    ctx.fillRect(w * 0.16, h * 0.1, w * 0.68, h * 0.72);
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.strokeRect(w * 0.16, h * 0.1, w * 0.68, h * 0.72);
    ctx.fillStyle = '#475df5';
    ctx.fillRect(w * 0.66, h * 0.68, w * 0.14, h * 0.08);
    if (src.theme === 'desktop') {
      ctx.fillStyle = '#111827';
      ctx.fillRect(0, h * 0.9, w, h * 0.1);
    }
  } else if (src.theme === 'browser') {
    ctx.fillStyle = '#e8eaed';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, 24);
    ctx.fillStyle = '#27282b';
    ctx.fillRect(w * 0.1, h * 0.24, w * 0.48, h * 0.56);
    ctx.fillStyle = '#3b5bf5';
    ctx.fillRect(w * 0.66, h * 0.52, w * 0.24, h * 0.1);
  } else if (src.theme === 'darkapp') {
    ctx.fillStyle = '#121316';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#1e2028';
    ctx.fillRect(0, 0, 38, h);
    ctx.fillStyle = '#2a2d36';
    ctx.fillRect(54, 24, w - 74, 26);
    ctx.fillRect(54, 64, w - 94, 52);
  } else if (src.theme === 'whiteboard') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#e5e7eb';
    for (let x = 20; x < w; x += 20) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
    for (let y = 20; y < h; y += 20) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 2;
    ctx.strokeRect(60, 44, 110, 68);
  } else {
    ctx.fillStyle = '#1e1e1e';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#252526';
    ctx.fillRect(0, 0, 44, h);
    ctx.fillStyle = '#569cd6';
    ctx.fillRect(58, 28, 90, 6);
    ctx.fillStyle = '#ce9178';
    ctx.fillRect(68, 44, 120, 6);
    ctx.fillStyle = '#6a9955';
    ctx.fillRect(58, 60, 140, 6);
  }
}

function renderScreenShareSources() {
  const grid = document.getElementById('ssSourcesGrid');
  if (!grid) return;
  grid.innerHTML = '';

  SCREEN_SHARE_SOURCES.forEach(src => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = `ss-source-card${src.id === selectedScreenSourceId ? ' selected' : ''}`;
    card.dataset.sourceId = src.id;

    const thumbBox = document.createElement('div');
    thumbBox.className = 'ss-source-thumb-box';
    const thumbCanvas = document.createElement('canvas');
    thumbCanvas.className = 'ss-source-thumb-canvas';
    thumbCanvas.width = 280;
    thumbCanvas.height = 175;
    drawScreenSourceThumbnail(thumbCanvas, src);
    thumbBox.appendChild(thumbCanvas);

    const labelRow = document.createElement('div');
    labelRow.className = 'ss-source-label-row';
    if (src.appIcon) {
      const icon = document.createElement('span');
      icon.className = 'ss-source-app-icon';
      icon.style.background = src.appBg;
      icon.style.color = '#ffffff';
      icon.textContent = src.appIcon;
      labelRow.appendChild(icon);
    }
    const label = document.createElement('span');
    label.className = 'ss-source-name';
    label.textContent = src.name;
    labelRow.appendChild(label);

    card.appendChild(thumbBox);
    card.appendChild(labelRow);

    card.addEventListener('click', () => {
      selectedScreenSourceId = src.id;
      grid.querySelectorAll('.ss-source-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
    });
    card.addEventListener('dblclick', () => {
      selectedScreenSourceId = src.id;
      startScreenShareFromSelection();
    });

    grid.appendChild(card);
  });
}

function openScreenShareModal() {
  const modal = document.getElementById('screenShareModal');
  if (!modal) return;
  renderScreenShareSources();
  modal.classList.remove('hidden');
}

function closeScreenShareModal() {
  const modal = document.getElementById('screenShareModal');
  if (modal) modal.classList.add('hidden');
}
window.closeScreenShareModal = closeScreenShareModal;

function createFallbackScreenStream(sourceObj, fps = 15) {
  const off = document.createElement('canvas');
  off.width = 640;
  off.height = 400;
  const ctx = off.getContext('2d');
  const paintFrame = () => {
    drawScreenSourceThumbnail(off, sourceObj);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.fillRect(14, 14, 240, 26);
    ctx.fillStyle = '#ffffff';
    ctx.font = '600 13px Inter, sans-serif';
    ctx.fillText(`Sharing: ${sourceObj.name}`, 24, 31);
  };
  paintFrame();
  if (fallbackCaptureRaf) clearInterval(fallbackCaptureRaf);
  fallbackCaptureRaf = setInterval(() => {
    if (!window.isLocalScreenSharing) {
      clearInterval(fallbackCaptureRaf);
      fallbackCaptureRaf = null;
      return;
    }
    paintFrame();
  }, Math.round(1000 / Math.max(5, fps)));
  return off.captureStream(fps);
}

async function startScreenShareFromSelection() {
  const sourceObj = SCREEN_SHARE_SOURCES.find(s => s.id === selectedScreenSourceId) || SCREEN_SHARE_SOURCES[0];
  const optimizeVideo = !!document.getElementById('shareOptOptimizeVideo')?.checked;
  const shareAudio = !!document.getElementById('shareOptComputerAudio')?.checked;

  closeScreenShareModal();

  let stream = null;
  try {
    const canPromptDisplay = !navigator.webdriver
      && navigator.mediaDevices
      && typeof navigator.mediaDevices.getDisplayMedia === 'function';
    if (canPromptDisplay) {
      stream = await navigator.mediaDevices.getDisplayMedia({
        video: optimizeVideo ? { frameRate: { ideal: 60 } } : true,
        audio: shareAudio
      });
    }
  } catch (err) {
    // User denied/cancelled desktop picker or runtime lacks desktop chooser -> fallback preview stream
    stream = null;
  }

  if (!stream) {
    stream = createFallbackScreenStream(sourceObj, optimizeVideo ? 30 : 15);
  }

  activeScreenShareStream = stream;
  window.isLocalScreenSharing = true;

  const dockSsBtn = document.getElementById('dockScreenShareBtn');
  if (dockSsBtn) {
    dockSsBtn.classList.add('active');
    dockSsBtn.title = 'Dừng chia sẻ màn hình';
  }

  const videoTrack = stream.getVideoTracks()[0];
  if (videoTrack) {
    videoTrack.onended = () => stopScreenShare(true);
    if (window.webrtcManager && typeof window.webrtcManager.replaceVideoTrackForPeers === 'function') {
      window.webrtcManager.replaceVideoTrackForPeers(videoTrack);
    }
  }

  // Show presentation stage locally
  const stage = document.getElementById('callScreenShareStage');
  const badge = document.getElementById('callScreenShareBadge');
  const videoEl = document.getElementById('callScreenShareVideo');
  const stopBtn = document.getElementById('callStopScreenShareBtn');
  if (stage) stage.classList.remove('hidden');
  if (badge) badge.textContent = `Bạn đang chia sẻ màn hình: ${sourceObj.name}`;
  if (stopBtn) stopBtn.classList.remove('hidden');
  if (videoEl) {
    videoEl.srcObject = stream;
    videoEl.muted = true;
    videoEl.play().catch(() => {});
  }

  const shareTargets = window.activeCallPeers && window.activeCallPeers.size > 0
    ? Array.from(window.activeCallPeers.keys())
    : (window.activeProximityPeer && window.activeProximityPeer.id ? [window.activeProximityPeer.id] : []);
  if (shareTargets.length > 0 && socket && socket.connected) {
    socket.emit('SCREEN_SHARE_STATE', {
      targetPeerIds: shareTargets,
      targetPeerId: shareTargets[0],
      isSharing: true,
      sourceLabel: sourceObj.name,
      optimizeVideo,
      shareAudio
    });
  }
}

function stopScreenShare(notifyPeer = true) {
  if (fallbackCaptureRaf) {
    clearInterval(fallbackCaptureRaf);
    fallbackCaptureRaf = null;
  }
  if (activeScreenShareStream) {
    activeScreenShareStream.getTracks().forEach(t => t.stop());
    activeScreenShareStream = null;
  }
  const wasSharing = window.isLocalScreenSharing;
  window.isLocalScreenSharing = false;

  const dockSsBtn = document.getElementById('dockScreenShareBtn');
  if (dockSsBtn) {
    dockSsBtn.classList.remove('active');
    dockSsBtn.title = 'Chia sẻ màn hình';
  }

  const stage = document.getElementById('callScreenShareStage');
  const videoEl = document.getElementById('callScreenShareVideo');
  if (videoEl) videoEl.srcObject = null;
  if (stage) stage.classList.add('hidden');
  setScreenShareExpanded(false);

  if (window.webrtcManager) {
    const restoreStream = mediaStream || window.webrtcManager.localStream || window.webrtcManager.getOrCreatePlaceholderStream();
    const restoreTrack = restoreStream && restoreStream.getVideoTracks ? restoreStream.getVideoTracks()[0] : null;
    if (restoreTrack && typeof window.webrtcManager.replaceVideoTrackForPeers === 'function') {
      window.webrtcManager.replaceVideoTrackForPeers(restoreTrack);
    }
  }

  const stopTargets = window.activeCallPeers && window.activeCallPeers.size > 0
    ? Array.from(window.activeCallPeers.keys())
    : (window.activeProximityPeer && window.activeProximityPeer.id ? [window.activeProximityPeer.id] : []);
  if (wasSharing && notifyPeer && stopTargets.length > 0 && socket && socket.connected) {
    socket.emit('SCREEN_SHARE_STATE', {
      targetPeerIds: stopTargets,
      targetPeerId: stopTargets[0],
      isSharing: false,
      sourceLabel: ''
    });
  }
}
window.stopScreenShare = stopScreenShare;

function applyRemoteScreenShareState(senderPeerId, isSharing, sourceLabel) {
  if (window.isLocalScreenSharing) return;
  const stage = document.getElementById('callScreenShareStage');
  const badge = document.getElementById('callScreenShareBadge');
  const videoEl = document.getElementById('callScreenShareVideo');
  const stopBtn = document.getElementById('callStopScreenShareBtn');
  if (!stage) return;

  if (!isSharing) {
    const prevPeerId = window.remoteScreenSharingPeerId || senderPeerId;
    window.remoteScreenSharingPeerId = null;
    if (videoEl) videoEl.srcObject = null;
    stage.classList.add('hidden');
    setScreenShareExpanded(false);
    if (prevPeerId && window.webrtcManager?.remoteStreams?.has(prevPeerId)) {
      const s = window.webrtcManager.remoteStreams.get(prevPeerId);
      setTimeout(() => attachRemoteCallVideoIfReal(s), 200);
    } else {
      attachRemoteCallVideoIfReal(null);
    }
    return;
  }

  window.remoteScreenSharingPeerId = senderPeerId || null;
  const peerName = (window.activeProximityPeer && window.activeProximityPeer.name) || 'Đồng nghiệp';
  if (badge) badge.textContent = `${peerName} đang chia sẻ màn hình: ${sourceLabel || 'Toàn màn hình'}`;
  if (stopBtn) stopBtn.classList.add('hidden');
  stage.classList.remove('hidden');
  attachRemoteCallVideoIfReal(null);

  if (videoEl && window.webrtcManager && window.webrtcManager.remoteStreams && senderPeerId) {
    const remoteStream = window.webrtcManager.remoteStreams.get(senderPeerId);
    if (remoteStream) {
      videoEl.srcObject = remoteStream;
      playScreenShareVideoSafely(videoEl, false);
    }
  }
}
window.applyRemoteScreenShareState = applyRemoteScreenShareState;

function playScreenShareVideoSafely(videoEl, preferMuted = false) {
  if (!videoEl) return;
  videoEl.muted = !!preferMuted;
  videoEl.play().catch(() => {
    videoEl.muted = true;
    videoEl.play().catch(() => {});
  });
}

function setScreenShareExpanded(expanded) {
  const stage = document.getElementById('callScreenShareStage');
  const bar = document.getElementById('proximityVideoBar');
  const btn = document.getElementById('callExpandScreenShareBtn');
  if (stage) stage.classList.toggle('expanded', !!expanded);
  if (bar) bar.classList.toggle('screenshare-expanded', !!expanded);
  if (btn) {
    const iconExpand = btn.querySelector('.icon-ss-expand');
    const iconCollapse = btn.querySelector('.icon-ss-collapse');
    if (iconExpand) iconExpand.classList.toggle('hidden', !!expanded);
    if (iconCollapse) iconCollapse.classList.toggle('hidden', !expanded);
    const title = expanded ? 'Thu nhỏ màn hình chia sẻ' : 'Phóng to màn hình chia sẻ';
    btn.title = title;
    btn.setAttribute('aria-label', title);
  }
}
window.setScreenShareExpanded = setScreenShareExpanded;

function setupScreenShareUI() {
  const closeBtn = document.getElementById('screenShareCloseBtn');
  const overlay = document.getElementById('screenShareOverlay');
  const confirmBtn = document.getElementById('screenShareConfirmBtn');
  const stopBtn = document.getElementById('callStopScreenShareBtn');
  const expandBtn = document.getElementById('callExpandScreenShareBtn');
  const shareVideo = document.getElementById('callScreenShareVideo');

  if (closeBtn) closeBtn.addEventListener('click', closeScreenShareModal);
  if (overlay) overlay.addEventListener('click', closeScreenShareModal);
  if (confirmBtn) confirmBtn.addEventListener('click', () => startScreenShareFromSelection());
  if (stopBtn) stopBtn.addEventListener('click', () => stopScreenShare(true));
  if (expandBtn) {
    expandBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const stage = document.getElementById('callScreenShareStage');
      setScreenShareExpanded(!(stage && stage.classList.contains('expanded')));
    });
  }
  if (shareVideo) {
    shareVideo.addEventListener('dblclick', () => {
      const stage = document.getElementById('callScreenShareStage');
      setScreenShareExpanded(!(stage && stage.classList.contains('expanded')));
    });
  }
}

// Bottom Dock Overhead Emoji Reactions & Quick Speech Bubble Chat
function setupDockEmojiAndChat() {
  const emoteBtn = document.getElementById('dockEmoteBtn');
  const thoughtBtn = document.getElementById('dockThoughtBtn');
  const emojiPopover = document.getElementById('dockEmojiPopover');
  const chatPopover = document.getElementById('dockChatPopover');
  const emojiCloseBtn = document.getElementById('dockEmojiCloseBtn');
  const emojiGrid = document.getElementById('dockEmojiGrid');
  const chatForm = document.getElementById('overheadChatForm');
  const chatInput = document.getElementById('overheadChatInput');

  function closeAllDockPopovers() {
    if (emojiPopover) emojiPopover.classList.add('hidden');
    if (chatPopover) chatPopover.classList.add('hidden');
    if (emoteBtn) emoteBtn.classList.remove('active');
    if (thoughtBtn) thoughtBtn.classList.remove('active');
  }

  if (emoteBtn && emojiPopover) {
    emoteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const willOpen = emojiPopover.classList.contains('hidden');
      closeAllDockPopovers();
      if (willOpen) {
        emojiPopover.classList.remove('hidden');
        emoteBtn.classList.add('active');
      }
    });
  }

  if (emojiCloseBtn) {
    emojiCloseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeAllDockPopovers();
    });
  }

  if (emojiGrid) {
    emojiGrid.addEventListener('click', (e) => {
      const btn = e.target.closest('.dock-emoji-item');
      if (!btn) return;
      e.stopPropagation();
      const emoji = btn.getAttribute('data-emoji') || btn.textContent.trim();
      if (!emoji) return;

      if (window.mapEngineInstance && typeof window.mapEngineInstance.triggerOverheadEmoji === 'function') {
        window.mapEngineInstance.triggerOverheadEmoji(emoji);
      }
      if (socket && socket.connected) {
        socket.emit('PLAYER_EMOTE', { emoji });
      }
      closeAllDockPopovers();
    });
  }

  if (thoughtBtn && chatPopover) {
    thoughtBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const willOpen = chatPopover.classList.contains('hidden');
      closeAllDockPopovers();
      if (willOpen) {
        chatPopover.classList.remove('hidden');
        thoughtBtn.classList.add('active');
        if (chatInput) {
          setTimeout(() => chatInput.focus(), 20);
        }
      }
    });
  }

  if (chatForm && chatInput) {
    chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const text = chatInput.value.trim();
      if (!text) return;

      if (window.mapEngineInstance && typeof window.mapEngineInstance.triggerOverheadChat === 'function') {
        window.mapEngineInstance.triggerOverheadChat(text);
      }
      if (socket && socket.connected) {
        socket.emit('PLAYER_CHAT_BUBBLE', { text });
      }
      chatInput.value = '';
      closeAllDockPopovers();
    });
  }

  // Prevent clicks inside popovers from bubbling to map canvas
  [emojiPopover, chatPopover].forEach(pop => {
    if (pop) {
      pop.addEventListener('click', (e) => e.stopPropagation());
    }
  });

  // Close on outside click or Escape key
  document.addEventListener('click', () => {
    closeAllDockPopovers();
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAllDockPopovers();
    }
  });
}

// Navigation logic
function setupNavigation() {
  // Join Office form & button triggers
  const joinForm = document.getElementById('joinForm');
  if (joinForm) {
    joinForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleJoin();
    });
  }
  const joinBtn = document.getElementById('joinBtn');
  if (joinBtn) {
    joinBtn.addEventListener('click', (e) => {
      e.preventDefault();
      handleJoin();
    });
  }

  // Dock items
  navChatBtns.forEach(btn => {
    btn.addEventListener('click', () => switchView('chat'));
  });

  navOfficeBtns.forEach(btn => {
    btn.addEventListener('click', () => switchView('office'));
  });

  navCalendarBtns.forEach(btn => {
    btn.addEventListener('click', () => switchView('calendar'));
  });

  navActivityBtns.forEach(btn => {
    btn.addEventListener('click', () => switchView('activity'));
  });

  // Calendar segment tabs
  const tabScheduled = document.getElementById('tabScheduled');
  const tabNotes = document.getElementById('tabNotes');
  if (tabScheduled && tabNotes) {
    tabScheduled.addEventListener('click', () => {
      tabScheduled.classList.add('active');
      tabNotes.classList.remove('active');
    });
    tabNotes.addEventListener('click', () => {
      tabNotes.classList.add('active');
      tabScheduled.classList.remove('active');
    });
  }

  // Activity controls
  const btnMarkAllRead = document.getElementById('btnMarkAllRead');
  const unreadsToggle = document.getElementById('unreadsToggle');
  const activityItems = document.querySelectorAll('.activity-item-card');
  const notificationBadges = document.querySelectorAll('.notification-count');

  if (btnMarkAllRead) {
    btnMarkAllRead.addEventListener('click', () => {
      activityItems.forEach(item => item.classList.remove('unread'));
      notificationBadges.forEach(badge => badge.style.display = 'none');
    });
  }

  if (unreadsToggle) {
    unreadsToggle.addEventListener('change', () => {
      const showOnlyUnread = unreadsToggle.checked;
      activityItems.forEach(item => {
        if (showOnlyUnread && !item.classList.contains('unread')) {
          item.style.display = 'none';
        } else {
          item.style.display = 'flex';
        }
      });
    });
  }

  // Leave room / conversation buttons
  leaveRoomBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      // If user is currently in a conversation/call, prompt to leave conversation!
      const inActiveCall = (window.activeCallPeers && window.activeCallPeers.size > 0) || !!window.activeProximityPeer;
      if (inActiveCall) {
        showLeaveConversationModal(() => {
          hideProximityVideoBar(true);
          showRoomBannerToast('Đã rời cuộc trò chuyện.');
        });
        return;
      }

      if (confirm('Bạn có muốn rời không gian làm việc và quay lại màn hình sảnh?')) {
        if (socket && socket.connected) {
          socket.emit('PLAYER_LEAVE');
        }
        if (window.webrtcManager) {
          window.webrtcManager.leaveMeetingRoom();
        }
        hideMeetingVideoGridUI();
        if (window.mapEngineInstance) {
          window.mapEngineInstance.setRemotePlayers([]);
        }
        switchView('prejoin');
      }
    });
  });
}

// Collapsible Left Panel Logic (Gather Town Authentic Style)
function setupPanelCollapse() {
  const sidebar = document.querySelector('.office-left-sidebar');
  const collapseBtn = document.getElementById('officePanelCollapseBtn');
  const expandBtn = document.getElementById('officePanelExpandBtn');

  function setPanelCollapsed(isCollapsed, persist = true) {
    if (!sidebar) return;
    if (isCollapsed) {
      sidebar.classList.add('collapsed');
      // Hide floating expand button during an active call so it doesn't peek behind the call pill
      if (expandBtn) {
        if (window.activeProximityPeer) {
          expandBtn.classList.add('hidden');
        } else {
          expandBtn.classList.remove('hidden');
        }
      }
    } else {
      sidebar.classList.remove('collapsed');
      if (expandBtn) expandBtn.classList.add('hidden');
    }
    if (persist) {
      try {
        localStorage.setItem('gather_sidebar_collapsed', isCollapsed ? 'true' : 'false');
      } catch (e) {}
    }

    // Resize canvas smoothly during and after the 240ms CSS width transition
    const triggerResize = () => {
      if (window.mapEngineInstance && typeof window.mapEngineInstance.resizeCanvas === 'function') {
        window.mapEngineInstance.resizeCanvas();
      }
      window.dispatchEvent(new Event('resize'));
    };
    setTimeout(triggerResize, 120);
    setTimeout(triggerResize, 270);
  }

  window.setOfficePanelCollapsed = setPanelCollapsed;

  if (collapseBtn) {
    collapseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      setPanelCollapsed(true);
    });
  }

  if (expandBtn) {
    expandBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      setPanelCollapsed(false);
    });
  }

  // Clicking office dock icon when already in office view restores panel if collapsed
  navOfficeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (officeView && !officeView.classList.contains('hidden')) {
        if (sidebar && sidebar.classList.contains('collapsed')) {
          setPanelCollapsed(false);
        }
      }
    });
  });

  // Restore saved collapse state
  try {
    const saved = localStorage.getItem('gather_sidebar_collapsed');
    if (saved === 'true') {
      setPanelCollapsed(true);
    }
  } catch (e) {}
}

function switchView(viewName) {
  // Hide all screens
  if (prejoinView) prejoinView.classList.add('hidden');
  if (officeView) officeView.classList.add('hidden');
  if (chatView) chatView.classList.add('hidden');
  if (calendarView) calendarView.classList.add('hidden');
  if (activityView) activityView.classList.add('hidden');

  const currentName = userNameInput ? (userNameInput.value.trim() || 'Lữ Quốc Vinh') : 'Lữ Quốc Vinh';
  updateUserNames(currentName);

  if (viewName === 'office') {
    if (officeView) officeView.classList.remove('hidden');
    if (window.mapEngineInstance) {
      window.mapEngineInstance.resizeCanvas();
      setTimeout(() => window.mapEngineInstance.resizeCanvas(), 50);
    }
  } else if (viewName === 'chat') {
    if (chatView) chatView.classList.remove('hidden');
    if (typeof window.updateChatSidebarUsers === 'function') window.updateChatSidebarUsers();
    if (typeof window.renderActiveChatThread === 'function') window.renderActiveChatThread();
    if (typeof window.syncChatMiniCallDock === 'function') window.syncChatMiniCallDock();
  } else if (viewName === 'calendar') {
    if (calendarView) calendarView.classList.remove('hidden');
  } else if (viewName === 'activity') {
    if (activityView) activityView.classList.remove('hidden');
  } else {
    if (prejoinView) prejoinView.classList.remove('hidden');
  }
  if (typeof window.syncLobbyMusicState === 'function') {
    window.syncLobbyMusicState();
  }
}

function updateUserNames(name) {
  userDisplayNames.forEach(el => {
    el.textContent = name;
  });
  const initialChar = (name || 'L').trim().charAt(0).toUpperCase();
  document.querySelectorAll('.dock-user-avatar').forEach(el => {
    el.textContent = initialChar;
  });
  updateOnlineRoster();
}

// Sidebar Online Roster Management & People Search
function setupPeopleSearch() {
  const searchInput = document.getElementById('peopleSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      updateOnlineRoster();
    });
  }

  // Ctrl + F / Cmd + F Shortcut to focus search input
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
      const office = document.getElementById('officeView');
      if (office && !office.classList.contains('hidden')) {
        const input = document.getElementById('peopleSearchInput');
        if (input) {
          e.preventDefault();
          input.focus();
          input.select();
        }
      }
    }
  });
}

const avatarColors = [
  { bg: '#dbeafe', text: '#1e40af', border: '#3b82f6' }, // Blue
  { bg: '#fce7f3', text: '#9d174d', border: '#ec4899' }, // Pink
  { bg: '#ede9fe', text: '#5b21b6', border: '#8b5cf6' }, // Purple
  { bg: '#dcfce7', text: '#166534', border: '#22c55e' }, // Green
  { bg: '#fef3c7', text: '#92400e', border: '#f59e0b' }, // Amber
  { bg: '#cffafe', text: '#155e75', border: '#06b6d4' }, // Cyan
  { bg: '#ffe4e6', text: '#9f1239', border: '#f43f5e' }  // Rose
];

function getColorForString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const idx = Math.abs(hash) % avatarColors.length;
  return avatarColors[idx];
}

function updateOnlineRoster() {
  if (typeof window.updateChatSidebarUsers === 'function') {
    window.updateChatSidebarUsers();
  }
  const container = document.getElementById('onlineUsersList');
  const countLabel = document.getElementById('onlineCountLabel');
  const searchInput = document.getElementById('peopleSearchInput');
  if (!container) return;

  const query = (searchInput ? searchInput.value : '').trim().toLowerCase();
  const localName = (userNameInput && userNameInput.value.trim()) || 'Bạn';
  const currentRoom = window.mapEngineInstance ? window.mapEngineInstance.currentRoom : null;
  const localRoomName = currentRoom ? currentRoom.name : 'Active';

  // Get current remote players from mapEngine or cache
  let remotes = [];
  if (window.mapEngineInstance && window.mapEngineInstance.remotePlayers) {
    remotes = Array.from(window.mapEngineInstance.remotePlayers.values()).filter(rp => !rp.isNpc);
  } else {
    remotes = (onlineRemotePlayers || []).filter(rp => !rp.isNpc);
  }

  // Total online = Local user + Remote users
  const totalCount = 1 + remotes.length;
  if (countLabel) {
    countLabel.textContent = `Online (${totalCount})`;
  }

  // Clear list
  container.innerHTML = '';

  let matchesCount = 0;

  // 1. Render Local User if matches query
  const localMatches = !query || localName.toLowerCase().includes(query);
  if (localMatches) {
    matchesCount++;
    const localFirstChar = localName.charAt(0).toUpperCase();
    const localItem = document.createElement('div');
    localItem.className = 'online-user-item local-user-item';
    localItem.title = 'Vị trí của bạn (Bạn đang ở đây)';
    localItem.innerHTML = `
      <div class="user-avatar-badge has-signal-pulse">
        <div class="user-avatar-circle" style="background: #a7f3d0; color: #065f46; border-color: #22c55e;">${escapeHtml(localFirstChar)}</div>
        <span class="online-dot"></span>
        <span class="sidebar-avatar-wave"></span>
      </div>
      <div class="user-meta">
        <div class="user-meta-name">${escapeHtml(localName)}</div>
        <div class="user-meta-status">${escapeHtml(localRoomName)} <span style="color: #6366f1; font-weight: 600;">(Bạn)</span></div>
      </div>
    `;
    localItem.addEventListener('click', () => {
      if (window.mapEngineInstance) {
        window.mapEngineInstance.camera.x = window.mapEngineInstance.player.x;
        window.mapEngineInstance.camera.y = window.mapEngineInstance.player.y;
        window.mapEngineInstance.clampCamera();
      }
    });
    container.appendChild(localItem);
  }

  // 2. Render Remote Users matching query
  remotes.forEach(p => {
    const pName = p.name || 'Đồng nghiệp';
    const matches = !query || pName.toLowerCase().includes(query);
    if (!matches) return;

    matchesCount++;
    const firstChar = pName.charAt(0).toUpperCase();
    const c = getColorForString(p.id || pName);
    const roomText = p.currentRoom ? (p.currentRoom.name || p.currentRoom) : 'Active';

    const item = document.createElement('div');
    item.className = 'online-user-item remote-user-item';
    item.title = `Nhấn để tương tác với ${escapeHtml(pName)}`;
    item.innerHTML = `
      <div class="user-avatar-badge">
        <div class="user-avatar-circle" style="background: ${c.bg}; color: ${c.text}; border-color: ${c.border};">${escapeHtml(firstChar)}</div>
        <span class="online-dot"></span>
      </div>
      <div class="user-meta">
        <div class="user-meta-name-row">
          <span class="user-meta-name">${escapeHtml(pName)}</span>
          <span class="user-badge-new">New 🎉</span>
        </div>
        <div class="user-meta-status">${escapeHtml(roomText)}</div>
      </div>
      <div class="user-actions-group">
        <button class="user-action-btn btn-wave" title="Vẫy tay chào ${escapeHtml(pName)}">
          <span class="wave-icon-mask"></span>
        </button>
        <button class="user-action-btn btn-locate" title="Go to ${escapeHtml(pName)}">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="9" stroke-dasharray="3 3"/>
            <path d="M9 12h6"/>
            <path d="m12 9 3 3-3 3"/>
          </svg>
        </button>
        <button class="user-action-btn btn-chat" title="Nhắn tin với ${escapeHtml(pName)}">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>
          </svg>
        </button>
      </div>
    `;

    // 1. Nút Vẫy tay (Wave)
    const btnWave = item.querySelector('.btn-wave');
    if (btnWave) {
      btnWave.addEventListener('click', (e) => {
        e.stopPropagation();
        btnWave.classList.add('waving-anim');
        setTimeout(() => btnWave.classList.remove('waving-anim'), 1000);
        showRoomBannerToast(`👋 Bạn đã vẫy tay chào ${pName}!`);
        if (socket && socket.connected) {
          socket.emit('USER_WAVE', {
            targetId: p.id,
            targetName: pName,
            senderName: localName
          });
          socket.emit('CHAT_SEND', {
            text: `👋 Vẫy tay chào @${pName}!`,
            scope: 'everyone',
            senderName: localName
          });
        }
      });
    }

    // 2. Nút Đi tới chỗ (Locate / Go to)
    const btnLocate = item.querySelector('.btn-locate');
    if (btnLocate) {
      btnLocate.addEventListener('click', (e) => {
        e.stopPropagation();
        const startGoto = () => {
          if (window.mapEngineInstance) {
            window.mapEngineInstance.setSelectedPlayer(p);
            window.mapEngineInstance.navigateToPlayer(p);
            closeUserProfileCard(false);
            showRoomBannerToast(`📍 Đang đi tới chỗ ${pName}...`);
          }
        };

        if (window.activeProximityPeer && (window.activeProximityPeer.id !== p.id && window.activeProximityPeer.name !== pName)) {
          showLeaveConversationModal(() => {
            hideProximityVideoBar();
            startGoto();
          });
          return;
        }

        startGoto();
      });
    }

    // 3. Nút Nhắn tin (Direct Chat)
    const btnChat = item.querySelector('.btn-chat');
    if (btnChat) {
      btnChat.addEventListener('click', (e) => {
        e.stopPropagation();
        switchView('chat');
        const chatInput = document.getElementById('chatMessageInput');
        if (chatInput) {
          chatInput.focus();
          chatInput.value = `@${pName} `;
        }
        showRoomBannerToast(`💬 Mở cuộc trò chuyện với ${pName}`);
      });
    }

    // Click vào hàng hoặc tên người dùng để mở Floating User Profile Card
    item.addEventListener('click', () => {
      openUserProfileCard(p);
    });

    container.appendChild(item);
  });

  // 3. If no matches found
  if (matchesCount === 0) {
    const emptyRow = document.createElement('div');
    emptyRow.className = 'no-people-found';
    emptyRow.textContent = `Không tìm thấy "${query}"`;
    container.appendChild(emptyRow);
  }
}

// ========================================================
// FLOATING USER PROFILE CARD & DIRECT CHAT CONTROLLER
// ========================================================
let currentProfileTarget = null;
let lastProfileCardOpenedTime = 0;
const directChatHistory = new Map();

function getDmPeerKey(user) {
  if (!user) return 'unknown';
  return user.id || user.name || 'unknown';
}

function formatDmTime(ts) {
  const d = new Date(ts || Date.now());
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${hours}:${minutes} ${ampm}`;
}

function renderProfileChatMessages() {
  const listEl = document.getElementById('profileChatMessages');
  if (!listEl || !currentProfileTarget) return;

  const key = getDmPeerKey(currentProfileTarget);
  const items = directChatHistory.get(key) || [];
  listEl.innerHTML = '';

  if (items.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'profile-chat-empty-hint';
    empty.textContent = `Bắt đầu nhắn tin với ${currentProfileTarget.name || 'đồng nghiệp'}...`;
    listEl.appendChild(empty);
    return;
  }

  const divider = document.createElement('div');
  divider.className = 'profile-chat-date-divider';
  divider.textContent = 'Today';
  listEl.appendChild(divider);

  items.forEach((item) => {
    const row = document.createElement('div');
    row.className = 'profile-chat-entry';

    const avatar = document.createElement('div');
    avatar.className = 'profile-chat-entry-avatar';
    const senderName = item.senderName || 'Bạn';
    avatar.textContent = senderName.charAt(0).toUpperCase();
    const col = getColorForString(item.senderId || senderName);
    avatar.style.background = col.bg;
    avatar.style.color = col.text;

    const body = document.createElement('div');
    body.className = 'profile-chat-entry-body';

    const meta = document.createElement('div');
    meta.className = 'profile-chat-entry-meta';

    const nameSpan = document.createElement('span');
    nameSpan.className = 'profile-chat-entry-sender';
    nameSpan.textContent = senderName;

    const timeSpan = document.createElement('span');
    timeSpan.className = 'profile-chat-entry-time';
    timeSpan.textContent = formatDmTime(item.timestamp);

    meta.appendChild(nameSpan);
    meta.appendChild(timeSpan);

    const textDiv = document.createElement('div');
    textDiv.className = 'profile-chat-entry-text';
    textDiv.textContent = item.text;

    body.appendChild(meta);
    body.appendChild(textDiv);
    row.appendChild(avatar);
    row.appendChild(body);
    listEl.appendChild(row);
  });

  listEl.scrollTop = listEl.scrollHeight;
}

function recordDirectActivity(peer, entry) {
  const key = getDmPeerKey(peer);
  if (!directChatHistory.has(key)) {
    directChatHistory.set(key, []);
  }
  directChatHistory.get(key).push(entry);
  if (currentProfileTarget && getDmPeerKey(currentProfileTarget) === key) {
    renderProfileChatMessages();
  }
  if (typeof activeChatThread !== 'undefined' && activeChatThread && activeChatThread.type === 'dm' && getDmPeerKey(activeChatThread.user || activeChatThread) === key) {
    renderActiveChatThread();
  }
}
window.recordDirectActivity = recordDirectActivity;

function setProfileChatExpanded(expanded) {
  const card = document.getElementById('userProfileCard');
  const thread = document.getElementById('profileChatThread');
  const toolbar = document.getElementById('profileMsgToolbar');
  const picker = document.getElementById('profileChatEmojiPicker');
  if (!card) return;

  card.classList.toggle('chat-expanded', !!expanded);
  if (thread) thread.classList.toggle('hidden', !expanded);
  if (toolbar) toolbar.classList.toggle('hidden', !expanded);
  if (!expanded && picker) picker.classList.add('hidden');

  if (expanded) {
    renderProfileChatMessages();
  }
  if (typeof window.syncLobbyMusicState === 'function') {
    window.syncLobbyMusicState();
  }
}
window.setProfileChatExpanded = setProfileChatExpanded;

function formatProfileLocalTime() {
  const d = new Date();
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${hours}:${minutes} ${ampm} local time`;
}

function openUserProfileCard(targetUser) {
  if (!targetUser) return;
  const bar = document.getElementById('proximityVideoBar');
  if (bar && bar.classList.contains('grid-mode')) return;
  currentProfileTarget = targetUser;

  const card = document.getElementById('userProfileCard');
  if (!card) return;

  const pName = targetUser.name || 'Người dùng';
  const firstChar = pName.charAt(0).toUpperCase();

  // Avatar element & color
  const avatarEl = document.getElementById('profileCardAvatar');
  if (avatarEl) {
    avatarEl.textContent = firstChar;
    const c = getColorForString(targetUser.id || pName);
    avatarEl.style.background = c.bg;
    avatarEl.style.color = c.text;
  }

  // Name
  const nameEl = document.getElementById('profileCardName');
  if (nameEl) {
    nameEl.textContent = pName;
  }

  // Local Time
  const timeEl = document.getElementById('profileCardLocalTime');
  if (timeEl) {
    timeEl.textContent = formatProfileLocalTime();
  }

  // Message input placeholder
  const msgInput = document.getElementById('profileCardMsgInput');
  const sendBtn = document.getElementById('profileCardSendBtn');
  if (msgInput) {
    msgInput.placeholder = `Message ${pName}`;
    msgInput.value = '';
  }
  if (sendBtn) {
    sendBtn.classList.remove('has-text');
  }

  // Show card (remove hidden class)
  if (window.activeProximityPeer) {
    card.classList.add('in-call');
    const bar = document.getElementById('proximityVideoBar');
    if (bar) bar.classList.add('with-profile');
  } else {
    card.classList.remove('in-call');
    const bar = document.getElementById('proximityVideoBar');
    if (bar) bar.classList.remove('with-profile');
  }
  card.classList.remove('hidden');
  lastProfileCardOpenedTime = Date.now();

  // Keep compact card state cleanly when opening profile card
  if (!card.classList.contains('chat-expanded') || getDmPeerKey(currentProfileTarget) !== getDmPeerKey(targetUser)) {
    setProfileChatExpanded(false);
  } else {
    renderProfileChatMessages();
  }

  // Highlight selected player on map with glowing effect
  if (window.mapEngineInstance && typeof window.mapEngineInstance.setSelectedPlayer === 'function') {
    window.mapEngineInstance.setSelectedPlayer(targetUser);
  }
}

function closeUserProfileCard(clearMapSelection = false) {
  const card = document.getElementById('userProfileCard');
  if (card) {
    card.classList.add('hidden');
    card.classList.remove('in-call');
    setProfileChatExpanded(false);
  }
  const bar = document.getElementById('proximityVideoBar');
  if (bar) {
    bar.classList.remove('with-profile');
  }
  currentProfileTarget = null;

  // Clear highlight on map only if explicitly requested
  if (clearMapSelection && window.mapEngineInstance && typeof window.mapEngineInstance.setSelectedPlayer === 'function') {
    window.mapEngineInstance.setSelectedPlayer(null);
  }
}

window.openUserProfileCard = openUserProfileCard;
window.closeUserProfileCard = closeUserProfileCard;

function setupUserProfileCard() {
  const card = document.getElementById('userProfileCard');
  const closeBtn = document.getElementById('profileCardCloseBtn');
  const waveBtn = document.getElementById('profileCardWaveBtn');
  const gotoBtn = document.getElementById('profileCardGotoBtn');
  const videoBtn = document.getElementById('profileCardVideoBtn');
  const chatBtn = document.getElementById('profileCardChatBtn');
  const moreBtn = document.getElementById('profileCardMoreBtn');
  const msgForm = document.getElementById('profileCardMsgForm');
  const msgInput = document.getElementById('profileCardMsgInput');
  const sendBtn = document.getElementById('profileCardSendBtn');

  // 1. Close button
  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeUserProfileCard(true);
    });
  }

  // Re-open profile card when clicking remote video card in call
  const remoteCard = document.getElementById('remoteCallCard');
  if (remoteCard) {
    remoteCard.addEventListener('click', (e) => {
      e.stopPropagation();
      if (window.activeProximityPeer) {
        openUserProfileCard(window.activeProximityPeer);
      }
    });
  }

  // 2. Wave button (Blue Square with White Waving Hand)
  if (waveBtn) {
    waveBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!currentProfileTarget) return;
      waveBtn.classList.add('waving-anim');
      setTimeout(() => waveBtn.classList.remove('waving-anim'), 1000);
      const targetName = currentProfileTarget.name || 'Đồng nghiệp';
      const localName = (userNameInput && userNameInput.value.trim()) || 'Bạn';
      showRoomBannerToast(`👋 Bạn đã vẫy tay chào ${targetName}!`);
      recordDirectActivity(currentProfileTarget, {
        senderId: (socket && socket.id) || 'local',
        senderName: localName,
        text: `You waved at ${targetName}`,
        timestamp: Date.now(),
        isWave: true
      });
      if (socket && socket.connected) {
        socket.emit('USER_WAVE', {
          targetId: currentProfileTarget.id,
          targetName: targetName,
          senderName: localName
        });
        socket.emit('CHAT_SEND', {
          text: `👋 Vẫy tay chào @${targetName}!`,
          scope: 'everyone',
          senderName: localName
        });
      }
    });
  }

  // 3. Go to button (Blue Pill Button)
  if (gotoBtn) {
    gotoBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!currentProfileTarget) return;
      const targetName = currentProfileTarget.name || 'Đồng nghiệp';
      if (currentProfileTarget.isCallLocked && currentProfileTarget.callLockedWith && socket && socket.id && currentProfileTarget.callLockedWith !== socket.id) {
        showRoomBannerToast(`🔒 Cuộc trò chuyện của ${targetName} đang được khóa riêng tư.`);
        return;
      }
      if (window.mapEngineInstance) {
        window.mapEngineInstance.setSelectedPlayer(currentProfileTarget);
        window.mapEngineInstance.navigateToPlayer(currentProfileTarget);
        closeUserProfileCard();
        showRoomBannerToast(`📍 Đang đi tới chỗ ${targetName}...`);
      }
    });
  }

  // 4. Video button
  if (videoBtn) {
    videoBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!currentProfileTarget) return;
      const targetName = currentProfileTarget.name || 'Đồng nghiệp';
      if (currentProfileTarget.isCallLocked && currentProfileTarget.callLockedWith && socket && socket.id && currentProfileTarget.callLockedWith !== socket.id) {
        showRoomBannerToast(`🔒 Cuộc trò chuyện của ${targetName} đang được khóa riêng tư.`);
        return;
      }
      if (window.mapEngineInstance) {
        window.mapEngineInstance.setSelectedPlayer(currentProfileTarget);
        window.mapEngineInstance.navigateToPlayer(currentProfileTarget);
        closeUserProfileCard();
        showRoomBannerToast(`📹 Bắt đầu cuộc gọi video với ${targetName}...`);
      }
    });
  }

  // 5. Chat button next to video camera -> Open Full Chat View focused on DM with that user
  const backBtn = document.getElementById('profileChatBackBtn');
  const attachBtn = document.getElementById('profileChatAttachBtn');
  const fileInput = document.getElementById('profileChatFileInput');
  const mentionBtn = document.getElementById('profileChatMentionBtn');
  const emojiBtn = document.getElementById('profileChatEmojiBtn');
  const emojiPicker = document.getElementById('profileChatEmojiPicker');

  if (chatBtn) {
    chatBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const targetUser = currentProfileTarget || window.activeProximityPeer;
      if (targetUser && typeof window.openFullChatWithTarget === 'function') {
        window.openFullChatWithTarget(targetUser);
      } else {
        switchView('chat');
      }
    });
  }

  if (backBtn) {
    backBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      setProfileChatExpanded(false);
    });
  }

  if (attachBtn && fileInput) {
    attachBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      fileInput.click();
    });
    fileInput.addEventListener('change', () => {
      if (fileInput.files && fileInput.files[0] && msgInput) {
        const fname = fileInput.files[0].name;
        msgInput.value = (msgInput.value ? msgInput.value + ' ' : '') + `📎 ${fname}`;
        msgInput.dispatchEvent(new Event('input'));
        msgInput.focus();
        fileInput.value = '';
      }
    });
  }

  if (mentionBtn && msgInput) {
    mentionBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const targetName = (currentProfileTarget && currentProfileTarget.name) || '';
      if (targetName) {
        msgInput.value = (msgInput.value ? msgInput.value + ' ' : '') + `@${targetName} `;
        msgInput.dispatchEvent(new Event('input'));
      }
      msgInput.focus();
    });
  }

  if (emojiBtn && emojiPicker) {
    emojiBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      emojiPicker.classList.toggle('hidden');
    });
    emojiPicker.querySelectorAll('.profile-emoji-opt').forEach((opt) => {
      opt.addEventListener('click', (e) => {
        e.stopPropagation();
        if (msgInput) {
          msgInput.value += opt.textContent;
          msgInput.dispatchEvent(new Event('input'));
          msgInput.focus();
        }
        emojiPicker.classList.add('hidden');
      });
    });
  }

  // 6. More button (...)
  if (moreBtn) {
    moreBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!currentProfileTarget) return;
      const targetName = currentProfileTarget.name || 'Đồng nghiệp';
      showRoomBannerToast(`⚡ Tùy chọn tương tác với ${targetName}`);
    });
  }

  // 7. Input focus -> expand DM chat drawer, typing -> update send button
  if (msgInput) {
    msgInput.addEventListener('focus', () => {
      setProfileChatExpanded(true);
    });
    msgInput.addEventListener('click', (e) => {
      e.stopPropagation();
      setProfileChatExpanded(true);
    });
    msgInput.addEventListener('input', () => {
      if (sendBtn) {
        if (msgInput.value.trim().length > 0) {
          sendBtn.classList.add('has-text');
        } else {
          sendBtn.classList.remove('has-text');
        }
      }
    });
  }

  // 8. Quick message / DM form submit
  if (msgForm) {
    msgForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!currentProfileTarget || !msgInput) return;
      const text = msgInput.value.trim();
      if (!text) return;

      const targetName = currentProfileTarget.name || 'Đồng nghiệp';
      const localName = (userNameInput && userNameInput.value.trim()) || 'Bạn';

      recordDirectActivity(currentProfileTarget, {
        senderId: (socket && socket.id) || 'local',
        senderName: localName,
        text,
        timestamp: Date.now()
      });

      if (socket && socket.connected && currentProfileTarget.id) {
        socket.emit('DIRECT_DM_SEND', {
          targetId: currentProfileTarget.id,
          targetName,
          senderName: localName,
          text
        });
      }
      msgInput.value = '';
      if (sendBtn) sendBtn.classList.remove('has-text');
    });
  }

  // 9. Close when clicking outside of the profile card
  document.addEventListener('click', (e) => {
    if (!card || card.classList.contains('hidden')) return;
    // Don't close if card was just opened in this event loop turn (within 150ms)
    if (Date.now() - lastProfileCardOpenedTime < 150) return;
    if (card.contains(e.target)) return;
    if (e.target.closest('.online-user-item')) return;
    closeUserProfileCard(true);
  });
}

// ========================================================
// Leave Conversation Modal Logic (Gather Town Style)
// ========================================================
let pendingLeaveCallback = null;

function showLeaveConversationModal(onConfirmCallback) {
  if (localStorage.getItem('dontShowLeaveConversationAgain') === 'true') {
    if (typeof onConfirmCallback === 'function') {
      onConfirmCallback();
    }
    return;
  }

  pendingLeaveCallback = onConfirmCallback;
  const modal = document.getElementById('leaveConversationModal');
  const checkbox = document.getElementById('leaveModalDontShowAgain');
  if (checkbox) checkbox.checked = false;
  if (modal) {
    modal.classList.remove('hidden');
  }
}

function closeLeaveConversationModal() {
  const modal = document.getElementById('leaveConversationModal');
  if (modal) {
    modal.classList.add('hidden');
  }
  pendingLeaveCallback = null;
}

function confirmLeaveConversation() {
  const checkbox = document.getElementById('leaveModalDontShowAgain');
  if (checkbox && checkbox.checked) {
    localStorage.setItem('dontShowLeaveConversationAgain', 'true');
  }
  const cb = pendingLeaveCallback;
  closeLeaveConversationModal();
  if (typeof cb === 'function') {
    cb();
  }
}

function setupLeaveConversationModal() {
  const modal = document.getElementById('leaveConversationModal');
  const closeBtn = document.getElementById('leaveModalCloseBtn');
  const cancelBtn = document.getElementById('leaveModalCancelBtn');
  const confirmBtn = document.getElementById('leaveModalConfirmBtn');

  if (closeBtn) closeBtn.addEventListener('click', closeLeaveConversationModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeLeaveConversationModal);
  if (confirmBtn) confirmBtn.addEventListener('click', confirmLeaveConversation);

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeLeaveConversationModal();
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && !modal.classList.contains('hidden')) {
      e.stopPropagation();
      closeLeaveConversationModal();
    }
  });
}

window.showLeaveConversationModal = showLeaveConversationModal;
window.closeLeaveConversationModal = closeLeaveConversationModal;
window.confirmLeaveConversation = confirmLeaveConversation;

function setupMediaControls() {
  // Prejoin controls
  toggleMicBtn.addEventListener('click', toggleMicrophone);
  toggleCamBtn.addEventListener('click', toggleCamera);

  // Office & Chat controls
  document.querySelectorAll('.media-toggle-mic').forEach(btn => {
    btn.addEventListener('click', toggleMicrophone);
  });
  document.querySelectorAll('.media-toggle-cam').forEach(btn => {
    btn.addEventListener('click', toggleCamera);
  });

  // Chevrons dropdowns
  micMenuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    openDeviceMenu('mic');
  });

  camMenuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    openDeviceMenu('cam');
  });

  document.addEventListener('click', (e) => {
    if (activeDropdown && !deviceDropdown.contains(e.target)) {
      closeDeviceMenu();
    }
  });
}

function clearPrejoinNameInput() {
  if (userNameInput) {
    userNameInput.value = '';
    userNameInput.classList.remove('input-error');
    if (typeof userNameInput.setCustomValidity === 'function') {
      userNameInput.setCustomValidity('');
    }
  }
  const errEl = document.getElementById('userNameError');
  if (errEl) errEl.classList.add('hidden');
}

function loadSavedSettings() {
  try {
    localStorage.removeItem('gather_user_name');
  } catch (e) {
    console.warn('localStorage not accessible:', e);
  }
  clearPrejoinNameInput();

  if (userNameInput && !userNameInput.dataset.boundNameValidation) {
    userNameInput.dataset.boundNameValidation = '1';
    userNameInput.addEventListener('input', () => {
      userNameInput.classList.remove('input-error');
      if (typeof userNameInput.setCustomValidity === 'function') {
        userNameInput.setCustomValidity('');
      }
      const errEl = document.getElementById('userNameError');
      if (errEl) errEl.classList.add('hidden');
    });
  }
}

window.addEventListener('pageshow', () => {
  const prejoin = document.getElementById('prejoinView');
  if (prejoin && !prejoin.classList.contains('hidden')) {
    clearPrejoinNameInput();
  }
});

// Camera Toggle with real getUserMedia
async function toggleCamera() {
  if (isCameraOn) {
    stopCameraStream();
    isCameraOn = false;
    updateCameraUI(false);
  } else {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      mediaStream = stream;
      webcamVideo.srcObject = stream;
      webcamVideo.play().catch(e => console.warn(e));
      const officeVideo = document.getElementById('officeWebcamStream');
      if (officeVideo) {
        officeVideo.srcObject = stream;
        officeVideo.play().catch(e => console.warn(e));
      }
      isCameraOn = true;
      updateCameraUI(true);
    } catch (err) {
      console.warn('Camera access denied or unavailable:', err);
      stopCameraStream();
      isCameraOn = false;
      updateCameraUI(false);
      if (typeof showRoomBannerToast === 'function') {
        showRoomBannerToast('📷 Không mở được camera (chưa cấp quyền hoặc camera đang được tab/ứng dụng khác sử dụng).');
      }
      return;
    }
  }

  // Update WebRTC Manager local stream & notify peers in real time
  if (window.webrtcManager) {
    window.webrtcManager.setLocalStream(isCameraOn ? mediaStream : null);
  }
  if (socket && socket.connected) {
    socket.emit('CAMERA_STATE', { isCameraOn: !!isCameraOn });
  }
  if (typeof renderGroupCallVideoCards === 'function') {
    renderGroupCallVideoCards();
  }
  if (typeof window.syncWhiteboardParticipantsUI === 'function') {
    window.syncWhiteboardParticipantsUI();
  }
  const meetingLocalVideo = document.getElementById('meetingLocalVideo');
  const localPlaceholder = document.getElementById('localTilePlaceholder');
  if (meetingLocalVideo && mediaStream && isCameraOn) {
    meetingLocalVideo.srcObject = mediaStream;
    meetingLocalVideo.play().catch(e => console.warn(e));
    if (localPlaceholder) localPlaceholder.style.display = 'none';
  } else if (localPlaceholder) {
    localPlaceholder.style.display = 'flex';
  }
  // Update Proximity Video local card
  const localCallVideo = document.getElementById('localCallVideo');
  const localCallPlaceholder = document.getElementById('localCallPlaceholder');
  if (localCallVideo && localCallPlaceholder) {
    if (isCameraOn && mediaStream) {
      localCallVideo.srcObject = mediaStream;
      localCallVideo.play().catch(e => console.warn(e));
      localCallVideo.classList.add('active');
      localCallPlaceholder.style.display = 'none';
    } else {
      localCallVideo.srcObject = null;
      localCallVideo.classList.remove('active');
      localCallPlaceholder.style.display = 'flex';
    }
  }
}

function stopCameraStream() {
  if (mediaStream) {
    mediaStream.getTracks().forEach(track => track.stop());
    mediaStream = null;
  }
  if (window.webrtcManager) {
    window.webrtcManager.setLocalStream(null);
  }
  if (socket && socket.connected) {
    socket.emit('CAMERA_STATE', { isCameraOn: false });
  }
  const localCallVideo = document.getElementById('localCallVideo');
  const localCallPlaceholder = document.getElementById('localCallPlaceholder');
  if (localCallVideo) {
    localCallVideo.srcObject = null;
    localCallVideo.classList.remove('active');
  }
  if (localCallPlaceholder) {
    localCallPlaceholder.style.display = 'flex';
  }
  webcamVideo.srcObject = null;
  const officeVideo = document.getElementById('officeWebcamStream');
  if (officeVideo) {
    officeVideo.srcObject = null;
  }
}

function updateCameraUI(enabled) {
  const mutedIcons = document.querySelectorAll('.icon-cam-muted, #camIconMuted');
  const activeIcons = document.querySelectorAll('.icon-cam-active, #camIconActive');

  if (enabled) {
    mutedIcons.forEach(i => i.classList.add('hidden'));
    activeIcons.forEach(i => i.classList.remove('hidden'));
    webcamVideo.classList.remove('hidden');
    cameraOffState.classList.add('hidden');
  } else {
    mutedIcons.forEach(i => i.classList.remove('hidden'));
    activeIcons.forEach(i => i.classList.add('hidden'));
    webcamVideo.classList.add('hidden');
    cameraOffState.classList.remove('hidden');
  }

  // Update pills active styling
  document.querySelectorAll('.dock-media-pill').forEach(pill => {
    if (pill.querySelector('.media-toggle-cam')) {
      if (enabled) pill.classList.add('active');
      else pill.classList.remove('active');
    }
  });
  const camPill = document.getElementById('camPill');
  if (camPill) {
    if (enabled) camPill.classList.add('active');
    else camPill.classList.remove('active');
  }

  // Notify MapEngine
  if (window.mapEngineInstance && typeof window.mapEngineInstance.setCameraActive === 'function') {
    window.mapEngineInstance.setCameraActive(enabled, mediaStream);
  }
}

// Microphone Toggle
function toggleMicrophone() {
  isMicOn = !isMicOn;
  updateMicrophoneUI(isMicOn);
}

function updateMicrophoneUI(enabled) {
  const mutedIcons = document.querySelectorAll('.icon-mic-muted, #micIconMuted');
  const activeIcons = document.querySelectorAll('.icon-mic-active, #micIconActive');

  if (enabled) {
    mutedIcons.forEach(i => i.classList.add('hidden'));
    activeIcons.forEach(i => i.classList.remove('hidden'));
  } else {
    mutedIcons.forEach(i => i.classList.remove('hidden'));
    activeIcons.forEach(i => i.classList.add('hidden'));
  }

  // Update pills active styling
  document.querySelectorAll('.dock-media-pill').forEach(pill => {
    if (pill.querySelector('.media-toggle-mic')) {
      if (enabled) pill.classList.add('active');
      else pill.classList.remove('active');
    }
  });
  const micPill = document.getElementById('micPill');
  if (micPill) {
    if (enabled) micPill.classList.add('active');
    else micPill.classList.remove('active');
  }
}

// Device Selection Popup
function openDeviceMenu(type) {
  if (activeDropdown === type) {
    closeDeviceMenu();
    return;
  }
  activeDropdown = type;
  deviceDropdown.classList.remove('hidden');

  if (type === 'mic') {
    dropdownTitle.textContent = 'Chọn Microphone';
    deviceList.innerHTML = `
      <div class="dropdown-item selected">Default Microphone (Internal Mic) &#10003;</div>
      <div class="dropdown-item">Headset Microphone (Audio Device)</div>
      <div class="dropdown-item">Realtek High Definition Audio</div>
    `;
  } else {
    dropdownTitle.textContent = 'Chọn Camera';
    deviceList.innerHTML = `
      <div class="dropdown-item selected">Integrated Camera (HD Webcam) &#10003;</div>
      <div class="dropdown-item">OBS Virtual Camera</div>
    `;
  }

  const items = deviceList.querySelectorAll('.dropdown-item');
  items.forEach(item => {
    item.addEventListener('click', () => {
      items.forEach(i => i.classList.remove('selected'));
      item.classList.add('selected');
      setTimeout(closeDeviceMenu, 250);
    });
  });
}

function closeDeviceMenu() {
  deviceDropdown.classList.add('hidden');
  activeDropdown = null;
}

// Character Selection Logic
let currentCharacterIndex = 0;
let charAnimTimer = null;
let charAnimFrame = 0;
const charImageCache = {};

function setupCharacterSelection() {
  if (typeof CHARACTERS === 'undefined' || !CHARACTERS.length) return;

  const charCounterBadge = document.getElementById('charCounterBadge');
  const charRoleBadge = document.getElementById('charRoleBadge');
  const charTitleName = document.getElementById('charTitleName');
  const charOutfitDesc = document.getElementById('charOutfitDesc');
  const charPrevBtn = document.getElementById('charPrevBtn');
  const charNextBtn = document.getElementById('charNextBtn');
  const charThumbnailsStrip = document.getElementById('charThumbnailsStrip');
  const charCanvas = document.getElementById('charPreviewCanvas');

  // Load saved character
  try {
    const savedCharId = localStorage.getItem('gather_selected_character');
    if (savedCharId) {
      const idx = CHARACTERS.findIndex(c => c.id === savedCharId);
      if (idx !== -1) currentCharacterIndex = idx;
    }
  } catch (e) {
    console.warn('localStorage not accessible:', e);
  }

  // Render thumbnails
  if (charThumbnailsStrip) {
    charThumbnailsStrip.innerHTML = '';
    CHARACTERS.forEach((c, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `char-thumb-btn ${idx === currentCharacterIndex ? 'active' : ''}`;
      btn.title = `${c.name} (${c.role})`;
      btn.innerHTML = c.avatarIcon;
      btn.addEventListener('click', () => {
        selectCharacter(idx);
      });
      charThumbnailsStrip.appendChild(btn);
    });
  }

  if (charPrevBtn) {
    charPrevBtn.addEventListener('click', () => {
      selectCharacter((currentCharacterIndex - 1 + CHARACTERS.length) % CHARACTERS.length);
    });
  }

  if (charNextBtn) {
    charNextBtn.addEventListener('click', () => {
      selectCharacter((currentCharacterIndex + 1) % CHARACTERS.length);
    });
  }

  function selectCharacter(idx) {
    currentCharacterIndex = idx;
    const c = CHARACTERS[currentCharacterIndex];
    if (!c) return;

    if (charCounterBadge) charCounterBadge.textContent = `${idx + 1} / ${CHARACTERS.length}`;
    if (charRoleBadge) {
      charRoleBadge.textContent = c.role;
      charRoleBadge.style.color = c.themeColor || '#2563eb';
    }
    if (charTitleName) charTitleName.textContent = c.name;
    if (charOutfitDesc) charOutfitDesc.textContent = c.outfit;

    // Update active thumb
    if (charThumbnailsStrip) {
      const thumbs = charThumbnailsStrip.querySelectorAll('.char-thumb-btn');
      thumbs.forEach((t, i) => {
        if (i === idx) {
          t.classList.add('active');
          t.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        } else {
          t.classList.remove('active');
        }
      });
    }

    try {
      localStorage.setItem('gather_selected_character', c.id);
    } catch (e) {}

    // Apply to MapEngine if already initialized
    if (window.mapEngineInstance && typeof window.mapEngineInstance.setPlayerCharacter === 'function') {
      window.mapEngineInstance.setPlayerCharacter(c.sprite);
    }
  }

  function getCharacterImage(character, callback) {
    if (charImageCache[character.id]) {
      callback(charImageCache[character.id]);
      return;
    }
    const img = new Image();
    img.onload = () => {
      charImageCache[character.id] = img;
      callback(img);
    };
    img.onerror = () => {
      // Fallback to default player_spritesheet.png
      if (character.fallbackSprite) {
        if (charImageCache['fallback']) {
          callback(charImageCache['fallback']);
        } else {
          const fallbackImg = new Image();
          fallbackImg.onload = () => {
            charImageCache['fallback'] = fallbackImg;
            callback(fallbackImg);
          };
          fallbackImg.src = character.fallbackSprite;
        }
      }
    };
    img.src = character.sprite;
  }

  function drawPreviewFrame(ctx) {
    const c = CHARACTERS[currentCharacterIndex];
    if (!c || !charCanvas) return;

    ctx.clearRect(0, 0, charCanvas.width, charCanvas.height);

    getCharacterImage(c, (img) => {
      if (!img || !img.complete) return;
      const frameW = 117;
      const frameH = 210;
      const col = charAnimFrame;
      const row = 0; // Down walk

      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(
        img,
        col * frameW, row * frameH, frameW, frameH,
        0, 0, charCanvas.width, charCanvas.height
      );
    });
  }

  function startPreviewLoop() {
    if (!charCanvas) return;
    const ctx = charCanvas.getContext('2d');

    if (charAnimTimer) clearInterval(charAnimTimer);

    charAnimTimer = setInterval(() => {
      charAnimFrame = (charAnimFrame + 1) % 4;
      drawPreviewFrame(ctx);
    }, 180);

    drawPreviewFrame(ctx);
  }

  selectCharacter(currentCharacterIndex);
  startPreviewLoop();
}

// Handle Join
function handleJoin() {
  const name = userNameInput ? userNameInput.value.trim() : '';
  if (!name) {
    const errEl = document.getElementById('userNameError');
    if (errEl) errEl.classList.remove('hidden');
    if (userNameInput) {
      userNameInput.classList.add('input-error');
      userNameInput.focus();
      if (typeof userNameInput.setCustomValidity === 'function') {
        userNameInput.setCustomValidity('Vui lòng nhập tên hiển thị của bạn!');
        userNameInput.reportValidity();
      }
    }
    return;
  }

  try {
    localStorage.removeItem('gather_user_name');
  } catch (e) {}
  updateUserNames(name);

  let selectedCharacter = null;
  // Set character on map engine
  if (typeof CHARACTERS !== 'undefined' && CHARACTERS[currentCharacterIndex]) {
    const c = CHARACTERS[currentCharacterIndex];
    selectedCharacter = c;
    try {
      localStorage.setItem('gather_selected_character', c.id);
    } catch (e) {}
    if (window.mapEngineInstance) {
      if (typeof window.mapEngineInstance.setPlayerCharacter === 'function') {
        window.mapEngineInstance.setPlayerCharacter(c.sprite);
      }
      if (typeof window.mapEngineInstance.setPlayerName === 'function') {
        window.mapEngineInstance.setPlayerName(name);
      }
      if (typeof window.mapEngineInstance.setCameraActive === 'function') {
        window.mapEngineInstance.setCameraActive(isCameraOn, mediaStream);
      }
    }
  }

  // Network: Emit PLAYER_JOIN to Server (TCP via WebSocket)
  if (socket && socket.connected) {
    const spawnX = window.mapEngineInstance ? window.mapEngineInstance.player.x : 1728;
    const spawnY = window.mapEngineInstance ? window.mapEngineInstance.player.y : 2208;
    const spawnDir = window.mapEngineInstance ? window.mapEngineInstance.player.direction : 'down';

    socket.emit('PLAYER_JOIN', {
      name: name,
      characterId: selectedCharacter ? selectedCharacter.id : 'char_1',
      sprite: selectedCharacter ? selectedCharacter.sprite : 'assets/characters/char_1_dev.png',
      x: spawnX,
      y: spawnY,
      direction: spawnDir,
      isCameraOn: !!isCameraOn
    });
    if (isCameraOn && mediaStream) {
      const officeVideo = document.getElementById('officeWebcamStream');
      if (officeVideo) {
        officeVideo.srcObject = mediaStream;
        officeVideo.play().catch(() => {});
      }
      if (window.webrtcManager) {
        window.webrtcManager.setLocalStream(mediaStream);
      }
      socket.emit('CAMERA_STATE', { isCameraOn: true });
    }
  }

  setupNetworkMovementSync();
  setupSpatialRoomDetection();
  switchView('office');
  updateOnlineRoster();

  // Trigger celestial glowing summoning spawn effect for local player
  if (window.mapEngineInstance && typeof window.mapEngineInstance.triggerSpawnEffect === 'function') {
    const spawnX = window.mapEngineInstance.player.x;
    const spawnY = window.mapEngineInstance.player.y;
    window.mapEngineInstance.triggerSpawnEffect(spawnX, spawnY, window.mapEngineInstance.player, true);
  }
}
window.handleJoin = handleJoin;

// Full Chat View State: Channels, 1-on-1 DMs, Drafts, Rich Formatting & Mini Video Call Dock
const channelMessageHistory = { general: [], social: [] };
const chatDraftsMap = new Map();
let activeChatThread = { type: 'channel', id: 'general', name: 'general', user: null };

function getThreadStorageKey(thread = activeChatThread) {
  if (!thread) return 'ch:general';
  return thread.type === 'dm' ? `dm:${getDmPeerKey(thread.user || { id: thread.id, name: thread.name })}` : `ch:${thread.id}`;
}

function formatRichChatText(rawText) {
  let html = escapeHtml(rawText || '');
  html = html.replace(/```([\s\S]*?)```/g, '<pre>$1</pre>');
  html = html.replace(/`([^`\n]+)`/g, '<code>$1</code>');
  html = html.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*([^*\n]+)\*/g, '<em>$1</em>');
  html = html.replace(/~~([^~\n]+)~~/g, '<del>$1</del>');
  html = html.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  html = html.replace(/(^|\s)@([A-Za-z0-9_\u00C0-\u024F\u1E00-\u1EFF]+)/g, '$1<span class="chat-mention-pill">@$2</span>');
  html = html.replace(/^&gt;\s?(.*)$/gm, '<blockquote>$1</blockquote>');
  html = html.replace(/\n/g, '<br>');
  return html;
}

function updateDraftsBadge() {
  const badge = document.getElementById('chatDraftsCount');
  if (!badge) return;
  let count = 0;
  chatDraftsMap.forEach((v) => { if (v && v.trim()) count++; });
  badge.textContent = String(count);
  badge.classList.toggle('hidden', count === 0);
}

function syncChatMiniCallDock() {
  const miniDock = document.getElementById('chatMiniCallDock');
  const deskDock = document.getElementById('chatSidebarDeskDock');
  if (!miniDock || !deskDock) return;

  const peer = window.activeProximityPeer;
  const inCall = !!peer;
  miniDock.classList.toggle('hidden', !inCall);
  deskDock.classList.toggle('hidden', inCall);

  if (!inCall) return;

  const localName = (userNameInput && userNameInput.value.trim()) || 'Lữ Quốc Vinh';
  const peerName = peer.name || 'Đồng nghiệp';
  const roomTitleEl = document.getElementById('chatMiniRoomTitle');
  const badgeRoomEl = document.getElementById('callBadgeRoomTitle');
  if (roomTitleEl) {
    roomTitleEl.textContent = (badgeRoomEl && badgeRoomEl.textContent) || 'Lobby';
  }
  const localAv = document.getElementById('chatMiniLocalAvatar');
  const remoteAv = document.getElementById('chatMiniRemoteAvatar');
  if (localAv) localAv.textContent = localName.charAt(0).toUpperCase();
  if (remoteAv) remoteAv.textContent = peerName.charAt(0).toUpperCase();

  const localSrc = document.getElementById('localCallVideo');
  const miniLocalVid = document.getElementById('chatMiniLocalVideo');
  if (miniLocalVid && localSrc) {
    if (localSrc.srcObject && localSrc.classList.contains('active')) {
      miniLocalVid.srcObject = localSrc.srcObject;
      miniLocalVid.classList.add('active');
      if (localAv) localAv.style.display = 'none';
    } else {
      miniLocalVid.srcObject = null;
      miniLocalVid.classList.remove('active');
      if (localAv) localAv.style.display = 'flex';
    }
  }

  const remoteSrc = document.getElementById('remoteCallVideo');
  const miniRemoteVid = document.getElementById('chatMiniRemoteVideo');
  if (miniRemoteVid && remoteSrc) {
    if (remoteSrc.srcObject && remoteSrc.classList.contains('active')) {
      miniRemoteVid.srcObject = remoteSrc.srcObject;
      miniRemoteVid.classList.add('active');
      if (remoteAv) remoteAv.style.display = 'none';
    } else {
      miniRemoteVid.srcObject = null;
      miniRemoteVid.classList.remove('active');
      if (remoteAv) remoteAv.style.display = 'flex';
    }
  }
}
window.syncChatMiniCallDock = syncChatMiniCallDock;

function syncWhiteboardParticipantsUI() {
  const rail = document.getElementById('wbParticipantsRail');
  if (!rail) return;

  const peers = window.activeCallPeers && window.activeCallPeers.size > 0
    ? Array.from(window.activeCallPeers.values())
    : (window.activeProximityPeer ? [window.activeProximityPeer] : []);
  const inCall = peers.length > 0;
  rail.classList.toggle('hidden', !inCall);
  if (!inCall) return;

  rail.classList.toggle('compact-many', 1 + peers.length >= 4);

  const localName = (userNameInput && userNameInput.value.trim()) || 'Lữ Quốc Vinh';
  const primaryPeer = peers[0];
  const peerName = primaryPeer.name || 'Đồng nghiệp';

  const localNameEl = document.getElementById('wbLocalUserName');
  const remoteNameEl = document.getElementById('wbRemoteUserName');
  const localAvEl = document.getElementById('wbLocalAvatarCircle');
  const remoteAvEl = document.getElementById('wbRemoteAvatarCircle');
  const localPh = document.getElementById('wbLocalPlaceholder');
  const remotePh = document.getElementById('wbRemotePlaceholder');

  if (localNameEl) localNameEl.textContent = localName;
  if (remoteNameEl) remoteNameEl.textContent = peerName;
  if (localAvEl) localAvEl.textContent = localName.charAt(0).toUpperCase();
  if (remoteAvEl) remoteAvEl.textContent = peerName.charAt(0).toUpperCase();

  const localSrc = document.getElementById('localCallVideo');
  const wbLocalVid = document.getElementById('wbLocalVideo');
  if (wbLocalVid && localSrc) {
    if (localSrc.srcObject && localSrc.classList.contains('active')) {
      wbLocalVid.srcObject = localSrc.srcObject;
      wbLocalVid.classList.add('active');
      if (localPh) localPh.style.display = 'none';
    } else {
      wbLocalVid.srcObject = null;
      wbLocalVid.classList.remove('active');
      if (localPh) localPh.style.display = 'flex';
    }
  }

  const remoteSrc = document.getElementById('remoteCallVideo');
  const wbRemoteVid = document.getElementById('wbRemoteVideo');
  if (wbRemoteVid && remoteSrc) {
    if (remoteSrc.srcObject && remoteSrc.classList.contains('active')) {
      wbRemoteVid.srcObject = remoteSrc.srcObject;
      wbRemoteVid.classList.add('active');
      if (remotePh) remotePh.style.display = 'none';
    } else {
      wbRemoteVid.srcObject = null;
      wbRemoteVid.classList.remove('active');
      if (remotePh) remotePh.style.display = 'flex';
    }
  }

  // Render additional participants (3rd, 4th, 5th+ users) vertically below card #2
  rail.querySelectorAll('.wb-extra-peer-card').forEach(el => el.remove());
  peers.slice(1).forEach((p) => {
    const pName = p.name || 'Đồng nghiệp';
    const card = document.createElement('div');
    card.className = 'wb-participant-card wb-extra-peer-card';
    card.dataset.peerId = p.id;
    card.innerHTML = `
      <video class="wb-participant-video" autoplay playsinline></video>
      <div class="wb-participant-placeholder">
        <div class="call-avatar-circle">${escapeHtml(pName.charAt(0).toUpperCase())}</div>
      </div>
      <div class="call-name-badge">
        <svg class="badge-mic-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="2" y1="2" x2="22" y2="22" stroke="#ea3943" stroke-width="2.5"></line><path d="M18.89 13.23A7.12 7.12 0 0 0 19 12v-2"></path><path d="M5 10v2a7 7 0 0 0 12 5"></path><path d="M15 9.34V5a3 3 0 0 0-5.68-1.33"></path><path d="M9 9v3a3 3 0 0 0 5.12 2.12"></path><line x1="12" y1="19" x2="12" y2="22"></line></svg>
        <span class="call-user-name">${escapeHtml(pName)}</span>
      </div>
    `;
    const vid = card.querySelector('.wb-participant-video');
    const ph = card.querySelector('.wb-participant-placeholder');
    const stream = window.webrtcManager?.remoteStreams?.get(p.id) || null;
    if (stream && vid && ph) {
      getPeerForCallCard(vid, ph, stream, p.id);
    }
    rail.appendChild(card);
  });
}
window.syncWhiteboardParticipantsUI = syncWhiteboardParticipantsUI;

function updateChatSidebarUsers() {
  const dmList = document.getElementById('chatDmList');
  const searchInput = document.getElementById('chatSearchInput');
  const headerOnlineNum = document.getElementById('chatHeaderOnlineNum');
  if (!dmList) return;

  const query = (searchInput ? searchInput.value : '').trim().toLowerCase();
  const localName = (userNameInput && userNameInput.value.trim()) || 'Lữ Quốc Vinh';
  let remotes = [];
  if (window.mapEngineInstance && window.mapEngineInstance.remotePlayers) {
    remotes = Array.from(window.mapEngineInstance.remotePlayers.values()).filter(rp => !rp.isNpc);
  } else if (Array.isArray(onlineRemotePlayers)) {
    remotes = onlineRemotePlayers.filter(rp => !rp.isNpc);
  }

  if (headerOnlineNum) {
    headerOnlineNum.textContent = String(1 + remotes.length);
  }

  // Filter channels if searching
  document.querySelectorAll('#chatChannelsList .channel-item').forEach((el) => {
    const ch = (el.dataset.channel || '').toLowerCase();
    el.style.display = (!query || ch.includes(query)) ? '' : 'none';
    el.classList.toggle('active', activeChatThread.type === 'channel' && activeChatThread.id === el.dataset.channel);
  });

  dmList.innerHTML = '';

  const renderDmRow = (u, isSelf) => {
    const name = u.name || 'Đồng nghiệp';
    if (query && !name.toLowerCase().includes(query)) return;
    const item = document.createElement('div');
    const isActive = !isSelf && activeChatThread.type === 'dm' && getDmPeerKey(activeChatThread.user || activeChatThread) === getDmPeerKey(u);
    item.className = `dm-user-item${isActive ? ' active' : ''}`;
    const col = getColorForString(u.id || name);
    item.innerHTML = `
      <div class="dm-avatar">
        <span class="dm-letter" style="background: ${col.bg}; color: ${col.text}; border-color: ${col.border};">${escapeHtml(name.charAt(0).toUpperCase())}</span>
        <span class="dm-online-dot"></span>
      </div>
      <span class="dm-name">${escapeHtml(name)}${isSelf ? ' (you)' : ''}</span>
    `;
    if (!isSelf) {
      item.addEventListener('click', () => {
        selectChatThread({ type: 'dm', id: getDmPeerKey(u), name, user: u });
      });
    }
    dmList.appendChild(item);
  };

  // Remote peers first (plus currently selected active peer if temporarily offline)
  const seenKeys = new Set();
  remotes.forEach((p) => {
    seenKeys.add(getDmPeerKey(p));
    renderDmRow(p, false);
  });
  if (activeChatThread.type === 'dm' && activeChatThread.user && !seenKeys.has(getDmPeerKey(activeChatThread.user))) {
    renderDmRow(activeChatThread.user, false);
  }
  renderDmRow({ id: 'local', name: localName }, true);
}
window.updateChatSidebarUsers = updateChatSidebarUsers;

function renderActiveChatThread() {
  const listEl = document.getElementById('dynamicMessagesList');
  const welcomeSection = document.getElementById('chatWelcomeSection');
  const dmBanner = document.getElementById('chatDmBanner');
  const headerHash = document.getElementById('chatHeaderHash');
  const headerDmAvatar = document.getElementById('chatHeaderDmAvatar');
  const headerTitle = document.getElementById('chatHeaderTitle');
  const headerChannelMeta = document.getElementById('chatHeaderChannelMeta');
  const headerDmActions = document.getElementById('chatHeaderDmActions');
  const scopeSelect = document.getElementById('chatScopeSelect');
  const sendBtn = document.getElementById('chatSendSubmitBtn');
  if (!listEl) return;

  listEl.innerHTML = '';

  if (activeChatThread.type === 'dm' && activeChatThread.user) {
    const peer = activeChatThread.user;
    const pName = peer.name || activeChatThread.name || 'Đồng nghiệp';
    const col = getColorForString(peer.id || pName);

    if (welcomeSection) welcomeSection.classList.add('hidden');
    if (dmBanner) {
      dmBanner.classList.remove('hidden');
      const av = document.getElementById('chatDmBannerAvatar');
      const bn = document.getElementById('chatDmBannerName');
      const bm = document.getElementById('chatDmBannerMention');
      if (av) {
        av.firstChild.textContent = pName.charAt(0).toUpperCase();
        av.style.background = col.bg;
        av.style.color = col.text;
      }
      if (bn) bn.textContent = pName;
      if (bm) bm.textContent = `@${pName}`;
    }
    if (headerHash) headerHash.classList.add('hidden');
    if (headerDmAvatar) {
      headerDmAvatar.classList.remove('hidden');
      headerDmAvatar.firstChild.textContent = pName.charAt(0).toUpperCase();
      headerDmAvatar.style.background = col.bg;
      headerDmAvatar.style.color = col.text;
    }
    if (headerTitle) headerTitle.textContent = pName;
    if (headerChannelMeta) headerChannelMeta.classList.add('hidden');
    if (headerDmActions) headerDmActions.classList.remove('hidden');
    if (scopeSelect) scopeSelect.classList.add('hidden');
    if (chatTextInput) chatTextInput.placeholder = `Message ${pName}`;

    const key = getDmPeerKey(peer);
    const items = directChatHistory.get(key) || [];
    if (items.length > 0) {
      const divider = document.createElement('div');
      divider.className = 'profile-chat-date-divider';
      divider.textContent = 'Today';
      listEl.appendChild(divider);
    }
    items.forEach((m) => appendChatRowElement(listEl, m, false));
  } else {
    const chId = activeChatThread.id || 'general';
    if (dmBanner) dmBanner.classList.add('hidden');
    if (welcomeSection) {
      welcomeSection.classList.remove('hidden');
      const wt = document.getElementById('chatWelcomeTitle');
      const ws = document.getElementById('chatWelcomeSub');
      if (wt) wt.textContent = `Gather round in #${chId}`;
      if (ws) ws.textContent = chId === 'social'
        ? 'Casual chats, coffee breaks, team fun & celebrations'
        : 'Share company-wide updates, wins, announcements';
    }
    if (headerHash) headerHash.classList.remove('hidden');
    if (headerDmAvatar) headerDmAvatar.classList.add('hidden');
    if (headerTitle) headerTitle.textContent = chId;
    if (headerChannelMeta) headerChannelMeta.classList.remove('hidden');
    if (headerDmActions) headerDmActions.classList.add('hidden');
    if (scopeSelect) scopeSelect.classList.remove('hidden');
    if (chatTextInput) chatTextInput.placeholder = `Message #${chId}`;

    const items = channelMessageHistory[chId] || [];
    items.forEach((m) => appendChatRowElement(listEl, m, true));
  }

  // Restore draft for active thread
  if (chatTextInput) {
    chatTextInput.value = chatDraftsMap.get(getThreadStorageKey()) || '';
    if (sendBtn) sendBtn.classList.toggle('has-text', chatTextInput.value.trim().length > 0);
  }
  if (chatMessagesContainer) {
    chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
  }
}
window.renderActiveChatThread = renderActiveChatThread;

function appendChatRowElement(containerEl, msgData, showScopeTag) {
  const currentName = userNameInput ? (userNameInput.value.trim() || 'Lữ Quốc Vinh') : 'Lữ Quốc Vinh';
  const senderName = msgData.senderName || 'Đồng nghiệp';
  const isSelf = senderName === currentName;
  const timeStr = formatDmTime(msgData.timestamp);
  const firstChar = senderName.charAt(0).toUpperCase();
  const col = getColorForString(msgData.senderId || senderName);

  let tagHtml = '';
  if (showScopeTag) {
    if (msgData.scope === 'nearby') {
      const distText = (typeof msgData.distance === 'number' && msgData.distance > 0) ? ` (${msgData.distance}px)` : '';
      tagHtml = `<span class="chat-tag tag-nearby">📍 Gần bạn${distText}</span>`;
    } else {
      tagHtml = `<span class="chat-tag tag-broadcast">🌐 Toàn thể</span>`;
    }
  }

  const msgRow = document.createElement('div');
  msgRow.className = `chat-message-row user-posted-message ${isSelf ? 'msg-self' : ''}`;
  msgRow.innerHTML = `
    <div class="chat-msg-avatar">
      <div class="user-avatar-circle small" style="background: ${col.bg}; color: ${col.text};">${escapeHtml(firstChar)}</div>
    </div>
    <div class="chat-msg-body">
      <div class="chat-msg-header">
        <span class="chat-msg-sender">${escapeHtml(senderName)}</span>
        ${tagHtml}
        <span class="chat-msg-time">${timeStr}</span>
      </div>
      <div class="chat-msg-content">${formatRichChatText(msgData.text)}</div>
    </div>
  `;
  containerEl.appendChild(msgRow);
}

function selectChatThread(thread) {
  if (chatTextInput) {
    chatDraftsMap.set(getThreadStorageKey(), chatTextInput.value);
  }
  activeChatThread = thread;
  updateDraftsBadge();
  updateChatSidebarUsers();
  renderActiveChatThread();
  if (chatTextInput) chatTextInput.focus();
}

function openFullChatWithTarget(user) {
  if (!user) return;
  closeUserProfileCard(false);
  switchView('chat');
  selectChatThread({ type: 'dm', id: getDmPeerKey(user), name: user.name || 'Đồng nghiệp', user });
}
window.openFullChatWithTarget = openFullChatWithTarget;

// Real-time Chat Messaging & Toolbar Tools
function setupChatMessaging() {
  if (!chatMessageForm) return;

  chatMessageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    sendChatMessage();
  });

  if (chatTextInput) {
    chatTextInput.addEventListener('input', () => {
      chatDraftsMap.set(getThreadStorageKey(), chatTextInput.value);
      updateDraftsBadge();
      const sendBtn = document.getElementById('chatSendSubmitBtn');
      if (sendBtn) sendBtn.classList.toggle('has-text', chatTextInput.value.trim().length > 0);
    });
  }

  // Channel clicks (#general, #social)
  document.querySelectorAll('#chatChannelsList .channel-item').forEach((el) => {
    el.addEventListener('click', () => {
      const chId = el.dataset.channel || 'general';
      selectChatThread({ type: 'channel', id: chId, name: chId, user: null });
    });
  });

  // Search filter
  const searchInput = document.getElementById('chatSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', updateChatSidebarUsers);
  }

  // Drafts shortcut: cycle to first conversation with unsent draft
  const draftsBtn = document.getElementById('chatDraftsBtn');
  if (draftsBtn) {
    draftsBtn.addEventListener('click', () => {
      for (const [k, v] of chatDraftsMap.entries()) {
        if (!v || !v.trim()) continue;
        if (k.startsWith('ch:')) {
          const id = k.slice(3);
          selectChatThread({ type: 'channel', id, name: id, user: null });
          return;
        }
        if (k.startsWith('dm:')) {
          const peerId = k.slice(3);
          const remotes = window.mapEngineInstance ? Array.from(window.mapEngineInstance.remotePlayers.values()) : [];
          const peer = remotes.find(r => getDmPeerKey(r) === peerId) || { id: peerId, name: peerId };
          selectChatThread({ type: 'dm', id: peerId, name: peer.name || peerId, user: peer });
          return;
        }
      }
      showRoomBannerToast('📝 Chưa có bản nháp nào đang viết dở.');
    });
  }

  // DM Header actions (Wave, Go to, Video, Locate Office)
  const hdWave = document.getElementById('chatHeaderWaveBtn');
  const hdGoto = document.getElementById('chatHeaderGotoBtn');
  const hdVideo = document.getElementById('chatHeaderVideoBtn');
  const hdLocate = document.getElementById('chatHeaderLocateBtn');
  const hdMore = document.getElementById('chatHeaderDmMoreBtn');

  if (hdWave) {
    hdWave.addEventListener('click', () => {
      const target = activeChatThread.user;
      if (!target) return;
      const localName = (userNameInput && userNameInput.value.trim()) || 'Bạn';
      hdWave.classList.add('waving-anim');
      setTimeout(() => hdWave.classList.remove('waving-anim'), 900);
      recordDirectActivity(target, {
        senderId: (socket && socket.id) || 'local',
        senderName: localName,
        text: `You waved at ${target.name || 'Đồng nghiệp'}`,
        timestamp: Date.now(),
        isWave: true
      });
      if (socket && socket.connected && target.id) {
        socket.emit('USER_WAVE', { targetId: target.id, targetName: target.name, senderName: localName });
      }
      showRoomBannerToast(`👋 Bạn đã vẫy tay chào ${target.name || 'Đồng nghiệp'}!`);
    });
  }
  const navigateBackToPeer = (toastPrefix) => {
    const target = activeChatThread.user;
    if (!target || !window.mapEngineInstance) return;
    switchView('office');
    window.mapEngineInstance.setSelectedPlayer(target);
    window.mapEngineInstance.navigateToPlayer(target);
    showRoomBannerToast(`${toastPrefix} ${target.name || 'Đồng nghiệp'}...`);
  };
  if (hdGoto) hdGoto.addEventListener('click', () => navigateBackToPeer('📍 Đang đi tới chỗ'));
  if (hdVideo) hdVideo.addEventListener('click', () => navigateBackToPeer('📹 Bắt đầu cuộc gọi video với'));
  if (hdLocate) hdLocate.addEventListener('click', () => switchView('office'));
  if (hdMore) hdMore.addEventListener('click', () => {
    const name = (activeChatThread.user && activeChatThread.user.name) || 'Đồng nghiệp';
    showRoomBannerToast(`⚡ Cuộc trò chuyện trực tiếp với ${name}`);
  });

  // Mini Call Dock buttons in Chat sidebar
  const miniExpandBtn = document.getElementById('chatMiniReturnOfficeBtn');
  const miniLeaveBtn = document.getElementById('chatMiniLeaveCallBtn');
  const miniEmojiBtn = document.getElementById('chatMiniEmojiBtn');
  const miniWaveBtn = document.getElementById('chatMiniWaveBtn');
  const backOfficeBtns = document.querySelectorAll('.chat-back-office-btn');
  if (miniExpandBtn) miniExpandBtn.addEventListener('click', () => switchView('office'));
  backOfficeBtns.forEach(b => b.addEventListener('click', () => switchView('office')));
  if (miniLeaveBtn) {
    miniLeaveBtn.addEventListener('click', () => {
      if (typeof window.showLeaveConversationModal === 'function') {
        window.showLeaveConversationModal(() => hideProximityVideoBar(true));
      } else {
        hideProximityVideoBar(true);
      }
    });
  }
  if (miniEmojiBtn) {
    miniEmojiBtn.addEventListener('click', () => {
      if (window.mapEngineInstance && typeof window.mapEngineInstance.triggerOverheadEmoji === 'function') {
        window.mapEngineInstance.triggerOverheadEmoji('😊', 'local');
      }
      showRoomBannerToast('😊 Đã thả cảm xúc lên nhân vật');
    });
  }
  if (miniWaveBtn) {
    miniWaveBtn.addEventListener('click', () => {
      const target = window.activeProximityPeer;
      if (target && hdWave && activeChatThread.type === 'dm') hdWave.click();
      else if (window.mapEngineInstance) {
        window.mapEngineInstance.triggerOverheadEmoji('👋', 'local');
        showRoomBannerToast('👋 Đã vẫy tay chào!');
      }
    });
  }

  // Rich Composer Toolbar (Attach, Mention, Emoji, Bold, Italic, Strike, Link, Lists, Quote, Code)
  const fileUpload = document.getElementById('chatFileUploadInput');
  const emojiPopover = document.getElementById('chatEmojiPopover');
  const wrapSelection = (before, after, sample) => {
    if (!chatTextInput) return;
    const start = chatTextInput.selectionStart ?? chatTextInput.value.length;
    const end = chatTextInput.selectionEnd ?? chatTextInput.value.length;
    const val = chatTextInput.value;
    const selected = val.slice(start, end) || sample;
    chatTextInput.value = val.slice(0, start) + before + selected + after + val.slice(end);
    const cursorPos = start + before.length + selected.length;
    chatTextInput.focus();
    chatTextInput.setSelectionRange(cursorPos, cursorPos);
    chatTextInput.dispatchEvent(new Event('input'));
  };

  if (fileUpload && chatTextInput) {
    fileUpload.addEventListener('change', () => {
      if (fileUpload.files && fileUpload.files[0]) {
        wrapSelection(`📎 ${fileUpload.files[0].name} `, '', '');
        fileUpload.value = '';
      }
    });
  }

  document.querySelectorAll('#chatMessageForm [data-tool]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const tool = btn.dataset.tool;
      if (tool === 'attach' && fileUpload) return fileUpload.click();
      if (tool === 'emoji' && emojiPopover) return emojiPopover.classList.toggle('hidden');
      if (tool === 'mention') {
        const mentionName = activeChatThread.type === 'dm' && activeChatThread.user ? activeChatThread.user.name : 'everyone';
        return wrapSelection(`@${mentionName} `, '', '');
      }
      if (tool === 'bold') return wrapSelection('**', '**', 'bold text');
      if (tool === 'italic') return wrapSelection('*', '*', 'italic text');
      if (tool === 'strike') return wrapSelection('~~', '~~', 'text');
      if (tool === 'link') return wrapSelection('[', '](https://example.com)', 'link text');
      if (tool === 'ol') return wrapSelection('1. ', '', '');
      if (tool === 'ul') return wrapSelection('- ', '', '');
      if (tool === 'quote') return wrapSelection('> ', '', 'quote');
      if (tool === 'code') return wrapSelection('`', '`', 'code');
      if (tool === 'codeblock') return wrapSelection('```', '```', 'code');
    });
  });

  if (emojiPopover) {
    emojiPopover.querySelectorAll('.chat-emoji-item').forEach((item) => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        wrapSelection(item.textContent, '', '');
        emojiPopover.classList.add('hidden');
      });
    });
    document.addEventListener('click', (e) => {
      if (!emojiPopover.classList.contains('hidden') && !emojiPopover.contains(e.target)) {
        emojiPopover.classList.add('hidden');
      }
    });
  }
}

function sendChatMessage() {
  if (!chatTextInput) return;
  const text = chatTextInput.value.trim();
  if (!text) return;

  const currentName = userNameInput.value.trim() || 'Lữ Quốc Vinh';

  if (activeChatThread.type === 'dm' && activeChatThread.user) {
    const target = activeChatThread.user;
    recordDirectActivity(target, {
      senderId: (socket && socket.id) || 'local',
      senderName: currentName,
      text,
      timestamp: Date.now()
    });
    if (socket && socket.connected && target.id) {
      socket.emit('DIRECT_DM_SEND', {
        targetId: target.id,
        targetName: target.name,
        senderName: currentName,
        text
      });
    }
  } else {
    const chId = activeChatThread.id || 'general';
    const scopeSelect = document.getElementById('chatScopeSelect');
    const scope = scopeSelect ? scopeSelect.value : 'everyone';
    if (socket && socket.connected) {
      socket.emit('CHAT_SEND', {
        text,
        scope,
        channel: chId,
        senderName: currentName
      });
    } else {
      renderReceivedChatMessage({
        senderName: currentName,
        text,
        scope,
        channel: chId,
        timestamp: Date.now()
      });
    }
  }

  chatTextInput.value = '';
  chatDraftsMap.delete(getThreadStorageKey());
  updateDraftsBadge();
  const sendBtn = document.getElementById('chatSendSubmitBtn');
  if (sendBtn) sendBtn.classList.remove('has-text');
}

// ========================================================
// Soft Lobby Background Music (Plays only in open lobby)
// ========================================================
const LOBBY_BGM_VOLUME = 0.08;
let lobbyBgmAudio = null;

function ensureLobbyBgmAudio() {
  if (!lobbyBgmAudio) {
    lobbyBgmAudio = new Audio('assets/audio/lobby_bgm.mp3');
    lobbyBgmAudio.loop = true;
    lobbyBgmAudio.volume = LOBBY_BGM_VOLUME;
    window.lobbyBgmAudio = lobbyBgmAudio;
  }
  return lobbyBgmAudio;
}

function shouldPlayLobbyMusic() {
  if (document.visibilityState === 'hidden') return false;
  if (!officeView || officeView.classList.contains('hidden')) return false;

  const inCall = (window.activeCallPeers && window.activeCallPeers.size > 0) || !!window.activeProximityPeer;
  if (inCall) return false;

  const wbModal = document.getElementById('whiteboardModal');
  if (wbModal && !wbModal.classList.contains('hidden')) return false;

  const profileCard = document.getElementById('userProfileCard');
  if (profileCard && profileCard.classList.contains('chat-expanded')) return false;

  const activeEl = document.activeElement;
  if (activeEl && activeEl.id === 'profileMsgInput') return false;

  const me = window.mapEngineInstance;
  const room = me && typeof me.getRoomAtPosition === 'function'
    ? (me.getRoomAtPosition(me.player.x, me.player.y) || me.currentRoom)
    : (me && me.currentRoom);
  if (room && room.isMeetingRoom) return false;

  return true;
}

function syncLobbyMusicState() {
  const audio = ensureLobbyBgmAudio();
  if (!audio) return;

  if (shouldPlayLobbyMusic()) {
    audio.volume = LOBBY_BGM_VOLUME;
    if (audio.paused) {
      const p = audio.play();
      if (p !== undefined) {
        p.catch(() => {});
      }
    }
  } else if (!audio.paused) {
    audio.pause();
  }
}

window.syncLobbyMusicState = syncLobbyMusicState;
window.shouldPlayLobbyMusic = shouldPlayLobbyMusic;

document.addEventListener('visibilitychange', () => {
  syncLobbyMusicState();
});
window.addEventListener('pointerdown', () => {
  if (lobbyBgmAudio && lobbyBgmAudio.paused && shouldPlayLobbyMusic()) {
    syncLobbyMusicState();
  }
});
window.addEventListener('keydown', () => {
  if (lobbyBgmAudio && lobbyBgmAudio.paused && shouldPlayLobbyMusic()) {
    syncLobbyMusicState();
  }
});

function renderReceivedChatMessage(msgData) {
  const chId = msgData.channel || 'general';
  if (!channelMessageHistory[chId]) channelMessageHistory[chId] = [];
  channelMessageHistory[chId].push(msgData);

  if (activeChatThread.type === 'channel' && activeChatThread.id === chId && dynamicMessagesList) {
    appendChatRowElement(dynamicMessagesList, msgData, true);
    if (chatMessagesContainer) {
      chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
    }
  }
}

function escapeHtml(string) {
  const entityMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };
  return String(string).replace(/[&<>"']/g, s => entityMap[s]);
}
