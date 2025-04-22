import { connectToDatabase } from '@/lib/mongodb';
import { Statistics, TopSellingProduct, SalesByDate } from '@/types';
import mongoose from 'mongoose';

// Get dashboard statistics
export async function getDashboardStatistics(): Promise<Statistics> {
  // Check if we're on server-side
  if (typeof window !== 'undefined') {
    console.error('This function should only be called on the server side');
    return {
      totalSales: 0,
      totalOrders: 0,
      totalCustomers: 0,
      topSellingProducts: [],
      recentOrders: [],
      salesByDate: []
    };
  }

  try {
    await connectToDatabase();
    
    // Get models directly
    const OrderModel = mongoose.models.Order;
    const ProductModel = mongoose.models.Product;
    
    if (!OrderModel || !ProductModel) {
      throw new Error('النماذج غير متاحة. يرجى التأكد من الاتصال بقاعدة البيانات أولاً.');
    }
    
    // إجمالي المبيعات
    const totalSalesResult = await OrderModel.aggregate([
      { $match: { status: { $nin: ['cancelled'] } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalSales = totalSalesResult.length > 0 ? totalSalesResult[0].total : 0;
    
    // إجمالي الطلبات
    const totalOrdersResult = await OrderModel.countDocuments();
    
    // إجمالي العملاء (عدد العملاء الفريدين)
    const totalCustomersResult = await OrderModel.aggregate([
      { $group: { _id: '$customerPhone' } },
      { $count: 'total' }
    ]);
    const totalCustomers = totalCustomersResult.length > 0 ? totalCustomersResult[0].total : 0;
    
    // المنتجات الأكثر مبيعًا
    const topSellingProductsResult = await OrderModel.aggregate([
      { $match: { status: { $nin: ['cancelled'] } } },
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
    
    const topSellingProducts: TopSellingProduct[] = topSellingProductsResult.map(item => ({
      productId: item._id.toString(),
      productName: item.productName,
      unitsSold: item.unitsSold,
      totalRevenue: item.totalRevenue
    }));
    
    // الطلبات الأخيرة
    const recentOrders = await OrderModel.find()
      .sort({ createdAt: -1 })
      .limit(5);
    
    // المبيعات حسب التاريخ (آخر 7 أيام)
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);
    
    const salesByDateResult = await OrderModel.aggregate([
      { 
        $match: { 
          createdAt: { $gte: sevenDaysAgo, $lte: today },
          status: { $nin: ['cancelled'] }
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
    
    const salesByDate: SalesByDate[] = salesByDateResult.map(item => ({
      date: item._id,
      amount: item.amount
    }));
    
    return {
      totalSales,
      totalOrders: totalOrdersResult,
      totalCustomers,
      topSellingProducts,
      recentOrders: recentOrders.map(order => {
        const obj = order.toObject();
        return {
          id: obj._id.toString(),
          customerName: obj.customerName,
          customerPhone: obj.customerPhone,
          customerAddress: obj.customerAddress,
          wilaya: obj.wilaya,
          products: obj.products.map((p: any) => ({
            productId: p.productId.toString(),
            productName: p.productName,
            price: p.price,
            quantity: p.quantity,
            size: p.size,
            color: p.color
          })),
          totalAmount: obj.totalAmount,
          shippingCost: obj.shippingCost,
          status: obj.status,
          notes: obj.notes,
          createdAt: obj.createdAt,
          updatedAt: obj.updatedAt
        };
      }),
      salesByDate
    };
  } catch (error) {
    console.error('Error getting dashboard statistics:', error);
    // إرجاع إحصائيات فارغة في حالة الخطأ
    return {
      totalSales: 0,
      totalOrders: 0,
      totalCustomers: 0,
      topSellingProducts: [],
      recentOrders: [],
      salesByDate: []
    };
  }
}
