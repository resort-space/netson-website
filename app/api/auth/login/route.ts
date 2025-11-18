import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    // Validate required fields
    if (!username || !password) {
      return NextResponse.json(
        { message: 'Tên đăng nhập và mật khẩu là bắt buộc' },
        { status: 400 }
      );
    }

    // Check credentials against environment variables
    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { message: 'Tên đăng nhập hoặc mật khẩu không đúng' },
        { status: 401 }
      );
    }

    // Create JWT token
    const token = jwt.sign(
      {
        username: ADMIN_USERNAME,
        role: 'admin',
        iat: Math.floor(Date.now() / 1000)
      },
      JWT_SECRET!,
      { expiresIn: '24h' }
    );

    // Create response with HTTP-only cookie for security
    const response = NextResponse.json({
      message: 'Đăng nhập thành công',
      success: true
    });

    // Set HTTP-only cookie with the token
    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Đã xảy ra lỗi server' },
      { status: 500 }
    );
  }
}
