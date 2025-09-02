import express from 'express';
import { createOrder, getOrders, getUserOrders, getOrder, updateOrder } from '../controllers/OrderController.js';

const router = express.Router();

router.post('/', createOrder);
router.get('/', getOrders);
router.get('/user/:userId', getUserOrders);
router.get('/:orderId', getOrder);
router.put('/:orderId', updateOrder);

export default router;
