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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-all duration-300 p-5">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          {category.name}
        </h3>
        
        <div className="flex gap-2">
          <button 
            onClick={() => onEdit(category)}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-full dark:text-blue-400 dark:hover:bg-blue-900 dark:hover:bg-opacity-20"
            title="تعديل"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </button>
          <button 
            onClick={() => onDelete(category)}
            className="p-1.5 text-red-600 hover:bg-red-50 rounded-full dark:text-red-400 dark:hover:bg-red-900 dark:hover:bg-opacity-20"
            title="حذف"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
      
      {category.description && (
        <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3">
          {category.description}
        </p>
      )}
      
      {!category.description && (
        <p className="text-gray-400 dark:text-gray-500 text-sm italic">
          لا يوجد وصف
        </p>
      )}
    </div>
  );
};

export default CategoryCard;
