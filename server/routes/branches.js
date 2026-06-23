import express from 'express';
import Branch from '../models/Branch.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    console.log(`📋 Branches: Fetching all branches (requested by ${req.user.userId})`);
    const branches = await Branch.find();
    res.json(branches);
  } catch (error) {
    console.error('❌ Branches: Error fetching:', error.message);
    res.status(500).json({ message: 'Server error fetching branches' });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const branch = await Branch.findOne({ id: req.params.id });
    if (!branch) {
      console.error(`❌ Branches: Not found - ${req.params.id}`);
      return res.status(404).json({ message: 'Branch not found' });
    }
    res.json(branch);
  } catch (error) {
    console.error('❌ Branches: Error fetching:', error.message);
    res.status(500).json({ message: 'Server error fetching branch' });
  }
});

router.post('/', authenticate, authorize('super_admin'), async (req, res) => {
  try {
    const branch = new Branch(req.body);
    const saved = await branch.save();
    console.log(`✅ Branches: Created ${saved.name} (${saved.id})`);
    res.status(201).json(saved);
  } catch (error) {
    console.error('❌ Branches: Error creating:', error.message);
    res.status(400).json({ message: 'Error creating branch: ' + error.message });
  }
});

router.put('/:id', authenticate, authorize('super_admin'), async (req, res) => {
  try {
    const branch = await Branch.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    if (!branch) {
      console.error(`❌ Branches: Not found for update - ${req.params.id}`);
      return res.status(404).json({ message: 'Branch not found' });
    }
    console.log(`✅ Branches: Updated ${branch.name}`);
    res.json(branch);
  } catch (error) {
    console.error('❌ Branches: Error updating:', error.message);
    res.status(400).json({ message: 'Error updating branch: ' + error.message });
  }
});

router.delete('/:id', authenticate, authorize('super_admin'), async (req, res) => {
  try {
    const branch = await Branch.findOneAndDelete({ id: req.params.id });
    if (!branch) {
      console.error(`❌ Branches: Not found for delete - ${req.params.id}`);
      return res.status(404).json({ message: 'Branch not found' });
    }
    console.log(`✅ Branches: Deleted ${branch.name}`);
    res.json({ message: 'Branch deleted successfully' });
  } catch (error) {
    console.error('❌ Branches: Error deleting:', error.message);
    res.status(500).json({ message: 'Server error deleting branch' });
  }
});

export default router;
