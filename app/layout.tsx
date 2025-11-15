import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { BrandProvider } from '../contexts/BrandContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'NetSon - Chuyên Sản Xuất Cúp Vinh Danh Chuyên Nghiệp',
  description: 'NetSon chuyên sản xuất và chế tác các loại cúp, huy chương, bằng khen vinh danh chất lượng cao. Thiết kế theo yêu cầu, giao hàng trên toàn quốc.',
  keywords: 'cúp vinh danh, cúp thể thao, huy chương, bằng khen, chế tác theo yêu cầu, NetSon',
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
