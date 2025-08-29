import Inventory from '../models/Inventory.js';
import Product from '../models/Product.js';

// Get inventory
export const getInventory = async (req, res) => {
  try {
    const inv = await Inventory.find().populate('product');
    res.json(inv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update stock
export const updateInventory = async (req, res) => {
  try {
    const { productId, change } = req.body; // change can be positive or negative
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    if (product.stock + change < 0) return res.status(400).json({ error: 'Not enough stock' });

    product.stock += change;
    await product.save();

    const inv = await Inventory.create({ product: productId, quantity: product.stock, location: req.body.location });
    res.json(inv);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
