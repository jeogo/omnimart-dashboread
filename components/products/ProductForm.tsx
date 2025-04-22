"use client";

import React, { useState, useEffect } from 'react';
import { Product, Category, Discount } from '@/types';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import FileUpload from '@/components/ui/FileUpload';
import ColorPicker from '@/components/ui/ColorPicker';
import TagInput from '@/components/ui/TagInput';

interface ProductFormProps {
  product?: Partial<Product>;
  categories: Category[];
  discounts: Discount[];
  onSubmit: (data: Partial<Product>) => void;
  isSubmitting: boolean;
}

interface FormErrors {
  name?: string;
  price?: string;
  categoryId?: string;
  images?: string;
  sizes?: string;
  [key: string]: string | undefined;
}

const ProductForm: React.FC<ProductFormProps> = ({
  product,
  categories,
  discounts,
  onSubmit,
  isSubmitting
}) => {
  // State for form and errors
  const [form, setForm] = useState<Partial<Product>>({
    name: '',
    description: '',
    price: 0,
    categoryId: '',
    images: [],
    sizes: [],
    features: [],
    discountId: '',
    isNew: false,
    material: '',
    care: '',
    colors: []
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  
  // Update form when product changes
  useEffect(() => {
    if (product) {
      setForm({
        name: '',
        description: '',
        price: 0,
        categoryId: '',
        images: [],
        sizes: [],
        features: [],
        discountId: '',
        isNew: false,
        material: '',
        care: '',
        colors: [],
        ...product
      });
    }
  }, [product]);
  
  const handleChange = (field: keyof Product, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
    
    // Remove error when field is updated
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };
  
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!form.name?.trim()) {
      newErrors.name = 'اسم المنتج مطلوب';
    }
    
    if (!form.price || form.price <= 0) {
      newErrors.price = 'يجب إدخال سعر صحيح للمنتج';
    }
    
    if (!form.categoryId) {
      newErrors.categoryId = 'يجب اختيار فئة للمنتج';
    }
    
    if (!form.images || form.images.length === 0) {
      newErrors.images = 'يجب إضافة صورة واحدة على الأقل';
    }
    
    if (!form.sizes || form.sizes.length === 0) {
      newErrors.sizes = 'يجب إضافة مقاس واحد على الأقل';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(form);
    }
  };
  
  // Create category options
  const categoryOptions = categories.map(category => ({
    value: category.id,
    label: category.name
  }));
  
  // Create discount options
  const discountOptions = [
    { value: '', label: 'بدون خصم' },
    ...discounts.map(discount => ({
      value: discount.id,
      label: `${discount.name} (${discount.percentage}%)`
    }))
  ];
  
  // Get current discount details
  const currentDiscount = form.discountId 
    ? discounts.find(d => d.id === form.discountId) 
    : null;
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        id="product-name"
        label="اسم المنتج"
        value={form.name || ''}
        onChange={(value) => handleChange('name', value)}
        placeholder="أدخل اسم المنتج"
        required
        error={errors.name}
      />
      
      <Textarea
        id="product-description"
        label="وصف المنتج"
        value={form.description || ''}
        onChange={(value) => handleChange('description', value)}
        placeholder="أدخل وصف المنتج"
      />
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          id="product-price"
          label="سعر المنتج (د.ج)"
          type="number"
          value={form.price || ''}
          onChange={(value) => handleChange('price', parseFloat(value) || 0)}
          min={0}
          placeholder="أدخل سعر المنتج بالدينار الجزائري"
          required
          error={errors.price}
        />
        
        <Input
          id="product-old-price"
          label="السعر القديم (د.ج) (اختياري)"
          type="number"
          value={form.oldPrice || ''}
          onChange={(value) => handleChange('oldPrice', parseFloat(value) || undefined)}
          min={0}
          placeholder="أدخل السعر القديم قبل التخفيض"
        />
      </div>
      
      <Select
        id="product-category"
        label="الفئة"
        options={categoryOptions}
        value={form.categoryId || ''}
        onChange={(value) => handleChange('categoryId', value)}
        placeholder="اختر فئة للمنتج"
        required
        error={errors.categoryId}
      />
      
      <TagInput
        id="product-sizes"
        label="المقاسات المتوفرة"
        value={form.sizes || []}
        onChange={(value) => handleChange('sizes', value)}
        placeholder="أدخل المقاس واضغط Enter"
        suggestions={['S', 'M', 'L', 'XL', 'XXL', '38', '40', '42', '44']}
        required
        error={errors.sizes}
      />
      
      <ColorPicker
        id="product-colors"
        label="الألوان المتوفرة (اختياري)"
        value={form.colors || []}
        onChange={(value) => handleChange('colors', value)}
      />
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Textarea
          id="product-material"
          label="المواد (اختياري)"
          value={form.material || ''}
          onChange={(value) => handleChange('material', value)}
          placeholder="أدخل المواد المصنوع منها المنتج"
        />
        
        <Textarea
          id="product-care"
          label="العناية (اختياري)"
          value={form.care || ''}
          onChange={(value) => handleChange('care', value)}
          placeholder="أدخل تعليمات العناية بالمنتج"
        />
      </div>
      
      <TagInput
        id="product-features"
        label="مميزات المنتج (اختياري)"
        value={form.features || []}
        onChange={(value) => handleChange('features', value)}
        placeholder="أدخل ميزة واضغط Enter"
      />
      
      <div className="flex items-center space-x-4 space-x-reverse">
        <input
          type="checkbox"
          id="product-is-new"
          className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600"
          checked={form.isNew || false}
          onChange={(e) => handleChange('isNew', e.target.checked)}
        />
        <label
          htmlFor="product-is-new"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          منتج جديد
        </label>
      </div>
      
      <div>
        <Select
          id="product-discount"
          label="التخفيض (اختياري)"
          options={discountOptions}
          value={form.discountId || ''}
          onChange={(value) => handleChange('discountId', value)}
          placeholder="اختر تخفيضًا للمنتج (اختياري)"
        />
        
        {currentDiscount && (
          <div className="mt-2 p-3 bg-green-50 dark:bg-green-900 dark:bg-opacity-20 rounded-lg border border-green-100 dark:border-green-900">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-green-800 dark:text-green-300">
                  خصم فعال: {currentDiscount.percentage}%
                </p>
                <p className="text-xs text-green-700 dark:text-green-400 mt-1">
                  من {new Date(currentDiscount.validFrom).toLocaleDateString('ar-DZ')} 
                  إلى {new Date(currentDiscount.validTo).toLocaleDateString('ar-DZ')}
                </p>
              </div>
              
              <button 
                type="button" 
                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm"
                onClick={() => handleChange('discountId', '')}
              >
                إزالة الخصم
              </button>
            </div>
            
            {form.price && (
              <div className="mt-2 text-sm text-green-700 dark:text-green-400">
                <p>السعر الأصلي: <span className="font-medium">{form.price.toLocaleString('ar-DZ')} د.ج</span></p>
                <p>السعر بعد الخصم: <span className="font-medium">
                  {(form.price - (form.price * (currentDiscount.percentage / 100))).toLocaleString('ar-DZ')} د.ج
                </span></p>
              </div>
            )}
          </div>
        )}
      </div>
      
      <div>
        <label htmlFor="product-images" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          صور المنتج
          <span className="text-red-500">*</span>
        </label>
        <FileUpload
          value={form.images || []}
          onChange={(urls) => handleChange('images', urls)}
          multiple={true}
          maxUrls={5}
        />
        {errors.images && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.images}</p>
        )}
      </div>
      
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
        <Button 
          type="submit" 
          variant="primary" 
          disabled={isSubmitting}
        >
          {isSubmitting ? 'جاري الحفظ...' : product?.id ? 'تحديث المنتج' : 'إضافة المنتج'}
        </Button>
      </div>
    </form>
  );
};

export default ProductForm;
