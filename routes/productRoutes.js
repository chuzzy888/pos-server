const express = require("express");
const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const Product = require("../models/Product");
const authenticate = require("../middlewares/authenticate");

const router = express.Router(); // Use the router object here
router.use(authenticate);
// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Set up multer-storage-cloudinary to store images in Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "products", // Cloudinary folder where images will be stored
    allowed_formats: ["jpg", "jpeg", "png", "gif"], // Allowed formats for images
    transformation: [{ width: 500, height: 500, crop: "limit" }], // Image transformations (optional)
  },
});

const upload = multer({ storage: storage });

// Add a new product
// router.post("/add", upload.single("image"), async (req, res) => {
//   // Use router.post instead of app.post
//   try {
//     const { name, price, quantity, category } = req.body;
//     const image = req.file?.path; // Assuming Cloudinary image URL is stored in `req.file.path`

//     const newProduct = new Product({
//       name,
//       price,
//       quantity,
//       image,
//       category,
//     });

//     await newProduct.save();

//     res
//       .status(200)
//       .json({ message: "Product added successfully", product: newProduct });
//   } catch (error) {
//     console.error("Error adding product:", error);
//     res.status(500).json({ message: "Error adding product" });
//   }
// });

router.post("/add", upload.single("image"), async (req, res) => {
  try {
    const { name, price, quantity, category } = req.body;
    const image = req.file?.path; // Cloudinary image URL
    const userId = req.user.id; // Assuming `req.user` contains the authenticated user's details

    const newProduct = new Product({
      name,
      price,
      quantity,
      image,
      category,
      user: userId,
    });

    await newProduct.save();

    res
      .status(200)
      .json({ message: "Product added successfully", product: newProduct });
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({ message: "Error adding product" });
  }
});

// Get all products
// router.get("/", async (req, res) => {
//   try {
//     const products = await Product.find(); // Fetch all products
//     res
//       .status(200)
//       .json({ message: "Products retrieved successfully", products });
//   } catch (error) {
//     console.error("Error fetching products:", error);
//     res.status(500).json({ message: "Error fetching products" });
//   }
// });
router.get("/", async (req, res) => {
  try {
    const userId = req.user.id; // Get the logged-in user's ID
    const products = await Product.find({ user: userId }); // Fetch only the user's products
    res
      .status(200)
      .json({ message: "Products retrieved successfully", products });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Error fetching products" });
  }
});

// Get products by category
router.get("/category/:category", async (req, res) => {
  try {
    const { category } = req.params;
    const products = await Product.find({ category }); // Filter by category
    res.status(200).json({
      message: `Products in category '${category}' retrieved successfully`,
      products,
    });
  } catch (error) {
    console.error("Error fetching products by category:", error);
    res.status(500).json({ message: "Error fetching products by category" });
  }
});

// Restock product
router.put("/restock/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({ message: "Invalid restock quantity" });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    product.quantity += quantity;
    if (product.quantity > 0) {
      product.status = "In Stock";
    }

    await product.save();

    res
      .status(200)
      .json({ message: "Product restocked successfully", product });
  } catch (error) {
    console.error("Error restocking product:", error);
    res.status(500).json({ message: "Error restocking product" });
  }
});

// Delete product
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Use findByIdAndDelete to delete the product by ID
    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: "Error deleting product" });
  }
});

module.exports = router;
