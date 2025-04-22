"use client";

import { useState, useEffect } from 'react';
import { Statistics } from '@/types';
import StatsCard from '@/components/dashboard/StatsCard';
import RecentOrdersTable from '@/components/dashboard/RecentOrdersTable';
import TopProductsTable from '@/components/dashboard/TopProductsTable';
import SalesChart from '@/components/dashboard/SalesChart';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

// Initial empty statistics state
const initialStats: Statistics = {
  totalSales: 0,
  totalOrders: 0,
  totalCustomers: 0,
  topSellingProducts: [],
  recentOrders: [],
  salesByDate: []
};

export default function Dashboard() {
  const [stats, setStats] = useState<Statistics>(initialStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/statistics', {
          // Add cache control headers to prevent issues
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache'
          }
        });
        
        // Even if we get a non-200 response, try to parse the JSON
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'فشل في جلب الإحصائيات');
        }
        
        // Check if statistics exists in the response
        if (data && data.statistics) {
          setStats(data.statistics);
        } else {
          // Use initial stats if data format is not as expected
          console.warn('Statistics data format not as expected:', data);
          setStats(initialStats);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err instanceof Error ? err.message : 'حدث خطأ أثناء جلب البيانات');
        // Still use initialStats in case of error
        setStats(initialStats);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-900 dark:bg-opacity-20 rounded-lg border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300">
        <h3 className="text-lg font-medium mb-2">حدث خطأ</h3>
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="dashboard-title">لوحة التحكم</h1>
      
      {/* الإحصائيات الرئيسية */}
      <div className="dashboard-stats-grid mb-8">
        <StatsCard 
          title="إجمالي المبيعات"
          value={`${stats.totalSales.toLocaleString('ar-DZ')} د.ج`}
          icon="money"
          trend="up"
          color="blue"
        />
        <StatsCard 
          title="الطلبات"
          value={stats.totalOrders.toLocaleString('ar-DZ')}
          icon="order"
          color="purple"
        />
        <StatsCard 
          title="العملاء"
          value={stats.totalCustomers.toLocaleString('ar-DZ')}
          icon="user"
          color="green"
        />
        <StatsCard 
          title="منتجات مباعة"
          value={stats.topSellingProducts.reduce((sum, product) => sum + product.unitsSold, 0).toLocaleString('ar-DZ')}
          icon="package"
          color="orange"
        />
      </div>
      
      {/* الرسم البياني للمبيعات */}
      <div className="mb-8 card">
        <h2 className="dashboard-section-title">المبيعات الأخيرة</h2>
        <div className="h-80">
          <SalesChart data={stats.salesByDate} />
        </div>
      </div>
      
      {/* جدول الطلبات الأخيرة والمنتجات الأكثر مبيعًا */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card">
          <h2 className="dashboard-section-title">الطلبات الأخيرة</h2>
          <RecentOrdersTable orders={stats.recentOrders.slice(0, 5)} />
          <div className="mt-4 text-center">
            <a href="/orders" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium">
              عرض جميع الطلبات
            </a>
          </div>
        </div>
        
        <div className="card">
          <h2 className="dashboard-section-title">المنتجات الأكثر مبيعًا</h2>
          <TopProductsTable products={stats.topSellingProducts} />
          <div className="mt-4 text-center">
            <a href="/products" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium">
              عرض جميع المنتجات
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
