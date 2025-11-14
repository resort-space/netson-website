# Giá Vàng Việt Nam - Gold Price Vietnam

Một trang web cập nhật giá vàng mới nhất tại Việt Nam với cả server-side rendering và static generation để tối ưu hóa SEO.

A website for tracking the latest gold prices in Vietnam with both server-side rendering and static generation for SEO optimization.

## 🌟 Tính năng chính / Key Features

- **Cập nhật giá vàng theo thời gian thực** / Real-time gold price updates
- **Hỗ trợ 5 thương hiệu uy tín** / Support for 5 trusted brands: SJC, PNJ, DOJI, Phú Quý, Bảo Tín Minh Châu
- **Biểu đồ giá vàng chi tiết** / Detailed gold price charts
- **Hỗ trợ đa ngôn ngữ** / Multi-language support (Vietnamese/English)
- **Tối ưu hóa SEO** / SEO optimized
- **Responsive design** / Mobile-friendly
- **Admin panel** / Quản trị dữ liệu
- **Auto-refresh** / Tự động cập nhật

## 🚀 Công nghệ sử dụng / Tech Stack

### Backend
- **Node.js** + **Express** (API routes)
- **PostgreSQL** (Supabase)
- **Next.js API Routes**

### Frontend
- **Next.js 14** (App Router)
- **React 18** + **TypeScript**
- **Tailwind CSS**
- **Chart.js** (Biểu đồ)
- **Lucide React** (Icons)

### Database
- **PostgreSQL** hosted on Supabase
- **Connection pooling** for performance

## 📋 Yêu cầu hệ thống / Requirements

- Node.js 18+ 
- npm hoặc yarn
- PostgreSQL database (Supabase)

## 🛠️ Cài đặt / Installation

### 1. Clone repository
```bash
git clone <repository-url>
cd gold-price-full
```

### 2. Cài đặt dependencies
```bash
npm install
```

### 3. Cấu hình môi trường / Environment Setup
Tạo file `.env.local` với các thông tin sau:

```env
DB_PASS=your_supabase_password
DB_URL=your_supabase_connection_string
DB_USER=your_supabase_username
NEXTAUTH_SECRET=your_secret_key
NEXTAUTH_URL=http://localhost:3000
```

### 4. Thiết lập database / Database Setup
```bash
# Tạo bảng và index
npm run db:migrate

# Thêm dữ liệu mẫu (optional)
npm run db:seed
```

### 5. Chạy ứng dụng / Run Application
```bash
# Development
npm run dev

# Production build
npm run build
npm start
```

## 🗄️ Cấu trúc Database / Database Schema

### Bảng `gold_prices`
```sql
CREATE TABLE gold_prices (
  id SERIAL PRIMARY KEY,
  brand VARCHAR(50) NOT NULL,
  buy_price DECIMAL(10,2) NOT NULL,
  sell_price DECIMAL(10,2) NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Indexes
- `idx_gold_prices_brand_date` on (brand, date)
- `idx_gold_prices_date` on (date)

## 📱 API Endpoints

### Public APIs
- `GET /api/gold-prices` - Lấy danh sách giá vàng
- `GET /api/gold-prices/chart` - Lấy dữ liệu biểu đồ

### Admin APIs
- `POST /api/admin/update-price` - Cập nhật giá thủ công
- `POST /api/admin/upload-excel` - Tải lên file Excel

## 🎨 Giao diện / UI Components

### Components chính
- `Header` - Navigation và language switcher
- `GoldPriceCard` - Hiển thị giá vàng từng thương hiệu
- `GoldPriceChart` - Biểu đồ giá vàng với Chart.js

### Pages
- `/` - Trang chủ với giá vàng mới nhất
- `/admin` - Trang quản trị
- `/chart` - Trang biểu đồ chi tiết

## 🌐 Đa ngôn ngữ / Internationalization

Hỗ trợ 2 ngôn ngữ:
- **Tiếng Việt** (mặc định)
- **English**

Sử dụng Next.js i18n và custom translation system.

## 📊 Biểu đồ / Charts

### Thời gian / Time Periods
- 7 ngày / 7 days
- 30 ngày / 30 days  
- 6 tháng / 6 months
- 5 năm / 5 years
- 10 năm / 10 years
- 50 năm / 50 years

### Loại dữ liệu / Data Types
- Giá mua vào / Buy price
- Giá bán ra / Sell price
- Giá trung bình / Average price

## 🔄 Auto-refresh

Tự động cập nhật dữ liệu mỗi 1 tiếng trong khung giờ 9h sáng - 7h tối.

## 📱 Responsive Design

- Mobile-first approach
- Tailwind CSS breakpoints
- Touch-friendly interactions
- Optimized for all screen sizes

## 🚀 Deployment

### Render.com
1. Connect GitHub repository
2. Set environment variables
3. Deploy automatically on push

### Environment Variables for Production
```env
DB_PASS=your_production_db_password
DB_URL=your_production_db_url
DB_USER=your_production_db_user
NEXTAUTH_SECRET=your_production_secret
NEXTAUTH_URL=https://your-domain.com
```

## 📈 SEO Optimization

- Server-side rendering (SSR)
- Static generation (SSG)
- Meta tags optimization
- Open Graph tags
- Structured data
- Sitemap generation
- Performance optimization

## 🔒 Security

- Input validation
- SQL injection prevention
- File upload restrictions
- Environment variable protection
- HTTPS enforcement

## 📝 License

MIT License

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📞 Support

Nếu có vấn đề hoặc câu hỏi, vui lòng tạo issue trên GitHub.

For support or questions, please create an issue on GitHub.

## 🔄 Changelog

### v1.0.0
- Initial release
- Basic gold price tracking
- Admin panel
- Multi-language support
- Responsive design
- Chart functionality


