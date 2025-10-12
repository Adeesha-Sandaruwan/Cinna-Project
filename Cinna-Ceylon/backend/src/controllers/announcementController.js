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
      recipientsQuery = {
        $or: [
          { isAdmin: true },
          { role: 'finance_manager' }
        ]
      };
    } else if (target === 'users') {
      recipientsQuery = { 
        $and: [
          { isAdmin: { $ne: true } },
          { role: { $ne: 'finance_manager' } }
        ]
      };
    } else {
      recipientsQuery = {}; // all
    }

    console.log('Finding recipients with query:', recipientsQuery);
    const recipients = await User.find(recipientsQuery);
    console.log('Found recipients:', recipients.map(r => ({ id: r._id, role: r.role, isAdmin: r.isAdmin })));

    const notification = {
      message,
      announcement: announcement._id,
      read: false,
      createdAt: new Date()
    };

    // Push notification to each recipient
    const ops = recipients.map(r => ({ 
      updateOne: { 
        filter: { _id: r._id }, 
        update: { $push: { notifications: notification } } 
      } 
    }));
    
    console.log('Bulk write operations:', ops);
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
    console.log('Getting notifications for user:', req.user.id);
    const user = await User.findById(req.user.id)
      .select('notifications role isAdmin')
      .populate('notifications.announcement');
      
    if (!user) {
      console.log('User not found');
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('User role:', user.role, 'isAdmin:', user.isAdmin);
    console.log('Raw notifications:', user.notifications);

    const sortedNotifications = user.notifications
      .sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json(sortedNotifications);
  } catch (err) {
    console.error('Error getting notifications:', err);
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
