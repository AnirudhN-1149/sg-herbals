const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  unit: { type: String, required: true },
  quantity: { type: Number, required: true, default: 0 },
  costPerUnit: { type: Number, required: true, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Inventory', inventorySchema);
