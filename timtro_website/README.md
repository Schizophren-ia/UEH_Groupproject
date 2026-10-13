# TìmTrọ — prototype dành cho sinh viên UEH

Phiên bản ngày 14/10/2026 triển khai A, C, D, E, F theo phương án đã được duyệt. **Giữ đăng nhập demo và không triển khai B** theo yêu cầu mới nhất: Log In / Sign Up vẫn chấp nhận dữ liệu bất kỳ hoặc để trống. Đây không phải hệ thống xác thực tài khoản thật.

## Chạy website

Mở `timtro_website/index.html` hoặc phục vụ thư mục repository bằng một HTTP server. GitHub Pages dùng `index.html` ở thư mục gốc. Hai entry giống nhau về chức năng, chỉ khác đường dẫn assets. Sau khi sửa entry trong `timtro_website`, chạy:

```powershell
node timtro_website/scripts/sync-entry.cjs
```

## Chức năng trong đợt này

- **Hồ sơ và nhu cầu:** ngân sách mỗi người, khu vực/cơ sở học, số người, ngày chuyển vào, giờ ngủ, độ yên tĩnh, dọn dẹp, hút thuốc, thú cưng, khách và chia chi phí. Câu trả lời dùng để tính tỷ lệ khớp với phòng mẫu, không phải đánh giá con người. Bộ câu hỏi là phương án đã đề xuất; chưa nhận được bảng câu hỏi gốc để đối chiếu.
- **Quyền riêng tư:** hiện/ẩn trường liên hệ khi nhập, chọn hiện/ẩn liên hệ, cơ sở/năm học và câu trả lời trên hồ sơ; có xem trước. Các tùy chọn áp dụng sau khi lưu. Không đặt thông tin riêng tư trong phần giới thiệu công khai.
- **Tìm bạn ở ghép:** sáu phòng mẫu đều có người đang ở và còn chỗ trống. Lọc tổng sức chứa 2/3/4 người, giá tối đa mỗi người, khu vực, giờ ngủ, hút thuốc và thú cưng. Có lưu phòng và lọc phòng đã lưu.
- **Đăng phòng:** sinh viên lưu hồ sơ rồi tạo bài đăng demo với tổng sức chứa, số người đang ở và giá mỗi người. Chỉ chấp nhận phòng có ít nhất một người đang ở và ít nhất một chỗ trống. Có gỡ/chỉnh bài của mình.
- **Quan tâm và chat:** bấm Quan tâm mở ngay khung chat với đúng người đăng. Mỗi phòng có một luồng riêng; hồ sơ, bài đăng, phòng đã lưu, quan tâm và tin nhắn được giữ sau khi tải lại trang. Không tạo phản hồi giả từ người nhận.
- **360°:** phòng giả tưởng có hai giường, bàn học, laptop, tủ, cửa sổ và cửa ra vào. Kéo/chạm hoặc phím mũi tên để xoay; nút +/− và con lăn để zoom. Có toàn màn hình, đặt lại và xuất panorama PNG 2048×1024. Có thể mở ảnh panorama equirectangular tỷ lệ 2:1 từ camera 360° (JPG/PNG/WebP, tối đa 12 MB). Ảnh mở theo từng phòng và chỉ giữ trong phiên hiện tại.
- **Giao diện:** aurora/mesh gradient với `#F8F7FF`, `#FFEEDD`, `#FFD8BE`, `#B8B8FF`, `#9381FF`. Màu chữ và nút được chọn đậm hơn để dễ đọc. Responsive, focus bàn phím, giảm hiệu ứng theo `prefers-reduced-motion` và modal hỗ trợ Escape/Tab.

## Kiểm tra

Kiểm tra tĩnh, không cần cài dependency:

```powershell
node timtro_website/tests/login.cjs
```

Kiểm tra hành vi bằng Chrome/Edge và Puppeteer Core:

```powershell
# Cài Puppeteer Core bằng package manager của bạn nếu chưa có.
$env:CHROME_PATH = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
node timtro_website/tests/browser.cjs
```

Test cũng nhận `--chrome <đường-dẫn>` và `--module <đường-dẫn-module-ESM>` nếu Puppeteer có sẵn trong bộ công cụ. Test dùng profile Chrome riêng trong `.qa`, chặn các request ra ngoài và xóa dữ liệu của profile kiểm thử trước khi chạy; không chạm dữ liệu trình duyệt thường dùng. Ảnh chụp, panorama xuất và kết quả JSON nằm trong `.qa/`, được bỏ qua bởi Git. Bộ test kiểm tra đăng nhập demo, lọc phòng, hiện/ẩn liên hệ, chat độc lập và lưu sau refresh, đăng phòng, xoay/zoom 360°, import/export panorama, toàn màn hình, các chiều rộng 375/390/768/1024/1440 và hai entry.

## Giới hạn demo

Hồ sơ, tin đăng và tin nhắn chỉ lưu ở trình duyệt này, chưa chia sẻ với người thật hoặc thiết bị khác. Tùy chọn ẩn thông tin là hành vi giao diện demo; người có quyền truy cập thiết bị vẫn có thể đọc localStorage. Phòng mẫu và phòng 360° là minh họa, không chứng minh tình trạng hay kích thước của phòng thực tế. Viewer cần WebGL. Bảng Supabase cũ trong `roommate_setup.sql` được giữ nguyên, không triển khai hoặc sửa dữ liệu dịch vụ trong đợt này. OTP, điều kiện email UEH và tài khoản thật thuộc B, được hoãn theo yêu cầu.

## Nguồn thiết kế và ảnh

Tham khảo hướng dẫn accessibility, touch targets, focus, responsive và giảm chuyển động của [UI UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill). Áp dụng bảng màu người dùng cung cấp và hướng dẫn tổng quát; không tuyên bố đã chạy Design System Generator của repo đó. Bốn ảnh phòng được tải cục bộ từ các URL Unsplash vốn có trong website:

- [Ảnh phòng 1](https://images.unsplash.com/photo-1616486338812-3dadae4b4ace).
- [Ảnh phòng 2](https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a).
- [Ảnh phòng 3](https://images.unsplash.com/photo-1615874694520-474822394e73).
- [Ảnh phòng 4](https://images.unsplash.com/photo-1618221195710-dd6b41faaea6).

Shader và trình xem 360° được xây dựng bằng WebGL, không cần thư viện 3D hay tải ảnh giả tưởng từ dịch vụ ngoài.
