"use client";

import React from 'react';
import { Order } from '@/types';

interface OrderTableProps {
  orders: Order[];
  onView: (order: Order) => void;
  onDelete: (order: Order) => void;
  onStatusChange: (orderId: string, status: string) => void;
}

const OrderTable: React.FC<OrderTableProps> = ({ 
  orders, 
  onView, 
  onDelete,
  onStatusChange
}) => {
  // Format date
  const formatDate = (date: Date | string) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('ar-DZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Status labels and classes for badges
  const statusConfig = {
    pending: {
      label: 'قيد الانتظار',
      class: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:bg-opacity-20 dark:text-yellow-100'
    },
    processing: {
      label: 'قيد المعالجة',
      class: 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:bg-opacity-20 dark:text-blue-100'
    },
    shipped: {
      label: 'تم الشحن',
      class: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-800 dark:bg-opacity-20 dark:text-indigo-100'
    },
    delivered: {
      label: 'تم التسليم',
      class: 'bg-green-100 text-green-800 dark:bg-green-800 dark:bg-opacity-20 dark:text-green-100'
    },
    cancelled: {
      label: 'ملغي',
      class: 'bg-red-100 text-red-800 dark:bg-red-800 dark:bg-opacity-20 dark:text-red-100'
    }
  };

  // Handle status change with proper logging
  const handleStatusChange = (orderId: string, newStatus: string) => {
    console.log(`Changing order ${orderId} status to: ${newStatus}`);
    onStatusChange(orderId, newStatus);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {orders.map((order) => (
        <div key={order.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
          {/* Header */}
          <div className="border-b border-gray-100 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-750">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">رقم الطلب:</span>
                  <span className="text-blue-600 dark:text-blue-400 font-medium">#{order.id?.substring(0, 8) ?? ''}</span>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 dir-ltr text-right">
                  {formatDate(order.createdAt ?? '')}
                </div>
              </div>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusConfig[order.status]?.class || statusConfig.pending.class}`}>
                {statusConfig[order.status]?.label || statusConfig.pending.label}
              </span>
            </div>
          </div>
          
          {/* Customer Info */}
          <div className="p-4">
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-1">
                {order.customerName}
              </h3>
              <div className="flex flex-col text-sm text-gray-600 dark:text-gray-300">
                <div className="flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>{order.customerPhone}</span>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{order.wilaya}</span>
                </div>
              </div>
            </div>
            
            {/* Order Summary */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-300">المنتجات:</span>
                <span className="font-medium text-gray-800 dark:text-white">{order.products.length}</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-gray-600 dark:text-gray-300">المجموع:</span>
                <span className="font-medium text-gray-800 dark:text-white">{order.totalAmount.toLocaleString('ar-DZ')} د.ج</span>
              </div>
            </div>
            
            {/* Status Change Dropdown */}
            <div className="mb-4">
              <label htmlFor={`status-${order.id}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                تغيير الحالة
              </label>
              <select
                id={`status-${order.id}`}
                value={order.status}
                onChange={(e) => handleStatusChange(order.id ?? '', e.target.value as string)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
              >
                <option value="pending">قيد الانتظار</option>
                <option value="processing">قيد المعالجة</option>
                <option value="shipped">تم الشحن</option>
                <option value="delivered">تم التسليم</option>
                <option value="cancelled">ملغي</option>
              </select>
            </div>
            
            {/* Actions */}
            <div className="flex justify-end space-x-2 space-x-reverse pt-3 border-t border-gray-100 dark:border-gray-700">
              <button
                onClick={() => onView(order)}
                className="px-3 py-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900 dark:hover:bg-opacity-20 rounded-md transition-colors"
              >
                <span className="flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span>عرض</span>
                </span>
              </button>
              <button
                onClick={() => onDelete(order)}
                className="px-3 py-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900 dark:hover:bg-opacity-20 rounded-md transition-colors"
              >
                <span className="flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span>حذف</span>
                </span>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrderTable;
