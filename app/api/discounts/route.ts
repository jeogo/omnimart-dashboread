import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getAllDiscounts, createDiscount } from '@/models/Discount';
import { Discount } from '@/types';

// Get all discounts
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const active = url.searchParams.get('active') === 'true';
    
    await connectToDatabase();
    const discounts = await getAllDiscounts(active);
    
    return NextResponse.json({ discounts });
  } catch (error) {
    console.error('Error fetching discounts:', error);
    return NextResponse.json(
      { error: 'فشل في جلب التخفيضات' },
      { status: 500 }
    );
  }
}

// Create new discount
export async function POST(request: Request) {
  try {
    const discountData = await request.json() as Partial<Discount>;
    
    // Validate required fields
    if (!discountData.name || 
        !discountData.percentage || 
        !discountData.validFrom || 
        !discountData.validTo) {
      return NextResponse.json(
        { error: 'الاسم ونسبة التخفيض وتواريخ الصلاحية حقول مطلوبة' },
        { status: 400 }
      );
    }
    
    // Validate percentage range
    if (discountData.percentage < 1 || discountData.percentage > 100) {
      return NextResponse.json(
        { error: 'يجب أن تكون نسبة التخفيض بين 1% و 100%' },
        { status: 400 }
      );
    }
    
    // Validate date range
    const validFrom = new Date(discountData.validFrom);
    const validTo = new Date(discountData.validTo);
    
    if (validFrom > validTo) {
      return NextResponse.json(
        { error: 'يجب أن يكون تاريخ بداية التخفيض قبل تاريخ نهايته' },
        { status: 400 }
      );
    }
    
    await connectToDatabase();
    const discount = await createDiscount(discountData);
    
    if (!discount) {
      return NextResponse.json(
        { error: 'فشل في إنشاء التخفيض' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ discount }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating discount:', error);
    return NextResponse.json(
      { 
        error: 'فشل في إنشاء التخفيض', 
        details: error.message || 'خطأ غير معروف'
      },
      { status: 400 }
    );
  }
}
