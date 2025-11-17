import { NextRequest, NextResponse } from 'next/server';
import db from '../../../lib/database';
import { ApiResponse, Image } from '../../../types/api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const product_id = searchParams.get('product_id');
    const is_featured = searchParams.get('is_featured') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50') || 50;
    const offset = parseInt(searchParams.get('offset') || '0') || 0;

    let query = `
      SELECT id, public_id, url, secure_url, width, height, format, bytes,
             folder, alt_text, title, product_id, is_featured, sort_order, created_at, updated_at
      FROM images
      WHERE 1=1
    `;

    const params: any[] = [];
    let paramIndex = 1;

    // Add filters
    if (product_id) {
      query += ` AND product_id = $${paramIndex}`;
      params.push(parseInt(product_id));
      paramIndex++;
    }

    if (is_featured) {
      query += ` AND is_featured = true`;
    }

    // Order by creation date (newest first)
    query += ' ORDER BY created_at DESC';

    // Add pagination
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await db.query(query, params);

    const images: Image[] = result.rows.map(row => ({
      id: row.id,
      public_id: row.public_id,
      url: row.url,
      secure_url: row.secure_url,
      width: row.width,
      height: row.height,
      format: row.format,
      bytes: row.bytes,
      folder: row.folder,
      alt_text: row.alt_text,
      title: row.title,
      product_id: row.product_id,
      is_featured: row.is_featured,
      sort_order: row.sort_order,
      created_at: row.created_at.toISOString(),
      updated_at: row.updated_at.toISOString()
    }));

    return NextResponse.json({
      success: true,
      data: images
    });
  } catch (error) {
    console.error('Error fetching images:', error);
    return NextResponse.json({
      success: false,
      message: 'Lỗi khi tải hình ảnh',
      error: 'Database error'
    }, { status: 500 });
  }
}
