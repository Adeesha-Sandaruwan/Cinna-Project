import Announcement from '../models/Announcement.js';
import User from '../models/User.js';

// Create an announcement and push notifications to target users
export const createAnnouncement = async (req, res) => {
  try {
    const { message, target } = req.body;
    if (!message || !target) return res.status(400).json({ message: 'message and target are required' });

    const announcement = new Announcement({ message, target, createdBy: req.user.id });
    await announcement.save();

    // Decide recipients
    let recipientsQuery = {};
    if (target === 'admin') {
      recipientsQuery = { isAdmin: true };
    } else if (target === 'users') {
      recipientsQuery = { isAdmin: { $ne: true } };
    } else {
      recipientsQuery = {}; // all
    }

    const recipients = await User.find(recipientsQuery).select('_id');

    const notification = {
      message,
      announcement: announcement._id,
      read: false,
      createdAt: new Date()
    };

    // Push notification to each recipient
    const ops = recipients.map(r => ({ updateOne: { filter: { _id: r._id }, update: { $push: { notifications: notification } } } }));
    if (ops.length > 0) await User.bulkWrite(ops);

    res.status(201).json({ message: 'Announcement created and notifications sent', announcement });
  } catch (err) {
    console.error('Announcement create error', err);
    res.status(500).json({ message: err.message });
  }
};

// Get current user's notifications
export const getNotifications = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('notifications');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user.notifications.sort((a,b)=> new Date(b.createdAt)-new Date(a.createdAt)));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Mark a notification as read
export const markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    await User.updateOne({ _id: req.user.id, 'notifications._id': id }, { $set: { 'notifications.$.read': true } });
    res.json({ message: 'Marked as read' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
