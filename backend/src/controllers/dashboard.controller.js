const Order = require('../models/Order.model');
const Product = require('../models/Product.model');

exports.getStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const completedOrders = await Order.countDocuments({ status: 'completed' });
    const totalProducts = await Product.countDocuments();

    const orders = await Order.find({ status: 'completed' });
    const totalSales = orders.reduce((acc, curr) => acc + curr.total, 0);

    const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(5);

    res.json({
      success: true,
      data: {
        totalOrders,
        completedOrders,
        totalProducts,
        totalSales,
        recentOrders
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
