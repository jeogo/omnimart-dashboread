"use client";

import React from 'react';
import { TopSellingProduct } from '@/types';
import Link from 'next/link';

interface TopProductsTableProps {
  products: TopSellingProduct[];
}

const TopProductsTable: React.FC<TopProductsTableProps> = ({ products }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead className="bg-gray-50 dark:bg-gray-700">
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
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {products.length > 0 ? (
            products.map((product) => (
              <tr key={product.productId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-blue-600 dark:text-blue-400">
                  <Link href={`/products/${product.productId}`}>
                    {product.productName}
                  </Link>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                  {product.unitsSold.toLocaleString('ar-DZ')}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                  {product.totalRevenue.toLocaleString('ar-DZ')} د.ج
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={3} className="px-4 py-3 text-center text-sm text-gray-500 dark:text-gray-400">
                لا توجد بيانات مبيعات
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TopProductsTable;
