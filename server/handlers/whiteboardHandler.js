// server/handlers/whiteboardHandler.js
// Quản lý Bảng vẽ cộng tác thời gian thực (Collaborative Whiteboard qua TCP/WebSocket)
// Hỗ trợ đa trang, vẽ nét, hình khối, văn bản, hoàn tác và đồng bộ trực tiếp giữa các thành viên cuộc gọi.

const roomBoards = new Map(); // key: boardId -> { pages: [{ id, bgStyle, items }] }
const CURSOR_COLORS = [
  '#ef4444', // Red
  '#2563eb', // Blue
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#f97316', // Orange
  '#6366f1', // Indigo
  '#059669'  // Teal
];
const socketCursorColors = new Map();
let nextColorIdx = 0;

function getSocketCursorColor(socketId) {
  if (!socketCursorColors.has(socketId)) {
    const color = CURSOR_COLORS[nextColorIdx % CURSOR_COLORS.length];
    nextColorIdx += 1;
    socketCursorColors.set(socketId, color);
  }
  return socketCursorColors.get(socketId);
}

function ensureBoard(boardId) {
  if (!roomBoards.has(boardId)) {
    roomBoards.set(boardId, {
      pages: [
        { id: 'page_1', bgStyle: 'grid', items: [] },
        { id: 'page_2', bgStyle: 'grid', items: [] }
      ]
    });
  }
  return roomBoards.get(boardId);
}

function registerWhiteboardHandlers(io, socket, worldState) {
  /**
   * Tham gia kênh bảng vẽ và nhận toàn bộ dữ liệu các trang hiện tại
   */
  socket.on('WHITEBOARD_GET_HISTORY', ({ roomId }) => {
    if (!roomId) return;
    socket.join(`wb_${roomId}`);
    const board = ensureBoard(roomId);
    socket.emit('WHITEBOARD_STATE', {
      roomId,
      pages: board.pages
    });
  });

  /**
   * Thêm 1 đối tượng (nét vẽ, hình khối, text) vào trang hiện tại và broadcast tức thì
   */
  socket.on('WHITEBOARD_ADD_ITEM', ({ roomId, pageIndex, item }) => {
    if (!roomId || !item || typeof pageIndex !== 'number') return;
    socket.join(`wb_${roomId}`);
    const board = ensureBoard(roomId);
    while (board.pages.length <= pageIndex) {
      board.pages.push({
        id: `page_${board.pages.length + 1}`,
        bgStyle: 'grid',
        items: []
      });
    }
    const page = board.pages[pageIndex];
    if (!page.items.some(x => x.id === item.id)) {
      page.items.push(item);
      if (page.items.length > 2000) page.items.shift();
    }
    socket.to(`wb_${roomId}`).emit('WHITEBOARD_ADD_ITEM', { roomId, pageIndex, item });
  });

  /**
   * Đồng bộ lại danh sách đối tượng / nền của 1 trang (khi xóa, undo, redo, đổi vị trí, đổi giấy)
   */
  socket.on('WHITEBOARD_SYNC_PAGE', ({ roomId, pageIndex, page }) => {
    if (!roomId || typeof pageIndex !== 'number' || !page) return;
    socket.join(`wb_${roomId}`);
    const board = ensureBoard(roomId);
    while (board.pages.length <= pageIndex) {
      board.pages.push({
        id: `page_${board.pages.length + 1}`,
        bgStyle: 'grid',
        items: []
      });
    }
    board.pages[pageIndex] = {
      id: page.id || `page_${pageIndex + 1}`,
      bgStyle: page.bgStyle || 'grid',
      items: Array.isArray(page.items) ? page.items.slice(0, 2000) : []
    };
    socket.to(`wb_${roomId}`).emit('WHITEBOARD_SYNC_PAGE', {
      roomId,
      pageIndex,
      page: board.pages[pageIndex]
    });
  });

  /**
   * Thêm trang mới và đồng bộ tới các thành viên
   */
  socket.on('WHITEBOARD_ADD_PAGE', ({ roomId, page }) => {
    if (!roomId) return;
    socket.join(`wb_${roomId}`);
    const board = ensureBoard(roomId);
    const newPage = {
      id: (page && page.id) || `page_${board.pages.length + 1}`,
      bgStyle: (page && page.bgStyle) || 'grid',
      items: []
    };
    board.pages.push(newPage);
    socket.to(`wb_${roomId}`).emit('WHITEBOARD_ADD_PAGE', {
      roomId,
      pageIndex: board.pages.length - 1,
      page: newPage
    });
  });

  /**
   * Xóa 1 trang khỏi bảng trắng (giữ lại ít nhất 1 trang) và đồng bộ trạng thái
   */
  socket.on('WHITEBOARD_DELETE_PAGE', ({ roomId, pageIndex }) => {
    if (!roomId || typeof pageIndex !== 'number') return;
    socket.join(`wb_${roomId}`);
    const board = ensureBoard(roomId);
    if (board.pages.length <= 1 || pageIndex < 0 || pageIndex >= board.pages.length) return;
    board.pages.splice(pageIndex, 1);
    socket.to(`wb_${roomId}`).emit('WHITEBOARD_STATE', {
      roomId,
      pages: board.pages
    });
  });

  /**
   * Xóa trang hiện tại
   */
  socket.on('CLEAR_BOARD', ({ roomId, pageIndex = 0 }) => {
    if (!roomId) return;
    socket.join(`wb_${roomId}`);
    const board = ensureBoard(roomId);
    if (board.pages[pageIndex]) {
      board.pages[pageIndex].items = [];
    }
    socket.to(`wb_${roomId}`).emit('CLEAR_BOARD', { roomId, pageIndex });
  });

  /**
   * Đồng bộ vị trí con trỏ chuột theo thời gian thực của từng thành viên trong bảng trắng
   */
  socket.on('WHITEBOARD_CURSOR', (payload) => {
    if (!payload || !payload.roomId) return;
    const roomId = payload.roomId;
    socket.join(`wb_${roomId}`);
    const player = worldState && typeof worldState.getPlayer === 'function'
      ? worldState.getPlayer(socket.id)
      : null;
    const userName = (player && player.name) || payload.userName || 'Đồng nghiệp';
    const color = getSocketCursorColor(socket.id);

    socket.to(`wb_${roomId}`).emit('WHITEBOARD_CURSOR', {
      roomId,
      senderId: socket.id,
      userName,
      color,
      pageIndex: typeof payload.pageIndex === 'number' ? payload.pageIndex : 0,
      x: typeof payload.x === 'number' ? payload.x : 0,
      y: typeof payload.y === 'number' ? payload.y : 0,
      visible: payload.visible !== false
    });
  });

  /**
   * Truyền trước nét vẽ/hình khối đang kéo theo thời gian thực tới tất cả thành viên cùng bảng trắng
   */
  socket.on('WHITEBOARD_LIVE_STROKE', (payload) => {
    if (!payload || !payload.roomId) return;
    const roomId = payload.roomId;
    socket.join(`wb_${roomId}`);
    socket.to(`wb_${roomId}`).emit('WHITEBOARD_LIVE_STROKE', {
      roomId,
      senderId: socket.id,
      pageIndex: typeof payload.pageIndex === 'number' ? payload.pageIndex : 0,
      item: payload.item || null,
      active: !!payload.active
    });
  });

  socket.on('disconnect', () => {
    socketCursorColors.delete(socket.id);
    socket.broadcast.emit('WHITEBOARD_CURSOR_REMOVE', { senderId: socket.id });
  });
}

module.exports = registerWhiteboardHandlers;
