# 🎓 HƯỚNG DẪN BẢO VỆ ĐỒ ÁN MÔN LẬP TRÌNH MẠNG
## Đề tài: Gather Space - Gather.town Clone (Hybrid Architecture)

> **Tài liệu tham chiếu:** [README.md](../README.md) | [ROADMAP.md](./ROADMAP.md)  
> **Bộ tài liệu này được thiết kế riêng để bạn tự tin đạt điểm tối đa (9.0 - 10.0) khi thuyết minh và trả lời vấn đáp trước hội đồng giảng viên.**

---

## ⏱️ PHẦN 1: KỊCH BẢN DEMO TRỰC TIẾP 5 PHÚT (LIVE DEMO SCRIPT)

### 🚀 Chuẩn bị trước khi vào phòng thi:
1. Mở Terminal chạy lệnh: `npm start`.
2. Quan sát log Server in ra địa chỉ IP LAN (ví dụ: `http://192.168.1.160:3000`).
3. Mở sẵn 2 cửa sổ trình duyệt đặt song song nửa màn hình:
   - **Cửa sổ trái:** Tab bình thường `http://localhost:3000`, nhập tên *"Lữ Quốc Vinh"*, chọn nhân vật IT Dev.
   - **Cửa sổ phải:** Tab ẩn danh `http://localhost:3000`, nhập tên *"Giảng Viên Chấm Thi"*, chọn nhân vật PM.
   *(Mẹo tạo ấn tượng cực mạnh: Lấy điện thoại kết nối cùng Wi-Fi và mở URL `http://192.168.1.160:3000` để chứng minh hệ thống hoạt động xuyên thiết bị qua mạng LAN!)*

---

### 🎬 Các bước trình diễn trước hội đồng:

#### Bước 1: Giới thiệu Kiến trúc Lai (Hybrid Architecture) - 30 giây
> *"Thưa thầy/cô, đề tài của em giải quyết bài toán không gian ảo tương tác thời gian thực bằng **Kiến trúc mạng lai (Hybrid)**: phối hợp **Client-Server** tập trung cho World State và **P2P Mesh WebRTC** cho Audio/Video độ trễ thấp."*

#### Bước 2: Demo Di chuyển nhân vật 2D & Thuật toán Throttling 30Hz - 1 phút
1. Bấm nút di chuyển ở Tab 1. Bên Tab 2 thấy nhân vật di chuyển tức thì, mượt mà.
2. **Thao tác "ghi điểm":** Bấm `F12` -> Chọn tab **Network** -> Lọc **WS (WebSocket)** -> Nhấn vào kết nối `socket.io` -> Mở tab **Messages**.
3. Chỉ vào màn hình: 
   > *"Thưa thầy, mặc dù vòng lặp game loop render ở 60 FPS, nhưng em đã tích hợp thuật toán **Throttling ở Client**: gom tọa độ và chỉ phát tối đa 30 gói tin/giây (30Hz). Việc này giúp ngăn chặn triệt để hiện tượng **Bão gói tin (Packet Flooding)** gây nghẽn mạng."*

#### Bước 3: Demo Chat Broadcast vs Spatial Geocasting Nearby - 1 phút
1. Cho 2 nhân vật đứng gần nhau (< 250px). Chọn phạm vi `📍 Nearby (< 250px)` và gửi tin nhắn: Cả 2 tab đều nhận được tin nhắn kèm tag xanh dương `[Gần bạn (80px)]`.
2. Điều khiển nhân vật Tab 2 đi thật xa (ví dụ sang góc phải bản đồ). Tab 1 tiếp tục gửi chat "Nearby": Tab 2 **hoàn toàn không nhận được** gói tin.
3. Chuyển sang `🌐 To: Everyone` và gửi: Cả 2 tab đều nhận được với tag xanh lá `[Toàn thể]`.
4. Giải thích:
   > *"Ở đây Server không phát tán mù quáng mà sử dụng thuật toán **Spatial Geocasting**: tính toán khoảng cách Euclid $d = \sqrt{\Delta x^2 + \Delta y^2}$. Gói tin chỉ được định tuyến tới các IP/Socket thỏa mãn $d \le 250\text{px}$, giúp tiết kiệm tối đa băng thông."*

#### Bước 4: Demo Phòng họp WebRTC P2P Mesh qua STUN & Giảm tải Băng thông - 1.5 phút
1. Cho cả 2 nhân vật bước vào **Phòng họp lớn (Boardroom)**.
2. Ngay khi bước qua cửa:
   - Banner Toast hiện lên: *"Bạn đã bước vào Phòng Họp Lớn"*.
   - Khung **WebRTC UDP Mesh Video Grid** tự động xuất hiện ở góc trên bản đồ.
   - Hai máy bắt tay Signaling qua WebSocket và luồng Video/Audio kết nối trực tiếp P2P.
3. Giải thích:
   > *"Thưa thầy, đây là kỹ thuật **Bandwidth Offloading (Giảm tải băng thông máy chủ)**. Máy chủ Node.js chỉ làm bà mối Signaling (trao đổi SDP Offer/Answer và ICE Candidate từ Google STUN). Khi vào phòng, luồng Media nặng hàng chục Mbps truyền trực tiếp qua giao thức **UDP (WebRTC)** giữa các máy khách, tải Media trên Server trung tâm giảm về 0!"*

#### Bước 5: Demo Bảng vẽ Whiteboard cộng tác thời gian thực qua TCP - 45 giây
1. Bấm nút `✏️ Bảng vẽ` trên thanh Video Grid.
2. Tab 1 vẽ một hình tròn màu đỏ: Tab 2 lập tức hiển thị chính xác từng pixel theo thời gian thực.
3. Giải thích:
   > *"Nét vẽ Whiteboard và tin nhắn Chat bắt buộc phải chạy trên **TCP** (Reliable & Ordered). Nếu dùng UDP ở đây, hiện tượng rơi rớt gói tin sẽ làm nét vẽ bị đứt gãy hoặc sai lệch hình học."*

#### Bước 6: Demo Rớt mạng đột ngột (Heartbeat Keep-Alive) - 30 giây
1. Đóng đột ngột Tab 1 (hoặc tắt Wi-Fi).
2. Quan sát Tab 2: Sau thời gian Ping/Pong Heartbeat, Server phát hiện ngắt kết nối và gửi bản tin `PLAYER_LEFT`, tự động dọn dẹp avatar của Tab 1.
3. Kết luận:
   > *"Hệ thống kiểm soát vòng đời kết nối bằng cơ chế Heartbeat Ping/Pong 5s, phát hiện sự cố 'rút dây mạng đột ngột' để giải phóng tài nguyên bộ nhớ hệ thống."*

---

## ❓ PHẦN 2: BỘ CÂU HỎI VẤN ĐÁP KINH ĐIỂN & CÂU TRẢ LỜI CHUẨN

### 🔹 Câu 1: Tại sao em lại dùng cả TCP và UDP trong cùng một sản phẩm?
> **Trả lời:**  
> Vì dự án có 2 nhóm dữ liệu với đặc thù đối nghịch nhau:
> - **Nhóm dữ liệu trạng thái (State & Text):** Tọa độ nhân vật, chat, nét vẽ whiteboard, gói tin bắt tay signaling. Nhóm này bắt buộc phải dùng **TCP** (thông qua WebSocket) vì cần tính toàn vẹn 100%, đúng thứ tự (*Reliable & Ordered*). Nếu dùng UDP, nét vẽ sẽ đứt gãy, tọa độ bị giật nhảy (*teleport*).
> - **Nhóm dữ liệu đa phương tiện (Media Stream):** Video camera và tiếng nói micro. Nhóm này bắt buộc phải dùng **UDP** (thông qua WebRTC) vì cần độ trễ cực thấp (*Low Latency < 100ms*). UDP chấp nhận rớt một vài frame hình mà không bị cơ chế truyền lại (*retransmission*) của TCP gây ra hiện tượng *Head-of-Line Blocking* làm giật tiếng.

---

### 🔹 Câu 2: Em giải thích mô hình Kiến trúc Lai (Hybrid Architecture) của đồ án?
> **Trả lời:**  
> Hệ thống kết hợp 2 mô hình mạng:
> 1. **Client-Server (Node.js & Socket.io):** Đóng vai trò xương sống quản lý World State (danh sách người online, tọa độ bản đồ, phân chia room) và đóng vai trò máy chủ **Signaling Broker** điều phối bắt tay.
> 2. **P2P Mesh (WebRTC):** Khi 2–4 người bước vào cùng phòng họp, các máy tự đục lỗ NAT qua STUN và nối thẳng với nhau theo mô hình lưới (*Full Mesh*).
> **Ý nghĩa mạng:** Đạt được giải pháp **Bandwidth Offloading** - loại bỏ hoàn toàn gánh nặng băng thông video/audio nặng nề khỏi máy chủ trung tâm.

---

### 🔹 Câu 3: Kỹ thuật đục lỗ NAT (NAT Traversal) hoạt động như thế nào khi 2 máy ở 2 mạng Wi-Fi khác nhau?
> **Trả lời:**  
> Khi 2 máy nằm sau Router Wi-Fi cá nhân, chúng chỉ có Private IP (192.168.x.x) nên không thể kết nối trực tiếp. Em đã giải quyết bài toán này qua 3 bước:
> 1. **Google STUN Server (`stun:stun.l.google.com:19302`):** Từng Client gửi gói tin tới STUN Server để phát hiện ra **Public IP** và **Public Port** được Router NAT ánh xạ.
> 2. **Signaling qua WebSocket:** Hai Client trao đổi thông tin mô tả phiên kết nối (**SDP Offer/Answer**) và danh sách các ứng viên mạng (**ICE Candidates**) qua máy chủ Node.js.
> 3. **P2P Handshake:** Khi có đủ thông tin địa chỉ công cộng, hai trình duyệt tự "bắt tay" đục lỗ NAT và thiết lập đường ống UDP trực tiếp.

---

### 🔹 Câu 4: Thuật toán Geocasting (Nearby Chat) được hiện thực thế nào?
> **Trả lời:**  
> Thay vì Broadcast gửi cho tất cả mọi người, khi nhận gói tin `CHAT_SEND` với scope `nearby`, Server đọc tọa độ $(x_A, y_A)$ của người gửi trong World State, sau đó tính khoảng cách Euclid:
> $$d(A, B) = \sqrt{(x_B - x_A)^2 + (y_B - y_A)^2}$$
> Server chỉ định tuyến gói tin tới các Socket ID có $d \le 250\text{px}$. Đây là hiện thực hóa của kỹ thuật **Spatial Multicast (Định tuyến theo không gian)** ở tầng ứng dụng.

---

### 🔹 Câu 5: Kỹ thuật Throttling ở Client giải quyết bài toán mạng gì?
> **Trả lời:**  
> Khi người chơi giữ phím di chuyển, vòng lặp game loop render ở 60 FPS. Nếu gửi socket 60 lần/giây cho 50 người cùng di chuyển, Server sẽ phải xử lý $50 \times 60 = 3000\text{ packets/s}$, dẫn đến **Bão gói tin (Packet Flooding)** và làm nghẽn hàng đợi TCP.  
> Thuật toán Throttling ở Client của em giới hạn tần số phát gói tin tối đa **30 lần/giây (30Hz ~ 33ms)**, giúp giảm 50% tải mạng mà mắt người vẫn cảm nhận chuyển động hoàn toàn mượt mà.

---

### 🔹 Câu 6: Làm sao Server phát hiện được trường hợp "Rút dây mạng" hoặc "Sập nguồn"?
> **Trả lời:**  
> Nếu người dùng tắt tab bình thường, trình duyệt sẽ gửi gói tin TCP FIN/RST để đóng kết nối (*Graceful Disconnect*). Nhưng nếu rút dây mạng hoặc sập nguồn, không có gói tin nào được gửi lên (*Silent Disconnection*).  
> Hệ thống giải quyết bằng giao thức **Heartbeat (Ping/Pong)** với chu kỳ 5 giây (`pingInterval: 5000, pingTimeout: 5000`). Nếu sau 5 giây không nhận được gói Pong phản hồi, Server xác định kết nối đã chết, thu hồi socket, xóa avatar khỏi World State và phát tán thông báo `PLAYER_LEFT` cho toàn mạng.

---

## 📋 PHẦN 3: BẢNG TỔNG KẾT CHEAT SHEET (CẦM VÀO PHÒNG BẢO VỆ)

| Tính năng trên Web | Giao thức / Kỹ thuật Mạng sử dụng | Giải quyết bài toán mạng gì? |
| :--- | :--- | :--- |
| **Di chuyển nhân vật 2D** | TCP, WebSocket, Throttling (30Hz) | Bảo đảm tính nhất quán vị trí, chống bão gói tin (*Packet Flooding*). |
| **Phân chia phòng họp, bước vào thảm** | TCP, Application Multicast (Room/Zone) | Cô lập luồng dữ liệu, đa bá theo nhóm đối tượng (*Group Multicast*). |
| **Chat lân cận "Nearby"** | TCP, Spatial Geocasting (Khoảng cách Euclid) | Định tuyến gói tin động dựa trên không gian tọa độ vật lý của người dùng. |
| **Gọi Video/Audio họp nhóm** | UDP, WebRTC, P2P Mesh Topology | Giảm tải băng thông máy chủ trung tâm (*Bandwidth Offloading*), độ trễ $<100\text{ms}$. |
| **Kết nối giữa 2 máy khác mạng Wi-Fi** | Google STUN, NAT Traversal, SDP Signaling | Đục lỗ NAT, vượt tường lửa tìm Public IP/Port và thiết lập liên kết P2P. |
| **Phát hiện người dùng mất mạng** | TCP, Ping/Pong Heartbeat Protocol (5s) | Quản lý vòng đời kết nối, giải phóng tài nguyên bộ nhớ và dọn avatar "ma". |
| **Bảng vẽ chung Whiteboard** | TCP, JSON Serialization & RAM History | Đồng bộ tuần tự các nét vẽ, bảo toàn tính toàn vẹn dữ liệu (*No Packet Loss*). |
| **Lưu trữ dữ liệu bền vững** | JSON Database, RESTful APIs | Quản trị dữ liệu người dùng, cấu hình phòng và lịch sử chat bền vững. |
