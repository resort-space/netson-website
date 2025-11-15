// Seed sample products for NetSon
const { Pool } = require('pg');
require('dotenv').config();

// Database connection
const pool = new Pool({
  connectionString: process.env.DB_URL,
  ssl: {
    rejectUnauthorized: false,
  }
});

const sampleProducts = [
  {
    title: 'Cúp Vinh Danh Vàng Đồng Cao Cấp',
    description: 'Cúp vinh danh được chế tác từ vàng đồng cao cấp, thiết kế tinh tế phù hợp cho các lễ trao giải quan trọng. Chất liệu vàng đồng nguyên khối, bề mặt hoàn thiện bóng bẩy.',
    category_id: 1, // Cúp Vinh Danh
    price: 1500000,
    meta_description: 'Cúp vinh danh vàng đồng cao cấp, thiết kế tinh tế cho lễ trao giải',
    materials: 'Vàng Đồng',
    customization_available: true,
    is_featured: true,
    is_active: true,
    stock_quantity: 50
  },
  {
    title: 'Cúp Thể Thao Vàng Marathon Giải Nhất',
    description: 'Cúp thể thao chuyên nghiệp cho giải marathon, thiết kế với hình dạng huy chương kết hợp cúp đứng. Phù hợp cho các giải đấu thể thao quốc tế.',
    category_id: 2, // Cúp Thể Thao
    price: 2200000,
    meta_description: 'Cúp thể thao vàng marathon giải nhất, thiết kế chuyên nghiệp',
    materials: 'Vàng Đồng, Acrylic',
    customization_available: true,
    is_featured: true,
    is_active: true,
    stock_quantity: 30
  },
  {
    title: 'Bảng Vinh Danh Công Ty Cao Cấp',
    description: 'Bảng vinh danh được thiết kế chuyên nghiệp cho doanh nghiệp, sử dụng chất liệu gỗ quý và khắc lazer công nghệ cao. Phù hợp treo tại văn phòng.',
    category_id: 3, // Bảng Vinh Danh
    price: 3500000,
    meta_description: 'Bảng vinh danh công ty cao cấp, khắc lazer công nghệ cao',
    materials: 'Gỗ Óc Chó, Vàng Đồng',
    customization_available: true,
    is_featured: false,
    is_active: true,
    stock_quantity: 20
  },
  {
    title: 'Kỷ Niệm Chương Đồng Xuất Sắc',
    description: 'Kỷ niệm chương được chế tác tinh xảo từ đồng nguyên khối, phù hợp làm quà tặng nhân dịp kỷ niệm quan trọng, thành tích xuất sắc.',
    category_id: 4, // Kỷ Niệm Chương
    price: 800000,
    meta_description: 'Kỷ niệm chương đồng xuất sắc, quà tặng ý nghĩa',
    materials: 'Đồng Nguyên Khối',
    customization_available: true,
    is_featured: false,
    is_active: true,
    stock_quantity: 100
  },
  {
    title: 'Cúp Chế Tác Theo Yêu Cầu - Thiết Kế Riêng',
    description: 'Dịch vụ chế tác cúp theo yêu cầu riêng biệt của khách hàng. Thiết kế từ đầu với concept độc đáo, chất liệu cao cấp, phù hợp từng nhu cầu cụ thể.',
    category_id: 5, // Cúp Chế Tác Theo Yêu Cầu
    price: null, // Custom pricing
    meta_description: 'Cúp chế tác theo yêu cầu riêng, thiết kế độc đáo và tinh tế',
    materials: 'Tùy theo yêu cầu',
    customization_available: true,
    is_featured: true,
    is_active: true,
    stock_quantity: 1
  },
  {
    title: 'Bộ Sưu Tập Cúp Vinh Danh Đã Thực Hiện',
    description: 'Bộ sưu tập các mẫu cúp vinh danh đã được chế tác thành công cho khách hàng. Mỗi mẫu đều được thiết kế riêng biệt theo concept của từng dự án.',
    category_id: 6, // Sản Phẩm Đã Thực Hiện
    price: null,
    meta_description: 'Bộ sưu tập cúp vinh danh đã thực hiện thành công',
    materials: 'Đa dạng chất liệu',
    customization_available: false,
    is_featured: false,
    is_active: true,
    stock_quantity: 0
  },
  {
    title: 'Cúp Vinh Danh Acrylic Trong Suốt',
    description: 'Cúp vinh danh được chế tác từ acrylic cao cấp, thiết kế hiện đại với hiệu ứng trong suốt tạo cảm giác sang trọng và tinh tế.',
    category_id: 1, // Cúp Vinh Danh
    price: 950000,
    meta_description: 'Cúp vinh danh acrylic trong suốt, thiết kế hiện đại tinh tế',
    materials: 'Acrylic Cao Cấp',
    customization_available: true,
    is_featured: false,
    is_active: true,
    stock_quantity: 75
  },
  {
    title: 'Cúp Thể Thao Bóng Đá Siêu Cúp',
    description: 'Cúp thể thao dành cho giải bóng đá siêu cúp, thiết kế với hình ảnh quả bóng kết hợp cúp đứng tạo cảm giác mạnh mẽ và chuyên nghiệp.',
    category_id: 2, // Cúp Thể Thao
    price: 2800000,
    meta_description: 'Cúp thể thao bóng đá siêu cúp, thiết kế mạnh mẽ chuyên nghiệp',
    materials: 'Vàng Đồng, Acrylic',
    customization_available: true,
    is_featured: false,
    is_active: true,
    stock_quantity: 25
  }
];

async function seedProducts() {
  try {
    console.log('🌱 Seeding sample products...');

    for (const product of sampleProducts) {
      // Generate slug
      const slug = product.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();

      await pool.query(`
        INSERT INTO products (
          title, description, category_id, price, meta_description, slug,
          is_featured, is_active, stock_quantity, materials, customization_available
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
        )
        ON CONFLICT (slug) DO NOTHING
      `, [
        product.title,
        product.description,
        product.category_id,
        product.price,
        product.meta_description,
        slug,
        product.is_featured,
        product.is_active,
        product.stock_quantity,
        product.materials,
        product.customization_available
      ]);

      console.log(`✅ Created product: ${product.title}`);
    }

    console.log('🎉 Sample products seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding products:', error);
  } finally {
    await pool.end();
  }
}

seedProducts();
