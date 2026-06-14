const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  label: { type: String, required: true, trim: true },
  order: { type: Number, default: 999 }
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);
