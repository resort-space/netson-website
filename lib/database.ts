import { Pool } from 'pg';

// Load environment variables
const DB_URL = process.env.DB_URL

const pool = new Pool({
  connectionString: DB_URL,
  ssl: {
    rejectUnauthorized: false,
    checkServerIdentity: () => undefined
  },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

let isInitialized = false;

// Create tables if they don't exist
async function initializeDatabase() {
  if (isInitialized) return;

  try {
    // NetSon Database Schema
    // Categories for products
    await pool.query(`
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
    `);

    // Products table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
        price DECIMAL(10,2),
        images JSONB DEFAULT '[]'::jsonb,
        featured_image VARCHAR(255),
        meta_description TEXT,
        slug VARCHAR(255) UNIQUE,
        is_featured BOOLEAN DEFAULT false,
        is_active BOOLEAN DEFAULT true,
        stock_quantity INTEGER DEFAULT 0,
        weight_grams DECIMAL(5,2),
        dimensions_cm JSONB,
        materials VARCHAR(255),
        customization_available BOOLEAN DEFAULT true,
        sort_order INTEGER DEFAULT 0,
        view_count INTEGER DEFAULT 0,
        likes INTEGER DEFAULT 0,
        rating DECIMAL(3,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Images table for tracking Cloudinary uploads
    await pool.query(`
      CREATE TABLE IF NOT EXISTS images (
        id SERIAL PRIMARY KEY,
        public_id VARCHAR(255) NOT NULL UNIQUE,
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
    `);

    // Articles/Blog posts for SEO
    await pool.query(`
      CREATE TABLE IF NOT EXISTS articles (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        excerpt TEXT,
        slug VARCHAR(255) UNIQUE,
        meta_title VARCHAR(255),
        meta_description TEXT,
        keywords VARCHAR(500),
        og_image TEXT,
        author VARCHAR(100) DEFAULT 'NetSon',
        is_published BOOLEAN DEFAULT true,
        published_at TIMESTAMP,
        featured BOOLEAN DEFAULT false,
        view_count INTEGER DEFAULT 0,
        reading_time_minutes INTEGER,
        category VARCHAR(100),
        tags TEXT[],
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Site settings for banners, pop-ups, etc.
    await pool.query(`
      CREATE TABLE IF NOT EXISTS site_settings (
        id SERIAL PRIMARY KEY,
        key VARCHAR(100) NOT NULL UNIQUE,
        value TEXT,
        description TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Product variants
    await pool.query(`
      CREATE TABLE IF NOT EXISTS product_variants (
        id SERIAL PRIMARY KEY,
        product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
        name VARCHAR(100),
        price_modifier DECIMAL(8,2) DEFAULT 0,
        stock_quantity INTEGER,
        is_available BOOLEAN DEFAULT true,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Indexes for performance
    await pool.query(`
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
    `);

    // Insert default categories
    await pool.query(`
      INSERT INTO categories (name, description, slug, sort_order) VALUES
        ('Cúp Vinh Danh', 'Chuyên sản xuất cúp vinh danh chất lượng cao với thiết kế tinh tế', 'cup-vinh-danh', 1),
        ('Cúp Thể Thao', 'Cúp thể thao chuyên nghiệp cho các giải đấu và sự kiện', 'cup-the-thao', 2),
        ('Bảng Vinh Danh', 'Bảng vinh danh cao cấp cho công ty và tổ chức', 'bang-vinh-danh', 3),
        ('Kỷ Niệm Chương', 'Kỷ niệm chương chất lượng cao lưu truyền giá trị qua thời gian', 'ky-niem-chuong', 4),
        ('Cúp Chế Tác Theo Yêu Cầu', 'Thiết kế và chế tác cúp theo yêu cầu riêng biệt', 'cup-che-tac-yeu-cau', 5),
        ('Sản Phẩm Đã Thực Hiện', 'Bộ sưu tập các sản phẩm đã hoàn thành xuất sắc', 'san-pham-da-thuc-hien', 6)
      ON CONFLICT (name) DO NOTHING;
    `);

    // Insert default site settings
    await pool.query(`
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
    `);

    isInitialized = true;
    console.log('✅ NetSon database tables initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
  }
}

// Initialize database on connection
pool.on('connect', async () => {
  console.log('✅ Database connected successfully to new Supabase');
  await initializeDatabase();
});

pool.on('error', (err: any) => {
  console.error('❌ Database connection error:', err);
  if (err.code === 'XX000') {
    console.error('💡 This usually means:');
    console.error('   - Wrong username/password');
    console.error('   - Project not found');
    console.error('   - Database not created');
  }
  if (err.code === '28P01') {
    console.error('💡 Authentication failed:');
    console.error('   - Check username/password');
    console.error('   - Verify connection string format');
  }
});

// Export pool with initialization check
export default {
  query: async (text: string, params?: any[]) => {
    try {
      if (!isInitialized) {
        await initializeDatabase();
      }
      return pool.query(text, params);
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  },
  connect: () => pool.connect(),
  end: () => pool.end(),
  pool
};

// NetSon Database Types
export interface Category {
  id: number;
  name: string;
  description?: string;
  slug: string;
  image_url?: string;
  banner_url?: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: number;
  title: string;
  description?: string;
  category_id?: number;
  price: number | null;
  images: string[]; // Array of image URLs
  featured_image?: string | null;
  meta_description?: string;
  slug?: string;
  is_featured: boolean;
  is_active: boolean;
  stock_quantity: number;
  weight_grams: number | null;
  dimensions_cm?: { height?: number; width?: number; depth?: number };
  materials?: string;
  customization_available: boolean;
  sort_order: number;
  view_count: number;
  likes: number;
  rating: number;
  created_at: string;
  updated_at: string;
  category?: Category;
}

export interface Image {
  id: number;
  public_id: string;
  url: string;
  secure_url: string;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
  folder?: string;
  alt_text?: string;
  title?: string;
  product_id?: number;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Article {
  id: number;
  title: string;
  content: string;
  excerpt?: string;
  slug?: string;
  meta_title?: string;
  meta_description?: string;
  keywords?: string;
  og_image?: string;
  author: string;
  is_published: boolean;
  published_at?: string;
  featured: boolean;
  view_count: number;
  reading_time_minutes?: number;
  category?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface SiteSetting {
  id: number;
  key: string;
  value?: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductVariant {
  id: number;
  product_id: number;
  name: string;
  price_modifier: number;
  stock_quantity?: number;
  is_available: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}
