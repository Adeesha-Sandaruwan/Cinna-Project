import express from 'express';
import { createReview, getReviews, getReview, updateReview, deleteReview } from '../controllers/ReviewController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Create requires authentication (user must be logged in)
router.post('/', auth, createReview);
router.get('/', getReviews);
router.get('/:id', getReview);
// Update and delete require authentication
router.put('/:id', auth, updateReview);
router.delete('/:id', auth, deleteReview);

export default router;
