"use client";

import { useState, useEffect } from 'react';
import { Product, Category, Discount } from '@/types';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import ProductForm from '@/components/products/ProductForm';
import ProductTable from '@/components/products/ProductTable';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function Products() {
  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showActiveOnly, setShowActiveOnly] = useState(false);

  // Fetch products, categories, and discounts
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch products
        const productsResponse = await fetch('/api/products');
        if (!productsResponse.ok) {
          throw new Error('فشل في جلب المنتجات');
        }
        const productsData = await productsResponse.json();
        
        // Fetch categories
        const categoriesResponse = await fetch('/api/categories');
        if (!categoriesResponse.ok) {
          throw new Error('فشل في جلب الفئات');
        }
        const categoriesData = await categoriesResponse.json();
        
        // Fetch active discounts only
        const discountsResponse = await fetch('/api/discounts?active=true');
        if (!discountsResponse.ok) {
          throw new Error('فشل في جلب الخصومات');
        }
        const discountsData = await discountsResponse.json();
        
        // Set state with fetched data
        setProducts(productsData.products || []);
        setCategories(categoriesData.categories || []);
        setDiscounts(discountsData.discounts || []);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'حدث خطأ أثناء جلب البيانات');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Filter products based on search term and selected category
  const filteredProducts = products
    .filter(product => 
      (searchTerm ? 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase())
        : true)
    )
    .filter(product => 
      selectedCategory ? product.categoryId === selectedCategory : true
    );

  // Add new product or edit existing one
  const handleAddProduct = () => {
    setCurrentProduct(null);
    setIsAddModalOpen(true);
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
      const isUpdate = !!productData.id;
      let url, method, body;
      
      if (isUpdate) {
        // Update existing product
        url = `/api/products/${productData.id}`;
        method = 'PUT';
        // No need to include the ID in the body when using the ID in the URL
        const { id, ...productDataWithoutId } = productData;
        body = JSON.stringify(productDataWithoutId);
      } else {
        // Create new product
        url = '/api/products';
        method = 'POST';
        body = JSON.stringify(productData);
      }
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'فشل في حفظ المنتج');
      }
      
      const data = await response.json();
      
      if (isUpdate) {
        // Update product in state
        setProducts(prevProducts =>
          prevProducts.map(p =>
            p.id === data.product.id ? data.product : p
          )
        );
      } else {
        // Add new product to state
        setProducts(prevProducts => [...prevProducts, data.product]);
      }
      
      setIsAddModalOpen(false);
    } catch (err) {
      console.error('Error saving product:', err);
      setError(err instanceof Error ? err.message : 'فشل في حفظ المنتج');
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
      const response = await fetch(`/api/products/${currentProduct.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'فشل في حذف المنتج');
      }
      
      // Remove product from state
      setProducts(prevProducts =>
        prevProducts.filter(p => p.id !== currentProduct.id)
      );
      
      setIsDeleteModalOpen(false);
    } catch (err) {
      console.error('Error deleting product:', err);
      setError(err instanceof Error ? err.message : 'فشل في حذف المنتج');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Page header */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="dashboard-title">إدارة المنتجات</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            إضافة وتعديل وإدارة منتجات المتجر
          </p>
        </div>
        
        <Button 
          variant="primary" 
          onClick={handleAddProduct}
          className="shrink-0 w-full sm:w-auto"
        >
          <span className="flex items-center gap-2 justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            <span>إضافة منتج جديد</span>
          </span>
        </Button>
      </div>
      
      {/* Filters and search */}
      <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-100 dark:border-gray-700">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Search input */}
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              البحث
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
                className="block w-full pr-10 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="البحث باسم المنتج أو الوصف"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          {/* Category filter */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              تصفية حسب الفئة
            </label>
            <select
              id="category"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">جميع الفئات</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          
          {/* Active only checkbox */}
          <div className="flex items-end">
            <label className="inline-flex items-center mb-1">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600"
                checked={showActiveOnly}
                onChange={(e) => setShowActiveOnly(e.target.checked)}
              />
              <span className="mr-2 text-sm text-gray-700 dark:text-gray-300">
                عرض المنتجات النشطة فقط
              </span>
            </label>
          </div>
        </div>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="mb-6 p-4 border border-red-300 bg-red-50 dark:bg-red-900 dark:bg-opacity-20 dark:border-red-700 rounded-lg text-red-700 dark:text-red-300">
          <p>{error}</p>
        </div>
      )}
      
      {/* Loading spinner or products table */}
      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">لا توجد منتجات</h3>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            {searchTerm || selectedCategory 
              ? 'لا توجد منتجات تطابق معايير البحث. حاول تعديل الفلاتر أو البحث.' 
              : 'لم يتم العثور على أي منتجات. أضف منتجك الأول للبدء.'}
          </p>
          {(searchTerm || selectedCategory) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('');
              }}
              className="mt-4 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              إزالة الفلاتر
            </button>
          )}
        </div>
      ) : (
        <ProductTable 
          products={filteredProducts} 
          onEdit={handleEditProduct} 
          onDelete={handleDeleteClick}
          discounts={discounts}
          categories={categories}
        />
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
      
      {/* Delete confirmation modal */}
      {currentProduct && (
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
              هل أنت متأكد من حذف هذا المنتج؟
            </h3>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              سيتم حذف المنتج <span className="font-semibold text-gray-700 dark:text-gray-300">{currentProduct.name}</span> نهائيًا.
              <br />
              هذا الإجراء لا يمكن التراجع عنه.
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
}
