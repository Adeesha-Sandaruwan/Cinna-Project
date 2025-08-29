import express from 'express';
import { getInventory, updateInventory } from '../controllers/InventoryController.js';

const router = express.Router();

router.get('/', getInventory);
router.post('/', updateInventory);

export default router;
