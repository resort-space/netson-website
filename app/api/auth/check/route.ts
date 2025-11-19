import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export async function GET(request: NextRequest) {
  try {
    // Get token from HTTP-only cookie
    const token = request.cookies.get('admin_token')?.value;

    if (!token) {
      return NextResponse.json(
        { authenticated: false, message: 'Không có token xác thực' },
        { status: 401 }
      );
    }

    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET!) as jwt.JwtPayload;

    // Check if token is valid and contains admin role
    if (!decoded.role || decoded.role !== 'admin') {
      return NextResponse.json(
        { authenticated: false, message: 'Token không hợp lệ' },
        { status: 401 }
      );
    }

    // Token is valid
    return NextResponse.json({
      authenticated: true,
      user: {
        username: decoded.username,
        role: decoded.role
      }
    });

  } catch (error) {
    console.error('Auth check error:', error);

    // Check if it's a JWT error
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { authenticated: false, message: 'Token không hợp lệ' },
        { status: 401 }
      );
    }

    if (error instanceof jwt.TokenExpiredError) {
      return NextResponse.json(
        { authenticated: false, message: 'Token đã hết hạn' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { authenticated: false, message: 'Lỗi xác thực' },
      { status: 500 }
    );
  }
}
