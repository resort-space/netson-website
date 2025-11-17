import { NextRequest, NextResponse } from 'next/server';
import db from '../../../lib/database';
import { ApiResponse, Category } from '../../../types/api';

export async function GET(request: NextRequest) {
  try {
    const result = await db.query(`
      SELECT id, name, slug, description, image_url, banner_url, is_active, sort_order, created_at, updated_at
      FROM categories
      WHERE is_active = true
      ORDER BY sort_order ASC, name ASC
    `);

    const categories: Category[] = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description,
      slug: row.slug,
      image_url: row.image_url,
      banner_url: row.banner_url,
      is_active: row.is_active,
      sort_order: row.sort_order,
      created_at: row.created_at.toISOString(),
      updated_at: row.updated_at.toISOString()
    }));

    return NextResponse.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({
      success: false,
      message: 'Lỗi khi tải danh mục',
      error: 'Database error'
    }, { status: 500 });
  }
}
