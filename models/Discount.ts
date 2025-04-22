import mongoose, { Schema } from 'mongoose';
import { Discount } from '@/types';
import { connectToDatabase, convertDocToObj } from '@/lib/mongodb';

// Define a document interface for Discount
interface DiscountDocument extends mongoose.Document {
  name: string;
  percentage: number;
  validFrom: Date;
  validTo: Date;
  type?: 'sale' | 'special' | 'seasonal';
  applicableProducts?: mongoose.Types.ObjectId[];
  applicableCategories?: mongoose.Types.ObjectId[];
  minPurchase?: number;
  code?: string;
  isActive?: boolean;
}

// Define discount schema
const discountSchema = new Schema<DiscountDocument>({
  name: { type: String, required: true, trim: true },
  percentage: { 
    type: Number, 
    required: true,
    min: [1, 'يجب أن تكون نسبة الخصم أكبر من أو تساوي 1%'],
    max: [100, 'يجب أن تكون نسبة الخصم أقل من أو تساوي 100%']
  },
  validFrom: { type: Date, required: true },
  validTo: { type: Date, required: true },
  type: { 
    type: String, 
    enum: ['sale', 'special', 'seasonal'],
    default: 'sale'
  },
  applicableProducts: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'Product' 
  }],
  applicableCategories: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'Category' 
  }],
  minPurchase: { 
    type: Number,
    min: [0, 'يجب أن يكون الحد الأدنى للشراء أكبر من أو يساوي 0']
  },
  code: { 
    type: String,
    trim: true,
    uppercase: true
  },
  isActive: { 
    type: Boolean, 
    default: true 
  }
}, { 
  timestamps: true 
});

// Create indexes for faster searching
discountSchema.index({ validFrom: 1, validTo: 1 });
discountSchema.index({ code: 1 });
discountSchema.index({ isActive: 1 });

// Virtual property to determine if discount is currently active
discountSchema.virtual('active').get(function() {
  const now = new Date();
  return this.isActive && 
         now >= this.validFrom && 
         now <= this.validTo;
});

// Get the Discount model
function getDiscountModel() {
  if (typeof window === 'undefined') {
    try {
      if (mongoose.connection.readyState === 1) {
        return mongoose.models.Discount || mongoose.model<DiscountDocument>('Discount', discountSchema);
      }
      return null;
    } catch (error) {
      console.error('Error accessing Discount model:', error);
      return null;
    }
  }
  return null;
}

// Get all discounts
export async function getAllDiscounts(activeOnly: boolean = false): Promise<Discount[]> {
  try {
    await connectToDatabase();
    const DiscountModel = getDiscountModel();
    
    if (!DiscountModel) {
      throw new Error('نموذج الخصومات غير متاح');
    }
    
    let query: any = {};
    
    if (activeOnly) {
      const now = new Date();
      query = {
        isActive: true,
        validFrom: { $lte: now },
        validTo: { $gte: now }
      };
    }
    
    const discounts = await DiscountModel.find(query)
      .sort({ validFrom: -1 });
    
    return discounts.map(discount => convertDocToObj<Discount>(discount) || {} as Discount);
  } catch (error) {
    console.error('Error getting all discounts:', error);
    return [];
  }
}

// Get discount by ID
export async function getDiscountById(id: string): Promise<Discount | null> {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    
    await connectToDatabase();
    const DiscountModel = getDiscountModel();
    
    if (!DiscountModel) {
      throw new Error('نموذج الخصومات غير متاح');
    }
    
    const discount = await DiscountModel.findById(id);
    
    return discount ? convertDocToObj<Discount>(discount) : null;
  } catch (error) {
    console.error(`Error getting discount by id ${id}:`, error);
    return null;
  }
}

// Create new discount
export async function createDiscount(discountData: Partial<Discount>): Promise<Discount | null> {
  try {
    await connectToDatabase();
    const DiscountModel = getDiscountModel();
    
    if (!DiscountModel) {
      throw new Error('نموذج الخصومات غير متاح');
    }
    
    // Ensure dates are properly converted
    if (typeof discountData.validFrom === 'string') {
      discountData.validFrom = new Date(discountData.validFrom) as any;
    }
    
    if (typeof discountData.validTo === 'string') {
      discountData.validTo = new Date(discountData.validTo) as any;
    }
    
    // Handle applicableProducts and applicableCategories if provided
    if (discountData.applicableProducts?.length) {
      discountData.applicableProducts = discountData.applicableProducts.map(id => 
        mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) as any : id
      );
    }
    
    if (discountData.applicableCategories?.length) {
      discountData.applicableCategories = discountData.applicableCategories.map(id => 
        mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) as any : id
      );
    }
    
    const discount = await DiscountModel.create(discountData);
    
    return convertDocToObj<Discount>(discount);
  } catch (error) {
    console.error('Error creating discount:', error);
    return null;
  }
}

// Update discount
export async function updateDiscount(id: string, discountData: Partial<Discount>): Promise<Discount | null> {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.error(`Invalid ObjectId format for discount: ${id}`);
      return null;
    }
    
    await connectToDatabase();
    const DiscountModel = getDiscountModel();
    
    if (!DiscountModel) {
      throw new Error('نموذج الخصومات غير متاح');
    }
    
    // Ensure dates are properly converted
    if (typeof discountData.validFrom === 'string') {
      discountData.validFrom = new Date(discountData.validFrom) as any;
    }
    
    if (typeof discountData.validTo === 'string') {
      discountData.validTo = new Date(discountData.validTo) as any;
    }
    
    // Handle applicableProducts and applicableCategories if provided
    if (discountData.applicableProducts?.length) {
      discountData.applicableProducts = discountData.applicableProducts.map(id => 
        mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) as any : id
      );
    }
    
    if (discountData.applicableCategories?.length) {
      discountData.applicableCategories = discountData.applicableCategories.map(id => 
        mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) as any : id
      );
    }
    
    console.log(`Updating discount with ID: ${id}`, discountData);
    
    const updatedDiscount = await DiscountModel.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(id) },
      { $set: discountData },
      { 
        new: true, 
        runValidators: true 
      }
    );
    
    if (!updatedDiscount) {
      console.log(`No discount found with ID: ${id}`);
      return null;
    }
    
    return convertDocToObj<Discount>(updatedDiscount);
  } catch (error) {
    console.error(`Error updating discount ${id}:`, error);
    return null;
  }
}

// Delete discount
export async function deleteDiscount(id: string): Promise<boolean> {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return false;
    }
    
    await connectToDatabase();
    const DiscountModel = getDiscountModel();
    
    if (!DiscountModel) {
      throw new Error('نموذج الخصومات غير متاح');
    }
    
    // First, check if the discount is being used by any products
    const ProductModel = mongoose.models.Product;
    
    if (ProductModel) {
      const productsUsingDiscount = await ProductModel.countDocuments({ discountId: id });
      
      if (productsUsingDiscount > 0) {
        console.error(`Cannot delete discount ${id} as it is used by ${productsUsingDiscount} products`);
        throw new Error(`لا يمكن حذف التخفيض لأنه مستخدم في ${productsUsingDiscount} منتجات`);
      }
    }
    
    const result = await DiscountModel.findByIdAndDelete(id);
    return !!result;
  } catch (error) {
    console.error(`Error deleting discount ${id}:`, error);
    throw error;
  }
}

// Export the model getter function
export default getDiscountModel;
