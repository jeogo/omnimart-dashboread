import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getDiscountById, updateDiscount, deleteDiscount } from '@/models/Discount';
import mongoose from 'mongoose';

// Helper to validate ObjectId
function validateObjectId(id: string) {
  if (!id) {
    return { error: 'معرف التخفيض مطلوب', status: 400 };
  }
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return { error: 'معرف التخفيض غير صالح', status: 400 };
  }
  return null;
}

// GET a specific discount by ID
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const validationError = validateObjectId(id);
  if (validationError) {
    return NextResponse.json({ error: validationError.error }, { status: validationError.status });
  }

  try {
    await connectToDatabase();
    const discount = await getDiscountById(id);
    if (!discount) {
      return NextResponse.json({ error: 'لم يتم العثور على التخفيض' }, { status: 404 });
    }
    return NextResponse.json({ discount });
  } catch (error) {
    console.error('Error fetching discount:', error);
    return NextResponse.json({ error: 'فشل في جلب بيانات التخفيض' }, { status: 500 });
  }
}

// PUT for updating a discount
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const validationError = validateObjectId(id);
  if (validationError) {
    return NextResponse.json({ error: validationError.error }, { status: validationError.status });
  }

  try {
    await connectToDatabase();
    let data;

    try {
      data = await request.json();
    } catch (error) {
      return NextResponse.json({ error: 'البيانات المقدمة غير صالحة' }, { status: 400 });
    }

    // Validate discount percentage
    if (data.percentage && (data.percentage < 1 || data.percentage > 100)) {
      return NextResponse.json({ error: 'يجب أن تكون نسبة التخفيض بين 1% و 100%' }, { status: 400 });
    }

    // Validate dates
    if (data.validFrom && data.validTo) {
      const validFrom = new Date(data.validFrom);
      const validTo = new Date(data.validTo);

      if (isNaN(validFrom.getTime()) || isNaN(validTo.getTime())) {
        return NextResponse.json({ error: 'تاريخ غير صالح' }, { status: 400 });
      }

      if (validFrom > validTo) {
        return NextResponse.json({ error: 'يجب أن يكون تاريخ بداية التخفيض قبل نهايته' }, { status: 400 });
      }
    }

    const updatedDiscount = await updateDiscount(id, data);
    if (!updatedDiscount) {
      return NextResponse.json({ error: 'لم يتم العثور على التخفيض' }, { status: 404 });
    }

    return NextResponse.json({ discount: updatedDiscount, success: true });
  } catch (error: any) {
    console.error('Error updating discount:', error);
    return NextResponse.json({
      error: 'فشل في تحديث التخفيض',
      details: error.message || 'خطأ غير معروف'
    }, { status: 500 });
  }
}

// DELETE for removing a discount
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const validationError = validateObjectId(id);
  if (validationError) {
    return NextResponse.json({ error: validationError.error }, { status: validationError.status });
  }

  try {
    await connectToDatabase();

    const success = await deleteDiscount(id);
    if (!success) {
      return NextResponse.json({ error: 'لم يتم العثور على التخفيض' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting discount:', error);

    if (error.message && error.message.includes('لا يمكن حذف التخفيض')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      error: 'فشل في حذف التخفيض',
      details: error.message || 'خطأ غير معروف'
    }, { status: 500 });
  }
}
