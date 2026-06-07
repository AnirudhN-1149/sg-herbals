const Order = require('../models/Order.model');

exports.createOrder = async (req, res) => {
  try {
    const { customer, items, subtotal, shippingFee = 0 } = req.body;
    const total = subtotal + shippingFee;
    const order = await Order.create({ customer, items, subtotal, shippingFee, total });
    res.status(201).json({ success: true, data: order, message: 'Order placed successfully! Our team will contact you on WhatsApp shortly.' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const { status, sort, page = 1, limit = 20, search, startDate, endDate } = req.query;
    const filter = {};
    if (status) filter.status = status;
    
    if (search) {
      filter.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'customer.name': { $regex: search, $options: 'i' } },
        { 'customer.phone': { $regex: search, $options: 'i' } }
      ];
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    let sortObj = { createdAt: -1 };
    if (sort) {
       sortObj = sort;
    } else {
       sortObj = { status: -1, createdAt: -1 }; // Pending (-1) comes before completed (1) usually if string, but let's just sort by createdAt desc for now, status filtering is done via tabs.
       // Actually 'pending' > 'completed' alphabetically, so status: -1 puts pending first.
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [orders, total] = await Promise.all([
      Order.find(filter).sort(sortObj).skip(skip).limit(parseInt(limit)),
      Order.countDocuments(filter),
    ]);
    res.json({ success: true, count: orders.length, total, page: parseInt(page), data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, message: 'Order deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
