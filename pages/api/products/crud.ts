import { NextApiRequest, NextApiResponse } from 'next';
import db from '../../../lib/database';
import { ApiResponse, CreateProductRequest, UpdateProductRequest, Product } from '../../../types/api';

// Helper function to generate slug
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim();
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<any>>
) {
  switch (req.method) {
    case 'GET':
      return handleGet(req, res);
    case 'POST':
      return handlePost(req, res);
    case 'PUT':
      return handlePut(req, res);
    case 'DELETE':
      return handleDelete(req, res);
    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      res.status(405).json({
        success: false,
        message: `Method ${req.method} not allowed`
      });
  }
}

// GET - Fetch all products (admin view, includes non-active)
async function handleGet(req: NextApiRequest, res: NextApiResponse<ApiResponse<Product[]>>) {
  try {
    const query = `
      SELECT
        p.*,
        c.name as category_name,
        array_agg(i.secure_url) FILTER (WHERE i.secure_url IS NOT NULL) as image_urls
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN images i ON i.product_id = p.id
      GROUP BY p.id, c.name
      ORDER BY p.sort_order ASC, p.created_at DESC
    `;

    const result = await db.query(query);

    const products: Product[] = result.rows.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      category_id: row.category_id,
      price: row.price ? Number(row.price) : null,
      images: row.image_urls || [],
      featured_image: row.featured_image || (row.image_urls?.[0] || null),
      meta_description: row.meta_description,
      slug: row.slug,
      is_featured: row.is_featured,
      is_active: row.is_active,
      stock_quantity: row.stock_quantity,
      weight_grams: row.weight_grams ? Number(row.weight_grams) : null,
      dimensions_cm: row.dimensions_cm,
      materials: row.materials,
      customization_available: row.customization_available,
      sort_order: row.sort_order,
      view_count: row.view_count,
      likes: row.likes,
      rating: Number(row.rating),
      created_at: row.created_at.toISOString(),
      updated_at: row.updated_at.toISOString(),
      category: row.category_name ? {
        id: row.category_id,
        name: row.category_name,
        slug: '',
        is_active: true,
        sort_order: 0,
        created_at: '',
        updated_at: ''
      } : undefined
    }));

    res.status(200).json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tải sản phẩm'
    });
  }
}

// POST - Create new product
async function handlePost(req: NextApiRequest, res: NextApiResponse<ApiResponse<Product>>) {
  try {
    const {
      title,
      description,
      category_id,
      price,
      meta_description,
      is_featured,
      is_active,
      materials,
      customization_available,
      stock_quantity,
      weight_grams,
      dimensions_cm
    }: CreateProductRequest = req.body;

    // Validate required fields
    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Tên sản phẩm không được để trống'
      });
    }

    // Check if category exists if provided
    if (category_id) {
      const categoryCheck = await db.query('SELECT id FROM categories WHERE id = $1', [category_id]);
      if (categoryCheck.rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Danh mục không tồn tại'
        });
      }
    }

    // Generate slug
    const slug = generateSlug(title);

    // Check slug uniqueness
    const slugCheck = await db.query('SELECT id FROM products WHERE slug = $1', [slug]);
    if (slugCheck.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Tên sản phẩm đã tồn tại, vui lòng chọn tên khác'
      });
    }

    const result = await db.query(`
      INSERT INTO products (
        title, description, category_id, price, meta_description, slug,
        is_featured, is_active, stock_quantity, weight_grams, dimensions_cm,
        materials, customization_available, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW()
      )
      RETURNING *
    `, [
      title.trim(),
      description || '',
      category_id || null,
      price || null,
      meta_description || '',
      slug,
      is_featured || false,
      is_active !== false, // Default true unless explicitly false
      stock_quantity || 0,
      weight_grams || null,
      dimensions_cm || null,
      materials || '',
      customization_available !== false // Default true unless explicitly false
    ]);

    const newProduct: Product = {
      id: result.rows[0].id,
      title: result.rows[0].title,
      description: result.rows[0].description,
      category_id: result.rows[0].category_id,
      price: result.rows[0].price ? Number(result.rows[0].price) : null,
      images: [],
      featured_image: null,
      meta_description: result.rows[0].meta_description,
      slug: result.rows[0].slug,
      is_featured: result.rows[0].is_featured,
      is_active: result.rows[0].is_active,
      stock_quantity: result.rows[0].stock_quantity,
      weight_grams: result.rows[0].weight_grams ? Number(result.rows[0].weight_grams) : null,
      dimensions_cm: result.rows[0].dimensions_cm,
      materials: result.rows[0].materials,
      customization_available: result.rows[0].customization_available,
      sort_order: result.rows[0].sort_order,
      view_count: result.rows[0].view_count,
      likes: result.rows[0].likes,
      rating: Number(result.rows[0].rating),
      created_at: result.rows[0].created_at.toISOString(),
      updated_at: result.rows[0].updated_at.toISOString()
    };

    res.status(201).json({
      success: true,
      data: newProduct,
      message: 'Tạo sản phẩm thành công'
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Lỗi khi tạo sản phẩm'
    });
  }
}

// PUT - Update product
async function handlePut(req: NextApiRequest, res: NextApiResponse<ApiResponse<Product>>) {
  try {
    const { id } = req.query;
    const updates: UpdateProductRequest = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu ID sản phẩm'
      });
    }

    // Build dynamic update query
    const updateFields: string[] = [];
    const updateValues: any[] = [];
    let paramIndex = 1;

    // Handle each possible field
    if (updates.title !== undefined) {
      if (!updates.title.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Tên sản phẩm không được để trống'
        });
      }
      const newSlug = generateSlug(updates.title);
      // Check slug uniqueness (excluding current product)
      const slugCheck = await db.query('SELECT id FROM products WHERE slug = $1 AND id != $2', [newSlug, id]);
      if (slugCheck.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Tên sản phẩm đã tồn tại, vui lòng chọn tên khác'
        });
      }
      updateFields.push(`title = $${paramIndex}, slug = $${paramIndex + 1}`);
      updateValues.push(updates.title.trim(), newSlug);
      paramIndex += 2;
    }

    if (updates.description !== undefined) {
      updateFields.push(`description = $${paramIndex}`);
      updateValues.push(updates.description);
      paramIndex++;
    }

    if (updates.category_id !== undefined) {
      if (updates.category_id) {
        const categoryCheck = await db.query('SELECT id FROM categories WHERE id = $1', [updates.category_id]);
        if (categoryCheck.rows.length === 0) {
          return res.status(400).json({
            success: false,
            message: 'Danh mục không tồn tại'
          });
        }
      }
      updateFields.push(`category_id = $${paramIndex}`);
      updateValues.push(updates.category_id || null);
      paramIndex++;
    }

    if (updates.price !== undefined) {
      updateFields.push(`price = $${paramIndex}`);
      updateValues.push(updates.price);
      paramIndex++;
    }

    if (updates.meta_description !== undefined) {
      updateFields.push(`meta_description = $${paramIndex}`);
      updateValues.push(updates.meta_description);
      paramIndex++;
    }

    if (updates.is_featured !== undefined) {
      updateFields.push(`is_featured = $${paramIndex}`);
      updateValues.push(updates.is_featured);
      paramIndex++;
    }

    if (updates.is_active !== undefined) {
      updateFields.push(`is_active = $${paramIndex}`);
      updateValues.push(updates.is_active);
      paramIndex++;
    }

    if (updates.stock_quantity !== undefined) {
      updateFields.push(`stock_quantity = $${paramIndex}`);
      updateValues.push(updates.stock_quantity);
      paramIndex++;
    }

    if (updates.weight_grams !== undefined) {
      updateFields.push(`weight_grams = $${paramIndex}`);
      updateValues.push(updates.weight_grams);
      paramIndex++;
    }

    if (updates.dimensions_cm !== undefined) {
      updateFields.push(`dimensions_cm = $${paramIndex}`);
      updateValues.push(updates.dimensions_cm);
      paramIndex++;
    }

    if (updates.materials !== undefined) {
      updateFields.push(`materials = $${paramIndex}`);
      updateValues.push(updates.materials);
      paramIndex++;
    }

    if (updates.customization_available !== undefined) {
      updateFields.push(`customization_available = $${paramIndex}`);
      updateValues.push(updates.customization_available);
      paramIndex++;
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Không có trường nào được cập nhật'
      });
    }

    const query = `
      UPDATE products
      SET ${updateFields.join(', ')}, updated_at = NOW()
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    updateValues.push(id);

    const result = await db.query(query, updateValues);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Sản phẩm không tồn tại'
      });
    }

    const updatedProduct: Product = {
      id: result.rows[0].id,
      title: result.rows[0].title,
      description: result.rows[0].description,
      category_id: result.rows[0].category_id,
      price: result.rows[0].price ? Number(result.rows[0].price) : null,
      images: [], // Would need separate query for images
      featured_image: null,
      meta_description: result.rows[0].meta_description,
      slug: result.rows[0].slug,
      is_featured: result.rows[0].is_featured,
      is_active: result.rows[0].is_active,
      stock_quantity: result.rows[0].stock_quantity,
      weight_grams: result.rows[0].weight_grams ? Number(result.rows[0].weight_grams) : null,
      dimensions_cm: result.rows[0].dimensions_cm,
      materials: result.rows[0].materials,
      customization_available: result.rows[0].customization_available,
      sort_order: result.rows[0].sort_order,
      view_count: result.rows[0].view_count,
      likes: result.rows[0].likes,
      rating: Number(result.rows[0].rating),
      created_at: result.rows[0].created_at.toISOString(),
      updated_at: result.rows[0].updated_at.toISOString()
    };

    res.status(200).json({
      success: true,
      data: updatedProduct,
      message: 'Cập nhật sản phẩm thành công'
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Lỗi khi cập nhật sản phẩm'
    });
  }
}

// DELETE - Delete product
async function handleDelete(req: NextApiRequest, res: NextApiResponse<ApiResponse<null>>) {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu ID sản phẩm'
      });
    }

    // Check if product exists
    const existing = await db.query('SELECT id FROM products WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Sản phẩm không tồn tại'
      });
    }

    // Delete product (cascade will handle related records if set up)
    await db.query('DELETE FROM products WHERE id = $1', [id]);

    res.status(200).json({
      success: true,
      data: null,
      message: 'Xóa sản phẩm thành công'
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa sản phẩm'
    });
  }
}
