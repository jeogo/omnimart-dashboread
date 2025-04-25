"use client";

import React from 'react';
import { Product, Category, Discount } from '@/types';

interface ProductDisplayProps {
  product: Product;
  categories?: Category[];
  discounts?: Discount[];
}

const ProductDisplay: React.FC<ProductDisplayProps> = ({
  product,
  categories = [],
  discounts = [],
}) => {
  // Find the applicable discount if not directly provided
  const currentDiscount = product.discountId
    ? discounts.find(d => d._id === product.discountId || d.id === product.discountId)
    : null;
    
  const isDiscountActive =
  currentDiscount && new Date() >= new Date(currentDiscount.validFrom ?? '1970-01-01') &&
  new Date() <= new Date(currentDiscount.validTo ?? '1970-01-01');
    
  const discountedPrice = 
    product.price && currentDiscount && isDiscountActive
      ? Math.round(product.price - product.price * (currentDiscount.percentage / 100))
      : null;
      
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">{product.name}</h1>
      <p className="mb-4 text-gray-600 dark:text-gray-300">{product.description}</p>
      <div className="mb-4">
        {discountedPrice ? (
          <div className="flex items-center gap-2">
            <span className="text-gray-400 line-through">{product.price?.toLocaleString('ar-DZ')} د.ج</span>
            <span className="text-lg font-bold text-green-600">{discountedPrice.toLocaleString('ar-DZ')} د.ج</span>
            <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded">{currentDiscount?.percentage}% خصم</span>
          </div>
        ) : (
          <span className="text-lg font-bold text-gray-900 dark:text-white">{product.price?.toLocaleString('ar-DZ')} د.ج</span>
        )}
      </div>
      {product.stock !== undefined && (
        <div className="mb-2 text-sm text-gray-500">المخزون: {product.stock}</div>
      )}
      {product.sizes && product.sizes.length > 0 && (
        <div className="mb-2 text-sm text-gray-500 flex flex-wrap gap-2">
          <span>المقاسات المتاحة: </span>
          {product.sizes.map((size, idx) => (
            <span key={idx} className="inline-block bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded px-2 py-0.5 text-xs font-semibold">
              {size}
            </span>
          ))}
        </div>
      )}
      {product.colors && product.colors.length > 0 && (
        <div className="mb-2 text-sm text-gray-500 flex flex-wrap gap-2">
          <span>الألوان المتاحة: </span>
          {product.colors.map((color, idx) => (
            <span key={idx} className="inline-flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded px-2 py-0.5 text-xs font-semibold">
              <span style={{ background: color.value, width: 16, height: 16, borderRadius: '50%', display: 'inline-block', border: '1px solid #ccc' }}></span>
              {color.name}
            </span>
          ))}
        </div>
      )}
      {product.createdAt && (
        <span>
          {new Date(product.createdAt ?? '1970-01-01').toLocaleDateString('ar-DZ')}
        </span>
      )}
      {/* ...add more fields as needed... */}
    </div>
  );
};

export default ProductDisplay;
