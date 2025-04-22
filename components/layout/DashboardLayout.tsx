"use client";

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  
  // Set mounted state after component mounts to avoid hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) return null;
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar activePath={pathname} />
      
      <div className="md:mr-64 transition-all duration-300">
        <Header title={getPageTitle(pathname)} />
        
        <main className="p-4 md:p-6 pt-20 md:pt-24 pb-16 md:pb-6">
          {children}
        </main>
      </div>
    </div>
  );
};

// استخراج عنوان الصفحة من المسار
function getPageTitle(pathname: string): string {
  switch (pathname) {
    case '/dashboard':
      return 'لوحة التحكم';
    case '/products':
      return 'المنتجات';
    case '/orders':
      return 'الطلبات';
    case '/categories':
      return 'الفئات';
    case '/discounts':
      return 'الخصومات';
    default:
      return 'لوحة التحكم';
  }
}

export default DashboardLayout;
