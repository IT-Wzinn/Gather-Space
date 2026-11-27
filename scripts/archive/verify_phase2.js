const http = require('http');
const { spawn } = require('child_process');
const { io } = require('socket.io-client');

async function testPhase2() {
  console.log('====================================================');
  console.log('🧪 BẮT ĐẦU KIỂM THỬ TỰ ĐỘNG PHASE 2: CORE TCP MULTIPLAYER');
  console.log('====================================================\n');

  // 1. Khởi động server trên PORT 3005 để tránh xung đột cổng
  const TEST_PORT = 3005;
  const serverProcess = spawn('node', ['server/server.js'], {
    env: { ...process.env, PORT: TEST_PORT.toString() },
    stdio: ['ignore', 'pipe', 'pipe']
  });

  serverProcess.stdout.on('data', (d) => process.stdout.write(`[SERVER] ${d}`));
  serverProcess.stderr.on('data', (d) => process.stderr.write(`[SERVER ERR] ${d}`));

  await new Promise(r => setTimeout(r, 2000));

  let passedAll = true;

  try {
    // 2. Client 1 kết nối & Join
    console.log('\n[TEST 1] Client 1 kết nối & gửi PLAYER_JOIN:');
    const client1 = io(`http://localhost:${TEST_PORT}`, { reconnection: false });
    
    await new Promise((resolve) => {
      client1.on('connect', () => {
        console.log(`  ✅ Client 1 kết nối Socket ID: ${client1.id}`);
        client1.emit('PLAYER_JOIN', {
          name: 'Lữ Quốc Vinh',
          characterId: 'char_1',
          sprite: 'assets/characters/char_1_dev.png',
          x: 1728,
          y: 2208,
          direction: 'down'
        });
        resolve();
      });
    });

    await new Promise(r => setTimeout(r, 300));

    // 3. Client 2 kết nối & kiểm tra đồng bộ danh sách người chơi
    console.log('\n[TEST 2] Client 2 kết nối, kiểm tra CURRENT_PLAYERS & PLAYER_JOINED:');
    const client2 = io(`http://localhost:${TEST_PORT}`, { reconnection: false });

    let client2ReceivedCurrent = false;
    let client1ReceivedJoined = false;

    client2.on('CURRENT_PLAYERS', (roster) => {
      console.log(`  ✅ Client 2 nhận sự kiện CURRENT_PLAYERS (${roster.length} người chơi)`);
      const foundC1 = roster.find(p => p.id === client1.id);
      if (foundC1 && foundC1.name === 'Lữ Quốc Vinh') {
        console.log(`  ✅ Client 1 có mặt trong danh sách trả về cho Client 2: "${foundC1.name}"`);
        client2ReceivedCurrent = true;
      }
    });

    client1.on('PLAYER_JOINED', (newPlayer) => {
      console.log(`  ✅ Client 1 nhận sự kiện PLAYER_JOINED: "${newPlayer.name}" (${newPlayer.id})`);
      if (newPlayer.name === 'Nguyễn Văn A') {
        client1ReceivedJoined = true;
      }
    });

    await new Promise((resolve) => {
      client2.on('connect', () => {
        console.log(`  ✅ Client 2 kết nối Socket ID: ${client2.id}`);
        client2.emit('PLAYER_JOIN', {
          name: 'Nguyễn Văn A',
          characterId: 'char_2',
          sprite: 'assets/characters/char_2_pm.png',
          x: 1800,
          y: 2208,
          direction: 'left'
        });
        resolve();
      });
    });

    await new Promise(r => setTimeout(r, 500));

    if (!client2ReceivedCurrent || !client1ReceivedJoined) {
      console.error('  ❌ Thất bại trong việc đồng bộ Join giữa 2 Client!');
      passedAll = false;
    }

    // 4. Kiểm tra đồng bộ di chuyển & Throttling
    console.log('\n[TEST 3] Kiểm tra đồng bộ di chuyển PLAYER_MOVE & Throttling 30Hz:');
    let movePacketsReceived = 0;
    let lastReceivedCoord = null;

    client2.on('PLAYER_MOVED', (data) => {
      if (data.id === client1.id) {
        movePacketsReceived++;
        lastReceivedCoord = { x: data.x, y: data.y };
      }
    });

    // Giả lập Client 1 di chuyển đè phím trong 200ms: gửi liên tục với Throttling 30Hz (~33ms)
    // Nếu không throttle: 60 packets sẽ bắn lên. Với throttle: tối đa ~6-7 packets.
    let lastEmit = 0;
    const THROTTLE_MS = 33;
    let sentCount = 0;
    const startWalk = Date.now();

    for (let frame = 0; frame < 60; frame++) {
      const now = Date.now();
      if (now - lastEmit >= THROTTLE_MS) {
        client1.emit('PLAYER_MOVE', {
          x: 1728 + frame * 2,
          y: 2208,
          direction: 'right',
          isMoving: true
        });
        lastEmit = now;
        sentCount++;
      }
      await new Promise(r => setTimeout(r, 5)); // mỗi vòng lặp 5ms (giống render loop)
    }

    // Gửi gói tin dừng bước (state changed)
    client1.emit('PLAYER_MOVE', {
      x: 1728 + 120,
      y: 2208,
      direction: 'right',
      isMoving: false
    });
    sentCount++;

    await new Promise(r => setTimeout(r, 400));

    console.log(`  ℹ️ Client 1 đã gửi: ${sentCount} gói tin (đã được lọc qua Throttling 30Hz)`);
    console.log(`  ℹ️ Client 2 đã nhận: ${movePacketsReceived} gói tin PLAYER_MOVED`);
    if (movePacketsReceived > 0 && lastReceivedCoord && lastReceivedCoord.x > 1728) {
      console.log(`  ✅ Đồng bộ tọa độ di chuyển thành công! Tọa độ cuối: (${lastReceivedCoord.x}, ${lastReceivedCoord.y})`);
    } else {
      console.error('  ❌ Lỗi không nhận được gói tin di chuyển!');
      passedAll = false;
    }

    // 5. Kiểm tra ngắt kết nối / Rời phòng
    console.log('\n[TEST 4] Kiểm tra ngắt kết nối đột ngột & dọn dẹp World State (Heartbeat/Disconnect):');
    
    const client2Id = client2.id;
    const leavePromise = new Promise((resolve) => {
      client1.on('PLAYER_LEFT', (data) => {
        console.log(`  ✅ Client 1 nhận thông báo PLAYER_LEFT cho socket: ${data.playerId}`);
        if (data.playerId === client2Id) {
          resolve(true);
        }
      });
    });

    // Client 2 ngắt kết nối đột ngột
    client2.disconnect();
    const client1NotifiedOfLeave = await Promise.race([
      leavePromise,
      new Promise(r => setTimeout(() => r(false), 2000))
    ]);

    if (client1NotifiedOfLeave) {
      console.log('  ✅ Server đã dọn dẹp bộ nhớ và broadcast sự kiện rời phòng thành công!');
    } else {
      console.error('  ❌ Không nhận được sự kiện PLAYER_LEFT khi client ngắt kết nối!');
      passedAll = false;
    }

    // 6. Kiểm tra lại World State trên Server qua API Health
    console.log('\n[TEST 5] Kiểm tra API Health sau khi Client 2 ngắt kết nối:');
    const healthData = await new Promise((resolve, reject) => {
      http.get(`http://localhost:${TEST_PORT}/api/health`, (res) => {
        let d = '';
        res.on('data', c => d += c);
        res.on('end', () => resolve(JSON.parse(d)));
      }).on('error', reject);
    });

    console.log(`  ℹ️ Số lượng người chơi trực tuyến hiện tại trên Server: ${healthData.onlineCount}`);
    if (healthData.onlineCount === 1 && healthData.players[0].name === 'Lữ Quốc Vinh') {
      console.log('  ✅ World State lưu trữ chính xác người chơi còn lại!');
    } else {
      console.error('  ❌ Dữ liệu World State trên Server không khớp kỳ vọng!');
      passedAll = false;
    }

    client1.disconnect();
  } catch (err) {
    console.error('❌ Lỗi ngoại lệ trong quá trình test:', err);
    passedAll = false;
  } finally {
    serverProcess.kill();
  }

  console.log('\n====================================================');
  console.log(`🏁 KẾT QUẢ PHASE 2: ${passedAll ? 'TẤT CẢ TEST ĐỀU ĐẠT CHUẨN ✅' : 'CÓ BƯỚC THẤT BẠI ❌'}`);
  console.log('====================================================\n');
  process.exit(passedAll ? 0 : 1);
}

testPhase2();
