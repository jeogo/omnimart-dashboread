import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { 
  getAllOrders, 
  getOrdersByStatus, 
  createOrder 
} from '@/models/Order';
import { Order } from '@/types';

// Handle OPTIONS request (CORS preflight)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

// Get all orders or filter by status
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    
    await connectToDatabase();
    
    const orders = status 
      ? await getOrdersByStatus(status) 
      : await getAllOrders();
    
    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'فشل في جلب الطلبات' },
      { status: 500 }
    );
  }
}

// Create new order
export async function POST(request: Request) {
  try {
    const orderData = await request.json() as Partial<Order>;
    
    // Validate required fields
    if (!orderData.customerName || 
        !orderData.customerPhone || 
        !orderData.customerAddress || 
        !orderData.wilaya || 
        !orderData.products || 
        orderData.products.length === 0 || 
        orderData.totalAmount === undefined || 
        orderData.shippingCost === undefined) {
      return NextResponse.json(
        { error: 'جميع الحقول المطلوبة يجب تعبئتها' }, 
        { status: 400 }
      );
    }
    
    await connectToDatabase();
    const order = await createOrder(orderData);
    
    if (!order) {
      return NextResponse.json(
        { error: 'فشل في إنشاء الطلب' }, 
        { status: 500 }
      );
    }
    
    return NextResponse.json({ order }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { 
        error: 'فشل في إنشاء الطلب', 
        details: error.message || 'خطأ غير معروف'
      }, 
      { status: 400 }
    );
  }
}
