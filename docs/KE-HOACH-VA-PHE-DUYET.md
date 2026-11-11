# Kế hoạch hoàn thiện SafeVoice và danh sách cần duyệt

Cập nhật ngày 11/11/2026. Bản 0.3 là MVP chạy trên máy, chỉ thử với tình huống giả. Không phải xác nhận đủ điều kiện triển khai tại trường.

## Phạm vi đã được chủ dự án duyệt

- Giữ giao diện galaxy, các nhân vật và nền riêng theo nhân vật.
- Xây máy chủ lưu ca, đăng nhập người phụ trách, phân quyền, nhắn hai chiều, nhắc hạn và kiểm thử.
- Lưu mã nguồn vào tài khoản GitHub Nguyenleduy0709. Kho sử dụng: safevoice, riêng tư.
- Không dùng dịch vụ trả phí, không gửi dữ liệu học sinh ra ngoài và không công bố website.
- Sau khi lưu, kiểm thử và push thành công: yêu cầu Windows tắt máy theo yêu cầu của chủ dự án. Không ép đóng ứng dụng có dữ liệu chưa lưu.

## Đợt 1 đã thực hiện trong bản MVP

| Hạng mục | Kết quả và giới hạn |
|---|---|
| Lưu dữ liệu | SQLite trên máy chủ thay cho localStorage. Cơ sở dữ liệu chưa mã hóa trên ổ đĩa; chỉ dùng dữ liệu giả |
| Đăng nhập | Tài khoản điều phối viên khởi tạo bằng mật khẩu ngẫu nhiên; đổi mật khẩu, phiên đăng nhập 8 giờ và đăng xuất |
| Phân quyền | Điều phối viên xem và phân công mọi ca; người hỗ trợ chỉ được xem và xử lý ca được giao. Kiểm tra ở máy chủ |
| Báo tin | Cho bản thân, giúp bạn hoặc người chứng kiến; gửi không ghi tên hoặc để lại cách liên hệ an toàn |
| Mã theo dõi | Mã bí mật ngẫu nhiên 160 bit, máy chủ chỉ lưu bản băm. Mã hồ sơ hiển thị cho nhân viên không thay mã bí mật |
| Trao đổi | Tin nhắn hai chiều lưu qua máy chủ; nội dung được hiển thị như văn bản, không chạy HTML |
| Tiếp nhận | Xác nhận nhận tin tách biệt với đóng ca; có trạng thái và người phụ trách |
| Hẹn kiểm tra | Hạn theo từng ca, bảng ca quá hạn và lịch sử nhắc. Thời gian liên tục, chưa có lịch ca trực hoặc lịch nghỉ tự động |
| Xử lý ưu tiên | Từ khóa mô phỏng và nút chủ động khẩn cấp; người thật được điều chỉnh với lý do. Không có AI thật |
| Nhật ký | Ghi thao tác và người thực hiện; ghi chú nội bộ không trả về giao diện học sinh |
| Tránh ghi đè | Từ chối lưu khi hồ sơ đã thay đổi ở một phiên khác |
| Sao lưu | Lệnh sao lưu SQLite và kiểm tra tính toàn vẹn; hướng dẫn khôi phục thủ công |
| Kiểm thử | Kiểm thử lõi và API, thêm hành trình tự động trên Chrome và ảnh giao diện máy tính/điện thoại |

## Những quyết định chưa cần cho đợt 1

Không cần cấp API key, mua dịch vụ, cung cấp dữ liệu học sinh thật hoặc mời giáo viên vào thử ngay. Việc sửa lỗi, giao diện và kiểm thử trong phạm vi đã duyệt có thể tiếp tục mà không xin duyệt từng thay đổi nhỏ.

## Đợt 2 cần chủ dự án chốt trước khi triển khai

| Cần duyệt | Nội dung cần xác định | Đề xuất |
|---|---|---|
| Tên và thương hiệu | Giữ tên tạm hay đổi tên; kiểm tra nhãn hiệu/tên miền | SafeVoice đã có chương trình cùng tên ở Nevada; kiểm tra trước công bố |
| Nơi chạy và ngân sách | Máy tại trường hay dịch vụ lưu trữ; ai trả phí, hạn mức mỗi tháng | Chưa đưa Internet đến khi có phương án dữ liệu và vận hành |
| Tổ chức thử nghiệm | Trường, nhóm tuổi, phạm vi học sinh, thời gian và người chịu trách nhiệm | Một trường, một nhóm nhỏ, một học kỳ sau diễn tập |
| Người tiếp nhận | Người chính, dự phòng, giờ trực, nghỉ lễ, hạn phản hồi và chuyển tuyến | Dùng người được trường phân công; không hứa trực 24/7 khi chưa có nhân lực |
| Tin liên quan người trong trường | Người nhận độc lập khi báo về giáo viên, người trực hoặc hiệu trưởng | Không chỉ chuyển trở lại người bị phản ánh |
| Dữ liệu và riêng tư | Căn cứ xử lý theo tuổi, người được đọc, thời hạn lưu, quyền xem/xóa, sự cố và vai trò các bên | Luật sư và đầu mối bảo vệ trẻ rà soát trước dữ liệu thật |
| Cảnh báo ngoài ứng dụng | SMS, email hay dịch vụ thông báo; người nhận và chi phí; xác nhận nhận ca | Nội dung thông báo chỉ có mã ca và yêu cầu đăng nhập, không lộ chuyện học sinh |
| AI | Nhà cung cấp, ngân sách, dữ liệu được gửi, lưu log và đánh giá sai sót | Bắt đầu bằng tóm tắt nháp do người phụ trách duyệt |
| Hỗ trợ tâm lý | Chuyên gia phụ trách nội dung và quy trình chuyển tuyến | Chưa triển khai chatbot trị liệu hay tâm sự tự do |
| Đưa ra công khai | Tên miền, điều khoản, chính sách và người chịu trách nhiệm | Mã nguồn riêng tư và demo trên máy trước |

## Công việc kỹ thuật của đợt 2

1. Chọn hạ tầng và cấu hình HTTPS, xác thực nhiều bước, thu hồi/khôi phục tài khoản, giới hạn phiên và quyền truy cập theo trường.
2. Mã hóa và quản lý khóa phù hợp; sao lưu tự động, kiểm thử khôi phục định kỳ và kiểm soát quyền máy chủ.
3. Lịch trực thật, người dự phòng, kênh thông báo ngoài trình duyệt; đo được đã gửi và người thật đã xác nhận.
4. Cơ chế gửi an toàn khi mất mạng, chống gửi trùng, lưu nháp có lựa chọn rõ ràng và bảo vệ trên máy dùng chung.
5. Chính sách vòng đời dữ liệu: lưu giữ, yêu cầu quyền dữ liệu, xuất hồ sơ có kiểm soát, xóa theo căn cứ và xử lý sự cố.
6. Giới hạn lạm dụng phù hợp nhiều người dùng, quản lý danh sách ca lớn, kiểm thử tải và kiểm toán bảo mật độc lập.
7. Kiểm thử nội dung tiếng Việt, đánh giá chuyên môn, diễn tập báo giả, nguy cơ trả đũa, ca vượt khả năng trường.
8. Chỉ thêm AI sau khi hoàn tất đánh giá dữ liệu; có thể tắt AI mà quy trình nhận ca vẫn hoạt động.

## Điều kiện được thử với dữ liệu thật

Phải có đơn vị chịu trách nhiệm, quy trình và nhân sự đã tập huấn; rà soát pháp lý dữ liệu/AI; kiểm tra bảo mật; cơ chế chuyển tuyến; thông tin riêng tư phù hợp lứa tuổi; thử thành công các tình huống nguy hiểm và mất kết nối. Bản 0.3 chưa đáp ứng toàn bộ những điều kiện này.

## Tiêu chí nghiệm thu đợt 1

- Gửi tình huống giả từ cửa sổ học sinh và xem được ở cửa sổ điều phối viên.
- Tắt mở trình duyệt hoặc khởi động lại máy chủ vẫn còn dữ liệu đã lưu.
- Người chưa đăng nhập và người không được giao ca không đọc được hồ sơ qua API.
- Người được giao ca phản hồi được; học sinh tra cứu đúng mã nhìn thấy phản hồi.
- Tạo ca khẩn cấp không phụ thuộc từ khóa; xác nhận không đóng ca; tin bổ sung có thể mở lại ca.
- Hạn quá hạn được ghi nhận và hiển thị; điều phối viên luôn thấy ca để hỗ trợ dự phòng.
- Mật khẩu, dữ liệu SQLite, bản sao lưu và dữ liệu thử nghiệm không được đưa lên Git.
- Mã nguồn được push, kiểm tra mã commit khớp kho từ xa; bản chạy trên ổ D có hướng dẫn mở.
