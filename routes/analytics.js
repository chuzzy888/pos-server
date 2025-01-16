const express = require("express");
const Order = require("../models/Order");
const Product = require("../models/Product");
const authenticate = require("../middlewares/authenticate");

const router = express.Router();
router.use(authenticate);

// Total sales
router.get("/total-sales", async (req, res) => {
  try {
    const userId = req.user.id; // Get the authenticated user's ID
    const orders = await Order.find({ user: userId }); // Filter by user
    const totalSales = orders.reduce(
      (acc, order) => acc + order.totalAmount,
      0
    );
    res.status(200).json({ totalSales });
  } catch (error) {
    console.error("Error fetching total sales:", error);
    res.status(500).json({ message: "Error fetching total sales" });
  }
});

// Product category distribution
router.get("/category-distribution", async (req, res) => {
  try {
    const userId = req.user.id; // Get the authenticated user's ID
    const products = await Product.find({ user: userId }); // Filter by user
    const categoryDistribution = products.reduce((acc, product) => {
      acc[product.category] = (acc[product.category] || 0) + product.quantity;
      return acc;
    }, {});
    res.status(200).json({ categoryDistribution });
  } catch (error) {
    console.error("Error fetching category distribution:", error);
    res.status(500).json({ message: "Error fetching category distribution" });
  }
});

// Top-selling products
router.get("/top-products", async (req, res) => {
  try {
    const userId = req.user.id; // Get the authenticated user's ID
    const orders = await Order.find({ user: userId }); // Filter by user
    const productSales = {};

    orders.forEach(order => {
      order.products.forEach(product => {
        productSales[product.name] =
          (productSales[product.name] || 0) + product.quantity;
      });
    });

    const sortedProducts = Object.entries(productSales)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5) // Top 5 products
      .map(([name, quantity]) => ({ name, quantity }));

    res.status(200).json({ topProducts: sortedProducts });
  } catch (error) {
    console.error("Error fetching top products:", error);
    res.status(500).json({ message: "Error fetching top products" });
  }
});

// Monthly sales
router.get("/monthly-sales", async (req, res) => {
  try {
    const userId = req.user.id; // Get the authenticated user's ID
    const orders = await Order.find({ user: userId }); // Filter by user
    const monthlySales = orders.reduce((acc, order) => {
      const month = new Date(order.createdAt).toLocaleString("default", {
        month: "short",
      });
      acc[month] = (acc[month] || 0) + order.totalAmount;
      return acc;
    }, {});

    res.status(200).json({ monthlySales });
  } catch (error) {
    console.error("Error fetching monthly sales:", error);
    res.status(500).json({ message: "Error fetching monthly sales" });
  }
});

module.exports = router;
