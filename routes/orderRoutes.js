const express = require("express");
const Order = require("../models/Order");
const Product = require("../models/Product");
const authenticate = require("../middlewares/authenticate");

const router = express.Router();
router.use(authenticate);

// router.get("/", async (req, res) => {
//   try {
//     const orders = await Order.find();
//     res.status(200).json(orders);
//   } catch (error) {
//     console.error("Error fetching orders:", error);
//     res.status(500).json({ message: "Error fetching orders" });
//   }
// });

// router.post("/", async (req, res) => {
//   try {
//     const { customerName, address, phoneNumber, paymentMethod, products } =
//       req.body;

//     // Check if paymentMethod is valid
//     if (
//       !paymentMethod ||
//       !["Cash", "Debit Card", "Split Payment"].includes(paymentMethod)
//     ) {
//       return res.status(400).json({ message: "Invalid payment method" });
//     }

//     // Calculate total amount
//     let totalAmount = 0;
//     const productDetails = [];

//     for (const product of products) {
//       const productFound = await Product.findById(product.productId);

//       if (!productFound) {
//         return res
//           .status(404)
//           .json({ message: `Product not found: ${product.productId}` });
//       }

//       const totalPrice = productFound.price * product.quantity;
//       totalAmount += totalPrice;

//       productDetails.push({
//         productId: product.productId,
//         quantity: product.quantity,
//         name: product.name,
//         price: productFound.price,
//         total: totalPrice,
//       });

//       // Update stock quantity
//       productFound.quantity -= product.quantity;
//       if (productFound.quantity <= 0) {
//         productFound.quantity = 0;
//         productFound.status = "Out of Stock";
//       }
//       await productFound.save();
//     }

//     // Create order
//     const newOrder = new Order({
//       customerName,

//       address,
//       phoneNumber,
//       paymentMethod,
//       products: productDetails,
//       totalAmount,
//     });

//     await newOrder.save();

//     res
//       .status(201)
//       .json({ message: "Order created successfully", order: newOrder });
//   } catch (error) {
//     console.error("Error creating order:", error);
//     res.status(500).json({ message: "Error creating order" });
//   }
// });

router.get("/", async (req, res) => {
  try {
    const userId = req.user.id; // Get the authenticated user's ID
    const orders = await Order.find({ user: userId }); // Retrieve orders for the authenticated user
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Error fetching orders" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { customerName, address, phoneNumber, paymentMethod, products } =
      req.body;

    const userId = req.user.id; // Get the authenticated user's ID from the middleware

    let totalAmount = 0;
    const productDetails = [];

    for (const product of products) {
      const productFound = await Product.findById(product.productId);

      if (!productFound) {
        return res
          .status(404)
          .json({ message: `Product not found: ${product.productId}` });
      }

      const totalPrice = productFound.price * product.quantity;
      totalAmount += totalPrice;

      productDetails.push({
        productId: product.productId,
        quantity: product.quantity,
        name: productFound.name,
        price: productFound.price,
        total: totalPrice,
      });

      // Update stock quantity
      productFound.quantity -= product.quantity;
      if (productFound.quantity <= 0) {
        productFound.quantity = 0;
        productFound.status = "Out of Stock";
      }
      await productFound.save();
    }

    // Create order
    const newOrder = new Order({
      customerName,
      address,
      phoneNumber,
      paymentMethod,
      products: productDetails,
      totalAmount,
      user: userId, // Attach the user's ID to the order
    });

    await newOrder.save();

    res
      .status(201)
      .json({ message: "Order created successfully", order: newOrder });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ message: "Error creating order" });
  }
});

module.exports = router;
