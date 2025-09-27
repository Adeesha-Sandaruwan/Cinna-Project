import express from 'express';
import { createOrder, getOrders, getUserOrders, getOrder, updateOrder } from '../controllers/OrderController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// ---------------------- ORDER ROUTES ---------------------- //

// Create a new order (requires authentication to bind to user)
router.post('/', auth, createOrder);

// Get all orders (admin use case, to see every order)
router.get('/', getOrders);
router.get('/user/:userId', getUserOrders); // legacy param route
router.get('/my', auth, getUserOrders); // current authenticated user's orders
router.get('/:orderId', getOrder);
router.put('/:orderId', updateOrder);

export default router;
