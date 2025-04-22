import mongoose, { Schema } from 'mongoose';
import { Category } from '@/types';
import { connectToDatabase, convertDocToObj } from '@/lib/mongodb';

// Define a document interface for Category
interface CategoryDocument extends mongoose.Document {
  name: string;
  description?: string;
  slug?: string;
  image?: string;
  parentId?: mongoose.Types.ObjectId | null;
  isActive?: boolean;
}

// Define category schema
const categorySchema = new Schema<CategoryDocument>({
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  slug: { type: String, trim: true },
  image: { type: String },
  parentId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Category',
    // Add this validation to handle empty strings properly
    validate: {
      validator: function(v: any) {
        // Accept null, undefined, or valid ObjectId
        return v === null || v === undefined || 
              (typeof v === 'string' && v.length === 0) || // Accept empty string
              mongoose.Types.ObjectId.isValid(v);
      },
      message: 'معرّف الفئة الأم غير صالح'
    },
    default: null // Default to null if not provided
  },
  isActive: { type: Boolean, default: true }
}, { 
  timestamps: true
});

// Create indexes for faster searching
categorySchema.index({ name: 1 });
categorySchema.index({ slug: 1 });
categorySchema.index({ parentId: 1 });

// Get the Category model
function getCategoryModel() {
  if (typeof window === 'undefined') {
    try {
      if (mongoose.connection.readyState === 1) {
        return mongoose.models.Category || mongoose.model<CategoryDocument>('Category', categorySchema);
      }
      return null;
    } catch (error) {
      console.error('Error accessing Category model:', error);
      return null;
    }
  }
  return null;
}

// Get all categories
export async function getAllCategories(): Promise<Category[]> {
  try {
    await connectToDatabase();
    const CategoryModel = getCategoryModel();
    
    if (!CategoryModel) {
      throw new Error('نموذج الفئات غير متاح');
    }
    
    const categories = await CategoryModel.find({})
      .sort({ name: 1 });
    
    return categories.map(category => convertDocToObj<Category>(category) || {} as Category);
  } catch (error) {
    console.error('Error getting all categories:', error);
    return [];
  }
}

// Get category by ID
export async function getCategoryById(id: string): Promise<Category | null> {
  try {
    await connectToDatabase();
    const CategoryModel = getCategoryModel();
    
    if (!CategoryModel) {
      throw new Error('نموذج الفئات غير متاح');
    }
    
    const category = await CategoryModel.findById(id);
    
    return category ? convertDocToObj<Category>(category) : null;
  } catch (error) {
    console.error(`Error getting category by id ${id}:`, error);
    return null;
  }
}

// Create new category
export async function createCategory(categoryData: Partial<Category>): Promise<Category | null> {
  try {
    await connectToDatabase();
    const CategoryModel = getCategoryModel();
    
    if (!CategoryModel) {
      throw new Error('نموذج الفئات غير متاح');
    }
    
    // Generate slug if not provided
    if (!categoryData.slug && categoryData.name) {
      categoryData.slug = categoryData.name
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-');
    }
    
    // Handle empty parentId by explicitly setting to null
    if (categoryData.parentId === '') {
      categoryData.parentId = null as any;
    }
    
    const category = await CategoryModel.create(categoryData);
    
    return convertDocToObj<Category>(category);
  } catch (error) {
    console.error('Error creating category:', error);
    return null;
  }
}

// Update category
export async function updateCategory(id: string, categoryData: Partial<Category>): Promise<Category | null> {
  try {
    await connectToDatabase();
    const CategoryModel = getCategoryModel();
    
    if (!CategoryModel) {
      throw new Error('نموذج الفئات غير متاح');
    }
    
    // Generate slug if name provided but slug isn't
    if (categoryData.name && !categoryData.slug) {
      categoryData.slug = categoryData.name
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-');
    }
    
    // Handle empty parentId by explicitly setting to null
    if (categoryData.parentId === '') {
      categoryData.parentId = null as any;
    }

    // Make sure we're using a valid ObjectId for the document ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.error(`Invalid ObjectId format for category: ${id}`);
      return null;
    }
    
    console.log(`Executing updateCategory with ID: ${id}, data:`, categoryData);
    
    // Use findOneAndUpdate with strict _id match to ensure we update the right document
    const updatedCategory = await CategoryModel.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(id) }, // Ensure exact _id match
      { $set: categoryData }, // Use $set to ensure we only update specified fields, not replace
      { 
        new: true,         // Return the updated document
        runValidators: true // Run validators on update
      }
    );
    
    if (!updatedCategory) {
      console.log(`No category found with _id: ${id}`);
      return null;
    }
    
    console.log(`Category updated successfully:`, updatedCategory);
    return convertDocToObj<Category>(updatedCategory);
  } catch (error) {
    console.error(`Error updating category ${id}:`, error);
    return null;
  }
}

// Delete category
export async function deleteCategory(id: string): Promise<boolean> {
  try {
    await connectToDatabase();
    const CategoryModel = getCategoryModel();
    
    if (!CategoryModel) {
      throw new Error('نموذج الفئات غير متاح');
    }
    
    const result = await CategoryModel.findByIdAndDelete(id);
    return !!result;
  } catch (error) {
    console.error(`Error deleting category ${id}:`, error);
    return false;
  }
}

// Export the model getter function
export default getCategoryModel;
