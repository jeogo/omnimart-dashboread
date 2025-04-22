import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import mongoose from 'mongoose';
import { Product, Category, Discount } from '@/types';

// Create sample data function for initialization
async function createSampleData() {
  try {
    await connectToDatabase();
    
    // Get all models
    const CategoryModel = mongoose.models.Category;
    const ProductModel = mongoose.models.Product;
    const DiscountModel = mongoose.models.Discount;
    
    if (!CategoryModel || !ProductModel || !DiscountModel) {
      throw new Error('Models not available');
    }
    
    // Check if we already have data
    const existingProducts = await ProductModel.countDocuments();
    if (existingProducts > 0) {
      return {
        success: true,
        message: 'Data already initialized'
      };
    }
    
    // Create categories
    const categories = await CategoryModel.create([
      {
        name: 'ملابس رجالية',
        slug: 'mens-clothing',
        description: 'كل ما يتعلق بالأزياء الرجالية'
      },
      {
        name: 'ملابس نسائية',
        slug: 'womens-clothing',
        description: 'أحدث صيحات الموضة النسائية'
      },
      {
        name: 'اكسسوارات',
        slug: 'accessories',
        description: 'اكسسوارات متنوعة'
      }
    ]);
    
    // Create discounts
    const discounts = await DiscountModel.create([
      {
        name: 'خصم الصيف',
        percentage: 15,
        validFrom: new Date(),
        validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        type: 'seasonal',
        isActive: true
      },
      {
        name: 'عرض خاص',
        percentage: 25,
        validFrom: new Date(),
        validTo: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        type: 'special',
        isActive: true
      }
    ]);
    
    // Create products
    const products = await ProductModel.create([
      {
        name: 'قميص كلاسيكي أزرق',
        description: 'قميص رجالي كلاسيكي باللون الأزرق',
        price: 2500,
        category: categories[0].name,
        categoryId: categories[0]._id,
        images: ['https://via.placeholder.com/400x500'],
        features: ['خامة قطنية', 'مريح للاستخدام اليومي'],
        material: 'قطن 100%',
        care: 'غسيل بماء بارد',
        sizes: ['S', 'M', 'L', 'XL'],
        colors: [{ name: 'أزرق', value: '#0000FF' }],
        isNewProduct: true,
        rating: 4.5,
        reviews: 12
      },
      {
        name: 'فستان أنيق',
        description: 'فستان نسائي أنيق مناسب للمناسبات',
        price: 4500,
        oldPrice: 5000,
        category: categories[1].name,
        categoryId: categories[1]._id,
        images: ['https://via.placeholder.com/400x500'],
        features: ['تصميم عصري', 'قماش مريح'],
        material: 'حرير وقطن',
        care: 'تنظيف جاف فقط',
        sizes: ['S', 'M', 'L'],
        colors: [
          { name: 'أحمر', value: '#FF0000' },
          { name: 'أسود', value: '#000000' }
        ],
        discountId: discounts[0]._id,
        rating: 5,
        reviews: 8
      },
      {
        name: 'حقيبة يد نسائية',
        description: 'حقيبة يد عصرية وأنيقة',
        price: 3500,
        category: categories[2].name,
        categoryId: categories[2]._id,
        images: ['https://via.placeholder.com/400x500'],
        features: ['سعة كبيرة', 'متينة وعملية'],
        material: 'جلد صناعي',
        care: 'تنظيف بقطعة قماش مبللة',
        sizes: ['واحد'],
        colors: [{ name: 'بني', value: '#8B4513' }],
        discountId: discounts[1]._id,
        isNewProduct: true,
        rating: 4,
        reviews: 5
      }
    ]);
    
    return {
      success: true,
      summary: {
        categories: categories.length,
        discounts: discounts.length,
        products: products.length
      }
    };
  } catch (error) {
    console.error('Error initializing data:', error);
    throw error;
  }
}

// API route to initialize sample data
export async function GET() {
  try {
    const result = await createSampleData();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in initialize route:', error);
    return NextResponse.json(
      { error: 'فشل في تهيئة البيانات' },
      { status: 500 }
    );
  }
}
