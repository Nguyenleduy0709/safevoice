import http from 'node:http';
import { DatabaseSync } from 'node:sqlite';
import { randomBytes, randomUUID, createHash, scryptSync, timingSafeEqual } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CATEGORIES, STATUSES, PRIORITIES, classify, appendMessage } from '../public/core.js';
import {emailSenderFromEnvironment} from './email.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const hash = value => createHash('sha256').update(value).digest('hex');
const passwordHash = (password, salt) => scryptSync(password, salt, 64).toString('hex');
const nowISO = () => new Date().toISOString();
const rank = {standard: 0, elevated: 1, urgent: 2};
const fail = (status, message) => { throw Object.assign(new Error(message), {status}); };
function field(value, max, required = false) {
  if (typeof value !== 'string' || value.length > max || (required && !value.trim())) fail(400, 'Thông tin thiếu hoặc quá dài.');
  return value.trim();
}
const defaults = {serviceNote: 'Bản thử nghiệm trên máy. Chưa có lịch trực thực tế; chỉ nhập tình huống giả. Không dùng để chờ cứu trợ.', urgentMinutes: 5, elevatedMinutes: 60, standardMinutes: 1440};

export function createApplication({dbPath = resolve(root, 'data/safevoice.sqlite'), bootstrapPath = resolve(root, 'data/first-login.txt'), rateLimits = true, clock = () => Date.now(), sendEmail = emailSenderFromEnvironment()} = {}) {
  mkdirSync(dirname(dbPath), {recursive: true});
  const db = new DatabaseSync(dbPath);
  db.exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=3000;
    CREATE TABLE IF NOT EXISTS users(id TEXT PRIMARY KEY, username TEXT UNIQUE NOT NULL, name TEXT NOT NULL, role TEXT NOT NULL, salt TEXT NOT NULL, password TEXT NOT NULL, active INTEGER NOT NULL DEFAULT 1);
    CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id), expires INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS cases(id TEXT PRIMARY KEY, token_hash TEXT UNIQUE NOT NULL, assignee TEXT NOT NULL, payload TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS audit(id INTEGER PRIMARY KEY, at TEXT NOT NULL, actor TEXT NOT NULL, action TEXT NOT NULL, case_id TEXT);
    CREATE TABLE IF NOT EXISTS reminders(case_id TEXT NOT NULL REFERENCES cases(id), version INTEGER NOT NULL, at TEXT NOT NULL, PRIMARY KEY(case_id,version));
    CREATE TABLE IF NOT EXISTS settings(id INTEGER PRIMARY KEY CHECK(id=1), payload TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS email_challenges(email TEXT NOT NULL, purpose TEXT NOT NULL, code_hash TEXT NOT NULL, nonce TEXT NOT NULL, name TEXT NOT NULL, expires INTEGER NOT NULL, attempts INTEGER NOT NULL DEFAULT 0, PRIMARY KEY(email,purpose));`);
  db.prepare('INSERT OR IGNORE INTO settings VALUES(1,?)').run(JSON.stringify(defaults));
  const getSettings = () => JSON.parse(db.prepare('SELECT payload FROM settings WHERE id=1').get().payload);
  const audit = (actor, action, id = null) => db.prepare('INSERT INTO audit(at,actor,action,case_id) VALUES(?,?,?,?)').run(nowISO(), actor, action, id);
  const publicUser = u => ({id: u.id, username: u.username, name: u.name, role: u.role});
  const staffList = () => db.prepare("SELECT id,username,name,role FROM users WHERE active=1 AND role IN ('admin','staff') ORDER BY name").all();
  const transaction = fn => { db.exec('BEGIN IMMEDIATE'); try { const result = fn(); db.exec('COMMIT'); return result; } catch(e) { db.exec('ROLLBACK'); throw e; } };
  function addUser(username, name, role, password) {
    if (!/^[a-z0-9._-]{3,40}$/.test(username) || !['admin','staff'].includes(role)) fail(400, 'Tên đăng nhập hoặc vai trò không hợp lệ.');
    field(name, 80, true); field(password, 128, true);
    if (password.length < 12) fail(400, 'Mật khẩu cần ít nhất 12 ký tự.');
    if (db.prepare('SELECT id FROM users WHERE username=?').get(username)) fail(409, 'Tên đăng nhập đã có.');
    const id = randomUUID(), salt = randomBytes(16).toString('hex');
    db.prepare('INSERT INTO users(id,username,name,role,salt,password) VALUES(?,?,?,?,?,?)').run(id, username, name, role, salt, passwordHash(password, salt));
    return {id,username,name,role};
  }
  if (!db.prepare('SELECT id FROM users LIMIT 1').get()) {
    const password = randomBytes(18).toString('base64url');
    mkdirSync(dirname(bootstrapPath), {recursive: true});
    writeFileSync(bootstrapPath, `SafeVoice chỉ thử nghiệm với dữ liệu giả\nTài khoản: admin\nMật khẩu: ${password}\n\nĐổi mật khẩu sau lần đầu đăng nhập. Không chia sẻ hoặc đưa tệp này lên Git.\n`, {mode: 0o600});
    addUser('admin', 'Điều phối viên', 'admin', password);
  }
  const dummySalt = randomBytes(16).toString('hex');
  const limits = new Map();
  function limit(key, max, windowMs = 60000) {
    if (!rateLimits) return;
    const time = clock(); let item = limits.get(key);
    if (!item || item.until <= time) {item = {count: 0, until: time + windowMs}; limits.set(key, item);}
    if (++item.count > max) fail(429, 'Thao tác quá nhanh. Vui lòng thử lại sau ít phút.');
  }
  function getSession(req, required = true) {
    const token = /(?:^|;\s*)sv_session=([a-f0-9]{64})(?:;|$)/.exec(req.headers.cookie || '')?.[1];
    const row = token && db.prepare('SELECT u.* FROM sessions s JOIN users u ON s.user_id=u.id WHERE s.token=? AND s.expires>? AND u.active=1').get(hash(token), clock());
    if (!row && required) fail(401, 'Bạn cần đăng nhập lại.');
    return row || null;
  }
  function requireStaff(req) {const u=getSession(req);if(!['admin','staff'].includes(u.role)) fail(403,'Tài khoản này không có quyền xem ca.');return u;}
  function requireAdmin(req) {const u = getSession(req); if(u.role !== 'admin') fail(403, 'Chỉ điều phối viên có quyền thực hiện.'); return u;}
  function emailField(value) {const email=field(value,254,true).toLowerCase();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))fail(400,'Địa chỉ email chưa hợp lệ.');return email;}
  function issueSession(res,u) {const token=randomBytes(32).toString('hex');db.prepare('INSERT INTO sessions VALUES(?,?,?)').run(hash(token),u.id,clock()+8*3600000);res.setHeader('Set-Cookie',`sv_session=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=28800`);return publicUser(u);}
  function loadCase(id, user) {
    const row = db.prepare('SELECT payload FROM cases WHERE id=?').get(id);
    if (!row) fail(404, 'Không tìm thấy ca hoặc bạn không có quyền xem.');
    const c = JSON.parse(row.payload);
    if (user.role !== 'admin' && c.assigneeId !== user.id) fail(404, 'Không tìm thấy ca hoặc bạn không có quyền xem.');
    return c;
  }
  const saveCase = c => db.prepare('UPDATE cases SET assignee=?,payload=? WHERE id=?').run(c.assigneeId, JSON.stringify(c), c.id);
  function studentCase(c) {
    return {id:c.id, code:c.code, category:c.category, details:c.details, location:c.location, when:c.when, relation:c.relation, status:c.status, createdAt:c.createdAt, messages:c.messages, events:c.events, version:c.version, privacy:c.privacy};
  }
  function track(code) {
    field(code, 80, true);
    const row = db.prepare('SELECT payload FROM cases WHERE token_hash=?').get(hash(code.trim().toUpperCase()));
    if (!row) fail(404, 'Mã không đúng hoặc không còn khả dụng. Mã ở bản demo cũ không dùng được tại đây.');
    return JSON.parse(row.payload);
  }
  function sweep() {
    for(const row of db.prepare('SELECT payload FROM cases').all()) {
      const c = JSON.parse(row.payload);
      if(c.status !== 'closed' && Date.parse(c.dueAt) <= clock()) {
        const result = db.prepare('INSERT OR IGNORE INTO reminders VALUES(?,?,?)').run(c.id,c.version,nowISO());
        if(result.changes) audit('system','Quá hạn kiểm tra — nhắc điều phối viên và người được phân công',c.id);
      }
    }
    db.prepare('DELETE FROM sessions WHERE expires<=?').run(clock());
    db.prepare('DELETE FROM email_challenges WHERE expires<=?').run(clock());
    for (const [key, value] of limits) if(value.until <= clock()) limits.delete(key);
  }
  const interval = setInterval(sweep,10000); interval.unref();
  const staticFiles = {'/':['index.html','text/html; charset=utf-8'],'/index.html':['index.html','text/html; charset=utf-8'],'/app.js':['app.js','text/javascript; charset=utf-8'],'/core.js':['core.js','text/javascript; charset=utf-8'],'/styles.css':['styles.css','text/css; charset=utf-8']};
  const server = http.createServer(async (req,res) => {
    const send = (status, value) => {res.writeHead(status, {'Content-Type':'application/json; charset=utf-8'});res.end(JSON.stringify(value));};
    for (const [key,value] of Object.entries({'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Permissions-Policy':'camera=(), microphone=(), geolocation=()','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'"})) res.setHeader(key,value);
    try {
      const expectedHost = `127.0.0.1:${server.address().port}`;
      if(req.headers.host !== expectedHost) fail(403,'Chỉ mở ứng dụng bằng địa chỉ 127.0.0.1 hiển thị khi khởi động.');
      if(req.headers['sec-fetch-site'] === 'cross-site') fail(403,'Yêu cầu khác nguồn bị từ chối.');
      const url = new URL(req.url,`http://${expectedHost}`), path = url.pathname, method = req.method;
      let body = {};
      if(!['GET','HEAD'].includes(method)) {
        if(req.headers.origin !== `http://${expectedHost}`) fail(403,'Nguồn yêu cầu không hợp lệ.');
        if(!/^application\/json(?:;|$)/i.test(req.headers['content-type'] || '')) fail(415,'Chỉ nhận nội dung JSON.');
        let length = 0; const chunks=[];
        for await (const chunk of req) {length+=chunk.length;if(length>24000) fail(413,'Nội dung quá dài.'); chunks.push(chunk);}
        try {body = JSON.parse(Buffer.concat(chunks).toString());} catch {fail(400,'Nội dung gửi chưa hợp lệ.');}
        if(!body || typeof body !== 'object' || Array.isArray(body)) fail(400,'Nội dung gửi chưa hợp lệ.');
      }
      const client = req.socket.remoteAddress;
      if(path === '/api/config' && method === 'GET') return send(200,{...getSettings(),emailEnabled:!!sendEmail});
      if(path === '/api/session' && method === 'GET') {const u=getSession(req,false);return send(200,{user:u ? publicUser(u):null});}
      if(path === '/api/student/email-code' && method === 'POST') {
        limit('email-ip:'+client,5,600000);
        if(!sendEmail) fail(503,'Chưa cấu hình Gmail gửi mã. Người quản trị cần thiết lập trước.');
        const email=emailField(body.email),purpose=field(body.purpose,16,true),name=purpose==='register'?field(body.name,80,true):'';
        if(!['register','login'].includes(purpose))fail(400,'Mục đích xác nhận không hợp lệ.');
        limit('email-address:'+email,3,600000);
        const existing=db.prepare('SELECT * FROM users WHERE username=? AND role=? AND active=1').get(email,'student');
        if(purpose==='register'&&existing)fail(409,'Email đã có tài khoản học sinh. Hãy chọn đăng nhập.');
        if(purpose==='login'&&!existing)fail(404,'Email chưa có tài khoản học sinh. Hãy tạo tài khoản.');
        const code=String(randomBytes(4).readUInt32BE()%1000000).padStart(6,'0'),nonce=randomBytes(16).toString('hex');
        try {await sendEmail({to:email,code});} catch {fail(502,'Chưa gửi được mã. Kiểm tra cấu hình Gmail hoặc thử lại sau.');}
        db.prepare('INSERT INTO email_challenges(email,purpose,code_hash,nonce,name,expires,attempts) VALUES(?,?,?,?,?,?,0) ON CONFLICT(email,purpose) DO UPDATE SET code_hash=excluded.code_hash,nonce=excluded.nonce,name=excluded.name,expires=excluded.expires,attempts=0').run(email,purpose,hash(nonce+code),nonce,name,clock()+600000);
        return send(200,{ok:true,expiresMinutes:10});
      }
      if(path === '/api/student/verify' && method === 'POST') {
        limit('verify-ip:'+client,15,600000);
        const email=emailField(body.email),purpose=field(body.purpose,16,true),code=field(body.code,6,true);
        if(!['register','login'].includes(purpose)||!/^\d{6}$/.test(code))fail(400,'Mã xác nhận cần đủ 6 chữ số.');
        const challenge=db.prepare('SELECT * FROM email_challenges WHERE email=? AND purpose=?').get(email,purpose);
        if(!challenge||challenge.expires<=clock()||challenge.attempts>=5)fail(400,'Mã đã hết hạn hoặc không hợp lệ. Hãy yêu cầu mã mới.');
        db.prepare('UPDATE email_challenges SET attempts=attempts+1 WHERE email=? AND purpose=?').run(email,purpose);
        if(!timingSafeEqual(Buffer.from(hash(challenge.nonce+code),'hex'),Buffer.from(challenge.code_hash,'hex')))fail(400,'Mã xác nhận chưa đúng.');
        let u=db.prepare('SELECT * FROM users WHERE username=? AND role=? AND active=1').get(email,'student');
        if(purpose==='login'&&!u)fail(404,'Tài khoản chưa tồn tại.');
        if(purpose==='register'&&u)fail(409,'Email đã có tài khoản.');
        transaction(()=>{if(!u){const id=randomUUID(),salt=randomBytes(16).toString('hex'),password=passwordHash(randomBytes(32).toString('hex'),salt);db.prepare('INSERT INTO users(id,username,name,role,salt,password) VALUES(?,?,?,?,?,?)').run(id,email,challenge.name,'student',salt,password);u=db.prepare('SELECT * FROM users WHERE id=?').get(id);}db.prepare('DELETE FROM email_challenges WHERE email=? AND purpose=?').run(email,purpose);audit(u.id,purpose==='register'?'Tạo tài khoản học sinh qua email':'Đăng nhập học sinh qua email');});
        return send(200,{user:issueSession(res,u)});
      }
      if(path === '/api/login' && method === 'POST') {
        limit('login:'+client,10,600000);
        const username=field(body.username,40,true).toLowerCase(), password=field(body.password,128,true);
        const u=db.prepare('SELECT * FROM users WHERE username=? AND active=1').get(username);
        const candidate=passwordHash(password,u?.salt||dummySalt);
        if(!u || !timingSafeEqual(Buffer.from(candidate,'hex'),Buffer.from(u.password,'hex'))) fail(401,'Tên đăng nhập hoặc mật khẩu chưa đúng.');
        if(!['admin','staff'].includes(u.role))fail(401,'Tài khoản học sinh đăng nhập bằng mã email.');
        audit(u.id,'Đăng nhập');return send(200,{user:issueSession(res,u)});
      }
      if(path === '/api/logout' && method === 'POST') {
        const token=/(?:^|;\s*)sv_session=([a-f0-9]{64})/.exec(req.headers.cookie||'')?.[1];
        if(token) db.prepare('DELETE FROM sessions WHERE token=?').run(hash(token));
        res.setHeader('Set-Cookie','sv_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0');return send(200,{ok:true});
      }
      if(path === '/api/password' && method === 'POST') {
        const u=requireStaff(req);limit('password:'+u.id,5,600000);
        const old=field(body.currentPassword,128,true), next=field(body.newPassword,128,true);
        if(next.length<12 || next===old) fail(400,'Dùng mật khẩu mới khác mật khẩu cũ, ít nhất 12 ký tự.');
        if(!timingSafeEqual(Buffer.from(passwordHash(old,u.salt),'hex'),Buffer.from(u.password,'hex'))) fail(400,'Mật khẩu hiện tại chưa đúng.');
        const salt=randomBytes(16).toString('hex');
        transaction(()=>{db.prepare('UPDATE users SET salt=?,password=? WHERE id=?').run(salt,passwordHash(next,salt),u.id);db.prepare('DELETE FROM sessions WHERE user_id=?').run(u.id);audit(u.id,'Đổi mật khẩu và thu hồi các phiên');});
        res.setHeader('Set-Cookie','sv_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0');return send(200,{ok:true});
      }
      if(path === '/api/staff' && method === 'GET') {requireStaff(req);return send(200,staffList());}
      if(path === '/api/staff' && method === 'POST') {
        const u=requireAdmin(req);const created=addUser(field(body.username,40,true).toLowerCase(),field(body.name,80,true),body.role,body.password);audit(u.id,'Tạo tài khoản '+created.username);return send(201,created);
      }
      if(path === '/api/settings' && method === 'POST') {
        const u=requireAdmin(req), next={serviceNote:field(body.serviceNote,500,true)};
        for(const key of ['urgentMinutes','elevatedMinutes','standardMinutes']) {if(!Number.isInteger(body[key])||body[key]<1||body[key]>10080)fail(400,'Hạn kiểm tra cần từ 1 đến 10.080 phút.');next[key]=body[key];}
        db.prepare('UPDATE settings SET payload=? WHERE id=1').run(JSON.stringify(next));audit(u.id,'Đổi thông tin trực và hạn kiểm tra cho ca mới');return send(200,next);
      }
      if(path === '/api/reports' && method === 'POST') {
        limit('report:'+client,15,600000);
        if(body.accepted!==true) fail(400,'Cần xác nhận đã hiểu phạm vi thử nghiệm.');
        const details=field(body.details,3000,true), location=field(body.location??'',120), when=field(body.when??'',100);
        if(details.length<10 || !CATEGORIES.includes(body.category) || !['self','friend','witness'].includes(body.relation) || !['anonymous','contact'].includes(body.privacy) || typeof body.emergency!=='boolean') fail(400,'Kiểm tra lại các thông tin trong lời nhắn.');
        const contact=body.privacy==='contact'?field(body.contact,200,true):'';
        const assessment=classify(details,body.emergency), settings=getSettings();
        const token='SV-'+randomBytes(20).toString('hex').toUpperCase();
        const c={id:randomUUID(),code:'CA-'+randomBytes(6).toString('hex').toUpperCase(),category:body.category,details,location:location||'Chưa cung cấp',when:when||'Chưa cung cấp',relation:body.relation,privacy:body.privacy,contact,priority:assessment.priority,reason:assessment.reason,status:'received',assigneeId:'',assignee:'',createdAt:nowISO(),acknowledged:false,version:1,messages:[],events:[{at:nowISO(),text:'Máy chủ đã lưu lời nhắn; chưa có người xác nhận tiếp nhận.'}],dueAt:new Date(clock()+settings[assessment.priority+'Minutes']*60000).toISOString()};
        transaction(()=>{db.prepare('INSERT INTO cases VALUES(?,?,?,?)').run(c.id,hash(token),'',JSON.stringify(c));audit('student','Gửi lời nhắn',c.id);});
        return send(201,{code:token,case:studentCase(c)});
      }
      if(path === '/api/track' && method === 'POST') {limit('track:'+client,40,600000);return send(200,studentCase(track(body.code)));}
      if(path === '/api/student/messages' && method === 'POST') {
        limit('message:'+client,40,600000);const c=track(body.code);field(body.message,1500,true);
        if(c.messages.length>=500) fail(400,'Ca đã có nhiều trao đổi; hãy tạo lời nhắn mới và dẫn mã hồ sơ cũ.');
        const next=appendMessage(c,'student',body.message), settings=getSettings();next.version=c.version+1;
        if(c.status==='closed' || rank[next.priority]>rank[c.priority] || next.priority==='urgent') next.dueAt=new Date(clock()+settings[next.priority+'Minutes']*60000).toISOString();
        transaction(()=>{saveCase(next);audit('student','Bổ sung lời nhắn',c.id);});return send(200,studentCase(next));
      }
      if(path === '/api/cases' && method === 'GET') {
        const u=requireStaff(req);sweep();
        const rows=u.role==='admin'?db.prepare('SELECT payload FROM cases ORDER BY rowid DESC').all():db.prepare('SELECT payload FROM cases WHERE assignee=? ORDER BY rowid DESC').all(u.id);
        audit(u.id,'Xem hộp thư được phân quyền');return send(200,rows.map(r=>JSON.parse(r.payload)));
      }
      const match=/^\/api\/cases\/([a-f0-9-]{36})(?:\/(messages|ack|audit))?$/.exec(path);
      if(match) {
        const u=requireStaff(req), c=loadCase(match[1],u), action=match[2];
        if(method==='GET' && action==='audit') {audit(u.id,'Xem lịch sử xử lý',c.id);return send(200,db.prepare('SELECT a.at,a.action,COALESCE(u.name,a.actor) AS actor FROM audit a LEFT JOIN users u ON a.actor=u.id WHERE case_id=? ORDER BY a.id').all(c.id));}
        if(method==='GET' && !action) {audit(u.id,'Mở hồ sơ',c.id);return send(200,c);}
        if(method==='POST' && action==='messages') {
          field(body.message,1500,true);if(c.messages.length>=500)fail(400,'Ca đã đạt giới hạn trao đổi.');
          const next=appendMessage(c,'staff',body.message);next.version=c.version+1;
          transaction(()=>{saveCase(next);audit(u.id,'Phản hồi cho người báo',c.id);});return send(200,next);
        }
        if(method==='POST' && action==='ack') {
          c.acknowledged=true;c.version++;c.events.push({at:nowISO(),text:'Người phụ trách đã xác nhận tiếp nhận; ca vẫn đang được xử lý.'});
          transaction(()=>{saveCase(c);audit(u.id,'Xác nhận tiếp nhận',c.id);});return send(200,c);
        }
        if(method==='PATCH' && !action) {
          if(body.version!==c.version) fail(409,'Ca vừa thay đổi. Đóng và mở lại hồ sơ để cập nhật, tránh ghi đè thông tin.');
          if(!Object.hasOwn(STATUSES,body.status)||!Object.hasOwn(PRIORITIES,body.priority)) fail(400,'Trạng thái hoặc mức ưu tiên không hợp lệ.');
          const assigneeId=field(body.assigneeId,40), reason=field(body.reason??'',500);
          if(u.role!=='admin' && assigneeId!==c.assigneeId) fail(403,'Chỉ điều phối viên được phân công lại.');
          const assignee=assigneeId && db.prepare('SELECT id,name FROM users WHERE id=? AND active=1').get(assigneeId);
          if(assigneeId&&!assignee)fail(400,'Người phụ trách không còn khả dụng.');
          if(body.status!=='received'&&!assignee)fail(400,'Cần phân công người phụ trách.');
          if((body.priority!==c.priority || body.status==='closed') && reason.length<10)fail(400,'Cần ghi lý do ít nhất 10 ký tự khi đổi ưu tiên hoặc khép lại ca.');
          if(typeof body.dueAt!=='string'||!Number.isFinite(Date.parse(body.dueAt))||Date.parse(body.dueAt)>clock()+90*86400000)fail(400,'Chọn hạn kiểm tra hợp lệ trong 90 ngày.');
          if(body.status!=='closed' && Date.parse(body.dueAt)<=clock())fail(400,'Hạn kiểm tra tiếp theo phải ở tương lai.');
          const oldPriority=c.priority;
          Object.assign(c,{status:body.status,priority:body.priority,assigneeId,assignee:assignee?assignee.name:'',dueAt:new Date(body.dueAt).toISOString(),version:c.version+1});
          if(oldPriority!==c.priority){c.reason='Người phụ trách đánh giá: '+reason;if(c.priority==='urgent')c.acknowledged=false;}
          c.events.push({at:nowISO(),text:'Người phụ trách cập nhật: '+STATUSES[c.status]});
          transaction(()=>{saveCase(c);audit(u.id,'Cập nhật '+STATUSES[c.status]+'; '+PRIORITIES[c.priority]+'; người nhận: '+(c.assignee||'chưa phân công')+(reason?'; lý do: '+reason:''),c.id);});return send(200,c);
        }
      }
      if(['GET','HEAD'].includes(method) && staticFiles[path]) {
        const [name,type]=staticFiles[path], content=await readFile(resolve(root,'public',name));res.writeHead(200,{'Content-Type':type});return res.end(method==='HEAD'?undefined:content);
      }
      fail(404,'Không tìm thấy chức năng.');
    } catch(e) {if(!res.headersSent) send(e.status||500,{error:e.status?e.message:'Chưa hoàn tất thao tác. Vui lòng thử lại; không gửi lặp nếu chưa kiểm tra.'});else res.end();}
  });
  server.requestTimeout=15000;server.headersTimeout=10000;
  let closed=false;
  return {server,db,sweep,close(){if(!closed){closed=true;clearInterval(interval);db.close();}}};
}
