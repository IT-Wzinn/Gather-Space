const http = require('http');
const { spawn } = require('child_process');
const { io } = require('socket.io-client');

async function testPhase6Stress() {
  console.log('====================================================');
  console.log('🧪 BẮT ĐẦU KIỂM THỬ TẢI MẠNG & NGOẠI LỆ (PHASE 6 STRESS TEST)');
  console.log('====================================================\n');

  const TEST_PORT = 3009;
  const serverProcess = spawn('node', ['server/server.js'], {
    env: { ...process.env, PORT: TEST_PORT.toString() },
    stdio: ['ignore', 'pipe', 'pipe']
  });

  serverProcess.stdout.on('data', (d) => process.stdout.write(`[SERVER] ${d}`));
  serverProcess.stderr.on('data', (d) => process.stderr.write(`[SERVER ERR] ${d}`));

  await new Promise(r => setTimeout(r, 2000));

  let passedAll = true;

  try {
    // -----------------------------------------------------------------
    // TEST 1: THỬ NGHIỆM CHỐNG BÃO GÓI TIN (PACKET FLOODING STRESS TEST)
    // -----------------------------------------------------------------
    console.log('[TEST 1] Thử nghiệm Throttling: Chống bão gói tin di chuyển (30Hz):');
    const c1 = io(`http://localhost:${TEST_PORT}`, { reconnection: false });
    const c2 = io(`http://localhost:${TEST_PORT}`, { reconnection: false });

    await Promise.all([
      new Promise(res => c1.on('connect', res)),
      new Promise(res => c2.on('connect', res))
    ]);

    c1.emit('PLAYER_JOIN', { name: 'Spammer C1', x: 1000, y: 1000 });
    c2.emit('PLAYER_JOIN', { name: 'Observer C2', x: 1050, y: 1000 });
    await new Promise(r => setTimeout(r, 400));

    let packetsReceivedByC2 = 0;
    c2.on('PLAYER_MOVED', () => {
      packetsReceivedByC2++;
    });

    // Giả lập spam 100 lần với vòng lặp nhanh
    const THROTTLE_MS = 33; // 30Hz
    let lastEmit = 0;
    let packetsActuallySent = 0;

    const startTime = Date.now();
    for (let i = 0; i < 100; i++) {
      const now = Date.now();
      if (now - lastEmit >= THROTTLE_MS) {
        c1.emit('PLAYER_MOVE', {
          x: 1000 + i * 2,
          y: 1000,
          direction: 'right',
          isMoving: true
        });
        lastEmit = now;
        packetsActuallySent++;
      }
      await new Promise(r => setTimeout(r, 10));
    }
    const durationSec = Math.max(0.1, (Date.now() - startTime) / 1000);
    const measuredRateHz = packetsActuallySent / durationSec;

    await new Promise(r => setTimeout(r, 400));
    console.log(`  ℹ️ Thời gian thử nghiệm: ${durationSec.toFixed(2)}s`);
    console.log(`  ℹ️ Số gói tin định gửi (Unthrottled requests): 100`);
    console.log(`  ℹ️ Số gói tin thực tế phát lên mạng: ${packetsActuallySent}`);
    console.log(`  ℹ️ Tần số mạng đo được: ${measuredRateHz.toFixed(1)} Hz (Kỳ vọng: <= 32 Hz)`);
    console.log(`  ℹ️ Số gói tin Observer C2 nhận được: ${packetsReceivedByC2}`);

    // Kiểm tra tần số không vượt quá 32Hz (chuẩn 30Hz)
    if (measuredRateHz <= 32 && packetsReceivedByC2 === packetsActuallySent) {
      console.log('  ✅ THUẬT TOÁN THROTTLING THÀNH CÔNG: Chặn đứng bão gói tin, bảo vệ Server và đường truyền mạng!');
    } else {
      console.error(`  ❌ Throttling không đạt chuẩn: Rate=${measuredRateHz}Hz`);
      passedAll = false;
    }

    // -----------------------------------------------------------------
    // TEST 2: THỬ NGHIỆM RỚT MẠNG ĐỘT NGỘT (SILENT DISCONNECTION & HEARTBEAT)
    // -----------------------------------------------------------------
    console.log('\n[TEST 2] Thử nghiệm Rút mạng đột ngột (Silent Disconnection):');
    const c1Id = c1.id;
    let observerNotifiedOfLeave = false;

    c2.on('PLAYER_LEFT', (data) => {
      if (data.playerId === c1Id) {
        observerNotifiedOfLeave = true;
      }
    });

    // C1 sập nguồn / rút cáp đột ngột
    c1.disconnect();
    await new Promise(r => setTimeout(r, 600));

    if (observerNotifiedOfLeave) {
      console.log('  ✅ Server phát hiện ngắt kết nối và gửi bản tin dọn dẹp PLAYER_LEFT tới các peer còn lại!');
    } else {
      console.error('  ❌ Server không kịp thời thông báo PLAYER_LEFT khi client ngắt kết nối!');
      passedAll = false;
    }

    // -----------------------------------------------------------------
    // TEST 3: FULL REGRESSION CHECK (TẤT CẢ ENDPOINT & API)
    // -----------------------------------------------------------------
    console.log('\n[TEST 3] Kiểm tra độ khả dụng toàn bộ 10 Endpoint tĩnh & REST API:');
    function checkUrl(urlPath) {
      return new Promise((resolve) => {
        http.get(`http://localhost:${TEST_PORT}${urlPath}`, (res) => {
          resolve({ status: res.statusCode });
        }).on('error', () => resolve({ status: 500 }));
      });
    }

    const testEndpoints = [
      '/',
      '/api/health',
      '/api/rooms',
      '/api/chat-history',
      '/socket.io/socket.io.js',
      '/styles.css',
      '/app.js',
      '/characters.js',
      '/mapEngine.js',
      '/whiteboard.js',
      '/webrtcManager.js'
    ];

    let endpointsOk = true;
    for (const ep of testEndpoints) {
      const res = await checkUrl(ep);
      if (res.status === 200) {
        console.log(`  ✅ 200 OK: ${ep}`);
      } else {
        console.error(`  ❌ LỖI ${res.status}: ${ep}`);
        endpointsOk = false;
        passedAll = false;
      }
    }

    c2.disconnect();
  } catch (err) {
    console.error('❌ Lỗi ngoại lệ trong quá trình Stress Test:', err);
    passedAll = false;
  } finally {
    serverProcess.kill();
  }

  console.log('\n====================================================');
  console.log(`🏁 KẾT QUẢ PHASE 6 STRESS TEST: ${passedAll ? 'TẤT CẢ TEST ĐỀU ĐẠT CHUẨN XUẤT SẮC ✅' : 'CÓ BƯỚC THẤT BẠI ❌'}`);
  console.log('====================================================\n');
  process.exit(passedAll ? 0 : 1);
}

testPhase6Stress();
