# SafeVoice

Ứng dụng thử nghiệm tiếng Việt giúp học sinh gửi lời nhắn và người phụ trách tiếp nhận, phân công, trao đổi, hẹn kiểm tra lại. Bản 0.3 chạy trên máy, giữ giao diện galaxy và năm nhân vật đồng hành.

**Chỉ dùng tình huống giả. Chưa có cứu trợ, SMS cảnh báo, trực 24/7 hoặc phê duyệt dùng với học sinh thật.** Chat AI dùng Gemini qua Python khi bật khóa miễn phí; email chỉ dùng gửi mã đăng nhập khi quản trị viên bật Gmail.

## Mở ứng dụng

Yêu cầu Node.js 24 trở lên. Chạy `npm ci` một lần để cài thư viện gửi email.

1. Mở `Mo-SafeVoice.cmd`, giữ cửa sổ chạy mở.
2. Vào http://127.0.0.1:4178 trong trình duyệt. Dùng đúng địa chỉ này, không thay bằng localhost.
3. Chọn **Người phụ trách**. Lần đầu khởi động, ứng dụng tạo tài khoản `admin` và mật khẩu ngẫu nhiên trong `data/first-login.txt`. Có thể mở bằng `Mo-Tai-Khoan.cmd`.
4. Vào **Tài khoản và lịch trực** để đổi mật khẩu, tạo người hỗ trợ và chỉnh thông tin tiếp nhận.

### Trò chuyện với 5 bạn đồng hành AI

Mở `Mo-SafeVoice-AI.cmd` trên máy đã cài khóa AI Studio. Nút này dừng bản SafeVoice cũ trong thư mục này và mở bản có AI. Vào **Góc tâm sự**, chọn Mây, Nhịp, Gương, Rủ Rê hoặc Cầu Nối, đánh dấu đồng ý gửi nội dung giả định đến Google rồi nhắn tin. Mỗi bạn có cách đáp riêng và lịch sử chat riêng trong trang hiện tại. Tải lại trang sẽ xóa lịch sử chat trên trình duyệt. Nút **Chuyển lời viết thành báo tin cho người phụ trách** là thao tác riêng, không tự gửi khi chat.

Mã Python nằm ở `ai/chat.py` và gọi đúng model `gemini-3.5-flash-lite` qua REST API. [Bảng giá Google](https://ai.google.dev/gemini-api/docs/pricing) ghi model này có mức miễn phí với giới hạn. Bản này chỉ bật AI khi khóa nằm trong dự án Free tier và cờ xác nhận miễn phí được đặt; nó không tự nâng lên gói trả phí. Khi hết lượt, app báo thử lại sau. Khóa đã được mã hóa theo tài khoản Windows của máy, không nằm trong Git. Mức miễn phí của Google có thể dùng nội dung gửi để cải thiện sản phẩm, vì vậy **không nhập câu chuyện thật hoặc dữ liệu nhận dạng học sinh**. AI không phải người trực hay chuyên gia tâm lý; tin khẩn cấp được chặn khỏi luồng gọi AI theo quy tắc từ khóa, nhưng quy tắc này có thể bỏ sót.

### Sàng lọc báo tin để người phụ trách xác minh

Mẫu báo tin hỏi thêm ba điều: hiện có nguy hiểm không, sự việc có lặp lại không, và người gặp chuyện có khó tự bảo vệ không. Có thể chọn **Chưa rõ**. Câu trả lời giúp quy tắc trên máy ưu tiên ca cần xem sớm hoặc khẩn cấp; không kết luận đây là bắt nạt. Trong hồ sơ, người phụ trách thấy dấu hiệu đã chọn và câu hỏi cần xác minh.

Học sinh có thể **đồng ý riêng** cho AI xem lời kể giả định. Chỉ khi đã đồng ý, người phụ trách mới có nút **Yêu cầu AI gợi ý** trong hồ sơ. Nút này gửi lời kể, nhóm sự việc và ba câu trả lời tới Google; **không gửi cách liên hệ, địa điểm, chat riêng hay mã theo dõi**. AI đề xuất dấu hiệu, mức độ và câu hỏi; gợi ý chỉ hiện cho người phụ trách, không tự thay mức ưu tiên hoặc đóng ca. Ca không đồng ý vẫn được tiếp nhận bình thường. Đây là quy trình thử nghiệm bằng dữ liệu giả, chưa đánh giá độ chính xác trên học sinh thật.

### Bật Gmail gửi mã cho tài khoản học sinh

1. Chuẩn bị một Gmail riêng dùng làm hộp thư gửi của SafeVoice. Trong tài khoản Google đó, bật xác minh hai bước rồi tạo [mật khẩu ứng dụng theo hướng dẫn Google](https://support.google.com/mail/answer/185833) cho ứng dụng này. Nếu tài khoản không cho tạo mật khẩu ứng dụng, cần dùng một hộp thư hoặc phương thức gửi khác.
2. Mở `Mo-SafeVoice-Gmail.cmd`, nhập địa chỉ Gmail và mật khẩu ứng dụng trên chính máy này. Lệnh sẽ dừng đúng máy chủ SafeVoice cũ trong thư mục này rồi mở bản có Gmail. Giữ cửa sổ mở khi thử nghiệm. Mật khẩu ứng dụng không được ghi vào file dự án.
3. Vào http://127.0.0.1:4178, chọn **Đăng nhập / Tạo tài khoản**, nhập email người nhận để thử mã 6 chữ số. Mã có hiệu lực 10 phút và mỗi mã chỉ dùng một lần.

Không gửi mật khẩu ứng dụng qua chat hoặc đưa lên Git. Cần có kết nối Internet để Gmail gửi mã. Chưa thiết lập Gmail thì ứng dụng vẫn hoạt động phần gửi lời nhắn ẩn danh; màn hình tài khoản báo chưa cấu hình. Email gửi chỉ chứa mã xác nhận, không chứa nội dung lời nhắn. Học sinh tự đăng ký không được vào hộp thư của người phụ trách. Tài khoản học sinh và lời nhắn ẩn danh không tự liên kết; học sinh vẫn giữ mã tra cứu riêng.

Không chia sẻ tệp mật khẩu. Sau khi đổi mật khẩu, cất mật khẩu mới ở nơi an toàn và tự xóa tệp thông tin ban đầu nếu không còn cần. Tệp này không được cập nhật theo mật khẩu mới. Tài khoản người phụ trách chưa có chức năng quên mật khẩu hoặc xác thực email.

Nếu cổng đã được bản demo cũ sử dụng, đóng cửa sổ chạy bản cũ hoặc chọn cổng khác trong PowerShell:

```powershell
$env:PORT='4179'
node server.mjs
```

## Cách thử trong 5 phút

1. Mở một cửa sổ thường ở vai học sinh, một cửa sổ riêng tư để đăng nhập điều phối viên.
2. Học sinh viết tình huống giả, chọn không ghi tên hoặc để lại cách liên hệ giả, xác nhận phạm vi thử nghiệm và gửi.
3. Cất mã bí mật `SV-...`. Mã chỉ được cấp khi gửi; không có cơ chế lấy lại bằng tên. Người có mã có thể đọc và gửi tin nhắn vào ca.
4. Điều phối viên làm mới hộp thư, mở ca, xác nhận tiếp nhận, phân công người hỗ trợ, chọn trạng thái và hạn kiểm tra, rồi gửi phản hồi.
5. Học sinh chọn theo dõi, nhập mã hoặc lấy phản hồi mới. Thử nhắn bổ sung và kiểm tra ở cửa sổ người phụ trách.
6. Thử nút Cần giúp ngay bằng tình huống giả. Ca được lưu ở mức khẩn cấp mà không chờ từ khóa. Các nút gọi chỉ mở ứng dụng điện thoại khi người dùng chủ động bấm.

Mã hồ sơ `CA-...` trong khu vực người phụ trách không phải mã bí mật để truy cập với tư cách học sinh. Chuyển từ vai người phụ trách sang học sinh sẽ đăng xuất tài khoản đang dùng trong cửa sổ đó. Để thử hai vai song song, dùng hai cửa sổ với phiên đăng nhập tách biệt.

## Quyền truy cập

| Vai trò | Quyền |
|---|---|
| Học sinh | Gửi báo tin, truy cập đúng ca bằng mã bí mật, nhắn bổ sung |
| Người hỗ trợ | Chỉ xem, xác nhận, phản hồi và cập nhật ca đã được giao |
| Điều phối viên | Xem mọi ca, phân công, tạo tài khoản, chỉnh thông tin tiếp nhận và hạn cho ca mới |

Mọi quyền được kiểm tra trên máy chủ. Tài khoản đăng nhập có phiên 8 giờ; đổi mật khẩu thu hồi toàn bộ phiên của tài khoản. Mật khẩu được băm bằng scrypt có salt, mã bí mật được băm SHA-256, phiên dùng cookie HttpOnly và SameSite=Strict. API chặn yêu cầu ghi khác nguồn, kiểm tra dữ liệu, giới hạn thử đăng nhập và đoán mã. Đây là biện pháp của MVP, không phải chứng nhận bảo mật.

## Nhắc hạn và cảnh báo

Ca mới có hạn kiểm tra theo cấu hình: mặc định khẩn cấp 5 phút, cần xem sớm 60 phút, thông thường 1.440 phút. Đây là mốc diễn tập có thể thay đổi, không phải cam kết hỗ trợ thực tế. Thời gian tính liên tục, chưa trừ đêm, cuối tuần hoặc ngày lễ.

Máy chủ kiểm tra ca quá hạn mỗi 10 giây khi đang chạy. Bảng quản lý làm mới khoảng 15 giây khi đang mở và không chỉnh hồ sơ; ca quá hạn được nhắc cho điều phối viên và người được giao. Âm báo cần được người dùng bật. Không có thông báo SMS/email, không bảo đảm cảnh báo khi máy ngủ, máy chủ tắt hoặc tab đóng.

Xác nhận tiếp nhận không đóng ca. Người phụ trách có thể thay mức ưu tiên với lý do và lịch sử. Hệ thống từ khóa chỉ tự nâng mức, không tự hạ và không xác định đúng/sai. Tin nhắn mới của học sinh có thể mở lại ca đã đóng. Nếu hai người cùng sửa, bản cập nhật cũ bị từ chối để tránh ghi đè.

## Dữ liệu và giới hạn

- Dữ liệu được lưu tại `data/safevoice.sqlite`, không còn lưu ca mới trong localStorage. localStorage chỉ giữ lựa chọn nhân vật/nền. Nội dung cũ của bản demo không tự nhập hoặc tự xóa.
- Bản nháp và lịch sử chat AI góc tâm sự chỉ nằm trong bộ nhớ trang; tải lại sẽ mất. Khi người dùng đồng ý và bấm gửi chat, tin nhắn và một phần lịch sử được chuyển tới Google để AI trả lời.
- Cơ sở dữ liệu và bản sao lưu chưa được mã hóa trên ổ đĩa. Người có quyền quản trị máy có thể đọc; cần khóa máy và bảo vệ ổ đĩa. Không nhận dữ liệu thật trước rà soát.
- Lời nhắn gửi nhà trường không tự gửi cho AI. Chỉ lời kể của ca đồng ý riêng mới được gửi tới Google nếu người phụ trách bấm yêu cầu sàng lọc. Khi bật Gmail, địa chỉ email nhận và mã xác nhận được gửi qua Gmail. Máy chủ chỉ lắng nghe tại 127.0.0.1, không phục vụ điện thoại hoặc máy khác qua mạng LAN.
- Chưa có đa trường, lập lịch trực thực tế, chuyển tuyến tự động, tải bằng chứng, quản lý thời hạn xóa hay quy trình quyền dữ liệu hoàn chỉnh.
- Giới hạn chống gửi quá nhanh hiện tính theo địa chỉ kết nối, phù hợp thử trên một máy; cần thiết kế lại trước triển khai nhiều người dùng.
- Nhật ký có phân quyền nhưng chưa phải nhật ký chống sửa bởi quản trị viên máy. Nhắc hạn có thể được ghi lại khi phiên bản ca thay đổi.
- Node 24.13 đang đánh dấu SQLite là tính năng thử nghiệm; đã kiểm thử với phiên bản này, cần kiểm tra tương thích khi nâng Node.

## Sao lưu và khôi phục

Chạy `npm run backup`. Lệnh tạo bản sao nhất quán trong `backups/` và kiểm tra tính toàn vẹn. Bản sao chứa cả hồ sơ, tài khoản và phiên đăng nhập; phải bảo vệ như dữ liệu gốc, không đưa lên Git.

Khôi phục thủ công: dừng mọi máy chủ SafeVoice; sao chép nguyên thư mục `data` hiện tại vào một thư mục cất riêng trước; tạo một thư mục `data` sạch; đưa bản sao được chọn vào đó với tên `safevoice.sqlite`. Không trộn tệp WAL/SHM cũ với cơ sở dữ liệu khôi phục. Khởi động lại và đăng nhập bằng mật khẩu tại thời điểm sao lưu, kiểm tra dữ liệu rồi đổi mật khẩu để thu hồi các phiên cũ. Không xóa bản sao dự phòng cho đến khi kiểm tra xong.

## Kiểm thử

```powershell
npm test
```

Bộ kiểm thử gồm 16 tình huống lõi và 10 tình huống API: phân quyền, mã bí mật, nhắn tin, cập nhật đồng thời, phiên đăng nhập, từ chối nguồn sai, nhắc hạn và sao lưu. Kiểm thử tạo dữ liệu giả trong `test-results/` và không tác động cơ sở dữ liệu đang dùng.

Kiểm thử giao diện tùy chọn nằm ở `tests/browser.mjs`, dùng Playwright. Có thể cài Playwright riêng để chạy, hoặc đặt biến `PLAYWRIGHT_MODULE` trỏ tới tệp `index.mjs` của bản đã cài. Đặt `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` nếu dùng Chrome có sẵn rồi chạy `npm run test:browser`. Bộ kiểm thử tự mở máy chủ trên cổng ngẫu nhiên, tài khoản và cơ sở dữ liệu riêng, lưu ảnh vào `test-results/`. Không in mật khẩu ra kết quả kiểm thử.

## Tài liệu dự án

- [Kế hoạch tiếp theo và danh sách cần duyệt](docs/KE-HOACH-VA-PHE-DUYET.md)
- [Đánh giá sản phẩm và nghiên cứu](docs/DANH-GIA-VA-NGHIEN-CUU.md)
- [Kết quả bàn giao](docs/BAN-GIAO.md)

Nguồn tham khảo kỹ thuật: [Node SQLite](https://nodejs.org/docs/latest-v24.x/api/sqlite.html), [Node crypto](https://nodejs.org/docs/latest-v24.x/api/crypto.html). SafeVoice vẫn là tên tạm; cần rà soát trước khi dùng thương mại.
