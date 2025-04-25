"use client";

import { useState, useEffect } from 'react';
import { Discount, Product } from '@/types';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import DiscountForm from '@/components/discounts/DiscountForm';
import DiscountTable from '@/components/discounts/DiscountTable';
import DeleteConfirmationModal from '@/components/ui/DeleteConfirmationModal';
import { apiUtils } from '@/utils/apiUtils';

export default function Discounts() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [activeOnly, setActiveOnly] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentDiscount, setCurrentDiscount] = useState<Discount | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [discountsData, productsData] = await Promise.all([
          apiUtils.getAllDiscounts(),
          apiUtils.getAllProducts()
        ]);
        setDiscounts(discountsData);
        setProducts(productsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'حدث خطأ أثناء جلب البيانات');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter discounts based on search term, type and active status
  const filteredDiscounts = discounts.filter(discount => {
    const matchesSearch = searchTerm
      ? (discount.name ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (discount.code && discount.code.toLowerCase().includes(searchTerm.toLowerCase()))
      : true;
    const matchesType = typeFilter ? discount.type === typeFilter : true;
    const matchesActive = activeOnly ? isDiscountActive(discount) : true;
    return matchesSearch && matchesType && matchesActive;
  });

  // Check if discount is active
  const isDiscountActive = (discount: Discount): boolean => {
    if (discount.isActive === false) return false;
    const now = new Date();
    return now >= new Date(discount.validFrom ?? '1970-01-01T00:00:00Z') &&
           now <= new Date(discount.validTo ?? '1970-01-01T00:00:00Z');
  };

  // Get discount status
  const getDiscountStatus = (discount: Discount) => {
    const now = new Date();
    const validFrom = new Date(discount.validFrom ?? 0);
    const validTo = new Date(discount.validTo || '1970-01-01T00:00:00Z');
    
    if (discount.isActive === false) {
      return { 
        status: 'غير نشط', 
        className: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
      };
    } else if (now < validFrom) {
      return { 
        status: 'قادم', 
        className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:bg-opacity-20 dark:text-blue-300' 
      };
    } else if (now > validTo) {
      return { 
        status: 'منتهي', 
        className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:bg-opacity-20 dark:text-red-300' 
      };
    } else {
      return { 
        status: 'نشط', 
        className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:bg-opacity-20 dark:text-green-300'
      };
    }
  };

  // Format date
  const formatDate = (date: Date | string): string => {
    return new Date(date).toLocaleDateString('ar-DZ', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  // Calculate remaining days
  const getRemainingDays = (date: Date | string): number => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(0, 0, 0, 0);
    const diffTime = endDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Handle discount functions
  const handleAddDiscount = () => {
    setCurrentDiscount(null);
    setIsModalOpen(true);
  };

  const handleEditDiscount = (discount: Discount) => {
    setCurrentDiscount(discount);
    setIsModalOpen(true);
  };

  const handleDeleteDiscount = (discount: Discount) => {
    setCurrentDiscount(discount);
    setIsDeleteModalOpen(true);
  };

  // Save discount (create or update)
  const handleSaveDiscount = async (discountData: Partial<Discount>) => {
    setIsSubmitting(true);
    setError(null);
    try {
      let responseData: Discount;
      const isUpdate = !!discountData.id;
      
      if (isUpdate && discountData.id) {
        responseData = await apiUtils.updateDiscount(discountData.id, discountData);
      } else {
        responseData = await apiUtils.createDiscount(discountData);
      }
      
      if (isUpdate) {
        setDiscounts(prevDiscounts =>
          prevDiscounts.map(d => d.id === discountData.id ? responseData : d)
        );
      } else {
        setDiscounts(prevDiscounts => [...prevDiscounts, responseData]);
      }
      
      setIsModalOpen(false);
      
      // Show success notification
      const notification = document.getElementById('notification');
      if (notification) {
        notification.textContent = isUpdate ? 'تم تحديث الخصم بنجاح' : 'تم إضافة الخصم بنجاح';
        notification.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in-down';
        setTimeout(() => {
          notification.className = 'hidden';
        }, 3000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل في حفظ الخصم');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirm discount deletion
  const handleConfirmDelete = async () => {
    if (!currentDiscount) return;
    setIsDeleting(true);
    setError(null);
    try {
      if (currentDiscount.id || currentDiscount._id) {
        if (currentDiscount.id) {
          await apiUtils.deleteDiscount(currentDiscount.id);
        } else if (currentDiscount._id) {
          await apiUtils.deleteDiscount(currentDiscount._id);
        } else {
          throw new Error('Discount ID is undefined');
        }
      } else {
        throw new Error('Discount ID is undefined');
      }
      setDiscounts(prevDiscounts =>
        prevDiscounts.filter(d => d.id !== currentDiscount.id && d._id !== currentDiscount._id)
      );
      setIsDeleteModalOpen(false);
      
      // Show success notification
      const notification = document.getElementById('notification');
      if (notification) {
        notification.textContent = 'تم حذف الخصم بنجاح';
        notification.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in-down';
        setTimeout(() => {
          notification.className = 'hidden';
        }, 3000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل في حذف الخصم');
    } finally {
      setIsDeleting(false);
    }
  };

  // Calculate affected products count for a discount
  const getAffectedProductsCount = (discount: Discount): number => {
    if (!discount.applicableProducts || discount.applicableProducts.length === 0) {
      return products.length; // Global discount
    }
    return discount.applicableProducts.length;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
  
      {/* Notification element */}
      <div id="notification" className="hidden"></div>
      
      {/* Page header */}
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">إدارة الخصومات</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            إضافة وتعديل وإدارة الخصومات والعروض
          </p>
        </div>
        <Button 
          variant="primary" 
          onClick={handleAddDiscount}
          className="shrink-0 w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>إضافة خصم جديد</span>
        </Button>
      </div>
      
      {/* Filters */}
      <div className="mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Search input */}
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              البحث في الخصومات
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
                placeholder="البحث بالإسم أو كود الخصم"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          {/* Type filter */}
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              نوع الخصم
            </label>
            <select
              id="type"
              className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">جميع الأنواع</option>
              <option value="percentage">نسبة مئوية</option>
              <option value="fixed">مبلغ ثابت</option>
              <option value="sale">تخفيض</option>
              <option value="seasonal">موسمي</option>
              <option value="clearance">تصفية</option>
            </select>
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
                عرض الخصومات النشطة فقط
              </label>
            </div>
          </div>
        </div>
        
        {/* Quick stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
          <div className="bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20 p-3 rounded-lg">
            <div className="text-xs text-blue-500 dark:text-blue-300 font-medium">إجمالي الخصومات</div>
            <div className="text-xl font-bold text-gray-900 dark:text-white mt-1">{discounts.length}</div>
          </div>
          <div className="bg-green-50 dark:bg-green-900 dark:bg-opacity-20 p-3 rounded-lg">
            <div className="text-xs text-green-500 dark:text-green-300 font-medium">الخصومات النشطة</div>
            <div className="text-xl font-bold text-gray-900 dark:text-white mt-1">
              {discounts.filter(d => isDiscountActive(d)).length}
              {discounts.filter(d => isDiscountActive({
                ...d,
                validFrom: d.validFrom ?? '1970-01-01T00:00:00Z',
                validTo: d.validTo ?? '1970-01-01T00:00:00Z'
              })).length}
          </div>
          <div className="bg-orange-50 dark:bg-orange-900 dark:bg-opacity-20 p-3 rounded-lg">
            <div className="text-xs text-orange-500 dark:text-orange-300 font-medium">الخصومات القادمة</div>
            <div className="text-xl font-bold text-gray-900 dark:text-white mt-1">
              {discounts.filter(d => d.isActive !== false && new Date() < new Date(d.validFrom ?? '1970-01-01T00:00:00Z')).length}
            </div>
          </div>
          <div className="bg-red-50 dark:bg-red-900 dark:bg-opacity-20 p-3 rounded-lg">
            <div className="text-xs text-red-500 dark:text-red-300 font-medium">الخصومات المنتهية</div>
            <div className="text-xl font-bold text-gray-900 dark:text-white mt-1">
              {discounts.filter(d => d.isActive !== false && new Date() > new Date(d.validTo ?? '1970-01-01T00:00:00Z')).length}
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
      
      {/* Loading spinner or discounts display */}
      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : filteredDiscounts.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-10 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">لا توجد خصومات</h3>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            {searchTerm || typeFilter || activeOnly
              ? 'لا توجد خصومات تطابق معايير البحث'
              : 'لم يتم العثور على أي خصومات. أضف خصم جديد للبدء.'
            }
          </p>
          {(searchTerm || typeFilter || activeOnly) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setTypeFilter('');
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
            <div>عرض {filteredDiscounts.length} من أصل {discounts.length} خصم</div>
          </div>
          <DiscountTable
            discounts={filteredDiscounts}
            onEdit={handleEditDiscount}
            onDelete={handleDeleteDiscount}
          />
        </div>
      )}
      
      {/* Add/Edit discount modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentDiscount ? 'تعديل الخصم' : 'إضافة خصم جديد'}
        size="lg"
      >
        <DiscountForm 
          discount={currentDiscount || undefined}
          onSubmit={handleSaveDiscount}
          isSubmitting={isSubmitting}
        />
      </Modal>
      
      {/* Delete confirmation modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="تأكيد حذف الخصم"
        entityName={currentDiscount?.name || 'الخصم'}
        isDeleting={isDeleting}
      />
    </div>
    </div>
  );
}
