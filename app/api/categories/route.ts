import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { 
  getAllCategories, 
  createCategory 
} from '@/models/Category';
import { Category } from '@/types';

// Get all categories
export async function GET() {
  try {
    await connectToDatabase();
    const categories = await getAllCategories();
    
    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'فشل في جلب الفئات' },
      { status: 500 }
    );
  }
}

// Create new category
export async function POST(request: Request) {
  try {
    const categoryData = await request.json() as Partial<Category>;
    
    // Validate required fields
    if (!categoryData.name) {
      return NextResponse.json(
        { error: 'اسم الفئة مطلوب' },
        { status: 400 }
      );
    }
    
    // Explicitly set parentId to null if it's an empty string
    if (categoryData.parentId === '') {
      categoryData.parentId = null as any;
    }
    
    await connectToDatabase();
    const category = await createCategory(categoryData);
    
    if (!category) {
      return NextResponse.json(
        { error: 'فشل في إنشاء الفئة' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ category }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { 
        error: 'فشل في إنشاء الفئة', 
        details: error.message || 'خطأ غير معروف' 
      },
      { status: 400 }
    );
  }
}
