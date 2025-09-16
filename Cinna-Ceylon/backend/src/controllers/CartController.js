import Cart from '../models/Cart.js'; // import Cart model to interact with cart collection
import Product from '../models/Product.js'; // import Product model to validate stock and prices

// Create or Update cart
export const addToCart = async (req, res) => { // controller to add/update items in user's cart
  try { // start try block to handle errors
    const { user, productId, qty } = req.body; // destructure user, productId, and qty from request body
    
    if (!user || !productId || qty === undefined) { // validate required fields are present
      return res.status(400).json({ error: 'Missing required fields: user, productId, qty' }); // return 400 if any field is missing
    }

    if (qty < 0) { // check if quantity is negative
      return res.status(400).json({ error: 'Quantity cannot be negative' }); // return 400 if invalid
    }

    const product = await Product.findById(productId); // find product by ID in database
    if (!product) { // if product not found
      return res.status(404).json({ error: 'Product not found' }); // return 404 error
    }

    const availableStock = Math.max(0, product.stock - product.safetyStock); // calculate available stock = actual stock - safety stock
    if (qty > 0 && availableStock < qty) { // check if requested quantity is greater than available stock
      return res.status(400).json({  // return 400 error if not enough stock
        error: `Insufficient stock available. Available: ${availableStock}, Requested: ${qty}` 
      });
    }

    let cart = await Cart.findOne({ user, status: 'active' }); // find active cart for the user
    if (!cart) { // if no cart exists
      cart = new Cart({ user, items: [] }); // create a new cart with empty items
    }

    const existingItemIndex = cart.items.findIndex(i => i.product.toString() === productId); // check if product already exists in cart
    
    if (qty <= 0) { // if quantity is 0 or negative
      if (existingItemIndex !== -1) { // and product exists in cart
        cart.items.splice(existingItemIndex, 1); // remove the item from cart
      }
    } else {
      if (existingItemIndex !== -1) { // if item already exists
        cart.items[existingItemIndex].qty = qty; // update its quantity
      } else {
        cart.items.push({ product: productId, qty, priceAtAdd: product.price }); // otherwise add as a new item with current product price
      }
    }

    cart.subtotal = cart.items.reduce((sum, i) => sum + i.qty * i.priceAtAdd, 0); // recalculate subtotal by summing qty × priceAtAdd
    cart.total = cart.subtotal; // assign subtotal to total (can be used for discounts/taxes later)

    await cart.save(); // save updated cart to database
    
    const populatedCart = await Cart.findById(cart._id).populate('items.product'); // re-fetch cart with product details populated
    res.json(populatedCart); // return populated cart in response
  } catch (err) { // catch errors
    console.error('Cart error:', err); // log error in console
    res.status(500).json({ error: err.message }); // return 500 with error message
  }
};

// Get user cart
export const getCart = async (req, res) => { // controller to fetch a user's cart
  try { // start try block
    const { userId } = req.params; // extract userId from request parameters
    
    if (!userId) { // if no userId provided
      return res.status(400).json({ error: 'User ID is required' }); // return 400 error
    }

    const cart = await Cart.findOne({ user: userId, status: 'active' }).populate('items.product'); 
    // find active cart for user and populate product details
    
    if (!cart) { // if cart not found
      return res.json({ // return an empty cart object
        user: userId,
        items: [],
        subtotal: 0,
        total: 0,
        status: 'active'
      });
    }
    
    res.json(cart); // return the found cart
  } catch (err) { // catch errors
    console.error('Get cart error:', err); // log error in console
    res.status(500).json({ error: err.message }); // return 500 with error message
  }
};

// Clear cart
export const clearCart = async (req, res) => { // controller to clear user's cart
  try { // start try block
    const { userId } = req.params; // extract userId from request parameters
    
    if (!userId) { // validate userId
      return res.status(400).json({ error: 'User ID is required' }); // return 400 if missing
    }

    const result = await Cart.findOneAndDelete({ user: userId, status: 'active' }); 
    // find and delete user's active cart
    
    if (!result) { // if cart not found
      return res.status(404).json({ error: 'Cart not found' }); // return 404 error
    }
    
    res.json({ message: 'Cart cleared successfully' }); // return success message
  } catch (err) { // catch errors
    console.error('Clear cart error:', err); // log error in console
    res.status(500).json({ error: err.message }); // return 500 with error message
  }
};
