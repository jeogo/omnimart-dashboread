"use client";

import React from 'react';
import { Discount } from '@/types';

interface DiscountCardProps {
  discount: Discount;
  onEdit: (discount: Discount) => void;
  onDelete: (discount: Discount) => void;
}

const DiscountCard: React.FC<DiscountCardProps> = ({ discount, onEdit, onDelete }) => {
  // تنسيق التاريخ
  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('ar-DZ', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };
  
  // حساب حالة الخصم (نشط، منتهي، قادم)
  const getDiscountStatus = () => {
    const today = new Date();
    
    if (today < discount.validFrom) {
      return { 
        status: 'قادم', 
        className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:bg-opacity-20 dark:text-blue-300' 
      };
    } else if (today > discount.validTo) {
      return { 
        status: 'منتهي',
        className: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:bg-opacity-50 dark:text-gray-300'
      };
    } else {
      return {
        status: 'نشط',
        className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:bg-opacity-20 dark:text-green-300'
      };
    }
  };

  const discountStatus = getDiscountStatus();
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-all duration-300">
      {/* رأس البطاقة */}
      <div className="px-4 py-3 flex justify-between items-center border-b border-gray-100 dark:border-gray-700">
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${discountStatus.className}`}>
          {discountStatus.status}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(discount)}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-full dark:text-blue-400 dark:hover:bg-blue-900 dark:hover:bg-opacity-20"
            title="تعديل"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(discount)}
            className="p-1.5 text-red-600 hover:bg-red-50 rounded-full dark:text-red-400 dark:hover:bg-red-900 dark:hover:bg-opacity-20"
            title="حذف"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* محتوى البطاقة */}
      <div className="p-4">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-3">{discount.name}</h3>
        
        <div className="flex justify-center mb-4">
          <div className="bg-green-50 dark:bg-green-900 dark:bg-opacity-20 p-4 rounded-full w-24 h-24 flex items-center justify-center">
            <span className="text-2xl font-extrabold text-green-600 dark:text-green-400">
              -{discount.percentage}%
            </span>
          </div>
        </div>
        
        <div className="flex flex-col space-y-2 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-gray-500 dark:text-gray-400">بداية الخصم:</span>
            <span className="font-medium text-gray-800 dark:text-gray-200 dir-ltr">
              {formatDate(discount.validFrom)}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-500 dark:text-gray-400">نهاية الخصم:</span>
            <span className="font-medium text-gray-800 dark:text-gray-200 dir-ltr">
              {formatDate(discount.validTo)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscountCard;
