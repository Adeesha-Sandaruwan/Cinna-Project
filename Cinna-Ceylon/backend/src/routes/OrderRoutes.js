import express from 'express';
import { 
  createOrder, 
  getOrders, 
  getUserOrders, 
  getOrder, 
  updateOrder 
} from '../controllers/OrderController.js';

const router = express.Router();

// ---------------------- ORDER ROUTES ---------------------- //

// Create a new order (usually from a cart at checkout)
router.post('/', createOrder);

// Get all orders (admin use case, to see every order)
router.get('/', getOrders);

// Get all orders placed by a specific user
router.get('/user/:userId', getUserOrders);

// Get details of a single order by its ID
router.get('/:orderId', getOrder);

// Update an existing order (e.g., mark as "shipped", "delivered", etc.)
router.put('/:orderId', updateOrder);

export default router;
