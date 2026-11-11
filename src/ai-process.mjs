import {spawn} from 'node:child_process';
import {resolve} from 'node:path';

function pythonRequest(input) {
  return new Promise((resolveReply,reject) => {
    const child=spawn(process.env.PYTHON_EXECUTABLE || 'python',[resolve('ai/chat.py')],{cwd:resolve('.'),windowsHide:true,stdio:['pipe','pipe','ignore'],env:{...process.env,PYTHONIOENCODING:'utf-8'}});
    let output='';
    const timer=setTimeout(()=>{child.kill();reject(new Error('AI phản hồi quá lâu. Hãy thử lại sau.'));},25000);
    child.on('error',error=>{clearTimeout(timer);reject(error);});
    child.stdout.on('data',chunk=>{output+=chunk.toString();if(output.length>10000)child.kill();});
    child.on('close',()=>{clearTimeout(timer);try{const result=JSON.parse(output);if(result.error)reject(new Error(result.error));else resolveReply(result);}catch{reject(new Error('AI chưa trả lời được.'));}});
    child.stdin.end(JSON.stringify(input));
  });
}
export async function pythonAI(input) {
  const result=await pythonRequest(input);
  if(typeof result.reply!=='string')throw new Error('AI chưa trả lời được.');
  return result.reply;
}
export async function pythonTriage(input) {
  const result=await pythonRequest({...input,mode:'triage'});
  if(!result.assessment||typeof result.assessment!=='object')throw new Error('AI chưa tạo được gợi ý sàng lọc.');
  return result.assessment;
}
