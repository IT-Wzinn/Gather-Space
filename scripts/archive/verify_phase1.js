const http = require('http');
const { spawn } = require('child_process');
const { io } = require('socket.io-client');

async function testPhase1() {
  console.log('--- BẮT ĐẦU KIỂM THỬ TỰ ĐỘNG PHASE 1 ---');
  
  // 1. Khởi động server
  const serverProcess = spawn('node', ['server/server.js'], {
    stdio: ['ignore', 'pipe', 'pipe']
  });

  serverProcess.stdout.on('data', (d) => process.stdout.write(`[SERVER STDOUT] ${d}`));
  serverProcess.stderr.on('data', (d) => process.stderr.write(`[SERVER STDERR] ${d}`));

  // Đợi server khởi động
  await new Promise(r => setTimeout(r, 2000));

  function fetchUrl(urlPath) {
    return new Promise((resolve, reject) => {
      http.get(`http://localhost:3000${urlPath}`, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve({ statusCode: res.statusCode, data }));
      }).on('error', reject);
    });
  }

  const endpoints = [
    '/',
    '/api/health',
    '/socket.io/socket.io.js',
    '/styles.css',
    '/app.js',
    '/characters.js',
    '/mapEngine.js',
    '/build_master_map.js',
    '/assets/office_master_blueprint.png'
  ];

  let allPassed = true;

  console.log('\n[1] Kiểm tra các Endpoint HTTP & Tài nguyên tĩnh:');
  for (const ep of endpoints) {
    try {
      const res = await fetchUrl(ep);
      const isOk = res.statusCode === 200;
      if (isOk) {
        console.log(`  ✅ 200 OK: ${ep}`);
      } else {
        console.error(`  ❌ LỖI ${res.statusCode}: ${ep}`);
        allPassed = false;
      }
    } catch (err) {
      console.error(`  ❌ LỖI KẾT NỐI: ${ep} - ${err.message}`);
      allPassed = false;
    }
  }

  console.log('\n[2] Kiểm tra kết nối WebSocket Socket.io:');
  const socket1 = io('http://localhost:3000', { reconnection: false });
  const socket2 = io('http://localhost:3000', { reconnection: false });

  const s1Connect = new Promise((resolve) => {
    socket1.on('connect', () => {
      console.log(`  ✅ Socket Client 1 kết nối thành công: ${socket1.id}`);
      resolve(true);
    });
  });

  const s2Connect = new Promise((resolve) => {
    socket2.on('connect', () => {
      console.log(`  ✅ Socket Client 2 kết nối thành công: ${socket2.id}`);
      resolve(true);
    });
  });

  await Promise.all([s1Connect, s2Connect]);

  socket1.disconnect();
  socket2.disconnect();
  await new Promise(r => setTimeout(r, 500));

  serverProcess.kill();
  console.log('\n--- KẾT QUẢ KIỂM THỬ PHASE 1: ' + (allPassed ? 'THÀNH CÔNG RỰC RỠ ✅' : 'CÓ LỖI ❌') + ' ---');
  process.exit(allPassed ? 0 : 1);
}

testPhase1().catch(e => {
  console.error('Fatal test error:', e);
  process.exit(1);
});
