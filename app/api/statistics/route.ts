import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import mongoose from 'mongoose';
import { Order, Statistics } from '@/types';

export async function GET() {
  try {
    await connectToDatabase();
    
    // Create or get model schemas on the fly for server-side operation
    const OrderSchema = new mongoose.Schema({
      customerName: String,
      customerPhone: String,
      customerAddress: String,
      wilaya: String,
      products: [{
        productId: mongoose.Schema.Types.ObjectId,
        productName: String,
        price: Number,
        quantity: Number,
        size: String,
        color: String
      }],
      totalAmount: Number,
      shippingCost: Number,
      status: String,
      notes: String,
      createdAt: Date,
      updatedAt: Date
    }, { timestamps: true });
    
    // Get the models using a safe approach
    const OrderModel = mongoose.models.Order || mongoose.model('Order', OrderSchema);
    
    // Initialize empty statistics object
    const statistics: Statistics = {
      totalSales: 0,
      totalOrders: 0,
      totalCustomers: 0,
      topSellingProducts: [],
      recentOrders: [],
      salesByDate: []
    };
    
    // Get total orders
    statistics.totalOrders = await OrderModel.countDocuments() || 0;
    
    // Calculate total sales from completed/delivered orders
    const totalSalesResult = await OrderModel.aggregate([
      { $match: { status: { $in: ['delivered', 'completed'] } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    
    if (totalSalesResult && totalSalesResult.length > 0) {
      statistics.totalSales = totalSalesResult[0].total;
    }
    
    // Count unique customers
    const uniqueCustomersCount = await OrderModel.aggregate([
      { $group: { _id: '$customerPhone' } },
      { $count: 'total' }
    ]);
    
    if (uniqueCustomersCount && uniqueCustomersCount.length > 0) {
      statistics.totalCustomers = uniqueCustomersCount[0].total;
    }
    
    // Get top selling products (handling potential errors)
    try {
      const topProducts = await OrderModel.aggregate([
        { $unwind: '$products' },
        { $group: { 
          _id: '$products.productId',
          productName: { $first: '$products.productName' },
          unitsSold: { $sum: '$products.quantity' },
          totalRevenue: { $sum: { $multiply: ['$products.price', '$products.quantity'] } }
        }},
        { $sort: { unitsSold: -1 } },
        { $limit: 5 }
      ]);
      
      if (topProducts && topProducts.length > 0) {
        statistics.topSellingProducts = topProducts.map(product => ({
          productId: product._id ? product._id.toString() : 'unknown',
          productName: product.productName || 'Unknown Product',
          unitsSold: product.unitsSold || 0,
          totalRevenue: product.totalRevenue || 0
        }));
      }
    } catch (err) {
      console.error('Error calculating top products:', err);
      // Keep the default empty array for topSellingProducts
    }
    
    // Get recent orders (with error handling)
    try {
      const recentOrders = await OrderModel.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .lean() as any;
      
      if (recentOrders && recentOrders.length > 0) {
        statistics.recentOrders = recentOrders.map((order: { _id: { toString: () => any; }; customerName: any; customerPhone: any; customerAddress: any; wilaya: any; products: any[]; totalAmount: any; shippingCost: any; status: any; notes: any; createdAt: any; updatedAt: any; }) => ({
          id: order?._id.toString(),
          customerName: order.customerName,
          customerPhone: order.customerPhone,
          customerAddress: order.customerAddress,
          wilaya: order.wilaya,
          products: order.products.map((product: any) => ({
            productId: product.productId.toString(),
            productName: product.productName,
            price: product.price,
            quantity: product.quantity,
            size: product.size,
            color: product.color
          })),
          totalAmount: order.totalAmount,
          shippingCost: order.shippingCost,
          status: order.status,
          notes: order.notes,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt
        }));
      }
    } catch (err) {
      console.error('Error fetching recent orders:', err);
      // Keep the default empty array for recentOrders
    }
    
    // Get sales by date for the last 7 days
    try {
      const now = new Date();
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(now.getDate() - 7);
      
      const salesByDateResult = await OrderModel.aggregate([
        { 
          $match: { 
            createdAt: { $gte: sevenDaysAgo, $lte: now },
            status: { $in: ['delivered', 'completed'] }
          } 
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            amount: { $sum: '$totalAmount' }
          }
        },
        { $sort: { _id: 1 } }
      ]);
      
      if (salesByDateResult && salesByDateResult.length > 0) {
        statistics.salesByDate = salesByDateResult.map(item => ({
          date: item._id,
          amount: item.amount
        }));
      }
      
      // Fill in missing dates with zero values
      const dateMap = new Map();
      statistics.salesByDate.forEach(item => {
        dateMap.set(item.date, item.amount);
      });
      
      // Generate all dates in the range
      for (let d = new Date(sevenDaysAgo); d <= now; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        if (!dateMap.has(dateStr)) {
          statistics.salesByDate.push({
            date: dateStr,
            amount: 0
          });
        }
      }
      
      // Sort by date
      statistics.salesByDate.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
    } catch (err) {
      console.error('Error calculating sales by date:', err);
      // Keep the default empty array for salesByDate
    }
    
    return NextResponse.json({ statistics });
  } catch (error) {
    console.error('Error getting statistics:', error);
    // Return a partial statistics object in case of error
    return NextResponse.json(
      { 
        statistics: {
          totalSales: 0,
          totalOrders: 0,
          totalCustomers: 0,
          topSellingProducts: [],
          recentOrders: [],
          salesByDate: []
        },
        error: 'فشل في جلب الإحصائيات' 
      },
      { status: 200 } // Returning 200 with empty data rather than 500
    );
  }
}
