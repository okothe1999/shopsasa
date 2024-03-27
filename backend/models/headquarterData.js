// models/headquarterData.js
const mongoose = require('mongoose');

const headquarterDataSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
  sale: { type: mongoose.Schema.Types.ObjectId, ref: 'Sale', required: true },
});

const HeadquarterData = mongoose.model('HeadquarterData', headquarterDataSchema);
module.exports = HeadquarterData;