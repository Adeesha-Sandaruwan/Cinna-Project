import express from 'express';
import { addToCart, getCart, clearCart } from '../controllers/CartController.js';

const router = express.Router();

router.post('/', addToCart);
router.get('/:userId', getCart);
router.delete('/:userId', clearCart);

export default router;
