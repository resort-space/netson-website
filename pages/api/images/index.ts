import { NextApiRequest, NextApiResponse } from 'next';
import db from '../../../lib/database';
import { ApiResponse, Image } from '../../../types/api';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Image[]>>
) {
  if (req.method === 'GET') {
    try {
      const {
        product_id,
        is_featured,
        limit = 50,
        offset = 0
      } = req.query;

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
        params.push(parseInt(product_id as string));
        paramIndex++;
      }

      if (is_featured === 'true') {
        query += ` AND is_featured = true`;
      }

      // Order by creation date (newest first)
      query += ' ORDER BY created_at DESC';

      // Add pagination
      query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(Number(limit), Number(offset));

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

      res.status(200).json({
        success: true,
        data: images
      });
    } catch (error) {
      console.error('Error fetching images:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi tải hình ảnh',
        error: 'Database error'
      });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({
      success: false,
      message: `Method ${req.method} not allowed`
    });
  }
}
