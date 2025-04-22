import mongoose, { Schema } from 'mongoose';
import { Product } from '@/types';
import { connectToDatabase, convertDocToObj } from '@/lib/mongodb';

// Define a clearer document interface that avoids conflicts
export interface ProductDocument extends mongoose.Document {
  name: string;
  description: string;
  price: number;
  oldPrice?: number;
  categoryId: mongoose.Types.ObjectId | string;
  category?: string;
  images: string[];
  image?: string;
  features: string[];
  material: string;
  care: string;
  sizes: string[];
  colors?: { name: string; value: string }[];
  isNewProduct: boolean; // Changed from isNew to isNewProduct to avoid conflict
  discount?: number | {
    percentage: number;
    startDate: string;
    endDate: string;
    type: 'sale' | 'special';
  };
  rating: number;
  reviews: number;
  discountId?: mongoose.Types.ObjectId | string;
  createdAt: Date;
  updatedAt: Date;
}

// Define product schema correctly - using suppressReservedKeysWarning
const productSchema = new Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true, default: '' },
  price: { 
    type: Number, 
    required: true,
    min: [0, 'يجب أن يكون السعر أكبر من أو يساوي 0']
  },
  oldPrice: { 
    type: Number,
    min: [0, 'يجب أن يكون السعر القديم أكبر من أو يساوي 0']
  },
  categoryId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Category',
    required: true
  },
  category: { type: String },
  images: [{ type: String }],
  image: { type: String },
  features: [{ type: String }],
  material: { type: String, default: '' },
  care: { type: String, default: '' },
  sizes: [{ type: String }],
  colors: [{
    _id: false,
    name: { type: String },
    value: { type: String }
  }],
  isNewProduct: { type: Boolean, default: false }, // Changed from isNew to isNewProduct
  discount: { 
    type: Schema.Types.Mixed 
  },
  rating: { type: Number, default: 0 },
  reviews: { type: Number, default: 0 },
  discountId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Discount',
    default: null,
    validate: {
      validator: function(v: any) {
        // Accept null, undefined, or valid ObjectId
        return v === null || v === undefined || 
              (typeof v === 'string' && v.length === 0) || // Accept empty string
              mongoose.Types.ObjectId.isValid(v);
      },
      message: 'معرّف الخصم غير صالح'
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  suppressReservedKeysWarning: true // Add this to suppress the warning
});

// Create indexes for fast searching
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ categoryId: 1 });
productSchema.index({ discountId: 1 });
productSchema.index({ isNewProduct: 1 }); // Changed from isNew to isNewProduct

// Virtual for main image
productSchema.virtual('mainImage').get(function() {
  return this.images && this.images.length > 0 ? this.images[0] : null;
});

// Get the Product model - ensure we're handling it correctly for SSR
function getProductModel() {
  // Only create the model on the server side, never on the client side
  if (typeof window === 'undefined') {
    try {
      // Check if mongoose is connected before trying to access/create the model
      if (mongoose.connection.readyState === 1) {
        return mongoose.models.Product || mongoose.model<ProductDocument>('Product', productSchema);
      }
      return null;
    } catch (error) {
      console.error('Error accessing Product model:', error);
      return null;
    }
  }
  return null;
}

// Helper functions for database operations

// Get all products
export async function getAllProducts(): Promise<Product[]> {
  try {
    await connectToDatabase();
    const ProductModel = getProductModel();
    
    if (!ProductModel) {
      throw new Error('نموذج المنتج غير متاح. يرجى التأكد من الاتصال بقاعدة البيانات أولاً.');
    }
    
    const products = await ProductModel.find({})
      .populate('categoryId', 'name')
      .populate('discountId', 'percentage validFrom validTo type')
      .sort({ createdAt: -1 });
    
    // Map isNewProduct to isNew for client-side compatibility
    return products.map(product => {
      const convertedProduct = convertDocToObj<any>(product) || {};
      // Map isNewProduct to isNew
      if ('isNewProduct' in convertedProduct) {
        convertedProduct.isNew = convertedProduct.isNewProduct;
        delete convertedProduct.isNewProduct;
      }
      return convertedProduct as Product;
    });
  } catch (error) {
    console.error('Error getting all products:', error);
    return [];
  }
}

// Get product by ID
export async function getProductById(id: string): Promise<Product | null> {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    
    await connectToDatabase();
    const ProductModel = getProductModel();
    
    if (!ProductModel) {
      throw new Error('نموذج المنتج غير متاح. يرجى التأكد من الاتصال بقاعدة البيانات أولاً.');
    }
    
    const product = await ProductModel.findById(id)
      .populate('categoryId', 'name')
      .populate('discountId', 'name percentage validFrom validTo type');
      
    if (product) {
      const convertedProduct = convertDocToObj<any>(product) || {};
      // Map isNewProduct to isNew
      if ('isNewProduct' in convertedProduct) {
        convertedProduct.isNew = convertedProduct.isNewProduct;
        delete convertedProduct.isNewProduct;
      }
      return convertedProduct as Product;
    }
    return null;
  } catch (error) {
    console.error(`Error getting product by id ${id}:`, error);
    return null;
  }
}

// Get products by category
export async function getProductsByCategory(categoryId: string): Promise<Product[]> {
  try {
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return [];
    }
    
    await connectToDatabase();
    const ProductModel = getProductModel();
    
    if (!ProductModel) {
      throw new Error('نموذج المنتج غير متاح. يرجى التأكد من الاتصال بقاعدة البيانات أولاً.');
    }
    
    const products = await ProductModel.find({ categoryId })
      .populate('discountId', 'percentage validFrom validTo type')
      .sort({ createdAt: -1 });
      
    // Map isNewProduct to isNew for client-side compatibility
    return products.map(product => {
      const convertedProduct = convertDocToObj<any>(product) || {};
      // Map isNewProduct to isNew
      if ('isNewProduct' in convertedProduct) {
        convertedProduct.isNew = convertedProduct.isNewProduct;
        delete convertedProduct.isNewProduct;
      }
      return convertedProduct as Product;
    });
  } catch (error) {
    console.error(`Error getting products by category ${categoryId}:`, error);
    return [];
  }
}

// Get new products
export async function getNewProducts(limit: number = 10): Promise<Product[]> {
  try {
    await connectToDatabase();
    const ProductModel = getProductModel();
    
    if (!ProductModel) {
      throw new Error('نموذج المنتج غير متاح. يرجى التأكد من الاتصال بقاعدة البيانات أولاً.');
    }
    
    // Changed from isNew to isNewProduct
    const products = await ProductModel.find({ isNewProduct: true })
      .limit(limit)
      .populate('categoryId', 'name')
      .populate('discountId', 'percentage validFrom validTo type')
      .sort({ createdAt: -1 });
    
    // Map isNewProduct to isNew for client-side compatibility
    return products.map(product => {
      const convertedProduct = convertDocToObj<any>(product) || {};
      // Map isNewProduct to isNew
      if ('isNewProduct' in convertedProduct) {
        convertedProduct.isNew = convertedProduct.isNewProduct;
        delete convertedProduct.isNewProduct;
      }
      return convertedProduct as Product;
    });
  } catch (error) {
    console.error('Error getting new products:', error);
    return [];
  }
}

// Get featured products
export async function getFeaturedProducts(limit: number = 10): Promise<Product[]> {
  try {
    await connectToDatabase();
    const ProductModel = getProductModel();
    
    if (!ProductModel) {
      throw new Error('نموذج المنتج غير متاح. يرجى التأكد من الاتصال بقاعدة البيانات أولاً.');
    }
    
    const products = await ProductModel.find({ rating: { $gte: 4 } })
      .limit(limit)
      .populate('categoryId', 'name')
      .populate('discountId', 'percentage validFrom validTo type')
      .sort({ rating: -1, reviews: -1 });
      
    // Map isNewProduct to isNew for client-side compatibility
    return products.map(product => {
      const convertedProduct = convertDocToObj<any>(product) || {};
      // Map isNewProduct to isNew
      if ('isNewProduct' in convertedProduct) {
        convertedProduct.isNew = convertedProduct.isNewProduct;
        delete convertedProduct.isNewProduct;
      }
      return convertedProduct as Product;
    });
  } catch (error) {
    console.error('Error getting featured products:', error);
    return [];
  }
}

// Create new product
export async function createProduct(productData: Partial<Product>): Promise<Product | null> {
  try {
    await connectToDatabase();
    const ProductModel = getProductModel();
    
    if (!ProductModel) {
      throw new Error('نموذج المنتج غير متاح. يرجى التأكد من الاتصال بقاعدة البيانات أولاً.');
    }
    
    // Map isNew to isNewProduct for database compatibility
    const dataToCreate: any = {
      ...productData,
      images: productData.images || [],
      features: productData.features || [],
      sizes: productData.sizes || [],
    };
    
    if ('isNew' in productData) {
      dataToCreate.isNewProduct = productData.isNew;
      delete dataToCreate.isNew;
    }
    
    // Handle empty discountId
    if (dataToCreate.discountId === '') {
      dataToCreate.discountId = null;
    }
    
    const product = await ProductModel.create(dataToCreate);
    
    // Map isNewProduct back to isNew for client-side
    const convertedProduct = convertDocToObj<any>(product) || {};
    if ('isNewProduct' in convertedProduct) {
      convertedProduct.isNew = convertedProduct.isNewProduct;
      delete convertedProduct.isNewProduct;
    }
    
    return convertedProduct as Product;
  } catch (error) {
    console.error('Error creating product:', error);
    return null;
  }
}

// Update existing product
export async function updateProduct(id: string, productData: Partial<Product>): Promise<Product | null> {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    
    await connectToDatabase();
    const ProductModel = getProductModel();
    
    if (!ProductModel) {
      throw new Error('نموذج المنتج غير متاح. يرجى التأكد من الاتصال بقاعدة البيانات أولاً.');
    }
    
    // Map isNew to isNewProduct for database compatibility
    const dataToUpdate: any = { ...productData };
    if ('isNew' in productData) {
      dataToUpdate.isNewProduct = productData.isNew;
      delete dataToUpdate.isNew;
    }
    
    // Handle empty discountId
    if (dataToUpdate.discountId === '') {
      dataToUpdate.discountId = null;
    }
    
    const updatedProduct = await ProductModel.findByIdAndUpdate(
      id,
      dataToUpdate,
      { new: true, runValidators: true }
    ).populate('categoryId', 'name')
     .populate('discountId', 'name percentage validFrom validTo type');
    
    // Map isNewProduct back to isNew for client-side
    const convertedProduct = convertDocToObj<any>(updatedProduct) || {};
    if ('isNewProduct' in convertedProduct) {
      convertedProduct.isNew = convertedProduct.isNewProduct;
      delete convertedProduct.isNewProduct;
    }
    
    return convertedProduct as Product;
  } catch (error) {
    console.error(`Error updating product ${id}:`, error);
    return null;
  }
}

// Delete product
export async function deleteProduct(id: string): Promise<boolean> {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return false;
    }
    
    await connectToDatabase();
    const ProductModel = getProductModel();
    
    if (!ProductModel) {
      throw new Error('نموذج المنتج غير متاح. يرجى التأكد من الاتصال بقاعدة البيانات أولاً.');
    }
    
    const result = await ProductModel.findByIdAndDelete(id);
    return !!result;
  } catch (error) {
    console.error(`Error deleting product ${id}:`, error);
    return false;
  }
}

// Export the model getter function
export default getProductModel;
