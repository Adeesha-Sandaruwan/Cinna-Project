import Order from '../models/Order.js';
import Product from '../models/Product.js';

// Create order
export const createOrder = async (req, res) => {
  try {
    // Extract fields from request body (user is derived from auth if available)
    const { user: userFromBody, items, total, shippingAddress, paymentMethod } = req.body;

    // Prefer authenticated user id; fallback to provided userFromBody (legacy behavior)
    const userId = req.user?.id || userFromBody;

    // Validate required fields
    if (!userId || !items || !total) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check stock for each product item (skip offers/bundles if no "product" field)
    for (const item of items) {
      if (!item.product) continue;

      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ error: `Product ${item.product} not found` });
      }

      // Ensure stock is available considering safetyStock
      const availableStock = Math.max(0, product.stock - product.safetyStock);
      if (availableStock < item.qty) {
        return res.status(400).json({
          error: `Insufficient stock for ${product.name}. Available: ${availableStock}, Requested: ${item.qty}`
        });
      }

      // Deduct stock if order can be placed
      product.stock -= item.qty;
      await product.save();
    }

    // Create the order in DB
    const order = await Order.create({
      user: userId,
      items,
      total,
      shippingAddress,
      paymentMethod,
      status: paymentMethod === 'Credit Card' ? 'paid' : 'pending' // Auto-mark paid if CC
    });

    // Populate product details and user info for frontend
    const populatedOrder = await Order.findById(order._id)
      .populate('items.product')
      .populate({ path: 'user', select: '_id username email userType' });

    res.status(201).json(populatedOrder);

  } catch (err) {
    console.error('Order creation error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get all orders (admin use)
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('items.product') // Include product details
      .populate({ path: 'user', select: '_id username email userType' })
      .sort({ createdAt: -1 }); // Latest first
    res.json(orders);
  } catch (err) {
    console.error('Get orders error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get all orders of a specific user
export const getUserOrders = async (req, res) => {
  try {
    const { userId } = req.params; // legacy param route
    const effectiveUserId = userId || req.user?.id;
    if (!effectiveUserId) return res.status(400).json({ error: 'User id missing' });
    const orders = await Order.find({ user: effectiveUserId })
      .populate('items.product')
      .populate({ path: 'user', select: '_id username email userType' })
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error('Get user orders error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get details of a single order
export const getOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId)
      .populate('items.product')
      .populate({ path: 'user', select: '_id username email userType' });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (err) {
    console.error('Get order error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Update an order
export const updateOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const updateData = req.body;

    // Optional: validate stock again if items are being updated
    if (updateData.items) {
      for (const item of updateData.items) {
        if (!item.product) continue;

        const product = await Product.findById(item.product);
        if (!product) {
          return res.status(404).json({ error: `Product ${item.product} not found` });
        }

        const availableStock = Math.max(0, product.stock - product.safetyStock);
        if (availableStock < item.qty) {
          return res.status(400).json({
            error: `Insufficient stock for ${product.name}. Available: ${availableStock}, Requested: ${item.qty}`
          });
        }
      }
    }

    // Update order with new data
    const order = await Order.findByIdAndUpdate(orderId, updateData, {
      new: true,          // Return updated document
      runValidators: true // Ensure schema validation runs
    }).populate('items.product');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (err) {
    console.error('Update order error:', err);
    res.status(500).json({ error: err.message });
  }
};
