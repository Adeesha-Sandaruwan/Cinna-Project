import express from 'express';
import { addToCart, getCart, clearCart } from '../controllers/CartController.js';

const router = express.Router();

// ---------------------- CART ROUTES ---------------------- //

// Add an item to the cart (creates a cart if it doesn’t exist for the user)
// - Body typically contains: userId, productId, qty
router.post('/', addToCart);

// Get the cart for a specific user by userId
router.get('/:userId', getCart);

// Clear (empty) the cart for a specific user
router.delete('/:userId', clearCart);

export default router;
