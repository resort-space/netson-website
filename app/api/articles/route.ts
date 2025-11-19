import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/database';
import { Article } from '@/lib/database';

// GET /api/articles - Get all articles (frontend)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const featured = searchParams.get('featured') === 'true';

    let query = `
      SELECT id, title, excerpt, slug, meta_title, meta_description, og_image, author, published_at, featured, view_count, reading_time_minutes, category, tags, created_at
      FROM articles
      WHERE is_published = true
    `;

    const params: any[] = [];
    let paramIndex = 1;

    if (search) {
      query += ` AND (title ILIKE $${paramIndex} OR content ILIKE $${paramIndex} OR excerpt ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (featured) {
      query += ` AND featured = $${paramIndex}`;
      params.push(true);
      paramIndex++;
    }

    query += ` ORDER BY published_at DESC, created_at DESC`;

    // Add pagination
    const offset = (page - 1) * limit;
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await db.query(query, params);

    // Get total count for pagination
    let countQuery = `SELECT COUNT(*) FROM articles WHERE is_published = true`;
    if (search) {
      countQuery += ` AND (title ILIKE $1 OR content ILIKE $1 OR excerpt ILIKE $1)`;
    }
    if (featured) {
      countQuery += search ? ` AND featured = $2` : ` AND featured = $1`;
    }

    const countResult = await db.query(countQuery, search && featured ? [`%${search}%`, true] : search ? [`%${search}%`] : featured ? [true] : []);
    const totalCount = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      articles: result.rows,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching articles:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/articles - Create new article (admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      content,
      excerpt,
      slug,
      meta_title,
      meta_description,
      keywords,
      og_image,
      author,
      is_published,
      published_at,
      featured,
      category,
      tags
    } = body;

    // Validate required fields
    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    // Generate slug if not provided
    const finalSlug = slug || title.toLowerCase()
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');

    // Calculate reading time (roughly 200 words per minute)
    const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    const readingTimeMinutes = Math.ceil(wordCount / 200);

    const query = `
      INSERT INTO articles (
        title, content, excerpt, slug, meta_title, meta_description, keywords, og_image,
        author, is_published, published_at, featured, reading_time_minutes, category, tags
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *
    `;

    const values = [
      title, content, excerpt, finalSlug, meta_title, meta_description, keywords,
      og_image, author || 'NetSon', is_published !== undefined ? is_published : true,
      published_at || new Date().toISOString(),
      featured || false, readingTimeMinutes, category, tags || []
    ];

    const result = await db.query(query, values);
    const article = result.rows[0];

    return NextResponse.json(article, { status: 201 });

  } catch (error) {
    console.error('Error creating article:', error);
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Article with this slug already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
