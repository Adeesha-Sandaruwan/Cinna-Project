import Order from '../models/Order.js'; // import Order model to interact with orders collection
import Product from '../models/Product.js'; // import Product model to check stock and update it

// Create order
export const createOrder = async (req, res) => {
  try {
    const { user, items, total, shippingAddress, paymentMethod } = req.body;

    // Simple validation
    if (!user || !items || !total) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check stock availability and update product stock levels
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ error: `Product ${item.product} not found` });
      }

      // Check available stock (actual stock - safety stock)
      const availableStock = Math.max(0, product.stock - product.safetyStock);
      if (availableStock < item.qty) {
        return res.status(400).json({ 
          error: `Insufficient stock for ${product.name}. Available: ${availableStock}, Requested: ${item.qty}` 
        });
      }

      // Update product stock
      product.stock -= item.qty;
      await product.save();
    }

    // Create order
    const order = await Order.create({
      user,
      items,
      total,
      shippingAddress,
      paymentMethod,
      status: paymentMethod === 'Credit Card' ? 'paid' : 'pending'
    });

    // Populate product details
    const populatedOrder = await Order.findById(order._id).populate('items.product');
    res.status(201).json(populatedOrder);
  } catch (err) {
    console.error('Order creation error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get all orders (admin)
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('items.product').sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error('Get orders error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get user orders
export const getUserOrders = async (req, res) => {
  try {
    const { userId } = req.params;
    const orders = await Order.find({ user: userId }).populate('items.product').sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error('Get user orders error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get single order
export const getOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId).populate('items.product');
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json(order);
  } catch (err) {
    console.error('Get order error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Update order
export const updateOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const updateData = req.body;
    
    const order = await Order.findByIdAndUpdate(
      orderId,
      updateData,
      { new: true, runValidators: true }
    ).populate('items.product');
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json(order);
  } catch (err) {
    console.error('Update order error:', err);
    res.status(500).json({ error: err.message });
  }
};
