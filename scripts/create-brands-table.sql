-- Tạo bảng brands để lưu trữ thông tin thương hiệu
CREATE TABLE IF NOT EXISTS brands (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Thêm dữ liệu mẫu
INSERT INTO brands (name, description, is_active) VALUES
    ('SJC', 'SJC Gold', true),
    ('PNJ', 'Phú Nhuận Jewelry', true),
    ('DOJI', 'DOJI Gold', true),
    ('Phú Quý', 'Phú Quý Gold', true),
    ('Bảo Tín Minh Châu', 'Bảo Tín Minh Châu Gold', true)
ON CONFLICT (name) DO NOTHING;

-- Tạo index để tối ưu query
CREATE INDEX IF NOT EXISTS idx_brands_name ON brands(name);
CREATE INDEX IF NOT EXISTS idx_brands_active ON brands(is_active);

