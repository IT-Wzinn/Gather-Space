const { spawn } = require('child_process');
const { io } = require('socket.io-client');

async function testPhase3() {
  console.log('====================================================');
  console.log('🧪 BẮT ĐẦU KIỂM THỬ TỰ ĐỘNG PHASE 3: CHAT ROUTING (BROADCAST & GEOCAST)');
  console.log('====================================================\n');

  const TEST_PORT = 3006;
  const serverProcess = spawn('node', ['server/server.js'], {
    env: { ...process.env, PORT: TEST_PORT.toString() },
    stdio: ['ignore', 'pipe', 'pipe']
  });

  serverProcess.stdout.on('data', (d) => process.stdout.write(`[SERVER] ${d}`));
  serverProcess.stderr.on('data', (d) => process.stderr.write(`[SERVER ERR] ${d}`));

  await new Promise(r => setTimeout(r, 2000));

  let passedAll = true;

  try {
    // Khởi tạo 3 client
    const c1 = io(`http://localhost:${TEST_PORT}`, { reconnection: false });
    const c2 = io(`http://localhost:${TEST_PORT}`, { reconnection: false });
    const c3 = io(`http://localhost:${TEST_PORT}`, { reconnection: false });

    // Đợi cả 3 kết nối
    await Promise.all([
      new Promise(res => c1.on('connect', res)),
      new Promise(res => c2.on('connect', res)),
      new Promise(res => c3.on('connect', res))
    ]);

    console.log('✅ Cả 3 Client đã kết nối Socket thành công');

    // Join với tọa độ không gian:
    // C1: (1700, 2200)
    // C2: (1780, 2200) -> Khoảng cách C1-C2 = 80px (Lân cận, < 250px)
    // C3: (3000, 2200) -> Khoảng cách C1-C3 = 1300px (Rất xa, > 250px)
    c1.emit('PLAYER_JOIN', { name: 'Người chơi 1 (Gốc)', x: 1700, y: 2200 });
    c2.emit('PLAYER_JOIN', { name: 'Người chơi 2 (Gần - 80px)', x: 1780, y: 2200 });
    c3.emit('PLAYER_JOIN', { name: 'Người chơi 3 (Xa - 1300px)', x: 3000, y: 2200 });

    await new Promise(r => setTimeout(r, 600));

    // --- TEST 1: KIỂM TRA BROADCAST CHAT ("everyone") ---
    console.log('\n[TEST 1] Kiểm tra Kênh Broadcast (Phát sóng toàn mạng - "everyone"):');
    
    let c1RecvBroadcast = false;
    let c2RecvBroadcast = false;
    let c3RecvBroadcast = false;

    c1.on('CHAT_RECEIVE', (msg) => {
      if (msg.text === 'Tin nhắn thông báo toàn thể') c1RecvBroadcast = true;
    });
    c2.on('CHAT_RECEIVE', (msg) => {
      if (msg.text === 'Tin nhắn thông báo toàn thể') c2RecvBroadcast = true;
    });
    c3.on('CHAT_RECEIVE', (msg) => {
      if (msg.text === 'Tin nhắn thông báo toàn thể') c3RecvBroadcast = true;
    });

    c1.emit('CHAT_SEND', {
      text: 'Tin nhắn thông báo toàn thể',
      scope: 'everyone',
      senderName: 'Người chơi 1 (Gốc)'
    });

    await new Promise(r => setTimeout(r, 600));

    if (c1RecvBroadcast && c2RecvBroadcast && c3RecvBroadcast) {
      console.log('  ✅ Cả 3 người chơi (kể cả người ở xa 1300px) đều nhận được tin nhắn Broadcast toàn mạng!');
    } else {
      console.error(`  ❌ Thất bại Broadcast: C1=${c1RecvBroadcast}, C2=${c2RecvBroadcast}, C3=${c3RecvBroadcast}`);
      passedAll = false;
    }

    // --- TEST 2: KIỂM TRA SPATIAL GEOCASTING CHAT ("nearby") ---
    console.log('\n[TEST 2] Kiểm tra Kênh Geocasting (Định tuyến theo khoảng cách Euclid - "nearby"):');

    let c1RecvNearby = false;
    let c2RecvNearby = false;
    let c2Distance = null;
    let c3RecvNearby = false;

    c1.on('CHAT_RECEIVE', (msg) => {
      if (msg.text === 'Thì thầm lân cận') c1RecvNearby = true;
    });
    c2.on('CHAT_RECEIVE', (msg) => {
      if (msg.text === 'Thì thầm lân cận') {
        c2RecvNearby = true;
        c2Distance = msg.distance;
      }
    });
    c3.on('CHAT_RECEIVE', (msg) => {
      if (msg.text === 'Thì thầm lân cận') c3RecvNearby = true;
    });

    c1.emit('CHAT_SEND', {
      text: 'Thì thầm lân cận',
      scope: 'nearby',
      senderName: 'Người chơi 1 (Gốc)'
    });

    await new Promise(r => setTimeout(r, 800));

    console.log(`  ℹ️ Client 1 nhận được tin của mình: ${c1RecvNearby}`);
    console.log(`  ℹ️ Client 2 (cách 80px) nhận được tin: ${c2RecvNearby} (Khoảng cách tính toán: ${c2Distance}px)`);
    console.log(`  ℹ️ Client 3 (cách 1300px) nhận được tin: ${c3RecvNearby} (Kỳ vọng: false)`);

    if (c1RecvNearby && c2RecvNearby && !c3RecvNearby && c2Distance === 80) {
      console.log('  ✅ Thuật toán Geocasting hoạt động chuẩn xác: Người ở gần nhận được (kèm khoảng cách 80px), người ở xa bị cô lập gói tin hoàn toàn!');
    } else {
      console.error('  ❌ Thất bại trong việc kiểm tra Geocasting Nearby!');
      passedAll = false;
    }

    c1.disconnect();
    c2.disconnect();
    c3.disconnect();
  } catch (err) {
    console.error('❌ Lỗi ngoại lệ kiểm thử Phase 3:', err);
    passedAll = false;
  } finally {
    serverProcess.kill();
  }

  console.log('\n====================================================');
  console.log(`🏁 KẾT QUẢ PHASE 3: ${passedAll ? 'TẤT CẢ TEST ĐỀU ĐẠT CHUẨN ✅' : 'CÓ BƯỚC THẤT BẠI ❌'}`);
  console.log('====================================================\n');
  process.exit(passedAll ? 0 : 1);
}

testPhase3();
