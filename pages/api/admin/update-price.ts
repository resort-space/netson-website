import { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/lib/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { brand, buyPrice, sellPrice, date } = req.body;
      
      // Validation
      if (!brand || !buyPrice || !sellPrice || !date) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: brand, buyPrice, sellPrice, date'
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

      // Kiểm tra brand có tồn tại trong database không
      const brandExists = await pool.query(
        'SELECT id FROM brands WHERE name = $1 AND is_active = true',
        [brand]
      );
      
      if (brandExists.rows.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Thương hiệu không tồn tại hoặc đã bị vô hiệu hóa'
        });
      }
      
      // Check if price already exists for this brand and date
      const existingPrice = await pool.query(
        'SELECT id FROM gold_prices WHERE brand = $1 AND date = $2',
        [brand, date]
      );
      
      if (existingPrice.rows.length > 0) {
        // Update existing price
        await pool.query(
          `UPDATE gold_prices 
           SET buy_price = $1, sell_price = $2, updated_at = CURRENT_TIMESTAMP 
           WHERE brand = $3 AND date = $4`,
          [buyPrice, sellPrice, brand, date]
        );
      } else {
        // Insert new price
        await pool.query(
          `INSERT INTO gold_prices (brand, buy_price, sell_price, date) 
           VALUES ($1, $2, $3, $4)`,
          [brand, buyPrice, sellPrice, date]
        );
      }
      
      res.status(200).json({
        success: true,
        message: 'Gold price updated successfully',
        data: { brand, buyPrice, sellPrice, date }
      });
    } catch (error) {
      console.error('Error updating gold price:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Internal server error' 
      });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
