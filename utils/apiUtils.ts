import axios from 'axios';
import type { Product, Category, Discount, Order } from '@/types';

const API_URL = 'https://omnimart-api.onrender.com/api';

// --- Product helpers ---
const transformProduct = (doc: any): Product => {
  if (!doc) return null as any;
  return {
    ...doc,
    id: doc._id || doc.id,
    categoryId: typeof doc.category === 'string'
      ? doc.category
      : doc.category?._id || doc.categoryId,
    images: Array.isArray(doc.images)
      ? doc.images
      : doc.imageUrl
        ? [doc.imageUrl]
        : [],
  };
};

export const apiUtils = {
  // Products
  async getAllProducts(): Promise<Product[]> {
    const response = await axios.get(`${API_URL}/products`);
    return Array.isArray(response.data)
      ? response.data.map(transformProduct)
      : [];
  },
  async getProductById(id: string): Promise<Product | null> {
    const response = await axios.get(`${API_URL}/products/${id}`);
    return transformProduct(response.data);
  },
  async createProduct(data: Partial<Product>): Promise<Product> {
    const payload: any = {
      name: data.name,
      price: data.price,
      category: data.categoryId || (typeof data.category === 'string' ? data.category : undefined),
      stock: data.stock,
      ...(data.description && { description: data.description }),
      ...(Array.isArray(data.images) && data.images.length > 0 ? { images: data.images } : {}),
      ...(Array.isArray(data.sizes) && data.sizes.length > 0 ? { sizes: data.sizes } : {}),
      ...(Array.isArray(data.colors) && data.colors.length > 0 ? { colors: data.colors } : {}),
      ...(Array.isArray(data.features) && data.features.length > 0 ? { features: data.features } : {}),
      ...(data.material && { material: data.material }),
      ...(data.care && { care: data.care }),
      ...(data.discountId && { discountId: data.discountId }),
      ...(typeof data.isNewProduct === 'boolean' ? { isNewProduct: data.isNewProduct } : {}),
    };
    const response = await axios.post(`${API_URL}/products`, payload);
    return transformProduct(response.data);
  },
  async updateProduct(id: string, data: Partial<Product>): Promise<Product> {
    const payload: any = {};
    if (data.name !== undefined) payload.name = data.name;
    if (data.price !== undefined) payload.price = data.price;
    if (data.categoryId || (typeof data.category === 'string')) {
      payload.category = data.categoryId || data.category;
    }
    if (data.stock !== undefined) payload.stock = data.stock;
    if (data.description !== undefined) payload.description = data.description;
    if (Array.isArray(data.images)) payload.images = data.images;
    if (Array.isArray(data.sizes)) payload.sizes = data.sizes;
    if (Array.isArray(data.colors)) payload.colors = data.colors;
    if (Array.isArray(data.features)) payload.features = data.features;
    if (data.material !== undefined) payload.material = data.material;
    if (data.care !== undefined) payload.care = data.care;
    if (data.discountId !== undefined) payload.discountId = data.discountId;
    if (typeof data.isNewProduct === 'boolean') payload.isNewProduct = data.isNewProduct;
    const response = await axios.put(`${API_URL}/products/${id}`, payload);
    return transformProduct(response.data);
  },
  async deleteProduct(id: string): Promise<void> {
    await axios.delete(`${API_URL}/products/${id}`);
  },

  // Categories
  async getAllCategories(): Promise<Category[]> {
    const response = await axios.get(`${API_URL}/categories`);
    return Array.isArray(response.data)
      ? response.data.map((doc: any) => ({ ...doc, id: doc._id || doc.id }))
      : [];
  },
  async getCategoryById(id: string): Promise<Category | null> {
    const response = await axios.get(`${API_URL}/categories/${id}`);
    return { ...response.data, id: response.data._id || response.data.id };
  },
  async createCategory(data: Partial<Category>): Promise<Category> {
    const payload = {
      name: data.name,
      ...(data.description && { description: data.description }),
      ...(data.image && { image: data.image }),
      ...(data.parentId && { parentId: data.parentId }),
      ...(typeof data.isActive === 'boolean' ? { isActive: data.isActive } : {}),
    };
    const response = await axios.post(`${API_URL}/categories`, payload);
    return { ...response.data, id: response.data._id || response.data.id };
  },
  async updateCategory(id: string, data: Partial<Category>): Promise<Category> {
    const payload = {
      name: data.name,
      ...(data.description && { description: data.description }),
      ...(data.image && { image: data.image }),
      ...(data.parentId && { parentId: data.parentId }),
      ...(typeof data.isActive === 'boolean' ? { isActive: data.isActive } : {}),
    };
    const response = await axios.put(`${API_URL}/categories/${id}`, payload);
    return { ...response.data, id: response.data._id || response.data.id };
  },
  async deleteCategory(id: string): Promise<void> {
    await axios.delete(`${API_URL}/categories/${id}`);
  },

  // Discounts
  async getAllDiscounts(): Promise<Discount[]> {
    const response = await axios.get(`${API_URL}/discounts`);
    return Array.isArray(response.data)
      ? response.data.map((doc: any) => ({ ...doc, id: doc._id || doc.id }))
      : [];
  },
  async getDiscountById(id: string): Promise<Discount | null> {
    const response = await axios.get(`${API_URL}/discounts/${id}`);
    return { ...response.data, id: response.data._id || response.data.id };
  },
  async createDiscount(data: Partial<Discount>): Promise<Discount> {
    const payload = {
      code: data.code,
      percentage: data.percentage,
      expiresAt: data.expiresAt,
      ...(data.name && { name: data.name }),
    };
    const response = await axios.post(`${API_URL}/discounts`, payload);
    return { ...response.data, id: response.data._id || response.data.id };
  },
  async updateDiscount(id: string, data: Partial<Discount>): Promise<Discount> {
    const payload = {
      code: data.code,
      percentage: data.percentage,
      expiresAt: data.expiresAt,
      ...(data.name && { name: data.name }),
    };
    const response = await axios.put(`${API_URL}/discounts/${id}`, payload);
    return { ...response.data, id: response.data._id || response.data.id };
  },
  async deleteDiscount(id: string): Promise<void> {
    await axios.delete(`${API_URL}/discounts/${id}`);
  },

  // Orders
  async getAllOrders(): Promise<Order[]> {
    const response = await axios.get(`${API_URL}/orders`);
    return Array.isArray(response.data)
      ? response.data.map((doc: any) => ({ ...doc, id: doc._id || doc.id }))
      : [];
  },
  async getOrderById(id: string): Promise<Order | null> {
    const response = await axios.get(`${API_URL}/orders/${id}`);
    return { ...response.data, id: response.data._id || response.data.id };
  },
  async createOrder(data: Partial<Order>): Promise<Order> {
    const payload = {
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      wilaya: data.wilaya,
      baladia: data.baladia,
      products: data.products,
      totalAmount: data.totalAmount,
      shippingCost: data.shippingCost,
      status: data.status,
      notes: data.notes,
    };
    const response = await axios.post(`${API_URL}/orders`, payload);
    return { ...response.data, id: response.data._id || response.data.id };
  },
  async updateOrderStatus(id: string, status: string): Promise<Order> {
    const response = await axios.put(`${API_URL}/orders/${id}`, { status });
    return { ...response.data, id: response.data._id || response.data.id };
  },
  async deleteOrder(id: string): Promise<void> {
    await axios.delete(`${API_URL}/orders/${id}`);
  },
};
