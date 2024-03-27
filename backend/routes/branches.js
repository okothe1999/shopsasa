const express = require('express');
const router = express.Router();
const Branch = require('../models/branch');

// Get all branches
router.get('/', async (req, res) => {
  try {
    const branches = await Branch.find();
    res.json(branches);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new branch
router.post('/', async (req, res) => {
  const branch = new Branch({
    name: req.body.name,
    address: req.body.address,
    coordinates: {
      type: 'Point',
      coordinates: req.body.coordinates,
    },
    inventory: req.body.inventory,
  });

  try {
    const newBranch = await branch.save();
    res.status(201).json(newBranch);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

async function checkLowInventory(branchId) {
    const branch = await Branch.findById(branchId).populate('inventory.product');
    const lowInventoryProducts = branch.inventory.filter(item => item.quantity < item.product.reorderThreshold);
  
    if (lowInventoryProducts.length > 0) {
      // Trigger re-order signal (e.g., send a notification, update a flag, etc.)
      console.log(`Re-order signal triggered for branch ${branch.name}. Low inventory products:`, lowInventoryProducts);
    }
  }
  

module.exports = router;