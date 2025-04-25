"use client";

import React from 'react';
import { Discount } from '@/types';

interface DiscountTableProps {
  discounts: Discount[];
  onEdit: (discount: Discount) => void;
  onDelete: (discount: Discount) => void;
}

const formatDate = (date: Date | string | undefined) => {
  if (!date) return 'اليوم';
  const d = new Date(date);
  return isNaN(d.getTime()) ? 'اليوم' : d.toLocaleDateString('ar-DZ', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const getDiscountStatus = (discount: Discount) => {
  const now = new Date();
  const from = discount.validFrom ? new Date(discount.validFrom) : null;
  const to = discount.validTo ? new Date(discount.validTo) : (discount.expiresAt ? new Date(discount.expiresAt) : null);

  if (from && now < from) {
    return { 
      status: 'قادم', 
      className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:bg-opacity-20 dark:text-blue-300',
      explainer: 'سيبدأ الخصم في التاريخ المحدد.'
    };
  } else if (to && now > to) {
    return { 
      status: 'منتهي',
      className: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:bg-opacity-50 dark:text-gray-300',
      explainer: 'انتهت صلاحية هذا الخصم.'
    };
  } else {
    return {
      status: 'نشط',
      className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:bg-opacity-20 dark:text-green-300',
      explainer: 'الخصم متاح الآن للعملاء.'
    };
  }
};

const DiscountTable: React.FC<DiscountTableProps> = ({ discounts, onEdit, onDelete }) => (
  <div className="overflow-x-auto">
    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800 rounded-lg shadow">
      <thead>
        <tr>
          <th className="px-4 py-2 text-right text-xs font-semibold text-gray-700 dark:text-gray-300">الحالة</th>
          <th className="px-4 py-2 text-right text-xs font-semibold text-gray-700 dark:text-gray-300">الاسم</th>
          <th className="px-4 py-2 text-right text-xs font-semibold text-gray-700 dark:text-gray-300">رمز الخصم</th>
          <th className="px-4 py-2 text-right text-xs font-semibold text-gray-700 dark:text-gray-300">النسبة</th>
          <th className="px-4 py-2 text-right text-xs font-semibold text-gray-700 dark:text-gray-300">من</th>
          <th className="px-4 py-2 text-right text-xs font-semibold text-gray-700 dark:text-gray-300">إلى</th>
          <th className="px-4 py-2 text-right text-xs font-semibold text-gray-700 dark:text-gray-300">شرح</th>
          <th className="px-4 py-2 text-right text-xs font-semibold text-gray-700 dark:text-gray-300">إجراءات</th>
        </tr>
      </thead>
      <tbody>
        {discounts.map((discount) => {
          const status = getDiscountStatus(discount);
          return (
            <tr key={discount.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
              <td className="px-4 py-2">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${status.className}`} title={status.explainer}>
                  {status.status}
                </span>
              </td>
              <td className="px-4 py-2 font-medium text-gray-900 dark:text-white">{discount.name || 'بدون اسم'}</td>
              <td className="px-4 py-2">
                <span className="inline-block bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20 px-2 py-1 rounded font-mono text-blue-800 dark:text-blue-300 text-sm">
                  {discount.code}
                </span>
              </td>
              <td className="px-4 py-2 text-center text-blue-600 dark:text-blue-400 font-bold">{discount.percentage}%</td>
              <td className="px-4 py-2">{formatDate(discount.validFrom)}</td>
              <td className="px-4 py-2">{formatDate(discount.validTo || discount.expiresAt)}</td>
              <td className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400">{status.explainer}</td>
              <td className="px-4 py-2 flex gap-2">
                <button
                  onClick={() => onEdit(discount)}
                  className="px-2 py-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20 rounded transition"
                  title="تعديل"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828l-11.314 11.314-4.243 1.414 1.414-4.243 11.314-11.314z" />
                  </svg>
                </button>
                <button
                  onClick={() => onDelete(discount)}
                  className="px-2 py-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 bg-red-50 dark:bg-red-900 dark:bg-opacity-20 rounded transition"
                  title="حذف"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);

export default DiscountTable;
