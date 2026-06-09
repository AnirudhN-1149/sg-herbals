const mongoose = require('mongoose');
const Category = require('../models/Category.model');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Seed default categories
    const count = await Category.countDocuments();
    if (count === 0) {
      const defaultCategories = [
        { name: 'soaps', label: 'Soaps' },
        { name: 'shampoos', label: 'Shampoos' },
        { name: 'oils', label: 'Oils' },
        { name: 'balms', label: 'Balms' },
        { name: 'face-packs', label: 'Face Packs' },
        { name: 'face-wash', label: 'Face Wash' }
      ];
      await Category.insertMany(defaultCategories);
      console.log('Default categories seeded successfully.');
    }
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
