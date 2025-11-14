import { NextApiRequest, NextApiResponse } from 'next';
import { verify } from 'jsonwebtoken';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const token = req.cookies.admin_token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Không có token xác thực'
      });
    }

    // Verify JWT token
    const decoded = verify(token, process.env.JWT_SECRET || 'gold-price-secret-key') as any;

    if (decoded.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền truy cập'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Token hợp lệ',
      user: { username: decoded.username, role: decoded.role }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({
      success: false,
      message: 'Token không hợp lệ'
    });
  }
}


