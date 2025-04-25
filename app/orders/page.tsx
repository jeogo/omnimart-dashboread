"use client";

import { useState, useEffect } from 'react';
import { Order } from '@/types';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import OrderTable from '@/components/orders/OrderTable';
import OrderDetails from '@/components/orders/OrderDetails';
import {apiUtils} from '@/utils/apiUtils';

export default function Orders() {
  // State
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiUtils.getAllOrders();
        setOrders(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'حدث خطأ أثناء جلب البيانات');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [statusFilter]);

  // Filter orders based on search term
  const filteredOrders = orders.filter(order => 
    searchTerm ? (
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerPhone.includes(searchTerm) ||
      (order.id && order.id.includes(searchTerm))
    ) : true
  );

  // View order details
  const handleViewOrder = (order: Order) => {
    setCurrentOrder(order);
    setIsDetailsModalOpen(true);
  };

  // Delete order (show confirmation)
  const handleDeleteClick = (order: Order) => {
    setCurrentOrder(order);
    setIsConfirmDeleteModalOpen(true);
  };

  // Update order status
  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const responseData = await apiUtils.updateOrderStatus(orderId, newStatus);
      setOrders(prevOrders =>
        prevOrders.map(o =>
          o.id === responseData.id ? responseData : o
        )
      );
      // If the current order is open in details modal, update it
      if (currentOrder && currentOrder.id === responseData.id) {
        setCurrentOrder(responseData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل في تحديث حالة الطلب');
    }
  };

  // Confirm order deletion
  const handleConfirmDelete = async () => {
    if (!currentOrder) return;
    setIsDeleting(true);
    setError(null);
    try {
      await apiUtils.deleteOrder(currentOrder.id || currentOrder._id || '');
      // Remove order from state
      setOrders(prevOrders =>
        prevOrders.filter(o => o.id !== currentOrder.id)
      );
      setIsConfirmDeleteModalOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل في حذف الطلب');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Page header */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="dashboard-title">إدارة الطلبات</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            عرض وإدارة طلبات العملاء
          </p>
        </div>
      </div>
      
      {/* Filters and search */}
      <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-100 dark:border-gray-700">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                placeholder="البحث باسم العميل أو رقم الهاتف أو رقم الطلب"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          {/* Status filter */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              تصفية حسب الحالة
            </label>
            <select
              id="status"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">جميع الطلبات</option>
              <option value="pending">قيد الانتظار</option>
              <option value="processing">قيد المعالجة</option>
              <option value="shipped">تم الشحن</option>
              <option value="delivered">تم التسليم</option>
              <option value="cancelled">ملغي</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="mb-6 p-4 border border-red-300 bg-red-50 dark:bg-red-900 dark:bg-opacity-20 dark:border-red-700 rounded-lg text-red-700 dark:text-red-300">
          <p>{error}</p>
        </div>
      )}
      
      {/* Loading spinner or orders table */}
      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">لا توجد طلبات</h3>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            {searchTerm || statusFilter 
              ? 'لا توجد طلبات تطابق معايير البحث. حاول تعديل الفلاتر أو البحث.' 
              : 'لم يتم العثور على أي طلبات.'}
          </p>
          {(searchTerm || statusFilter) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('');
              }}
              className="mt-4 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              إزالة الفلاتر
            </button>
          )}
        </div>
      ) : (
        <OrderTable 
          orders={filteredOrders} 
          onView={handleViewOrder} 
          onDelete={handleDeleteClick}
          onStatusChange={handleStatusChange}
        />
      )}
      
      {/* Order details modal */}
      {currentOrder && (
        <Modal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          title={`تفاصيل الطلب #${currentOrder.id ? currentOrder.id.substring(0, 8) : 'N/A'}`}
          size="lg"
        >
          <OrderDetails 
            order={currentOrder} 
            onStatusChange={(status) => currentOrder.id && handleStatusChange(currentOrder.id, status)}
          />
        </Modal>
      )}
      
      {/* Delete confirmation modal */}
      {currentOrder && (
        <Modal
          isOpen={isConfirmDeleteModalOpen}
          onClose={() => setIsConfirmDeleteModalOpen(false)}
          title="تأكيد الحذف"
          size="sm"
          footer={
            <>
              <Button
                variant="secondary"
                onClick={() => setIsConfirmDeleteModalOpen(false)}
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
              هل أنت متأكد من حذف هذا الطلب؟
            </h3>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              سيتم حذف الطلب <span className="font-semibold text-gray-700 dark:text-gray-300">#{currentOrder.id ? currentOrder.id.substring(0, 8) : 'N/A'}</span> نهائيًا.
              <br />
              هذا الإجراء لا يمكن التراجع عنه.
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
}
