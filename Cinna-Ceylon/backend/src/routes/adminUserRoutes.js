import express from 'express';
import * as adminUserController from '../controllers/adminUserController.js';
import auth from '../middleware/auth.js';
import isAdmin from '../middleware/isAdmin.js';
const router = express.Router();

// All routes are protected and admin-only
router.use(auth, isAdmin);

// Get all users
router.get('/', adminUserController.getAllUsers);
// Create user
router.post('/', adminUserController.createUser);
// Update user
router.put('/:id', adminUserController.updateUser);
// Delete user
router.delete('/:id', adminUserController.deleteUser);

export default router;
