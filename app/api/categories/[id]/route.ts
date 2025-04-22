import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import {
  getCategoryById,
  updateCategory,
  deleteCategory
} from '@/models/Category';
import mongoose from 'mongoose';

// Helper function to extract ID from the URL
const extractIdFromUrl = (request: NextRequest): string => {
  const url = new URL(request.url);
  const pathParts = url.pathname.split('/');
  return pathParts[pathParts.length - 1];
};

// Get a specific category by ID
export async function GET(request: NextRequest) {
  try {
    const id = extractIdFromUrl(request);
    
    if (!id) {
      return NextResponse.json(
        { error: 'معرف الفئة مطلوب' },
        { status: 400 }
      );
    }
    
    await connectToDatabase();
    const category = await getCategoryById(id);
    
    if (!category) {
      return NextResponse.json(
        { error: 'لم يتم العثور على الفئة' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ category });
  } catch (error) {
    console.error(`Error fetching category:`, error);
    return NextResponse.json(
      { error: 'فشل في جلب بيانات الفئة' },
      { status: 500 }
    );
  }
}

// Update a category by ID
export async function PUT(request: NextRequest) {
  try {
    const id = extractIdFromUrl(request);
    
    if (!id) {
      return NextResponse.json(
        { error: 'معرف الفئة مطلوب' },
        { status: 400 }
      );
    }
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'معرف الفئة غير صالح' },
        { status: 400 }
      );
    }
    
    // Log the ID we're working with for debugging
    console.log(`PUT request to update category with ID: ${id}`);
    
    // Parse the request body
    const data = await request.json();
    console.log('Update data received:', data);
    
    // Explicitly set parentId to null if it's an empty string
    if (data.parentId === '') {
      data.parentId = null;
    }
    
    // Connect to DB
    await connectToDatabase();
    
    // Call updateCategory function with the ID and data
    const updatedCategory = await updateCategory(id, data);
    
    if (!updatedCategory) {
      console.log(`Update failed - no category found with ID: ${id}`);
      return NextResponse.json(
        { error: 'لم يتم العثور على الفئة' },
        { status: 404 }
      );
    }
    
    console.log(`Category updated successfully:`, updatedCategory);
    return NextResponse.json({ category: updatedCategory });
  } catch (error: any) {
    console.error(`Error updating category:`, error);
    return NextResponse.json(
      {
        error: 'فشل في تحديث الفئة',
        details: error.message || 'خطأ غير معروف'
      },
      { status: 500 }
    );
  }
}

// Delete a category by ID
export async function DELETE(request: NextRequest) {
  try {
    const id = extractIdFromUrl(request);
    
    if (!id) {
      return NextResponse.json(
        { error: 'معرف الفئة مطلوب' },
        { status: 400 }
      );
    }
    
    await connectToDatabase();
    const success = await deleteCategory(id);
    
    if (!success) {
      return NextResponse.json(
        { error: 'لم يتم العثور على الفئة' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error deleting category:`, error);
    return NextResponse.json(
      { error: 'فشل في حذف الفئة' },
      { status: 500 }
    );
  }
}