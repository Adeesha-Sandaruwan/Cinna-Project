const express = require('express');
const router = express.Router();
const CartController = require('../controllers/CartController');

router.post('/', CartController.createCart);
router.get('/', CartController.getAllCarts);
router.get('/:id', CartController.getCartById);
router.put('/:id', CartController.updateCart);
router.delete('/:id', CartController.deleteCart);

module.exports = router;
