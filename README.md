# ☕ The CoffeeHome - Ứng dụng kinh doanh nước uống trực tuyến

**The CoffeeHome** là một ứng dụng thương mại điện tử chuyên kinh doanh các sản phẩm cà phê, được phát triển dựa trên MERN Stack (MongoDB, Express, React, Node.js). Người dùng có thể đăng ký, đặt hàng, thanh toán qua VNPay hoặc thanh toán khi nhận hàng (COD), nhận hóa đơn qua email, theo dõi đơn hàng, và quản lý tài khoản cá nhân. Quản trị viên có thể quản lý sản phẩm, người dùng, đơn hàng và thống kê doanh thu.

---

## 🎯 Tính năng

### 👤 Người dùng
- Đăng ký / Đăng nhập với email kèm mã xác nhận (qua EmailJS)
- Xem danh sách sản phẩm theo loại, tìm kiếm (gợi ý tìm kiếm thông minh) và lọc sản phẩm
- Xem chi tiết sản phẩm và các sản phẩm liên quan
- Thêm sản phẩm vào giỏ hàng
- Đặt hàng và thanh toán qua VNPay hoặc COD
- Nhận email xác nhận đơn hàng (hóa đơn điện tử)
- Xem lịch sử đơn hàng và cập nhật trạng thái đơn hàng
- Nhắn tin với chatbot hoặc Admin
- Đánh giá sản phẩm đã mua

### 👨‍💼 Quản trị viên
- Quản lý đơn hàng / cập nhật đơn hàng
- Quản lý sản phẩm
- Quản lý loại sản phẩm
- Quản lý người dùng
- Quản lý đánh giá sản phẩm và phản hồi đánh giá
- Xem thống kê doanh thu từ các đơn hàng đã hoàn tất
- Nhắn tin với người dùng

---

## 🛠 Công nghệ sử dụng

|                 | Công nghệ                                  |
|-----------------|--------------------------------------------|
| **Frontend**    | ReactJS, HTML, CSS                         |
| **Backend**     | Express.js, MongoDB, Mongoose              |
| **Email**       | EmailJS                                    |
| **Thanh toán**  | VNPay API (tích hợp sandbox)               |
| **Thống kê**    | Ant Design Statistic, Biểu đồ doanh thu    |

---

## Hướng dẫn cài đặt
1. Clone project
- git clone https://github.com/your-username/thecoffeehome.git
- cd thecoffeehome

2. Cài đặt và chạy frontend
- cd client
- npm install
- npm start

3. Cài đặt và chạy backend
- cd server
- npm install
- node server.js
  
---

## Tác giả
Tên: [Nguyễn Huy Bảo]

Email: [nhbao27204@gmail.com]
