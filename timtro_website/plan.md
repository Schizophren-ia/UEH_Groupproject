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

## 2026-10-14 — Đề xuất A–F, chờ người dùng duyệt

Trạng thái: đã kiểm tra mã nguồn và ảnh bảng màu; chưa triển khai thay đổi chức năng. Tiếp tục tuân thủ workflow trình bày phương án → người dùng duyệt → triển khai → kiểm tra → cập nhật GitHub → báo cáo và cập nhật nhật ký.

### Bằng chứng hiện tại

- `index.html` ở thư mục gốc và `timtro_website/index.html` đều tồn tại; cần đồng bộ bản được GitHub Pages phục vụ khi triển khai.
- Form đăng nhập hiện bật `prototypeMode` và cho phép dữ liệu bất kỳ hoặc để trống. README cũng mô tả chế độ bypass; các mục hoàn thành ngày 13/10 không chứng minh trạng thái hiện tại.
- Tìm bạn cùng phòng hiện hiển thị hồ sơ cá nhân và mở chat sau khi kết nối hai chiều; chưa đáp ứng luồng bài đăng phòng có người ở sẵn và nút Quan tâm mở chat ngay.
- Có schema Supabase trong `roommate_setup.sql`; cần kiểm tra triển khai thực tế và bổ sung kiểm soát quyền đọc thông tin riêng tư, bài đăng và hội thoại.
- Đã đọc ảnh bảng màu: Ghost White `#F8F7FF`, Antique White `#FFEEDD`, Peach Fuzz `#FFD8BE`, Periwinkle `#B8B8FF`, Soft Periwinkle `#9381FF`.
- Chưa tìm thấy bảng câu hỏi trong workspace; cần người dùng cung cấp để đối chiếu đúng nội dung.
- Remote Git hiện trỏ tới `https://github.com/Schizophren-ia/UEH_Groupproject.git`. Git không có trong PATH; công cụ GitHub hiện trả lỗi Unknown tool khi đọc repo. Chưa xác minh được quyền push hiện tại; không dùng ghi chú lỗi cũ làm bằng chứng cho quyền hiện tại.

### Phương án cần duyệt

- [ ] A: bổ sung câu hỏi nhu cầu ở ghép (ngân sách mỗi người, khu vực/cơ sở học, ngày chuyển vào, số người, giờ sinh hoạt, độ yên tĩnh, vệ sinh, hút thuốc, thú cưng, khách tới chơi, chia chi phí); đối chiếu bảng gốc khi nhận được. Cho phép chủ hồ sơ hiện/ẩn thông tin liên hệ và thông tin quan trọng; thực thi quyền đọc ở cơ sở dữ liệu.
- [ ] B: khôi phục xác thực Supabase, kiểm tra email theo dạng `ten.mssv@st.ueh.edu.vn`, xác minh email, đăng nhập lại và khôi phục phiên. Quên mật khẩu theo luồng email → OTP → mật khẩu mới; cần kiểm tra cấu hình email và OTP thực tế.
- [ ] C: bài đăng phòng đang có người ở, tổng sức chứa 2/3/4 người, số người hiện tại và số chỗ trống; lọc theo tổng số người, ngân sách mỗi người và nhu cầu. Quan tâm mở hội thoại riêng với người đăng, lưu tin nhắn trực tuyến với quyền truy cập dành cho người tham gia.
- [ ] D: tích hợp trình xem ảnh toàn cảnh 360 trong chi tiết phòng; hỗ trợ kéo xoay, zoom và toàn màn hình, đồng thời tạo phòng giả tưởng 360 và ghi rõ là minh họa.
- [ ] E: giao diện aurora/mesh gradient theo bảng màu, nền sáng và chữ đủ tương phản, bố cục hướng sinh viên, nhãn tiếng Việt, responsive. Tham khảo `https://github.com/nextlevelbuilder/ui-ux-pro-max-skill` theo yêu cầu.
- [ ] F: xử lý overlay và nội dung chồng lấn, điều hướng, trạng thái tải/lỗi/rỗng, các nút và luồng đăng nhập; cập nhật kiểm tra phù hợp với yêu cầu mới.
- [ ] Kiểm tra toàn bộ A–F, ghi rõ phạm vi đã kiểm chứng và phần còn phụ thuộc dịch vụ ngoài.
- [ ] Commit/push lên GitHub, xác minh commit từ remote và cập nhật nhật ký kết quả.

Mục tiêu thời gian do người dùng yêu cầu: 2 giờ. Chưa cam kết email OTP, chat thực tế hoặc push hoàn thành khi chưa xác minh quyền và cấu hình các dịch vụ liên quan.

### Kiểm tra bổ sung trước triển khai — 2026-10-14

- Đã tìm thấy Git dùng được tại `C:/Users/Admin/AppData/Local/GitHubDesktop/app-3.6.4/resources/app/git/cmd/git.exe`.
- Đã xác minh bằng `git ls-remote --heads origin`: remote có nhánh `main` tại commit `e45542a5b98b4ce0c7d8de6bb1dc36538e10d1f3`, trùng HEAD local. Repository hiện có commit; ghi chú repo trống ngày 13/10 không còn mô tả trạng thái hiện tại. Đọc remote thành công chưa chứng minh quyền push.
- `git status --short` chỉ ghi nhận `timtro_website/plan.md` thay đổi; mã nguồn chức năng chưa sửa trong giai đoạn chờ duyệt này.
- Hai bản `index.html` hiện giống nhau. Workflow `.github/workflows/static.yml` phục vụ toàn bộ thư mục gốc; khi triển khai phải giữ entry ở gốc tương ứng với bản `timtro_website`.
- Phân tích HTML không phát hiện ID trùng; cả hai inline script đều có cú pháp JavaScript hợp lệ. Đây là kiểm tra tĩnh, chưa chứng minh hành vi hoặc bố cục trên trình duyệt.
- `node tests/login.cjs` thất bại ngay tại kiểm tra loại bỏ role/host cũ, dòng 77. Test cũng chỉ lấy inline script đầu tiên, hiện là script xóa dữ liệu demo, nên không bao phủ script ứng dụng hiện tại. Cần cập nhật harness và các trường hợp kiểm tra theo yêu cầu A–F khi phương án được duyệt.
- Kiểm tra mã nguồn chưa thấy API khôi phục mật khẩu, trình xem panorama 360 hay trường sức chứa tương ứng bộ lọc 2/3/4 người; vẫn thấy `prototypeMode=true` trong luồng đăng nhập.
- Chưa có phản hồi duyệt phương án trong hội thoại; chưa nhận bảng câu hỏi gốc. Tiếp tục chờ duyệt trước khi thay đổi chức năng theo workflow người dùng yêu cầu.

### Trạng thái chờ đầu vào

Sau ba lượt làm việc, điều kiện duyệt trước khi triển khai vẫn chưa được đáp ứng. Mục tiêu A–F được giữ nguyên, chưa hoàn thành; chuyển trạng thái mục tiêu sang `blocked` để chờ phản hồi duyệt từ người dùng. Chỉ `plan.md` có thay đổi; chưa sửa chức năng và chưa push. Bảng câu hỏi gốc cũng chưa có trong workspace. Khi người dùng duyệt, tiếp tục triển khai từ phương án và kết quả kiểm tra đã ghi ở trên.

## 2026-10-14 — Triển khai A, C, D, E, F; giữ đăng nhập demo

Người dùng đã duyệt: “Tạm thời giữ đăng nhập demo, không sửa B, duyệt làm các phương án còn lại”. Phạm vi đợt này được cập nhật theo lời duyệt đó; không triển khai email UEH, OTP hay tài khoản thật. Ngừng trạng thái chờ duyệt, tiến hành chỉnh sửa và kiểm tra.

### Kết quả triển khai

- [x] **A:** thêm bộ câu hỏi đã đề xuất: ngân sách mỗi người, cơ sở/khu vực, tổng số người, ngày chuyển vào, giờ ngủ, độ yên tĩnh, dọn dẹp, hút thuốc, thú cưng, khách và chia chi phí. Dùng câu trả lời để tính tỷ lệ khớp nhu cầu với phòng. Chưa nhận bảng câu hỏi gốc; chưa tuyên bố đã đối chiếu với bản gốc.
- [x] **A:** hiện/ẩn thông tin liên hệ đang nhập; chọn hiện/ẩn liên hệ, cơ sở/năm học, câu trả lời nhu cầu và toàn bộ hồ sơ; có xem trước hồ sơ người khác sẽ thấy. Trường riêng tư không được đưa vào DOM của hồ sơ xem trước khi bị ẩn. Lưu tùy chọn vào trình duyệt.
- [x] **C:** thay danh sách hồ sơ cá nhân bằng sáu bài đăng phòng đang có người ở và còn chỗ. Tổng sức chứa 2/3/4 người; hiển thị số người hiện có, số chỗ trống và giá mỗi người. Lọc sức chứa, giá, khu vực, giờ ngủ, hút thuốc, thú cưng và phòng đã lưu.
- [x] **C:** sinh viên có hồ sơ được tạo bài đăng demo, kiểm tra phòng đã có ít nhất một người và chưa đầy; hỗ trợ gỡ/chỉnh bài của mình. Quan tâm mở ngay chat với đúng người đăng, không yêu cầu kết nối hai chiều. Chat và lượt quan tâm tách theo phòng, không tạo phản hồi giả từ người nhận, không bị xóa khi tải lại trang.
- [x] **D:** thêm viewer WebGL trong chi tiết phòng, phòng giả tưởng có hai giường, bàn học/laptop, tủ, cửa sổ và cửa ra vào. Kéo/chạm hoặc bàn phím để xoay 360°, zoom, đặt lại và toàn màn hình có nút thoát. Xuất panorama PNG 2048×1024 và mở ảnh camera 360° tỷ lệ 2:1, tối đa 12 MB. Ảnh nhập tách theo phòng và giữ trong phiên; ghi rõ phòng giả tưởng không phải ảnh thực tế.
- [x] **E:** aurora/mesh gradient theo đúng năm màu đã đọc; màu chữ/nút đậm hơn để dễ đọc, thẻ phòng rõ ràng, form dùng details để giảm tải, menu mobile có 5 mục và hỗ trợ reduced motion. Đọc và áp dụng hướng dẫn tổng quát từ UI UX Pro Max; không tuyên bố chạy Design System Generator. Bốn ảnh phòng vốn được tham chiếu từ Unsplash đã được tải vào assets để chạy ổn định.
- [x] **F:** sửa lỗi `$().forEach` làm dừng khởi tạo và khiến trang chủ không có phòng; bỏ event listener role bị lặp. Điều hướng chỉ ẩn section cấp trang để viewer 360° không bị ẩn nhầm. Sửa CSS cũ làm ẩn menu ở ghép trên mobile và backdrop-filter khiến thanh menu cố định bị neo vào header. Thêm nút thoát demo sử dụng handler vốn có. Giữ nguyên đoạn xử lý submit đăng nhập demo, đã so sánh trực tiếp với HEAD ban đầu.
- [x] Đồng bộ hai entry bằng `scripts/sync-entry.cjs`; root dùng đường dẫn assets tương ứng GitHub Pages. Cập nhật README; thay test cũ không tương thích bằng kiểm tra tĩnh và test hành vi trên Chrome. Giữ nguyên `roommate_setup.sql`, không sửa cơ sở dữ liệu Supabase.

### Bằng chứng kiểm tra

- `node tests/login.cjs`: PASS — ID duy nhất, cú pháp script, paths/đồng bộ hai entry, bảng màu, reduced motion và giữ hợp đồng đăng nhập demo. Test không chứng minh hành vi chạy thực tế; phần đó do browser test kiểm tra.
- `node tests/browser.cjs --module <Puppeteer đã cài trong bộ công cụ> --chrome <Chrome đã cài>`: PASS trên Chrome headless với WebGL. Kiểm tra đăng nhập rỗng và dữ liệu bất kỳ, bộ lọc 2/3/4, ngân sách/khu vực, lưu phòng, hiện/ẩn liên hệ/cơ sở/câu trả lời, chống thực thi HTML trong chat, chat riêng từng phòng, giữ dữ liệu sau refresh, đăng phòng, quay/zoom 360°, export/import panorama, vào/thoát fullscreen, tài khoản/thoát demo và entry root.
- Kiểm tra chiều rộng **375, 390, 768, 1024, 1440 px**: không cuộn ngang; menu ở ghép có thể dùng; menu mobile trong viewport; chat mobile trong viewport. Không có lỗi JavaScript được browser ghi nhận.
- Đã xem ảnh chụp desktop trang chủ/ở ghép/360° và mobile ở ghép/chat. Ảnh cùng kết quả JSON ở `.qa/` (không commit). Browser test chặn mạng ngoài; không gửi tin nhắn/email thật hoặc thay đổi dữ liệu dịch vụ.
- `git diff --check`: đạt. Remote `main` trước push là `e45542a5b98b4ce0c7d8de6bb1dc36538e10d1f3`, trùng commit nền local.
- [ ] Commit/push và xác minh SHA trên GitHub — thực hiện sau báo cáo kiểm tra này; kết quả được ghi bổ sung bên dưới khi remote xác nhận.

### Giới hạn của phạm vi đã duyệt

Đăng nhập, hồ sơ, bài đăng và chat là demo cục bộ; chưa có trao đổi với người thật hoặc đồng bộ thiết bị. Quyền riêng tư trong đợt này là hành vi hiển thị, không thay thế kiểm soát truy cập máy chủ. Bộ câu hỏi theo phương án đã duyệt, còn cần bảng gốc để đối chiếu sau này. Ảnh panorama người dùng mở chỉ tồn tại trong phiên; viewer cần WebGL. B được hoãn theo lời người dùng, không tính là tính năng đã hoàn thành.
