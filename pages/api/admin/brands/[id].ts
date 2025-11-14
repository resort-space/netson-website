import { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/lib/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  
  if (req.method === 'PUT') {
    try {
      const { name, description, isActive } = req.body;
      if (!name || !name.trim()) {
        return res.status(400).json({ success: false, error: 'Tên thương hiệu không được để trống' });
      }
      
      // Kiểm tra brand có tồn tại không
      const existingBrand = await pool.query(
        'SELECT id FROM brands WHERE id = $1',
        [id]
      );
      
      if (existingBrand.rows.length === 0) {
        return res.status(404).json({ 
          success: false, 
          error: 'Không tìm thấy thương hiệu' 
        });
      }
      
      // Kiểm tra tên mới có trùng với brand khác không
      const duplicateName = await pool.query(
        'SELECT id FROM brands WHERE name = $1 AND id != $2',
        [name.trim(), id]
      );
      
      if (duplicateName.rows.length > 0) {
        return res.status(400).json({ 
          success: false, 
          error: 'Tên thương hiệu này đã tồn tại' 
        });
      }
      
      // Cập nhật brand trong database
      const result = await pool.query(
        `UPDATE brands 
         SET name = $1, description = $2, is_active = $3, updated_at = CURRENT_TIMESTAMP 
         WHERE id = $4 
         RETURNING id, name, description, is_active, updated_at`,
        [name.trim(), description || '', isActive !== false, id]
      );
      
      const updatedBrand = result.rows[0];
      
      res.status(200).json({ 
        success: true, 
        message: 'Cập nhật thương hiệu thành công', 
        data: updatedBrand 
      });
    } catch (error) {
      console.error('Error updating brand:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  } else if (req.method === 'DELETE') {
    try {
      // Kiểm tra brand có tồn tại không
      const existingBrand = await pool.query(
        'SELECT id FROM brands WHERE id = $1',
        [id]
      );
      
      if (existingBrand.rows.length === 0) {
        return res.status(404).json({ 
          success: false, 
          error: 'Không tìm thấy thương hiệu' 
        });
      }
      
      // Xóa brand (soft delete - set is_active = false)
      await pool.query(
        'UPDATE brands SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
        [id]
      );
      
      res.status(200).json({ 
        success: false, 
        message: 'Xóa thương hiệu thành công', 
        data: { id: parseInt(id as string) } 
      });
    } catch (error) {
      console.error('Error deleting brand:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
