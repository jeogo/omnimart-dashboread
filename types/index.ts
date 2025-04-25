// واجهات البيانات الخاصة بالـ Products، Orders، Categories، Discounts

export interface Product {
  _id?: string;
  id?: string;
  name: string;
  description?: string;
  price: number;
  oldPrice?: number;
  category?: Category | string;
  categoryId?: string;
  stock?: number;
  images?: string[];
  features?: string[];
  material?: string;
  care?: string;
  sizes?: string[];
  colors?: { name: string; value: string }[];
  isNewProduct?: boolean;
  discountId?: string | null;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export interface OrderProductItem {
  _id?: string;
  product: string | Product | null; // always required, backend uses ObjectId
  productName: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
}

export interface Order {
  customerAddress: string;
  paymentMethod: any;
  _id?: string;
  id?: string;
  customerName: string;
  customerPhone: string;
  wilaya: string;
  baladia: string; // required
  products: OrderProductItem[];
  totalAmount: number;
  shippingCost: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export interface Category {
  _id?: string;
  id?: string;
  name: string;
  description?: string;
  image?: string;
  imageUrl?: string;
  parentId?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export interface Discount {
  _id?: string;
  id?: string;
  code: string;
  percentage: number;
  expiresAt: string;
  name?: string;
  validFrom?: string;
  validTo?: string;
  type?: 'sale' | 'seasonal' | 'special' | 'coupon';
  applicableProducts?: string[];
  applicableCategories?: string[];
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}



export interface SalesByDate {
  date: string;
  amount: number;
}

// (your existing types file content)

export interface TopSellingProduct {
  productId: string;
  productName?: string;
  imageUrl?: string;
  category?: string;
  unitsSold?: number;
  totalRevenue?: number;
  unitPrice?: number;
  inStock?: number;
}