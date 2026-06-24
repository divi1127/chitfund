import express from 'express';
import PlatformSettings from '../models/PlatformSettings.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { logAudit } from '../utils/audit.js';

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const settings = await PlatformSettings.find();
    const settingsMap = {};
    settings.forEach(s => { settingsMap[s.key] = s.value; });
    res.json(settingsMap);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:category', authenticateToken, async (req, res) => {
  try {
    const settings = await PlatformSettings.find({ category: req.params.category });
    const settingsMap = {};
    settings.forEach(s => { settingsMap[s.key] = s.value; });
    res.json(settingsMap);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/', authenticateToken, requireRole('super_admin'), async (req, res) => {
  try {
    const updates = req.body;
    const results = [];
    for (const [key, value] of Object.entries(updates)) {
      const result = await PlatformSettings.findOneAndUpdate(
        { key },
        { value, updatedBy: req.user.userId, updatedAt: new Date() },
        { upsert: true, new: true }
      );
      results.push(result);
    }
    await logAudit({ userId: req.user.userId, userName: req.user.name, userRole: req.user.role, action: 'SETTINGS_UPDATE', resource: 'PlatformSettings', details: { updatedKeys: Object.keys(updates) }, ipAddress: req.ip });
    res.json({ message: 'Settings updated successfully', settings: results });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/:key', authenticateToken, requireRole('super_admin'), async (req, res) => {
  try {
    const { value, description, category } = req.body;
    const setting = await PlatformSettings.findOneAndUpdate(
      { key: req.params.key },
      { value, description, category, updatedBy: req.user.userId, updatedAt: new Date() },
      { upsert: true, new: true }
    );
    await logAudit({ userId: req.user.userId, userName: req.user.name, userRole: req.user.role, action: 'SETTINGS_UPDATE', resource: 'PlatformSettings', resourceId: setting._id, details: { key: req.params.key }, ipAddress: req.ip });
    res.json(setting);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
