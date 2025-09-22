import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import Offer from '../models/Offer.js'; // Import Offer model

// Create or update cart for regular products
export const addToCart = async (req, res) => {
  try {
    // Destructure values sent in the request body
    const { user, productId, qty, priceAtAdd } = req.body;

    // Validate required fields
    if (!user || !productId || qty === undefined) { 
      return res.status(400).json({ error: 'Missing required fields: user, productId, qty' });
    }

    // Prevent negative quantity
    if (qty < 0) {
      return res.status(400).json({ error: 'Quantity cannot be negative' });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Calculate available stock (considering safety stock)
    const availableStock = Math.max(0, product.stock - product.safetyStock);
    if (qty > 0 && availableStock < qty) {
      return res.status(400).json({ 
        error: `Insufficient stock available. Available: ${availableStock}, Requested: ${qty}` 
      });
    }

    // Find active cart or create a new one
    let cart = await Cart.findOne({ user, status: 'active' });
    if (!cart) {
      cart = new Cart({ user, items: [], offerItems: [] });
    }

    // Check if product already exists in the cart
    const existingItemIndex = cart.items.findIndex(i => i.product.toString() === productId);

    // Use given price or default product price
    const finalPrice = priceAtAdd !== undefined ? priceAtAdd : product.price;

    if (qty <= 0) {
      // Remove item if qty is 0 or negative
      if (existingItemIndex !== -1) {
        cart.items.splice(existingItemIndex, 1);
      }
    } else {
      if (existingItemIndex !== -1) {
        // Update existing item
        cart.items[existingItemIndex].qty = qty;
        cart.items[existingItemIndex].priceAtAdd = finalPrice;
      } else {
        // Add new item to cart
        cart.items.push({ product: productId, qty, priceAtAdd: finalPrice });
      }
    }

    // Recalculate totals
    const productSubtotal = cart.items.reduce((sum, i) => sum + i.qty * i.priceAtAdd, 0);
    const offerSubtotal = cart.offerItems.reduce((sum, i) => sum + i.qty * i.discountedPrice, 0);
    cart.subtotal = productSubtotal + offerSubtotal;
    cart.total = cart.subtotal;

    // Save cart
    await cart.save();

    // Populate product and offer details for response
    const populatedCart = await Cart.findById(cart._id)
      .populate('items.product')
      .populate('offerItems.offer');
      
    res.json(populatedCart);

  } catch (err) {
    console.error('Cart error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Add or update offer in cart (NO comments as requested)
export const addOfferToCart = async (req, res) => {
  try {
    const { user, offerId, qty } = req.body;

    if (!user || !offerId || qty === undefined) {
      return res.status(400).json({ error: 'Missing required fields: user, offerId, qty' });
    }

    if (qty < 0) {
      return res.status(400).json({ error: 'Quantity cannot be negative' });
    }

    const offer = await Offer.findById(offerId).populate('products');
    if (!offer) {
      return res.status(404).json({ error: 'Offer not found' });
    }

    if (offer.status !== 'Active') {
      return res.status(400).json({ error: 'This offer is no longer available' });
    }

    for (const product of offer.products) {
      const availableStock = Math.max(0, product.stock - product.safetyStock);
      if (availableStock < qty) {
        return res.status(400).json({ 
          error: `Insufficient stock for ${product.name}. Available: ${availableStock}, Requested: ${qty}` 
        });
      }
    }

    let cart = await Cart.findOne({ user, status: 'active' });
    if (!cart) {
      cart = new Cart({ user, items: [], offerItems: [] });
    }

    const existingOfferIndex = cart.offerItems.findIndex(i => i.offer.toString() === offerId);
    const originalPrice = offer.products.reduce((sum, product) => sum + product.price, 0);

    if (qty <= 0) {
      if (existingOfferIndex !== -1) {
        cart.offerItems.splice(existingOfferIndex, 1);
      }
    } else {
      if (existingOfferIndex !== -1) {
        cart.offerItems[existingOfferIndex].qty = qty;
      } else {
        cart.offerItems.push({ 
          offer: offerId, 
          qty, 
          discountedPrice: offer.discountedPrice,
          originalPrice: originalPrice
        });
      }
    }

    const productSubtotal = cart.items.reduce((sum, i) => sum + i.qty * i.priceAtAdd, 0);
    const offerSubtotal = cart.offerItems.reduce((sum, i) => sum + i.qty * i.discountedPrice, 0);
    cart.subtotal = productSubtotal + offerSubtotal;
    cart.total = cart.subtotal;

    await cart.save();

    const populatedCart = await Cart.findById(cart._id)
      .populate('items.product')
      .populate('offerItems.offer');
      
    res.json(populatedCart);

  } catch (err) {
    console.error('Offer cart error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get user cart
export const getCart = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Find active cart for user
    const cart = await Cart.findOne({ user: userId, status: 'active' })
      .populate('items.product')
      .populate('offerItems.offer');

    // Return empty cart if none found
    if (!cart) {
      return res.json({
        user: userId,
        items: [],
        offerItems: [],
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

    // Validate
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Delete active cart
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
