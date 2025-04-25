"use client";

import React, { useState, useEffect } from 'react';
import { Discount } from '@/types';
import Button from '@/components/ui/Button';

interface DiscountFormProps {
  discount?: Discount;
  onSubmit: (data: Partial<Discount>) => void;
  isSubmitting: boolean;
}

const DiscountForm: React.FC<DiscountFormProps> = ({
  discount,
  onSubmit,
  isSubmitting
}) => {
  const today = new Date();
  const defaultStart = today.toISOString().slice(0, 10);
  const defaultEnd = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const [form, setForm] = useState<Partial<Discount>>({
    name: '',
    code: '',
    percentage: 10,
    validFrom: defaultStart,
    validTo: defaultEnd,
    isActive: true,
  });

  const [errors, setErrors] = useState<{
    code?: string;
    percentage?: string;
    validFrom?: string;
    validTo?: string;
  }>({});

  useEffect(() => {
    if (discount) {
      setForm({
        name: discount.name || '',
        code: discount.code || '',
        percentage: discount.percentage,
        validFrom: discount.validFrom
          ? new Date(discount.validFrom).toISOString().slice(0, 10)
          : defaultStart,
        validTo: discount.expiresAt
          ? new Date(discount.expiresAt).toISOString().slice(0, 10)
          : (discount.validTo ? new Date(discount.validTo).toISOString().slice(0, 10) : defaultEnd),
        isActive: discount.isActive !== false,
      });
    } else {
      setForm({
        name: '',
        code: '',
        percentage: 10,
        validFrom: defaultStart,
        validTo: defaultEnd,
        isActive: true,
      });
    }
    setErrors({});
    // eslint-disable-next-line
  }, [discount]);

  const handleChange = (field: keyof Discount, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};
    if (!form.code?.trim()) {
      newErrors.code = 'رمز الخصم مطلوب';
    } else if (!/^[A-Z0-9_-]{3,20}$/.test(form.code.trim().toUpperCase())) {
      newErrors.code = 'رمز الخصم يجب أن يتكون من 3-20 حرف أو رقم';
    }
    if (!form.percentage || form.percentage < 1 || form.percentage > 100) {
      newErrors.percentage = 'النسبة يجب أن تكون بين 1 و 100';
    }
    if (!form.validFrom) {
      newErrors.validFrom = 'تاريخ البداية مطلوب';
    }
    if (!form.validTo) {
      newErrors.validTo = 'تاريخ الانتهاء مطلوب';
    } else if (form.validFrom && form.validTo && form.validFrom > form.validTo) {
      newErrors.validTo = 'تاريخ الانتهاء يجب أن يكون بعد تاريخ البداية';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    const payload: Partial<Discount> = {
      code: form.code?.trim().toUpperCase(),
      percentage: Number(form.percentage),
      validFrom: form.validFrom,
      expiresAt: new Date(form.validTo as string).toISOString(),
    };
    if (form.name?.trim()) payload.name = form.name.trim();
    if (discount?.id || discount?._id) payload.id = discount.id || discount._id;
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="form-group">
        <label htmlFor="discount-code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          رمز الخصم <span className="text-red-500">*</span>
        </label>
        <input
          id="discount-code"
          type="text"
          value={form.code || ''}
          onChange={e => handleChange('code', e.target.value.toUpperCase())}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          placeholder="مثال: SUMMER25"
          required
        />
        {errors.code && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.code}</p>}
      </div>
      <div className="form-group">
        <label htmlFor="discount-percentage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          نسبة الخصم (%) <span className="text-red-500">*</span>
        </label>
        <input
          id="discount-percentage"
          type="number"
          value={form.percentage || ''}
          onChange={e => handleChange('percentage', parseInt(e.target.value) || 0)}
          min={1}
          max={100}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          required
        />
        {errors.percentage && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.percentage}</p>}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="discount-valid-from" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            تاريخ البداية <span className="text-red-500">*</span>
          </label>
          <input
            id="discount-valid-from"
            type="date"
            value={form.validFrom || ''}
            onChange={e => handleChange('validFrom', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            required
          />
          <span className="text-xs text-gray-500 dark:text-gray-400">حدد تاريخ بداية تفعيل الخصم</span>
          {errors.validFrom && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.validFrom}</p>}
        </div>
        <div>
          <label htmlFor="discount-valid-to" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            تاريخ الانتهاء <span className="text-red-500">*</span>
          </label>
          <input
            id="discount-valid-to"
            type="date"
            value={form.validTo || ''}
            onChange={e => handleChange('validTo', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            required
          />
          <span className="text-xs text-gray-500 dark:text-gray-400">حدد تاريخ نهاية الخصم</span>
          {errors.validTo && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.validTo}</p>}
        </div>
      </div>
      <div className="form-group">
        <label htmlFor="discount-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          اسم التخفيض (اختياري)
        </label>
        <input
          id="discount-name"
          type="text"
          value={form.name || ''}
          onChange={e => handleChange('name', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          placeholder="مثال: خصم الصيف"
        />
      </div>
      <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {isSubmitting ? 'جاري الحفظ...' : discount ? 'تحديث التخفيض' : 'إضافة التخفيض'}
        </Button>
      </div>
    </form>
  );
};

export default DiscountForm;
