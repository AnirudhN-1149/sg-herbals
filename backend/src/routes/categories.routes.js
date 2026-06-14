const express = require('express');
const router = express.Router();
const Category = require('../models/Category.model');
const { protect } = require('../middleware/auth.middleware');

// Get all categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find().sort({ order: 1, name: 1 });
    res.json({ success: true, data: categories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Create category
router.post('/', protect, async (req, res) => {
  try {
    const { name, label, order } = req.body;
    if (!name || !label) {
      return res.status(400).json({ success: false, message: 'Please provide both category name and label.' });
    }
    const exists = await Category.findOne({ name });
    if (exists) {
      return res.status(400).json({ success: false, message: 'Category name already exists.' });
    }
    const cat = await Category.create({ name, label, order: order !== undefined ? Number(order) : 999 });
    res.status(201).json({ success: true, data: cat });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Delete category
router.delete('/:id', protect, async (req, res) => {
  try {
    const cat = await Category.findById(req.params.id);
    if (!cat) return res.status(404).json({ success: false, message: 'Category not found.' });
    await cat.deleteOne();
    res.json({ success: true, message: 'Category deleted successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
