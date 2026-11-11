import { createApplication } from './src/application.mjs';
const port = Number(process.env.PORT || 4178);
if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error('PORT phải từ 1024 đến 65535.');
const app = createApplication();
app.server.listen(port, '127.0.0.1', () => {
  console.log(`SafeVoice: http://127.0.0.1:${port}`);
  console.log('Chỉ dùng dữ liệu giả. Tài khoản ban đầu: data/first-login.txt (không đưa lên Git).');
});
app.server.on('error', e => { console.error(e.code === 'EADDRINUSE' ? `Cổng ${port} đang được sử dụng. Đóng bản cũ hoặc chọn PORT khác.` : 'Không khởi động được máy chủ.'); app.close(); process.exitCode = 1; });
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => { app.server.close(() => { app.close(); process.exit(0); }); });
