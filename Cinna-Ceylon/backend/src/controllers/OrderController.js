import Order from '../models/Order.js';
import Product from '../models/Product.js';

// Create order
export const createOrder = async (req, res) => {
  try {
    const { user, items } = req.body;

    // check stock
    for (let i of items) {
      const product = await Product.findById(i.product);
      if (!product) return res.status(404).json({ error: `Product not found: ${i.product}` });
      if (product.stock < i.qty) {
        return res.status(400).json({ error: `Not enough stock for ${product.name}` });
      }
    }

    // reduce stock
    for (let i of items) {
      await Product.findByIdAndUpdate(i.product, { $inc: { stock: -i.qty } });
    }

    const total = items.reduce((sum, i) => sum + i.qty * i.price, 0);
    const order = await Order.create({ user, items, total, status: 'pending' });

    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get orders
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('items.product');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
