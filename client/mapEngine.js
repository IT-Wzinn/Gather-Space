// =========================================================
// Gather Town Interactive Map Engine - Phase 1 Master Blueprint
// =========================================================

const ROOMS_DATA = [
  { id: "reception", name: "Sảnh Lễ Tân (Reception)", englishName: "Reception", x: 43, y: 58, w: 23, h: 18, isMeetingRoom: false, doors: [{ x: 52, y: 58, w: 4 }] },
  { id: "central_lounge", name: "Sảnh Nghỉ Ngơi & Tiếp Khách", englishName: "Central Lounge", x: 43, y: 32, w: 23, h: 18, isMeetingRoom: false, doors: [{ x: 52, y: 50, w: 4 }, { x: 52, y: 32, w: 4 }, { x: 43, y: 38, w: 3 }, { x: 66, y: 38, w: 3 }] },
  { id: "zen_garden", name: "Vườn Tiểu Cảnh & Hồ Cá Koi", englishName: "Zen Garden", x: 21, y: 32, w: 14, h: 18, hasPond: true, isMeetingRoom: false, doors: [{ x: 21, y: 38, w: 3 }, { x: 35, y: 38, w: 3 }, { x: 26, y: 50, w: 4 }] },
  { id: "open_workspace", name: "Khu Làm Việc Chung (Coworking)", englishName: "Coworking", x: 7, y: 58, w: 28, h: 18, isMeetingRoom: false, doors: [{ x: 27, y: 58, w: 4 }, { x: 35, y: 65, w: 3 }] },
  { id: "large_boardroom", name: "Phòng Họp Lớn (Boardroom)", englishName: "Boardroom", x: 7, y: 7, w: 28, h: 17, isMeetingRoom: true, doors: [{ x: 19, y: 24, w: 4 }] },
  { id: "small_meeting", name: "Phòng Họp Nhỏ (Meeting Pod)", englishName: "Meeting Pod", x: 7, y: 32, w: 11, h: 18, isMeetingRoom: true, doors: [{ x: 18, y: 38, w: 3 }, { x: 11, y: 32, w: 3 }] },
  { id: "private_office_1", name: "Phòng Riêng CEO", englishName: "CEO Office", x: 74, y: 7, w: 13, h: 13, isMeetingRoom: true, doors: [{ x: 79, y: 20, w: 3 }] },
  { id: "private_office_2", name: "Phòng Riêng Director", englishName: "Director Office", x: 91, y: 7, w: 13, h: 13, isMeetingRoom: true, doors: [{ x: 96, y: 20, w: 3 }] },
  { id: "private_office_3", name: "Phòng Riêng PM", englishName: "PM Office", x: 74, y: 27, w: 13, h: 13, isMeetingRoom: true, doors: [{ x: 79, y: 40, w: 3 }] },
  { id: "private_office_4", name: "Phòng Tập Trung (Focus Pod)", englishName: "Focus Pod", x: 91, y: 27, w: 13, h: 13, isMeetingRoom: true, doors: [{ x: 96, y: 40, w: 3 }] },
  { id: "library_room", name: "Phòng Thư Viện & Thảo Luận", englishName: "Library", x: 74, y: 46, w: 30, h: 13, isMeetingRoom: true, doors: [{ x: 74, y: 50, w: 3 }, { x: 87, y: 46, w: 3 }] },
  { id: "quiet_lounge", name: "Phòng Thư Giãn VIP", englishName: "VIP Lounge", x: 74, y: 62, w: 30, h: 15, isMeetingRoom: false, doors: [{ x: 74, y: 67, w: 3 }, { x: 87, y: 62, w: 3 }] },
  { id: "pantry_bar", name: "Quầy Pantry & Cafe", englishName: "Pantry", x: 43, y: 7, w: 10, h: 17, isMeetingRoom: false, doors: [{ x: 46, y: 24, w: 3 }, { x: 53, y: 14, w: 3 }] },
  { id: "cafeteria_dining", name: "Phòng Ăn (Cafeteria)", englishName: "Cafeteria", x: 55, y: 7, w: 11, h: 17, isMeetingRoom: false, doors: [{ x: 55, y: 14, w: 3 }, { x: 58, y: 24, w: 3 }] }
];

class MapEngine {
  constructor() {
    this.canvas = document.getElementById('officeMapCanvas');
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.minimapCanvas = document.getElementById('minimapCanvas');
    this.minimapCtx = this.minimapCanvas ? this.minimapCanvas.getContext('2d') : null;

    // Map Dimensions (120 x 96 tiles at 32px = 3840 x 3072)
    this.mapWidth = 3840;
    this.mapHeight = 3072;

    // Collision system
    this.collisionBoxes = [];
    this.initCollisionBoxes();

    // Automatic Sliding Doors System (All Rooms & Main Entrance)
    this.doors = [];
    this.initDoors();

    // Seating & Park Benches System (All Rooms & Outdoor Streets)
    this.seatingSystem = window.SeatingSystem ? new window.SeatingSystem() : null;

    // Camera (Fixed to cover entire screen, zero black borders)
    this.camera = {
      x: 1920, // center of map (3840 / 2)
      y: 1536, // center of map (3072 / 2)
      zoom: 1.0,
      minZoom: 0.5,
      maxZoom: 2.8
    };
    this.initializedZoom = false;

    // Pathway Grass Texture for Canvas background fill (Never black!)
    this.grassImage = new Image();
    this.grassPattern = null;
    this.grassImage.src = 'assets/floor_pathway_stone_brick.png';
    this.grassImage.onload = () => {
      if (this.ctx) {
        this.grassPattern = this.ctx.createPattern(this.grassImage, 'repeat');
      }
    };

    // Player State
    this.player = {
      x: 1728, // Spawn at Sảnh Lễ Tân (54 * 32)
      y: 2208, // 69 * 32
      width: 32,
      height: 52,
      speed: 2.35, // Current movement speed
      normalSpeed: 2.35, // Tuned for comfortable, relaxed walking pace on 32px grid
      gotoSpeed: 5.2, // Smooth moderate sprint (~2.2x) when double-clicking (ground, seat, or player) or clicking "Go to"
      direction: 'up', // 'down', 'left', 'right', 'up'
      isMoving: false,
      isSitting: false,
      seatId: null,
      frameIndex: 0,
      animTimer: 0,
      name: 'Lữ Quốc Vinh'
    };
    this.pendingSeat = null;
    this.isAutoNavigatingToPlayer = false;
    this.isFastMoving = false;
    this.lastGroundClickTime = 0;
    this.lastGroundClickPos = { x: -9999, y: -9999 };
    this.lastGroundClickScreenPos = { x: -9999, y: -9999 };

    // Input States
    this.keys = {};
    this.isDragging = false;
    this.hasDragged = false;
    this.isTouchDragging = false;
    this.hasTouchDragged = false;
    this.mouseDownPos = { x: 0, y: 0 };
    this.lastMousePos = { x: 0, y: 0 };
    this.hoverTile = null; // Mouse hover tile { x, y, worldX, worldY }
    this.targetPos = null; // Click-to-move destination { x, y, tileX, tileY }
    this.targetIndicatorTimer = 0;
    this.selectedPlayerId = null; // Currently clicked/inspected player
    this.selectionPulseTimer = 0;
    this.navWaypoints = []; // Orthogonal right-angle waypoints
    this.navActiveAxis = null; // Locked axis ('x' or 'y') for steady orthogonal legs
    this.navTargetPlayer = null; // Player being automatically navigated to
    this.lastInputDirection = null; // 4-directional keyboard priority
    this.lastCharClickTime = 0;
    this.lastCharClickId = null;
    this.lastCharTapTime = 0;
    this.lastCharTapId = null;

    // Assets
    this.mapImage = new Image();
    this.mapLoaded = false;
    this.playerSheet = new Image();
    this.playerSheetLoaded = false;

    // Video Call Bubble State
    this.isCameraActive = false;
    this.cameraStream = null;
    this.mockWebcamImg = new Image();
    this.mockWebcamImg.src = 'assets/mock_user_webcam.png';
    this.mockWebcamLoaded = false;
    this.mockWebcamImg.onload = () => { this.mockWebcamLoaded = true; };

    // Remote Players State (Network Synchronization - Phase 2)
    this.remotePlayers = new Map();
    this.remoteSpriteCache = new Map();
    this.onMovement = null;

    // Room Detection State (Spatial Room Multicast - Phase 4)
    this.currentRoom = null;
    this.onRoomChange = null;

    // Footstep Sound Effect
    this.footstepAudio = new Audio('assets/running_footsteps.mp3');
    this.footstepAudio.loop = true;
    this.footstepAudio.volume = 0.5;
    this.isFootstepPlaying = false;
    this.footstepAudio.addEventListener('error', () => {
      if (this.footstepAudio && this.footstepAudio.src.indexOf('running_footsteps.mp3') !== -1) {
        this.footstepAudio.src = 'assets/audio/running_footsteps.mp3';
        this.footstepAudio.load();
      }
    });

    const unlockAudio = () => {
      if (this.footstepAudio) {
        this.footstepAudio.load();
      }
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
    };
    window.addEventListener('click', unlockAudio, { once: true });
    window.addEventListener('keydown', unlockAudio, { once: true });
    window.addEventListener('touchstart', unlockAudio, { once: true });

    window.addEventListener('blur', () => {
      if (this.footstepAudio && !this.footstepAudio.paused) {
        this.footstepAudio.pause();
        this.isFootstepPlaying = false;
      }
    });

    // Magical Summoning Spawn Effects & Web Audio Synthesis
    this.spawnEffects = [];

    // Movement Footstep Dust Particles
    this.dustParticles = [];

    this.init();
  }

  init() {
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());

    // Load assets
    this.mapImage.src = 'assets/office_master_blueprint.png';
    this.mapImage.onload = () => {
      this.mapLoaded = true;
    };

    this.playerSheet.src = 'assets/player_spritesheet.png';
    this.playerSheet.onload = () => {
      this.playerSheetLoaded = true;
    };

    // Setup Event Listeners
    this.setupControls();

    // Start Loop
    this.lastTime = performance.now();
    requestAnimationFrame((t) => this.loop(t));
  }

  setPlayerCharacter(spritePath) {
    if (!spritePath) return;
    const newSheet = new Image();
    newSheet.onload = () => {
      this.playerSheet = newSheet;
      this.playerSheetLoaded = true;
    };
    newSheet.onerror = () => {
      console.warn('Could not load sprite from', spritePath, '- using fallback assets/player_spritesheet.png');
      if (spritePath !== 'assets/player_spritesheet.png') {
        this.setPlayerCharacter('assets/player_spritesheet.png');
      }
    };
    newSheet.src = spritePath;
  }

  setPlayerName(name) {
    if (this.player && name) {
      this.player.name = name;
    }
  }

  setPlayerPosition(x, y, direction = null) {
    if (!this.player) return;
    if (typeof x === 'number') this.player.x = x;
    if (typeof y === 'number') this.player.y = y;
    if (direction) this.player.direction = direction;

    // Keep camera centered cleanly on the assigned spawn spot
    if (this.camera) {
      this.camera.x = this.player.x;
      this.camera.y = this.player.y;
      this.clampCamera();
    }

    // Sync any active local summoning spawn effect to the exact assigned coordinates
    if (this.spawnEffects && this.spawnEffects.length > 0) {
      this.spawnEffects.forEach(effect => {
        if (effect.id === 'local_player' || effect.target === this.player) {
          effect.x = this.player.x;
          effect.y = this.player.y;
        }
      });
    }
  }

  setCameraActive(isActive, stream = null) {
    this.isCameraActive = !!isActive;
    if (stream) {
      this.cameraStream = stream;
    }
  }

  // --- Network Multiplayer Methods (Phase 2) ---
  getRemoteSprite(spritePath) {
    const path = spritePath || 'assets/characters/char_1_dev.png';
    if (!this.remoteSpriteCache.has(path)) {
      const img = new Image();
      img.src = path;
      this.remoteSpriteCache.set(path, img);
    }
    return this.remoteSpriteCache.get(path);
  }

  setRemotePlayers(playerList) {
    this.remotePlayers.clear();
    if (Array.isArray(playerList)) {
      playerList.forEach(p => this.addRemotePlayer(p));
    }
  }

  addRemotePlayer(p) {
    if (!p || !p.id) return;
    this.remotePlayers.set(p.id, {
      id: p.id,
      name: p.name || 'Người dùng',
      characterId: p.characterId || 'char_1',
      sprite: p.sprite || 'assets/characters/char_1_dev.png',
      x: typeof p.x === 'number' ? p.x : 1728,
      y: typeof p.y === 'number' ? p.y : 2208,
      direction: p.direction || 'down',
      isMoving: !!p.isMoving,
      isSitting: !!p.isSitting,
      seatId: p.seatId || null,
      currentRoom: p.currentRoom || null,
      isCallLocked: !!p.isCallLocked,
      callLockedWith: p.callLockedWith || null,
      isNpc: !!p.isNpc,
      frameIndex: 0,
      animTimer: 0,
      width: 32,
      height: 52
    });
    this.getRemoteSprite(p.sprite);
  }

  updateRemotePlayer(data) {
    if (!data || !data.id) return;
    const rp = this.remotePlayers.get(data.id);
    if (rp) {
      const prevSitting = !!rp.isSitting;
      const prevSeatId = rp.seatId || null;
      const prevRoom = rp.currentRoom || null;
      const prevX = rp.x;
      const prevY = rp.y;

      if (typeof data.x === 'number') rp.x = data.x;
      if (typeof data.y === 'number') rp.y = data.y;
      if (data.direction) rp.direction = data.direction;
      if (typeof data.isMoving === 'boolean') rp.isMoving = data.isMoving;
      if (typeof data.isSitting === 'boolean') rp.isSitting = data.isSitting;
      if (data.seatId !== undefined) rp.seatId = data.seatId;
      if (data.currentRoom !== undefined) rp.currentRoom = data.currentRoom;
      if (data.isCallLocked !== undefined) rp.isCallLocked = data.isCallLocked;
      if (data.callLockedWith !== undefined) rp.callLockedWith = data.callLockedWith;

      // Immediately sync group/seated calls even if tab rAF is throttled in background
      if (!rp.isNpc) {
        if (!prevSitting && !!rp.isSitting && window.remoteLeftCallPeers) {
          window.remoteLeftCallPeers.delete(rp.id);
        }
        if (
          prevSitting !== !!rp.isSitting || prevSeatId !== (rp.seatId || null)
          || prevRoom !== (rp.currentRoom || null)
          || Math.abs(rp.x - prevX) > 8 || Math.abs(rp.y - prevY) > 8
        ) {
          this.evaluateGroupCalls();
        }
      }
    }
  }

  removeRemotePlayer(playerId) {
    this.remotePlayers.delete(playerId);
    if (typeof window.removePeerFromGroupCall === 'function') {
      window.removePeerFromGroupCall(playerId, false);
    } else if (window.activeProximityPeer && window.activeProximityPeer.id === playerId) {
      if (typeof window.hideProximityVideoBar === 'function') {
        window.hideProximityVideoBar(false);
      }
    }
  }

  resizeCanvas() {
    if (!this.canvas) return;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    this.canvas.width = rect.width;
    this.canvas.height = rect.height;

    // Minimum Cover Zoom: map always completely covers the screen with zero black borders
    const coverZoom = Math.max(this.canvas.width / this.mapWidth, this.canvas.height / this.mapHeight);
    this.camera.minZoom = coverZoom;

    if (!this.initializedZoom) {
      // Frame the Reception spawn room cleanly on initial spawn (instead of zooming all the way out)
      const spawnRoom = ROOMS_DATA.find(r => r.id === 'reception');
      const roomW = spawnRoom ? spawnRoom.w * 32 : 736;
      const roomH = spawnRoom ? spawnRoom.h * 32 : 576;
      const fitRoomZoom = Math.min(this.canvas.width / (roomW + 110), this.canvas.height / (roomH + 145));
      this.camera.zoom = Math.max(coverZoom, Math.min(1.5, fitRoomZoom));
      this.camera.x = this.player ? this.player.x : (spawnRoom ? (spawnRoom.x + spawnRoom.w / 2) * 32 : 1728);
      this.camera.y = this.player ? this.player.y : (spawnRoom ? (spawnRoom.y + spawnRoom.h / 2) * 32 : 2144);
      this.initializedZoom = true;
    } else if (this.camera.zoom < coverZoom) {
      this.camera.zoom = coverZoom;
    }

    if (this.grassImage && this.grassImage.complete && this.ctx && !this.grassPattern) {
      this.grassPattern = this.ctx.createPattern(this.grassImage, 'repeat');
    }

    this.clampCamera();
  }

  clampCamera() {
    if (!this.canvas) return;
    const halfW = (this.canvas.width / 2) / this.camera.zoom;
    const halfH = (this.canvas.height / 2) / this.camera.zoom;

    if (this.mapWidth * this.camera.zoom <= this.canvas.width) {
      this.camera.x = this.mapWidth / 2;
    } else {
      this.camera.x = Math.max(halfW, Math.min(this.mapWidth - halfW, this.camera.x));
    }

    if (this.mapHeight * this.camera.zoom <= this.canvas.height) {
      this.camera.y = this.mapHeight / 2;
    } else {
      this.camera.y = Math.max(halfH, Math.min(this.mapHeight - halfH, this.camera.y));
    }
  }

  setupControls() {
    // Keyboard
    window.addEventListener('keydown', (e) => {
      // Don't capture when typing in inputs or interacting inside open modals
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      const wbModal = document.getElementById('whiteboardModal');
      if (wbModal && !wbModal.classList.contains('hidden')) return;

      const code = e.code;
      if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight'].includes(code)) {
        this.keys[code] = true;
        if (['KeyW', 'ArrowUp'].includes(code)) this.lastInputDirection = 'up';
        else if (['KeyS', 'ArrowDown'].includes(code)) this.lastInputDirection = 'down';
        else if (['KeyA', 'ArrowLeft'].includes(code)) this.lastInputDirection = 'left';
        else if (['KeyD', 'ArrowRight'].includes(code)) this.lastInputDirection = 'right';
        e.preventDefault();
      } else if (code === 'KeyE') {
        if (this.player.isSitting) {
          this.standUp();
        } else if (this.seatingSystem) {
          const nearSeat = this.seatingSystem.findNearestAvailableSeat(
            this.player.x, this.player.y, 58, this.player, this.remotePlayers
          );
          if (nearSeat) {
            this.sitOnSeat(nearSeat);
          }
        }
        e.preventDefault();
      }
    });

    window.addEventListener('keyup', (e) => {
      const code = e.code;
      if (this.keys[code]) {
        delete this.keys[code];
      }
    });

    // Mouse Pan & Click-to-Move
    const container = this.canvas.parentElement;
    container.addEventListener('mousedown', (e) => {
      if (e.target !== this.canvas) return;
      if (e.button === 0) { // Left click
        this.isDragging = true;
        this.hasDragged = false;
        this.mouseDownPos = { x: e.clientX, y: e.clientY };
        this.lastMousePos = { x: e.clientX, y: e.clientY };
      }
    });

    window.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const isInside = (
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      );

      if (isInside) {
        const screenX = e.clientX - rect.left;
        const screenY = e.clientY - rect.top;
        const worldX = (screenX - this.canvas.width / 2) / this.camera.zoom + this.camera.x;
        const worldY = (screenY - this.canvas.height / 2) / this.camera.zoom + this.camera.y;
        const tileX = Math.floor(worldX / 32) * 32;
        const tileY = Math.floor(worldY / 32) * 32;
        this.hoverTile = { x: tileX, y: tileY, worldX, worldY };

        // Change cursor to pointer if hovering over a character
        if (!this.isDragging) {
          const hoveredPlayer = this.findPlayerAt(worldX, worldY);
          container.style.cursor = hoveredPlayer ? 'pointer' : (this.player.isSitting ? 'default' : 'grab');
        }
      } else {
        this.hoverTile = null;
      }

      if (this.isDragging) {
        const moveDist = Math.hypot(e.clientX - this.mouseDownPos.x, e.clientY - this.mouseDownPos.y);
        if (moveDist > 5) {
          this.hasDragged = true;
          if (!this.player.isSitting) {
            container.style.cursor = 'grabbing';
            const dx = e.clientX - this.lastMousePos.x;
            const dy = e.clientY - this.lastMousePos.y;
            this.camera.x -= dx / this.camera.zoom;
            this.camera.y -= dy / this.camera.zoom;
            this.clampCamera();
          }
          this.lastMousePos = { x: e.clientX, y: e.clientY };
        }
      }
    });

    container.addEventListener('mouseleave', () => {
      this.hoverTile = null;
    });

    window.addEventListener('blur', () => {
      this.isDragging = false;
      this.hasDragged = false;
      this.isTouchDragging = false;
      this.hasTouchDragged = false;
    });

    window.addEventListener('mouseup', (e) => {
      if (this.isDragging) {
        const didDrag = this.hasDragged;
        this.isDragging = false;
        this.hasDragged = false;
        container.style.cursor = this.player.isSitting ? 'default' : 'grab';
        if (!didDrag) {
          if (e.target !== this.canvas) {
            return;
          }
          // Normal Click -> Trigger Click-to-Move
          const rect = this.canvas.getBoundingClientRect();
          if (
            e.clientX >= rect.left &&
            e.clientX <= rect.right &&
            e.clientY >= rect.top &&
            e.clientY <= rect.bottom
          ) {
            const screenX = e.clientX - rect.left;
            const screenY = e.clientY - rect.top;
            const worldX = (screenX - this.canvas.width / 2) / this.camera.zoom + this.camera.x;
            const worldY = (screenY - this.canvas.height / 2) / this.camera.zoom + this.camera.y;

            // Check if user clicked on a player character (sprite, nametag, or proximity)
            const clickedRemotePlayer = this.findPlayerAt(worldX, worldY);
            if (clickedRemotePlayer) {
              const inCallWithClicked = (window.activeCallPeers && window.activeCallPeers.has(clickedRemotePlayer.id))
                || (window.activeProximityPeer && (clickedRemotePlayer.id === window.activeProximityPeer.id || clickedRemotePlayer.name === window.activeProximityPeer.name));
              // If already in conversation with this player, keep them selected and do not leave
              if (inCallWithClicked) {
                this.setSelectedPlayer(clickedRemotePlayer);
                return;
              }

              // Check for Double Click (within 400ms on the same character)
              const now = Date.now();
              const isDoubleClick = (now - (this.lastCharClickTime || 0) < 400) && (this.lastCharClickId === clickedRemotePlayer.id);
              this.lastCharClickTime = now;
              this.lastCharClickId = clickedRemotePlayer.id;

              if (isDoubleClick) {
                // DOUBLE CLICK -> "Go to" that player and initiate call!
                if (this.shouldConfirmLeaveBeforeMove(clickedRemotePlayer.x, clickedRemotePlayer.y, clickedRemotePlayer)) {
                  window.showLeaveConversationModal(() => {
                    if (typeof window.hideProximityVideoBar === 'function') {
                      window.hideProximityVideoBar();
                    }
                    this.setSelectedPlayer(clickedRemotePlayer);
                    if (typeof window.closeUserProfileCard === 'function') {
                      window.closeUserProfileCard(false);
                    }
                    this.navigateToPlayer(clickedRemotePlayer);
                    if (typeof window.showRoomBannerToast === 'function') {
                      window.showRoomBannerToast(`📍 Đang đi tới chỗ ${clickedRemotePlayer.name || 'Đồng nghiệp'}...`);
                    }
                  });
                  return;
                }

                this.setSelectedPlayer(clickedRemotePlayer);
                if (typeof window.closeUserProfileCard === 'function') {
                  window.closeUserProfileCard(false);
                }
                // Navigate to stand comfortably near that character
                this.navigateToPlayer(clickedRemotePlayer);
                if (typeof window.showRoomBannerToast === 'function') {
                  window.showRoomBannerToast(`📍 Đang đi tới chỗ ${clickedRemotePlayer.name || 'Đồng nghiệp'}...`);
                }
              } else {
                // SINGLE CLICK -> Highlight character & open user profile card (top right)
                this.setSelectedPlayer(clickedRemotePlayer);
                if (typeof window.openUserProfileCard === 'function') {
                  window.openUserProfileCard(clickedRemotePlayer);
                }
              }
            } else {
              // Check if user clicked on an available chair / sofa / bench
              const clickNow = Date.now();
              const withinDoubleTime = (clickNow - (this.lastGroundClickTime || 0)) < 420;
              const withinScreenRadius = Math.hypot(
                e.clientX - (this.lastGroundClickScreenPos?.x ?? -9999),
                e.clientY - (this.lastGroundClickScreenPos?.y ?? -9999)
              ) < 28;
              const withinWorldRadius = Math.hypot(
                worldX - (this.lastGroundClickPos?.x ?? -9999),
                worldY - (this.lastGroundClickPos?.y ?? -9999)
              ) < 48;
              const isGroundDoubleClick = (e.detail >= 2) || (withinDoubleTime && (withinScreenRadius || withinWorldRadius));
              this.lastGroundClickTime = clickNow;
              this.lastGroundClickPos = { x: worldX, y: worldY };
              this.lastGroundClickScreenPos = { x: e.clientX, y: e.clientY };

              const hasActiveCall = !!(window.activeCallPeers && window.activeCallPeers.size > 0) || !!window.activeProximityPeer;
              const ownSeatClicked = (this.player.isSitting && !hasActiveCall && this.seatingSystem && typeof this.seatingSystem.isPointOnSeatFurniture === 'function')
                ? this.seatingSystem.isPointOnSeatFurniture(worldX, worldY, this.player.seatId)
                : null;
              if (ownSeatClicked) {
                this.sitOnSeat(ownSeatClicked, true);
                return;
              }

              const clickedSeat = this.seatingSystem
                ? this.seatingSystem.findSeatAt(worldX, worldY, this.player, this.remotePlayers)
                : null;

              if (clickedSeat) {
                if (this.player.isSitting && this.player.seatId === clickedSeat.id) {
                  return;
                }
                const distToSeat = Math.hypot(clickedSeat.x - this.player.x, clickedSeat.y - this.player.y);
                if (distToSeat <= 54) {
                  this.sitOnSeat(clickedSeat);
                } else {
                  if (this.player.isSitting) this.standUp(false);
                  this.setSelectedPlayer(null);
                  this.navTargetPlayer = null;
                  this.pendingSeat = clickedSeat;
                  this.setTargetDestination(clickedSeat.x, clickedSeat.y, false, isGroundDoubleClick);
                }
                return;
              }

              // Clicked on ground to move to another position!
              // Only ask to leave if destination moves out of the active conversation zone
              if (this.shouldConfirmLeaveBeforeMove(worldX, worldY, null)) {
                window.showLeaveConversationModal(() => {
                  if (typeof window.hideProximityVideoBar === 'function') {
                    window.hideProximityVideoBar();
                  }
                  if (this.player.isSitting) this.standUp(false);
                  this.pendingSeat = null;
                  this.setSelectedPlayer(null);
                  this.navTargetPlayer = null;
                  this.setTargetDestination(worldX, worldY, false, isGroundDoubleClick);
                });
                return;
              }

              if (this.player.isSitting) this.standUp(false);
              this.pendingSeat = null;
              this.setSelectedPlayer(null);
              this.navTargetPlayer = null;
              this.setTargetDestination(worldX, worldY, false, isGroundDoubleClick);
            }
          }
        }
      }
    });

    // Native Double Click Support on Character (Go To & Call)
    container.addEventListener('dblclick', (e) => {
      if (e.target !== this.canvas) return;
      const rect = this.canvas.getBoundingClientRect();
      const screenX = e.clientX - rect.left;
      const screenY = e.clientY - rect.top;
      const worldX = (screenX - this.canvas.width / 2) / this.camera.zoom + this.camera.x;
      const worldY = (screenY - this.canvas.height / 2) / this.camera.zoom + this.camera.y;

      const clickedRemotePlayer = this.findPlayerAt(worldX, worldY);
      if (clickedRemotePlayer) {
        if (this.shouldConfirmLeaveBeforeMove(clickedRemotePlayer.x, clickedRemotePlayer.y, clickedRemotePlayer)) {
          window.showLeaveConversationModal(() => {
            if (typeof window.hideProximityVideoBar === 'function') {
              window.hideProximityVideoBar();
            }
            this.setSelectedPlayer(clickedRemotePlayer);
            if (typeof window.closeUserProfileCard === 'function') {
              window.closeUserProfileCard(false);
            }
            this.navigateToPlayer(clickedRemotePlayer);
            if (typeof window.showRoomBannerToast === 'function') {
              window.showRoomBannerToast(`📍 Đang đi tới chỗ ${clickedRemotePlayer.name || 'Đồng nghiệp'}...`);
            }
          });
          return;
        }

        this.setSelectedPlayer(clickedRemotePlayer);
        if (typeof window.closeUserProfileCard === 'function') {
          window.closeUserProfileCard(false);
        }
        this.navigateToPlayer(clickedRemotePlayer);
        if (typeof window.showRoomBannerToast === 'function') {
          window.showRoomBannerToast(`📍 Đang đi tới chỗ ${clickedRemotePlayer.name || 'Đồng nghiệp'}...`);
        }
      } else {
        // Double click on seat or ground -> Sprint smoothly at fast double-click speed!
        const hasActiveDblCall = !!(window.activeCallPeers && window.activeCallPeers.size > 0) || !!window.activeProximityPeer;
        const ownSeatDblClicked = (this.player.isSitting && !hasActiveDblCall && this.seatingSystem && typeof this.seatingSystem.isPointOnSeatFurniture === 'function')
          ? this.seatingSystem.isPointOnSeatFurniture(worldX, worldY, this.player.seatId)
          : null;
        if (ownSeatDblClicked) {
          this.sitOnSeat(ownSeatDblClicked, true);
          return;
        }

        const clickedSeat = this.seatingSystem
          ? this.seatingSystem.findSeatAt(worldX, worldY, this.player, this.remotePlayers)
          : null;
        if (clickedSeat) {
          if (this.player.isSitting && this.player.seatId === clickedSeat.id) return;
          const distToSeat = Math.hypot(clickedSeat.x - this.player.x, clickedSeat.y - this.player.y);
          if (distToSeat <= 54) {
            this.sitOnSeat(clickedSeat);
          } else {
            if (this.player.isSitting) this.standUp(false);
            this.setSelectedPlayer(null);
            this.navTargetPlayer = null;
            this.pendingSeat = clickedSeat;
            this.setTargetDestination(clickedSeat.x, clickedSeat.y, false, true);
          }
          return;
        }

        if (this.shouldConfirmLeaveBeforeMove(worldX, worldY, null)) {
          window.showLeaveConversationModal(() => {
            if (typeof window.hideProximityVideoBar === 'function') {
              window.hideProximityVideoBar();
            }
            if (this.player.isSitting) this.standUp(false);
            this.pendingSeat = null;
            this.setSelectedPlayer(null);
            this.navTargetPlayer = null;
            this.setTargetDestination(worldX, worldY, false, true);
          });
          return;
        }

        if (this.player.isSitting) this.standUp(false);
        this.pendingSeat = null;
        this.setSelectedPlayer(null);
        this.navTargetPlayer = null;
        this.setTargetDestination(worldX, worldY, false, true);
      }
    });

    // Mobile Touch Support: Tap-to-Move & Touch Drag Pan
    container.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        const t = e.touches[0];
        this.isTouchDragging = true;
        this.hasTouchDragged = false;
        this.touchStartPos = { x: t.clientX, y: t.clientY };
        this.lastTouchPos = { x: t.clientX, y: t.clientY };
      }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (this.isTouchDragging && e.touches.length === 1) {
        const t = e.touches[0];
        const moveDist = Math.hypot(t.clientX - this.touchStartPos.x, t.clientY - this.touchStartPos.y);
        if (moveDist > 8) {
          this.hasTouchDragged = true;
          if (!this.player.isSitting) {
            const dx = t.clientX - this.lastTouchPos.x;
            const dy = t.clientY - this.lastTouchPos.y;
            this.camera.x -= dx / this.camera.zoom;
            this.camera.y -= dy / this.camera.zoom;
            this.clampCamera();
          }
          this.lastTouchPos = { x: t.clientX, y: t.clientY };
        }
      }
    }, { passive: true });

    window.addEventListener('touchend', (e) => {
      if (this.isTouchDragging) {
        const didTouchDrag = this.hasTouchDragged;
        this.isTouchDragging = false;
        this.hasTouchDragged = false;
        if (!didTouchDrag) {
          const t = e.changedTouches && e.changedTouches[0];
          if (t) {
            const rect = this.canvas.getBoundingClientRect();
            if (
              t.clientX >= rect.left &&
              t.clientX <= rect.right &&
              t.clientY >= rect.top &&
              t.clientY <= rect.bottom
            ) {
              const screenX = t.clientX - rect.left;
              const screenY = t.clientY - rect.top;
              const worldX = (screenX - this.canvas.width / 2) / this.camera.zoom + this.camera.x;
              const worldY = (screenY - this.canvas.height / 2) / this.camera.zoom + this.camera.y;

              // Check if tapped on a player character
              const clickedRemotePlayer = this.findPlayerAt(worldX, worldY);
              if (clickedRemotePlayer) {
                const inTouchCall = (window.activeCallPeers && window.activeCallPeers.has(clickedRemotePlayer.id))
                  || (window.activeProximityPeer && (clickedRemotePlayer.id === window.activeProximityPeer.id || clickedRemotePlayer.name === window.activeProximityPeer.name));
                if (inTouchCall) {
                  this.setSelectedPlayer(clickedRemotePlayer);
                  return;
                }

                // Check for Double Tap (within 400ms on the same character)
                const now = Date.now();
                const isDoubleTap = (now - (this.lastCharTapTime || 0) < 400) && (this.lastCharTapId === clickedRemotePlayer.id);
                this.lastCharTapTime = now;
                this.lastCharTapId = clickedRemotePlayer.id;

                if (isDoubleTap) {
                  // DOUBLE TAP -> Go to player and start call!
                  if (this.shouldConfirmLeaveBeforeMove(clickedRemotePlayer.x, clickedRemotePlayer.y, clickedRemotePlayer)) {
                    window.showLeaveConversationModal(() => {
                      if (typeof window.hideProximityVideoBar === 'function') {
                        window.hideProximityVideoBar();
                      }
                      this.setSelectedPlayer(clickedRemotePlayer);
                      if (typeof window.closeUserProfileCard === 'function') {
                        window.closeUserProfileCard(false);
                      }
                      this.navigateToPlayer(clickedRemotePlayer);
                      if (typeof window.showRoomBannerToast === 'function') {
                        window.showRoomBannerToast(`📍 Đang đi tới chỗ ${clickedRemotePlayer.name || 'Đồng nghiệp'}...`);
                      }
                    });
                    return;
                  }
                  this.setSelectedPlayer(clickedRemotePlayer);
                  if (typeof window.closeUserProfileCard === 'function') {
                    window.closeUserProfileCard(false);
                  }
                  this.navigateToPlayer(clickedRemotePlayer);
                  if (typeof window.showRoomBannerToast === 'function') {
                    window.showRoomBannerToast(`📍 Đang đi tới chỗ ${clickedRemotePlayer.name || 'Đồng nghiệp'}...`);
                  }
                } else {
                  // SINGLE TAP -> Highlight character & open profile card
                  this.setSelectedPlayer(clickedRemotePlayer);
                  if (typeof window.openUserProfileCard === 'function') {
                    window.openUserProfileCard(clickedRemotePlayer);
                  }
                }
              } else {
                if (this.shouldConfirmLeaveBeforeMove(worldX, worldY, null)) {
                  window.showLeaveConversationModal(() => {
                    if (typeof window.hideProximityVideoBar === 'function') {
                      window.hideProximityVideoBar();
                    }
                    this.setSelectedPlayer(null);
                    this.navTargetPlayer = null;
                    this.setTargetDestination(worldX, worldY, false);
                  });
                  return;
                }
                this.setSelectedPlayer(null);
                this.navTargetPlayer = null;
                this.setTargetDestination(worldX, worldY, false);
              }
            }
          }
        }
      }
    });

    // Zoom via Mouse Wheel
    container.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
      this.setZoom(this.camera.zoom * zoomFactor);
    }, { passive: false });

    // Zoom buttons in Toolbar
    const btnZoomIn = document.getElementById('btnZoomIn');
    const btnZoomOut = document.getElementById('btnZoomOut');
    if (btnZoomIn) {
      btnZoomIn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.setZoom(this.camera.zoom * 1.2);
      });
    }
    if (btnZoomOut) {
      btnZoomOut.addEventListener('click', (e) => {
        e.stopPropagation();
        this.setZoom(this.camera.zoom * 0.83);
      });
    }

    // Minimap Click Navigation (Click to navigate avatar)
    if (this.minimapCanvas) {
      this.minimapCanvas.addEventListener('click', (e) => {
        const rect = this.minimapCanvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        const targetX = (mx / this.minimapCanvas.width) * this.mapWidth;
        const targetY = (my / this.minimapCanvas.height) * this.mapHeight;

        if (window.activeProximityPeer && typeof window.showLeaveConversationModal === 'function') {
          window.showLeaveConversationModal(() => {
            if (typeof window.hideProximityVideoBar === 'function') {
              window.hideProximityVideoBar();
            }
            this.setSelectedPlayer(null);
            this.setTargetDestination(targetX, targetY, false);
          });
          return;
        }

        this.setSelectedPlayer(null);
        this.setTargetDestination(targetX, targetY, false);
      });
    }
  }

  initDoors() {
    const TILE = 32;
    const doors = [];
    const doorKeySet = new Set();

    ROOMS_DATA.forEach(r => {
      const rx = r.x * TILE;
      const ry = r.y * TILE;
      const rw = r.w * TILE;
      const rh = r.h * TILE;

      const rDoors = (r.doors || []).slice();
      // Add Main Entrance to Reception (South wall gate)
      if (r.id === 'reception') {
        rDoors.push({ x: 52, y: 76, w: 4, isMainEntrance: true });
      }

      rDoors.forEach((d, idx) => {
        let orientation = 'horizontal';
        let startX = d.x * TILE;
        let startY = d.y * TILE;
        let width = (d.w || 3) * TILE;
        let height = (d.h || d.w || 3) * TILE;
        let centerX = startX;
        let centerY = startY;

        // Determine orientation based on room boundary match:
        if (d.y === r.y || d.y === r.y + r.h) {
          orientation = 'horizontal';
          height = 16; // wall thickness span
          centerX = startX + width / 2;
          centerY = startY;
        } else if (d.x === r.x || d.x === r.x + r.w) {
          orientation = 'vertical';
          width = 16; // wall thickness span
          height = (d.h || d.w || 3) * TILE;
          centerX = startX;
          centerY = startY + height / 2;
        } else {
          orientation = 'horizontal';
          height = 16;
          centerX = startX + width / 2;
          centerY = startY;
        }

        // Deduplicate shared doorway boundaries
        const key = `${orientation}_${Math.round(centerX)}_${Math.round(centerY)}`;
        if (doorKeySet.has(key)) return;
        doorKeySet.add(key);

        doors.push({
          id: `door_${r.id}_${idx}`,
          roomId: r.id,
          roomName: r.name,
          englishName: r.englishName,
          orientation: orientation,
          startX: startX,
          startY: startY,
          width: width,
          height: height,
          centerX: centerX,
          centerY: centerY,
          openProgress: 0.0, // 0.0 = fully closed, 1.0 = fully open
          targetOpen: 0.0,
          prevTargetOpen: 0.0,
          sensorActive: false
        });
      });
    });

    this.doors = doors;
    console.log(`[Doors] Initialized ${this.doors.length} automatic sliding doors across all rooms.`);
  }

  initCollisionBoxes() {
    const TILE = 32;
    const WALL_HALF = 8; // solid wall collision thickness on 32px grid
    const boxes = [];

    // Outer Building Boundaries (footprint: 2*TILE to map-2*TILE)
    const bx = 2 * TILE, by = 2 * TILE, bw = this.mapWidth - 4 * TILE, bh = this.mapHeight - 4 * TILE;
    // Top exterior wall
    boxes.push({ minX: bx, maxX: bx + bw, minY: 0, maxY: by + 10 });
    // Left exterior wall
    boxes.push({ minX: 0, maxX: bx + 10, minY: by, maxY: by + bh });
    // Right exterior wall
    boxes.push({ minX: bx + bw - 10, maxX: this.mapWidth, minY: by, maxY: by + bh });
    // Bottom exterior wall (split around Main Entrance gate at x = 49*32 to 55*32)
    boxes.push({ minX: bx, maxX: 52 * TILE, minY: by + bh - 10, maxY: this.mapHeight });
    boxes.push({ minX: 56 * TILE, maxX: bx + bw, minY: by + bh - 10, maxY: this.mapHeight });

    // Room Partition Walls
    ROOMS_DATA.forEach(r => {
      const rx = r.x * TILE;
      const ry = r.y * TILE;
      const rw = r.w * TILE;
      const rh = r.h * TILE;
      const doors = r.doors || [];

      // 1. Top Wall (y = ry, x from rx to rx + rw)
      const topDoors = doors.filter(d => d.y === r.y)
        .map(d => ({ start: d.x * TILE, end: (d.x + d.w) * TILE }))
        .sort((a, b) => a.start - b.start);
      let curX = rx;
      topDoors.forEach(d => {
        if (d.start > curX) boxes.push({ minX: curX, maxX: d.start, minY: ry - WALL_HALF, maxY: ry + WALL_HALF });
        curX = Math.max(curX, d.end);
      });
      if (curX < rx + rw) boxes.push({ minX: curX, maxX: rx + rw, minY: ry - WALL_HALF, maxY: ry + WALL_HALF });

      // 2. Bottom Wall (y = ry + rh, x from rx to rx + rw)
      const bottomDoors = doors.filter(d => d.y === r.y + r.h)
        .map(d => ({ start: d.x * TILE, end: (d.x + d.w) * TILE }))
        .sort((a, b) => a.start - b.start);
      if (r.id === 'reception') {
        bottomDoors.push({ start: 52 * TILE, end: 56 * TILE });
        bottomDoors.sort((a, b) => a.start - b.start);
      }
      curX = rx;
      bottomDoors.forEach(d => {
        if (d.start > curX) boxes.push({ minX: curX, maxX: d.start, minY: ry + rh - WALL_HALF, maxY: ry + rh + WALL_HALF });
        curX = Math.max(curX, d.end);
      });
      if (curX < rx + rw) boxes.push({ minX: curX, maxX: rx + rw, minY: ry + rh - WALL_HALF, maxY: ry + rh + WALL_HALF });

      // 3. Left Wall (x = rx, y from ry to ry + rh)
      const leftDoors = doors.filter(d => d.x === r.x)
        .map(d => ({ start: d.y * TILE, end: (d.y + (d.h || d.w)) * TILE }))
        .sort((a, b) => a.start - b.start);
      let curY = ry;
      leftDoors.forEach(d => {
        if (d.start > curY) boxes.push({ minX: rx - WALL_HALF, maxX: rx + WALL_HALF, minY: curY, maxY: d.start });
        curY = Math.max(curY, d.end);
      });
      if (curY < ry + rh) boxes.push({ minX: rx - WALL_HALF, maxX: rx + WALL_HALF, minY: curY, maxY: ry + rh });

      // 4. Right Wall (x = rx + rw, y from ry to ry + rh)
      const rightDoors = doors.filter(d => d.x === r.x + r.w)
        .map(d => ({ start: d.y * TILE, end: (d.y + (d.h || d.w)) * TILE }))
        .sort((a, b) => a.start - b.start);
      curY = ry;
      rightDoors.forEach(d => {
        if (d.start > curY) boxes.push({ minX: rx + rw - WALL_HALF, maxX: rx + rw + WALL_HALF, minY: curY, maxY: d.start });
        curY = Math.max(curY, d.end);
      });
      if (curY < ry + rh) boxes.push({ minX: rx + rw - WALL_HALF, maxX: rx + rw + WALL_HALF, minY: curY, maxY: ry + rh });

      // 5. Zen Garden Koi Pond (solid obstacle, deep water)
      if (r.hasPond) {
        boxes.push({
          minX: 25 * TILE,
          maxX: 33 * TILE,
          minY: 39 * TILE, maxY: 45.5 * TILE
        });
      }
    });

    // 6. Solid Furniture Obstacles
    // Central Lounge (Khu 2) - Central Fireplace Hearth (interactive sofas/armchairs managed by seatingSystem)
    boxes.push({ minX: 53.50 * TILE, maxX: 55.50 * TILE, minY: 40.80 * TILE, maxY: 42.50 * TILE });
    // Northwest Coffee Bar & Mini Fridge
    boxes.push({ minX: 44.50 * TILE, maxX: 45.50 * TILE, minY: 33 * TILE, maxY: 35 * TILE });
    boxes.push({ minX: 45.50 * TILE, maxX: 49.50 * TILE, minY: 35.50 * TILE, maxY: 36.80 * TILE });
    // Southwest Entertainment (Foosball, Arcade, Chess Table, Boardgame Shelf)
    boxes.push({ minX: 44.50 * TILE, maxX: 46.50 * TILE, minY: 44.20 * TILE, maxY: 46 * TILE });
    boxes.push({ minX: 47.50 * TILE, maxX: 48.50 * TILE, minY: 44 * TILE, maxY: 46 * TILE });
    boxes.push({ minX: 45 * TILE, maxX: 47 * TILE, minY: 47.20 * TILE, maxY: 48.80 * TILE });
    boxes.push({ minX: 47.80 * TILE, maxX: 49.80 * TILE, minY: 47.50 * TILE, maxY: 49.50 * TILE });
    // Northeast Grand Piano & Walnut Bookshelf
    boxes.push({ minX: 60 * TILE, maxX: 63 * TILE, minY: 33.50 * TILE, maxY: 36.50 * TILE });
    boxes.push({ minX: 63.50 * TILE, maxX: 65.50 * TILE, minY: 32.50 * TILE, maxY: 35.50 * TILE });
    // Southeast Slat Partition & Live-Edge Slab Table
    boxes.push({ minX: 59.50 * TILE, maxX: 60.50 * TILE, minY: 44.50 * TILE, maxY: 47.50 * TILE });
    boxes.push({ minX: 61 * TILE, maxX: 64 * TILE, minY: 48.20 * TILE, maxY: 49.80 * TILE });
    // Khu 10: Quầy Pantry & Artisan Coffee Station
    // Phân khu 2: North Kitchen Appliances (Microwave Tower, Sink, Smart Refrigerator)
    boxes.push({ minX: 44 * TILE, maxX: 52.50 * TILE, minY: 7 * TILE, maxY: 8.80 * TILE });
    // Phân khu 1: Grand L-Bar Counter in Nero Marquina Marble
    boxes.push({ minX: 44.50 * TILE, maxX: 48.50 * TILE, minY: 11.20 * TILE, maxY: 12.50 * TILE });
    boxes.push({ minX: 44.50 * TILE, maxX: 45.80 * TILE, minY: 12.50 * TILE, maxY: 14 * TILE });
    // Phân khu 4: Moss Green Leather Barstools
    boxes.push({ minX: 48.80 * TILE, maxX: 49.80 * TILE, minY: 11.20 * TILE, maxY: 14.50 * TILE });
    // Phân khu 3: West Wall RO Purifier, Syrup Station & Recycling Bins
    boxes.push({ minX: 44 * TILE, maxX: 45.50 * TILE, minY: 16.50 * TILE, maxY: 22.50 * TILE });
    // Phân khu 5: Southeast Terracotta Fiddle Leaf Fig
    boxes.push({ minX: 51 * TILE, maxX: 52.50 * TILE, minY: 21 * TILE, maxY: 22.50 * TILE });

    // Reception Desk & Furniture (Khu 1)
    // Turnstiles & Kiosks
    boxes.push({ minX: 46.50 * TILE, maxX: 48.50 * TILE, minY: 72.50 * TILE, maxY: 74.50 * TILE });
    boxes.push({ minX: 49 * TILE, maxX: 51 * TILE, minY: 73 * TILE, maxY: 74.50 * TILE });
    boxes.push({ minX: 57 * TILE, maxX: 59 * TILE, minY: 73 * TILE, maxY: 74.50 * TILE });
    boxes.push({ minX: 59.50 * TILE, maxX: 61.50 * TILE, minY: 72.50 * TILE, maxY: 74.50 * TILE });
    // Grand Reception Desk & Staff backdrop
    boxes.push({ minX: 51 * TILE, maxX: 58 * TILE, minY: 63.50 * TILE, maxY: 64.60 * TILE });
    boxes.push({ minX: 51.50 * TILE, maxX: 57.50 * TILE, minY: 59.50 * TILE, maxY: 61.50 * TILE });
    // West VIP Lounge (L-Sofa & Coffee Table)
    boxes.push({ minX: 44.50 * TILE, maxX: 47.50 * TILE, minY: 61 * TILE, maxY: 63 * TILE });
    boxes.push({ minX: 45.50 * TILE, maxX: 47.50 * TILE, minY: 64 * TILE, maxY: 65 * TILE });
    boxes.push({ minX: 48.50 * TILE, maxX: 49.50 * TILE, minY: 59 * TILE, maxY: 60.50 * TILE });
    // East Trophy Cabinet, Lockers & Interactive Table
    boxes.push({ minX: 60.50 * TILE, maxX: 62.50 * TILE, minY: 59 * TILE, maxY: 61 * TILE });
    boxes.push({ minX: 63 * TILE, maxX: 65 * TILE, minY: 59 * TILE, maxY: 61 * TILE });
    boxes.push({ minX: 61 * TILE, maxX: 63 * TILE, minY: 63.50 * TILE, maxY: 65.50 * TILE });
    boxes.push({ minX: 61 * TILE, maxX: 63 * TILE, minY: 68 * TILE, maxY: 69 * TILE });
    // Marble Pillars
    boxes.push({ minX: 50.20 * TILE, maxX: 51.20 * TILE, minY: 58.20 * TILE, maxY: 59.50 * TILE });
    boxes.push({ minX: 57.80 * TILE, maxX: 58.80 * TILE, minY: 58.20 * TILE, maxY: 59.50 * TILE });

    // Khu 11: Phòng Ăn (Cafeteria Dining & Communal Lunch Hub)
    // Phân khu 3: North Buffet Steam Table & Salad Bar Counter
    boxes.push({ minX: 56 * TILE, maxX: 65 * TILE, minY: 7 * TILE, maxY: 8.80 * TILE });
    // Phân khu 1: Central Communal Oak Dining Table & Scandi Chairs
    boxes.push({ minX: 57 * TILE, maxX: 63 * TILE, minY: 9.80 * TILE, maxY: 13.60 * TILE });
    // Phân khu 4: East Vending Machine & Scotsman Ice Maker
    boxes.push({ minX: 63.50 * TILE, maxX: 65.50 * TILE, minY: 10 * TILE, maxY: 14.20 * TILE });
    // Phân khu 2: Southeast Cozy Booth Sofa Dining Set
    boxes.push({ minX: 59.50 * TILE, maxX: 64.50 * TILE, minY: 16.50 * TILE, maxY: 19.50 * TILE });
    // Phân khu 5: Southwest Dish Tray Return Bussing Cart & Monstera Pot
    boxes.push({ minX: 56 * TILE, maxX: 58 * TILE, minY: 18 * TILE, maxY: 22.50 * TILE });

    // Library Room (Grand Oxford Library - Khu 8)
    // Phân khu 1: Grand Long Reading Table (Center)
    boxes.push({ minX: 83 * TILE, maxX: 91 * TILE, minY: 51.80 * TILE, maxY: 53.80 * TILE });
    // Phân khu 2: North Wall Bookcases (West & East of door)
    boxes.push({ minX: 80 * TILE, maxX: 86 * TILE, minY: 46 * TILE, maxY: 48.50 * TILE });
    boxes.push({ minX: 91 * TILE, maxX: 103.50 * TILE, minY: 46 * TILE, maxY: 48.50 * TILE });
    // Phân khu 3: Southwest Round Discussion Table & Board
    boxes.push({ minX: 75 * TILE, maxX: 79 * TILE, minY: 52.50 * TILE, maxY: 57.50 * TILE });
    // Phân khu 4: Southeast Wingback Armchairs & Magazine Rack
    boxes.push({ minX: 95 * TILE, maxX: 103.50 * TILE, minY: 53.50 * TILE, maxY: 58 * TILE });
    // Phân khu 5: Northwest Librarian Service Desk, UV Sterilizer & Drop Bin
    boxes.push({ minX: 74.80 * TILE, maxX: 80 * TILE, minY: 47.20 * TILE, maxY: 50.50 * TILE });

    // Quiet Lounge & VIP Acoustic Salon (Khu 9)
    // Phân khu 1: Central VIP Salon (Sofa, Coffee Table, Accent Chairs)
    boxes.push({ minX: 86 * TILE, maxX: 92 * TILE, minY: 68.40 * TILE, maxY: 69.80 * TILE });
    boxes.push({ minX: 87.50 * TILE, maxX: 90.50 * TILE, minY: 70.80 * TILE, maxY: 72.20 * TILE });
    boxes.push({ minX: 87.50 * TILE, maxX: 90.50 * TILE, minY: 73 * TILE, maxY: 74 * TILE });
    // Phân khu 2: Northwest Artisan Coffee Bar & Wine Cooler
    boxes.push({ minX: 76 * TILE, maxX: 78 * TILE, minY: 62.80 * TILE, maxY: 64.50 * TILE });
    boxes.push({ minX: 77 * TILE, maxX: 81 * TILE, minY: 64.40 * TILE, maxY: 66 * TILE });
    boxes.push({ minX: 77.50 * TILE, maxX: 80.50 * TILE, minY: 66.50 * TILE, maxY: 67.20 * TILE });
    // Phân khu 3: North Biophilic Moss Wall, Nature Aquarium & Palm
    boxes.push({ minX: 91 * TILE, maxX: 103.50 * TILE, minY: 62 * TILE, maxY: 64.50 * TILE });
    // Phân khu 4: Southeast Hi-Fi Vinyl, Tube Amp & Chaise Lounge
    boxes.push({ minX: 97.50 * TILE, maxX: 102 * TILE, minY: 69.60 * TILE, maxY: 71 * TILE });
    boxes.push({ minX: 98.50 * TILE, maxX: 102.50 * TILE, minY: 72.40 * TILE, maxY: 74.20 * TILE });
    // Phân khu 5: Southwest Boardgame Chess Table & Collection Cabinet
    boxes.push({ minX: 77.50 * TILE, maxX: 79.50 * TILE, minY: 71 * TILE, maxY: 72.80 * TILE });
    boxes.push({ minX: 76 * TILE, maxX: 78 * TILE, minY: 73.80 * TILE, maxY: 75.80 * TILE });

    // Conference Hall / Boardroom (Khu 5)
    // Phân khu 1: Grand Boardroom U-Table (North bridge, Left wing, Right wing)
    boxes.push({ minX: 17 * TILE, maxX: 23 * TILE, minY: 13 * TILE, maxY: 14.2 * TILE });
    boxes.push({ minX: 17 * TILE, maxX: 18.4 * TILE, minY: 14.2 * TILE, maxY: 17 * TILE });
    boxes.push({ minX: 21.6 * TILE, maxX: 23 * TILE, minY: 14.2 * TILE, maxY: 17 * TILE });
    // Phân khu 2: Presentation Stage Podium, Prompter, Flipchart & Flags
    boxes.push({ minX: 15 * TILE, maxX: 16.2 * TILE, minY: 9.2 * TILE, maxY: 10.8 * TILE });
    boxes.push({ minX: 17.8 * TILE, maxX: 18.8 * TILE, minY: 10.2 * TILE, maxY: 11 * TILE });
    boxes.push({ minX: 12.2 * TILE, maxX: 14.2 * TILE, minY: 8.8 * TILE, maxY: 10.2 * TILE });
    boxes.push({ minX: 22 * TILE, maxX: 23.2 * TILE, minY: 9.2 * TILE, maxY: 10.8 * TILE });
    boxes.push({ minX: 11 * TILE, maxX: 12 * TILE, minY: 8 * TILE, maxY: 9 * TILE });
    boxes.push({ minX: 25.5 * TILE, maxX: 26.5 * TILE, minY: 8 * TILE, maxY: 9 * TILE });
    // Phân khu 3: Simultaneous Interpretation Soundproof Booth & Archive Bookshelf & Advisory Chairs
    boxes.push({ minX: 28 * TILE, maxX: 31 * TILE, minY: 8 * TILE, maxY: 10 * TILE });
    boxes.push({ minX: 32.5 * TILE, maxX: 34.5 * TILE, minY: 8 * TILE, maxY: 10 * TILE });
    boxes.push({ minX: 27.5 * TILE, maxX: 31.5 * TILE, minY: 11.6 * TILE, maxY: 12.6 * TILE });
    boxes.push({ minX: 33.5 * TILE, maxX: 34.5 * TILE, minY: 11.5 * TILE, maxY: 13 * TILE });
    // Phân khu 4: AV Rack, Soundcraft Mixer Desk & Secretary Desk
    boxes.push({ minX: 32.5 * TILE, maxX: 34.5 * TILE, minY: 14.5 * TILE, maxY: 16.5 * TILE });
    boxes.push({ minX: 29 * TILE, maxX: 32 * TILE, minY: 15 * TILE, maxY: 17 * TILE });
    boxes.push({ minX: 29.5 * TILE, maxX: 31.5 * TILE, minY: 18.5 * TILE, maxY: 20.5 * TILE });
    boxes.push({ minX: 25.5 * TILE, maxX: 27.5 * TILE, minY: 22.5 * TILE, maxY: 23.5 * TILE });
    // Phân khu 5: Teabreak Wine Cooler, Buffet Table, Auditorium Seats & Awards Showcase
    boxes.push({ minX: 8.2 * TILE, maxX: 9.2 * TILE, minY: 7.5 * TILE, maxY: 9.5 * TILE });
    boxes.push({ minX: 9.8 * TILE, maxX: 12.8 * TILE, minY: 8.5 * TILE, maxY: 9.8 * TILE });
    boxes.push({ minX: 8.2 * TILE, maxX: 9.2 * TILE, minY: 11.5 * TILE, maxY: 13 * TILE });
    boxes.push({ minX: 9.5 * TILE, maxX: 12.5 * TILE, minY: 13 * TILE, maxY: 14 * TILE });
    boxes.push({ minX: 9.5 * TILE, maxX: 12.5 * TILE, minY: 15.5 * TILE, maxY: 16.5 * TILE });
    boxes.push({ minX: 9.5 * TILE, maxX: 12.5 * TILE, minY: 18 * TILE, maxY: 19 * TILE });
    boxes.push({ minX: 9.5 * TILE, maxX: 11.5 * TILE, minY: 20.5 * TILE, maxY: 22.5 * TILE });

    // Small Meeting / Interview Pod (Khu 6)
    // Bookcase, Filing Cabinet & Printer (West wall North)
    boxes.push({ minX: 8 * TILE, maxX: 10 * TILE, minY: 33 * TILE, maxY: 36.50 * TILE });
    boxes.push({ minX: 8 * TILE, maxX: 9.50 * TILE, minY: 37.20 * TILE, maxY: 38.50 * TILE });
    // Mobile Glass Whiteboard (North-East wall)
    boxes.push({ minX: 16.20 * TILE, maxX: 17.50 * TILE, minY: 33.50 * TILE, maxY: 35.50 * TILE });
    // Smart Huddle Oval Table (Center-South)
    boxes.push({ minX: 10.50 * TILE, maxX: 14.50 * TILE, minY: 41.80 * TILE, maxY: 43.80 * TILE });
    // Water Dispenser & Fig Plant (West wall South)
    boxes.push({ minX: 8 * TILE, maxX: 9.50 * TILE, minY: 46.50 * TILE, maxY: 49.50 * TILE });
    // Acoustic Wingback Armchair & Side Table (East wall South)
    boxes.push({ minX: 14.80 * TILE, maxX: 17.50 * TILE, minY: 46.50 * TILE, maxY: 49 * TILE });

    // Zen Garden (Khu 3)
    // Tatami Platform & Chabudai Table
    boxes.push({ minX: 21.50 * TILE, maxX: 24.50 * TILE, minY: 33.50 * TILE, maxY: 35.50 * TILE });
    // Shishi-Odoshi Bamboo Fountain & Bamboo Grove
    boxes.push({ minX: 23.50 * TILE, maxX: 25.50 * TILE, minY: 45.50 * TILE, maxY: 47.50 * TILE });
    boxes.push({ minX: 21 * TILE, maxX: 22.50 * TILE, minY: 43 * TILE, maxY: 49 * TILE });
    // Bonsai Pine Pedestal
    boxes.push({ minX: 34.50 * TILE, maxX: 36.50 * TILE, minY: 35.80 * TILE, maxY: 37.80 * TILE });
    // Rustic Log Benches
    boxes.push({ minX: 22 * TILE, maxX: 24 * TILE, minY: 48.20 * TILE, maxY: 49.50 * TILE });
    boxes.push({ minX: 34.50 * TILE, maxX: 36.50 * TILE, minY: 45 * TILE, maxY: 46.50 * TILE });

    // Open Workspace & Coworking Hub (Khu 4)
    // Phân khu 1: Central Long Benching Workstations (8x3 tiles)
    boxes.push({ minX: 14.50 * TILE, maxX: 22.50 * TILE, minY: 66 * TILE, maxY: 69 * TILE });
    // Phân khu 2: Agile High-Top Table & Mobile Scrum Board
    boxes.push({ minX: 8.50 * TILE, maxX: 10.50 * TILE, minY: 59.80 * TILE, maxY: 61.80 * TILE });
    boxes.push({ minX: 13 * TILE, maxX: 17 * TILE, minY: 60.20 * TILE, maxY: 62.50 * TILE });
    // Phân khu 3: Drafting Tilt Desk, 3D Printer Station, Printer & Mesh Lockers
    boxes.push({ minX: 22.50 * TILE, maxX: 25.50 * TILE, minY: 58.30 * TILE, maxY: 62.50 * TILE });
    boxes.push({ minX: 32.50 * TILE, maxX: 34.50 * TILE, minY: 58.50 * TILE, maxY: 63 * TILE });
    // Phân khu 4: Tiered Wooden Bleacher Seats & Bookshelf
    boxes.push({ minX: 8.50 * TILE, maxX: 12.50 * TILE, minY: 70 * TILE, maxY: 73 * TILE });
    boxes.push({ minX: 8.20 * TILE, maxX: 10.20 * TILE, minY: 74 * TILE, maxY: 76 * TILE });
    // Phân khu 5: Acoustic Phone Booths, Hydration Bar, Planter Divider & Vending
    boxes.push({ minX: 30 * TILE, maxX: 34 * TILE, minY: 69.50 * TILE, maxY: 71.50 * TILE });
    boxes.push({ minX: 25 * TILE, maxX: 28 * TILE, minY: 69.80 * TILE, maxY: 71.30 * TILE });
    boxes.push({ minX: 25 * TILE, maxX: 28 * TILE, minY: 73 * TILE, maxY: 74.50 * TILE });
    boxes.push({ minX: 31.50 * TILE, maxX: 34.50 * TILE, minY: 72.50 * TILE, maxY: 74.50 * TILE });

    // Private Offices (Khu 7A, 7B, 7C, 7D)
    // 7A CEO Suite
    // L-Shaped Executive Desk (Main desk & left return credenza)
    boxes.push({ minX: 78 * TILE, maxX: 82 * TILE, minY: 13.50 * TILE, maxY: 15 * TILE });
    boxes.push({ minX: 78 * TILE, maxX: 79.20 * TILE, minY: 12 * TILE, maxY: 13.50 * TILE });
    // North Display Vitrine & Safe
    boxes.push({ minX: 80.50 * TILE, maxX: 83.50 * TILE, minY: 7.20 * TILE, maxY: 9.20 * TILE });
    boxes.push({ minX: 84.50 * TILE, maxX: 85.50 * TILE, minY: 7.50 * TILE, maxY: 9.20 * TILE });
    // West Wall Money Tree & Ticker
    boxes.push({ minX: 74.80 * TILE, maxX: 76 * TILE, minY: 13 * TILE, maxY: 14.50 * TILE });
    // South-West VIP Leather Sofa, Marble Coffee Table & Armchair
    boxes.push({ minX: 75 * TILE, maxX: 77.20 * TILE, minY: 14.80 * TILE, maxY: 16 * TILE });
    boxes.push({ minX: 75 * TILE, maxX: 77.20 * TILE, minY: 16.80 * TILE, maxY: 18 * TILE });
    boxes.push({ minX: 77.80 * TILE, maxX: 78.80 * TILE, minY: 16.80 * TILE, maxY: 17.80 * TILE });
    // South-East Bar Credenza & Mini Wine Cooler
    boxes.push({ minX: 83.80 * TILE, maxX: 85.80 * TILE, minY: 15 * TILE, maxY: 16.20 * TILE });
    boxes.push({ minX: 84.50 * TILE, maxX: 85.50 * TILE, minY: 17 * TILE, maxY: 18.50 * TILE });
    // 7B Director Suite (CTO)
    // Smart Standing Desk (Center)
    boxes.push({ minX: 95 * TILE, maxX: 99 * TILE, minY: 12.20 * TILE, maxY: 14.20 * TILE });
    // North Server Rack, UPS & Dashboard
    boxes.push({ minX: 97 * TILE, maxX: 100 * TILE, minY: 7.20 * TILE, maxY: 9.30 * TILE });
    // West Glass Architecture Board & O'Reilly Bookshelf
    boxes.push({ minX: 91.50 * TILE, maxX: 93.80 * TILE, minY: 9.50 * TILE, maxY: 15.50 * TILE });
    // East Collectibles Showcase & Bonsai
    boxes.push({ minX: 101.50 * TILE, maxX: 103 * TILE, minY: 8 * TILE, maxY: 12.50 * TILE });
    // South-East Credenza Bar & Energy Drink Fridge
    boxes.push({ minX: 100 * TILE, maxX: 103 * TILE, minY: 15 * TILE, maxY: 18.50 * TILE });
    // 7C Manager Studio (PM & Product Lead)
    // Agile Standing Desk (Center)
    boxes.push({ minX: 78 * TILE, maxX: 82 * TILE, minY: 32.20 * TILE, maxY: 34.20 * TILE });
    // West Agile Bookshelf, Plant & PRD Archive
    boxes.push({ minX: 74.50 * TILE, maxX: 76.20 * TILE, minY: 29.50 * TILE, maxY: 37.50 * TILE });
    // East Brainstorm Round Table & Stools
    boxes.push({ minX: 84 * TILE, maxX: 86 * TILE, minY: 30 * TILE, maxY: 33.50 * TILE });
    // South-East Tea Credenza & Printer Shredder
    boxes.push({ minX: 83 * TILE, maxX: 86 * TILE, minY: 35 * TILE, maxY: 38.50 * TILE });
    // 7D Focus Pod (Deep Work & Cognitive Sanctuary)
    // Deep Work Acoustic Desk (Center)
    boxes.push({ minX: 95 * TILE, maxX: 99 * TILE, minY: 32.20 * TILE, maxY: 34.20 * TILE });
    // West Academic Bookshelf, Snake Plant & Audio Station
    boxes.push({ minX: 91.50 * TILE, maxX: 93.20 * TILE, minY: 29.50 * TILE, maxY: 37.50 * TILE });
    // South-East Eames Lounge Chair & Ottoman
    boxes.push({ minX: 99.50 * TILE, maxX: 103 * TILE, minY: 35.50 * TILE, maxY: 39 * TILE });
    // East Dyson Air Purifier & Crystal Credenza
    boxes.push({ minX: 101.50 * TILE, maxX: 103.20 * TILE, minY: 28.50 * TILE, maxY: 33 * TILE });

    // 16. Outdoor Biophilic Trees Solid Collisions (Enlarged giant trees & wide open walkways)
    const outdoorTreeCollisions = [
      // Zone 1: North Perimeter (Campus Top Edge, Giant Trees)
      { x: 15.0, y: 1.5, w: 70, h: 84 },
      { x: 38.5, y: 1.2, w: 104, h: 76 },
      { x: 63.0, y: 1.8, w: 70, h: 84 },
      { x: 92.0, y: 1.2, w: 92, h: 70 },

      // Zone 4: South Perimeter & Bottom Corners (Cherry Blossom Boulevard: y: 77..84)
      { x: 5.0, y: 76.5, w: 104, h: 76 },
      { x: 20.2, y: 76.5, w: 64, h: 48 },
      { x: 84.0, y: 77.2, w: 92, h: 70 },
      { x: 104.2, y: 77.2, w: 86, h: 86 },

      // Zone 5: West & East Exterior Campus Walls (Grand Canopy Trees)
      { x: 2.5, y: 13.0, w: 70, h: 84 },
      { x: 2.2, y: 59.5, w: 60, h: 60 },
      { x: 104.2, y: 11.5, w: 104, h: 76 },
      { x: 104.2, y: 50.0, w: 70, h: 84 },

      // Zone 6: Vertical Courtyards Hugging Room Walls
      { x: 35.0, y: 12.5, w: 96, h: 72 },
      { x: 66.2, y: 12.5, w: 60, h: 56 },

      // Zone 7: Additional Cherry Blossom Trees (Areas 4 and Spawn)
      { x: 2.2, y: 68.8, w: 68, h: 50 },
      { x: 27.5, y: 76.5, w: 64, h: 48 },
      { x: 45.5, y: 76.5, w: 70, h: 52 },
      { x: 59.5, y: 76.5, w: 66, h: 52 }
    ];

    outdoorTreeCollisions.forEach(t => {
      const tw = (t.w / 16) * TILE;
      const th = (t.h / 16) * TILE;
      // Solid collision box covering tree body:
      // Solidly blocks player from walking through the tree from any direction
      boxes.push({
        minX: t.x * TILE + tw * 0.18,
        maxX: t.x * TILE + tw * 0.82,
        minY: t.y * TILE + th * 0.18,
        maxY: t.y * TILE + th * 0.95
      });
    });

    // 17. Outdoor Walkway Decorative Props Solid Collisions (Spacious, Strategic Placement)
    const outdoorSolidProps = [
      // Enlarged Water Features (Grand Fountains & Leisure Swimming Pool):
      { type: 'fountain', x: 49.4, y: 1.8, w: 96, h: 62 },
      { type: 'fountain', x: 12.8, y: 71.5, w: 96, h: 62 },
      { type: 'pool', x: 84.5, y: 71.5, w: 76, h: 71 },
      { type: 'fountain', x: 23.0, y: 2.0, w: 60, h: 60 },
      { type: 'fountain', x: 32.0, y: 71.5, w: 60, h: 60 },
      { type: 'fountain', x: 3.2, y: 35.5, w: 42, h: 40 },
      { type: 'fountain', x: 81.5, y: 2.0, w: 54, h: 50 },
      { type: 'fountain', x: 84.0, y: 20.6, w: 42, h: 44 },
      { type: 'fountain', x: 64.0, y: 43.5, w: 42, h: 44 },

      // Street Lampposts (slender wooden pole base):
      { type: 'lamppost', x: 41.8, y: 24.15, w: 16, h: 27 },
      { type: 'lamppost', x: 66.4, y: 24.15, w: 16, h: 27 },
      { type: 'lamppost', x: 41.8, y: 30.20, w: 16, h: 27 },
      { type: 'lamppost', x: 66.4, y: 30.20, w: 16, h: 27 },
      { type: 'lamppost', x: 41.8, y: 50.15, w: 16, h: 27 },
      { type: 'lamppost', x: 66.4, y: 50.15, w: 16, h: 27 },
      { type: 'lamppost', x: 41.8, y: 56.20, w: 16, h: 27 },
      { type: 'lamppost', x: 66.4, y: 56.20, w: 16, h: 27 },
      { type: 'lamppost', x: 45.2, y: 70.4, w: 26, h: 40 },
      { type: 'lamppost', x: 56.8, y: 70.4, w: 26, h: 40 },

      // Room Outer-Corner Park Lampposts:
      { type: 'lamppost', x: 5.8, y: 5.20, w: 16, h: 27 },
      { type: 'lamppost', x: 35.4, y: 5.20, w: 16, h: 27 },
      { type: 'lamppost', x: 5.8, y: 24.15, w: 16, h: 27 },
      { type: 'lamppost', x: 34.4, y: 24.15, w: 16, h: 27 },
      { type: 'lamppost', x: 5.8, y: 30.20, w: 16, h: 27 },
      { type: 'lamppost', x: 18.2, y: 30.20, w: 16, h: 27 },
      { type: 'lamppost', x: 5.8, y: 50.15, w: 16, h: 27 },
      { type: 'lamppost', x: 18.2, y: 50.15, w: 16, h: 27 },
      { type: 'lamppost', x: 19.8, y: 30.20, w: 16, h: 27 },
      { type: 'lamppost', x: 35.4, y: 30.20, w: 16, h: 27 },
      { type: 'lamppost', x: 19.8, y: 50.15, w: 16, h: 27 },
      { type: 'lamppost', x: 34.4, y: 50.15, w: 16, h: 27 },
      { type: 'lamppost', x: 5.8, y: 56.20, w: 16, h: 27 },
      { type: 'lamppost', x: 35.4, y: 56.20, w: 16, h: 27 },
      { type: 'lamppost', x: 5.8, y: 74.20, w: 16, h: 27 },
      { type: 'lamppost', x: 35.4, y: 74.20, w: 16, h: 27 },
      { type: 'lamppost', x: 45.4, y: 5.20, w: 16, h: 27 },
      { type: 'lamppost', x: 67.4, y: 6.20, w: 16, h: 27 },
      { type: 'lamppost', x: 41.8, y: 76.15, w: 16, h: 27 },
      { type: 'lamppost', x: 66.4, y: 76.15, w: 16, h: 27 },
      { type: 'lamppost', x: 72.8, y: 5.20, w: 16, h: 27 },
      { type: 'lamppost', x: 85.8, y: 5.20, w: 16, h: 27 },
      { type: 'lamppost', x: 72.8, y: 18.20, w: 16, h: 27 },
      { type: 'lamppost', x: 91.1, y: 5.62, w: 16, h: 27 },
      { type: 'lamppost', x: 104.4, y: 5.20, w: 16, h: 27 },
      { type: 'lamppost', x: 104.4, y: 18.20, w: 16, h: 27 },
      { type: 'lamppost', x: 72.8, y: 25.20, w: 16, h: 27 },
      { type: 'lamppost', x: 85.8, y: 25.20, w: 16, h: 27 },
      { type: 'lamppost', x: 72.8, y: 40.15, w: 16, h: 27 },
      { type: 'lamppost', x: 85.8, y: 40.15, w: 16, h: 27 },
      { type: 'lamppost', x: 92.8, y: 25.20, w: 16, h: 27 },
      { type: 'lamppost', x: 104.4, y: 25.20, w: 16, h: 27 },
      { type: 'lamppost', x: 91.2, y: 40.15, w: 16, h: 27 },
      { type: 'lamppost', x: 104.4, y: 40.15, w: 16, h: 27 },
      { type: 'lamppost', x: 72.8, y: 44.20, w: 16, h: 27 },
      { type: 'lamppost', x: 104.4, y: 44.20, w: 16, h: 27 },
      { type: 'lamppost', x: 72.8, y: 59.15, w: 16, h: 27 },
      { type: 'lamppost', x: 104.4, y: 59.15, w: 16, h: 27 },
      { type: 'lamppost', x: 72.8, y: 60.20, w: 16, h: 27 },
      { type: 'lamppost', x: 104.4, y: 60.20, w: 16, h: 27 },
      { type: 'lamppost', x: 72.8, y: 77.15, w: 16, h: 27 },
      { type: 'lamppost', x: 104.4, y: 75.20, w: 16, h: 27 },

      // Ancient Stone Pillars & Pedestals:
      { type: 'pillar', x: 23.5, y: 47.8, w: 16, h: 41 },
      { type: 'pillar', x: 32.5, y: 47.8, w: 16, h: 41 },
      { type: 'pillar', x: 19.5, y: 40.5, w: 16, h: 41 },
      { type: 'pedestal', x: 19.2, y: 42.5, w: 20, h: 13 },
      { type: 'pillar', x: 19.5, y: 44.5, w: 16, h: 31 }
    ];

    outdoorSolidProps.forEach(p => {
      const tw = (p.w / 16) * TILE;
      const th = (p.h / 16) * TILE;
      if (p.type === 'lamppost') {
        boxes.push({
          minX: p.x * TILE + tw * 0.32,
          maxX: p.x * TILE + tw * 0.44,
          minY: p.y * TILE + th * 0.78,
          maxY: p.y * TILE + th * 0.98
        });
      } else if (p.type === 'pillar') {
        boxes.push({
          minX: p.x * TILE + tw * 0.15,
          maxX: p.x * TILE + tw * 0.85,
          minY: p.y * TILE + th * 0.72,
          maxY: p.y * TILE + th * 0.98
        });
      } else if (p.type === 'pedestal') {
        boxes.push({
          minX: p.x * TILE + tw * 0.10,
          maxX: p.x * TILE + tw * 0.90,
          minY: p.y * TILE + th * 0.40,
          maxY: p.y * TILE + th * 0.98
        });
      } else if (p.type === 'fountain') {
        // Solid stone basin/rim collider
        boxes.push({
          minX: p.x * TILE + tw * 0.14,
          maxX: p.x * TILE + tw * 0.86,
          minY: p.y * TILE + th * 0.32,
          maxY: p.y * TILE + th * 0.95
        });
      } else if (p.type === 'pool') {
        // Swimming pool water basin & coping rim
        boxes.push({
          minX: p.x * TILE + tw * 0.10,
          maxX: p.x * TILE + tw * 0.90,
          minY: p.y * TILE + th * 0.12,
          maxY: p.y * TILE + th * 0.92
        });
      }
    });

    this.collisionBoxes = boxes;
  }

  checkCollision(px, py) {
    const hw = 10; // Half width of player foot box on 32px grid
    const hh = 6; // Half height of player foot box on 32px grid
    const pMinX = px - hw;
    const pMaxX = px + hw;
    const pMinY = py - hh;
    const pMaxY = py + hh;

    const boxes = this.collisionBoxes;
    for (let i = 0; i < boxes.length; i++) {
      const b = boxes[i];
      if (pMaxX > b.minX && pMinX < b.maxX && pMaxY > b.minY && pMinY < b.maxY) {
        return true;
      }
    }
    return false;
  }

  findPlayerAt(worldX, worldY) {
    if (!this.remotePlayers) return null;
    for (const rp of this.remotePlayers.values()) {
      if (rp.isNpc) continue;
      // 1. Sprite body bounds (center X at rp.x, height 52 from feet up to head)
      const inBodyX = Math.abs(worldX - rp.x) <= 24;
      const inBodyY = worldY >= rp.y - 56 && worldY <= rp.y + 12;

      // 2. Nametag bounds (floating above head: y - 78 to y - 48, width ~110px)
      const inBadgeX = Math.abs(worldX - rp.x) <= 60;
      const inBadgeY = worldY >= rp.y - 82 && worldY <= rp.y - 48;

      // 3. Proximity fallback (within ~32px of sprite center)
      const spriteCenterY = rp.y - 26;
      const distToCenter = Math.hypot(worldX - rp.x, worldY - spriteCenterY);

      if ((inBodyX && inBodyY) || (inBadgeX && inBadgeY) || distToCenter <= 34) {
        return rp;
      }
    }
    return null;
  }

  setSelectedPlayer(target) {
    if (!target) {
      this.selectedPlayerId = null;
      return;
    }
    this.selectedPlayerId = typeof target === 'object' ? (target.id || target.name) : target;
    this.selectionPulseTimer = 0;
  }

  getStandingPositionNear(targetX, targetY) {
    // Offset candidates to stand at a comfortable social distance from target
    // Primary offset is down-right (dx: +50, dy: +46), matching user's requested layout:
    // nametags and sprites don't overlap, characters stand naturally side-by-side with clear distance.
    const candidates = [
      { dx: 50, dy: 46 },   // 1. Down-Right (exact user screenshot match: natural spacing & zero overlap)
      { dx: -50, dy: 46 },  // 2. Down-Left
      { dx: 50, dy: 0 },    // 3. Right
      { dx: -50, dy: 0 },   // 4. Left
      { dx: 0, dy: 56 },    // 5. Down
      { dx: 50, dy: -46 },  // 6. Up-Right
      { dx: -50, dy: -46 }, // 7. Up-Left
      { dx: 0, dy: -56 }    // 8. Up
    ];

    for (const c of candidates) {
      const candX = Math.max(80, Math.min(this.mapWidth - 80, targetX + c.dx));
      const candY = Math.max(80, Math.min(this.mapHeight - 80, targetY + c.dy));
      if (!this.checkCollision(candX, candY)) {
        return {
          x: candX,
          y: candY,
          tileX: Math.floor(candX / 32) * 32,
          tileY: Math.floor(candY / 32) * 32
        };
      }
    }

    // Fallback if tight space
    return {
      x: targetX,
      y: targetY,
      tileX: Math.floor(targetX / 32) * 32,
      tileY: Math.floor(targetY / 32) * 32
    };
  }

  isLineClear(x1, y1, x2, y2) {
    const dist = Math.hypot(x2 - x1, y2 - y1);
    if (dist === 0) return !this.checkCollision(x1, y1);
    const steps = Math.ceil(dist / 14);
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const px = x1 + (x2 - x1) * t;
      const py = y1 + (y2 - y1) * t;
      if (this.checkCollision(px, py)) return false;
    }
    return true;
  }

  buildOrthogonalPath(startX, startY, goalX, goalY) {
    const diffX = goalX - startX;
    const diffY = goalY - startY;

    if (Math.abs(diffX) <= 3 && Math.abs(diffY) <= 3) {
      return [];
    }

    if (Math.abs(diffX) <= 3) {
      return [{ x: goalX, y: goalY }];
    }

    if (Math.abs(diffY) <= 3) {
      return [{ x: goalX, y: goalY }];
    }

    // Two potential 90-degree orthogonal paths (vuông góc):
    // Path A: Horizontal first, then Vertical
    const cornerA = { x: goalX, y: startY };
    const isPathAClear = this.isLineClear(startX, startY, cornerA.x, cornerA.y) &&
                         this.isLineClear(cornerA.x, cornerA.y, goalX, goalY);

    // Path B: Vertical first, then Horizontal
    const cornerB = { x: startX, y: goalY };
    const isPathBClear = this.isLineClear(startX, startY, cornerB.x, cornerB.y) &&
                         this.isLineClear(cornerB.x, cornerB.y, goalX, goalY);

    if (isPathAClear && !isPathBClear) {
      return [cornerA, { x: goalX, y: goalY }];
    }
    if (!isPathAClear && isPathBClear) {
      return [cornerB, { x: goalX, y: goalY }];
    }
    if (isPathAClear && isPathBClear) {
      // Both clear: start with the longer axis
      if (Math.abs(diffX) >= Math.abs(diffY)) {
        return [cornerA, { x: goalX, y: goalY }];
      } else {
        return [cornerB, { x: goalX, y: goalY }];
      }
    }

    // If both direct L-paths have an obstruction, check tile-based BFS
    const tilePath = this.findTilePath(startX, startY, goalX, goalY);
    if (tilePath && tilePath.length > 0) {
      return tilePath;
    }

    // Fallback: pick the corner that aligns with dominant axis
    return Math.abs(diffX) >= Math.abs(diffY)
      ? [cornerA, { x: goalX, y: goalY }]
      : [cornerB, { x: goalX, y: goalY }];
  }

  findTilePath(startX, startY, goalX, goalY) {
    const sTileX = Math.floor(startX / 32);
    const sTileY = Math.floor(startY / 32);
    const gTileX = Math.floor(goalX / 32);
    const gTileY = Math.floor(goalY / 32);

    if (sTileX === gTileX && sTileY === gTileY) {
      return [{ x: goalX, y: goalY }];
    }

    const cols = Math.ceil(this.mapWidth / 32);
    const rows = Math.ceil(this.mapHeight / 32);
    const maxCells = cols * rows;

    const startIdx = sTileY * cols + sTileX;
    const goalIdx = gTileY * cols + gTileX;

    let head = 0;
    const queue = [startIdx];
    const visited = new Uint8Array(maxCells);
    const parent = new Int32Array(maxCells).fill(-1);
    visited[startIdx] = 1;

    // 4 orthogonal directions only (Up, Down, Left, Right)
    const dirs = [
      { dx: 0, dy: -1 },
      { dx: 0, dy: 1 },
      { dx: -1, dy: 0 },
      { dx: 1, dy: 0 }
    ];

    let found = false;
    let iterations = 0;
    const maxIter = 8000;

    while (head < queue.length && iterations < maxIter) {
      iterations++;
      const curr = queue[head++];
      if (curr === goalIdx) {
        found = true;
        break;
      }
      const cx = curr % cols;
      const cy = Math.floor(curr / cols);

      for (const d of dirs) {
        const nx = cx + d.dx;
        const ny = cy + d.dy;
        if (nx >= 2 && nx < cols - 2 && ny >= 2 && ny < rows - 2) {
          const nIdx = ny * cols + nx;
          if (!visited[nIdx]) {
            visited[nIdx] = 1;
            const toX = nx * 32 + 16;
            const toY = ny * 32 + 16;
            if (!this.checkCollision(toX, toY) && this.isLineClear(cx * 32 + 16, cy * 32 + 16, toX, toY)) {
              parent[nIdx] = curr;
              queue.push(nIdx);
            }
          }
        }
      }
    }

    if (!found) return null;

    // Reconstruct tile path
    const rawTiles = [];
    let curr = goalIdx;
    while (curr !== -1) {
      rawTiles.unshift({ x: (curr % cols) * 32 + 16, y: Math.floor(curr / cols) * 32 + 16 });
      curr = parent[curr];
    }

    if (rawTiles.length <= 1) return [{ x: goalX, y: goalY }];

    // Compress collinear points into orthogonal corners
    const waypoints = [];
    for (let i = 1; i < rawTiles.length - 1; i++) {
      const prev = rawTiles[i - 1];
      const cur = rawTiles[i];
      const next = rawTiles[i + 1];
      const dir1X = Math.sign(cur.x - prev.x);
      const dir1Y = Math.sign(cur.y - prev.y);
      const dir2X = Math.sign(next.x - cur.x);
      const dir2Y = Math.sign(next.y - cur.y);
      if (dir1X !== dir2X || dir1Y !== dir2Y) {
        waypoints.push({ x: cur.x, y: cur.y });
      }
    }
    waypoints.push({ x: goalX, y: goalY });
    return waypoints;
  }

  setTargetDestination(destX, destY, isGotoPlayer = false, isFast = false) {
    this._reroutedCurrentTarget = false;
    this.isAutoNavigatingToPlayer = !!isGotoPlayer;
    this.isFastMoving = !!(isGotoPlayer || isFast);
    if (!this.isAutoNavigatingToPlayer) {
      this.navTargetPlayer = null;
    }
    this.player.speed = this.isFastMoving ? this.player.gotoSpeed : this.player.normalSpeed;

    const clampedX = Math.max(80, Math.min(this.mapWidth - 80, destX));
    const clampedY = Math.max(80, Math.min(this.mapHeight - 80, destY));
    const tileX = Math.floor(clampedX / 32) * 32;
    const tileY = Math.floor(clampedY / 32) * 32;

    this.navWaypoints = this.buildOrthogonalPath(this.player.x, this.player.y, clampedX, clampedY);
    this.navActiveAxis = null;
    if (!this.navWaypoints || this.navWaypoints.length === 0) {
      this.targetPos = null;
      this.isAutoNavigatingToPlayer = false;
      this.isFastMoving = false;
      this.navTargetPlayer = null;
      this.player.speed = this.player.normalSpeed;
      return;
    }

    this.targetPos = {
      x: clampedX,
      y: clampedY,
      tileX: tileX,
      tileY: tileY
    };
    this.targetIndicatorTimer = 0;
  }

  navigateToPlayer(targetPlayer) {
    if (!targetPlayer) return;
    if (this.player.isSitting) this.standUp(false);
    this.pendingSeat = null;
    if (targetPlayer.isCallLocked && targetPlayer.callLockedWith && (!window.socket || targetPlayer.callLockedWith !== window.socket.id)) {
      if (typeof window.showRoomBannerToast === 'function') {
        window.showRoomBannerToast(`🔒 Cuộc trò chuyện của ${targetPlayer.name || 'người này'} đang được khóa riêng tư.`);
      }
      return;
    }
    window.dismissedProximityPeerId = null;
    if (window.dismissedProximityPeerIds && targetPlayer.id) {
      window.dismissedProximityPeerIds.delete(targetPlayer.id);
    }
    this.setSelectedPlayer(targetPlayer);
    this.navTargetPlayer = targetPlayer;
    const pos = this.getStandingPositionNear(targetPlayer.x, targetPlayer.y);
    const distToDest = Math.hypot(this.player.x - pos.x, this.player.y - pos.y);
    if (distToDest <= 4) {
      this.targetPos = null;
      this.navWaypoints = [];
      this.navActiveAxis = null;
      this.isAutoNavigatingToPlayer = false;
      this.player.speed = this.player.normalSpeed;
      if (typeof window.showProximityVideoBar === 'function') {
        window.showProximityVideoBar(targetPlayer);
      }
      return;
    }
    this.setTargetDestination(pos.x, pos.y, true);
  }

  getRoomAtPosition(worldX, worldY) {
    const tileX = Math.floor(worldX / 32);
    const tileY = Math.floor(worldY / 32);
    for (const r of ROOMS_DATA) {
      if (tileX >= r.x && tileX < r.x + r.w && tileY >= r.y && tileY < r.y + r.h) {
        return r;
      }
    }
    return null;
  }

  /**
   * Returns true only when moving to (destX, destY) or targeting targetPlayer would leave
   * the current active call context (avoids interrupting walking/sitting inside Room #2).
   */
  shouldConfirmLeaveBeforeMove(destX, destY, targetPlayer = null) {
    const hasCall = (window.activeCallPeers && window.activeCallPeers.size > 0) || !!window.activeProximityPeer;
    if (!hasCall || typeof window.showLeaveConversationModal !== 'function') return false;
    if (targetPlayer && window.activeCallPeers && window.activeCallPeers.has(targetPlayer.id)) return false;

    const myRoom = this.getRoomAtPosition(this.player.x, this.player.y);
    const destRoom = this.getRoomAtPosition(destX, destY);
    if (myRoom && myRoom.id === 'central_lounge' && destRoom && destRoom.id === 'central_lounge') {
      return false;
    }
    return true;
  }

  /**
   * Evaluates Room #2 group membership, same-group seating, and proximity auto-calls
   * across all online human players and syncs activeCallPeers immediately.
   */
  evaluateGroupCalls() {
    if (!this.remotePlayers) return;
    const SEATED_CALL_DIST = 210;
    const PROXIMITY_LEAVE_DIST = 225;
    const myId = window.socket ? window.socket.id : null;
    const myRoom = this.getRoomAtPosition(this.player.x, this.player.y);
    const localInRoom2 = !!(myRoom && myRoom.id === 'central_lounge');
    const eligiblePeers = [];

    for (const rp of this.remotePlayers.values()) {
      if (rp.isNpc) continue;
      if (rp.isCallLocked && rp.callLockedWith && rp.callLockedWith !== myId) continue;

      const dist = Math.hypot(this.player.x - rp.x, this.player.y - rp.y);
      const rpRoom = this.getRoomAtPosition(rp.x, rp.y);
      const bothInRoom2 = localInRoom2 && !!(rpRoom && rpRoom.id === 'central_lounge');
      const bothSeatedSameGroup = !!(
        this.player.isSitting && rp.isSitting
        && ((this.seatingSystem && this.seatingSystem.areSeatsInSameGroup(this.player.seatId, rp.seatId)) || dist <= SEATED_CALL_DIST)
      );
      const wasActivePeer = !!(window.activeCallPeers && window.activeCallPeers.has(rp.id));
      const stillInLeaveRange = wasActivePeer && dist <= PROXIMITY_LEAVE_DIST;

      const qualifies = bothInRoom2 || bothSeatedSameGroup || stillInLeaveRange;
      const isDismissed = (window.dismissedProximityPeerIds && window.dismissedProximityPeerIds.has(rp.id))
        || (window.remoteLeftCallPeers && window.remoteLeftCallPeers.has(rp.id))
        || window.dismissedProximityPeerId === rp.id;

      if (qualifies) {
        if (!isDismissed) {
          eligiblePeers.push(rp);
        }
      } else {
        if (window.dismissedProximityPeerId === rp.id) window.dismissedProximityPeerId = null;
        if (window.dismissedProximityPeerIds) window.dismissedProximityPeerIds.delete(rp.id);
        if (window.remoteLeftCallPeers) window.remoteLeftCallPeers.delete(rp.id);
      }
    }

    if (typeof window.syncGroupCallPeers === 'function') {
      const hadActive = !!(window.activeCallPeers && window.activeCallPeers.size > 0) || !!window.activeProximityPeer;
      if (eligiblePeers.length > 0 || hadActive) {
        window.syncGroupCallPeers(eligiblePeers);
      }
    }
  }

  sitOnSeat(seat, allowSameSeat = false) {
    if (!seat) return;
    const isSameCurrentSeat = allowSameSeat && this.player.isSitting && this.player.seatId === seat.id;
    if (!isSameCurrentSeat && this.seatingSystem && this.seatingSystem.isSeatOccupied(seat.id, null, this.remotePlayers)) {
      if (typeof window.showRoomBannerToast === 'function') {
        window.showRoomBannerToast('🪑 Ghế này vừa có người ngồi rồi!');
      }
      this.pendingSeat = null;
      return;
    }

    this.targetPos = null;
    this.navWaypoints = [];
    this.navActiveAxis = null;
    this.navTargetPlayer = null;
    this.pendingSeat = null;
    this.isAutoNavigatingToPlayer = false;
    this.isFastMoving = false;
    this.lastGroundClickTime = 0;
    this.lastGroundClickPos = { x: -9999, y: -9999 };
    this.lastGroundClickScreenPos = { x: -9999, y: -9999 };
    this.isDragging = false;
    this.hasDragged = false;
    this.isTouchDragging = false;
    this.hasTouchDragged = false;

    this.player.x = seat.x;
    this.player.y = seat.y;
    this.player.direction = seat.facing || 'down';
    this.player.isMoving = false;
    this.player.frameIndex = 0;
    this.player.isSitting = true;
    this.player.seatId = seat.id;

    // Sitting onto a shared table/sofa group or Room #2 should auto-connect immediately
    // with group peers just like "Go to" / double-click (even if previously dismissed).
    const seatRoom = this.getRoomAtPosition(seat.x, seat.y);
    const inRoom2 = !!(seatRoom && seatRoom.id === 'central_lounge');
    window.dismissedProximityPeerId = null;
    if (this.remotePlayers) {
      for (const rp of this.remotePlayers.values()) {
        if (rp.isNpc) continue;
        const rpRoom = this.getRoomAtPosition(rp.x, rp.y);
        const sameSeatedGroup = !!(rp.isSitting && this.seatingSystem && this.seatingSystem.areSeatsInSameGroup(seat.id, rp.seatId));
        const bothRoom2 = inRoom2 && !!(rpRoom && rpRoom.id === 'central_lounge');
        if (sameSeatedGroup || bothRoom2) {
          if (window.dismissedProximityPeerIds) window.dismissedProximityPeerIds.delete(rp.id);
          if (window.remoteLeftCallPeers) window.remoteLeftCallPeers.delete(rp.id);
        }
      }
    }

    if (typeof this.onMovement === 'function') {
      this.onMovement({
        x: Math.round(this.player.x),
        y: Math.round(this.player.y),
        direction: this.player.direction,
        isMoving: false,
        isSitting: true,
        seatId: seat.id,
        currentRoom: seatRoom ? seatRoom.id : null
      });
    }

    this.evaluateGroupCalls();
  }

  standUp(emitImmediate = true) {
    if (!this.player.isSitting) return;
    this.player.isSitting = false;
    this.player.seatId = null;

    if (emitImmediate && typeof this.onMovement === 'function') {
      const detectedRoom = this.getRoomAtPosition(this.player.x, this.player.y);
      this.onMovement({
        x: Math.round(this.player.x),
        y: Math.round(this.player.y),
        direction: this.player.direction,
        isMoving: false,
        isSitting: false,
        seatId: null,
        currentRoom: detectedRoom ? detectedRoom.id : null
      });
    }
  }

  setZoom(val) {
    if (this.canvas) {
      const coverZoom = Math.max(this.canvas.width / this.mapWidth, this.canvas.height / this.mapHeight);
      this.camera.minZoom = coverZoom;
    }
    this.camera.zoom = Math.max(this.camera.minZoom, Math.min(this.camera.maxZoom, val));
    this.clampCamera();
  }

  /**
   * Moves the player along a single axis using safe <= 4px sub-steps so fast
   * double-click sprint speeds cannot tunnel through narrow interior walls.
   */
  moveAlongAxisStepped(axis, totalDelta) {
    let remaining = totalDelta;
    const maxSubStep = 4.0;
    let movedAny = false;
    while (Math.abs(remaining) > 0.05) {
      const sub = Math.sign(remaining) * Math.min(Math.abs(remaining), maxSubStep);
      const nextX = axis === 'x' ? this.player.x + sub : this.player.x;
      const nextY = axis === 'y' ? this.player.y + sub : this.player.y;
      if (this.checkCollision(nextX, nextY)) break;
      this.player.x = nextX;
      this.player.y = nextY;
      remaining -= sub;
      movedAny = true;
    }
    return movedAny;
  }

  /** Resets pathfinding state once the final destination waypoint is reached. */
  _finishNavigation() {
    this.targetPos = null;
    this.navActiveAxis = null;
    this.player.isMoving = false;
    this.isAutoNavigatingToPlayer = false;
    this.isFastMoving = false;
    this.player.speed = this.player.normalSpeed;
    if (this.navTargetPlayer) {
      const target = this.navTargetPlayer;
      this.navTargetPlayer = null;
      if (typeof window.showProximityVideoBar === 'function') {
        window.showProximityVideoBar(target);
      }
    } else if (this.pendingSeat) {
      this.sitOnSeat(this.pendingSeat);
    }
  }

  update(dt) {
    // Update player name from global input
    const nameInput = document.getElementById('userNameInput');
    if (nameInput && nameInput.value.trim()) {
      this.player.name = nameInput.value.trim();
    }

    let dx = 0;
    let dy = 0;

    const keyUp = !!(this.keys['KeyW'] || this.keys['ArrowUp']);
    const keyDown = !!(this.keys['KeyS'] || this.keys['ArrowDown']);
    const keyLeft = !!(this.keys['KeyA'] || this.keys['ArrowLeft']);
    const keyRight = !!(this.keys['KeyD'] || this.keys['ArrowRight']);

    const hasKeyboardInput = keyUp || keyDown || keyLeft || keyRight;

    if (hasKeyboardInput) {
      // Manual keyboard stands up from seat and cancels auto-walk destination
      if (this.player.isSitting) this.standUp(false);
      this.pendingSeat = null;
      this.targetPos = null;
      this.navWaypoints = [];
      this.navActiveAxis = null;
      this.isAutoNavigatingToPlayer = false;
      this.isFastMoving = false;
      this.navTargetPlayer = null;
      this.player.speed = this.player.normalSpeed;

      // Determine single active direction based on last input priority (Strict 4-directional, NO diagonal)
      let activeDir = null;
      if (this.lastInputDirection) {
        if (this.lastInputDirection === 'up' && keyUp) activeDir = 'up';
        else if (this.lastInputDirection === 'down' && keyDown) activeDir = 'down';
        else if (this.lastInputDirection === 'left' && keyLeft) activeDir = 'left';
        else if (this.lastInputDirection === 'right' && keyRight) activeDir = 'right';
      }

      if (!activeDir) {
        if (keyUp) activeDir = 'up';
        else if (keyDown) activeDir = 'down';
        else if (keyLeft) activeDir = 'left';
        else if (keyRight) activeDir = 'right';
      }

      if (activeDir === 'up') {
        dy = -1;
        this.player.direction = 'up';
      } else if (activeDir === 'down') {
        dy = 1;
        this.player.direction = 'down';
      } else if (activeDir === 'left') {
        dx = -1;
        this.player.direction = 'left';
      } else if (activeDir === 'right') {
        dx = 1;
        this.player.direction = 'right';
      }

      this.player.isMoving = (dx !== 0 || dy !== 0);

      if (this.player.isMoving) {
        const moveX = dx * this.player.speed;
        const moveY = dy * this.player.speed;

        // Move strictly along 1 axis with stepped collision check
        if (moveX !== 0) this.moveAlongAxisStepped('x', moveX);
        if (moveY !== 0) this.moveAlongAxisStepped('y', moveY);
      }
    } else if (this.targetPos) {
      // Orthogonal Click-to-Move / Waypoint navigation (vuông góc theo ô)
      const currentSpeed = (this.isAutoNavigatingToPlayer || this.isFastMoving) ? this.player.gotoSpeed : this.player.normalSpeed;
      this.player.speed = currentSpeed;

      if (!this.navWaypoints || this.navWaypoints.length === 0) {
        this.navWaypoints = this.buildOrthogonalPath(this.player.x, this.player.y, this.targetPos.x, this.targetPos.y);
      }

      if (!this.navWaypoints || this.navWaypoints.length === 0) {
        this.targetPos = null;
        this.navActiveAxis = null;
        this.player.isMoving = false;
        this.isAutoNavigatingToPlayer = false;
        this.isFastMoving = false;
        this.player.speed = this.player.normalSpeed;
      } else {
        const wp = this.navWaypoints[0];
        const diffX = wp.x - this.player.x;
        const diffY = wp.y - this.player.y;

        // Waypoint reached / corner turn: snap to waypoint and consume it
        if (Math.abs(diffX) <= 1.0 && Math.abs(diffY) <= 1.0) {
          this.player.x = wp.x;
          this.player.y = wp.y;
          this.navActiveAxis = null;
          this.navWaypoints.shift();
          if (this.navWaypoints.length === 0) {
            this._finishNavigation();
          }
        } else {
          // Lock onto ONE axis per leg so character never alternates or flips direction
          if (!this.navActiveAxis) {
            if (Math.abs(diffX) > 1.0 && Math.abs(diffY) <= 1.0) {
              this.navActiveAxis = 'x';
            } else if (Math.abs(diffY) > 1.0 && Math.abs(diffX) <= 1.0) {
              this.navActiveAxis = 'y';
            } else if (Math.abs(diffX) >= Math.abs(diffY)) {
              this.navActiveAxis = 'x';
            } else {
              this.navActiveAxis = 'y';
            }
          }

          let moved = false;
          if (this.navActiveAxis === 'x') {
            const curDiffX = wp.x - this.player.x;
            if (Math.abs(curDiffX) > 0.5) {
              const stepX = Math.sign(curDiffX) * Math.min(Math.abs(curDiffX), this.player.speed);
              if (this.moveAlongAxisStepped('x', stepX)) {
                this.player.direction = stepX > 0 ? 'right' : 'left';
                moved = true;
              }
            }
            // Check if X axis finished for this waypoint
            if (Math.abs(wp.x - this.player.x) <= 1.0) {
              this.player.x = wp.x;
              const curDiffY = wp.y - this.player.y;
              if (Math.abs(curDiffY) > 1.0) {
                this.navActiveAxis = 'y';
                this.player.direction = curDiffY > 0 ? 'down' : 'up';
              } else {
                this.player.y = wp.y;
                this.navActiveAxis = null;
                this.navWaypoints.shift();
                if (this.navWaypoints.length === 0) {
                  this._finishNavigation();
                }
              }
            }
          } else if (this.navActiveAxis === 'y') {
            const curDiffY = wp.y - this.player.y;
            if (Math.abs(curDiffY) > 0.5) {
              const stepY = Math.sign(curDiffY) * Math.min(Math.abs(curDiffY), this.player.speed);
              if (this.moveAlongAxisStepped('y', stepY)) {
                this.player.direction = stepY > 0 ? 'down' : 'up';
                moved = true;
              }
            }
            // Check if Y axis finished for this waypoint
            if (Math.abs(wp.y - this.player.y) <= 1.0) {
              this.player.y = wp.y;
              const curDiffX = wp.x - this.player.x;
              if (Math.abs(curDiffX) > 1.0) {
                this.navActiveAxis = 'x';
                this.player.direction = curDiffX > 0 ? 'right' : 'left';
              } else {
                this.player.x = wp.x;
                this.navActiveAxis = null;
                this.navWaypoints.shift();
                if (this.navWaypoints.length === 0) {
                  this._finishNavigation();
                }
              }
            }
          }

          if (!moved && this.player.isMoving) {
            // Collision recovery: try the alternate axis only if it actually moves closer without ping-ponging
            const altAxis = (this.navActiveAxis === 'x') ? 'y' : 'x';
            const altDiff = (altAxis === 'x') ? (wp.x - this.player.x) : (wp.y - this.player.y);
            if (Math.abs(altDiff) > 2.0) {
              const stepAlt = Math.sign(altDiff) * Math.min(Math.abs(altDiff), this.player.speed);
              if (this.moveAlongAxisStepped(altAxis, stepAlt)) {
                this.player.direction = altAxis === 'x'
                  ? (stepAlt > 0 ? 'right' : 'left')
                  : (stepAlt > 0 ? 'down' : 'up');
                this.navActiveAxis = altAxis;
                moved = true;
              }
            }
          }

          if (!moved) {
            // Blocked by obstacle - attempt BFS reroute once; if destination itself is blocked, stop cleanly
            const altPath = !this._reroutedCurrentTarget
              ? this.findTilePath(this.player.x, this.player.y, this.targetPos.x, this.targetPos.y)
              : null;
            if (altPath && altPath.length > 0 && !this.checkCollision(this.targetPos.x, this.targetPos.y)) {
              this._reroutedCurrentTarget = true;
              this.navWaypoints = altPath;
              this.navActiveAxis = null;
            } else {
              this._reroutedCurrentTarget = false;
              this.targetPos = null;
              this.navWaypoints = [];
              this.navActiveAxis = null;
              this.player.isMoving = false;
              this.isAutoNavigatingToPlayer = false;
              this.isFastMoving = false;
              this.player.speed = this.player.normalSpeed;
            }
          } else {
            this.player.isMoving = true;
          }
        }
      }
    } else {
      this.navActiveAxis = null;
      this.player.isMoving = false;
      this.isAutoNavigatingToPlayer = false;
      this.isFastMoving = false;
      this.player.speed = this.player.normalSpeed;
    }

    if (this.player.isMoving) {
      const sprinting = !!(this.isAutoNavigatingToPlayer || this.isFastMoving);
      // Cycle animation frames (0, 1, 2, 3)
      this.player.animTimer += dt;
      const animInterval = sprinting ? 105 : 175;
      if (this.player.animTimer > animInterval) {
        this.player.frameIndex = (this.player.frameIndex + 1) % 4;
        this.player.animTimer = 0;
      }

      // Footstep movement dust particles
      this.player.dustTimer = (this.player.dustTimer || 0) + dt;
      const dustInterval = sprinting ? 85 : 125;
      if (this.player.dustTimer > dustInterval) {
        this.player.dustTimer = 0;
        this.emitMovementDust(this.player.x, this.player.y, this.player.direction, sprinting);
      }

      // Footstep running sound playback
      if (this.footstepAudio) {
        if (!this.isFootstepPlaying) {
          this.isFootstepPlaying = true;
          const playPromise = this.footstepAudio.play();
          if (playPromise !== undefined) {
            playPromise.catch(() => {
              this.isFootstepPlaying = false;
            });
          }
        }
        const targetRate = sprinting ? 1.15 : 0.88;
        if (this.footstepAudio.playbackRate !== targetRate) {
          this.footstepAudio.playbackRate = targetRate;
        }
      }
    } else {
      this.player.frameIndex = 0; // idle frame
      this.player.dustTimer = 0;

      // Pause footstep sound
      if (this.footstepAudio && this.isFootstepPlaying) {
        this.isFootstepPlaying = false;
        this.footstepAudio.pause();
        this.footstepAudio.currentTime = 0;
      }
    }

    // Smooth camera follow: when zoomed in keep player centered; otherwise keep map centered
    if (!this.isDragging) {
      const lerpFactor = (this.isAutoNavigatingToPlayer || this.isFastMoving) ? 0.18 : 0.10;
      if (this.camera.zoom > this.camera.minZoom * 1.05) {
        this.camera.x += (this.player.x - this.camera.x) * lerpFactor;
        this.camera.y += (this.player.y - this.camera.y) * lerpFactor;
      } else {
        this.camera.x += (this.mapWidth / 2 - this.camera.x) * lerpFactor;
        this.camera.y += (this.mapHeight / 2 - this.camera.y) * lerpFactor;
      }
      this.clampCamera();
    }

    // Update Remote Players Animation & Movement Dust (Phase 2)
    this.remotePlayers.forEach((rp) => {
      if (rp.isMoving) {
        rp.animTimer = (rp.animTimer || 0) + dt;
        if (rp.animTimer > 175) {
          rp.frameIndex = ((rp.frameIndex || 0) + 1) % 4;
          rp.animTimer = 0;
        }

        rp.dustTimer = (rp.dustTimer || 0) + dt;
        if (rp.dustTimer > 125) {
          rp.dustTimer = 0;
          this.emitMovementDust(rp.x, rp.y, rp.direction, false);
        }
      } else {
        rp.frameIndex = 0;
        rp.dustTimer = 0;
      }
    });

    // Update Movement Dust Particles
    this.updateDustParticles(dt);

    // Update Automatic Sliding Doors (Proximity sensor & sliding animation)
    this.updateDoors(dt);

    // Check if local player arrived close enough to pending clicked seat
    if (this.pendingSeat && !this.player.isSitting) {
      const distSeat = Math.hypot(this.pendingSeat.x - this.player.x, this.pendingSeat.y - this.player.y);
      if (distSeat <= 24) {
        this.sitOnSeat(this.pendingSeat);
      }
    }

    // Group & Proximity Auto-Call Evaluation (supports 2 to 5+ members simultaneously)
    this.evaluateGroupCalls();

    // Spatial Room Detection (Phase 4)
    const detectedRoom = this.getRoomAtPosition(this.player.x, this.player.y);

    const prevRoomId = this.currentRoom ? this.currentRoom.id : null;
    const newRoomId = detectedRoom ? detectedRoom.id : null;

    if (newRoomId !== prevRoomId) {
      const oldRoom = this.currentRoom;
      this.currentRoom = detectedRoom;
      if (typeof this.onRoomChange === 'function') {
        this.onRoomChange(detectedRoom, oldRoom);
      }
    }

    // Notify movement hook for Throttled Network Broadcast
    if (typeof this.onMovement === 'function') {
      this.onMovement({
        x: Math.round(this.player.x),
        y: Math.round(this.player.y),
        direction: this.player.direction,
        isMoving: this.player.isMoving,
        isSitting: !!this.player.isSitting,
        seatId: this.player.seatId || null,
        currentRoom: newRoomId
      });
    }
  }

  playSummonAudio() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!this.audioContextInstance) {
        this.audioContextInstance = new AudioCtx();
      }
      const actx = this.audioContextInstance;
      if (actx.state === 'suspended') {
        actx.resume().catch(() => {});
      }
      const now = actx.currentTime;

      // 1. Shimmering Arpeggio Chime Chord (Ascending mystical chord: C5, E5, G5, B5, D6, G6)
      const freqs = [523.25, 659.25, 783.99, 987.77, 1174.66, 1567.98];
      freqs.forEach((freq, idx) => {
        const osc = actx.createOscillator();
        const gain = actx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.065);
        const startTime = now + idx * 0.065;
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.12, startTime + 0.025);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.85);
        osc.connect(gain);
        gain.connect(actx.destination);
        osc.start(startTime);
        osc.stop(startTime + 0.9);
      });

      // 2. Resonant Ethereal Rising Bass Tone (Energy gathering from ground)
      const bassOsc = actx.createOscillator();
      const bassGain = actx.createGain();
      bassOsc.type = 'triangle';
      bassOsc.frequency.setValueAtTime(130.81, now);
      bassOsc.frequency.exponentialRampToValueAtTime(261.63, now + 0.35);
      bassGain.gain.setValueAtTime(0.01, now);
      bassGain.gain.linearRampToValueAtTime(0.16, now + 0.2);
      bassGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.1);
      bassOsc.connect(bassGain);
      bassGain.connect(actx.destination);
      bassOsc.start(now);
      bassOsc.stop(now + 1.2);

      // 3. Shimmering High Crystal Chime Overtone
      const chimeOsc = actx.createOscillator();
      const chimeGain = actx.createGain();
      chimeOsc.type = 'sine';
      chimeOsc.frequency.setValueAtTime(2093.00, now + 0.35); // C7 crystal chime
      chimeGain.gain.setValueAtTime(0, now + 0.35);
      chimeGain.gain.linearRampToValueAtTime(0.09, now + 0.38);
      chimeGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.3);
      chimeOsc.connect(chimeGain);
      chimeGain.connect(actx.destination);
      chimeOsc.start(now + 0.35);
      chimeOsc.stop(now + 1.35);
    } catch (e) {
      console.warn('[Audio] Summon audio note:', e);
    }
  }

  playDoorAudio(isOpen, volumeMultiplier = 1.0) {
    try {
      if (volumeMultiplier <= 0.02) return;
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!this.audioContextInstance) {
        this.audioContextInstance = new AudioCtx();
      }
      const actx = this.audioContextInstance;
      if (actx.state === 'suspended') {
        actx.resume().catch(() => {});
      }
      const now = actx.currentTime;
      const vol = Math.min(0.22, 0.16 * volumeMultiplier);

      // 1. Sliding Friction Air Swoosh (Bandpass noise)
      const bufferSize = Math.floor(actx.sampleRate * 0.32);
      const buffer = actx.createBuffer(1, bufferSize, actx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = actx.createBufferSource();
      noise.buffer = buffer;

      const bpf = actx.createBiquadFilter();
      bpf.type = 'bandpass';
      bpf.Q.setValueAtTime(3.2, now);
      if (isOpen) {
        bpf.frequency.setValueAtTime(400, now);
        bpf.frequency.exponentialRampToValueAtTime(1300, now + 0.28);
      } else {
        bpf.frequency.setValueAtTime(1150, now);
        bpf.frequency.exponentialRampToValueAtTime(350, now + 0.28);
      }

      const noiseGain = actx.createGain();
      noiseGain.gain.setValueAtTime(0, now);
      noiseGain.gain.linearRampToValueAtTime(vol * 0.75, now + 0.035);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.31);

      noise.connect(bpf);
      bpf.connect(noiseGain);
      noiseGain.connect(actx.destination);
      noise.start(now);
      noise.stop(now + 0.32);

      // 2. Smooth Electric Motor Hum (Gentle sine wave)
      const humOsc = actx.createOscillator();
      const humGain = actx.createGain();
      humOsc.type = 'sine';
      humOsc.frequency.setValueAtTime(isOpen ? 175 : 155, now);
      humGain.gain.setValueAtTime(0, now);
      humGain.gain.linearRampToValueAtTime(vol * 0.35, now + 0.04);
      humGain.gain.linearRampToValueAtTime(0.001, now + 0.29);
      humOsc.connect(humGain);
      humGain.connect(actx.destination);
      humOsc.start(now);
      humOsc.stop(now + 0.32);
    } catch (e) {
      // Audio playback warning ignored
    }
  }

  triggerSpawnEffect(x, y, target = null, playAudio = true) {
    const effectId = (target && target.id) ? target.id : (target === this.player ? 'local_player' : `spawn_${Date.now()}_${Math.random()}`);
    // Replace any previous spawn effect for this target
    this.spawnEffects = this.spawnEffects.filter(e => e.id !== effectId);

    // Generate 32 magic ascending particles
    const particles = [];
    const colors = ['#ffffff', '#38bdf8', '#7dd3fc', '#fde047', '#c084fc', '#a7f3d0'];
    for (let i = 0; i < 32; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 6 + Math.random() * 26;
      particles.push({
        baseAngle: angle,
        baseRadius: radius,
        speedY: 0.8 + Math.random() * 1.5,
        size: 1.4 + Math.random() * 2.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 300,
        spinSpeed: (Math.random() - 0.5) * 0.008,
        twinkleSpeed: 8 + Math.random() * 10
      });
    }

    this.spawnEffects.push({
      id: effectId,
      target: target,
      x: typeof x === 'number' ? x : (target ? target.x : this.player.x),
      y: typeof y === 'number' ? y : (target ? target.y : this.player.y),
      startTime: performance.now(),
      duration: 1400, // 1.4s
      particles: particles
    });

    if (playAudio) {
      this.playSummonAudio();
    }
  }

  // Movement Footstep Dust Particles
  emitMovementDust(x, y, direction, isFast = false) {
    // 3-4 soft billowing dust cloudlets per footstep
    const count = isFast ? 4 : 3;
    for (let i = 0; i < count; i++) {
      let ox = (Math.random() - 0.5) * 7;
      let oy = (Math.random() - 0.5) * 3;
      let vx = (Math.random() - 0.5) * 0.4;
      let vy = -0.45 - Math.random() * 0.45; // gentle upward buoyancy

      // Kick backwards opposite to walking direction
      if (direction === 'left') {
        ox += 7 + Math.random() * 5;
        vx += 0.70 + Math.random() * 0.5;
      } else if (direction === 'right') {
        ox -= (7 + Math.random() * 5);
        vx -= (0.70 + Math.random() * 0.5);
      } else if (direction === 'up') {
        oy += 5 + Math.random() * 4;
        vy += 0.35 + Math.random() * 0.4;
      } else if (direction === 'down') {
        oy -= (5 + Math.random() * 4);
        vy -= (0.60 + Math.random() * 0.45);
      }

      this.dustParticles.push({
        x: x + ox,
        y: y + 4 + oy, // At footstep level
        vx: vx,
        vy: vy,
        baseRadius: 3.8 + Math.random() * 2.6,
        subOffsetX: (Math.random() - 0.5) * 5,
        subOffsetY: (Math.random() - 0.5) * 3,
        subRadiusScale: 0.62 + Math.random() * 0.28,
        age: 0,
        life: 380 + Math.random() * 200, // 380ms - 580ms
        colorVariant: Math.random() < 0.5 ? 0 : 1
      });
    }

    // Limit active particles to prevent memory growth
    if (this.dustParticles.length > 140) {
      this.dustParticles.splice(0, this.dustParticles.length - 140);
    }
  }

  updateDustParticles(dt) {
    if (!this.dustParticles || this.dustParticles.length === 0) return;
    const dtScale = dt / 16.67;
    for (let i = this.dustParticles.length - 1; i >= 0; i--) {
      const p = this.dustParticles[i];
      p.age += dt;
      if (p.age >= p.life) {
        this.dustParticles.splice(i, 1);
        continue;
      }
      p.x += p.vx * dtScale;
      p.y += p.vy * dtScale;
      p.vx *= 0.90;
      p.vy *= 0.90;
    }
  }

  renderDustParticles(ctx) {
    if (!this.dustParticles || this.dustParticles.length === 0) return;

    try {
      for (let i = 0; i < this.dustParticles.length; i++) {
        const p = this.dustParticles[i];
        const progress = p.age / p.life;
        if (progress >= 1.0) continue;

        // Expand puff as it lifts and dissipates
        const radius = p.baseRadius * (0.85 + progress * 1.45);
        const subRadius = radius * (p.subRadiusScale || 0.7);

        // Smooth opacity curve: rapid rise, then fade out
        let alpha = 0;
        if (progress < 0.14) {
          alpha = (progress / 0.14) * 0.85;
        } else {
          alpha = (1.0 - progress) * 0.85;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, alpha));

        // 1. Subtle soft ambient shadow underneath cloudlet to contrast on light floors
        ctx.fillStyle = 'rgba(100, 90, 78, 0.22)';
        ctx.beginPath();
        ctx.ellipse(p.x, p.y + radius * 0.35, radius * 1.05, radius * 0.48, 0, 0, Math.PI * 2);
        ctx.fill();

        // 2. Main Stylized 2.5D Soft Dust Cloudlet
        const grad = ctx.createRadialGradient(
          p.x - radius * 0.25,
          p.y - radius * 0.25,
          0.5,
          p.x,
          p.y,
          radius
        );

        if (p.colorVariant === 0) {
          grad.addColorStop(0, '#ffffff'); // bright soft crest
          grad.addColorStop(0.40, '#f2ebe0'); // creamy puff
          grad.addColorStop(0.78, '#ded4c3'); // warm soft dust
          grad.addColorStop(1, 'rgba(190, 178, 162, 0)');
        } else {
          grad.addColorStop(0, '#ffffff');
          grad.addColorStop(0.40, '#ece5d8');
          grad.addColorStop(0.78, '#d5caa0');
          grad.addColorStop(1, 'rgba(180, 168, 150, 0)');
        }

        ctx.fillStyle = grad;

        // Draw primary lobe
        ctx.beginPath();
        ctx.ellipse(p.x, p.y, radius, radius * 0.78, 0, 0, Math.PI * 2);
        ctx.fill();

        // Draw secondary connected lobe to create authentic fluffy cartoon dust puff
        const subX = p.x + p.subOffsetX * (1 + progress * 0.5);
        const subY = p.y + p.subOffsetY * (1 + progress * 0.5);
        ctx.beginPath();
        ctx.ellipse(subX, subY, subRadius, subRadius * 0.75, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }
    } catch (e) {
      console.warn('[VFX] Dust particle render error:', e);
    }
  }

  updateDoors(dt) {
    if (!this.doors || this.doors.length === 0) return;

    // Gather all character positions (Local player + Remote players)
    const characters = [];
    if (this.player) {
      characters.push({
        x: this.player.x + 16,
        y: this.player.y + 40,
        isLocal: true
      });
    }
    if (this.remotePlayers) {
      this.remotePlayers.forEach(rp => {
        characters.push({
          x: rp.x + 16,
          y: rp.y + 40,
          isLocal: false
        });
      });
    }

    const dtNorm = Math.min(100, Math.max(1, dt || 16.67));

    for (let i = 0; i < this.doors.length; i++) {
      const door = this.doors[i];
      let minDist = 99999;
      let closestIsLocal = false;

      for (let j = 0; j < characters.length; j++) {
        const c = characters[j];
        let dist = 99999;
        if (door.orientation === 'horizontal') {
          const dx = Math.max(0, Math.max(door.startX - c.x, c.x - (door.startX + door.width)));
          const dy = Math.abs(c.y - door.centerY);
          dist = Math.hypot(dx, dy);
        } else {
          const dy = Math.max(0, Math.max(door.startY - c.y, c.y - (door.startY + door.height)));
          const dx = Math.abs(c.x - door.centerX);
          dist = Math.hypot(dx, dy);
        }

        if (dist < minDist) {
          minDist = dist;
          closestIsLocal = c.isLocal;
        }
      }

      // Hysteresis proximity: Opens when approaching (< 75px), closes when walked away (> 95px)
      if (minDist < 75) {
        door.targetOpen = 1.0;
        door.sensorActive = true;
      } else if (minDist > 95) {
        door.targetOpen = 0.0;
        door.sensorActive = false;
      }

      // Sound trigger on state transition
      if (door.targetOpen !== door.prevTargetOpen) {
        const localDist = this.player ? Math.hypot(this.player.x + 16 - door.centerX, this.player.y + 40 - door.centerY) : 999;
        const vol = Math.max(0, 1.0 - localDist / 450);
        if (door.targetOpen === 1.0) {
          this.playDoorAudio(true, vol);
        } else if (door.targetOpen === 0.0) {
          this.playDoorAudio(false, vol);
        }
        door.prevTargetOpen = door.targetOpen;
      }

      // Smooth sliding pneumatic animation (~300-350ms transition)
      const lerpSpeed = Math.min(1.0, dtNorm * 0.009);
      door.openProgress += (door.targetOpen - door.openProgress) * lerpSpeed;
      if (Math.abs(door.targetOpen - door.openProgress) < 0.005) {
        door.openProgress = door.targetOpen;
      }
    }
  }

  renderDoors(ctx) {
    if (!this.doors || this.doors.length === 0) return;

    // Viewport Frustum Culling
    const halfViewW = (this.canvas.width / 2) / (this.camera.zoom || 1.0) + 120;
    const halfViewH = (this.canvas.height / 2) / (this.camera.zoom || 1.0) + 120;
    const viewLeft = this.camera.x - halfViewW;
    const viewRight = this.camera.x + halfViewW;
    const viewTop = this.camera.y - halfViewH;
    const viewBottom = this.camera.y + halfViewH;

    for (let i = 0; i < this.doors.length; i++) {
      const door = this.doors[i];
      if (door.centerX < viewLeft || door.centerX > viewRight ||
          door.centerY < viewTop || door.centerY > viewBottom) {
        continue;
      }

      ctx.save();
      try {
        if (door.orientation === 'horizontal') {
          this.renderHorizontalDoor(ctx, door);
        } else {
          this.renderVerticalDoor(ctx, door);
        }
      } catch (err) {
        // Safe fail-through
      }
      ctx.restore();
    }
  }

  renderHorizontalDoor(ctx, door) {
    const x = door.startX;
    const y = door.centerY;
    const w = door.width;
    const halfW = w / 2;
    const open = Math.max(0, Math.min(1, door.openProgress));

    // Threshold & Floor Guide Track
    ctx.fillStyle = 'rgba(15, 23, 42, 0.40)';
    ctx.fillRect(x, y - 5, w, 10);

    // Dual stainless steel guide rail in threshold
    ctx.fillStyle = 'rgba(148, 163, 184, 0.55)';
    ctx.fillRect(x + 2, y - 2, w - 4, 1.2);
    ctx.fillRect(x + 2, y + 1, w - 4, 1.2);

    // Overhead Header Track (Along wall line)
    const headerTop = y - 8;
    const headerH = 5;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fillRect(x - 2, headerTop + 1, w + 4, headerH + 2);

    const headerGrad = ctx.createLinearGradient(0, headerTop, 0, headerTop + headerH);
    headerGrad.addColorStop(0, '#334155');
    headerGrad.addColorStop(0.5, '#1e293b');
    headerGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = headerGrad;
    ctx.fillRect(x - 2, headerTop, w + 4, headerH);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.fillRect(x - 2, headerTop, w + 4, 1);

    // Overhead Motion Sensor Pod & LED Indicator
    const sensorW = 20;
    const sensorH = 4;
    const sensorX = door.centerX - sensorW / 2;
    const sensorY = headerTop - 2;

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(sensorX, sensorY, sensorW, sensorH);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 0.8;
    ctx.strokeRect(sensorX + 0.4, sensorY + 0.4, sensorW - 0.8, sensorH - 0.8);

    const ledX = door.centerX;
    const ledY = sensorY + 2;
    if (door.sensorActive || open > 0.05) {
      // Active: Bright green glow
      ctx.save();
      ctx.shadowColor = '#22c55e';
      ctx.shadowBlur = 8;
      ctx.fillStyle = '#4ade80';
      ctx.beginPath();
      ctx.arc(ledX, ledY, 1.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      ctx.fillStyle = 'rgba(34, 197, 94, 0.08)';
      ctx.beginPath();
      ctx.ellipse(door.centerX, y, 24, 10, 0, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Standby: Amber LED
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(ledX, ledY, 1.4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Sliding Glass Panels (Left & Right halves)
    const panelW = halfW - 1;
    const panelH = 10;
    const panelY = y - 5;
    const maxSlide = panelW - 4;
    const slide = maxSlide * open;

    // Left Panel (Slides leftwards)
    const leftX = x + 1 - slide;
    this.drawSlidingGlassPanel(ctx, leftX, panelY, panelW, panelH, 'left');

    // Right Panel (Slides rightwards)
    const rightX = door.centerX + slide;
    this.drawSlidingGlassPanel(ctx, rightX, panelY, panelW, panelH, 'right');

    // Left & Right Wall Jamb Casings
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x - 3, y - 7, 4, 14);
    ctx.fillRect(x + w - 1, y - 7, 4, 14);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.fillRect(x - 3, y - 7, 1, 14);
    ctx.fillRect(x + w + 2, y - 7, 1, 14);
  }

  renderVerticalDoor(ctx, door) {
    const x = door.centerX;
    const y = door.startY;
    const h = door.height;
    const halfH = h / 2;
    const open = Math.max(0, Math.min(1, door.openProgress));

    // Threshold & Floor Guide Track
    ctx.fillStyle = 'rgba(15, 23, 42, 0.40)';
    ctx.fillRect(x - 5, y, 10, h);

    // Dual stainless steel guide rail in threshold
    ctx.fillStyle = 'rgba(148, 163, 184, 0.55)';
    ctx.fillRect(x - 2, y + 2, 1.2, h - 4);
    ctx.fillRect(x + 1, y + 2, 1.2, h - 4);

    // Wall Side Track Casing
    const headerLeft = x - 8;
    const headerW = 5;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fillRect(headerLeft + 1, y - 2, headerW + 2, h + 4);

    const headerGrad = ctx.createLinearGradient(headerLeft, 0, headerLeft + headerW, 0);
    headerGrad.addColorStop(0, '#334155');
    headerGrad.addColorStop(0.5, '#1e293b');
    headerGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = headerGrad;
    ctx.fillRect(headerLeft, y - 2, headerW, h + 4);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.fillRect(headerLeft, y - 2, 1, h + 4);

    // Motion Sensor Pod & LED Indicator
    const sensorW = 4;
    const sensorH = 20;
    const sensorX = headerLeft - 2;
    const sensorY = door.centerY - sensorH / 2;

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(sensorX, sensorY, sensorW, sensorH);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 0.8;
    ctx.strokeRect(sensorX + 0.4, sensorY + 0.4, sensorW - 0.8, sensorH - 0.8);

    const ledX = sensorX + 2;
    const ledY = door.centerY;
    if (door.sensorActive || open > 0.05) {
      ctx.save();
      ctx.shadowColor = '#22c55e';
      ctx.shadowBlur = 8;
      ctx.fillStyle = '#4ade80';
      ctx.beginPath();
      ctx.arc(ledX, ledY, 1.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      ctx.fillStyle = 'rgba(34, 197, 94, 0.08)';
      ctx.beginPath();
      ctx.ellipse(x, door.centerY, 10, 24, 0, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(ledX, ledY, 1.4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Sliding Glass Panels (Top & Bottom halves)
    const panelW = 10;
    const panelH = halfH - 1;
    const panelX = x - 5;
    const maxSlide = panelH - 4;
    const slide = maxSlide * open;

    // Top Panel (Slides upwards)
    const topY = y + 1 - slide;
    this.drawSlidingGlassPanel(ctx, panelX, topY, panelW, panelH, 'top');

    // Bottom Panel (Slides downwards)
    const bottomY = door.centerY + slide;
    this.drawSlidingGlassPanel(ctx, panelX, bottomY, panelW, panelH, 'bottom');

    // Top & Bottom Wall Jamb Casings
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x - 7, y - 3, 14, 4);
    ctx.fillRect(x - 7, y + h - 1, 14, 4);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.fillRect(x - 7, y - 3, 14, 1);
    ctx.fillRect(x - 7, y + h + 2, 14, 1);
  }

  drawSlidingGlassPanel(ctx, px, py, pw, ph, side) {
    if (pw <= 1 || ph <= 1) return;

    // Glass panel shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.fillRect(px + 1, py + 1, pw, ph);

    // Frosted Glass Fill with subtle Cyan/Blue Gradient
    const glassGrad = ctx.createLinearGradient(px, py, px + pw, py + ph);
    glassGrad.addColorStop(0, 'rgba(224, 242, 254, 0.75)');
    glassGrad.addColorStop(0.45, 'rgba(186, 230, 253, 0.48)');
    glassGrad.addColorStop(1, 'rgba(125, 211, 252, 0.68)');
    ctx.fillStyle = glassGrad;
    ctx.fillRect(px, py, pw, ph);

    // Glass aluminum border
    ctx.strokeStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.lineWidth = 1;
    ctx.strokeRect(px + 0.5, py + 0.5, pw - 1, ph - 1);

    // Diagonal Glass Reflection Sheen
    ctx.save();
    ctx.beginPath();
    ctx.rect(px + 1, py + 1, pw - 2, ph - 2);
    ctx.clip();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.60)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    if (pw >= ph) {
      // Horizontal panel sheen
      const sx1 = px + pw * 0.35;
      ctx.moveTo(sx1, py);
      ctx.lineTo(sx1 - 6, py + ph);
      const sx2 = px + pw * 0.65;
      ctx.moveTo(sx2, py);
      ctx.lineTo(sx2 - 6, py + ph);
    } else {
      // Vertical panel sheen
      const sy1 = py + ph * 0.35;
      ctx.moveTo(px, sy1);
      ctx.lineTo(px + pw, sy1 - 6);
      const sy2 = py + ph * 0.65;
      ctx.moveTo(px, sy2);
      ctx.lineTo(px + pw, sy2 - 6);
    }
    ctx.stroke();
    ctx.restore();

    // Metallic Handle Bar & Rubber Gasket on Meeting Edge
    ctx.save();
    if (side === 'left') {
      // Gasket on right edge
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(px + pw - 1.5, py + 0.5, 1.5, ph - 1);
      // Modern vertical metallic handle
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(px + pw - 4, py + ph * 0.2, 1.8, ph * 0.6);
      ctx.fillStyle = '#64748b';
      ctx.fillRect(px + pw - 2.8, py + ph * 0.2, 0.6, ph * 0.6);
    } else if (side === 'right') {
      // Gasket on left edge
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(px, py + 0.5, 1.5, ph - 1);
      // Modern vertical metallic handle
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(px + 2.5, py + ph * 0.2, 1.8, ph * 0.6);
      ctx.fillStyle = '#64748b';
      ctx.fillRect(px + 3.7, py + ph * 0.2, 0.6, ph * 0.6);
    } else if (side === 'top') {
      // Gasket on bottom edge
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(px + 0.5, py + ph - 1.5, pw - 1, 1.5);
      // Modern horizontal metallic handle
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(px + pw * 0.2, py + ph - 4, pw * 0.6, 1.8);
      ctx.fillStyle = '#64748b';
      ctx.fillRect(px + pw * 0.2, py + ph - 2.8, pw * 0.6, 0.6);
    } else if (side === 'bottom') {
      // Gasket on top edge
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(px + 0.5, py, pw - 1, 1.5);
      // Modern horizontal metallic handle
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(px + pw * 0.2, py + 2.5, pw * 0.6, 1.8);
      ctx.fillStyle = '#64748b';
      ctx.fillRect(px + pw * 0.2, py + 3.7, pw * 0.6, 0.6);
    }
    ctx.restore();
  }

  renderSpawnEffectsGround(ctx) {
    if (!this.spawnEffects || this.spawnEffects.length === 0) return;
    const now = performance.now();

    for (let i = this.spawnEffects.length - 1; i >= 0; i--) {
      const effect = this.spawnEffects[i];
      const elapsed = now - effect.startTime;
      const progress = elapsed / effect.duration;

      if (progress >= 1.0) {
        this.spawnEffects.splice(i, 1);
        continue;
      }

      let cx = effect.x;
      let cy = effect.y + 4; // Center at feet
      if (effect.target) {
        cx = effect.target.x;
        cy = effect.target.y + 4;
      }

      // Scale factor s
      let s = 1.0;
      if (progress < 0.18) {
        s = Math.sin((progress / 0.18) * Math.PI / 2);
      } else if (progress > 0.8) {
        s = 1.0 + (progress - 0.8) * 0.5;
      }

      // Alpha
      let alpha = 1.0;
      if (progress < 0.12) {
        alpha = progress / 0.12;
      } else if (progress > 0.75) {
        alpha = (1.0 - progress) / 0.25;
      }

      ctx.save();

      // 1. Radial Ground Light Disc
      const discR = 36 * s;
      const discGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, discR);
      discGrad.addColorStop(0, `rgba(255, 255, 255, ${0.9 * alpha})`);
      discGrad.addColorStop(0.25, `rgba(56, 189, 248, ${0.65 * alpha})`);
      discGrad.addColorStop(0.65, `rgba(129, 140, 248, ${0.35 * alpha})`);
      discGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
      ctx.fillStyle = discGrad;
      ctx.beginPath();
      ctx.ellipse(cx, cy, discR, discR * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // 2. Outer Rotating Summoning Rune Ring
      const rotOuter = elapsed * 0.0022;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(1, 0.5); // 2.5D floor perspective
      ctx.rotate(rotOuter);

      ctx.shadowColor = 'rgba(56, 189, 248, 1.0)';
      ctx.shadowBlur = 14 * alpha;
      ctx.strokeStyle = `rgba(56, 189, 248, ${0.85 * alpha})`;
      ctx.lineWidth = 2.0;

      // Dashed outer ring
      ctx.setLineDash([10, 6, 3, 6]);
      ctx.beginPath();
      ctx.arc(0, 0, 32 * s, 0, Math.PI * 2);
      ctx.stroke();

      // Outer cardinal rune tick marks
      ctx.setLineDash([]);
      ctx.strokeStyle = `rgba(253, 224, 71, ${0.9 * alpha})`; // Golden tick marks
      ctx.lineWidth = 2.4;
      for (let a = 0; a < 4; a++) {
        const rad = (a * Math.PI) / 2;
        ctx.beginPath();
        ctx.moveTo(Math.cos(rad) * 28 * s, Math.sin(rad) * 28 * s);
        ctx.lineTo(Math.cos(rad) * 36 * s, Math.sin(rad) * 36 * s);
        ctx.stroke();
      }
      ctx.restore();

      // 3. Inner Counter-Rotating Hexagram / Star of Runes
      const rotInner = -elapsed * 0.0035;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(1, 0.5);
      ctx.rotate(rotInner);

      ctx.shadowColor = 'rgba(125, 211, 252, 1.0)';
      ctx.shadowBlur = 10 * alpha;
      ctx.strokeStyle = `rgba(224, 242, 254, ${0.85 * alpha})`;
      ctx.lineWidth = 1.4;

      // Triangle 1
      const starR = 22 * s;
      ctx.beginPath();
      for (let p = 0; p < 3; p++) {
        const ang = (p * 2 * Math.PI) / 3 - Math.PI / 2;
        const px = Math.cos(ang) * starR;
        const py = Math.sin(ang) * starR;
        if (p === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();

      // Triangle 2 (Rotated 180 deg)
      ctx.beginPath();
      for (let p = 0; p < 3; p++) {
        const ang = (p * 2 * Math.PI) / 3 + Math.PI / 2;
        const px = Math.cos(ang) * starR;
        const py = Math.sin(ang) * starR;
        if (p === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();

      // Inner small circle
      ctx.strokeStyle = `rgba(253, 224, 71, ${0.8 * alpha})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(0, 0, 11 * s, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();

      // 4. Ascending Light Pillar (Cột sáng bốc lên)
      if (progress < 0.85) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        const beamH = 120;
        const beamW = 34 * s;
        const beamAlpha = (progress < 0.25 ? progress / 0.25 : (1.0 - (progress - 0.25) / 0.6)) * 0.65;

        const vGrad = ctx.createLinearGradient(0, cy, 0, cy - beamH);
        vGrad.addColorStop(0, `rgba(255, 255, 255, ${0.85 * beamAlpha})`);
        vGrad.addColorStop(0.2, `rgba(56, 189, 248, ${0.60 * beamAlpha})`);
        vGrad.addColorStop(0.65, `rgba(168, 85, 247, ${0.30 * beamAlpha})`);
        vGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');

        ctx.fillStyle = vGrad;
        ctx.beginPath();
        ctx.moveTo(cx - beamW / 2, cy);
        ctx.lineTo(cx - beamW * 0.35, cy - beamH);
        ctx.lineTo(cx + beamW * 0.35, cy - beamH);
        ctx.lineTo(cx + beamW / 2, cy);
        ctx.closePath();
        ctx.fill();

        // High-intensity narrow central core ray
        const coreW = 10 * s;
        const cGrad = ctx.createLinearGradient(0, cy, 0, cy - beamH * 1.15);
        cGrad.addColorStop(0, `rgba(255, 255, 255, ${0.95 * beamAlpha})`);
        cGrad.addColorStop(0.4, `rgba(165, 243, 252, ${0.70 * beamAlpha})`);
        cGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = cGrad;
        ctx.fillRect(cx - coreW / 2, cy - beamH * 1.15, coreW, beamH * 1.15);

        ctx.restore();
      }

      ctx.restore();
    }
  }

  renderSpawnEffectsForeground(ctx) {
    if (!this.spawnEffects || this.spawnEffects.length === 0) return;
    const now = performance.now();

    for (let i = 0; i < this.spawnEffects.length; i++) {
      const effect = this.spawnEffects[i];
      const elapsed = now - effect.startTime;
      const progress = elapsed / effect.duration;
      if (progress >= 1.0) continue;

      let cx = effect.x;
      let cy = effect.y + 4;
      if (effect.target) {
        cx = effect.target.x;
        cy = effect.target.y + 4;
      }

      let alpha = 1.0;
      if (progress < 0.12) {
        alpha = progress / 0.12;
      } else if (progress > 0.75) {
        alpha = (1.0 - progress) / 0.25;
      }

      ctx.save();
      ctx.globalCompositeOperation = 'lighter';

      // 1. Rising Swirling Magic Particles & Sparkles
      effect.particles.forEach((p) => {
        if (elapsed < p.delay) return;
        const pElapsed = elapsed - p.delay;
        const heightLift = (pElapsed * p.speedY) % 115;
        const pProgress = heightLift / 115;

        const currentAngle = p.baseAngle + pElapsed * p.spinSpeed;
        const px = cx + Math.cos(currentAngle) * (p.baseRadius * (1 - pProgress * 0.4));
        const py = cy - heightLift;

        const twinkle = Math.sin(pElapsed * 0.01 * p.twinkleSpeed) * 0.4 + 0.6;
        const pSize = p.size * (1 - pProgress * 0.5) * twinkle;

        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.fillStyle = p.color;

        // Draw 4-point sparkle for larger particles, circle for smaller
        if (p.size > 2.2) {
          ctx.beginPath();
          ctx.moveTo(px, py - pSize * 2);
          ctx.lineTo(px + pSize * 0.6, py);
          ctx.lineTo(px, py + pSize * 2);
          ctx.lineTo(px - pSize * 0.6, py);
          ctx.closePath();
          ctx.fill();

          ctx.beginPath();
          ctx.moveTo(px - pSize * 2, py);
          ctx.lineTo(px, py + pSize * 0.6);
          ctx.lineTo(px + pSize * 2, py);
          ctx.lineTo(px, py - pSize * 0.6);
          ctx.closePath();
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(px, py, pSize, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // 2. Expanding Ground Shockwave Ripple
      if (progress > 0.25) {
        const ripProg = (progress - 0.25) / 0.75;
        const ripR = 12 + ripProg * 48;
        const ripAlpha = Math.sin(ripProg * Math.PI) * 0.75 * alpha;

        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 10;
        ctx.strokeStyle = `rgba(56, 189, 248, ${ripAlpha})`;
        ctx.lineWidth = Math.max(0.8, 3.0 * (1 - ripProg));
        ctx.beginPath();
        ctx.ellipse(cx, cy, ripR, ripR * 0.5, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Secondary inner ripple
        if (progress > 0.45) {
          const ripProg2 = (progress - 0.45) / 0.55;
          const ripR2 = 8 + ripProg2 * 36;
          const ripAlpha2 = Math.sin(ripProg2 * Math.PI) * 0.6 * alpha;
          ctx.strokeStyle = `rgba(253, 224, 71, ${ripAlpha2})`;
          ctx.lineWidth = Math.max(0.5, 2.0 * (1 - ripProg2));
          ctx.beginPath();
          ctx.ellipse(cx, cy, ripR2, ripR2 * 0.5, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      ctx.restore();
    }
  }

  render() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    // Clear canvas with repeating grass texture - NEVER BLACK BACKGROUND!
    if (this.grassPattern) {
      ctx.fillStyle = this.grassPattern;
      ctx.fillRect(0, 0, w, h);
    } else {
      ctx.fillStyle = '#3da639';
      ctx.fillRect(0, 0, w, h);
    }

    ctx.save();

    // Apply Camera Transform
    ctx.translate(w / 2, h / 2);
    ctx.scale(this.camera.zoom, this.camera.zoom);
    ctx.translate(-this.camera.x, -this.camera.y);

    // 1. Draw Master Map Blueprint Image
    if (this.mapLoaded) {
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(this.mapImage, 0, 0, this.mapWidth, this.mapHeight);
    } else {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, this.mapWidth, this.mapHeight);
    }

    // 1.4 Draw Mouse Hover Tile (Crisp, sleek white tile outline under cursor)
    if (this.hoverTile && !this.isDragging) {
      const hx = this.hoverTile.x;
      const hy = this.hoverTile.y;
      const isTarget = this.targetPos && this.targetPos.tileX === hx && this.targetPos.tileY === hy;

      if (!isTarget) {
        ctx.save();
        // Soft translucent white tile tint
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.fillRect(hx, hy, 32, 32);

        // Thin white border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.lineWidth = 1;
        ctx.strokeRect(hx + 0.5, hy + 0.5, 31, 31);

        // 4 Corner Brackets
        const arm = 6;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        // Top-Left
        ctx.moveTo(hx, hy + arm); ctx.lineTo(hx, hy); ctx.lineTo(hx + arm, hy);
        // Top-Right
        ctx.moveTo(hx + 32 - arm, hy); ctx.lineTo(hx + 32, hy); ctx.lineTo(hx + 32, hy + arm);
        // Bottom-Right
        ctx.moveTo(hx + 32, hy + 32 - arm); ctx.lineTo(hx + 32, hy + 32); ctx.lineTo(hx + 32 - arm, hy + 32);
        // Bottom-Left
        ctx.moveTo(hx + arm, hy + 32); ctx.lineTo(hx, hy + 32); ctx.lineTo(hx, hy + 32 - arm);
        ctx.stroke();

        ctx.restore();
      }
    }

    // 1.5 Draw Click-to-Move Target Indicator (High-visibility glowing white tile & radar effects)
    this.selectionPulseTimer = (this.selectionPulseTimer || 0) + 0.08;
    if (this.targetPos) {
      this.targetIndicatorTimer = (this.targetIndicatorTimer || 0) + 0.06;
      const t = this.targetIndicatorTimer;
      const tileX = this.targetPos.tileX !== undefined ? this.targetPos.tileX : Math.floor(this.targetPos.x / 32) * 32;
      const tileY = this.targetPos.tileY !== undefined ? this.targetPos.tileY : Math.floor(this.targetPos.y / 32) * 32;
      const cx = tileX + 16;
      const cy = tileY + 16;

      ctx.save();

      // A. Full 32x32 White Glowing Tile Highlight
      const pulse = (Math.sin(t * 3.6) + 1) / 2; // 0..1
      const fillAlpha = 0.24 + pulse * 0.20; // 0.24 .. 0.44

      // Glowing backdrop shadow
      ctx.shadowColor = 'rgba(255, 255, 255, 0.95)';
      ctx.shadowBlur = 10 + pulse * 6;

      // White tile fill
      ctx.fillStyle = `rgba(255, 255, 255, ${fillAlpha})`;
      ctx.fillRect(tileX, tileY, 32, 32);

      // White tile border
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.75 + pulse * 0.25})`;
      ctx.lineWidth = 1.8;
      ctx.strokeRect(tileX + 0.9, tileY + 0.9, 30.2, 30.2);

      // B. 4 High-contrast Bold White Corner Brackets
      const arm = 8;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.8;
      ctx.beginPath();
      // Top-Left
      ctx.moveTo(tileX, tileY + arm); ctx.lineTo(tileX, tileY); ctx.lineTo(tileX + arm, tileY);
      // Top-Right
      ctx.moveTo(tileX + 32 - arm, tileY); ctx.lineTo(tileX + 32, tileY); ctx.lineTo(tileX + 32, tileY + arm);
      // Bottom-Right
      ctx.moveTo(tileX + 32, tileY + 32 - arm); ctx.lineTo(tileX + 32, tileY + 32); ctx.lineTo(tileX + 32 - arm, tileY + 32);
      // Bottom-Left
      ctx.moveTo(tileX + arm, tileY + 32); ctx.lineTo(tileX, tileY + 32); ctx.lineTo(tileX, tileY + 32 - arm);
      ctx.stroke();

      // C. Dual Expanding White Radar Ping / Ripple Waves
      ctx.shadowBlur = 0; // Clear blur for crisp rings
      for (let rIdx = 0; rIdx < 2; rIdx++) {
        const waveProgress = ((t * 0.85 + rIdx * 0.5) % 1);
        const waveRadius = 10 + waveProgress * 28; // 10px -> 38px
        const waveAlpha = (1 - waveProgress) * 0.85;
        if (waveAlpha > 0.05) {
          ctx.strokeStyle = `rgba(255, 255, 255, ${waveAlpha})`;
          ctx.lineWidth = 2.4 * (1 - waveProgress * 0.5);
          ctx.beginPath();
          ctx.arc(cx, cy, waveRadius, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      // D. Inward Directional Crosshair Ticks (N, S, E, W)
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      const tickDist = 12 - pulse * 3; // Moves inwards
      ctx.beginPath();
      // Top tick
      ctx.moveTo(cx, cy - tickDist - 5); ctx.lineTo(cx, cy - tickDist);
      // Bottom tick
      ctx.moveTo(cx, cy + tickDist + 5); ctx.lineTo(cx, cy + tickDist);
      // Left tick
      ctx.moveTo(cx - tickDist - 5, cy); ctx.lineTo(cx - tickDist, cy);
      // Right tick
      ctx.moveTo(cx + tickDist + 5, cy); ctx.lineTo(cx + tickDist, cy);
      ctx.stroke();

      // E. Center Bright White Target Core with dark outer rim for extreme contrast
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.beginPath();
      ctx.arc(cx, cy, 5.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cx, cy, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // F. Floating Bouncing White Destination Pin (Points down to the tile)
      const bounce = Math.abs(Math.sin(t * 3.6)) * 6;
      const pinTipY = cy - 10 - bounce;

      // Shadow under floating pin
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.beginPath();
      ctx.ellipse(cx, cy - 6, 4.5, 2.2, 0, 0, Math.PI * 2);
      ctx.fill();

      // Inverted Chevron / Pointer
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetY = 2;

      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cx, pinTipY); // Tip pointing down
      ctx.lineTo(cx - 7, pinTipY - 10);
      ctx.lineTo(cx - 3, pinTipY - 12);
      ctx.lineTo(cx, pinTipY - 8);
      ctx.lineTo(cx + 3, pinTipY - 12);
      ctx.lineTo(cx + 7, pinTipY - 10);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      ctx.restore();
    }

    // 1.8 Draw Automatic Sliding Doors (All Rooms & Main Entrance)
    this.renderDoors(ctx);

    // 1.9 Draw Chairs, Sofas & Outdoor Wooden Benches across all rooms & streets
    if (this.seatingSystem) {
      this.seatingSystem.renderFurniture(ctx, this.camera, this.canvas, this.player, this.remotePlayers);
    }

    // 2. Draw Spawn Effects (Ground Layer - Magic Summoning Circles, Runes, Floor Glow, Light Pillar)
    this.renderSpawnEffectsGround(ctx);

    // 2.5 Draw Movement Footstep Dust Particles (Ground Floor Layer)
    this.renderDustParticles(ctx);

    // 3 & 4. Depth-sort Companion Tables & Characters along Y-axis (2.5D top-down overlap)
    const drawEntities = [];
    if (this.seatingSystem && this.seatingSystem.tables) {
      const halfW = (this.canvas.width / 2) / (this.camera.zoom || 1) + 140;
      const halfH = (this.canvas.height / 2) / (this.camera.zoom || 1) + 140;
      const vL = this.camera.x - halfW, vR = this.camera.x + halfW;
      const vT = this.camera.y - halfH, vB = this.camera.y + halfH;
      for (const tbl of this.seatingSystem.tables) {
        if (tbl.x < vL || tbl.x > vR || tbl.y < vT || tbl.y > vB) continue;
        drawEntities.push({ sortY: tbl.y + tbl.height / 2 - 4, kind: 'table', data: tbl });
      }
    }
    this.remotePlayers.forEach((rp) => {
      drawEntities.push({ sortY: rp.y + 4, kind: 'remote', data: rp });
    });
    if (this.player) {
      drawEntities.push({ sortY: this.player.y + 4.1, kind: 'local', data: this.player });
    }
    drawEntities.sort((a, b) => a.sortY - b.sortY);

    for (const ent of drawEntities) {
      if (ent.kind === 'table') {
        const sprite = this.seatingSystem.spriteCache.get(ent.data.type);
        if (sprite) {
          ctx.save();
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(sprite, Math.round(ent.data.x - ent.data.width / 2), Math.round(ent.data.y - ent.data.height / 2));
          ctx.restore();
        }
      } else if (ent.kind === 'remote') {
        this.renderRemotePlayer(ctx, ent.data);
      } else {
        this.renderPlayer(ctx);
      }
    }

    // 5. Draw Spawn Effects (Foreground Layer - Magic Sparkles, Ascending Particles, Shockwave Ripples)
    this.renderSpawnEffectsForeground(ctx);

    // 5.5 Draw Overhead Chat Bubbles & Emoji Reactions above Characters
    this.renderOverheadOverlays(ctx);

    ctx.restore();

    // 4. Render Live Minimap
    this.renderMinimap();
  }

  renderRemotePlayer(ctx, rp) {
    const isSelected = !!(
      (this.selectedPlayerId && (this.selectedPlayerId === rp.id || this.selectedPlayerId === rp.name)) ||
      (this.navTargetPlayer && (this.navTargetPlayer.id === rp.id || this.navTargetPlayer.name === rp.name)) ||
      (window.activeProximityPeer && (window.activeProximityPeer.id === rp.id || window.activeProximityPeer.name === rp.name))
    );
    const pulse = isSelected ? (Math.sin((this.selectionPulseTimer || 0) * 3.5) + 1) / 2 : 0;

    // Check for active magical summoning spawn effect
    const spawnEffect = (this.spawnEffects || []).find(e => e.target === rp || (e.target && e.target.id === rp.id) || e.id === rp.id);
    let spawnAlpha = 1.0;
    let spawnGlow = 0;
    if (spawnEffect) {
      const elapsed = performance.now() - spawnEffect.startTime;
      const progress = Math.min(1.0, elapsed / spawnEffect.duration);
      spawnAlpha = Math.min(1.0, 0.12 + Math.pow(progress, 1.25) * 1.05);
      spawnGlow = Math.max(0, 1.0 - progress);
    }

    // Glowing aura & pulse ring under feet when selected
    if (isSelected) {
      ctx.save();
      const footX = rp.x;
      const footY = rp.y + 4;

      // 1. Radiant pulsing ground disc with neon shadow
      ctx.shadowColor = 'rgba(56, 189, 248, 1.0)';
      ctx.shadowBlur = 22 + pulse * 10;
      ctx.fillStyle = `rgba(56, 189, 248, ${0.30 + pulse * 0.25})`;
      ctx.beginPath();
      ctx.ellipse(footX, footY, 22 + pulse * 4, 11 + pulse * 2, 0, 0, Math.PI * 2);
      ctx.fill();

      // 2. High-intensity neon cyan ring
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.ellipse(footX, footY, 20 + pulse * 3, 10 + pulse * 1.5, 0, 0, Math.PI * 2);
      ctx.stroke();

      // 3. Expanding shockwave ripple ring
      const rippleR = 24 + pulse * 14;
      ctx.strokeStyle = `rgba(56, 189, 248, ${0.60 * (1 - pulse)})`;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.ellipse(footX, footY, rippleR, rippleR * 0.5, 0, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();
    }

    // Drop shadow under player feet
    ctx.save();
    if (spawnEffect) {
      ctx.globalAlpha = spawnAlpha;
    }
    ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
    ctx.beginPath();
    ctx.ellipse(rp.x, rp.y + 4, 14, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Radial glow aura behind sprite body when selected
    if (isSelected) {
      ctx.save();
      const bodyCenterY = rp.y - (rp.height || 52) / 2;
      const auraGrad = ctx.createRadialGradient(rp.x, bodyCenterY, 4, rp.x, bodyCenterY, 32 + pulse * 8);
      auraGrad.addColorStop(0, `rgba(56, 189, 248, ${0.45 + pulse * 0.25})`);
      auraGrad.addColorStop(0.5, `rgba(56, 189, 248, ${0.20 + pulse * 0.15})`);
      auraGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.ellipse(rp.x, bodyCenterY, 28 + pulse * 6, 34 + pulse * 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    const spriteImg = this.getRemoteSprite(rp.sprite);
    const spriteReady = spriteImg && spriteImg.complete && spriteImg.naturalWidth > 0;

    ctx.save();
    if (spawnEffect && spawnGlow > 0) {
      ctx.globalAlpha = spawnAlpha;
      ctx.shadowColor = 'rgba(56, 189, 248, 1.0)';
      ctx.shadowBlur = 26 * spawnGlow;
    } else if (isSelected) {
      // Glow directly around the character sprite!
      ctx.shadowColor = 'rgba(56, 189, 248, 1.0)';
      ctx.shadowBlur = 20 + pulse * 10;
    }

    if (spriteReady) {
      let row = 0;
      if (rp.direction === 'left') row = 1;
      else if (rp.direction === 'right') row = 2;
      else if (rp.direction === 'up') row = 3;

      const col = rp.frameIndex || 0;
      const frameW = 117;
      const frameH = 210;

      ctx.imageSmoothingEnabled = false;
      const rw = rp.width || 32;
      const rh = rp.height || 52;
      if (rp.isSitting) {
        // Seated pose tucked comfortably on the chair/sofa cushion
        ctx.drawImage(
          spriteImg,
          col * frameW, row * frameH, frameW, Math.round(frameH * 0.78),
          rp.x - rw / 2, rp.y - Math.round(rh * 0.78) + 4, rw, Math.round(rh * 0.78)
        );
      } else {
        ctx.drawImage(
          spriteImg,
          col * frameW, row * frameH, frameW, frameH,
          rp.x - rw / 2, rp.y - rh + 6, rw, rh
        );
      }
    } else {
      // Fallback simple pixel avatar
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(rp.x - 10, rp.y - 32, 20, 32);
      ctx.fillStyle = '#f87171';
      ctx.fillRect(rp.x - 6, rp.y - 40, 12, 10);
    }
    ctx.restore();

    // Ethereal summoning aura directly hugging the remote character during summon
    if (spawnEffect && spawnGlow > 0.05) {
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      const bodyCenterY = rp.y - (rp.height || 52) / 2;
      const auraGrad = ctx.createRadialGradient(rp.x, bodyCenterY, 2, rp.x, bodyCenterY, 32);
      auraGrad.addColorStop(0, `rgba(255, 255, 255, ${0.75 * spawnGlow})`);
      auraGrad.addColorStop(0.35, `rgba(56, 189, 248, ${0.60 * spawnGlow})`);
      auraGrad.addColorStop(0.75, `rgba(167, 139, 250, ${0.30 * spawnGlow})`);
      auraGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.ellipse(rp.x, bodyCenterY, 26, 36, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Name badge for remote player (with selected glowing border)
    if (spawnEffect && spawnAlpha < 1.0) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, (spawnAlpha - 0.2) / 0.8);
      this.renderNameBadge(ctx, rp, true, isSelected);
      ctx.restore();
    } else {
      this.renderNameBadge(ctx, rp, true, isSelected);
    }

    // Floating indicator diamond above nametag when selected
    if (isSelected) {
      ctx.save();
      const badgeY = rp.y - (rp.height || 52) - 18;
      const diamondY = badgeY - 11 - Math.sin((this.selectionPulseTimer || 0) * 4) * 3;
      ctx.shadowColor = 'rgba(56, 189, 248, 0.95)';
      ctx.shadowBlur = 8;
      ctx.fillStyle = '#38bdf8';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(rp.x, diamondY + 5); // Pointing down towards player
      ctx.lineTo(rp.x + 5, diamondY);
      ctx.lineTo(rp.x, diamondY - 5);
      ctx.lineTo(rp.x - 5, diamondY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
  }

  renderPlayer(ctx) {
    const p = this.player;

    // Check for active magical summoning spawn effect
    const spawnEffect = (this.spawnEffects || []).find(e => e.target === p || e.id === 'local_player');
    let spawnAlpha = 1.0;
    let spawnGlow = 0;
    if (spawnEffect) {
      const elapsed = performance.now() - spawnEffect.startTime;
      const progress = Math.min(1.0, elapsed / spawnEffect.duration);
      spawnAlpha = Math.min(1.0, 0.12 + Math.pow(progress, 1.25) * 1.05);
      spawnGlow = Math.max(0, 1.0 - progress);
    }

    // Drop shadow under player feet
    ctx.save();
    if (spawnEffect) {
      ctx.globalAlpha = spawnAlpha;
    }
    ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
    ctx.beginPath();
    ctx.ellipse(p.x, p.y + 4, 14, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.save();
    if (spawnEffect && spawnGlow > 0) {
      ctx.globalAlpha = spawnAlpha;
      ctx.shadowColor = 'rgba(56, 189, 248, 1.0)';
      ctx.shadowBlur = 26 * spawnGlow;
    }

    if (this.playerSheetLoaded) {
      // Spritesheet row: 0: down, 1: left, 2: right, 3: up
      let row = 0;
      if (p.direction === 'left') row = 1;
      else if (p.direction === 'right') row = 2;
      else if (p.direction === 'up') row = 3;

      const col = p.frameIndex;
      const frameW = 117;
      const frameH = 210;

      ctx.imageSmoothingEnabled = false;
      if (p.isSitting) {
        // Seated pose tucked comfortably on the chair/sofa cushion
        ctx.drawImage(
          this.playerSheet,
          col * frameW, row * frameH, frameW, Math.round(frameH * 0.78),
          p.x - p.width / 2, p.y - Math.round(p.height * 0.78) + 4, p.width, Math.round(p.height * 0.78)
        );
      } else {
        ctx.drawImage(
          this.playerSheet,
          col * frameW, row * frameH, frameW, frameH,
          p.x - p.width / 2, p.y - p.height + 6, p.width, p.height
        );
      }
    } else {
      // Fallback simple pixel avatar
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(p.x - 10, p.y - 32, 20, 32);
      ctx.fillStyle = '#f87171';
      ctx.fillRect(p.x - 6, p.y - 40, 12, 10);
    }
    ctx.restore();

    // Ethereal glowing summoning aura directly hugging the local character during summon
    if (spawnEffect && spawnGlow > 0.05) {
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      const bodyCenterY = p.y - p.height / 2;
      const auraGrad = ctx.createRadialGradient(p.x, bodyCenterY, 2, p.x, bodyCenterY, 32);
      auraGrad.addColorStop(0, `rgba(255, 255, 255, ${0.75 * spawnGlow})`);
      auraGrad.addColorStop(0.35, `rgba(56, 189, 248, ${0.60 * spawnGlow})`);
      auraGrad.addColorStop(0.75, `rgba(167, 139, 250, ${0.30 * spawnGlow})`);
      auraGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.ellipse(p.x, bodyCenterY, 26, 36, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 3. Render Name Badge or Video Bubble
    if (spawnEffect && spawnAlpha < 1.0) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, (spawnAlpha - 0.2) / 0.8);
      if (this.isCameraActive) {
        this.renderVideoBubble(ctx, p);
      } else {
        this.renderNameBadge(ctx, p);
      }
      ctx.restore();
    } else {
      if (this.isCameraActive) {
        this.renderVideoBubble(ctx, p);
      } else {
        this.renderNameBadge(ctx, p);
      }
    }
  }

  renderNameBadge(ctx, p, isRemote = false, isSelected = false) {
    const name = p.name || 'Người dùng';
    ctx.font = 'bold 11px sans-serif';
    const textW = ctx.measureText(name).width;
    const badgeW = textW + 16;
    const badgeH = 18;
    const bx = p.x - badgeW / 2;
    const by = p.y - p.height - 18;

    // Dark pill background (distinct border for remote players)
    ctx.fillStyle = isRemote ? 'rgba(30, 41, 59, 0.90)' : 'rgba(15, 23, 42, 0.88)';
    ctx.beginPath();
    ctx.roundRect(bx, by, badgeW, badgeH, 9);
    ctx.fill();

    if (isSelected) {
      ctx.save();
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 12;
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.8;
      ctx.stroke();
      ctx.restore();
    } else if (isRemote) {
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Dot indicator (Glowing Cyan if selected, Green for local user, Cyan for remote peers)
    if (isSelected) {
      ctx.save();
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 8;
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(bx + 8, by + badgeH / 2, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else {
      ctx.fillStyle = isRemote ? '#38bdf8' : '#22c55e';
      ctx.beginPath();
      ctx.arc(bx + 8, by + badgeH / 2, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(name, bx + 16, by + badgeH / 2 + 0.5);
  }

  triggerOverheadEmoji(emoji, playerId = null) {
    if (!emoji) return;
    const target = playerId ? this.remotePlayers.get(playerId) : this.player;
    if (!target) return;
    target.overheadEmote = {
      emoji: String(emoji).trim(),
      startTime: performance.now(),
      duration: 3600
    };
  }

  triggerOverheadChat(text, playerId = null) {
    if (!text || !String(text).trim()) return;
    const target = playerId ? this.remotePlayers.get(playerId) : this.player;
    if (!target) return;
    target.overheadChat = {
      text: String(text).trim().slice(0, 120),
      startTime: performance.now(),
      duration: 7500
    };
  }

  renderOverheadOverlays(ctx) {
    const now = performance.now();

    if (this.remotePlayers) {
      this.remotePlayers.forEach((rp) => {
        const isSelected = !!(
          (this.selectedPlayerId && (this.selectedPlayerId === rp.id || this.selectedPlayerId === rp.name)) ||
          (this.navTargetPlayer && (this.navTargetPlayer.id === rp.id || this.navTargetPlayer.name === rp.name)) ||
          (window.activeProximityPeer && (window.activeProximityPeer.id === rp.id || window.activeProximityPeer.name === rp.name))
        );
        this.renderCharacterOverhead(ctx, rp, false, isSelected, now);
      });
    }

    if (this.player) {
      this.renderCharacterOverhead(ctx, this.player, true, false, now);
    }
  }

  renderCharacterOverhead(ctx, p, isLocal, isSelected, now) {
    if (!p) return;

    // Clean up expired items
    if (p.overheadChat && (now - p.overheadChat.startTime) >= p.overheadChat.duration) {
      p.overheadChat = null;
    }
    if (p.overheadEmote && (now - p.overheadEmote.startTime) >= p.overheadEmote.duration) {
      p.overheadEmote = null;
    }

    if (!p.overheadChat && !p.overheadEmote) return;

    const charHeight = p.height || 52;
    let anchorY = p.y - charHeight - 24;
    if (isLocal && this.isCameraActive) {
      anchorY = p.y - charHeight - 68;
    } else if (isSelected) {
      anchorY -= 16;
    }

    // 1. Render Overhead Speech Chat Bubble first (sits just above nameplate)
    if (p.overheadChat) {
      anchorY = this.drawOverheadChatBubble(ctx, p.x, anchorY, p.overheadChat, now) - 8;
    }

    // 2. Render Overhead Emoji Reaction cleanly above nameplate (or above chat bubble if both active)
    if (p.overheadEmote) {
      this.drawOverheadEmote(ctx, p.x, anchorY, p.overheadEmote, now);
    }
  }

  drawOverheadChatBubble(ctx, centerX, bottomY, chatObj, now) {
    const elapsed = now - chatObj.startTime;
    const remaining = chatObj.duration - elapsed;

    // Fade in / Fade out alpha
    let alpha = 1.0;
    if (elapsed < 160) alpha = elapsed / 160;
    else if (remaining < 550) alpha = Math.max(0, remaining / 550);

    // Pop-in spring scale
    let scale = 1.0;
    if (elapsed < 200) {
      const t = elapsed / 200;
      scale = 0.78 + Math.sin(t * Math.PI * 0.65) * 0.28;
    }

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = '500 12px Inter, "Segoe UI", sans-serif';

    const maxTextWidth = 164;
    const rawWords = chatObj.text.split(/\s+/);
    const lines = [];
    let currentLine = '';

    for (let i = 0; i < rawWords.length; i++) {
      const word = rawWords[i];
      // Break ultra-long single word if wider than maxTextWidth
      if (ctx.measureText(word).width > maxTextWidth) {
        if (currentLine) {
          lines.push(currentLine);
          currentLine = '';
        }
        let chunk = '';
        for (const ch of word) {
          if (ctx.measureText(chunk + ch).width > maxTextWidth) {
            lines.push(chunk);
            chunk = ch;
          } else {
            chunk += ch;
          }
        }
        currentLine = chunk;
        continue;
      }
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      if (ctx.measureText(testLine).width > maxTextWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);

    const displayLines = lines.slice(0, 4);
    let maxLineW = 0;
    displayLines.forEach(line => {
      maxLineW = Math.max(maxLineW, ctx.measureText(line).width);
    });

    const padX = 11;
    const padY = 7;
    const lineHeight = 16;
    const tailH = 6;
    const bubbleW = Math.max(38, Math.ceil(maxLineW + padX * 2));
    const bubbleH = Math.ceil(displayLines.length * lineHeight + padY * 2);

    const bx = -bubbleW / 2;
    const by = -bubbleH - tailH;
    const r = 11;

    ctx.translate(centerX, bottomY);
    ctx.scale(scale, scale);

    // Speech bubble path with bottom pointer tail
    ctx.beginPath();
    ctx.moveTo(bx + r, by);
    ctx.lineTo(bx + bubbleW - r, by);
    ctx.quadraticCurveTo(bx + bubbleW, by, bx + bubbleW, by + r);
    ctx.lineTo(bx + bubbleW, by + bubbleH - r);
    ctx.quadraticCurveTo(bx + bubbleW, by + bubbleH, bx + bubbleW - r, by + bubbleH);
    ctx.lineTo(6, by + bubbleH);
    ctx.lineTo(0, 0);
    ctx.lineTo(-6, by + bubbleH);
    ctx.lineTo(bx + r, by + bubbleH);
    ctx.quadraticCurveTo(bx, by + bubbleH, bx, by + bubbleH - r);
    ctx.lineTo(bx, by + r);
    ctx.quadraticCurveTo(bx, by, bx + r, by);
    ctx.closePath();

    ctx.shadowColor = 'rgba(15, 23, 42, 0.28)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 3;
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    ctx.strokeStyle = 'rgba(15, 23, 42, 0.16)';
    ctx.lineWidth = 1.1;
    ctx.stroke();

    // Render text lines
    ctx.fillStyle = '#0f172a';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    displayLines.forEach((line, idx) => {
      const ly = by + padY + lineHeight * (idx + 0.5);
      ctx.fillText(line, 0, ly);
    });

    ctx.restore();
    return bottomY - bubbleH - tailH;
  }

  drawOverheadEmote(ctx, centerX, bottomY, emoteObj, now) {
    const elapsed = now - emoteObj.startTime;
    const remaining = emoteObj.duration - elapsed;

    let alpha = 1.0;
    if (elapsed < 140) alpha = elapsed / 140;
    else if (remaining < 500) alpha = Math.max(0, remaining / 500);

    // Bouncy spring pop-in + gentle floating bob
    let scale = 1.0;
    if (elapsed < 260) {
      const t = elapsed / 260;
      scale = 0.35 + Math.sin(t * Math.PI * 0.68) * 0.82;
    }
    const bobY = Math.sin(elapsed * 0.006) * 3.2;

    const radius = 17;
    const cy = bottomY - radius - 2 + bobY;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(centerX, cy);
    ctx.scale(scale, scale);

    // Subtle glowing backdrop pill circle
    ctx.shadowColor = 'rgba(15, 23, 42, 0.32)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 3;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.97)';
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.38)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Crisp Emoji glyph centered
    ctx.font = '20px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(emoteObj.emoji, 0, 1.5);

    // Sparkle accents around emoji during first 1.2s
    if (elapsed < 1200) {
      const spProgress = elapsed / 1200;
      ctx.globalAlpha = alpha * (1 - spProgress) * 0.85;
      ctx.fillStyle = '#fbbf24';
      const offsets = [
        { x: -16 - spProgress * 6, y: -12 - spProgress * 10 },
        { x: 17 + spProgress * 6, y: -10 - spProgress * 12 },
        { x: 0, y: -22 - spProgress * 10 }
      ];
      offsets.forEach(o => {
        ctx.beginPath();
        ctx.arc(o.x, o.y, 2.2 * (1 - spProgress * 0.5), 0, Math.PI * 2);
        ctx.fill();
      });
    }

    ctx.restore();
  }

  renderVideoBubble(ctx, p) {
    const bw = 64;
    const bh = 58;
    const r = 8;
    const pw = 8;
    const ph = 6;
    
    // Position: pointer tip points directly at the character head
    const tipX = p.x;
    const tipY = p.y - p.height + 4;
    const bottom = tipY - ph;
    const x = Math.round(tipX - bw / 2);
    const y = Math.round(bottom - bh);
    const right = x + bw;

    ctx.save();

    // 1. Soft Drop Shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 3;

    // 2. Base rounded rectangle fill
    ctx.beginPath();
    ctx.roundRect(x, y, bw, bh, r);
    ctx.fillStyle = '#1e1b4b';
    ctx.fill();

    // Pointer fill
    ctx.beginPath();
    ctx.moveTo(tipX - pw / 2, bottom);
    ctx.lineTo(tipX, tipY);
    ctx.lineTo(tipX + pw / 2, bottom);
    ctx.closePath();
    ctx.fillStyle = '#5f4dc5';
    ctx.fill();

    ctx.shadowColor = 'transparent';

    // 3. Draw video inside rounded rectangle
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(x, y, bw, bh, r);
    ctx.clip();

    ctx.imageSmoothingEnabled = true;

    // Check real video elements
    const officeVideo = document.getElementById('officeWebcamStream');
    const prejoinVideo = document.getElementById('webcamVideo');
    const v = (officeVideo && officeVideo.videoWidth > 0 && !officeVideo.paused) ? officeVideo :
              (prejoinVideo && prejoinVideo.videoWidth > 0 && !prejoinVideo.paused) ? prejoinVideo : null;

    let videoDrawn = false;
    if (v) {
      const vw = v.videoWidth;
      const vh = v.videoHeight;
      const aspectVideo = vw / vh;
      const aspectBox = bw / bh;
      let sx, sy, sw, sh;
      if (aspectVideo > aspectBox) {
        sh = vh;
        sw = vh * aspectBox;
        sx = (vw - sw) / 2;
        sy = 0;
      } else {
        sw = vw;
        sh = vw / aspectBox;
        sx = 0;
        sy = (vh - sh) / 2;
      }
      ctx.save();
      // Mirror horizontally
      ctx.translate(x + bw, y);
      ctx.scale(-1, 1);
      ctx.drawImage(v, sx, sy, sw, sh, 0, 0, bw, bh);
      ctx.restore();
      videoDrawn = true;
    }

    // Fallback: draw authentic mock user webcam if real video not streaming
    if (!videoDrawn && this.mockWebcamLoaded && this.mockWebcamImg.complete) {
      ctx.drawImage(this.mockWebcamImg, 0, 0, this.mockWebcamImg.width, this.mockWebcamImg.height, x, y, bw, bh);
      videoDrawn = true;
    }

    // Fallback 2: simulated animated avatar pattern
    if (!videoDrawn) {
      const grad = ctx.createLinearGradient(x, y, x + bw, y + bh);
      grad.addColorStop(0, '#1e293b');
      grad.addColorStop(1, '#0f172a');
      ctx.fillStyle = grad;
      ctx.fillRect(x, y, bw, bh);

      // User initial or avatar circle
      ctx.fillStyle = '#6366f1';
      ctx.beginPath();
      ctx.arc(x + bw / 2, y + bh / 2, 16, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const initial = (p.name || 'L').charAt(0).toUpperCase();
      ctx.fillText(initial, x + bw / 2, y + bh / 2);
    }

    ctx.restore(); // restore video clip

    // 4. Stroke seamless purple border around the bubble & pointer
    ctx.strokeStyle = '#5f4dc5';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(right - r, y);
    ctx.arcTo(right, y, right, y + r, r);
    ctx.lineTo(right, bottom - r);
    ctx.arcTo(right, bottom, right - r, bottom, r);
    ctx.lineTo(tipX + pw / 2, bottom);
    ctx.lineTo(tipX, tipY);
    ctx.lineTo(tipX - pw / 2, bottom);
    ctx.lineTo(x + r, bottom);
    ctx.arcTo(x, bottom, x, bottom - r, r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
    ctx.stroke();

    ctx.restore();
  }

  renderMinimap() {
    if (!this.minimapCtx) return;
    const mctx = this.minimapCtx;
    const mw = this.minimapCanvas.width;
    const mh = this.minimapCanvas.height;

    mctx.clearRect(0, 0, mw, mh);

    // Draw blueprint thumbnail
    if (this.mapLoaded) {
      mctx.drawImage(this.mapImage, 0, 0, mw, mh);
    } else {
      mctx.fillStyle = '#1e293b';
      mctx.fillRect(0, 0, mw, mh);
    }

    // Overlay dark tint
    mctx.fillStyle = 'rgba(15, 23, 42, 0.35)';
    mctx.fillRect(0, 0, mw, mh);

    // Camera Viewport bounds box
    const camLeft = (this.camera.x - (this.canvas.width / 2) / this.camera.zoom) / this.mapWidth * mw;
    const camTop = (this.camera.y - (this.canvas.height / 2) / this.camera.zoom) / this.mapHeight * mh;
    const camW = (this.canvas.width / this.camera.zoom) / this.mapWidth * mw;
    const camH = (this.canvas.height / this.camera.zoom) / this.mapHeight * mh;

    mctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    mctx.lineWidth = 1;
    mctx.strokeRect(camLeft, camTop, camW, camH);

    // Live Player Glowing Green Dot
    const px = (this.player.x / this.mapWidth) * mw;
    const py = (this.player.y / this.mapHeight) * mh;

    mctx.fillStyle = 'rgba(34, 197, 94, 0.4)';
    mctx.beginPath();
    mctx.arc(px, py, 6, 0, Math.PI * 2);
    mctx.fill();

    mctx.fillStyle = '#22c55e';
    mctx.beginPath();
    mctx.arc(px, py, 3, 0, Math.PI * 2);
    mctx.fill();

    // Remote Players Cyan Dots on Minimap (Phase 2)
    this.remotePlayers.forEach((rp) => {
      const rx = (rp.x / this.mapWidth) * mw;
      const ry = (rp.y / this.mapHeight) * mh;

      mctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
      mctx.beginPath();
      mctx.arc(rx, ry, 5, 0, Math.PI * 2);
      mctx.fill();

      mctx.fillStyle = '#38bdf8';
      mctx.beginPath();
      mctx.arc(rx, ry, 2.5, 0, Math.PI * 2);
      mctx.fill();
    });

    // Target waypoint marker on minimap (Glowing white indicator)
    if (this.targetPos) {
      const tx = (this.targetPos.x / this.mapWidth) * mw;
      const ty = (this.targetPos.y / this.mapHeight) * mh;
      const mPulse = (Math.sin((this.targetIndicatorTimer || 0) * 4) + 1) / 2;

      mctx.save();
      mctx.shadowColor = 'rgba(255, 255, 255, 0.9)';
      mctx.shadowBlur = 4;
      mctx.strokeStyle = `rgba(255, 255, 255, ${0.7 + mPulse * 0.3})`;
      mctx.lineWidth = 1.8;
      mctx.beginPath();
      mctx.arc(tx, ty, 4 + mPulse * 2.5, 0, Math.PI * 2);
      mctx.stroke();

      mctx.fillStyle = '#ffffff';
      mctx.beginPath();
      mctx.arc(tx, ty, 2.5, 0, Math.PI * 2);
      mctx.fill();
      mctx.restore();
    }
  }

  loop(currentTime) {
    const dt = currentTime - this.lastTime;
    this.lastTime = currentTime;

    this.update(dt);
    this.render();

    requestAnimationFrame((t) => this.loop(t));
  }
}

// Instantiate on load
window.mapEngineInstance = null;
document.addEventListener('DOMContentLoaded', () => {
  window.mapEngineInstance = new MapEngine();
});
