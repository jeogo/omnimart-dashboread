"use client";

import { useState, useEffect } from 'react';
import {  Product, Order, Category, Discount } from '@/types';
import StatsCard from '@/components/dashboard/StatsCard';
import RecentOrdersTable from '@/components/dashboard/RecentOrdersTable';
import TopProductsTable from '@/components/dashboard/TopProductsTable';
import SalesChart from '@/components/dashboard/SalesChart';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { apiUtils } from '@/utils/apiUtils';

interface Statistics {
  totalSales: number;
  totalOrders: number;
  totalCustomers: number;
  topSellingProducts: {
    productId: string;
    productName: string;
    unitsSold: number;
    totalRevenue: number;
  }[];
  recentOrders: Order[];
  salesByDate: { date: string; amount: number }[];
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [stats, setStats] = useState<Statistics | null>(null);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [productsData, ordersData, categoriesData, discountsData] = await Promise.all([
          apiUtils.getAllProducts(),
          apiUtils.getAllOrders(),
          apiUtils.getAllCategories(),
          apiUtils.getAllDiscounts(),
        ]);
        setProducts(productsData);
        setOrders(ordersData);
        setCategories(categoriesData);
        setDiscounts(discountsData);
        setStats(calculateStatistics(productsData, ordersData, categoriesData));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'حدث خطأ أثناء جلب البيانات');
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  const calculateStatistics = (products: Product[], orders: Order[], categories: Category[]): Statistics => {
    let totalSales = 0;
    const uniqueCustomers = new Set<string>();
    orders.forEach(order => {
      totalSales += order.totalAmount || 0;
      if (order.customerPhone) uniqueCustomers.add(order.customerPhone);
    });
    const productSales = new Map<string, { productId: string, productName: string, unitsSold: number, totalRevenue: number }>();
    orders.forEach(order => {
      order.products?.forEach(item => {
        const productId = typeof item.product === 'string' ? item.product : (item.product as any)?._id || '';
        const productName = item.productName || '';
        const quantity = item.quantity || 0;
        const price = item.price || 0;
        if (!productId) return;
        if (productSales.has(productId)) {
          const current = productSales.get(productId)!;
          current.unitsSold += quantity;
          current.totalRevenue += price * quantity;
        } else {
          productSales.set(productId, {
            productId,
            productName,
            unitsSold: quantity,
            totalRevenue: price * quantity
          });
        }
      });
    });
    const topProducts = Array.from(productSales.values())
      .sort((a, b) => b.unitsSold - a.unitsSold)
      .slice(0, 5);
    const salesByDate = new Map<string, number>();
    const last30Days = new Array(30).fill(0).map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();
    last30Days.forEach(date => salesByDate.set(date, 0));
    orders.forEach(order => {
      const orderDate = new Date(order.createdAt ?? '1970-01-01').toISOString().split('T')[0];
      if (salesByDate.has(orderDate)) {
        salesByDate.set(orderDate, (salesByDate.get(orderDate) || 0) + (order.totalAmount || 0));
      }
    });
    const formattedSalesByDate = Array.from(salesByDate.entries()).map(([date, amount]) => ({ date, amount }));
    return {
      totalSales,
      totalOrders: orders.length,
      totalCustomers: uniqueCustomers.size,
      topSellingProducts: topProducts,
      recentOrders: orders.sort((a, b) => new Date(b.createdAt ?? '1970-01-01').getTime() - new Date(a.createdAt ?? '1970-01-01').getTime()).slice(0, 5),
      salesByDate: formattedSalesByDate
    };
  };

  if (loading || !stats) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-500 dark:text-gray-400 animate-pulse">جاري تحميل البيانات...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Dashboard Header with Welcome Message */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          مرحباً بك في لوحة التحكم
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          إليك نظرة سريعة على أداء متجرك خلال الفترة الأخيرة
        </p>
      </div>
      
      {/* إحصائيات سريعة مع تصميم محسن */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatsCard 
          title="إجمالي المبيعات"
          value={`${stats.totalSales.toLocaleString('ar-DZ')} د.ج`} 
          icon="money"
          color="blue"
          trend="up"
        />
        <StatsCard 
          title="الطلبات"
          value={stats.totalOrders.toLocaleString('ar-DZ')}
          icon="order"
          color="purple"
          trend={stats.totalOrders > 10 ? "up" : stats.totalOrders > 0 ? "neutral" : undefined}
        />
        <StatsCard 
          title="العملاء"
          value={stats.totalCustomers.toLocaleString('ar-DZ')}
          icon="user"
          color="green"
          trend={stats.totalCustomers > 5 ? "up" : undefined}
        />
        <StatsCard 
          title="منتجات مباعة"
          value={stats.topSellingProducts.reduce((sum, product) => sum + product.unitsSold, 0).toLocaleString('ar-DZ')}
          icon="package"
          color="orange"
          trend={stats.topSellingProducts.length > 0 ? "up" : undefined}
        />
      </div>
      
      {/* رسم بياني المبيعات مع تصميم محسن */}
      <div className="mb-10 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700 transition-all hover:shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
            المبيعات الأخيرة
          </h2>
          
          <div className="text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 px-3 py-1 rounded-full">
            آخر 30 يوم
          </div>
        </div>
        
        <div className="h-80">
          <SalesChart data={stats.salesByDate} />
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex flex-wrap gap-4">
            <div className="px-3 py-2 bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20 rounded-lg">
              <div className="text-xs text-blue-600 dark:text-blue-300">متوسط المبيعات اليومي</div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {(stats.totalSales / Math.max(1, stats.salesByDate.filter(d => d.amount > 0).length)).toLocaleString('ar-DZ', {maximumFractionDigits: 0})} د.ج
              </div>
            </div>
            <div className="px-3 py-2 bg-green-50 dark:bg-green-900 dark:bg-opacity-20 rounded-lg">
              <div className="text-xs text-green-600 dark:text-green-300">أعلى مبيعات</div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {Math.max(...stats.salesByDate.map(d => d.amount)).toLocaleString('ar-DZ')} د.ج
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* جدول الطلبات الأخيرة والمنتجات الأكثر مبيعًا */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700 transition-all hover:shadow-md">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              الطلبات الأخيرة
            </h2>
            <span className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:bg-opacity-20 dark:text-purple-300 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {orders.length} طلب
            </span>
          </div>
          
          {orders.length > 0 ? (
            <>
              <RecentOrdersTable orders={stats.recentOrders.slice(0, 5)} />
              <div className="mt-6 text-center">
                <a href="/orders" className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors hover:underline">
                  عرض جميع الطلبات
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </a>
              </div>
            </>
          ) : (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">لا توجد طلبات</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">لم يتم تسجيل أي طلبات بعد</p>
              <a href="/orders" className="inline-flex items-center px-4 py-2 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                إضافة طلب جديد
              </a>
            </div>
          )}
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700 transition-all hover:shadow-md">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              المنتجات الأكثر مبيعًا
            </h2>
            <span className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:bg-opacity-20 dark:text-orange-300 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {products.length} منتج
            </span>
          </div>
          
          {products.length > 0 ? (
            <>
              <TopProductsTable products={stats.topSellingProducts.length > 0 ? stats.topSellingProducts : products.slice(0, 5).map(p => ({ productId: p.id || p._id || '', productName: p.name, unitsSold: 0, totalRevenue: 0 }))} />
              <div className="mt-6 text-center">
                <a href="/products" className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors hover:underline">
                  عرض جميع المنتجات
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </a>
              </div>
            </>
          ) : (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">لا توجد منتجات</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">أضف منتجات لعرضها في متجرك</p>
              <a href="/products" className="inline-flex items-center px-4 py-2 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                إضافة منتج جديد
              </a>
            </div>
          )}
        </div>
      </div>
      
      {/* Quick stats summary */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">حالة الفئات</h3>
          <div className="flex justify-between items-center">
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{categories.length}</div>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          </div>
          <a href="/categories" className="mt-4 text-sm text-blue-600 hover:underline block">إدارة الفئات</a>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">الخصومات النشطة</h3>
          <div className="flex justify-between items-center">
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {discounts.filter(d => {
                const now = new Date();
                return d.isActive !== false && 
                  now >= new Date(d.validFrom ?? '1970-01-01T00:00:00Z') && 
                  now <= new Date(d.validTo ?? '2100-01-01T00:00:00Z');
              }).length}
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <a href="/discounts" className="mt-4 text-sm text-blue-600 hover:underline block">إدارة الخصومات</a>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">نظرة عامة على المتجر</h3>
          <div className="flex flex-col mt-2 space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">إجمالي المنتجات:</span>
              <span className="font-medium text-gray-900 dark:text-white">{products.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">إجمالي الطلبات:</span>
              <span className="font-medium text-gray-900 dark:text-white">{orders.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">متوسط قيمة الطلب:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {orders.length > 0 
                  ? (stats.totalSales / orders.length).toLocaleString('ar-DZ', {maximumFractionDigits: 0}) + ' د.ج' 
                  : '0 د.ج'}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="mt-8 p-4 bg-red-50 dark:bg-red-900 dark:bg-opacity-20 rounded-lg border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300">
          <div className="flex">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600 dark:text-red-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="mr-3">
              <h3 className="text-lg font-medium mb-2">ملاحظة</h3>
              <p>{error}</p>
              <p className="mt-2">تم عرض البيانات المتوفرة فقط</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
