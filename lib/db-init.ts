import mongoose from 'mongoose';
import { connectToDatabase } from './mongodb';

/**
 * Initialize the MongoDB connection and setup models
 */
export async function initDatabase() {
  try {
    // Connect to the database
    await connectToDatabase();
    
    // Import models (which will register them with mongoose)
    require('../models/Category');
    require('../models/Discount');
    require('../models/Product');
    require('../models/Order');
    
    console.log('Database connection initialized successfully');
    console.log('Connection state:', mongoose.connection.readyState);
    console.log('Available models:', Object.keys(mongoose.models));
    
    return true;
  } catch (error) {
    console.error('Failed to initialize database connection:', error);
    return false;
  }
}

/**
 * Check if we're connected to MongoDB
 */
export function isConnected(): boolean {
  return mongoose.connection.readyState === 1;
}
