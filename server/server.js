const express = require('express');
const http = require('http');
const path = require('path');
const os = require('os');
const cors = require('cors');
const { Server } = require('socket.io');
require('dotenv').config();

const worldState = require('./core/worldState');
const db = require('./database/db');
const registerMovementHandlers = require('./handlers/movementHandler');
const registerChatHandlers = require('./handlers/chatHandler');
const registerRoomHandlers = require('./handlers/roomHandler');
const registerSignalHandlers = require('./handlers/signalHandler');
const registerWhiteboardHandlers = require('./handlers/whiteboardHandler');
const npcManager = require('./npcManager');

const app = express();
const server = http.createServer(app);

// Configure Socket.io with CORS & Heartbeat Ping/Pong 5s
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  },
  pingInterval: 5000, // 5s Heartbeat Ping
  pingTimeout: 5000    // 5s Heartbeat Timeout (Silent Disconnect Detection)
});

// Middleware
app.use(cors());
app.use(express.json());

// Serve static frontend files from client directory
const CLIENT_DIR = path.join(__dirname, '../client');
app.use(express.static(CLIENT_DIR));

// Basic API route for health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    project: 'Gather Space',
    onlineCount: worldState.getOnlineCount(),
    players: worldState.getAllPlayers(),
    timestamp: new Date().toISOString()
  });
});

// REST API routes for persistent data (Phase 5)
app.get('/api/chat-history', (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  res.json({
    status: 'ok',
    messages: db.getRecentChatMessages(limit)
  });
});

app.get('/api/rooms', (req, res) => {
  res.json({
    status: 'ok',
    rooms: db.getRooms()
  });
});

// Fallback to index.html for SPA-like navigation
app.get('*', (req, res) => {
  res.sendFile(path.join(CLIENT_DIR, 'index.html'));
});

// WebSocket Connection Lifecycle
io.on('connection', (socket) => {
  const transportName = socket.conn.transport.name;
  console.log(`[Network] Client connected: ${socket.id} (Initial transport: ${transportName})`);

  socket.conn.on('upgrade', (transport) => {
    console.log(`[Network] Connection upgraded to: ${transport.name} for ${socket.id}`);
  });

  // 1. Quản lý sự kiện PLAYER_JOIN
  socket.on('PLAYER_JOIN', (userData) => {
    const player = worldState.addPlayer(socket.id, userData);
    db.saveUser(userData); // Lưu thông tin người dùng vào Database
    console.log(`[Network] Player joined: "${player.name}" (${socket.id}) at (${player.x}, ${player.y})`);

    // Gửi vị trí spawn riêng biệt (không đè lên người khác) về cho chính Client này
    socket.emit('SPAWN_POSITION', {
      x: player.x,
      y: player.y,
      direction: player.direction
    });

    // Gửi danh sách tất cả những người chơi hiện tại cho chính Client mới này
    const otherPlayers = worldState.getOtherPlayers(socket.id);
    socket.emit('CURRENT_PLAYERS', otherPlayers);

    // Phát tán thông báo người chơi mới cho toàn bộ các Client khác
    socket.broadcast.emit('PLAYER_JOINED', player);
  });

  // 2. Đăng ký xử lý di chuyển và Throttling
  registerMovementHandlers(io, socket, worldState);

  // 3. Đăng ký xử lý Chat (Broadcast & Geocasting)
  registerChatHandlers(io, socket, worldState);

  // 4. Đăng ký xử lý Phân nhóm Room (Application Multicast) & WebRTC Signaling
  registerRoomHandlers(io, socket, worldState);
  registerSignalHandlers(io, socket, worldState);

  // 5. Đăng ký xử lý Bảng vẽ Whiteboard cộng tác qua TCP
  registerWhiteboardHandlers(io, socket, worldState);

  // 5. Quản lý sự kiện chủ động rời phòng (PLAYER_LEAVE)
  socket.on('PLAYER_LEAVE', () => {
    const removed = worldState.removePlayer(socket.id);
    if (removed) {
      console.log(`[Network] Player explicitly left: "${removed.name}" (${socket.id})`);
      if (removed.callLockedWith) {
        const partner = worldState.getPlayer(removed.callLockedWith);
        if (partner) {
          partner.isCallLocked = false;
          partner.callLockedWith = null;
        }
        io.emit('PLAYER_LOCK_STATE_CHANGED', {
          userId1: socket.id,
          userId2: removed.callLockedWith,
          isLocked: false
        });
      }
      if (removed.currentRoom) {
        socket.to(`room_${removed.currentRoom}`).emit('ROOM_PEER_LEFT', {
          peerId: socket.id,
          roomId: removed.currentRoom
        });
      }
      socket.broadcast.emit('PLAYER_LEFT', { playerId: socket.id });
    }
  });

  // 6. Quản lý sự kiện ngắt kết nối đột ngột / Heartbeat Timeout
  socket.on('disconnect', (reason) => {
    console.log(`[Network] Client disconnected: ${socket.id} (Reason: ${reason})`);
    const removed = worldState.removePlayer(socket.id);
    if (removed) {
      console.log(`[Network] Cleaned up player "${removed.name}" from World State on disconnect`);
      if (removed.callLockedWith) {
        const partner = worldState.getPlayer(removed.callLockedWith);
        if (partner) {
          partner.isCallLocked = false;
          partner.callLockedWith = null;
        }
        io.emit('PLAYER_LOCK_STATE_CHANGED', {
          userId1: socket.id,
          userId2: removed.callLockedWith,
          isLocked: false
        });
      }
      if (removed.currentRoom) {
        socket.to(`room_${removed.currentRoom}`).emit('ROOM_PEER_LEFT', {
          peerId: socket.id,
          roomId: removed.currentRoom
        });
      }
      socket.broadcast.emit('PLAYER_LEFT', { playerId: socket.id });
    }
  });
});

// Initialize 30 ambient synchronized NPCs across campus (excluding Room #2)
npcManager.init(io, worldState);

// Start Server on 0.0.0.0 (All Network Interfaces for LAN Demo)
const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  const interfaces = os.networkInterfaces();
  const lanIps = [];
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        lanIps.push(iface.address);
      }
    }
  }

  console.log('================================================================');
  console.log(`🚀 QV Virtual Office Server is running:`);
  console.log(`   - Localhost:    http://localhost:${PORT}`);
  lanIps.forEach(ip => {
    console.log(`   - Mạng LAN/Wi-Fi: http://${ip}:${PORT}`);
  });
  console.log(`🌐 Architecture: Hybrid (Client-Server Signaling & P2P WebRTC)`);
  console.log(`⚡ Protocols: TCP (Socket.io) & UDP (WebRTC)`);
  console.log('================================================================');
});
