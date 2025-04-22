import mongoose, { Schema } from 'mongoose';
import { Order } from '@/types';
import { connectToDatabase, convertDocToObj } from '@/lib/mongodb';

// Define a document interface for Order
export interface OrderDocument extends mongoose.Document {
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  wilaya: string;
  products: Array<{
    productId: mongoose.Types.ObjectId | string;
    productName: string;
    price: number;
    quantity: number;
    size?: string;
    color?: string;
  }>;
  totalAmount: number;
  shippingCost: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Define order product schema
const orderProductSchema = new Schema({
  productId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Product', 
    required: true 
  },
  productName: { 
    type: String, 
    required: true, 
    trim: true 
  },
  price: { 
    type: Number, 
    required: true,
    min: [0, 'يجب أن يكون السعر أكبر من أو يساوي 0']
  },
  quantity: { 
    type: Number, 
    required: true,
    min: [1, 'يجب أن تكون الكمية أكبر من 0']
  },
  size: { type: String },
  color: { type: String }
}, { _id: false });

// Define order schema
const orderSchema = new Schema<OrderDocument>({
  customerName: { type: String, required: true, trim: true },
  customerPhone: { type: String, required: true, trim: true },
  customerAddress: { type: String, required: true, trim: true },
  wilaya: { type: String, required: true, trim: true },
  products: {
    type: [orderProductSchema],
    required: true,
    validate: {
      validator: (products: any[]) => products.length > 0,
      message: 'يجب أن يحتوي الطلب على منتج واحد على الأقل'
    }
  },
  totalAmount: { 
    type: Number, 
    required: true,
    min: [0, 'يجب أن يكون المبلغ الإجمالي أكبر من أو يساوي 0']
  },
  shippingCost: { 
    type: Number, 
    required: true,
    min: [0, 'يجب أن تكون تكلفة الشحن أكبر من أو تساوي 0']
  },
  status: { 
    type: String, 
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  notes: { type: String }
}, { timestamps: true });

// Create indexes for faster queries
orderSchema.index({ customerPhone: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

// Get the Order model - ensure we're handling it correctly for SSR
function getOrderModel() {
  // Only create the model on the server side
  if (typeof window === 'undefined') {
    try {
      // Check if mongoose is connected before trying to access/create the model
      if (mongoose.connection.readyState === 1) {
        return mongoose.models.Order || mongoose.model<OrderDocument>('Order', orderSchema);
      }
      return null;
    } catch (error) {
      console.error('Error accessing Order model:', error);
      return null;
    }
  }
  return null;
}

// Helper functions for database operations

// Get all orders with optional filtering
export async function getAllOrders(filter: any = {}): Promise<Order[]> {
  try {
    await connectToDatabase();
    const OrderModel = getOrderModel();
    
    if (!OrderModel) {
      throw new Error('نموذج الطلبات غير متاح. يرجى التأكد من الاتصال بقاعدة البيانات أولاً.');
    }
    
    const orders = await OrderModel.find(filter).sort({ createdAt: -1 });
    
    return orders.map(order => convertDocToObj<Order>(order) || {} as Order);
  } catch (error) {
    console.error('Error getting all orders:', error);
    return [];
  }
}

// Get order by ID
export async function getOrderById(id: string): Promise<Order | null> {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    
    await connectToDatabase();
    const OrderModel = getOrderModel();
    
    if (!OrderModel) {
      throw new Error('نموذج الطلبات غير متاح. يرجى التأكد من الاتصال بقاعدة البيانات أولاً.');
    }
    
    const order = await OrderModel.findById(id);
    
    return order ? convertDocToObj<Order>(order) : null;
  } catch (error) {
    console.error(`Error getting order by id ${id}:`, error);
    return null;
  }
}

// Get orders by status
export async function getOrdersByStatus(status: string): Promise<Order[]> {
  try {
    await connectToDatabase();
    const OrderModel = getOrderModel();
    
    if (!OrderModel) {
      throw new Error('نموذج الطلبات غير متاح. يرجى التأكد من الاتصال بقاعدة البيانات أولاً.');
    }
    
    const orders = await OrderModel.find({ status }).sort({ createdAt: -1 });
    
    return orders.map(order => convertDocToObj<Order>(order) || {} as Order);
  } catch (error) {
    console.error(`Error getting orders by status ${status}:`, error);
    return [];
  }
}

// Create new order
export async function createOrder(orderData: Partial<Order>): Promise<Order | null> {
  try {
    await connectToDatabase();
    const OrderModel = getOrderModel();
    
    if (!OrderModel) {
      throw new Error('نموذج الطلبات غير متاح. يرجى التأكد من الاتصال بقاعدة البيانات أولاً.');
    }
    
    // Prepare product data, ensuring productId is a valid ObjectId
    const products = orderData.products?.map(product => ({
      ...product,
      productId: mongoose.Types.ObjectId.isValid(product.productId)
        ? new mongoose.Types.ObjectId(product.productId)
        : product.productId
    })) || [];
    
    const order = await OrderModel.create({
      ...orderData,
      products
    });
    
    return convertDocToObj<Order>(order);
  } catch (error) {
    console.error('Error creating order:', error);
    return null;
  }
}

// Update order status
export async function updateOrderStatus(id: string, status: string): Promise<Order | null> {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.error(`Invalid ObjectId format for order: ${id}`);
      return null;
    }
    
    await connectToDatabase();
    const OrderModel = getOrderModel();
    
    if (!OrderModel) {
      throw new Error('نموذج الطلبات غير متاح. يرجى التأكد من الاتصال بقاعدة البيانات أولاً.');
    }
    
    console.log(`Updating order status for ID: ${id} to: ${status}`);
    
    const updatedOrder = await OrderModel.findByIdAndUpdate(
      id,
      { 
        status: status, 
        updatedAt: new Date() 
      },
      { new: true, runValidators: true }
    );
    
    if (!updatedOrder) {
      console.log(`No order found with ID: ${id}`);
      return null;
    }
    
    return convertDocToObj<Order>(updatedOrder);
  } catch (error) {
    console.error(`Error updating order status ${id}:`, error);
    return null;
  }
}

// Update existing order
export async function updateOrder(id: string, orderData: Partial<Order>): Promise<Order | null> {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.error(`Invalid ObjectId format for order: ${id}`);
      return null;
    }
    
    await connectToDatabase();
    const OrderModel = getOrderModel();
    
    if (!OrderModel) {
      throw new Error('نموذج الطلبات غير متاح. يرجى التأكد من الاتصال بقاعدة البيانات أولاً.');
    }
    
    // Prepare product data if provided
    const updateData: any = { ...orderData };
    if (orderData.products?.length) {
      updateData.products = orderData.products.map(product => ({
        ...product,
        productId: mongoose.Types.ObjectId.isValid(product.productId)
          ? new mongoose.Types.ObjectId(product.productId)
          : product.productId
      }));
    }
    
    console.log(`Performing full update on order ID: ${id}`);
    
    const updatedOrder = await OrderModel.findByIdAndUpdate(
      id,
      { $set: updateData }, // Use $set to make sure we're updating, not replacing
      { new: true, runValidators: true }
    );
    
    if (!updatedOrder) {
      console.log(`No order found with ID: ${id}`);
      return null;
    }
    
    return convertDocToObj<Order>(updatedOrder);
  } catch (error) {
    console.error(`Error updating order ${id}:`, error);
    return null;
  }
}

// Delete order
export async function deleteOrder(id: string): Promise<boolean> {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return false;
    }
    
    await connectToDatabase();
    const OrderModel = getOrderModel();
    
    if (!OrderModel) {
      throw new Error('نموذج الطلبات غير متاح. يرجى التأكد من الاتصال بقاعدة البيانات أولاً.');
    }
    
    const result = await OrderModel.findByIdAndDelete(id);
    return !!result;
  } catch (error) {
    console.error(`Error deleting order ${id}:`, error);
    return false;
  }
}

// Export the model getter function
export default getOrderModel;
