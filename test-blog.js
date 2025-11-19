const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DB_URL,
    ssl: { rejectUnauthorized: false }
});

async function testBlog() {
    try {
        console.log('🧪 Testing NetSon blog system...');

        // Test insert
        const article = {
            title: 'Chào mừng blog NetSon',
            content: '<h1>Blog đầu tiên!</h1><p>Chào mừng bạn đến với hệ thống blog của NetSon!</p><p>Hệ thống này giúp chúng tôi chia sẻ kiến thức về cúp vinh danh và các giải pháp chế tác chuyên nghiệp.</p>',
            excerpt: 'Bai viết chào mừng đầu tiên của blog NetSon',
            slug: 'chao-mung-blog-netson',
            author: 'NetSon',
            is_published: true,
            published_at: new Date(),
            featured: true,
            category: 'Chào mừng'
        };

        const wordCount = article.content.replace(/<[^>]*>/g, '').split(/\s+/).length;
        const readingTimeMinutes = Math.ceil(wordCount / 200);

        await pool.query(`
      INSERT INTO articles (
        title, content, excerpt, slug, author, is_published, published_at, featured,
        reading_time_minutes, category
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (slug) DO NOTHING
    `, [
            article.title, article.content, article.excerpt, article.slug,
            article.author, article.is_published, article.published_at, article.featured,
            readingTimeMinutes, article.category
        ]);

        console.log('✅ Đã tạo bài viết test!');
        console.log('🎯 Bạn có thể xem tại: http://localhost:3000/blog');
        console.log('📝 Link bài viết: http://localhost:3000/blog/chao-mung-blog-netson');

    } catch (error) {
        console.error('❌ Lỗi:', error);
    } finally {
        await pool.end();
        process.exit();
    }
}

testBlog();