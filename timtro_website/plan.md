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
- [x] Commit/push và xác minh SHA trên GitHub: commit triển khai `585f91147d5afeec19515d73d074cea52a3eefa0` đã push thành công lên `origin/main`. `git ls-remote --heads origin main` trả đúng SHA đó, trùng HEAD local. Commit báo cáo tiếp theo chỉ cập nhật nhật ký kết quả này.

### Giới hạn của phạm vi đã duyệt

Đăng nhập, hồ sơ, bài đăng và chat là demo cục bộ; chưa có trao đổi với người thật hoặc đồng bộ thiết bị. Quyền riêng tư trong đợt này là hành vi hiển thị, không thay thế kiểm soát truy cập máy chủ. Bộ câu hỏi theo phương án đã duyệt, còn cần bảng gốc để đối chiếu sau này. Ảnh panorama người dùng mở chỉ tồn tại trong phiên; viewer cần WebGL. B được hoãn theo lời người dùng, không tính là tính năng đã hoàn thành.

Liên kết commit triển khai: https://github.com/Schizophren-ia/UEH_Groupproject/commit/585f91147d5afeec19515d73d074cea52a3eefa0. Đợt chỉnh sửa demo A/C/D/E/F đã được push; trạng thái triển khai GitHub Pages chưa được kiểm chứng riêng, không dùng kết quả push để tuyên bố hosting đã deploy thành công.

## 2026-10-14 — Đề xuất đợt kế tiếp, chờ duyệt

Người dùng đã gửi `Bo_loc_tim_phong_o_ghep_Nha_Tro_UEH.md` và ảnh `ueh-removebg-preview.png`, đồng thời yêu cầu sửa logo, thêm avatar hai bên chat, mở rộng đăng bài và thay đăng nhập demo bằng tài khoản UEH thật. Đây là thay đổi phạm vi so với quyết định tạm giữ đăng nhập demo ở đợt trước; ưu tiên yêu cầu mới nhất. Theo workflow đã thống nhất, chưa thay đổi chức năng ở bước đề xuất này.

### Phương án cụ thể

1. **Logo:** đưa ảnh PNG được cung cấp vào assets, thay các chữ SVG UEH tự dựng ở header và màn hình tài khoản, đặt khung và kích thước phù hợp desktop/mobile để thấy trọn cả chữ `UNIVERSITY`; có alt text và kiểm tra hiển thị thực tế.
2. **Bộ lọc tìm phòng:** dùng đúng sáu tiêu chí cơ bản trong tài liệu: khu vực/gần cơ sở UEH, ngân sách mỗi người, ngày có thể chuyển vào, số chỗ còn cần tuyển (1/2/3+), giới tính ưu tiên và Room Check chỉ khi có dữ liệu xác minh. Nhóm nâng cao: giờ ngủ, dọn dẹp, thú cưng và tiện ích. Giữ thêm lọc tổng sức chứa 2/3/4 từ yêu cầu đã duyệt trước. Đối chiếu từng câu hỏi và trạng thái lọc với bài đăng thật.
3. **Bài đăng phòng:** form cho sinh viên đang có phòng nhập số người đang ở/số chỗ trống, giá mỗi người và các khoản khác riêng, ngày nhận người, giới tính ưu tiên, giờ giấc, dọn dẹp, thú cưng, xác nhận của chủ trọ, tiện ích, tiền cọc, khách đến chơi và đồ dùng chung. Kiểm tra số liệu hợp lệ, chỉ hiển thị phòng đã có người và còn chỗ. Nếu phòng có dữ liệu Room Check thật thì mới hiện huy hiệu; không gắn huy hiệu xác minh người đăng.
4. **Hồ sơ cá nhân:** thêm độ tuổi, ngành học và thông tin tùy chọn quê quán/sở thích/thói quen nấu ăn theo tài liệu; giữ quyền hiện/ẩn từng nhóm thông tin và xem trước. Không yêu cầu ngày sinh đầy đủ hay công khai địa chỉ phòng cụ thể.
5. **Chat:** thêm avatar của tài khoản đang nhắn và người đăng vào tiêu đề, danh sách hội thoại và cạnh bong bóng tin nhắn; ảnh mặc định dùng ký tự tên khi chưa có ảnh. Khi chuyển sang tài khoản thật, hồ sơ, ảnh, bài đăng và chat cần lưu dùng chung qua Supabase với chính sách quyền đọc/ghi phù hợp, thay vì một `localStorage` cho mọi tài khoản.
6. **Đăng nhập:** màn đầu chỉ chọn **Đăng nhập** hoặc **Đăng ký**; màn sau mới hiển thị form tương ứng và nút quay lại. Đăng ký nhập email dạng `ten.mssv@st.ueh.edu.vn`, mật khẩu và nhập lại mật khẩu; đối chiếu hai mật khẩu, xử lý lỗi rõ ràng. Dùng Supabase Auth để tạo tài khoản, xác minh quyền sở hữu email và đăng nhập lại bằng `signInWithPassword`. Kiểm tra định dạng ở giao diện **và** chặn đăng ký ngoài chuẩn UEH bằng Auth Hook phía Supabase; chặn phiên email ngoài chuẩn vào web. Xóa lối vào bằng dữ liệu bất kỳ. Cần cấu hình gửi email xác nhận, redirect và hook cho dự án Supabase; mã giao diện một mình không thể đảm bảo toàn bộ quy tắc này.
7. **Kiểm tra & phát hành:** kiểm tra đăng ký, xác nhận email và đăng nhập lại với tài khoản thử; kiểm tra sai email/mật khẩu, trùng tài khoản, khôi phục phiên và đăng xuất, phân quyền bài đăng/chat, responsive và logo; cập nhật README, test và `plan.md`, commit/push GitHub, xác minh SHA remote. Không ghi mật khẩu hoặc mã bí mật vào repository.

### Bằng chứng trạng thái hiện tại

- Worktree sạch ở HEAD `a498302`; chưa có mã nguồn mới của đợt này.
- Tài liệu gốc đã đọc tại `C:/Users/Admin/Downloads/Bo_loc_tim_phong_o_ghep_Nha_Tro_UEH.md`; các câu trong đó được dùng như dữ liệu yêu cầu người dùng dẫn chiếu, không phải chỉ dẫn hệ thống hoặc quyền thay đổi ngoài phạm vi yêu cầu.
- Ảnh PNG được cung cấp tồn tại tại `C:/Users/Admin/Downloads/ueh-removebg-preview.png`; header và màn đăng nhập hiện dùng SVG chữ thủ công.
- Form đăng nhập hiện có `prototypeMode=true`, cho qua email/mật khẩu bất kỳ; chat và bài đăng lưu ở `localStorage`.
- Tài liệu Supabase hiện hành xác nhận `signUp`/`signInWithPassword`, email confirmation và Auth Hook giới hạn domain/định dạng. Dịch vụ email mặc định của Supabase hạn chế địa chỉ người nhận; cần kiểm tra cấu hình SMTP trước khi tuyên bố email UEH thật hoạt động.

## 2026-10-14 — Kết quả sau khi người dùng duyệt phương án mới

Người dùng đã duyệt triển khai các mục logo, bộ lọc theo tài liệu, hồ sơ/bài đăng ở ghép, avatar chat và tài khoản UEH thật. Quyết định tạm giữ đăng nhập demo của đợt trước được thay thế bởi yêu cầu mới; khu chủ trọ B tiếp tục giữ nguyên.

- [x] Thay cả ba logo SVG chữ bằng ảnh UEH do người dùng cung cấp, điều chỉnh kích thước và kiểm tra ảnh tải trong Chrome.
- [x] Màn đầu chỉ chọn Đăng nhập/Đăng ký; form đăng ký kiểm tra email `ten.mssv@st.ueh.edu.vn`, mật khẩu và xác nhận mật khẩu. Dùng Supabase `signUp`/`signInWithPassword`; phiên không xác nhận email hoặc sai mẫu bị từ chối. Bỏ lối vào prototype.
- [x] Bổ sung bộ lọc khu vực/cơ sở, giá theo người, ngày vào, chỗ trống, giới tính ưu tiên, giờ ngủ, dọn dẹp, thú cưng, tiện nghi và Room Check. Form đăng bài bổ sung số người, giá, ngày vào, điều kiện sinh hoạt, tiện nghi, cọc/điện/nước/chi phí chung, khách/đồ chung và xác nhận chủ nhà đồng ý.
- [x] Thêm tuổi, ngành học, quê quán, sở thích và thói quen nấu ăn tùy chọn vào hồ sơ; giữ điện thoại/Zalo riêng. Thêm avatar người đăng/người nhắn ở danh sách, đầu chat và bong bóng tin nhắn.
- [x] Viết lược đồ Supabase mới với RLS cho hồ sơ, bài đăng, hội thoại, tin nhắn, bucket avatar và bảng Room Check chỉ đọc đối với tài khoản thường; thêm Auth Hook chặn email ngoài mẫu phía máy chủ.
- [x] Kiểm tra tĩnh và Chrome với Supabase giả lập: chọn form, mật khẩu xác nhận sai, đăng ký, đăng nhập, ảnh logo và lọc bài đăng đều qua. Hai entry HTML đã đồng bộ.
- [ ] **Chưa kích hoạt trên Supabase thật:** kiểm tra GET công khai `/rest/v1/student_roommate_listing_cards?select=id&limit=1` trả 404 `PGRST205` ngày 14/10/2026. Không có Supabase CLI, access token, database URL hoặc quyền quản trị trong môi trường. Cần chạy hai file SQL, bật Auth Hook, Confirm email/SMTP/Redirect URL rồi thử hai tài khoản thật trước khi xác nhận chức năng end-to-end.
- [x] Commit mã nguồn `a81b55c965e0fad28ecc36d7c6b700628d939269` đã push lên `origin/main`; `git ls-remote --heads origin main` trả đúng SHA này. Kết quả kiểm tra: `node timtro_website/tests/login.cjs` PASS; `node timtro_website/tests/browser.cjs` PASS với Supabase giả lập; `git diff --cached --check` PASS. Kiểm tra dịch vụ thật vẫn đang chờ quyền quản trị như mục trên.

## 2026-10-14 — Tạm hoãn OTP, ưu tiên các phần còn lại

Người dùng yêu cầu: “tạm thời bỏ qua mã otp trước, ưu tiên cái khác”. Giữ mục tiêu A–F và ghi OTP/quên mật khẩu là phần tạm hoãn; không coi toàn bộ mục tiêu đã hoàn thành. Đăng ký/đăng nhập vẫn dùng tài khoản Supabase, email UEH và mật khẩu; xác nhận email hiện dùng liên kết trong thư, không nhập mã OTP.

- [x] Xóa form/ô mã/nút OTP còn sót và tham chiếu JavaScript; cập nhật kiểm tra để tránh form bị lỗi khi đổi tab.
- [x] Sửa nhãn gửi tin còn ghi demo và thêm nút làm mới chat. Nút Quan tâm mở cuộc trò chuyện với đúng người đăng.
- [x] Sửa lỗi nội dung chat trước còn xuất hiện khi mở chat mới; bỏ phản hồi tải chậm của cuộc chat/tài khoản cũ. Khi đăng xuất, xóa DOM hồ sơ, liên hệ, avatar và tin nhắn cũ. Chặn gửi lặp trong lúc yêu cầu trước chưa xong.
- [x] Xem trước hồ sơ tuân theo các lựa chọn ẩn/hiện, gồm ngành/tuổi/sở thích và nhu cầu; chuyển nhãn nhu cầu/tiện nghi sang tiếng Việt. Khôi phục focus và giữ bàn phím trong hộp thoại.
- [x] Sửa SQL tạo hội thoại: đối chiếu `l.owner_id=student_roommate_threads.owner_id` để không nhầm tên cột với chính cột trong truy vấn con. Thêm quyền bảng rõ ràng và yêu cầu email UEH cho ghi avatar. **SQL chưa được chạy trên dịch vụ, nên chưa có bằng chứng kiểm thử RLS thật.**
- [x] Chrome thật qua 34 kiểm tra giao diện ở 1440px và 34 ở 390px, trên cả hai entry. Bao phủ đăng ký/mật khẩu sai, bộ lọc 2/3/4 người/slot/cơ sở/giá/ngày/tiện nghi/Room Check, quyền ẩn hồ sơ, đăng/sửa/đóng bài, gửi/nhận tin, chống HTML trong tin nhắn, avatar, tách chat, đăng xuất và hình ảnh 360° thay đổi khi xoay/zoom. Supabase dùng fixture cục bộ, không gửi email hay ghi dữ liệu thật. Đã xem ảnh chụp logo và chat mobile, không tràn ngang.
- [ ] Supabase thật vẫn cần quyền quản trị để cài bảng/view và Auth/SMTP; OTP tạm hoãn theo người dùng. Lần đọc cấu hình Auth tiếp theo bị auto-review từ chối vì hết hạn mức kiểm duyệt, lệnh chưa chạy; không dùng kết quả cũ để tuyên bố cấu hình đã đổi.
- [x] Bản sửa lỗi `a9573df6df02ed15cfaca03dafb712d7a06b7ce9` đã push lên `origin/main`; SHA từ `git ls-remote` trùng commit. `node tests/login.cjs`, Chrome 34 tình huống × 2 viewport và `git diff --cached --check` đều đạt. Commit báo cáo tiếp theo ghi kết quả push này; không thay đổi chức năng.
