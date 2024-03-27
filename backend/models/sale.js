const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
  totalAmount: { type: Number, required: true },
  profit: { type: Number, required: true },
});

const Sale = mongoose.model('Sale', saleSchema);
module.exports = Sale;