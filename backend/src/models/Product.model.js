const mongoose = require('mongoose');

const ingredientSchema = new mongoose.Schema({
  name: String,
  benefit: String,
});

const howToUseSchema = new mongoose.Schema({
  step: String,
  detail: String,
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  subtitle: { type: String, trim: true },
  category: {
    type: String,
    required: true,
  },
  stock: { type: Number },
  sizes: [{
    label: { type: String, required: true },
    price: { type: Number, required: true }
  }],
  tags: [{ type: String }],
  description: { type: String },
  ingredients: [ingredientSchema],
  howToUse: [howToUseSchema],
  image: { type: String }, // Cloudinary URL
  images: [{ type: String }], // Cloudinary URLs array
  imagePublicIds: [{ type: String }], // Cloudinary public IDs for deletion
  badges: [{ type: String }],
  reviews: { type: Number, default: 0 },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  sold: { type: String },
  isActive: { type: Boolean, default: true }, // visibility toggle
  isFeatured: { type: Boolean, default: false },
  isNewArrival: { type: Boolean, default: false },
  isBestSeller: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
