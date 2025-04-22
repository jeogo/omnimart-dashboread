"use client";

import { useState, useEffect } from 'react';
import { Discount } from '@/types';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function Discounts() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentDiscount, setCurrentDiscount] = useState<Discount | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Omit<Discount, 'validFrom' | 'validTo'>> & {
    validFrom?: string;
    validTo?: string;
  }>({
    name: '',
    percentage: 0,
    validFrom: new Date().toISOString().split('T')[0],
    validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    percentage?: string;
    validFrom?: string;
    validTo?: string;
  }>({});

  // Fetch discounts from API
  useEffect(() => {
    const fetchDiscounts = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/discounts');
        
        if (!response.ok) {
          throw new Error('فشل في جلب الخصومات');
        }
        
        const data = await response.json();
        setDiscounts(data.discounts || []);
      } catch (err) {
        console.error('Error fetching discounts:', err);
        setError(err instanceof Error ? err.message : 'حدث خطأ أثناء جلب البيانات');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDiscounts();
  }, []);

  // Add discount
  const handleAddDiscount = () => {
    setCurrentDiscount(null);
    setForm({
      name: '',
      percentage: 0,
      validFrom: new Date().toISOString().split('T')[0],
      validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
    setFormErrors({});
    setIsAddModalOpen(true);
  };

  // Edit discount
  const handleEditDiscount = (discount: Discount) => {
    setCurrentDiscount(discount);
    setForm({
      name: discount.name,
      percentage: discount.percentage,
      validFrom: new Date(discount.validFrom).toISOString().split('T')[0],
      validTo: new Date(discount.validTo).toISOString().split('T')[0]
    });
    setFormErrors({});
    setIsAddModalOpen(true);
  };

  // Delete discount (show confirmation)
  const handleDeleteClick = (discount: Discount) => {
    setCurrentDiscount(discount);
    setIsDeleteModalOpen(true);
  };

  // Handle form input changes
  const handleChange = (field: keyof Discount, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
    
    if (formErrors[field as keyof typeof formErrors]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const errors: {
      name?: string;
      percentage?: string;
      validFrom?: string;
      validTo?: string;
    } = {};
    
    if (!form.name?.trim()) {
      errors.name = 'اسم الخصم مطلوب';
    }
    
    if (!form.percentage || form.percentage <= 0 || form.percentage > 100) {
      errors.percentage = 'يجب إدخال نسبة خصم صحيحة (بين 1 و 100)';
    }
    
    if (!form.validFrom) {
      errors.validFrom = 'تاريخ بداية الخصم مطلوب';
    }
    
    if (!form.validTo) {
      errors.validTo = 'تاريخ نهاية الخصم مطلوب';
    } else if (form.validFrom && form.validTo && new Date(form.validFrom) > new Date(form.validTo)) {
      errors.validTo = 'يجب أن يكون تاريخ النهاية بعد تاريخ البداية';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Save discount (create or update)
  const handleSaveDiscount = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const isUpdate = !!currentDiscount?.id;
      const url = '/api/discounts';
      const method = isUpdate ? 'PUT' : 'POST';
      const body = isUpdate 
        ? JSON.stringify({ id: currentDiscount.id, ...form })
        : JSON.stringify(form);
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'فشل في حفظ الخصم');
      }
      
      const data = await response.json();
      
      if (isUpdate) {
        // Update discount in state
        setDiscounts(prevDiscounts =>
          prevDiscounts.map(d =>
            d.id === data.discount.id ? data.discount : d
          )
        );
      } else {
        // Add new discount to state
        setDiscounts(prevDiscounts => [...prevDiscounts, data.discount]);
      }
      
      setIsAddModalOpen(false);
    } catch (err) {
      console.error('Error saving discount:', err);
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
      const response = await fetch(`/api/discounts?id=${currentDiscount.id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'فشل في حذف الخصم');
      }
      
      // Remove discount from state
      setDiscounts(prevDiscounts =>
        prevDiscounts.filter(d => d.id !== currentDiscount.id)
      );
      
      setIsDeleteModalOpen(false);
    } catch (err) {
      console.error('Error deleting discount:', err);
      setError(err instanceof Error ? err.message : 'فشل في حذف الخصم');
    } finally {
      setIsDeleting(false);
    }
  };

  // Get discount status
  const getDiscountStatus = (discount: Discount) => {
    const now = new Date();
    const validFrom = new Date(discount.validFrom);
    const validTo = new Date(discount.validTo);
    
    if (now < validFrom) {
      return { 
        status: 'قادم', 
        className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:bg-opacity-20 dark:text-blue-300' 
      };
    } else if (now > validTo) {
      return { 
        status: 'منتهي',
        className: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:bg-opacity-50 dark:text-gray-300'
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

  // Discount card component
  const DiscountCard = ({ discount }: { discount: Discount }) => {
    const discountStatus = getDiscountStatus(discount);
    
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-all duration-300">
        <div className="px-4 py-3 flex justify-between items-center border-b border-gray-100 dark:border-gray-700">
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${discountStatus.className}`}>
            {discountStatus.status}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleEditDiscount(discount)}
              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-full dark:text-blue-400 dark:hover:bg-blue-900 dark:hover:bg-opacity-20"
              title="تعديل"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </button>
            <button
              onClick={() => handleDeleteClick(discount)}
              className="p-1.5 text-red-600 hover:bg-red-50 rounded-full dark:text-red-400 dark:hover:bg-red-900 dark:hover:bg-opacity-20"
              title="حذف"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="p-4">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-3">{discount.name}</h3>
          
          <div className="flex justify-center mb-4">
            <div className="bg-green-50 dark:bg-green-900 dark:bg-opacity-20 p-4 rounded-full w-24 h-24 flex items-center justify-center">
              <span className="text-2xl font-extrabold text-green-600 dark:text-green-400">
                -{discount.percentage}%
              </span>
            </div>
          </div>
          
          <div className="flex flex-col space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-500 dark:text-gray-400">بداية الخصم:</span>
              <span className="font-medium text-gray-800 dark:text-gray-200 dir-ltr">
                {formatDate(discount.validFrom)}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-500 dark:text-gray-400">نهاية الخصم:</span>
              <span className="font-medium text-gray-800 dark:text-gray-200 dir-ltr">
                {formatDate(discount.validTo)}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="dashboard-title">إدارة الخصومات</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            قم بإضافة وتعديل الخصومات لمنتجاتك
          </p>
        </div>
        
        <Button 
          variant="primary" 
          onClick={handleAddDiscount}
          className="shrink-0 w-full sm:w-auto"
        >
          <span className="flex items-center gap-2 justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            <span>إضافة خصم جديد</span>
          </span>
        </Button>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="mb-6 p-4 border border-red-300 bg-red-50 dark:bg-red-900 dark:bg-opacity-20 dark:border-red-700 rounded-lg text-red-700 dark:text-red-300">
          <p>{error}</p>
        </div>
      )}
      
      {/* Loading spinner or empty state or discounts grid */}
      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : discounts.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">لا توجد خصومات</h3>
          <p className="mt-2 text-gray-500 dark:text-gray-400">لم يتم العثور على أي خصومات. أضف خصمك الأول للبدء.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {discounts.map(discount => (
            <DiscountCard key={discount.id} discount={discount} />
          ))}
        </div>
      )}
      
      {/* Add/Edit discount modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={currentDiscount ? 'تعديل الخصم' : 'إضافة خصم جديد'}
        size="md"
      >
        {error && (
          <div className="mb-4 p-3 border border-red-300 bg-red-50 dark:bg-red-900 dark:bg-opacity-20 dark:border-red-700 rounded-lg text-red-700 dark:text-red-300 text-sm">
            <p>{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSaveDiscount} className="space-y-6">
          <div>
            <label htmlFor="discount-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              اسم الخصم <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="discount-name"
              value={form.name || ''}
              onChange={(e) => handleChange('name', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="أدخل اسم الخصم"
              required
            />
            {formErrors.name && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.name}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="discount-percentage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              نسبة الخصم (%) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="discount-percentage"
              value={form.percentage || ''}
              onChange={(e) => handleChange('percentage', parseFloat(e.target.value) || 0)}
              min={1}
              max={100}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="أدخل نسبة الخصم"
              required
            />
            {formErrors.percentage && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.percentage}</p>
            )}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="discount-valid-from" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                تاريخ البداية <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="discount-valid-from"
                value={form.validFrom || ''}
                onChange={(e) => handleChange('validFrom', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
              {formErrors.validFrom && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.validFrom}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="discount-valid-to" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                تاريخ النهاية <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="discount-valid-to"
                value={form.validTo || ''}
                onChange={(e) => handleChange('validTo', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
              {formErrors.validTo && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.validTo}</p>
              )}
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button 
              type="button"
              variant="secondary" 
              onClick={() => setIsAddModalOpen(false)}
              disabled={isSubmitting}
            >
              إلغاء
            </Button>
            <Button 
              type="submit" 
              variant="primary" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'جاري الحفظ...' : currentDiscount?.id ? 'تحديث الخصم' : 'إضافة الخصم'}
            </Button>
          </div>
        </form>
      </Modal>
      
      {/* Delete confirmation modal */}
      {currentDiscount && (
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
              هل أنت متأكد من حذف هذا الخصم؟
            </h3>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              سيتم حذف الخصم <span className="font-semibold text-gray-700 dark:text-gray-300">{currentDiscount.name}</span> نهائيًا.
              <br />
              هذا الإجراء لا يمكن التراجع عنه.
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
}
