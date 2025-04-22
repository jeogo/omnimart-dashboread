"use client";

import React, { useState, useEffect } from 'react';
import { Category } from '@/types';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import FileUpload from '@/components/ui/FileUpload';

interface CategoryFormProps {
  category?: Category;
  categories: Category[];
  onSubmit: (data: Partial<Category>) => void;
  isSubmitting: boolean;
}

const CategoryForm: React.FC<CategoryFormProps> = ({
  category,
  categories,
  onSubmit,
  isSubmitting
}) => {
  // Form state
  const [form, setForm] = useState<Partial<Category>>({
    name: '',
    description: '',
    image: '',
    parentId: '',
    isActive: true
  });
  
  // Errors state
  const [errors, setErrors] = useState<{
    name?: string;
  }>({});

  // Update form when category changes
  useEffect(() => {
    if (category) {
      setForm({
        name: category.name || '',
        description: category.description || '',
        image: category.image || '',
        parentId: category.parentId || '',
        isActive: category.isActive !== false
      });
    } else {
      setForm({
        name: '',
        description: '',
        image: '',
        parentId: '',
        isActive: true
      });
    }
  }, [category]);

  // Handle form field changes
  const handleChange = (field: keyof Category, value: any) => {
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
    } = {};
    
    if (!form.name?.trim()) {
      newErrors.name = 'اسم الفئة مطلوب';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Create a clean copy of the form data to avoid reference issues
      const formData = JSON.parse(JSON.stringify(form));
      
      // Ensure ID is preserved if this is an update
      if (category?.id) {
        formData.id = category.id;
        console.log('Submitting update for category ID:', category.id);
      }
      
      // Make sure parentId is correctly handled
      if (formData.parentId === '') {
        formData.parentId = null;
      }
      
      console.log('Form data being submitted:', formData);
      onSubmit(formData);
    }
  };

  // Filter categories to exclude current category and its children (to prevent circular references)
  const availableParentCategories = categories.filter(c => 
    c.id !== category?.id
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        id="category-name"
        label="اسم الفئة"
        value={form.name || ''}
        onChange={(value) => handleChange('name', value)}
        placeholder="أدخل اسم الفئة"
        required
        error={errors.name}
      />
      
      <Textarea
        id="category-description"
        label="وصف الفئة (اختياري)"
        value={form.description || ''}
        onChange={(value) => handleChange('description', value)}
        placeholder="أدخل وصفًا موجزًا للفئة"
      />
      
      {availableParentCategories.length > 0 && (
        <Select
          id="category-parent"
          label="الفئة الأم (اختياري)"
          options={[
            { value: '', label: 'بدون فئة أم' },
            ...availableParentCategories.map(c => ({
              value: c.id,
              label: c.name
            }))
          ]}
          value={form.parentId || ''}
          onChange={(value) => handleChange('parentId', value)}
          placeholder="اختر الفئة الأم"
        />
      )}
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          صورة الفئة (اختياري)
        </label>
        <FileUpload
          value={form.image ? [form.image] : []}
          onChange={(urls) => handleChange('image', urls[0] || '')}
          multiple={false}
          maxUrls={1}
        />
      </div>
      
      <div className="flex items-center">
        <input
          type="checkbox"
          id="category-active"
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          checked={form.isActive !== false}
          onChange={(e) => handleChange('isActive', e.target.checked)}
        />
        <label htmlFor="category-active" className="mr-2 block text-sm text-gray-700 dark:text-gray-300">
          فئة نشطة
        </label>
      </div>
      
      <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'جاري الحفظ...' : category ? 'تحديث الفئة' : 'إضافة الفئة'}
        </Button>
      </div>
    </form>
  );
};

export default CategoryForm;
