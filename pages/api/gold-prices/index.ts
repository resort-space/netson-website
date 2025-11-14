import { NextApiRequest, NextApiResponse } from 'next';
import pool from '../../../lib/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { brand, startDate, endDate, limit = 100 } = req.query;
      
      // Nếu không có brand cụ thể, lấy giá mới nhất của mỗi thương hiệu
      if (!brand) {
        const { days } = req.query;
        
        if (days && !isNaN(Number(days))) {
          // Lấy dữ liệu của N ngày gần nhất
          const daysQuery = `
            SELECT *
            FROM gold_prices 
            WHERE date >= CURRENT_DATE - INTERVAL '${days} days'
            ORDER BY brand ASC, date DESC, created_at DESC
          `;
          const result = await pool.query(daysQuery);
          
          // Nếu không có dữ liệu, tạo dữ liệu mặc định cho tất cả thương hiệu
          if (result.rows.length === 0) {
            const brands = ['SJC', 'PNJ', 'DOJI', 'Phú Quý', 'Bảo Tín Minh Châu'];
            const today = new Date();
            const defaultData = [];
            
            for (const brand of brands) {
              // Tạo giá mặc định (có thể thay đổi)
              const basePrice = 70000000; // 70,000,000 VND
              const buyPrice = basePrice - 1000000; // 69,000,000 VND
              const sellPrice = basePrice + 1000000; // 71,000,000 VND
              
              defaultData.push({
                id: Math.random(),
                brand: brand,
                buy_price: buyPrice,
                sell_price: sellPrice,
                date: today.toISOString().split('T')[0],
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              });
            }
            
            res.status(200).json({
              success: true,
              data: defaultData,
              count: defaultData.length
            });
            return;
          }
          
          res.status(200).json({
            success: true,
            data: result.rows,
            count: result.rows.length
          });
          return;
        } else {
          // Lấy giá mới nhất của mỗi thương hiệu (mặc định)
          const latestQuery = `
            SELECT DISTINCT ON (brand) *
            FROM gold_prices 
            ORDER BY brand ASC, date DESC, created_at DESC
          `;
          const result = await pool.query(latestQuery);
          
          res.status(200).json({
            success: true,
            data: result.rows,
            count: result.rows.length
          });
          return;
        }
      }
      
      // Nếu có brand cụ thể, lấy theo filter
      let filterQuery = `
        SELECT * FROM gold_prices 
        WHERE 1=1
      `;
      const params: any[] = [];
      let paramIndex = 1;
      
      if (brand) {
        filterQuery += ` AND brand = $${paramIndex}`;
        params.push(brand);
        paramIndex++;
      }
      
      if (startDate) {
        filterQuery += ` AND date >= $${paramIndex}`;
        params.push(startDate);
        paramIndex++;
      }
      
      if (endDate) {
        filterQuery += ` AND date <= $${paramIndex}`;
        params.push(endDate);
        paramIndex++;
      }
      
      filterQuery += ` ORDER BY date DESC, brand ASC LIMIT $${paramIndex}`;
      params.push(limit);
      
      const result = await pool.query(filterQuery, params);
      
      res.status(200).json({
        success: true,
        data: result.rows,
        count: result.rows.length
      });
    } catch (error) {
      console.error('Error fetching gold prices:', error);
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

