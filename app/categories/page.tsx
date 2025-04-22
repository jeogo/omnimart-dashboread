"use client";

import { useState, useEffect } from 'react';
import { Category } from '@/types';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import CategoryForm from '@/components/categories/CategoryForm';
import CategoryTable from '@/components/categories/CategoryTable';

export default function Categories() {
  // State
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch('/api/categories');
        
        if (!response.ok) {
          throw new Error('فشل في جلب الفئات');
        }
        
        const data = await response.json();
        setCategories(data.categories || []);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError(err instanceof Error ? err.message : 'حدث خطأ أثناء جلب البيانات');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategories();
  }, []);

  // Filter categories based on search term
  const filteredCategories = categories.filter(category => 
    searchTerm ? 
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (category.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
    : true
  );

  // Add new category or edit existing one
  const handleAddCategory = () => {
    setCurrentCategory(null);
    setIsAddModalOpen(true);
  };

  // Edit category
  const handleEditCategory = (category: Category) => {
    setCurrentCategory(category);
    setIsAddModalOpen(true);
  };

  // Delete category (show confirmation)
  const handleDeleteClick = (category: Category) => {
    setCurrentCategory(category);
    setIsDeleteModalOpen(true);
  };

  // Save category (create or update)
  const handleSaveCategory = async (categoryData: Partial<Category>) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const isUpdate = !!categoryData.id;
      let url, method, body;
      
      console.log('Category operation:', isUpdate ? 'UPDATE' : 'CREATE');
      console.log('Category data being saved:', categoryData);
      
      // Make sure parentId is handled correctly
      if (categoryData.parentId === '') {
        categoryData.parentId = null as any;
      }
      
      if (isUpdate) {
        // Update existing category - use the ID in the URL path
        const categoryId = categoryData.id;
        console.log(`Updating category with ID: ${categoryId}`);
        
        // Create deep copy to avoid reference issues
        const dataToUpdate = JSON.parse(JSON.stringify(categoryData));
        
        // Remove the ID from the body to prevent conflicts
        delete dataToUpdate.id;
        
        url = `/api/categories/${categoryId}`;
        method = 'PUT';
        body = JSON.stringify(dataToUpdate);
        
        console.log(`Making ${method} request to ${url} with data:`, dataToUpdate);
      } else {
        // Create new category
        url = '/api/categories';
        method = 'POST';
        body = JSON.stringify(categoryData);
        
        console.log(`Making ${method} request to ${url}`);
      }
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        console.error('API error response:', responseData);
        throw new Error(responseData.error || 'فشل في حفظ الفئة');
      }
      
      console.log('API success response:', responseData);
      
      if (isUpdate) {
        // Update category in state
        setCategories(prevCategories =>
          prevCategories.map(c =>
            c.id === categoryData.id ? responseData.category : c
          )
        );
        console.log('Category updated in state');
      } else {
        // Add new category to state
        setCategories(prevCategories => [...prevCategories, responseData.category]);
        console.log('New category added to state');
      }
      
      setIsAddModalOpen(false);
    } catch (err) {
      console.error('Error saving category:', err);
      setError(err instanceof Error ? err.message : 'فشل في حفظ الفئة');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirm category deletion
  const handleConfirmDelete = async () => {
    if (!currentCategory) return;
    
    setIsDeleting(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/categories/${currentCategory.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'فشل في حذف الفئة');
      }
      
      // Remove category from state
      setCategories(prevCategories =>
        prevCategories.filter(c => c.id !== currentCategory.id)
      );
      
      setIsDeleteModalOpen(false);
    } catch (err) {
      console.error('Error deleting category:', err);
      setError(err instanceof Error ? err.message : 'فشل في حذف الفئة');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Page header */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="dashboard-title">إدارة الفئات</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            إضافة وتعديل وإدارة فئات المنتجات
          </p>
        </div>
        
        <Button 
          variant="primary" 
          onClick={handleAddCategory}
          className="shrink-0 w-full sm:w-auto"
        >
          <span className="flex items-center gap-2 justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>إضافة فئة جديدة</span>
          </span>
        </Button>
      </div>
      
      {/* Search */}
      <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-100 dark:border-gray-700">
        <div className="max-w-md">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            البحث في الفئات
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              id="search"
              className="block w-full pr-10 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="البحث باسم الفئة أو الوصف"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="mb-6 p-4 border border-red-300 bg-red-50 dark:bg-red-900 dark:bg-opacity-20 dark:border-red-700 rounded-lg text-red-700 dark:text-red-300">
          <p>{error}</p>
        </div>
      )}
      
      {/* Loading spinner or categories table */}
      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">لا توجد فئات</h3>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            {searchTerm
              ? 'لا توجد فئات تطابق معايير البحث'
              : 'لم يتم العثور على أي فئات. أضف فئة جديدة للبدء.'
            }
          </p>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="mt-4 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              إزالة البحث
            </button>
          )}
        </div>
      ) : (
        <CategoryTable 
          categories={filteredCategories} 
          onEdit={handleEditCategory} 
          onDelete={handleDeleteClick}
        />
      )}
      
      {/* Add/Edit category modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={currentCategory ? 'تعديل الفئة' : 'إضافة فئة جديدة'}
        size="md"
      >
        <CategoryForm 
          category={currentCategory || undefined}
          categories={categories}
          onSubmit={handleSaveCategory}
          isSubmitting={isSubmitting}
        />
      </Modal>
      
      {/* Delete confirmation modal */}
      {currentCategory && (
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title="تأكيد الحذف"
          size="sm"
          footer={
            <>
              <Button
                variant="secondary"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isDeleting}
              >
                إلغاء
              </Button>
              <Button
                variant="primary"
                className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'جاري الحذف...' : 'تأكيد الحذف'}
              </Button>
            </>
          }
        >
          <div className="text-center py-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
              هل أنت متأكد من حذف هذه الفئة؟
            </h3>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              سيتم حذف الفئة <span className="font-semibold text-gray-700 dark:text-gray-300">{currentCategory.name}</span> نهائيًا.
              <br />
              هذا الإجراء لا يمكن التراجع عنه.
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
}
