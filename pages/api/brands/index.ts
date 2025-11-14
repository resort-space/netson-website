import { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/lib/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      // Tự động tạo bảng brands nếu chưa có
      await pool.query(`
        CREATE TABLE IF NOT EXISTS brands (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL UNIQUE,
          description TEXT,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Tạo index nếu chưa có
      await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_brands_name ON brands(name)
      `);
      
      await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_brands_active ON brands(is_active)
      `);

      // Thêm dữ liệu mẫu nếu bảng trống
      const countResult = await pool.query('SELECT COUNT(*) FROM brands');
      if (parseInt(countResult.rows[0].count) === 0) {
        await pool.query(`
          INSERT INTO brands (name, description, is_active) VALUES
            ('SJC', 'SJC Gold', true),
            ('PNJ', 'Phú Nhuận Jewelry', true),
            ('DOJI', 'DOJI Gold', true),
            ('Phú Quý', 'Phú Quý Gold', true),
            ('Bảo Tín Minh Châu', 'Bảo Tín Minh Châu Gold', true)
          ON CONFLICT (name) DO NOTHING
        `);
      }

      // Lấy tất cả brands (kể cả inactive) để debug
      const allBrands = await pool.query(
        'SELECT id, name, description, is_active, created_at, updated_at FROM brands ORDER BY name'
      );
      
      console.log('🔍 All brands (including inactive):', allBrands.rows);
      
      // Lấy chỉ active brands
      const result = await pool.query(
        'SELECT id, name, description, is_active, created_at, updated_at FROM brands WHERE is_active = true ORDER BY name'
      );
      
      console.log('🔍 Active brands only:', result.rows);
      console.log('📊 Active brands count:', result.rows.length);
      
      res.status(200).json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('Error fetching brands:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Internal server error' 
      });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
