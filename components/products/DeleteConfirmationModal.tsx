"use client";

import React from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { Product } from '@/types';

interface DeleteConfirmationProps {
  isOpen: boolean;
  product: Product | null;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationProps> = ({
  isOpen,
  product,
  onClose,
  onConfirm,
  isDeleting
}) => {
  if (!product) return null;
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="تأكيد الحذف"
      size="sm"
      footer={
        <>
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isDeleting}
          >
            إلغاء
          </Button>
          <Button
            variant="primary"
            className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
            onClick={onConfirm}
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
          سيتم حذف المنتج <span className="font-semibold text-gray-700 dark:text-gray-300">{product.name}</span> نهائيًا.
          <br />
          هذا الإجراء لا يمكن التراجع عنه.
        </p>
      </div>
    </Modal>
  );
};

export default DeleteConfirmationModal;
