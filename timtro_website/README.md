# TìmTrọ UEH

Trang tĩnh cho sinh viên tìm phòng, tìm người ở chung và trò chuyện. GitHub Pages dùng `index.html` ở thư mục gốc; bản chỉnh sửa nằm trong `timtro_website/index.html`. Sau mỗi lần sửa, chạy `node timtro_website/scripts/sync-entry.cjs` từ gốc repository.

## Chạy và kiểm tra

Mở trang qua HTTP server (không dùng `file://`) để Supabase Auth hoạt động ổn định. Kiểm tra cấu trúc và cú pháp bằng `node timtro_website/tests/login.cjs`; kiểm tra luồng trình duyệt bằng `node timtro_website/tests/browser.cjs` (Chrome cài tại đường dẫn mặc định, hoặc truyền `--chrome <đường dẫn>`). Browser test dùng Supabase giả lập trong bộ nhớ, không tạo tài khoản thật.

Logo UEH dùng ảnh do nhóm cung cấp tại `assets/ueh-logo.png`. Trình xem phòng giả tưởng 360° và khu quản lý chủ trọ tiếp tục là phần minh họa cục bộ như trước.

Theo yêu cầu mới, nhập mã OTP và khôi phục mật khẩu bằng OTP được tạm hoãn. Luồng đang dùng email/mật khẩu và xác nhận email qua liên kết, không nhập mã. Bỏ OTP không tự tạo các bảng bài đăng/chat trên dịch vụ.

Browser test kiểm tra 34 tình huống ở mỗi chiều rộng 1440px và 390px: email/mật khẩu, bộ lọc, hồ sơ ẩn/hiện, đăng/sửa/đóng bài, avatar, tin nhắn HTML, tách cuộc chat, đăng xuất và ảnh 360° thay đổi khi xoay. Ảnh chụp và kết quả ở `.qa/`, không commit. Fixture kiểm tra giao diện; chưa chứng minh RLS hoặc SMTP đã hoạt động trên Supabase thật.

## Kích hoạt tài khoản, bài đăng và chat thật

Trang dùng Supabase Auth với publishable key công khai. Cần quyền quản trị dự án Supabase `pkvbmoahccvatxzodaks` để hoàn tất các bước sau:

1. Chạy [`student_roommate_setup.sql`](student_roommate_setup.sql) trong SQL Editor để tạo bảng, view, bucket avatar và Row Level Security. Chạy một lần trên dự án chưa có các đối tượng này.
2. Chạy [`student_auth_hook.sql`](student_auth_hook.sql), rồi bật **Authentication → Hooks → Before User Created** trỏ vào `public.before_ueh_student_created`. Hook chặn đăng ký email ngoài mẫu `ten.mssv@st.ueh.edu.vn` phía máy chủ.
3. Bật **Confirm email** trong Authentication. Cấu hình SMTP gửi được tới `@st.ueh.edu.vn`, cùng Site URL và Redirect URLs cho domain GitHub Pages và môi trường thử nghiệm. Supabase mặc định có giới hạn người nhận khi chưa cấu hình SMTP riêng.
4. Thử hai tài khoản sinh viên UEH thật: đăng ký, xác nhận email, đăng nhập lại, đăng bài, xem bài ở tài khoản thứ hai, nhắn tin hai chiều, tải avatar, sửa/đóng bài, kiểm tra tài khoản thứ ba không đọc được chat. Kiểm tra email sai mẫu và mật khẩu sai bị từ chối.

Không đưa service role key, mật khẩu SMTP hoặc mật khẩu người dùng vào repository. Khi chưa làm các bước trên, phần tài khoản và dữ liệu chung chưa thể hoạt động đầy đủ ở GitHub Pages; giao diện báo lỗi kết nối thay vì giả lập tài khoản thành công.

## Dữ liệu và quyền riêng tư

Hồ sơ công khai tách khỏi số điện thoại/Zalo trong `student_private_profiles`. Bài đăng chỉ sửa được bởi người đăng. Chat chỉ đọc/gửi được bởi hai người trong cuộc hội thoại. Nhãn Room Check chỉ xuất hiện khi có bản ghi thật trong `student_room_checks`; người dùng thường không thể tự ghi bảng này. Ảnh đại diện nằm trong bucket `student-avatars`, theo thư mục ID của chính tài khoản.

Bộ lọc và form đăng bài theo tài liệu `Bo_loc_tim_phong_o_ghep_Nha_Tro_UEH.md`: khu vực/cơ sở UEH, ngân sách theo người, ngày chuyển vào, chỗ trống, giới tính ưu tiên, giờ ngủ, dọn dẹp, thú cưng, tiện nghi và Room Check. Bài đăng có cọc, tiền điện/nước, chia chi phí, khách đến, đồ dùng chung và xác nhận đã được chủ nhà đồng ý. Không công khai địa chỉ phòng cụ thể hoặc ngày sinh đầy đủ.
