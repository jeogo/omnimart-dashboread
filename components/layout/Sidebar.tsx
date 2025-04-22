"use client";

import { useState } from 'react';
import Link from 'next/link';

interface NavItemProps {
  href: string;
  label: string;
  icon: React.ReactNode;
  active?: boolean;
  collapsed?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ href, label, icon, active = false, collapsed = false }) => {
  return (
    <li>
      <Link 
        href={href} 
        className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
          active 
            ? 'bg-blue-50 text-blue-600 dark:bg-blue-900 dark:bg-opacity-20 dark:text-blue-400' 
            : 'hover:bg-gray-100 dark:hover:bg-gray-800'
        }`}
        title={label}
      >
        <span className="w-5 h-5 flex-shrink-0">{icon}</span>
        {!collapsed && <span className="font-medium truncate">{label}</span>}
      </Link>
    </li>
  );
};

const Sidebar = ({ activePath = '' }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // أيقونات بسيطة للقائمة
  const DashboardIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
      <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
      <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
    </svg>
  );

  const ProductsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
    </svg>
  );

  const OrdersIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
      <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
    </svg>
  );

  const CategoriesIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
      <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
    </svg>
  );

  const DiscountsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
    </svg>
  );

  const MenuIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );

  const ChevronLeftIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
  );

  const ChevronRightIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
    </svg>
  );

  return (
    <>
      {/* Sidebar for desktop */}
      <aside 
        className={`hidden md:block fixed inset-y-0 right-0 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 z-20 shadow-sm transition-all duration-300 ${
          collapsed ? 'w-16' : 'w-64'
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-gray-200 dark:border-gray-700 px-4">
          {!collapsed && (
            <h2 className="text-xl font-bold text-gray-800 dark:text-white truncate">OmniMart</h2>
          )}
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-400"
            aria-label={collapsed ? "توسيع القائمة" : "طي القائمة"}
          >
            {collapsed ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </button>
        </div>
        
        {!collapsed && (
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">لوحة تحكم المتجر</p>
          </div>
        )}
        
        <nav className="p-2 overflow-y-auto h-[calc(100vh-64px)]">
          <ul className="space-y-1">
            <NavItem 
              href="/dashboard" 
              label="لوحة التحكم" 
              icon={<DashboardIcon />} 
              active={activePath === '/dashboard'} 
              collapsed={collapsed}
            />
            <NavItem 
              href="/products" 
              label="المنتجات" 
              icon={<ProductsIcon />} 
              active={activePath === '/products'} 
              collapsed={collapsed}
            />
            <NavItem 
              href="/orders" 
              label="الطلبات" 
              icon={<OrdersIcon />}
              active={activePath === '/orders'} 
              collapsed={collapsed}
            />
            <NavItem 
              href="/categories" 
              label="الفئات" 
              icon={<CategoriesIcon />}
              active={activePath === '/categories'} 
              collapsed={collapsed}
            />
            <NavItem 
              href="/discounts" 
              label="الخصومات" 
              icon={<DiscountsIcon />}
              active={activePath === '/discounts'} 
              collapsed={collapsed}
            />
          </ul>
        </nav>
      </aside>

      {/* Mobile menu button */}
      <div className="fixed bottom-4 left-4 md:hidden z-40">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="فتح القائمة"
        >
          <MenuIcon />
        </button>
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setMobileOpen(false)}
        ></div>
      )}

      {/* Mobile sidebar */}
      <aside 
        className={`fixed inset-y-0 right-0 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 z-40 shadow-lg md:hidden w-3/4 max-w-xs transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-gray-200 dark:border-gray-700 px-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">OmniMart</h2>
          <button 
            onClick={() => setMobileOpen(false)}
            className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-400"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">لوحة تحكم المتجر</p>
        </div>
        
        <nav className="p-4 overflow-y-auto h-[calc(100vh-112px)]">
          <ul className="space-y-2">
            <NavItem 
              href="/dashboard" 
              label="لوحة التحكم" 
              icon={<DashboardIcon />} 
              active={activePath === '/dashboard'} 
            />
            <NavItem 
              href="/products" 
              label="المنتجات" 
              icon={<ProductsIcon />} 
              active={activePath === '/products'} 
            />
            <NavItem 
              href="/orders" 
              label="الطلبات" 
              icon={<OrdersIcon />}
              active={activePath === '/orders'} 
            />
            <NavItem 
              href="/categories" 
              label="الفئات" 
              icon={<CategoriesIcon />}
              active={activePath === '/categories'} 
            />
            <NavItem 
              href="/discounts" 
              label="الخصومات" 
              icon={<DiscountsIcon />}
              active={activePath === '/discounts'} 
            />
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
