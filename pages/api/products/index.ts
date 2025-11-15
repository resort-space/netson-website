import { NextApiRequest, NextApiResponse } from 'next';
import db from '../../../lib/database';
import { ApiResponse, Product, ProductFilters } from '../../../types/api';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Product[]>>
) {
  if (req.method === 'GET') {
    try {
      const {
        category,
        price_min,
        price_max,
        is_featured,
        search,
        sort_by = 'default',
        page = 1,
        limit = 12
      } = req.query as ProductFilters & { page?: string; limit?: string };

      // First get products
      let query = `
        SELECT p.*, c.name as category_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.is_active = true
      `;

      const params: any[] = [];
      let paramIndex = 1;

      // Add filters
      if (category) {
        query += ` AND c.slug = $${paramIndex}`;
        params.push(category);
        paramIndex++;
      }

      if (price_min && !isNaN(Number(price_min))) {
        query += ` AND p.price >= $${paramIndex}`;
        params.push(Number(price_min));
        paramIndex++;
      }

      if (price_max && !isNaN(Number(price_max))) {
        query += ` AND p.price <= $${paramIndex}`;
        params.push(Number(price_max));
        paramIndex++;
      }

      if (is_featured) {
        query += ` AND p.is_featured = true`;
      }

      if (search && search.trim()) {
        query += ` AND (p.title ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex})`;
        params.push(`%${search.trim()}%`);
        paramIndex++;
      }

      // Add sorting
      switch (sort_by) {
        case 'popular':
          query += ' ORDER BY p.view_count DESC, p.likes DESC';
          break;
        case 'rating':
          query += ' ORDER BY p.rating DESC, p.likes DESC';
          break;
        case 'latest':
          query += ' ORDER BY p.created_at DESC';
          break;
        case 'price_low':
          query += ' ORDER BY p.price ASC';
          break;
        case 'price_high':
          query += ' ORDER BY p.price DESC';
          break;
        default:
          query += ' ORDER BY p.sort_order ASC, p.created_at DESC';
      }

      // Add pagination
      const offset = (Number(page) - 1) * Number(limit);
      query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(Number(limit), offset);

      const result = await db.query(query, params);

      // Fetch images for all products in this result set
      const productIds = result.rows.map(row => row.id);
      let imageResults: any = { rows: [] };
      if (productIds.length > 0) {
        const imageQuery = `
          SELECT product_id, array_agg(secure_url) as image_urls
          FROM images
          WHERE product_id = ANY($1)
          GROUP BY product_id
        `;
        imageResults = await db.query(imageQuery, [productIds]);
      }

      // Create a map of product_id to images
      const imageMap = new Map();
      imageResults.rows.forEach(row => {
        imageMap.set(row.product_id, row.image_urls || []);
      });

      const products: Product[] = result.rows.map(row => ({
        id: row.id,
        title: row.title,
        description: row.description,
        category_id: row.category_id,
        price: row.price ? Number(row.price) : null,
        images: imageMap.get(row.id) || [], // Get images from the map
        featured_image: row.featured_image,
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
        message: 'Lỗi khi tải sản phẩm',
        error: 'Database error'
      });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({
      success: false,
      message: `Method ${req.method} now allowed`
    });
  }
}
