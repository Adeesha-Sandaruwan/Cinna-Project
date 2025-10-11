import express from 'express';
import auth from '../middleware/auth.js';
import isAdmin from '../middleware/isAdmin.js';
import * as announcementController from '../controllers/announcementController.js';

const router = express.Router();

// Admin creates announcement
router.post('/', auth, isAdmin, announcementController.createAnnouncement);

// User gets their notifications
router.get('/notifications', auth, announcementController.getNotifications);

// Mark notification read
router.put('/notifications/:id/read', auth, announcementController.markNotificationRead);

export default router;
