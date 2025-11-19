import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/database';
import { Article } from '@/lib/database';

// GET /api/articles/crud - Get all articles for admin (published and drafts)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status') || 'all'; // all, published, draft

    let query = `
      SELECT id, title, excerpt, slug, meta_title, meta_description, og_image, author, is_published, published_at, featured, view_count, reading_time_minutes, category, tags, created_at
      FROM articles
    `;

    const params: any[] = [];
    let paramIndex = 1;

    // Filter by status
    if (status === 'published') {
      query += ` WHERE is_published = $${paramIndex}`;
      params.push(true);
      paramIndex++;
    } else if (status === 'draft') {
      query += ` WHERE is_published = $${paramIndex}`;
      params.push(false);
      paramIndex++;
    }

    query += ` ORDER BY created_at DESC`;

    // Add pagination
    const offset = (page - 1) * limit;
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await db.query(query, params);

    // Get total count for pagination
    let countQuery = `SELECT COUNT(*) FROM articles`;
    if (status === 'published') {
      countQuery += ` WHERE is_published = true`;
    } else if (status === 'draft') {
      countQuery += ` WHERE is_published = false`;
    }

    const countResult = await db.query(countQuery);
    const totalCount = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      articles: result.rows,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
      }
    });

  } catch (error) {
    console.error('Error fetching articles for admin:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT /api/articles/crud - Update article
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, title, content, excerpt, slug, meta_title, meta_description, keywords, og_image, author, is_published, published_at, featured, category, tags } = body;

    if (!id || !title || !content) {
      return NextResponse.json({ error: 'ID, title and content are required' }, { status: 400 });
    }

    // Check if article exists
    const existing = await db.query('SELECT id FROM articles WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    // Generate slug if not provided
    let finalSlug = slug;
    if (!finalSlug) {
      finalSlug = title.toLowerCase()
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim('-');
    }

    // Check slug uniqueness (excluding current article)
    if (finalSlug) {
      const slugCheck = await db.query('SELECT id FROM articles WHERE slug = $1 AND id != $2', [finalSlug, id]);
      if (slugCheck.rows.length > 0) {
        return NextResponse.json({ error: 'Slug already exists' }, { status: 409 });
      }
    }

    // Calculate reading time
    const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    const readingTimeMinutes = Math.ceil(wordCount / 200);

    const query = `
      UPDATE articles
      SET title = $1, content = $2, excerpt = $3, slug = $4, meta_title = $5, meta_description = $6, keywords = $7, og_image = $8, author = $9, is_published = $10, published_at = $11, featured = $12, reading_time_minutes = $13, category = $14, tags = $15, updated_at = NOW()
      WHERE id = $16
      RETURNING *
    `;

    const values = [
      title, content, excerpt, finalSlug, meta_title, meta_description, keywords,
      og_image, author || 'NetSon', is_published !== undefined ? is_published : false,
      published_at, featured || false, readingTimeMinutes, category, tags || [], id
    ];

    const result = await db.query(query, values);
    const article = result.rows[0];

    return NextResponse.json(article);

  } catch (error) {
    console.error('Error updating article:', error);
    if ((error as any).code === '23505') {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE /api/articles/crud - Delete article
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    // Check if article exists
    const existing = await db.query('SELECT id FROM articles WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    await db.query('DELETE FROM articles WHERE id = $1', [id]);

    return NextResponse.json({ message: 'Article deleted' });

  } catch (error) {
    console.error('Error deleting article:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
