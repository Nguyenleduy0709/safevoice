import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {once} from 'node:events';
import {DatabaseSync,backup} from 'node:sqlite';
import {createApplication} from '../src/application.mjs';

async function fixture(t, options={}) {
  const base=resolve('test-results');mkdirSync(base,{recursive:true});const dir=mkdtempSync(resolve(base,'api-'));
  const app=createApplication({dbPath:resolve(dir,'test.sqlite'),bootstrapPath:resolve(dir,'login.txt'),rateLimits:false,...options});
  app.server.listen(0,'127.0.0.1');await once(app.server,'listening');
  t.after(async()=>{const closed=once(app.server,'close');app.server.close();app.server.closeAllConnections();await closed;app.close();});
  const origin=`http://127.0.0.1:${app.server.address().port}`;
  async function request(path,body,cookie='',method,headers={}){
    const res=await fetch(origin+path,{method:method||(body?'POST':'GET'),headers:{Origin:origin,...(body?{'Content-Type':'application/json'}:{}),...(cookie?{Cookie:cookie}:{}),...headers},body:body?JSON.stringify(body):undefined});
    const text=await res.text();let data;try{data=JSON.parse(text);}catch{data=text;}return {status:res.status,data,cookie:res.headers.get('set-cookie')?.split(';')[0],headers:res.headers};
  }
  const password=/Mật khẩu: (.+)/.exec(readFileSync(resolve(dir,'login.txt'),'utf8'))[1];
  const login=await request('/api/login',{username:'admin',password});assert.equal(login.status,200,JSON.stringify(login.data));
  return {app,request,admin:login.cookie,user:login.data.user,password,dir};
}
const input={details:'Tình huống giả để kiểm tra hỗ trợ trong trường.',location:'Sân trường giả',when:'Diễn tập',category:'Mối lo khác',relation:'self',privacy:'anonymous',emergency:false,accepted:true};
async function report(f,patch={}){const r=await f.request('/api/reports',{...input,...patch});assert.equal(r.status,201,JSON.stringify(r.data));return r.data;}
async function staff(f,username){const created=await f.request('/api/staff',{username,name:username,role:'staff',password:'Testing-only-1234'},f.admin);assert.equal(created.status,201);const login=await f.request('/api/login',{username,password:'Testing-only-1234'});return {user:created.data,cookie:login.cookie};}
const update=(c,assigneeId,patch={})=>({version:c.version,assigneeId,status:'reviewing',priority:c.priority,dueAt:new Date(Date.now()+3600000).toISOString(),reason:'Kiểm tra tình huống giả định',...patch});

test('Anonymous users cannot enumerate cases, users, files, or case audit',async t=>{
 const f=await fixture(t),r=await report(f);
 for(const path of ['/api/cases','/api/staff','/api/cases/'+r.case.id,'/api/cases/'+r.case.id+'/audit'])assert.equal((await f.request(path)).status,401,path);
 for(const path of ['/data/first-login.txt','/data/safevoice.sqlite','/.git/config','/src/application.mjs'])assert.equal((await f.request(path)).status,404,path);
 assert.equal((await f.request('/api/track',{code:r.case.code})).status,404);
});
test('Private tracking is durable, hashed, and does not expose staff-only notes',async t=>{
 const f=await fixture(t),r=await report(f,{privacy:'contact',contact:'Liên hệ giả sau giờ học'});
 assert.match(r.code,/^SV-[A-F0-9]{40}$/);
 const row=f.app.db.prepare('SELECT * FROM cases WHERE id=?').get(r.case.id);
 assert.ok(!JSON.stringify(row).includes(r.code));
 const c=(await f.request('/api/cases/'+r.case.id,undefined,f.admin)).data;
 await f.request('/api/cases/'+c.id,update(c,f.user.id,{priority:'elevated',reason:'Ghi chú nội bộ không hiển thị học sinh'}),f.admin,'PATCH');
 const tracked=(await f.request('/api/track',{code:r.code.toLowerCase()})).data;
 for(const key of ['contact','assigneeId','reason','dueAt'])assert.equal(tracked[key],undefined);
 assert.ok(!JSON.stringify(tracked).includes('Ghi chú nội bộ'));
 const reader=new DatabaseSync(resolve(f.dir,'test.sqlite'),{readOnly:true});assert.equal(reader.prepare('SELECT count(*) AS n FROM cases').get().n,1);reader.close();
});
test('Staff see only assigned cases, cannot self-assign or create users',async t=>{
 const f=await fixture(t),a=await staff(f,'staff-a'),b=await staff(f,'staff-b'),r=await report(f);
 assert.deepEqual((await f.request('/api/cases',undefined,a.cookie)).data,[]);
 const c=(await f.request('/api/cases/'+r.case.id,undefined,f.admin)).data;
 assert.equal((await f.request('/api/cases/'+c.id,update(c,a.user.id),f.admin,'PATCH')).status,200);
 assert.equal((await f.request('/api/cases',undefined,a.cookie)).data.length,1);
 for(const suffix of ['', '/audit'])assert.equal((await f.request('/api/cases/'+c.id+suffix,undefined,b.cookie)).status,404);
 assert.equal((await f.request('/api/cases/'+c.id+'/messages',{message:'Truy cập sai'},b.cookie)).status,404);
 const assigned=(await f.request('/api/cases/'+c.id,undefined,a.cookie)).data;
 assert.equal((await f.request('/api/cases/'+c.id,update(assigned,b.user.id),a.cookie,'PATCH')).status,403);
 assert.equal((await f.request('/api/staff',{username:'outsider',name:'Fake',password:'Testing-only-1234',role:'admin'},a.cookie)).status,403);
});
test('Two-way messaging, urgent bypass, acknowledgement and reopening are separate',async t=>{
 const f=await fixture(t),r=await report(f,{emergency:true});let c=(await f.request('/api/cases/'+r.case.id,undefined,f.admin)).data;
 assert.equal(c.priority,'urgent');c=(await f.request('/api/cases/'+c.id+'/ack',{},f.admin)).data;
 assert.equal(c.acknowledged,true);assert.equal(c.status,'received');
 c=(await f.request('/api/cases/'+c.id,update(c,f.user.id,{status:'closed'}),f.admin,'PATCH')).data;
 assert.equal(c.status,'closed');
 const next=await f.request('/api/student/messages',{code:r.code,message:'Thông tin bổ sung giả định, mình muốn hỏi thêm.'});assert.equal(next.status,200);assert.equal(next.data.status,'received');
 c=(await f.request('/api/cases/'+c.id,undefined,f.admin)).data;assert.equal(c.priority,'urgent');assert.equal(c.acknowledged,false);
 assert.equal((await f.request('/api/cases/'+c.id+'/messages',{message:'Người phụ trách phản hồi thử nghiệm.'},f.admin)).status,200);
 assert.equal((await f.request('/api/track',{code:r.code})).data.messages.length,2);
});
test('Stale updates fail, priority changes require human reasons and are audited',async t=>{
 const f=await fixture(t),r=await report(f);const c=(await f.request('/api/cases/'+r.case.id,undefined,f.admin)).data;
 assert.equal((await f.request('/api/cases/'+c.id,update(c,f.user.id,{priority:'urgent',reason:''}),f.admin,'PATCH')).status,400);
 const first=await f.request('/api/cases/'+c.id,update(c,f.user.id),f.admin,'PATCH');assert.equal(first.status,200);
 assert.equal((await f.request('/api/cases/'+c.id,update(c,f.user.id),f.admin,'PATCH')).status,409);
 const logs=(await f.request('/api/cases/'+c.id+'/audit',undefined,f.admin)).data;
 assert.ok(logs.some(x=>x.action.includes('Cập nhật')));assert.ok(logs.some(x=>x.actor==='Điều phối viên'));
});
test('Cross-origin writes, malformed inputs and unsafe enum values are rejected',async t=>{
 const f=await fixture(t);
 assert.equal((await f.request('/api/reports',input,'',undefined,{Origin:'https://evil.example'})).status,403);
 assert.equal((await f.request('/api/reports',input,'',undefined,{'Content-Type':'text/plain'})).status,415);
 for(const patch of [{details:''},{details:'x'.repeat(3001)},{privacy:'other'},{accepted:false},{relation:'teacher'},{emergency:'true'},{privacy:'contact',contact:''}])assert.equal((await f.request('/api/reports',{...input,...patch})).status,400);
 const r=await report(f,{details:'<script>alert(1)</script> Nội dung giả để thử.'});
 assert.equal((await f.request('/api/track',{code:r.code})).data.details,'<script>alert(1)</script> Nội dung giả để thử.');
 assert.match((await f.request('/')).headers.get('content-security-policy'),/script-src 'self'/);
});
test('Password change revokes existing sessions and rejects old credentials',async t=>{
 const f=await fixture(t);
 const second=await f.request('/api/login',{username:'admin',password:f.password});
 assert.equal((await f.request('/api/password',{currentPassword:f.password,newPassword:'Changed-for-testing-123'},f.admin)).status,200);
 assert.equal((await f.request('/api/cases',undefined,second.cookie)).status,401);
 assert.equal((await f.request('/api/login',{username:'admin',password:f.password})).status,401);
 assert.equal((await f.request('/api/login',{username:'admin',password:'Changed-for-testing-123'})).status,200);
});
test('Overdue reminders are durable, deduplicated, and do not close cases',async t=>{
 let time=Date.now();const f=await fixture(t,{clock:()=>time}),r=await report(f,{emergency:true});
 time+=6*60000;f.app.sweep();f.app.sweep();
 assert.equal(f.app.db.prepare('SELECT count(*) AS n FROM reminders').get().n,1);
 assert.equal((await f.request('/api/cases/'+r.case.id,undefined,f.admin)).data.status,'received');
 assert.ok((await f.request('/api/cases/'+r.case.id+'/audit',undefined,f.admin)).data.some(x=>x.action.includes('Quá hạn')));
});
test('Rate limits bound code guessing and login attempts',async t=>{
 const f=await fixture(t,{rateLimits:true});
 for(let i=0;i<40;i++)assert.equal((await f.request('/api/track',{code:'SV-WRONG'})).status,404);
 assert.equal((await f.request('/api/track',{code:'SV-WRONG'})).status,429);
 for(let i=0;i<9;i++)assert.equal((await f.request('/api/login',{username:'admin',password:'bad'})).status,401);
 assert.equal((await f.request('/api/login',{username:'admin',password:'bad'})).status,429);
});
test('SQLite backups are consistent and can be opened for recovery',async t=>{
 const f=await fixture(t);await report(f);const target=resolve(f.dir,'backup.sqlite');await backup(f.app.db,target);
 const restored=new DatabaseSync(target);assert.equal(restored.prepare('PRAGMA integrity_check').get().integrity_check,'ok');assert.equal(restored.prepare('SELECT count(*) AS n FROM cases').get().n,1);restored.close();
});
test('Student creates account with emailed code, signs in again, and cannot read staff data',async t=>{
 const sent=[];const f=await fixture(t,{sendEmail:async mail=>sent.push(mail)});
 const email='hoc.sinh@example.test';
 assert.equal((await f.request('/api/student/email-code',{email,name:'Bạn thử nghiệm',purpose:'register'})).status,200);
 assert.equal(sent.length,1);assert.equal(sent[0].to,email);assert.match(sent[0].code,/^\d{6}$/);
 assert.equal((await f.request('/api/student/verify',{email,code:'999999'===sent[0].code?'000000':'999999',purpose:'register'})).status,400);
 const verified=await f.request('/api/student/verify',{email,code:sent[0].code,purpose:'register'});
 assert.equal(verified.status,200);assert.equal(verified.data.user.role,'student');
 assert.equal((await f.request('/api/session',undefined,verified.cookie)).data.user.name,'Bạn thử nghiệm');
 for(const path of ['/api/cases','/api/staff'])assert.equal((await f.request(path,undefined,verified.cookie)).status,403);
 assert.equal((await f.request('/api/student/verify',{email,code:sent[0].code,purpose:'register'})).status,400);
 assert.equal((await f.request('/api/student/email-code',{email,purpose:'login'})).status,200);
 assert.equal((await f.request('/api/student/verify',{email,code:sent[1].code,purpose:'login'})).status,200);
});
test('Email verification expires, limits guesses, and needs configured transport',async t=>{
 let time=Date.now();const sent=[];const f=await fixture(t,{clock:()=>time,sendEmail:async mail=>sent.push(mail)});
 const email='test@example.test';await f.request('/api/student/email-code',{email,name:'Thử nghiệm',purpose:'register'});
 for(let i=0;i<5;i++)assert.equal((await f.request('/api/student/verify',{email,code:'999999'===sent[0].code?'000000':'999999',purpose:'register'})).status,400);
 assert.equal((await f.request('/api/student/verify',{email,code:sent[0].code,purpose:'register'})).status,400);
 time+=11*60000;
 assert.equal((await f.request('/api/student/verify',{email,code:sent[0].code,purpose:'register'})).status,400);
 const off=await fixture(t,{sendEmail:null});
 assert.equal((await off.request('/api/student/email-code',{email,name:'Thử nghiệm',purpose:'register'})).status,503);
});
