import React, { useState } from 'react';
import { Order } from '@/types';

interface OrderCardProps {
  order: Order;
  onStatusChange: (orderId: string, newStatus: 'pending' | 'completed' | 'cancelled') => void;
  onViewDetails: (orderId: string) => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, onStatusChange, onViewDetails }) => {
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  
  // Map order status to component status
  const mapOrderStatus = (orderStatus: string): 'pending' | 'completed' | 'cancelled' => {
    switch (orderStatus) {
      case 'pending':
        return 'pending';
      case 'processing':
      case 'shipped':
        return 'pending';  // Treating these as still pending
      case 'delivered':
        return 'completed'; // Treating delivered as completed
      case 'cancelled':
        return 'cancelled';
      default:
        return 'pending';  // Default to pending for unknown statuses
    }
  };
  
  const [selectedStatus, setSelectedStatus] = useState<'pending' | 'completed' | 'cancelled'>(mapOrderStatus(order.status));

  // تحديد لون حالة الطلب
  const getStatusColor = (status: 'pending' | 'completed' | 'cancelled') => {
    switch (status) {
      case 'pending':
        return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:bg-opacity-20 dark:text-orange-300';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:bg-opacity-20 dark:text-green-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:bg-opacity-20 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  // تحويل حالة الطلب إلى نص عربي
  const getStatusText = (status: 'pending' | 'completed' | 'cancelled') => {
    switch (status) {
      case 'pending':
        return 'معلق';
      case 'completed':
        return 'مكتمل';
      case 'cancelled':
        return 'ملغى';
      default:
        return status;
    }
  };

  // تنسيق التاريخ
  const formatDate = (date: string | Date | undefined) => {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('ar-DZ', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  // عدد المنتجات في الطلب
  const productCount = order.products.reduce((total, item) => total + item.quantity, 0);

  // معالجة تغيير الحالة
  const handleStatusChange = () => {
    if (selectedStatus !== order.status) {
      if (order.id) {
        onStatusChange(order.id, selectedStatus);
      }
      setIsChangingStatus(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* رأس البطاقة */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            رقم الطلب: {order.id}
          </span>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(mapOrderStatus(order.status))}`}>
            {getStatusText(mapOrderStatus(order.status))}
          </span>
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {formatDate(order.createdAt)}
        </span>
      </div>
      
      {/* محتوى البطاقة */}
      <div className="p-4">
        <div className="mb-4 space-y-2">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 dark:text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
            <h3 className="text-lg font-bold text-gray-800 dark:text-white">{order.customerName}</h3>
          </div>
          
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 dark:text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
            </svg>
            <p className="text-md font-medium text-gray-600 dark:text-gray-300 dir-ltr">{order.customerPhone}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3 my-4">
          <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">عدد المنتجات</p>
            <p className="text-lg font-semibold text-gray-800 dark:text-white">{productCount}</p>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">الإجمالي</p>
            <p className="text-lg font-semibold text-gray-800 dark:text-white">
              {order.totalAmount.toLocaleString('ar-DZ')} د.ج
            </p>
          </div>
        </div>
      </div>
      
      {/* تذييل البطاقة */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 flex justify-between items-center">
        <button 
          onClick={() => { if (order.id) onViewDetails(order.id); }}
          className="text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900 dark:hover:bg-opacity-20 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
        >
          عرض التفاصيل
        </button>
        
        {isChangingStatus ? (
          <div className="flex items-center gap-2">
            <select 
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as 'pending' | 'completed' | 'cancelled')}
              className="text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="pending">معلق</option>
              <option value="completed">مكتمل</option>
              <option value="cancelled">ملغى</option>
            </select>
            <button 
              onClick={handleStatusChange}
              className="text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900 dark:hover:bg-opacity-20 text-sm font-medium px-2 py-1 rounded-lg transition-colors"
            >
              تأكيد
            </button>
            <button 
              onClick={() => {
                setSelectedStatus(mapOrderStatus(order.status));
                setIsChangingStatus(false);
              }}
              className="text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-600 text-sm font-medium px-2 py-1 rounded-lg transition-colors"
            >
              إلغاء
            </button>
          </div>
        ) : (
          <button 
            onClick={() => setIsChangingStatus(true)}
            className="text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-600 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
          >
            تغيير الحالة
          </button>
        )}
      </div>
    </div>
  );
};

export default OrderCard;
