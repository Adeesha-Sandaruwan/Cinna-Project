import express from 'express';
import { addToCart, getCart, clearCart, addOfferToCart } from '../controllers/CartController.js';

const router = express.Router();

// ---------------------- CART ROUTES ---------------------- //

// Add a product to the cart
router.post('/', addToCart);

// Add an offer to the cart
router.post('/offer', addOfferToCart);

// Get the cart for a specific user by userId
router.get('/:userId', getCart);

// Clear (empty) the cart for a specific user
router.delete('/:userId', clearCart);

export default router;