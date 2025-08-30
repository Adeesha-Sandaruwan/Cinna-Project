import Product from "../models/Product.js";

// ✅ Create product
export const createProduct = async (req, res) => {
  try {
    const data = req.body;

    // Validation for expiry date
    if (data.expiryDate) {
      const today = new Date();
      const expDate = new Date(data.expiryDate);
      if (expDate < today.setHours(0, 0, 0, 0)) {
        return res.status(400).json({ error: "Expiry date must be today or later" });
      }
    }

    if (req.file) {
      data.image = req.file.filename; // save uploaded filename
    }

    const product = await Product.create(data);
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ✅ Get all products
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort("-createdAt");
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get single product
export const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Update product (with image option)
export const updateProduct = async (req, res) => {
  try {
    const data = req.body;
    if (req.file) {
      data.image = req.file.filename;
    }
    if (data.expiryDate) {
      const today = new Date();
      const expDate = new Date(data.expiryDate);
      if (expDate < today.setHours(0, 0, 0, 0)) {
        return res.status(400).json({ error: "Expiry date must be today or later" });
      }
    }

    const product = await Product.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!product) return res.status(404).json({ error: "Not found" });
    res.json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ✅ Delete product
export const deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
