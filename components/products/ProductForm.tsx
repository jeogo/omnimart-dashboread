import React, { useState, useEffect } from 'react';
import { Product, Category, Discount } from '@/types';
import FileUpload from '../ui/FileUpload';
import Button from '../ui/Button';
import TagInput from '../ui/TagInput';
import ColorPicker from '../ui/ColorPicker';

interface ProductFormProps {
  product?: Partial<Product>;
  categories: Category[];
  discounts: Discount[];
  onSubmit: (data: Partial<Product>) => void;
  isSubmitting?: boolean;
}

const ProductForm: React.FC<ProductFormProps> = ({
  product,
  categories,
  discounts,
  onSubmit,
  isSubmitting,
}) => {
  const [form, setForm] = useState<Partial<Product>>({
    name: '',
    description: '',
    price: 0,
    categoryId: '',
    sizes: [],
    colors: [],
    material: '',
    care: '',
    features: [] as string[],
    isNewProduct: false,
    discountId: null,
    images: [],
    stock: 0,
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [activeTab, setActiveTab] = useState('basic');

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name ?? '',
        description: product.description ?? '',
        price: product.price ?? 0,
        categoryId: product.categoryId ??
          (typeof product.category === 'string' ? product.category : product.category?._id),
        sizes: product.sizes ?? [],
        colors: product.colors ?? [],
        material: product.material ?? '',
        care: product.care ?? '',
        features: product.features ?? [],
        isNewProduct: product.isNewProduct ?? false,
        discountId: product.discountId ?? null,
        images: Array.isArray(product.images)
          ? product.images
          : (product.imageUrl ? [product.imageUrl] : []),
        stock: product.stock ?? 0,
      });
    } else {
      setForm({
        name: '',
        description: '',
        price: 0,
        categoryId: '',
        sizes: [],
        colors: [],
        material: '',
        care: '',
        isNewProduct: false,
        discountId: null,
        images: [],
        stock: 0,
      });
    }
    setErrors({});
  }, [product]);

  const handleChange = (field: keyof Product, value: any) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  const handleDiscountChange = (discountId: string | null) => {
    setForm((prev) => ({
      ...prev,
      discountId: discountId === '' ? null : discountId
    }));
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors['discountId'];
      return newErrors;
    });
  };

  const handlePriceChange = (value: string) => {
    const numericValue = Number(value) || 0;
    setForm((prev) => ({
      ...prev,
      price: numericValue
    }));
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors['price'];
      return newErrors;
    });
  };

  const handleFileUpload = (newUrls: string[]) => {
    const validUrls = newUrls
      .filter(url => typeof url === 'string' && url.trim() !== '')
      .map(url => url.trim());
    setForm(prev => ({
      ...prev,
      images: validUrls
    }));
    if (validUrls.length > 0) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors['images'];
        return newErrors;
      });
    }
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!form.name) newErrors.name = 'اسم المنتج مطلوب';
    if (!form.price || form.price <= 0) newErrors.price = 'يجب إدخال سعر صحيح للمنتج';
    if (!form.categoryId) newErrors.categoryId = 'يجب اختيار قسم';
    if (!form.images || !Array.isArray(form.images) || form.images.length === 0) {
      newErrors.images = 'يجب إضافة صورة واحدة على الأقل';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Always send category as string (categoryId)
    const submissionData: Partial<Product> = {
      name: form.name,
      price: Number(form.price) || 0,
      category: form.categoryId || '',
      stock: Number(form.stock) || 0,
    };

    if (form.description) submissionData.description = form.description;
    if (Array.isArray(form.images) && form.images.length > 0) {
      submissionData.images = form.images.filter(url => typeof url === 'string' && url.trim() !== '');
    }
    if (Array.isArray(form.sizes)) {
      submissionData.sizes = form.sizes;
    }
    if (Array.isArray(form.colors)) {
      submissionData.colors = form.colors;
    }
    if (typeof form.material === 'string') {
      submissionData.material = form.material;
    }
    if (typeof form.care === 'string') {
      submissionData.care = form.care;
    }
    if (Array.isArray(form.features)) {
      submissionData.features = form.features;
    }
    if (typeof form.isNewProduct === 'boolean') {
      submissionData.isNewProduct = form.isNewProduct;
    }
    // Always include id for updates
    if (product?.id) submissionData.id = product.id;
    else if (product?._id) submissionData.id = product._id;
    // Always include discountId, even if null or empty
    if (form.discountId === '' || form.discountId === null) {
      submissionData.discountId = null;
    }

    onSubmit(submissionData);
  };

  const discountOptions = discounts.map((discount) => ({
    value: discount._id || discount.id || '',
    label: discount.name || discount.code,
  }));

  const currentDiscount = form.discountId
    ? discounts.find((d) =>
        String(d._id) === String(form.discountId) ||
        String(d.id) === String(form.discountId)
      )
    : null;

  const discountedPrice =
    typeof form.price === 'number' && form.price > 0 && currentDiscount &&
    typeof currentDiscount.percentage === 'number' && currentDiscount.percentage > 0
      ? Math.round(form.price - (form.price * (currentDiscount.percentage / 100)))
      : null;

  const isDiscountActive =
    currentDiscount &&
    currentDiscount.validFrom &&
    currentDiscount.validTo &&
    new Date() >= new Date(currentDiscount.validFrom ?? '1970-01-01') &&
    new Date() <= new Date(currentDiscount.validTo ?? '1970-01-01');

  const formatDate = (date?: string) => {
    if (!date) return "اليوم";
    const d = new Date(date);
    return isNaN(d.getTime()) ? "اليوم" : d.toLocaleDateString('ar-DZ');
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      {/* Tabs navigation */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        <button
          className={`px-4 py-3 font-medium text-sm border-b-2 ${
            activeTab === 'basic'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('basic')}
        >
          المعلومات الأساسية
        </button>
        <button
          className={`px-4 py-3 font-medium text-sm border-b-2 ${
            activeTab === 'images'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('images')}
        >
          الصور
        </button>
        <button
          className={`px-4 py-3 font-medium text-sm border-b-2 ${
            activeTab === 'pricing'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('pricing')}
        >
          السعر والخصومات
        </button>
        <button
          className={`px-4 py-3 font-medium text-sm border-b-2 ${
            activeTab === 'details'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('details')}
        >
          تفاصيل إضافية
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Basic Info Tab */}
        {activeTab === 'basic' && (
          <div className="space-y-5">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              المعلومات الأساسية
            </h3>
            <div>
              <label htmlFor="product-name" className="block font-medium mb-1">
                اسم المنتج <span className="text-red-500">*</span>
              </label>
              <input
                id="product-name"
                type="text"
                className={`w-full px-4 py-2 border ${
                  errors.name 
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                } rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="أدخل اسم المنتج"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>}
            </div>
            <div>
              <label htmlFor="product-description" className="block font-medium mb-1">
                وصف المنتج
              </label>
              <textarea
                id="product-description"
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={form.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="أدخل وصفًا تفصيليًا للمنتج"
              />
            </div>
            <div>
              <label htmlFor="product-category" className="block font-medium mb-1">
                القسم <span className="text-red-500">*</span>
              </label>
              <select
                id="product-category"
                className={`w-full px-4 py-2 border ${
                  errors.categoryId 
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                } rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
                value={form.categoryId}
                onChange={(e) => handleChange('categoryId', e.target.value)}
              >
                <option value="">اختر القسم</option>
                {categories.map((cat) => (
                  <option key={cat.id || cat._id} value={cat.id || cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.categoryId}</p>
              )}
            </div>
            <div className="flex items-center">
              <input
                id="product-is-new"
                type="checkbox"
                checked={form.isNewProduct}
                onChange={(e) => handleChange('isNewProduct', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
              <label htmlFor="product-is-new" className="mr-2 font-medium">
                منتج جديد
              </label>
            </div>
          </div>
        )}

        {/* Images Tab */}
        {activeTab === 'images' && (
          <div className="space-y-5">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              صور المنتج
            </h3>
            <div>
              <label className="block font-medium mb-2">
                صور المنتج <span className="text-red-500">*</span>
              </label>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                أضف صورًا واضحة للمنتج. يفضل إضافة أكثر من صورة من زوايا مختلفة.
              </p>
              <FileUpload
                value={form.images}
                onUpload={handleFileUpload}
                multiple={true}
                maxUrls={5}
              />
              {errors.images && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.images}</p>
              )}
            </div>
          </div>
        )}

        {/* Pricing Tab */}
        {activeTab === 'pricing' && (
          <div className="space-y-5">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              السعر والمخزون
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="product-price" className="block font-medium mb-1">
                  السعر <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="product-price"
                    type="number"
                    className={`w-full px-4 py-2 border ${
                      errors.price 
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    } rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
                    value={form.price || 0}
                    min={0}
                    onChange={(e) => handlePriceChange(e.target.value)}
                    placeholder="أدخل سعر المنتج"
                  />
                  <span className="absolute inset-y-0 left-0 px-3 flex items-center text-gray-500 dark:text-gray-400">
                    د.ج
                  </span>
                </div>
                {errors.price && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.price}</p>
                )}
              </div>
              <div>
                <label htmlFor="product-stock" className="block font-medium mb-1">
                  المخزون
                </label>
                <input
                  id="product-stock"
                  type="number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={form.stock || 0}
                  min={0}
                  onChange={(e) => handleChange('stock', Number(e.target.value))}
                  placeholder="كمية المخزون المتوفرة"
                />
              </div>
            </div>
            <div>
              <label htmlFor="product-discount" className="block font-medium mb-1">
                التخفيض (اختياري)
              </label>
              <select
                id="product-discount"
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={form.discountId || ''}
                onChange={(e) => handleDiscountChange(e.target.value || null)}
              >
                <option value="">بدون تخفيض</option>
                {discountOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            {currentDiscount && (
              <div className="bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20 rounded p-4 text-sm">
                <div className="font-medium flex justify-between">
                  <span>الخصم: {currentDiscount.percentage}%</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    isDiscountActive 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:bg-opacity-40 dark:text-green-300' 
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {isDiscountActive ? 'فعال' : 'غير فعال'}
                  </span>
                </div>
                <div className="mt-2 flex justify-between text-gray-600 dark:text-gray-400">
                  <span>من: {formatDate(currentDiscount.validFrom)}</span>
                  <span>إلى: {formatDate(currentDiscount.validTo || currentDiscount.expiresAt)}</span>
                </div>
                {discountedPrice && (
                  <div className="mt-2 pt-2 border-t border-blue-100 dark:border-blue-800">
                    <div className="flex justify-between">
                      <span>السعر الأصلي:</span>
                      <span className="line-through">{form.price?.toLocaleString('ar-DZ')} د.ج</span>
                    </div>
                    <div className="flex justify-between font-bold text-green-600 dark:text-green-400">
                      <span>السعر بعد الخصم:</span>
                      <span>{discountedPrice.toLocaleString('ar-DZ')} د.ج</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Details Tab */}
        {activeTab === 'details' && (
          <div className="space-y-5">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              تفاصيل إضافية
            </h3>
            <div>
              <label htmlFor="product-sizes" className="block font-medium mb-1">
                المقاسات المتاحة (اختياري)
              </label>
              <TagInput
                id="product-sizes"
                value={Array.isArray(form.sizes) ? form.sizes : []}
                onChange={(sizes) => handleChange('sizes', sizes)}
                placeholder="أضف مقاسًا واضغط Enter" label={''}              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                أضف كل مقاس واضغط Enter أو فاصلة
              </p>
            </div>
            <div>
              <label className="block font-medium mb-1">
                الألوان المتاحة (اختياري)
              </label>
              <ColorPicker
                value={Array.isArray(form.colors) ? form.colors : []}
                onChange={(colors) => handleChange('colors', colors)} id={''} label={''}              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                أضف لونًا واضغط Enter أو اختر من اللوحة
              </p>
            </div>
            <div>
              <label htmlFor="product-material" className="block font-medium mb-1">
                الخامة (اختياري)
              </label>
              <input
                id="product-material"
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={form.material || ''}
                onChange={(e) => handleChange('material', e.target.value)}
                placeholder="مثال: قطن، حرير، جلد"
              />
            </div>
            <div>
              <label htmlFor="product-care" className="block font-medium mb-1">
                تعليمات العناية (اختياري)
              </label>
              <textarea
                id="product-care"
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={form.care || ''}
                onChange={(e) => handleChange('care', e.target.value)}
                placeholder="مثال: غسيل يدوي بماء بارد، تنظيف جاف"
                rows={2}
              />
            </div>
            <div>
              <label htmlFor="product-features" className="block font-medium mb-1">
                المميزات (اختياري)
              </label>
              <textarea
                id="product-features"
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={Array.isArray(form.features) ? form.features.join('\n') : ''}
                onChange={(e) =>
                  handleChange(
                    'features',
                    e.target.value
                      .split('\n')
                      .map((f) => f.trim())
                      .filter(Boolean)
                  )
                }
                placeholder="ميزة واحدة في كل سطر"
                rows={3}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                أدخل كل ميزة في سطر منفصل
              </p>
            </div>
          </div>
        )}

        {/* Form actions */}
        <div className="pt-5 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <div className="flex gap-2">
            {activeTab !== 'basic' && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  const tabs = ['basic', 'images', 'pricing', 'details'];
                  const currentIndex = tabs.indexOf(activeTab);
                  setActiveTab(tabs[currentIndex - 1]);
                }}
              >
                السابق
              </Button>
            )}
            {activeTab !== 'details' && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  const tabs = ['basic', 'images', 'pricing', 'details'];
                  const currentIndex = tabs.indexOf(activeTab);
                  setActiveTab(tabs[currentIndex + 1]);
                }}
              >
                التالي
              </Button>
            )}
          </div>
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
            className="min-w-[120px]"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>جاري الحفظ...</span>
              </span>
            ) : (
              <span>{product?.id ? 'تحديث المنتج' : 'إضافة المنتج'}</span>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;