import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { 
  getAllProducts, 
  getProductsByCategory,
  createProduct, 
  updateProduct, 
  deleteProduct 
} from '@/models/Product';
import { Product } from '@/types';

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

// Get all products or products by category
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const categoryId = url.searchParams.get('category');
    
    await connectToDatabase();
    
    const products = categoryId 
      ? await getProductsByCategory(categoryId) 
      : await getAllProducts();
    
    return NextResponse.json({ products });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'فشل في جلب البيانات' },
      { status: 500 }
    );
  }
}

// Create new product
export async function POST(request: Request) {
  try {
    const productData = await request.json() as Partial<Product>;
    
    // Validate required fields based on new type definitions
    if (!productData.name || 
        productData.price === undefined || 
        productData.price === null || 
        !productData.categoryId) {
      return NextResponse.json(
        { error: 'الاسم والسعر والفئة حقول مطلوبة' }, 
        { status: 400 }
      );
    }
    
    // Ensure arrays exist if not provided
    productData.features = productData.features || [];
    productData.sizes = productData.sizes || [];
    productData.images = productData.images || [];
    
    // Sanitize discountId field - handle empty string
    if (productData.discountId === '') {
      productData.discountId = null as any;
    }
    
    await connectToDatabase();
    const product = await createProduct(productData);
    
    if (!product) {
      return NextResponse.json(
        { error: 'فشل في إنشاء المنتج' }, 
        { status: 500 }
      );
    }
    
    return NextResponse.json({ product }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { 
        error: 'فشل في إنشاء المنتج', 
        details: error.message || 'خطأ غير معروف'
      }, 
      { status: 400 }
    );
  }
}

// Update product
export async function PUT(request: Request) {
  try {
    const { id, ...data } = await request.json() as Product & { id: string };
    
    if (!id) {
      return NextResponse.json(
        { error: 'معرف المنتج مطلوب' }, 
        { status: 400 }
      );
    }
    
    // Sanitize discountId field - handle empty string
    if (data.discountId === '') {
      data.discountId = null as any;
    }
    
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
    console.error('Error updating product:', error);
    return NextResponse.json(
      { 
        error: 'فشل في تحديث المنتج',
        details: error.message || 'خطأ غير معروف'
      }, 
      { status: 400 }
    );
  }
}

// Delete product
export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'معرف المنتج مطلوب' }, 
        { status: 400 }
      );
    }
    
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
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'فشل في حذف المنتج' }, 
      { status: 500 }
    );
  }
}
