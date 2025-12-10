const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  price: { type: Number, required: true, min: 0 },
  imageUrl: { type: String, default: '' },
  tags: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('Item', ItemSchema);