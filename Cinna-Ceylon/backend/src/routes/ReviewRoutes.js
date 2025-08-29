import express from 'express';
import { createReview, getReviews } from '../controllers/ReviewController.js';

const router = express.Router();

router.post('/', createReview);
router.get('/', getReviews);

export default router;
