Ghi chú phiên bản: Đây là đánh giá nền trước khi nâng cấp lên MVP 0.3. Phần hiện trạng demo trong tài liệu mô tả bản cũ. Xem README.md và BAN-GIAO.md để biết chức năng hiện tại; các yêu cầu pháp lý và vận hành vẫn cần được rà soát.

# Đánh giá SafeVoice và hướng phát triển thử nghiệm

Ngày rà soát nguồn: 11 tháng 11 năm 2026. Đối tượng: nhóm học sinh hoặc sinh viên phát triển sản phẩm cho trường THCS và THPT Việt Nam.

Đây là phân tích mô phỏng bốn góc nhìn chuyên môn, không phải biên bản của một hội đồng chuyên gia thực tế hay ý kiến pháp lý chính thức. Đánh giá dựa trên mô tả của nhóm và README bản demo; chưa kiểm toán mã nguồn, bảo mật hoặc kiểm chứng hiệu quả tâm lý. Các chỉ tiêu thử nghiệm dưới đây là đề xuất, không phải tiêu chuẩn pháp luật.

## 1 Kết luận và định vị

**Khả thi có điều kiện: 7/10. Mức sẵn sàng của demo để nhận dữ liệu thật: 2/10.** Đây là điểm đánh giá chủ quan phục vụ quyết định sản phẩm.

SafeVoice có thể triển khai nếu trường nhận trách nhiệm tiếp nhận, bảo vệ, chuyển tuyến và theo dõi từng ca. Hiện tại chưa nên thu thập chuyện thật: localStorage, vai người phụ trách mở tự do và không có máy chủ khiến việc phân quyền, lưu giữ, trao đổi giữa thiết bị và cảnh báo thật chưa được bảo đảm.

Định vị nên chọn: **kênh lên tiếng kín đáo và quản lý hỗ trợ học sinh, có AI hỗ trợ người phụ trách**. Mục tiêu đầu tiên là học sinh được một người lớn phù hợp tiếp nhận và theo dõi đến nơi đến chốn. Chưa nên quảng bá là AI trị liệu hay hệ thống đã chứng minh giảm bạo lực.

Điều kiện quyết định không phải số agent, mà là ai đọc tin, đọc khi nào, làm gì nếu người đó vắng mặt, và ai bảo vệ học sinh sau khi báo. Nếu trường không cam kết những việc này, không mở thử nghiệm với ca thật.

## 2 Ba rủi ro lớn nhất từ mỗi góc nhìn

| Góc nhìn | Rủi ro thứ nhất | Rủi ro thứ hai | Rủi ro thứ ba |
|---|---|---|---|
| Tâm lý học đường và bảo vệ trẻ em | Học sinh tưởng đang được người thật chăm sóc hoặc được giữ bí mật tuyệt đối; AI có thể trả lời sai, hỏi dồn, khiến trẻ kể lại sang chấn | Sàng lọc bỏ sót tiếng lóng, lời đe dọa gián tiếp, câu nói mỉa hoặc nguy cơ âm thầm; cảnh báo sai cũng có thể gây hại | Sau báo tin có thể bị trả đũa, bị ép hòa giải, bị thông báo cho chính người gây hại hoặc không có hỗ trợ tiếp nối |
| Pháp lý dữ liệu cá nhân | Không xác định được trường, nhóm phát triển và nhà cung cấp AI chịu trách nhiệm gì; thiếu căn cứ xử lý dữ liệu theo tuổi và mục đích | Gọi dữ liệu là ẩn danh dù tên người bị phản ánh, lớp, thời gian, IP hoặc nội dung vẫn nhận diện được người | Cam kết bí mật quá mức, giữ dữ liệu quá lâu hoặc chuyển dữ liệu ra nước ngoài mà chưa thực hiện nghĩa vụ tương ứng |
| Kỹ sư phần mềm và AI | Demo không có xác thực và phân quyền; ai dùng chung trình duyệt cũng có thể đọc dữ liệu | Mô hình tóm tắt sai người hoặc thời gian, bỏ sót nguy cơ; sáu agent làm tăng chi phí, độ trễ và khó truy nguyên lỗi | Cảnh báo chỉ xuất hiện trên trình duyệt; tab đóng, mất mạng hoặc không ai nhận thì cơ chế khẩn cấp thất bại |
| Hiệu trưởng | Không đủ người trực và thời gian xử lý; công việc phát sinh không có kinh phí | Xung đột lợi ích nếu người bị phản ánh là giáo viên hoặc lãnh đạo; trường có thể ưu tiên danh tiếng thay vì an toàn | Tin trùng, tin sai và điều tra thiếu công bằng làm quá tải, gây tổn hại người bị phản ánh và làm học sinh mất niềm tin |

## 3 Có nên có chế độ tâm sự riêng

**Có thể có không gian riêng, nhưng chưa nên đưa chatbot tâm sự tự do vào MVP với lời hứa chỉ học sinh và AI thấy.** Giáo viên không được đọc mặc định là một chính sách có thể thiết kế. Không có bất kỳ ai hoặc tổ chức nào có thể tiếp cận là một khẳng định mạnh hơn rất nhiều.

Nếu AI chạy trên máy chủ, nội dung phải được xử lý ở đó; cần kiểm tra log, sao lưu, nhà cung cấp, người vận hành và điều khoản lưu dữ liệu. Mã hóa khi truyền hoặc khi lưu không đồng nghĩa máy chủ không đọc được lúc xử lý. Nếu toàn bộ hoạt động thật sự nằm trên thiết bị, trường không thể biết mọi nguy cơ và can thiệp từ xa. Thiết bị dùng chung, đồng bộ và mất mã khóa cũng tạo rủi ro.

Không thể hứa đồng thời giữ bí mật tuyệt đối, không ai theo dõi và luôn phát hiện để cứu trợ kịp thời. Dòng chữ miễn trừ trách nhiệm không sửa được thiết kế mâu thuẫn này.

### Thiết kế ba chế độ rõ ràng hơn

| Chế độ | Người nhận và giới hạn | Thiết kế đề xuất |
|---|---|---|
| Ghi riêng trên thiết bị | Không gửi cho trường; không có người theo dõi | Để sau hoặc chỉ làm ghi chú đơn giản; cảnh báo rủi ro dùng chung máy; nút chuyển phần nội dung do học sinh chọn thành yêu cầu hỗ trợ |
| Gửi không ghi tên | Nhóm hỗ trợ được phân quyền đọc; nội dung có thể khiến người đọc đoán danh tính | Không bắt buộc tài khoản trường; mã theo dõi ngẫu nhiên mạnh, trao đổi hai chiều; không hứa ẩn danh tuyệt đối |
| Gửi có thông tin liên hệ | Người tiếp nhận được biết thông tin cần để liên hệ | Hỏi cách và thời điểm liên hệ an toàn; cho chọn người hỗ trợ khi có thể; không tự động gửi toàn bộ nội dung cho phụ huynh |

Quyền riêng tư và nghĩa vụ bảo vệ trẻ em phải được thiết kế cùng nhau. Điều 51 Luật Trẻ em đề cập cả hành vi xâm hại lẫn nguy cơ bị bạo lực; vì vậy tiêu chí chỉ xử lý khi nguy hiểm rõ ràng đang diễn ra là quá hẹp. Tuy nhiên, việc AI gắn nhãn không tự chứng minh sự việc có thật hoặc tự xác lập trách nhiệm pháp lý cụ thể. [Luật Trẻ em](https://btllang.mod.gov.vn/van-ban/vbpq-do-nha-nuoc-ban-hanh/6234-luat-tre-em-so-102-2016-qh13-ngay-05-4-2016.html).

### Lưới an toàn đề xuất

1. **Trước khi nhập nội dung:** nêu người nhận, giờ trực, thời gian dự kiến phản hồi, giới hạn riêng tư và trường hợp chia sẻ cần thiết để bảo vệ an toàn. Dùng câu ngắn phù hợp độ tuổi; không chôn trong điều khoản dài.
2. **Trong khi sử dụng:** nút Cần giúp ngay luôn có sẵn, không cần được AI cho phép. Hỏi ngắn về nguy hiểm hiện tại, vị trí nếu người dùng muốn cung cấp, cách liên hệ an toàn. Không bắt kể chi tiết hoặc nộp bằng chứng mới được giúp.
3. **Có nguy cơ đáng lo nhưng chưa khẩn cấp:** chuyển cho người có chuyên môn xem sớm; có kế hoạch an toàn và hẹn theo dõi. Không chờ bạo lực xảy ra mới nhận ca.
4. **Nguy hiểm tức thời:** hiển thị hướng dẫn hành động ngắn do chuyên gia duyệt và kênh trợ giúp phù hợp; chuyển tín hiệu đến người trực và người dự phòng theo quy trình đã thống nhất. Luồng báo khẩn cấp chủ động phải hoạt động độc lập với AI.
5. **Chia sẻ thông tin:** ưu tiên giải thích và xin sự đồng ý khi phù hợp. Không đặt toàn bộ bảo vệ trẻ phụ thuộc vào một nút đồng ý. Trường hợp pháp luật cho phép hoặc yêu cầu xử lý không cần đồng ý phải có căn cứ, đúng người nhận và phạm vi cần thiết; không giao cho LLM tự quyết định ngoại lệ này.
6. **Gói cảnh báo:** tối thiểu nhưng đủ hành động, gồm mã ca, thời điểm, nội dung nguy cơ ngắn có nguồn, vị trí nếu có và cách liên hệ nếu có. Chỉ gửi mức độ mà không rõ nguy cơ có thể làm người trực không biết xử lý. Đánh dấu điều chưa xác minh; không tự bịa vị trí hoặc danh tính.
7. **Sau cảnh báo:** phải biết đã đến máy chủ, đã gửi thông báo, người thật đã nhận hay đã can thiệp. Ghi lý do truy cập/chia sẻ; chuyển người dự phòng khi quá hạn; theo dõi nguy cơ trả đũa.

Luật Bảo vệ dữ liệu cá nhân có quy định những trường hợp xử lý không cần sự đồng ý, trong đó có bảo vệ lợi ích thiết yếu trong hoàn cảnh cấp bách theo điều kiện luật định. Đây không phải giấy phép thu thập hoặc giám sát vô hạn. Cần luật sư xác định trường hợp áp dụng và người chịu trách nhiệm. [Giải thích của Cổng Chính phủ](https://xaydungchinhsach.chinhphu.vn/cac-truong-hop-xu-ly-du-lieu-ca-nhan-khong-can-su-dong-y-cua-chu-the-du-lieu-119250725163811636.htm).

111 là kênh bảo vệ trẻ em. Các nút trợ giúp khẩn cấp cần phân biệt bảo vệ trẻ, công an và cấp cứu y tế, đồng thời kiểm tra cách vận hành tại địa phương trước thử nghiệm. Năm 2026 đang có lộ trình tích hợp 113, 114, 115; không mặc định mọi nơi đã vận hành giống nhau. Nút mở cuộc gọi không phải tích hợp điều phối, và không chứng minh cơ quan đã nhận ca. [Tổng đài 111](https://tongdai111.vn/tin/cac-linh-vuc-hoat-dong-va-chuc-nang-cua-tong-dai-111), [Thông tin về lộ trình tích hợp](https://congan.phutho.gov.vn/article/DU-KIEN-LO-TRINH-TICH-HOP-3-SO-KHAN-CAP-113-114-32470-33).

## 4 Những gì phải sửa hoặc bỏ

| Ưu tiên | Thay đổi | Lý do |
|---|---|---|
| Bắt buộc trước dữ liệu thật | Bỏ lời hứa bí mật tuyệt đối và cứu trợ tự động được bảo đảm | Năng lực kỹ thuật và tổ chức hiện chưa đáp ứng |
| Bắt buộc | Có đầu mối chịu trách nhiệm, lịch trực, người dự phòng và đường chuyển ra ngoài trường | Ca liên quan người trong trường không thể chỉ quay lại chính người đó |
| Bắt buộc | Máy chủ, đăng nhập nhân viên, phân quyền theo ca, xác thực nhiều bước, nhật ký truy cập, sao lưu và khôi phục | Chuyển từ trình diễn sang hệ thống có thể kiểm soát |
| Bắt buộc | Chính sách dữ liệu, căn cứ xử lý, cơ chế theo độ tuổi, thời hạn lưu, xử lý rò rỉ và hợp đồng nhà cung cấp | Nội dung có thể chứa dữ liệu nhạy cảm của cả người gửi và người khác |
| Bắt buộc | Không kết tội hoặc kỷ luật từ điểm AI; lưu lời báo gốc và phân biệt thông tin đã xác minh | Bảo vệ người báo và bảo đảm xử lý công bằng |
| Bắt buộc | Cho người có thẩm quyền hạ ưu tiên với lý do và lịch sử | Không tự hạ bằng AI là hợp lý; cấm cả người thật sửa sẽ gây ùn tắc cảnh báo |
| Nên có | Gộp sáu agent thành các chức năng; dùng quy tắc cho phân công, nhắc hạn và chuyển cấp | Những việc này cần tính nhất quán hơn khả năng sinh văn bản |
| Nên có | AI tóm tắt có dẫn lại đoạn gốc; bản tóm tắt có thể sửa, không ghi đè lời học sinh | Giảm thời gian đọc nhưng giữ khả năng kiểm tra |
| Nên có | Theo dõi an toàn sau can thiệp, mở lại ca, phản hồi về cách xử lý và lựa chọn liên hệ an toàn | Đóng ca không đồng nghĩa học sinh đã an toàn |
| Để sau | Chatbot tâm sự mở, tải ảnh/âm thanh, bản đồ điểm nóng chi tiết và sáu agent tự chủ | Tăng đáng kể rủi ro dữ liệu, bảo mật và chuyên môn |
| Để sau | Chương trình phục hồi tâm lý cá nhân hóa bằng AI | Cần chuyên gia phụ trách, nội dung có căn cứ và kiểm chứng với nhóm tuổi/ngôn ngữ sử dụng |

**Báo tin giả:** tiếp nhận với thái độ trung lập; kiểm tra thông tin, trao đổi riêng, tìm nguồn độc lập khi phù hợp. Tin chưa chứng minh được không đồng nghĩa tin cố ý bịa. Không dùng AI đo độ trung thực và không ép người báo công khai danh tính để chứng minh. Chặn spam bằng giới hạn gửi hợp lý, gộp tin trùng và kiểm tra thủ công, tránh thu thập dấu vết quá mức. Tin cố ý gây hại cần quy trình xem xét riêng, không công khai người báo hoặc tự động kỷ luật.

## 5 Những phần còn thiếu

- **Xung đột lợi ích:** đường báo độc lập khi vụ việc liên quan giáo viên, người trực hoặc hiệu trưởng; cơ chế khiếu nại cách xử lý.
- **Bảo vệ sau báo tin:** đánh giá nguy cơ bị trả đũa, phương án đi học an toàn, người lớn đáng tin và lịch kiểm tra lại. Không mặc định hòa giải trực tiếp trong vụ bắt nạt có chênh lệch quyền lực.
- **Gia đình:** cách liên hệ khi phụ huynh có thể là nguồn nguy hiểm; đầu mối chuyên môn quyết định việc thông báo phù hợp pháp luật và lợi ích của trẻ.
- **Nhóm cần hỗ trợ khác nhau:** người bị hại, người chứng kiến và học sinh có hành vi gây hại; bảo vệ không đồng nghĩa bỏ qua trách nhiệm của người gây hại.
- **Ngoài giờ và mất kết nối:** nội dung chưa gửi phải báo rõ; có kênh thay thế, không hiện đã được tiếp nhận khi chưa có xác nhận từ máy chủ.
- **Ẩn danh thực chất:** tài khoản trường, địa chỉ mạng, thông báo trên màn hình khóa, bản sao lưu và câu chuyện đều có thể làm lộ người gửi. Người mất mã cần được giải thích giới hạn khôi phục; không mở cửa hậu tùy tiện.
- **Quyền đối với dữ liệu:** bản ghi có cả người bị phản ánh và người chứng kiến; yêu cầu xem/xóa không được xử lý bằng cách lộ thông tin người khác. Quy định giữ hồ sơ khi có nghĩa vụ pháp lý hoặc vụ việc đang xử lý.
- **Sử dụng bình đẳng:** không có điện thoại vẫn báo trực tiếp hoặc qua đầu mối trường; hỗ trợ thiết bị cũ, chữ dễ đọc và người khuyết tật.
- **Phòng ngừa ở cấp trường:** nội quy chống trả đũa, giáo dục người chứng kiến, đào tạo giáo viên và điều chỉnh giám sát ở nơi có nguy cơ. App không thay thế những việc này.
- **Kinh phí và kết thúc thử nghiệm:** ai trả thời gian trực, tư vấn, máy chủ, thông báo và bảo mật; chuyển ca còn mở đi đâu, xuất và xóa dữ liệu thế nào nếu nhóm ngừng dự án.

## 6 Khung pháp lý cần rà soát tại Việt Nam

Danh sách dưới đây là những văn bản trọng tâm, không phải xác nhận tuân thủ hay danh mục đầy đủ. Trước thử nghiệm, cần người có chuyên môn pháp luật Việt Nam kiểm tra bản hiện hành, văn bản sửa đổi, quy định chuyển tiếp và nghĩa vụ theo mô hình cụ thể.

| Văn bản | Điều cần chuyển thành yêu cầu sản phẩm |
|---|---|
| Luật Bảo vệ dữ liệu cá nhân 91/2025/QH15, hiệu lực 01/01/2026 | Căn cứ và mục đích xử lý, quyền chủ thể, dữ liệu nhạy cảm, vai trò các bên, dữ liệu trẻ em và trường hợp không cần đồng ý |
| Nghị định 356/2025/NĐ-CP hướng dẫn Luật Bảo vệ dữ liệu cá nhân, hiệu lực 01/01/2026 | Rà soát hồ sơ đánh giá tác động, chuyển dữ liệu xuyên biên giới, tổ chức bảo vệ dữ liệu và thủ tục tương ứng; không mặc định dự án nhỏ được miễn |
| Luật Trẻ em 102/2016/QH13 và các sửa đổi hiện hành | Quyền riêng tư, lợi ích tốt nhất của trẻ, tiếp nhận và báo tin nguy cơ/xâm hại, đặc biệt Điều 21 và Điều 51 |
| Nghị định 56/2017/NĐ-CP quy định chi tiết một số điều của Luật Trẻ em | Quy trình bảo vệ trẻ; bảo vệ thông tin đời sống riêng tư trên mạng, nhất là Điều 33 và Điều 36 |
| Nghị định 80/2017/NĐ-CP về môi trường giáo dục an toàn, lành mạnh, thân thiện, phòng chống bạo lực học đường | Trách nhiệm phòng ngừa, tiếp nhận, hỗ trợ, can thiệp và phối hợp xử lý của cơ sở giáo dục |
| Thông tư 18/2025/TT-BGDĐT hướng dẫn công tác tư vấn học đường và công tác xã hội trong trường học, hiệu lực 31/10/2025 | Tổ chức nhân sự, hoạt động tư vấn và phối hợp trong trường |
| Luật Trí tuệ nhân tạo 134/2025/QH15, hiệu lực 01/03/2026; Nghị định 142/2026/NĐ-CP, hiệu lực 01/05/2026 | Xác định vai trò nhà phát triển/triển khai, phân loại rủi ro và nghĩa vụ áp dụng; không tự nhận hệ thống rủi ro thấp chỉ vì AI có người duyệt |
| Luật An ninh mạng 116/2025/QH15, hiệu lực 01/07/2026 | Bảo vệ hệ thống và dữ liệu; rà soát các nghị định hướng dẫn, yêu cầu vận hành tương ứng |

Nguồn chính thức: [Luật 91](https://congbao.chinhphu.vn/van-ban/luat-so-91-2025-qh15-45578/57730.htm), [Nghị định 356](https://vanban.chinhphu.vn/?classid=1&docid=216387&pageid=27160), [Luật Trẻ em](https://vanban.chinhphu.vn/?docid=184566&pageid=27160), [Nghị định 56](https://chinhphu.vn/default.aspx?docid=189758&pageid=27160), [Nghị định 80](https://vanban.chinhphu.vn/default.aspx?docid=190430&pageid=27160), [Thông tư 18](https://chinhphu.vn/?docid=215348&pageid=27160), [Luật AI](https://congbao.chinhphu.vn/van-ban/luat-so-134-2025-qh15-468694.htm), [Nghị định 142](https://congbao.chinhphu.vn/van-ban/nghi-dinh-so-142-2026-nd-cp-469480.htm), [Luật An ninh mạng](https://congan.ninhbinh.gov.vn/vanban/luat-an-ninh-mang-244.html).

Hai cập nhật quan trọng: Nghị định 13/2023/NĐ-CP đã hết hiệu lực từ khi Nghị định 356/2025 có hiệu lực; không dùng tài liệu cũ chỉ dựa vào Nghị định 13. Thông tư 18/2025 đã thay thế Thông tư 31/2017 và Thông tư 33/2018. [Nghị định 356 bản ký](https://datafiles.chinhphu.vn/cpp/files/vbpq/2026/01/356-nd.signed.pdf), [Giải thích về Thông tư 18](https://xaydungchinhsach.chinhphu.vn/dam-bao-nhan-su-kinh-phi-co-so-vat-chat-cho-hoat-dong-tu-van-hoc-duong-119250923200741499.htm).

Luật Trẻ em xác định trẻ em là người dưới 16 tuổi; học sinh 16–17 tuổi vẫn cần cơ chế phù hợp người chưa thành niên, không được coi toàn bộ THPT là người trưởng thành. Phải phân biệt đồng ý sử dụng dịch vụ, căn cứ xử lý, việc tiết lộ riêng tư và ngoại lệ bảo vệ an toàn. Luật dữ liệu mới yêu cầu sự đồng ý của trẻ từ đủ 7 tuổi và người đại diện khi xử lý nhằm công bố, tiết lộ thông tin đời sống riêng tư, bí mật cá nhân; không nên diễn giải thành một nút cha mẹ đồng ý giải quyết mọi trường hợp. [Giải thích của Bộ Công an](https://www.bocongan.gov.vn/bai-viet/bao-ve-du-lieu-ca-nhan-trong-mot-so-hoat-dong-1754989261).

Cần luật sư chốt riêng: phân vai trường và nhóm phát triển; dữ liệu nào gửi nhà cung cấp AI; việc xử lý không cần đồng ý; quyền phụ huynh khi có xung đột; nghĩa vụ chuyển tuyến; phân loại rủi ro AI và hồ sơ/thời hạn pháp lý. Tài liệu này chưa kết luận các vấn đề đó cho một hệ thống chưa được triển khai cụ thể.

## 7 MVP tại một trường trong một học kỳ

### Phạm vi và tính năng

Thử với một nhóm khoảng 100–200 học sinh hoặc vài lớp tự nguyện trong một trường, sau khi hoàn tất thủ tục phù hợp. Đây là quy mô đề xuất để kiểm tra vận hành, không phải tính cỡ mẫu cho nghiên cứu hiệu quả.

MVP gồm báo không ghi tên hoặc có liên hệ; mã theo dõi và trao đổi hai chiều; yêu cầu hỗ trợ khẩn cấp do học sinh chủ động chọn; tài khoản người trực với phân quyền; phân công và hạn xử lý; thông báo thật và người dự phòng; nhật ký xử lý; hẹn gặp/chuyển tuyến; kiểm tra lại an toàn và mở lại ca. Có trang giải thích riêng tư, giờ trực, kênh thay thế và nội dung hỗ trợ đã được chuyên gia duyệt.

Nếu cần thể hiện AI, chỉ bật tóm tắt nháp để người trực duyệt sau khi có căn cứ dữ liệu và kiểm thử. Sàng lọc AI ban đầu chạy đối chiếu với người thật, không tự tác động đến quyền học sinh. Chưa đưa vào chatbot tâm sự tự do, chấm điểm sức khỏe tâm thần, dò nói dối, giám sát thiết bị hoặc đính kèm ảnh nhạy cảm.

### Nhân lực đề xuất

| Nhóm | Số lượng dự kiến | Trách nhiệm |
|---|---|---|
| Nhà trường | Khoảng 4–5 người có giờ làm được phân bổ; một số vai trò có thể kiêm nhiệm | Một người chịu trách nhiệm chung, hai người tiếp nhận chính/dự phòng đã được tập huấn, một người có chuyên môn tâm lý và một đầu mối y tế/chuyển tuyến |
| Phát triển và vận hành | Khoảng 2 người, có người hướng dẫn kỹ thuật | Phát triển, theo dõi lỗi, bảo trì; mặc định không được đọc hồ sơ thật để gỡ lỗi |
| Rà soát độc lập | Hỗ trợ theo đợt | Pháp lý dữ liệu, bảo mật và chuyên môn bảo vệ trẻ; kết nối dịch vụ ngoài trường cho ca vượt năng lực |

Đây không phải định mức nhân sự pháp luật và không đủ để hứa trực 24/7. Lịch trực phải khớp với nhân lực thực tế; ngoài giờ phải hiện rõ và có kênh hỗ trợ khác. Dự toán ưu tiên thời gian con người và kiểm thử an toàn trước ngân sách mô hình AI.

### Lộ trình học kỳ đề xuất

- Tuần 1–4: thống nhất quy trình, pháp lý, xây hạ tầng tối thiểu, tập huấn và diễn tập bằng dữ liệu giả. Chỉ tiếp tục khi người nhận chính và dự phòng xử lý được kịch bản khẩn cấp, mất mạng và xung đột lợi ích.
- Tuần 5–14: thử giới hạn; họp rà soát mỗi tuần về ca trễ, lỗi, khối lượng công việc và phản hồi. Không để cuộc họp định kỳ trì hoãn can thiệp khẩn cấp.
- Tuần 15–18: đánh giá, hỏi phản hồi tự nguyện, kiểm tra quyền riêng tư và lập kế hoạch bàn giao các ca chưa đóng. Điều chỉnh theo lịch học kỳ thực tế.

### Đo hiệu quả

| Chỉ số | Cách đo và mục tiêu thử nghiệm gợi ý |
|---|---|
| Nhận ca | Thời gian từ máy chủ nhận đến người thật xác nhận; báo cả trung vị và phân vị 90, tách trong/ngoài giờ |
| Diễn tập khẩn cấp | Mọi tình huống diễn tập phải đến đúng người chính hoặc dự phòng; có thể đặt mục tiêu xác nhận trong 5 phút khi có trực, sau khi trường kiểm chứng khả năng đáp ứng |
| Ca thường | Tỷ lệ có phản hồi có nội dung trong một ngày làm việc; mục tiêu ban đầu từ 90%, điều chỉnh theo năng lực |
| Theo dõi an toàn | Tỷ lệ ca cần theo dõi có lịch hẹn và được kiểm tra lại; ghi nhận trả đũa, tái diễn và ca mở lại |
| Niềm tin và tiếp cận | Khảo sát tự nguyện trước/sau: biết tìm ai, có dám báo, có cảm thấy được lắng nghe; ghi rõ tỷ lệ phản hồi và giới hạn mẫu |
| Chất lượng AI | Tỷ lệ tóm tắt sai sự kiện quan trọng, gợi ý ưu tiên khác đánh giá chuyên môn, thời gian người trực sửa; dùng tình huống giả và dữ liệu thật chỉ khi được phép |
| Năng lực trường | Phút xử lý mỗi ca, số ca chờ, ca quá hạn, tỷ lệ chuyển tuyến được tiếp nhận |
| Riêng tư và kỹ thuật | Lần truy cập sai quyền, thông báo thất bại, dữ liệu bị lộ, sự cố mất mã; mọi sự cố nghiêm trọng phải được điều tra và xử lý |

Không lấy lượt chat, số ca đóng hoặc giảm số đơn làm thước đo chính. Báo tin tăng có thể phản ánh niềm tin tăng. Một trường trong một học kỳ chưa đủ chứng minh quan hệ nhân quả rằng app giảm bạo lực hay điều trị sang chấn. Nếu đo sức khỏe tâm lý, cần chuyên gia chọn công cụ phù hợp tuổi và tiếng Việt, cơ chế đồng ý và phản ứng khi phát hiện nguy cơ.

Tạm dừng mở rộng hoặc ngừng chức năng gây rủi ro khi có rò rỉ nghiêm trọng, ca khẩn cấp không đến người trực, dấu hiệu trả đũa chưa được xử lý hoặc hàng chờ vượt năng lực. Vẫn phải duy trì bàn giao, hỗ trợ các ca đang mở; không đơn giản tắt app rồi bỏ ca.

## 8 So sánh và khác biệt có thể xây dựng

Mô tả dựa trên tài liệu chính thức của đơn vị cung cấp; không phải đánh giá độc lập về hiệu quả và không phải khảo sát toàn bộ thị trường. Không có căn cứ để tuyên bố SafeVoice đầu tiên tại Việt Nam.

| Giải pháp | Hướng hoạt động được công bố | Bài học cho dự án |
|---|---|---|
| Tổng đài 111 và ứng dụng tại Việt Nam | Tiếp nhận thông tin bảo vệ trẻ em qua nhiều kênh, gồm ứng dụng; kết nối hỗ trợ | Phải có đường chuyển ra ngoài trường; không tuyên bố đã tích hợp 111 nếu chỉ có nút gọi |
| SafeVoice Nevada tại Mỹ | Báo tin ẩn danh, đội chuyên trách phản hồi 24/7/365 | Hạ tầng con người quan trọng; tên SafeVoice đã có đơn vị dùng |
| Lightspeed StopIt | Báo tin ẩn danh, nhắn hai chiều, tiếp nhận và quản lý vụ việc | Mã theo dõi và chat ẩn danh không phải khác biệt mới |
| Alongside | AI hỗ trợ kỹ năng và tự hỗ trợ học sinh, có quy trình an toàn; không dùng AI đánh giá mức độ nghiêm trọng của khủng hoảng theo FAQ | Tách xây kỹ năng khỏi đánh giá khủng hoảng và trị liệu |
| Sonar | Hỗ trợ sức khỏe tâm thần thanh thiếu niên dựa vào kết nối với người thật | Quan hệ hỗ trợ và chuyển tiếp đến dịch vụ phù hợp đáng đầu tư hơn số lượng bot |
| Securly Aware | AI phân tích hoạt động số trong môi trường trường quản lý để phát hiện dấu hiệu nguy cơ | Đây là mô hình giám sát khác với tự nguyện báo tin; không nên sao chép vào MVP |

Nguồn: [111](https://tongdai111.vn/tin/cac-linh-vuc-hoat-dong-va-chuc-nang-cua-tong-dai-111), [SafeVoice Nevada](https://doe.nv.gov/offices/osrle/school-safety/safe-voice), [StopIt](https://www.lightspeedsystems.com/products/lightspeed-stopit/), [Alongside](https://www.alongside.care/faq), [Sonar](https://www.sonarmentalhealth.com/), [Securly Aware](https://www.securly.com/aware).

**Khác biệt khả dĩ:** tiếng Việt phù hợp học sinh; bảo mật được giải thích đúng; quy trình hợp với trường Việt Nam; nhận ca có hạn và người dự phòng; chống trả đũa; theo dõi sau hỗ trợ; đường báo độc lập khi người bị phản ánh ở trong trường. Đây mới là hướng định vị, chưa phải lợi thế đã được chứng minh.

Tên SafeVoice chỉ nên dùng tạm. Cần kiểm tra nhãn hiệu và tên miền trước công bố; việc đã có chương trình cùng tên không tự chứng minh có vi phạm nhãn hiệu tại Việt Nam.

## 9 Hướng phát triển tiếp theo

1. Hoàn thiện quy trình tiếp nhận và trách nhiệm trước. Phỏng vấn học sinh, người trực và tư vấn viên riêng; không yêu cầu học sinh kể trải nghiệm sang chấn để lấy ý tưởng. Làm rõ học sinh sợ điều gì sau khi gửi tin.
2. Xây hạ tầng an toàn và thử diễn tập. Kiểm tra truy cập trái phép, đoán mã, rò thông báo, mất kết nối, người trực nghỉ và báo về hiệu trưởng. Người phát triển dùng dữ liệu giả khi gỡ lỗi.
3. Thử một trường, đánh giá khả năng tiếp nhận và theo dõi. Ưu tiên chứng minh học sinh được phản hồi và có phương án hỗ trợ, trước khi tối ưu lượt dùng.
4. Thêm AI ở tác vụ hẹp. So sánh tóm tắt AI với bản do người viết: tiết kiệm được bao lâu, sai gì, ai phát hiện. Cần có nút tắt AI và quy trình tiếp nhận vẫn hoạt động.
5. Mở nhánh hỗ trợ tâm lý có chuyên gia. Nội dung kỹ năng, đặt lịch và theo dõi cảm nhận tự nguyện; chuyên gia kiểm soát chương trình và quyết định chuyển tuyến. Muốn tuyên bố phục hồi tâm lý phải có nghiên cứu phù hợp, không suy ra từ chatbot trả lời êm dịu.
6. Chỉ phân tích xu hướng khi đủ dữ liệu và đánh giá tái nhận diện. Gộp địa điểm/thời gian, che nhóm rất nhỏ và không hiển thị câu trích có thể nhận ra học sinh. Ngưỡng như tối thiểu 10 ca một nhóm chỉ là lựa chọn thiết kế để thử, không phải bảo đảm ẩn danh hay chuẩn pháp luật.

Quyết định đề xuất cho nhóm: dành phiên bản tới cho báo tin kín đáo, người trực phản hồi thật, kiểm tra an toàn sau báo và bảo vệ dữ liệu. Giữ giao diện thân thiện, các nền theo sở thích và nhân vật dẫn hướng như lựa chọn trải nghiệm; không để vẻ gần gũi khiến học sinh tưởng bot là nhà tâm lý hoặc một người bạn luôn trực.
