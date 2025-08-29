import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

// Create/Update cart
export const addToCart = async (req, res) => {
  try {
    const { user, productId, qty } = req.body;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    let cart = await Cart.findOne({ user, status: 'active' });
    if (!cart) cart = new Cart({ user, items: [] });

    const existingItem = cart.items.find(i => i.product.toString() === productId);
    if (existingItem) {
      existingItem.qty += qty;
    } else {
      cart.items.push({ product: productId, qty, priceAtAdd: product.price });
    }

    // recalc totals
    cart.subtotal = cart.items.reduce((sum, i) => sum + i.qty * i.priceAtAdd, 0);
    cart.total = cart.subtotal;

    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get user cart
export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.params.userId, status: 'active' }).populate('items.product');
    res.json(cart || { message: 'Cart is empty' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Clear cart
export const clearCart = async (req, res) => {
  try {
    await Cart.findOneAndDelete({ user: req.params.userId, status: 'active' });
    res.json({ message: 'Cart cleared' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
