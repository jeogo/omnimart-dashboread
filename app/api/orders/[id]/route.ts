import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { 
  getOrderById, 
  updateOrder, 
  updateOrderStatus, 
  deleteOrder 
} from '@/models/Order';

// Get a specific order by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: 'معرف الطلب مطلوب' }, { status: 400 });
  }

  try {
    await connectToDatabase();
    const order = await getOrderById(id);

    if (!order) {
      return NextResponse.json({ error: 'لم يتم العثور على الطلب' }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error(`Error fetching order:`, error);
    return NextResponse.json({ error: 'فشل في جلب بيانات الطلب' }, { status: 500 });
  }
}

// Update an order by ID
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Extract and validate ID first
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'معرف الطلب مطلوب' }, 
        { status: 400 }
      );
    }
    
    console.log(`Attempting to update order with ID: ${id}`);
    
    // Parse the request body
    const data = await request.json();
    console.log('Update data received:', data);
    
    // Check if it's a status-only update
    if (Object.keys(data).length === 1 && data.status) {
      console.log(`Performing status-only update to: ${data.status}`);
      const updatedOrder = await updateOrderStatus(id, data.status);
      
      if (!updatedOrder) {
        console.log(`Status update failed - no order found with ID: ${id}`);
        return NextResponse.json(
          { error: 'لم يتم العثور على الطلب' }, 
          { status: 404 }
        );
      }
      
      console.log(`Order status updated successfully:`, updatedOrder);
      return NextResponse.json({ order: updatedOrder });
    }
    
    // Full order update
    await connectToDatabase();
    const updatedOrder = await updateOrder(id, data);
    
    if (!updatedOrder) {
      console.log(`Full update failed - no order found with ID: ${id}`);
      return NextResponse.json(
        { error: 'لم يتم العثور على الطلب' }, 
        { status: 404 }
      );
    }
    
    console.log(`Order updated successfully:`, updatedOrder);
    return NextResponse.json({ order: updatedOrder });
  } catch (error: any) {
    console.error(`Error updating order:`, error);
    return NextResponse.json(
      { 
        error: 'فشل في تحديث الطلب',
        details: error.message || 'خطأ غير معروف'
      }, 
      { status: 500 }
    );
  }
}

// Delete an order by ID
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Extract and validate ID first
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'معرف الطلب مطلوب' }, 
        { status: 400 }
      );
    }
    
    // Connect and delete
    await connectToDatabase();
    const success = await deleteOrder(id);
    
    if (!success) {
      return NextResponse.json(
        { error: 'لم يتم العثور على الطلب' }, 
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error deleting order:`, error);
    return NextResponse.json(
      { error: 'فشل في حذف الطلب' }, 
      { status: 500 }
    );
  }
}
