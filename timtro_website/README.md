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

Tab Chủ trọ hiển thị đúng hồ sơ và avatar minh họa của người cho thuê; liên kết Zalo chưa được cung cấp sẽ hiển thị trạng thái thiếu. Form quản lý phòng nội bộ hỗ trợ tên, giới thiệu, liên kết HTTPS `zalo.me` và cặp vĩ độ/kinh độ. Khu quản lý thuê trọ là demo dùng chung bộ nhớ trình duyệt như trước, không phải dịch vụ đăng tin công khai và không đặt trong tài khoản sinh viên.

Nút Xem bản đồ mở hộp thoại [OpenStreetMap nhúng](https://wiki.openstreetmap.org/wiki/Export), đúng địa chỉ/ghim của phòng, kèm đường đi và liên kết mở bản đồ. Phòng mẫu ghi Vị trí minh họa; tọa độ người đăng cung cấp chưa được xác minh thực tế. Không có tọa độ thì không dựng ghim tùy ý. Bản đồ cần mạng; ghim bản đồ không chứng minh phòng có thật.

Logo dùng ảnh UEH được cung cấp; màu aurora và trình xem 360° được giữ. Panorama hỗ trợ nhập/xuất ảnh 2048×1024, xoay/zoom và toàn màn hình.

## Giao diện gọn, báo cáo, so sánh và điểm mẫu — 20/10/2026

Chi tiết phòng chia ba tab Tổng quan / Xác thực & đánh giá / Chủ trọ. Chi phí chi tiết mặc định thu gọn; form đăng bài chia ba nhóm và chỉ mở nhóm đầu. Bộ lọc thường dùng nằm ngoài, cơ sở/ngày vào/chỗ trống và điều kiện sinh hoạt nằm trong Bộ lọc nâng cao. Trên mobile, điểm và hành động đặt trước ảnh để không bị đẩy xuống sau nội dung 360°.

**Báo cáo tin đăng:** mở từ chi tiết phòng thuê hoặc bài ở ghép, chọn loại vi phạm, nhập lý do và bằng chứng tin nhắn hoặc tệp. Nhận tối đa 3 JPG/PNG/WebP/PDF, mỗi tệp không quá 5 MB. Lưu cả Blob bằng chứng và nội dung trong IndexedDB `timtro_local_reports_v1`, store `reports`, index `userId`; giao diện chỉ đọc/xóa lịch sử của tài khoản hiện tại. Tài khoản → Báo cáo của tôi cho xem lại, mở/tải bằng chứng hoặc xóa. Đăng xuất dọn nội dung riêng tư khỏi DOM và thu hồi URL Blob.

Đây là **báo cáo demo cục bộ, chưa gửi quản trị viên**; không làm ẩn tin hay trừ điểm. Bộ nhớ trình duyệt không thay thế bảo mật máy chủ; xóa dữ liệu site sẽ xóa lịch sử và tệp.

**So sánh:** chọn 2–3 phòng cùng loại từ thẻ hoặc chi tiết. Giá thuê cả phòng và giá ở ghép mỗi người được tách biệt; đổi loại cần xác nhận xóa lựa chọn cũ. Bảng hiển thị dữ liệu hiện có, thiếu ghi Chưa cung cấp. So sánh ở ghép có sức chứa, người đang ở/chỗ trống, ngày vào và sinh hoạt. Có chỉnh lựa chọn, bỏ phòng, xóa tất cả, lưu/mở/xóa bộ so sánh; quay lại khôi phục danh sách, bộ lọc và vị trí cuộn. Dữ liệu dùng các key localStorage `timtro_compare_selection_v1_<userId>` và `timtro_compare_saved_v1_<userId>`, lưu tham chiếu `{kind,id}` để lấy thông tin phòng hiện tại. Mobile chỉ cuộn ngang bên trong bảng. Bộ đã lưu tự bỏ phòng không còn khả dụng khi mở lại.

**Điểm tin cậy:** số mẫu cố định, độc lập với Room Check. Phòng thuê mẫu 1–6: 92/88/75/35/55/30; sáu bài ở ghép mẫu: 92/88/75/72/55/35. Luôn có nhãn Điểm mô phỏng; bấm điểm để xem giải thích ba nhóm tham chiếu. Chưa có công thức chấm thực tế. Tin người dùng đăng hiển thị —/100 · Chưa chấm điểm. Giữ quy tắc phòng thuê từ 1/3 lớp mới được liệt kê; ở ghép không tự ẩn bài 0/3.

Mã dùng chung nằm trong `assets/room-tools.js` (trạng thái/IndexedDB/dữ liệu so sánh), `assets/room-tools-ui.js` (giao diện và nối luồng hiện có), `assets/room-tools.css`. Không thay đổi API hoặc cấu hình Supabase.

## Chia sẻ phòng — 22/10/2026

Trong Tổng quan của phòng thuê, bấm **Chia sẻ phòng → Sao chép liên kết**. URL chỉ chứa ID phòng, ví dụ `https://schizophren-ia.github.io/UEH_Groupproject/?room=1`; không chứa thông tin tài khoản, nội dung chat/báo cáo, tham số Auth hay fragment hiện tại. Nút được cập nhật theo phòng đang xem. Nếu Clipboard bị chặn, ô liên kết được chọn để sao chép thủ công.

Người nhận mở link trong trình duyệt khác không cần đăng nhập. Chế độ đọc công khai hiển thị đúng ảnh/360°, chi phí, xác thực/đánh giá, hồ sơ chủ trọ và thời điểm xác minh mẫu của phòng; giữ nhãn minh họa. Chỉ mở bản đồ của phòng công khai đang xem. Không tạo tài khoản hoặc phiên giả, không mở chat, báo cáo, so sánh hoặc tài khoản riêng. Bấm Đăng nhập để sử dụng đầy đủ sẽ dùng luồng Auth hiện có và quay về phòng đã chia sẻ khi đăng nhập thành công.

Chỉ phòng thuê mẫu có ít nhất 1/3 lớp được chia sẻ xuyên thiết bị. Tin chỉ lưu cục bộ hiển thị giải thích thay vì tạo link không thể mở ở máy khác. Phòng 0/3, ID sai/trùng/rỗng hoặc không còn công khai hiện **Phòng không còn khả dụng**, không tự mở phòng đầu tiên. Link dùng query string nên không cần cấu hình lại routing GitHub Pages. Mã nằm trong `assets/room-share.js` và `assets/room-share.css`; không thay đổi dữ liệu/backend.

## Kiểm tra

Chạy qua HTTP server/HTTPS, không mở bằng `file://` vì Web Crypto cần secure context (localhost được hỗ trợ).

- `node timtro_website/tests/login.cjs`: IDs, cú pháp JS, auth gate và hai entry đồng bộ.
- `node timtro_website/tests/browser.cjs --demo`: Chrome kiểm tra Auth demo thật và bộ nhớ cục bộ, OTP sai/hết hạn/gửi lại, robot/quy tắc, đăng nhập lại, hai tài khoản/chat riêng, hồ sơ chủ trọ, URL Zalo và bản đồ. Kiểm tra tải lại trang, cuộn chuột ở chiều cao 500px, nút quay lại và tràn ngang ở 1440px/390px.
- `node timtro_website/tests/browser.cjs --tools`: chạy toàn bộ luồng demo cùng báo cáo/Blob IndexedDB, điểm mẫu, so sánh/lưu bộ, tách tài khoản, tải lại trang, tab bằng bàn phím và đóng hộp thoại bằng Escape; chụp ảnh chi tiết, so sánh và lịch sử ở desktop/mobile. Không giả lập logic mật khẩu/OTP hay IndexedDB. Kết quả `.qa/tools-results.json`.
- `node timtro_website/tests/browser.cjs --share`: kiểm tra link công khai không đăng nhập, đúng ID/chi phí/xác thực/chủ trọ, Clipboard thành công hoặc bị chặn, link sai/0 lớp/cục bộ, không tạo phiên, rồi mở URL đã tạo trong browser context riêng không có dữ liệu người gửi và tải lại trang. Hai entry, 1440px/390px; kết quả `.qa/share-results.json`.
- `node timtro_website/tests/browser.cjs`: giữ 45 tình huống/viewport với Supabase fixture, kiểm tra bộ lọc, hồ sơ, tin/chat/avatar và 360°/fullscreen. Không chứng minh RLS/SMTP thật đã hoạt động.

Chrome mặc định `C:/Program Files/Google/Chrome/Application/chrome.exe`; có thể truyền `--chrome <đường dẫn>`. Kết quả và ảnh ở `.qa/`, không commit.

## Chế độ dịch vụ thật chưa kích hoạt đầy đủ

Dùng `?auth=live` để giữ luồng Supabase Auth trước đây: xác nhận email thật qua liên kết. Luồng này tách khỏi OTP demo. Dữ liệu thật vẫn chờ quyền quản trị dự án `pkvbmoahccvatxzodaks`:

1. Chạy `student_roommate_setup.sql` để tạo bảng/view/RLS và bucket avatar.
2. Chạy `student_auth_hook.sql`, bật Before User Created hook `public.before_ueh_student_created` để chặn email ngoài mẫu phía máy chủ.
3. Bật Confirm email, cấu hình SMTP/Site URL/Redirect URLs cho GitHub Pages.
4. Thử hai tài khoản UEH thật: đăng ký, xác nhận, đăng nhập, bài đăng, chat hai chiều và avatar; dùng tài khoản thứ ba kiểm tra không đọc được chat riêng.

Không đưa service role key, mật khẩu SMTP hoặc mật khẩu người dùng vào repository. Quên mật khẩu/OTP email thật vẫn tạm hoãn; đợt này chỉ hoàn tất OTP đăng ký mô phỏng đã được duyệt.
