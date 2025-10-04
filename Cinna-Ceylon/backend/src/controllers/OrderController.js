import Order from '../models/Order.js'; // import Order model to interact with orders collection
import Product from '../models/Product.js'; // import Product model to check stock and update it

// Create a new order
export const createOrder = async (req, res) => { // controller to create an order
  try { // start try block for error handling
    const { user, items, total, shippingAddress, paymentMethod } = req.body; // destructure order details from request body

    if (!user || !items || !total) { // check if required fields are missing
      return res.status(400).json({ error: 'Missing required fields' }); // return 400 error if validation fails
    }

    for (const item of items) { // loop through all items in order
      const product = await Product.findById(item.product); // fetch product by ID
      if (!product) { // if product does not exist
        return res.status(404).json({ error: `Product ${item.product} not found` }); // return 404 error
      }

      const availableStock = Math.max(0, product.stock - product.safetyStock); // calculate available stock
      if (availableStock < item.qty) { // check if requested quantity is more than available stock
        return res.status(400).json({  // return 400 error if insufficient stock
          error: `Insufficient stock for ${product.name}. Available: ${availableStock}, Requested: ${item.qty}` 
        });
      }

      product.stock -= item.qty; // reduce product stock by ordered quantity
      await product.save(); // save updated product stock
    }

    const order = await Order.create({ // create new order in database
      user, // user placing order
      items, // ordered items
      total, // total order price
      shippingAddress, // shipping details
      paymentMethod, // payment method
      status: paymentMethod === 'Credit Card' ? 'paid' : 'pending' // auto-set status depending on payment method
    });

    const populatedOrder = await Order.findById(order._id).populate('items.product'); // fetch created order with populated product details
    res.status(201).json(populatedOrder); // send 201 Created response with populated order
  } catch (err) { // catch block for errors
    console.error('Order creation error:', err); // log error to console
    res.status(500).json({ error: err.message }); // return 500 Internal Server Error
  }
};

// Get all orders (for admin)
export const getOrders = async (req, res) => { // controller to fetch all orders
  try {
    const orders = await Order.find().populate('items.product').sort({ createdAt: -1 }); 
    // fetch all orders, populate products, sort by creation date (newest first)
    res.json(orders); // return orders in response
  } catch (err) {
    console.error('Get orders error:', err); // log error to console
    res.status(500).json({ error: err.message }); // return 500 error
  }
};

// Get orders of a specific user
export const getUserOrders = async (req, res) => { // controller to fetch user-specific orders
  try {
    const { userId } = req.params; // extract userId from request parameters
    const orders = await Order.find({ user: userId }).populate('items.product').sort({ createdAt: -1 });
    // find orders for user, populate product details, sort newest first
    res.json(orders); // return user orders
  } catch (err) {
    console.error('Get user orders error:', err); // log error
    res.status(500).json({ error: err.message }); // return 500 error
  }
};

// Get single order by ID
export const getOrder = async (req, res) => { // controller to fetch a single order
  try {
    const { orderId } = req.params; // extract orderId from request parameters
    const order = await Order.findById(orderId).populate('items.product'); // find order by ID and populate products
    
    if (!order) { // if order not found
      return res.status(404).json({ error: 'Order not found' }); // return 404 error
    }
    
    res.json(order); // return found order
  } catch (err) {
    console.error('Get order error:', err); // log error
    res.status(500).json({ error: err.message }); // return 500 error
  }
};

// Update order
export const updateOrder = async (req, res) => { // controller to update an order
  try {
    const { orderId } = req.params; // extract orderId from request parameters
    const updateData = req.body; // extract fields to update from request body
    
    const order = await Order.findByIdAndUpdate( // find order and update it
      orderId, // order ID to update
      updateData, // new data
      { new: true, runValidators: true } // return updated document and run schema validators
    ).populate('items.product'); // populate product details in updated order
    
    if (!order) { // if no order found
      return res.status(404).json({ error: 'Order not found' }); // return 404 error
    }
    
    res.json(order); // return updated order
  } catch (err) {
    console.error('Update order error:', err); // log error
    res.status(500).json({ error: err.message }); // return 500 error
  }
};
// Delete order
export const deleteOrder = async (req, res) => { // controller to delete an order
  try {
    const { orderId } = req.params; // extract orderId from request parameters
    const order = await Order.findByIdAndDelete(orderId); // find and delete order by ID

    if (!order) { // if no order found
      return res.status(404).json({ error: 'Order not found' }); // return 404 error
    }

    res.json({ message: 'Order deleted successfully' }); // return success message
  } catch (err) {
    console.error('Delete order error:', err); // log error
    res.status(500).json({ error: err.message }); // return 500 error
  }
};