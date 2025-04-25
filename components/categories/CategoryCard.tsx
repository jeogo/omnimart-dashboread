"use client";

import React from 'react';
import { Category } from '@/types';

interface CategoryCardProps {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, onEdit, onDelete }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
      <div className="p-4">
        {/* Category Header */}
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            {category.name}
          </h3>
          
          {/* Actions dropdown */}
          <div className="relative flex space-x-2 space-x-reverse">
            <button 
              onClick={() => onEdit(category)}
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-1"
              title="تعديل"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            
            <button 
              onClick={() => onDelete(category)}
              className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-1"
              title="حذف"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Category Image if available */}
        {category.image && (
          <div className="mt-2 mb-2">
            <img 
              src={category.image} 
              alt={category.name} 
              className="w-full h-32 object-cover rounded-md"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null; 
                target.src = 'https://via.placeholder.com/150?text=No+Image';
              }}
            />
          </div>
        )}
        
        {/* Category Properties */}
        {category.description && (
          <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3 mt-2">
            {category.description}
          </p>
        )}
        
        {/* Status */}
        <div className="flex items-center mt-4">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            category.isActive !== false
              ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:bg-opacity-30 dark:text-green-100'
              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
          }`}>
            {category.isActive !== false ? 'نشط' : 'غير نشط'}
          </span>
          
          {/* Created Date */}
          {category.createdAt && (
            <span className="mr-2 text-xs text-gray-500 dark:text-gray-400">
              أنشئت: {new Date(category.createdAt).toLocaleDateString('ar-DZ')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryCard;
