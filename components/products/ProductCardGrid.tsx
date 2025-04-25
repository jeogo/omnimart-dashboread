import React from 'react';
import { Product, Discount } from '@/types';
import ProductCard from './ProductCard';

interface ProductCardGridProps {
  products: Product[];
  discounts?: Discount[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onView?: (product: Product) => void;
}

const ProductCardGrid: React.FC<ProductCardGridProps> = ({
  products,
  discounts = [],
  onEdit,
  onDelete,
  onView,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => {
        const discount = discounts.find(
          (d) => d._id === product.discountId || d.id === product.discountId
        );
        return (
          <ProductCard
            key={product.id || product._id}
            product={product}
            discount={discount}
            onEdit={onEdit}
            onDelete={onDelete}
            onView={onView}
          />
        );
      })}
    </div>
  );
};

export default ProductCardGrid;
