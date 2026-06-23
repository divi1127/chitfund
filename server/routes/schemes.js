import express from 'express';
import Scheme from '../models/Scheme.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    console.log(`📋 Schemes: Fetching all schemes (requested by ${req.user.userId})`);
    const schemes = await Scheme.find();
    res.json(schemes);
  } catch (error) {
    console.error('❌ Schemes: Error fetching:', error.message);
    res.status(500).json({ message: 'Server error fetching schemes' });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const scheme = await Scheme.findOne({ id: req.params.id });
    if (!scheme) {
      console.error(`❌ Schemes: Scheme not found - ${req.params.id}`);
      return res.status(404).json({ message: 'Scheme not found' });
    }
    res.json(scheme);
  } catch (error) {
    console.error('❌ Schemes: Error fetching scheme:', error.message);
    res.status(500).json({ message: 'Server error fetching scheme' });
  }
});

router.post('/', authenticate, authorize('super_admin'), async (req, res) => {
  try {
    const data = { ...req.body };
    if (!data.monthlyAmounts || data.monthlyAmounts.length === 0) {
      data.monthlyAmounts = Array.from({ length: data.duration || 1 }, (_, i) => ({
        month: i + 1,
        amount: data.monthlyInstallment || 0
      }));
    }
    const scheme = new Scheme(data);
    const savedScheme = await scheme.save();
    console.log(`✅ Schemes: Created scheme ${savedScheme.name} (${savedScheme.id})`);
    res.status(201).json(savedScheme);
  } catch (error) {
    console.error('❌ Schemes: Error creating:', error.message);
    res.status(400).json({ message: 'Error creating scheme: ' + error.message });
  }
});

router.put('/:id', authenticate, authorize('super_admin'), async (req, res) => {
  try {
    const existing = await Scheme.findOne({ id: req.params.id });
    if (!existing) {
      console.error(`❌ Schemes: Scheme not found for update - ${req.params.id}`);
      return res.status(404).json({ message: 'Scheme not found' });
    }

    const data = { ...req.body };
    if (data.duration && (!data.monthlyAmounts || data.monthlyAmounts.length === 0)) {
      data.monthlyAmounts = Array.from({ length: data.duration }, (_, i) => ({
        month: i + 1,
        amount: data.monthlyInstallment || 0
      }));
    }
    const scheme = await Scheme.findOneAndUpdate({ id: req.params.id }, data, { new: true });
    console.log(`✅ Schemes: Updated scheme ${scheme.name}`);
    res.json(scheme);
  } catch (error) {
    console.error('❌ Schemes: Error updating:', error.message);
    res.status(400).json({ message: 'Error updating scheme: ' + error.message });
  }
});

router.delete('/:id', authenticate, authorize('super_admin'), async (req, res) => {
  try {
    const scheme = await Scheme.findOneAndDelete({ id: req.params.id });
    if (!scheme) {
      console.error(`❌ Schemes: Scheme not found for delete - ${req.params.id}`);
      return res.status(404).json({ message: 'Scheme not found' });
    }
    console.log(`✅ Schemes: Deleted scheme ${scheme.name}`);
    res.json({ message: 'Scheme deleted successfully' });
  } catch (error) {
    console.error('❌ Schemes: Error deleting:', error.message);
    res.status(500).json({ message: 'Server error deleting scheme' });
  }
});

export default router;
