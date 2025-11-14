import { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/lib/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { brand, period = 'month' } = req.query;
      
      let dateFilter = '';
      const params: any[] = [];
      let paramIndex = 1;
      
      // Calculate date range based on period
      const now = new Date();
      let startDate = new Date();
      
      switch (period) {
        case 'day':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'week':
          startDate.setDate(now.getDate() - 30);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 6);
          break;
        case 'year':
          startDate.setFullYear(now.getFullYear() - 5);
          break;
        case 'decade':
          startDate.setFullYear(now.getFullYear() - 10);
          break;
        case '50years':
          startDate.setFullYear(now.getFullYear() - 50);
          break;
        default:
          startDate.setMonth(now.getMonth() - 6);
      }
      
      dateFilter = ` AND date >= $${paramIndex}`;
      params.push(startDate.toISOString().split('T')[0]);
      paramIndex++;
      
      let query = `
        SELECT 
          date,
          brand,
          AVG(buy_price) as buy_price,
          AVG(sell_price) as sell_price,
          AVG((buy_price + sell_price) / 2) as average_price
        FROM gold_prices 
        WHERE 1=1
        ${dateFilter}
      `;
      
      if (brand) {
        query += ` AND brand = $${paramIndex}`;
        params.push(brand);
        paramIndex++;
      }
      
      query += `
        GROUP BY date, brand
        ORDER BY date ASC, brand ASC
      `;
      
      const result = await pool.query(query, params);
      
      // Return data as array format for the chart component
      const chartData = result.rows.map(row => ({
        date: row.date,
        brand: row.brand,
        buy_price: parseFloat(row.buy_price),
        sell_price: parseFloat(row.sell_price),
        average_price: parseFloat(row.average_price)
      }));
      
      res.status(200).json({
        success: true,
        data: chartData,
        period,
        startDate: startDate.toISOString().split('T')[0],
        endDate: now.toISOString().split('T')[0]
      });
    } catch (error) {
      console.error('Error fetching chart data:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error fetching chart data',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
