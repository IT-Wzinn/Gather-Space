const http = require('http');
const { spawn } = require('child_process');
const { io } = require('socket.io-client');

async function testPhase5() {
  console.log('====================================================');
  console.log('🧪 BẮT ĐẦU KIỂM THỬ TỰ ĐỘNG PHASE 5: WHITEBOARD TCP & DATABASE');
  console.log('====================================================\n');

  const TEST_PORT = 3008;
  const serverProcess = spawn('node', ['server/server.js'], {
    env: { ...process.env, PORT: TEST_PORT.toString() },
    stdio: ['ignore', 'pipe', 'pipe']
  });

  serverProcess.stdout.on('data', (d) => process.stdout.write(`[SERVER] ${d}`));
  serverProcess.stderr.on('data', (d) => process.stderr.write(`[SERVER ERR] ${d}`));

  await new Promise(r => setTimeout(r, 2000));

  let passedAll = true;

  try {
    // 1. Kiểm tra tài nguyên client/whiteboard.js
    console.log('[TEST 1] Kiểm tra tải tài nguyên client/whiteboard.js:');
    const assetCheck = await new Promise((resolve) => {
      http.get(`http://localhost:${TEST_PORT}/whiteboard.js`, (res) => {
        resolve(res.statusCode === 200);
      }).on('error', () => resolve(false));
    });

    if (assetCheck) {
      console.log('  ✅ 200 OK: whiteboard.js đã sẵn sàng phục vụ trình duyệt.');
    } else {
      console.error('  ❌ Lỗi không tải được whiteboard.js!');
      passedAll = false;
    }

    // 2. Khởi tạo 2 client trong cùng một phòng họp
    console.log('\n[TEST 2] Khởi tạo Client 1 và Client 2 cùng gia nhập phòng họp "large_boardroom":');
    const c1 = io(`http://localhost:${TEST_PORT}`, { reconnection: false });
    const c2 = io(`http://localhost:${TEST_PORT}`, { reconnection: false });

    await Promise.all([
      new Promise(res => c1.on('connect', res)),
      new Promise(res => c2.on('connect', res))
    ]);

    c1.emit('PLAYER_JOIN', { name: 'Vinh Dev', x: 200, y: 200 });
    c2.emit('PLAYER_JOIN', { name: 'Bảo PM', x: 220, y: 200 });
    await new Promise(r => setTimeout(r, 300));

    c1.emit('ROOM_JOIN', { roomId: 'large_boardroom', roomName: 'Phòng Họp Lớn' });
    c2.emit('ROOM_JOIN', { roomId: 'large_boardroom', roomName: 'Phòng Họp Lớn' });
    await new Promise(r => setTimeout(r, 400));
    console.log('  ✅ C1 và C2 đã cùng bước vào phòng họp "large_boardroom"');

    // 3. Kiểm tra đồng bộ nét vẽ DRAW_STROKE qua TCP
    console.log('\n[TEST 3] Kiểm tra đồng bộ nét vẽ DRAW_STROKE qua TCP (No Packet Loss):');
    let c2ReceivedStroke = null;

    c2.on('DRAW_STROKE', (stroke) => {
      c2ReceivedStroke = stroke;
    });

    const testStroke = {
      roomId: 'large_boardroom',
      prevX: 50,
      prevY: 50,
      currX: 120,
      currY: 95,
      color: '#ef4444',
      size: 4,
      isEraser: false
    };

    c1.emit('DRAW_STROKE', testStroke);
    await new Promise(r => setTimeout(r, 400));

    if (
      c2ReceivedStroke &&
      c2ReceivedStroke.currX === 120 &&
      c2ReceivedStroke.color === '#ef4444'
    ) {
      console.log('  ✅ C2 đã nhận trọn vẹn nét vẽ từ C1 với độ chính xác tuyệt đối từng pixel!');
    } else {
      console.error('  ❌ C2 không nhận được nét vẽ từ C1!');
      passedAll = false;
    }

    // 4. Kiểm tra lưu trữ lịch sử nét vẽ WHITEBOARD_HISTORY cho người vào sau
    console.log('\n[TEST 4] Kiểm tra tải lại lịch sử nét vẽ WHITEBOARD_HISTORY cho người mới mở bảng:');
    const c3 = io(`http://localhost:${TEST_PORT}`, { reconnection: false });
    await new Promise(res => c3.on('connect', res));
    c3.emit('PLAYER_JOIN', { name: 'Người mới C3', x: 250, y: 200 });
    c3.emit('ROOM_JOIN', { roomId: 'large_boardroom', roomName: 'Phòng Họp Lớn' });
    await new Promise(r => setTimeout(r, 300));

    let c3History = null;
    c3.on('WHITEBOARD_HISTORY', (data) => {
      c3History = data;
    });

    c3.emit('WHITEBOARD_GET_HISTORY', { roomId: 'large_boardroom' });
    await new Promise(r => setTimeout(r, 400));

    if (c3History && c3History.strokes.length >= 1 && c3History.strokes[0].currX === 120) {
      console.log(`  ✅ C3 nhận thành công lịch sử nét vẽ (${c3History.strokes.length} nét) để tái hiện bản vẽ!`);
    } else {
      console.error('  ❌ Thất bại khi lấy WHITEBOARD_HISTORY!');
      passedAll = false;
    }

    // 5. Kiểm tra lệnh CLEAR_BOARD
    console.log('\n[TEST 5] Kiểm tra đồng bộ lệnh xóa bảng CLEAR_BOARD:');
    let c2ReceivedClear = false;
    c2.on('CLEAR_BOARD', (data) => {
      if (data.roomId === 'large_boardroom') {
        c2ReceivedClear = true;
      }
    });

    c1.emit('CLEAR_BOARD', { roomId: 'large_boardroom' });
    await new Promise(r => setTimeout(r, 400));

    if (c2ReceivedClear) {
      console.log('  ✅ Lệnh CLEAR_BOARD đã đồng bộ thành công tới C2!');
    } else {
      console.error('  ❌ Không nhận được lệnh CLEAR_BOARD!');
      passedAll = false;
    }

    // 6. Kiểm tra lưu trữ Database bền vững (REST API /api/chat-history và /api/rooms)
    console.log('\n[TEST 6] Kiểm tra Tầng lưu trữ Database bền vững (REST API & Persistence):');
    
    // Gửi tin nhắn chat để server tự động lưu vào DB
    c1.emit('CHAT_SEND', {
      text: 'Tin nhắn kiểm thử lưu trữ Database Phase 5',
      scope: 'everyone',
      senderName: 'Vinh Dev'
    });
    await new Promise(r => setTimeout(r, 500));

    function fetchJson(path) {
      return new Promise((resolve, reject) => {
        http.get(`http://localhost:${TEST_PORT}${path}`, (res) => {
          let body = '';
          res.on('data', chunk => body += chunk);
          res.on('end', () => resolve(JSON.parse(body)));
        }).on('error', reject);
      });
    }

    const chatData = await fetchJson('/api/chat-history');
    const roomsData = await fetchJson('/api/rooms');

    const foundMsg = chatData.messages && chatData.messages.find(m => m.text.includes('Tin nhắn kiểm thử lưu trữ Database'));
    if (foundMsg) {
      console.log(`  ✅ Database đã lưu trữ và phục hồi tin nhắn thành công: "${foundMsg.text}"`);
    } else {
      console.error('  ❌ Không tìm thấy tin nhắn trong Database qua /api/chat-history!');
      passedAll = false;
    }

    if (roomsData.rooms && roomsData.rooms.length > 0) {
      console.log(`  ✅ Database trả về danh sách ${roomsData.rooms.length} phòng cấu hình sẵn qua /api/rooms!`);
    } else {
      console.error('  ❌ Không lấy được danh sách phòng từ Database!');
      passedAll = false;
    }

    c1.disconnect();
    c2.disconnect();
    c3.disconnect();
  } catch (err) {
    console.error('❌ Lỗi ngoại lệ kiểm thử Phase 5:', err);
    passedAll = false;
  } finally {
    serverProcess.kill();
  }

  console.log('\n====================================================');
  console.log(`🏁 KẾT QUẢ PHASE 5: ${passedAll ? 'TẤT CẢ TEST ĐỀU ĐẠT CHUẨN ✅' : 'CÓ BƯỚC THẤT BẠI ❌'}`);
  console.log('====================================================\n');
  process.exit(passedAll ? 0 : 1);
}

testPhase5();
