"use client";

import React, { JSX } from 'react';
import { Order } from '@/types';
import Link from 'next/link';

interface RecentOrdersTableProps {
  orders: Order[];
}

const RecentOrdersTable: React.FC<RecentOrdersTableProps> = ({ orders }) => {
  // Format date for display
  const formatDate = (date: string | Date) => {
    if (!date) return '-';
    try {
      const d = new Date(date);
      return d.toLocaleDateString('ar-DZ', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch (e) {
      return '-';
    }
  };

  // Format time for display
  const formatTime = (date: string | Date) => {
    if (!date) return '';
    try {
      const d = new Date(date);
      return d.toLocaleTimeString('ar-DZ', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return '';
    }
  };

  // Get status badge with enhanced styling
  const getStatusBadge = (status: string = 'pending') => {
    const statusClasses = {
      pending: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900 dark:bg-opacity-20 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800',
      processing: 'bg-blue-50 text-blue-700 dark:bg-blue-900 dark:bg-opacity-20 dark:text-blue-300 border border-blue-200 dark:border-blue-800',
      shipped: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900 dark:bg-opacity-20 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800',
      delivered: 'bg-green-50 text-green-700 dark:bg-green-900 dark:bg-opacity-20 dark:text-green-300 border border-green-200 dark:border-green-800',
      cancelled: 'bg-red-50 text-red-700 dark:bg-red-900 dark:bg-opacity-20 dark:text-red-300 border border-red-200 dark:border-red-800'
    } as Record<string, string>;

    const statusIcons = {
      pending: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      processing: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4m1 5v6m0 0H9m11 0h-4" />
        </svg>
      ),
      shipped: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
      delivered: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      cancelled: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    } as Record<string, JSX.Element>;

    const statusLabels = {
      pending: 'قيد الانتظار',
      processing: 'قيد المعالجة',
      shipped: 'تم الشحن',
      delivered: 'تم التسليم',
      cancelled: 'ملغي'
    } as Record<string, string>;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClasses[status] || statusClasses.pending}`}>
        {statusIcons[status] || statusIcons.pending}
        {statusLabels[status] || 'قيد الانتظار'}
      </span>
    );
  };

  // Product count badge
  const getProductCount = (order: Order) => {
    const count = order.products?.length || 0;
    if (count === 0) return null;
    
    return (
      <span className="inline-flex items-center justify-center h-5 w-5 text-xs bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 rounded-full mr-2">
        {count}
      </span>
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead>
          <tr>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              رقم الطلب
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              العميل
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              المبلغ
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              التاريخ
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              الحالة
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
          {orders.length > 0 ? (
            orders.map((order) => (
              <tr key={order.id || order._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                <td className="px-4 py-3 whitespace-nowrap">
                  <Link href={`/orders/${order.id || order._id}`} className="group flex items-center">
                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400 group-hover:text-blue-800 dark:group-hover:text-blue-300 transition-colors">
                      #{(order.id || order._id || '').toString().substring(0, 8)}
                    </span>
                    {getProductCount(order)}
                  </Link>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex flex-col">
                    <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      {order.customerName || 'عميل'}
                    </div>
                    {order.customerPhone && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 dir-ltr text-right">
                        {order.customerPhone}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">
                    {(order.totalAmount || 0).toLocaleString('ar-DZ')} د.ج
                  </div>
                  {order.paymentMethod && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {order.paymentMethod === 'cash' ? 'الدفع عند الاستلام' : 'دفع إلكتروني'}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-sm text-gray-700 dark:text-gray-300 dir-ltr text-right">
                    {formatDate(order.createdAt || '')}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 dir-ltr text-right">
                    {formatTime(order.createdAt || '')}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {getStatusBadge(order.status)}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center">
                <div className="inline-flex items-center px-4 py-2 rounded-md bg-gray-50 dark:bg-gray-700 text-sm text-gray-500 dark:text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  لا توجد طلبات حديثة
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default RecentOrdersTable;
