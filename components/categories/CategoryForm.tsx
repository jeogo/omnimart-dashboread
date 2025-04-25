"use client";

import React, { useState, useEffect } from 'react';
import { Category } from '@/types';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';

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
  const [form, setForm] = useState({
    name: '',
    description: '',
    image: '',
    parentId: '',
    isActive: true
  });
  
  // Get available parent categories (exclude current category and its children)
  const availableParentCategories = categories.filter(c => 
    c.id !== category?.id && c.parentId !== category?.id
  );
  
  // Initialize form with category data if editing
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
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setForm({
        ...form,
        [name]: checkbox.checked
      });
    } else {
      setForm({
        ...form,
        [name]: value
      });
    }
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) {
      alert('اسم الفئة مطلوب');
      return;
    }
    // Only send fields that are not empty
    const categoryData: Partial<Category> = {
      name: form.name,
      ...(form.description && { description: form.description }),
      ...(form.image && { image: form.image }),
      ...(form.parentId && { parentId: form.parentId }),
      isActive: form.isActive,
    };
    // Always include id for updates
    if (category?.id) categoryData.id = category.id;
    else if (category?._id) categoryData.id = category._id;
    onSubmit(categoryData);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        id="category-name"
        label="اسم الفئة"
        value={form.name}
        onChange={value => setForm({ ...form, name: value })}
        required
      />
      
      {/* <TextArea ... /> */}
      <textarea
        id="category-description"
        value={form.description}
        onChange={e => setForm({ ...form, description: e.target.value })}
        rows={3}
        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
      />
      
      <Input
        id="category-image"
        label="رابط الصورة (اختياري)"
        value={form.image}
        onChange={value => setForm({ ...form, image: value })}
      />
      
      {availableParentCategories.length > 0 && (
        <Select
          id="category-parent"
          label="الفئة الأم (اختياري)"
          value={form.parentId}
          onChange={value => setForm({ ...form, parentId: value })}
          options={[
            { value: "", label: "بدون فئة أم" },
            ...availableParentCategories.map((c) => ({
              value: c.id || c._id || '',
              label: c.name
            }))
          ]}
        />
      )}
      
      <div className="flex items-center">
        <input
          id="category-active"
          name="isActive"
          type="checkbox"
          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
          checked={form.isActive}
          onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
        />
        <label htmlFor="category-active" className="mr-2 block text-sm text-gray-700 dark:text-gray-300">
          فئة نشطة
        </label>
      </div>
      
      <div className="flex justify-end pt-4">
        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting}
        >
          {category ? 'تحديث الفئة' : 'إضافة فئة'}
        </Button>
      </div>
    </form>
  );
};

export default CategoryForm;
