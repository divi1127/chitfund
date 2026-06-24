import express from 'express';
import Notification from '../models/Notification.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { logAudit } from '../utils/audit.js';

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'user') {
      filter = {
        $or: [
          { recipientType: 'all' },
          { recipientType: 'user' },
          { recipientIds: req.user.userId }
        ]
      };
    } else if (req.user.role === 'sub_admin') {
      filter = {
        $or: [
          { recipientType: 'all' },
          { recipientType: 'sub_admin' },
          { recipientType: 'super_admin' },
          { recipientIds: req.user.userId }
        ]
      };
    }
    const notifications = await Notification.find(filter).sort({ createdAt: -1 }).limit(100);
    const unreadCount = notifications.filter(n => !n.readBy.includes(req.user.userId)).length;
    res.json({ notifications, unreadCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', authenticateToken, requireRole('super_admin', 'sub_admin'), async (req, res) => {
  try {
    const { title, message, type, recipientType, recipientIds, link } = req.body;
    if (!title || !message) {
      return res.status(400).json({ message: 'Title and message are required' });
    }
    const notification = new Notification({
      title, message, type: type || 'info',
      recipientType: recipientType || 'all',
      recipientIds: recipientIds || [],
      createdBy: req.user.userId,
      link
    });
    await notification.save();
    await logAudit({ userId: req.user.userId, userName: req.user.name, userRole: req.user.role, action: 'NOTIFICATION_SEND', resource: 'Notification', resourceId: notification._id, details: { title, recipientType }, ipAddress: req.ip });
    res.status(201).json(notification);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    if (!notification.readBy.includes(req.user.userId)) {
      notification.readBy.push(req.user.userId);
      await notification.save();
    }
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/read-all', authenticateToken, async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'user') {
      filter = {
        $or: [
          { recipientType: 'all' },
          { recipientType: 'user' },
          { recipientIds: req.user.userId }
        ]
      };
    } else {
      filter = {
        $or: [
          { recipientType: 'all' },
          { recipientType: req.user.role },
          { recipientIds: req.user.userId }
        ]
      };
    }
    await Notification.updateMany(filter, { $addToSet: { readBy: req.user.userId } });
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
