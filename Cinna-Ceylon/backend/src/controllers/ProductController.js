import Product from '../models/Product.js';

// Create product
export const createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all products (with optional filters)
export const getProducts = async (req, res) => {
  try {
    const { search, type, grade, minStock, visibility, expired } = req.query;
    const q = {};
    if (search) q.$or = [{ name: new RegExp(search, 'i') }, { sku: new RegExp(search, 'i') }];
    if (type) q.type = type;
    if (grade) q.grade = grade;
    if (visibility) q.visibility = visibility;
    if (minStock) q.stock = { $gte: Number(minStock) };
    if (expired === 'true') q.expiryDate = { $lt: new Date() };

    const products = await Product.find(q).sort('-createdAt');
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get single product
export const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update product
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) return res.status(404).json({ error: 'Not found' });
    res.json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete product
export const deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
