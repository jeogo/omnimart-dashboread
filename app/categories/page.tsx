"use client";

import { useState, useEffect } from 'react';
import { Category } from '@/types';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import CategoryForm from '@/components/categories/CategoryForm';
import CategoryTable from '@/components/categories/CategoryTable';
import DeleteConfirmationModal from '@/components/ui/DeleteConfirmationModal';
import { apiUtils } from '@/utils/apiUtils';

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeOnly, setActiveOnly] = useState(false);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiUtils.getAllCategories();
        setCategories(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'حدث خطأ أثناء جلب البيانات');
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Filter categories based on search term and active status
  const filteredCategories = categories.filter(category => {
    const matchesSearch = searchTerm 
      ? category.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (category.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
      : true;
    const matchesActive = activeOnly ? category.isActive !== false : true;
    return matchesSearch && matchesActive;
  });

  // Category tree structure for parent-child relationships
  const getCategoryMap = () => {
    const map = new Map<string, Category[]>();
    
    categories.forEach(category => {
      const parentId = category.parentId || 'root';
      if (!map.has(parentId)) {
        map.set(parentId, []);
      }
      map.get(parentId)?.push(category);
    });
    
    return map;
  };

  const categoryMap = getCategoryMap();
  
  // Get parent category names
  const getParentCategoryName = (parentId: string | undefined) => {
    if (!parentId) return 'لا يوجد';
    const parent = categories.find(c => c.id === parentId || c._id === parentId);
    return parent ? parent.name : 'غير معروف';
  };

  // Handle category functions
  const handleAddCategory = () => {
    setCurrentCategory(null);
    setIsModalOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setCurrentCategory(category);
    setIsModalOpen(true);
  };

  const handleDeleteCategory = (category: Category) => {
    setCurrentCategory(category);
    setIsDeleteModalOpen(true);
  };

  // Save category (create or update)
  const handleSaveCategory = async (categoryData: Partial<Category>) => {
    setIsSubmitting(true);
    setError(null);
    try {
      let responseData: Category;
      const isUpdate = !!categoryData.id;
      
      if (isUpdate && categoryData.id) {
        responseData = await apiUtils.updateCategory(categoryData.id, categoryData);
      } else {
        responseData = await apiUtils.createCategory(categoryData);
      }
      
      if (isUpdate) {
        setCategories(prevCategories =>
          prevCategories.map(c => c.id === categoryData.id ? responseData : c)
        );
      } else {
        setCategories(prevCategories => [...prevCategories, responseData]);
      }
      
      setIsModalOpen(false);
      
      // Show success notification
      const notification = document.getElementById('notification');
      if (notification) {
        notification.textContent = isUpdate ? 'تم تحديث الفئة بنجاح' : 'تم إضافة الفئة بنجاح';
        notification.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in-down';
        setTimeout(() => {
          notification.className = 'hidden';
        }, 3000);
      }
    } catch (err) {
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
      await apiUtils.deleteCategory((currentCategory.id || currentCategory._id)!);
      setCategories(prevCategories =>
        prevCategories.filter(c => c.id !== currentCategory.id && c._id !== currentCategory._id)
      );
      setIsDeleteModalOpen(false);
      
      // Show success notification
      const notification = document.getElementById('notification');
      if (notification) {
        notification.textContent = 'تم حذف الفئة بنجاح';
        notification.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in-down';
        setTimeout(() => {
          notification.className = 'hidden';
        }, 3000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل في حذف الفئة');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Notification element */}
      <div id="notification" className="hidden"></div>
      
      {/* Page header */}
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">إدارة الفئات</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            إضافة وتعديل وإدارة فئات المنتجات في المتجر
          </p>
        </div>
        <Button 
          variant="primary" 
          onClick={handleAddCategory}
          className="shrink-0 w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>إضافة فئة جديدة</span>
        </Button>
      </div>
      
      {/* Filters */}
      <div className="mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Search input */}
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                className="block w-full pr-10 border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="البحث باسم الفئة أو الوصف"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          {/* Active filter toggle */}
          <div className="flex items-end">
            <div className="relative flex items-center">
              <input
                id="active-only"
                name="active-only"
                type="checkbox"
                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked={activeOnly}
                onChange={(e) => setActiveOnly(e.target.checked)}
              />
              <label htmlFor="active-only" className="mr-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
                عرض الفئات النشطة فقط
              </label>
            </div>
          </div>
        </div>
        
        {/* Quick stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
          <div className="bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20 p-3 rounded-lg">
            <div className="text-xs text-blue-500 dark:text-blue-300 font-medium">إجمالي الفئات</div>
            <div className="text-xl font-bold text-gray-900 dark:text-white mt-1">{categories.length}</div>
          </div>
          <div className="bg-green-50 dark:bg-green-900 dark:bg-opacity-20 p-3 rounded-lg">
            <div className="text-xs text-green-500 dark:text-green-300 font-medium">الفئات النشطة</div>
            <div className="text-xl font-bold text-gray-900 dark:text-white mt-1">
              {categories.filter(c => c.isActive !== false).length}
            </div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900 dark:bg-opacity-20 p-3 rounded-lg">
            <div className="text-xs text-purple-500 dark:text-purple-300 font-medium">الفئات الرئيسية</div>
            <div className="text-xl font-bold text-gray-900 dark:text-white mt-1">
              {categories.filter(c => !c.parentId).length}
            </div>
          </div>
        </div>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="mb-6 p-4 flex items-start border border-red-300 bg-red-50 dark:bg-red-900 dark:bg-opacity-20 dark:border-red-700 rounded-lg text-red-700 dark:text-red-300">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p>{error}</p>
        </div>
      )}
      
      {/* Loading spinner or categories display */}
      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-10 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">لا توجد فئات</h3>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            {searchTerm || activeOnly
              ? 'لا توجد فئات تطابق معايير البحث'
              : 'لم يتم العثور على أي فئات. أضف فئة جديدة للبدء.'
            }
          </p>
          {(searchTerm || activeOnly) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setActiveOnly(false);
              }}
              className="mt-4 inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              إزالة عوامل التصفية
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 px-2">
            <div>عرض {filteredCategories.length} من أصل {categories.length} فئة</div>
          </div>
          <CategoryTable
            categories={filteredCategories}
            onEdit={handleEditCategory}
            onDelete={handleDeleteCategory}
          />
        </div>
      )}
      
      {/* Add/Edit category modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
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
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="تأكيد حذف الفئة"
        entityName={currentCategory?.name || 'الفئة'}
        isDeleting={isDeleting}
      />
    </div>
  );
}
