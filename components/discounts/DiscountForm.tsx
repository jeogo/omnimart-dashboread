"use client";

import React, { useState, useEffect } from 'react';
import { Discount, Product } from '@/types';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import DatePicker from '@/components/ui/DatePicker';
import MultiSelect from '../ui/MultiSelect';

interface DiscountFormProps {
  discount?: Discount;
  products: Product[];
  onSubmit: (data: Partial<Discount>) => void;
  isSubmitting: boolean;
}

const DiscountForm: React.FC<DiscountFormProps> = ({
  discount,
  products,
  onSubmit,
  isSubmitting
}) => {
  // Initial form state based on discount or default values
  const [form, setForm] = useState<Partial<Discount>>({
    name: '',
    percentage: 10,
    validFrom: new Date(),
    validTo: new Date(new Date().setMonth(new Date().getMonth() + 1)), // Default 1 month period
    type: 'sale',
    applicableProducts: [],
    minPurchase: 0,
    code: '',
    isActive: true
  });
  
  // Errors state
  const [errors, setErrors] = useState<{
    name?: string;
    percentage?: string;
    validFrom?: string;
    validTo?: string;
    code?: string;
  }>({});

  // Update form when discount changes (for editing)
  useEffect(() => {
    if (discount) {
      // Convert string dates to Date objects for the form
      const formData = {
        ...discount,
        validFrom: discount.validFrom ? new Date(discount.validFrom) : new Date(),
        validTo: discount.validTo ? new Date(discount.validTo) : new Date(new Date().setMonth(new Date().getMonth() + 1))
      };
      setForm(formData);
    }
  }, [discount]);

  // Handle form field changes
  const handleChange = (field: keyof Discount, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
    // Clear error when field is updated
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };
  
  // Validate form before submit
  const validateForm = (): boolean => {
    const newErrors: {
      name?: string;
      percentage?: string;
      validFrom?: string;
      validTo?: string;
      code?: string;
    } = {};
    
    // Required fields validation
    if (!form.name?.trim()) {
      newErrors.name = 'اسم التخفيض مطلوب';
    }
    
    if (!form.percentage || form.percentage < 1 || form.percentage > 100) {
      newErrors.percentage = 'يجب أن تكون نسبة التخفيض بين 1% و 100%';
    }
    
    // Validate date range
    if (!form.validFrom) {
      newErrors.validFrom = 'تاريخ بداية التخفيض مطلوب';
    }
    
    if (!form.validTo) {
      newErrors.validTo = 'تاريخ نهاية التخفيض مطلوب';
    } else if (form.validFrom && form.validTo && new Date(form.validFrom) > new Date(form.validTo)) {
      newErrors.validTo = 'يجب أن يكون تاريخ النهاية بعد تاريخ البداية';
    }
    
    // Code format validation (if provided)
    if (form.code && !/^[A-Za-z0-9_-]{3,20}$/.test(form.code)) {
      newErrors.code = 'رمز الخصم يجب أن يتكون من 3-20 حرف أو رقم فقط';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Create a copy of the form data for submission
      // Keep dates as Date objects to match the Discount type
      const formData = {
        ...form
      };
      
      onSubmit(formData);
    }
  };

  // Product options for multi-select
  const productOptions = products.map(product => ({
    value: product.id,
    label: product.name
  }));

  // Discount type options
  const typeOptions = [
    { value: 'sale', label: 'تخفيض عام' },
    { value: 'special', label: 'عرض خاص' },
    { value: 'seasonal', label: 'عرض موسمي' }
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        id="discount-name"
        label="اسم التخفيض"
        value={form.name || ''}
        onChange={(value) => handleChange('name', value)}
        placeholder="أدخل اسم التخفيض"
        required
        error={errors.name}
      />
      
      <Input
        id="discount-percentage"
        label="نسبة التخفيض (%)"
        type="number"
        value={form.percentage || ''}
        onChange={(value) => handleChange('percentage', parseInt(value) || 0)}
        min={1}
        max={100}
        placeholder="أدخل نسبة التخفيض"
        required
        error={errors.percentage}
      />
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <DatePicker
          id="discount-valid-from"
          label="تاريخ بداية التخفيض"
          selectedDate={form.validFrom instanceof Date ? form.validFrom : new Date(form.validFrom || '')}
          onChange={(date) => handleChange('validFrom', date)}
          required
          error={errors.validFrom}
        />
        
        <DatePicker
          id="discount-valid-to"
          label="تاريخ نهاية التخفيض"
          selectedDate={form.validTo instanceof Date ? form.validTo : new Date(form.validTo || '')}
          onChange={(date) => handleChange('validTo', date)}
          required
          error={errors.validTo}
        />
      </div>
      
      <Select
        id="discount-type"
        label="نوع التخفيض"
        options={typeOptions}
        value={form.type || 'sale'}
        onChange={(value) => handleChange('type', value)}
        placeholder="اختر نوع التخفيض"
      />
      
      <Input
        id="discount-code"
        label="رمز التخفيض (اختياري)"
        value={form.code || ''}
        onChange={(value) => handleChange('code', value.toUpperCase())}
        placeholder="أدخل رمزًا للخصم"
        error={errors.code}
      />
      
      <Input
        id="discount-min-purchase"
        label="الحد الأدنى للشراء (د.ج) (اختياري)"
        type="number"
        value={form.minPurchase || ''}
        onChange={(value) => handleChange('minPurchase', parseFloat(value) || 0)}
        min={0}
        placeholder="أدخل الحد الأدنى للشراء"
      />
      
      <MultiSelect
        id="discount-products"
        label="المنتجات المطبق عليها التخفيض (اختياري)"
        options={productOptions}
        value={form.applicableProducts || []}
        onChange={(value: string[]) => handleChange('applicableProducts', value)}
        placeholder="اختر المنتجات (اترك فارغاً للتطبيق على جميع المنتجات)"
      />
      
      <div className="flex items-center">
        <input
          type="checkbox"
          id="discount-active"
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          checked={form.isActive !== false}
          onChange={(e) => handleChange('isActive', e.target.checked)}
        />
        <label htmlFor="discount-active" className="mr-2 block text-sm text-gray-700 dark:text-gray-300">
          تخفيض نشط
        </label>
      </div>
      
      <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'جاري الحفظ...' : discount ? 'تحديث التخفيض' : 'إضافة التخفيض'}
        </Button>
      </div>
    </form>
  );
};

export default DiscountForm;
