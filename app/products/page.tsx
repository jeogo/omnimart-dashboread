"use client";

import { useState, useEffect } from 'react';
import { Product, Category, Discount } from '@/types';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ProductCardGrid from '@/components/products/ProductCardGrid';
import ProductForm from '@/components/products/ProductForm';
import ProductDisplay from '@/components/products/ProductDisplay';
import DeleteConfirmationModal from '@/components/ui/DeleteConfirmationModal';
import {apiUtils} from '@/utils/apiUtils';

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    // Fetch products, categories, and discounts
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [productsData, categoriesData, discountsData] = await Promise.all([
          apiUtils.getAllProducts(),
          apiUtils.getAllCategories(),
          apiUtils.getAllDiscounts(),
        ]);
        // Normalize products
        const normalizedProducts = productsData.map((product: Product) => ({
          ...product,
          id: product.id || product._id,
          categoryId: typeof product.category === 'string'
            ? product.category
            : product.category?._id || product.categoryId,
          images: Array.isArray(product.images)
            ? product.images
            : (product.imageUrl ? [product.imageUrl] : []),
        }));
        setProducts(normalizedProducts);
        setCategories(categoriesData);
        setDiscounts(discountsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'حدث خطأ أثناء جلب البيانات');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter products based on search term and selected category
  const filteredProducts = products.filter(product => {
    const matchesSearch = searchTerm 
      ? product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
      : true;
    const matchesCategory = selectedCategory 
      ? product.categoryId === selectedCategory 
      : true;
    return matchesSearch && matchesCategory;
  });

  // Add new product
  const handleAddProduct = () => {
    setCurrentProduct(null);
    setIsAddModalOpen(true);
  };

  // View product details
  const handleViewProduct = (product: Product) => {
    setCurrentProduct(product);
    setIsViewModalOpen(true);
  };

  // Edit product
  const handleEditProduct = (product: Product) => {
    setCurrentProduct(product);
    setIsAddModalOpen(true);
  };

  // Delete product (show confirmation)
  const handleDeleteClick = (product: Product) => {
    setCurrentProduct(product);
    setIsDeleteModalOpen(true);
  };

  // Save product (create or update)
  const handleSaveProduct = async (productData: Partial<Product>) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const isUpdate = !!productData.id || !!productData._id;
      let responseData: Product;
      // Prepare payload
      const payload: Partial<Product> = {
        ...productData,
        category: productData.categoryId || (typeof productData.category === 'string' ? productData.category : productData.category?._id),
        images: Array.isArray(productData.images) ? productData.images : [],
      };
      delete payload.id;
      delete payload._id;
      delete payload.categoryId;

      if (isUpdate && (productData.id || productData._id)) {
        const productId = (productData.id || productData._id) ?? '';
        if (!productId) throw new Error('Product ID is required for update');
        responseData = await apiUtils.updateProduct(productId, payload);
      } else {
        responseData = await apiUtils.createProduct(payload);
      }
      responseData = {
        ...responseData,
        id: responseData.id || responseData._id,
        categoryId: typeof responseData.category === 'string'
          ? responseData.category
          : responseData.category?._id || responseData.categoryId,
        images: Array.isArray(responseData.images)
          ? responseData.images
          : (responseData.imageUrl ? [responseData.imageUrl] : []),
      };
      if (isUpdate) {
        setProducts(prevProducts =>
          prevProducts.map(p =>
            (p.id === (productData.id || productData._id) || p._id === (productData.id || productData._id)) 
              ? responseData 
              : p
          )
        );
      } else {
        setProducts(prevProducts => [...prevProducts, responseData]);
      }
      setIsAddModalOpen(false);
      // Use notification instead of alert
      const notification = document.getElementById('notification');
      if (notification) {
        notification.textContent = isUpdate ? 'تم تحديث المنتج بنجاح' : 'تم إضافة المنتج بنجاح';
        notification.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in-down';
        setTimeout(() => {
          notification.className = 'hidden';
        }, 3000);
      }
    } catch (err) {
      let errorMessage = 'فشل في حفظ المنتج';
      if (err instanceof Error) errorMessage = err.message;
      if (err && (err as any).response && (err as any).response.data) {
        const responseData = (err as any).response.data;
        if (responseData.message) errorMessage = responseData.message;
        else if (responseData.error) errorMessage = responseData.error;
      }
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirm product deletion
  const handleConfirmDelete = async () => {
    if (!currentProduct) return;
    setIsDeleting(true);
    setError(null);
    try {
      const productId = (currentProduct.id || currentProduct._id) ?? '';
      if (!productId) throw new Error('Product ID is required for delete');
      await apiUtils.deleteProduct(productId);
      setProducts(prevProducts =>
        prevProducts.filter(p => p.id !== productId && p._id !== productId)
      );
      setIsDeleteModalOpen(false);
      
      // Show success notification
      const notification = document.getElementById('notification');
      if (notification) {
        notification.textContent = 'تم حذف المنتج بنجاح';
        notification.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in-down';
        setTimeout(() => {
          notification.className = 'hidden';
        }, 3000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل في حذف المنتج');
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">إدارة المنتجات</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            إضافة وتعديل وإدارة المنتجات في المتجر
          </p>
        </div>
        <Button 
          variant="primary" 
          onClick={handleAddProduct}
          className="shrink-0 w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>إضافة منتج جديد</span>
        </Button>
      </div>
      
      {/* Filters */}
      <div className="mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Search input */}
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              البحث في المنتجات
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
                placeholder="البحث باسم المنتج أو الوصف"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          {/* Category filter */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              تصفية حسب الفئة
            </label>
            <select
              id="category"
              className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">جميع الفئات</option>
              {categories.map((category) => (
                <option key={category.id || category._id} value={category.id || category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Quick stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
          <div className="bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20 p-3 rounded-lg">
            <div className="text-xs text-blue-500 dark:text-blue-300 font-medium">إجمالي المنتجات</div>
            <div className="text-xl font-bold text-gray-900 dark:text-white mt-1">{products.length}</div>
          </div>
          <div className="bg-green-50 dark:bg-green-900 dark:bg-opacity-20 p-3 rounded-lg">
            <div className="text-xs text-green-500 dark:text-green-300 font-medium">متوفر في المخزون</div>
            <div className="text-xl font-bold text-gray-900 dark:text-white mt-1">
              {products.filter(p => (p.stock || 0) > 0).length}
            </div>
          </div>
          <div className="bg-orange-50 dark:bg-orange-900 dark:bg-opacity-20 p-3 rounded-lg">
            <div className="text-xs text-orange-500 dark:text-orange-300 font-medium">منتجات جديدة</div>
            <div className="text-xl font-bold text-gray-900 dark:text-white mt-1">
              {products.filter(p => p.isNewProduct).length}
            </div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900 dark:bg-opacity-20 p-3 rounded-lg">
            <div className="text-xs text-purple-500 dark:text-purple-300 font-medium">بخصومات</div>
            <div className="text-xl font-bold text-gray-900 dark:text-white mt-1">
              {products.filter(p => p.discountId).length}
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
      
      {/* Loading spinner or products grid */}
      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-10 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">لا توجد منتجات</h3>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            {searchTerm || selectedCategory
              ? 'لا توجد منتجات تطابق معايير البحث'
              : 'لم يتم العثور على أي منتجات. أضف منتج جديد للبدء.'
            }
          </p>
          {(searchTerm || selectedCategory) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('');
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
            <div>عرض {filteredProducts.length} من أصل {products.length} منتج</div>
          </div>
          <ProductCardGrid
            products={filteredProducts}
            discounts={discounts}
            onView={handleViewProduct}
            onEdit={handleEditProduct}
            onDelete={handleDeleteClick}
          />
        </div>
      )}
      
      {/* Add/Edit product modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={currentProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}
        size="lg"
      >
        <ProductForm 
          product={currentProduct || undefined}
          categories={categories}
          discounts={discounts}
          onSubmit={handleSaveProduct}
          isSubmitting={isSubmitting}
        />
      </Modal>
      
      {/* View product modal */}
      {currentProduct && (
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title={`معلومات المنتج: ${currentProduct.name}`}
          size="lg"
          footer={
            <Button
              variant="secondary"
              onClick={() => setIsViewModalOpen(false)}
            >
              إغلاق
            </Button>
          }
        >
          <ProductDisplay 
            product={currentProduct}
            categories={categories}
            discounts={discounts}
          />
        </Modal>
      )}
      
      {/* Delete confirmation modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="تأكيد حذف المنتج"
        entityName={currentProduct?.name || 'المنتج'}
        isDeleting={isDeleting}
      />
    </div>
  );
}
