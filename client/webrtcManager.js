// client/webrtcManager.js
// Quản lý Hội nghị đa phương tiện WebRTC P2P Mesh qua STUN Server (Google STUN)
// Giao thức tầng giao vận: UDP (WebRTC / SRTP) cho Media thời gian thực độ trễ thấp (<100ms)

class WebRTCManager {
  constructor() {
    this.socket = null;
    this.localStream = null;
    this.placeholderStream = null;
    this.currentRoomId = null;

    // Quản lý các kết nối P2P Full-Mesh: Map<peerSocketId, RTCPeerConnection>
    this.peers = new Map();
    // Quản lý các luồng Media nhận được: Map<peerSocketId, MediaStream>
    this.remoteStreams = new Map();

    // Callbacks giao diện
    this.onStreamAdded = null;
    this.onStreamRemoved = null;

    // Cấu hình Google STUN Server phục vụ đục lỗ NAT (NAT Hole Punching)
    this.rtcConfig = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' }
      ]
    };
  }

  /**
   * Khởi tạo WebRTC Manager gắn với Socket.io client
   */
  init(socket, localStream = null) {
    this.socket = socket;
    this.localStream = localStream;
    this.setupSignalingListeners();
  }

  setLocalStream(stream) {
    this.localStream = stream || null;
    const replacementVideoTrack = stream
      ? stream.getVideoTracks()[0] || null
      : (this.getOrCreatePlaceholderStream()?.getVideoTracks()[0] || null);
    const replacementAudioTrack = stream ? stream.getAudioTracks()[0] || null : null;

    // Cập nhật track mới (hoặc khôi phục placeholder khi tắt cam) cho toàn bộ các peer đang kết nối
    this.peers.forEach((pc) => {
      const transceivers = typeof pc.getTransceivers === 'function' ? pc.getTransceivers() : [];
      const findSenderByKind = (kind) => {
        const senders = pc.getSenders();
        let s = senders.find(x => x.track && x.track.kind === kind);
        if (!s) {
          const tr = transceivers.find(t =>
            (t.sender && t.sender.track && t.sender.track.kind === kind)
            || (t.receiver && t.receiver.track && t.receiver.track.kind === kind)
          );
          if (tr) s = tr.sender;
        }
        return s;
      };

      if (replacementVideoTrack) {
        const vSender = findSenderByKind('video');
        if (vSender) {
          vSender.replaceTrack(replacementVideoTrack).catch(err => console.warn('[WebRTC] replaceTrack video failed:', err));
        } else if (stream) {
          pc.addTrack(replacementVideoTrack, stream);
        }
      }
      if (replacementAudioTrack) {
        const aSender = findSenderByKind('audio');
        if (aSender) {
          aSender.replaceTrack(replacementAudioTrack).catch(err => console.warn('[WebRTC] replaceTrack audio failed:', err));
        } else if (stream) {
          pc.addTrack(replacementAudioTrack, stream);
        }
      }
    });
  }

  /**
   * Thay thế video track sang luồng chia sẻ màn hình cho tất cả peer đang kết nối
   */
  async replaceVideoTrackForPeers(videoTrack) {
    if (!videoTrack) return;
    const ops = [];
    this.peers.forEach((pc) => {
      const sender = pc.getSenders().find(s => s.track && s.track.kind === 'video');
      if (sender) {
        ops.push(sender.replaceTrack(videoTrack).catch(err => console.warn('[WebRTC] replaceTrack failed:', err)));
      }
    });
    await Promise.all(ops);
  }

  /**
   * Tạo stream giả lập (Canvas 2D + Silent Audio) nếu người dùng chưa mở Camera/Mic
   * Giúp WebRTC vẫn thiết lập được kênh UDP P2P thành công mà không bị crash
   */
  getOrCreatePlaceholderStream() {
    if (this.placeholderStream) return this.placeholderStream;

    try {
      const canvas = document.createElement('canvas');
      canvas.width = 160;
      canvas.height = 120;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#38bdf8';
      ctx.font = '12px sans-serif';
      ctx.fillText('No Video', 50, 65);

      const videoTrack = canvas.captureStream(10).getVideoTracks()[0];
      
      // Tạo dummy audio track bằng Web Audio API
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const dst = osc.connect(audioCtx.createMediaStreamDestination());
      osc.start();
      const audioTrack = dst.stream.getAudioTracks()[0];
      audioTrack.enabled = false; // mute dummy audio

      this.placeholderStream = new MediaStream([videoTrack, audioTrack]);
      return this.placeholderStream;
    } catch (e) {
      console.warn('[WebRTC] Could not create placeholder stream:', e);
      return null;
    }
  }

  /**
   * Khi bước vào phòng họp: Bắt đầu thiết lập P2P Mesh tới các thành viên có sẵn
   */
  joinMeetingRoom(roomId, existingPeers = []) {
    this.currentRoomId = roomId;
    console.log(`[WebRTC] Entering meeting room "${roomId}" with ${existingPeers.length} peer(s)`);

    // Đối với người mới vào: Chủ động khởi tạo Offer (isInitiator = true) tới từng peer có sẵn
    existingPeers.forEach(peer => {
      this.createPeerConnection(peer.id, true);
    });
  }

  /**
   * Khởi tạo RTCPeerConnection cho 1 Peer cụ thể
   */
  async createPeerConnection(peerId, isInitiator = false) {
    if (this.peers.has(peerId)) {
      return this.peers.get(peerId);
    }

    console.log(`[WebRTC] Creating RTCPeerConnection for Peer: ${peerId} (Initiator: ${isInitiator})`);
    const pc = new RTCPeerConnection(this.rtcConfig);
    this.peers.set(peerId, pc);

    // 1. Thêm các media track vào kết nối
    const streamToSend = this.localStream || this.getOrCreatePlaceholderStream();
    if (streamToSend) {
      streamToSend.getTracks().forEach(track => {
        pc.addTrack(track, streamToSend);
      });
    }

    // 2. Thu thập ứng viên ICE từ Google STUN và gửi qua Signaling
    pc.onicecandidate = (event) => {
      if (event.candidate && this.socket) {
        this.socket.emit('SIGNAL_ICE', {
          targetPeerId: peerId,
          candidate: event.candidate,
          roomId: this.currentRoomId
        });
      }
    };

    // 3. Tiếp nhận luồng Media UDP trực tiếp từ Peer đối diện (ontrack)
    pc.ontrack = (event) => {
      console.log(`[WebRTC] ⚡ Received remote UDP stream from Peer: ${peerId}`);
      const remoteStream = event.streams[0];
      this.remoteStreams.set(peerId, remoteStream);
      if (typeof this.onStreamAdded === 'function') {
        this.onStreamAdded(peerId, remoteStream);
      }
    };

    // Theo dõi trạng thái kết nối
    pc.onconnectionstatechange = () => {
      console.log(`[WebRTC] Peer ${peerId} connection state: ${pc.connectionState}`);
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed' || pc.connectionState === 'closed') {
        this.removePeer(peerId);
      }
    };

    // 4. Nếu là bên khởi tạo: Tạo SDP Offer và gửi đi
    if (isInitiator) {
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        console.log(`[WebRTC] Sending SDP Offer to Peer: ${peerId}`);
        this.socket.emit('SIGNAL_OFFER', {
          targetPeerId: peerId,
          sdp: offer,
          roomId: this.currentRoomId
        });
      } catch (err) {
        console.error('[WebRTC] Error creating offer:', err);
      }
    }

    return pc;
  }

  /**
   * Lắng nghe các sự kiện báo hiệu Signaling từ Server qua WebSocket
   */
  setupSignalingListeners() {
    if (!this.socket) return;

    // Nhận SDP Offer từ người khác
    this.socket.on('SIGNAL_OFFER', async ({ senderPeerId, sdp, roomId }) => {
      console.log(`[WebRTC] Received SDP Offer from Peer: ${senderPeerId}`);
      const pc = await this.createPeerConnection(senderPeerId, false);
      try {
        if (pc.signalingState !== 'stable') {
          const myId = this.socket ? this.socket.id : '';
          const isPolite = !myId || myId < senderPeerId;
          if (!isPolite) {
            return;
          }
          await pc.setLocalDescription({ type: 'rollback' });
        }
        await pc.setRemoteDescription(new RTCSessionDescription(sdp));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        console.log(`[WebRTC] Sending SDP Answer to Peer: ${senderPeerId}`);
        this.socket.emit('SIGNAL_ANSWER', {
          targetPeerId: senderPeerId,
          sdp: answer,
          roomId: roomId || this.currentRoomId
        });
      } catch (err) {
        console.error('[WebRTC] Error handling SDP Offer:', err);
      }
    });

    // Nhận SDP Answer phản hồi
    this.socket.on('SIGNAL_ANSWER', async ({ senderPeerId, sdp }) => {
      console.log(`[WebRTC] Received SDP Answer from Peer: ${senderPeerId}`);
      const pc = this.peers.get(senderPeerId);
      if (pc && pc.signalingState === 'have-local-offer') {
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(sdp));
        } catch (err) {
          console.error('[WebRTC] Error setting remote description for answer:', err);
        }
      }
    });

    // Nhận ICE Candidate
    this.socket.on('SIGNAL_ICE', async ({ senderPeerId, candidate }) => {
      const pc = this.peers.get(senderPeerId);
      if (pc && candidate) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.warn('[WebRTC] Error adding ICE candidate:', err);
        }
      }
    });
  }

  /**
   * Xóa 1 peer và giải phóng tài nguyên
   */
  removePeer(peerId) {
    if (this.peers.has(peerId)) {
      const pc = this.peers.get(peerId);
      pc.close();
      this.peers.delete(peerId);
    }
    this.remoteStreams.delete(peerId);
    if (typeof this.onStreamRemoved === 'function') {
      this.onStreamRemoved(peerId);
    }
  }

  /**
   * Rời phòng họp: Đóng toàn bộ kết nối Mesh
   */
  leaveMeetingRoom() {
    console.log('[WebRTC] Leaving meeting room, closing all P2P connections');
    this.peers.forEach((pc) => pc.close());
    this.peers.clear();
    this.remoteStreams.clear();
    this.currentRoomId = null;
  }
}

// Global WebRTC Manager instance
window.webrtcManager = new WebRTCManager();
