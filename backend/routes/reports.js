const express = require('express');
const router = express.Router();
const Branch = require('../models/branch');
const Sale = require('../models/sale');
const HeadquarterData = require('../models/headquarterData');

// Get report for branches
router.get('/branches', async (req, res) => {
  try {
    const branches = await Branch.find().populate('inventory.product');
    const branchReports = await Promise.all(
      branches.map(async (branch) => {
        const sales = await Sale.find({ branch: branch._id });
        const totalSales = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
        const totalProfit = sales.reduce((sum, sale) => sum + sale.profit, 0);
        const lowInventoryProducts = branch.inventory.filter(
          (item) => item.quantity < item.product.reorderThreshold
        );

        return {
          branch: branch.name,
          totalSales,
          totalProfit,
          lowInventoryProducts,
        };
      })
    );

    res.json(branchReports);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get report for headquarters
router.get('/headquarters', async (req, res) => {
  try {
    const headquarterData = await HeadquarterData.find().populate([
      { path: 'order', populate: { path: 'branch' } },
      { path: 'branch' },
      { path: 'sale' },
    ]);

    const totalSales = headquarterData.reduce(
      (sum, data) => sum + data.sale.totalAmount,
      0
    );
    const totalProfit = headquarterData.reduce(
      (sum, data) => sum + data.sale.profit,
      0
    );

    const branchInventories = {};
    headquarterData.forEach((data) => {
      const branchName = data.order.branch.name;
      if (!branchInventories[branchName]) {
        branchInventories[branchName] = [];
      }
      branchInventories[branchName].push(...data.branch.inventory);
    });

    const lowInventoryProducts = Object.entries(branchInventories).flatMap(
      ([branchName, inventory]) =>
        inventory
          .filter((item) => item.quantity < item.product.reorderThreshold)
          .map((item) => ({ branch: branchName, product: item.product.name }))
    );

    res.json({ totalSales, totalProfit, lowInventoryProducts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;