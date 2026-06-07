const Product = require('../models/Product.model');
const { cloudinary } = require('../config/cloudinary');

exports.getAllProducts = async (req, res) => {
  try {
    const { category, active, featured, sort = '-createdAt', limit = 50 } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (active !== undefined) filter.isActive = active === 'true';
    if (featured !== undefined) filter.isFeatured = featured === 'true';

    const products = await Product.find(filter)
      .sort(sort)
      .limit(parseInt(limit));

    res.json({ success: true, count: products.length, data: products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.files && req.files.length > 0) {
      data.images = req.files.map(f => f.path);
      data.imagePublicIds = req.files.map(f => f.filename);
      data.image = data.images[0];
    }
    // Parse JSON fields if sent as strings
    ['tags', 'badges', 'ingredients', 'howToUse', 'sizes'].forEach(field => {
      if (typeof data[field] === 'string') data[field] = JSON.parse(data[field]);
    });
    ['isActive', 'isFeatured', 'isNewArrival', 'isBestSeller'].forEach(field => {
      if (data[field] === 'true') data[field] = true;
      if (data[field] === 'false') data[field] = false;
    });
    const product = await Product.create(data);
    res.status(201).json({ success: true, data: product });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const data = { ...req.body };
    if (req.files && req.files.length > 0) {
      data.images = req.files.map(f => f.path);
      data.imagePublicIds = req.files.map(f => f.filename);
      data.image = data.images[0];
    }
    ['tags', 'badges', 'ingredients', 'howToUse', 'sizes'].forEach(field => {
      if (typeof data[field] === 'string') data[field] = JSON.parse(data[field]);
    });
    ['isActive', 'isFeatured', 'isNewArrival', 'isBestSeller'].forEach(field => {
      if (data[field] === 'true') data[field] = true;
      if (data[field] === 'false') data[field] = false;
    });

    const updated = await Product.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.toggleProductVisibility = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    product.isActive = !product.isActive;
    await product.save();
    res.json({ success: true, data: product, message: `Product is now ${product.isActive ? 'active' : 'hidden'}` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    // Delete images from Cloudinary
    if (product.imagePublicIds && product.imagePublicIds.length > 0) {
      await Promise.all(product.imagePublicIds.map(id => cloudinary.uploader.destroy(id)));
    }
    await product.deleteOne();
    res.json({ success: true, message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
