import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import Offer from '../models/Offer.js'; // Import Offer model

// Create or update cart for regular products
export const addToCart = async (req, res) => {
  try {
    const { user, productId, qty, priceAtAdd } = req.body;

    // Validate required fields
    if (!user || !productId || qty === undefined) {
      return res.status(400).json({ error: 'Missing required fields: user, productId, qty' });
    }

    if (qty < 0) {
      return res.status(400).json({ error: 'Quantity cannot be negative' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check available stock
    const availableStock = Math.max(0, product.stock - product.safetyStock);
    if (qty > 0 && availableStock < qty) {
      return res.status(400).json({ 
        error: `Insufficient stock available. Available: ${availableStock}, Requested: ${qty}` 
      });
    }

    let cart = await Cart.findOne({ user, status: 'active' });
    if (!cart) {
      cart = new Cart({ user, items: [], offerItems: [] });
    }

    const existingItemIndex = cart.items.findIndex(i => i.product.toString() === productId);
    const finalPrice = priceAtAdd !== undefined ? priceAtAdd : product.price;

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
    const productSubtotal = cart.items.reduce((sum, i) => sum + i.qty * i.priceAtAdd, 0);
    const offerSubtotal = cart.offerItems.reduce((sum, i) => sum + i.qty * i.discountedPrice, 0);
    cart.subtotal = productSubtotal + offerSubtotal;
    cart.total = cart.subtotal;

    await cart.save();

    // Populate product and offer details before sending response
    let populatedCart = await Cart.findById(cart._id)
      .populate('items.product')
      .populate({
        path: 'offerItems.offer',
        populate: { path: 'products' }
      });

    // For each offerItem, copy the populated products array to offerItem.products for frontend convenience
    if (populatedCart && populatedCart.offerItems) {
      populatedCart.offerItems = populatedCart.offerItems.map(oi => {
        const offer = oi.offer;
        return {
          ...oi.toObject(),
          offer: {
            ...offer.toObject(),
            products: offer.products || []
          }
        };
      });
    }

    res.json(populatedCart);

  } catch (err) {
    console.error('Cart error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Add or update offer in cart
export const addOfferToCart = async (req, res) => {
  try {
    const { user, offerId, qty } = req.body;

    // Validate required fields
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

    // Check if offer is active
    if (offer.status !== 'Active') {
      return res.status(400).json({ error: 'This offer is no longer available' });
    }

    // Check stock for all products in the offer
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
      // Remove offer if quantity is 0 or negative
      if (existingOfferIndex !== -1) {
        cart.offerItems.splice(existingOfferIndex, 1);
      }
    } else {
      if (existingOfferIndex !== -1) {
        // Update existing offer quantity
        cart.offerItems[existingOfferIndex].qty = qty;
      } else {
        // Add new offer
        cart.offerItems.push({ 
          offer: offerId, 
          qty, 
          discountedPrice: offer.discountedPrice,
          originalPrice: originalPrice
        });
      }
    }

    // Recalculate totals
    const productSubtotal = cart.items.reduce((sum, i) => sum + i.qty * i.priceAtAdd, 0);
    const offerSubtotal = cart.offerItems.reduce((sum, i) => sum + i.qty * i.discountedPrice, 0);
    cart.subtotal = productSubtotal + offerSubtotal;
    cart.total = cart.subtotal;

    await cart.save();

    // Populate product and offer details before sending response
    let populatedCart = await Cart.findById(cart._id)
      .populate('items.product')
      .populate({
        path: 'offerItems.offer',
        populate: { path: 'products' }
      });

    // For each offerItem, copy the populated products array to offerItem.products for frontend convenience
    if (populatedCart && populatedCart.offerItems) {
      populatedCart.offerItems = populatedCart.offerItems.map(oi => {
        const offer = oi.offer;
        return {
          ...oi.toObject(),
          offer: {
            ...offer.toObject(),
            products: offer.products || []
          }
        };
      });
    }

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

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    let cart = await Cart.findOne({ user: userId, status: 'active' })
      .populate('items.product')
      .populate({
        path: 'offerItems.offer',
        populate: { path: 'products' }
      });

    // For each offerItem, copy the populated products array to offerItem.products for frontend convenience
    if (cart && cart.offerItems) {
      cart.offerItems = cart.offerItems.map(oi => {
        const offer = oi.offer;
        return {
          ...oi.toObject(),
          offer: {
            ...offer.toObject(),
            products: offer.products || []
          }
        };
      });
    }

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