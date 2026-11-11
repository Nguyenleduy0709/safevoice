import nodemailer from 'nodemailer';

export function emailSenderFromEnvironment(env = process.env) {
  const {SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM} = env;
  if (![SMTP_HOST,SMTP_USER,SMTP_PASS,SMTP_FROM].every(Boolean)) return null;
  const port = Number(SMTP_PORT || 465);
  if (![465,587].includes(port)) throw new Error('SMTP_PORT phải là 465 hoặc 587.');
  const transport = nodemailer.createTransport({host:SMTP_HOST,port,secure:port===465,requireTLS:port===587,auth:{user:SMTP_USER,pass:SMTP_PASS},tls:{minVersion:'TLSv1.2'},connectionTimeout:10000,greetingTimeout:10000,socketTimeout:15000});
  return async ({to,code}) => {
    await transport.sendMail({from:SMTP_FROM,to,subject:'Mã xác nhận SafeVoice',text:`Mã xác nhận SafeVoice của bạn: ${code}\n\nMã có hiệu lực 10 phút. Nếu bạn không yêu cầu mã, hãy bỏ qua email này. Không gửi mã cho người khác.`,disableFileAccess:true,disableUrlAccess:true});
  };
}
