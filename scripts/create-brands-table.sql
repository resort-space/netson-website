-- NetSon Database Schema
-- Categories for products
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    slug VARCHAR(100) NOT NULL UNIQUE,
    image_url TEXT,
    banner_url TEXT,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
    price DECIMAL(10,2),
    images JSONB DEFAULT '[]'::jsonb, -- Store array of Cloudinary image IDs
    featured_image VARCHAR(255),
    meta_description TEXT,
    slug VARCHAR(255) UNIQUE,
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    stock_quantity INTEGER DEFAULT 0,
    weight_grams DECIMAL(5,2),
    dimensions_cm JSONB, -- Store dimensions as JSON
    materials VARCHAR(255),
    customization_available BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Images table for tracking Cloudinary uploads
CREATE TABLE IF NOT EXISTS images (
    id SERIAL PRIMARY KEY,
    public_id VARCHAR(255) NOT NULL UNIQUE, -- Cloudinary public_id
    url TEXT NOT NULL,
    secure_url TEXT NOT NULL,
    width INTEGER,
    height INTEGER,
    format VARCHAR(20),
    bytes INTEGER,
    folder VARCHAR(100),
    alt_text VARCHAR(255),
    title VARCHAR(255),
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    is_featured BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Articles/Blog posts for SEO
CREATE TABLE IF NOT EXISTS articles (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    slug VARCHAR(255) UNIQUE,
    meta_title VARCHAR(255),
    meta_description TEXT,
    keywords VARCHAR(500),
    og_image TEXT, -- Open Graph image
    author VARCHAR(100) DEFAULT 'NetSon',
    is_published BOOLEAN DEFAULT true,
    published_at TIMESTAMP,
    featured BOOLEAN DEFAULT false,
    view_count INTEGER DEFAULT 0,
    reading_time_minutes INTEGER,
    category VARCHAR(100), -- Blog category like 'tips', 'news', etc.
    tags TEXT[], -- Array of tags
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Site settings for banners, pop-ups, etc.
CREATE TABLE IF NOT EXISTS site_settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) NOT NULL UNIQUE,
    value TEXT, -- JSON string for complex data
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Product variants (for customization)
CREATE TABLE IF NOT EXISTS product_variants (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    name VARCHAR(100), -- e.g. "Gold Plated", "Size: Small"
    price_modifier DECIMAL(8,2) DEFAULT 0,
    stock_quantity INTEGER,
    is_available BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(is_active);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_images_product_id ON images(product_id);
CREATE INDEX IF NOT EXISTS idx_images_public_id ON images(public_id);
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(is_published);
CREATE INDEX IF NOT EXISTS idx_articles_featured ON articles(featured);
CREATE INDEX IF NOT EXISTS idx_site_settings_key ON site_settings(key);

-- Insert default categories
INSERT INTO categories (name, description, slug, sort_order) VALUES
    ('Cúp Vinh Danh', 'Chuyên sản xuất cúp vinh danh chất lượng cao với thiết kế tinh tế', 'cup-vinh-danh', 1),
    ('Cúp Thể Thao', 'Cúp thể thao chuyên nghiệp cho các giải đấu và sự kiện', 'cup-the-thao', 2),
    ('Bảng Vinh Danh', 'Bảng vinh danh cao cấp cho công ty và tổ chức', 'bang-vinh-danh', 3),
    ('Kỷ Niệm Chương', 'Kỷ niệm chương chất lượng cao lưu truyền giá trị qua thời gian', 'ky-niem-chuong', 4),
    ('Cúp Chế Tác Theo Yêu Cầu', 'Thiết kế và chế tác cúp theo yêu cầu riêng biệt', 'cup-che-tac-yeu-cau', 5),
    ('Sản Phẩm Đã Thực Hiện', 'Bộ sưu tập các sản phẩm đã hoàn thành xuất sắc', 'san-pham-da-thuc-hien', 6)
ON CONFLICT (name) DO NOTHING;

-- Insert default site settings
INSERT INTO site_settings (key, value, description) VALUES
    ('site_name', '"NetSon"', 'Tên website'),
    ('hotline', '"1800-xxxx"', 'Số hotline'),
    ('email', '"info@netson.vn"', 'Email liên hệ'),
    ('banner_popup_enabled', 'true', 'Hiển thị banner pop-up'),
    ('banner_popup_image', 'null', 'URL ảnh banner pop-up'),
    ('banner_popup_link', 'null', 'Link khi click banner'),
    ('seo_google_verification', 'null', 'Google site verification code'),
    ('social_facebook', '"https://facebook.com/netson"', 'Link Facebook'),
    ('social_instagram', 'null', 'Link Instagram'),
    ('social_youtube', 'null', 'Link YouTube')
ON CONFLICT (key) DO NOTHING;
