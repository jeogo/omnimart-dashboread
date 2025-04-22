"use client";

import React from 'react';
import { Order } from '@/types';

interface OrderDetailsProps {
  order: Order;
  onStatusChange: (status: string) => void;
}

const OrderDetails: React.FC<OrderDetailsProps> = ({ order, onStatusChange }) => {
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

  // Status labels
  const statusLabels = {
    pending: 'قيد الانتظار',
    processing: 'قيد المعالجة',
    shipped: 'تم الشحن',
    delivered: 'تم التسليم',
    cancelled: 'ملغي'
  } as Record<string, string>;

  return (
    <div className="space-y-6">
      {/* Order Info & Customer Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">معلومات العميل</h3>
          <div className="space-y-2">
            <p className="text-base text-gray-800 dark:text-white"><span className="font-medium">الاسم:</span> {order.customerName}</p>
            <p className="text-base text-gray-800 dark:text-white"><span className="font-medium">الهاتف:</span> {order.customerPhone}</p>
            <p className="text-base text-gray-800 dark:text-white"><span className="font-medium">العنوان:</span> {order.customerAddress}</p>
            <p className="text-base text-gray-800 dark:text-white"><span className="font-medium">المنطقة:</span> {order.wilaya}</p>
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">معلومات الطلب</h3>
          <div className="space-y-2">
            <p className="text-base text-gray-800 dark:text-white"><span className="font-medium">رقم الطلب:</span> #{order.id}</p>
            <p className="text-base text-gray-800 dark:text-white"><span className="font-medium">تاريخ الطلب:</span> {formatDate(order.createdAt)}</p>
            <p className="text-base text-gray-800 dark:text-white"><span className="font-medium">المجموع:</span> {order.totalAmount.toLocaleString('ar-DZ')} د.ج</p>
            <div className="flex items-center gap-2">
              <span className="font-medium text-base text-gray-800 dark:text-white">الحالة:</span>
              <select
                value={order.status}
                onChange={(e) => onStatusChange(e.target.value)}
                className="block rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white text-sm"
              >
                <option value="pending">قيد الانتظار</option>
                <option value="processing">قيد المعالجة</option>
                <option value="shipped">تم الشحن</option>
                <option value="delivered">تم التسليم</option>
                <option value="cancelled">ملغي</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      
      {/* Products */}
      <div>
        <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-3">المنتجات</h3>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    المنتج
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    السعر
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    الكمية
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    المقاس/اللون
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    الإجمالي
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {order.products.map((product, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-white">
                      {product.productName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {product.price.toLocaleString('ar-DZ')} د.ج
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {product.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {product.size && product.color ? `${product.size} / ${product.color}` : product.size || product.color || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-white">
                      {(product.price * product.quantity).toLocaleString('ar-DZ')} د.ج
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-white" colSpan={3}></td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-white">المجموع الفرعي:</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-white">
                    {(order.totalAmount - order.shippingCost).toLocaleString('ar-DZ')} د.ج
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-white" colSpan={3}></td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-white">تكلفة الشحن:</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-white">
                    {order.shippingCost.toLocaleString('ar-DZ')} د.ج
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-white" colSpan={3}></td>
                  <td className="px-6 py-4 whitespace-nowrap text-lg font-bold text-gray-900 dark:text-white">الإجمالي:</td>
                  <td className="px-6 py-4 whitespace-nowrap text-lg font-bold text-gray-900 dark:text-white">
                    {order.totalAmount.toLocaleString('ar-DZ')} د.ج
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
      
      {/* Notes */}
      {order.notes && (
        <div>
          <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-3">ملاحظات</h3>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <p className="text-gray-800 dark:text-white">{order.notes}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetails;
