# 🌟 NetSon - Website Cúp Vinh Danh Chuyên Nghiệp

Website chính thức của NetSon - chuyên sản xuất và phân phối các loại cúp vinh danh, huy chương, bảng khen, kỷ niệm chương chất lượng cao.

## 📋 Tổng quan

NetSon là nền tảng E-commerce chuyên nghiệp cho việc bán và quản lý cúp vinh danh, huy chương thể thao và kỷ niệm chương. Dự án được phát triển với công nghệ tiên tiến, thiết kế responsive và tối ưu SEO.

## ✨ Tính năng chính

### 🏆 Quản lý sản phẩm
- **6 danh mục sản phẩm chính**: Cúp Vinh Danh, Cúp Thể Thao, Bảng Vinh Danh, Kỷ Niệm Chương, Cúp Chế Tác Theo Yêu Cầu, Sản Phẩm Đã Thực Hiện
- **Thông tin chi tiết**: Giá cả, mô tả, chất liệu, kích thước, tồn kho
- **Sản phẩm nổi bật**: Hỗ trợ đánh dấu và ưu tiên hiển thị
- **Trình bày hình ảnh**: Hỗ trợ nhiều ảnh cho mỗi sản phẩm

### 🖼️ Quản lý hình ảnh
- **Upload ảnh lên Cloudinary**: Hỗ trợ PNG, JPG, GIF tối đa 5MB
- **Gán ảnh cho sản phẩm**: Giao diện dropdown dễ dàng gán ảnh cho sản phẩm
- **Quản lý metadata**: Tiêu đề, alt text, trạng thái featured
- **Gallery admin**: Xem và quản lý tất cả hình ảnh

### 🔍 Tìm kiếm & Lọc
- **Tìm kiếm theo từ khóa**: Tên sản phẩm và mô tả
- **Lọc theo danh mục**: Navigation menu phân loại sản phẩm
- **Sắp xếp**: Mặc định, phổ biến, đánh giá, mới nhất, giá thấp→cao, cao→thấp

### 🛠️ Admin Dashboard
- **Quản trị sản phẩm**: CRUD hoàn chỉnh (tạo/sửa/xóa/đọc)
- **Quản trị hình ảnh**: Upload và gán cho sản phẩm
- **Dashboard thống kê**: Số lượng sản phẩm, bài viết, hình ảnh
- **Authentication**: Bảo mật hệ thống admin

### 🎨 Giao diện & UX
- **Responsive Design**: Hoạt động tối ưu trên mọi thiết bị
- **UI/UX hiện đại**: Tailwind CSS với thiết kế chuyên nghiệp
- **Breadcrumb navigation**: Dễ dàng điều hướng
- **Popup banner**: Thông báo khuyến mãi khi truy cập lần đầu

## 🏗️ Kiến trúc hệ thống

### Tech Stack

#### Frontend
- **Next.js 14** (App Router)
- **React 18** + **TypeScript**
- **Tailwind CSS** (Styling)
- **Lucide React** (Icons)
- **Local Storage** (Client-side data)

#### Backend & Database
- **Next.js API Routes** (Built-in API)
- **PostgreSQL** + **Supabase** (Database)
- **Prisma/Direct SQL** (Database queries)

#### External Services
- **Cloudinary** (Image hosting & optimization)
- **Supabase** (Database hosting)

### Cấu trúc dự án

```
nets-website/
├── app/                          # Next.js App Router
│   ├── page.tsx                 # Trang chủ
│   ├── layout.tsx               # Root layout
│   ├── globals.css              # Global styles
│   ├── admin/
│   │   ├── page.tsx            # Admin dashboard
│   │   ├── products/           # Quản lý sản phẩm
│   │   ├── images/             # Quản lý hình ảnh
│   │   └── login/              # Admin authentication
│
├── components/                   # Reusable components
│   ├── Header.tsx              # Header navigation
│   ├── CategoryNavigation.tsx # Danh mục sản phẩm
│   ├── Banner.tsx              # Popup banner
│   └── Breadcrumb.tsx          # Breadcrumb navigation
│
├── lib/                         # Utilities & configs
│   ├── database.ts             # Database connection
│   └── utils/                  # Helper functions
│
├── pages/api/                   # API routes
│   ├── products/               # Product APIs
│   │   ├── index.ts           # Get products (public)
│   │   └── crud.ts            # Product CRUD (admin)
│   ├── images/                 # Image APIs
│   └── admin/                  # Admin APIs
│       ├── upload-image.ts    # Upload images
│       └── ...
│
├── types/                       # TypeScript definitions
│   └── api.ts                  # API response types
│
├── scripts/                     # Database scripts
│   ├── create-brands-table.sql
│   ├── migrate.js
│   └── seed-products.js        # Sample data
│
└── public/                      # Static assets
```

## 🗄️ Cấu trúc Database

### Bảng chính / Main Tables

#### `products` - Sản phẩm
```sql
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category_id INTEGER REFERENCES categories(id),
  price DECIMAL(10,2),          -- Giá sản phẩm
  meta_description TEXT,        -- SEO description
  slug VARCHAR(255) UNIQUE,     -- URL slug
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  stock_quantity INTEGER DEFAULT 0,
  weight_grams DECIMAL(8,2),
  dimensions_cm VARCHAR(100),
  materials VARCHAR(255),
  customization_available BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  featured_image TEXT,           -- URL ảnh nổi bật
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `images` - Hình ảnh
```sql
CREATE TABLE images (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id),
  cloudinary_id VARCHAR(255),     -- Cloudinary ID
  secure_url TEXT NOT NULL,       -- Cloudinary URL
  public_id VARCHAR(255),
  title VARCHAR(255),
  alt_text TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `categories` - Danh mục
```sql
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Indexes & Constraints
- Primary keys trên tất cả bảng
- Foreign key constraints giữa products ↔ categories, images ↔ products
- Unique constraints trên slug fields
- Indexes trên category_id, product_id, slug, is_active

## 🚀 Cài đặt & Chạy dự án

### Yêu cầu hệ thống
- Node.js 18+
- npm hoặc yarn
- PostgreSQL database (Supabase recommended)

### 1. Clone & Install
```bash
git clone <repository-url>
cd nets-website
npm install
```

### 2. Cấu hình môi trường
Tạo file `.env` với các thông tin:

```env
# Database (Supabase)
DB_URL=postgresql://username:password@host:port/database

# Cloudinary (nếu sử dụng)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_UPLOAD_PRESET=your_preset

# Admin Authentication
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password

# Next.js
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

### 3. Thiết lập Database
```bash
# Tạo tables & indexes
npm run db:migrate

# Thêm dữ liệu mẫu
npm run db:seed
```

### 4. Chạy ứng dụng
```bash
# Development
npm run dev

# Build for production
npm run build
npm start
```

## 📱 API Endpoints

### Public APIs
- `GET /api/products` - Lấy danh sách sản phẩm với lọc và sắp xếp
- `GET /api/categories` - Lấy danh sách danh mục

### Admin APIs
- `GET|POST|PUT|DELETE /api/products/crud` - CRUD sản phẩm
- `GET /api/images` - Lấy danh sách hình ảnh
- `POST /api/admin/upload-image` - Upload hình ảnh lên Cloudinary
- `POST /api/auth/login` - Đăng nhập admin
- `POST /api/auth/logout` - Đăng xuất

## 🎨 Components Chính

### Frontend Components
- **Header**: Navigation, logo, hotline, email
- **CategoryNavigation**: Menu danh mục với search bar
- **ProductCard**: Hiển thị sản phẩm với ảnh thumbnail
- **Banner**: Popup khi truy cập lần đầu
- **Breadcrumb**: Điều hướng trang

### Admin Components
- **AdminLayout**: Layout chung cho trang admin
- **ProductForm**: Form thêm/sửa sản phẩm
- **ImageManager**: Upload và gán ảnh cho sản phẩm
- **StatsCard**: Hiện thị thống kê dashboard

## 📦 Scripts hữu ích

```bash
npm run db:migrate    # Tạo database tables
npm run db:seed       # Thêm dữ liệu mẫu
npm run build         # Build production
npm run start         # Chạy production build
```

## 🚀 Tính năng nâng cao

### SEO Optimization
- Next.js SSR/SSG
- Meta tags động
- Structured data (JSON-LD)
- Sitemap generation

### Performance
- Image optimization (Cloudinary)
- Code splitting
- Lazy loading
- Database connection pooling

### Security
- Input validation
- SQL injection prevention
- File upload restrictions
- Admin authentication
- HTTPS enforcement

## 📊 Thống kê dự án

- **6 danh mục sản phẩm**
- **20+ APIs endpoints**
- **10+ UI components**
- **Responsive design** trên tất cả devices
- **Multi-role support** (Public/Admin)

## 🎯 Roadmap tương lai

### Phase 2
- [ ] **Product detail pages** - Trang chi tiết sản phẩm
- [ ] **Shopping cart** - Giỏ hàng (không thanh toán thực)
- [ ] **Blog system** - Viết bài SEO content

### Phase 3
- [ ] **Email subscription** - Đăng ký nhận tin
- [ ] **Contact form** - Form liên hệ
- [ ] **Analytics tracking** - Google Analytics
- [ ] **Performance monitoring**

## 🤝 Đóng góp

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/new-feature`)
3. Commit changes (`git commit -m 'Add new feature'`)
4. Push to branch (`git push origin feature/new-feature`)
5. Tạo Pull Request

## 📞 Hỗ trợ

- **Email**: support@netson.vn
- **Phone**: 0904.xxx.xxx
- **GitHub Issues**: Tạo issue cho lỗi hoặc tính năng mới

## 📝 License

MIT License - Được sử dụng thoải mái cho mục đích thương mại và cá nhân.

## 🔄 Changelog

### v1.0.0 - Initial Release
- ✅ **Trang chủ chuyên nghiệp** với sản phẩm và hình ảnh
- ✅ **Admin dashboard** hoàn chỉnh (CRUD sản phẩm, quản lý ảnh)
- ✅ **Responsive design** trên mobile & desktop
- ✅ **Database với PostgreSQL** + Supabase
- ✅ **Image hosting** với Cloudinary
- ✅ **SEO optimization** cơ bản
- ✅ **Authentication** cho admin

---

**NetSon - Nâng tầm giá trị của mọi sự kiện!** 🏆✨
