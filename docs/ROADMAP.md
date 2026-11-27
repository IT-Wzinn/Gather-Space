# 🗺️ LỘ TRÌNH PHÁT TRIỂN SẢN PHẨM (ROADMAP)
## Dự án: QV Virtual Office - Đồ án Lập trình Mạng

> **Tài liệu tham chiếu:** [Readme.md](file:///c:/Users/ASUS/Downloads/Test%201/Readme.md)  
> **Mục tiêu:** Xây dựng hoàn chỉnh hệ thống không gian ảo tương tác thời gian thực từ nền tảng Frontend sẵn có, tích hợp đầy đủ Backend Node.js, Database và các cơ chế Mạng nâng cao (TCP/UDP, Hybrid Architecture, Geocasting, WebRTC P2P Mesh, STUN NAT Traversal).

---

## 📊 TỔNG QUAN TIẾN ĐỘ DỰ ÁN

| Giai đoạn | Nội dung trọng tâm | Trạng thái |
| :--- | :--- | :---: |
| **Phase 1** | Chuẩn hóa cấu trúc dự án & Khởi tạo Server Node.js | `[x] Đã hoàn thành` |
| **Phase 2** | Xây dựng Core TCP: Đồng bộ chuyển động & Nhịp tim (Heartbeat) | `[x] Đã hoàn thành` |
| **Phase 3** | Định tuyến gói tin: Chat Broadcast & Spatial Geocasting Nearby | `[x] Đã hoàn thành` |
| **Phase 4** | Phân nhóm Room & Tích hợp UDP WebRTC Media Mesh qua STUN | `[x] Đã hoàn thành` |
| **Phase 5** | Đồng bộ Bảng vẽ (Whiteboard) & Lưu trữ dữ liệu (Database) | `[x] Đã hoàn thành` |
| **Phase 6** | Kiểm thử tải mạng, Tối ưu hóa & Chuẩn bị Báo cáo bảo vệ | `[x] Đã hoàn thành` |

---

## 🚀 CHI TIẾT TỪNG GIAI ĐOẠN TRIỂN KHAI

---

### 🟢 PHASE 1: Chuẩn hóa Kiến trúc & Khởi tạo Backend
> **Mục tiêu:** Tách bạch rõ ràng giữa tầng Client và Server, khởi tạo máy chủ Node.js/Express phục vụ giao diện tĩnh và sẵn sàng tích hợp Socket.io.

#### 📋 Danh sách công việc (Checklist):
- [x] **Task 1.1:** Dọn dẹp và tổ chức lại thư mục:
  - Tạo thư mục `client/` chứa toàn bộ frontend hiện tại (`index.html`, `app.js`, `characters.js`, `build_master_map.js`, thư mục `assets/`, `Background/`, `Nhanvat/`).
  - Gom các script test/gen ảnh cũ vào thư mục lưu trữ `tools_archive/` để giữ gốc dự án gọn gàng.
- [x] **Task 1.2:** Khởi tạo môi trường Node.js:
  - Thiết lập file `package.json` chuẩn hóa (scripts: `start`, `dev`).
  - Cài đặt các gói phụ thuộc cần thiết: `express`, `socket.io`, `cors`, `dotenv`, `nodemon` (dev).
- [x] **Task 1.3:** Xây dựng cấu trúc khung mã nguồn Server (`server/`):
  - `server/server.js`: Khởi tạo Express HTTP Server & gắn Socket.io Server instance.
  - Cấu hình Express static middleware phục vụ toàn bộ nội dung từ thư mục `client/`.
- [x] **Task 1.4:** Tích hợp Socket.io Client vào `client/index.html` và kiểm tra kết nối "Handshake" đầu tiên giữa Browser và Node.js Server.

#### 🎯 Tiêu chí nghiệm thu (Definition of Done):
- Chạy lệnh `npm start`, mở trình duyệt tại `http://localhost:3000` giao diện văn phòng 2D hiện lên mượt mà, đầy đủ hình ảnh, âm thanh, không bị lỗi 404 đường dẫn tài nguyên.
- Console của Server in ra: `[Network] Client connected: <socket_id>`.

#### ⚠️ Lưu ý kỹ thuật:
- Khi chuyển các file vào `client/`, cần kiểm tra lại các đường dẫn tương đối (`assets/...`, `characters.js`) trong `index.html` và `app.js` để đảm bảo không bị gãy giao diện.

---

### 🟡 PHASE 2: Xây dựng Core TCP - Đồng bộ Chuyển động & Nhịp tim
> **Mục tiêu:** Hiện thực hóa giao thức truyền tin cậy qua TCP (WebSocket). Cho phép nhiều người chơi cùng xuất hiện, di chuyển trên cùng một bản đồ và phát hiện rớt mạng tức thì.

#### 📋 Danh sách công việc (Checklist):
- [x] **Task 2.1: Quản lý Trạng thái Thế giới (World State):**
  - Xây dựng module `server/core/worldState.js`: Quản lý danh sách người chơi trực tuyến trong RAM (Socket ID, Tên, Nhân vật chọn, Tọa độ $X, Y$, Hướng quay mặt).
- [x] **Task 2.2: Vòng đời kết nối (Join/Leave Lifecycle):**
  - Sự kiện `PLAYER_JOIN`: Client gửi thông tin nhân vật sau khi hoàn thành màn hình Prejoin. Server lưu vào World State và phát tán danh sách toàn bộ người chơi hiện tại cho Client mới, đồng thời báo cho các Client cũ thêm avatar mới.
  - Sự kiện `PLAYER_LEAVE`: Xử lý khi người dùng ấn nút "Rời phòng" hoặc đóng tab.
- [x] **Task 2.3: Đồng bộ di chuyển & Thuật toán Throttling 30Hz:**
  - Viết thuật toán Throttle ở `client/app.js`: Giới hạn tần số gửi gói tin `PLAYER_MOVE` tối đa 30 lần/giây (30Hz) khi người dùng đè phím di chuyển.
  - Phía Server: Xác thực tọa độ hợp lệ và broadcast gói tin di chuyển tới các người chơi khác.
  - Phía Client: Cập nhật vị trí của remote players trên Canvas 2D mượt mà.
- [x] **Task 2.4: Giao thức Nhịp tim (Heartbeat Protocol):**
  - Cấu hình Ping - Pong tự động giữa Server và Client với chu kỳ 5 giây (`pingInterval: 5000`, `pingTimeout: 5000`).
  - Xử lý sự kiện `disconnect`: Tự động thu hồi socket, giải phóng bộ nhớ và gửi bản tin cho các client khác xóa avatar tức thì khi có người bị ngắt kết nối đột ngột.

#### 🎯 Tiêu chí nghiệm thu (Definition of Done):
- Mở 2 tab trình duyệt song song. Cả 2 nhân vật xuất hiện trên bản đồ của nhau.
- Nhân vật ở Tab 1 di chuyển thì Tab 2 nhìn thấy di chuyển mượt mà thời gian thực.
- Tắt kết nối mạng hoặc đóng Tab 1, trong vòng 5 giây Tab 2 sẽ tự động xóa nhân vật của Tab 1.

#### ⚠️ Lưu ý kỹ thuật:
- Không gửi trực tiếp gói tin tọa độ trong vòng lặp `requestAnimationFrame` (60FPS) mà bắt buộc phải qua hàm Throttle để tránh bão gói tin (*Packet Flooding*).

---

### 🔵 PHASE 3: Định tuyến Gói tin - Chat Broadcast & Spatial Geocasting
> **Mục tiêu:** Triển khai các phương thức định tuyến gói tin ở tầng ứng dụng: phát sóng toàn mạng và định tuyến theo không gian tọa độ vật lý.

#### 📋 Danh sách công việc (Checklist):
- [x] **Task 3.1: Chat Toàn hệ thống (Broadcast Chat):**
  - Xử lý kênh chat `To: Everyone`.
  - Client gửi tin nhắn `CHAT_MESSAGE` với scope `global`.
  - Server định tuyến phát sóng gói tin cho toàn bộ Socket đang kết nối.
- [x] **Task 3.2: Chat Lân cận (Spatial Geocasting / Nearby Chat):**
  - Xây dựng module `server/core/geocastRouter.js`:
    - Khi nhận tin nhắn với scope `nearby`, Server lấy tọa độ $(x_A, y_A)$ của người gửi.
    - Duyệt qua danh sách người chơi trong World State, tính khoảng cách Euclid:
      $$d(A, B) = \sqrt{(x_B - x_A)^2 + (y_B - y_A)^2}$$
    - Chỉ gửi tin nhắn tới các Socket có $d(A, B) \le R$ (mặc định $R = 200\text{px}$).
- [x] **Task 3.3: Tích hợp Giao diện Chat:**
  - Nối luồng dữ liệu vào khung Chat có sẵn trên giao diện (`chatView`, danh sách tin nhắn động `dynamicMessagesList`).
  - Hiển thị nhãn rõ ràng: `[Toàn thể]` hoặc `[Gần bạn]` trên từng dòng tin nhắn.

#### 🎯 Tiêu chí nghiệm thu (Definition of Done):
- Người dùng đứng gần nhau (< 200px) gửi chat "Nearby" thì cả hai nhận được.
- Người dùng đứng ở 2 góc xa nhau trên bản đồ gửi chat "Nearby" thì bên kia hoàn toàn không nhận được gói tin (Server không định tuyến tới).
- Chat "Everyone" thì ở bất kỳ vị trí nào cũng nhận được.

---

### 🟣 PHASE 4: Phân nhóm Room & Tích hợp UDP WebRTC Media Mesh
> **Mục tiêu:** Hiện thực hóa kiến trúc lai: Sử dụng WebSocket cho Signaling và kết nối P2P Mesh trực tiếp qua UDP (WebRTC) để truyền Video/Audio khi vào phòng họp.

#### 📋 Danh sách công việc (Checklist):
- [x] **Task 4.1: Nhận diện Vùng Không gian (Spatial Room Detection):**
  - Tận dụng danh sách bounding box các phòng có sẵn trong `build_master_map.js` (Room 1 đến Room 11).
  - Khi tọa độ nhân vật bước vào phạm vi một phòng (ví dụ: *Phòng họp lớn Room 5*):
    - Client gửi sự kiện `ROOM_JOIN { roomId, roomName }`.
    - Server đưa socket vào Socket.io Room tương ứng (Application-Layer Multicast).
- [x] **Task 4.2: Tích hợp Máy chủ Báo hiệu (Signaling Broker):**
  - Xây dựng module `server/handlers/signalHandler.js` xử lý chuyển tiếp các gói tin bắt tay:
    - `SIGNAL_OFFER`: Gửi SDP Offer từ Peer A sang Peer B.
    - `SIGNAL_ANSWER`: Phản hồi SDP Answer từ Peer B về Peer A.
    - `SIGNAL_ICE`: Chuyển giao các ICE Candidates thu thập được.
- [x] **Task 4.3: Thiết lập P2P Mesh Client với Google STUN:**
  - Cấu hình `RTCConfiguration` với STUN server: `stun:stun.l.google.com:19302`.
  - Quản lý danh sách các kết nối `RTCPeerConnection` theo mô hình lưới (Mesh topology cho nhóm 2–4 người).
  - Khi có luồng `ontrack` từ xa: Tự động render video của đồng nghiệp lên khung Video Grid trong phòng họp.
- [x] **Task 4.4: Xử lý Rời phòng / Ngắt kết nối Video:**
  - Khi nhân vật bước ra khỏi cửa phòng: Đóng kết nối `RTCPeerConnection`, giải phóng Camera/Mic stream và gửi tín hiệu cho các peer khác gỡ bỏ khung video.

#### 🎯 Tiêu chí nghiệm thu (Definition of Done):
- Khi 2 nhân vật cùng bước vào "Phòng họp lớn", khung video tự động kết nối và hiển thị camera/micro của nhau với độ trễ cực thấp.
- Khi 1 nhân vật bước ra hành lang, kết nối video P2P tự động ngắt, camera tắt và tài nguyên được giải phóng.

#### ⚠️ Lưu ý kỹ thuật:
- Luồng video/audio truyền hoàn toàn qua kết nối P2P trực tiếp (UDP), không truyền qua server trung tâm Node.js (Bandwidth Offloading).

---

### 🟤 PHASE 5: Đồng bộ Bảng vẽ (Whiteboard) & Lưu trữ Dữ liệu (Database)
> **Mục tiêu:** Cung cấp tính năng bảng vẽ cộng tác thời gian thực đảm bảo tính toàn vẹn gói tin và lưu trữ dữ liệu bền vững.

#### 📋 Danh sách công việc (Checklist):
- [x] **Task 5.1: Xây dựng Canvas Bảng vẽ cộng tác (Whiteboard):**
  - Tạo modal / panel Whiteboard khi nhân vật tương tác với bảng vẽ trong phòng họp.
  - Lắng nghe các sự kiện vẽ (`mousedown`, `mousemove`, `mouseup`).
- [x] **Task 5.2: Đồng bộ nét vẽ qua TCP (Reliable Stroke Synchronization):**
  - Đóng gói tọa độ nét vẽ: `{ prevX, prevY, currX, currY, color, size }`.
  - Sử dụng Application Multicast: Chỉ phát sóng nét vẽ cho các thành viên đang mở bảng vẽ trong cùng phòng họp.
- [x] **Task 5.3: Lưu trữ dữ liệu bền vững (Persistence Layer):**
  - Tích hợp cơ sở dữ liệu nhẹ (SQLite hoặc File-based JSON Database `lowdb`).
  - Thiết kế bảng lưu trữ:
    - Bảng `users`: Lưu thông tin tài khoản/nhân vật.
    - Bảng `rooms`: Lưu thông tin và trạng thái cấu hình các phòng.
    - Bảng `chat_history`: Lưu vết lịch sử tin nhắn toàn hệ thống.

#### 🎯 Tiêu chí nghiệm thu (Definition of Done):
- Hai người trong cùng phòng họp cùng mở bảng vẽ, người này vẽ đến đâu nét vẽ hiển thị ngay lập tức trên bảng của người kia, không bị đứt đoạn hay mất nét.
- Khởi động lại Server, thông tin cấu hình phòng và lịch sử chat không bị mất.

---

### 🟢 PHASE 6: Kiểm thử Tải mạng, Tối ưu & Chuẩn bị Báo cáo Bảo vệ
> **Mục tiêu:** Đánh giá hiệu năng mạng, chuẩn bị kịch bản demo trực tiếp và tài liệu vấn đáp cho buổi bảo vệ đồ án.

#### 📋 Danh sách công việc (Checklist):
- [x] **Task 6.1: Kiểm thử Đa máy khách (Local & LAN Testing):**
  - Chạy thử nghiệm đồng thời 3–4 máy khách (trên cùng máy và qua mạng LAN nội bộ giữa 2 laptop khác nhau).
  - Đo đạc độ trễ ping WebSocket và độ trễ luồng WebRTC qua công cụ `chrome://webrtc-internals`.
- [x] **Task 6.2: Kiểm thử các Trường hợp Ngoại lệ Mạng (Network Edge Cases):**
  - Mô phỏng rút dây mạng / tắt Wi-Fi đột ngột: Kiểm tra xem Heartbeat có kích hoạt dọn dẹp avatar sau 5 giây không.
  - Thử nghiệm spam phím di chuyển: Kiểm tra Throttling có chặn thành công bão gói tin không.
- [x] **Task 6.3: Rà soát Kịch bản Báo cáo dựa trên Cheat Sheet:**
  - Chuẩn bị slide hoặc màn hình demo bám sát từng dòng trong **Bảng Cheat Sheet** của `Readme.md`:
    1. Demo di chuyển + Giải thích TCP & Throttling.
    2. Demo chat Nearby + Giải thích Geocasting Euclid.
    3. Demo bước vào thảm họp + Giải thích Room Multicast & WebRTC Mesh qua STUN.
    4. Demo rút mạng + Giải thích Heartbeat Ping/Pong.
    5. Demo bảng vẽ + Giải thích tính toàn vẹn dữ liệu TCP.

---

## 📌 NGUYÊN TẮC THỰC HIỆN TRONG QUÁ TRÌNH PHÁT TRIỂN

> [!TIP]
> 1. **Bảo tồn Frontend:** Tuyệt đối không can thiệp làm thay đổi cấu trúc CSS hay vỡ layout bản đồ/nhân vật đã được tạo sẵn ở giai đoạn trước.
> 2. **Từng bước một (Step-by-Step):** Hoàn thành dứt điểm từng Phase, test chạy thử nghiệm thành công trước khi chuyển sang Phase tiếp theo.
> 3. **Mã nguồn chú thích rõ ràng:** Mọi đoạn code xử lý mạng đều cần có comment giải thích tên thuật toán/giao thức để phục vụ việc giải trình trước hội đồng chấm thi.
