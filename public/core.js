export const STATUSES = { received:'Chờ tiếp nhận', reviewing:'Đang xác minh', supporting:'Đang hỗ trợ', followup:'Theo dõi tiếp', closed:'Đã khép lại' };
export const PRIORITIES = { urgent:'Khẩn cấp', elevated:'Cần xem sớm', standard:'Thông thường' };
export const CATEGORIES = ['Bắt nạt, cô lập','Bạo lực thể chất','Bắt nạt trên mạng','Đe dọa, ép buộc','Mối lo khác'];
export const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const words = list => new RegExp(`(?<![\\p{L}\\p{N}])(?:${list})(?![\\p{L}\\p{N}])`, 'u');
const URGENT_PLAIN = words('dang bi danh|bi danh hoi dong|chay mau|vu khi|cam dao|mang dao|rut dao|tu tu|tu hai|muon chet|chet|giet');
const URGENT_ACCENTED = words('dao');
const ELEVATED_PLAIN = words('de doa|ep buoc|tra thu|tong tien|bi danh|danh nhau|danh dap|danh minh|danh em|danh to|danh ban');
const ELEVATED_ACCENTED = words('sợ hãi|sợ|hoảng sợ');
export function classify(text, emergency = false) {
  if (emergency) return { priority:'urgent', reason:'Người báo chọn cần giúp ngay. Cần người phụ trách kiểm tra ngay.' };
  // Hạ chữ thường TRƯỚC khi đổi đ→d để chữ 'Đ' hoa không bị lọt.
  const lower = String(text).normalize('NFC').toLowerCase();
  const plain = lower.normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/đ/g,'d');
  // Từ dễ trùng khi bỏ dấu (dao/dạo, danh/danh sách, so/số) được so trên chữ còn dấu hoặc theo cụm từ.
  if (URGENT_PLAIN.test(plain) || URGENT_ACCENTED.test(lower)) return { priority:'urgent', reason:'Có từ ngữ liên quan nguy hiểm. Quy tắc demo có thể hiểu sai ngữ cảnh; cần người kiểm tra.' };
  if (ELEVATED_PLAIN.test(plain) || ELEVATED_ACCENTED.test(lower)) return { priority:'elevated', reason:'Có dấu hiệu đe dọa hoặc tổn thương trong lời kể; cần người xem sớm.' };
  return { priority:'standard', reason:'Chưa phát hiện từ khóa khẩn cấp. Điều này không xác nhận tình huống an toàn; mọi tin đều cần người xem.' };
}
export const INTAKE_CHOICES = ['yes','no','unknown'];
export function screenReport({details='',emergency=false,repeated='unknown',power='unknown',safety='unknown'}) {
  if (![repeated,power,safety].every(value=>INTAKE_CHOICES.includes(value))) throw new Error('Câu trả lời sàng lọc chưa hợp lệ.');
  const base=classify(details,emergency||safety==='yes');
  let priority=base.priority,reason=base.reason;
  if(safety==='yes' && !emergency) reason='Người báo cho biết hiện có nguy hiểm. Cần người phụ trách kiểm tra ngay.';
  else if(priority==='standard' && (repeated==='yes'||power==='yes')) {
    priority='elevated';reason='Có dấu hiệu sự việc lặp lại hoặc người báo khó tự bảo vệ. Cần người phụ trách xem sớm và xác minh.';
  }
  const questions=[];
  if(safety==='unknown')questions.push('Hiện có ai đang không an toàn hoặc cần giúp ngay không?');
  if(repeated==='unknown')questions.push('Sự việc đã xảy ra nhiều lần hoặc có khả năng lặp lại không?');
  if(power==='unknown')questions.push('Người gặp chuyện có cảm thấy khó tự bảo vệ hoặc bị một nhóm gây sức ép không?');
  return {priority,reason,signals:{safety,repeated,power},questions:questions.slice(0,2)};
}
export function validateReport({details='',location='',category=''}) {
  if (details.trim().length < 10) return 'Bạn kể thêm một chút nhé (ít nhất 10 ký tự).';
  if (details.length > 3000) return 'Lời kể tối đa 3.000 ký tự.';
  if (location.length > 120) return 'Địa điểm tối đa 120 ký tự.';
  if (!CATEGORIES.includes(category)) return 'Chọn nhóm sự việc phù hợp.';
  return '';
}
export function makeReport(input, code, now = new Date().toISOString()) {
  const assessment = classify(input.details, input.emergency);
  return { id:crypto.randomUUID(), code, category:input.category || 'Mối lo khác', details:input.details.trim(), location:input.location.trim() || 'Chưa cung cấp', relation:input.relation || 'self', when:input.when || 'Chưa cung cấp', priority:assessment.priority, reason:assessment.reason, status:'received', assignee:'', createdAt:now, acknowledged:false, messages:[], events:[{at:now, text:'Đã ghi nhận trong bản demo.'}] };
}
export function newCode() {
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  return 'SV-' + Array.from(bytes, b => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[b % 32]).join('');
}
export const activeUrgent = cases => cases.filter(c => c.priority === 'urgent' && c.status !== 'closed' && !c.acknowledged);
export function updateCase(item, {status,assignee}, now = new Date().toISOString()) {
  if (!Object.hasOwn(STATUSES,status)) throw new Error('Trạng thái không hợp lệ.');
  if (!assignee.trim() && status !== 'received') throw new Error('Chọn người phụ trách trước khi cập nhật.');
  const text = `${STATUSES[status]}${assignee ? ' · ' + assignee : ''}`;
  return {...item,status,assignee,events:[...item.events,{at:now,text}]};
}
export function appendMessage(item, role, text, now = new Date().toISOString()) {
  const clean = text.trim();
  if (!clean || clean.length > 1500) throw new Error('Tin nhắn cần có từ 1 đến 1.500 ký tự.');
  if (!['student','staff'].includes(role)) throw new Error('Vai trò không hợp lệ.');
  const next = {...item,messages:[...item.messages,{id:crypto.randomUUID(),role,text:clean,at:now}]};
  if (role === 'student') {
    const assessment = classify(clean);
    const rank = {standard:0,elevated:1,urgent:2};
    if (rank[assessment.priority] > rank[next.priority]) { next.priority=assessment.priority; next.reason=assessment.reason; }
    if (next.priority === 'urgent') next.acknowledged=false;
    if (next.status === 'closed') next.status='received';
    next.events=[...item.events,{at:now,text:'Có thông tin bổ sung từ người báo; cần kiểm tra lại.'}];
  }
  return next;
}
export function seedCases() {
  const time = minutes => new Date(Date.now()-minutes*60000).toISOString();
  const a = makeReport({category:'Bắt nạt trên mạng',details:'Một nhóm liên tục chia sẻ ảnh chế và bình luận về mình trong nhóm lớp. Mình muốn được hỗ trợ để việc này dừng lại.',location:'Nhóm chat lớp · dữ liệu mẫu',relation:'self'},'SV-DEMO26',time(85));
  a.status='supporting';a.assignee='Cô An · tư vấn viên (mẫu)';
  a.messages=[{id:crypto.randomUUID(),role:'staff',text:'Cô đã nhận thông tin. Em muốn trao đổi qua đây hay chọn một buổi gặp riêng? Đây là tin nhắn mẫu.',at:time(60)}];
  a.events.push({at:time(60),text:'Đang hỗ trợ · Cô An (dữ liệu mẫu)'});
  const b = makeReport({category:'Bắt nạt, cô lập',details:'Mình thấy một bạn thường xuyên bị gạt khỏi hoạt động nhóm. Mình muốn hỏi cách hỗ trợ bạn ấy.',location:'Lớp học · dữ liệu mẫu',relation:'witness'},'SV-MAU002',time(40));
  const c = makeReport({category:'Đe dọa, ép buộc',details:'Có bạn nhận được tin nhắn đe dọa sau giờ học. Bạn ấy đang ở cùng một người lớn tin cậy.',location:'Sau giờ học · dữ liệu mẫu',relation:'friend'},'SV-MAU003',time(20));
  return [c,b,a];
}
