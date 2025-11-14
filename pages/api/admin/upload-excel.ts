import { NextApiRequest, NextApiResponse } from 'next';
import multer from 'multer';
import * as XLSX from 'xlsx';
import pool from '../../../lib/database';

// Extend NextApiRequest to include file property
interface NextApiRequestWithFile extends NextApiRequest {
  file?: Express.Multer.File;
}

// Configure multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

// Helper function to run multer middleware
const runMiddleware = (req: NextApiRequest, res: NextApiResponse, fn: any) => {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
};

export default async function handler(req: NextApiRequestWithFile, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Run multer middleware
    await runMiddleware(req, res, upload.single('file'));

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Parse Excel file
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    // Skip header row and process data
    const rows = data.slice(1);
    let updatedCount = 0;
    let errors: string[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i] as any[];
      
      if (row.length < 4) continue;

      const brand = row[0];
      const buyPrice = row[1];
      const sellPrice = row[2];
      const date = row[3];

      // Validate data
      if (!brand || !buyPrice || !sellPrice || !date) {
        errors.push(`Row ${i + 2}: Missing required data`);
        continue;
      }

      try {
        // Convert *1000 units to actual VND values
        const actualBuyPrice = Math.round(parseFloat(buyPrice) * 1000);
        const actualSellPrice = Math.round(parseFloat(sellPrice) * 1000);

        // Validate prices
        if (actualBuyPrice <= 0 || actualSellPrice <= 0) {
          errors.push(`Row ${i + 2}: Invalid price values`);
          continue;
        }

        // Insert or update price
        const result = await pool.query(`
          INSERT INTO gold_prices (brand, buy_price, sell_price, date)
          VALUES ($1, $2, $3, $4)
          ON CONFLICT (brand, date) 
          DO UPDATE SET 
            buy_price = EXCLUDED.buy_price,
            sell_price = EXCLUDED.sell_price,
            updated_at = CURRENT_TIMESTAMP
        `, [brand, actualBuyPrice, actualSellPrice, date]);

        updatedCount++;
      } catch (error) {
        errors.push(`Row ${i + 2}: ${error}`);
      }
    }

    if (updatedCount > 0) {
      res.status(200).json({
        success: true,
        message: `Upload thành công! Đã cập nhật ${updatedCount} bản ghi`,
        updatedCount,
        errors: errors.length > 0 ? errors : undefined
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Không có dữ liệu nào được cập nhật',
        errors
      });
    }

  } catch (error) {
    console.error('Error processing Excel file:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi xử lý file Excel',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
