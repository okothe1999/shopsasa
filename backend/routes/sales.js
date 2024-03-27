const express = require('express');
const router = express.Router();
const Sale = require('../models/sale');

// Get all sales
router.get('/', async (req, res) => {
  try {
    const sales = await Sale.find();
    res.json(sales);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new sale
router.post('/', async (req, res) => {
  const sale = new Sale({
    order: req.body.order,
    branch: req.body.branch,
    totalAmount: req.body.totalAmount,
    profit: req.body.profit,
  });

  try {
    const newSale = await sale.save();
    res.status(201).json(newSale);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;