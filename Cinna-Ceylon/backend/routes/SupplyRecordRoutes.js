const express = require('express');
const router = express.Router();
const SupplyRecordController = require('../controllers/SupplyRecordController');

// Create
router.post('/', SupplyRecordController.createSupplyRecord);

// Read all
router.get('/', SupplyRecordController.getAllSupplyRecords);

// Read one
router.get('/:id', SupplyRecordController.getSupplyRecordById);

// Update
router.put('/:id', SupplyRecordController.updateSupplyRecord);

// Delete
router.delete('/:id', SupplyRecordController.deleteSupplyRecord);

module.exports = router;
