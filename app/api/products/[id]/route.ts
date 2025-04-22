import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getProductById, updateProduct, deleteProduct } from '@/models/Product';

// Get a specific product by ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get the ID first before using it
    const { id } = await params;
    
    // Validate ID
    if (!id) {
      return NextResponse.json(
        { error: 'معرف المنتج مطلوب' }, 
        { status: 400 }
      );
    }
    
    // Connect to database and get product
    await connectToDatabase();
    const product = await getProductById(id);
    
    if (!product) {
      return NextResponse.json(
        { error: 'لم يتم العثور على المنتج' }, 
        { status: 404 }
      );
    }
    
    return NextResponse.json({ product });
  } catch (error) {
    console.error(`Error fetching product:`, error);
    return NextResponse.json(
      { error: 'فشل في جلب بيانات المنتج' },
      { status: 500 }
    );
  }
}

// Update a product by ID
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Extract and validate ID first
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'معرف المنتج مطلوب' }, 
        { status: 400 }
      );
    }
    
    // Parse the request body
    const data = await request.json();
    
    // Sanitize discountId if empty
    if (data.discountId === '') {
      data.discountId = null;
    }
    
    // Connect and update
    await connectToDatabase();
    const updatedProduct = await updateProduct(id, data);
    
    if (!updatedProduct) {
      return NextResponse.json(
        { error: 'لم يتم العثور على المنتج' }, 
        { status: 404 }
      );
    }
    
    return NextResponse.json({ product: updatedProduct });
  } catch (error: any) {
    console.error(`Error updating product:`, error);
    return NextResponse.json(
      { 
        error: 'فشل في تحديث المنتج',
        details: error.message || 'خطأ غير معروف'
      }, 
      { status: 500 }
    );
  }
}

// Delete a product by ID
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }) {
  try {
    // Extract and validate ID first
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'معرف المنتج مطلوب' }, 
        { status: 400 }
      );
    }
    
    // Connect and delete
    await connectToDatabase();
    const success = await deleteProduct(id);
    
    if (!success) {
      return NextResponse.json(
        { error: 'لم يتم العثور على المنتج' }, 
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error deleting product:`, error);
    return NextResponse.json(
      { error: 'فشل في حذف المنتج' }, 
      { status: 500 }
    );
  }
}
