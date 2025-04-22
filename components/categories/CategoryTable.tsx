"use client";

import React from 'react';
import { Category } from '@/types';
import Image from 'next/image';

interface CategoryTableProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

const CategoryTable: React.FC<CategoryTableProps> = ({ 
  categories, 
  onEdit, 
  onDelete 
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {categories.map((category) => (
        <div key={category.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
          {/* Header with image */}
          <div className="aspect-video relative overflow-hidden bg-gray-100 dark:bg-gray-700">
            {category.image ? (
              <Image
                src={category.image}
                alt={category.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                style={{ objectFit: 'cover' }}
                className="hover:scale-110 transition-transform duration-300"
              />
            ) : (
              <div className="flex items-center justify-center h-full w-full bg-gray-200 dark:bg-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            )}
            
            {/* Status badge */}
            <div className="absolute top-2 right-2">
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                category.isActive !== false 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:bg-opacity-20 dark:text-green-300' 
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
              }`}>
                {category.isActive !== false ? 'نشط' : 'غير نشط'}
              </span>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-4">
            <div className="mb-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {category.name}
              </h3>
              {category.slug && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  /{category.slug}
                </p>
              )}
            </div>
            
            {category.description && (
              <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-4 h-10" title={category.description}>
                {category.description}
              </p>
            )}
            
            {/* Actions */}
            <div className="flex justify-end space-x-2 space-x-reverse mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
              <button
                onClick={() => onEdit(category)}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 px-3 py-1 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900 dark:hover:bg-opacity-20 transition-colors"
              >
                <span className="flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828l-11.314 11.314-4.243 1.414 1.414-4.243 11.314-11.314z" />
                  </svg>
                  <span>تعديل</span>
                </span>
              </button>
              <button
                onClick={() => onDelete(category)}
                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 px-3 py-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900 dark:hover:bg-opacity-20 transition-colors"
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
      ))}
    </div>
  );
};

export default CategoryTable;
