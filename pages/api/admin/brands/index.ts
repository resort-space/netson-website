import { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/lib/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { name, description, isActive } = req.body;
      
      // Validation
      if (!name || !name.trim()) {
        return res.status(400).json({
          success: false,
          error: 'Tên thương hiệu không được để trống'
        });
      }

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

      // Kiểm tra brand đã tồn tại chưa
      const existingBrand = await pool.query(
        'SELECT id FROM brands WHERE name = $1',
        [name.trim()]
      );
      
      if (existingBrand.rows.length > 0) {
        return res.status(400).json({ 
          success: false, 
          error: 'Thương hiệu này đã tồn tại' 
        });
      }
      
      // Thêm brand mới vào database
      const result = await pool.query(
        `INSERT INTO brands (name, description, is_active) 
         VALUES ($1, $2, $3) 
         RETURNING id, name, description, is_active, created_at`,
        [name.trim(), description || '', isActive !== false]
      );
      
      const newBrand = result.rows[0];
      
      res.status(200).json({
        success: true,
        message: 'Thêm thương hiệu thành công',
        data: newBrand
      });
    } catch (error) {
      console.error('Error creating brand:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace',
        error: error
      });
      res.status(500).json({ 
        success: false, 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
