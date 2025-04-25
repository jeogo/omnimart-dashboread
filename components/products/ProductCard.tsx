import React from 'react';
import { Product, Discount } from '@/types';

interface ProductCardProps {
  product: Product;
  discount?: Discount;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onView?: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  discount, 
  onEdit, 
  onDelete, 
  onView 
}) => {
  const productId = product.id || product._id;

  // Discount status logic (copied from DiscountCard for consistency)
  const getDiscountStatus = () => {
    const now = new Date();
    const from = discount?.validFrom ? new Date(discount.validFrom) : null;
    const to = discount?.validTo ? new Date(discount.validTo) : (discount?.expiresAt ? new Date(discount.expiresAt) : null);
    if (from && now < from) {
      return false; // Not active yet
    } else if (to && now > to) {
      return false; // Expired
    } else if (from && to && now >= from && now <= to) {
      return true; // Active
    } else if (!from && to && now <= to) {
      return true; // Active if only end date
    } else if (from && !to && now >= from) {
      return true; // Active if only start date
    }
    return false;
  };
  const isDiscountActive = discount && getDiscountStatus();

  const discountedPrice = isDiscountActive && discount
    ? Math.round(product.price - (product.price * (discount.percentage / 100)))
    : null;

  const mainImage = product.images && product.images.length > 0
    ? product.images[0]
    : (product.imageUrl || 'https://via.placeholder.com/300x300?text=No+Image');

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow flex flex-col overflow-hidden">
      <div className="relative aspect-square bg-gray-100 dark:bg-gray-700 overflow-hidden">
        <img
          src={mainImage}
          alt={product.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x300?text=Error+Loading+Image';
          }}
        />
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {product.isNewProduct && (
            <span className="bg-green-500 text-white text-xs px-2 py-1 rounded shadow">جديد</span>
          )}
          {isDiscountActive && discount ? (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded shadow">
              خصم {discount.percentage}%
            </span>
          ) : (
            <span className="bg-gray-300 text-gray-700 text-xs px-2 py-1 rounded shadow">بدون خصم</span>
          )}
        </div>
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1 truncate" title={product.name}>{product.name}</h3>
        {product.description && (
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-2 line-clamp-2" title={product.description}>
            {product.description}
          </p>
        )}
        <div className="mt-auto">
          <div className="mb-2">
            {discountedPrice ? (
              <div className="flex items-center gap-2">
                <span className="text-gray-400 line-through text-sm">
                  {product.price?.toLocaleString('ar-DZ')} د.ج
                </span>
                <span className="text-lg font-bold text-green-600">
                  {discountedPrice.toLocaleString('ar-DZ')} د.ج
                </span>
              </div>
            ) : (
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                {product.price?.toLocaleString('ar-DZ')} د.ج
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500 dark:text-gray-400 mb-3">
            {product.stock !== undefined && (
              <span>المخزون: {product.stock}</span>
            )}
            {product.sizes && product.sizes.length > 0 && (
              <span>المقاسات: {product.sizes.join(', ')}</span>
            )}
          </div>
        </div>
        <div className="flex justify-between items-center pt-3 border-t border-gray-100 dark:border-gray-700 mt-2">
          {onView ? (
            <button
              onClick={() => onView(product)}
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              عرض
            </button>
          ) : (
            <a
              href={`/products/${productId}`}
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              عرض
            </a>
          )}
          <div className="flex gap-3">
            <button
              onClick={() => onEdit(product)}
              className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
              title="تعديل المنتج"
            >
              تعديل
            </button>
            <button
              onClick={() => onDelete(product)}
              className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
              title="حذف المنتج"
            >
              حذف
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
