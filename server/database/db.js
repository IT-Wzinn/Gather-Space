// server/database/db.js
// Tầng Lưu trữ Dữ liệu Bền vững (Persistence Layer) sử dụng File-based JSON Database

const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'data.json');

// Cấu trúc dữ liệu khởi tạo
const DEFAULT_SCHEMA = {
  users: {},
  rooms: {
    reception: { id: 'reception', name: 'Sảnh Lễ Tân', topic: 'Chào đón thành viên mới' },
    central_lounge: { id: 'central_lounge', name: 'Sảnh Nghỉ Ngơi', topic: 'Khu vực giao lưu & trò chuyện' },
    open_workspace: { id: 'open_workspace', name: 'Khu Làm Việc Chung', topic: 'Không gian làm việc nhóm Agile' },
    large_boardroom: { id: 'large_boardroom', name: 'Phòng Họp Lớn', topic: 'Họp chiến lược & Trình bày đồ án' },
    small_meeting: { id: 'small_meeting', name: 'Phòng Họp Nhỏ', topic: 'Thảo luận kỹ thuật 1:1' },
    library_room: { id: 'library_room', name: 'Phòng Thư Viện', topic: 'Nghiên cứu tài liệu mạng' }
  },
  chat_history: []
};

class Database {
  constructor() {
    this.data = this.loadData();
  }

  loadData() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.warn('[Database] Could not read database file, initializing default:', err.message);
    }

    // Ghi khởi tạo nếu chưa có file
    this.saveData(DEFAULT_SCHEMA);
    return JSON.parse(JSON.stringify(DEFAULT_SCHEMA));
  }

  saveData(data = this.data) {
    try {
      const dir = path.dirname(DB_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
    } catch (err) {
      console.error('[Database] Failed to write database file:', err);
    }
  }

  // --- Users Collection ---
  saveUser(userData) {
    if (!userData || !userData.name) return null;
    const key = userData.name.trim().toLowerCase();
    this.data.users[key] = {
      name: userData.name.trim(),
      characterId: userData.characterId || 'char_1',
      lastSeen: Date.now()
    };
    this.saveData();
    return this.data.users[key];
  }

  getUser(name) {
    if (!name) return null;
    return this.data.users[name.trim().toLowerCase()] || null;
  }

  // --- Chat History Collection ---
  saveChatMessage(message) {
    if (!message || !message.text) return null;
    const msgRecord = {
      id: message.id || `msg_${Date.now()}`,
      senderName: message.senderName || 'Anonymous',
      text: message.text,
      scope: message.scope || 'everyone',
      timestamp: message.timestamp || Date.now()
    };
    this.data.chat_history.push(msgRecord);

    // Giữ tối đa 500 tin nhắn gần nhất để tối ưu dung lượng
    if (this.data.chat_history.length > 500) {
      this.data.chat_history.shift();
    }

    this.saveData();
    return msgRecord;
  }

  getRecentChatMessages(limit = 50) {
    return this.data.chat_history.slice(-limit);
  }

  // --- Rooms Collection ---
  getRooms() {
    return Object.values(this.data.rooms);
  }

  updateRoomTopic(roomId, topic) {
    if (this.data.rooms[roomId]) {
      this.data.rooms[roomId].topic = topic;
      this.saveData();
      return this.data.rooms[roomId];
    }
    return null;
  }
}

const db = new Database();
module.exports = db;
