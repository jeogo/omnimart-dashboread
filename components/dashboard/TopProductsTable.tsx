"use client";

import React from 'react';
import { TopSellingProduct } from '@/types';
import Link from 'next/link';
import Image from 'next/image';

interface TopProductsTableProps {
  products: TopSellingProduct[];
}

const TopProductsTable: React.FC<TopProductsTableProps> = ({ products }) => {
  // Calculate highest revenue for percentage display
  const maxRevenue = Math.max(...products.map(p => p.totalRevenue || 0), 1);
  
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead>
          <tr>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              المنتج
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              الوحدات المباعة
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              الإيرادات
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              <span className="sr-only">نسبة المبيعات</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
          {products.length > 0 ? (
            products.map((product, index) => {
              // Calculate percentage of max revenue
              const percentage = ((product.totalRevenue || 0) / maxRevenue) * 100;
              
              return (
                <tr key={product.productId} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 relative mr-2">
                        {product.imageUrl ? (
                          <Image 
                            src={product.imageUrl} 
                            alt={product.productName || ''}
                            fill
                            className="rounded-md object-cover border border-gray-200 dark:border-gray-700"
                            sizes="40px"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-md bg-gray-100 dark:bg-gray-800 flex items-center justify-center border border-gray-200 dark:border-gray-700">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                            </svg>
                          </div>
                        )}
                        {index < 3 && (
                          <div className={`absolute -top-2 -right-2 flex items-center justify-center h-5 w-5 rounded-full text-xs text-white 
                            ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-amber-600'}`}>
                            {index + 1}
                          </div>
                        )}
                      </div>
                      <div>
                        <Link 
                          href={`/products/${product.productId}`}
                          className="text-sm font-medium text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                          {product.productName || 'منتج غير معروف'}
                        </Link>
                        {product.category && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {product.category}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="font-medium text-gray-900 dark:text-white text-sm">
                        {(product.unitsSold || 0).toLocaleString('ar-DZ')}
                      </div>
                      {product.inStock !== undefined && (
                        <div className={`ml-2 text-xs px-1.5 py-0.5 rounded 
                          ${product.inStock > 0 
                            ? 'bg-green-50 text-green-700 dark:bg-green-900 dark:bg-opacity-20 dark:text-green-300' 
                            : 'bg-red-50 text-red-700 dark:bg-red-900 dark:bg-opacity-20 dark:text-red-300'}`}>
                          {product.inStock > 0 ? 'متوفر' : 'نفذ'}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      {(product.totalRevenue || 0).toLocaleString('ar-DZ')} د.ج
                    </div>
                    {product.unitPrice !== undefined && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {(product.unitPrice || 0).toLocaleString('ar-DZ')} د.ج / وحدة
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap w-24">
                    <div className="relative w-full">
                      <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200 dark:bg-gray-700">
                        <div 
                          style={{ width: `${percentage}%` }} 
                          className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center 
                            ${index === 0 
                              ? 'bg-blue-500 dark:bg-blue-600' 
                              : index === 1 
                                ? 'bg-blue-400 dark:bg-blue-500' 
                                : 'bg-blue-300 dark:bg-blue-400'}`}>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={4} className="px-4 py-8 text-center">
                <div className="inline-flex flex-col items-center px-6 py-5 rounded-md bg-gray-50 dark:bg-gray-700">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-2 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                  <p className="text-center font-medium text-gray-500 dark:text-gray-400">
                    لا توجد بيانات مبيعات بعد
                  </p>
                  <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                    ستظهر المنتجات الأكثر مبيعاً هنا بمجرد تسجيل المبيعات
                  </p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TopProductsTable;
