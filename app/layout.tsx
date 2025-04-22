import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";

// تعريف خط القاهرة للدعم العربي
const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  variable: '--font-cairo',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: "لوحة تحكم OmniMart",
  description: "لوحة تحكم للتجارة الإلكترونية لإدارة المنتجات والطلبات والفئات والخصومات",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${cairo.variable} font-cairo antialiased bg-gray-50 dark:bg-gray-900`}>
        {children}
      </body>
    </html>
  );
}
