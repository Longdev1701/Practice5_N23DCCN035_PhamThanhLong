const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// ========================
// CẤU HÌNH CƠ BẢN
// ========================

// Phục vụ file tĩnh từ thư mục "public"
app.use(express.static(path.join(__dirname, 'public')));

// Middleware parse JSON body (cho các request POST)
app.use(express.json());

// ========================
// MIDDLEWARE
// ========================

/**
 * Logger Middleware
 * Ghi log mọi request theo định dạng: [YYYY-MM-DD HH:mm:ss] METHOD /path
 */
const logger = (req, res, next) => {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');

  const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
};

// Gắn logger cho tất cả các route
app.use(logger);

/**
 * checkAge Middleware
 * Kiểm tra tham số "age" từ query hoặc body:
 *  - Nếu age không tồn tại hoặc < 18 → trả về 400
 *  - Nếu hợp lệ → gọi next()
 */
const checkAge = (req, res, next) => {
  // Lấy age từ query params (GET) hoặc body (POST)
  const age = Number(req.query.age || req.body.age);

  if (!age || age < 18) {
    return res.status(400).json({ error: 'Bạn chưa đủ 18 tuổi' });
  }

  next();
};

// ========================
// ROUTING
// ========================

// Biến đếm ID tự tăng (giả lập database)
let currentId = 0;

/**
 * GET /api/info
 * - Gắn middleware checkAge để kiểm tra tuổi trước
 * - Nhận query params: name, age
 * - Trả về JSON chứa thông tin và lời chào
 */
app.get('/api/info', checkAge, (req, res) => {
  const { name, age } = req.query;

  res.json({
    name,
    age: Number(age),
    message: `Chào mừng ${name}!`
  });
});

/**
 * POST /api/register
 * - Nhận body: name, age, email
 * - Validation: kiểm tra đầy đủ các trường
 * - Trả về JSON chứa thông tin đăng ký kèm ID tự tăng
 */
app.post('/api/register', (req, res) => {
  const { name, age, email } = req.body;

  // Kiểm tra thiếu trường
  if (!name || !age || !email) {
    return res.status(400).json({
      error: 'Vui lòng cung cấp đầy đủ thông tin: name, age, email'
    });
  }

  // Tăng ID và trả về kết quả
  currentId++;

  res.json({
    id: currentId,
    name,
    age: Number(age),
    email,
    message: 'Đăng ký thành công!'
  });
});

// ========================
// KHỞI ĐỘNG SERVER
// ========================
app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
