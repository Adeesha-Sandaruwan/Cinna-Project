import express from 'express';
import { createOrder, getOrders, getUserOrders, getOrder, updateOrder } from '../controllers/OrderController.js';

const router = express.Router();

// ---------------------- ORDER ROUTES ---------------------- //

// Create a new order (usually from a cart at checkout)
router.post('/', createOrder);

// Get all orders (admin use case, to see every order)
router.get('/', getOrders);
router.get('/user/:userId', getUserOrders);
router.get('/:orderId', getOrder);
router.put('/:orderId', updateOrder);

export default router;
