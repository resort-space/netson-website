import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/database';

// GET /api/articles/[slug] - Get single article by slug
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    // Get article with full content for viewing
    const query = `
      SELECT id, title, content, excerpt, slug, meta_title, meta_description, keywords,
             og_image, author, published_at, featured, view_count, reading_time_minutes,
             category, tags, created_at
      FROM articles
      WHERE slug = $1 AND is_published = true
    `;

    const result = await db.query(query, [slug]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    let article = result.rows[0];

    // Increment view count
    await db.query(
      'UPDATE articles SET view_count = view_count + 1 WHERE id = $1',
      [article.id]
    );

    // Update local article object
    article.view_count += 1;

    return NextResponse.json(article);

  } catch (error) {
    console.error('Error fetching article:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
