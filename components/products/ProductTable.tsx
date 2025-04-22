"use client";

import React from 'react';
import { Product, Category, Discount } from '@/types';
import Image from 'next/image';
import Link from 'next/link';

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  categories: Category[];
  discounts: Discount[];
}

const ProductTable: React.FC<ProductTableProps> = ({ 
  products, 
  onEdit, 
  onDelete,
  categories,
  discounts
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

  // Get category name
  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'غير محدد';
  };

  // Get discount percentage
  const getDiscountPercentage = (discountId?: string) => {
    if (!discountId) return null;
    const discount = discounts.find(d => d.id === discountId);
    return discount ? discount.percentage : null;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <div key={product.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
          {/* صورة المنتج */}
          <div className="aspect-square relative overflow-hidden bg-gray-100 dark:bg-gray-700">
            {product.images && product.images.length > 0 ? (
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                style={{ objectFit: 'cover' }}
                className="hover:scale-110 transition-transform duration-300"
              />
            ) : (
              <div className="flex items-center justify-center h-full w-full bg-gray-200 dark:bg-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
            
            {/* علامة المنتج الجديد */}
            {product.isNew && (
              <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs font-bold py-1 px-2 rounded-full">
                جديد
              </div>
            )}
            
            {/* علامة التخفيض */}
            {product.discountId && (
              <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold py-1 px-2 rounded-full">
                خصم {getDiscountPercentage(product.discountId)}%
              </div>
            )}
          </div>
          
          {/* تفاصيل المنتج */}
          <div className="p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate" title={product.name}>
                {product.name}
              </h3>
              <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                {formatDate(product.createdAt)}
              </span>
            </div>
            
            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 h-10 mb-2" title={product.description}>
              {product.description}
            </p>
            
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:bg-opacity-20 dark:text-blue-300 text-xs px-2 py-1 rounded-full">
                {getCategoryName(product.categoryId)}
              </span>
              {product.sizes && product.sizes.length > 0 && (
                <span className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 text-xs px-2 py-1 rounded-full">
                  {product.sizes.length} مقاسات
                </span>
              )}
              {product.colors && product.colors.length > 0 && (
                <span className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 text-xs px-2 py-1 rounded-full">
                  {product.colors.length} ألوان
                </span>
              )}
            </div>
            
            <div className="flex justify-between items-center">
              <div className="font-bold text-lg text-gray-900 dark:text-white">
                {product.oldPrice ? (
                  <div className="flex items-center gap-2">
                    <span>{product.price.toLocaleString('ar-DZ')} د.ج</span>
                    <span className="text-sm line-through text-gray-500 dark:text-gray-400">
                      {product.oldPrice.toLocaleString('ar-DZ')} د.ج
                    </span>
                  </div>
                ) : (
                  <span>{product.price.toLocaleString('ar-DZ')} د.ج</span>
                )}
              </div>
              
              <div className="flex space-x-1 space-x-reverse">
                <button
                  onClick={() => onEdit(product)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-full dark:text-blue-400 dark:hover:bg-blue-900 dark:hover:bg-opacity-20"
                  title="تعديل المنتج"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828l-11.314 11.314-4.243 1.414 1.414-4.243 11.314-11.314z" />
                  </svg>
                </button>
                <button
                  onClick={() => onDelete(product)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-full dark:text-red-400 dark:hover:bg-red-900 dark:hover:bg-opacity-20"
                  title="حذف المنتج"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
                <Link 
                  href={`/products/${product.id}`}
                  className="p-2 text-gray-600 hover:bg-gray-50 rounded-full dark:text-gray-400 dark:hover:bg-gray-700"
                  title="عرض المنتج"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductTable;
