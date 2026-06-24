import express from 'express';
import AuditLog from '../models/AuditLog.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';

const router = express.Router();

router.get('/', authenticateToken, requireRole('super_admin'), async (req, res) => {
  try {
    const { page = 1, limit = 50, action, resource, userId, startDate, endDate } = req.query;
    const filter = {};
    if (action) filter.action = action;
    if (resource) filter.resource = resource;
    if (userId) filter.userId = userId;
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }

    const total = await AuditLog.countDocuments(filter);
    const logs = await AuditLog.find(filter)
      .sort({ timestamp: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    res.json({ logs, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/stats', authenticateToken, requireRole('super_admin'), async (req, res) => {
  try {
    const totalLogs = await AuditLog.countDocuments();
    const uniqueUsers = await AuditLog.distinct('userId');
    const actionCounts = await AuditLog.aggregate([
      { $group: { _id: '$action', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    const recentActivity = await AuditLog.find().sort({ timestamp: -1 }).limit(10);

    res.json({ totalLogs, uniqueUsers: uniqueUsers.length, topActions: actionCounts, recentActivity });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
