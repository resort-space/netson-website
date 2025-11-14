import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { BrandProvider } from '../contexts/BrandContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Giá Vàng Việt Nam - Gold Price Vietnam',
  description: 'Theo dõi giá vàng mới nhất tại Việt Nam với biểu đồ trực quan và cập nhật theo thời gian thực',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className={inter.className}>
        <BrandProvider>
          {children}
        </BrandProvider>
      </body>
    </html>
  );
}
