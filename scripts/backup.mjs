import { DatabaseSync, backup } from 'node:sqlite';
import { mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const source=resolve(root,'data/safevoice.sqlite');
if(!existsSync(source)) throw new Error('Chưa có dữ liệu. Hãy chạy ứng dụng trước.');
mkdirSync(resolve(root,'backups'),{recursive:true});
const output=resolve(root,'backups',`safevoice-${new Date().toISOString().replace(/[:.]/g,'-')}.sqlite`);
const db=new DatabaseSync(source,{readOnly:true});
try {await backup(db,output);const check=new DatabaseSync(output,{readOnly:true});try{if(check.prepare('PRAGMA integrity_check').get().integrity_check!=='ok')throw new Error('Bản sao lưu không hợp lệ.');}finally{check.close();}console.log('Đã sao lưu và kiểm tra: '+output);}finally{db.close();}
