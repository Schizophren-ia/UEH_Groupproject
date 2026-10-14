# TìmTrọ UEH

Trang tĩnh cho sinh viên tìm phòng và tìm người ở chung. GitHub Pages dùng `index.html` ở gốc; nguồn chỉnh sửa nằm trong `timtro_website/index.html`. Chạy `node timtro_website/scripts/sync-entry.cjs` sau khi sửa.

## Chế độ demo đã duyệt

Mặc định dùng tài khoản demo cục bộ, theo yêu cầu OTP mô phỏng ngày 14/10/2026:

1. Chọn Đăng ký, nhập tên, email `ten.mssv@st.ueh.edu.vn`, mật khẩu và xác nhận mật khẩu.
2. Đồng ý quy tắc cộng đồng và hoàn thành câu hỏi Tôi không phải robot demo.
3. Xem mã trong **Hộp thư mô phỏng**, nhập đúng 6 chữ số để hoàn tất đăng ký. Không gửi email thật. OTP hết hạn sau 5 phút, tối đa 5 lần nhập sai; Gửi lại tạo mã mới.
4. Đăng nhập bằng email và mật khẩu vừa đăng ký, cùng kiểm tra robot demo. Tải lại trang giữ phiên trong tab; đăng xuất rồi đăng nhập lại vẫn dùng được tài khoản trên cùng trình duyệt.

Tài khoản được lưu bằng salt và PBKDF2-SHA256 (120.000 vòng), không lưu mật khẩu rõ. Đây là mô phỏng ở trình duyệt, không phải cơ chế xác minh email/CAPTCHA máy chủ. Xóa bộ nhớ trình duyệt sẽ xóa tài khoản và dữ liệu demo. Không dùng mật khẩu email thật.

Hồ sơ, bài đăng ở ghép và chat demo cũng lưu cục bộ, không chia sẻ giữa thiết bị. Có thể thử hai tài khoản lần lượt trên cùng trình duyệt; chỉ người trong cuộc chat thấy tin qua giao diện. Số điện thoại/Zalo riêng không xuất hiện trong hồ sơ công khai. Bộ nhớ trình duyệt không phải ranh giới bảo mật máy chủ.

## Thuê trọ, liên hệ và bản đồ

Chi tiết phòng và trang Liên hệ hiển thị đúng hồ sơ chủ trọ. Phòng mẫu có tên/avatar chữ minh họa; liên kết Zalo chưa được cung cấp sẽ hiển thị trạng thái thiếu. Qua **Tài khoản → Quản lý phòng demo**, có thể nhập tên, giới thiệu, liên kết HTTPS `zalo.me` và cặp vĩ độ/kinh độ của phòng. Khu quản lý thuê trọ là demo dùng chung bộ nhớ trình duyệt như trước, không phải dịch vụ đăng tin công khai.

Nút Xem bản đồ mở hộp thoại [OpenStreetMap nhúng](https://wiki.openstreetmap.org/wiki/Export), đúng địa chỉ/ghim của phòng, kèm đường đi và liên kết mở bản đồ. Phòng mẫu ghi Vị trí minh họa; tọa độ người đăng cung cấp chưa được xác minh thực tế. Không có tọa độ thì không dựng ghim tùy ý. Bản đồ cần mạng; ghim bản đồ không chứng minh phòng có thật.

Logo dùng ảnh UEH được cung cấp; màu aurora và trình xem 360° được giữ. Panorama hỗ trợ nhập/xuất ảnh 2048×1024, xoay/zoom và toàn màn hình.

## Kiểm tra

Chạy qua HTTP server/HTTPS, không mở bằng `file://` vì Web Crypto cần secure context (localhost được hỗ trợ).

- `node timtro_website/tests/login.cjs`: IDs, cú pháp JS, auth gate và hai entry đồng bộ.
- `node timtro_website/tests/browser.cjs --demo`: Chrome kiểm tra Auth demo thật và bộ nhớ cục bộ, OTP sai/hết hạn/gửi lại, robot/quy tắc, đăng nhập lại, hai tài khoản/chat riêng, hồ sơ chủ trọ, URL Zalo và bản đồ. Kiểm tra tải lại trang, cuộn chuột ở chiều cao 500px, nút quay lại và tràn ngang ở 1440px/390px.
- `node timtro_website/tests/browser.cjs`: giữ 45 tình huống/viewport với Supabase fixture, kiểm tra bộ lọc, hồ sơ, tin/chat/avatar và 360°/fullscreen. Không chứng minh RLS/SMTP thật đã hoạt động.

Chrome mặc định `C:/Program Files/Google/Chrome/Application/chrome.exe`; có thể truyền `--chrome <đường dẫn>`. Kết quả và ảnh ở `.qa/`, không commit.

## Chế độ dịch vụ thật chưa kích hoạt đầy đủ

Dùng `?auth=live` để giữ luồng Supabase Auth trước đây: xác nhận email thật qua liên kết. Luồng này tách khỏi OTP demo. Dữ liệu thật vẫn chờ quyền quản trị dự án `pkvbmoahccvatxzodaks`:

1. Chạy `student_roommate_setup.sql` để tạo bảng/view/RLS và bucket avatar.
2. Chạy `student_auth_hook.sql`, bật Before User Created hook `public.before_ueh_student_created` để chặn email ngoài mẫu phía máy chủ.
3. Bật Confirm email, cấu hình SMTP/Site URL/Redirect URLs cho GitHub Pages.
4. Thử hai tài khoản UEH thật: đăng ký, xác nhận, đăng nhập, bài đăng, chat hai chiều và avatar; dùng tài khoản thứ ba kiểm tra không đọc được chat riêng.

Không đưa service role key, mật khẩu SMTP hoặc mật khẩu người dùng vào repository. Quên mật khẩu/OTP email thật vẫn tạm hoãn; đợt này chỉ hoàn tất OTP đăng ký mô phỏng đã được duyệt.
