# Kế hoạch và nhật ký phát triển TìmTrọ

## Workflow đã thống nhất

1. Người dùng nêu yêu cầu.
2. Trình bày hướng phát triển, ý tưởng chi tiết và cách triển khai.
3. Người dùng duyệt hoặc chốt lại phạm vi.
4. Triển khai và kiểm tra.
5. Thông báo kết quả.
6. Cập nhật GitHub: https://github.com/Schizophren-ia/UEH_Groupproject.
7. Cập nhật những việc đã làm trong file này.

## 2026-10-13 — Giao diện đăng nhập dành cho sinh viên thuê trọ

Phạm vi người dùng chốt: chỉ giữ giao diện sinh viên thuê trọ; bỏ màn hình chọn Tenant/Landlord, nút quay lại chọn vai trò và nút đổi vai trò. Giữ Log In/Sign Up và thêm “Forgot Password?” chỉ để hiển thị.

- [x] Mở website trực tiếp tại Log In; ẩn nội dung ứng dụng trong lúc chờ xác thực.
- [x] Giữ giao diện hai tab Log In/Sign Up, nhận trạng thái bằng bàn phím/công nghệ hỗ trợ và cuộn form trên màn hình thấp.
- [x] Giữ đăng nhập email/mật khẩu, đăng ký username/email/mật khẩu và xác minh OTP bằng Supabase.
- [x] Giữ điều kiện email sinh viên `@st.ueh.edu.vn`.
- [x] Thêm “Forgot Password?” chỉ trên Log In, không có hành động hoặc yêu cầu đặt lại mật khẩu.
- [x] Xóa màn hình chọn vai trò, các nút quay lại/đổi vai trò và logic ghi nhớ vai trò.
- [x] Xóa dashboard, menu, CSS và thao tác quản lý phòng của chủ trọ; dữ liệu demo cũ vẫn có thể được đọc trong luồng tìm phòng và không bị xóa khỏi trình duyệt.
- [x] Khôi phục phiên sinh viên hợp lệ vào trang chủ; đăng nhập hoặc xác minh email thành công vào trang chủ; đăng xuất quay lại Log In và xóa mật khẩu/OTP khỏi form.
- [x] Cập nhật README theo giao diện sinh viên.
- [x] Thêm kiểm tra chạy bằng `node tests/login.cjs`: cú pháp script, ID HTML, đăng nhập đầu tiên kể cả vai trò host cũ, đổi tab, đăng ký, OTP, gửi lại OTP, đăng nhập, khôi phục phiên, đăng xuất và các lỗi dịch vụ.
- [x] Kiểm tra tự động đạt với DOM và Supabase giả lập. Không gửi email, tạo tài khoản hoặc thay đổi dữ liệu Supabase thật.
- [ ] Cập nhật source lên GitHub — bị chặn: repo đang trống; kết nối hiện tại báo `push: false` và GitHub từ chối yêu cầu tạo README với lỗi HTTP 403 `Resource not accessible by integration`. Chưa có file hoặc commit nào được ghi lên repo. Kiểm tra bổ sung xác nhận kết nối GitHub đang dùng tài khoản `Nashitaz13` và installation cũng thuộc `Nashitaz13`; repo đích thuộc `Schizophren-ia`. Cần kết nối đúng tài khoản có quyền ghi Contents vào `Schizophren-ia/UEH_Groupproject` để tiếp tục.

Giới hạn kiểm tra: môi trường không có công cụ xem/điều khiển trình duyệt; chưa xác nhận hiển thị trực tiếp trên desktop/mobile hoặc email OTP từ Supabase thật. Tính năng tìm phòng, thông tin chủ trọ để sinh viên liên hệ, yêu thích và tìm bạn cùng phòng vẫn được giữ.

Các file: `index.html`, `README.md`, `tests/login.cjs`, `plan.md`. `roommate_setup.sql` được giữ nguyên.
