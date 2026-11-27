const http = require('http');
const { spawn } = require('child_process');
const { io } = require('socket.io-client');

async function testPhase4() {
  console.log('====================================================');
  console.log('🧪 BẮT ĐẦU KIỂM THỬ TỰ ĐỘNG PHASE 4: ROOM MULTICAST & WEBRTC SIGNALING');
  console.log('====================================================\n');

  const TEST_PORT = 3007;
  const serverProcess = spawn('node', ['server/server.js'], {
    env: { ...process.env, PORT: TEST_PORT.toString() },
    stdio: ['ignore', 'pipe', 'pipe']
  });

  serverProcess.stdout.on('data', (d) => process.stdout.write(`[SERVER] ${d}`));
  serverProcess.stderr.on('data', (d) => process.stderr.write(`[SERVER ERR] ${d}`));

  await new Promise(r => setTimeout(r, 2000));

  let passedAll = true;

  try {
    // 1. Kiểm tra webrtcManager.js được phục vụ 200 OK
    console.log('[TEST 1] Kiểm tra tải tài nguyên client/webrtcManager.js:');
    const assetCheck = await new Promise((resolve) => {
      http.get(`http://localhost:${TEST_PORT}/webrtcManager.js`, (res) => {
        resolve(res.statusCode === 200);
      }).on('error', () => resolve(false));
    });

    if (assetCheck) {
      console.log('  ✅ 200 OK: webrtcManager.js đã sẵn sàng phục vụ trình duyệt.');
    } else {
      console.error('  ❌ Lỗi không tải được webrtcManager.js!');
      passedAll = false;
    }

    // 2. Khởi tạo 2 client
    console.log('\n[TEST 2] Kết nối 2 Client và tham gia World State:');
    const c1 = io(`http://localhost:${TEST_PORT}`, { reconnection: false });
    const c2 = io(`http://localhost:${TEST_PORT}`, { reconnection: false });

    await Promise.all([
      new Promise(res => c1.on('connect', res)),
      new Promise(res => c2.on('connect', res))
    ]);

    c1.emit('PLAYER_JOIN', { name: 'Peer A (Lữ Quốc Vinh)', x: 300, y: 300 });
    c2.emit('PLAYER_JOIN', { name: 'Peer B (Đồng Nghiệp)', x: 400, y: 300 });
    await new Promise(r => setTimeout(r, 400));
    console.log(`  ✅ C1 (${c1.id}) và C2 (${c2.id}) đã tham gia không gian làm việc`);

    // 3. Kiểm tra phân nhóm Room (Spatial Multicast)
    console.log('\n[TEST 3] Kiểm tra Phân nhóm Room & Multicast sự kiện:');
    const roomId = 'large_boardroom';
    const roomName = 'Phòng Họp Lớn (Boardroom)';

    // C1 bước vào phòng họp lớn trước
    let c1RoomMembers = null;
    c1.on('ROOM_MEMBERS', (data) => {
      c1RoomMembers = data;
    });
    c1.emit('ROOM_JOIN', { roomId, roomName });
    await new Promise(r => setTimeout(r, 300));

    if (c1RoomMembers && c1RoomMembers.roomId === roomId && c1RoomMembers.peers.length === 0) {
      console.log('  ✅ C1 gia nhập phòng đầu tiên thành công (0 peer trước đó).');
    } else {
      console.error('  ❌ C1 thất bại khi nhận ROOM_MEMBERS!');
      passedAll = false;
    }

    // C2 bước vào cùng phòng họp lớn với C1
    let c2RoomMembers = null;
    let c1NotifiedOfC2Join = false;

    c2.on('ROOM_MEMBERS', (data) => {
      c2RoomMembers = data;
    });

    c1.on('ROOM_PEER_JOINED', (data) => {
      if (data.peerId === c2.id) {
        c1NotifiedOfC2Join = true;
      }
    });

    c2.emit('ROOM_JOIN', { roomId, roomName });
    await new Promise(r => setTimeout(r, 400));

    if (c2RoomMembers && c2RoomMembers.peers.some(p => p.id === c1.id) && c1NotifiedOfC2Join) {
      console.log('  ✅ C2 nhận danh sách phòng chứa C1, và C1 nhận thông báo C2 vừa bước vào phòng!');
    } else {
      console.error('  ❌ Thất bại trong phân nhóm Room Multicast!');
      passedAll = false;
    }

    // 4. Kiểm tra luồng Báo hiệu WebRTC Signaling (Offer / Answer / ICE)
    console.log('\n[TEST 4] Kiểm tra Báo hiệu WebRTC Signaling qua WebSocket (Handshake):');

    let c1ReceivedOffer = false;
    let c2ReceivedAnswer = false;
    let c1ReceivedIce = false;

    c1.on('SIGNAL_OFFER', ({ senderPeerId, sdp }) => {
      if (senderPeerId === c2.id && sdp.type === 'offer') {
        c1ReceivedOffer = true;
        // C1 gửi lại Answer
        c1.emit('SIGNAL_ANSWER', {
          targetPeerId: c2.id,
          sdp: { type: 'answer', sdp: 'v=0\r\no=- answer_test_sdp...' },
          roomId
        });
      }
    });

    c2.on('SIGNAL_ANSWER', ({ senderPeerId, sdp }) => {
      if (senderPeerId === c1.id && sdp.type === 'answer') {
        c2ReceivedAnswer = true;
      }
    });

    c1.on('SIGNAL_ICE', ({ senderPeerId, candidate }) => {
      if (senderPeerId === c2.id && candidate.candidate.includes('stun_test_candidate')) {
        c1ReceivedIce = true;
      }
    });

    // C2 (người mới vào) gửi Offer cho C1
    c2.emit('SIGNAL_OFFER', {
      targetPeerId: c1.id,
      sdp: { type: 'offer', sdp: 'v=0\r\no=- offer_test_sdp...' },
      roomId
    });

    await new Promise(r => setTimeout(r, 400));

    // C2 gửi ICE Candidate (thu thập từ Google STUN)
    c2.emit('SIGNAL_ICE', {
      targetPeerId: c1.id,
      candidate: {
        candidate: 'candidate:1 1 UDP 2122260223 stun_test_candidate 19302 typ host',
        sdpMid: '0',
        sdpMLineIndex: 0
      },
      roomId
    });

    await new Promise(r => setTimeout(r, 500));

    if (c1ReceivedOffer && c2ReceivedAnswer && c1ReceivedIce) {
      console.log('  ✅ Toàn bộ chu trình Báo hiệu Signaling (Offer -> Answer -> ICE Candidate) đã chuyển tiếp thành công qua WebSocket!');
    } else {
      console.error(`  ❌ Lỗi Signaling: Offer=${c1ReceivedOffer}, Answer=${c2ReceivedAnswer}, ICE=${c1ReceivedIce}`);
      passedAll = false;
    }

    // 5. Kiểm tra rời phòng (ROOM_LEAVE)
    console.log('\n[TEST 5] Kiểm tra rời phòng và dọn dẹp kết nối:');
    let c1NotifiedOfC2Leave = false;
    c1.on('ROOM_PEER_LEFT', (data) => {
      if (data.peerId === c2.id && data.roomId === roomId) {
        c1NotifiedOfC2Leave = true;
      }
    });

    c2.emit('ROOM_LEAVE', { roomId });
    await new Promise(r => setTimeout(r, 400));

    if (c1NotifiedOfC2Leave) {
      console.log('  ✅ C1 đã nhận thông báo C2 rời phòng để ngắt kết nối P2P và gỡ video tile!');
    } else {
      console.error('  ❌ Thất bại khi thông báo ROOM_PEER_LEFT!');
      passedAll = false;
    }

    c1.disconnect();
    c2.disconnect();
  } catch (err) {
    console.error('❌ Lỗi ngoại lệ kiểm thử Phase 4:', err);
    passedAll = false;
  } finally {
    serverProcess.kill();
  }

  console.log('\n====================================================');
  console.log(`🏁 KẾT QUẢ PHASE 4: ${passedAll ? 'TẤT CẢ TEST ĐỀU ĐẠT CHUẨN ✅' : 'CÓ BƯỚC THẤT BẠI ❌'}`);
  console.log('====================================================\n');
  process.exit(passedAll ? 0 : 1);
}

testPhase4();
