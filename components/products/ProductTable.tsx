import React from "react";
import { Product, Discount } from "@/types";
import ProductCard from './ProductCard';

interface ProductTableProps {
  products: Product[];
  discounts?: Discount[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onView?: (product: Product) => void;
}

const ProductTable: React.FC<ProductTableProps> = ({
  products,
  discounts = [],
  onEdit,
  onDelete,
  onView,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => {
        const mainImage = product.images && product.images.length > 0
          ? product.images[0]
          : (product.imageUrl || 'https://via.placeholder.com/400x500?text=No+Image');
        // Find discount for this product
        const discount = discounts?.find(
          (d) => d._id === product.discountId || d.id === product.discountId
        );
        return (
          <ProductCard
            key={product._id || product.id}
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

export default ProductTable;
