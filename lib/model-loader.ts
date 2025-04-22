import mongoose from 'mongoose';
import { connectToDatabase } from './mongodb';

/**
 * Factory function to get or create mongoose models
 * This solves the issue of models being required before connection is established
 * 
 * @param modelName Name of the model
 * @param schema Schema definition for the model
 * @returns Mongoose model or null if connection is not established
 */
export async function getOrCreateModel<T extends mongoose.Document>(
  modelName: string,
  schema: mongoose.Schema<T>
): Promise<mongoose.Model<T> | null> {
  try {
    // Connect to database if not already connected
    await connectToDatabase();
    
    // Return existing model if already defined
    if (mongoose.models[modelName]) {
      return mongoose.models[modelName] as mongoose.Model<T>;
    }
    
    // Create and return new model if connected
    if (mongoose.connection.readyState === 1) {
      return mongoose.model<T>(modelName, schema);
    }
    
    // Return null if not connected
    return null;
  } catch (error) {
    console.error(`Error getting or creating model ${modelName}:`, error);
    return null;
  }
}

/**
 * Check if MongoDB connection is active
 * @returns Boolean indicating connection status
 */
export function isConnected(): boolean {
  return mongoose.connection.readyState === 1;
}
