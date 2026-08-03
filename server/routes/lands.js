import express from 'express';
import Land from '../models/Land.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// ── PUBLIC: anyone can fetch active listings (landing page) ──
router.get('/public', async (req, res) => {
  try {
    const lands = await Land.find({ status: 'active' }).sort({ createdAt: -1 });
    res.json(lands);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── PROTECTED: super_admin & admin see all ──
router.get('/', authenticate, authorize('super_admin', 'admin'), async (req, res) => {
  try {
    const lands = await Land.find().sort({ createdAt: -1 });
    res.json(lands);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── CREATE ──
router.post('/', authenticate, authorize('super_admin', 'admin'), async (req, res) => {
  try {
    const land = new Land(req.body);
    await land.save();
    res.status(201).json(land);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ── UPDATE ──
router.put('/:id', authenticate, authorize('super_admin', 'admin'), async (req, res) => {
  try {
    const land = await Land.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!land) return res.status(404).json({ message: 'Land listing not found' });
    res.json(land);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ── DELETE ──
router.delete('/:id', authenticate, authorize('super_admin', 'admin'), async (req, res) => {
  try {
    const land = await Land.findByIdAndDelete(req.params.id);
    if (!land) return res.status(404).json({ message: 'Land listing not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
