import Cart from '../models/Cart.js'; // import Cart model to interact with cart collection
import Product from '../models/Product.js'; // import Product model to validate stock and prices

// Create or update cart
export const addToCart = async (req, res) => {
  try {
    const { user, productId, qty, priceAtAdd } = req.body;

    // Validate required fields
    if (!user || !productId || qty === undefined) {
      return res.status(400).json({ error: 'Missing required fields: user, productId, qty' });
    }

    // Validate quantity
    if (qty < 0) {
      return res.status(400).json({ error: 'Quantity cannot be negative' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check available stock (actual stock - safety stock)
    const availableStock = Math.max(0, product.stock - product.safetyStock);
    if (qty > 0 && availableStock < qty) {
      return res.status(400).json({ 
        error: `Insufficient stock available. Available: ${availableStock}, Requested: ${qty}` 
      });
    }

    let cart = await Cart.findOne({ user, status: 'active' });
    if (!cart) {
      cart = new Cart({ user, items: [] });
    }

    const existingItemIndex = cart.items.findIndex(i => i.product.toString() === productId);

    const finalPrice = priceAtAdd !== undefined ? priceAtAdd : product.price; // use discounted price if provided

    if (qty <= 0) {
      // Remove item if quantity is 0 or negative
      if (existingItemIndex !== -1) {
        cart.items.splice(existingItemIndex, 1);
      }
    } else {
      if (existingItemIndex !== -1) {
        // Update existing item quantity & price
        cart.items[existingItemIndex].qty = qty;
        cart.items[existingItemIndex].priceAtAdd = finalPrice;
      } else {
        // Add new item
        cart.items.push({ product: productId, qty, priceAtAdd: finalPrice });
      }
    }

    // Recalculate totals
    cart.subtotal = cart.items.reduce((sum, i) => sum + i.qty * i.priceAtAdd, 0);
    cart.total = cart.subtotal;

    await cart.save();

    // Populate product details before sending response
    const populatedCart = await Cart.findById(cart._id).populate('items.product');
    res.json(populatedCart);

  } catch (err) {
    console.error('Cart error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get user cart
export const getCart = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const cart = await Cart.findOne({ user: userId, status: 'active' }).populate('items.product');

    if (!cart) {
      return res.json({
        user: userId,
        items: [],
        subtotal: 0,
        total: 0,
        status: 'active'
      });
    }

    res.json(cart);

  } catch (err) {
    console.error('Get cart error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Clear cart
export const clearCart = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const result = await Cart.findOneAndDelete({ user: userId, status: 'active' });

    if (!result) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    res.json({ message: 'Cart cleared successfully' });

  } catch (err) {
    console.error('Clear cart error:', err);
    res.status(500).json({ error: err.message });
  }
};
