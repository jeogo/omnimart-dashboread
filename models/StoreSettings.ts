import mongoose, { Schema, Document } from 'mongoose';
import { StoreSettings } from '@/types';
import { connectToDatabase, convertDocToObj } from '@/lib/mongodb';

// Define mongoose model interface for StoreSettings
export interface StoreSettingsDocument extends Document, Omit<StoreSettings, 'id'> {
  updatedAt: Date;
}

// Define shipping rate schema
const shippingRateSchema = new Schema(
  {
    region: { type: String, required: true, trim: true },
    cost: { 
      type: Number, 
      required: true,
      min: [0, 'يجب أن تكون تكلفة الشحن أكبر من أو تساوي 0']
    },
    estimatedDays: { type: String, required: true, trim: true }
  },
  { _id: false }
);

// Define social media schema
const socialMediaSchema = new Schema(
  {
    facebook: { type: String, trim: true },
    instagram: { type: String, trim: true },
    twitter: { type: String, trim: true }
  },
  { _id: false }
);

// Define store settings schema
const storeSettingsSchema = new Schema<StoreSettingsDocument>(
  {
    storeName: { type: String, required: true, trim: true },
    logo: { type: String },
    contactPhone: { type: String, required: true, trim: true },
    contactEmail: { 
      type: String, 
      required: true, 
      trim: true,
      lowercase: true,
      validate: {
        validator: (v: string) => /^\S+@\S+\.\S+$/.test(v),
        message: 'البريد الإلكتروني غير صالح'
      }
    },
    address: { type: String, required: true, trim: true },
    socialMedia: { type: socialMediaSchema, default: {} },
    shippingRates: [shippingRateSchema],
    workingHours: { type: String, trim: true }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Get or create the StoreSettings model
const getStoreSettingsModel = () => {
  // Return existing model if it exists
  if (mongoose.models.StoreSettings) {
    return mongoose.models.StoreSettings as mongoose.Model<StoreSettingsDocument>;
  }
  
  // Create new model only if mongoose is connected
  if (mongoose.connection.readyState === 1) {
    return mongoose.model<StoreSettingsDocument>('StoreSettings', storeSettingsSchema);
  }
  
  // Return null if not connected - will be handled in the helper functions
  return null;
};

// Helper functions for database operations

// Get store settings
export async function getStoreSettings(): Promise<StoreSettings | null> {
  try {
    await connectToDatabase();
    const StoreSettingsModel = getStoreSettingsModel();
    
    if (!StoreSettingsModel) {
      throw new Error('نموذج إعدادات المتجر غير متاح. يرجى التأكد من الاتصال بقاعدة البيانات أولاً.');
    }
    
    // دائمًا نحصل على أول سجل (يجب أن يكون هناك سجل واحد فقط)
    const settings = await StoreSettingsModel.findOne().sort({ updatedAt: -1 });
      
    return settings ? convertDocToObj<StoreSettings>(settings) : null;
  } catch (error) {
    console.error('Error getting store settings:', error);
    return null;
  }
}

// Update store settings
export async function updateStoreSettings(settingsData: Partial<StoreSettings>): Promise<StoreSettings | null> {
  try {
    await connectToDatabase();
    const StoreSettingsModel = getStoreSettingsModel();
    
    if (!StoreSettingsModel) {
      throw new Error('نموذج إعدادات المتجر غير متاح. يرجى التأكد من الاتصال بقاعدة البيانات أولاً.');
    }
    
    // تحقق ما إذا كان هناك إعدادات موجودة بالفعل
    let settings = await StoreSettingsModel.findOne();
    
    if (settings) {
      // تحديث الإعدادات الموجودة
      settings = await StoreSettingsModel.findByIdAndUpdate(
        settings._id,
        settingsData,
        { new: true, runValidators: true }
      );
    } else {
      // إنشاء إعدادات جديدة
      settings = await StoreSettingsModel.create(settingsData);
    }
    
    return settings ? convertDocToObj<StoreSettings>(settings) : null;
  } catch (error) {
    console.error('Error updating store settings:', error);
    return null;
  }
}

// Export the function to get model instead of the model itself
// This ensures we always get the most up-to-date model
export default getStoreSettingsModel();
