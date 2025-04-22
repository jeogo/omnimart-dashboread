import mongoose from 'mongoose';

declare global {
  // Improved type definition to avoid type mismatches
  var mongoose: {
    conn: mongoose.Connection | null;
    promise: Promise<mongoose.Connection> | null;
  } | undefined;
}

// MongoDB connection URI from environment variables
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://admin:admin@ecommerce.rq8hick.mongodb.net/?retryWrites=true&w=majority&appName=Ecommerce";

if (!MONGODB_URI) {
  throw new Error('يرجى تحديد متغير البيئة MONGODB_URI');
}

/**
 * Global variable to store database connection state (for caching)
 * Used to prevent repeated connections in development mode
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

/**
 * Connect to MongoDB database
 * Connection happens once and is stored in a global variable
 */
export async function connectToDatabase(): Promise<mongoose.Connection> {
  if (cached?.conn) {
    return cached.conn;
  }

  if (!cached?.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
    };

    cached!.promise = mongoose.connect(MONGODB_URI!, opts)
      .then((mongoose) => {
        console.log('MongoDB connected successfully');
        return mongoose.connection;
      });
  }

  try {
    cached!.conn = await cached!.promise;
  } catch (e) {
    cached!.promise = null;
    console.error('Error connecting to MongoDB:', e);
    throw e;
  }

  return cached!.conn;
}

/**
 * Convert MongoDB document to plain object
 * Replace _id with id and handle dates and ObjectId
 */
export function convertDocToObj<T>(doc: any): T | null {
  if (!doc) return null;
  
  const obj = doc.toObject ? doc.toObject() : doc;
  
  // Convert _id to id
  if (obj._id) {
    obj.id = obj._id.toString();
    delete obj._id;
  }
  
  // Process nested objects and convert dates to strings
  Object.keys(obj).forEach((key) => {
    if (obj[key] instanceof Date) {
      obj[key] = obj[key].toISOString();
    } else if (obj[key] === null) {
      obj[key] = undefined;
    } else if (mongoose.Types.ObjectId.isValid(obj[key]?.toString())) {
      if (obj[key]?._id) {
        obj[key] = obj[key].toString();
      }
    }
  });
  
  return obj as T;
}
