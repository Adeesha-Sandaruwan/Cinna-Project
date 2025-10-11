
import express from 'express';
import * as userController from '../controllers/userController.js';
import auth from '../middleware/auth.js';
import isAdmin from '../middleware/isAdmin.js';
const router = express.Router();

// Register
router.post('/register', userController.register);
// Login
router.post('/login', userController.login);

// Profile (protected)
router.get('/profile', auth, userController.profile);
// Update own profile
router.put('/profile', auth, userController.updateProfile);
// Delete own profile
router.delete('/profile', auth, userController.deleteProfile);

// Get all suppliers
router.get('/suppliers', userController.getSuppliers);

// Get a single supplier by ID
router.get('/suppliers/:id', userController.getSupplierById);

// Example admin-only route
router.get('/admin-only', auth, isAdmin, (req, res) => {
	res.json({ message: 'Welcome, admin user!' });
});

export default router;
