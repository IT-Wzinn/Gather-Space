// server/core/geocastRouter.js
// Định tuyến gói tin theo vị trí địa lý (Spatial Geocasting / Nearby Routing)

/**
 * Tính khoảng cách Euclid giữa 2 điểm (x1, y1) và (x2, y2)
 */
function calculateDistance(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Lấy danh sách các socket ID lân cận người gửi trong bán kính quy định (mặc định 250px)
 * @param {string} senderSocketId 
 * @param {number} radius Bán kính tính bằng pixel (mặc định 250px)
 * @param {object} worldState Thể hiện của WorldState
 * @returns {Array<{ socketId: string, distance: number }>}
 */
function getNearbySockets(senderSocketId, radius = 250, worldState) {
  const sender = worldState.getPlayer(senderSocketId);
  if (!sender) {
    // Nếu người gửi chưa gia nhập bản đồ, chỉ trả về chính socket đó
    return [{ socketId: senderSocketId, distance: 0 }];
  }

  const nearbyRecipients = [];
  const allPlayers = worldState.getAllPlayers();

  for (const player of allPlayers) {
    if (player.id === senderSocketId) {
      // Luôn gửi lại cho chính người gửi
      nearbyRecipients.push({ socketId: player.id, distance: 0 });
      continue;
    }

    const dist = calculateDistance(sender.x, sender.y, player.x, player.y);
    if (dist <= radius) {
      nearbyRecipients.push({ socketId: player.id, distance: dist });
    }
  }

  return nearbyRecipients;
}

module.exports = {
  calculateDistance,
  getNearbySockets
};
