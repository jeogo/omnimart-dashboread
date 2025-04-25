import React from 'react';
import { Order } from '@/types';

interface OrdersTableProps {
  orders: Order[];
  loading?: boolean;
}

const OrdersTable: React.FC<OrdersTableProps> = ({ orders, loading = false }) => {
  // تحويل حالة الطلب إلى عربي وتحديد فئة التنسيق المناسبة
  const getStatusInfo = (status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled') => {
    switch (status) {
      case 'pending':
        return { text: 'قيد الانتظار', className: 'status-badge status-pending' };
      case 'processing':
        return { text: 'قيد المعالجة', className: 'status-badge status-processing' };
      case 'shipped':
        return { text: 'تم الشحن', className: 'status-badge status-shipped' };
      case 'delivered':
        return { text: 'تم التوصيل', className: 'status-badge status-completed' };
      case 'cancelled':
        return { text: 'ملغي', className: 'status-badge status-cancelled' };
      default:
        return { text: status, className: 'status-badge bg-gray-100 text-gray-800' };
    }
  };

  // تنسيق التاريخ
  const formatDate = (date: Date | string | undefined) => {
    if (!date) return '-';
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        لا توجد طلبات حتى الآن
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="data-table">
        <thead>
          <tr>
            <th>رقم الطلب</th>
            <th>اسم الزبون</th>
            <th>رقم الهاتف</th>
            <th>المبلغ الإجمالي</th>
            <th>حالة الطلب</th>
            <th>التاريخ</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => {
            const statusInfo = getStatusInfo(order.status);
            return (
              <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="font-medium text-gray-800 dark:text-white">{order.id}</td>
                <td>{order.customerName}</td>
                <td className="dir-ltr">{order.customerPhone}</td>
                <td>{order.totalAmount.toLocaleString('ar-DZ')} د.ج</td>
                <td>
                  <span className={statusInfo.className}>{statusInfo.text}</span>
                </td>
                <td>{formatDate(order.createdAt)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default OrdersTable;
