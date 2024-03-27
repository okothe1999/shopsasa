const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const Branch = require('../models/branch');
const Sale = require('../models/sale');
const HeadquarterData = require('../models/headquarterData');
const { checkLowInventory } = require('./branches');

// Get all orders
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new order
router.post('/', async (req, res) => {
  const { customer, products, branch, totalAmount } = req.body;

  try {
    // Store the order in the Orders collection
    const order = new Order({
      customer,
      products,
      branch,
      totalAmount,
    });
    const newOrder = await order.save();

    // Update the branch inventory in the Branches collection
    const updatedBranch = await updateBranchInventory(branch, products);

    // Create a sales record in the Sales collection for the branch
    const sale = new Sale({
      order: newOrder._id,
      branch,
      totalAmount,
      profit: calculateProfit(totalAmount), // Replace with your logic for calculating profit
    });
    await sale.save();

    // Synchronize data with the headquarters
    await synchronizeWithHeadquarters(newOrder, updatedBranch, sale);

    res.status(201).json(newOrder);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update the branch inventory
async function updateBranchInventory(branchId, products) {
  const branch = await Branch.findById(branchId);
  const updatedInventory = branch.inventory.map(item => {
    const product = products.find(p => p.product.toString() === item.product.toString());
    if (product) {
      item.quantity -= product.quantity;
    }
    return item;
  });
  branch.inventory = updatedInventory;
  return await branch.save();
}

// Calculate profit (replace with your logic)
function calculateProfit(totalAmount) {
  // Example: 20% profit
  return totalAmount * 0.8;
}

// Synchronize data with the headquarters
async function synchronizeWithHeadquarters(order, updatedBranch, sale) {
  // Example: Store the data in a separate collection for the headquarters
  const headquarterData = new HeadquarterData({
    order,
    branch: updatedBranch,
    sale,
  });
  await headquarterData.save();
}

async function updateBranchInventory(branchId, products) {
    const branch = await Branch.findById(branchId);
    // ... (existing code)
    const updatedBranch = await branch.save();
  
    // Check for low inventory and trigger re-order signal
    await checkLowInventory(branchId);
  
    return updatedBranch;
  }

module.exports = router;