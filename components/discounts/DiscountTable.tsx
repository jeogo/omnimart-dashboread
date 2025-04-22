"use client";

import React from 'react';
import { Discount } from '@/types';

interface DiscountTableProps {
  discounts: Discount[];
  onEdit: (discount: Discount) => void;
  onDelete: (discount: Discount) => void;
}

const DiscountTable: React.FC<DiscountTableProps> = ({ 
  discounts, 
  onEdit, 
  onDelete 
}) => {
  // Format date
  const formatDate = (date: Date | string) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('ar-DZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Check if discount is active with improved logic
  const isActiveDiscount = (discount: Discount) => {
    if (discount.isActive === false) return false;
    
    const now = new Date();
    const validFrom = new Date(discount.validFrom);
    const validTo = new Date(discount.validTo);
    
    // Check if the dates are valid before comparing
    if (isNaN(validFrom.getTime()) || isNaN(validTo.getTime())) {
      return false;
    }
    
    return now >= validFrom && now <= validTo;
  };

  // Calculate remaining days for active discounts
  const getRemainingDays = (validTo: Date | string) => {
    const now = new Date();
    const endDate = new Date(validTo);
    
    if (isNaN(endDate.getTime())) return null;
    
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 ? diffDays : 0;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {discounts.map((discount) => {
        const isActive = isActiveDiscount(discount);
        const remainingDays = getRemainingDays(discount.validTo);
        
        return (
          <div key={discount.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
            {/* Header with discount details */}
            <div className="border-b border-gray-100 dark:border-gray-700 p-4">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {discount.name}
                </h3>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  isActive
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:bg-opacity-20 dark:text-green-300'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                }`}>
                  {isActive ? 'نشط' : 'غير نشط'}
                </span>
              </div>
              
              {/* Discount code */}
              {discount.code && (
                <div className="mt-2 bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20 p-2 rounded-md flex justify-between items-center">
                  <span className="text-sm font-medium text-blue-800 dark:text-blue-300">رمز الخصم:</span>
                  <code className="text-sm bg-white dark:bg-gray-800 px-2 py-1 rounded-md border border-blue-100 dark:border-blue-800 font-mono">
                    {discount.code}
                  </code>
                </div>
              )}
              
              {/* Remaining days for active discounts */}
              {isActive && remainingDays !== null && remainingDays < 7 && (
                <div className="mt-2 bg-amber-50 dark:bg-amber-900 dark:bg-opacity-20 p-2 rounded-md text-center">
                  <span className="text-sm font-medium text-amber-800 dark:text-amber-300">
                    {remainingDays === 0
                      ? 'ينتهي اليوم!'
                      : `متبقي ${remainingDays} ${remainingDays === 1 ? 'يوم' : 'أيام'}`
                    }
                  </span>
                </div>
              )}
            </div>
            
            {/* Discount body */}
            <div className="p-4">
              {/* Percentage */}
              <div className="mb-4">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  {discount.percentage}%
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 text-center mt-1">
                  نسبة الخصم
                </div>
              </div>
              
              {/* Validity period */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded-md">
                  <div className="text-xs text-gray-500 dark:text-gray-400">من:</div>
                  <div className="text-sm font-medium text-gray-800 dark:text-white">
                    {formatDate(discount.validFrom)}
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded-md">
                  <div className="text-xs text-gray-500 dark:text-gray-400">إلى:</div>
                  <div className="text-sm font-medium text-gray-800 dark:text-white">
                    {formatDate(discount.validTo)}
                  </div>
                </div>
              </div>
              
              {/* Minimum purchase */}
              {discount.minPurchase && discount.minPurchase > 0 && (
                <div className="mb-4 text-sm">
                  <span className="text-gray-500 dark:text-gray-400">الحد الأدنى للشراء: </span>
                  <span className="font-medium text-gray-800 dark:text-white">
                    {discount.minPurchase.toLocaleString('ar-DZ')} د.ج
                  </span>
                </div>
              )}
              
              {/* Type */}
              {discount.type && (
                <div className="mb-4">
                  <span className="inline-block bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 text-xs px-2 py-1 rounded-full">
                    {discount.type === 'sale' && 'تخفيض عام'}
                    {discount.type === 'special' && 'عرض خاص'}
                    {discount.type === 'seasonal' && 'عرض موسمي'}
                  </span>
                </div>
              )}
              
              {/* Actions */}
              <div className="flex justify-end space-x-2 space-x-reverse pt-3 border-t border-gray-100 dark:border-gray-700">
                <button
                  onClick={() => onEdit(discount)}
                  className="px-3 py-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900 dark:hover:bg-opacity-20 rounded-md transition-colors"
                >
                  <span className="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828l-11.314 11.314-4.243 1.414 1.414-4.243 11.314-11.314z" />
                    </svg>
                    <span>تعديل</span>
                  </span>
                </button>
                <button
                  onClick={() => onDelete(discount)}
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
        );
      })}
    </div>
  );
};

export default DiscountTable;
