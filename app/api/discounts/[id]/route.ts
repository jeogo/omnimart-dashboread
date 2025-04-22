import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { 
  getDiscountById, 
  updateDiscount, 
  deleteDiscount 
} from '@/models/Discount';
import mongoose from 'mongoose';

// Get a specific discount by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params?.id;
    
    if (!id) {
      return NextResponse.json(
        { error: 'معرف التخفيض مطلوب' }, 
        { status: 400 }
      );
    }
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'معرف التخفيض غير صالح' }, 
        { status: 400 }
      );
    }
    
    await connectToDatabase();
    const discount = await getDiscountById(id);
    
    if (!discount) {
      return NextResponse.json(
        { error: 'لم يتم العثور على التخفيض' }, 
        { status: 404 }
      );
    }
    
    return NextResponse.json({ discount });
  } catch (error) {
    console.error(`Error fetching discount:`, error);
    return NextResponse.json(
      { error: 'فشل في جلب بيانات التخفيض' },
      { status: 500 }
    );
  }
}

// Update a discount by ID
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params?.id;
    
    if (!id) {
      return NextResponse.json(
        { error: 'معرف التخفيض مطلوب' }, 
        { status: 400 }
      );
    }
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'معرف التخفيض غير صالح' }, 
        { status: 400 }
      );
    }
    
    console.log(`Attempting to update discount with ID: ${id}`);
    
    const data = await request.json();
    console.log('Update data received:', data);
    
    // Validate percentage range
    if (data.percentage && (data.percentage < 1 || data.percentage > 100)) {
      return NextResponse.json(
        { error: 'يجب أن تكون نسبة التخفيض بين 1% و 100%' },
        { status: 400 }
      );
    }
    
    // Validate date range if both dates are provided
    if (data.validFrom && data.validTo) {
      const validFrom = new Date(data.validFrom);
      const validTo = new Date(data.validTo);
      
      if (validFrom > validTo) {
        return NextResponse.json(
          { error: 'يجب أن يكون تاريخ بداية التخفيض قبل تاريخ نهايته' },
          { status: 400 }
        );
      }
    }
    
    await connectToDatabase();
    const updatedDiscount = await updateDiscount(id, data);
    
    if (!updatedDiscount) {
      return NextResponse.json(
        { error: 'لم يتم العثور على التخفيض' }, 
        { status: 404 }
      );
    }
    
    return NextResponse.json({ discount: updatedDiscount });
  } catch (error: any) {
    console.error(`Error updating discount:`, error);
    return NextResponse.json(
      { 
        error: 'فشل في تحديث التخفيض',
        details: error.message || 'خطأ غير معروف'
      }, 
      { status: 500 }
    );
  }
}

// Delete a discount by ID
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params?.id;
    
    if (!id) {
      return NextResponse.json(
        { error: 'معرف التخفيض مطلوب' }, 
        { status: 400 }
      );
    }
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'معرف التخفيض غير صالح' }, 
        { status: 400 }
      );
    }
    
    await connectToDatabase();
    
    try {
      const success = await deleteDiscount(id);
      
      if (!success) {
        return NextResponse.json(
          { error: 'لم يتم العثور على التخفيض' }, 
          { status: 404 }
        );
      }
      
      return NextResponse.json({ success: true });
    } catch (error: any) {
      // Handle specific error for discounts in use
      if (error.message && error.message.includes('لا يمكن حذف التخفيض')) {
        return NextResponse.json(
          { error: error.message }, 
          { status: 400 }
        );
      }
      throw error;
    }
  } catch (error: any) {
    console.error(`Error deleting discount:`, error);
    return NextResponse.json(
      { error: 'فشل في حذف التخفيض' }, 
      { status: 500 }
    );
  }
}
