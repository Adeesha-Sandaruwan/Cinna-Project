import express from 'express';
import { getAllOffers, getOffer, createOffer, updateOffer, deleteOffer } from '../controllers/offerController.js';

const router = express.Router();

// GET /api/offers - Get all offers
router.get('/', getAllOffers);

// GET /api/offers/:id - Get single offer
router.get('/:id', getOffer);

// POST /api/offers - Create new offer
router.post('/', createOffer);

// PUT /api/offers/:id - Update offer
router.put('/:id', updateOffer);

// DELETE /api/offers/:id - Delete offer
router.delete('/:id', deleteOffer);

export default router;