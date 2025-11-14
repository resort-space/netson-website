import { NextApiRequest, NextApiResponse } from 'next';
import { sign } from 'jsonwebtoken';

const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { username, password } = req.body;

    // Validate credentials
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      // Create JWT token
      const token = sign(
        { username, role: 'admin' },
        process.env.JWT_SECRET || 'gold-price-secret-key',
        { expiresIn: '24h' }
      );

      // Set HTTP-only cookie
      res.setHeader('Set-Cookie', `admin_token=${token}; HttpOnly; Path=/; Max-Age=86400; SameSite=Strict`);

      res.status(200).json({
        success: true,
        message: 'Đăng nhập thành công',
        user: { username, role: 'admin' }
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Tên đăng nhập hoặc mật khẩu không đúng'
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi đăng nhập'
    });
  }
}


