"use client";

import React from 'react';
import Image from 'next/image';
import { Product, Discount } from '@/types';

interface ProductDisplayProps {
  product: Product;
  discount?: Discount;
}

const ProductDisplay: React.FC<ProductDisplayProps> = ({ product, discount }) => {
  // حساب السعر بعد الخصم
  const calculateDiscountedPrice = (): number | null => {
    if (!discount) return null;
    return product.price - (product.price * (discount.percentage / 100));
  };
  
  // التحقق من حالة الخصم (نشط أم لا)
  const isDiscountActive = (): boolean => {
    if (!discount) return false;
    const now = new Date();
    return now >= discount.validFrom && now <= discount.validTo;
  };
  
  const discountedPrice = calculateDiscountedPrice();
  const isActive = isDiscountActive();
  
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      {/* صورة المنتج */}
      <div className="relative aspect-square bg-gray-100 dark:bg-gray-700 mb-4 rounded-md overflow-hidden">
        {product.images && product.images.length > 0 ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="h-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        
        {/* شارة الخصم */}
        {isActive && discount && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold py-1 px-2 rounded-full">
            خصم {discount.percentage}%
          </div>
        )}
      </div>
      
      {/* اسم المنتج */}
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-1">{product.name}</h3>
      
      {/* وصف المنتج */}
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">{product.description}</p>
      
      {/* السعر */}
      <div className="mt-auto">
        {isActive && discountedPrice ? (
          <div className="flex flex-col">
            <span className="line-through text-sm text-gray-500 dark:text-gray-400">
              {product.price.toLocaleString('ar-DZ')} د.ج
            </span>
            <span className="text-lg font-bold text-red-600 dark:text-red-400">
              {discountedPrice.toLocaleString('ar-DZ')} د.ج
            </span>
          </div>
        ) : (
          <span className="text-lg font-bold text-gray-900 dark:text-white">
            {product.price.toLocaleString('ar-DZ')} د.ج
          </span>
        )}
      </div>
    </div>
  );
};

export default ProductDisplay;
