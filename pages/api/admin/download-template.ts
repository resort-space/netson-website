import { NextApiRequest, NextApiResponse } from 'next';
import * as XLSX from 'xlsx';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Sample data for template with *1000 units
    const sampleData = [
      {
        brand: 'SJC',
        buy_price: 7000,
        sell_price: 7200,
        date: '2025-01-01'
      },
      {
        brand: 'PNJ',
        buy_price: 6950,
        sell_price: 7150,
        date: '2025-01-01'
      },
      {
        brand: 'DOJI',
        buy_price: 6980,
        sell_price: 7180,
        date: '2025-01-01'
      },
      {
        brand: 'Phú Quý',
        buy_price: 6970,
        sell_price: 7170,
        date: '2025-01-01'
      },
      {
        brand: 'Bảo Tín Minh Châu',
        buy_price: 6960,
        sell_price: 7160,
        date: '2025-01-01'
      }
    ];

    // Create workbook
    const workbook = XLSX.utils.book_new();
    
    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    
    // Set column widths
    worksheet['!cols'] = [
      { width: 20 }, // brand
      { width: 15 }, // buy_price
      { width: 15 }, // sell_price
      { width: 15 }  // date
    ];

    // Add headers with units
    XLSX.utils.sheet_add_aoa(worksheet, [
      ['Thương hiệu', 'Giá mua (*1000 VNĐ)', 'Giá bán (*1000 VNĐ)', 'Ngày']
    ], { origin: 'A1' });

    // Add sample data starting from row 2
    XLSX.utils.sheet_add_json(worksheet, sampleData, { origin: 'A2' });

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Gold Prices Template');

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Set headers for file download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="gold-prices-template.xlsx"');
    res.setHeader('Content-Length', buffer.length);

    // Send file
    res.send(buffer);

  } catch (error) {
    console.error('Error generating template:', error);
    res.status(500).json({ message: 'Error generating template' });
  }
}
