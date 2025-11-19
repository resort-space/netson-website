// scripts/seed-blog-posts-corrected.js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DB_URL,
    ssl: {
        rejectUnauthorized: false,
    }
});

async function seedBlogPosts() {
    try {
        console.log('🌱 Đang tạo bài viết blog mẫu...');

        const articles = [{
                title: 'Hướng dẫn chọn loại cúp thể thao phù hợp cho giải đấu',
                content: '<h2>Giới thiệu</h2><p>Trong ngành sản xuất cúp vinh danh, việc lựa chọn loại cúp phù hợp cho từng giải đấu là yếu tố quan trọng để tôn vinh thành tích của vận động viên một cách xứng đáng.</p><h2>Các loại cúp phổ biến</h2><ul><li><strong>Cúp vàng:</strong> Dành cho vị trí cao nhất, thường cao 30-50cm</li><li><strong>Cúp bạc:</strong> Dành cho vị trí thứ 2, kích thước nhỏ hơn cúp vàng</li><li><strong>Cúp đồng:</strong> Dành cho vị trí thứ 3, kích thước nhỏ nhất trong bộ ba</li></ul><h2>Lời khuyên từ NetSon</h2><p>NetSon chuyên sản xuất các loại cúp chất lượng cao với thiết kế theo yêu cầu riêng của khách hàng.</p>',
                excerpt: 'Tìm hiểu cách chọn loại cúp phù hợp cho các giải đấu thể thao.',
                slug: 'huong-dan-chon-cua-the-thao-phu-hop',
                meta_title: 'Hướng dẫn chọn loại cúp thể thao phù hợp | NetSon',
                meta_description: 'Tìm hiểu các loại cúp thể thao và cách chọn loại phù hợp cho giải đấu.',
                keywords: 'cúp thể thao, giải đấu, vinh danh, NetSon',
                og_image: 'https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?w=1200&h=630&fit=crop',
                author: 'NetSon',
                is_published: true,
                published_at: new Date(),
                featured: true,
                category: 'Cúp Thể Thao',
                tags: ['cúp thể thao', 'giải đấu', 'vinh danh']
            },
            {
                title: 'Ý nghĩa của cúp vinh danh trong doanh nghiệp',
                content: '<h2>Vai trò của cúp vinh danh trong doanh nghiệp</h2><p>Cúp vinh danh đóng vai trò quan trọng trong việc khen thưởng và động viên nhân viên, đối tác có thành tích xuất sắc.</p><h2>Lợi ích</h2><ul><li>Tăng động lực làm việc</li><li>Tạo văn hóa công ty tích cực</li><li>Tăng uy tín thương hiệu</li></ul><h2>Thiết kế chuyên nghiệp</h2><p>NetSon cung cấp dịch vụ chế tác cúp vinh danh với thiết kế độc đáo theo yêu cầu.</p>',
                excerpt: 'Khám phá ý nghĩa và lợi ích của việc sử dụng cúp vinh danh trong doanh nghiệp.',
                slug: 'y-nghia-cup-vinh-danh-trong-doanh-nghiep',
                meta_title: 'Ý nghĩa cúp vinh danh trong doanh nghiệp | NetSon',
                meta_description: 'Tìm hiểu vai trò và lợi ích của cúp vinh danh đối với doanh nghiệp.',
                keywords: 'cúp vinh danh, doanh nghiệp, khen thưởng, NetSon',
                og_image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1200&h=630&fit=crop',
                author: 'NetSon',
                is_published: true,
                published_at: new Date(),
                featured: false,
                category: 'Cúp Vinh Danh',
                tags: ['cúp vinh danh', 'doanh nghiệp', 'khen thưởng']
            },
            {
                title: 'Quy trình chế tác cúp theo yêu cầu riêng',
                content: '<h2>Quy trình làm việc chuyên nghiệp tại NetSon</h2><p>NetSon thực hiện quy trình chế tác cúp chuyên nghiệp từ tư vấn đến giao hàng.</p><h2>Các bước thực hiện</h2><ol><li>Tư vấn thiết kế</li><li>Phê duyệt mẫu</li><li>Sản xuất</li><li>Kiểm tra chất lượng</li><li>Giao hàng</li></ol><h2>Cam kết chất lượng</h2><p>Chúng tôi cam kết sản xuất cúp với chất lượng cao nhất.</p>',
                excerpt: 'Tìm hiểu quy trình chế tác cúp theo yêu cầu riêng tại NetSon.',
                slug: 'quy-trinh-che-tac-cup-theo-yeu-cau',
                meta_title: 'Quy trình chế tác cúp theo yêu cầu | NetSon',
                meta_description: 'Khám phá quy trình sản xuất cúp theo yêu cầu riêng.',
                keywords: 'chế tác cúp, theo yêu cầu, quy trình, NetSon',
                og_image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=630&fit=crop',
                author: 'NetSon',
                is_published: true,
                published_at: new Date(),
                featured: true,
                category: 'Cúp Chế Tác Theo Yêu Cầu',
                tags: ['chế tác cúp', 'theo yêu cầu', 'quy trình']
            }
        ];

        for (const article of articles) {
            const wordCount = article.content.replace(/<[^>]*>/g, '').split(/\s+/).length;
            const readingTimeMinutes = Math.ceil(wordCount / 200);

            await pool.query(
                'INSERT INTO articles (title, content, excerpt, slug, meta_title, meta_description, keywords, og_image, author, is_published, published_at, featured, reading_time_minutes, category, tags) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) ON CONFLICT (slug) DO NOTHING', [
                    article.title, article.content, article.excerpt, article.slug,
                    article.meta_title, article.meta_description, article.keywords, article.og_image,
                    article.author, article.is_published, article.published_at, article.featured,
                    readingTimeMinutes, article.category, article.tags
                ]
            );

            console.log('✅ Đã tạo bài viết:', article.title);
        }

        console.log('🎉 Hoàn thành tạo bài viết mẫu!');
    } catch (error) {
        console.error('❌ Lỗi khi tạo bài viết:', error);
    } finally {
        await pool.end();
        process.exit();
    }
}

seedBlogPosts();