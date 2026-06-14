const mongoose = require('mongoose');
const Category = require('../models/Category.model');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Seed default categories with specific order
    const defaultCategories = [
      { name: 'soaps', label: 'Soaps', order: 1 },
      { name: 'shampoos', label: 'Shampoos', order: 2 },
      { name: 'face-wash', label: 'Face Wash', order: 3 },
      { name: 'face-packs', label: 'Face Packs', order: 4 },
      { name: 'oils', label: 'Oils', order: 5 },
      { name: 'balms', label: 'Balms', order: 6 }
    ];
    for (const cat of defaultCategories) {
      await Category.findOneAndUpdate(
        { name: cat.name },
        { $set: { label: cat.label, order: cat.order } },
        { upsert: true }
      );
    }
    console.log('Default categories synchronized/seeded successfully.');
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
